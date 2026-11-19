# T5 + T6 — Tab swap choreography and CTA feel (planner: Opus)

Two parts, two coders, disjoint files.

| Part | Owns (only these) | Must not touch |
|---|---|---|
| **T5** | `src/components/layout/TabPanels.tsx`, `src/context/TabsContext.tsx`, `src/components/ui/Reveal.tsx`, `src/components/ui/TiltCard.tsx` (entrance only), `src/components/layout/Navbar.tsx` | `MagneticButton.tsx`, `globals.css`, any section file |
| **T6** | `src/components/ui/MagneticButton.tsx` | everything else. **No `globals.css` change is needed** (see T6 findings) |

## What I checked first (read-only, Playwright on the dev server)

- **The double entrance is real.** `TabPanels.tsx` L18–20 drives `opacity` plus `y` 14→0 off `veil`. Every `Reveal` (L20–31), `RevealLines` (L83–84) and `TiltCard` entrance (L84–90) adds its own 16px or 108% rise. All of them use `whileInView` + `VIEWPORT_ONCE`, and hidden panels stay mounted, so the **first visit animates and every later visit is static**.
- **`TabsContext.tsx` L56–60 has a bug: the page can get stuck invisible.** Pick B, then within 150ms pick the tab you are already on (ArrowRight then ArrowLeft in the tablist does it). The same-tab branch returns without touching `veil`. Swap B finishes `animate(veil, 0)`, sees that its token is stale, and returns. Result: `veil` stays at 0 and the page is blank until the next click.
- **The pill already glides.** `Navbar.tsx` L332–341: `layoutId="tab-pill"`, `SPRING_SNAPPY`. But it **snaps over its last ~11%**. `setActive` fires 150ms after the click and re-renders `Navbar`. With no `layoutDependency`, framer re-snapshots the pill, sees "layout unchanged" and calls `finishAnimation` (`motion-dom/.../create-projection-node.mjs` L428–429). Snappy is ζ≈1.03, ω≈25.3/s, so it is ≈89% of the way there at 150ms. The 16px filament inside the pill is also stretched by the pill's scaleX while it glides (sampled: `translate3d(-551px,0,0) scale(0.909,1)`).
- **Centring the tab rail is wrong at 1024–1279px.** `Navbar.tsx` L279–286 uses `tab.offsetLeft`. The rail (L303–308) is not positioned, so below lg the offsetParent is the absolutely positioned wrapper (1px off, fine). At lg and up it is the capsule, and offsetLeft is too large by 148.7px. The rail overflows at 1024 (scrollWidth 597 / clientWidth 433) and at 1180 (597 / 589), so the picked tab is pushed far right of centre. At 390×844 it overflows (671 / 347) and centres correctly.
- **Header height:** measured 68px at ≥640px (`sm:pt-3` L72 + `h-14` L89) and 64px at 390px. `DashboardShowcase` `HEADER_H = 68` (L95) and the `top-[68px]` / `calc(100svh-68px)` literals (L227) are only used when pinned (≥1280×840), so they are correct. **T5 does not change L72 or L89.** If anyone ever does, those three places must change too.
- **T1 entrance (DashboardShowcase L141–156)** keys on `live = pinned && tabs.active === "dashboard"`. It starts two rAFs after the commit that flips `active`, which is the same frame in which `TabsContext` starts the veil fade-in (swap L74–78).
- **T2 (MissedCallSimulator)** pauses on leave (L197, `tabs.active !== "simulator"`). Its Reveals are the phone column (L318), the controls (L330), the rail (L398) and the panel (L436). Nothing in T2 depends on Reveal being `once`.

---

# Part T5 · Tab swap choreography

**Goal:** a tab swap is a pure crossfade (out 150ms ease-in, in 250ms editorial, no container transform), each section's own entrance replays on every open without remounting anything, and the active pill glides the whole way between tabs.

## Design in one paragraph

