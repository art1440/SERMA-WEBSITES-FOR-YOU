/**
 * Hero 3D scene: a browser window and a phone assemble from rounded tiles.
 * Tiles fly in as empty mint outlines, flip to reveal the finished design, the BOOK tiles press,
 * and a "Booked" chip pops out. All tiles are one instanced mesh (one draw call).
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, InstancedMesh, Mesh, ShaderMaterial, MeshBasicMaterial,
  CanvasTexture, SRGBColorSpace, Color, Matrix4, Quaternion, Vector3, Euler, InstancedBufferAttribute,
  PlaneGeometry, ExtrudeGeometry, Shape, DynamicDrawUsage, type BufferGeometry,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { color } from '../../design/tokens';
import { phone as phoneLayout, browser as browserLayout } from '../layout';
import { easeOut, spring, clamp01, damp } from '../ease';
import type { TierInfo } from '../quality';
import { buildAtlas } from './atlas';
import { heroPose, type DevicePose } from './pose';
import { BLEED, PERSPECTIVE, FLOATERS } from './constants';
import { tileVertex, tileFragment, bodyVertex, bodyFragment } from './shaders';

export interface HeroSceneOptions {
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  context: WebGL2RenderingContext;
  tier: TierInfo;
  intro: boolean;
  debug?: boolean;
  onChip?: () => void;
  onIntroEnd?: () => void;
  onFreeze?: () => void;
  onLost?: () => void;
}

export interface HeroScene {
  setActive(active: boolean): void;
  skip(): void;
  dispose(): void;
}

// Timeline (seconds)
const FLY_DUR = 1.0;
const FLY_SPREAD = 0.5;
const FLIP_START = 1.0;
const FLIP_STEP = 0.028;
const FLIP_DUR = 0.65;
const PHONE_FLIP_OFFSET = 0.12;
const FRAME_IN: [number, number] = [0.35, 0.95];
const PRESS_T = FLIP_START + PHONE_FLIP_OFFSET + 12 * FLIP_STEP + FLIP_DUR * 0.8;
const CHIP_T = PRESS_T + 0.18;
const END = PRESS_T + 0.6;

const TILE_DEPTH = 0.36;
const TILE_RADIUS = 0.18;


/** Deterministic random so every visitor sees the same choreography. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Tile {
  device: 'phone' | 'browser' | null;
  index: number;
  col: number;
  row: number;
  isBook: boolean;
  flyDelay: number;
  flipDelay: number;
  scatter: Vector3;
  scatterQ: Quaternion;
  spinSeed: number;
  lift: number;
  // floaters only
  float?: { x: number; y: number; z: number; size: number; solid: boolean; rz: number };
}

function roundedRectGeometry(w: number, h: number, r: number, depth: number): BufferGeometry {
  const s = new Shape();
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const bevel = Math.min(2.5, depth * 0.25);
  const g = new ExtrudeGeometry(s, { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  return g;
}

export async function createHeroScene(opts: HeroSceneOptions): Promise<HeroScene> {
  const { stage, canvas, context, tier } = opts;
  const renderer = new WebGLRenderer({ canvas, context, antialias: tier.antialias, alpha: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  let dpr = Math.min(window.devicePixelRatio || 1, tier.maxDpr);
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 10, 8000);
  camera.position.set(0, 0, PERSPECTIVE);
  const root = new Group();
  scene.add(root);

  // ---------- Texture ----------
  const atlas = await buildAtlas(tier.tier === 'low' ? 0.6 : 1);
  const texture = new CanvasTexture(atlas.canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

  // ---------- Materials ----------
  const light = new Vector3(0.35, 0.55, 1).normalize();
  const tileMat = new ShaderMaterial({
    vertexShader: tileVertex,
    fragmentShader: tileFragment,
    uniforms: {
      uAtlas: { value: texture },
      uMint: { value: new Color(color.secondary) },
      uGold: { value: new Color(color.accent) },
      uFace: { value: new Color('#13201B') },
      uSide: { value: new Color('#1A2722') },
      uLight: { value: light.clone() },
    },
  });
  const bodyMat = (top: string, bottom: string) => new ShaderMaterial({
    vertexShader: bodyVertex,
    fragmentShader: bodyFragment,
    transparent: true,
    uniforms: {
      uTop: { value: new Color(top) },
      uBottom: { value: new Color(bottom) },
      uEdge: { value: new Color('#2B3D36') },
      uHalfH: { value: 100 },
      uOpacity: { value: 0 },
      uLight: { value: light.clone() },
    },
  });
  const phoneBodyMat = bodyMat('#1E2C27', '#111A17');
  const browserBodyMat = bodyMat(color.surface, '#111A17');
  const barMat = new MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });

  // ---------- Tiles ----------
  const tiles: Tile[] = [];
  const random = rng(20261105);
  const addDevice = (device: 'phone' | 'browser', cols: number, rows: number, flipOffset: number) => {
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      tiles.push({
        device, index: i, col, row,
        isBook: device === 'phone' && row === rows - 1,
        flyDelay: random() * FLY_SPREAD,
        flipDelay: flipOffset + (col + row) * FLIP_STEP,
        scatter: new Vector3(), scatterQ: new Quaternion(), spinSeed: random(), lift: 0,
      });
    }
  };
  addDevice('browser', browserLayout.cols, browserLayout.rows, 0);
  addDevice('phone', phoneLayout.cols, phoneLayout.rows, PHONE_FLIP_OFFSET);
  for (const f of FLOATERS) {
    tiles.push({
      device: null, index: -1, col: 0, row: 0, isBook: false,
      flyDelay: random() * FLY_SPREAD, flipDelay: 0,
      scatter: new Vector3(), scatterQ: new Quaternion(), spinSeed: random(), lift: 0,
      float: { x: f.x / 100, y: f.y / 100, z: f.z, size: f.size / 100, solid: f.solid, rz: -f.rz },
    });
  }

  const segments = tier.tier === 'high' ? 3 : 2;
  const tileGeo = new RoundedBoxGeometry(1, 1, TILE_DEPTH, segments, TILE_RADIUS);
  const uvAttr = new Float32Array(tiles.length * 4);
  const styleAttr = new Float32Array(tiles.length * 4);
  tiles.forEach((t, i) => {
    const uv = t.device ? atlas.cell(t.device, t.index) : atlas.marigold;
    uvAttr.set([uv.u, uv.v, uv.w, uv.h], i * 4);
    // x: shows image on its back, y: marigold outline, z: random seed
    styleAttr.set([t.device || t.float?.solid ? 1 : 0, 0, t.spinSeed, 0], i * 4);
  });
  tileGeo.setAttribute('aUv', new InstancedBufferAttribute(uvAttr, 4));
  tileGeo.setAttribute('aStyle', new InstancedBufferAttribute(styleAttr, 4));
  const tilesMesh = new InstancedMesh(tileGeo, tileMat, tiles.length);
  tilesMesh.instanceMatrix.setUsage(DynamicDrawUsage);
  tilesMesh.frustumCulled = false;
  root.add(tilesMesh);

  // ---------- Device bodies (rebuilt on resize) ----------
  const phoneBody = new Mesh<BufferGeometry, ShaderMaterial>(new PlaneGeometry(1, 1), phoneBodyMat);
  const browserBody = new Mesh<BufferGeometry, ShaderMaterial>(new PlaneGeometry(1, 1), browserBodyMat);
  const bar = new Mesh<BufferGeometry, MeshBasicMaterial>(new PlaneGeometry(1, 1), barMat);
  root.add(phoneBody, browserBody);
  browserBody.add(bar);

  let pose = heroPose(1, 1);
  let stageW = 1, stageH = 1;
  const devQ = { phone: new Quaternion(), browser: new Quaternion() };
  const devPos = { phone: new Vector3(), browser: new Vector3() };
  const euler = new Euler(0, 0, 0, 'YXZ');
  const deg = Math.PI / 180;

  function tileLocal(t: Tile, p: DevicePose, out: Vector3) {
    const g = p.grid;
    out.set(
      g.x - g.w / 2 + g.tileW / 2 + t.col * (g.tileW + g.gap),
      g.y + g.h / 2 - g.tileH / 2 - t.row * (g.tileH + g.gap),
      p.depth / 2 + (TILE_DEPTH * g.tileW) / 2 + 1,
    );
    return out;
  }

  function layout() {
    const rect = stage.getBoundingClientRect();
    stageW = Math.max(1, rect.width);
    stageH = Math.max(1, rect.height);
    const hostW = stageW * (1 + 2 * BLEED), hostH = stageH * (1 + 2 * BLEED);
    renderer.setSize(hostW, hostH, false);
    camera.aspect = hostW / hostH;
    camera.fov = (2 * Math.atan(hostH / 2 / PERSPECTIVE)) / deg;
    camera.updateProjectionMatrix();

    pose = heroPose(stageW, stageH);
    for (const id of ['phone', 'browser'] as const) {
      const p = pose[id];
      euler.set(p.rx * deg, p.ry * deg, p.rz * deg, 'YXZ');
      devQ[id].setFromEuler(euler);
      devPos[id].set(p.x, p.y, p.z);
    }
    phoneBody.geometry.dispose();
    phoneBody.geometry = roundedRectGeometry(pose.phone.w, pose.phone.h, pose.phone.radius, pose.phone.depth);
    browserBody.geometry.dispose();
    browserBody.geometry = roundedRectGeometry(pose.browser.w, pose.browser.h, pose.browser.radius, pose.browser.depth);
    phoneBodyMat.uniforms.uHalfH!.value = pose.phone.h / 2;
    browserBodyMat.uniforms.uHalfH!.value = pose.browser.h / 2;

    // Browser address bar sits on the top strip of the window.
    bar.geometry.dispose();
    const barW = pose.browser.w - pose.browser.radius * 0.6;
    const bg = new PlaneGeometry(barW, pose.bar * 0.92);
    const uv = bg.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) uv.setXY(i, atlas.bar.u + uv.getX(i) * atlas.bar.w, atlas.bar.v + uv.getY(i) * atlas.bar.h);
    bar.geometry = bg;
    bar.position.set(0, pose.browser.h / 2 - pose.bar / 2, pose.browser.depth / 2 + 0.6);

    // Tile scale + scatter starting points.
    const rand = rng(7);
    const tmp = new Vector3();
    tiles.forEach((t) => {
      const target = targetWorld(t, tmp, 0);
      const away = target.clone().setZ(0);
      if (away.lengthSq() < 1) away.set(rand() - 0.5, rand() - 0.5, 0);
      away.normalize();
      const dist = (0.45 + rand() * 0.7) * stageW;
      t.scatter.copy(target).addScaledVector(away, dist);
      t.scatter.x += (rand() - 0.5) * stageW * 0.5;
      t.scatter.y += (rand() - 0.5) * stageH * 0.5;
      t.scatter.z = -350 + rand() * 520;
      euler.set((rand() - 0.5) * Math.PI * 2, (rand() - 0.5) * Math.PI * 2, (rand() - 0.5) * Math.PI, 'XYZ');
      t.scatterQ.setFromEuler(euler);
    });
  }

  // ---------- Per-frame tile placement ----------
  const m4 = new Matrix4();
  const pos = new Vector3();
  const quat = new Quaternion();
  const scl = new Vector3();
  const local = new Vector3();
  const flipQ = new Quaternion();
  const yAxis = new Vector3(0, 1, 0);
  const projected = new Vector3();

  let time = 0; // intro clock
  let idle = 0; // always-running clock for ambient motion

  function bob(id: 'phone' | 'browser') {
    return Math.sin(idle * 0.9 + (id === 'phone' ? 0 : 2.1)) * 3;
  }

  /** Final resting position of a tile (in root space). */
  function targetWorld(t: Tile, out: Vector3, liftPx: number) {
    if (!t.device) {
      const f = t.float!;
      out.set(f.x * stageW - stageW / 2 + (f.size * stageW) / 2, -(f.y * stageH - stageH / 2 + (f.size * stageW) / 2), f.z);
      out.y += Math.sin(idle * 0.6 + t.spinSeed * 6) * 8;
      return out;
    }
    const p = pose[t.device];
    tileLocal(t, p, out);
    out.z += liftPx;
    out.applyQuaternion(devQ[t.device]).add(devPos[t.device]);
    out.y += bob(t.device);
    return out;
  }

  // Pointer / tilt state
  const pointer = { x: 0, y: 0, inside: false, px: -9999, py: -9999 };
  const rot = { x: 0, y: 0, tx: 0, ty: 0 };
  const coarse = matchMedia('(pointer: coarse)').matches;

  function update(dt: number) {
    idle += dt;
    // Root turns gently toward the pointer (desktop) or with tilt/drift (touch).
    if (coarse) {
      rot.tx = tilt.x * 6 * deg + Math.sin(idle * 0.35) * 2.5 * deg;
      rot.ty = tilt.y * 4 * deg + Math.sin(idle * 0.27) * 1.5 * deg;
    } else {
      rot.tx = pointer.inside ? pointer.x * 6 * deg : 0;
      rot.ty = pointer.inside ? pointer.y * 4 * deg : 0;
    }
    rot.x = damp(rot.x, rot.tx, 4, dt);
    rot.y = damp(rot.y, rot.ty, 4, dt);
    root.rotation.set(rot.y, rot.x, 0);
    root.updateMatrixWorld();

    const framesOn = clamp01((time - FRAME_IN[0]) / (FRAME_IN[1] - FRAME_IN[0]));
    const fo = easeOut(framesOn);
    phoneBodyMat.uniforms.uOpacity!.value = fo;
    browserBodyMat.uniforms.uOpacity!.value = fo;
    barMat.opacity = fo;
    for (const id of ['phone', 'browser'] as const) {
      const body = id === 'phone' ? phoneBody : browserBody;
      body.position.copy(devPos[id]);
      body.position.y += bob(id);
      body.quaternion.copy(devQ[id]);
      const s = 0.94 + 0.06 * fo;
      body.scale.set(s, s, 1);
    }

    const pressP = clamp01((time - PRESS_T) / 0.35);
    const press = Math.sin(pressP * Math.PI);

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i]!;
      const a = easeOut(clamp01((time - t.flyDelay) / FLY_DUR));

      // Pointer lift (desktop): tiles near the cursor rise a little.
      let liftTarget = 0;
      if (t.device && pointer.inside && a >= 1) {
        targetWorld(t, projected, 0).applyMatrix4(root.matrixWorld).project(camera);
        const hostW = stageW * (1 + 2 * BLEED), hostH = stageH * (1 + 2 * BLEED);
        const sx = (projected.x * 0.5 + 0.5) * hostW, sy = (-projected.y * 0.5 + 0.5) * hostH;
        const d = Math.hypot(sx - pointer.px, sy - pointer.py);
        liftTarget = 1 - clamp01((d - 20) / 110);
      }
      t.lift = damp(t.lift, liftTarget, 10, dt);

      if (t.device) {
        const p = pose[t.device];
        const liftPx = t.lift * p.grid.tileW * 0.35 - (t.isBook ? press * p.grid.tileW * 0.12 : 0);
        targetWorld(t, local, liftPx);
        const f = clamp01((time - (FLIP_START + t.flipDelay)) / FLIP_DUR);
        flipQ.setFromAxisAngle(yAxis, Math.PI * spring(f));
        quat.copy(devQ[t.device]).multiply(flipQ);
        scl.set(p.grid.tileW, p.grid.tileH, p.grid.tileW);
      } else {
        const fl = t.float!;
        targetWorld(t, local, 0);
        euler.set(Math.sin(idle * 0.4 + t.spinSeed * 5) * 0.35, (fl.solid ? Math.PI : 0) + Math.sin(idle * 0.3 + t.spinSeed * 3) * 0.5, (fl.rz * deg) + idle * 0.05 * (t.spinSeed - 0.5), 'XYZ');
        quat.setFromEuler(euler);
        const s = fl.size * stageW;
        scl.set(s, s, s);
      }

      if (a < 1) {
        pos.lerpVectors(t.scatter, local, a);
        quat.slerpQuaternions(t.scatterQ, quat, a);
        scl.multiplyScalar(0.55 + 0.45 * a);
      } else {
        pos.copy(local);
      }
      m4.compose(pos, quat, scl);
      tilesMesh.setMatrixAt(i, m4);
    }
    tilesMesh.instanceMatrix.needsUpdate = true;

    // Light follows the pointer a touch, for a moving sheen.
    const lu = tileMat.uniforms.uLight!.value as Vector3;
    lu.set(0.35 + rot.x * 3, 0.55 - rot.y * 3, 1).normalize();
  }

  // ---------- Loop ----------
  let raf = 0;
  let active = false;
  let frozen = false;
  let last = 0;
  let speed = 1;
  let chipFired = false;
  let endFired = false;
  if (!opts.intro) time = END;
  const fixedT = new URLSearchParams(location.search).get('t');
  if (fixedT !== null) { time = Math.min(END, Math.max(0, Number(fixedT) || 0)); speed = 0; }

  // Frame-rate watchdog
  let sampleStart = 0, sampleFrames = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    const gap = last ? now - last : 0;
    last = now;
    time += dt * speed;

    if (!chipFired && time >= CHIP_T) { chipFired = true; opts.onChip?.(); }
    if (!endFired && time >= END) { endFired = true; speed = 1; opts.onIntroEnd?.(); }

    const t0 = debugEl ? performance.now() : 0;
    update(dt);
    const t1 = debugEl ? performance.now() : 0;
    renderer.render(scene, camera);
    if (debugEl) { jsAvg = jsAvg * 0.95 + (t1 - t0) * 0.05; submitAvg = submitAvg * 0.95 + (performance.now() - t1) * 0.05; }

    if (endFired && !frozen) {
      if (gap > 250 || !sampleStart) { sampleStart = now; sampleFrames = 0; }
      sampleFrames++;
      if (now - sampleStart > 2000) {
        const fps = (sampleFrames * 1000) / (now - sampleStart);
        if (debugEl) debugEl.dataset.fps = fps.toFixed(0);
        if (fps < 45 && dpr > 1) {
          dpr = Math.max(1, dpr - 0.5);
          renderer.setPixelRatio(dpr);
          layout();
        } else if (fps < 28 && dpr <= 1) {
          freeze();
        }
        sampleStart = now; sampleFrames = 0;
      }
    }
    if (debugEl && now - debugAt > 500) {
      debugAt = now;
      debugEl.textContent = `3D ${tier.tier} (${tier.reason}) · dpr ${dpr} · ${debugEl.dataset.fps ?? '…'} fps · ${renderer.info.render.calls} calls · ${renderer.info.render.triangles} tris · update ${jsAvg.toFixed(2)} ms · draw ${submitAvg.toFixed(2)} ms`;
    }
  }

  function freeze() {
    frozen = true;
    time = END;
    pointer.inside = false;
    update(0);
    renderer.render(scene, camera);
    cancelAnimationFrame(raf);
    opts.onFreeze?.();
  }

  function setActive(on: boolean) {
    if (frozen || on === active) return;
    active = on;
    if (on) { last = 0; raf = requestAnimationFrame(frame); } else cancelAnimationFrame(raf);
  }

  // ---------- Input ----------
  const tilt = { x: 0, y: 0, base: null as null | { b: number; g: number } };
  function onPointer(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    const bx = r.width * BLEED, by = r.height * BLEED;
    pointer.px = e.clientX - r.left + bx;
    pointer.py = e.clientY - r.top + by;
    pointer.x = clamp01((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = clamp01((e.clientY - r.top) / r.height) * 2 - 1;
    // Reacts within the hero, not just over the picture.
    pointer.inside = e.clientY < r.bottom + 120 && e.clientY > r.top - 400;
  }
  function onOrientation(e: DeviceOrientationEvent) {
    if (e.beta == null || e.gamma == null) return;
    if (!tilt.base) tilt.base = { b: e.beta, g: e.gamma };
    tilt.x = Math.max(-1, Math.min(1, (e.gamma - tilt.base.g) / 20));
    tilt.y = Math.max(-1, Math.min(1, (e.beta - tilt.base.b) / 20));
  }
  let touchStart: { x: number; y: number } | null = null;
  function onTouchStart(e: TouchEvent) { const t = e.touches[0]; if (t) touchStart = { x: t.clientX, y: t.clientY }; }
  function onTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    if (!t || !touchStart || hasTilt) return;
    tilt.x = Math.max(-1, Math.min(1, (t.clientX - touchStart.x) / 160));
  }
  function onTouchEnd() { touchStart = null; if (!hasTilt) tilt.x = 0; }

  // Real tilt only where no permission prompt is needed (Android). iPhones get drift + drag.
  const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } }).DeviceOrientationEvent;
  const hasTilt = coarse && !!DOE && typeof DOE.requestPermission !== 'function';
  if (!coarse) window.addEventListener('pointermove', onPointer, { passive: true });
  if (hasTilt) window.addEventListener('deviceorientation', onOrientation, { passive: true });
  if (coarse) {
    stage.closest('section')?.addEventListener('touchstart', onTouchStart, { passive: true });
    stage.closest('section')?.addEventListener('touchmove', onTouchMove, { passive: true });
    stage.closest('section')?.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  const ro = new ResizeObserver(() => { layout(); if (!active) { update(0); renderer.render(scene, camera); } });
  ro.observe(stage);

  const onLost = (e: Event) => { e.preventDefault(); setActive(false); opts.onLost?.(); };
  canvas.addEventListener('webglcontextlost', onLost);

  // Debug overlay (?debug)
  let debugEl: HTMLElement | null = null;
  let debugAt = 0;
  let jsAvg = 0, submitAvg = 0;
  if (opts.debug) {
    debugEl = document.createElement('div');
    debugEl.setAttribute('aria-hidden', 'true');
    debugEl.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:999;font:12px/1.4 ui-monospace,monospace;background:#000c;color:#8BE3BF;padding:6px 8px;border-radius:6px;pointer-events:none';
    document.body.appendChild(debugEl);
  }

  // ---------- First frame ----------
  layout();
  update(0);
  await renderer.compileAsync(scene, camera);
  renderer.render(scene, camera);
  if (!opts.intro && fixedT === null) { chipFired = true; endFired = true; opts.onChip?.(); opts.onIntroEnd?.(); }

  return {
    setActive,
    skip() {
      if (time < END) speed = Math.max(1, (END - time) / 0.35);
    },
    dispose() {
      setActive(false);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrientation);
      canvas.removeEventListener('webglcontextlost', onLost);
      debugEl?.remove();
      [tileGeo, phoneBody.geometry, browserBody.geometry, bar.geometry].forEach((g) => g.dispose());
      [tileMat, phoneBodyMat, browserBodyMat, barMat].forEach((m) => m.dispose());
      texture.dispose();
      renderer.dispose();
    },
  };
}

