# Credits and licenses

Every third-party asset on the site is listed here with its license. Only assets that are free for commercial use (CC0, OFL, MIT, or owned by us) are allowed.

## Fonts

| Font | Use | License | Source | Notes |
|---|---|---|---|---|
| Bricolage Grotesque | Display headlines | SIL Open Font License 1.1 (no Reserved Font Name) | [ateliertriay/bricolage](https://github.com/ateliertriay/bricolage), via `@fontsource-variable/bricolage-grotesque` | Instanced at build time to the 96 pt optical size, 90% width, weights 600 to 800 (`scripts/build-display-font.py`). License: `src/assets/fonts/OFL-BricolageGrotesque.txt` |
| Geist | Body text | SIL Open Font License 1.1 | [vercel/geist-font](https://github.com/vercel/geist-font), via `@fontsource-variable/geist` | Latin subset, unmodified. License: `src/assets/fonts/OFL-Geist.txt` |

## 3D models

None yet. Concept C builds every shape in code. Any future model must be CC0 or owned, compressed (Draco or Meshopt), and listed here.

## Images and icons

- Icons: drawn in-house (`src/components/Icon.astro`).
- Poster art and tiles: built in CSS, no image files.
- Client screenshots: none yet. Only real client sites, with their permission, will be added.

## Code libraries (shipped to visitors)

| Library | License |
|---|---|
| Astro (build tool, ships no runtime on static pages) | MIT |
| Three.js 0.187 (hero 3D, loaded only on capable devices) | MIT |

Phase 4 may add GSAP (free for commercial use) and Lenis (MIT) for scroll motion.
