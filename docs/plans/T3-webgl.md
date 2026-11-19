# T3 — WebGL hygiene (planner: Opus)

Two of the three console problems cannot be fixed from app code, and I proved both. The ReadPixels warning comes from this container's software compositing: a bare WebGL canvas with nothing drawn produces it. The THREE.Clock warning comes from inside R3F 9.8.2, which is already the latest release. The coder should not try to make either warning go away. What the coder can fix is in the render loops: a real adaptive-DPR bug, per-frame allocations, a GL resource leak and one redundant uniform.

## Goal
Remove the real waste in the two render loops (adaptive-DPR bug, per-frame allocations, GL leaks, a redundant uniform) with no visual change. The ReadPixels and Clock warnings stay, because neither comes from app code.

## Constraints
- Next 16, React 19.3 (StrictMode is on: `next.config.ts:28`), three 0.187, R3F 9.8.2.
- Check with `npx tsc --noEmit`. Never run `next build`.
- Keep every numeric constant, curve and colour exactly as it is.

## Diagnosis and evidence

### (1) "GPU stall due to ReadPixels": not caused by app code. No code change for this.
- **No app-level read.** I wrapped `readPixels`, `getImageData`, `toDataURL`, `texImage2D`/`texSubImage2D`, `finish` and `fenceSync` on WebGL1 and WebGL2 with stack logging and loaded the home tab for 11s, scrolling.
  - There were 0 calls to `readPixels`, `getImageData` and `toDataURL`.
  - The warnings fire at about 1.07–1.25s. That is before three's context even exists (about 1.37s), so R3F/three internals are ruled out.
- **Variants (scratchpad `exp.js`).**
  - Forcing `premultipliedAlpha:true` on LightThreads: still warns.
  - `alpha:false`: still warns.
  - Disabling the Stage probe's `loseContext`: still warns.
  - Stubbing LightThreads' `drawArrays`: still warns.
  - Returning null for the LightThreads context: the warning just moves to the three.js context.
  - So it fires for whichever WebGL canvas gets composited first. Chrome caps it at 4 messages in total, which is why only one context shows up.
- **Control (scratchpad `minimal.js`).** A blank page with `<canvas>` and `getContext('webgl')`, plus one `clear`, or even zero frames, emits the same warning. It does so with `preserveDrawingBuffer:true`, with `premultipliedAlpha:false`, and on both the headless-shell and full `chromium` channels.
- **Root cause.** chrome://gpu in this container reports "Compositing: Software only", and the renderer is "ANGLE … SwiftShader". Under software compositing, Chrome itself reads back every presented WebGL frame with glReadPixels.
  - On hardware-composited Chrome this does not happen.
  - The Stage.tsx probe (Stage.tsx:81–91) is not the cause: it never draws and is never composited.
- **Instruction to the coder.** Do not touch `preserveDrawingBuffer`, `premultipliedAlpha`, the Stage probe, or `console.warn` for this.

### (2) "THREE.Clock deprecated": inside R3F. Do not plan a hack.
- **Who constructs it.** R3F's `createStore` always does `clock: new THREE.Clock()`, at `node_modules/@react-three/fiber/dist/events-e51d7528.esm.js:1207`.
- **Who warns.** three's Clock constructor, at `node_modules/three/src/core/Clock.js:61` ("@deprecated since r183"). It fires once per Canvas mount.
- **Versions.** `npm view @react-three/fiber dist-tags` gives latest = 9.8.2, which is what's installed. Only the 10.0 canary/alpha lines are newer.
- **Repo code.** `grep -rn "Clock" src` finds no THREE.Clock. The app's only contact with it is reading `state.clock.elapsedTime` at Engine3D.tsx:382.
- **Instruction to the coder.** Leave it. No console filter, no patch-package, no `setConsoleFunction`, and no app-owned `THREE.Timer` swap. An app-owned Timer would change visible timing (see Follow-up F1). Revisit when R3F ships a Timer-based store.

### (3a) Adaptive DPR is undone on the next Canvas re-render. This is a real bug.
- **What should happen.** EngineScene calls `setDpr(1)` after 90 slow frames (Engine3D.tsx:297, 367–380).
- **Why it gets undone.** R3F's Canvas runs `configure()` in a layout effect that has no dependency list (`react-three-fiber.esm.js`, the CanvasImpl effect). `configure` then runs `if (state.viewport.dpr !== calculateDpr(dpr)) state.setDpr(dpr)` (events-e51d7528.esm.js:1659). That check is not guarded by `changed()`.
  - So any re-render of Engine3D puts the `dpr={[1,1.75]}` prop back: a Pause toggle, `active`/`ready` flipping, or Stage re-rendering.
  - `perf.lowered` is already true at that point, so it never lowers again.
