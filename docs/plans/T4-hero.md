# T4 — Hero ends on a beat, not a void (planner: Opus)

## Verdict first
- **Where the void is.** It is not "too much track". The last beat *leaves before the track does*.
  - The statement flies past the camera at p 0.84–0.97. The film fades at 0.86–0.97.
  - The sticky stage is then released with nothing on it. The visitor scrolls about 100vh of sky and sculpture until the footer covers it.
  - That is the ~75% mark.
  - The fix is structural: **the statement must be at rest when the sticky stage releases**. Normal scroll then carries it away like any other content, with the footer directly behind it.
- **Section height: 150vh, not 140vh.**
  - The track shrinks from 80vh to 50vh (−37.5% pinned scroll), and the void is gone entirely.
  - At 140vh (a 40vh track) the headline shear would have to play about 25% faster per pixel, and a three-notch wheel flick would cross the whole hero.
  - At 150vh the shear keeps today's exact pace (about 26vh). That shear is the moment we're told to protect.
  - All ranges below are in p (track-relative). If the Inspector wants 140vh anyway, change only the height class. The proportions hold.
- **The hero-film "dive": cut it.**
  - **Light theme.** The runtime negative turns the line-art into grey-filled boxes that sit right behind the statement's italic line. On a 390px phone, the calendar grid sits directly behind the statement.
  - **What it costs.** A full-viewport video under scale + rotateX + rotateZ, plus a four-function CSS filter and an overlay, visible for 49vh of the track.
  - **It is mostly unseen.** At settled p≈0.6 it is a faint rectangle behind the sculpture, because the *engine* already performs the dive: P.dive z 2.2 / s 1.35, camera 9→6.4, fov 35→30.
  - **It repeats a motif.** The architecture film already opens the hero and carries the same wireframe motif into How it works, which is exactly where "Next" sends you.
  - **Result.** The statement lands on calm sky + sculpture, and T7 shrinks to one film.
  - Option B (keep the film, opacity only) is below in case the owner overrides.
- **Footer wordmark as the ending? No.**
  - The footer sits outside `TabPanels` (`src/app/page.tsx:50-52`), so it is the same sign-off on all 8 tabs. It is the page's floor, not Home's last beat.
  - Ending Home on a logo leaves the visitor with nothing to do.
  - Home ends on the statement + "Next: How it works". The footer stays the floor and arrives through ordinary scroll, directly under the hand-off.

## Goal
Shorten the Home hero to 150vh. The statement becomes the last beat and rests to the end of the track, then hands off to a quiet "Next: How it works" link. Copy, Stage and Engine3D read one shared set of beat constants, so they can't desync.

## Constraints
- Next 16 / React 19 / framer-motion 14 (`useTransform` on the existing `hero.progress` spring), R3F 9.8.2.
- `transform`/`opacity` only. Reduced motion and Pause keep working.
- Check with `npx tsc --noEmit`. **Never `next build`.**
- T3b has landed (`c0b9880`). Engine3D line numbers below are as of that commit. Match by content.
- Scroll geometry:
  - Section top sits at y=68, below the sticky navbar.
  - raw = (scrollY − sectionTop) / (sectionHeight − innerHeight).
  - New track = 0.5 × innerHeight (450px at 900).

