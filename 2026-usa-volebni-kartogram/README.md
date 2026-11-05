# Když místo rozlohy rozhodují hlasy

Finished viewer copied from `/home/michal/dev/ai/data-at/30days/03/output/index.html`
on 5 November 2026. The original English article and interactive controls are
preserved; the Data Bites catalog introduces it in Czech.

The frozen 2026 House snapshot is 4 November 2026, 22:12:10 UTC. It is preliminary,
not a live feed. The comparison uses 2024 presidential votes retabulated onto the
same 435 House district boundaries. Cartogram area represents the absolute D–R
vote difference, not a percentage or the previous House election.

Serve the repository with `python3 scripts/preview.py --port 8004` and open
`/2026-usa-volebni-kartogram/`. District data, shapes and precomputed layouts are
embedded in the viewer. Fonts, raster images, the square video and its poster use
verified immutable CDN URLs recorded in the root media manifest. Local media
copies are Git-ignored. SVG downloads embed their CDN assets on demand; other
data downloads remain generated locally in the browser.

`SOURCE.md` preserves upstream reproduction and interpretation notes; paths there
refer to the original project. `data-dictionary.md`, the two source manifests and
`validation.json` document the snapshot, presidential comparison and geometry
checks. Third-party licenses remain embedded in the HTML. Refresh from upstream
deliberately and retain the CDN links, export handling, favicon, social metadata
and catalog navigation. Publish changed media at a new revision key.