- **Proof (scratchpad `dpr3.js`, deviceScaleFactor 2).**
  - The canvas went from 2493 to 1425 px at 41.4s, via `setDpr` from useFrame.
  - Clicking Pause put it back from 1425 to 2493 at 47.97s, via `Object.setDpr` from configure. It ended at 2493.
- **Side effect while paused.** That resize happens while the frameloop is "never". Resizing a canvas clears its buffer, so the paused sculpture can blank out.

### (3b) uPixelRatio goes stale after a DPR change.
- `uPixelRatio` is read once, when the material is created (Engine3D.tsx:326).
- After a drop to 1×, the points keep the 1.75 factor, so they are drawn 1.75× too large in CSS pixels.
- (3a) and (3b) must ship together. Otherwise fixing (3a) makes the oversized points permanent.

### (3c) Per-frame allocations in `useFrame` (Engine3D.tsx:366–532)
- `posesFor(desktop)` at line 387 allocates 5 objects per frame.
- Line 398 allocates a spread plus the `mix` result. Lines 403–404 allocate two `mix` results.
- Every `kf([[…],[…]], x)` call at lines 423–440 allocates its keyframe arrays: 12–23 arrays per frame, depending on the branch.
- Together that is about 20–30 short-lived objects per frame.

### (3d) LightThreads leaks GL objects and re-sends an unchanged uniform
- **Leak.** The effect cleanup (LightThreads.tsx:212–217) never deletes `prog`, `vs`, `fs` or `buf`.
  - Under StrictMode the effect runs twice on the same canvas: my trace shows two `getContext` calls, at 764 and 825 ms, and `getContext` returns the same context. So a second program and buffer are created and the first set leaks.
  - The failure paths at lines 119 and 124 also leak shaders.
- **Uniform.** `uDark` is sent with `gl.uniform1f` every frame (line 174) even though it only changes when the colour scheme does. Raw WebGL has no uniform cache.

### (3e) RoomEnvironment is never disposed
`new RoomEnvironment()` at Engine3D.tsx:263 is never disposed: its geometries and materials leak on every mount. In r187 it has `dispose()` (RoomEnvironment.js:147).

### Checked and fine (no change)
- **Engine3D render loop.** It stops when paused or off-chapter: `frameloop "never"` (Engine3D.tsx:636, Stage.tsx:177). R3F's rAF loop exits when nothing is rendering, and a hidden tab gets no rAF.
- **LightThreads render loop.** It stops on pause and when the tab is hidden (lines 190–210).
- **DPR caps.** `[1,1.75]` on desktop and `[1,1.25]` on phones are sensible.
- **Glow texture.** It comes from a 128×128 2D canvas, which is below Chrome's threshold for GPU-accelerated canvas, so uploading it needs no GPU readback.
- **Material colour lerps** (Engine3D.tsx:511–531). **Deliberately not guarded.**
  - three's WebGLUniforms cache already skips `gl.uniform*` calls when the value is unchanged, and the CPU cost is about 10 lerps.
  - A "skip when the dark mix is unchanged" guard would leave stale light colours when `desktop` flips. That flip swaps the core material (lines 553–571) and rebuilds `pointsMaterial` (lines 315–333), both of which start with light colours.

## Files
- `src/components/three/Engine3D.tsx`: modify.
- `src/components/three/LightThreads.tsx`: modify.
- `src/components/three/Stage.tsx`: **no change** (the probe is cleared, see (1)).

## Steps

1. **Keep the adaptive DPR drop (Engine3D.tsx).**
   - In `Engine3D` (line 629), add `const [lowDpr, setLowDpr] = useState(false);` and `const onLowDpr = useCallback(() => setLowDpr(true), []);`.
   - Change line 635 to `dpr={lowDpr ? 1 : inputs.desktop ? [1, 1.75] : [1, 1.25]}`, keeping the comment.
   - Pass `onLowDpr={onLowDpr}` to `<EngineScene>` (line 649).
   - In `EngineScene`:
     - Add `onLowDpr: () => void` to its props type: `Omit<Props, "active"> & { onLowDpr: () => void }`.
     - Delete `const setDpr = useThree((s) => s.setDpr);` (line 297).
     - At line 374, replace `setDpr(1);` with `onLowDpr();`.
     - Keep the `perf` logic and the 90-frame / 1/40 threshold exactly as they are.
   - Verify: `dpr3.js` must end with `855,1425`, not `855,2493`, and there must be no `1425 -> 2493` line after "click pause".

