# T1 — Dashboard lands assembled (planner: Opus)

**Read-only check.** At 1440×900 on `/#dashboard`, scroll 0 shows the headline and then empty space. Second bug: the
`<header>` is `sticky top-0` and in the page flow (68px tall), so `<main>` starts at y=68. The pinned stage is
`sticky top-0 pt-20` and only sticks after 68px of scroll, sitting 68px too low until then (1440×900: disclaimer
bottom at 952 > 900; 1280×840: window bottom 842, disclaimer 892 > 840). The headline jumps 68px when scrolling
starts (164 → 96). This plan fixes both.

## Verdict on the extras
- **Scroll-cycling industries doesn't fit a tab** (≈5 screens of scrolling to see 6 industries, with industry tabs
  right there). Replace with an **auto-tour**: one industry every 6s, one lap per page visit, only while pinned and
  this tab is open; holds on hover/focus inside the window and under global Pause; stops for good once the visitor
  picks an industry (`userPicked` / `lockNiche`).
- **Keep explode-on-scroll** as an optional flourish on a **200vh** track: layers come apart, hold, reassemble before
  the footer, so the window is assembled at both ends.

## Goal
Desktop pinned (≥1280×840): opening the Dashboard tab shows the whole window + disclaimer, readable within ≈600ms,
via a time-based `smooth` entrance that replays on every tab open. Scroll drives only explode/reassemble on a 200vh
track; industries change on a timer.

## Files
- `src/components/sections/DashboardShowcase.tsx` (all logic)
- `src/i18n/dictionary.ts`: only the two `dashboard.scrollHint` lines (≈186 EN, ≈534 ES) — single-line Edits only (T2 edits the same file in parallel)
- No changes under `dashboard/`, `SceneContext.tsx`, `TabsContext.tsx`, `TabPanels.tsx`.

## Steps
1. **Imports (lines 3–10, 21, 25).** From framer-motion add `animate`, `useMotionValue`, `useScroll`, `useSpring`
   (keep `useMotionValueEvent`, `useTransform`, `useInView`, `AnimatePresence`, `motion`, `MotionValue`). Add
   `useCallback` to the react import. Line 21 → `import { useScene } from "@/context/SceneContext";` (drop
   `useTrackProgress`). Add `import { useTabs } from "@/context/TabsContext";` and
   `import { useMotionPause } from "@/context/MotionPauseContext";`. Line 25 →
   `import { EASE_EDITORIAL, MOTION, SPRING_SMOOTH } from "@/lib/motion";`.
2. **Constants** after `TRAFFIC_DOT` (≈line 84):
   ```ts
   /** Sticky site header at the pin breakpoint (Navbar: pt-3 + h-14). The pinned stage sticks right under it. */
   const HEADER_H = 68;
   /** Scroll extras on the 200vh track (progress 0→1): layers explode, hold, reassemble. Outside [EX_IN, EX_OUT] every layer is at z 0 and untilted. */
   const EX_IN = 0.1;
   const EX_FULL = 0.4;
   const EX_HOLD = 0.6;
   const EX_OUT = 0.9;
   const EX_TILT_PEAK = 0.45;
   /** Time-based entrance (`smooth` spring, replays on every tab open): the window settles onto the stage from just below. */
   const ENTER = { rotateX: 12, y: 40, z: -100 } as const;
   /** Industry auto-tour: one step per TOUR_MS, at most one lap (NICHES.length steps) per page visit. */
   const TOUR_MS = 6000;
   ```
3. **Own scroll track (replace lines ≈90–93)**, replacing `useTrackProgress`:
   ```ts
   const trackRef = useRef<HTMLElement | null>(null);
   // "start 68px": progress 0 at page scroll 0 (the section starts under the in-flow sticky header).
   const { scrollYProgress } = useScroll({ target: trackRef, offset: [`start ${HEADER_H}px`, "end end"] });
   const d = useSpring(scrollYProgress, MOTION.cinematic);
   const pinned = pin && !reduce; // keep the existing comment above it
   const tabs = useTabs();
   const open = tabs ? tabs.active === "dashboard" : true;
   const live = pinned && open;
   const { paused: motionPaused } = useMotionPause();
   const pausedRef = useRef(motionPaused);
   pausedRef.current = motionPaused;
   const liveRef = useRef(live);
   liveRef.current = live;
   ```
   On the section (≈line 154) change `ref={track.ref}` → `ref={trackRef}`.
