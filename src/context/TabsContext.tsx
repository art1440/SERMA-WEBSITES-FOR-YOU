"use client";

import { animate, useMotionValue, type MotionValue } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_EDITORIAL } from "@/lib/motion";
import { registerTabNavigator, tabFromHash, type TabId } from "@/lib/tabs";

type TabsValue = {
  /** The tab whose panel is on screen. */
  active: TabId;
  /** The tab the bar highlights — moves the instant a tab is picked, before the panels swap. */
  selected: TabId;
  go: (id: TabId) => Promise<void>;
  /** Opacity + lift of the panel area, driven by the swap (read by <TabPanels>). */
  veil: MotionValue<number>;
};

const TabsContext = createContext<TabsValue | null>(null);

const OUT_S = 0.18;
const IN_S = 0.55;

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
 * the current panel dims out (180ms), the page resets to the top while
 * nothing is visible, and the new panel rises in on the editorial curve.
 * `veil` runs 1 → 0 → 1 so the panels never unmount (state, videos and
 * scroll-linked scenes all survive a round trip).
 */
export function TabsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<TabId>("home");
  const [selected, setSelected] = useState<TabId>("home");
  const activeRef = useRef<TabId>("home");
  const veil = useMotionValue(1);
  const token = useRef(0);

  const swap = useCallback(
    async (id: TabId, history: "push" | "none") => {
      const mine = ++token.current;
      setSelected(id);
      if (history === "push") {
        const url = id === "home" ? window.location.pathname + window.location.search : `#${id}`;
        if (window.location.hash.replace(/^#/, "") !== (id === "home" ? "" : id)) window.history.pushState(null, "", url);
      }
      if (id === activeRef.current) {
        // Same tab: back to its top.
        window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
        return;
      }
      if (prefersReduced()) {
        activeRef.current = id;
        setActive(id);
        resetScroll();
        return;
      }
      await animate(veil, 0, { duration: OUT_S, ease: "easeIn" });
      if (mine !== token.current) return;
      activeRef.current = id;
      setActive(id);
      // Let React commit the new panel before measuring/scrolling.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      resetScroll();
      if (mine !== token.current) return;
      animate(veil, 1, { duration: IN_S, ease: EASE_EDITORIAL });
    },
    [veil],
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

  return <TabsContext.Provider value={{ active, selected, go, veil }}>{children}</TabsContext.Provider>;
}

/** Null outside the home page (legal pages render the navbar without tabs). */
export function useTabs(): TabsValue | null {
  return useContext(TabsContext);
}
