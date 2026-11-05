# The margin of the House · 2026

A reusable dataset of the **435 voting US House districts** and a standalone
HTML/SVG cartogram prototype. Polygon surface is proportional to the **absolute
number of Democratic minus Republican votes**, not the percentage margin.

## Current artifacts

- [`output/index.html`](output/index.html): open directly in a browser. The
  election data is embedded. Switch between reported votes and NYT estimates,
  compare cartogram and geographic views, inspect districts, and download CSV,
  JSON, boundaries, or SVG.
- [`data/processed/districts.csv`](data/processed/districts.csv) and
  [`districts.json`](data/processed/districts.json): one record per district.
- [`data/processed/candidates.csv`](data/processed/candidates.csv) and
  [`candidates.json`](data/processed/candidates.json): candidate-level source
  totals, estimates, parties, and winner calls.
- [`data/processed/manifest.json`](data/processed/manifest.json): snapshot time,
  SHA-256, provenance, method counts, and quality flags.
- [`docs/data-dictionary.md`](docs/data-dictionary.md): schema and interpretation.
- `data/raw/nyt/`: frozen, unmodified NYT snapshot for exact reproduction.
- [`data/processed/districts_2026.geojson`](data/processed/districts_2026.geojson):
  valid district polygons joined to the vote dataset, with repair provenance.
- [`output/cartogram_selected.svg`](output/cartogram_selected.svg) and
  [`output/cartogram_selected.png`](output/cartogram_selected.png): the estimated-margin map.
- [`output/geographic.svg`](output/geographic.svg): geographic reference map.
- [`output/social_animation_1200.mp4`](output/social_animation_1200.mp4): square,
  25-second looping comparison, with a longer pause on the 2026 cartogram.

The current HTML embeds all 435 district boundaries and works offline. The raw
Census download is preserved under `data/raw/boundaries/`. The prepared copy repairs
self-intersections introduced by source simplification and records every repair.
Synthetic test polygons are never included in the published artifacts.

## Reproduce and update

Python 3.10+ and Node.js 18+ are sufficient; no third-party packages are required
by vote preparation, the SVG renderer, or viewer. Boundary repair additionally uses
Shapely 2, installed with `python3 -m pip install -r requirements-geometry.txt`.

```bash
# Reproduce the current frozen vote dataset.
python3 src/prepare.py --source data/raw/nyt/20261104T221229Z.json.gz

# Or read the newest snapshot from the user's existing election project.
python3 src/prepare.py

# Download and cache simplified official boundaries (requires internet).
python3 src/boundaries.py

# Repair simplified geometry and join the current vote data (requires Shapely 2).
python3 src/prepare_geometry.py

# Extract state perimeter fragments once after changing district geometry.
python3 src/prepare_state_borders.py

# Export cartogram_selected.svg, cartogram_reported.svg, geographic.svg,
# reusable layout JSON, validation, and a compact browser layout cache.
node src/render.cjs

# Embed votes, fonts, shared legend, boundaries, and layout cache offline.
python3 src/build_viewer.py

# Check source fidelity, party arithmetic, joins, area accuracy, and overlaps.
python3 -m unittest discover -s tests -v
node tests/test_cartogram.cjs
node tests/test_transitions.cjs
node tests/test_viewer.cjs
```

`prepare.py --source PATH` accepts a snapshot file or directory;
`build_viewer.py --boundaries PATH` and `node src/render.cjs PATH` accept a local
boundary GeoJSON. Local boundaries must use the **2026 election plans**, WGS84
longitude/latitude, and Census `GEOID` properties. IDs alone cannot verify vintage.
Save browser-downloaded boundaries as
`data/raw/boundaries/districts_2026.geojson`, then run `prepare_geometry.py`.
Both rendering commands prefer the prepared copy when it exists. After updating
votes, rerun geometry preparation to refresh the vote attributes in the GeoJSON.

## Data choices

The frozen NYT update is **2026-11-04 22:12:10 UTC**. There are **412** districts
with complete NYT D/R candidate estimates and **23** reported-vote fallbacks.
All results are preliminary; none is certified in this snapshot.

Sum all `DEM` candidates for D and all `GOP` candidates for R. Independents are
kept separate, including Alaska's nonpartisan candidate. If any D/R candidate
lacks a NYT estimate, use reported totals for **both** parties in that district.
An absent party has zero votes. Same-party ballots represent the party total
against zero; they do not show the gap between the competing candidates.
Ranked-choice party totals are not final-round victory margins. Estimates can
lag reported votes; flags preserve this condition instead of silently adjusting
the source numbers.

