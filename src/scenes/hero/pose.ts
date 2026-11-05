/**
 * Where the browser window and the phone sit inside the hero stage, in CSS pixels.
 * The CSS poster (Hero.astro) uses the same numbers, so the still and the 3D line up.
 */
import { GAP_RATIO } from './constants';

export interface DevicePose {
  w: number; h: number;
  /** Center, relative to the stage center. Y up (three.js), so CSS y is flipped. */
  x: number; y: number; z: number;
  /** Degrees, three.js axes (CSS rotateX/rotateZ are negated). */
  rx: number; ry: number; rz: number;
  depth: number;
  radius: number;
  /** The tile grid area inside the device. */
  grid: { x: number; y: number; w: number; h: number; cols: number; rows: number; tileW: number; tileH: number; gap: number };
}

function grid(cols: number, rows: number, w: number, h: number, offX: number, offY: number) {
  const gap = (GAP_RATIO * w) / cols;
  return { x: offX, y: offY, w, h, cols, rows, gap, tileW: (w - (cols - 1) * gap) / cols, tileH: (h - (rows - 1) * gap) / rows };
}

export function heroPose(W: number, H: number) {
  // Browser: left 0, top 8%, width 78%, 4:3. CSS: translateZ(-60px) rotateY(16deg) rotateX(4deg).
  const bw = 0.78 * W, bh = bw * 0.75;
  const bar = 0.1 * bh, pad = 0.035 * bw;
  const bGridW = bw - 2 * pad, bGridH = bh - bar - 2 * pad;
  const browser: DevicePose = {
    w: bw, h: bh,
    x: 0.39 * W - W / 2, y: -(0.08 * H + bh / 2 - H / 2), z: -60,
    rx: -4, ry: 16, rz: 0,
    depth: Math.max(8, bw * 0.02), radius: Math.min(24, bw * 0.045),
    // grid center offset from device center: bar pushes it down
    grid: grid(10, 7, bGridW, bGridH, 0, -(bar / 2)),
  };

  // Phone: right 2%, bottom 0, width 42%, 9:17.5. CSS: translateZ(40px) rotateY(-14deg) rotateX(6deg) rotateZ(2deg).
  const pw = 0.42 * W, ph = (pw * 17.5) / 9;
  const ppad = 0.07 * pw;
  const phone: DevicePose = {
    w: pw, h: ph,
    x: W - 0.02 * W - pw / 2 - W / 2, y: -(H - ph / 2 - H / 2), z: 40,
    rx: -6, ry: -14, rz: -2,
    depth: Math.max(10, pw * 0.06), radius: pw * 0.16,
    grid: grid(5, 9, pw - 2 * ppad, ph - 2 * ppad, 0, 0),
  };

  return { browser, phone, bar, barPad: pad };
}
