import { asset } from "@/lib/asset";

/**
 * Scrolls to the "Book a Live System Demo" section and moves keyboard focus to
 * its primary action. Falls back to navigating home from other routes (e.g. /privacy).
 */
export function goToDemo() {
  const section = document.getElementById("demo");
  const form = document.getElementById("enquiry-form");
  if (!section && !form) {
    window.location.assign(asset("/#demo"));
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollTarget = form ?? section!;
  // The form is the destination: land on the first field, not the section heading.
  scrollTarget.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: form ? "center" : "start" });
  const focusTarget =
    form?.querySelector<HTMLElement>("input[name='name']") ??
    section?.querySelector<HTMLElement>("[data-primary-action]");
  // preventScroll keeps the smooth scroll from being cut short by the focus jump.
  window.setTimeout(() => focusTarget?.focus({ preventScroll: true }), reduce ? 0 : 650);
}
