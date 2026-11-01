"use strict";

const gallery = window.TRAIN_GALLERY;
const video = document.getElementById("preview-video");
const list = document.getElementById("format-list");
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
  button.setAttribute("aria-label", `${format.name}, ${format.ratio}, ${format.platforms}`);
  button.innerHTML = `<span class="format-thumbnail"><img src="${format.poster}" alt="" loading="lazy" width="${format.width}" height="${format.height}"></span>
    <span class="format-info"><span class="format-name">${format.name}<span class="format-ratio">${format.ratio}</span></span>
    <span class="format-size">${number.format(format.width)} × ${number.format(format.height)} px</span></span>`;
  button.addEventListener("click", () => selectFormat(format.id, true));
  list.append(button);
}

function selectFormat(id, updateHash = false) {
  const format = gallery.formats.find(item => item.id === id) || gallery.formats.find(item => item.id === gallery.defaultFormat);
  if (format.id === selected) return;
  const previousTime = video.currentTime || 0;
  const wasPlaying = !video.paused;
  video.pause();
  video.onloadedmetadata = null;
  selected = format.id;
  video.poster = format.poster;
  video.src = format.video;
  video.preload = previousTime > 0 || wasPlaying ? "metadata" : "none";
  video.setAttribute("aria-label", `Vlaky v Česku — ${format.title}, ${format.ratio}`);
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
  for (const button of list.children) {
    button.setAttribute("aria-pressed", String(button.dataset.format === format.id));
  }
  if (updateHash) history.replaceState(null, "", `#${format.id}`);
}

video.addEventListener("error", () => {
  document.getElementById("video-error").hidden = false;
});
window.addEventListener("hashchange", () => selectFormat(location.hash.slice(1)));
selectFormat(location.hash.slice(1) || gallery.defaultFormat);
