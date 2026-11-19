"use client";

import { useEffect } from "react";

/**
 * One page-wide pointer listener that drives the glass "sheen": a soft light
 * that follows the cursor across whichever .glass / .glass-dark surface is
 * under it. Mouse/pen only; touch devices and reduced-motion visitors skip it.
 * Writes 3 CSS variables per frame at most (rAF-batched) — no React state.
 */
export function GlassSheen() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current: HTMLElement | null = null;
    let frame = 0;
    let last: PointerEvent | null = null;

    const reset = (el: HTMLElement | null) => el?.style.setProperty("--sheen", "0");

    const apply = () => {
      frame = 0;
      const e = last;
      if (!e) return;
      const target = (e.target as Element | null)?.closest?.<HTMLElement>(".glass, .glass-dark") ?? null;
      if (target !== current) {
        reset(current);
        current = target;
      }
      if (!current) return;
      const r = current.getBoundingClientRect();
      current.style.setProperty("--mx", `${e.clientX - r.left}px`);
      current.style.setProperty("--my", `${e.clientY - r.top}px`);
      current.style.setProperty("--sheen", "1");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      last = e;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      reset(current);
      current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return null;
}
