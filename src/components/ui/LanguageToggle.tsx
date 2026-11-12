"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState, useTransition } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import type { Locale } from "@/i18n/types";
import { EASE_EDITORIAL, SPRING_SNAPPY } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Props = {
  tone?: "light" | "dark";
};

const SHORT: Record<Locale, string> = { en: "EN", es: "ES" };
/** Only the most recently tapped switch announces, so two instances never double-speak. */
const TAP_EVENT = "serma:lang-switch-tap";

/** Label roll: the old code leaves upward before the new one rises in (mode="wait"), never both at once. */
const ROLL = {
  enter: (animated: boolean) => (animated ? { y: 9, opacity: 0 } : { y: 0, opacity: 1 }),
  center: { y: 0, opacity: 1, transition: { duration: 0.14, ease: EASE_EDITORIAL } },
  exit: (animated: boolean) =>
    animated ? { y: -9, opacity: 0, transition: { duration: 0.09, ease: EASE_EDITORIAL } } : { opacity: 0, transition: { duration: 0 } },
} as const;

const TONES = {
  light: {
    track: "bg-ink/[0.05] shadow-[inset_0_1px_2px_rgba(13,13,11,0.1)] ring-ink/[0.2]",
    thumb: "bg-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_14px_-6px_rgba(13,13,11,0.6)]",
    label: "text-bone",
    other: "text-ink",
  },
  dark: {
    track: "bg-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] ring-white/[0.28]",
    thumb: "bg-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_16px_-6px_rgba(0,0,0,0.7)]",
    label: "text-ink",
    other: "text-bone",
  },
} as const;

/**
 * One-tap EN ⇄ ES switch reading "EN | ES": the current language rides on a
 * solid thumb and the other code sits dimmer on the free side of the capsule.
 * A tap slides the thumb across (transform), stretches it like a drop of liquid
 * (scaleX) and rolls its label over (opacity + y). Zero cookies, zero reloads.
 *
 * - Sized in px so the thumb's travel always matches the track, whatever the
 *   visitor's default font size.
 * - The thumb moves on the very next frame; the page copy updates in a React
 *   transition behind it.
 * - Accessible name starts with the visible code and says what pressing it does
 *   ("EN, English. Switch to Español"), so speech users can say "click EN"
 *   (WCAG 2.5.3). A polite live region (only on the switch just tapped) confirms
 *   the new language. Auto-detection on load never animates; reduced motion and
 *   the site's Pause control switch instantly. Forced-colors keeps a visible
 *   boundary and thumb.
 */
export function LanguageToggle({ tone = "light" }: Props) {
  const { locale, setLocale, t } = useLanguage();
  const reduce = useReducedMotionSafe();
  const { paused } = useMotionPause();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useState<Locale>(locale);
  const [touched, setTouched] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const c = TONES[tone];

  // Follow language changes made elsewhere (auto-detect, the other switch).
  useEffect(() => {
    if (!pending) setShown(locale);
  }, [locale, pending]);

  useEffect(() => {
    const onTap = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) setAnnounce(false);
    };
    window.addEventListener(TAP_EVENT, onTap);
    return () => window.removeEventListener(TAP_EVENT, onTap);
  }, [id]);

  const next: Locale = shown === "en" ? "es" : "en";
  const names: Record<Locale, string> = { en: t.nav.english, es: t.nav.spanish };
  const isEs = shown === "es";
  const animated = touched && !reduce && !paused;
  const slide = animated ? SPRING_SNAPPY : { duration: 0 };

  return (
    <>
      {/* Outside the button so it never becomes part of the button's name. */}
      <span aria-live="polite" className="sr-only">
        {announce ? t.nav.languageChanged : ""}
      </span>
      <motion.button
        type="button"
        onClick={() => {
          setTouched(true);
          setAnnounce(true);
          window.dispatchEvent(new CustomEvent(TAP_EVENT, { detail: id }));
          setShown(next);
          startTransition(() => setLocale(next));
        }}
        whileTap={reduce || paused ? undefined : { scale: 0.95 }}
        className={`group relative inline-flex h-[44px] w-[80px] shrink-0 select-none rounded-full ring-1 ring-inset forced-colors:border forced-colors:border-[ButtonText] ${c.track}`}
      >
        <span className="sr-only">
          {SHORT[shown]}, {names[shown]}. {t.nav.switchLanguage}&nbsp;<span lang={next}>{names[next]}</span>
        </span>

        {/* The other language's code on the free side; it crosses under the thumb as the two swap. */}
        <motion.span
          aria-hidden="true"
          className={`absolute left-[4px] top-[4px] grid h-[36px] w-[36px] place-items-center text-[13px] font-semibold leading-none tracking-[0.02em] opacity-80 transition-opacity duration-300 group-hover:opacity-100 ${c.other}`}
          initial={false}
          animate={{ x: isEs ? 0 : "100%" }}
          transition={slide}
        >
          {SHORT[next]}
        </motion.span>

        {/* Thumb */}
        <motion.span
          aria-hidden="true"
          className="absolute left-[4px] top-[4px] h-[36px] w-[36px]"
          initial={false}
          animate={{ x: isEs ? "100%" : 0 }}
          transition={slide}
        >
          {/* Hover/focus (pointer devices only): the thumb leans 3px toward the other side. */}
          <span
            className={`block h-full w-full transition-transform duration-300 ease-editorial motion-reduce:transition-none ${
              isEs
                ? "[@media(hover:hover)]:group-hover:-translate-x-[3px] group-focus-visible:-translate-x-[3px]"
                : "[@media(hover:hover)]:group-hover:translate-x-[3px] group-focus-visible:translate-x-[3px]"
            } motion-reduce:!translate-x-0`}
          >
            {/* Re-keyed per language so the liquid stretch replays on every tap; anchored at the
                leading edge so it trails behind and never reaches the far side. */}
            <motion.span
              key={shown}
              className={`absolute inset-0 rounded-full forced-colors:bg-[Highlight] forced-colors:[forced-color-adjust:none] ${c.thumb}`}
              style={{ originX: isEs ? 1 : 0 }}
              initial={animated ? { scaleX: 1 } : false}
              animate={{ scaleX: animated ? [1, 1.16, 1] : 1 }}
              transition={{ duration: 0.26, ease: "easeOut", times: [0, 0.2, 1] }}
            />
            <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-full">
              {/* Keyed only once the visitor has tapped: auto-detect just swaps the text (no blank gap). */}
              <AnimatePresence mode="wait" initial={false} custom={animated}>
                <motion.span
                  key={touched ? shown : "static"}
                  custom={animated}
                  variants={ROLL}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className={`block text-[13px] font-semibold leading-none tracking-[0.02em] forced-colors:text-[HighlightText] forced-colors:[forced-color-adjust:none] ${c.label}`}
                >
                  {SHORT[shown]}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
        </motion.span>
      </motion.button>
    </>
  );
}
