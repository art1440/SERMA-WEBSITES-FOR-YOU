/**
 * Hero 3D scene: a browser window and a phone assemble from rounded tiles.
 * Tiles fly in as empty mint outlines, flip to reveal the finished design, the BOOK tiles press,
 * and a "Booked" chip pops out. All tiles are one instanced mesh (one draw call).
 */
import {
  Scene, PerspectiveCamera, Group, InstancedMesh, Mesh, MeshBasicMaterial, Matrix4, Quaternion, Vector3, Euler,
  InstancedBufferAttribute, PlaneGeometry, DynamicDrawUsage, type BufferGeometry, type ShaderMaterial,
} from 'three';
import { color } from '../../design/tokens';
import { phone as phoneLayout, browser as browserLayout } from '../layout';
import { easeOut, spring, clamp01, damp } from '../ease';
import { tileGeometry, tileMaterial, bodyMaterial, roundedRectGeometry, rng, TILE_DEPTH } from '../tiles';
import type { Runtime, StageScene, FrameInput, Entry } from '../runtime';
import { heroPose, type DevicePose } from './pose';
import { FLOATERS } from './constants';

export interface HeroScene extends StageScene { skip(): void }

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
  float?: { x: number; y: number; z: number; size: number; solid: boolean; rz: number };
}

