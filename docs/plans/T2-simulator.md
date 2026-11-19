# T2 — Simulator plays on intent, not scroll (planner: Opus)

I've finished the T2 plan. One judgement call goes beyond the ticket: the new rail becomes the only progress readout, so the per-chip fill lines are removed. I checked the current state in Playwright at 1440×900, 1280×800, 1024×768 and 390×844, and the layout numbers below come from those measurements.

**What I measured:**
- **Pinned (current):** at 1440×900 the phone and panel are tilted, there is no button, and the hint says "Scroll to play".
- **Unpinned layout (reduced-motion run), 1440×900:** the button sits at y=497, the step chips at 571–673, and the dashboard metrics at 714–826. The new tracker row lands at 878–942, so the payoff is cut off by the 900px fold.
- **Phone, 390×844:** the button is at y=470 and the phone starts around y=589. The call overlay sits in the middle of the phone, below the fold, so nobody sees it.

# PLAN — T2 · Simulator plays on intent, not scroll

## Goal
Phone and panel rest flat and legible at every scroll position. One button plays a 7.4s missed-call story on a single clock. A keyboard-operable rail scrubs it, plus replay/restart. Scroll only adds a tilt of 5° or less when you scroll past. Pause and reduced motion are honoured.

**Judgement calls:**
- **No springs in the story.** The story runs on a linear time clock. Springs can't be scrubbed deterministically, and that is where the "value jumps" come from (`AnimatedNumber`'s slow spring counts down when you rewind).
- **One continuous mover.** The only thing that moves all the time is the rail thumb. The per-chip fill lines (L257-266) are deleted: two progress bars moving at once is noise.
- **Pause control = step mode.** While the site-wide pause is on, nothing advances by itself. The main button becomes "Next step".

## Files
- MODIFY `src/components/sections/MissedCallSimulator.tsx` (the only component)
- MODIFY `src/i18n/dictionary.ts`: EN `simulator` (L191-226) and ES `simulator` (L538-573). The ES copy is type-checked against the EN shape, so both must change.
- Do NOT touch `SceneContext.tsx` (`useTrackProgress`) or `FitStage.tsx`. `DashboardShowcase` still uses both.

## Steps

**1. Dictionary (EN L194-199, ES L541-546)**
- Delete `scrollHint` and `running` in both languages. They are used only in this file; I checked with grep.
- Change EN `button` to `"Simulate a Missed Call"`. ES stays `"Simular una Llamada Perdida"`. `replay` stays as it is.
- Add these keys:

| Key | EN | ES |
|---|---|---|
| `pause` | "Pause" | "Pausar" |
| `resume` | "Resume" | "Reanudar" |
| `nextStep` | "Next step" | "Siguiente paso" |
| `restart` | "Restart the simulation" | "Reiniciar la simulación" |
| `railLabel` | "Simulation timeline" | "Línea de tiempo de la simulación" |
| `railValue` | "Step {n} of {total}: {step}" | "Paso {n} de {total}: {step}" |
| `railIdle` | "Not started" | "Sin iniciar" |

- `idleScreen` stays. It still matches the button ("Simulate"/"Simular").
- Verify: `npx tsc --noEmit` errors only point at `MissedCallSimulator` (fixed in the next steps).

**2. Timeline constants (replace L24-49: `TIMELINE`, `SCROLL_STARTS`, `phaseAt`)**
```ts
/** Story beats, ms from "Simulate". One linear clock drives everything; the rail scrubs it. */
const BEAT = { ringing: 0, missed: 1300, typing1: 2100, sms1: 2700, reply: 4200, typing2: 4800, confirm: 5400, logged: 6400, end: 7400 } as const;
type Beat = Exclude<Phase, "idle">;
const ORDER: Beat[] = ["ringing","missed","typing1","sms1","reply","typing2","confirm","logged"];
/** Clock → phase. The clock never maps to "idle": idle is a status (never started / reset). */
const phaseAt = (ms: number): Beat => { let p: Beat = "ringing"; for (const b of ORDER) if (ms >= BEAT[b]) p = b; return p; };
/** Where Arrow keys and "Next step" stop. */
const STOPS = [0, BEAT.missed, BEAT.sms1, BEAT.reply, BEAT.confirm, BEAT.end];
/** Rail tick dots = the four progress chips completing. */
const TICKS = [BEAT.missed, BEAT.sms1, BEAT.confirm, BEAT.logged];
const EASE_COUNT = cubicBezier(...EASE_EDITORIAL); // import { cubicBezier } from "framer-motion" (re-exported from motion-utils)
type Status = "idle" | "playing" | "paused" | "done";
type Tempo = "play" | "scrub" | "instant";
const dur = (t: Tempo, s: number) => (t === "instant" ? 0 : t === "scrub" ? Math.min(s, 0.15) : s);
```
Keep `PHASES` (L21) and `at` (L36) as they are.

