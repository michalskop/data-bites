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
# Base map + fonts: a ready-made bundle on the DataTimes CDN, fetched by `python3 make.py setup` (media cannot live in Git).
ASSETS_URL = 'https://media.datatimes.org/databites-dtcz/2026-scitani-hlasu-2025/renderer-assets-v1.zip'
ASSETS_SHA256 = 'edcfc735926275308a7f64db5f4066889f7afefe7623044402f50ba1b30765f4'
# Only for maintainers who rebuild the base map (build_basemap.py): the DataTimes "trains" project with its DEM caches
TRAINS_REPO = Path(os.environ.get('TRAINS_REPO', '~/dev/ai/data-at/trains')).expanduser()
CHROMIUM = os.environ.get('CHROMIUM')       # optional path to a Chromium/Chrome binary; otherwise Playwright's own browser or a system one is used


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


def launch_browser(p):
    """Playwright Chromium: $CHROMIUM if set, else Playwright's own browser (`python3 -m playwright install chromium`), else a system Chromium/Chrome."""
    import shutil
    args = ['--no-sandbox']
    if CHROMIUM: return p.chromium.launch(executable_path=CHROMIUM, args=args)
    try: return p.chromium.launch(args=args)
    except Exception as first:
        for name in ('chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'chrome'):
            path = shutil.which(name)
            if path: return p.chromium.launch(executable_path=path, args=args)
        raise RuntimeError('No browser found. Run `python3 -m playwright install chromium` or set CHROMIUM=/path/to/chrome.') from first