2. **Keep uPixelRatio in step with the real DPR (Engine3D.tsx).**
   - In `useFrame`, next to `u.uTime.value = time;` (line 513), add:
     `const pr = Math.min(state.gl.getPixelRatio(), 2); if (u.uPixelRatio.value !== pr) u.uPixelRatio.value = pr;`
   - Keep the initial value at line 326 as it is.
   - At full DPR this is a no-op: the same value as today.
   - Verify: `tsc` passes. At full DPR, screenshots are identical.

3. **Hoist the poses (Engine3D.tsx:99–113).**
   - Replace `posesFor()` with a module constant:
     `const POSES = { desktop: {...}, mobile: {...} } as const`
     using the exact same numbers.
   - Add a precomputed `finaleFrom` to each set: `{ ...finale, s: finale.s * 0.6, z: finale.z - 2 }`. That is desktop `{x:2.2,y:0.05,z:-2,s:0.63}` and mobile `{x:0,y:1.6,z:-3.6,s:0.432}`. Write it as an expression from the finale pose, not as literals.
   - Add `function mixInto(out: Pose, a: Readonly<Pose>, b: Readonly<Pose>, t: number): Pose`. It writes x, y, z and s into `out` and returns it. Remove the allocating `mix` (lines 92–97) once nothing uses it.
   - Add two module-level scratch poses: `const poseA: Pose = {…}` and `const poseB: Pose = {…}`. Do not name either one `scratch`: that name is already taken by the THREE.Color at line 51.
   - Update the call sites:
     - Line 293: `useRef<Pose>({ ...(desktop ? POSES.desktop : POSES.mobile).hero })`. **Keep the spread**, because the damped follow at lines 461–464 mutates `pose.current`. Pointing it straight at the constant would corrupt the pose table.
     - Line 387: `const P = desktop ? POSES.desktop : POSES.mobile;`
     - Line 398: `target = mixInto(poseA, P.finaleFrom, P.finale, ss(f, 0, 0.55));`
     - Lines 403–404: `const dive = mixInto(poseA, P.hero, P.dive, ss(h, 0.08, 0.45)); target = mixInto(poseB, dive, P.system, ss(h, 0.6, 0.98));`. The input and output must be different scratch objects.
     - Line 409: `target = P.system;` is read-only and stays.
   - Type `target` as `Readonly<Pose>`.
   - Verify: `tsc` passes. Nothing writes into `P.*` or `target`: grep for `target.` and `P.` assignments.

4. **Hoist the keyframe tables (Engine3D.tsx:421–441).**
   - Change `kf`'s parameter type (line 62) to `frames: readonly (readonly [number, number])[]`.
   - Move every literal table into module constants, copied exactly:
     - `CAM_FINALE`: z, y, fov, orbit (lines 423–427)
     - `CAM_HERO`: z, y, roll, fov (lines 429–432)
     - `CAM_SYSTEM`: z, y, roll, orbit (lines 435–440)
   - Declare each like `const CAM_HERO_Z = [[0, 9], [0.45, 6.4], [0.98, 8.2]] as const;`, or as grouped objects. Then call `kf(CAM_HERO_Z, h)` and so on.
   - Keep the constant assignments `roll = 0`, `fov = 35` and `orbit = 0` as they are.
   - Verify: `tsc` passes. Diff each table against the original, number by number.

5. **Dispose RoomEnvironment (Engine3D.tsx:262–263).**
   ```
   const room = new RoomEnvironment();
   const env = pmrem.fromScene(room, 0.04).texture;
   room.dispose();
   ```
   Do this right after `fromScene`. The cube texture has already been rendered by then, and the existing cleanup stays.
   - Verify: the sculpture's reflections look unchanged.

6. **Free LightThreads' GL objects (LightThreads.tsx).**
   - On the failure paths:
     - Line 119: `if (!vs || !fs) { if (vs) gl.deleteShader(vs); if (fs) gl.deleteShader(fs); return; }`
     - Line 124: on link failure, delete the program and both shaders, then return.
   - After a successful link (after line 124), add `gl.detachShader(prog, vs); gl.detachShader(prog, fs); gl.deleteShader(vs); gl.deleteShader(fs);`. A linked program does not need its shaders.
   - In the cleanup (lines 212–217), add `gl.deleteBuffer(buf); gl.deleteProgram(prog);`.
   - **Do not** call `loseContext`: the canvas keeps one context for its whole life (comment at line 218).
   - Verify: no GL errors, and the threads still render after the StrictMode double mount.