**3. Imports (L3-18)**
- Remove: `ArrowDown`, `FitStage`, `AnimatedNumber`, `useTrackProgress`, `useTransform` (if no longer used).
- Add from framer-motion: `animate`, `useMotionValue`, `useScroll`, `useSpring`, `useTransform`, `cubicBezier`, `type AnimationPlaybackControls`.
- Add: lucide `Pause`, `Play`, `SkipForward`; `useMotionPause` from `@/context/MotionPauseContext`; `useTabs` from `@/context/TabsContext`; `MOTION` from `@/lib/motion`.

**4. Clock engine (replace L85-148; delete `timers`, `clearTimers`, `start`, `scrubbed`, the old `useTransform` tilts at L93-99, and the scroll `useMotionValueEvent` at L115-124)**
```ts
const clock = useMotionValue(0);
const run = useRef<AnimationPlaybackControls | null>(null);
const [status, setStatus] = useState<Status>("idle");
const [phase, setPhase] = useState<Phase>("idle");
const [scrubbing, setScrubbing] = useState(false);
const statusRef = useRef(status); statusRef.current = status;
const phaseRef = useRef<Phase>("idle"); phaseRef.current = phase;
const announceOn = useRef(false);   // true while playing or stepping; false while scrubbing/keyboard-seeking
const { paused: globalPaused } = useMotionPause();
const tabs = useTabs();

// Phase follows the clock; React re-renders only when a boundary is crossed.
const sync = (ms: number) => {
  const next = phaseAt(ms);
  if (next === phaseRef.current) return;
  phaseRef.current = next; setPhase(next);
  if (!announceOn.current) return;
  if (next === "ringing") setAnnouncement(fill(t.simulator.announceIncoming, { name: sim.caller }));
  if (next === "missed")  setAnnouncement(fill(t.simulator.announceMissed, { name: sim.caller }));
  if (next === "logged")  setAnnouncement(fill(t.simulator.announceBooked, { name: sim.caller, service, time, amount: amountLabel }));
};
useMotionValueEvent(clock, "change", (v) => { if (statusRef.current !== "idle") sync(v); });

const halt = () => { run.current?.stop(); run.current = null; };
const play = (from: number) => {
  halt(); announceOn.current = true;
  clock.set(from); sync(from);                 // REQUIRED: set() to the same value fires no "change"
  setStatus("playing"); statusRef.current = "playing";
  run.current = animate(clock, BEAT.end, { duration: (BEAT.end - from) / 1000, ease: "linear",
    onComplete: () => { run.current = null; setStatus("done"); } });
};
const pause = () => { if (!run.current) return; halt(); setStatus("paused"); };
const seek = (ms: number, opts: { announce?: boolean } = {}) => {
  const v = Math.max(0, Math.min(BEAT.end, ms));
  const keepPlaying = statusRef.current === "playing" && v < BEAT.end && !globalPaused;
  halt(); announceOn.current = !!opts.announce;
  statusRef.current = "paused";                // so sync() runs even when coming from idle
  clock.set(v); sync(v);
  if (keepPlaying) play(v); else setStatus(v >= BEAT.end ? "done" : "paused");
};
const reset = () => { halt(); clock.set(0); statusRef.current = "idle"; setStatus("idle"); phaseRef.current = "idle"; setPhase("idle"); setAnnouncement(""); };
```
Wire these effects:
- **Industry change:** `useEffect(reset, [niche.id])` replaces L109-113.
- **Unmount:** `useEffect(() => halt, [])` replaces L126.
- **Site-wide pause:** `useEffect(() => { if (globalPaused) pause(); }, [globalPaused])`. Don't auto-resume when it lifts.
- **Leaving the tab:** `useEffect(() => { if (tabs && tabs.active !== "simulator") pause(); }, [tabs?.active])`.
- **Browser tab hidden:** a `visibilitychange` listener that calls `pause()` when `document.hidden`.

**5. Main button (replace the `MagneticButton` block L206-217; delete the `scrubbed` branch L194-204)**

