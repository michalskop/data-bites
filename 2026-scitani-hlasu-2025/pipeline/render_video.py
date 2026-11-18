"""Render a ~60 s video: python3 render_video.py speed|size|ano [seconds] [--frames N]   (1920x1080, 30 fps, H.264)"""
import sys, subprocess, time, os, numpy as np
from config import OUT, RENDERER, launch_browser, free_port, wait_for_port
from playwright.sync_api import sync_playwright
mode = sys.argv[1]; secs = float(sys.argv[2]) if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else 60.0
limit = int(sys.argv[sys.argv.index('--frames') + 1]) if '--frames' in sys.argv else None
port = free_port(); FPS = 30
out = f'{OUT}/{mode}_video.mp4'
# time warp: minutes after 14:00 shown at each video second. Counting is front-loaded, so it plays slower early and faster late.
hold = 6.0; run = secs - hold
knots_s = np.array([0, .24, .64, 1.0]) * run; knots_t = np.array([20, 80, 210, 401.4])
fine = np.linspace(0, run, 4001); vel = np.gradient(np.interp(fine, knots_s, knots_t), fine)
k = int(2.0 / (fine[1] - fine[0])); vel = np.convolve(np.pad(vel, k, mode='edge'), np.ones(2 * k + 1) / (2 * k + 1), mode='valid')   # smooth speed changes over ~2 s
tt = 20 + np.concatenate([[0], np.cumsum((vel[1:] + vel[:-1]) / 2 * np.diff(fine))]); tt = 20 + (tt - 20) * (401.4 - 20) / (tt[-1] - 20)
n = int(secs * FPS); sec = np.arange(n) / FPS
T = np.where(sec < run, np.interp(sec, fine, tt), 401.4); V = np.interp(np.minimum(sec, run), fine, vel)       # minutes shown, minutes per second
srv = subprocess.Popen(['python3', '-m', 'http.server', str(port), '-d', str(RENDERER)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); wait_for_port(port)
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-', '-vf', 'scale=in_range=full:out_range=limited,format=yuv420p',      # JPEG frames are full range; players expect limited-range yuv420p
                       '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-profile:v', 'high', '-color_range', 'tv', '-movflags', '+faststart', out if not limit else out.replace('.mp4', '_test.mp4')], stdin=subprocess.PIPE)
try:
    with sync_playwright() as p:
        b = launch_browser(p); pg = b.new_page(viewport={'width': 1920, 'height': 1080})
        pg.on('pageerror', lambda e: print('ERR', e)); pg.goto(f'http://localhost:{port}/?mode={mode}&t=20'); pg.wait_for_function('window.READY===true', timeout=60000)
        t0 = time.time()
        for i in range(limit or n):
            idx = i if not limit else int(i * n / limit)
            pg.evaluate(f'render({T[idx]:.3f}, {V[idx] * 0.8:.3f})')
            ff.stdin.write(pg.screenshot(type='jpeg', quality=95))
            if i % 100 == 0: print(f'{mode} {i}/{limit or n}  {time.time() - t0:.0f}s', flush=True)
        b.close()
finally:
    ff.stdin.close(); ff.wait(); srv.terminate()
print('done', out)
