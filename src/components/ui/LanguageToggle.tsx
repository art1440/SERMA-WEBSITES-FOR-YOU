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
 * Instant EN | ES switch. A single block slides between options via `layoutId`
 * (transform-only). Zero cookies, zero reloads.
 */
export function LanguageToggle({ layoutId, tone = "light" }: Props) {
  const { locale, setLocale, t } = useLanguage();
  const dark = tone === "dark";

  return (
    <div
      role="group"
      aria-label={t.nav.languageGroup}
      className={`relative inline-flex border ${dark ? "border-bone/50" : "border-ink"}`}
    >
      {OPTIONS.map((opt, i) => {
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
            className={`relative isolate grid h-10 w-11 place-items-center font-mono text-xs tracking-[0.08em] ${
              i === 0 ? `border-r ${dark ? "border-bone/50" : "border-ink"}` : ""
            }`}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className={`absolute inset-0 -z-10 ${dark ? "bg-bone" : "bg-ink"}`}
                transition={SPRING_SOFT}
              />
            ) : null}
            <span className={active ? (dark ? "text-ink" : "text-bone") : dark ? "text-bone" : "text-ink"}>
              {opt.short}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
