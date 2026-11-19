"use client";

import { animate, useMotionValue, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_EDITORIAL, TAB_SWAP } from "@/lib/motion";
import { registerTabNavigator, tabFromHash, TAB_IDS, type TabId } from "@/lib/tabs";

type TabsValue = {
  /** The tab whose panel is on screen. */
  active: TabId;
  /** The tab the bar highlights — moves the instant a tab is picked, before the panels swap. */
  selected: TabId;
  go: (id: TabId) => Promise<void>;
  /** Opacity of the panel area, driven by the swap (read by <TabPanels>). */
  veil: MotionValue<number>;
  /** Horizontal drift in px (0 at rest), direction-aware. */
  shift: MotionValue<number>;
  /** Enter scale (1 at rest). */
  scale: MotionValue<number>;
};

const TabsContext = createContext<TabsValue | null>(null);

const { outS: OUT_S, inS: IN_S, drift: DRIFT, scaleFrom: SCALE_FROM } = TAB_SWAP;

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Jump to the top without the page-wide smooth scroll, then let scroll-linked scenes re-measure. */
function resetScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  window.dispatchEvent(new Event("scroll"));
}

/**
 * One section on screen at a time. A swap is a short choreography:
 * the current panel fades and drifts out (150ms, ease-in) against the direction
 * of travel, the page resets to the top while nothing is visible, and the new
 * panel enters from the travel side with a tiny scale-up on the editorial curve
 * (350ms). Direction follows TAB_IDS order. The last click wins: each swap halts
 * in-flight tweens and stale swaps bail via `token`.
 * `veil` runs 1 → 0 → 1 so the panels never unmount (state, videos and
 * scroll-linked scenes all survive a round trip).
 */
export function TabsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<TabId>("home");
  const [selected, setSelected] = useState<TabId>("home");
  const activeRef = useRef<TabId>("home");
  const veil = useMotionValue(1);
  const shift = useMotionValue(0);
  const scale = useMotionValue(1);
  const token = useRef(0);
  const running = useRef<AnimationPlaybackControls[]>([]);

  const halt = useCallback(() => {
    running.current.forEach((c) => c.stop());
    running.current = [];
  }, []);

  const swap = useCallback(
    async (id: TabId, history: "push" | "none") => {
      const mine = ++token.current;
      setSelected(id);
      if (history === "push") {
        const url = id === "home" ? window.location.pathname + window.location.search : `#${id}`;
        if (window.location.hash.replace(/^#/, "") !== (id === "home" ? "" : id)) window.history.pushState(null, "", url);
      }
      halt();
      if (id === activeRef.current) {
        // Same tab (or a swap cancelled back to it): make sure it is fully shown, then top.
        if (veil.get() !== 1 || shift.get() !== 0 || scale.get() !== 1) {
          running.current = [
            animate(veil, 1, { duration: OUT_S, ease: "easeOut" }),
            animate(shift, 0, { duration: OUT_S, ease: "easeOut" }),
            animate(scale, 1, { duration: OUT_S, ease: "easeOut" }),
          ];
        }
        window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
        return;
      }
      if (prefersReduced()) {
        // Instant swap: settle at rest.
        veil.set(1);
        shift.set(0);
        scale.set(1);
        activeRef.current = id;
        setActive(id);
        resetScroll();
        return;
      }
      // Further right in tab order: old content drifts left, new enters from the right (and back).
      const dir = TAB_IDS.indexOf(id) > TAB_IDS.indexOf(activeRef.current) ? 1 : -1;
      const out = [
        animate(veil, 0, { duration: OUT_S, ease: "easeIn" }),
        animate(shift, -dir * DRIFT, { duration: OUT_S, ease: "easeIn" }),
      ];
      running.current = out;
      await Promise.all(out);
      if (mine !== token.current) return;
      activeRef.current = id;
      setActive(id);
      // Park the incoming panel at its start pose while it is invisible.
      shift.set(dir * DRIFT);
      scale.set(SCALE_FROM);
      // Let React commit the new panel (and the browser lay it out) while the veil is still
      // at 0, then reset scroll, then wait one more frame so the scroll-linked scenes
      // re-measure at the top. Only then fade in: the new panel never shows at the old offset.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (mine !== token.current) return;
      resetScroll();
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (mine !== token.current) return;
      running.current = [
        animate(veil, 1, { duration: IN_S, ease: EASE_EDITORIAL }),
        animate(shift, 0, { duration: IN_S, ease: EASE_EDITORIAL }),
        animate(scale, 1, { duration: IN_S, ease: EASE_EDITORIAL }),
      ];
    },
    [veil, shift, scale, halt],
  );

  const go = useCallback((id: TabId) => swap(id, "push"), [swap]);

  // Deep links (/#dashboard), back/forward between tabs.
  useEffect(() => {
    const initial = tabFromHash(window.location.hash);
    if (initial && initial !== "home") {
      activeRef.current = initial;
      setActive(initial);
      setSelected(initial);
      requestAnimationFrame(resetScroll);
    }
    const onPop = () => swap(tabFromHash(window.location.hash) ?? "home", "none");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [swap]);

  // Any in-page anchor to a section ("#demo", "/#compare") opens its tab instead of scrolling.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const id = tabFromHash(url.hash);
      if (!id) return;
      e.preventDefault();
      go(id);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [go]);

  useEffect(() => {
    registerTabNavigator(go);
    return () => registerTabNavigator(null);
  }, [go]);

  return <TabsContext.Provider value={{ active, selected, go, veil, shift, scale }}>{children}</TabsContext.Provider>;
}

/** Null outside the home page (legal pages render the navbar without tabs). */
export function useTabs(): TabsValue | null {
  return useContext(TabsContext);
}
