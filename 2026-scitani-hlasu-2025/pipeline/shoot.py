"""Screenshot a still (1920x1080): python3 shoot.py size|ano|speed [pct]   -> out/<mode>_<pct>pct_landscape.png"""
from config import OUT, RENDERER, CHROMIUM, free_port, wait_for_port
PORT = free_port()
import sys, subprocess, time, os
from playwright.sync_api import sync_playwright
mode = sys.argv[1]; pct = sys.argv[2] if len(sys.argv) > 2 else '5'; fmt = 'landscape'
srv = subprocess.Popen(['python3', '-m', 'http.server', str(PORT), '-d', str(RENDERER)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); wait_for_port(PORT)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROMIUM, args=['--no-sandbox']); pg = b.new_page(viewport={'width': 1920, 'height': 1080})
        pg.on('console', lambda m: print('console:', m.text)); pg.on('pageerror', lambda e: print('ERR', e))
        pg.goto(f'http://localhost:{PORT}/?mode={mode}&pct={pct}&fmt={fmt}'); pg.wait_for_function('window.READY===true', timeout=30000)
        out = f'{OUT}/{mode}_{pct}pct_{fmt}.png'; pg.screenshot(path=out); print(out); b.close()
finally: srv.terminate()
