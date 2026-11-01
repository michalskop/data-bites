"""Resolve unchanged local gallery assets to their verified immutable CDN URLs."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def manifest_records():
    path = ROOT / "media-assets.json"
    return json.loads(path.read_text()) if path.is_file() else []


def published_url(path, records=None, sha256=None):
    path = Path(path).resolve()
    source = path.relative_to(ROOT).as_posix()
    if records is None:
        records = manifest_records()
    matches = [item for item in records if item.get("original_source") == source and item.get("verified_at_edge")]
    if not matches:
        return None
    if sha256 is None:
        with path.open("rb") as stream:
            sha256 = hashlib.file_digest(stream, "sha256").hexdigest()
    for item in reversed(matches):
        if item["sha256"] == sha256 and item["bytes"] == path.stat().st_size:
            return item["url"]
    return None