4. **Transforms (replace ≈lines 95–110)**; keep the `zChrome…zRail` lines unchanged:
   ```ts
   // Entrance (time) + extras (scroll): tilt and explode into layers, then reassemble.
   const enter = useMotionValue(0);
   const explode = useTransform(d, [EX_IN, EX_FULL, EX_HOLD, EX_OUT], [0, 1, 1, 0]);
   const tiltX = useTransform(d, [EX_IN, EX_TILT_PEAK, EX_OUT], [0, 10, 0]);
   const rotateY = useTransform(d, [EX_IN, EX_TILT_PEAK, EX_OUT], [0, -24, 0]);
   const rotateX = useTransform([enter, tiltX], ([e, t]: number[]) => (1 - e) * ENTER.rotateX + t);
   const y = useTransform(enter, [0, 1], [ENTER.y, 0]);
   const z = useTransform(enter, [0, 1], [ENTER.z, 0]);
   const opacity = useTransform(enter, [0, 0.7], [0, 1]);
   // The disclaimer fades in once the window has nearly landed, so it never prints under the rising window.
   const noteOpacity = useTransform(enter, [0.6, 0.95], [0, 1]);
   ```
5. **Entrance effect** (after the transforms); replays on every open; reset to 0 while hidden:
   ```ts
   useEffect(() => {
     if (!live) { enter.jump(0); return; }
     // The hidden panel measured a stale track; the tab swap resets scroll to 0. Clear the spring so the explode never plays backwards during the entrance.
     d.jump(0);
     if (pausedRef.current) { enter.jump(1); return; }
     enter.jump(0);
     let controls: ReturnType<typeof animate> | undefined;
     // Two frames, the same as TabsContext's swap: start once the scroll reset has landed and the veil begins to lift.
     let raf = requestAnimationFrame(() => {
       raf = requestAnimationFrame(() => {
         d.jump(0);
         controls = animate(enter, 1, { ...SPRING_SMOOTH, restDelta: 0.001 });
       });
     });
     return () => { cancelAnimationFrame(raf); controls?.stop(); };
   }, [live, enter, d]);
   ```
   Do NOT put `motionPaused` in the deps (toggling Pause mid-visit must not `d.jump(0)` mid-track).
6. **Remove the scroll-driven industry cycle (≈lines 112–125).** Keep `nicheRef`; delete `baseRef` and the
   `useMotionValueEvent` block. Add the tour:
   ```ts
   // Industry tour: replaces scroll-cycling. Ends for good once the visitor picks (userPicked).
   const tour = useRef({ timer: 0, steps: 0, hover: false, focus: false });
   const scheduleTour = useCallback(function schedule() {
     const s = tour.current;
     window.clearTimeout(s.timer);
     if (!liveRef.current || pausedRef.current || s.hover || s.focus || userPicked.current || s.steps >= NICHES.length) return;
     s.timer = window.setTimeout(() => {
       if (document.hidden) return schedule();
       if (userPicked.current) return;
       const i = Math.max(0, NICHES.findIndex((n) => n.id === nicheRef.current));
       s.steps += 1;
       startTransition(() => autoNiche(NICHES[(i + 1) % NICHES.length].id));
       schedule();
     }, TOUR_MS);
   }, [autoNiche, userPicked]);
   useEffect(() => {
     scheduleTour();
     const s = tour.current;
     return () => window.clearTimeout(s.timer);
   }, [live, motionPaused, scheduleTour]);
   const holdTour = (k: "hover" | "focus") => { tour.current[k] = true; window.clearTimeout(tour.current.timer); };
   const releaseTour = (k: "hover" | "focus") => { tour.current[k] = false; scheduleTour(); };
   ```
   `steps` persists across tab visits; after 6 steps the tour never runs again.
7. **Crisp text at rest (≈lines 127–139).** Only the explode needs preserve-3d; the entrance moves just the WINDOW
   (direct child of the perspective div), so it can run flat. Replace the flat condition with
   `const flat = !pinned || v <= EX_IN || v >= EX_OUT;` and update the comment. Keep
   `useMotionValueEvent(d, "change", setFlat)` and `useEffect(() => setFlat(d.get()))`.
