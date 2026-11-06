import { asset } from "@/lib/asset";

/**
 * Scrolls to the "Book a Live System Demo" section and moves keyboard focus to
 * its primary action. Falls back to navigating home from other routes (e.g. /privacy).
 */
export function goToDemo() {
  const target = document.getElementById("demo");
  if (!target) {
    window.location.assign(asset("/#demo"));
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const primary = target.querySelector<HTMLElement>("[data-primary-action]");
  // preventScroll keeps the smooth scroll from being cut short by the focus jump.
  window.setTimeout(() => primary?.focus({ preventScroll: true }), reduce ? 0 : 650);
}