`onClick`:
- If the site-wide pause is on (step mode): `seek(status === "done" ? 0 : STOPS.find(s => s > clock.get()) ?? BEAT.end, { announce: true })`. From `idle`, the first press goes to 0, which shows the ringing screen. Write it as `status === "idle" ? 0 : …`.
- Otherwise:
  - idle → `play(0)`, then `nudgePhone()` (step 9)
  - playing → `pause()`
  - paused → `play(clock.get())`
  - done → `play(0)`, then `nudgePhone()`

Label and icon (all icons 17px, `strokeWidth={1.75}`, as now):

| State | Normal | Site-wide pause on |
|---|---|---|
| idle | `PhoneIncoming` + `button` | `SkipForward` + `nextStep` |
| playing | `Pause` + `pause` | — (playback stops when the pause turns on) |
| paused | `Play` + `resume` | `SkipForward` + `nextStep` |
| done | `RotateCcw` + `replay` | `RotateCcw` + `replay` |

- Remove `aria-disabled` and `aria-disabled:cursor-progress`.
- Add `sm:min-w-[19rem]` so a label change never moves the niche chip. Measure the widest label across both locales and adjust the value.

**6. Rail row (new, inside the same controls `Reveal`, directly under the button row; the wrapper becomes `flex flex-col gap-3`)**

The rail lives in the controls block, so on phones it sits above the phone (that block is `order-first`).
```tsx
<div className="flex items-center gap-3">
  <div className="relative min-w-0 flex-1">
    <input ref={railRef} type="range" min={0} max={BEAT.end} step={10} defaultValue={0} className="range"
      aria-label={t.simulator.railLabel} aria-valuetext={railText}
      onPointerDown={onRailDown} onChange={(e) => clock.set(Number(e.currentTarget.value))} onKeyDown={onRailKey} />
    {TICKS.map((ms) => (
      <span key={ms} aria-hidden="true" className="pointer-events-none absolute top-[calc(50%+15px)] h-1 w-1 -translate-x-1/2 rounded-full bg-bone/35"
        style={{ left: `calc(13px + (100% - 26px) * ${ms / BEAT.end})` }} />
    ))}
  </div>
  <button type="button" onClick={() => (globalPaused ? seek(0, { announce: true }) : play(0))} disabled={status === "idle"}
    aria-label={t.simulator.restart} className="btn-line-dark btn-sm h-11 w-11 shrink-0 !px-0 disabled:opacity-40">
    <RotateCcw aria-hidden="true" size={16} strokeWidth={1.75} />
  </button>
</div>
```
- **Rail rendering:** no React re-render per frame. Use `useEffect(() => { const w = (v: number) => { const el = railRef.current; if (!el) return; el.value = String(Math.round(v)); el.style.setProperty("--fill", `${(v / BEAT.end) * 100}%`); }; w(clock.get()); return clock.on("change", w); }, [clock])`. The input is uncontrolled (`defaultValue`), never `value=`.
- **`onRailDown`:**
  - Remember `scrubFrom.current = statusRef.current`, then `halt()`, `announceOn.current = false`, `setScrubbing(true)`.
  - If idle: set `statusRef.current = "paused"` and `setStatus("paused")`.
  - Attach `window` `pointerup` and `pointercancel` listeners (`{ once: true }`) that call `endScrub`. Don't use pointer capture on a native range.
  - The clock moves through `onChange`, and `sync` runs because status is no longer idle.
- **`endScrub`:** `setScrubbing(false)`. Then, with `v = clock.get()`: if `scrubFrom.current === "playing"` and `v < BEAT.end` and the site-wide pause is off, `play(v)`. Otherwise `setStatus(v >= BEAT.end ? "done" : "paused")`.
- **`onRailKey`** (call `preventDefault` for each key it handles):
  - ArrowRight/ArrowUp/PageUp → `seek(next STOP > clock)`
  - ArrowLeft/ArrowDown/PageDown → `seek(previous STOP < clock − 1)`
  - Home → `seek(0)`
  - End → `seek(BEAT.end)`
  - A keyboard seek keeps playback running if it was running (handled inside `seek`).
- **`railText`:**
  - Idle: `t.simulator.railIdle`.
  - Otherwise: `n = currentStep === -1 ? 4 : currentStep + 1`, then `fill(t.simulator.railValue, { n, total: 4, step: t.simulator.steps[n - 1] })`.
  - Keep `stepDone` and `currentStep` from L150-151 unchanged.
