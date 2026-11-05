/** Easing functions built from the motion tokens, so 3D motion matches CSS motion exactly. */
import { motion, springPoints } from '../design/tokens';

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sx(t) - x;
      const d = dx(t);
      if (Math.abs(err) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

function fromToken(token: string) {
  const n = token.match(/[-\d.]+/g)!.map(Number) as [number, number, number, number];
  return cubicBezier(...n);
}

export const easeOut = fromToken(motion.ease.out);
export const easeInOut = fromToken(motion.ease.inOut);

/** The same damped spring as the CSS `--ease-spring` linear() curve. */
export function spring(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const f = x * (springPoints.length - 1);
  const i = Math.floor(f);
  const a = springPoints[i]!, b = springPoints[i + 1] ?? 1;
  return a + (b - a) * (f - i);
}

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Frame-rate-independent smoothing toward a target. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
