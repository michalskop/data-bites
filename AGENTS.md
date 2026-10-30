# Data Bites agent instructions

- This is a buildless static HTML/JavaScript site published by GitHub Pages from `main`, repository root.
- Target URL: https://data-bites.datatimes.cz (activation pending DNS). Current site: https://michalskop.github.io/data-bites/. Once activated, keep `CNAME` set to `data-bites.datatimes.cz`.
- Keep Czech website copy in Czech. Write new code comments and technical documentation in English.
- Preserve existing analyses and relative analysis/data links. Do not publish unrelated untracked work.

## Media storage: Backblaze B2 and the DataTimes CDN

- Do not commit media files to GitHub. This includes chart exports, previews, photos, SVGs, videos, audio, PDFs and fonts. Keep HTML, JavaScript, CSS and analysis datasets in this repository.
- Upload media to the shared Backblaze B2 bucket `datatimes-media`. Use **https://media.datatimes.org/data-bites/** URLs in HTML, JavaScript catalog entries and Markdown. Never use B2 origin/download URLs or a local media path in published content.
- Use `scripts/upload_media.py`; see README.md for installation and examples. Credentials come from `~/.datatimes-media.env` or an ignored repository `.env`. Never print, commit or copy credentials into source.
- Use `data-bites/<analysis-id>/<filename>-v1.<ext>` for analysis media and `data-bites/site/<filename>-YYYY-MM-v1.<ext>` for site assets. Do not upload into another project's namespace.
- The uploader refuses existing keys. **Never overwrite a published asset**: immutable browser caching lasts one year. Upload a revision at a new `-v2` URL and update references in the same commit.
- Use `--format preserve` for SVGs, animated GIFs, video, audio and PDFs; `auto` converts PNG/JPEG to WebP; `og-image` exports a 1200×630 JPEG. Use the actual URL returned after conversion.
- Publish a URL only after CDN verification succeeds (HTTP 200, matching size/hash/type, cache policy and CORS). If upload succeeded but verification failed, fix the CDN issue and use `--verify-only` with the same input/options. Do not re-upload or overwrite the object.
- Record published uploads in `media-assets.json`, including URL, key, SHA-256, size and content type. Preserve existing entries.
- For canvas exports, load external images with `crossorigin="anonymous"` (or set `image.crossOrigin = 'anonymous'` before assigning `src`). CDN CORS must permit the page's origin.
- Install the tracked media-blocking pre-commit hook on each clone: `git config core.hooksPath .githooks`. Do not bypass it for editorial media. The existing vendored Leaflet UI assets are legacy dependencies; leave them unchanged.
- Infrastructure reference: `/home/michal/dev/mahdalova-skop/docs/technicke/datatimes-infrastructure-rfc.md`. This repository's CLI uses a full target filename, rather than the RFC's illustrative target directory.

## Verification

- Run `python3 -m unittest discover -s scripts -p 'test_*.py'` after changing the media uploader.
- Check the hook in a temporary Git repository with staged media and normal source files; verify rejection and acceptance without altering this repository's index.
- Run `git diff --check` before committing. Stage explicit paths so unrelated work stays unpublished.