8. **Track and sticky stage (≈lines 158, 161).** `motion-safe:pin:h-[300vh]` → `motion-safe:pin:h-[200vh]`.
   Stage: `motion-safe:pin:top-0 motion-safe:pin:h-[100svh] … motion-safe:pin:pt-20` →
   `motion-safe:pin:top-[68px] motion-safe:pin:h-[calc(100svh-68px)] … motion-safe:pin:pt-3` (keep `sticky`,
   `overflow-hidden`, `pb-4`). Add a comment tying 68px to `HEADER_H` (Tailwind needs the literal).
9. **WINDOW handlers (≈lines 193–205).** Keep the style line and the non-pinned `initial/whileInView` branch. Add:
   ```tsx
   onPointerEnter={() => holdTour("hover")}
   onPointerLeave={() => releaseTour("hover")}
   onFocus={() => holdTour("focus")}
   onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) releaseTour("focus"); }}
   ```
10. **Disclaimer (≈line 233).** No change; it uses the new `noteOpacity`.
11. **Comments.** Rewrite the header comment (≈66–71): pins on a 200vh track under the header, time-based entrance
    on every tab open, scroll explodes/reassembles the layers, industries auto-tour.
12. **Hint copy** (`dictionary.ts`), single-line Edits only:
    EN `scrollHint: "Scroll to see it in layers.",` · ES `scrollHint: "Desplácese para verlo por capas.",`
13. `npx tsc --noEmit`. Never `next build`.

## Motion spec
| Part | Spec |
|---|---|
| Entrance trigger | `live` (pinned and dashboard tab active) turns true; starts two rAFs after commit, in step with the TabsContext veil |
| Entrance properties | `enter` 0→1 drives the WINDOW: rotateX 12°→0 (origin 50% 100%), y 40px→0, z −100→0 (perspective 1800), opacity over enter 0–0.7; disclaimer opacity over enter 0.6–0.95 |
| Entrance timing | `SPRING_SMOOTH` (k140 c24 m0.8, overdamped), restDelta 0.001: ≈97% at 500ms, rest ≈650ms |
| Interruption / exit | Leaving stops the animation and cancels rAFs; hidden → `enter.jump(0)`; no exit animation (veil handles it); Pause on at open → `enter.jump(1)` |
| Scroll extras | `[start 68px, end end]` via `cinematic` spring; explode [0.1,0.4,0.6,0.9]→[0,1,1,0]; tilt [0.1,0.45,0.9]: rotateX +[0,10°,0], rotateY [0,−24°,0]; flat for p ≤ 0.1 and p ≥ 0.9 |
| Tour | every 6000ms, ≤6 steps per page visit; only while live, not paused, no hover/focus, `!userPicked`, document visible; reuses existing niche transitions |
| Reduced motion / phone / tablet | `pinned` false: no entrance MV, no tour, no sticky track; existing `whileInView` path untouched |

## Acceptance criteria (Playwright on the dev server; never `next build`)
1. At 1440×900, 1280×840, 1920×1080, load `/#dashboard`, wait 700ms: WINDOW (`#dashboard [data-theme="dark"]`) has
   opacity 1 and transform none; it and the disclaimer are fully in the viewport; `stage-flat` present.
2. Home → click Dashboard tab: at ≈600ms whole window + disclaimer visible; at ≈150ms mid-rise, not empty. Leave and
   return: entrance replays.
3. h2 top at scroll 0 equals h2 top at scroll 400.
4. `#dashboard` offsetHeight = 2× innerHeight; mid-track plates transformed and `stage-flat` absent; flat at both ends; footer scrolls in at the end.
5. Tour: pointer on navbar → niche `02` selected after 6.3s, `03` after 12.3s; hover/focus in window holds it; clicking a niche tab stops it for good; Pause stops it; six steps end on Barbershops.
6. Reduced motion: no 200vh, no sticky, window + disclaimer visible. At 1279×900 and 390×844 behaviour matches HEAD.
7. NichePreview Pause button still toggles the clip.
8. `npx tsc --noEmit` clean; no console errors.

## Risks
- Stale `d` after a hidden panel: without the `d.jump(0)` calls the explode plays backwards over the entrance.
- Double rise until T5 (TabPanels veil 14px). Don't touch TabPanels here.
- Hard-coded 68px depends on Navbar `sm:pt-3 h-14`. Flag to T5.
- Clip edge moved to y=68: check no plate is cut at peak explode (p≈0.45).
- The tour changes the shared industry used by Simulator/Calculator (as the old scroll cycle did).
- Out of scope: bars/count-ups don't replay on reopen (`useInView` once) — T5.