export function createHeroScene(rt: Runtime, opts: { intro: boolean; onChip?: () => void; onIntroEnd?: () => void }): HeroScene {
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 10, 8000);
  const root = new Group();
  scene.add(root);

  const tileMat = tileMaterial(rt.texture);
  const phoneBodyMat = bodyMaterial('#1E2C27', '#111A17');
  const browserBodyMat = bodyMaterial(color.surface, '#111A17');
  const barMat = new MeshBasicMaterial({ map: rt.texture, transparent: true, opacity: 0 });

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

  const tileGeo = tileGeometry(rt.tier.tier);
  const uvAttr = new Float32Array(tiles.length * 4);
  const styleAttr = new Float32Array(tiles.length * 4);
  tiles.forEach((t, i) => {
    const uv = t.device ? rt.atlas.cell(t.device, t.index) : rt.atlas.misc('gold');
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
  let stageW = 1, stageH = 1, bleed = 0;
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

  let idle = 0;
  const bob = (id: 'phone' | 'browser') => Math.sin(idle * 0.9 + (id === 'phone' ? 0 : 2.1)) * 3;

  /** Final resting position of a tile (in root space). */
  function targetWorld(t: Tile, out: Vector3, liftPx: number) {
    if (!t.device) {
      const f = t.float!;
      out.set(f.x * stageW - stageW / 2 + (f.size * stageW) / 2, -(f.y * stageH - stageH / 2 + (f.size * stageW) / 2), f.z);
      out.y += Math.sin(idle * 0.6 + t.spinSeed * 6) * 8;
      return out;
    }
    tileLocal(t, pose[t.device], out);
    out.z += liftPx;
    out.applyQuaternion(devQ[t.device]).add(devPos[t.device]);
    out.y += bob(t.device);
    return out;
  }

  function layout(w: number, h: number, entry: Entry) {
    stageW = w; stageH = h; bleed = entry.bleed;
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

    bar.geometry.dispose();
    const barUv = rt.atlas.misc('bar');
    const bg = new PlaneGeometry(pose.browser.w - pose.browser.radius * 0.6, pose.bar * 0.92);
    const uv = bg.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) uv.setXY(i, barUv.u + uv.getX(i) * barUv.w, barUv.v + uv.getY(i) * barUv.h);
    bar.geometry = bg;
    bar.position.set(0, pose.browser.h / 2 - pose.bar / 2, pose.browser.depth / 2 + 0.6);

    const rand = rng(7);
    const tmp = new Vector3();
    tiles.forEach((t) => {
      const target = targetWorld(t, tmp, 0);
      const away = target.clone().setZ(0);
      if (away.lengthSq() < 1) away.set(rand() - 0.5, rand() - 0.5, 0);
      away.normalize();
      t.scatter.copy(target).addScaledVector(away, (0.45 + rand() * 0.7) * stageW);
      t.scatter.x += (rand() - 0.5) * stageW * 0.5;
      t.scatter.y += (rand() - 0.5) * stageH * 0.5;
      t.scatter.z = -350 + rand() * 520;
      euler.set((rand() - 0.5) * Math.PI * 2, (rand() - 0.5) * Math.PI * 2, (rand() - 0.5) * Math.PI, 'XYZ');
      t.scatterQ.setFromEuler(euler);
    });
  }

  // ---------- Per frame ----------
  const m4 = new Matrix4();
  const pos = new Vector3();
  const quat = new Quaternion();
  const scl = new Vector3();
  const local = new Vector3();
  const flipQ = new Quaternion();
  const yAxis = new Vector3(0, 1, 0);
  const projected = new Vector3();
  const rot = { x: 0, y: 0 };

  let time = opts.intro ? 0 : END;
  let speed = 1;
  let chipFired = false;
  let endFired = false;
  const fixedT = new URLSearchParams(location.search).get('t');
  if (fixedT !== null) { time = Math.min(END, Math.max(0, Number(fixedT) || 0)); speed = 0; }

  function update(input: FrameInput) {
    const { dt, pointer, tilt, coarse } = input;
    idle += dt;
    time += dt * speed;
    if (!chipFired && time >= CHIP_T) { chipFired = true; opts.onChip?.(); }
    if (!endFired && time >= END && fixedT === null) { endFired = true; speed = 1; opts.onIntroEnd?.(); }

    // Root turns gently toward the pointer (desktop) or with tilt/drift (touch).
    const tx = coarse ? tilt.x * 6 * deg + Math.sin(idle * 0.35) * 2.5 * deg : pointer.inside ? pointer.x * 6 * deg : 0;
    const ty = coarse ? tilt.y * 4 * deg + Math.sin(idle * 0.27) * 1.5 * deg : pointer.inside ? pointer.y * 4 * deg : 0;
    rot.x = damp(rot.x, tx, 4, dt);
    rot.y = damp(rot.y, ty, 4, dt);
    root.rotation.set(rot.y, rot.x, 0);
    root.updateMatrixWorld();

    const fo = easeOut(clamp01((time - FRAME_IN[0]) / (FRAME_IN[1] - FRAME_IN[0])));
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

    const press = Math.sin(clamp01((time - PRESS_T) / 0.35) * Math.PI);
    const hostW = stageW * (1 + 2 * bleed), hostH = stageH * (1 + 2 * bleed);

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i]!;
      const a = easeOut(clamp01((time - t.flyDelay) / FLY_DUR));

      let liftTarget = 0;
      if (t.device && pointer.inside && a >= 1 && !coarse) {
        targetWorld(t, projected, 0).applyMatrix4(root.matrixWorld).project(camera);
        const sx = (projected.x * 0.5 + 0.5) * hostW, sy = (-projected.y * 0.5 + 0.5) * hostH;
        liftTarget = 1 - clamp01((Math.hypot(sx - pointer.px, sy - pointer.py) - 20) / 110);
      }
      t.lift = damp(t.lift, liftTarget, 10, dt);

      if (t.device) {
        const p = pose[t.device];
        targetWorld(t, local, t.lift * p.grid.tileW * 0.35 - (t.isBook ? press * p.grid.tileW * 0.12 : 0));
        flipQ.setFromAxisAngle(yAxis, Math.PI * spring(clamp01((time - (FLIP_START + t.flipDelay)) / FLIP_DUR)));
        quat.copy(devQ[t.device]).multiply(flipQ);
        scl.set(p.grid.tileW, p.grid.tileH, p.grid.tileW);
      } else {
        const fl = t.float!;
        targetWorld(t, local, 0);
        euler.set(Math.sin(idle * 0.4 + t.spinSeed * 5) * 0.35, (fl.solid ? Math.PI : 0) + Math.sin(idle * 0.3 + t.spinSeed * 3) * 0.5, fl.rz * deg + idle * 0.05 * (t.spinSeed - 0.5), 'XYZ');
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
    (tileMat.uniforms.uLight!.value as Vector3).set(0.35 + rot.x * 3, 0.55 - rot.y * 3, 1).normalize();
  }

  return {
    scene, camera, layout, update,
    skip() { if (time < END) speed = Math.max(1, (END - time) / 0.35); },
    settle() { time = END; speed = 1; },
  };
}
