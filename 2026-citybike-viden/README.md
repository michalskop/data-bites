# Vienna Citybike videos

Media is uploaded and verified on `media.datatimes.org`. This source uses immutable
CDN URLs recorded in root `media-assets.json`. Source commit preparation is local;
pushing and deployment are separate actions. Generated local media stays ignored.

Preview: http://localhost:8002/2026-citybike-viden/ (catalog: http://localhost:8002/).
From the repository root, start the preview with:

```bash
python3 scripts/preview.py --port 8002
```

This local server supports HTTP byte ranges for video seeking. It can preview the
train gallery too. The basic `python3 -m http.server` serves files but does not
provide the same seeking behavior.

## Add more completed videos

```bash
python3 scripts/import_citybike_videos.py
```

The importer scans `/home/michal/dev/ai/data-at/trains/out/citybike*.mp4`, selecting
files rendered since **2026-10-31 20:00 UTC**. The cutoff is fixed so later refreshes
retain the earlier imports. Optional `--source <directory>` and `--since <ISO time
with UTC offset>` arguments override those defaults.

It measures video metadata with ffprobe, skips unfinished/recently changing files,
copies completed videos locally with SHA-256 verification, and rewrites `formats.js`.
The page reads that file to render all choices and counts automatically. Re-run the
command after more renders finish, then reload the page. It never uploads, commits,
deploys or edits files in the source directory. ffmpeg and ffprobe must be installed.

For ordinary videos, it uses a matching renderer PNG when available. For trail
versions or missing PNGs, it extracts a still from that exact video, preserving
the correct day, layout and trail effect. The still's clock time is recorded per
video. Renderer names use decimal hours: `17.50` means **17:30**.

The video filenames contain `trains` because they come from the shared transport
renderer; these particular files show bicycle rentals. Original video files and
German DataTimes.at artwork are preserved.

## Content and variants

- 12 September 2018: full day, full day with trails, 16:00–19:00 with trails, and
  available social/web formats.
- 5 July 2016: the busiest day in the source trip log, with plain and trail versions
  and any completed alternate formats.
- Profiles: 9:16 for vertical video; 4:5 portrait; 1:1 square; 1200×630 for a wide
  composition and PNG link preview; 1500×1200 for the website.

Dates, time windows, actual resolution, duration, file size and poster information
are displayed per selection. Switching between crops of the same day/window keeps
playback time. Switching to another day/window starts its timeline at zero.
The page reuses the train gallery's CSS, with small local layout overrides.

The source configuration is in `trains/countries/citybike.py` and
`citybike_max.py`. Pick-up/return times come from the historical Citybike Wien
trip log (2015–2021); routes are estimated on the OSM cycling network and historical
station positions are estimates. Same-station returns remain at that station;
unlocated stations are excluded. Customer trips are filtered to 1 minute–4 hours.
Keep these qualifications in published copy.

## Media revisions

See the root README's gallery publication workflow. Importers preserve verified
CDN URLs for unchanged local assets. Upload new/changed content only when authorized,
using a new revision suffix, then run `python3 scripts/prepare_gallery_media.py --apply`
before committing source. The helper updates metadata, HTML fallback links, catalog
thumbnails and favicon references. Never commit generated media or ignored local paths.

The shared styles and download helper remain source files in this repository.
Keep source attribution, timetable-estimate explanations, and per-video metadata.
