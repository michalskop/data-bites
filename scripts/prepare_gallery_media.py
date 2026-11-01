#!/usr/bin/env python3
"""Inventory, upload and link the reviewed galleries. Never commits, pushes or deploys."""

import argparse
import json
from pathlib import Path
import re
import time
from urllib.parse import urlparse

import requests

from gallery_media import manifest_records, published_url
import upload_media

ROOT = Path(__file__).resolve().parents[1]
PAGES = ("2026-vlaky-v-cesku", "2026-citybike-viden", "2026-regionalni-verejna-doprava", "2026-doprava-v-evrope")
ICONS = {
    "assets/site-local/favicon-bites-v2.svg": "databites-dtcz/site/favicon-bites-2026-11-v1.svg",
    "favicon.ico": "databites-dtcz/site/favicon-bites-2026-11-v1.ico",
    "assets/site-local/apple-touch-icon-bites-v2.png": "databites-dtcz/site/apple-touch-icon-bites-2026-11-v1.png",
}


def read_gallery(page):
    text = (ROOT / page / "formats.js").read_text()
    _, assignment = text.split("window.", 1)
    variable, raw = assignment.split(" = ", 1)
    return variable, json.loads(raw.strip().removesuffix(";"))


def local_source(page, value, records):
    if value.startswith("https://"):
        for record in reversed(records):
            if record["url"] == value:
                return Path(record["original_source"])
        raise ValueError(f"CDN URL has no manifest record: {value}")
    path = Path(page) / value
    if path.resolve().is_relative_to((ROOT / page / "media").resolve()):
        return path
    raise ValueError(f"Unexpected gallery media path: {path}")


def inventory(records, revision=1):
    assets = {}
    for source, target in ICONS.items():
        existing = published_url(ROOT / source, records)
        assets[source] = urlparse(existing).path.lstrip("/") if existing else target.replace("-v1.", f"-v{revision}.")
    for page in PAGES:
        _, data = read_gallery(page)
        for item in data["formats"]:
            for field in ("video", "poster"):
                source = local_source(page, item[field], records)
                existing = published_url(ROOT / source, records)
                key = urlparse(existing).path.lstrip("/") if existing else f"databites-dtcz/{page}/{source.stem}-v{revision}{source.suffix}"
                assets[source.as_posix()] = key
    return assets


def save_records(records):
    temporary = ROOT / "media-assets.json.part"
    temporary.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    temporary.replace(ROOT / "media-assets.json")


def check_range(url, data):
    response = requests.get(url, headers={"Range": "bytes=0-1023", "Origin": "https://databites.datatimes.cz", "Accept-Encoding": "identity"}, timeout=30)
    response.raise_for_status()
    if response.status_code != 206 or response.content != data[:1024]:
        raise ValueError(f"CDN byte-range verification failed: {url}")
    if response.headers.get("Content-Range") != f"bytes 0-1023/{len(data)}":
        raise ValueError(f"Incorrect Content-Range: {url}")


def upload_or_resume(key, data, mime):
    for attempt in range(5):
        try:
            return upload_media.upload(key, data, mime)
        except ValueError as error:
            if not str(error).startswith(("Collision refusal:", "Uploaded, but CDN verification failed:")):
                raise
            return upload_media.verify(key, data, mime)
        except requests.RequestException as error:
            status = error.response.status_code if error.response is not None else None
            if status is not None and status not in (408, 429, 500, 502, 503, 504):
                raise
            if attempt == 4:
                raise
            print(f"Retrying temporary upload failure ({status or 'network'}): {key}", flush=True)
            time.sleep(2 ** (attempt + 1))


def apply_links(records, assets):
    urls = {}
    for source in assets:
        url = published_url(ROOT / source, records)
        if not url:
            raise ValueError(f"Upload and verification required before linking: {source}")
        urls[source] = url
    for page in PAGES:
        variable, data = read_gallery(page)
        for item in data["formats"]:
            for field in ("video", "poster"):
                source = local_source(page, item[field], records).as_posix()
                item[field] = urls[source]
        (ROOT / page / "formats.js").write_text(
            "// Generated gallery metadata; media URLs are verified immutable CDN assets.\n"
            f"window.{variable} = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
        )
    html_pages = [ROOT / "index.html", ROOT / "2021-cssd-krupka-matous/index.html", ROOT / "2026-volebni-anomalie/index.html"]
    html_pages += [ROOT / page / "index.html" for page in PAGES]
    for path in html_pages:
        text = path.read_text()
        for source, url in sorted(urls.items(), key=lambda item: -len(item[0])):
            if path.parent == ROOT:
                candidates = ("./" + source, source)
            elif source in ICONS:
                candidates = ("../" + source,)
            elif source.startswith(path.parent.name + "/"):
                candidates = (source.removeprefix(path.parent.name + "/"),)
            else:
                candidates = ()
            candidates += tuple(record["url"] for record in records if record.get("original_source") == source)
            for candidate in candidates:
                text = text.replace('"' + candidate + '"', '"' + url + '"')
                text = re.sub('"' + re.escape(candidate) + r'\?v=\d+"', '"' + url + '"', text)
        path.write_text(text)
    print("Updated gallery metadata, HTML fallbacks, catalog thumbnails and favicon links.", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upload", action="store_true", help="Upload missing immutable objects and verify the CDN")
    parser.add_argument("--apply", action="store_true", help="Replace links only when every asset is verified")
    parser.add_argument("--revision", type=int, default=1, help="Version suffix for newly uploaded content; increment for changed assets")
    args = parser.parse_args()
    if args.revision < 1:
        parser.error("--revision must be positive")
    records = manifest_records()
    assets = inventory(records, args.revision)
    total_bytes = sum((ROOT / source).stat().st_size for source in assets)
    print(f"Selected {len(assets)} assets, {total_bytes / 1e9:.3f} GB", flush=True)
    if args.upload:
        for index, (source, target) in enumerate(assets.items(), 1):
            key, data, mime = upload_media.prepare(ROOT / source, target, "preserve")
            existing = published_url(ROOT / source, records)
            if existing:
                result = upload_media.verify(key, data, mime)
            else:
                result = upload_or_resume(key, data, mime)
            if mime == "video/mp4":
                check_range(result["url"], data)
                result["range_verified"] = True
            result["original_source"] = source
            if not any(record["url"] == result["url"] for record in records):
                records.append(result)
                save_records(records)
            print(f"[{index}/{len(assets)}] Verified {key}", flush=True)
    if args.apply:
        apply_links(records, assets)
    if not args.upload and not args.apply:
        for source, key in assets.items():
            print(f"{source} -> {key}")
        print("Dry run only. Use --upload, then --apply after all assets pass verification.")


if __name__ == "__main__":
    main()
