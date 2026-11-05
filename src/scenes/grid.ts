/** Tile grid math shared by the scenes and the atlas (so drawn cells match tile proportions). */
import { GAP_RATIO } from './hero/constants';

export interface Grid { w: number; h: number; cols: number; rows: number; gap: number; tileW: number; tileH: number }

export function grid(cols: number, rows: number, w: number, h: number): Grid {
  const gap = (GAP_RATIO * w) / cols;
  return { w, h, cols, rows, gap, tileW: (w - (cols - 1) * gap) / cols, tileH: (h - (rows - 1) * gap) / rows };
}

/** Center of cell (col, row) relative to the grid center, y up. */
export function cellCenter(g: Grid, col: number, row: number) {
  return {
    x: -g.w / 2 + g.tileW / 2 + col * (g.tileW + g.gap),
    y: g.h / 2 - g.tileH / 2 - row * (g.tileH + g.gap),
  };
}

/** Phone proportions (9 : 17.5) with a 7% inset, as in the CSS poster. */
export function phoneGrid(phoneW: number) {
  const ph = (phoneW * 17.5) / 9;
  const pad = 0.07 * phoneW;
  return { w: phoneW, h: ph, radius: phoneW * 0.16, grid: grid(5, 9, phoneW - 2 * pad, ph - 2 * pad) };
}

/** Chapter scenes, in units of the stage width (the stage is 1 : 0.9). */
export const journeyGeo = {
  page: { w: 0.84, h: 0.62 },
  calendar: { w: 0.8, h: 0.56, header: 0.05 },
  phoneW: 0.3,
};
