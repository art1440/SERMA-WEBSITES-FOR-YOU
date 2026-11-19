# T3b — Sculpture keeps its time, threads survive a GPU reset (planner: orchestrator, from T3's F1 + deep review)

## Goal
After Pause/Play, a hidden browser tab, or leaving and re-entering a 3D tab, the sculpture carries on from where it
was instead of snapping to t=0; and the light-threads backdrop comes back after a WebGL context loss.

## Evidence
- R3F 9.8.2 `setFrameloop` resets `clock.elapsedTime` to 0 on every "never" ↔ "always" switch
  (`node_modules/@react-three/fiber/dist/events-e51d7528.esm.js` ≈1278–1286). `Engine3D.tsx:405`
  `const time = state.clock.elapsedTime;` feeds every time-driven motion: camera drift (474–475), core/cage/ring
  rotation (502–513), pulse/flare/beat (515–522) and the points' `uTime` (536). Pause or a chapter exit flips the
  frameloop to "never", so the next resume restarts all of it from 0: rings and core visibly jump.
- T3 deep review: `LightThreads` has no `webglcontextlost` handler. After `loseContext()` the canvas never restores
  ("restoration not allowed" because `preventDefault` isn't called), so the backdrop stays blank after a real GPU
  reset. (Engine3D's R3F canvas does restore.)

## Files
- `src/components/three/Engine3D.tsx` (clock only)
- `src/components/three/LightThreads.tsx` (context loss/restore only)

## Steps
1. **App-owned time (Engine3D).** In `EngineScene`, add `const clockT = useRef(0);`. At the top of `useFrame`, after the
   perf block, accumulate `clockT.current += Math.min(delta, 0.1);` (cap: a backgrounded tab or a hitch must not jump
   the sculpture forward). Replace line 405 with `const time = clockT.current;`. Remove nothing else; `dt` (404) stays.
   R3F's own clock is still used internally by R3F; the app just stops reading `elapsedTime`.
2. **No other timing changes.** Every multiplier (0.31, 0.43, 0.22, …) stays. At first load the motion is identical
   (both start at 0 and advance by real delta).
3. **Context loss (LightThreads).** Move everything from `compile(...)` through the uniform locations into a local
   `init()` that (re)creates `prog`, `buf`, and the uniform locations, re-applies `resize()`'s viewport + `uRes`, and
   resets `lastDark = -1` so `uDark` is re-sent. Keep them in `let` bindings the closures read.
   - `canvas.addEventListener("webglcontextlost", onLost)`: `e.preventDefault(); cancelAnimationFrame(raf); lost = true;`
   - `canvas.addEventListener("webglcontextrestored", onRestored)`: `lost = false; init(); run();`
   - `render` returns early while `lost`. Cleanup removes both listeners and only deletes `buf`/`prog` when `!lost`.
   - Keep the existing failure paths (shader/link failure → leave the canvas blank, no throw).
4. `npx tsc --noEmit`. Never `next build`.

## Motion spec
No new motion. Resume behaviour changes: the sculpture continues from its last pose instead of snapping to t=0.

## Acceptance criteria
1. Home tab: let it run ~3 s, screenshot; Pause (footer) 2 s; Play; screenshot within 2 frames of resuming: core/ring
   rotation continues from the paused pose (no snap back to the t=0 orientation). Compare against HEAD, which snaps.
2. Home → Pricing → Home: no snap on return.
3. First load looks identical to HEAD (same t=0 pose and same speed).
4. `WEBGL_lose_context` on the LightThreads canvas → `loseContext()` then `restoreContext()`: threads render again,
   no GL errors, dark theme still applies after restore, Pause still freezes them.
5. StrictMode double mount: no GL errors, no leaked listeners (count `webglcontextlost` listeners via a wrapper).
6. `npx tsc --noEmit` clean; diff touches only the two files.

## Risks
- Capping delta at 0.1 slows the time-driven motion only on frames slower than 10 fps (already a degraded state).
- `init()` on restore must not double-register `resize`/`visibilitychange` listeners: keep those outside `init()`.
