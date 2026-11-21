import type { ReactNode } from "react";

/* ------------------------------------------------------------------ *
 * Shared building blocks for the owner CRM (/admin). Moved here from the
 * old dashboard showcase when that section left the home page.
 * Contrast on the plate (≈ #F7FAFE): bone ≥ 13:1, ash ≥ 5:1, aqua ≥ 8:1,
 * live green ≥ 6:1, signal ≥ 4.6:1 (use signal for small alert accents only).
 * ------------------------------------------------------------------ */

export const CARD =
  "rounded-glass-sm bg-aqua/[0.052] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:p-5 lg:p-4";
/** Card without padding, for lists that run edge to edge. */
export const CARD_FLUSH =
  "rounded-glass-sm bg-aqua/[0.052] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)]";
export const LABEL = "eyebrow text-ash";
/** A soft selectable row (list items, messages): add your own padding. */
export const ROW =
  "rounded-[12px] hover:bg-aqua/[0.065] focus-visible:bg-aqua/[0.078]";
/** Selected tint stays light (0.05) so ash secondary text keeps ≥ 4.5:1; the aqua ring is the cue. */
export const ROW_SELECTED =
  "bg-aqua/[0.065] shadow-[inset_0_0_0_1px_rgba(42,107,191,0.35)] forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]";

/** Small capsule actions (44px tall touch target). */
export const ACTION_PRIMARY =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-ink " +
  "bg-[linear-gradient(180deg,rgb(var(--aqua-hi))_0%,rgb(var(--aqua))_55%,rgb(var(--aqua-deep))_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_rgba(42,107,191,0.35),0_8px_20px_-10px_rgba(42,107,191,0.6)] " +
  "transition-[transform,background-color,color] duration-base ease-editorial hover:-translate-y-px active:scale-[0.97]";
export const ACTION_SECONDARY =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-bone " +
  "bg-aqua/[0.091] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] " +
  "transition-[transform,background-color,color] duration-base ease-editorial hover:-translate-y-px hover:bg-aqua/[0.13] active:scale-[0.97]";
/** Filter / segmented capsules. Pair with aria-pressed. */
export const PILL =
  "inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium";
/** Pressed state also gets a system-colour outline: forced-colors mode drops backgrounds. */
export const PILL_ON =
  "bg-aqua text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]";
export const PILL_OFF = "bg-aqua/[0.078] text-bone/90 hover:bg-aqua/[0.13] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]";

export type Tone = "aqua" | "live" | "signal" | "neutral";

const TONE: Record<Tone, string> = {
  aqua: "text-aqua ring-aqua/35",
  live: "text-live ring-live/35",
  // Orange text is ~4:1 at this size on a card, so the word stays bone; the dot + ring carry the accent.
  signal: "text-bone/90 ring-signal/50 [&>span:first-child]:bg-signal",
  neutral: "text-bone/80 ring-bone/[0.21]",
};

/** Status capsule: always a word, never colour alone (WCAG 1.4.1). */
export function StatusChip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ring-1 ring-inset ${TONE[tone]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Initials avatar for fictional people. */
export function Avatar({ name, tone = "neutral" }: { name: string; tone?: "neutral" | "aqua" }) {
  const initials = name
    .replace(/[^A-Za-zÀ-ÿ ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold ${
        tone === "aqua" ? "bg-aqua text-ink" : "bg-aqua/[0.117] text-bone ring-1 ring-inset ring-bone/[0.14]"
      }`}
    >
      {initials}
    </span>
  );
}

