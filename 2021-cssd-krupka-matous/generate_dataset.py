import xml.etree.ElementTree as ET
import pyproj
import pandas as pd
import zipfile, io, requests, json
import numpy as np

print("1. Loading codebooks...")
r_cis = requests.get('https://www.volby.cz/opendata/ps2021/PS2021ciselniky20211006_csv.zip', headers={'User-Agent': 'Mozilla/5.0'})
with zipfile.ZipFile(io.BytesIO(r_cis.content)) as z:
    df_cis = pd.read_csv(z.open('csv_od/cisob.csv'))
    df_coco = pd.read_csv(z.open('csv_od/pscoco.csv'))
    
    obec_names = dict(zip(df_cis['OBEC_PREZ'], df_cis['NAZEVOBCE']))
    parent_map = dict(zip(df_coco['OBEC'], df_coco['OBEC_PREZ']))

okres_names = {
    4201: 'Děčín',
    4202: 'Chomutov',
    4203: 'Litoměřice',
    4204: 'Louny',
    4205: 'Most',
    4206: 'Teplice',
    4207: 'Ústí nad Labem'
}

print("2. Parsing RÚIAN coordinates...")
transformer = pyproj.Transformer.from_crs('EPSG:5514', 'EPSG:4326', always_xy=True)
vo_coords = {}
obec_points = {}

for event, elem in ET.iterparse('20261003_ST_UVOH.xml', events=('end',)):
    if elem.tag.endswith('VO'):
        obec = elem.find('.//{*}Obec/{*}Kod')
        momc = elem.find('.//{*}Momc/{*}Kod')
        cislo = elem.find('.//{*}Cislo')
        pos = elem.find('.//{*}DefinicniBod/{*}Point/{*}pos')
        
        eff_obec = int(momc.text) if momc is not None and momc.text else (int(obec.text) if obec is not None and obec.text else None)
        c_num = int(cislo.text) if cislo is not None and cislo.text else None
        
        if eff_obec and c_num and pos is not None and pos.text:
            coords = pos.text.strip().split()
            x, y = float(coords[0]), float(coords[1])
            lon, lat = transformer.transform(x, y)
            vo_coords[(eff_obec, c_num)] = (round(lon, 6), round(lat, 6))
            if obec is not None and obec.text:
                ob_code = int(obec.text)
                vo_coords[(ob_code, c_num)] = (round(lon, 6), round(lat, 6))
                if ob_code not in obec_points:
                    obec_points[ob_code] = []
                obec_points[ob_code].append((lon, lat))
            if eff_obec not in obec_points:
                obec_points[eff_obec] = []
            obec_points[eff_obec].append((lon, lat))
        elem.clear()

obec_centroids = {k: (round(np.mean([p[0] for p in v]), 6), round(np.mean([p[1] for p in v]), 6)) for k, v in obec_points.items() if len(v) > 0}

def get_coords(obec, okrsek):
    if (obec, okrsek) in vo_coords:
        return vo_coords[(obec, okrsek)]
    if obec in obec_centroids:
        clon, clat = obec_centroids[obec]
        jitter_lon = ((okrsek * 37) % 19 - 9) * 0.0015
        jitter_lat = ((okrsek * 41) % 19 - 9) * 0.001
        return (round(clon + jitter_lon, 6), round(clat + jitter_lat, 6))
    return None

def get_obec_name(obec):
    if obec in obec_names:
        return obec_names[obec]
    parent = parent_map.get(obec)
    if parent and parent in obec_names:
        return f"{obec_names[parent]} (část)"
    return f"Obec {obec}"

