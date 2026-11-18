"""Merge precinct counting times with locations, municipality size and ANO share -> cache/merged.parquet.

Positions come from data/precinct_positions_2025.csv (committed). Recompute them with `python3 build.py --positions`
(needs the RUIAN layer from fetch_ruian.py and the 2022 precinct polygons, see config.py)."""
import sys, json, numpy as np, pandas as pd
from pyproj import Transformer
from config import DATA, CACHE, GEO_2022, RUIAN_GEOJSON
POS = DATA / 'precinct_positions_2025.csv'
d = pd.read_csv(DATA / 'precincts_2025.csv')
d = d[d.obec != 999997].copy()                                   # abroad: no place on the map

if '--positions' in sys.argv or not POS.exists():
    from shapely.geometry import shape
    def load(path):
        out, par = {}, {}
        for f in json.load(open(path))['features']:
            p = {k.lower(): v for k, v in f['properties'].items()}; mo = int(p['momc'] or 0); ob = int(p['obec'])
            try: c = shape(f['geometry']).centroid
            except Exception: continue
            if not (11.8 < c.x < 19 and 48.5 < c.y < 51.1): continue      # broken polygon geometry
            out[(mo or ob, int(p['cislo']))] = (c.x, c.y); par[mo or ob] = ob
        return out, par
    new, par_n = load(RUIAN_GEOJSON)     # RUIAN (CUZK) voting districts, current state
    old, par_o = load(GEO_2022)          # RUIAN export from 2022
    parent = {**par_o, **par_n}
    mx = {}                              # municipality median position from both sources, to arbitrate conflicts
    for src in (new, old):
        for (o, _), (x, y) in src.items(): mx.setdefault(parent.get(o, o), []).append((x, y))
    mx = {k: np.median(np.array(v), axis=0) for k, v in mx.items()}
    xy, nsrc = {}, {'ruian': 0, '2022': 0, 'conflict->nearer': 0}
    for k in set(new) | set(old):
        a_, b_ = new.get(k), old.get(k)
        if a_ and b_ and np.hypot((a_[0] - b_[0]) * 71, (a_[1] - b_[1]) * 111) > 2:
            m = mx[parent.get(k[0], k[0])]; pick = min((a_, b_), key=lambda q: np.hypot((q[0] - m[0]) * 71, (q[1] - m[1]) * 111)); nsrc['conflict->nearer'] += 1
        else: pick = a_ or b_; nsrc['ruian' if a_ else '2022'] += 1
        xy[k] = pick
    print('position sources:', nsrc)
    pos = d[['obec', 'okrsek']].copy()
    pos['muni'] = pos.obec.map(parent).fillna(pos.obec).astype(int)        # city part (MOMC) -> the municipality itself
    pts = [xy.get((o, s)) for o, s in zip(pos.obec, pos.okrsek)]
    pos['lon'] = [p[0] if p else np.nan for p in pts]; pos['lat'] = [p[1] if p else np.nan for p in pts]
    bad = ~(pos.lon.between(11.8, 19) & pos.lat.between(48.5, 51.1)); pos.loc[bad, ['lon', 'lat']] = np.nan
    for c in ('lon', 'lat'): pos[c] = pos[c].fillna(pos.groupby('muni')[c].transform('mean'))   # fallback: municipality centre
    print('precincts without polygon (municipality centre used):', int(bad.sum()))
    pos.round({'lon': 6, 'lat': 6}).to_csv(POS, index=False)

pos = pd.read_csv(POS); d = d.merge(pos, on=['obec', 'okrsek'], how='left'); assert d.lon.notna().all()
tr = Transformer.from_crs(4326, 32633, always_xy=True); d['x'], d['y'] = tr.transform(d.lon.values, d.lat.values)
d['muni_voters'] = d.groupby('muni').voters.transform('sum')
d['ts'] = (pd.to_datetime(d.t) - pd.Timestamp('2025-10-04 14:00:00')).dt.total_seconds() / 60   # minutes after polls closed (14:00)
d['ano_share'] = d.ano / d.valid.clip(lower=1)
d = d.sort_values('ts', kind='stable').reset_index(drop=True)
d['cum_valid'] = d.valid.cumsum() / d.valid.sum()
d.to_parquet(CACHE / 'merged.parquet'); print(len(d), 'precincts ->', CACHE / 'merged.parquet')
