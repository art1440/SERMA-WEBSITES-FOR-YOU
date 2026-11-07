"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/i18n/types";
import { EASE_EDITORIAL, SPRING_SNAPPY } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Props = {
  tone?: "light" | "dark";
};

const SHORT: Record<Locale, string> = { en: "EN", es: "ES" };

/** Track 80px − 2 × 4px inset − 36px thumb. */
const TRAVEL = 36;

/** Label roll: the old code leaves upward before the new one rises in (mode="wait"), never both at once. */
const ROLL = {
  enter: (animated: boolean) => (animated ? { y: 9, opacity: 0 } : { y: 0, opacity: 1 }),
  center: { y: 0, opacity: 1, transition: { duration: 0.16, ease: EASE_EDITORIAL } },
  exit: (animated: boolean) =>
    animated ? { y: -9, opacity: 0, transition: { duration: 0.14, ease: EASE_EDITORIAL } } : { opacity: 0, transition: { duration: 0 } },
} as const;

const TONES = {
  light: {
    track: "bg-ink/[0.05] shadow-[inset_0_1px_2px_rgba(13,13,11,0.1)] ring-ink/[0.12]",
    thumb: "bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_14px_-6px_rgba(13,13,11,0.6)]",
    label: "text-bone",
    globe: "text-ink/70 group-hover:text-ink",
  },
  dark: {
    track: "bg-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ring-white/[0.16]",
    thumb: "bg-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_16px_-6px_rgba(0,0,0,0.7)]",
    label: "text-ink",
    globe: "text-bone/70 group-hover:text-bone",
  },
} as const;

/**
 * One-tap EN ⇄ ES switch. Only the current language is ever shown: it rides on
 * a solid thumb, and a globe marks the free side of the capsule. A tap slides
 * the thumb across (transform), stretches it like a drop of liquid (scaleX),
 * and rolls the label over (opacity + y), so the two codes never share the
 * screen. Zero cookies, zero reloads.
 *
 * Accessibility: a plain button whose name starts with the visible code and
 * says what pressing it does ("EN, English. Switch to Español"), so speech
 * users can say "click EN" (WCAG 2.5.3). After a tap, a polite live region
 * confirms the new language. Auto-detection on load never animates.
 */
export function LanguageToggle({ tone = "light" }: Props) {
  const { locale, setLocale, t } = useLanguage();
  const reduce = useReducedMotionSafe();
  const [touched, setTouched] = useState(false);
  const c = TONES[tone];

  const next: Locale = locale === "en" ? "es" : "en";
  const names: Record<Locale, string> = { en: t.nav.english, es: t.nav.spanish };
  const isEs = locale === "es";
  const animated = touched && !reduce;
  const slide = animated ? SPRING_SNAPPY : { duration: 0 };

  return (
    <>
      {/* Outside the button so it never becomes part of the button's name. */}
      <span aria-live="polite" className="sr-only">
        {touched ? t.nav.languageChanged : ""}
      </span>
      <motion.button
        type="button"
        onClick={() => {
          setTouched(true);
          setLocale(next);
        }}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        transition={SPRING_SNAPPY}
        className={`group relative inline-flex h-11 w-20 shrink-0 select-none rounded-full ring-1 ring-inset ${c.track}`}
      >
        <span className="sr-only">
          {SHORT[locale]}, {names[locale]}. {t.nav.switchLanguage} <span lang={next}>{names[next]}</span>
        </span>

        {/* Globe on the free side; it crosses under the thumb as the two swap. */}
        <motion.span
          aria-hidden="true"
          className={`absolute left-1 top-1 grid h-9 w-9 place-items-center transition-colors duration-300 ${c.globe}`}
          initial={false}
          animate={{ x: isEs ? 0 : TRAVEL }}
          transition={slide}
        >
          <Globe size={15} strokeWidth={1.75} />
        </motion.span>

        {/* Thumb */}
        <motion.span
          aria-hidden="true"
          className="absolute left-1 top-1 h-9 w-9"
          initial={false}
          animate={{ x: isEs ? TRAVEL : 0 }}
          transition={slide}
        >
          {/* Hover/focus: the thumb leans 3px toward the other side, hinting that it moves. */}
          <span
            className={`block h-full w-full transition-transform duration-300 ease-editorial motion-reduce:transition-none ${
              isEs
                ? "group-hover:-translate-x-[3px] group-focus-visible:-translate-x-[3px]"
                : "group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px]"
            } motion-reduce:!translate-x-0`}
          >
            {/* Re-keyed per language so the liquid stretch replays on every tap. */}
            <motion.span
              key={locale}
              className={`absolute inset-0 rounded-full ${c.thumb}`}
              initial={animated ? { scaleX: 1 } : false}
              animate={{ scaleX: animated ? [1, 1.24, 1] : 1 }}
              transition={{ duration: 0.42, ease: EASE_EDITORIAL, times: [0, 0.4, 1] }}
            />
            <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-full">
              {/* `custom` reaches the exiting label too, so even the first tap rolls out (not a cut). */}
              <AnimatePresence mode="wait" initial={false} custom={animated}>
                <motion.span
                  key={locale}
                  custom={animated}
                  variants={ROLL}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={`block text-[0.8125rem] font-semibold leading-none tracking-[0.02em] ${c.label}`}
                >
                  {SHORT[locale]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.span>
      </motion.button>
    </>
  );
}