`TabsContext` gains a **visit**: `{ id, n }`, set at the exact moment a newly opened panel sits at scroll 0 and the veil starts to lift. It is `null` from the instant the old panel hides until then. `TabPanels` passes each panel a number: the visit's `n` if that panel is the one being visited, otherwise `null`. It does this through a per-panel context. `Reveal`, `RevealLines` and `TiltCard` share one hook, `useVisitReveal(ref)`:
- `null` → jump to hidden (the panel is `display:none`, so nobody sees it).
- A new number → start a **fresh** IntersectionObserver (framer's vanilla `inView`, one shot). When it fires, animate in.

Panels never unmount. The observer only ever starts after the scroll reset, so an element can't count as "seen" at the previous tab's scroll offset. Outside `TabPanels` (Footer, legal pages) the context default is `0`, so those reveal once, as today.

## Files
- `src/context/TabsContext.tsx`: visit state, a split context, a memoised value, the same-tab fix, IN_S 0.25.
- `src/components/layout/TabPanels.tsx`: opacity-only veil and the per-panel visit provider.
- `src/components/ui/Reveal.tsx`: `useVisitReveal`, and Reveal / RevealLines moved onto it.
- `src/components/ui/TiltCard.tsx`: entrance moved onto `useVisitReveal` (L83–90 only).
- `src/components/layout/Navbar.tsx`: pill `layoutDependency`, a separate filament, rail `relative`, duration tokens.

## Steps

1. **TabsContext: types and contexts** (L8–18).
   - `TabsValue` keeps `active`, `selected`, `go`, `veil`. Change the `veil` doc (L14) to "Opacity of the panel area during a swap (read by `<TabPanels>`)".
   - Add `export type TabVisit = { id: TabId; n: number } | null;`.
   - Add `const TabVisitContext = createContext<TabVisit>(null);` with `export function useTabVisit() { return useContext(TabVisitContext); }`. Only TabPanels reads it.
   - Add `export const PanelVisitContext = createContext<number | null>(0);` with `export function usePanelVisit() { return useContext(PanelVisitContext); }`. Doc it: "`null` = this panel is hidden; a number changes on every open. Default `0` outside the tab panels (footer, legal pages): revealed once."
   - Keep visit in its **own** context, so the bump re-renders no `useTabs()` consumer (Navbar, DashboardShowcase, MissedCallSimulator).

2. **TabsContext: constants and comment** (L20–22, L34–40). Keep `OUT_S = 0.15`. Change `IN_S = 0.45` to `IN_S = 0.25`. Rewrite the header comment: the current panel fades out (150ms, ease-in); the page resets to the top while nothing is visible; the new panel fades in (250ms, editorial); opacity only. Sections own their entrance and replay it on every visit. The current comment says "180ms" and "rises in", both wrong.

3. **TabsContext: state.**
   - `const [visit, setVisit] = useState<TabVisit>({ id: "home", n: 0 });`
   - `const visitRef = useRef<TabVisit>({ id: "home", n: 0 });`
   - `const visitN = useRef(0);`
   - `const enter = useCallback((id: TabId) => { visitN.current += 1; const v = { id, n: visitN.current }; visitRef.current = v; setVisit(v); }, []);`
   - `const leave = () => { visitRef.current = null; setVisit(null); };`

4. **TabsContext: rewrite `swap`** (L48–81). Keep the token and the two-rAF structure exactly. **T1's entrance is synced to it.**
   ```ts
   const mine = ++token.current;
   setSelected(id);
   /* history push: unchanged (L52–55) */
   const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
   if (id === activeRef.current) {
     if (visitRef.current?.id === id) {
       // On screen, or caught mid fade-out by a newer pick: undo the fade, or go back to the top.
       if (veil.get() < 1) animate(veil, 1, { duration: IN_S, ease: EASE_EDITORIAL });
       else window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
       return;
     }
     // Active but never entered (a newer swap cut in after the panel swap): finish entering below.
   } else {
     if (prefersReduced()) {
       activeRef.current = id; setActive(id); resetScroll(); enter(id); veil.jump(1);
       return;
     }
     await animate(veil, 0, { duration: OUT_S, ease: "easeIn" });
     if (mine !== token.current) return;
     activeRef.current = id; setActive(id); leave();      // one batch: old panel hides, its reveals reset
   }
   await frame(); resetScroll(); await frame();
   if (mine !== token.current) return;
   enter(id);                                            // the new panel's reveals start observing NOW (scroll is 0)
   animate(veil, 1, { duration: IN_S, ease: EASE_EDITORIAL });
   ```
   `leave()` runs in the same batch as `setActive`, so no extra render. The A→B→A cut-in case always passes through `null`, which guarantees the reset.

5. **TabsContext: deep link** (L86–93):
   ```ts
   let r1 = 0, r2 = 0;
   if (initial && initial !== "home") {
     activeRef.current = initial; setActive(initial); setSelected(initial); leave();
     r1 = requestAnimationFrame(() => { resetScroll(); r2 = requestAnimationFrame(() => enter(initial)); });
   }
   /* popstate: unchanged */
   return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); window.removeEventListener("popstate", onPop); };
   ```
   Cancelling keeps StrictMode's double effect from bumping twice.

6. **TabsContext: provider** (L121). `const value = useMemo(() => ({ active, selected, go, veil }), [active, selected, go, veil]);` then `<TabsContext.Provider value={value}><TabVisitContext.Provider value={visit}>{children}</TabVisitContext.Provider></TabsContext.Provider>`.

7. **TabPanels** (L3, L8–27).
   - Drop `useTransform`.
   - `<motion.div style={{ opacity: veil }}>`, with **no `y`**.
   - Inside each panel `<div>`, wrap `{node}` in `<PanelVisitContext.Provider value={visit?.id === id ? visit.n : null}>`, where `const visit = useTabVisit();`.
   - Update the comment: "The swap is opacity only. At rest the wrapper carries no transform, so the sections' sticky stages and 3D contexts behave exactly as before."

8. **Reveal.tsx: the hook.** Add the imports `inView` (from `framer-motion`), `useEffect`, `useRef`, `useState`, `type RefObject`, and `usePanelVisit` from `@/context/TabsContext`.
   ```ts
   /** Bottom-only trigger band: an element at the very top of a tab can never be stranded above it. */
   const REVEAL_MARGIN = "0px 0px -10% 0px";
   export const REVEAL_S = 0.6;
   /** False while the panel is hidden; true once `ref` has entered the viewport during this visit. */
   export function useVisitReveal(ref: RefObject<Element | null>, trigger: "inView" | "mount" = "inView") {
     const visit = usePanelVisit();
     const [shown, setShown] = useState(false);
     useEffect(() => {
       setShown(false);
       if (visit === null) return;
       if (trigger === "mount") { setShown(true); return; }
       const el = ref.current;
       if (!el) return;
       // A fresh observer per visit: its first reading is taken after the swap's scroll reset.
       return inView(el, () => { setShown(true); }, { margin: REVEAL_MARGIN });   // void return = fires once, then unobserves
     }, [visit, trigger, ref]);
     return shown;
   }
   ```

9. **Reveal** (L19–32). Use `ref` and `const shown = useVisitReveal(ref, trigger)`. Set `initial={{ opacity: 0, y }}` and `animate={shown ? { opacity: 1, y: 0, transition: { duration: REVEAL_S, ease: EASE_EDITORIAL, delay } } : { opacity: 0, y, transition: { duration: 0 } }}`. **Use object targets, not variant labels.** A label-valued `animate` would turn Reveal into a variant controller and hijack descendants' variants: PricingSection L121–127 uses `"shown"` / `"hidden"` inside these wrappers. The props API is unchanged, so no call site changes.

10. **RevealLines** (L78–92).
    - Put the ref on the outer `motion.span` (it is never transformed, so IntersectionObserver sees real area; keep the L63–66 comment).
    - `animate={shown ? "show" : "hidden"}`, with no `whileInView`.
    - `line.hidden` gains `transition: { duration: 0 }`.
    - `line.show` duration goes from `1` to `0.8`.
    - Default `stagger` goes from `0.09` to `0.08`.
    - The labels stay, because this component owns its children's variants.

11. **TiltCard** (L5, L24–26, L83–90). Import `useVisitReveal` and `REVEAL_S` from `./Reveal` and drop `VIEWPORT_ONCE`. Give the entrance `motion.div` a `ref` and drive it with the same object-target pattern as Reveal (y 16, duration `REVEAL_S`, `delay`). The comment changes "swings up into place when it first scrolls into view" to "every time its tab opens". The tilt and `stage-flat` logic is untouched.

12. **Navbar: pill** (L332–341).
    - Add `layoutDependency={selected}` to the pill. Re-renders that don't change the selection (`active` flipping at 150ms, the language, the menu) then never re-snapshot it, so the glide runs to rest.
    - Move the filament out of the pill: delete the inner `<span>` at L340. After the pill, add a sibling inside the same `{on ? (<>…</>) : null}`: `<motion.span layoutId="tab-filament" layout="position" layoutDependency={selected} transition={SPRING_SNAPPY} aria-hidden="true" className="absolute bottom-[9px] left-1/2 -z-10 -ml-2 h-[2px] w-4 rounded-full bg-aqua" />`. That is 9px = the pill's `inset-y-1.5` plus the old `bottom-[3px]`. Use no `-translate-x-1/2`, because framer owns the transform. It is position-only, so it glides in step and never stretches.

13. **Navbar: rail centring** (L279–286, L308).
    - Add `relative` to the rail's className (L308). The rail then becomes the tabs' offsetParent at every width, which fixes the 148.7px error at lg.
    - Add `const firstCentre = useRef(true);` and use `behavior: reduce || firstCentre.current ? "auto" : "smooth"`, then set it to `false`. A deep link then doesn't smooth-scroll the rail on page load.

14. **Navbar: tokens.** On the tab buttons (L323), `duration-300` becomes `duration-base`. On the hover wash (L330), `duration-300` becomes `duration-base`. **Do not touch L72 (`pt-2 sm:pt-3`) or L89 (`h-14`).**

15. Run `npx tsc --noEmit`. **Never run `next build`.**

## Motion spec

| Element | Trigger | Properties | Duration / curve | Sequence | Interruption | Reduced motion |
|---|---|---|---|---|---|---|
| Veil out | tab pick (≠ active) | wrapper `opacity` 1→0 | 150ms, `easeIn` [0.42,0,1,1] | t=0 | a newer pick bumps the token; picking the current tab mid-fade fades back in (250ms editorial), with no replay | skipped (instant swap) |
| Panel swap | veil reaches 0 | `hidden` flips, visit → `null`, rAF, scroll to 0, rAF | — | t≈150ms + 2 frames | token check after each await | sync: setActive + resetScroll + enter |
| Veil in | visit bump | `opacity` 0→1, **no transform** | 250ms, editorial (0.22,1,0.36,1) | t≈183ms at 60fps; fully opaque ≈433ms | a new pick animates down from the current value | jump to 1 |
| Reveal | in view during this visit (fresh IO at the bump) | `opacity` 0→1, `y` 16→0 (Footer 60) | 600ms editorial, plus the authored `delay` (0–0.12s; InclusionsList 60ms stagger, capped at 0.48s) | starts with the veil-in, in the same frame | panel hides → jumps to hidden (`duration: 0`) | MotionConfig `"user"` drops `y`; opacity fade remains (site convention) |
| RevealLines | same | each line `y` 108%→0, `opacity` 0→1 inside its mask | 800ms editorial, stagger 80ms, plus `delay` | same | same | same |
| TiltCard entrance | same | `opacity`, `y` 16→0 | 600ms editorial, plus `delay` (Pricing `CARD_DELAY`) | same | same | same |
| Tab pill | `selected` changes (t=0, before the panels swap) | shared layout: position + size | `SPRING_SNAPPY` (k320 c26 m0.5, ζ≈1.03): ≈90% at 150ms, rest ≈260ms | runs over the veil-out, unbroken | a new pick re-targets from the current box | framer drops the transform → instant |
| Tab filament | same | shared layout, position only (no scale) | `SPRING_SNAPPY` | in step with the pill | same | instant |
| Rail centring (overflowing rail only) | `selected` changes | `scrollLeft` | native smooth; `auto` on first run and under reduced motion | in parallel with the pill (the pill rides the rail scroll, with no discontinuity because nothing re-measures mid-glide) | a new pick re-targets | `auto` |

The durations drop from 700ms to 600ms and from 1000ms to 800ms for one reason: these entrances now run on **every** tab open, and a repeated interaction must be quicker than a one-off. EASE_EDITORIAL is front-loaded, so each block reads as landed at ≈250–300ms.

## How T1 and T2 behave after T5

- **T1 dashboard (pinned):** unchanged code, still in sync. Its entrance (L147–153, two rAFs after `active` flips) starts in the same frame as the T5 visit bump and veil-in. The 14px container rise is gone, so the window's own entrance (rotateX 12°, y 40, z −100) is the only movement. The SectionHeader chip and title now replay alongside it. The veil is fully opaque at ≈433ms instead of ≈633ms, which is better than T1's AC2. The visit bump doesn't re-render DashboardShowcase (separate context), so its effects see no new deps. **T5 must keep the two-rAF sequence in `swap`.** If it ever changes, DashboardShowcase L147–153 has to match.
- **T2 simulator:** its Reveal wrappers (phone, controls, rail, panel) replay their fade and 16px rise on every open. The clock, phase, rail position and "Resume" state survive, because nothing remounts. The pause-on-leave effect (L197) still fires when `active` changes. At scroll 0 the depth tilt is 0, so the rest state is flat and legible.
- **Still first-visit only (outside T5's files, left as they are):** the unpinned dashboard window (DashboardShowcase L267–273), dashboard bars (L638, L761), the Pricing badge and feature list (L76–80, L121–127), ComparisonMatrix (L104), AnimatedNumber (L25), and the Hero mount entrances (T4's file). On a revisit they are simply visible, never broken. Follow-up **T5b**: adopt `useVisitReveal` for the bars, the Pricing list and ComparisonMatrix. **Keep AnimatedNumber `once`**: re-counting the same number on every visit is noise. T4 decides whether the hero replays. I'd say no: it is the landing beat, and the veil is enough.

## Tool choice
- **Framer Motion** for everything here: it is already in use. The `veil` MotionValue is not React state, `layoutId` gives the shared pill, and the vanilla `inView` gives a one-shot IO without a re-render.
- **No CSS transitions** for the swap, because the swap must be awaitable for the token logic.

## Acceptance criteria (Inspector)
1. `npx tsc --noEmit` is clean. No `next build` was run.
2. During a swap, `main > div` has an inline `opacity` only. `style.transform` is empty and computed `transform` is `none` at every sample (poll every 30ms around a click).
3. Code: `OUT_S = 0.15` with `"easeIn"`, `IN_S = 0.25` with `EASE_EDITORIAL`. The two `requestAnimationFrame` waits are still between `setActive` and the veil-in.
4. **Replay:** open Pricing and wait 2s, then go Home, then go Pricing again. A `MutationObserver` on `#panel-pricing` sees the `hidden` attribute drop. Right after the next visit bump, the SectionHeader chip's Reveal wrapper reads `opacity: 0` and `translateY(16px)`, then reaches `1` and `none`. Before T5 it stayed static on the second visit.
5. **No stale "seen":** at 390×844, scroll Home to its bottom, then open "How it works" (InclusionsList). Items below the fold are still `opacity 0` at scroll 0. Scrolling them into view reveals them.
6. **No remount:** store `window.__n = document.querySelector('#calculator input')` and change a calculator value. Go to another tab and back: `document.querySelector('#calculator input') === window.__n` and the value is kept. The simulator mid-run comes back as "Resume" at the same rail position (T2 AC 11). The dashboard's picked view or industry persists.
7. **Dashboard at 1440×900:** leave and return, and T1's entrance replays (the window's inline `opacity` passes through values below 1). The header chip and title animate in the same window of time. No 14px offset is anywhere on the wrapper.
8. **Stuck-veil fix:** focus the tablist on Home, then press ArrowRight and ArrowLeft within 100ms. The page ends on Home with the wrapper at opacity 1, never stuck at 0. Also: click Pricing twice within 100ms, so it ends visible with the entrance played. Click Pricing, then Home after about 200ms (after the panel swap): it ends on Home and visible.
9. **Pill:** code has `layoutDependency={selected}` on both `tab-pill` and `tab-filament`, and the filament is no longer inside the pill. Log `pill.getBoundingClientRect().left` from a MutationObserver on its `style`. Across the `active` flip, the `transform` must not jump to identity while the spring is under about 95%. The filament's rendered width stays 16px (±0.5) at every sample.
10. **Rail centring:** at 1024×768 and 1180×800, click the Pricing tab, then Home. After the scroll settles, the picked tab's centre is within ±4px of the rail's centre, or the rail is at its scroll limit. Check the same at 390×844. A deep load of `/#pricing` doesn't smooth-scroll the rail (it is already in place on the first frame).
11. **Reduced motion** (`emulateMedia({ reducedMotion: 'reduce' })`): the swap is instant with no veil fade, and Reveals fade in opacity only, with no `y`.
12. The header measures 68px at ≥640px and 64px at 390px, unchanged.
13. `/privacy`: the `trigger="mount"` title and lede still animate in once. The Footer wordmark (`y={60}`) still reveals on scroll on the home page.
14. No console errors or warnings from framer about `inView` or controls.

