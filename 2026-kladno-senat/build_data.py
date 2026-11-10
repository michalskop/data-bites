#!/usr/bin/env python3
"""Build dashboard/data.js from the Kladno handoff data, 2020 Senate XML-derived CSV and RUIAN shapes.

Inputs : ../data/senate_municipalities.csv, ../data/senate_stations_wide.csv,
         ../../historical/senat_vse/csv/set5.csv (2020 district 30, both rounds),
         geo/obce.geojson, geo/okrsky.geojson (RUIAN, ČÚZK ArcGIS layers 12 and 20)
Output : data.js  (window.DATA = {...})
Run    : python3 build_data.py
"""
import csv, json, pathlib
import pandas as pd
from shapely.geometry import shape

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
CAND = ["Klas", "Šípová", "Pelc", "Machalová", "Paták", "Gerloch"]
C20 = {1: "Bendl (ODS)", 2: "Zímová", 3: "Volf", 4: "Oliva", 5: "Fröhlichová (STAN)", 6: "Šípová (Piráti)",
       7: "Dienstbier (ČSSD)", 8: "Vostrá (KSČM)", 9: "Bošek (SPD)", 10: "Landa (Trikolóra)",
       11: "Bohbot", 12: "Vojtová (ANO)", 13: "Závodský (KDU-ČSL)"}
# unverified leads from HANDOFF.md (hypotheses, not errors)
FLAGS = {(533149, 1): "Žilina 1: Klas 26→62 (záměna číslic, neověřeno)",
         (532185, 1): "Cvrčovice 1: Šípová 46→64 (záměna číslic, neověřeno)",
         (532053, 2): "Kladno 2: záměna Paták/Gerloch (neověřeno)",
         (532223, 1): "Doksy 1: vedlejší kontext, bez podporované opravy"}

# ---- 2020 -------------------------------------------------------------
d = pd.read_csv(ROOT.parent / "historical/senat_vse/csv/set5.csv", sep=";")
d = d[(d.DATUMVOLEB == 20201002) & (d.OBVOD == 30)]
hc = [f"HLASY_{i:02d}" for i in range(1, 14)]
def agg(k):
    g = d[d.KOLO == k].groupby("OBEC")[["VOL_SEZNAM", "ODEVZ_OBAL", "PL_HL_CELK"] + hc].sum()
    return g
a20, b20 = agg(1), agg(2)

# ---- geometry ---------------------------------------------------------
def rnd(c, n=5):
    if isinstance(c[0], (int, float)):
        return [round(c[0], n), round(c[1], n)]
    return [rnd(x, n) for x in c]
obce_gj = json.load(open(HERE / "geo/obce.geojson"))
okr_gj = json.load(open(HERE / "geo/okrsky.geojson"))
cent, boundary = {}, []
for f in obce_gj["features"]:
    g = shape(f["geometry"]); p = g.representative_point(); c = g.centroid
    cent[int(f["properties"]["kod"])] = [round(c.y, 5), round(c.x, 5)]
    boundary.append({"type": "Feature", "properties": {"obec": int(f["properties"]["kod"])},
                     "geometry": {"type": f["geometry"]["type"], "coordinates": rnd(f["geometry"]["coordinates"])}})
okr_geom = {}
for f in okr_gj["features"]:
    p = f["properties"]; g = shape(f["geometry"]); c = g.centroid
    okr_geom[(int(p["obec"]), int(p["cislo"]))] = (
        {"type": f["geometry"]["type"], "coordinates": rnd(f["geometry"]["coordinates"])}, [round(c.y, 5), round(c.x, 5)], g.area)

# ---- 2026 -------------------------------------------------------------
def votes(r): return [int(r[f"C{i}_votes"]) for i in range(1, 7)]
munis, stations = [], []
for r in csv.DictReader(open(ROOT / "data/senate_municipalities.csv")):
    o = int(r["obec"]); A, B = a20.loc[o], b20.loc[o]
    munis.append(dict(id=o, name=r["municipality"], n=int(r["stations"]), pos=cent[o],
        reg=int(r["voters"]), ret=int(r["returned"]), valid=int(r["valid"]), c=votes(r),
        r1=dict(reg=int(A.VOL_SEZNAM), ret=int(A.ODEVZ_OBAL), valid=int(A.PL_HL_CELK), c=[int(A[h]) for h in hc]),
        r2=dict(reg=int(B.VOL_SEZNAM), ret=int(B.ODEVZ_OBAL), valid=int(B.PL_HL_CELK), s=int(B.HLASY_06), b=int(B.HLASY_01))))
mname = {m["id"]: m["name"] for m in munis}
for r in csv.DictReader(open(ROOT / "data/senate_stations_wide.csv")):
    o, s = int(r["obec"]), int(r["station"]); geom, pos, area = okr_geom[(o, s)]
    stations.append(dict(id=f"{o}-{s}", obec=o, st=s, name=mname[o], pos=pos, area=round(area, 8), geom=geom,
        reg=int(r["voters"]), ret=int(r["returned"]), valid=int(r["valid"]), c=votes(r), flag=FLAGS.get((o, s))))

out = dict(cand=CAND, c20=C20, built="2026-10-11", munis=munis, stations=stations, boundary=boundary,
           src="Hlasy: volby.cz XML (místní cache, souhrn z 2026-10-11T11:06 SELČ souhlasí); hranice: RÚIAN/ČÚZK volební okrsky a obce; 2020: archiv senátních voleb volby.cz")
(HERE / "data.js").write_text("window.DATA=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";")
print(len(munis), len(stations), (HERE / "data.js").stat().st_size // 1024, "kB")
