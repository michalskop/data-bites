# Agent instructions: set up and run the 2025 counting videos on Windows

Audience: an AI agent (or a person) on a **Windows** machine with PowerShell. Goal: render the three videos (and stills) of how the 2025 Chamber election was counted.
Everything needed is in this repository folder plus a checksummed asset bundle that `make.py setup` downloads. Do **not** look for the DataTimes `trains` project; it is not needed.
Czech site copy, English technical notes. See `README.md` in this folder for the full description.

## 1. Prerequisites (check first, install only what is missing)
```powershell
git --version; py --version; ffmpeg -version
```
Anything missing: `winget install -e Git.Git`, `winget install -e Python.Python.3.12`, `winget install -e Gyan.FFmpeg`, then **open a new terminal** so the PATH updates and re-check.
Python 3.10+ is required.

## 2. Setup (one line)
```powershell
git clone --depth 1 https://github.com/michalskop/data-bites.git; cd data-bites\2026-scitani-hlasu-2025\pipeline; py -m venv .venv; .\.venv\Scripts\python -m pip install -r requirements.txt; .\.venv\Scripts\python -m playwright install chromium; .\.venv\Scripts\python make.py setup; .\.venv\Scripts\python make.py build
```
If the repository is already cloned, `git pull` and run from `data-bites\2026-scitani-hlasu-2025\pipeline` (create `.venv` only once).
If PowerShell blocks nothing, no activation is needed: the commands call `.\.venv\Scripts\python` directly.

Expected output:
- `make.py setup`: `downloading https://media.datatimes.org/...renderer-assets-v1.zip`, `extracted to ...\renderer`, `browser ok` (a `WARNING: ffmpeg not found` line means ffmpeg is not on the PATH).
- `make.py build`: `14710 precincts -> ...\cache\merged.parquet`, then `wrote ...\renderer\data.json`.

## 3. Run
```powershell
cd data-bites\2026-scitani-hlasu-2025\pipeline
.\.venv\Scripts\python make.py still speed 50     # one still in out\  (modes: speed | size | ano; second argument = % of votes counted, e.g. 5)
.\.venv\Scripts\python make.py video speed        # ~60 s video in out\speed_video.mp4; about 5 minutes, 1800 frames (also: size, ano)
.\.venv\Scripts\python make.py all                # setup + build + 3 stills + 3 videos
```
Quick smoke test (about 10 s): `.\.venv\Scripts\python render_video.py size 60 --frames 10` writes `out\size_video_test.mp4`.

## 4. Verify
- `out\<mode>_<pct>pct_landscape.png` is a 1920x1080 slide: map left, clock and bars/curves right, ANO chart below. A blank or broken page means the assets or `data.json` are missing: rerun setup and build.
- Videos: `ffprobe -v error -show_entries stream=width,height,pix_fmt:format=duration -of csv=p=0 out\speed_video.mp4` should print 1920, 1080, yuv420p and a duration of 60.
- The `size` still at 5 % must read 15:16, "20 % nejmenších obcí" 63 %, Praha 0 % (4 z 1 118).

## 5. Troubleshooting
| Symptom | Fix |
| --- | --- |
| `py` is not recognised | Python not installed or terminal not reopened; install Python 3.12 and open a new terminal. |
| `No browser found` | `.\.venv\Scripts\python -m playwright install chromium`, or set `$env:CHROMIUM = 'C:\Program Files\Google\Chrome\Application\chrome.exe'`. |
| `ffmpeg` is not recognised | Install ffmpeg (`winget install -e Gyan.FFmpeg`) and open a new terminal; videos cannot be encoded without it. |
| `checksum mismatch for the asset bundle` | Do not use the files. The bundle is versioned and immutable; check `ASSETS_URL`/`ASSETS_SHA256` in `pipeline\config.py` match the latest commit (`git pull`). |
| `HTTP Error 403` when downloading | A proxy or antivirus is rewriting the request; the script already sends a normal User-Agent. Try another network. |
| Rendering is very slow or the machine is under load | Render one video at a time (`make.py video speed`); each frame is a browser screenshot. |
| Console shows garbled Czech characters | Cosmetic only (console code page); outputs are unaffected. |

## 6. Rules when working in this repository
- **Never commit media** (videos, PNG/JPEG/SVG, fonts, PDFs). The pre-commit hook rejects it. `out\`, `cache\`, `renderer\base.png`, `renderer\data.json` and `renderer\fonts\` are git-ignored and must stay so.
- Publishing a video means uploading it to the DataTimes CDN with `scripts\upload_media.py` (needs shared credentials in `~\.datatimes-media.env`, which this machine may not have; ask the owner) under a **new** revision key
  `databites-dtcz/2026-scitani-hlasu-2025/<name>-vN.mp4` (never overwrite an existing key), recording the result in `media-assets.json` and updating `videos.js`. See the root `README.md` and `AGENTS.md`.
- Do not push or deploy without being asked. Keep changes to `pipeline\` focused; layout lives in `pipeline\renderer\app.js`, pacing in the time-warp knots at the top of `pipeline\render_video.py`.
- Data files in `..\data\` are committed CSVs. Regenerating them from raw inputs needs files that are not in Git (see "Rebuilding inputs" in `README.md`); normally do not.
