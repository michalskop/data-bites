# Transport across Europe

Media is uploaded and verified on `media.datatimes.org`. This source uses immutable
CDN URLs recorded in root `media-assets.json`. Source commit preparation is local;
pushing and deployment are separate actions. Generated local media stays ignored.

Open http://localhost:8002/2026-doprava-v-evrope/ after starting:

```bash
python3 scripts/preview.py --port 8002
```

## Refresh completed exports

```bash
python3 scripts/import_country_transport.py
```

The source is `/home/michal/dev/ai/data-at/trains/out`. The fixed cutoff is
**2026-11-01 18:00 UTC**. Older country exports, the earlier `czechia_iso` batch,
bike rides and Czech regional outputs are excluded. Optional `--source` and
`--since` arguments override the defaults. Unfinished or changing MP4s are skipped.

The importer reuses the regional import engine with a separate country registry,
filename pattern, cutoff, output directory and configuration variable. It copies
completed MP4s with SHA-256 verification, measures metadata with ffprobe, and uses
recent renderer PNGs or extracts an exact-video still with ffmpeg. Refreshing this
page does not rewrite the Czech regional gallery. It never uploads or deploys.

## Scope and dates

- **Česko, Rakousko, Slovensko:** railway timetable day 6 October 2026.
- **Polsko, Itálie:** railway timetable day 27 October 2026.
- **Norsko:** multimodal public transport from Entur, 27 October 2026, including
  buses, trains, trams, metro and ferries.
- **Vídeň:** a separately labelled Austrian city detail, 6 October 2026, including
  Wiener Linien, Wiener Lokalbahnen and ÖBB. It is not counted as a seventh country.

Austria covers ÖBB, excluding WESTbahn and other private operators. Italy covers
Trenitalia, Italo and Trenord, excluding other regional operators. Poland uses
aggregated GTFS from mkuran.pl. Preserve the per-video coverage qualifications;
these are schedule-derived positions and kilometres, not live observations.

The original artwork remains in Czech, German, Slovak, Polish, Italian or Norwegian
as appropriate. The gallery interface is Czech and displays the selected video's
language, source, service date and time window. Non-story formats carry explicit
profile labels. Norway's full webpage legend includes ferry and metro even when
some compact original graphics omit those legend labels for space.

The page shares styles with the train and regional galleries. Its own configuration
and JavaScript use `window.COUNTRY_GALLERY`. URL fragments select a location
(`#austria`, `#norway`, `#vienna`) or a specific video ID.

## Media revisions

See the root README's gallery publication workflow. Importers preserve verified
CDN URLs for unchanged local assets. Upload new/changed content only when authorized,
using a new revision suffix, then run `python3 scripts/prepare_gallery_media.py --apply`
before committing source. The helper updates metadata, HTML fallback links, catalog
thumbnails and favicon references. Never commit generated media or ignored local paths.

The shared styles and download helper remain source files in this repository.
Keep source attribution, timetable-estimate explanations, and per-video metadata.
