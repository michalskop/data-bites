"use strict";

// Cross-origin download attributes alone do not force a browser download.
document.addEventListener("click", async event => {
  const link = event.target.closest("a[download]");
  if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href, location.href);
  if (url.origin === location.origin || url.origin !== "https://media.datatimes.org") return;
  event.preventDefault();
  if (link.dataset.downloading) return;
  link.dataset.downloading = "true";
  link.setAttribute("aria-busy", "true");
  const label = link.innerHTML;
  link.textContent = "Stahuji…";
  const status = document.getElementById("download-status");
  if (status) status.hidden = true;
  try {
    const response = await fetch(url, {mode: "cors", credentials: "omit"});
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blob = await response.blob();
    if (!blob.size) throw new Error("Empty download");
    const objectUrl = URL.createObjectURL(blob);
    const download = document.createElement("a");
    download.href = objectUrl;
    download.download = link.download || decodeURIComponent(url.pathname.split("/").pop());
    download.hidden = true;
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch (error) {
    if (status) {
      status.textContent = "Soubor se nepodařilo stáhnout. Zkuste stahování znovu nebo video otevřete v nové kartě a uložte z nabídky prohlížeče.";
      status.hidden = false;
    }
  } finally {
    link.innerHTML = label;
    link.removeAttribute("aria-busy");
    delete link.dataset.downloading;
  }
});
