#!/usr/bin/env python3
"""One entry point for the 2025 counting videos.

    python3 make.py setup              # download the base map + fonts (checksummed bundle from the DataTimes CDN), check ffmpeg and the browser
    python3 make.py build              # CSVs in ../data -> cache/merged.parquet -> renderer/data.json
    python3 make.py still speed 50     # a still: speed|size|ano and the % of votes counted -> out/<mode>_<pct>pct_landscape.png
    python3 make.py video speed        # a ~60 s video: speed|size|ano -> out/<mode>_video.mp4   (seconds can be added: video speed 45)
    python3 make.py all                # setup + build + the three videos and the three stills used on the web page
"""
import hashlib, io, shutil, subprocess, sys, urllib.request, zipfile
from config import ASSETS_URL, ASSETS_SHA256, RENDERER, HERE, launch_browser


def setup():
    if (RENDERER / 'base.png').exists() and (RENDERER / 'fonts').is_dir():
        print('renderer assets already present')
    else:
        print('downloading', ASSETS_URL)
        data = urllib.request.urlopen(ASSETS_URL, timeout=120).read()
        if hashlib.sha256(data).hexdigest() != ASSETS_SHA256: sys.exit('checksum mismatch for the asset bundle; not extracting')
        zipfile.ZipFile(io.BytesIO(data)).extractall(RENDERER); print('extracted to', RENDERER)
    if not shutil.which('ffmpeg'): print('WARNING: ffmpeg not found (needed for videos): install it with your package manager')
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p: launch_browser(p).close()
        print('browser ok')
    except Exception as e: print('WARNING: no usable browser:', e)


def run(script, *args): subprocess.run([sys.executable, str(HERE / script), *args], check=True, cwd=HERE)


def build(): run('build.py'); run('export_web.py')


if __name__ == '__main__':
    cmd, args = (sys.argv[1] if len(sys.argv) > 1 else ''), sys.argv[2:]
    if cmd == 'setup': setup()
    elif cmd == 'build': build()
    elif cmd == 'still': run('shoot.py', *args)
    elif cmd == 'video': run('render_video.py', *args)
    elif cmd == 'all':
        setup(); build()
        for m, pct in (('speed', '50'), ('size', '5'), ('ano', '5')): run('shoot.py', m, pct)
        for m in ('speed', 'size', 'ano'): run('render_video.py', m, '60')
    else: sys.exit(__doc__)
