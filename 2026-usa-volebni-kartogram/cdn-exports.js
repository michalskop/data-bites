"use strict";

// Embed CDN media in downloaded SVGs so the exported charts remain portable.
const svgAssetData = new Map();
async function embedSvgAssets(svg) {
  const urls = [...new Set(svg.match(/https:\/\/media\.datatimes\.org\/[a-zA-Z0-9/_.-]+/g) || [])];
  const values = await Promise.all(urls.map(url => {
    if (!svgAssetData.has(url)) {
      const pending = fetch(url, {mode: "cors", credentials: "omit", cache: "reload"}).then(async response => {
        if (!response.ok) throw new Error(`Export asset failed: ${response.status}`);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      }).catch(error => {svgAssetData.delete(url); throw error;});
      svgAssetData.set(url, pending);
    }
    return svgAssetData.get(url);
  }));
  urls.forEach((url, index) => {svg = svg.split(url).join(values[index]);});
  return svg;
}
