#!/usr/bin/env python3
"""Refresh the local country transport gallery from completed exports; never uploads."""

from pathlib import Path
import re

from import_regional_transport import main

ROOT = Path(__file__).resolve().parents[1]
RAIL_MODES = [dict(key="regional", name="Regionální vlaky", color="#4a51ab"), dict(key="long", name="Dálkové vlaky", color="#f76800")]
PUBLIC_MODES = [
    dict(key="bus", name="Autobus", color="#4a51ab"),
    dict(key="train", name="Vlak", color="#f76800"),
    dict(key="tram", name="Tramvaj", color="#de1743"),
    dict(key="metro", name="Metro", color="#0e839e"),
    dict(key="ferry", name="Trajekt", color="#272a59"),
]
COUNTRIES = [
    dict(id="czechia", name="Česko", type="Vlaky", kind="country", source="Správa železnic (CIS JŘ), JrUtil", language="Čeština · DataTimes.cz", modes=RAIL_MODES, coverage="Vlaky podle dostupného GTFS jízdního řádu; polohy a kilometry dopočtené."),
    dict(id="austria", name="Rakousko", type="Vlaky ÖBB", kind="country", source="ÖBB Soll-Fahrplan (GTFS)", language="Němčina · DataTimes.at", modes=RAIL_MODES, coverage="Pouze ÖBB. WESTbahn a další soukromí železniční dopravci nejsou zahrnuti."),
    dict(id="slovakia", name="Slovensko", type="Vlaky", kind="country", source="ŽSR, grafikon vlakové dopravy (GTFS)", language="Slovenština · DataTimes.sk", modes=RAIL_MODES, coverage="Provoz podle použitého grafikonu ŽSR; polohy a kilometry odhadované z jízdního řádu."),
    dict(id="poland", name="Polsko", type="Vlaky", kind="country", source="Agregované GTFS jízdní řády dopravců, mkuran.pl", language="Polština · DataTimes.org", modes=RAIL_MODES, coverage="Agregovaný soubor jízdních řádů mkuran.pl; zastoupení dopravců odpovídá použitému souboru."),
    dict(id="italy", name="Itálie", type="Vlaky", kind="country", source="Trenitalia, Italo (NeTEx NAP → GTFS), Trenord", language="Italština · DataTimes.org", modes=RAIL_MODES, coverage="Trenitalia, Italo a Trenord. Další regionální dopravci nejsou zahrnuti."),
    dict(id="norway", name="Norsko", type="Veřejná doprava", kind="country", source="Entur (NLOD), národní GTFS jízdní řád", language="Norština · DataTimes.org", modes=PUBLIC_MODES, coverage="Více druhů dopravy z jízdních řádů Entur: autobusy, vlaky, tramvaje, metro i trajekty."),
    dict(id="vienna", name="Vídeň · městský detail", type="Město · Rakousko", kind="city", source="Wiener Linien, Wiener Lokalbahnen, otevřená data města Vídně, ÖBB", language="Němčina · DataTimes.at", modes=PUBLIC_MODES[:4], coverage="Městský detail: Wiener Linien, Wiener Lokalbahnen a vlaky ÖBB ve Vídni."),
]
PATTERN = re.compile(
    r"(?P<region>czechia|austria|slovakia|poland|italy|norway|vienna)"
    r"(?P<profile>_portrait|_square|_og|_homepage)?_web(?P<trail>_trail)?_trains"
    r"(?:_(?P<start>\d+(?:\.\d+)?)-(?P<end>\d+(?:\.\d+)?)h)?"
    r"(?:_\d+(?:\.\d+)?s)?_(?P<date>\d{8})\.mp4$"
)


if __name__ == "__main__":
    main(dict(
        page=ROOT / "2026-doprava-v-evrope", regions=COUNTRIES, pattern=PATTERN,
        since="2026-11-01T18:00:00+00:00", description=__doc__, title="Doprava napříč Evropou",
        default_region="austria", default_profile="homepage", poster_hour=17,
        variable="COUNTRY_GALLERY", refresh="scripts/import_country_transport.py",
    ))
