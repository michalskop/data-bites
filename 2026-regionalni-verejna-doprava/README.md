# Czech regional public transport

Media is uploaded and verified on `media.datatimes.org`. This source uses immutable
CDN URLs recorded in root `media-assets.json`. Source commit preparation is local;
pushing and deployment are separate actions. Generated local media stays ignored.

Start the preview from the repository root:

```bash
python3 scripts/preview.py --port 8002
```

Open http://localhost:8002/2026-regionalni-verejna-doprava/.
The preview supports byte ranges for seeking and disables browser caching.

## Refresh completed exports

```bash
python3 scripts/import_regional_transport.py
```

Default source: `/home/michal/dev/ai/data-at/trains/out`.
The fixed cutoff is **2026-10-31 22:00 UTC**, selecting the new batch rather than
older exports. Optional `--source` and `--since` arguments override these defaults.
The script requires ffprobe and ffmpeg and shares small helpers with
`scripts/import_citybike_videos.py`.

Areas: ODIS/Moravian-Silesian Region, IDS JMK/South Moravian Region, Brno,
Plzeň Region, Plzeň city, Ústí Region, Ústí nad Labem city, and PID/Prague with
Central Bohemia. Only completed, readable MP4s are copied, with SHA-256 checks.
Incomplete or changing files are skipped. A region without a completed video
is shown as pending. Re-run the command as Prague's remaining exports finish;
new valid videos appear on reload without editing the page.

All video choices include the area, timetable date, time window, actual dimensions,
duration, file size, social/web format, and source attribution. Plain videos use a
recent matching renderer still where possible. Trail versions use a frame extracted
from the exact video so the thumbnail shows the correct variant. All generated local media stays Git-ignored; verified assets use CDN URLs. `formats.js` is generated atomically; the importer never uploads or deploys.

The data day is **27 October 2026**, distinct from the render/import date. Full-day
cuts cover 00:00–24:00; morning-peak cuts usually cover 07:00–09:00. Preserve the
qualification that vehicle positions and cumulative kilometres are estimated from
schedules, without delays. Most views route on OSM roads/rails; PID also uses GTFS
route geometry. Sources are CIS JŘ through JrUtil, KORDIS JMK, and ROPID/PID.
The legend follows each area's configured modes, including no tram in Ústí city
and metro in PID.

The page reuses `../2026-vlaky-v-cesku/style.css` with local overrides. A URL fragment
can select an area (`#brno`, `#pid`) or a specific video ID from `formats.js`.

## Media revisions

See the root README's gallery publication workflow. Importers preserve verified
CDN URLs for unchanged local assets. Upload new/changed content only when authorized,
using a new revision suffix, then run `python3 scripts/prepare_gallery_media.py --apply`
before committing source. The helper updates metadata, HTML fallback links, catalog
thumbnails and favicon references. Never commit generated media or ignored local paths.

The shared styles and download helper remain source files in this repository.
Keep source attribution, timetable-estimate explanations, and per-video metadata.
