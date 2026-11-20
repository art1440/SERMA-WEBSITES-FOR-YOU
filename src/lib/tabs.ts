/**
 * The home page is one long page of sections, in this order. Ids double as the
 * sections' anchor ids, so links like "/#dashboard" land on the right section.
 */
export const TAB_IDS = [
  "home",
  "included",
  "work",
  "industries",
  "dashboard",
  "calculator",
  "compare",
  "pricing",
] as const;

export type TabId = (typeof TAB_IDS)[number];

export function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value);
}

/** Maps an anchor hash (with or without "#") to its tab; anchors inside a section open that section. */
export function tabFromHash(hash: string): TabId | null {
  const id = hash.replace(/^#/, "");
  if (!id || id === "top" || id === "main") return null;
  if (isTabId(id)) return id;
  if (id === "enquiry-form") return "pricing";
  // The Live Demo tab became Pricing; old "#demo" links land there.
  if (id === "demo") return "pricing";
  // The old How It Works section is gone; its links open the section now called How It Works.
  if (id === "system") return "included";
  // The Missed Calls section was removed; old "#simulator" links land on the next section.
  if (id === "simulator") return "calculator";
  return null;
}

/**
 * Bottom edge (viewport px) of the sticky navbar: the section rail when it sits below the
 * capsule (under 1280px on the home page), else the header. The one source of truth for
 * "clear of the header" in JS; CSS mirrors it with `scroll-padding-top` in globals.css.
 */
export function navBottom() {
  const rail = document.querySelector<HTMLElement>("[data-nav-rail]");
  const header = document.querySelector<HTMLElement>("header");
  const el = rail && rail.offsetParent !== null ? rail : header;
  return el ? Math.max(0, el.getBoundingClientRect().bottom) : 0;
}

/**
 * Whether a focus nudge may scroll the page for `el`. Shared by the dashboard's
 * revealInPage and the home page's keyboard-focus nudge (TabsContext):
 * - never while chapters are pinned (`chaptersPinned()`): scrolling would scrub the scene;
 * - never while a modal dialog is open, or for anything inside a dialog or a fixed layer:
 *   the page behind an overlay must not move (body overflow:hidden doesn't stop scrollBy).
 */
export function canNudgePage(el: Element, pinned: boolean) {
  if (pinned) return false;
  if (document.querySelector('[aria-modal="true"]')) return false;
  if (el.closest('[role="dialog"],[aria-modal="true"],header')) return false;
  for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).position === "fixed") return false;
  }
  return true;
}

type Navigator = (id: TabId) => Promise<void>;
let navigator: Navigator | null = null;

/** Registered by <TabsProvider> while the home page is mounted. */
export function registerTabNavigator(fn: Navigator | null) {
  navigator = fn;
}

/**
 * Scrolls to a section. Returns false when the home page isn't mounted
 * (e.g. on /privacy), so callers can fall back to a page load.
 */
export async function showTab(id: TabId): Promise<boolean> {
  if (!navigator) return false;
  await navigator(id);
  return true;
}
