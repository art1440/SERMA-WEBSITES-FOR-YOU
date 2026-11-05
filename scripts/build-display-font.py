"""Build the display font used for headlines.

Source: Bricolage Grotesque (SIL Open Font License 1.1, no Reserved Font Name),
latin subset from @fontsource-variable/bricolage-grotesque.

The full variable font has three axes (opsz, wght, wdth) and weighs about 130 KB.
Headlines only ever use the 96 pt optical size, one width, and weights 600 to 800,
so we pin those axes. The result keeps the display character at a fraction of the size.

Run with:  python -m pip install fonttools brotli && python scripts/build-display-font.py
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2"
OUT = ROOT / "src/assets/fonts/bricolage-display-latin.woff2"

font = TTFont(SRC)
instantiateVariableFont(font, {"opsz": 96, "wdth": 90, "wght": (600, 800)}, inplace=True)
font.flavor = "woff2"
OUT.parent.mkdir(parents=True, exist_ok=True)
font.save(OUT)
print(f"{OUT.relative_to(ROOT)}: {OUT.stat().st_size / 1024:.1f} KB")
