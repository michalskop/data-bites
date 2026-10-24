# Data Bites

Krátké datové analýzy, mikro-studie a interaktivní vizualizace otevřených dat z dílny **DataTimes / Mahdalová & Škop**.

Design vychází z vizuálního systému projektu [Sněmovna.DataTimes.cz](https://snemovna.datatimes.cz/digest).

---

## 📁 Struktura repozitáře

* `index.html` — Hlavní katalog / rozcestník analýz s filtrováním podle štítků a vyhledáváním
* `2021-cssd-krupka-matous/` — Interaktivní mapa preferenčních hlasů Zdeňka Matouše (ČSSD, Ústecký kraj, 2017 & 2021)
  * `index.html` — Samotná interaktivní mapa (Leaflet + OpenStreetMap)
  * `preview.svg` — Náhledový obrázek pro hlavní stránku
  * `elections_data.js` & `elections_data.json` — Zpracovaná volební data po okrscích
  * `generate_dataset.py` — Skript pro stažení a párování dat z ČSÚ a RÚIAN
* `2026-volebni-anomalie/` — Forenzní screening a mapa volebních anomálií (komunální a senátní volby 2026)
  * `index.html` — Interaktivní bublinová mapa anomálií a detailní panely
  * `preview.svg` — Náhledový obrázek pro hlavní stránku
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
2. Do složky vložte `index.html` a náhledový obrázek (např. `preview.svg` nebo `preview.png`).
3. V kořenovém souboru `index.html` přidejte do pole `DATA_BITES` nový objekt:

```javascript
{
  id: "YYYY-nazev-tematu",
  title: "Název nové analýzy",
  description: "Krátký popis zjištění a metodiky.",
  created_at: "YYYY-MM-DD",
  updated_at: "YYYY-MM-DD",
  url: "./YYYY-nazev-tematu/",
  image: "./YYYY-nazev-tematu/preview.svg",
  tags: ["Téma 1", "Téma 2"]
}
```