def process_year(year, url, party_num, matous_col, candidate_info, is_utf8=True):
    print(f"Processing year {year}...")
    r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        fname = 'csv/pst4p.csv' if 'csv/pst4p.csv' in z.namelist() else 'pst4p.csv'
        with z.open(fname) as f:
            df = pd.read_csv(f, sep=';', encoding='utf-8' if is_utf8 else 'cp1250')
    
    df_usti = df[(df['OKRES'] >= 4201) & (df['OKRES'] <= 4207) & (df['KSTRANA'] == party_num)].copy()
    hlasy_cols = [c for c in df_usti.columns if c.startswith('HLASY_')]
    
    records = []
    for _, row in df_usti.iterrows():
        obec = int(row['OBEC'])
        okrsek = int(row['OKRSEK'])
        votes_cssd = int(row['POC_HLASU'])
        matous_pref = int(row[matous_col])
        total_pref = int(row[hlasy_cols].sum())
        
        rate_pref = (matous_pref / total_pref) if total_pref > 0 else 0.0
        rate_votes = (matous_pref / votes_cssd) if votes_cssd > 0 else 0.0
        
        coords = get_coords(obec, okrsek)
        if not coords:
            continue
        
        ob_name = get_obec_name(obec)
        is_krupka = ('krupka' in ob_name.lower()) or (obec == 567639)
        
        records.append({
            'y': year,
            'okres_code': int(row['OKRES']),
            'okres_name': okres_names.get(int(row['OKRES']), 'Neznámý'),
            'obec': obec,
            'obec_name': ob_name,
            'okrsek': okrsek,
            'votes': votes_cssd,
            'matous': matous_pref,
            'total_pref': total_pref,
            'rate_pref': round(rate_pref, 4), # preferential rate
            'rate_votes': round(rate_votes, 4), # votes rate
            'lon': coords[0],
            'lat': coords[1],
            'krupka': is_krupka
        })
    
    df_r = pd.DataFrame(records)
    krupka_df = df_r[df_r['krupka']]
    
    total_votes = int(df_r['votes'].sum())
    total_pref = int(df_r['total_pref'].sum())
    matous_pref = int(df_r['matous'].sum())
    
    krupka_votes = int(krupka_df['votes'].sum())
    krupka_pref = int(krupka_df['total_pref'].sum())
    krupka_matous = int(krupka_df['matous'].sum())
    
    stats = {
        'year': year,
        'candidate_name': "PhDr. Ing. Zdeněk Matouš, Ph.D., MBA",
        'candidate_role': candidate_info['role'],
        'candidate_position': candidate_info['pos'],
        'party_number': party_num,
        'total_okrsky': len(records),
        'total_cssd_votes': total_votes,
        'total_cssd_pref_votes': total_pref,
        'total_matous_pref_votes': matous_pref,
        'region_matous_pref_rate': round(float(matous_pref / total_pref * 100), 2),
        'region_matous_voter_rate': round(float(matous_pref / total_votes * 100), 2),
        'krupka_cssd_votes': krupka_votes,
        'krupka_cssd_pref_votes': krupka_pref,
        'krupka_matous_pref_votes': krupka_matous,
        'krupka_matous_pref_rate': round(float(krupka_matous / krupka_pref * 100), 2),
        'krupka_matous_voter_rate': round(float(krupka_matous / krupka_votes * 100), 2),
        'max_okrsek_votes': int(df_r['votes'].max()),
        'max_matous_votes': int(df_r['matous'].max()),
    }
    
    return {'stats': stats, 'okrsky': records}

data2017 = process_year(2017, 'https://www.volby.cz/opendata/ps2017nss/PS2017data20171122_csv.zip', 4, 'HLASY_02', {
    'pos': 2,
    'role': 'Starosta Krupky (č. 2 na kandidátce ČSSD, 1. náhradník)'
})

data2021 = process_year(2021, 'https://www.volby.cz/opendata/ps2021/PS2021_data_20211010_csv.zip', 5, 'HLASY_01', {
    'pos': 1,
    'role': 'Starosta Krupky (č. 1 – lídr kandidátky ČSSD)'
})

final_payload = {
    '2017': data2017,
    '2021': data2021
}

with open('elections_data.json', 'w', encoding='utf-8') as f:
    json.dump(final_payload, f, ensure_ascii=False)

with open('elections_data.js', 'w', encoding='utf-8') as f:
    f.write('const ELECTIONS_DATA = ' + json.dumps(final_payload, ensure_ascii=False) + ';')

print("elections_data.json and elections_data.js updated successfully!")
