"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/i18n/types";
import { SPRING_SOFT } from "@/lib/motion";

type Props = {
  /** Unique per instance so two toggles on screen never share a layoutId. */
  layoutId: string;
  tone?: "light" | "dark";
};

const OPTIONS: { value: Locale; short: string; name: string }[] = [
  { value: "en", short: "EN", name: "English" },
  { value: "es", short: "ES", name: "Español" },
];

/**
 * Instant EN | ES switch — a capsule segmented control. A single pill slides
 * between options via `layoutId` (transform-only). Zero cookies, zero reloads.
 * Each option keeps a full 44×44px touch target; the pill sits inset inside it.
 */
export function LanguageToggle({ layoutId, tone = "light" }: Props) {
  const { locale, setLocale, t } = useLanguage();
  const dark = tone === "dark";

  return (
    <div
      role="group"
      aria-label={t.nav.languageGroup}
      className={`relative inline-flex shrink-0 rounded-full ring-1 ring-inset ${
        dark
          ? "bg-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ring-white/[0.12]"
          : "bg-ink/[0.05] shadow-[inset_0_1px_2px_rgba(13,13,11,0.08)] ring-ink/[0.08]"
      }`}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            lang={opt.value}
            aria-label={opt.name}
            aria-pressed={active}
            onClick={() => setLocale(opt.value)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.92 }}
            className="relative isolate grid h-11 w-11 place-items-center rounded-full text-[0.8125rem] font-semibold tracking-[0.02em]"
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className={`absolute inset-1 -z-10 rounded-full ${
                  dark
                    ? "bg-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_16px_-6px_rgba(0,0,0,0.7)]"
                    : "bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_6px_14px_-6px_rgba(13,13,11,0.6)]"
                }`}
                transition={SPRING_SOFT}
              />
            ) : null}
            {/* Inactive labels use alpha (ink/75, bone/70) rather than fixed greys so they keep
                ≥4.5:1 whatever the glass bar happens to float over. */}
            <span className={active ? (dark ? "text-ink" : "text-bone") : dark ? "text-bone/70" : "text-ink/75"}>{opt.short}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
