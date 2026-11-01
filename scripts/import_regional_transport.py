#!/usr/bin/env python3
"""Refresh the local Czech regional transport gallery; skip active renders, never upload."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import shutil
import subprocess
import time

from gallery_media import manifest_records, published_url

from import_citybike_videos import checksum, clock, PROFILES

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "2026-regionalni-verejna-doprava"
REGIONS = [
    dict(id="odis", name="Moravskoslezský kraj", type="ODIS", source="CIS JŘ (Ministerstvo dopravy) přes JrUtil"),
    dict(id="jmk", name="Jihomoravský kraj", type="IDS JMK", source="KORDIS JMK (IDS JMK), vlaky CIS JŘ přes JrUtil"),
    dict(id="brno", name="Brno", type="Město", source="KORDIS JMK (IDS JMK), vlaky CIS JŘ přes JrUtil"),
    dict(id="plzen_kraj", name="Plzeňský kraj", type="Kraj", source="CIS JŘ (Ministerstvo dopravy) přes JrUtil"),
    dict(id="plzen", name="Plzeň", type="Město", source="CIS JŘ (Ministerstvo dopravy) přes JrUtil"),
    dict(id="usti_kraj", name="Ústecký kraj", type="Kraj", source="CIS JŘ (Ministerstvo dopravy) přes JrUtil"),
    dict(id="usti", name="Ústí nad Labem", type="Město", source="CIS JŘ (Ministerstvo dopravy) přes JrUtil"),
    dict(id="pid", name="Praha a Středočeský kraj", type="PID", source="ROPID, otevřená data PID (GTFS)"),
]
MODES = [
    dict(key="bus", name="Autobus", color="#4a51ab"),
    dict(key="trolleybus", name="Trolejbus", color="#0e839e"),
    dict(key="tram", name="Tramvaj", color="#de1743"),
    dict(key="train", name="Vlak", color="#f76800"),
]
PATTERN = re.compile(
    r"(?P<region>odis|jmk|brno|plzen_kraj|plzen|usti_kraj|usti|pid)"
    r"(?P<profile>_portrait|_square|_og|_homepage)?_web(?P<trail>_trail)?_trains"
    r"(?:_(?P<start>\d+(?:\.\d+)?)-(?P<end>\d+(?:\.\d+)?)h)?"
    r"(?:_\d+(?:\.\d+)?s)?_(?P<date>\d{8})\.mp4$"
)


def main(config=None):
    config = config or {}
    page = config.get("page", PAGE)
    registry = config.get("regions", REGIONS)
    pattern = config.get("pattern", PATTERN)
    parser = argparse.ArgumentParser(description=config.get("description", __doc__))
    parser.add_argument("--source", type=Path, default=Path("/home/michal/dev/ai/data-at/trains/out"))
    parser.add_argument("--since", default=config.get("since", "2026-10-31T22:00:00+00:00"))
    args = parser.parse_args()
    since = datetime.fromisoformat(args.since.replace("Z", "+00:00"))
    if since.tzinfo is None:
        parser.error("--since must include a UTC offset")
    if not args.source.is_dir():
        parser.error(f"Source directory does not exist: {args.source}")
    destination = page / "media"
    destination.mkdir(parents=True, exist_ok=True)
    formats = []
    uploaded = manifest_records()
    by_id = {region["id"]: region for region in registry}
    for source in sorted(args.source.glob("*.mp4")):
        match = pattern.fullmatch(source.name)
        before = source.stat()
        if not match or before.st_mtime < since.timestamp():
            continue
        if time.time() - before.st_mtime < 5:
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
        region = by_id[match["region"]]
        profile = (match["profile"] or "_story")[1:]
        start, end = float(match["start"] or 0), float(match["end"] or 24)
        if not 0 <= start < end <= 24:
            raise ValueError(f"Invalid time window: {source.name}")
        trail = bool(match["trail"])
        duration = float(probe["format"]["duration"])
        day = datetime.strptime(match["date"], "%Y%m%d").date()
        display_date = f"{day.day}. {day.month}. {day.year}"
        target = destination / source.name
        if not target.exists() or checksum(target) != checksum(source):
            temporary = target.with_suffix(".mp4.part")
            shutil.copy2(source, temporary)
            if checksum(temporary) != checksum(source) or source.stat().st_mtime_ns != before.st_mtime_ns:
                temporary.unlink()
                print(f"Skipping video modified during copy: {source.name}")
                continue
            temporary.replace(target)
        preferred_hour = config.get("poster_hour", 8)
        hour = preferred_hour if start <= preferred_hour < end else (start + end) / 2
        prefix = region["id"] + ("_" + profile if profile != "story" else "") + "_web"
        stills = []
        for candidate in args.source.glob(prefix + "_*.png"):
            try:
                frame_hour = float(candidate.stem.removeprefix(prefix + "_"))
            except ValueError:
                continue
            if start <= frame_hour < end and candidate.stat().st_mtime >= since.timestamp() - 86400:
                stills.append((abs(frame_hour - hour), candidate, frame_hour))
        if stills and not trail:
            _, still, hour = min(stills, key=lambda item: item[0])
            poster = destination / still.name
            shutil.copy2(still, poster)
        else:
            poster = target.with_suffix(".png")
            if not poster.exists() or poster.stat().st_mtime < target.stat().st_mtime:
                temporary_poster = poster.with_name(poster.stem + ".part.png")
                offset = (hour - start) / (end - start) * duration
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(offset), "-i", str(target), "-frames:v", "1", "-update", "1", str(temporary_poster)], check=True, timeout=60)
                temporary_poster.replace(poster)
        _, _, ratio, platforms = PROFILES[profile]
        name = "Celý den" if (start, end) == (0, 24) else "Ranní špička" if (start, end) == (7, 9) else "Časový výřez"
        if trail:
            name += " · se stopou"
        if profile != "story":
            name += " · " + PROFILES[profile][0]
        description = f"{region['name']} dne {display_date}, {clock(start)}–{clock(end)}. "
        description += "Každá tečka představuje jedno vozidlo podle jízdního řádu. "
        if trail:
            description += "Krátká stopa za vozidlem zvýrazňuje směr jeho odhadovaného pohybu. "
        description += "Polohy i ujeté kilometry jsou dopočtené, bez zohlednění zpoždění."
        formats.append(dict(
            id=source.stem.replace("_", "-"), region=region["id"], regionName=region["name"], profile=profile,
            name=name, title=name, category=region["name"], ratio=ratio, platforms=platforms, description=description,
            width=stream["width"], height=stream["height"], duration=duration, bytes=target.stat().st_size,
            video=published_url(target, uploaded) or "media/" + target.name, poster=published_url(poster, uploaded) or "media/" + poster.name, date=day.isoformat(), displayDate=display_date,
            startHour=start, endHour=end, period=f"{clock(start)}–{clock(end)}",
            variantLabel=f"{display_date} · {clock(start)}–{clock(end)}",
            posterNote=f"Náhled: {display_date} v {clock(hour)}. Video zobrazuje {clock(start)}–{clock(end)}.",
            source=region["source"], trail=trail, audio=any(item["codec_type"] == "audio" for item in probe["streams"]),
            language=region.get("language", "Čeština · DataTimes.cz"), coverage=region.get("coverage", ""),
            sha256=checksum(target), renderedAt=datetime.fromtimestamp(before.st_mtime, timezone.utc).isoformat(),
        ))
        print(f"Ready: {source.name}")
    if not formats:
        raise SystemExit("No completed recent videos found; existing gallery left unchanged.")
    order = {region["id"]: index for index, region in enumerate(registry)}
    profile_order = {profile: index for index, profile in enumerate(PROFILES)}
    formats.sort(key=lambda item: (order[item["region"]], item["startHour"], item["trail"], profile_order[item["profile"]]))
    regions = []
    for region in registry:
        count = sum(item["region"] == region["id"] for item in formats)
        modes = [dict(mode) for mode in MODES if not (region["id"] == "usti" and mode["key"] == "tram")]
        if region["id"] == "pid":
            modes = [mode for mode in modes if mode["key"] != "trolleybus"] + [dict(key="metro", name="Metro", color="#0e839e")]
        regions.append(dict(region, videoCount=count, status="ready" if count else "pending", modes=region.get("modes", modes)))
    default = next((item for item in formats if item["region"] == config.get("default_region", "brno") and not item["trail"] and (not config.get("default_profile") or item["profile"] == config["default_profile"])), formats[0])
    data = dict(title=config.get("title", "Regionální veřejná doprava v Česku"), defaultFormat=default["id"], since=args.since, regions=regions, formats=formats)
    temporary_config = page / "formats.js.part"
    refresh = config.get("refresh", "scripts/import_regional_transport.py")
    variable = config.get("variable", "REGIONAL_GALLERY")
    temporary_config.write_text(f"// Generated gallery; refresh with {refresh}. Verified CDN URLs are preserved.\nwindow.{variable} = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n")
    temporary_config.replace(page / "formats.js")
    print(f"Local gallery refreshed: {len(formats)} videos in {sum(r['status'] == 'ready' for r in regions)} areas.")


if __name__ == "__main__":
    main()
