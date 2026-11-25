"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useDemoStill } from "../useDemoStill";

/**
 * Weighted wheel scrolling for the demo sites (Lenis), so every scroll-linked
 * device on the page glides with one weight instead of stepping per wheel notch.
 *
 * - Wheel only: touch keeps the phone's own native momentum (syncTouch off),
 *   keyboard and scrollbar scrolling stay native.
 * - Off entirely for reduced motion and the Pause switch.
 * - While any aria-modal dialog is open (booking sheet, mockup pop-up) Lenis
 *   steps aside, so the dialog's own scroll area works and the page stays put.
 * - Same-page anchor links glide to their target (scroll-margin-top respected)
 *   and then move keyboard focus there, as a native jump would.
 */
export function SmoothScroll() {
  const still = useDemoStill();

  useEffect(() => {
    if (still) return;
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.11,
      wheelMultiplier: 0.95,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      virtualScroll: () => !document.querySelector('[aria-modal="true"]'),
    });

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      if (!(a instanceof HTMLAnchorElement)) return;
      const hash = a.getAttribute("href") ?? "";
      if (hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, {
        duration: 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        onComplete: () => {
          if (!target.matches("a, button, input, select, textarea, [tabindex]")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        },
      });
      history.pushState(history.state, "", hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [still]);

  return null;
}
