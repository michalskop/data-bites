"""Download the current RUIAN voting-district layer (CUZK ArcGIS, layer 20) as GeoJSON in WGS84, in parallel objectid chunks."""
import json, sys, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
B = "https://ags.cuzk.cz/arcgis/rest/services/RUIAN/Prohlizeci_sluzba_nad_daty_RUIAN/MapServer/20/query"
from config import RUIAN_GEOJSON
out, CH = (sys.argv[1] if len(sys.argv) > 1 else RUIAN_GEOJSON), 150
def get(a):
    q = dict(where=f'objectid >= {a} AND objectid < {a + CH}', outFields='kod,cislo,obec,momc,platiod,platido,nespravny', outSR=4326, f='geojson', maxAllowableOffset=0.00005)
    for _ in range(4):
        try: fs = json.load(urllib.request.urlopen(B + '?' + urllib.parse.urlencode(q), timeout=240))['features']; print(a, len(fs), flush=True); return fs
        except Exception as e: print(a, 'retry', e, flush=True)
    return []
with ThreadPoolExecutor(8) as ex: parts = list(ex.map(get, range(1, 14557, CH)))
feats = [f for p in parts for f in p]; json.dump({'type': 'FeatureCollection', 'features': feats}, open(out, 'w')); print('total', len(feats))
