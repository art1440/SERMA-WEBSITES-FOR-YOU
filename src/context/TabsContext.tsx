"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { chaptersPinned, useScene } from "@/context/SceneContext";
import { canNudgePage, navBottom, registerTabNavigator, tabFromHash, TAB_IDS, type TabId } from "@/lib/tabs";

type TabsValue = {
  /** The section currently in view (scroll spy). */
  active: TabId;
  /** The section the nav highlights: jumps to a picked item at once, then follows the scroll. */
  selected: TabId;
  /** Scrolls to a section. */
  go: (id: TabId) => Promise<void>;
};

const TabsContext = createContext<TabsValue | null>(null);

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sectionEl(id: TabId) {
  return document.getElementById(id);
}

/** Document Y that puts a section's top just under the navbar. */
function targetY(id: TabId) {
  if (id === "home") return 0;
  const el = sectionEl(id);
  if (!el) return null;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - navBottom() - 8);
}

/**
 * One long page. The nav scrolls to a section; a scroll spy tracks which section
 * is in view. While a nav-triggered scroll is gliding, the spy is held so the
 * highlight doesn't flick through every section it passes.
 */
export function TabsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<TabId>("home");
  const [selected, setSelected] = useState<TabId>("home");
  const holdUntil = useRef(0);
  const scene = useScene();
  const pinnedRef = useRef(false);
  pinnedRef.current = chaptersPinned(scene);

  const spy = useCallback(() => {
    const line = navBottom() + window.innerHeight * 0.3;
    let current: TabId = "home";
    for (const id of TAB_IDS) {
      const el = sectionEl(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    }
    // At the very bottom, the last section wins even if it is short.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = TAB_IDS[TAB_IDS.length - 1];
    }
    setActive(current);
    if (performance.now() >= holdUntil.current) setSelected(current);
  }, []);

  const go = useCallback(async (id: TabId) => {
    const y = targetY(id);
    if (y === null) return;
    setSelected(id);
    const url = id === "home" ? window.location.pathname + window.location.search : `#${id}`;
    window.history.replaceState(null, "", url);
    const reduce = prefersReduced();
    holdUntil.current = performance.now() + (reduce ? 50 : 1200);
    window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }, []);

  // Scroll spy.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        spy();
      });
    };
    const onEnd = () => {
      holdUntil.current = 0;
      spy();
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("scrollend", onEnd);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scrollend", onEnd);
    };
  }, [spy]);

  // Deep links (/#dashboard): land under the navbar once the page has laid out.
  useEffect(() => {
    const initial = tabFromHash(window.location.hash);
    if (!initial || initial === "home") return;
    // Old or renamed anchors (e.g. "#simulator"): point the URL at the section they now open.
    if (window.location.hash.replace(/^#/, "") !== initial && !document.getElementById(window.location.hash.slice(1))) {
      window.history.replaceState(null, "", `#${initial}`);
    }
    // Re-align after the browser's own hash jump and once late layout (fonts, media) has settled.
    const align = () => {
      const y = targetY(initial);
      if (y !== null) window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    };
    const frame = requestAnimationFrame(align);
    const timer = window.setTimeout(align, 400);
    window.addEventListener("load", align, { once: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("load", align);
    };
  }, []);

  // In-page anchors to a section ("#pricing", "/#compare") glide there with the nav offset.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const raw = url.hash.replace(/^#/, "");
      const id = tabFromHash(url.hash);
      if (!id) return;
      // Anchors to an element inside a section (e.g. #enquiry-form) keep the browser's own scroll.
      if (raw !== id && document.getElementById(raw)) return;
      e.preventDefault();
      go(id);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [go]);

  // Keyboard focus never hides under the sticky navbar (WCAG 2.4.11). Browsers only scroll a
  // focused element that is outside the viewport; one already on screen but under the header
  // (or the section rail below it, under 1280px) is nudged down just enough to clear it.
  // Same guard as the dashboard's revealInPage: no nudge while chapters are pinned, inside
  // dialogs or fixed layers, or while a modal is open.
  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLElement) || !el.matches(":focus-visible")) return;
      if (!canNudgePage(el, pinnedRef.current)) return;
      const edge = navBottom();
      const r = el.getBoundingClientRect();
      // Only when meaningfully covered, and only for controls on screen (the browser scrolls off-screen ones).
      if (r.height && r.top < edge - 4 && r.bottom > 0) window.scrollBy({ top: r.top - (edge + 12), behavior: "instant" as ScrollBehavior });
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, []);

  useEffect(() => {
    registerTabNavigator(go);
    return () => registerTabNavigator(null);
  }, [go]);

  return <TabsContext.Provider value={{ active, selected, go }}>{children}</TabsContext.Provider>;
}

/** Null outside the home page (legal pages render the navbar without the section nav). */
export function useTabs(): TabsValue | null {
  return useContext(TabsContext);
}