- **Accessibility:** the native range gives `role=slider` plus `aria-valuenow`, `aria-valuemin` and `aria-valuemax` implicitly. Don't add `role` yourself.

**7. Stage layout: unpin and flatten (L156-179, L371-373)**
- **Section (L161):** `className="relative isolate z-10 overflow-clip py-24 text-bone lg:pb-24 lg:pt-16"`. This drops `lg:py-32` and both `motion-safe:lg:` classes. Change `ref={track.ref}` to `ref={sectionRef}` (`useRef<HTMLElement>(null)`).
- **Wrappers:** delete the sticky div (L164 and its closing tag at L373). Replace `<FitStage …>` / `</FitStage>` (L165/L372) with `<div className="frame">` / `</div>`.
- **Header (L172):** always pass `body={t.simulator.body}`.
- **Grid (L179):** `mt-10 md:mt-14 lg:mt-12`. If acceptance 2 fails, try `lg:mt-10`.
- **Disclaimer (L371):** `className="mt-8"`.
- **Chips (L257-266):** delete the fill-line block and its `mt-auto pt-3` wrapper. Chip state flips are instant class swaps.

**8. Scroll depth tilt (replace L93-99 and the `style` props at L182 and L191)**
```ts
const tilt = desktop && !reduce;
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
const depth = useSpring(scrollYProgress, MOTION.cinematic);
const phoneRotY = useTransform(depth, [0, 0.4], [0, 5]);
const phoneRotX = useTransform(depth, [0, 0.4], [0, 3]);
const panelRotY = useTransform(depth, [0, 0.4], [0, -3]);
```
- `useTransform` clamps by default.
- Phone wrapper (L182): `style={tilt ? { rotateY: phoneRotY, rotateX: phoneRotX } : undefined}`. Also attach `ref={phoneRef}` here (used in step 9).
- Panel (L191): `style={tilt ? { rotateY: panelRotY, transformOrigin: "100% 50%" } : undefined}`.
- No `z` and no `x`. At scroll 0 every value is 0, so the transform is `none` and the text stays crisp. The tilt never reads or writes the clock.

**9. Phones: bring the phone into view on Simulate (`nudgePhone`)**

Only runs when `matchMedia("(max-width: 767px)")` matches:
```ts
const r = phoneRef.current!.getBoundingClientRect(), rail = railRef.current!.getBoundingClientRect();
const delta = Math.min(r.bottom + 16 - innerHeight, rail.top - 128); // keep the rail below navbar + tab strip
if (delta > 0) window.scrollBy({ top: delta, behavior: reduce ? "auto" : "smooth" });
```
This is a single scroll in response to an explicit press, not scroll-jacking. It never runs on md and up.

**10. Clock-driven revenue counter (replace `AnimatedNumber` at L284)**

New local component `RecoveredAmount({ clock, amount, reduce, logged })`:
- Render `<span className="tabular whitespace-nowrap"><span ref={ref} aria-hidden="true">{formatCurrency(0, intlLocale)}</span><span className="sr-only">{formatCurrency(logged ? amount : 0, intlLocale)}</span></span>`.
- Effect, with deps `[clock, amount, reduce, intlLocale]`: `const valueAt = (ms) => reduce ? (ms >= BEAT.logged ? amount : 0) : amount * EASE_COUNT(Math.min(1, Math.max(0, (ms - BEAT.logged) / (BEAT.end - BEAT.logged))))`. Render it with `ref.current.textContent = formatCurrency(valueAt(ms), intlLocale)`, call it once on mount, then `return clock.on("change", render)`.

**11. Tempo and loops passed down**
- In the component: `const tempo: Tempo = reduce ? "instant" : scrubbing ? "scrub" : "play"` and `const live = status === "playing" && !reduce && !globalPaused`.
- Change `Phone({ phase })` (L388) to `Phone({ phase, tempo, live })`. Pass `tempo` to `Bubble` and `Typing`, and `live` to `Typing`.
- Use `dur(tempo, x)` for every duration listed in the motion spec.
- Ring pulses (L517-528) render only when `phase === "ringing" && live`.
- `Typing` dots (L610-616) get `animate`/`transition` only when `live`. Otherwise they render as static spans at `opacity: 0.7`.

## Motion spec

**Trigger:** the button or the rail, never scroll.
**Clock:** a MotionValue in ms, animated linearly 0 → 7400 (framer `animate`, `ease: "linear"`).
**Tokens:** every visual move uses `EASE_EDITORIAL` with the `dur-*` token durations (fast 150 / base 250 / slow 450ms). No springs inside the story.