## Risks
- **Stale IO at the old scroll offset.** This is why observers start only at the visit bump, after `resetScroll`, and never at `setActive`. Don't "simplify" this to `active === id`.
- **Re-render fan-out.** `visit` lives in its own context and the `TabsContext` value is memoised, so the bump re-renders only TabPanels and each Reveal in the visited panel. Each Reveal's `children` are stable elements, so React bails out below it.
- **Variant hijack.** Reveal and TiltCard must use object targets, not labels (see step 9).
- **Pill and other layout nodes.** Framer re-measures only nodes marked dirty (`updateLayout` returns early when `!isLayoutDirty`), so other `layoutId`s re-rendering (NicheTabs, calculator presets) don't snap the pill. Only the pill's own re-renders did, and `layoutDependency` stops that. The rail scrolling during the glide is continuous without `layoutScroll`, because nothing re-measures mid-glide. Don't add `layoutScroll` unless AC9 fails.
- **Opacity < 1 on the wrapper** creates a stacking context only during the swap. At rest it is `opacity: 1` with no transform, so sticky and preserve-3d behave as today. With `y` gone there is now no transform at all, an improvement.
- **Not T5's bug, worth a note for T2:** the simulator grid's `[perspective:1600px]` (MissedCallSimulator L316) reaches only its direct children, the Reveal wrappers. The rotateY / rotateX tilt divs inside them render without perspective. It is cosmetic at ±3°.
- **Merge:** T2's plan said to keep the Reveal wrappers intact, and they are, because the API is unchanged. T6 touches only MagneticButton internals, and Navbar's MagneticButton call site (L151) is unchanged. T4 owns HeroChapter, which has no shared lines.

