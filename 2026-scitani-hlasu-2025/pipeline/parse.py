"""Parse the archived real-time 2025 batch XMLs into one row per precinct with its processing time."""
import re, glob, csv, sys
import xml.etree.ElementTree as ET
from config import BATCH_XML_DIR, DATA
SRC = str(BATCH_XML_DIR) + '/'
NS = '{http://www.volby.cz/ps/}'
rows = {}
for f in sorted(glob.glob(SRC + 'vysledky_okrsky_*.xml')):
    root = ET.parse(f).getroot(); gen = root.get('DATUM_CAS_GENEROVANI')
    for o in root.iter(NS + 'OKRSEK'):
        k = (int(o.get('CIS_OBEC')), int(o.get('CIS_OKRSEK')))
        u = o.find(NS + 'UCAST_OKRSEK')
        votes = {int(h.get('KSTRANA')): int(h.get('HLASY')) for h in o.iter(NS + 'HLASY_OKRSEK')}
        r = dict(obec=k[0], okrsek=k[1], batch_time=gen, t=o.get('DATUM_CAS_ZPRAC'), poradi=int(o.get('PORADI_ZPRAC')),
                 repeat=o.get('OPAKOVANE'), voters=int(u.get('ZAPSANI_VOLICI')), valid=int(u.get('PLATNE_HLASY')), ano=votes.get(22, 0))
        if k not in rows: rows[k] = r      # first appearance = first time public
        else: rows[k]['n_rep'] = rows[k].get('n_rep', 0) + 1
w = csv.DictWriter(open(DATA / 'precincts_2025.csv', 'w'), fieldnames=['obec','okrsek','batch_time','t','poradi','repeat','voters','valid','ano','n_rep'], extrasaction='ignore')
w.writeheader(); w.writerows(rows.values()); print(len(rows))
