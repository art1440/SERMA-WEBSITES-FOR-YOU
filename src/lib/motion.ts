/**
 * SermaWebDesign motion system — the single source of truth for how things move.
 * Only `transform` and `opacity` are ever animated.
 *
 *   snappy     → buttons, toggles, tabs, magnetic hover (quick, crisp, no wobble)
 *   smooth     → panels, cards, bars, flips, counters (settled, editorial)
 *   cinematic  → scroll-linked 3D and chapter choreography (weighted glide)
 *
 * Every scroll-driven animation (WebGL engine and CSS 3D alike) reads progress
 * through the `cinematic` spring, so the whole page moves with one weight and
 * trackpad jitter is filtered out.
 */
export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export const VIEWPORT_ONCE = { once: true, margin: "-10%" } as const;

export const MOTION = {
  snappy: { stiffness: 320, damping: 26, mass: 0.5 },
  smooth: { stiffness: 140, damping: 24, mass: 0.8 },
  cinematic: { stiffness: 90, damping: 26, mass: 0.7, restDelta: 0.0005 },
} as const;

/** Framer `transition` forms of the tokens. */
export const SPRING_SNAPPY = { type: "spring", ...MOTION.snappy } as const;
export const SPRING_SMOOTH = { type: "spring", ...MOTION.smooth } as const;

/** Back-compat aliases used across components. */
export const SPRING_SOFT = SPRING_SNAPPY;
export const SPRING_NUMBER = { stiffness: 70, damping: 20, mass: 0.9 } as const; // counters: deliberately slow tick-up