---

# Part T6 · CTA feel

**Goal:** MagneticButton keeps the spring-driven transform, eases colour, border and shadow like every other control (250ms editorial), presses to 0.97 on `snappy`, and pulls by a few pixels instead of tens.

## Findings (be honest about the bug)
- `transition-none` (L62) sets `transition-property: none` on the **element only**. The primary CTA's hover is the `.btn::after` glow (globals.css L370–383). It is a pseudo-element with its own transition, and it was **never killed**: measured `::after` `opacity 0.25s` on every `btn-aqua` MagneticButton. So "the primary CTA hover snaps" is mostly not true.
- **What does snap:** the `border-color` hover (globals.css L424–427) on the `btn-line-dark` MagneticButtons. Those are Pricing "Choose Starter" and "Choose Growth" (PricingSection L113). It would also snap any future colour or shadow change on the element.
- **The real feel problem is the pull.** Strength 0.28 × the distance from the centre is size-dependent. Measured widths at 1440: Get Started 132px gives ≈18px of pull. The hero "See pricing" is ≈170px and gives ≈24px. **Pricing "Choose …" is 372px and gives ≈52px**, on top of the TiltCard tilt the button sits in. The label "counter-motion" is actually a **lead** in the same direction, at 35% extra. At these pulls the label drifts ≈6–18px off-centre inside a 28px padding, which reads as broken. In the navbar capsule, an 18px pull slides Get Started over the Language toggle (the gap is 6px). Verdict: **too much.** Cap it, size-independent: ≤5px across and ≤3px down. **Keep the label lead** at 0.35 of the shell (≤1.75px). At that size it gives the capsule depth without decentring the text.
- **Press:** `whileTap { scale: 0.96 }` (L67) runs framer's default spring, not a token. It doesn't match `.btn:active` (0.97 over 150ms editorial, globals.css L359–367). The inline framer transform always beats `.btn:active`, so the CSS press never applies to MagneticButtons. Framer has to do the press.

