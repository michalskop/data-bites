#!/usr/bin/env python3
"""Upload immutable media to the shared DataTimes B2 bucket and verify the CDN."""

import argparse
import hashlib
import io
import json
import mimetypes
import os
from pathlib import Path, PurePosixPath
import sys
import time
from urllib.parse import quote

import requests

CDN = "https://media.datatimes.org"
CACHE_CONTROL = "public, max-age=31536000, immutable"


def config():
    values = {}
    for path in (Path.home() / ".datatimes-media.env", Path.cwd() / ".env"):
        if path.is_file():
            for line in path.read_text().splitlines():
                if "=" in line and not line.lstrip().startswith("#"):
                    key, value = line.split("=", 1)
                    values[key.strip()] = value.strip().strip("\"'")
    values.update(os.environ)
    key = values.get("B2_KEY_ID")
    secret = values.get("B2_APPLICATION_KEY") or values.get("B2_APP_KEY")
    if not key or not secret:
        raise ValueError("Set B2_KEY_ID and B2_APPLICATION_KEY in ~/.datatimes-media.env or .env")
    return key, secret, values.get("B2_BUCKET", "datatimes-media")


def prepare(path, target, mode):
    if "\\" in target or target.startswith("/") or any(
        part in ("", ".", "..") for part in target.split("/")
    ) or "?" in target or "#" in target:
        raise ValueError("Target must be a relative object key without empty segments, . or ..")
    key = PurePosixPath(target)
    if key.parts[0] != "databites-dtcz" or len(key.parts) < 3 or not key.suffix:
        raise ValueError("Use a full filename under databites-dtcz/<analysis-or-site>/")
    data = path.read_bytes()
    source_ext = path.suffix.lower()
    if mode == "og-image" or (mode in ("auto", "content") and source_ext in (".png", ".jpg", ".jpeg")):
        from PIL import Image, ImageOps

        with Image.open(io.BytesIO(data)) as image:
            image = ImageOps.exif_transpose(image)
            output = io.BytesIO()
            if mode == "og-image":
                image = ImageOps.fit(image.convert("RGBA"), (1200, 630))
                background = Image.new("RGB", image.size, "white")
                background.paste(image, mask=image.getchannel("A"))
                background.save(output, "JPEG", quality=90, optimize=True)
                key = key.with_suffix(".jpg")
            else:
                image.convert("RGBA" if "A" in image.getbands() or "transparency" in image.info else "RGB").save(
                    output, "WEBP", quality=85, method=6
                )
                key = key.with_suffix(".webp")
            data = output.getvalue()
    elif key.suffix.lower() != source_ext:
        raise ValueError("Preserved media must keep its original extension")
    content_type = mimetypes.guess_type(str(key))[0] or "application/octet-stream"
    return str(key), data, content_type


def upload(key, data, content_type):
    key_id, secret, bucket = config()
    with requests.Session() as session:
        response = session.get(
            "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
            auth=(key_id, secret), timeout=30,
        )
        response.raise_for_status()
        auth = response.json()
        allowed = auth.get("allowed", {})
        if allowed.get("bucketName") != bucket or not allowed.get("bucketId"):
            raise ValueError("Use an application key scoped to the configured media bucket")
        headers = {"Authorization": auth["authorizationToken"]}

        def api(method, payload):
            result = session.post(f"{auth['apiUrl']}/b2api/v2/{method}", headers=headers, json=payload, timeout=30)
            result.raise_for_status()
            return result.json()

        # Fail closed: an unavailable collision check must never permit an upload.
        existing = api("b2_list_file_names", {
            "bucketId": allowed["bucketId"], "startFileName": key,
            "prefix": key, "maxFileCount": 1,
        })
        if any(item["fileName"] == key for item in existing["files"]):
            raise ValueError(f"Collision refusal: {key} exists. Use a new version suffix.")
        destination = api("b2_get_upload_url", {"bucketId": allowed["bucketId"]})
        response = session.post(destination["uploadUrl"], headers={
            "Authorization": destination["authorizationToken"],
            "X-Bz-File-Name": quote(key, safe="/"),
            "Content-Type": content_type,
            "X-Bz-Content-Sha1": hashlib.sha1(data).hexdigest(),
            "X-Bz-Info-b2-cache-control": quote(CACHE_CONTROL, safe=""),
        }, data=data, timeout=120)
        response.raise_for_status()
    return verify(key, data, content_type)


def verify(key, data, content_type):
    url = f"{CDN}/{quote(key, safe='/')}"
    # Bounded retries allow a recent negative-cache entry to expire.
    for attempt in range(4):
        try:
            response = requests.head(url, headers={
                "Origin": "https://databites.datatimes.cz", "Accept-Encoding": "identity",
            }, timeout=15)
            response.raise_for_status()
            if response.status_code != 200:
                raise ValueError("CDN did not return HTTP 200")
            if int(response.headers.get("Content-Length", -1)) != len(data):
                raise ValueError("CDN Content-Length differs from uploaded media")
            if response.headers.get("Content-Type", "").split(";")[0] != content_type:
                raise ValueError("CDN Content-Type differs from uploaded media")
            if response.headers.get("Access-Control-Allow-Origin") not in ("*", "https://databites.datatimes.cz"):
                raise ValueError("CDN does not allow the site's origin")
            if response.headers.get("X-Bz-Content-Sha1") != hashlib.sha1(data).hexdigest():
                raise ValueError("CDN content hash differs from uploaded media")
            cache = response.headers.get("Cache-Control", "")
            if "max-age=31536000" not in cache or "immutable" not in cache or "public" not in cache:
                raise ValueError("CDN is missing immutable one-year public cache policy")
            break
        except (requests.RequestException, ValueError):
            if attempt == 3:
                raise ValueError(f"Uploaded, but CDN verification failed: {url}. Verify it before publishing; do not overwrite.") from None
            time.sleep(4)
    return {
        "status": "success", "url": url, "key": key,
        "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data),
        "content_type": content_type, "verified_at_edge": True,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--file", required=True, type=Path)
    parser.add_argument("--target", required=True, help="Full object key: databites-dtcz/<analysis>/chart-v1.webp")
    parser.add_argument("--format", choices=("auto", "content", "preserve", "og-image"), default="auto")
    parser.add_argument("--fail-if-exists", action="store_true", help="Always enabled; overwrites are refused")
    parser.add_argument("--verify-only", action="store_true", help="Verify a previous upload without writing to B2")
    args = parser.parse_args()
    try:
        key, data, content_type = prepare(args.file, args.target, args.format)
        result = verify(key, data, content_type) if args.verify_only else upload(key, data, content_type)
    except (OSError, ValueError, requests.RequestException) as error:
        # Never print a request object or auth response containing credentials.
        print(json.dumps({"status": "error", "message": str(error)}), file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
