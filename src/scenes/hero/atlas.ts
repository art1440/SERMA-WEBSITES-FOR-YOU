/**
 * Draws both device screens into one texture at runtime (no image downloads).
 * Each tile samples its own cell, so the screens read as one design split across tiles.
 */
import { color } from '../../design/tokens';
import { phone, browser, photoRegion, photoStops, type DeviceLayout, type Cell } from '../layout';
import { heroPose } from './pose';

export interface UvRect { u: number; v: number; w: number; h: number }
export interface Atlas {
  canvas: HTMLCanvasElement;
  cell: (device: 'phone' | 'browser', index: number) => UvRect;
  bar: UvRect;
  marigold: UvRect;
}

const CELL = 112; // px width of one tile cell in the atlas at scale 1

interface Placed { layout: DeviceLayout; x: number; y: number; cw: number; ch: number; gap: number }

function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** CSS-style linear gradient (angle in degrees, 0 = to top) across a box. */
function cssGradient(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  const len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
  const cx = x + w / 2, cy = y + h / 2;
  const dx = (Math.sin(a) * len) / 2, dy = (-Math.cos(a) * len) / 2;
  const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  photoStops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

function drawDevice(ctx: CanvasRenderingContext2D, p: Placed, display: string) {
  const { layout, x, y, cw, ch, gap } = p;
  const at = (i: number) => ({ cx: x + (i % layout.cols) * (cw + gap), cy: y + Math.floor(i / layout.cols) * (ch + gap) });

  // The photo is drawn once across its whole region so it reads as one image.
  const reg = photoRegion(layout);
  if (reg.cols > 0) {
    const rx = x + reg.minC * (cw + gap), ry = y + reg.minR * (ch + gap);
    const rw = reg.cols * cw + (reg.cols - 1) * gap, rh = reg.rows * ch + (reg.rows - 1) * gap;
    ctx.fillStyle = cssGradient(ctx, rx, ry, rw, rh, 140);
    ctx.fillRect(rx, ry, rw, rh);
  }

  layout.cells.forEach((cell: Cell, i) => {
    const { cx, cy } = at(i);
    const fill = (c: string) => { ctx.fillStyle = c; ctx.fillRect(cx, cy, cw, ch); };
    const glyph = (char: string, c: string, size: number) => {
      ctx.fillStyle = c;
      ctx.font = `800 ${Math.round(cw * size)}px ${display}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, cx + cw / 2, cy + ch / 2 + cw * 0.03);
    };
    switch (cell.kind) {
      case 'photo': break;
      case 'dark': fill(color.raised); break;
      case 'logo': case 'icon': fill(color.secondary); break;
      case 'menu':
        fill(color.raised);
        ctx.fillStyle = color.muted;
        for (const f of [0.32, 0.5, 0.68]) ctx.fillRect(cx + cw * 0.25, cy + ch * f - ch * 0.045, cw * 0.5, ch * 0.09);
        break;
      case 'title': fill(color.text); break;
      case 'text': fill(color.muted); break;
      case 'nav': fill('#4D5D56'); break;
      case 'card':
        fill('#22302A');
        break;
      case 'price': fill(color.raised); glyph(cell.char ?? '', color.secondary, 0.3); break;
      case 'letter': case 'booked': fill(color.accent); if (cell.char) glyph(cell.char, color.onAccent, 0.5); break;
      case 'slot':
        fill('#13201B');
        ctx.strokeStyle = color.secondary;
        ctx.lineWidth = cw * 0.05;
        rounded(ctx, cx + cw * 0.12, cy + ch * 0.12, cw * 0.76, ch * 0.76, cw * 0.14);
        ctx.stroke();
        break;
    }
  });
}

export async function buildAtlas(scale = 1): Promise<Atlas> {
  const display = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'sans-serif';
  try { await document.fonts.load(`800 40px ${display}`, 'BOOK$30→'); } catch { /* fall back to whatever is loaded */ }

  // Cell proportions come from the real tile sizes, so letters aren't stretched.
  const pose = heroPose(1000, 1020);
  const bAspect = pose.browser.grid.tileH / pose.browser.grid.tileW;
  const pAspect = pose.phone.grid.tileH / pose.phone.grid.tileW;
  const cw = CELL * scale;
  const pad = 8 * scale;

  const bGap = cw * (pose.browser.grid.gap / pose.browser.grid.tileW);
  const pGap = cw * (pose.phone.grid.gap / pose.phone.grid.tileW);
  const bW = browser.cols * cw + (browser.cols - 1) * bGap, bH = browser.rows * cw * bAspect + (browser.rows - 1) * bGap;
  const pW = phone.cols * cw + (phone.cols - 1) * pGap, pH = phone.rows * cw * pAspect + (phone.rows - 1) * pGap;
  const barH = Math.round(cw * 0.8);

  const W = Math.ceil(bW + pW + pad * 3);
  const H = Math.ceil(Math.max(bH + barH + pad * 3 + cw, pH + pad * 2));
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color.raised;
  ctx.fillRect(0, 0, W, H);

  const placed: Record<'browser' | 'phone', Placed> = {
    browser: { layout: browser, x: pad, y: pad, cw, ch: cw * bAspect, gap: bGap },
    phone: { layout: phone, x: pad * 2 + bW, y: pad, cw, ch: cw * pAspect, gap: pGap },
  };
  drawDevice(ctx, placed.browser, display);
  drawDevice(ctx, placed.phone, display);

  // Browser top bar: one small tab tile and the address pill.
  const barY = pad * 2 + bH;
  const barW = bW;
  ctx.fillStyle = color.surface;
  ctx.fillRect(pad, barY, barW, barH);
  ctx.fillStyle = color.raised;
  rounded(ctx, pad + barW * 0.035, barY + barH * 0.31, barW * 0.06, barH * 0.38, barH * 0.12); ctx.fill();
  ctx.fillStyle = color.bg;
  const pillW = barW * 0.5;
  rounded(ctx, pad + (barW - pillW) / 2, barY + barH * 0.22, pillW, barH * 0.56, barH * 0.28); ctx.fill();
  ctx.fillStyle = color.muted;
  ctx.font = `500 ${Math.round(barH * 0.3)}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim() || 'sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('yourshop.com', pad + barW / 2, barY + barH / 2);

  // Solid marigold swatch for loose "booked" tiles.
  const swY = barY + barH + pad;
  ctx.fillStyle = color.accent;
  ctx.fillRect(pad, swY, cw, cw);

  const toUv = (x: number, y: number, w: number, h: number): UvRect => ({ u: x / W, v: 1 - (y + h) / H, w: w / W, h: h / H });
  return {
    canvas,
    cell(device, index) {
      const p = placed[device];
      const col = index % p.layout.cols, row = Math.floor(index / p.layout.cols);
      return toUv(p.x + col * (p.cw + p.gap), p.y + row * (p.ch + p.gap), p.cw, p.ch);
    },
    bar: toUv(pad, barY, barW, barH),
    marigold: toUv(pad + cw * 0.2, swY + cw * 0.2, cw * 0.6, cw * 0.6),
  };
}
