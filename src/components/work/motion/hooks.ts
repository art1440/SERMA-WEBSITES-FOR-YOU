"use client";

import { useEffect, useState } from "react";

/**
 * Hydration-safe media query: false on the server and the first client render,
 * the real answer right after mount. Use it for layout forks that must not ship
 * both variants in the DOM (e.g. a lazy image that would sit in display:none).
 */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/** Desktop layouts for the pinned / sticky devices (Tailwind `lg`). */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/** A mouse or trackpad: hover previews and magnetic pulls only run here. */
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");

/**
 * Non-uniform stagger: gaps shrink as the group goes on (ease-out on the delays),
 * so a list reads as one wave instead of a metronome. `i` is the item index,
 * `n` the group size, `total` the delay of the last item in seconds.
 */
export function waveDelay(i: number, n: number, total = 0.36, base = 0): number {
  if (n <= 1) return base;
  const t = Math.min(i, n - 1) / (n - 1);
  return base + total * (1 - (1 - t) * (1 - t));
}
