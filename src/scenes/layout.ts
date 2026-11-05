/**
 * The two devices in the hero, described cell by cell.
 * The CSS poster and the 3D scene both draw from this, so the still fallback
 * and the live scene always show the same design.
 */

export type CellKind =
  | 'dark' // empty surface
  | 'logo'
  | 'menu'
  | 'photo'
  | 'title' // bright text bar
  | 'text' // muted text bar
  | 'icon'
  | 'price'
  | 'letter' // marigold tile with a character
  | 'nav'
  | 'card'
  | 'slot' // open calendar slot (mint outline)
  | 'booked'; // booked slot (marigold)

export interface Cell { kind: CellKind; char?: string }

export interface DeviceLayout {
  id: 'phone' | 'browser' | 'page';
  cols: number;
  rows: number;
  cells: Cell[];
}

const c = (kind: CellKind, char?: string): Cell => (char ? { kind, char } : { kind });
const row = (...cells: Cell[]) => cells;
const repeat = (n: number, cell: Cell) => Array.from({ length: n }, () => ({ ...cell }));

export const phone: DeviceLayout = {
  id: 'phone',
  cols: 5,
  rows: 9,
  cells: [
    ...row(c('logo'), c('dark'), c('dark'), c('dark'), c('menu')),
    ...repeat(5, c('photo')),
    ...repeat(5, c('photo')),
    ...repeat(5, c('photo')),
    ...row(c('title'), c('title'), c('title'), c('title'), c('dark')),
    ...row(c('text'), c('text'), c('text'), c('dark'), c('dark')),
    ...row(c('icon'), c('text'), c('text'), c('dark'), c('price', '$30')),
    ...row(c('icon'), c('text'), c('text'), c('dark'), c('price', '$38')),
    ...row(c('letter', 'B'), c('letter', 'O'), c('letter', 'O'), c('letter', 'K'), c('letter', '→')),
  ],
};

export const browser: DeviceLayout = {
  id: 'browser',
  cols: 10,
  rows: 7,
  cells: [
    ...row(c('logo'), ...repeat(5, c('dark')), c('nav'), c('nav'), c('nav'), c('booked', '→')),
    ...row(...repeat(6, c('photo')), ...repeat(4, c('title'))),
    ...row(...repeat(6, c('photo')), c('text'), c('text'), c('text'), c('dark')),
    ...row(...repeat(6, c('photo')), c('letter', 'B'), c('letter', 'O'), c('letter', 'O'), c('letter', 'K')),
    ...row(c('icon'), c('text'), c('text'), ...repeat(7, c('dark'))),
    ...row(...repeat(3, c('card')), ...repeat(3, c('card')), c('slot'), c('booked'), c('slot'), c('slot')),
    ...row(...repeat(3, c('card')), ...repeat(3, c('card')), c('slot'), c('slot'), c('booked'), c('slot')),
  ],
};

/** A desktop page, used by the "Build" chapter: wireframe first, then the finished design. */
export const page: DeviceLayout = {
  id: 'page',
  cols: 8,
  rows: 6,
  cells: [
    ...row(c('logo'), c('dark'), c('dark'), c('dark'), c('nav'), c('nav'), c('nav'), c('booked', '→')),
    ...row(c('title'), c('title'), c('title'), c('title'), ...repeat(4, c('photo'))),
    ...row(c('text'), c('text'), c('text'), c('dark'), ...repeat(4, c('photo'))),
    ...row(c('letter', 'B'), c('letter', 'O'), c('letter', 'O'), c('letter', 'K'), ...repeat(4, c('photo'))),
    ...row(c('card'), c('card'), c('slot'), c('booked'), c('card'), c('card'), c('icon'), c('text')),
    ...row(c('card'), c('card'), c('slot'), c('slot'), c('card'), c('card'), c('icon'), c('text')),
  ],
};

/** Bounding box (in cells) of every photo cell, so the photo reads as one image across tiles. */
export function photoRegion(layout: DeviceLayout) {
  let minC = Infinity, minR = Infinity, maxC = -1, maxR = -1;
  layout.cells.forEach((cell, i) => {
    if (cell.kind !== 'photo') return;
    const col = i % layout.cols, r = Math.floor(i / layout.cols);
    minC = Math.min(minC, col); maxC = Math.max(maxC, col);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
  });
  return { minC, minR, cols: maxC - minC + 1, rows: maxR - minR + 1 };
}

/** Same three stops in CSS and in the 3D texture. */
export const photoStops: [number, string][] = [
  [0, '#FFC229'],
  [0.45, '#B8641E'],
  [1, '#2B3A33'],
];
