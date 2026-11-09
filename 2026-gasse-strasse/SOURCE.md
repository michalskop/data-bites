# Gasse or Straße?

Buildless Canvas hexagon map of street-name types across Germany, Austria, Liechtenstein,
German-speaking Switzerland, South Tyrol and German-speaking Belgium (EN/DE UI).
Hexagon **colour** = ratio of two street-name families (default Gasse vs Straße; any pair; log ratio or share;
grey = equal counts or overall average). **Opacity** = number of named streets. 5/10/20 km equal-area hexagons (EPSG:3035).
Base map: hillshade (reprojected from `../01/place-endings`), land outlines, city labels.

Serve: `python3 -m http.server 8909 --directory dist`

Rebuild (symlinks in `raw/` point to sibling 01's LAU, BFS language, countries and terrain data):
```
python3 scripts/fetch_roads.py    # ~2.7 GB roads layers from Geofabrik via byte ranges
python3 scripts/build_data.py     # ~2.5 min -> dist/data/hex-*.json, geo.json, meta.json
python3 scripts/build_basemap.py  # terrain.png, basemap.json
```
Method and caveats: "About the data" in the app. Note: BW, Bavaria and NRW extracts are from Feb 2021, the rest Nov 2026.

Plate names (curated, checked against OSM) and Vienna district numbers (Wien OGD STRASSENGRAPHOGD → raw/wien-streets.json): `python3 scripts/build_plates.py`.