## Files
- `src/components/ui/MagneticButton.tsx` only. **No `globals.css` change.**

## Steps
1. **Imports and constants** (L3–6, L23). Import `SPRING_SNAPPY` next to `MOTION`. Add:
   ```ts
   /** Max travel toward the cursor, reached at the button's edge. Size-independent (px). */
   const PULL_X = 5;
   const PULL_Y = 3;
   /** The label leads the capsule by this share of its travel (≤1.75px): depth without decentring. */
   const LABEL_LEAD = 0.35;
   /** Colour, border and shadow ease like every other control; transform belongs to the springs. */
   const EASE_CLASSES = "transition-[color,background-color,border-color,box-shadow] duration-base ease-editorial";
   ```
   The class string must stay literal, because Tailwind's JIT scans it. Tailwind emits property, then duration, then timing in plugin order, so `duration-base` (250ms) and `ease-editorial` override the arbitrary utility's 150ms default. They also replace `.btn`'s two-value duration list (`150ms, 250ms`). Without them, the four properties would cycle through that list and get the wrong durations.
2. **Props** (L15, L29). Re-document `strength` as "0–1 multiplier of the max pull (default 1)" and change its default from `0.28` to `1`. No call site passes it (checked: Navbar L151, HeroChapter L131, MissedCallSimulator L333, RevenueCalculator L226, PricingSection L107, ClientLoginModal L186), so this is safe.
3. **Pull** (L42–51):
   ```ts
   const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
   const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
   const px = nx * PULL_X * strength, py = ny * PULL_Y * strength;
   x.set(px); y.set(py); ix.set(px * LABEL_LEAD); iy.set(py * LABEL_LEAD);
   ```
   Keep the `mouse`-only guard, `reduce`, and the rect cached at `pointerenter`.
