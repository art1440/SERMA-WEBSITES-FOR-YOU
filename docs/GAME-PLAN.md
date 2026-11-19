# Game plan: perfecting the site (motion first)

Branch: `claude/blissful-wright-p993s9` · Live preview: `npm run dev` on port 3000 · Pipeline: `CLAUDE.md`
(planner → coder → inspector → deep-reviewer). Each ticket lands as its own commit, so `git log` is the progress feed.

## The verdict, before any fixes

The site is well built at the component level (springs on MotionValues, transform/opacity only, WebGL that stops
when nobody's looking, real reduced-motion and pause paths). The problem is **structural drift**: it was designed
as one long scroll-pinned film, then cut into tabs, then flipped from dark to light. Several chapters still
choreograph for the old long page. In a tab you open a section and have to scroll through empty space before it
exists. That's the biggest problem.

What I measured (Playwright, 1440×900 and 390×844, on a production build of `main`):

| Where | What you see | Why |
|---|---|---|
| Dashboard tab (desktop ≥1280×840) | Headline, then a full screen of nothing | The dashboard starts at `opacity 0, y 36%, rotateX 64°` and only builds as you scroll a 300vh track |
| Missed Calls tab (desktop) | Phone and panel start skewed in 3D; copy says "Scroll to play the call, scroll back to rewind" | Scroll-scrubbed story inside a tab: the visitor has to work out the scroll before anything makes sense |
| Home tab | Scroll the hero and at ~75% it's just the sculpture on an empty screen, then the footer | 180vh track with a dead beat between the statement and the footer |
| Every tab swap | Panel rises 14px, then each block inside rises another 16px | `TabPanels` veil and `Reveal` both translate Y, so the entrance plays twice |
| Primary CTAs | Colour hover snaps instead of easing | `MagneticButton` adds `transition-none` to kill the transform transition, and that also kills the colour transition |
| Light theme films | Full-screen videos run through `invert + hue-rotate + saturate + brightness` every frame | A runtime negative of a dark grade: costs GPU time under 3D transforms and looks like a negative |
| Console | `GPU stall due to ReadPixels`, `THREE.Clock deprecated` | **Corrected by the T3 planner:** both are harmless. ReadPixels comes from this container's software compositing (a blank WebGL page triggers it); Clock is inside R3F 9.8.2, already the latest release. The real 3D bugs are below (T3). |
| Docs | `design-system.md` says dark-first aqua; README says "no forms" and "pinned chapters" | Both describe the old site, and the next agent will build to the wrong spec |

(Frame-rate numbers from this container are meaningless because it renders WebGL in software. Re-measure on a real
GPU before chasing fps.)

## Rules for every ticket

- Motion lives in `src/lib/motion.ts` + `src/app/motion.css`. Use those tokens; no new ad-hoc curves.
- Tabs are the page model now. **A tab must look finished at scroll 0.** Scroll may add something, but never gate content.
- No scroll-jacking. Scroll-scrubbing is fine for flourish, wrong for story/content.
- `transform`/`opacity` only; reduced-motion and the Pause control must keep working.
- **Never run `next build` / `npm run build`**: the dev server is using `.next`. Check with `npx tsc --noEmit`.
- Don't commit `AGENTS.md` (Next generates it).

## Tickets

### Wave 1 — broken on first look (parallel, disjoint files)

- **T1 · Dashboard lands assembled** — `src/components/sections/DashboardShowcase.tsx`
  On tab open the dashboard is fully visible and readable within ~600ms (time-based entrance, `smooth` token).
  The scroll track drives only the extras (explode into layers, cycle industries), and it's shorter. Nothing
  below the headline is ever empty.
- **T2 · Simulator plays on intent, not scroll** — `src/components/sections/MissedCallSimulator.tsx` (+ dictionary strings if the hint copy changes)
  Phone and panel rest flat and legible. "Simulate a missed call" plays a time-based timeline on every breakpoint,
  with a progress rail you can scrub or drag and a replay. Scroll may tilt the stage slightly for depth, never
  advance the story. Steps stay interruptible (replay mid-run resets cleanly).
- **T3 · WebGL hygiene** — `src/components/three/Engine3D.tsx`, `src/components/three/LightThreads.tsx`
  Adaptive DPR is silently undone by the next re-render (e.g. pressing Pause); `uPixelRatio` goes stale so points draw
  1.75× too big after a DPR drop; 20–30 throwaway objects per frame in `useFrame`; LightThreads leaks its GL program
  and buffer (StrictMode double mount); RoomEnvironment never disposed. No visual change. Plan: [T3](plans/T3-webgl.md).
- **T3b · Sculpture keeps its time** — `src/components/three/Engine3D.tsx` (after T3 lands)
  R3F resets `clock.elapsedTime` to 0 whenever the frameloop toggles, so after Pause/Play or re-entering a 3D tab the
  sculpture's rotation, camera drift and heartbeat snap back to t=0. Use an app-owned time that accumulates `delta`.
  Also (from T3's deep review): LightThreads never recovers from a WebGL context loss, so the backdrop stays blank
  after a GPU reset. Handle `webglcontextlost`/`restored`.

**Noted for later (T3 deep review):** hero scroll re-renders React every frame (≈0.7 MB of `createElement`
allocations in a short scroll); not WebGL, worth tracing during T4.

### Wave 2 — one motion language

- **T4 · Hero ends on a beat, not a void** — `src/components/chapters/HeroChapter.tsx`, `src/components/three/Stage.tsx`
  Cut the dead zone after the statement (shorter track, ~140vh). The statement is the last beat and hands off to a
  quiet "Next: How it works" affordance. Keep the headline shear, which is the best moment on the site.
- **T5 · Tab swap choreography** — `src/components/layout/TabPanels.tsx`, `src/context/TabsContext.tsx`, `src/components/ui/Reveal.tsx`, `src/components/layout/Navbar.tsx`
  Swap = crossfade only (out 150ms ease-in, in 250ms editorial), no container Y. Sections own their entrance,
  and it replays on every tab open (currently first visit animates and later visits are static). The active-tab
  pill glides between tabs with a shared layout animation (`snappy`).
- **T6 · CTA feel** — `src/components/ui/MagneticButton.tsx`
  Restore colour/shadow hover transitions while keeping the spring transform. Press = 0.97 scale, `snappy`.
  Same feel as the CSS `.btn` press.

### Wave 3 — polish and truth

- **T7 · Real light-theme films** — `src/components/three/Stage.tsx`, `public/media/`
  Pre-render light versions offline (ffmpeg) and swap `src` by theme; delete the runtime CSS filter.
- **T8 · Docs tell the truth** — `docs/design-system.md`, `README.md`
  Light sky-blue + dark toggle, tabs not a long page, the enquiry form, the motion rules above.

## Needs your call (agents won't touch these)

1. **Prices.** Pricing shows "$ — Price coming soon". Branch `claude/nice-wright-ilz6al` sets Starter $500 /
   Business $1,000 / Growth $2,000 and was never merged. Want it in?
2. **Business card** (`claude/upbeat-sagan-nlbl56`) is unmerged. Merge it into the repo as brand assets, or keep it separate?

## Status

| Ticket | Plan | Code | Inspect | Deep review | Commit |
|---|---|---|---|---|---|
| T0 merge main + agent team + crisp-text fix, live preview | — | done | — | — | merged |
| T1 Dashboard | [plan](plans/T1-dashboard.md) | done (Sonnet) | PASS w/ nits (fixed) | SHIP AFTER NITS (fixed) | ✅ shipped |
| T2 Simulator | [plan](plans/T2-simulator.md) | done (Sonnet) | inspecting (Haiku) | | WIP commit |
| T3 WebGL hygiene | [plan](plans/T3-webgl.md) | done (Sonnet) | PASS w/ nits (wording only) | SHIP | ✅ shipped |
| T3b Sculpture time + threads context restore | [plan](plans/T3b-sculpture-time.md) | done (Sonnet) | inspecting (Haiku) | | WIP commit |
| T4 Hero | planning (Opus) | | | | |
| T5 Tab swap | planning (Opus) | | | | |
| T6 CTA feel | planning (Opus, with T5) | | | | |
| T7 Light films | | | | | |
| T8 Docs | | | | | |
