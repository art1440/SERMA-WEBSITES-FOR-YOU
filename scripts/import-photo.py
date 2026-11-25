#!/usr/bin/env python3
"""Turn a downloaded photo into the demo-site pair: <name>-v1.webp + <name>-v1-640.webp.

    python3 -I scripts/import-photo.py SRC OUT_DIR NAME [--max 1600] [--crop 4:5] [--focus 0.5,0.4] [--grade warm|cool|none]

  SRC      a local JPEG/PNG (download it first, e.g. with curl, into its own scratch folder)
  OUT_DIR  e.g. public/media/work/barbershop
  NAME     file stem, e.g. chair  ->  chair-v1.webp, chair-v1-640.webp
  --max    longest edge of the large file (default 1600)
  --crop   crop to an aspect ratio W:H before resizing (default: keep the photo's own)
  --focus  crop centre as x,y fractions (default 0.5,0.5)
  --grade  a light, consistent colour grade so stock photos sit with each other

Prints "NAME WIDTH HEIGHT" for the large file (use those in demoImage(...)).

    python3 -I scripts/import-photo.py contact OUT.jpg FILE [FILE ...]

Builds a labelled contact sheet (4 across) of candidate photos so they can be
compared side by side before choosing.

Needs Pillow with WebP support. Metadata (EXIF, GPS) is never written out.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageOps


def grade(im: Image.Image, mode: str) -> Image.Image:
    if mode == "none":
        return im
    im = ImageEnhance.Contrast(im).enhance(1.04)
    im = ImageEnhance.Color(im).enhance(0.92)
    r, g, b = im.split()
    if mode == "warm":
        r = r.point(lambda v: min(255, int(v * 1.03 + 2)))
        b = b.point(lambda v: int(v * 0.95))
    elif mode == "cool":
        r = r.point(lambda v: int(v * 0.97))
        b = b.point(lambda v: min(255, int(v * 1.03 + 2)))
    return Image.merge("RGB", (r, g, b))


def crop_to(im: Image.Image, ratio: str, focus: tuple[float, float]) -> Image.Image:
    w_r, h_r = (float(x) for x in ratio.split(":"))
    target = w_r / h_r
    w, h = im.size
    if w / h > target:  # too wide: trim the sides
        nw = int(h * target)
        cx = int(focus[0] * w)
        left = max(0, min(w - nw, cx - nw // 2))
        return im.crop((left, 0, left + nw, h))
    nh = int(w / target)
    cy = int(focus[1] * h)
    top = max(0, min(h - nh, cy - nh // 2))
    return im.crop((0, top, w, top + nh))


def fit(im: Image.Image, longest: int) -> Image.Image:
    w, h = im.size
    s = min(1.0, longest / max(w, h))
    return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im


def import_photo(argv: list[str]) -> None:
    src, out_dir, name = argv[0], Path(argv[1]), argv[2]
    opts = dict(zip(argv[3::2], argv[4::2]))
    longest = int(opts.get("--max", 1600))
    focus = tuple(float(x) for x in opts.get("--focus", "0.5,0.5").split(","))
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if "--crop" in opts:
        im = crop_to(im, opts["--crop"], focus)  # type: ignore[arg-type]
    im = grade(im, opts.get("--grade", "none"))
    big = fit(im, longest)
    small = big.resize((640, round(big.height * 640 / big.width)), Image.LANCZOS) if big.width > 640 else big
    out_dir.mkdir(parents=True, exist_ok=True)
    big.save(out_dir / f"{name}-v1.webp", "WEBP", quality=80, method=6)
    small.save(out_dir / f"{name}-v1-640.webp", "WEBP", quality=78, method=6)
    print(name, big.width, big.height)


def contact(argv: list[str]) -> None:
    out, files = argv[0], argv[1:]
    cell, cols = 360, 4
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (cell + 12) + 12, rows * (cell + 40) + 12), "white")
    draw = ImageDraw.Draw(sheet)
    for k, f in enumerate(files):
        im = ImageOps.exif_transpose(Image.open(f)).convert("RGB")
        im.thumbnail((cell, cell))
        x, y = 12 + (k % cols) * (cell + 12), 12 + (k // cols) * (cell + 40)
        sheet.paste(im, (x, y))
        draw.text((x, y + cell + 6), f"{k}: {Path(f).stem[:40]}", fill="black")
    sheet.save(out, quality=82)
    print(out, sheet.size)


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
    elif args[0] == "contact":
        contact(args[1:])
    else:
        import_photo(args)
