'use strict';
// Per-region UI copy and settings. Data lives in data/<id>/.
const REGIONS={
 "dach": {
  "id": "dach",
  "short": {
   "en": "German-speaking",
   "de": "Deutschsprachig",
   "cs": "Německy mluvící"
  },
  "defaults": {
   "a": "gasse",
   "b": "strasse"
  },
  "plates": [
   [
    "Zürich",
    "zuerich",
    ""
   ],
   [
    "Hamburg",
    "hamburg",
    ""
   ],
   [
    "München",
    "muenchen",
    ""
   ],
   [
    "Berlin",
    "berlin",
    "",
    "2a – 8"
   ],
   [
    "Wien",
    "wien",
    ""
   ]
  ],
  "plateRadius": {
   "5": 14,
   "10": 16,
   "20": 22
  },
  "copy": {
   "en": {
    "eyebrow": "STREET NAMES IN GERMAN-SPEAKING EUROPE",
    "h1": "Gasse<br><span>or Straße?</span>",
    "intro": "Every hexagon holds the named streets inside it. Its <b>colour</b> says which kind of street dominates; its <b>strength</b> says how many streets there are.",
    "pageTitle": "Gasse or Straße · DataTimes.at",
    "credit": " · Wien district numbers: Stadt Wien – data.wien.gv.at (CC BY 4.0)",
    "families": "<p><b>Families.</b> The first word of a name that ends in a street-type word decides the family: <i>-straße, -strasse, -str.</i> → Straße; <i>-gasse, -gass, -gässli, -gässle, -gässchen</i> → Gasse; likewise Weg, Platz, Allee, Ring, Steig, Pfad and more. “Straße des 17. Juni” counts as Straße; “Am Markt” as Markt. Names with no such word are counted in the total only.</p>",
    "area": "<p><b>Area.</b> Germany, Austria, Liechtenstein, German-speaking Switzerland (BFS 2022 language regions), all of South Tyrol and the nine municipalities of the German-speaking Community of Belgium. Street names are shown as OSM records them (German in all of these areas). Luxembourg is not included.</p>",
    "caveat": "<p><b>Caveat.</b> OSM completeness and tagging differ by region and by snapshot date; the Geofabrik extracts for Baden-Württemberg, Bavaria and North Rhine-Westphalia date from February 2021, all others from November 2026. Names are matched by spelling, not individually verified.</p>",
    "disclaimer": "Spelling patterns in OSM street names."
   },
   "de": {
    "eyebrow": "STRASSENNAMEN IM DEUTSCHEN SPRACHRAUM",
    "h1": "Gasse<br><span>oder Straße?</span>",
    "intro": "Jedes Sechseck enthält die benannten Straßen in seinem Gebiet. Die <b>Farbe</b> zeigt, welche Art von Straße überwiegt; die <b>Stärke</b> zeigt, wie viele Straßen es gibt.",
    "pageTitle": "Gasse oder Straße · DataTimes.at",
    "credit": " · Wiener Bezirksnummern: Stadt Wien – data.wien.gv.at (CC BY 4.0)",
    "families": "<p><b>Familien.</b> Das erste Wort eines Namens, das auf ein Straßentyp-Wort endet, bestimmt die Familie: <i>-straße, -strasse, -str.</i> → Straße; <i>-gasse, -gass, -gässli, -gässle, -gässchen</i> → Gasse; ebenso Weg, Platz, Allee, Ring, Steig, Pfad und weitere. „Straße des 17. Juni“ zählt als Straße, „Am Markt“ als Markt. Namen ohne ein solches Wort zählen nur in der Gesamtzahl.</p>",
    "area": "<p><b>Gebiet.</b> Deutschland, Österreich, Liechtenstein, die deutschsprachige Schweiz (BFS-Sprachgebiete 2022), ganz Südtirol und die neun Gemeinden der Deutschsprachigen Gemeinschaft Belgiens. Straßennamen erscheinen so, wie OSM sie führt (in all diesen Gebieten deutsch). Luxemburg ist nicht enthalten.</p>",
    "caveat": "<p><b>Hinweis.</b> Vollständigkeit und Erfassung in OSM unterscheiden sich nach Region und Stand; die Geofabrik-Auszüge für Baden-Württemberg, Bayern und Nordrhein-Westfalen stammen vom Februar 2021, alle übrigen vom November 2026. Namen werden nach Schreibweise zugeordnet, nicht einzeln geprüft.</p>",
    "disclaimer": "Schreibweisen in OSM-Straßennamen."
   },
   "cs": {
    "disclaimer": "Vzory zápisu uličních názvů v OpenStreetMap.",
    "eyebrow": "ULIČNÍ NÁZVY V NĚMECKY MLUVÍCÍ EVROPĚ",
    "h1": "Gasse<br><span>nebo Straße?</span>",
    "intro": "Každý šestiúhelník obsahuje pojmenované ulice na svém území. <b>Barva</b> ukazuje, který typ názvu převažuje; <b>sytost</b> ukazuje počet ulic.",
    "pageTitle": "Gasse, nebo Straße? · DataTimes.at",
    "credit": " · Čísla vídeňských obvodů: Stadt Wien – data.wien.gv.at (CC BY 4.0)",
    "families": "<p><b>Rodiny.</b> O rodině rozhoduje typové slovo na konci názvu: <i>-straße, -strasse, -str.</i> → Straße; <i>-gasse, -gass, -gässli, -gässle, -gässchen</i> → Gasse; stejně Weg, Platz, Allee, Ring, Steig, Pfad a další. „Straße des 17. Juni“ se počítá jako Straße, „Am Markt“ jako Markt. Názvy bez takového slova se počítají jen do celku.</p>",
    "area": "<p><b>Území.</b> Německo, Rakousko, Lichtenštejnsko, německy mluvící Švýcarsko (jazykové regiony BFS 2022), celé Jižní Tyrolsko a devět obcí německy mluvícího společenství v Belgii. Názvy ulic jsou tak, jak je zapisuje OSM (ve všech těchto oblastech německy). Lucembursko není zahrnuto.</p>",
    "caveat": "<p><b>Upozornění.</b> Úplnost a značení v OSM se liší podle regionu i data stažení; výřezy Geofabrik pro Bádensko-Württembersko, Bavorsko a Severní Porýní-Vestfálsko jsou z února 2021, ostatní z listopadu 2026. Názvy se přiřazují podle zápisu, ne individuálně ověřením.</p>"
   }
  }
 },
 "spain": {
  "id": "spain",
  "short": {
   "en": "Spain",
   "de": "Spanien",
   "cs": "Španělsko"
  },
  "defaults": {
   "a": "calle",
   "b": "carrer",
   "metric": "dominant"
  },
  "dominant": [
   [
    "calle",
    "#d9600f"
   ],
   [
    "carrer",
    "#2467a8"
   ],
   [
    "kalea",
    "#1f9d6e"
   ],
   [
    "rua",
    "#8b4fb0"
   ]
  ],
  "plates": [
   [
    "Santiago de Compostela",
    "santiago",
    ""
   ],
   [
    "Madrid",
    "madrid",
    ""
   ],
   [
    "Bilbao",
    "bilbao",
    ""
   ],
   [
    "València",
    "valencia",
    ""
   ],
   [
    "Barcelona",
    "barcelona",
    ""
   ]
  ],
  "plateRadius": {
   "5": 10,
   "10": 12,
   "20": 18
  },
  "copy": {
   "en": {
    "eyebrow": "STREET NAMES IN SPAIN AND ANDORRA",
    "h1": "Calle, carrer,<br><span>kalea or rúa?</span>",
    "intro": "Every hexagon holds the named streets inside it. Its <b>colour</b> says which word for “street” dominates; its <b>strength</b> says how many streets there are. Pick any two names to compare.",
    "pageTitle": "Calle or Carrer · DataTimes.at",
    "disclaimer": "Spelling patterns in OSM street names.",
    "families": "<p><b>Families.</b> The type word at the start of a name decides the family: <i>calle</i> (Castilian), <i>carrer</i> (Catalan, Valencian, Balearic), <i>rúa</i> (Galician), <i>kalea / karrika</i> (Basque, usually the last word), likewise avenida / avinguda, plaza / plaça / praza, paseo / passeig, camino / camí / camiño / camín and others. Where OSM gives a bilingual name (“Calle Mayor / Kale Nagusia”), the regional-language part counts. Names without a street-type word (“La Rambla” aside) count in the total only; road codes (N-340, CV-35), car parks, estates and tracks are dropped.</p>",
    "area": "<p><b>Area.</b> Mainland Spain, the Balearic and Canary Islands (shown in an inset), Ceuta, Melilla and Andorra. Portugal, France and Morocco appear as grey context only.</p>",
    "caveat": "<p><b>Caveat.</b> OSM completeness and tagging differ by region; in Catalonia and the Basque Country streets are often tagged with both languages, in Galicia and Asturias mostly in the regional language. Names are matched by spelling, not individually verified.</p>"
   },
   "de": {
    "eyebrow": "STRASSENNAMEN IN SPANIEN UND ANDORRA",
    "h1": "Calle, Carrer,<br><span>Kalea oder Rúa?</span>",
    "intro": "Jedes Sechseck enthält die benannten Straßen in seinem Gebiet. Die <b>Farbe</b> zeigt, welches Wort für „Straße“ überwiegt; die <b>Stärke</b> zeigt, wie viele Straßen es gibt. Beliebige zwei Namen lassen sich vergleichen.",
    "pageTitle": "Calle oder Carrer · DataTimes.at",
    "disclaimer": "Schreibweisen in OSM-Straßennamen.",
    "families": "<p><b>Familien.</b> Das Straßentyp-Wort am Anfang eines Namens bestimmt die Familie: <i>calle</i> (kastilisch), <i>carrer</i> (katalanisch, valencianisch, balearisch), <i>rúa</i> (galicisch), <i>kalea / karrika</i> (baskisch, meist das letzte Wort), ebenso avenida / avinguda, plaza / plaça / praza, paseo / passeig, camino / camí / camiño / camín und weitere. Bei zweisprachigen OSM-Namen („Calle Mayor / Kale Nagusia“) zählt der Teil in der Regionalsprache. Namen ohne Straßentyp-Wort zählen nur in der Gesamtzahl; Straßennummern (N-340, CV-35), Parkplätze, Siedlungen und Feldwege werden ausgeschlossen.</p>",
    "area": "<p><b>Gebiet.</b> Festland-Spanien, die Balearen und die Kanarischen Inseln (im Ausschnitt), Ceuta, Melilla und Andorra. Portugal, Frankreich und Marokko erscheinen nur als graue Umgebung.</p>",
    "caveat": "<p><b>Hinweis.</b> Vollständigkeit und Erfassung in OSM unterscheiden sich nach Region; in Katalonien und im Baskenland sind Straßen oft zweisprachig erfasst, in Galicien und Asturien meist in der Regionalsprache. Namen werden nach Schreibweise zugeordnet, nicht einzeln geprüft.</p>"
   },
   "cs": {
    "disclaimer": "Vzory zápisu uličních názvů v OpenStreetMap.",
    "eyebrow": "ULIČNÍ NÁZVY VE ŠPANĚLSKU A ANDORŘE",
    "h1": "Calle, carrer,<br><span>kalea nebo rúa?</span>",
    "intro": "Každý šestiúhelník obsahuje pojmenované ulice na svém území. <b>Barva</b> ukazuje, které slovo pro „ulici“ převažuje; <b>sytost</b> ukazuje počet ulic. Vyberte libovolné dva názvy k porovnání.",
    "pageTitle": "Calle, carrer, kalea nebo rúa? · DataTimes.at",
    "families": "<p><b>Rodiny.</b> O rodině rozhoduje typové slovo na začátku názvu: <i>calle</i> (kastilsky), <i>carrer</i> (katalánsky, valencijsky, baleársky), <i>rúa</i> (galicijsky), <i>kalea / karrika</i> (baskicky, obvykle poslední slovo), stejně avenida / avinguda, plaza / plaça / praza, paseo / passeig, camino / camí / camiño / camín a další. Pokud OSM uvádí dvojjazyčný název („Calle Mayor / Kale Nagusia“), počítá se část v regionálním jazyce. Názvy bez typového slova se počítají jen do celku; čísla silnic (N-340, CV-35), parkoviště, sídliště a cesty se vynechávají.</p>",
    "area": "<p><b>Území.</b> Pevninské Španělsko, Baleáry a Kanárské ostrovy (v výřezu), Ceuta, Melilla a Andorra. Portugalsko, Francie a Maroko jsou jen šedým kontextem.</p>",
    "caveat": "<p><b>Upozornění.</b> Úplnost a značení v OSM se liší podle regionu; v Katalánsku a Baskicku jsou ulice často značeny v obou jazycích, v Galicii a Asturii většinou v regionálním jazyce. Názvy se přiřazují podle zápisu, ne individuálně ověřením.</p>"
   }
  }
 },
 "uk_ie": {
  "id": "uk_ie",
  "short": {
   "en": "UK & Ireland",
   "de": "UK & Irland",
   "cs": "Británie a Irsko"
  },
  "defaults": {
   "a": "street",
   "b": "road",
   "metric": "dominant"
  },
  "dominant": [
   [
    "street",
    "#d9600f"
   ],
   [
    "road",
    "#2467a8"
   ],
   [
    "lane",
    "#1f9d6e"
   ],
   [
    "close",
    "#8b4fb0"
   ],
   [
    "drive",
    "#c2185b"
   ]
  ],
  "plates": [
   [
    "Dingle",
    "dublin",
    "",
    "",
    "irish"
   ],
   [
    "Stornoway",
    "dublin",
    "",
    "",
    "gaelic"
   ],
   [
    "Caernarfon",
    "cardiff",
    "",
    "",
    "welsh"
   ],
   [
    "Edinburgh",
    "edinburgh",
    "",
    "EH1",
    "close"
   ],
   [
    "York",
    "york",
    "",
    "",
    "gate"
   ],
   [
    "London",
    "london",
    "",
    "W1",
    "street"
   ]
  ],
  "plateRadius": {
   "5": 6,
   "10": 8,
   "20": 14
  },
  "copy": {
   "en": {
    "eyebrow": "STREET NAMES IN THE UK AND IRELAND",
    "h1": "Street, road,<br><span>lane or close?</span>",
    "intro": "Every hexagon holds the named streets inside it. Its <b>colour</b> says which word for “street” dominates; its <b>strength</b> says how many streets there are. Pick any two names to compare, such as <i>-gate</i> in York or <i>wynd</i> in Scotland.",
    "pageTitle": "Street, Road, Lane or Close · DataTimes.at",
    "disclaimer": "Spelling patterns in OSM street names.",
    "families": "<p><b>Families.</b> The <i>last</i> word of a name decides the family (<i>Church Lane</i> → Lane, <i>High Street North</i> → Street); compass words and “Upper/Lower” are ignored. Compounds ending in <i>-gate</i> (Stonegate, Micklegate) count as <b>-gate</b>. Welsh (<i>Heol, Ffordd, Stryd, Lôn…</i>), Irish (<i>Bóthar, Sráid, Plás…</i>) and Scottish Gaelic (<i>Rathad, Sràid…</i>) names are matched by their first word. Where OSM gives a bilingual “A / B” name, the Celtic-language part counts. Bridges, roundabouts, bypasses, estates, tracks and road numbers (A1, N7) are dropped.</p>",
    "area": "<p><b>Area.</b> England, Scotland, Wales, Northern Ireland and the Republic of Ireland. The Isle of Man and the Channel Islands are not included. France, Belgium and the Netherlands appear as grey context only.</p>",
    "caveat": "<p><b>Caveat.</b> There is no municipality layer for the UK after Brexit, so one street = one name per 5 km cell and hexagon. OSM completeness differs by area; estates in Ireland carry many names ending in Park, Grove or Heights. Names are matched by spelling, not individually verified.</p>"
   },
   "de": {
    "eyebrow": "STRASSENNAMEN IM VEREINIGTEN KÖNIGREICH UND IN IRLAND",
    "h1": "Street, Road,<br><span>Lane oder Close?</span>",
    "intro": "Jedes Sechseck enthält die benannten Straßen in seinem Gebiet. Die <b>Farbe</b> zeigt, welches Wort für „Straße“ überwiegt; die <b>Stärke</b> zeigt, wie viele Straßen es gibt. Beliebige zwei Namen lassen sich vergleichen, etwa <i>-gate</i> in York oder <i>Wynd</i> in Schottland.",
    "pageTitle": "Street, Road, Lane oder Close · DataTimes.at",
    "disclaimer": "Schreibweisen in OSM-Straßennamen.",
    "families": "<p><b>Familien.</b> Das <i>letzte</i> Wort eines Namens bestimmt die Familie (<i>Church Lane</i> → Lane, <i>High Street North</i> → Street); Himmelsrichtungen und „Upper/Lower“ werden ignoriert. Zusammensetzungen auf <i>-gate</i> (Stonegate, Micklegate) zählen als <b>-gate</b>. Walisische (<i>Heol, Ffordd, Stryd, Lôn …</i>), irische (<i>Bóthar, Sráid, Plás …</i>) und schottisch-gälische (<i>Rathad, Sràid …</i>) Namen werden über ihr erstes Wort erkannt. Bei zweisprachigen OSM-Namen („A / B“) zählt der keltischsprachige Teil. Brücken, Kreisverkehre, Umgehungsstraßen, Siedlungen, Feldwege und Straßennummern (A1, N7) werden ausgeschlossen.</p>",
    "area": "<p><b>Gebiet.</b> England, Schottland, Wales, Nordirland und die Republik Irland. Die Isle of Man und die Kanalinseln sind nicht enthalten. Frankreich, Belgien und die Niederlande erscheinen nur als graue Umgebung.</p>",
    "caveat": "<p><b>Hinweis.</b> Für das Vereinigte Königreich gibt es seit dem Brexit keine Gemeindeebene; eine Straße = ein Name je 5-km-Zelle und Sechseck. Die Vollständigkeit der OSM-Daten schwankt; Siedlungen in Irland tragen viele Namen auf Park, Grove oder Heights. Namen werden nach Schreibweise zugeordnet, nicht einzeln geprüft.</p>"
   },
   "cs": {
    "disclaimer": "Vzory zápisu uličních názvů v OpenStreetMap.",
    "eyebrow": "ULIČNÍ NÁZVY VE VELKÉ BRITÁNII A IRSKU",
    "h1": "Street, road,<br><span>lane nebo close?</span>",
    "intro": "Každý šestiúhelník obsahuje pojmenované ulice na svém území. <b>Barva</b> ukazuje, které slovo pro „ulici“ převažuje; <b>sytost</b> ukazuje počet ulic. Vyberte libovolné dva názvy, třeba <i>-gate</i> v Yorku nebo <i>wynd</i> ve Skotsku.",
    "pageTitle": "Street, road, lane nebo close? · DataTimes.at",
    "families": "<p><b>Rodiny.</b> O rodině rozhoduje <i>poslední</i> slovo názvu (<i>Church Lane</i> → Lane, <i>High Street North</i> → Street); světové strany a „Upper/Lower“ se ignorují. Složeniny končící na <i>-gate</i> (Stonegate, Micklegate) se počítají jako <b>-gate</b>. Velšské (<i>Heol, Ffordd, Stryd, Lôn…</i>), irské (<i>Bóthar, Sráid, Plás…</i>) a skotské gaelské (<i>Rathad, Sràid…</i>) názvy se přiřazují podle prvního slova. U dvojjazyčných názvů „A / B“ se počítá část v keltském jazyce. Mosty, kruhové objezdy, obchvaty, sídliště, cesty a čísla silnic (A1, N7) se vynechávají.</p>",
    "area": "<p><b>Území.</b> Anglie, Skotsko, Wales, Severní Irsko a Irská republika. Ostrov Man a Normanské ostrovy nejsou zahrnuty. Francie, Belgie a Nizozemsko jsou jen šedým kontextem.</p>",
    "caveat": "<p><b>Upozornění.</b> Po brexitu neexistuje pro Británii vrstva obcí, proto jedna ulice = jeden název na 5km buňku a šestiúhelník. Úplnost OSM se liší podle oblasti; sídliště v Irsku mají mnoho názvů končících na Park, Grove nebo Heights. Názvy se přiřazují podle zápisu, ne individuálně ověřením.</p>"
   }
  }
 },
 "lat_am": {
  "id": "lat_am",
  "size": 40,
  "short": {
   "en": "Latin America",
   "de": "Lateinamerika",
   "cs": "Latinská Amerika"
  },
  "defaults": {
   "a": "calle",
   "b": "carrera",
   "metric": "dominant"
  },
  "dominant": [
   [
    "calle",
    "#d9600f"
   ],
   [
    "pasaje",
    "#8b4fb0"
   ],
   [
    "carrera",
    "#1f9d6e"
   ],
   [
    "jiron",
    "#c2185b"
   ],
   [
    "privada",
    "#b8860b"
   ],
   [
    "bare",
    "#55606e",
    "name only"
   ]
  ],
  "plates": [
   [
    "Ciudad de México",
    "cdmx",
    "",
    "",
    "calle"
   ],
   [
    "Lima",
    "lima",
    "",
    "",
    "jiron"
   ],
   [
    "Bogotá",
    "bogota",
    "",
    "",
    "carrera"
   ],
   [
    "Santiago",
    "santiago-cl",
    "",
    "",
    "pasaje"
   ],
   [
    "Buenos Aires",
    "bsas",
    "",
    "",
    "bare"
   ]
  ],
  "plateRadius": {
   "10": 8,
   "20": 14,
   "40": 30
  },
  "copy": {
   "en": {
    "eyebrow": "STREET NAMES IN SPANISH-SPEAKING AMERICA",
    "h1": "Calle, carrera,<br><span>jirón or pasaje?</span>",
    "intro": "Every hexagon holds the named streets inside it. Its <b>colour</b> says which word for “street” dominates; its <b>strength</b> says how many streets there are. Pick any two names to compare.",
    "pageTitle": "Calle, Carrera, Jirón or Pasaje · DataTimes.at",
    "disclaimer": "Spelling patterns in OSM street names.",
    "families": "<p><b>Families.</b> As in Spain, the type word at the start of a name decides the family: <i>calle</i>, <i>avenida</i>, <i>carrera</i> (Colombia’s grid: <i>calle</i> one way, <i>carrera</i> the other), <i>jirón</i> (Peru), <i>pasaje</i> (Chile, Argentina, Peru), <i>privada, cerrada, andador, rinconada</i> (Mexico) and others. <b>Name only</b> counts streets whose OSM name has no type word at all (“Juan Pérez”, “Los Pinos”), the usual style in Argentina, Chile and Uruguay. Road numbers, neighbourhoods, estates and tracks are dropped.</p>",
    "area": "<p><b>Area.</b> Sixteen Spanish-speaking republics of the mainland Americas, plus Cuba and the Dominican Republic: Mexico, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica, Panama, Colombia, Venezuela, Ecuador, Peru, Bolivia, Chile, Argentina, Uruguay and Paraguay. Puerto Rico, the Galápagos and Easter Island are not shown; Brazil and the Guianas appear as grey context only.</p>",
    "caveat": "<p><b>Caveat.</b> OSM coverage varies a lot: Mexico City, Bogotá, Lima or Santiago are mapped street by street, many provincial towns are not, and large areas (the Amazon, the Andes) have almost no named streets. There is no municipality layer, so one street = one name per 5 km cell and hexagon. Names are matched by spelling, not individually verified.</p>"
   },
   "de": {
    "eyebrow": "STRASSENNAMEN IM SPANISCHSPRACHIGEN AMERIKA",
    "h1": "Calle, Carrera,<br><span>Jirón oder Pasaje?</span>",
    "intro": "Jedes Sechseck enthält die benannten Straßen in seinem Gebiet. Die <b>Farbe</b> zeigt, welches Wort für „Straße“ überwiegt; die <b>Stärke</b> zeigt, wie viele Straßen es gibt. Beliebige zwei Namen lassen sich vergleichen.",
    "pageTitle": "Calle, Carrera, Jirón oder Pasaje · DataTimes.at",
    "disclaimer": "Schreibweisen in OSM-Straßennamen.",
    "families": "<p><b>Familien.</b> Wie in Spanien bestimmt das Straßentyp-Wort am Anfang eines Namens die Familie: <i>calle</i>, <i>avenida</i>, <i>carrera</i> (Kolumbiens Raster: <i>calle</i> in die eine, <i>carrera</i> in die andere Richtung), <i>jirón</i> (Peru), <i>pasaje</i> (Chile, Argentinien, Peru), <i>privada, cerrada, andador, rinconada</i> (Mexiko) und weitere. <b>Nur Name</b> zählt Straßen, deren OSM-Name gar kein Typ-Wort enthält („Juan Pérez“, „Los Pinos“) – der übliche Stil in Argentinien, Chile und Uruguay. Straßennummern, Stadtviertel, Siedlungen und Feldwege werden ausgeschlossen.</p>",
    "area": "<p><b>Gebiet.</b> Die 16 spanischsprachigen Staaten des amerikanischen Festlands sowie Kuba und die Dominikanische Republik: Mexiko, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica, Panama, Kolumbien, Venezuela, Ecuador, Peru, Bolivien, Chile, Argentinien, Uruguay und Paraguay. Puerto Rico, die Galápagos und die Osterinsel sind nicht dargestellt; Brasilien und die Guayanas erscheinen nur als graue Umgebung.</p>",
    "caveat": "<p><b>Hinweis.</b> Die OSM-Abdeckung schwankt stark: Mexiko-Stadt, Bogotá, Lima oder Santiago sind Straße für Straße erfasst, viele Provinzstädte nicht, und große Gebiete (Amazonas, Anden) haben kaum benannte Straßen. Es gibt keine Gemeindeebene; eine Straße = ein Name je 5-km-Zelle und Sechseck. Namen werden nach Schreibweise zugeordnet, nicht einzeln geprüft.</p>"
   },
   "cs": {
    "disclaimer": "Vzory zápisu uličních názvů v OpenStreetMap.",
    "eyebrow": "ULIČNÍ NÁZVY VE ŠPANĚLSKY MLUVÍCÍ AMERICE",
    "h1": "Calle, carrera,<br><span>jirón nebo pasaje?</span>",
    "intro": "Každý šestiúhelník obsahuje pojmenované ulice na svém území. <b>Barva</b> ukazuje, které slovo pro „ulici“ převažuje; <b>sytost</b> ukazuje počet ulic. Vyberte libovolné dva názvy k porovnání.",
    "pageTitle": "Calle, carrera, jirón nebo pasaje? · DataTimes.at",
    "families": "<p><b>Rodiny.</b> Jako ve Španělsku rozhoduje typové slovo na začátku názvu: <i>calle</i>, <i>avenida</i>, <i>carrera</i> (kolumbijská síť: <i>calle</i> jedním směrem, <i>carrera</i> druhým), <i>jirón</i> (Peru), <i>pasaje</i> (Chile, Argentina, Peru), <i>privada, cerrada, andador, rinconada</i> (Mexiko) a další. <b>Jen jméno</b> počítá ulice, jejichž název v OSM nemá žádné typové slovo („Juan Pérez“, „Los Pinos“), což je běžné v Argentině, Chile a Uruguayi. Čísla silnic, čtvrti, sídliště a cesty se vynechávají.</p>",
    "area": "<p><b>Území.</b> Šestnáct španělsky mluvících republik pevninské Ameriky plus Kuba a Dominikánská republika: Mexiko, Guatemala, Honduras, Salvador, Nikaragua, Kostarika, Panama, Kolumbie, Venezuela, Ekvádor, Peru, Bolívie, Chile, Argentina, Uruguay a Paraguay. Portoriko, Galapágy a Velikonoční ostrov nejsou zobrazeny; Brazílie a Guyany jsou jen šedým kontextem (Brazílie jako prázdný obrys).</p>",
    "caveat": "<p><b>Upozornění.</b> Pokrytí OSM je velmi nerovnoměrné: Ciudad de México, Bogotá, Lima nebo Santiago jsou zmapované ulici po ulici, řada provinčních měst ne a velké oblasti (Amazonie, Andy) mají téměř žádné pojmenované ulice. Vrstva obcí neexistuje, proto jedna ulice = jeden název na 5km buňku a šestiúhelník. Názvy se přiřazují podle zápisu, ne individuálně ověřením.</p>"
   }
  }
 },
 "arabic": {
  "id": "arabic",
  "short": {
   "en": "Arabic world",
   "de": "Arabische Welt",
   "cs": "Arabský svět"
  },
  "size": 40,
  "defaults": {
   "a": "shari",
   "b": "rue",
   "metric": "dominant"
  },
  "dominant": [
   [
    "shari",
    "#d9600f",
    "Shari‘"
   ],
   [
    "rue",
    "#2467a8",
    "Rue"
   ],
   [
    "nahj",
    "#1f9d6e",
    "Nahj"
   ],
   [
    "zanqa",
    "#8b4fb0",
    "Zanqa"
   ],
   [
    "hara",
    "#c2185b",
    "Hara"
   ],
   [
    "street",
    "#b8860b",
    "Street"
   ],
   [
    "bare",
    "#55606e",
    "name only"
   ]
  ],
  "plates": [
   [
    "Marrakech",
    "marrakech",
    "",
    "",
    "derb"
   ],
   [
    "Casablanca",
    "casablanca",
    "",
    "",
    "rue"
   ],
   [
    "Tunis",
    "tunis",
    "",
    "",
    "nahj"
   ],
   [
    "Cairo",
    "cairo",
    "",
    "",
    "hara"
   ],
   [
    "Beirut",
    "beirut",
    "",
    "",
    "shari"
   ]
  ],
  "plateRadius": {
   "10": 8,
   "20": 14,
   "40": 30
  },
  "copy": {
   "en": {
    "eyebrow": "STREET NAMES IN THE ARABIC-SPEAKING WORLD",
    "h1": "Shari‘, rue, nahj<br><span>or zanqa?</span>",
    "intro": "Every hexagon holds the named streets inside it. Its <b>colour</b> says which word for “street” dominates; its <b>strength</b> says how many streets there are. Pick any two names to compare. Arabic words are shown in transliteration; the Arabic script is in the drop-downs.",
    "pageTitle": "Shari‘, Rue, Nahj or Zanqa · DataTimes.at",
    "disclaimer": "Spelling patterns in OSM street names.",
    "families": "<p><b>Families.</b> The type word at the start of a name decides the family, in Arabic script or Latin spelling: <i>شارع</i> shari‘ (street), <i>طريق</i> tariq (road), <i>زنقة</i> zanqa (Morocco), <i>درب</i> derb, <i>نهج</i> nahj (Tunisia), <i>حارة</i> hara, <i>زقاق</i> ziqaq, <i>عطفة</i> atfa (Egypt), <i>سكة</i> sikka (Gulf), <i>ممر</i> mamarr (passage), <i>ميدان</i> midan (square). French <i>rue, avenue, boulevard, route, impasse</i> and Spanish <i>calle</i> (northern Morocco) are counted as their own families; English <i>Street / Road</i> in the last position. Names in two scripts (“Rue Ibn Sina – شارع ابن سينا”) count with the Arabic part. <b>Name only</b> = no type word at all. Diacritics and alef/ya/ta marbuta variants are normalised; road numbers, districts, roundabouts, bridges and tracks are dropped.</p>",
    "area": "<p><b>Area.</b> Morocco (with Western Sahara), Algeria, Tunisia, Libya, Mauritania, Egypt, Syria, Lebanon, Jordan, Iraq, Yemen and the Gulf states (Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman). Sudan, Palestine and Somalia are not included.</p>",
    "caveat": "<p><b>Caveat.</b> OSM names are mostly in the script the local mappers use: Arabic in Egypt, Jordan and the Gulf, French or bilingual in the Maghreb. Many streets in the Gulf and Iraq carry only numbers and are dropped, and large desert areas have almost no named streets. There is no municipality layer, so one street = one name per 5 km cell and hexagon. Names are matched by spelling, not individually verified.</p>"
   },
   "de": {
    "eyebrow": "STRASSENNAMEN IN DER ARABISCHEN WELT",
    "h1": "Shari‘, Rue, Nahj<br><span>oder Zanqa?</span>",
    "intro": "Jedes Sechseck enthält die benannten Straßen in seinem Gebiet. Die <b>Farbe</b> zeigt, welches Wort für „Straße“ überwiegt; die <b>Stärke</b> zeigt, wie viele Straßen es gibt. Beliebige zwei Namen lassen sich vergleichen. Arabische Wörter erscheinen in Umschrift; die arabische Schrift steht in den Auswahllisten.",
    "pageTitle": "Shari‘, Rue, Nahj oder Zanqa · DataTimes.at",
    "disclaimer": "Schreibweisen in OSM-Straßennamen.",
    "families": "<p><b>Familien.</b> Das Straßentyp-Wort am Anfang eines Namens bestimmt die Familie, in arabischer Schrift oder lateinischer Schreibung: <i>شارع</i> Shari‘ (Straße), <i>طريق</i> Tariq (Weg, Straße), <i>زنقة</i> Zanqa (Marokko), <i>درب</i> Derb, <i>نهج</i> Nahj (Tunesien), <i>حارة</i> Hara, <i>زقاق</i> Ziqaq, <i>عطفة</i> Atfa (Ägypten), <i>سكة</i> Sikka (Golf), <i>ممر</i> Mamarr (Passage), <i>ميدان</i> Midan (Platz). Französisch <i>rue, avenue, boulevard, route, impasse</i> und spanisch <i>calle</i> (Nordmarokko) zählen als eigene Familien; englisch <i>Street / Road</i> an letzter Stelle. Namen in zwei Schriften („Rue Ibn Sina – شارع ابن سينا“) zählen mit dem arabischen Teil. <b>Nur Name</b> = gar kein Typ-Wort. Diakritika sowie Alef-, Ya- und Ta-marbuta-Varianten werden vereinheitlicht; Straßennummern, Stadtviertel, Kreisverkehre, Brücken und Feldwege werden ausgeschlossen.</p>",
    "area": "<p><b>Gebiet.</b> Marokko (mit Westsahara), Algerien, Tunesien, Libyen, Mauretanien, Ägypten, Syrien, Libanon, Jordanien, Irak, Jemen und die Golfstaaten (Saudi-Arabien, VAE, Kuwait, Katar, Bahrain, Oman). Sudan, Palästina und Somalia sind nicht enthalten.</p>",
    "caveat": "<p><b>Hinweis.</b> OSM-Namen stehen meist in der Schrift der lokalen Kartierenden: arabisch in Ägypten, Jordanien und am Golf, französisch oder zweisprachig im Maghreb. Viele Straßen am Golf und im Irak tragen nur Nummern und entfallen, und große Wüstengebiete haben kaum benannte Straßen. Es gibt keine Gemeindeebene; eine Straße = ein Name je 5-km-Zelle und Sechseck. Namen werden nach Schreibweise zugeordnet, nicht einzeln geprüft.</p>"
   },
   "cs": {
    "disclaimer": "Vzory zápisu uličních názvů v OpenStreetMap.",
    "eyebrow": "ULIČNÍ NÁZVY V ARABSKY MLUVÍCÍM SVĚTĚ",
    "h1": "Šári‘, rue, nahj<br><span>nebo zanqa?</span>",
    "intro": "Každý šestiúhelník obsahuje pojmenované ulice na svém území. <b>Barva</b> ukazuje, které slovo pro „ulici“ převažuje; <b>sytost</b> ukazuje počet ulic. Vyberte libovolné dva názvy k porovnání. Arabská slova jsou v přepisu; arabským písmem jsou v nabídkách.",
    "pageTitle": "Šári‘, rue, nahj nebo zanqa? · DataTimes.at",
    "families": "<p><b>Rodiny.</b> O rodině rozhoduje typové slovo na začátku názvu, arabským písmem i latinkou: <i>شارع</i> šári‘ (ulice), <i>طريق</i> tarík (cesta), <i>زنقة</i> zanqa (Maroko), <i>درب</i> derb, <i>نهج</i> nahj (Tunisko), <i>حارة</i> hára, <i>زقاق</i> ziqáq, <i>عطفة</i> atfa (Egypt), <i>سكة</i> sikka (Záliv), <i>ممر</i> mamarr (průchod), <i>ميدان</i> midán (náměstí). Francouzské <i>rue, avenue, boulevard, route, impasse</i> a španělské <i>calle</i> (severní Maroko) se počítají jako vlastní rodiny; anglické <i>Street / Road</i> na posledním místě. Názvy ve dvou písmech („Rue Ibn Sina – شارع ابن سينا“) se počítají podle arabské části. <b>Jen jméno</b> = žádné typové slovo. Diakritika a varianty alif/já/tá marbúta se sjednocují; čísla silnic, čtvrti, kruhové objezdy, mosty a cesty se vynechávají.</p>",
    "area": "<p><b>Území.</b> Maroko (se Západní Saharou), Alžírsko, Tunisko, Libye, Mauritánie, Egypt, Sýrie, Libanon, Jordánsko, Irák, Jemen, státy Perského zálivu (Saúdská Arábie, SAE, Kuvajt, Katar, Bahrajn, Omán) a Západní břeh s Gazou. Súdán a Somálsko zahrnuty nejsou.</p>",
    "caveat": "<p><b>Upozornění.</b> Názvy v OSM jsou většinou v písmu, které používají místní mapovatelé: arabsky v Egyptě, Jordánsku a v Zálivu, francouzsky nebo dvojjazyčně v Maghrebu. Mnoho ulic v Zálivu a Iráku má jen čísla a vynechává se, velké pouštní oblasti mají téměř žádné pojmenované ulice. Vrstva obcí neexistuje, proto jedna ulice = jeden název na 5km buňku a šestiúhelník. Názvy se přiřazují podle zápisu, ne individuálně ověřením.</p>"
   }
  }
 },
 "us": {
  "id": "us",
  "short": {
   "en": "US & Canada",
   "de": "USA & Kanada",
   "cs": "USA a Kanada"
  },
  "size": 20,
  "defaults": {
   "a": "street",
   "b": "avenue",
   "metric": "dominant"
  },
  "dominant": [
   [
    "street",
    "#d9600f"
   ],
   [
    "avenue",
    "#2467a8"
   ],
   [
    "road",
    "#1f9d6e"
   ],
   [
    "drive",
    "#8b4fb0"
   ],
   [
    "court",
    "#c2185b"
   ],
   [
    "lane",
    "#b8860b"
   ],
   [
    "french",
    "#0097a7",
    "rue (French)"
   ]
  ],
  "plates": [
   [
    "Los Angeles",
    "la",
    "",
    "",
    "boulevard"
   ],
   [
    "Santa Fe",
    "nola",
    "",
    "",
    "spanish"
   ],
   [
    "Chicago",
    "chicago",
    "",
    "",
    "avenue"
   ],
   [
    "New York",
    "nyc",
    "",
    "",
    "avenue"
   ],
   [
    "Montréal",
    "montreal",
    "",
    "",
    "french"
   ],
   [
    "Boston",
    "boston",
    "",
    "",
    "street"
   ]
  ],
  "plateRadius": {
   "10": 6,
   "20": 12,
   "40": 24
  },
  "copy": {
   "en": {
    "eyebrow": "STREET NAMES IN THE UNITED STATES AND CANADA",
    "h1": "Street, avenue,<br><span>drive or court?</span>",
    "intro": "Every hexagon holds the named streets inside it. Its <b>colour</b> says which word for “street” dominates; its <b>strength</b> says how many streets there are. Pick any two names to compare, such as <i>boulevard</i>, <i>circle</i> or <i>trail</i>.",
    "pageTitle": "Street, Avenue, Drive or Court · DataTimes.at",
    "disclaimer": "Spelling patterns in OSM street names.",
    "families": "<p><b>Families.</b> As in the UK, the <i>last</i> word of a name decides the family (<i>Elm Street</i>, <i>Sunset Boulevard</i>, <i>Oak Hollow Court</i>); compass words and numbers after it are ignored (“Main St NW”). Spanish words at the start (<i>Calle, Camino, Paseo, Avenida…</i>) and French ones (<i>Rue, Chemin, Boulevard, Montée, Rang…</i>, mostly Québec and Louisiana) form their own families. Route designations (“County Road 12”, “US Highway 1”, “I-95”, “FM 1960”), driveways, ramps and parking aisles are dropped. Named highways such as “Pacific Coast Highway” count as <b>Highway</b>.</p>",
    "area": "<p><b>Area.</b> The 48 contiguous states and the District of Columbia, Alaska, Hawaii and Puerto Rico (shown as insets at true size), and Canada up to about 75° N. Mexico appears as grey context only.</p>",
    "caveat": "<p><b>Caveat.</b> OSM in the US and Canada includes (in the US) the TIGER road import, so suburban subdivisions are very well covered while some rural areas have unnamed roads. There is no municipality layer, so one street = one name per 5 km cell and hexagon. Names are matched by spelling, not individually verified. British Columbia comes from a full-planet extract; Nunavut is not included.</p>"
   },
   "de": {
    "eyebrow": "STRASSENNAMEN IN DEN USA UND KANADA",
    "h1": "Street, Avenue,<br><span>Drive oder Court?</span>",
    "intro": "Jedes Sechseck enthält die benannten Straßen in seinem Gebiet. Die <b>Farbe</b> zeigt, welches Wort für „Straße“ überwiegt; die <b>Stärke</b> zeigt, wie viele Straßen es gibt. Beliebige zwei Namen lassen sich vergleichen, etwa <i>Boulevard</i>, <i>Circle</i> oder <i>Trail</i>.",
    "pageTitle": "Street, Avenue, Drive oder Court · DataTimes.at",
    "disclaimer": "Schreibweisen in OSM-Straßennamen.",
    "families": "<p><b>Familien.</b> Wie im Vereinigten Königreich bestimmt das <i>letzte</i> Wort eines Namens die Familie (<i>Elm Street</i>, <i>Sunset Boulevard</i>, <i>Oak Hollow Court</i>); Himmelsrichtungen und Zahlen dahinter werden ignoriert („Main St NW“). Spanische Wörter am Anfang (<i>Calle, Camino, Paseo, Avenida …</i>) und französische (<i>Rue, Chemin, Boulevard, Montée, Rang …</i>, vor allem Québec und Louisiana) bilden eigene Familien. Routenbezeichnungen („County Road 12“, „US Highway 1“, „I-95“, „FM 1960“), Zufahrten, Rampen und Parkplatzwege werden ausgeschlossen. Benannte Highways wie „Pacific Coast Highway“ zählen als <b>Highway</b>.</p>",
    "area": "<p><b>Gebiet.</b> Die 48 zusammenhängenden Bundesstaaten und der District of Columbia, Alaska, Hawaii und Puerto Rico (als Ausschnitte in wahrer Größe) sowie Kanada bis etwa 75° N. Mexiko erscheint nur als graue Umgebung.</p>",
    "caveat": "<p><b>Hinweis.</b> OSM in den USA enthält den TIGER-Straßenimport; Wohnsiedlungen sind daher sehr gut erfasst, während manche ländliche Straßen namenlos sind. Es gibt keine Gemeindeebene; eine Straße = ein Name je 5-km-Zelle und Sechseck. Namen werden nach Schreibweise zugeordnet, nicht einzeln geprüft. British Columbia stammt aus einem Gesamtauszug; Nunavut ist nicht enthalten.</p>"
   },
   "cs": {
    "disclaimer": "Vzory zápisu uličních názvů v OpenStreetMap.",
    "eyebrow": "ULIČNÍ NÁZVY VE SPOJENÝCH STÁTECH A KANADĚ",
    "h1": "Street, avenue,<br><span>drive nebo court?</span>",
    "intro": "Každý šestiúhelník obsahuje pojmenované ulice na svém území. <b>Barva</b> ukazuje, které slovo pro „ulici“ převažuje; <b>sytost</b> ukazuje počet ulic. Vyberte libovolné dva názvy, třeba <i>boulevard</i>, <i>circle</i> nebo <i>trail</i>.",
    "pageTitle": "Street, avenue, drive nebo court? · DataTimes.at",
    "families": "<p><b>Rodiny.</b> Jako ve Velké Británii rozhoduje <i>poslední</i> slovo názvu (<i>Elm Street</i>, <i>Sunset Boulevard</i>, <i>Oak Hollow Court</i>); světové strany a čísla za ním se ignorují („Main St NW“). Španělská slova na začátku (<i>Calle, Camino, Paseo, Avenida…</i>) a francouzská (<i>Rue, Chemin, Boulevard, Montée, Rang…</i>, hlavně Québec a Louisiana) tvoří vlastní rodiny. Označení tras („County Road 12“, „US Highway 1“, „I-95“, „FM 1960“), příjezdové cesty, rampy a parkovací uličky se vynechávají. Pojmenované dálnice jako „Pacific Coast Highway“ se počítají jako <b>Highway</b>.</p>",
    "area": "<p><b>Území.</b> 48 spojených států a District of Columbia, Aljaška, Havaj (jako výřez v měřítku) a Portoriko na svém místě, a Kanada zhruba do 75° s. š. Mexiko je jen šedým kontextem.</p>",
    "caveat": "<p><b>Upozornění.</b> OSM v USA a Kanadě zahrnuje (v USA) import silnic TIGER, takže předměstské čtvrti jsou pokryté velmi dobře, zatímco některé venkovské oblasti mají nepojmenované silnice. Vrstva obcí neexistuje, proto jedna ulice = jeden název na 5km buňku a šestiúhelník. Názvy se přiřazují podle zápisu, ne individuálně ověřením. Britská Kolumbie pochází z výřezu celé planety; Nunavut není zahrnut.</p>"
   }
  }
 }
};
const REGION_ORDER=["dach","spain","uk_ie","lat_am","arabic","us"];
