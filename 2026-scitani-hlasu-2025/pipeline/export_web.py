"""Export precinct dots (pixel coords inside the map box), the base map PNG and the fonts for the canvas renderer (all git-ignored)."""
import sys, json, shutil, numpy as np, pandas as pd
from config import TRAINS_REPO, CACHE, RENDERER
sys.path.insert(0, str(TRAINS_REPO))      # base map + palette come from the DataTimes 'trains' project
from common import basemap
from common.config import MILOS
from countries.czechia import CONFIG as cfg
import geopandas as gpd
BW, BH = 1080, 590                                   # map box in the 1080-wide layout
world = gpd.read_file(f'zip://{cfg.boundaries_zip}'); cz = world[world.ADM0_A3 == 'CZE'].to_crs(cfg.crs).geometry.union_all()
view = basemap.fit_view(cz.bounds, BW, BH, pad=0.02); view2 = basemap.fit_view(cz.bounds, BW * 2, BH * 2, pad=0.02)
base, _ = basemap.build_base(cfg.dem, cfg.landcover, cfg.boundaries_zip, cfg.iso_a3, view2, None, cfg.crs, theme='datatimes')
base.convert('RGB').save(RENDERER / 'base.png', optimize=True)
(RENDERER / 'fonts').mkdir(exist_ok=True)        # IBM Plex Sans/Serif + Roboto Condensed web fonts (git-ignored)
for f in (TRAINS_REPO / 'web/fonts').glob('*.woff2'):
    if f.name.startswith(('ibm-plex', 'roboto-condensed')): shutil.copy(f, RENDERER / 'fonts' / f.name)
d = pd.read_parquet(CACHE / 'merged.parquet')
px, py = view.to_px(d.x.values, d.y.values)
m = d.groupby('muni').voters.sum(); q20 = m.quantile(.2); small = set(m[m <= q20].index); big = {554782}     # 20 % smallest municipalities vs Prague
d['size'] = np.where(d.muni.isin(small), 0, np.where(d.muni.isin(big), 2, 1))       # 0 small village, 1 other, 2 big city
d['anog'] = np.where(d.ano_share <= d.ano_share.quantile(.1), 0, np.where(d.ano_share >= d.ano_share.quantile(.9), 2, 1))
print('small <=', q20, 'municipalities', len(small), 'precincts', d['size'].value_counts().to_dict())
json.dump(dict(x=np.round(px, 1).tolist(), y=np.round(py, 1).tolist(), t=np.round(d.ts.values, 2).tolist(), v=d.valid.tolist(), av=d.ano.tolist(), q20=float(q20),
               size=d['size'].tolist(), ano=d.anog.tolist(), cum=np.round(d.cum_valid.values, 5).tolist(),
               anoshare=np.round(d.ano_share.values, 3).tolist(), bw=BW, bh=BH), open(RENDERER / 'data.json', 'w'), separators=(',', ':'))