Colors use the called winner when available and the selected D–R lead otherwise.
Uncalled districts have dashed outlines. Calls, leads, and certification remain
separate fields. National aggregates and non-voting delegates are excluded.

## Add 2024 presidential results

The presidential import uses [The Downballot's vote-count spreadsheet](https://docs.google.com/spreadsheets/d/1eZfaFI-c-PFOoKx1-zZA2MP0_dxRq_LVK0re3BOQqy0/edit?gid=1491069057),
which retabulates Harris and Trump votes onto the **2026 House district lines**.
It requires actual vote counts; the percentage-only historical comparisons in
the NYT feed cannot supply vote-margin polygon areas.

```bash
# Download the frozen CSV, import all 435 districts, and rebuild HTML/SVGs.
python3 src/president2024.py --download --build

# If the CSV has already been downloaded into data/raw/president2024/:
python3 src/president2024.py --build
```

This creates `data/processed/president_2024.csv`, `.json`, and
`president_2024_manifest.json`, adds `pres2024_*` fields to the existing district
tables and prepared GeoJSON, and enables **2024 President** in the viewer's
election selector. Static maps are `output/cartogram_president2024.svg` and
`output/geographic_president2024.svg`. All election modes use the same vote-to-area
scale and map frame so a given vote difference has the same displayed area.

Missouri must use its operative 2024/2026 map. The importer cross-checks its
district presidential margins against a saved operative-map reference from the
local pre-election workbook (the NYT feed lacks all eight Missouri baselines) and
rejects a stale sheet using the overturned map. If needed,
`--missouri-source PATH` accepts a vote-count CSV on the old Missouri lines.
The main CSV can also be supplied with `--source PATH`; raw files are retained
and hashed. Rebuilding the House dataset preserves an imported presidential join.

Blue means Harris and red means Trump in presidential mode. It does not inherit
2026 House winner calls. House-versus-president margin changes use two-party
percentage points and compare different offices and turnout; they are not a
repeat presidential election swing. The 2024 table excludes DC because this map
covers the 435 voting House seats, and follows the source's write-in conventions.

## Geometry and area

Boundaries come from [Census TIGERweb's 120th Congress layer](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer/0).
[Census's election-vintage notice](https://www.census.gov/programs-surveys/decennial-census/about/rdo/congressional-districts.html)
requires **Missouri's 119th Congress geometry** for the operative 2026 plan, so
the downloader explicitly substitutes the ACS 2024 layer for Missouri.

Census query simplification is 0.005 degrees. The renderer uses equal-area
projections for its geographic reference, then scales each simplified district
by `sqrt(k × abs(D − R) / polygon_area)`. The final cartogram has one common
vote-to-area scale, including Alaska and Hawaii. Zero margins vanish.
Bounding-box separation preserves shapes and prevents overlapping polygons;
district adjacency is not preserved. Insets and separation change positions.
This first version is a **noncontiguous, shape-preserving cartogram**, not a
continuous deformation of the US outline.

## Design and animated comparison

The viewer follows the publication's
`/home/michal/dev/mahdalova-skop/docs/design/DESIGN.md` and shared UI design guide:
newsprint page, Ink Wash chart surface, IBM Plex Sans headings, IBM Plex Serif
article text, Roboto Condensed chart typography, a DataTimes signature, centered
toggleable legend, styled pointer tooltips, and the two-line author/data footer.
The political series use Royal Blue for D and Crimson for R in every election.

`assets/design/` freezes the **actual shared ChartLegend** from the publication
repository, its compiled React runtime, local font subsets, and provenance.
The HTML and exported SVGs embed fonts and require no CDN. Normal builds need no
package installation. To refresh these design assets from the existing local
publication checkout and its React/TypeScript/webpack tools:

```bash
node src/build_design.cjs /home/michal/dev/mahdalova-skop
node src/render.cjs
python3 src/build_viewer.py
```

For PNG previews with the same chart fonts, run `python3 src/render_previews.py`
in an environment with CairoSVG and `fonttools[woff]` installed. This uses a
temporary Fontconfig setup and leaves system fonts unchanged.

The page starts with the geographic reference. View and election controls animate
district positions and **area**, keeping each district's SVG path unchanged.
Party changes shrink through zero, hold briefly, and regrow in the new color;
no color blend is used. A skipped-frame guard still paints zero on slow devices.
Rapid control changes continue from the currently displayed state. “Watch the
comparison” runs geography → House cartogram → presidential cartogram → geography.
The animation toggle respects `prefers-reduced-motion` and can be disabled.

Legend filtering never changes sizes, coordinates, or scale domains. Endpoints
have no overlapping polygons; polygons can cross while traveling between them.
SVG download is disabled during transitions and exports the completed selected
view. District panels compare both elections; the displayed between-office
margin change is not presented as a repeat presidential election swing.

The **State borders** toggle starts enabled. Dark state perimeter segments overlay
the lighter district edges. They follow their owning district's position and
scale, including zero-area transitions, so they form continuous outlines in the
geographic view and separate into fragments in the cartogram. SVG exports respect
the toggle. Borders are derived from the existing district polygons; no extra
download is needed. `data/processed/state_borders.json` stores the relative SVG
paths and a projection fingerprint. Rerun `prepare_state_borders.py` after changing
district geometry; vote updates alone do not invalidate the border geometry.

`test_transitions.cjs` checks all 435 real district endpoints, party flips,
interruption, missed frames, and reduced-motion behavior. `test_viewer.cjs` runs
the actual UI code with a DOM harness and virtual clock; it does not test browser
layout or painting. `output/render_cache.json` is used only when its hash matches
the vote data, boundary file, and cartogram source; stale caches are ignored.

## Square social-media comparison

Below the interactive map, a static **2 × 2** composition shows 2024 President
above 2026 House, with geographic maps on the left and vote-margin cartograms
on the right. It uses a single legend and signature, larger type, state borders,
and one shared frame and cartogram area scale. The 2026 preliminary status and
snapshot time remain visible.
The right-side area key shows a square equal to a **100,000-vote margin**, sized
from that shared area scale and the actual SVG viewport scaling.
The full DataTimes.cz logotype embeds the publication's original PNG symbol
unchanged, with outlined IBM Plex Sans Bold lettering. Its top aligns with the headline and its
right edge with the map grid's 48-pixel outer margin.

`output/social_comparison_1200.png` is exactly **1200 × 1200 pixels**;
`output/social_comparison_1200.svg` is the matching vector master with embedded
fonts. Both have download buttons under the image and work from the standalone
HTML. To regenerate after changing data:

```bash
node src/render.cjs
python3 src/render_previews.py
python3 src/build_viewer.py
```

The PNG carries a source-SVG digest. The HTML only embeds a PNG matching the
current SVG, and hides the comparison if the layout cache is stale. Publication
exports always include the four fixed views, independently of interactive filters.

## Square social-media animation

`output/social_animation_1200.mp4` is a **1200 × 1200**, **30 fps**, **25-second**
H.264 video. It loops through 2024 presidential geography → 2024 vote-margin
cartogram → 2026 House vote-margin cartogram → 2026 geography → 2024 geography.
The 2026 cartogram holds for **six seconds**; the opening and closing rendered
frames are identical. Party changes shrink through zero before growing in the
new color. Both cartograms use the same area-per-vote scale and frame.
Stage titles, subtitles, and context notes crossfade over 0.7 seconds at each
chapter boundary; the headline, logo, and legend stay steady.
A large warm-gray year sits at the right of the stage heading. It stays steady
when changing map type and crossfades at the midpoint of each election change.

The renderer follows the native frames → FFmpeg workflow from the neighboring
`trains` project and uses the interactive map's actual JavaScript transition
math. It needs Node, FFmpeg/ffprobe, and Python packages `cairocffi`, `CairoSVG`,
`numpy`, and `fonttools[woff]` (`python3 -m pip install -r requirements-video.txt`).
System Cairo and Fontconfig must also be available. Render with the same Python environment used for
the PNG previews:

```bash
python3 src/render_animation.py
python3 src/build_viewer.py
node tests/test_animation.cjs
```

For a quick visual check, use `--size 600 --fps 15 --preview-only --out /tmp/house-video`.
The default render also produces a poster PNG, four `animation_keyframes/` PNGs,
and a JSON manifest containing the timeline, data fingerprint, and encoded video
properties. The HTML shows a player and download link when the video matches
the current dataset. Keep the MP4 and poster beside `index.html` when sharing
the page; the video is a separate file. Playback starts only on user interaction.

## Layout

`src/` contains preparation, boundary acquisition, rendering, and the viewer
template; `tests/` contains Python and Node checks; `data/raw/` holds provenance
inputs; `data/processed/` holds reusable tables; `output/` holds generated visuals.
Leave `AGENTS.md` and the upstream election project unchanged.
