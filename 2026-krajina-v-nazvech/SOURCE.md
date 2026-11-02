# Where names settle

An interactive, buildless Canvas atlas of place-name endings across Germany,
Austria, German-speaking Switzerland and Belgium, Liechtenstein, South Tyrol,
and optionally Luxembourg. All regions, including the eight added neighbouring countries, are enabled initially.

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
python3 scripts/fetch_neighbours.py
python3 scripts/build_neighbours.py
python3 scripts/build_terrain.py
python3 scripts/validate.py
python3 scripts/validate_neighbours.py
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
labels and PNG exports use DataTimes.at. All DataTimes links point to https://datatimes.cz while the visible branding remains DataTimes.at. `dist/data/palette.json` holds 33 distinct
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

`build_terrain.py` caches 504 Mapzen Terrarium elevation tiles at zoom 8 from the
AWS Terrain Tiles open dataset, then creates a 7168 × 4608 transparent hillshade.
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


## Neighbours: linked present and German names

Added country coverage: CZ, SK, PL, FR, HU, SI, HR and RO. Current data are from
GeoNames country downloads and their `alternatenames/XX.zip` files (CC BY 4.0).
Downloads, modification times and URLs are cached by `fetch_neighbours.py`.
`build_neighbours.py` writes one small JSON per country plus `neighbours.json`.

There are two name views, independent of the settlement/municipality selector:

* **Current local names:** the core data plus current names in added countries
  where a German-language form is attested, whether identical or different.
  GeoNames national-language preferred names take priority over international
  main names. Selected localized spelling patterns are grouped with their
  German-looking endings: e.g. `-stejn/-štejn/-štýn` with the new `-stein` family,
  `-berk/-perk` with `-berg`, `-burk/-bourg` with `-burg`, `-house` with `-hausen`,
  `-willer` with `-wil`, and `-vald/-wałd` with `-wald`. These are spelling matches,
  not individually proven etymologies.
* **German names:** the core retains its local names; added countries show a
  distinct German alternative for the same place. Each place counts once.
  Preferred German alternatives win, then non-historical alternatives, then
  marked historical alternatives; reviewed primary-source examples override
  that order. Other German forms remain in the paired metadata and search.

A German exonym alone does not prove historical German-speaking population or
past local official use. Both the visible map note and About explain that these
are **name attestations, not reconstructed settlement, population or border maps**.
Coverage is incomplete. Of 189,437 source settlements in the added countries,
4,702 have a German-name attestation, including 3,028 distinct German alternatives.
The rest are retained in the country source outputs for audit, but not plotted.

“Neighbours: documented historical names only” filters the added-country
German-name view to source-marked historical/datable names or reviewed primary
sources. Unverified alternatives are labelled explicitly in tooltips. The core
is unchanged by this filter. Changing names preserves country selections,
ending selection and zoom; search checks current, chosen German and other German
forms. Tooltips show both names and the evidence category. PNG titles and
filenames distinguish the name view and the historical-only subtitle.

Reviewed examples:

* **Rabštejn nad Střelou / Rabenstein an der Schnella:** State District Archive
  Plzeň-sever, *Archiv města Rabštejn nad Střelou*, 2019, printed p. 3:
  https://www.inventare.cz/pdf/soap-ps/soap-ps_ap0384_00134_am-rabstejn-nad-strelou.pdf
  explicitly describes the Czech form as an adaptation of Rabenstein.
* **Liberec / Reichenberg:** City of Liberec planning documentation:
  https://docs.liberec.cz/Odb_HA/1_UP/PROJEDNAVANE/Liberec/NOVY_UP-zmeny/Z1_D/Zmena-UP-Liberec-Z1_kraj-raz_final.pdf

Municipalities use GISCO LAU 2024 names and geometry. A German alternative is
attached only when the normalized current municipality name equals a GeoNames
settlement name and that point lies inside the municipality. No alternative is
guessed from proximity alone. GISCO's French population column is uniformly
zero, so legal French communes are retained and that population is treated as
missing, rather than declaring all France uninhabited. Only European geometries
inside -6…31° longitude and 41…56° latitude are included.

The core nine-field row schema remains unchanged. Added-country rows append a
10th field, a name-pair array documented by `neighbours.json.namePairSchema`:
German name, German family, matched German suffix, evidence category, GeoNames ID,
current name, other German forms, evidence URL, optional from/to dates. An empty
array means no German-language attestation was found. `same` means the German
form is identical to the current name; `alternative` carries no historical-use
claim; `historic` comes from GeoNames history/date fields; `reviewed` has a
separate primary source. No time period is invented where it is unknown.

Run `python3 scripts/validate_neighbours.py` for identity/schema/coverage checks
and `python3 scripts/check_neighbours_browser.py` for the two example pairs,
paired tooltips, evidence filtering, municipality links, language and mobile QA.
The existing browser suite covers the original interactions with all 15 regions.
