# Counting of the 2025 Chamber election (videos and pipeline)

Three one-minute 16:9 videos (1920×1080, 30 fps, H.264, no audio) showing how the 14,710 domestic precincts were counted on election night,
4 October 2025. One dot per precinct. Media is served from the DataTimes CDN (`media-assets.json` in the repository root); this folder holds the
gallery page, the datasets and **the scripts that generate the videos**. Czech site copy, English technical notes.

| Video | `render_video.py` mode | What it shows |
| --- | --- | --- |
| Jak rychle se sčítalo | `speed` | dot colour = time the precinct was counted (clock hours from 14:00), curves of counted precincts |
| Malé obce vs. Praha | `size` | 20 % smallest municipalities (up to 153 voters) vs Prague, share of precincts already counted |
| Okrsky s ANO | `ano` | 10 % of precincts with the highest vs lowest final ANO share |

All three also show the clock, the share of votes counted and a chart of ANO support over time (result of the precincts counted so far, and a
moving window of the most recently counted ones, at least 10 minutes and about 8,000 votes).

## Data (`data/`, committed)
- `precincts_2025.csv`: one row per precinct: municipality code, precinct number, time the precinct was processed (`t`, local time), voters, valid votes, ANO votes.
  Parsed from the ČSÚ real-time `vysledky_okrsky` batch XMLs recorded on election night (`pipeline/parse.py`).
- `precinct_positions_2025.csv`: longitude/latitude of each precinct centroid and its municipality (`pipeline/build.py --positions`).
- `counting_batches_2025.csv`: cumulative counting per published batch (74 batches, about 5 min apart): counted precincts, valid votes, percentage of each major party,
  in the layout of the prediction-history sheet (`pipeline/batches_csv.py`).

Positions come from the RÚIAN voting-district layer of ČÚZK (current state, fetched with `pipeline/fetch_ruian.py`) with the 2022 export as fallback.
A 2025-dated RÚIAN snapshot is not available for download, so a precinct changed after the election could be placed slightly off. Precincts abroad are not mapped.

## Quick start (nothing else needed)
Requirements: Python 3.10+, `ffmpeg` on the PATH and a browser for Playwright.
```bash
cd 2026-scitani-hlasu-2025/pipeline
python3 -m pip install -r requirements.txt
python3 -m playwright install chromium        # skip if Chrome/Chromium is installed (or set CHROMIUM=/path/to/chrome)
python3 make.py setup                          # downloads the base map + fonts (checksummed bundle from the DataTimes CDN)
python3 make.py build                          # data/*.csv -> renderer/data.json
python3 make.py still speed 50                 # a still -> out/speed_50pct_landscape.png   (modes: speed | size | ano; % of votes counted)
python3 make.py video speed                    # a ~60 s video -> out/speed_video.mp4        (also size, ano; about 5 min, 1800 frames)
python3 make.py all                            # everything used on the web page
```
`make.py` only wraps the scripts in `pipeline/`, which can also be run directly. The renderer page (`renderer/`) takes `?mode=speed|size|ano&pct=5` or `&t=<minutes after 14:00>`.
`render_video.py` sets the pace with the time-warp knots at the top of the file (slower early, faster late, 6 s hold at the end); all layout is in `renderer/app.js`.

The base map and the web fonts (IBM Plex, Roboto Condensed, SIL OFL) are media, so they are not in Git: `setup` fetches them from the CDN into `renderer/` (git-ignored) and verifies a SHA-256.
Nothing from the DataTimes `trains` project is needed any more.

## Rebuilding inputs (optional, maintainers)
Everything above runs from the committed CSVs. To regenerate them (`python3 -m pip install -r requirements-rebuild.txt`; paths and overrides in `pipeline/config.py`):
- `parse.py` → `data/precincts_2025.csv` from the raw ČSÚ batch XMLs recorded on election night (`BATCH_XML_DIR`; about 500 MB, not in Git).
- `fetch_ruian.py` then `build.py --positions` → `data/precinct_positions_2025.csv` (RÚIAN layer from ČÚZK, 2022 export in `GEO_2022` as fallback).
- `batches_csv.py` → `data/counting_batches_2025.csv`.
- `build_basemap.py` → base map, fonts, `data/map_view.json` and `out/renderer-assets.zip` (needs the `trains` project, `TRAINS_REPO`). Upload the zip as a new `renderer-assets-vN.zip`
  revision (see below) and update `ASSETS_URL` and `ASSETS_SHA256` in `config.py`.

## Publishing new renders
Do not commit videos or images. Upload with `scripts/upload_media.py` to `databites-dtcz/2026-scitani-hlasu-2025/<name>-vN.<ext>` (never overwrite: use a new
`-vN` revision), append the result to `media-assets.json`, and update the URLs in `videos.js`, as described in the root README.
