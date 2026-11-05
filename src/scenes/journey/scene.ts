/**
 * The scroll journey through "What every site includes".
 * One set of tiles rearranges as you scroll: a mood board (Design), a page wireframe that flips
 * into the finished design (Build), a week calendar where appointments drop in (Booking),
 * and a phone that lights up (Launch). The same scene also renders the half-built phone
 * next to the final form (Finale).
 *
 * Desktop: one sticky stage, scrubbed by the page's own scroll position (never hijacked).
 * Phones: each chapter has its own small stage; the canvas moves into whichever is on screen.
 */
import {
  Scene, PerspectiveCamera, Group, InstancedMesh, Mesh, Matrix4, Quaternion, Vector3, Euler,
  InstancedBufferAttribute, PlaneGeometry, DynamicDrawUsage, type BufferGeometry, type ShaderMaterial,
} from 'three';
import { easeInOut, easeOut, spring, clamp01, damp } from '../ease';
import { tileGeometry, tileMaterial, bodyMaterial, roundedRectGeometry, rng } from '../tiles';
import { grid, cellCenter, phoneGrid, journeyGeo } from '../grid';
import { page as pageLayout } from '../layout';
import type { UvRect } from '../atlas';
import type { Runtime, StageScene, FrameInput, Entry } from '../runtime';

const N = 56;
const deg = Math.PI / 180;

interface Slot { x: number; y: number; z: number; w: number; h: number; img: boolean; uv: UvRect; hidden: boolean; spin?: number }

/** Formations along the scroll path. Index = position on the path. */
const PATH = ['design', 'wire', 'build', 'booking', 'launch'] as const;
type Shape = (typeof PATH)[number] | 'cloud' | 'finale';

/** How the whole arrangement is turned in each formation: the "camera" travelling. Degrees, px of W for z. */
const VIEW: Record<Shape, { rx: number; ry: number; rz: number; z: number }> = {
  design: { rx: -30, ry: 10, rz: -3, z: -0.05 },
  wire: { rx: -12, ry: -12, rz: 0, z: 0 },
  build: { rx: -9, ry: -9, rz: 0, z: 0 },
  booking: { rx: -36, ry: 6, rz: 2, z: -0.06 },
  launch: { rx: -3, ry: -16, rz: 0, z: 0.03 },
  cloud: { rx: 4, ry: 18, rz: -2, z: -0.1 },
  finale: { rx: 2, ry: 14, rz: -2, z: 0 },
};

/** Scroll progress r (0 = Design centered ... 3 = Launch centered) to path position q. Holds keep each chapter readable. */
const Q_OF_R: [number, number][] = [[0, 0], [0.3, 0], [0.62, 1], [0.7, 1], [0.98, 2], [1.4, 2], [1.78, 3], [2.4, 3], [2.78, 4], [3, 4]];
const qOfR = (r: number) => {
  if (r <= Q_OF_R[0]![0]) return Q_OF_R[0]![1];
  for (let i = 1; i < Q_OF_R.length; i++) {
    const [r1, q1] = Q_OF_R[i]!, [r0, q0] = Q_OF_R[i - 1]!;
    if (r <= r1) return q0 + ((r - r0) / (r1 - r0)) * (q1 - q0);
  }
  return Q_OF_R[Q_OF_R.length - 1]![1];
};

/** Appointment blocks: [day, row]. They drop in one by one during the Booking chapter. */
const BLOCKS: [number, number][] = [[2, 0], [0, 3], [4, 0], [1, 1], [3, 3], [5, 3], [1, 4], [3, 1], [4, 4], [2, 2]];

