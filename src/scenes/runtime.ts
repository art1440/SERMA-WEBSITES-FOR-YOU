/**
 * One WebGL renderer and one canvas for the whole page.
 * The canvas moves into whichever 3D area is most on screen (hero, a chapter, the finale),
 * so phones never juggle several WebGL contexts, and nothing renders when no 3D area is visible.
 */
import { WebGLRenderer, CanvasTexture, SRGBColorSpace, type Scene, type PerspectiveCamera, type Texture } from 'three';
import type { TierInfo } from './quality';
import { buildAtlas, type Atlas } from './atlas';
import { clamp01 } from './ease';
import { PERSPECTIVE } from './hero/constants';

export interface Pointer {
  /** -1..1 across the stage. */
  x: number; y: number;
  /** CSS px inside the canvas host (stage plus bleed). */
  px: number; py: number;
  inside: boolean;
}

export interface FrameInput {
  dt: number;
  pointer: Pointer;
  /** -1..1: device tilt (Android) or touch drag (iPhone). */
  tilt: { x: number; y: number };
  coarse: boolean;
  /** Stage box in viewport coordinates, measured once per frame. */
  rect: DOMRect;
}

export interface Entry {
  name: string;
  /** Box that defines the scene area; gets `.scene-live` while the canvas renders in it. */
  stage: HTMLElement;
  /** Where the canvas goes. Covers the stage plus `bleed` on every side. */
  host: HTMLElement;
  bleed: number;
  scene: StageScene;
  params: Record<string, unknown>;
  /** Extra condition for being chosen (e.g. the active chapter in a sticky stage). */
  eligible?: () => boolean;
}

export interface StageScene {
  scene: Scene;
  camera: PerspectiveCamera;
  layout(stageW: number, stageH: number, entry: Entry): void;
  update(input: FrameInput, entry: Entry): void;
  activate?(entry: Entry, previous: Entry | null): void;
  /** Jump to a calm, final state (used when the device is too slow to animate). */
  settle?(): void;
}

export interface Runtime {
  tier: TierInfo;
  renderer: WebGLRenderer;
  atlas: Atlas;
  texture: Texture;
  add(entry: Entry): Promise<void>;
  refresh(): void;
}

