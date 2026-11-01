"use strict";

const gallery = window.BIKE_GALLERY;
const video = document.getElementById("preview-video");
const list = document.getElementById("format-list");
const editions = document.getElementById("edition-list");
const number = new Intl.NumberFormat("cs-CZ");
const fileSize = bytes => `${(bytes / 1e6).toLocaleString("cs-CZ", {maximumFractionDigits: 1})} MB`;
let selected = null;

for (const format of gallery.formats) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "format-button";
  button.dataset.format = format.id;
  button.setAttribute("aria-controls", "preview-video");
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `${format.name}, ${format.ratio}, ${format.variantLabel}, ${format.platforms}`);
  button.innerHTML = `<span class="format-thumbnail"><img src="${format.poster}" alt="" loading="lazy" width="${format.width}" height="${format.height}"></span>
    <span class="format-info"><span class="format-name">${format.name}<span class="format-ratio">${format.ratio}</span></span>
    <span class="format-variant">${format.variantLabel}</span>
    <span class="format-size">${number.format(format.width)} × ${number.format(format.height)} px</span></span>`;
  button.addEventListener("click", () => selectFormat(format.id, true));
  (format.group === "editions" ? editions : list).append(button);
}

function selectFormat(id, updateHash = false) {
  const format = gallery.formats.find(item => item.id === id) || gallery.formats.find(item => item.id === gallery.defaultFormat);
  if (format.id === selected) return;
  const previous = gallery.formats.find(item => item.id === selected);
  const sameWindow = previous && previous.date === format.date && previous.startHour === format.startHour && previous.endHour === format.endHour && previous.duration === format.duration;
  const previousTime = sameWindow ? video.currentTime || 0 : 0;
  const wasPlaying = !video.paused;
  video.pause();
  video.onloadedmetadata = null;
  selected = format.id;
  video.poster = format.poster;
  video.src = format.video;
  video.preload = previousTime > 0 || wasPlaying ? "metadata" : "none";
  video.setAttribute("aria-label", `${gallery.title} — ${format.title}, ${format.ratio}, ${format.variantLabel}`);
  if (previousTime > 0 || wasPlaying) {
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(previousTime, Math.max(0, video.duration - .1));
      if (wasPlaying) video.play().catch(() => {});
      video.onloadedmetadata = null;
    };
  }
  video.load();
  document.getElementById("selected-kicker").textContent = `${format.category} · ${format.ratio}`;
  document.getElementById("selected-title").textContent = format.title;
  document.getElementById("selected-description").textContent = format.description;
  document.getElementById("selected-platforms").textContent = format.platforms;
  document.getElementById("selected-resolution").textContent = `${number.format(format.width)} × ${number.format(format.height)} px`;
  document.getElementById("selected-ratio").textContent = format.ratio;
  document.getElementById("selected-file").textContent = `MP4 · ${fileSize(format.bytes)}`;
  document.getElementById("download-video").href = format.video;
  document.getElementById("download-poster").href = format.poster;
  document.getElementById("open-video").href = format.video;
  document.getElementById("video-error").hidden = true;
  document.getElementById("selected-date").textContent = format.displayDate;
  document.getElementById("selected-window").textContent = format.period;
  document.getElementById("selected-period").textContent = format.variantLabel;
  document.getElementById("selected-poster-note").textContent = format.posterNote;
  document.getElementById("selected-duration").textContent = `${number.format(format.duration)} s`;
  document.getElementById("selected-audio").textContent = format.audio ? "Se zvukem" : "Bez zvuku";
  for (const button of document.querySelectorAll(".format-button")) {
    button.setAttribute("aria-pressed", String(button.dataset.format === format.id));
  }
  if (updateHash) history.replaceState(null, "", `#${format.id}`);
}

video.addEventListener("error", () => {
  document.getElementById("video-error").hidden = false;
});
window.addEventListener("hashchange", () => selectFormat(location.hash.slice(1)));
document.getElementById("video-count").textContent = number.format(gallery.formats.length);
document.getElementById("format-count").textContent = number.format(list.children.length);
document.getElementById("edition-count").textContent = number.format(editions.children.length);
document.getElementById("gallery-summary").textContent = `Celkem ${number.format(gallery.formats.length)} videí — všechny dostupné verze jsou níže.`;
const days = new Set(gallery.formats.map(format => format.date)).size;
const dayUnit = days === 1 ? "den" : days < 5 ? "dny" : "dní";
document.getElementById("day-count").textContent = `${days} ${dayUnit}`;
const durations = gallery.formats.map(format => format.duration);
const minimum = Math.min(...durations), maximum = Math.max(...durations);
document.getElementById("duration-fact").textContent = minimum === maximum ? `${number.format(minimum)} s` : `${number.format(minimum)}–${number.format(maximum)} s`;
document.getElementById("editions-section").hidden = editions.children.length === 0;
const primaryDates = [...new Set(gallery.formats.filter(format => format.group === "formats").map(format => format.displayDate))];
document.getElementById("format-subtitle").textContent = `${primaryDates.join(" · ")} · celý den`;
selectFormat(location.hash.slice(1) || gallery.defaultFormat);
