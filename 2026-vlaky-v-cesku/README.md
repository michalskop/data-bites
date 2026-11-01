# Czechia train videos

Media is uploaded and verified on `media.datatimes.org`. This source uses immutable
CDN URLs recorded in root `media-assets.json`. Source commit preparation is local;
pushing and deployment are separate actions. Generated local media stays ignored.

## Source selection

Source directory: `/home/michal/dev/ai/data-at/trains/out`.
The five `czechia_iso*_web_trains_20261006.mp4` files were the Czechia videos
modified within the hour before 2026-10-31 19:35 UTC (20:35 Europe/Vienna).
They were rendered at 20:23–20:31 local time. Older Czechia exports and other
countries were excluded.

Each video has a matching `*_14.20.png` still. In the renderer's decimal-hour
notation, `14.20` means **14:12**, not 14:20. The data day is **6 October 2026**;
the render date is separate. All five videos are 57 seconds, H.264 MP4, 30 fps,
without audio. Dimensions and sizes in `formats.js` were measured with ffprobe.

| Renderer profile | Dimensions | Ratio | Intended use |
| --- | --- | --- | --- |
| story | 1080 × 1920 | 9:16 | Reels, Stories, YouTube Shorts |
| portrait | 1080 × 1350 | 4:5 | Portrait feed post |
| square | 1080 × 1080 | 1:1 | Square feed post |
| og | 1200 × 630 | 40:21 (about 1.91:1) | Website video; PNG for Open Graph link preview |
| homepage | 1500 × 1200 | 5:4 | Website/homepage |

These labels describe the renderer's intended compositions. The `og` MP4 is
not automatically a playable social link preview: the PNG is the link image.
The source's `common/formats.py` defines the profiles using the DataTimes article
image specifications. YouTube also documents [vertical and square Shorts](https://support.google.com/youtube/answer/15424877).

## Local preview

From the repository root:

```bash
python3 scripts/preview.py --port 8002
```

Open http://localhost:8002/2026-vlaky-v-cesku/ or the catalog at
http://localhost:8002/. This server supports HTTP byte ranges for seeking.
A URL fragment such as `#story` selects a format.

`media/` contains local copies of five MP4s and five unchanged PNG stills
(about 101 MB total (97 MiB)). It is explicitly Git-ignored, and the existing hook still
blocks media if someone force-stages it. Published page links use the verified CDN copies.
The media has been uploaded and verified; source publication is a separate step.

## Media revisions

See the root README's gallery publication workflow. Importers preserve verified
CDN URLs for unchanged local assets. Upload new/changed content only when authorized,
using a new revision suffix, then run `python3 scripts/prepare_gallery_media.py --apply`
before committing source. The helper updates metadata, HTML fallback links, catalog
thumbnails and favicon references. Never commit generated media or ignored local paths.

The shared styles and download helper remain source files in this repository.
Keep source attribution, timetable-estimate explanations, and per-video metadata.