export async function createRuntime(canvas: HTMLCanvasElement, context: WebGL2RenderingContext, tier: TierInfo, opts: { debug?: boolean; onLost?: () => void } = {}): Promise<Runtime> {
  const renderer = new WebGLRenderer({ canvas, context, antialias: tier.antialias, alpha: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  let dpr = Math.min(window.devicePixelRatio || 1, tier.maxDpr);
  renderer.setPixelRatio(dpr);

  const atlas = await buildAtlas(tier.tier === 'high' ? 1 : tier.tier === 'mid' ? 0.8 : 0.6);
  const texture = new CanvasTexture(atlas.canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  const entries: Entry[] = [];
  const ratios = new Map<Element, number>();
  const compiled = new WeakSet<Scene>();
  let active: Entry | null = null;
  let frozen = false;
  let lost = false;
  const coarse = matchMedia('(pointer: coarse)').matches;

  // ---------- Sizing ----------
  let stageW = 1, stageH = 1;
  function resize() {
    if (!active) return;
    const r = active.stage.getBoundingClientRect();
    stageW = Math.max(1, r.width);
    stageH = Math.max(1, r.height);
    const hostW = stageW * (1 + 2 * active.bleed), hostH = stageH * (1 + 2 * active.bleed);
    renderer.setSize(hostW, hostH, false);
    const cam = active.scene.camera;
    cam.position.set(0, 0, PERSPECTIVE);
    cam.aspect = hostW / hostH;
    cam.fov = (2 * Math.atan(hostH / 2 / PERSPECTIVE) * 180) / Math.PI;
    cam.updateProjectionMatrix();
    active.scene.layout(stageW, stageH, active);
  }
  const ro = new ResizeObserver(() => { resize(); if (!running) renderOnce(); });

  // ---------- Input ----------
  const raw = { x: -1e5, y: -1e5, has: false };
  const pointer: Pointer = { x: 0, y: 0, px: -9999, py: -9999, inside: false };
  const tilt = { x: 0, y: 0, base: null as null | { b: number; g: number } };
  if (!coarse) {
    window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { raw.x = e.clientX; raw.y = e.clientY; raw.has = true; } }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { raw.has = false; });
  }
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
  const hasTilt = coarse && !!DOE && typeof DOE.requestPermission !== 'function';
  if (hasTilt) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.beta == null || e.gamma == null) return;
      if (!tilt.base) tilt.base = { b: e.beta, g: e.gamma };
      tilt.x = Math.max(-1, Math.min(1, (e.gamma - tilt.base.g) / 20));
      tilt.y = Math.max(-1, Math.min(1, (e.beta - tilt.base.b) / 20));
    }, { passive: true });
  } else if (coarse) {
    let start: { x: number } | null = null;
    window.addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) start = { x: t.clientX }; }, { passive: true });
    window.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t && start) tilt.x = Math.max(-1, Math.min(1, (t.clientX - start.x) / 160)); }, { passive: true });
    window.addEventListener('touchend', () => { start = null; tilt.x = 0; }, { passive: true });
  }

  function readInput(dt: number): FrameInput {
    const rect = active!.stage.getBoundingClientRect();
    const b = active!.bleed;
    pointer.inside = raw.has && raw.y > rect.top - 300 && raw.y < rect.bottom + 120 && raw.x > rect.left - 600 && raw.x < rect.right + 200;
    pointer.x = clamp01((raw.x - rect.left) / rect.width) * 2 - 1;
    pointer.y = clamp01((raw.y - rect.top) / rect.height) * 2 - 1;
    pointer.px = raw.x - rect.left + rect.width * b;
    pointer.py = raw.y - rect.top + rect.height * b;
    return { dt, pointer, tilt, coarse, rect };
  }

  // ---------- Loop ----------
  let raf = 0;
  let running = false;
  let last = 0;
  let sampleStart = 0, sampleFrames = 0;

  function renderOnce() {
    if (!active || lost) return;
    active.scene.update(readInput(0), active);
    renderer.render(active.scene.scene, active.scene.camera);
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (!active) return;
    const gap = last ? now - last : 0;
    const dt = Math.min(0.05, last ? gap / 1000 : 0.016);
    last = now;
    const t0 = debugEl ? performance.now() : 0;
    active.scene.update(readInput(dt), active);
    const t1 = debugEl ? performance.now() : 0;
    renderer.render(active.scene.scene, active.scene.camera);
    if (debugEl) { jsAvg = jsAvg * 0.95 + (t1 - t0) * 0.05; drawAvg = drawAvg * 0.95 + (performance.now() - t1) * 0.05; }

    // Watchdog: lower the pixel ratio below 45 fps; freeze on a still frame below 28 fps.
    if (gap > 250 || !sampleStart) { sampleStart = now; sampleFrames = 0; }
    sampleFrames++;
    if (now - sampleStart > 2500) {
      const fps = (sampleFrames * 1000) / (now - sampleStart);
      lastFps = fps;
      if (fps < 45 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.5);
        renderer.setPixelRatio(dpr);
        resize();
      } else if (fps < 28 && dpr <= 1 && !forceAnimate) {
        freeze();
      }
      sampleStart = now; sampleFrames = 0;
    }
    if (debugEl && now - debugAt > 500) {
      debugAt = now;
      debugEl.textContent = `3D ${tier.tier} (${tier.reason}) · ${active.name} · dpr ${dpr} · ${lastFps ? lastFps.toFixed(0) : '…'} fps · ${renderer.info.render.calls} calls · ${renderer.info.render.triangles} tris · update ${jsAvg.toFixed(2)} ms · draw ${drawAvg.toFixed(2)} ms${frozen ? ' · frozen' : ''}`;
    }
  }

  function syncLoop() {
    const shouldRun = Boolean(active) && !document.hidden && !frozen && !lost;
    if (shouldRun && !running) { running = true; last = 0; sampleStart = 0; raf = requestAnimationFrame(frame); }
    if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
  }
  document.addEventListener('visibilitychange', syncLoop);

  function freeze() {
    frozen = true;
    for (const e of entries) e.scene.settle?.();
    renderOnce();
    syncLoop();
  }

  // ---------- Choosing where the canvas lives ----------
  function choose() {
    if (lost) return;
    let best: Entry | null = null;
    let bestRatio = 0.01;
    for (const e of entries) {
      const r = ratios.get(e.stage) ?? 0;
      if (r > bestRatio && (e.eligible?.() ?? true)) { best = e; bestRatio = r; }
    }
    // Small hysteresis so the canvas doesn't flip back and forth at a boundary.
    if (active && best && best !== active && (active.eligible?.() ?? true)) {
      const cur = ratios.get(active.stage) ?? 0;
      if (cur > 0.01 && cur >= bestRatio - 0.08) best = active;
    }
    if (best !== active) switchTo(best);
  }

  function switchTo(entry: Entry | null) {
    const previous = active;
    if (previous) { previous.stage.classList.remove('scene-live'); ro.unobserve(previous.stage); }
    active = entry;
    if (entry) {
      entry.host.appendChild(canvas);
      resize();
      entry.scene.activate?.(entry, previous);
      renderOnce();
      entry.stage.classList.add('scene-live');
      ro.observe(entry.stage);
    }
    syncLoop();
  }

  const io = new IntersectionObserver((list) => {
    for (const e of list) ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0);
    choose();
  }, { threshold: [0, 0.02, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    for (const en of entries) en.stage.classList.remove('scene-live');
    syncLoop();
    opts.onLost?.();
  });

  // Debug overlay (?debug)
  let debugEl: HTMLElement | null = null;
  let debugAt = 0, jsAvg = 0, drawAvg = 0, lastFps = 0;
  const forceAnimate = new URLSearchParams(location.search).has('nofreeze');
  if (opts.debug) {
    debugEl = document.createElement('div');
    debugEl.setAttribute('aria-hidden', 'true');
    debugEl.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:999;max-width:calc(100vw - 16px);font:12px/1.4 ui-monospace,monospace;background:#000c;color:#8BE3BF;padding:6px 8px;border-radius:6px;pointer-events:none';
    document.body.appendChild(debugEl);
  }

  return {
    tier, renderer, atlas, texture,
    async add(entry) {
      if (!compiled.has(entry.scene.scene)) {
        compiled.add(entry.scene.scene);
        await renderer.compileAsync(entry.scene.scene, entry.scene.camera);
      }
      entries.push(entry);
      io.observe(entry.stage);
    },
    refresh: choose,
  };
}
