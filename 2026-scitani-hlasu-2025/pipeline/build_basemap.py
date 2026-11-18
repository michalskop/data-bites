"""MAINTAINERS ONLY. Builds the base map PNG, copies the web fonts and writes data/map_view.json, then packs them into out/renderer-assets.zip.

Needs the DataTimes 'trains' project (TRAINS_REPO, with its DEM caches) and geopandas/rasterio/scipy (requirements-rebuild.txt).
Everyone else downloads the finished bundle with `python3 make.py setup`; upload a new bundle revision to the CDN as described in ../README.md."""
import sys, json, shutil, zipfile
from config import TRAINS_REPO, DATA, OUT, RENDERER
sys.path.insert(0, str(TRAINS_REPO))
from common import basemap
from countries.czechia import CONFIG as cfg
import geopandas as gpd
BW, BH = 1080, 590                                   # map box of the 1920x1080 layout
world = gpd.read_file(f'zip://{cfg.boundaries_zip}'); cz = world[world.ADM0_A3 == 'CZE'].to_crs(cfg.crs).geometry.union_all()
view = basemap.fit_view(cz.bounds, BW, BH, pad=0.02); view2 = basemap.fit_view(cz.bounds, BW * 2, BH * 2, pad=0.02)      # view2: the same extent at 2x resolution
base, _ = basemap.build_base(cfg.dem, cfg.landcover, cfg.boundaries_zip, cfg.iso_a3, view2, None, cfg.crs, theme='datatimes')
base.convert('RGB').save(RENDERER / 'base.png', optimize=True)
json.dump(dict(crs=cfg.crs, xmin=view.xmin, ymax=view.ymax, scale=view.scale, bw=BW, bh=BH), open(DATA / 'map_view.json', 'w'), indent=1)
(RENDERER / 'fonts').mkdir(exist_ok=True)            # IBM Plex Sans/Serif + Roboto Condensed (SIL OFL), latin + latin-ext, 400/600/700
for f in (TRAINS_REPO / 'web/fonts').glob('*.woff2'):
    if f.name.startswith(('ibm-plex', 'roboto-condensed')): shutil.copy(f, RENDERER / 'fonts' / f.name)
with zipfile.ZipFile(OUT / 'renderer-assets.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(RENDERER / 'base.png', 'base.png')
    for f in sorted((RENDERER / 'fonts').glob('*.woff2')): z.write(f, f'fonts/{f.name}')
    z.writestr('README.txt', 'Base map (DataTimes palette, hillshade from DEM) and web fonts (IBM Plex Sans, IBM Plex Serif, Roboto Condensed; SIL Open Font License 1.1) '
                             'for the 2026-scitani-hlasu-2025 renderer. Extract into pipeline/renderer/.\n')
print('wrote', OUT / 'renderer-assets.zip', (OUT / 'renderer-assets.zip').stat().st_size, 'bytes')