export function createJourneyScene(rt: Runtime): StageScene {
  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 10, 8000);
  const root = new Group();
  scene.add(root);

  const tileMat = tileMaterial(rt.texture);
  const geo = tileGeometry(rt.tier.tier);
  const uvArr = new Float32Array(N * 4);
  const styleArr = new Float32Array(N * 4).fill(0);
  for (let i = 0; i < N; i++) styleArr[i * 4] = 1;
  const uvAttr = new InstancedBufferAttribute(uvArr, 4);
  uvAttr.setUsage(DynamicDrawUsage);
  geo.setAttribute('aUv', uvAttr);
  geo.setAttribute('aStyle', new InstancedBufferAttribute(styleArr, 4));
  const mesh = new InstancedMesh(geo, tileMat, N);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  mesh.frustumCulled = false;
  root.add(mesh);

  const bodyMat = bodyMaterial('#1E2C27', '#111A17');
  const body = new Mesh<BufferGeometry, ShaderMaterial>(new PlaneGeometry(1, 1), bodyMat);
  root.add(body);

  const random = rng(4242);
  const seeds = Array.from({ length: N }, () => random());

  // ---------- Formations ----------
  const atlas = rt.atlas;
  const slotUv = atlas.misc('slot');
  let W = 1, H = 1;
  let mode: 'journey' | 'finale' = 'journey';
  const shapes = {} as Record<Shape, Slot[]>;
  const angles = {} as Record<Shape, number[]>;
  let phone = phoneGrid(1);
  let phoneCenter = { x: 0, y: 0 };
  let cloudRing: { a: number; r: number; z: number; s: number }[] = [];

  const hidden = (x = 0, y = 0): Slot => ({ x, y, z: 0, w: 0, h: 0, img: false, uv: slotUv, hidden: true });
  const fill = (list: Slot[]) => { while (list.length < N) list.push(hidden()); return list.slice(0, N); };

  function buildShapes() {
    // Design: a mood board on a table.
    const d: Slot[] = [];
    const sq = (x: number, y: number, s: number, uv: UvRect, img = true): Slot => ({ x: x * W, y: y * W, z: 0, w: s * W, h: s * W, img, uv, hidden: false });
    d.push(sq(-0.2, 0.15, 0.28, atlas.misc('aa')), sq(0.13, 0.15, 0.28, atlas.misc('photo')));
    (['gold', 'mint', 'surface', 'text'] as const).forEach((id, i) => d.push(sq(-0.29 + i * 0.12, -0.09, 0.1, atlas.misc(id))));
    d.push(sq(0.19, -0.09, 0.1, atlas.misc('en')), sq(0.31, -0.09, 0.1, atlas.misc('es')));
    for (let i = 0; i < 6; i++) d.push({ x: (-0.29 + i * 0.12) * W, y: -0.23 * W, z: 0, w: 0.1 * W, h: 0.04 * W, img: true, uv: atlas.misc(i % 2 ? 'muted' : 'text'), hidden: false });
    const scatterRand = rng(99);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + scatterRand() * 0.3;
      d.push({ x: Math.cos(a) * 0.42 * W, y: Math.sin(a) * 0.36 * W, z: (scatterRand() - 0.5) * 0.3 * W, w: 0.05 * W, h: 0.05 * W, img: false, uv: slotUv, hidden: false, spin: scatterRand() });
    }
    shapes.design = fill(d);

    // Build: a page as a wireframe, then the finished design on the same tiles.
    const pg = grid(pageLayout.cols, pageLayout.rows, journeyGeo.page.w * W, journeyGeo.page.h * W);
    const wire: Slot[] = [], build: Slot[] = [];
    for (let i = 0; i < pageLayout.cols * pageLayout.rows; i++) {
      const c = cellCenter(pg, i % pageLayout.cols, Math.floor(i / pageLayout.cols));
      wire.push({ x: c.x, y: c.y, z: 0, w: pg.tileW, h: pg.tileH, img: false, uv: slotUv, hidden: false });
      build.push({ x: c.x, y: c.y, z: 0, w: pg.tileW, h: pg.tileH, img: true, uv: atlas.cell('page', i), hidden: false });
    }
    shapes.wire = fill(wire);
    shapes.build = fill(build);

    // Booking: a week calendar. Day names, open slots, then appointments that drop in.
    const cg = grid(6, 6, journeyGeo.calendar.w * W, journeyGeo.calendar.h * W);
    const headH = journeyGeo.calendar.header * W;
    const gridY = -(headH + cg.gap) / 2;
    const b: Slot[] = [];
    for (let dIdx = 0; dIdx < 6; dIdx++) {
      const c = cellCenter(cg, dIdx, 0);
      b.push({ x: c.x, y: gridY + cg.h / 2 + cg.gap + headH / 2, z: 0, w: cg.tileW, h: headH, img: true, uv: atlas.misc(`day-${dIdx}`), hidden: false });
    }
    for (let row = 0; row < 6; row++) for (let day = 0; day < 6; day++) {
      const c = cellCenter(cg, day, row);
      b.push({ x: c.x, y: gridY + c.y, z: 0, w: cg.tileW, h: cg.tileH, img: false, uv: slotUv, hidden: false });
    }
    BLOCKS.forEach(([day, row], k) => {
      const c = cellCenter(cg, day, row);
      b.push({ x: c.x, y: gridY + c.y, z: Math.min(cg.tileW, cg.tileH) * 0.42, w: cg.tileW * 0.96, h: cg.tileH * 0.92, img: true, uv: atlas.misc(`label-${k % 8}`), hidden: false });
    });
    shapes.booking = fill(b);

    // Launch: the phone, lit, with a ring of loose tiles pulsing around it.
    const phoneShape = (cx: number, cy: number, pw: number, finishedRows: number) => {
      phone = phoneGrid(pw);
      phoneCenter = { x: cx, y: cy };
      const list: Slot[] = [];
      for (let i = 0; i < 45; i++) {
        const row = Math.floor(i / 5);
        const c = cellCenter(phone.grid, i % 5, row);
        const done = row < finishedRows;
        list.push({ x: cx + c.x, y: cy + c.y, z: 0, w: phone.grid.tileW, h: phone.grid.tileH, img: done, uv: done ? atlas.cell('phone', i) : slotUv, hidden: false });
      }
      return list;
    };
    const ringRand = rng(7);
    cloudRing = Array.from({ length: N - 45 }, (_, i) => ({ a: (i / (N - 45)) * Math.PI * 2 + ringRand() * 0.25, r: 0.36 + ringRand() * 0.06, z: (ringRand() - 0.5) * 0.25, s: 0.035 + ringRand() * 0.025 }));
    const ring = (cx: number) => cloudRing.map((c): Slot => ({ x: cx + Math.cos(c.a) * c.r * W, y: Math.sin(c.a) * c.r * 0.85 * W, z: c.z * W, w: c.s * W, h: c.s * W, img: false, uv: slotUv, hidden: false, spin: c.a }));

    if (mode === 'journey') {
      shapes.launch = fill([...phoneShape(0, 0, journeyGeo.phoneW * W, 9), ...ring(0)]);
    } else {
      // Finale: same phone, half built: "Your site is next."
      shapes.finale = fill([...phoneShape(-0.04 * W, 0, 0.3 * W, 5), ...ring(-0.04 * W)]);
      const cr = rng(13);
      shapes.cloud = Array.from({ length: N }, (): Slot => {
        const a = cr() * Math.PI * 2;
        const r = (0.35 + cr() * 0.3) * W;
        const s = (0.03 + cr() * 0.04) * W;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.7, z: (cr() - 0.5) * 0.5 * W, w: s, h: s, img: false, uv: slotUv, hidden: false, spin: cr() };
      });
    }

    // Accumulated flip angle per tile along each path, so every change is a real flip:
    // half a turn to change face, a full turn when the tile moves but keeps its face.
    const walk = (seq: Shape[]) => {
      const prev = new Array<number>(N).fill(0);
      const lastImg = new Array<boolean>(N).fill(false);
      seq.forEach((name, k) => {
        const list = shapes[name];
        const out = new Array<number>(N);
        for (let i = 0; i < N; i++) {
          const s = list[i]!;
          if (k === 0) { out[i] = s.img ? Math.PI : 0; lastImg[i] = s.img; continue; }
          if (s.hidden) { out[i] = prev[i]!; continue; }
          const before = shapes[seq[k - 1]!][i]!;
          const moved = before.hidden || Math.abs(before.x - s.x) + Math.abs(before.y - s.y) > 1;
          out[i] = prev[i]! + (s.img !== lastImg[i] ? Math.PI : moved ? Math.PI * 2 : 0);
          lastImg[i] = s.img;
        }
        angles[name] = out;
        out.forEach((v, i) => (prev[i] = v));
      });
    };
    if (mode === 'journey') walk([...PATH]); else walk(['cloud', 'finale']);

    body.geometry.dispose();
    body.geometry = roundedRectGeometry(phone.w, phone.h, phone.radius, Math.max(8, phone.w * 0.06));
    bodyMat.uniforms.uHalfH!.value = phone.h / 2;
  }

  // ---------- State ----------
  let r = 0, rTarget = 0; // scroll progress (journey)
  let finaleT = 0; // seconds since the finale started assembling
  let idle = 0;
  const rot = { x: 0, y: 0 };
  const m4 = new Matrix4(), pos = new Vector3(), quat = new Quaternion(), scl = new Vector3();
  const viewQ = new Quaternion(), flipQ = new Quaternion(), e3 = new Euler();
  const yAxis = new Vector3(0, 1, 0);

  function scrollTarget(entry: Entry, rect: DOMRect) {
    const vh = innerHeight;
    if (entry.params.mode === 'sticky') {
      const chapters = entry.params.chapters as HTMLElement[];
      const centers = chapters.map((c) => { const b = c.getBoundingClientRect(); return b.top + b.height / 2; });
      const line = vh * 0.5;
      if (line <= centers[0]!) return 0;
      for (let i = 0; i < centers.length - 1; i++) {
        if (line < centers[i + 1]!) return i + (line - centers[i]!) / (centers[i + 1]! - centers[i]!);
      }
      return centers.length - 1;
    }
    const chapter = entry.params.chapter as number;
    const t = clamp01((vh - rect.top) / (vh + rect.height));
    return Math.max(0, Math.min(3, chapter - 0.35 + 0.7 * t));
  }

  function layout(w: number, h: number, entry: Entry) {
    W = w; H = h;
    mode = entry.params.mode === 'finale' ? 'finale' : 'journey';
    buildShapes();
  }

  function activate(entry: Entry, previous: Entry | null) {
    const wasJourney = previous && previous.scene === api && previous.params.mode !== 'finale';
    if (entry.params.mode === 'finale') return;
    rTarget = scrollTarget(entry, entry.stage.getBoundingClientRect());
    // Moving between chapter stages keeps continuity; arriving from elsewhere starts in place.
    if (!wasJourney) r = rTarget;
  }

  function settle() { finaleT = 10; r = rTarget; }

  function update(input: FrameInput, entry: Entry) {
    const { dt, pointer, tilt, coarse, rect } = input;
    idle += dt;

    let from: Shape, to: Shape, u: number, inner = 0, lit = 0, bodyIn = 0;
    if (mode === 'finale') {
      finaleT += dt;
      from = 'cloud'; to = 'finale';
      u = clamp01(finaleT / 2.2);
      bodyIn = clamp01((finaleT - 0.8) / 0.8);
    } else {
      rTarget = scrollTarget(entry, rect);
      r = dt ? damp(r, rTarget, 5, dt) : r;
      const q = qOfR(r);
      const f0 = Math.min(PATH.length - 1, Math.floor(q));
      from = PATH[f0]!; to = PATH[Math.min(PATH.length - 1, f0 + 1)]!;
      u = q - f0;
      inner = clamp01((r - 1.82) / 0.5); // appointments dropping
      lit = clamp01(q - 3.5) * 2;
      bodyIn = clamp01((q - 3.45) / 0.45);
    }

    // View: blend the two formations' angles, plus a little pointer/tilt response.
    const va = VIEW[from], vb = VIEW[to];
    const ve = easeInOut(u);
    const px = coarse ? tilt.x * 4 : pointer.inside ? pointer.x * 5 : 0;
    const py = coarse ? tilt.y * 3 : pointer.inside ? pointer.y * 3 : 0;
    rot.x = damp(rot.x, px, 4, dt || 1);
    rot.y = damp(rot.y, py, 4, dt || 1);
    e3.set(
      (va.rx + (vb.rx - va.rx) * ve + rot.y + Math.sin(idle * 0.5) * 0.8) * deg,
      (va.ry + (vb.ry - va.ry) * ve + rot.x + Math.sin(idle * 0.37) * 1.2) * deg,
      (va.rz + (vb.rz - va.rz) * ve) * deg,
      'YXZ',
    );
    viewQ.setFromEuler(e3);
    root.quaternion.copy(viewQ);
    root.position.set(0, 0, (va.z + (vb.z - va.z) * ve) * W);

    const A = shapes[from], B = shapes[to];
    const angA = angles[from], angB = angles[to];
    const blockStart = 42; // booking: 6 days + 36 slots, then the appointment blocks

    for (let i = 0; i < N; i++) {
      const a = A[i]!, b = B[i]!;
      // Tiles move in a left-to-right sweep, with a little randomness.
      const sweep = clamp01(((a.hidden ? b.x : a.x) / W + 0.5) * 0.8 + seeds[i]! * 0.2);
      const t = clamp01((u - sweep * 0.4) / 0.6);
      const e = easeInOut(t);
      let x: number, y: number, z: number, w: number, h: number;
      if (a.hidden && b.hidden) { w = h = 0; x = a.x; y = a.y; z = 0; }
      else if (a.hidden) { x = b.x; y = b.y; z = b.z; w = b.w * e; h = b.h * e; }
      else if (b.hidden) { x = a.x; y = a.y; z = a.z; w = a.w * (1 - e); h = a.h * (1 - e); }
      else {
        x = a.x + (b.x - a.x) * e; y = a.y + (b.y - a.y) * e; z = a.z + (b.z - a.z) * e;
        w = a.w + (b.w - a.w) * e; h = a.h + (b.h - a.h) * e;
      }
      // Lift while travelling, so tiles visibly pass over each other.
      z += Math.sin(Math.PI * e) * 0.1 * W;

      // Appointment blocks fall onto the calendar during Booking (scroll-scrubbed, reversible).
      const onBooking = (from === 'booking' && t < 0.5) || (to === 'booking' && t >= 0.5);
      if (mode === 'journey' && i >= blockStart && i < blockStart + BLOCKS.length && onBooking) {
        const k = i - blockStart;
        const local = clamp01((inner - k * 0.07) / 0.3);
        const s = spring(local);
        z += (1 - s) * 0.45 * W;
        y += (1 - s) * 0.08 * W;
        const appear = clamp01(local * 5);
        w *= appear; h *= appear;
      }

      // Loose tiles drift (design cloud, launch ring, finale ring).
      const shown = t < 0.5 ? a : b;
      const loose = !shown.hidden && shown.spin !== undefined;
      if (loose) {
        y += Math.sin(idle * 0.8 + seeds[i]! * 6) * 0.012 * W;
        if ((to === 'launch' || to === 'finale') && i >= 45) {
          const pulse = 1 + 0.06 * Math.sin(idle * 2.2 - (b.spin ?? 0) * 2);
          x = phoneCenter.x + (x - phoneCenter.x) * pulse;
          y = y * pulse;
        }
      }
      if (mode === 'finale' && t >= 1 && i < 45 && !b.img) {
        // Open slots on the half-built phone breathe a little: they're waiting for your site.
        z += Math.sin(idle * 1.6 + i * 0.4) * 2;
      }

      const ang = angA[i]! + (angB[i]! - angA[i]!) * spring(t);
      flipQ.setFromAxisAngle(yAxis, ang);
      if (loose) {
        e3.set(Math.sin(idle * 0.4 + seeds[i]! * 5) * 0.4, ang, idle * 0.1 * (seeds[i]! - 0.5), 'XYZ');
        quat.setFromEuler(e3);
      } else quat.copy(flipQ);

      const depth = Math.max(0.0001, Math.min(w, h));
      pos.set(x, y, z);
      scl.set(Math.max(0.0001, w), Math.max(0.0001, h), depth);
      m4.compose(pos, quat, scl);
      mesh.setMatrixAt(i, m4);

      const uv = t < 0.5 ? a.uv : b.uv;
      uvArr[i * 4] = uv.u; uvArr[i * 4 + 1] = uv.v; uvArr[i * 4 + 2] = uv.w; uvArr[i * 4 + 3] = uv.h;
    }
    mesh.instanceMatrix.needsUpdate = true;
    uvAttr.needsUpdate = true;

    // Phone body behind the tiles, only for Launch and the Finale.
    const bodyT = easeOut(bodyIn);
    bodyMat.uniforms.uOpacity!.value = bodyT;
    body.visible = bodyT > 0.001;
    const bodyDepth = Math.max(8, phone.w * 0.06);
    body.position.set(phoneCenter.x, phoneCenter.y, -Math.min(phone.grid.tileW, phone.grid.tileH) * 0.5 - bodyDepth / 2 - 2);
    body.scale.set(0.94 + 0.06 * bodyT, 0.94 + 0.06 * bodyT, 1);
    tileMat.uniforms.uLit!.value = lit * (0.75 + 0.25 * Math.sin(idle * 2.2));
    (tileMat.uniforms.uLight!.value as Vector3).set(0.35 + rot.x * 0.05, 0.55 - rot.y * 0.05, 1).normalize();
  }

  const api: StageScene = { scene, camera, layout, update, activate, settle };
  return api;
}