| t (ms) | Beat (lasts) | What moves (together) | Props · duration · ease | What stays still |
|---|---|---|---|---|
| 0 | ringing (1300) | Call overlay rises in. Two ring pulses. | Overlay: opacity 0→1, y 24→0, 450ms editorial (L501-504; change 30→24 and 0.5→0.45). Rings: scale 1→1.9, opacity 0.6→0, 850ms `easeOut`, delay 200 + i×350ms, no repeat (replaces 1.2s/repeat 1). | Phone frame, whole panel |
| 1300 | missed (800) | Glow cross-fade (existing CSS `duration-slow ease-editorial`, L508/L513). Icon and text swap instantly. Rings unmount. Chip 1 → done. | opacity 450ms | Overlay position |
| 2100 | typing1 (600) | Overlay lifts away. Aqua typing pill appears under it. | Overlay exit: opacity →0, y →−24, 450ms. Pill: opacity 0→1, scale 0.9→1, 250ms editorial. | Panel |
| 2700 | sms1 (1500) | Pill out. Auto-SMS bubble in. "Text-back time" goes "—" → "4 sec" (instant). Chip 2 → done. | Pill exit 150ms. Bubble: opacity, y 14→0, scale 0.96→1, 450ms editorial, origin bottom-right (L578-582 as now). | Earlier rows, counter |
| 4200 | reply (600) | Customer bubble in from the left. | Same 450ms, origin bottom-left. | Panel |
| 4800 | typing2 (600) | Typing pill in. | 250ms | Panel |
| 5400 | confirm (1000) | Pill out. Confirm bubble in. Earlier bubbles shift up through `layout`. Chip 3 → done. | 150 / 450 / layout 450ms | Panel |
| 6400 | logged (1000) | New tracker row drops in. Earlier rows slide down. Counter $0 → amount. Chip 4 → done. | Row: opacity 0→1, y −16→0, scale 0.98→1, 450ms (L310-313: −24→−16, 0.7→0.45). Earlier-row layout 450ms (L342: 0.7→0.45). Counter: 1000ms, `EASE_COUNT`, clock-driven. | The whole phone |
| 7400 | done | Nothing. No loops; the final state holds. Button shows "Run the simulation again". | — | Everything |

- **Total:** 7.4s.
- **Continuous motion:** only the rail thumb (linear).
- **Interruption:**
  - Restart, replay, scrub and keyboard seeks all go through `halt()` and `clock.set()`.
  - Visible state is a pure function of the clock. Bubbles and rows enter and exit by key, and the counter is interpolated. So any jump is a clean cut, and the counter can never run the wrong way or overshoot.
  - Restarting mid-run goes straight to "ringing": the overlay (450ms) covers the thread while old bubbles fade out.
  - While dragging, every enter/exit is capped at 150ms so the screen keeps up with the thumb.
