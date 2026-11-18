"""Export the precinct dots (pixel coordinates inside the map box) to renderer/data.json. Needs only the committed data and cache/merged.parquet."""
import json, numpy as np, pandas as pd
from config import CACHE, DATA, RENDERER
view = json.load(open(DATA / 'map_view.json'))        # projection of the base map (written by build_basemap.py)
d = pd.read_parquet(CACHE / 'merged.parquet')
px, py = (d.x.values - view['xmin']) * view['scale'], (view['ymax'] - d.y.values) * view['scale']
m = d.groupby('muni').voters.sum(); q20 = m.quantile(.2); small = set(m[m <= q20].index); big = {554782}     # 20 % smallest municipalities vs Prague
d['size'] = np.where(d.muni.isin(small), 0, np.where(d.muni.isin(big), 2, 1))       # 0 small village, 1 other, 2 big city
d['anog'] = np.where(d.ano_share <= d.ano_share.quantile(.1), 0, np.where(d.ano_share >= d.ano_share.quantile(.9), 2, 1))
print('small <=', q20, 'municipalities', len(small), 'precincts', d['size'].value_counts().to_dict())
json.dump(dict(x=np.round(px, 1).tolist(), y=np.round(py, 1).tolist(), t=np.round(d.ts.values, 2).tolist(), v=d.valid.tolist(), av=d.ano.tolist(), q20=float(q20),
               size=d['size'].tolist(), ano=d.anog.tolist(), cum=np.round(d.cum_valid.values, 5).tolist(),
               anoshare=np.round(d.ano_share.values, 3).tolist(), bw=view['bw'], bh=view['bh']), open(RENDERER / 'data.json', 'w'), separators=(',', ':'))
print('wrote', RENDERER / 'data.json')
