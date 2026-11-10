"use strict";
// Immutable CDN media (see README.md and ../media-assets.json).
const MEDIA = "https://media.datatimes.org/databites-dtcz/2026-jak-rikame-ulici/";
const REGIONS = [
  {id: "dach", name: "Německy mluvící Evropa", words: "Gasse, Straße, Weg…", area: "Německo, Rakousko, Lichtenštejnsko, německy mluvící Švýcarsko, Jižní Tyrolsko a německy mluvící Belgie",
   text: "Vídeňská Gasse proti severoněmecké Straße: uličku od ulice dělí hranice dialektů i století, kdy města vznikala."},
  {id: "spain", name: "Španělsko a Andorra", words: "calle, carrer, kalea, rúa…", area: "Pevninské Španělsko, Baleáry, Kanárské ostrovy, Ceuta, Melilla a Andorra",
   text: "Kastilská calle, katalánské carrer, baskická kalea a galicijská rúa. Jazykové hranice jsou na mapě vidět skoro jako na politické."},
  {id: "uk_ie", name: "Velká Británie a Irsko", words: "street, road, close, gate, wynd…", area: "Velká Británie, Severní Irsko a Irsko",
   text: "Od yorkských gate přes skotské wynd a close až po londýnské street. Keltské jazyky se ukazují v názvech ulic dodnes."},
  {id: "lat_am", name: "Latinská Amerika", words: "calle, carrera, jirón, pasaje, privada…", area: "Španělsky mluvící země Střední a Jižní Ameriky, Kuba a Dominikánská republika; Brazílie je jen obrys",
   text: "Kolumbijské carreras, peruánské jirones, mexické privadas a argentinské ulice, které slovo „calle“ často vynechají úplně."},
  {id: "arabic", name: "Arabský svět", words: "šári‘, rue, nahj, zanqa, derb, hára…", area: "Maghreb, Egypt, Levanta včetně Západního břehu a Gazy, Irák, státy Zálivu a Jemen",
   text: "Šári‘ na východě, francouzské rue a avenue v Maghrebu, derb a zanqa v úzkých uličkách starých měst."},
  {id: "us", name: "USA a Kanada", words: "street, avenue, road, drive, court, lane, rue…", area: "Kontinentální USA, Aljaška, Havaj (jako výřez), Portoriko a Kanada",
   text: "Street ve městech, road na venkově, drive a court na předměstích a francouzské rue v Québecu."},
].map(r => ({...r, image: `${MEDIA}ulice-${r.id}-v1.webp`, png: `${MEDIA}ulice-${r.id}-v1.png`, thumb: `${MEDIA}thumb-${r.id}-v1.webp`}));

const $ = id => document.getElementById(id);
const list = $("region-list");
let current = null;
for (const r of REGIONS) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "format-button"; b.dataset.id = r.id; b.setAttribute("aria-pressed", "false");
  b.innerHTML = `<span class="format-thumbnail"><img src="${r.thumb}" alt="" loading="lazy" width="480"></span><span class="format-info"><span class="format-name">${r.name}</span><span class="format-variant">${r.words}</span></span>`;
  b.addEventListener("click", () => select(r.id, true));
  list.append(b);
}
function select(id, hash) {
  const r = REGIONS.find(x => x.id === id) || REGIONS[0];
  if (r.id === current) return;
  current = r.id;
  $("map-img").src = r.image; $("map-img").alt = `Mapa názvů ulic: ${r.name}`;
  $("map-link").href = r.png;
  $("selected-title").textContent = r.name; $("selected-words").textContent = r.words;
  $("selected-text").textContent = r.text; $("selected-area").textContent = r.area;
  $("download-png").href = r.png; $("download-png").setAttribute("download", `ulice-${r.id}.png`);
  for (const b of list.children) b.setAttribute("aria-pressed", String(b.dataset.id === r.id));
  if (hash) history.replaceState(null, "", `#${r.id}`);
}
window.addEventListener("hashchange", () => select(location.hash.slice(1)));
select(location.hash.slice(1) || "dach");
