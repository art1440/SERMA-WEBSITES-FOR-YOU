"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { CalendarEvent } from "@/data/dashboard-views";
import type { Locale } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";

/* ------------------------------------------------------------------ *
 * Shared building blocks for the dashboard's inner sections.
 *
 * Everything here lives INSIDE a flat dashboard plate (a leaf of the 3D
 * layer stack), so it may use overflow/scroll, but never backdrop-filter.
 * Contrast on the plate (≈ #1d2122): bone ≥ 13:1, ash ≥ 5:1, aqua ≥ 8:1,
 * live green ≥ 6:1, signal ≥ 4.6:1 (use signal for small alert accents only).
 * ------------------------------------------------------------------ */

export const CARD =
  "rounded-glass-sm bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:p-5 lg:p-4";
/** Card without padding, for lists that run edge to edge. */
export const CARD_FLUSH =
  "rounded-glass-sm bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)]";
export const LABEL = "eyebrow text-ash";
/** A soft selectable row (list items, messages): add your own padding. */
export const ROW =
  "rounded-[12px] hover:bg-white/[0.05] focus-visible:bg-white/[0.06]";
/** Selected tint stays light (0.05) so ash secondary text keeps ≥ 4.5:1; the aqua ring is the cue. */
export const ROW_SELECTED =
  "bg-white/[0.05] shadow-[inset_0_0_0_1px_rgba(61,219,201,0.35)] forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]";

/** Small capsule actions inside the demo (44px tall touch target). */
export const ACTION_PRIMARY =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-ink " +
  "bg-[linear-gradient(180deg,#6FE9DA_0%,#3DDBC9_55%,#2FCBB9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_0_1px_rgba(61,219,201,0.35),0_8px_20px_-10px_rgba(61,219,201,0.6)] " +
  "transition-transform duration-200 ease-editorial hover:-translate-y-px active:scale-[0.97]";
export const ACTION_SECONDARY =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-bone " +
  "bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] " +
  "transition-transform duration-200 ease-editorial hover:-translate-y-px hover:bg-white/[0.1] active:scale-[0.97]";
/** Filter / segmented capsules. Pair with aria-pressed. */
export const PILL =
  "inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium";
/** Pressed state also gets a system-colour outline: forced-colors mode drops backgrounds. */
export const PILL_ON =
  "bg-aqua text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]";
export const PILL_OFF = "bg-white/[0.06] text-bone/90 hover:bg-white/[0.1] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]";

/**
 * "Sample data" capsule: the window chrome and every inner section show it (FTC: clearly
 * illustrative). 12px bone/80 (7:1+ on the plate) so it stays legible when the pinned
 * stage scales down to ~0.75.
 */
export function SampleTag({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-bone/80 ring-1 ring-inset ring-white/15 ${className ?? ""}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/40" />
      {t.dashboard.sampleTag}
    </span>
  );
}