4. **Shared props** (L60–69):
   - `className: \`${className ?? ""} ${EASE_CLASSES}\``, replacing `transition-none`. Rewrite the L61 comment to: "The springs own `transform` (a CSS transform transition would smooth it twice). Colour, border and shadow keep a 250ms editorial ease."
   - `whileTap: { scale: 0.97 }`, always on. Under reduced motion, MotionConfig `"user"` makes it instant, the same as `.btn:active` with its 0.01ms transition.
   - Add `transition: { scale: SPRING_SNAPPY }`. It only affects the tap; `x` and `y` are style MotionValues driven by their own springs.
5. Update the doc comment (L25–28): it leans a few pixels toward a mouse cursor, its label leads it slightly, it presses to 0.97 on `snappy`, and colours ease at 250ms.
6. Run `npx tsc --noEmit`.

## Motion spec

| What | Trigger | Property | Value | Curve | Interruption / exit | Reduced motion |
|---|---|---|---|---|---|---|
| Pull (shell) | pointermove, mouse only | `x`, `y` | ±5px / ±3px at the edge, linear in the normalised offset | `snappy` spring (k320 c26 m0.5, ≈150ms to 90%) | pointerleave → 0 on the same spring; re-targets every move | none |
| Label lead | same | inner `x`, `y` | 0.35 × shell (≤1.75 / 1.05px) | `snappy` | same | none |
| Press | pointer down (plus keyboard Enter, where framer's press supports it) | `scale` | 0.97 | `SPRING_SNAPPY` (≈150ms to 90%, matches `.btn` 150ms) | release → 1 on the same spring | instant 0.97 |
| Hover colour / border / shadow | `:hover` | `color`, `background-color`, `border-color`, `box-shadow` | per `.btn-*` | 250ms `cubic-bezier(0.22,1,0.36,1)` | CSS reverses from its current value | 0.01ms (global `!important` rule, globals.css L170–180) |
| Hover glow | `:hover` | `::after` opacity | unchanged (already 250ms editorial) | — | — | — |

## Tool choice
- **Framer springs** for transform (pull and press): it is interruptible and composes `translate` with `scale` on one element.
- **CSS transitions** for colour, border and shadow, which the browser animates for free on hover.
- **No Tailwind `transition-transform`** on this element, ever.

## Acceptance criteria (Inspector)
1. `npx tsc --noEmit` is clean.
2. For every visible MagneticButton (Navbar Get Started; hero See pricing; Simulate; calculator CTA; the three Pricing "Choose …"; the login modal primary), the computed `transitionProperty` is `color, background-color, border-color, box-shadow`, `transitionDuration` is `0.25s`, and `transitionTimingFunction` is `cubic-bezier(0.22, 1, 0.36, 1)`. It is never `none`, `all` or `transform`.
3. Hover "Choose Starter" (a `btn-line-dark`): immediately after `hover()`, `el.getAnimations()` holds a `CSSTransition` on a `border-*-color` with `effect.getTiming().duration === 250`. This check is frame-rate-proof. Before T6 it held none.
4. Hover a `btn-aqua`: `el.getAnimations({ subtree: true })` still holds the `::after` opacity transition.
5. **Pull cap:** move the mouse to 2px inside the right edge, then the bottom edge, of each button and wait about 1s. The computed matrix's `e` (translateX) is ≤ 5.0 and `f` (translateY) is ≤ 3.0, including on the 372px Pricing buttons (they were ≈52px). The inner span's offset relative to the button is ≤ 1.75px.
6. **Press:** after `mouse.down()` on a button and about 1s, the matrix scale `a` is 0.97 ±0.002. After `mouse.up()` and about 1s it is 1. Code: `transition: { scale: SPRING_SNAPPY }`.
7. **Reduced motion emulated:** pointermove causes no translation, and the press scale still lands (instantly).
8. After clicking hero "See pricing", then returning Home and waiting about 1s, the hero CTA's transform is identity (within 0.05px), with no stuck pull. If this fails, release the pull in `onClick` before calling the caller's handler.
9. Touch and pen: no pull. Only the press applies.

## Risks
- **Tailwind ordering:** if `duration-base` or `ease-editorial` lose to the arbitrary `transition-[…]` defaults, the durations come out at 150ms. AC2 catches it.
- **A stale cached rect** after the page scrolls under a hovering cursor gives a pull computed from an old centre. It is now clamped to ±5px, so the effect is harmless.
- **A button inside TiltCard** (calculator, Pricing): the tilt and the pull compound, but at ≤5px the pull reads as a nudge, not a second motion.
- **No API change for callers** (strength semantics changed, but nobody passes it), so there is no conflict with T5's Navbar edits.

## Hand-off
- Coder A takes T5 (files above). Coder B takes T6 (`MagneticButton.tsx` only).
- They share no files and can merge in either order. Inspector runs both acceptance lists. Follow-up T5b is listed under "How T1 and T2 behave after T5".
