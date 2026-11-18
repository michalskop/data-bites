"""Paths used by the pipeline. Everything can be overridden with environment variables."""
import os
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DATA = ROOT / 'data'                 # committed CSV datasets
CACHE = HERE / 'cache'               # generated, git-ignored (merged table, downloaded RUIAN layer)
OUT = HERE / 'out'                   # generated, git-ignored (stills, videos)
RENDERER = HERE / 'renderer'         # canvas page; data.json, base.png and fonts/ are generated here (git-ignored)
for p in (CACHE, OUT): p.mkdir(exist_ok=True)

# Only needed to re-parse the raw election-night batches (the parsed result is committed as data/precincts_2025.csv)
BATCH_XML_DIR = Path(os.environ.get('BATCH_XML_DIR', '~/dev/archive/volby2025/cz2025/real-time/2025/download/batches')).expanduser()
# Only needed to recompute precinct positions (the result is committed as data/precinct_positions_2025.csv)
GEO_2022 = Path(os.environ.get('GEO_2022', '~/dev/volby2026/cz2026/historical/geo/vol_okrsky_2022g100.geojson')).expanduser()
RUIAN_GEOJSON = Path(os.environ.get('RUIAN_GEOJSON', CACHE / 'ruian_voting_districts.geojson'))
# Needed for the base map (DEM hillshade, DataTimes palette) and the fonts: the "trains" project
TRAINS_REPO = Path(os.environ.get('TRAINS_REPO', '~/dev/ai/data-at/trains')).expanduser()
CHROMIUM = os.environ.get('CHROMIUM', '/snap/bin/chromium')


def free_port():
    """A free local TCP port for the temporary static server that serves renderer/."""
    import socket
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0)); return s.getsockname()[1]


def wait_for_port(port, timeout=30):
    """Block until the local static server accepts connections."""
    import socket, time
    end = time.time() + timeout
    while time.time() < end:
        try:
            socket.create_connection(('127.0.0.1', port), timeout=1).close(); return
        except OSError: time.sleep(0.2)
    raise RuntimeError(f'static server on port {port} did not start')
