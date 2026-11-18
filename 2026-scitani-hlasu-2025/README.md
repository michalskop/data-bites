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

## Reproduce
```bash
cd 2026-scitani-hlasu-2025/pipeline
python3 -m pip install -r requirements.txt            # pandas, pyarrow, numpy, pyproj, shapely, geopandas, rasterio, scipy, Pillow, playwright
python3 build.py                                       # data/*.csv -> cache/merged.parquet
python3 export_web.py                                  # base map, fonts and dot positions -> renderer/ (git-ignored)
python3 shoot.py size 5                                # still at 5 % of votes counted -> out/size_5pct_landscape.png
python3 render_video.py speed 60                       # out/speed_video.mp4 (also: size, ano); ~5 min, 1800 frames
```
`shoot.py` accepts `size|ano|speed` and a percentage of counted votes; the renderer page also takes `?t=<minutes after 14:00>`.
`render_video.py` needs `ffmpeg`; the pace is set by the time-warp knots at the top of the file (slower early, faster late, 6 s hold at the end).

External inputs (see `pipeline/config.py`, all overridable with environment variables):
- `TRAINS_REPO` (default `~/dev/ai/data-at/trains`): DataTimes base-map code, the DEM caches it references (`/home/michal/dev/ms/milos`) and the web fonts.
  `base.png`, `data.json` and the fonts are generated into `pipeline/renderer/` and are git-ignored, because media and fonts must not be committed.
- `CHROMIUM` (default `/snap/bin/chromium`): Playwright is driven with this browser.
- Only to regenerate the CSVs: `BATCH_XML_DIR` (raw batch XMLs; not in Git, about 500 MB), `RUIAN_GEOJSON` and `GEO_2022` for positions.

## Publishing new renders
Do not commit videos or images. Upload with `scripts/upload_media.py` to `databites-dtcz/2026-scitani-hlasu-2025/<name>-vN.<ext>` (never overwrite: use a new
`-vN` revision), append the result to `media-assets.json`, and update the URLs in `videos.js`, as described in the root README.
