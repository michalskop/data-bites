#!/usr/bin/env python3
"""Build a distinct Data Bites badge favicon in the DataTimes family; never uploads."""

import argparse
import io
from pathlib import Path

import cairosvg
from PIL import Image
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--font", type=Path, default=Path.home() / ".local/share/fonts/roboto_slab/RobotoSlab-VariableFont_wght.ttf")
    args = parser.parse_args()
    if not args.font.is_file():
        parser.error("Provide the Roboto Slab font with --font <path>")
    target = ROOT / "assets" / "site-local"
    target.mkdir(parents=True, exist_ok=True)
    font = TTFont(args.font)
    if "fvar" in font:
        font = instantiateVariableFont(font, {"wght": 700}, inplace=False)
    glyphs = font.getGlyphSet()
    glyph = glyphs[font.getBestCmap()[ord("B")]]
    bounds = BoundsPen(glyphs)
    glyph.draw(bounds)
    x0, y0, x1, y1 = bounds.bounds
    scale = min(76 / (x1 - x0), 84 / (y1 - y0))
    x = 64 - scale * (x0 + x1) / 2
    y = 64 + scale * (y0 + y1) / 2
    outline = SVGPathPen(glyphs)
    glyph.draw(outline)
    # Match the Sněmovna/Města badge, with a fully inset, font-independent initial.
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">\n'
        '  <title>Data Bites</title>\n'
        '  <path fill="#de1743" d="M36 8H120V92Q120 120 92 120H36Q8 120 8 92V36Q8 8 36 8Z"/>\n'
        f'  <path fill="#fff" transform="matrix({scale:.8f} 0 0 {-scale:.8f} {x:.8f} {y:.8f})" d="{outline.getCommands()}"/>\n'
        '</svg>\n'
    )
    source = target / "favicon-bites-v2.svg"
    source.write_text(svg)
    font.close()
    raster = cairosvg.svg2png(bytestring=svg.encode(), output_width=256, output_height=256)
    with Image.open(io.BytesIO(raster)) as icon:
        icon = icon.convert("RGBA")
        icon.save(ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
        touch = Image.new("RGBA", (180, 180), "white")
        mark = icon.resize((140, 140), Image.Resampling.LANCZOS)
        touch.alpha_composite(mark, (20, 20))
        touch.convert("RGB").save(target / "apple-touch-icon-bites-v2.png", optimize=True)
    print("Built assets/site-local/favicon-bites-v2.svg, favicon.ico, and assets/site-local/apple-touch-icon-bites-v2.png")
    print("Local preview only. No uploads or deployment.")


if __name__ == "__main__":
    main()
