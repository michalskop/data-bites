#!/usr/bin/env python3
"""Refresh the local Vienna bike gallery from completed renderer exports. Never uploads."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import time

from gallery_media import manifest_records, published_url

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "2026-citybike-viden"
PATTERN = re.compile(
    r"citybike(?P<peak>_max)?(?P<profile>_portrait|_square|_og|_homepage)?_web"
    r"(?P<trail>_trail)?_trains(?:_(?P<start>\d+(?:\.\d+)?)-(?P<end>\d+(?:\.\d+)?)h)?"
    r"(?:_\d+(?:\.\d+)?s)?_(?P<date>\d{8})\.mp4$"
)
PROFILES = {
    "story": ("Reels a Stories", "Na výšku", "9:16", "Instagram a Facebook · Reels / Stories · YouTube Shorts"),
    "portrait": ("Příspěvek 4:5", "Portrétní příspěvek", "4:5", "Instagram / Facebook · portrétní příspěvek"),
    "square": ("Čtverec", "Čtvercový příspěvek", "1:1", "Instagram / Facebook · čtvercový příspěvek"),
    "og": ("Sdílený odkaz", "Široký náhled odkazu", "1,91:1", "Web · sdílený odkaz / Open Graph"),
    "homepage": ("Web / homepage", "Náhled na web", "5:4", "Web · titulní stránka"),
}


def clock(hour):
    minutes = round(hour * 60)
    return f"{minutes // 60:02}:{minutes % 60:02}"


def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path("/home/michal/dev/ai/data-at/trains/out"))
    parser.add_argument("--since", default="2026-10-31T20:00:00+00:00", help="Inclusive UTC render cutoff; fixed so later refreshes retain earlier imports")
    args = parser.parse_args()
    since = datetime.fromisoformat(args.since.replace("Z", "+00:00"))
    if since.tzinfo is None:
        parser.error("--since must include a UTC offset")
    if not args.source.is_dir():
        parser.error(f"Source directory does not exist: {args.source}")
    destination = PAGE / "media"
    destination.mkdir(parents=True, exist_ok=True)
    formats = []
    uploaded = manifest_records()
    for source in sorted(args.source.glob("citybike*.mp4")):
        match = PATTERN.fullmatch(source.name)
        before = source.stat()
        if not match or before.st_mtime < since.timestamp():
            continue
        if time.time() - before.st_mtime < 3:
            print(f"Skipping active render: {source.name}")
            continue
        result = subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(source)], capture_output=True, text=True, timeout=30)
        if result.returncode:
            print(f"Skipping unfinished/unreadable video: {source.name}")
            continue
        after = source.stat()
        if (before.st_size, before.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
            print(f"Skipping changing video: {source.name}")
            continue
        probe = json.loads(result.stdout)
        stream = next(item for item in probe["streams"] if item["codec_type"] == "video")
        profile = (match["profile"] or "_story")[1:]
        peak, trail = bool(match["peak"]), bool(match["trail"])
        start, end = float(match["start"] or 0), float(match["end"] or 24)
        if not 0 <= start < end <= 24:
            raise ValueError(f"Invalid time window: {source.name}")
        day = datetime.strptime(match["date"], "%Y%m%d").date()
        display_date = f"{day.day}. {day.month}. {day.year}"
        duration = float(probe["format"]["duration"])
        target = destination / source.name
        if not target.exists() or checksum(target) != checksum(source):
            temporary = target.with_suffix(".mp4.part")
            shutil.copy2(source, temporary)
            if checksum(temporary) != checksum(source) or source.stat().st_mtime_ns != before.st_mtime_ns:
                temporary.unlink()
                print(f"Skipping video modified during copy: {source.name}")
                continue
            temporary.replace(target)
        hour = 15 if peak else 17.5
        if not start <= hour < end:
            hour = (start + end) / 2
        prefix = "citybike" + ("_max" if peak else "") + ("_" + profile if profile != "story" else "") + "_web"
        still = args.source / f"{prefix}_{hour:05.2f}.png"
        if still.is_file() and not trail:
            poster = destination / still.name
            shutil.copy2(still, poster)
            poster_kind = "renderer PNG"
        else:
            poster = target.with_suffix(".png")
            if not poster.exists() or poster.stat().st_mtime < target.stat().st_mtime:
                offset = (hour - start) / (end - start) * duration
                temporary_poster = poster.with_name(poster.stem + ".part.png")
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(offset), "-i", str(target), "-frames:v", "1", "-update", "1", str(temporary_poster)], check=True, timeout=60)
                temporary_poster.replace(poster)
            poster_kind = "frame from this video"
        name, title, ratio, platforms = PROFILES[profile]
        group = "editions" if peak or trail or (start, end) != (0, 24) else "formats"
        edition = "Rekordní den" if peak else "Večerní špička" if (start, end) != (0, 24) else "Celý den"
        if trail:
            edition += " · se stopou"
        if group == "editions":
            name = edition
            title = edition
        description = f"Citybike Wien dne {display_date}, {clock(start)}–{clock(end)}. "
        description += "Za koly zůstává krátká stopa, která zvýrazňuje směr odhadovaného pohybu. " if trail else "Každá tečka představuje jednu probíhající výpůjčku. "
        if peak:
            description += "Nejvytíženější den v použitém souboru historických výpůjček. "
        if profile == "og":
            description += "PNG je statický náhled sdíleného odkazu; MP4 je video pro vložení na web."
        elif profile == "homepage":
            description += "Širší rozvržení pro titulní stránku a vložení do článku."
        audio = any(item["codec_type"] == "audio" for item in probe["streams"])
        formats.append(dict(
            id=source.stem.removeprefix("citybike_").replace("_", "-"), group=group, profile=profile,
            name=name, title=title, category="Sociální sítě" if profile in ("story", "portrait", "square") else "Web a sdílení",
            ratio=ratio, platforms=platforms, description=description, width=stream["width"], height=stream["height"],
            duration=duration, bytes=target.stat().st_size, video=published_url(target, uploaded) or "media/" + target.name, poster=published_url(poster, uploaded) or "media/" + poster.name,
            date=day.isoformat(), displayDate=display_date, startHour=start, endHour=end,
            period=f"{clock(start)}–{clock(end)}", variantLabel=f"{display_date} · {clock(start)}–{clock(end)}",
            posterNote=f"Náhled: {display_date} v {clock(hour)}. Video zobrazuje {clock(start)}–{clock(end)}.",
            posterKind=poster_kind, audio=audio, sha256=checksum(target),
            renderedAt=datetime.fromtimestamp(before.st_mtime, timezone.utc).isoformat(),
        ))
        print(f"Ready: {source.name} ({stream['width']} × {stream['height']}, {duration:g} s)")
    if not formats:
        raise SystemExit("No completed recent videos found; existing gallery was left unchanged.")
    order = {key: index for index, key in enumerate(PROFILES)}
    formats.sort(key=lambda item: (item["group"] == "editions", item["date"] if item["group"] == "editions" else "", order[item["profile"]], item["startHour"], item["name"]))
    default = next((item for item in formats if item["group"] == "formats" and item["profile"] == "homepage"), formats[0])
    data = dict(title="Citybike ve Vídni", defaultFormat=default["id"], since=args.since, formats=formats)
    temporary_config = PAGE / "formats.js.part"
    temporary_config.write_text("// Generated gallery. Refresh with scripts/import_citybike_videos.py; unchanged assets retain their CDN URLs.\nwindow.BIKE_GALLERY = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
    temporary_config.replace(PAGE / "formats.js")
    print(f"Local gallery refreshed: {len(formats)} videos; no uploads or deployment.")


if __name__ == "__main__":
    main()
