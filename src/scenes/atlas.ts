/**
 * One texture for every 3D scene, drawn at runtime (no image downloads).
 * Device screens are drawn cell by cell so each tile shows its piece of the design;
 * small extras (swatches, labels, day names) are separate cells.
 * Every cell is drawn at its tile's real proportions, so text never stretches.
 */
import { color } from '../design/tokens';
import { phone, browser, page, photoRegion, photoStops, type DeviceLayout, type Cell } from './layout';
import { heroPose } from './hero/pose';
import { grid, phoneGrid, journeyGeo } from './grid';

export interface UvRect { u: number; v: number; w: number; h: number }
export type Sheet = 'browser' | 'phone' | 'page';
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const LABELS = ['Cut', 'Fade', 'Gel', 'Fill', 'Beard', 'Pedi', 'Facial', 'Trim'] as const;
export type Misc =
  | 'bar' | 'gold' | 'mint' | 'surface' | 'text' | 'muted' | 'slot' | 'aa' | 'en' | 'es' | 'photo'
  | `day-${number}` | `label-${number}`;

export interface Atlas {
  canvas: HTMLCanvasElement;
  cell(sheet: Sheet, index: number): UvRect;
  misc(id: Misc): UvRect;
}

const CELL = 96;

function cssGradient(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  const len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
  const cx = x + w / 2, cy = y + h / 2;
  const dx = (Math.sin(a) * len) / 2, dy = (-Math.cos(a) * len) / 2;
  const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  photoStops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

interface Item { id: string; w: number; h: number; draw: (ctx: CanvasRenderingContext2D, x: number, y: number) => void; x?: number; y?: number }

export async function buildAtlas(scale = 1): Promise<Atlas> {
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue('--font-display').trim() || 'sans-serif';
  const body = root.getPropertyValue('--font-body').trim() || 'sans-serif';
  try { await document.fonts.load(`800 40px ${display}`, 'BOOKAaENES$30→MonCutFade'); } catch { /* use what's loaded */ }

  const cw = CELL * scale;
  const pad = Math.round(6 * scale);

  const glyph = (ctx: CanvasRenderingContext2D, char: string, x: number, y: number, w: number, h: number, fill: string, size: number, weight = 800, family = display) => {
    ctx.fillStyle = fill;
    ctx.font = `${weight} ${Math.round(size)}px ${family}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, x + w / 2, y + h / 2 + size * 0.04);
  };

  const drawCell = (ctx: CanvasRenderingContext2D, cell: Cell, x: number, y: number, w: number, h: number) => {
    const fill = (c: string) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    switch (cell.kind) {
      case 'photo': break;
      case 'dark': fill(color.raised); break;
      case 'logo': case 'icon': fill(color.secondary); break;
      case 'menu':
        fill(color.raised);
        ctx.fillStyle = color.muted;
        for (const f of [0.32, 0.5, 0.68]) ctx.fillRect(x + w * 0.25, y + h * f - h * 0.045, w * 0.5, h * 0.09);
        break;
      case 'title': fill(color.text); break;
      case 'text': fill(color.muted); break;
      case 'nav': fill('#4D5D56'); break;
      case 'card': fill('#22302A'); break;
      case 'price': fill(color.raised); glyph(ctx, cell.char ?? '', x, y, w, h, color.secondary, w * 0.3); break;
      case 'letter': case 'booked': fill(color.accent); if (cell.char) glyph(ctx, cell.char, x, y, w, h, color.onAccent, w * 0.5); break;
      case 'slot': drawSlot(ctx, x, y, w, h); break;
    }
  };

  const drawSlot = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = '#13201B';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color.secondary;
    ctx.lineWidth = Math.min(w, h) * 0.05;
    ctx.beginPath();
    ctx.roundRect(x + w * 0.12, y + h * 0.12, w * 0.76, h * 0.76, Math.min(w, h) * 0.14);
    ctx.stroke();
  };

  /** A whole device screen, laid out cell by cell with the same gaps as its tiles. */
  const sheet = (layout: DeviceLayout, aspect: number, gapRatio: number): Item & { ch: number; gap: number; layout: DeviceLayout } => {
    const ch = cw * aspect;
    const gap = cw * gapRatio;
    const w = layout.cols * cw + (layout.cols - 1) * gap;
    const h = layout.rows * ch + (layout.rows - 1) * gap;
    return {
      id: layout.id, w, h, ch, gap, layout,
      draw(ctx, ox, oy) {
        const reg = photoRegion(layout);
        if (reg.cols > 0) {
          const rx = ox + reg.minC * (cw + gap), ry = oy + reg.minR * (ch + gap);
          const rw = reg.cols * cw + (reg.cols - 1) * gap, rh = reg.rows * ch + (reg.rows - 1) * gap;
          ctx.fillStyle = cssGradient(ctx, rx, ry, rw, rh, 140);
          ctx.fillRect(rx, ry, rw, rh);
        }
        layout.cells.forEach((cell, i) => drawCell(ctx, cell, ox + (i % layout.cols) * (cw + gap), oy + Math.floor(i / layout.cols) * (ch + gap), cw, ch));
      },
    };
  };

  // Tile proportions from the real scene geometry.
  const hp = heroPose(1000, 1020);
  const pg = phoneGrid(300).grid;
  const pageGrid = grid(page.cols, page.rows, journeyGeo.page.w, journeyGeo.page.h);
  const cal = grid(6, 6, journeyGeo.calendar.w, journeyGeo.calendar.h);
  const sheets = {
    browser: sheet(browser, hp.browser.grid.tileH / hp.browser.grid.tileW, hp.browser.grid.gap / hp.browser.grid.tileW),
    phone: sheet(phone, pg.tileH / pg.tileW, pg.gap / pg.tileW),
    page: sheet(page, pageGrid.tileH / pageGrid.tileW, pageGrid.gap / pageGrid.tileW),
  };

  const sq = (id: string, draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void, aspect = 1): Item => ({
    id, w: cw, h: cw * aspect, draw: (ctx, x, y) => draw(ctx, x, y, cw, cw * aspect),
  });
  const solid = (c: string) => (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const dayAspect = (journeyGeo.calendar.header) / cal.tileW;
  const items: Item[] = [
    sheets.browser, sheets.phone, sheets.page,
    {
      id: 'bar', w: sheets.browser.w, h: Math.round(cw * 0.8),
      draw(ctx, x, y) {
        const w = sheets.browser.w, h = Math.round(cw * 0.8);
        ctx.fillStyle = color.surface; ctx.fillRect(x, y, w, h);
        ctx.fillStyle = color.raised; ctx.beginPath(); ctx.roundRect(x + w * 0.035, y + h * 0.31, w * 0.06, h * 0.38, h * 0.12); ctx.fill();
        ctx.fillStyle = color.bg; const pw = w * 0.5; ctx.beginPath(); ctx.roundRect(x + (w - pw) / 2, y + h * 0.22, pw, h * 0.56, h * 0.28); ctx.fill();
        glyph(ctx, 'yourshop.com', x, y, w, h, color.muted, h * 0.3, 500, body);
      },
    },
    sq('gold', solid(color.accent)), sq('mint', solid(color.secondary)), sq('surface', solid('#2B3D36')),
    sq('text', solid(color.text)), sq('muted', solid(color.muted)), sq('slot', drawSlot),
    sq('aa', (ctx, x, y, w, h) => { solid(color.raised)(ctx, x, y, w, h); glyph(ctx, 'Aa', x, y, w, h, color.text, w * 0.5); }),
    sq('en', (ctx, x, y, w, h) => { solid(color.raised)(ctx, x, y, w, h); glyph(ctx, 'EN', x, y, w, h, color.secondary, w * 0.34); }),
    sq('es', (ctx, x, y, w, h) => { solid(color.raised)(ctx, x, y, w, h); glyph(ctx, 'ES', x, y, w, h, color.accent, w * 0.34); }),
    sq('photo', (ctx, x, y, w, h) => { ctx.fillStyle = cssGradient(ctx, x, y, w, h, 140); ctx.fillRect(x, y, w, h); }),
    ...DAYS.map((d, i) => sq(`day-${i}`, (ctx, x, y, w, h) => { solid(color.surface)(ctx, x, y, w, h); glyph(ctx, d, x, y, w, h, color.muted, h * 0.6, 600, body); }, dayAspect)),
    ...LABELS.map((l, i) => sq(`label-${i}`, (ctx, x, y, w, h) => { solid(color.accent)(ctx, x, y, w, h); glyph(ctx, l, x, y, w, h, color.onAccent, Math.min(w * 0.26, h * 0.42)); }, cal.tileH / cal.tileW)),
  ];

  // First-fit shelf packing, tallest first.
  const maxW = Math.round(2048 * Math.min(1, scale + 0.05));
  const shelves: { y: number; h: number; x: number }[] = [];
  let height = pad;
  for (const it of [...items].sort((a, b) => b.h - a.h)) {
    let shelf = shelves.find((s) => s.x + it.w + pad <= maxW && it.h <= s.h);
    if (!shelf) { shelf = { y: height, h: it.h, x: pad }; shelves.push(shelf); height += it.h + pad; }
    it.x = shelf.x; it.y = shelf.y;
    shelf.x += it.w + pad;
  }
  const W = maxW, H = Math.ceil(height);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color.raised;
  ctx.fillRect(0, 0, W, H);
  for (const it of items) it.draw(ctx, it.x!, it.y!);

  const byId = new Map(items.map((it) => [it.id, it]));
  const toUv = (x: number, y: number, w: number, h: number): UvRect => ({ u: x / W, v: 1 - (y + h) / H, w: w / W, h: h / H });
  return {
    canvas,
    cell(id, index) {
      const s = sheets[id];
      const it = byId.get(id)!;
      const col = index % s.layout.cols, row = Math.floor(index / s.layout.cols);
      return toUv(it.x! + col * (cw + s.gap), it.y! + row * (s.ch + s.gap), cw, s.ch);
    },
    misc(id) {
      const it = byId.get(id)!;
      return toUv(it.x!, it.y!, it.w, it.h);
    },
  };
}
