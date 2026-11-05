/** Shared numbers for the hero scene and its CSS poster. */
/** Gap between tiles as a fraction of (grid width / columns). Mirrors DeviceGrid.astro. */
export const GAP_RATIO = 0.15;
/** CSS perspective of the poster, which the 3D camera reproduces. */
export const PERSPECTIVE = 1400;
/** How far the canvas extends past the stage on each side, so flying tiles aren't cut off. */
export const BLEED = 0.14;
/** localStorage key: the intro has been seen. */
export const INTRO_KEY = 'serma:intro-seen';

/**
 * Loose tiles around the devices (CSS poster and 3D share these).
 * x, y: top-left as % of the stage. size: % of stage width. z: px toward the viewer. rz: degrees.
 */
export const FLOATERS = [
  { x: 6, y: 2, size: 5.5, z: 60, solid: false, rz: -14 },
  { x: 82, y: 5, size: 4, z: -40, solid: false, rz: 18 },
  { x: 90, y: 31, size: 6.5, z: 80, solid: true, rz: -10 },
  { x: 3, y: 86, size: 4.5, z: 30, solid: false, rz: 24 },
  { x: 53, y: 3, size: 3.5, z: -80, solid: false, rz: 8 },
  { x: -4, y: 46, size: 3.2, z: -120, solid: false, rz: -20 },
  { x: 68, y: 96, size: 3.8, z: 120, solid: false, rz: 12 },
  { x: 36, y: 92, size: 2.8, z: -60, solid: true, rz: -6 },
] as const;
