# Jak říkáme ulici? (interactive street-name atlas, six regions)

Buildless Canvas hexagon atlas imported from `/home/michal/dev/ai/data-at/30days/09/dist`
(10 Nov 2026): German-speaking Europe, Spain + Andorra, UK + Ireland, Spanish-speaking Latin America,
Arabic world and US + Canada. Czech is the default interface; English and German remain selectable
(`?lang=cs|en|de`, region via `#spain`, `#us` …). Pair/share/dominant-word colour modes, 5–40 km hexagons,
street plates, "Save map" (map only), "Save map with frame" (3× resolution with title, legend, plates and
credits, rendered in the browser) and a link to the ready-made high-resolution PNG per region.

Preview: `python3 scripts/preview.py --port 8002` → http://localhost:8002/2026-jak-rikame-ulici/

## Data and media

Processed JSON per region (`data/<id>/`) stays in Git. Media is on `media.datatimes.org/databites-dtcz/2026-jak-rikame-ulici/`
(recorded in `../media-assets.json`): `terrain-<id>-v1.png` (hillshade, loaded with anonymous CORS so canvas export works),
`ulice-<id>-v1.png` (ready-made framed PNG), `ulice-<id>-v1.webp` and `thumb-<id>-v1.webp` (previews). Fonts and the
DataTimes symbol reuse the CDN assets of `2026-krajina-v-nazvech`. Changed media needs new `-v2` keys; never overwrite.

To refresh from the source project: copy `dist/{app.js,style.css,index.html,i18n.js,regions.js}` and `dist/data/*/*.json`,
then re-apply the bite-specific bits (Czech copy in `i18n.js`/`regions.js`, CDN terrain/logo/font URLs, `MEDIA`, the
`export-ready` link and `?lang` handling in `app.js`). Framed PNGs come from `scripts/export_frames.py` in the source project.
