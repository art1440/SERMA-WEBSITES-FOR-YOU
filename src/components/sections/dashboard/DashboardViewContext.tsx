"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Which inner section of the demo dashboard is open (Overview, Leads, Calendar,
 * Inbox, Reviews, Settings), plus the small shared state that lets the sections
 * talk to each other — e.g. "Confirm booking" in an Inbox email also shows the
 * appointment as confirmed in the Calendar.
 *
 * Everything is in-memory demo state: nothing is sent, stored or collected.
 */
export type DashboardView = "overview" | "leads" | "calendar" | "inbox" | "reviews" | "settings";

export const DASHBOARD_VIEWS: DashboardView[] = ["overview", "leads", "calendar", "inbox", "reviews", "settings"];
export const VIEW_PANEL_ID = "dashboard-view-panel";
export const viewTabId = (view: DashboardView) => `dashboard-view-tab-${view}`;

type DashboardViewValue = {
  view: DashboardView;
  /** Open a section; `focusId` highlights one item there (e.g. a calendar event id). */
  setView: (view: DashboardView, focusId?: string) => void;
  /** Item to highlight in the open section (set by cross-links), or null. */
  focusId: string | null;
  clearFocus: () => void;
  /** Shared "done" flags, keyed e.g. `confirm:b-c1`, `reply:b-r1`, `text:b-l1`. */
  isDone: (key: string) => boolean;
  markDone: (key: string) => void;
  /** Speak a short confirmation to screen readers (polite live region). */
  announce: (message: string) => void;
};

const Ctx = createContext<DashboardViewValue | null>(null);

export function DashboardViewProvider({ children, onInteract }: { children: ReactNode; onInteract?: () => void }) {
  const [view, setViewState] = useState<DashboardView>("overview");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [done, setDone] = useState<ReadonlySet<string>>(() => new Set());
  const [message, setMessage] = useState("");
  const toggle = useRef(false);
  const interact = useRef(onInteract);
  interact.current = onInteract;

  const setView = useCallback((next: DashboardView, focus?: string) => {
    interact.current?.();
    setViewState(next);
    setFocusId(focus ?? null);
  }, []);
  const clearFocus = useCallback(() => setFocusId(null), []);
  const markDone = useCallback((key: string) => {
    interact.current?.();
    setDone((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);
  const isDone = useCallback((key: string) => done.has(key), [done]);
  const announce = useCallback((msg: string) => {
    // Alternate a zero-width space so repeating the same message is still announced.
    toggle.current = !toggle.current;
    setMessage(toggle.current ? msg : `${msg}​`);
  }, []);

  const value = useMemo(
    () => ({ view, setView, focusId, clearFocus, isDone, markDone, announce }),
    [view, setView, focusId, clearFocus, isDone, markDone, announce],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <p aria-live="polite" className="sr-only">
        {message}
      </p>
    </Ctx.Provider>
  );
}

export function useDashboardView(): DashboardViewValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDashboardView must be used inside <DashboardViewProvider>.");
  return ctx;
}
