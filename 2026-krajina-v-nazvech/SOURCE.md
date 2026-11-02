# Where names settle

An interactive, buildless Canvas atlas of place-name endings across Germany,
Austria, German-speaking Switzerland and Belgium, Liechtenstein, South Tyrol,
and optionally Luxembourg. All seven regions are enabled initially.

Click an ending to select it alone. Ctrl-click (Cmd-click on Mac) adds or removes
endings for comparison. Show all clears the selection.

The site lives in `dist/`. It needs no API keys, map tiles, external fonts, or
live data services. Serve with `python3 -m http.server 8841 --directory dist`.

## Rebuild data

Python dependencies: requests, geopandas, shapely (2+), numpy, scipy, Pillow; system: pdftotext. Browser checks additionally use Playwright and Chromium.

```
python3 scripts/fetch_inputs.py
python3 scripts/fetch_osm.py
python3 scripts/build_data.py
python3 scripts/build_terrain.py
python3 scripts/validate.py
node --check dist/app.js
```

Downloads are cached under ignored `raw/`. `fetch_osm.py` retrieves only the
places shapefile members using validated HTTP byte ranges, avoiding multi-GB
downloads. Raw input is intentionally separate from the deployed static files.
Remove cached region ZIP and adjacent JSON to request a new OSM snapshot.
The complete source URL and HTTP modification date for each extract are retained
in `dist/data/meta.json` and shown under “About the data”.

## Sources and interpretation

* Settlements: © OpenStreetMap contributors, ODbL, via Geofabrik free shapefiles.
  Cities, towns, villages and hamlets; optional isolated dwellings. Excludes urban
  neighbourhoods and uninhabited named localities. One record per OSM ID, globally
  deduplicated across extracts. Nearby, different OSM IDs are not automatically
  merged: they can represent genuinely different places with the same name.
* The first download returned January 2021 snapshots for Baden-Württemberg,
  Bavaria and North Rhine-Westphalia; the others are Oct/Nov 2026. This mixed
  vintage is explicitly visible in the UI. Names are relatively stable but
  coverage and classifications can differ. These are exploratory dataset counts.
* Municipalities: Eurostat GISCO LAU 2024 (© EuroGeographics for administrative
  boundaries), downloaded from the GISCO distribution service. Uninhabited LAUs
  with zero or missing population are excluded from the point layer. Populated
  LAUs are administrative units and can include special administrative areas;
  this is not a hand-audited legal register. Dots are interior representative
  points, not necessarily settlement centres. Region outlines retain the complete
  LAU geometry, except Swiss lakes/non-municipal shared areas.
* Swiss scope: BFS “Die Sprachgebiete der Schweiz”, 27 December 2022; municipality
  ID join to LAU 2024. Four 2023 mergers inherit the unanimous language of their
  predecessors: Andelfingen (30/21/32), Neckertal (3372/3375/3378), Herznach-Ueken
  (4166/4179), Damphreux-Lugnez (6787/6793). Last is French and excluded. Merger
  sources: Kanton Zürich “Gemeindefusion Andelfingen” (2023), BFS mutation 3969,
  and Kanton St. Gallen / Neckertal merger 2023. No current populated Swiss LAU
  remains unclassified after these joins. Settlements are clipped to selected
  municipality polygons; this uses statistical language regions, not the
  presence of German alternative names.
* Belgian scope: the nine German-speaking municipalities, selected by LAU IDs.
  French GISCO forms are replaced by their German official names.
* South Tyrol: Italian municipality codes starting 021, the whole autonomous
  province, including Italian- and Ladin-speaking settlements. Municipality names
  use the German part of GISCO's bilingual name; OSM names retain local spelling.
* Context outlines: Natural Earth / datasets/geo-countries, public domain.

Matching is case-insensitive, longest suffix first, one family per dot. It
removes geographic qualifiers (e.g. “am Albis”, “an der Brenz”) and parenthetical
qualifications, and checks bilingual/compound names in parts. This is a map of
literal spelling patterns, not individually verified etymologies. Family rules
and colours are defined near the top of `scripts/build_data.py`.

`dist/data/*.json` contains compact arrays; the field order is documented in
`meta.json`. Both processed datasets are distributed as ODbL for OSM settlements
and under the respective official-source terms for municipalities; retain the
source attribution when reusing or exporting. Fonts are copied from the user's
existing trains map (IBM Plex Sans and IBM Plex Serif, SIL Open Font License).


## DataTimes.at design and language

The design follows `/home/michal/dev/mahdalova-skop/docs/design/DESIGN.md`:
newsprint `#fdfbf7`, Ink Wash `#f8f6f0`, crimson `#de1743`, ink `#101432`,
IBM Plex Sans headings and IBM Plex Serif body text. The circular signature is
adapted directly from the shared `ChartSignature.tsx`; signatures, author links,
labels and PNG exports use DataTimes.at. All DataTimes links point to https://datatimes.cz while the visible branding remains DataTimes.at. `dist/data/palette.json` holds 32 distinct
categorical colours from the documented brand scales and is read by the builder.
Canvas colours are read from the CSS design tokens.

The English/German/Czech switch translates static and dynamic UI copy, map labels,
family meanings, tooltips, methodological notes and exports. Place spellings stay
as supplied by their sources. Selection and map view survive language changes.
The choice is stored locally; `?lang=en`, `?lang=de` and `?lang=cs` provide explicit links.
English static copy lives in the HTML and dynamic strings / German and Czech translations
in `dist/i18n.js`. Missing translations are checked in the browser test.

The stream family includes `-bach`, `-bek`, `-beck`, `-beke`: southern / High German
and northern / Low German spelling forms. Individual apparent matches can have
different origins; this remains a spelling-pattern atlas.

## Terrain

`build_terrain.py` caches 304 Mapzen Terrarium elevation tiles at zoom 8 from the
AWS Terrain Tiles open dataset, then creates a 4864 × 4096 transparent hillshade.
The mosaic stays in Web Mercator, with bounds in `dist/data/terrain.json`.
The canvas applies the same projection/zoom/pan transform to raster and points.
Multidirectional lighting and 1.9× visual vertical exaggeration reveal the relief;
the shading does not encode land cover. The resolution suits the regional view;
close zooms soften it. Terrain is on by default with a visible switch, load/error
status, and inclusion in PNG export. The site needs no live tile service.

Terrain attribution: Mapzen Terrain Tiles / AWS Open Data; Europe terrain data
produced using Copernicus data and information funded by the European Union –
EU-DEM layers; Austria terrain data © offene Daten Österreichs – Digitales
Geländemodell (DGM) Österreich; SRTM data courtesy of NASA/USGS. Full source links
are in all language versions of the notes and in `terrain.json`.

Serve the site and run `python3 scripts/check_browser.py` to check relief on/off,
translations and state preservation, northern stream suffixes, multi-selection,
counts, tooltips, exports and responsive layouts.


## Ending labels

The “Ending labels” / “Endungen beschriften” switch adds one compact label per
selected family (all matching families when no ending filter is active). Anchors
are the mean of the matching place coordinates in projected Web Mercator space,
with each place counted once. They follow the current dataset, search and region
filters; zoom/pan change only their screen positions. Labels are moved apart by
a deterministic collision-avoidance placement, with leader lines to the actual
centres. Off-screen centres are not labelled. Labels are included in PNG exports.