/** Section title row: heading + sample tag on the left, actions on the right. */
export function ViewHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-display text-xl leading-tight tracking-[-0.02em] text-bone">{title}</h3>
          <SampleTag />
        </div>
        {subtitle ? <p className="mt-1 text-[0.8125rem] leading-snug text-ash">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export type Tone = "aqua" | "live" | "signal" | "neutral";

const TONE: Record<Tone, string> = {
  aqua: "text-aqua ring-aqua/35",
  live: "text-live ring-live/35",
  // Orange text is ~4:1 at this size on a card, so the word stays bone; the dot + ring carry the accent.
  signal: "text-bone/90 ring-signal/50 [&>span:first-child]:bg-signal",
  neutral: "text-bone/80 ring-white/15",
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
        tone === "aqua" ? "bg-aqua text-ink" : "bg-white/[0.09] text-bone ring-1 ring-inset ring-white/10"
      }`}
    >
      {initials}
    </span>
  );
}

/**
 * A demo action that flips to a "done" state (check + done label) when pressed.
 * Stays focusable afterwards (aria-disabled, not disabled) so keyboard focus is never lost.
 */
export function DoneButton({
  label,
  doneLabel,
  done,
  onPress,
  variant = "primary",
  icon,
  className,
}: {
  label: string;
  doneLabel: string;
  done: boolean;
  onPress: () => void;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-disabled={done || undefined}
      onClick={() => {
        if (!done) onPress();
      }}
      className={`${variant === "primary" && !done ? ACTION_PRIMARY : ACTION_SECONDARY} ${done ? "cursor-default hover:translate-y-0" : ""} ${className ?? ""}`}
    >
      <motion.span
        key={done ? "done" : "idle"}
        className="inline-flex items-center gap-2"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
      >
        {done ? <Check aria-hidden="true" size={15} strokeWidth={2.25} className="text-aqua" /> : icon}
        {done ? doneLabel : label}
      </motion.span>
    </button>
  );
}

/** Sticky site header (64–68px) plus breathing room; matches `html { scroll-padding-top }`. */
const HEADER_CLEARANCE_PX = 88;

/**
 * After a `focus({ preventScroll: true })` + pane scroll, make sure the target is
 * really on screen (WCAG 2.4.11). On the pinned stage the window is always in view
 * and scrolling the page would scrub the scene, so this is a no-op there. Otherwise
 * (unpinned laptops, short screens) nudge the page just enough to clear the sticky
 * header or the bottom edge.
 */
export function revealInPage(el: Element | null | undefined, pinned: boolean) {
  if (!el || pinned) return;
  const r = el.getBoundingClientRect();
  const bottomLimit = window.innerHeight - 16;
  let dy = 0;
  if (r.top < HEADER_CLEARANCE_PX) dy = r.top - HEADER_CLEARANCE_PX;
  else if (r.bottom > bottomLimit) dy = Math.min(r.bottom - bottomLimit, r.top - HEADER_CLEARANCE_PX);
  if (Math.abs(dy) >= 1) window.scrollBy({ top: dy });
}

/**
 * Spanish Intl output writes "a. m." / "p. m."; the sample data and the rest of
 * the site use "AM" / "PM" in both languages, so normalise to one style.
 */
export function normalizeMeridiem(time: string) {
  // Only for Intl time output (a digit, an optional space, then "a. m." / "p. m.").
  return time.replace(/(\d\s?)([ap])\.?\s?m\.?/gi, (_, lead: string, ap: string) => `${lead}${ap.toUpperCase()}M`);
}

/** Format "HH:MM" (24h) for display in the visitor's language (always "AM"/"PM"). */
export function formatClock(hhmm: string, intlLocale: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(2026, 0, 5, h, m);
  return normalizeMeridiem(new Intl.DateTimeFormat(intlLocale, { hour: "numeric", minute: "2-digit" }).format(d));
}

/* ------------------------------ demo clock ------------------------------ */

/** The demo week's "today" (day 0 = Monday 5 Jan 2026: every industry's inbox and lead copy is written around it) and "now". */
export const DEMO_TODAY = 0;
export const DEMO_NOW = "09:41";

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
type DemoSlot = Pick<CalendarEvent, "day" | "start">;

/** Under way or already over at the demo's "now": too late for a reminder. */
export const hasStarted = (ev: DemoSlot) =>
  ev.day < DEMO_TODAY || (ev.day === DEMO_TODAY && minutesOf(ev.start) <= minutesOf(DEMO_NOW));

/**
 * "today at 10:00 AM" / "hoy a las 10:00 AM", "tomorrow at …" / "mañana a las …", else
 * "Thursday at 10:30 AM" / "el jueves a las 10:30 AM" ("a la 1:00 PM"). For running sentences.
 */
export function whenPhrase(ev: DemoSlot, locale: Locale, intlLocale: string) {
  const time = formatClock(ev.start, intlLocale);
  const offset = ev.day - DEMO_TODAY;
  const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: "long" }).format(new Date(2026, 0, 5 + ev.day));
  if (locale === "es") {
    const h = Math.floor(minutesOf(ev.start) / 60) % 12;
    const at = `a ${h === 1 ? "la" : "las"} ${time}`;
    if (offset === 0) return `hoy ${at}`;
    if (offset === 1) return `mañana ${at}`;
    return `el ${weekday} ${at}`;
  }
  if (offset === 0) return `today at ${time}`;
  if (offset === 1) return `tomorrow at ${time}`;
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} at ${time}`;
}