## Files
1. `src/lib/motion.ts`: add `HERO_BEATS`. This is the single source of truth for cross-file beats.
2. `src/components/chapters/HeroChapter.tsx`: height, remapped ranges, statement rests, Next affordance.
3. `src/i18n/dictionary.ts`: `hero.next` (en + es). `Dictionary` is `Widen<typeof en>`, so both locales are needed.
4. `src/components/three/Stage.tsx`: delete the hero film layer and remap the architecture-film fade and mask flag.
5. `src/components/three/Engine3D.tsx`: **minimal, constants only.**
   - One import line.
   - The 4 `CAM_HERO_*` tables (lines 128–131).
   - The 4 hero-branch `ss()` thresholds (lines 429–432).
   - Nothing in the clock, time or `useFrame` structure (T3b's territory).

## Steps

### 1. `src/lib/motion.ts`: append after line 30
```ts
/**
 * Home hero beats, as hero.progress (0 → 1 over the 150vh track = 50vh of scroll).
 * HeroChapter (copy), Stage (architecture film) and Engine3D (sculpture + camera) all read these,
 * so the 3D never drifts from the words. Change them here only.
 */
export const HERO_BEATS = {
  shearStart: 0.04, // headline leaves its flat, native-text state and starts to shear
  diveStart: 0.06, // sculpture starts toward the camera
  statementIn: 0.56, // statement starts to emerge from depth; the architecture film is gone by now
  divePeak: 0.62, // last headline line gone; sculpture closest, camera pushed in furthest
  statementSet: 0.86, // statement at rest (holds to the end); the Next hand-off starts to appear
  settled: 0.98, // sculpture in its system pose (must stay < 0.999, Engine3D's branch switch)
} as const;
```
Verify: `npx tsc --noEmit`.

### 2. `src/components/chapters/HeroChapter.tsx`
- **Imports.**
  - Line 4: `import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";`.
  - Line 12: `import { EASE_EDITORIAL, HERO_BEATS } from "@/lib/motion";`.
- **Line 27–29 comment and line 31.** Change `v < 0.05` to `v < HERO_BEATS.shearStart`. Update the comment from "(0.05)" to "(HERO_BEATS.shearStart)".
- **Line 37.** `useTransform(p, [0.03, 0.18], [1, 0])` becomes `[0.04, 0.3]`.
- **Line 38.** `[0.03, 0.2]` becomes `[0.04, 0.33]`.
- **Lines 39 and 43.** Change the threshold `0.12` to `0.2` in both places. They must stay equal.
- **Line 46.** `hintOpacity` `[0, 0.05]` becomes `[0, 0.06]`.
- **Lines 48–50.** Replace with:
  ```ts
  // Statement: the last beat. It emerges from depth as the headline's last line leaves, then rests to the end of
  // the track, so the sticky release carries it off like any other content (no exit, no empty screen).
  const stOpacity = useTransform(p, [HERO_BEATS.statementIn, 0.8], [0, 1]);
  const stZ = useTransform(p, [HERO_BEATS.statementIn, HERO_BEATS.statementSet], [-520, 0]);
  const stRotateX = useTransform(p, [HERO_BEATS.statementIn, HERO_BEATS.statementSet], [24, 0]);
  // Hand-off: "Next: How it works" settles in where the scroll cue sat at rest.
  const nextOpacity = useTransform(p, [HERO_BEATS.statementSet, 0.96], [0, 1]);
  const nextY = useTransform(p, [HERO_BEATS.statementSet, 0.96], [12, 0]);
  const [nextReady, setNextReady] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    const ready = v >= 0.9;
    if (ready !== nextReady) setNextReady(ready);
  });
  ```
- **Line 63.** `motion-safe:h-[180vh]` becomes `motion-safe:h-[150vh]`.
- **Line 187 comment.** It becomes "Statement — emerges from depth as the headline leaves, then rests: it's the last beat". Leave the JSX at lines 188–197 unchanged.
  - At rest z=0 and rotateX=0, so framer writes `transform: none` and the statement paints as native, crisp text.
- **Insert after line 197** (after the statement's wrapper `</div>`, still inside the sticky div):
  ```tsx
  {/* Hand-off: where the scroll cue sat at rest, the next chapter waits. TabsContext turns #included into a tab swap. */}
  <motion.div
    style={{ opacity: nextOpacity, y: nextY }}
    inert={!nextReady}
    className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] hidden justify-center motion-safe:flex lg:bottom-10"
  >
    <a href="#included" className="group flex min-h-[44px] flex-col items-center gap-1.5 px-4 py-1 text-center">
      <span className="eyebrow text-ash">
        {t.hero.next}
        <span className="sr-only">: </span>
      </span>
      <span className="inline-flex items-center gap-1.5 font-medium text-bone underline decoration-bone/40 decoration-1 underline-offset-[4px] transition-[text-decoration-color] duration-base ease-editorial group-hover:decoration-aqua/90 group-focus-visible:decoration-aqua/90">
        {t.included.eyebrow}
        <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform duration-base ease-editorial group-hover:translate-x-0.5" />
      </span>
    </a>
  </motion.div>
  ```
  - The accessible name is "Next: How it works" / "Siguiente: Cómo funciona".
  - `t.included.eyebrow` already exists in both locales ("How it works" / "Cómo funciona").
  - Don't reuse `.link-quiet` here. Its underline would propagate onto the eyebrow.
- **Line 218.** `const range = [HERO_BEATS.shearStart + index * 0.03, 0.56 + index * 0.03];`, with the comment "the last line (index 2) ends at HERO_BEATS.divePeak (0.62)".
- **Line 223.** `[range[0] + 0.16, range[1] - 0.03]`.

### 3. `src/i18n/dictionary.ts`
- en `hero` (after line 85, `scrollHint`): `next: "Next",`.
- es `hero` (after line 440): `next: "Siguiente",`.

### 4. `src/components/three/Stage.tsx`
- **Import.** `import { HERO_BEATS } from "@/lib/motion";`.
- **Lines 14–16.** Drop the stale first doc line (14). Keep `FILM_LIGHT`, because the architecture film still uses it. T7 removes it.
- **Doc lines 18–28.**
  - Change the layer order to `sky base → light threads → architecture film → WebGL engine`.
  - Remove "hero film (3D dive)".
  - Replace "The films were shot dark" with "The film was shot dark".
- **Delete lines 52–55** (`filmOpacity`, `filmScale`, `filmRotateX`, `filmRotateZ`).
- **Delete lines 137–153** (the "Hero film" block, including the `bg-ink/40` overlay).
- **Lines 56–58 comment.** "…dimly behind the hero's first screen (gone before the statement emerges)…".
- **Line 65.** `useTransform(hero.raw, [0, 0.37, HERO_BEATS.statementIn], [0.24, 0.24, 0])`.
- **Line 74.** Change `v < 0.5` to `v < 0.8`.
  - Comment: "flips while the film is invisible: on Home it is 0 from raw ≥ HERO_BEATS.statementIn".
  - **Required.** If the threshold stays at 0.5, the mask would pop while the film is still at about 8% opacity.
- `LayerVideo`, `useTransform` and `motion` all stay in use. Don't delete the media files: that's T7, see Risks.

### 5. `src/components/three/Engine3D.tsx`: constants only
- **After line 8.** `import { HERO_BEATS } from "@/lib/motion";`.
- **Lines 128–131.**
  ```ts
  const CAM_HERO_Z = [[0, 9], [HERO_BEATS.divePeak, 6.4], [HERO_BEATS.settled, 8.2]] as const;
  const CAM_HERO_Y = [[0, 0], [HERO_BEATS.divePeak, 0.35], [HERO_BEATS.settled, 0]] as const;
  const CAM_HERO_ROLL = [[0.1, 0], [0.5, 0.07], [HERO_BEATS.statementSet, 0]] as const;
  const CAM_HERO_FOV = [[0, 35], [HERO_BEATS.divePeak, 30], [HERO_BEATS.settled, 35]] as const;
  ```
- **Lines 429–432.**
  ```ts
  const dive = mixInto(poseA, P.hero, P.dive, ss(h, HERO_BEATS.diveStart, HERO_BEATS.divePeak));
  target = mixInto(poseB, dive, P.system, ss(h, HERO_BEATS.divePeak, HERO_BEATS.settled));
  targetMorph = ss(h, HERO_BEATS.statementSet, 1) * 0.15;
  targetOpacity = lerp(0.85, 1, ss(h, 0.5, HERO_BEATS.statementSet));
  ```
  - The old code held the sculpture at full dive from 0.45 to 0.6, while the statement emerged over a frame-filling sculpture.
  - Now `ss` eases to zero velocity at the peak, which gives a natural beat. The sculpture then starts to retreat as the statement resolves, so the words never fight it.
- **Leave unchanged:** `h < 0.999`, `heroSwing = sin(hπ)·0.7`, and the core, cage and ringA terms proportional to h. They are continuous over [0, 1] and need no remap.

### 6. Verify
`npx tsc --noEmit`, then run the acceptance checks below with Playwright (dev server on :3000).

## Range table: every hero.progress / hero.raw consumer
Old track: 80vh (180vh − 100svh). New track: 50vh (150vh − 100svh). vh = scroll distance into the track.

| # | Where | Value | Before (p) | Before (vh) | After (p) | After (vh) |
|---|---|---|---|---|---|---|
| 1 | HeroChapter:46 | scroll-cue opacity 1→0 | 0–0.05 | 0–4 | 0–0.06 | 0–3 |
| 2 | HeroChapter:31 | headline `stage-flat` while p < | 0.05 | 4 | 0.04 `shearStart` | 2 |
| 3 | HeroChapter:37 | copy opacity 1→0 (also chips, HeroFlowCard, phone ink fade, figure caption) | 0.03–0.18 | 2.4–14.4 | 0.04–0.30 | 2–15 |
| 4 | HeroChapter:38 | copy y 0→−60px | 0.03–0.20 | 2.4–16 | 0.04–0.33 | 2–16.5 |
| 5 | HeroChapter:39,43 | copy pointer-events none + `inert` when p > | 0.12 | 9.6 | 0.20 | 10 |
| 6 | HeroChapter:218 | headline line i x/z/rotX/rotY | 0.05+0.02i → 0.38+0.02i | 4→30.4 (+1.6i) | 0.04+0.03i → 0.56+0.03i (line 2 ends 0.62 = `divePeak`) | 2→28 (+1.5i) |
| 7 | HeroChapter:223 | headline line i opacity 1→0 | 0.15+0.02i → 0.36+0.02i | 12→28.8 (+1.6i) | 0.20+0.03i → 0.53+0.03i | 10→26.5 (+1.5i) |
| 8 | HeroChapter:48 | statement opacity | 0.5→0.6 in, 0.84→0.95 out | 40–48 in, 67–76 out | 0.56→0.80 in, **no exit** | 28–40, holds to 50 |
| 9 | HeroChapter:49 | statement z | −520→0 (0.5–0.62), 0→420 (0.84–0.97) | 40–49.6, 67–77.6 | −520→0 (0.56–0.86), **no fly-past** | 28–43 |
| 10 | HeroChapter:50 | statement rotateX 24→0 | 0.5–0.62 | 40–49.6 | 0.56–0.86 | 28–43 |
| 11 | HeroChapter (new) | Next opacity 0→1, y 12→0px | — | — | 0.86–0.96 | 43–48 |
| 12 | HeroChapter (new) | Next interactive (`inert` off) when p ≥ | — | — | 0.90 | 45 |
| 13 | Stage:52 | film opacity | 0→1→1→0 at 0.36/0.48/0.86/0.97 | 28.8–77.6 | **removed** | — |
| 14 | Stage:53 | film scale 0.22→1.08 | 0.36–0.8 | 28.8–64 | **removed** | — |
| 15 | Stage:54 | film rotateX 32→0 | 0.36–0.8 | 28.8–64 | **removed** | — |
| 16 | Stage:55 | film rotateZ −6→0 | 0.36–0.8 | 28.8–64 | **removed** | — |
| 17 | Stage:65 (raw) | architecture film 0.24 hold → 0 | 0.26–0.38 | 20.8–30.4 | 0.37–0.56 (`statementIn`) | 18.5–28 |
| 18 | Stage:74 (raw) | arch mask "in hero" while raw < | 0.5 | 40 | 0.8 | 40 |
| 19 | Engine3D:429 | sculpture dive (P.hero→P.dive) | ss 0.08–0.45 | 6.4–36 | ss 0.06–0.62 | 3–31 |
| 20 | Engine3D:430 | settle into P.system | ss 0.6–0.98 | 48–78.4 | ss 0.62–0.98 | 31–49 |
| 21 | Engine3D:431 | morph 0→0.15 | ss 0.7–1 | 56–80 | ss 0.86–1 | 43–50 |
| 22 | Engine3D:432 | opacity 0.85→1 | ss 0.4–0.7 | 32–56 | ss 0.5–0.86 | 25–43 |
| 23 | Engine3D:128 | camera z 9→6.4→8.2 | 0 / 0.45 / 0.98 | 0/36/78.4 | 0 / 0.62 / 0.98 | 0/31/49 |
| 24 | Engine3D:129 | camera y 0→0.35→0 | 0 / 0.45 / 0.98 | same | 0 / 0.62 / 0.98 | same |
| 25 | Engine3D:131 | fov 35→30→35 | 0 / 0.45 / 0.98 | same | 0 / 0.62 / 0.98 | same |
| 26 | Engine3D:130 | roll 0→0.07→0 | 0.1 / 0.4 / 0.7 | 8/32/56 | 0.1 / 0.5 / 0.86 | 5/25/43 |
| 27 | Engine3D:427,498 | hero branch while h < 0.999; heroSwing sin(hπ)·0.7; core/cage/ringA ∝ h | — | — | unchanged (continuous in h) | — |
| 28 | Stage:44–45 | off-tab hero reads 1 | — | — | unchanged | — |

The old dead zone was rows 8 and 9's exit (67–77.6vh), plus 2.4vh of empty track, plus a released stage with nothing on it. The old sculpture-only gap between the headline and the statement (rows 7→8, 32–40vh) is also gone: the statement now starts at 28vh, while the last line finishes fading at 29.5vh.

## Motion spec
- **Trigger.** Scroll only, through the existing `hero.progress` (cinematic spring, overdamped, so p never exceeds 1). Every value is scroll-linked and therefore fully reversible.
- **Headline shear.** Same paths (`LINE_PATHS`) and the same pace per pixel (26vh vs 26.4vh). The stagger goes from 1.6vh to 1.5vh per line.
- **Statement.**
  - Opacity 0→1 over 0.56–0.80. z −520→0 and rotateX 24°→0 over 0.56–0.86.
  - Then it holds at `transform: none` (native text) to p=1.
  - Once the sticky stage releases, it scrolls away with the page. There is no exit animation.
- **Engine.** It eases to the dive peak exactly when the last headline line is gone (0.62). It settles into the system pose by 0.98. The camera push and fov squeeze peak on the same beat. Roll levels out by the time the statement is set (0.86).
- **Next hand-off.**
  - Opacity 0→1 and y 12→0px over 0.86–0.96. It sits bottom-centre, the same spot as the "Scroll to see how" cue at rest, which bookends the hero.
  - Hover/focus: the underline colour moves to aqua over 250ms (`duration-base`, `ease-editorial`) and the arrow moves translate-x 2px.
  - The click goes through the existing capture handler in TabsContext (lines 100–114) → `go("included")`: the veil swap, then scroll reset to the top.
- **Interruption.** Scrolling back reverses everything. At p < 0.9 the link turns `inert` again (it can't be focused or clicked while fading). That is a state flip at the threshold only, with no per-frame renders.
- **Exit.** None. Normal document scroll carries the statement and the link off. The footer is directly beneath, with no void.
- **Reduced motion: no change.** The section is not tall (`motion-safe:` height), and the statement and Next are `motion-safe:flex` only. The rest copy's "See how it works" link (line 135) already covers the hand-off.
- **Pause.** Nothing new is time-based. The Engine pauses as before.

## Tool choice
- **Scroll-linked values:** framer-motion `useTransform` on the existing spring, because every hero beat already lives there with zero React renders per frame.
- **Hover:** CSS transitions with the motion.css tokens (`duration-base`, `ease-editorial`), the same pattern as the Footer links.
- **Engine:** constants only. No new tool and no new curve.

## Acceptance criteria (Inspector)
Run at 1440×900 and 390×844, in light and dark. Compute `top` from the section's `getBoundingClientRect().top + scrollY` (68 at 1440). Scroll to `top + r × 0.5 × innerHeight` and wait ≥ 1.5s; springs run on wall-clock time.
1. `section[aria-labelledby=hero-title]` `offsetHeight` is `1.5 × innerHeight` (1350 at 900).
2. **r=0.**
   - The `h1` has `stage-flat`, and every line has opacity 1.
   - The statement and the Next wrapper both have opacity 0, and the Next wrapper is `inert`.
   - The scroll cue is visible on desktop.
3. **r=0.62.** All headline lines have opacity 0, the statement opacity is between 0.2 and 0.4, and the sculpture is at its largest in the screenshot.
4. **No void.** At every r in {0.6, 0.65, 0.7, 0.8, 0.9, 0.95, 1.0}, the statement's computed opacity is ≥ 0.15. At r ∈ {0.9, 0.95, 1.0} it is 1.
5. **r=1.**
   - The statement's computed `transform` is `none` (crisp).
   - The Next wrapper has opacity 1, is not `inert`, and its link has `href="#included"` and accessible name "Next: How it works".
   - `footer.getBoundingClientRect().top − nextLink.getBoundingClientRect().bottom` is between 0 and 80px.
6. **Scroll on.** Past r=1, at +25vh and +50vh, the statement and/or the Next link are visible, and the footer is rising directly beneath. No screenshot shows only sky and sculpture.
7. **Hand-off.** Clicking Next sets the URL hash to `#included`, `#panel-included` is visible, and `scrollY` is 0. Keyboard: at r=1, Tab reaches the link and Enter does the same. At r=0, the link cannot be reached by Tab.
8. **Film removed.** `document.querySelectorAll('source[src*="hero-v2"]').length === 0`, and the Stage holds exactly one `<video>` (the architecture film).
9. The architecture film is at opacity 0 for raw ≥ 0.56, and its mask class flips only at raw 0.8 (no visible pop).
10. **Sync.** There is no literal 0.45, 0.6 or 0.7 left in the Engine3D hero tables or the hero branch. Every cross-file beat reads `HERO_BEATS`.
11. **Return to Home** after Next: the hero is at p=0, with the headline assembled and flat. (Measured on the current build: the spring rewinds while the panel is hidden, so there is no visible rewind. Re-check.)
12. **Contrast.** "Next" (`text-ash` eyebrow) is ≥ 4.5:1 over the sky at the bottom-centre, in both themes. Reduced motion (emulated) shows no Next and no statement; the layout is unchanged from before.
13. `npx tsc --noEmit` is clean, and there are no new console errors.

## Risks
- **Desync.** This is the main risk, and `HERO_BEATS` removes it for cross-file beats. Single-file numbers (copy fade, line stagger, the 0.8 statement opacity, the Next 0.96 and 0.9) stay local on purpose.
- **Engine3D contention.** T3b has landed. This diff is one import plus 8 constant lines. Tell any later Engine3D ticket to rebase onto it.
- **`h < 0.999` switch.** The settle must finish before it, and `settled: 0.98` keeps that. The existing small morph pop (0.15→0) at the switch is unchanged and damped.
- **Orphaned media.** Removing the film orphans `public/media/hero-v2.{mp4,webm}` (1.5MB) and `hero-v2-film-poster.jpg`. Leave them for T7, which owns `public/media/` and now only has to pre-render `architecture-v2`. Keep `hero-v2-poster.jpg`: it is the reduced-motion stand-in (HeroChapter:150).
- **Option B (only if the owner overrides the cut).** Keep the film layer but drop all three 3D transforms. Use opacity only, `[HERO_BEATS.statementIn, HERO_BEATS.statementSet] → [0, 0.45]` with no fade-out, plus Inspector check 4 for statement contrast over it.
- **iOS bottom bar.** The sticky stage is 100svh, so its bottom is above the toolbar. `max(2rem, safe-area)` covers the home indicator. `vh` vs `svh` makes the phone track slightly longer, which is harmless.
- **a11y.** `inert` toggling is a single state flip, the same pattern as `copyHidden`. The 44px min target is met.
- **Finding (out of scope, for the orchestrator).** `system.progress` and `system.ref` are never driven anywhere any more: `grep` finds only Stage reading them. So How it works has no 3D, and the architecture film's "second use" (Stage:67) never fires. The hero still settles the sculpture into a "system" pose for a chapter that no longer exists. That is harmless as a resting pose, but worth a ticket if How it works should continue the 3D after "Next".
