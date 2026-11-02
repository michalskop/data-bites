# Krajina v názvech

Interactive atlas copied from `/home/michal/dev/ai/data-at/30days/01/place-endings/dist`
on 2 November 2026 for publication in Data Bites. The catalog opens in Czech;
English and German remain selectable. The original DataTimes.at chart branding,
source attribution, language switch, filters, relief and PNG export are retained.

Serve from the repository root with `python3 scripts/preview.py --port 8002` and
open `/2026-krajina-v-nazvech/`. No build, API key or live map tiles are needed.
Processed JSON datasets stay in Git; terrain, signature and SIL OFL fonts use
verified immutable CDN URLs recorded in `../media-assets.json`. Local media copies
are ignored. Both terrain and signature load with anonymous CORS so PNG export
remains available. Font license texts are in `fonts/`.

`SOURCE.md` preserves the upstream methodology, source licenses and original
rebuild instructions (paths there refer to the upstream project, not this copy).
OSM settlements have mixed 2021 and 2026 snapshots; the UI explicitly records
this limitation. The map shows spelling patterns, not verified etymologies.

Refresh from the upstream project deliberately; preserve the Czech default,
CDN references, CORS image loading, favicon and catalog navigation when copying
updated code. Publish changed media under new revision keys, never overwrite.
