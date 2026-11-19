# T7 — Real light-theme film (planner: orchestrator)

## Goal
Stop inverting the architecture film in the browser every frame. Ship a pre-rendered light version and pick the
file by colour scheme; delete the hero film files T4 orphaned.

## Context
- After T4 the only filtered film is the architecture film in `src/components/three/Stage.tsx` (`FILM_LIGHT`, ≈line 16,
  applied ≈line 149): `filter: invert(1) hue-rotate(180deg) saturate(0.85) brightness(1.04)` in light, `none` in dark.
  A CSS filter on a full-screen video is re-run on every decoded frame.
- Sources: `public/media/architecture-v2.{webm,mp4}` + `architecture-v2-poster.jpg`.
- Orphaned since T4 (owner chose to cut the hero film): `public/media/hero-v2.{webm,mp4}`, `hero-v2-film-poster.jpg`
  (≈1.65 MB). `hero-v2-poster.jpg` is STILL USED (HeroChapter reduced-motion stand-in) — keep it.
- The colour scheme hook is `src/lib/useColorScheme.ts`; check how other code reads it (e.g. LightThreads' `scheme`).

## Files
- `public/media/architecture-v2-light.webm`, `architecture-v2-light.mp4`, `architecture-v2-light-poster.jpg` (new)
- `src/components/three/Stage.tsx`
- delete `public/media/hero-v2.webm`, `hero-v2.mp4`, `hero-v2-film-poster.jpg` (only after grepping `src/`, `public/`,
  `next.config.ts`, `netlify.toml` and `src/app` metadata to prove they're unreferenced)

## Steps
1. Probe the source with ffprobe (codec, size, fps, duration, pixel format, bitrate) and match it in the outputs:
   same resolution/fps/duration, VP9 webm and H.264 mp4 (`-pix_fmt yuv420p -movflags +faststart`), no audio,
   file sizes within ~±25% of the originals. The loop must stay seamless (same frame count; no fades added).
2. Bake the look with ffmpeg so it matches the CSS filter as closely as possible: invert → hue-rotate 180° →
   saturate 0.85 → brightness ×1.04. CSS `hue-rotate` is a luminance-preserving matrix, not HSL hue, so prefer
   `colorchannelmixer` with the CSS hue-rotate(180°) matrix (compute the 3×3 from the CSS Filter Effects spec), then
   the saturate(0.85) matrix, then ×1.04 brightness, after `negate`. Render the poster from the light video's first frame.
3. Verify the bake: screenshot the page with the CSS filter (current) and with the light file + `filter: none`, same
   frame (poster) — mean per-channel difference ≤ 4/255 over the film area.
4. Stage.tsx: pick `/media/architecture-v2-light` + its poster in light, `/media/architecture-v2` in dark, via the
   existing colour-scheme hook; remove `FILM_LIGHT` and its class. Switching theme must swap the source without a
   blank flash longer than the existing fade (keep both `<video>` elements mounted and cross-fade opacity, OR swap
   `src` while the film is at opacity 0 — choose the cheaper one and say why).
5. Delete the orphaned hero film files once proven unreferenced.
6. `npx tsc --noEmit`. Never `next build`.

## Acceptance criteria
1. No `invert(` / `hue-rotate(` filter remains on any video (`grep` + computed style on the film element).
2. Light and dark: the architecture film shows behind the hero's first screen with the same look as before (screenshot
   diff ≤ 4/255 mean in light; identical in dark).
3. Theme toggle while the film is visible: correct file, no stall, no blank frame beyond the film's own fade.
4. Only one film decodes at a time if you keep two elements (the hidden one paused, `preload="none"` or not mounted).
5. Pause animations still pauses the film; reduced motion still shows no film.
6. Orphan files gone; nothing 404s (check the network log on Home, light and dark).

## Risks
- Colour mismatch from the hue-rotate maths: verify numerically (AC2), don't eyeball.
- Two `<video>` elements could double decode cost: AC4.
