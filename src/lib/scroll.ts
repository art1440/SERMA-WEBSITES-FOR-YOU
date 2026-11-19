import { asset } from "@/lib/asset";
import { showTab } from "@/lib/tabs";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Opens the Pricing tab at its top (the three packages) and moves keyboard focus
 * to the section heading. Falls back to navigating home from other routes (e.g. /privacy).
 */
export async function goToPricing() {
  const opened = await showTab("pricing");
  const heading = document.getElementById("pricing-title");
  if (!opened || !heading) {
    window.location.assign(asset("/#pricing"));
    return;
  }
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

/**
 * Opens the Pricing tab and glides down to the enquiry form, landing focus on its
 * first field. Used by "Get started" and by the "Choose …" button on each package.
 */
export async function goToForm() {
  const opened = await showTab("pricing");
  const form = document.getElementById("enquiry-form");
  if (!opened || !form) {
    window.location.assign(asset("/#enquiry-form"));
    return;
  }
  const reduce = reduced();
  form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  // preventScroll keeps the smooth scroll from being cut short by the focus jump.
  window.setTimeout(
    () => form.querySelector<HTMLElement>("input[name='name']")?.focus({ preventScroll: true }),
    reduce ? 0 : 650,
  );
}
