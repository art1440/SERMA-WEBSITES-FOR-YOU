/**
 * Colour scheme = a `dark` class on <html> (NOT data-theme, a legacy styling hook).
 *
 * Privacy: this site stores nothing non-essential. The visitor's choice is kept in
 * sessionStorage ONLY (gone when the browser closes; no cookies, no localStorage).
 * With no stored choice we follow `prefers-color-scheme`.
 * Keep the key and logic in sync with the inline script in src/app/layout.tsx.
 */
export const THEME_KEY = "serma-theme";

export type Scheme = "light" | "dark";

export function currentScheme(): Scheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Runs before first paint (inlined in <head>). A string so layout.tsx and this file share one source. */
export const THEME_INIT_SCRIPT = `(function(){try{var s=null;try{s=sessionStorage.getItem("${THEME_KEY}")}catch(e){}var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/**
 * Switch scheme. With the View Transitions API (and no reduced-motion preference) the new scheme
 * is revealed as a circle expanding from `origin`; otherwise the switch is instant.
 */
export function setScheme(next: Scheme, origin?: { x: number; y: number }): void {
  const root = document.documentElement;
  const apply = () => root.classList.toggle("dark", next === "dark");
  try {
    sessionStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage unavailable: the choice just lasts until reload */
  }

  const doc = document as ViewTransitionDoc;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !origin || typeof doc.startViewTransition !== "function") {
    apply();
    return;
  }

  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = doc.startViewTransition(apply);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => undefined);
}
