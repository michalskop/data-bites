# Data Bites

Krátké datové analýzy, mikro-studie a interaktivní vizualizace otevřených dat z dílny **DataTimes / Mahdalová & Škop**.

Design vychází z vizuálního systému projektu [Sněmovna.DataTimes.cz](https://snemovna.datatimes.cz/digest).

Production domain: **https://databites.datatimes.cz/** (launch pending DNS and certificate issuance).
Hosting: GitHub Pages, `main`, repository root.

---

## 📁 Struktura repozitáře

* `index.html` — Hlavní katalog / rozcestník analýz s filtrováním podle štítků a vyhledáváním
* `2021-cssd-krupka-matous/` — Interaktivní mapa preferenčních hlasů Zdeňka Matouše (ČSSD, Ústecký kraj, 2017 & 2021)
  * `index.html` — Samotná interaktivní mapa (Leaflet + OpenStreetMap)
  * Náhledový obrázek je uložen na `media.datatimes.org` (viz `media-assets.json`)
  * `elections_data.js` & `elections_data.json` — Zpracovaná volební data po okrscích
  * `generate_dataset.py` — Skript pro stažení a párování dat z ČSÚ a RÚIAN
* `2026-volebni-anomalie/` — Forenzní screening a mapa volebních anomálií (komunální a senátní volby 2026)
  * `index.html` — Interaktivní bublinová mapa anomálií a detailní panely
  * Náhledový obrázek je uložen na `media.datatimes.org` (viz `media-assets.json`)
  * `data.js` — Datový soubor detekovaných nesrovnalostí a revizí protokolů
* Odkazované živé aplikace v katalogu:
  * [volby2026.datatimes.cz](https://volby2026.datatimes.cz/) — Predikce vs. sčítání (zastupitelstva a 1. kolo Senátu)
  * [volby2026-2.datatimes.cz](https://volby2026-2.datatimes.cz/) — Predikce výsledků 2. kola Senátu

---

## 🚀 Lokální spuštění

Jednoduše otevřete `index.html` v libovolném webovém prohlížeči, nebo spusťte lokální HTTP server:

```bash
cd ~/dev/ms/data-bites
python3 -m http.server 8000
```

Poté otevřete v prohlížeči [http://localhost:8000](http://localhost:8000).

---

## ➕ Jak přidat novou analýzu

1. Vytvořte novou složku pro analýzu (např. `YYYY-nazev-tematu/`).
2. Do složky vložte `index.html`. Náhledový obrázek nahrajte přes `scripts/upload_media.py` na CDN podle postupu níže; média nepatří do Gitu.
3. V kořenovém souboru `index.html` přidejte do pole `DATA_BITES` nový objekt:

```javascript
{
  id: "YYYY-nazev-tematu",
  title: "Název nové analýzy",
  description: "Krátký popis zjištění a metodiky.",
  created_at: "YYYY-MM-DD",
  updated_at: "YYYY-MM-DD",
  url: "./YYYY-nazev-tematu/",
  image: "https://media.datatimes.org/databites-dtcz/YYYY-nazev-tematu/preview-v1.svg",
  tags: ["Téma 1", "Téma 2"]
}
```

## Media uploads and agent setup

Media is stored in the shared Backblaze B2 bucket `datatimes-media` and served
through **https://media.datatimes.org/databites-dtcz/**. Keep source code and analysis
datasets in Git. Do not commit images, chart exports, video, audio, fonts or PDFs.
Existing bundled Leaflet icons remain part of the vendored library.

After cloning, install the media guard and uploader dependencies:

```bash
git config core.hooksPath .githooks
python3 -m pip install -r scripts/requirements-media.txt
```

The pre-commit hook blocks staged additions, modifications, copies and renames of
media files, including SVG. Deletions are allowed for migration. Git hook settings
are local to each clone; collaborators must run the setup command too.

The uploader reads `B2_KEY_ID` and `B2_APPLICATION_KEY` (or `B2_APP_KEY`) from the
environment, an ignored repository `.env`, or `~/.datatimes-media.env`. Use the
existing shared credentials file when available; never commit credentials.
`B2_BUCKET` defaults to `datatimes-media`; the key must be scoped to that bucket.

```bash
# Convert a PNG/JPEG chart to WebP; the output URL uses .webp.
python3 scripts/upload_media.py \
  --file /tmp/chart.png \
  --target databites-dtcz/YYYY-analysis-slug/chart-v1.webp \
  --format auto --fail-if-exists

# Preserve SVG, video, animated GIF, audio, PDF or other original formats.
python3 scripts/upload_media.py \
  --file /tmp/preview.svg \
  --target databites-dtcz/YYYY-analysis-slug/preview-v1.svg \
  --format preserve --fail-if-exists

# Generate a 1200×630 JPEG social card.
python3 scripts/upload_media.py \
  --file /tmp/cover.png \
  --target databites-dtcz/YYYY-analysis-slug/cover-og-v1.jpg \
  --format og-image --fail-if-exists
```

Use `databites-dtcz/<analysis-id>/` for analysis media and `databites-dtcz/site/` for site
assets. The target is a **full filename**, unlike the directory example in the RFC.
The script returns JSON with the public URL, SHA-256, size, MIME type and verification
result. Record published uploads in `media-assets.json` and use the returned URL in
the page or catalog. Do not link directly to a Backblaze download host.

Uploads always refuse existing keys and fail closed if the collision lookup fails.
Published media uses `Cache-Control: public, max-age=31536000, immutable`: upload
revisions as `-v2`, `-v3`, etc., then update the referring page in the same commit.
There is no overwrite option. Do not rewrite Git history to remove old media.

Success requires a CDN HEAD response with HTTP 200, matching size, SHA-1 and MIME
type, the immutable cache policy, and CORS access for the production origin. If an
upload succeeds but verification fails, the command exits with an error. Fix the
CDN issue, then repeat the same command with `--verify-only` to check the existing
object without uploading again.

The bucket allows public cross-origin downloads and Range requests. Backblaze
reflects the requesting origin in `Access-Control-Allow-Origin`; it does not emit
the literal `*` proposed for the Cloudflare response rule in the RFC. For canvas
exports, use `crossorigin="anonymous"` on images or set `image.crossOrigin` before
setting `src`.

Agent instructions are in [AGENTS.md](AGENTS.md); [CLAUDE.md](CLAUDE.md) points to the
same policy. Infrastructure reference:
`/home/michal/dev/mahdalova-skop/docs/technicke/datatimes-infrastructure-rfc.md`.

## Domain configuration

The committed `CNAME` file, canonical links and GitHub Pages custom-domain setting
use `databites.datatimes.cz`. To finish activation, add this Cloudflare **DNS-only**
CNAME record:

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `databites` | `michalskop.github.io` | DNS only |

The same custom domain is registered in repository Settings → Pages. Enable HTTPS
enforcement once GitHub has issued the certificate. Canonical links use the production domain;
analysis routes and datasets keep relative paths so local development works.

## Verification

```bash
python3 -m unittest discover -s scripts -p 'test_*.py' -v
git diff --check
```
