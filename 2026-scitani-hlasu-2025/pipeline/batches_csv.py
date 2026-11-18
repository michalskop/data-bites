"""Cumulative counting of the 2025 Chamber election per published batch (from the archived real-time XMLs), in the format of the prediction-history sheet,
plus a join of the sheet's snapshots to the batches by exact party-percentage match."""
import glob, sys, numpy as np, pandas as pd
import xml.etree.ElementTree as ET
from config import BATCH_XML_DIR, DATA
SRC = str(BATCH_XML_DIR) + '/'; NS = '{http://www.volby.cz/ps/}'
PARTIES = {'Piráti': 16, 'SPOLU': 11, 'STAN': 23, 'Motoristé': 20, 'ANO': 22, 'SPD': 6, 'Stačilo!': 25, 'Přísaha': 8}     # ballot numbers (verified against final shares)
state, rows, first_t = {}, [], {}                                     # state: precinct -> (valid, {party: votes}); later records (corrections) replace earlier ones
for f in sorted(glob.glob(SRC + 'vysledky_okrsky_*.xml')):
    r = ET.parse(f).getroot(); dv = r.find(NS + 'DAVKA')
    if dv is None or int(dv.get('PORADI_DAVKY')) == 0: continue          # batch 0 = empty initial file
    for o in r.iter(NS + 'OKRSEK'):
        votes = {int(h.get('KSTRANA')): int(h.get('HLASY')) for h in o.iter(NS + 'HLASY_OKRSEK')}
        first_t.setdefault((o.get('CIS_OBEC'), o.get('CIS_OKRSEK')), o.get('DATUM_CAS_ZPRAC'))
        state[(o.get('CIS_OBEC'), o.get('CIS_OKRSEK'))] = (int(o.find(NS + 'UCAST_OKRSEK').get('PLATNE_HLASY')), votes)
    valid = sum(v for v, _ in state.values()); pv = {k: sum(vs.get(k, 0) for _, vs in state.values()) for k in range(1, 40)}
    rows.append(dict(batch=int(dv.get('PORADI_DAVKY')), batch_time=r.get('DATUM_CAS_GENEROVANI'), new_ids=int(dv.get('OKRSKY_DAVKA')), counted_ids=int(dv.get('OKRSKY_ZPRAC')),
                     total_ids=int(dv.get('OKRSKY_CELKEM')), valid_votes=valid, **{f'v_{k}': v for k, v in pv.items()}))
b = pd.DataFrame(rows); final = b.valid_votes.iloc[-1]
b['counted_ids_pct'] = (b.counted_ids / b.total_ids * 100).round(1); b['counted_votes_pct'] = (b.valid_votes / final * 100).round(1)
for n, k in PARTIES.items(): b[n] = (b[f'v_{k}'] / b.valid_votes * 100).round(2)
b['Ostatní'] = (100 - b[list(PARTIES)].sum(axis=1)).round(2)
for n, k in PARTIES.items(): b[n + '_votes'] = b[f'v_{k}']
b['timestamp'] = b.batch_time
cols = ['timestamp', 'counted_ids_pct', 'counted_votes_pct', 'valid_votes', *PARTIES, 'Ostatní', 'batch', 'counted_ids', 'total_ids', 'new_ids', *[n + '_votes' for n in PARTIES]]
b[cols].to_csv(DATA / 'counting_batches_2025.csv', index=False); print(len(b), 'batches; final valid votes', final, '(incl. abroad)')


if len(sys.argv) < 2: sys.exit()      # optional: python3 batches_csv.py <prediction-history.csv> also writes the joined table
# ---- join with the prediction-history sheet --------------------------------------------------------------------------------------------------
# The sheet's party_percentages are the PREDICTION; counted_ids_pct / counted_votes_pct are its progress. Its progress feed updates on its own irregular clock, so it
# cannot be matched to 5-minute batches exactly (best fixed-delay fit: 44 % of rows). Instead each sheet row is placed on our per-precinct timeline:
# the number of precincts it showed (counted_ids_pct x total) -> the state of the count at that moment.
pr = pd.DataFrame([dict(t=pd.Timestamp(first_t[k]), valid=v, **{n: vs.get(c, 0) for n, c in PARTIES.items()}) for k, (v, vs) in state.items()]).sort_values('t', kind='stable').reset_index(drop=True)
cum = pr[['valid', *PARTIES]].cumsum(); NTOT = int(b.total_ids.iloc[-1]); NMAX = len(pr)
s = pd.read_csv(sys.argv[1]); sp = pd.DataFrame([{kv.split(':')[0]: float(kv.split(':')[1]) for kv in x.split('; ')} for x in s.party_percentages])[list(PARTIES)]
n_est = np.minimum(np.round(s.counted_ids_pct / 100 * NTOT).astype(int), NMAX)
ci = b.counted_ids.values
m = s[['timestamp', 'counted_ids_pct', 'counted_votes_pct']].copy()
m['precincts_est'] = n_est
m['batch'] = [int(b.batch[np.searchsorted(ci, max(n, 1))]) if n <= ci[-1] else int(b.batch.iloc[-1]) for n in n_est]            # first batch that contained this many precincts
m['batch_time'] = b.set_index('batch').batch_time.reindex(m.batch).values
m['data_time'] = [pr.t[n - 1] if n > 0 else pd.NaT for n in n_est]                                                                # when the n-th precinct was processed
m['lag_min'] = ((pd.to_datetime(m.timestamp) - m.data_time).dt.total_seconds() / 60).round(2)
m['valid_votes'] = [int(cum.valid[n - 1]) if n > 0 else 0 for n in n_est]
m['implied_total_votes'] = (m.valid_votes / (m.counted_votes_pct / 100)).round(0).where(m.counted_votes_pct > 1)
for n in PARTIES: m['pred_' + n] = sp[n].values
for n in PARTIES: m['counted_' + n] = [round(cum[n][k - 1] / cum.valid[k - 1] * 100, 2) if k > 0 else np.nan for k in n_est]
m['placement_reliable'] = (m.counted_ids_pct >= 0.5) & (m.counted_ids_pct < 99.5)     # at the ends one 0.1 % step spans many minutes
m.to_csv(DATA / 'sheet_joined_2025.csv', index=False)
print(m[['lag_min']].describe().round(2).T); print('implied total valid votes (sheet denominator), median:', m.implied_total_votes.median(), 'vs final counted', final)
print('rows where n_est lies at the final plateau (>= 14800):', (n_est >= 14800).sum())
