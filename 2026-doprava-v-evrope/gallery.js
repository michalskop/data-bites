"use strict";

const gallery = window.COUNTRY_GALLERY;
const video = document.getElementById("preview-video");
const list = document.getElementById("format-list");
const regionList = document.getElementById("region-list");
const number = new Intl.NumberFormat("cs-CZ");
const fileSize = bytes => `${(bytes / 1e6).toLocaleString("cs-CZ", {maximumFractionDigits: 1})} MB`;
let selected = null;
let selectedRegion = null;

for (const region of gallery.regions) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "region-button";
  button.dataset.region = region.id;
  button.disabled = region.status !== "ready";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-controls", "format-list");
  const count = region.videoCount;
  const label = count === 1 ? "1 video" : count < 5 ? `${count} videa` : `${count} videí`;
  button.innerHTML = `<span class="region-name">${region.name}</span><span class="region-info">${region.type} · ${button.disabled ? "Připravujeme" : label}</span>`;
  button.addEventListener("click", () => selectFormat(region.id, true));
  regionList.append(button);
}

function renderVariants(region) {
  list.replaceChildren();
  for (const format of gallery.formats.filter(item => item.region === region.id)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "format-button";
    button.dataset.format = format.id;
    button.setAttribute("aria-controls", "preview-video");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `${region.name}, ${format.name}, ${format.variantLabel}, ${format.ratio}`);
    button.innerHTML = `<span class="format-thumbnail"><img src="${format.poster}" alt="" loading="lazy" width="${format.width}" height="${format.height}"></span>
      <span class="format-info"><span class="format-name">${format.name}<span class="format-ratio">${format.ratio}</span></span>
      <span class="format-variant">${format.period} · ${format.displayDate}</span><span class="format-size">${number.format(format.width)} × ${number.format(format.height)} px</span></span>`;
    button.addEventListener("click", () => selectFormat(format.id, true));
    list.append(button);
  }
  document.getElementById("variants-heading").textContent = region.name;
  document.getElementById("format-count").textContent = number.format(list.children.length);
  document.getElementById("selected-area").textContent = region.name;
  document.getElementById("transport-legend").replaceChildren();
  for (const mode of region.modes) {
    const label = document.createElement("span");
    label.className = "mode-label";
    const dot = document.createElement("i");
    dot.className = "legend-dot mode-dot";
    dot.style.setProperty("--mode-color", mode.color);
    label.append(dot, document.createTextNode(mode.name));
    document.getElementById("transport-legend").append(label);
  }
  for (const button of regionList.children) {
    button.setAttribute("aria-pressed", String(button.dataset.region === region.id));
  }
}

function selectFormat(id, updateHash = false) {
  const format = gallery.formats.find(item => item.id === id)
    || gallery.formats.find(item => item.region === id)
    || gallery.formats.find(item => item.id === gallery.defaultFormat);
  if (format.id === selected) return;
  const previous = gallery.formats.find(item => item.id === selected);
  const sameWindow = previous && previous.region === format.region && previous.date === format.date
    && previous.startHour === format.startHour && previous.endHour === format.endHour && previous.duration === format.duration;
  const previousTime = sameWindow ? video.currentTime || 0 : 0;
  const wasPlaying = !video.paused;
  video.pause();
  video.onloadedmetadata = null;
  selected = format.id;
  if (selectedRegion !== format.region) {
    renderVariants(gallery.regions.find(region => region.id === format.region));
    selectedRegion = format.region;
  }
  video.poster = format.poster;
  video.src = format.video;
  video.preload = previousTime > 0 || wasPlaying ? "metadata" : "none";
  video.setAttribute("aria-label", `${format.regionName} — ${format.name}, ${format.variantLabel}`);
  if (previousTime > 0 || wasPlaying) {
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(previousTime, Math.max(0, video.duration - .1));
      if (wasPlaying) video.play().catch(() => {});
      video.onloadedmetadata = null;
    };
  }
  video.load();
  const text = {
    "selected-kicker": `${format.regionName} · ${format.ratio}`,
    "selected-title": format.name,
    "selected-description": format.description,
    "selected-platforms": format.platforms,
    "selected-resolution": `${number.format(format.width)} × ${number.format(format.height)} px`,
    "selected-ratio": format.ratio,
    "selected-file": `MP4 · ${fileSize(format.bytes)}`,
    "selected-date": format.displayDate,
    "selected-window": format.period,
    "selected-period": format.variantLabel,
    "selected-poster-note": format.posterNote,
    "selected-duration": `${number.format(format.duration)} s`,
    "selected-audio": format.audio ? "Se zvukem" : "Bez zvuku",
    "selected-source": `Zdroj: ${format.source}`,
    "selected-language": format.language,
    "selected-coverage": format.coverage,
  };
  for (const [id, value] of Object.entries(text)) document.getElementById(id).textContent = value;
  document.getElementById("download-video").href = format.video;
  document.getElementById("download-poster").href = format.poster;
  document.getElementById("open-video").href = format.video;
  document.getElementById("video-error").hidden = true;
  for (const button of list.children) {
    button.setAttribute("aria-pressed", String(button.dataset.format === format.id));
  }
  if (updateHash) history.replaceState(null, "", `#${format.id}`);
}

const ready = gallery.regions.filter(region => region.status === "ready");
const pending = gallery.regions.filter(region => region.status !== "ready");
document.getElementById("video-count").textContent = number.format(gallery.formats.length);
document.getElementById("region-count").textContent = number.format(ready.filter(region => region.kind === "country").length);
document.getElementById("gallery-summary").textContent = `${number.format(ready.filter(region => region.kind === "country").length)} zemí + Vídeň · ${number.format(gallery.formats.length)} videí`;
document.getElementById("pending-note").hidden = pending.length === 0;
document.getElementById("pending-note").textContent = `Připravujeme: ${pending.map(region => region.name).join(", ")}.`;
video.addEventListener("error", () => document.getElementById("video-error").hidden = false);
window.addEventListener("hashchange", () => selectFormat(location.hash.slice(1)));
selectFormat(location.hash.slice(1) || gallery.defaultFormat);