- **Exit:** exits are opacity only (plus the overlay's y −24). Unmount by `AnimatePresence` as now.
- **Scroll:** phone `rotateY` 0→5°, phone `rotateX` 0→3°, panel `rotateY` 0→−3°, over section progress 0→0.4 ("start start" → "end start"), smoothed with `MOTION.cinematic`. lg only. Exactly 0 at scroll 0.
- **Reduced motion:** tempo "instant" makes every duration 0. No tilt, no ring pulses, static typing dots, and the counter snaps to its final value at `logged`. The clock still runs in time, because phases are content, not motion.
- **Pause control (site-wide):** playback stops at once. The button becomes "Next step", which steps through `STOPS`. Nothing advances by itself, and lifting the pause does not resume.

## Tool choice
- **Clock:** Framer Motion's imperative `animate()` on a MotionValue (already a dependency). It is linear, stoppable, and subscribes without re-rendering.
- **Rendering:** React state only at the 8 phase boundaries.
- **Rail:** a native `<input type="range">` with the existing `.range` style. It gives role, ARIA values, keyboard and touch for free.
- **Glows:** keep the existing CSS cross-fade.
- **No GSAP.** Nothing here needs it.

## Acceptance criteria (Inspector, Playwright on the dev server; never run `next build`)

1. **Rest state.** At 1440×900, `/#simulator`, scroll 0:
   - The computed `transform` of the phone wrapper and the panel column is `none`.
   - No "Scroll to play" text anywhere.
   - The "Simulate a Missed Call" button and `getByRole('slider', { name: 'Simulation timeline' })` are in the viewport. The slider has value 0 and `aria-valuetext` "Not started".
   - The body copy is visible.
2. **Full play.** Click the button:
   - +1.0s: "Incoming call" is visible.
   - +1.8s: "Missed call" is visible.
   - +3.2s: the auto-SMS bubble is present.
   - +7.8s: the "New" tracker row exists and its bottom is ≤ 900. The revenue text equals the formatted `sim.amount`. The slider value is 7400. The button reads "Run the simulation again".
   - `window.scrollY` stays 0 the whole time.
   - At 1280×800, record the row's position. Up to about 100px below the fold is acceptable as long as the revenue tile is fully visible.
3. **Scroll never advances the story.** While idle, scroll by 400px and wait 1s: the idle screen is still showing and the slider is still 0. The phone's computed `rotateY` is ≤ 5°.
4. **Clean restart.** At +4.5s, click Restart:
   - Within 100ms the slider is < 200 and the overlay is present.
   - 200ms later there are no SMS bubbles and the revenue reads "$0".
   - The run reaches 7400 after another 7.4s (±150ms).
5. **No jumps.** Sample the revenue text every frame (rAF) from 6.4s to 7.4s. It never decreases, and no single-frame step exceeds 25% of the amount. Then drag the slider from 95% to 10% and sample again: it never increases and lands on "$0".
6. **Drag resumes.** Drag while it plays, then release at about 30%: the value keeps increasing from there. Drag while it is paused: it stays paused.
7. **Keyboard.** Focus the slider:
   - End → value 7400, and the tracker row shows.
   - Home → 0.
   - ArrowRight → 1300.
   - Two more ArrowRight → 4200.
   - `aria-valuetext` updates at each stop (e.g. "Step 3 of 4: Appointment booked" at 4200).
   - Tab reaches the slider and then Restart.
8. **Site-wide pause.** Mid-run, click the footer "Pause animations":
   - The slider value stays frozen (±10ms) for 1s, and the button reads "Next step".
   - Each click moves to the next value in `STOPS`.
   - Clicking "Play animations" leaves it paused.
9. **Reduced motion** (`reducedMotion: 'reduce'`): wrapper transforms are `none`, and the story still completes in 7.4s. When a bubble mounts, its computed opacity is 1 on the next frame. The typing dots have no running animation.
10. **Phone, 390×844.** At scroll 0, the button and the slider are in the viewport. Pressing the button scrolls the page so the phone's bottom is ≤ 828 and the slider's top is ≥ 128, and the story plays. Repeat in ES: the labels fit and the button width doesn't change between states (also check at 640px or wider).
11. **Leaving the tab.** Switch to the ROI tab mid-run, then come back: the value hasn't changed and the button reads "Resume". After an industry change the simulator resets to idle.
12. **Checks.** `npx tsc --noEmit` is clean. No new console errors. `grep scrollHint MissedCallSimulator.tsx` finds nothing.

## Risks
- **Silent phase sync.** `clock.set(x)` to the current value fires no "change" event. That is why `play` and `seek` call `sync()` themselves; without it, Simulate from idle would stay on the idle screen.
- **Reduced motion and `animate()`.** `MotionConfig reducedMotion="user"` (Providers.tsx L17) should not affect `animate()` on a standalone MotionValue. Acceptance 9 checks that the clock still runs.
- **Missing pointerup.** A pointerup outside the input could leave `scrubbing` stuck on. The window listeners plus `pointercancel` cover it, and a touch that turns into a vertical scroll fires `pointercancel`.
- **Re-render storms.** Never make the range controlled (`value=`), and never put clock values in React state. Write the rail and counter imperatively; state changes only at the 8 phase boundaries.
- **Hidden panels.** Panels stay mounted and hidden. `useScroll` re-measures on the scroll event that `TabsContext` fires, and the tilt is 0 at scroll 0 either way.
- **Layout budget at 1440×900.** It is tight: about 823–887px against 900 by my arithmetic (−64px top padding, −32px grid margin, −15px chips, +56px rail). Measure, and use the `lg:mt-10` fallback if needed.
- **Bundle and performance.** No new dependencies. Everything animates transform and opacity only. Glass stays `glass-flat` inside the tilted wrappers.
- **Merge conflict.** T5 will rework `Reveal`. This plan only uses it as it is, so keep the Reveal wrappers intact to make the merge easy.
