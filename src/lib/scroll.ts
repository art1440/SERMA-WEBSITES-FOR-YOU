/**
 * Scrolls to the demo form and moves keyboard focus into it.
 * Falls back to navigating home when called from another route (e.g. /privacy).
 */
export function goToDemoForm() {
  const target = document.getElementById("demo");
  if (!target) {
    window.location.assign("/#demo");
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const firstField = target.querySelector<HTMLElement>("input:not([type=hidden]):not([tabindex='-1']), select, textarea");
  // preventScroll keeps the smooth scroll from being cut short by the focus jump.
  window.setTimeout(() => firstField?.focus({ preventScroll: true }), reduce ? 0 : 650);
}
