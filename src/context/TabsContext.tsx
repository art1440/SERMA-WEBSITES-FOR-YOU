"use client";

import { animate, useMotionValue, type MotionValue } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EASE_EDITORIAL } from "@/lib/motion";
import { registerTabNavigator, tabFromHash, type TabId } from "@/lib/tabs";

type TabsValue = {
  /** The tab whose panel is on screen. */
  active: TabId;
  /** The tab the bar highlights — moves the instant a tab is picked, before the panels swap. */
  selected: TabId;
  go: (id: TabId) => Promise<void>;
  /** Opacity of the panel area during a swap (read by <TabPanels>). */
  veil: MotionValue<number>;
};

/** `repeat`: this tab has been opened before, so its sections play the quick entrance. */
export type TabVisit = { id: TabId; n: number; repeat: boolean } | null;

const TabsContext = createContext<TabsValue | null>(null);
/** The tab being visited and a counter that bumps on every open. Separate so a bump re-renders no `useTabs()` consumer. */
const TabVisitContext = createContext<TabVisit>(null);
/** Only TabPanels reads it. */
export function useTabVisit() {
  return useContext(TabVisitContext);
}

/**
 * `null` = this panel is hidden; a number changes on every open. Default `0` outside the
 * tab panels (footer, legal pages): revealed once.
 */
export const PanelVisitContext = createContext<number | null>(0);
export function usePanelVisit() {
  return useContext(PanelVisitContext);
}

/** True when the panel being opened has been visited before (quick entrance). Default false. */
export const PanelRepeatContext = createContext<boolean>(false);
export function usePanelRepeat() {
  return useContext(PanelRepeatContext);
}

// Same scale as the CSS duration tokens (motion.css): fast out, slow in.
const OUT_S = 0.15;
const IN_S = 0.25;

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** After a swap not started from the tab bar, keyboard focus follows the visitor into the new panel. */
function focusPanel(id: TabId) {
  document.getElementById(`panel-${id}`)?.focus({ preventScroll: true });
}

/** Jump to the top without the page-wide smooth scroll, then let scroll-linked scenes re-measure. */
function resetScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  window.dispatchEvent(new Event("scroll"));
}

/**
 * One section on screen at a time. A swap is a pure crossfade: the current panel
 * fades out (150ms, ease-in), the page resets to the top while nothing is visible,
 * and the new panel fades in (250ms, editorial). Opacity only, no container transform.
 * Sections own their entrance and replay it on every visit (see `visit`). Panels never
 * unmount, so state, videos and scroll-linked scenes survive a round trip.
 */
export function TabsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<TabId>("home");
  const [selected, setSelected] = useState<TabId>("home");
  const activeRef = useRef<TabId>("home");
  const veil = useMotionValue(1);
  const token = useRef(0);
  const [visit, setVisit] = useState<TabVisit>({ id: "home", n: 0, repeat: false });
  const visitRef = useRef<TabVisit>({ id: "home", n: 0, repeat: false });
  const visitN = useRef(0);

  // In memory only: first open of a tab plays the full choreography, later opens a quick one.
  const visited = useRef<Set<TabId>>(new Set(["home"]));

  const enter = useCallback((id: TabId) => {
    visitN.current += 1;
    const v = { id, n: visitN.current, repeat: visited.current.has(id) };
    visited.current.add(id);
    visitRef.current = v;
    setVisit(v);
  }, []);
  const leave = useCallback(() => {
    visitRef.current = null;
    setVisit(null);
  }, []);

  const swap = useCallback(
    async (id: TabId, history: "push" | "none") => {
      const mine = ++token.current;
      setSelected(id);
      if (history === "push") {
        const url = id === "home" ? window.location.pathname + window.location.search : `#${id}`;
        if (window.location.hash.replace(/^#/, "") !== (id === "home" ? "" : id)) window.history.pushState(null, "", url);
      }
      // Back/forward (history "none") always moves focus into the panel: the visitor didn't pick from the bar.
      const fromBar = history === "push" && !!document.activeElement?.closest?.('[role="tablist"]');
      const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (id === activeRef.current) {
        if (visitRef.current?.id === id) {
          // On screen, or caught mid fade-out by a newer pick: undo the fade, or go back to the top.
          if (veil.get() < 1) animate(veil, 1, { duration: IN_S, ease: EASE_EDITORIAL });
          else window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
          return;
        }
        // Active but never entered (a newer swap cut in after the panel swap): finish entering below.
      } else {
        if (prefersReduced()) {
          activeRef.current = id;
          setActive(id);
          resetScroll();
          enter(id);
          veil.jump(1);
          if (!fromBar) requestAnimationFrame(() => focusPanel(id));
          return;
        }
        await animate(veil, 0, { duration: OUT_S, ease: "easeIn" });
        if (mine !== token.current) return;
        activeRef.current = id;
        setActive(id);
        leave(); // one batch: old panel hides, its reveals reset
      }
      // Let React commit the new panel (and the browser lay it out) while the veil is still
      // at 0, then reset scroll, then wait one more frame so the scroll-linked scenes
      // re-measure at the top. Only then fade in: the new panel never shows at the old offset.
      // DashboardShowcase's entrance is synced to these two frames: keep them.
      await frame();
      if (mine !== token.current) return;
      resetScroll();
      await frame();
      if (mine !== token.current) return;
      enter(id);
      if (!fromBar) focusPanel(id); // the new panel's reveals start observing NOW (scroll is 0)
      animate(veil, 1, { duration: IN_S, ease: EASE_EDITORIAL });
    },
    [veil, enter, leave],
  );

  const go = useCallback((id: TabId) => swap(id, "push"), [swap]);

  // Deep links (/#dashboard), back/forward between tabs.
  useEffect(() => {
    const initial = tabFromHash(window.location.hash);
    let r1 = 0;
    let r2 = 0;
    if (initial && initial !== "home") {
      activeRef.current = initial;
      setActive(initial);
      setSelected(initial);
      leave();
      r1 = requestAnimationFrame(() => {
        resetScroll();
        r2 = requestAnimationFrame(() => {
          enter(initial);
          // Deep link: start keyboard navigation in the linked section, as a native anchor would.
          focusPanel(initial);
        });
      });
    }
    const onPop = () => swap(tabFromHash(window.location.hash) ?? "home", "none");
    window.addEventListener("popstate", onPop);
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      window.removeEventListener("popstate", onPop);
    };
  }, [swap, enter, leave]);

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

  const value = useMemo(() => ({ active, selected, go, veil }), [active, selected, go, veil]);

  return (
    <TabsContext.Provider value={value}>
      <TabVisitContext.Provider value={visit}>{children}</TabVisitContext.Provider>
    </TabsContext.Provider>
  );
}

/** Null outside the home page (legal pages render the navbar without tabs). */
export function useTabs(): TabsValue | null {
  return useContext(TabsContext);
}
