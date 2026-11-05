/** Shared motion language. Only `transform` and `opacity` are ever animated. */
export const EASE_EDITORIAL = [0.22, 1, 0.36, 1] as const;

export const VIEWPORT_ONCE = { once: true, margin: "-10%" } as const;

export const SPRING_SOFT = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 } as const;

export const SPRING_NUMBER = { stiffness: 70, damping: 20, mass: 0.9 } as const;
