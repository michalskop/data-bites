# Gasse, nebo Straße?

Buildless street-name atlas imported from
`/home/michal/dev/ai/data-at/30days/09/dist` on 9 November 2026.
Open `/2026-gasse-strasse/` after starting `python3 scripts/preview.py --port 8002`
from the repository root. Czech is the default; English and German remain
selectable. `?lang=cs`, `?lang=en` and `?lang=de` override the saved language.

The original DataTimes.at branding, attribution, street plates, map controls,
5/10/20 km grids, ratio/share modes and PNG export are retained. The catalog
and navigation link connect the app to Data Bites. Language preferences use
a dedicated storage key to avoid affecting other analyses.

Processed JSON datasets stay in Git. Terrain and catalog preview use immutable
CDN media recorded in `../media-assets.json`. Identical IBM Plex fonts and the
DataTimes symbol reuse the verified CDN assets of `2026-krajina-v-nazvech`.
Font license texts are retained in `fonts/`. Terrain uses anonymous CORS so
canvas exports remain available; Latin and extended Latin font subsets cover
all three interface languages. Generated local media stays ignored.

`SOURCE.md` preserves the upstream methodology and rebuild commands; its paths
refer to the original project. Data covers Germany, Austria, Liechtenstein,
German-speaking Switzerland, South Tyrol and German-speaking Belgium. The
methodology in every language states that Baden-Württemberg, Bavaria and NRW
use February 2021 extracts, while the other extracts date from November 2026.

Refresh deliberately from upstream, preserving translations, catalog navigation,
favicon, CORS and verified CDN references. Upload changed media at new revision
keys and record successful verification in the manifest; never overwrite media.
