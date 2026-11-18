/**
 * The home page is split into tabs: one section on screen at a time, picked
 * from the tab bar in the navbar. Ids double as the sections' anchor ids, so
 * old links like "/#dashboard" still land on the right tab.
 */
export const TAB_IDS = [
  "home",
  "included",
  "industries",
  "dashboard",
  "simulator",
  "calculator",
  "compare",
  "demo",
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
  if (id === "enquiry-form") return "demo";
  // How It Works was removed; its old links land on the home tab.
  if (id === "system") return "home";
  return null;
}

type Navigator = (id: TabId) => Promise<void>;
let navigator: Navigator | null = null;

/** Registered by <TabsProvider> while the home page is mounted. */
export function registerTabNavigator(fn: Navigator | null) {
  navigator = fn;
}

/**
 * Opens a tab and resolves once its panel is on screen. Returns false when no
 * tab bar is mounted (e.g. on /privacy), so callers can fall back to a page load.
 */
export async function showTab(id: TabId): Promise<boolean> {
  if (!navigator) return false;
  await navigator(id);
  return true;
}
