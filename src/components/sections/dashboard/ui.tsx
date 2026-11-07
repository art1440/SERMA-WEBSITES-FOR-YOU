"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
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
export const ROW_SELECTED = "bg-white/[0.08] shadow-[inset_0_0_0_1px_rgba(61,219,201,0.35)]";

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
export const PILL_ON = "bg-aqua text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]";
export const PILL_OFF = "bg-white/[0.06] text-bone/90 hover:bg-white/[0.1] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]";

const SAMPLE = { en: "Sample data", es: "Datos de ejemplo" } as const;

/** "Sample data" capsule: every inner section shows it (FTC: clearly illustrative). */
export function SampleTag() {
  const { locale } = useLanguage();
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.6875rem] font-medium text-ash ring-1 ring-inset ring-white/15">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/40" />
      {SAMPLE[locale]}
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
  signal: "text-signal ring-signal/40",
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

/** Format "HH:MM" (24h) for display in the visitor's language. */
export function formatClock(hhmm: string, intlLocale: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(2026, 0, 5, h, m);
  return new Intl.DateTimeFormat(intlLocale, { hour: "numeric", minute: "2-digit" }).format(d);
}