7. **Send uDark only when it changes (LightThreads.tsx:169–176).**
   - Inside the effect, declare `let lastDark = -1;`.
   - In `render`, use `if (darkRef.current !== lastDark) { lastDark = darkRef.current; gl.uniform1f(uDark, lastDark); }`.
   - Leave uTime and uScroll alone: they change every frame.
   - Verify: toggling the dark theme still switches the strand tint, both while running and while paused. Paused uses the `runRef` still frame.

8. Run `npx tsc --noEmit`.

## Motion spec / Tool choice
None. No motion changes, and every curve, duration and value stays as it is.

## Acceptance criteria (for the Inspector)
- **"No ReadPixels warning in the console" is not achievable in this container, and neither is "no Clock warning".**
  - The ReadPixels control (`minimal.js '{}' 0`) shows the warning on a blank WebGL page under software compositing.
  - The Clock warning is R3F 9.8.2 internals.
  - Replace both with these checks:
    - a) The instrumented run (`exp.js base`) shows 0 calls to `readPixels`, `getImageData` and `toDataURL`. This already holds; it must stay that way.
    - b) On a hardware-GPU Chrome (chrome://gpu shows "Compositing: Hardware accelerated"), the home tab console shows no ReadPixels warning.
    - c) The console shows the Clock warning once per Canvas mount, from R3F, and nothing new.
- **DPR fix holds.** `dpr3.js`: after the adaptive drop and a Pause/Play toggle, the engine canvas stays at 1425 px wide (1× at a 1425 CSS px canvas). The log shows no `1425 -> 2493` line after "click pause".
- **Allocation cleanup.**
  - There are no object or array literals inside `useFrame` except the existing `ptr`/`cam` mutations.
  - `posesFor` and `mix` no longer exist.
  - A Chrome DevTools allocation timeline while scrolling the hero shows no per-frame `Object`/`Array` churn from Engine3D.tsx.
- **No visual change.**
  - Compare paused screenshots before and after at 1440×900 and 390×844, at hero scroll 0, mid-dive (about 40%) and on the How it works tab. Pausing freezes the time-driven motion, so take each shot after Pause.
  - Camera path, poses and particle size must match.
  - Dark theme: the sculpture and threads still cross-fade to the lit palette.
  - Pause/Play, reduced motion, and leaving and returning to a 3D chapter all behave as before.
- `npx tsc --noEmit` is clean, and `git diff` touches only Engine3D.tsx and LightThreads.tsx.

## Risks
- **Mutating shared constants.** If `pose.current` or a scratch pose aliases an entry in `POSES`, the damped follow corrupts the table and the sculpture drifts. Keep the spread at line 293, and never write to `P.*`.
- **Scratch aliasing.** In the hero branch, `dive` (poseA) is the input to poseB. Do not write the second `mixInto` into poseA.
- **Steps 1 and 2 belong together.** Fixing DPR without syncing uPixelRatio leaves oversized points on slow devices.
- **`lowDpr` lives in Engine3D state.** It survives Pause and chapter exits because Stage keeps Engine3D mounted. That is the intended behaviour.
- **LightThreads cleanup.** Deleting the program while a queued rAF still runs `render` would throw GL errors. The cleanup already runs `cancelAnimationFrame` first; keep that order.

## Follow-ups (outside this ticket; each changes behaviour, so the lead decides)
- **F1: sculpture time resets on resume.** R3F's `setFrameloop` resets `clock.elapsedTime` to 0 on every switch between "never" and "always" (events-e51d7528.esm.js:1278–1286).
  - So after Pause/Play or re-entering a chapter, every time-driven rotation, the camera drift and the heart beat snap back to t=0.
  - The fix is an app-owned time that accumulates `delta`, which would also stop the app depending on `state.clock`. But it is a visible change.
- **F2: LightThreads draws when covered.** It renders a full-screen 18-strand shader at 60 fps even on tabs where opaque sections cover it completely. Pausing it when it is covered is a real GPU saving, but it needs per-tab knowledge of which sections are opaque.
- **F3: game plan wording.** The T3 line in docs/GAME-PLAN.md ("remove the sync readPixels stall; replace THREE.Clock with THREE.Timer") should be corrected to match these findings.

## Scripts
Throwaway, outside the repo, in `/tmp/claude-0/-home-user-SERMA-WEBSITES-FOR-YOU/6a7caae2-53b8-577c-870f-4d692a4bf396/scratchpad/`:
- `probe.js`: GL call tracing.
- `exp.js <base|pma|nothreads|noalpha|nolose|nodraw>`: the variants from (1).
- `minimal.js`: the blank-canvas control.
- `gpuinfo.js chromium`: the chrome://gpu check.
- `dpr3.js`: the DPR reset proof.

Run each with `node <file>` while the dev server is up on :3000.
