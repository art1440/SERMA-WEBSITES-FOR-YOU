/**
 * The home page is one long page of sections, in this order. Ids double as the
 * sections' anchor ids, so links like "/#dashboard" land on the right section.
 */
export const TAB_IDS = [
  "home",
  "included",
  "industries",
  "dashboard",
  "simulator",
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
  return null;
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
