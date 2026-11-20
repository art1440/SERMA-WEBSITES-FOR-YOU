"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Menu, Phone } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { NICHE_BY_ID } from "@/data/niches";
import { PREVIEW, PREVIEW_INDUSTRIES } from "@/data/preview";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";

/** How long each industry shows while the preview plays by itself (before the visitor touches it). */
const CYCLE_MS = 3400;

/**
 * "See your business on a real website": the visitor types their business name and
 * picks an industry; a phone shows a sample site with their name on it, a matching
 * photo and a call button. Until they interact it slowly cycles industries on its
 * own (stops for good on first touch, on hover/focus, when motion is paused, and
 * under reduced motion). The CTA opens the free-mockup pop-up with the name filled in.
 */
export function SitePreview({ className = "" }: { className?: string }) {
  const { locale } = useLanguage();
  const { openMockup } = useMockup();
  const { paused } = useMotionPause();
  const reduce = !!useReducedMotion();
  const P = PREVIEW;
  const [name, setName] = useState("");
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const [hovering, setHovering] = useState(false);
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const industry = PREVIEW_INDUSTRIES[index];
  const niche = NICHE_BY_ID[industry.id];
  const shownName = name.trim() || niche.simulator.business;
  const slug = shownName.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 22) || "yourbusiness";

  // Self-play: cycle industries until the visitor takes over.
  useEffect(() => {
    if (touched || hovering || paused || reduce) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % PREVIEW_INDUSTRIES.length), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [touched, hovering, paused, reduce]);

  const swap = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.35, ease: EASE_EDITORIAL },
      };

  return (
    <div
      ref={rootRef}
      className={`w-full max-w-[22rem] ${className}`}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocusCapture={() => setTouched(true)}
    >
      {/* Controls */}
      <div className="rounded-glass-lg bg-ink-900/90 p-4 shadow-[0_0_0_1px_rgb(var(--hairline)),0_20px_40px_-28px_rgb(var(--bone)/0.35)] backdrop-blur-sm">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-aqua">{P.eyebrow[locale]}</p>
        <p className="mt-1 font-display text-lg font-semibold leading-snug text-bone">{P.title[locale]}</p>
        <label htmlFor={inputId} className="sr-only">
          {P.inputLabel[locale]}
        </label>
        <input
          id={inputId}
          value={name}
          maxLength={40}
          autoComplete="organization"
          placeholder={P.inputPlaceholder[locale]}
          onChange={(e) => {
            setTouched(true);
            setName(e.target.value);
          }}
          className="mt-3 h-11 w-full rounded-xl bg-ink-700/60 px-3.5 text-[0.9375rem] text-bone ring-1 ring-hairline-dark placeholder:text-ash/70 transition-[box-shadow,background-color] duration-150 focus:bg-ink-900 focus:shadow-[4px_4px_0_rgb(var(--aqua-glow))] focus:outline-none focus:ring-2 focus:ring-bone"
        />
        <div role="radiogroup" aria-label={P.industryLabel[locale]} className="mt-2.5 flex flex-wrap gap-1.5">
          {PREVIEW_INDUSTRIES.map((it, i) => {
            const on = i === index;
            return (
              <button
                key={it.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setTouched(true);
                  setIndex(i);
                }}
                className={`relative isolate rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors duration-150 ${
                  on ? "text-ink-900" : "text-bone ring-1 ring-hairline-dark hover:bg-aqua/[0.07]"
                }`}
              >
                {on ? (
                  <motion.span
                    layoutId="preview-chip"
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-aqua"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                  />
                ) : null}
                {it.chip[locale]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phone */}
      <motion.figure
        aria-label={fill(P.phoneLabel[locale], { name: shownName })}
        className="relative mx-auto mt-4 w-[15.5rem] rounded-[2.4rem] bg-bone-50 p-2 shadow-[0_0_0_1px_rgb(var(--aqua-glow)/0.35),0_40px_70px_-30px_rgb(var(--bone-50)/0.6)] sm:w-[16.5rem]"
        initial={reduce ? false : { opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.7 }}
      >
        <div className="overflow-hidden rounded-[1.9rem] bg-ink-900">
          {/* Status bar + address bar */}
          <div className="flex items-center justify-between px-5 pb-1 pt-2.5 text-[0.625rem] font-semibold text-bone">
            <span>9:41</span>
            <span className="h-4 w-16 rounded-full bg-bone-50" aria-hidden="true" />
            <span aria-hidden="true">●●●</span>
          </div>
          <div className="mx-3 mb-2 truncate rounded-full bg-ink-700/70 px-3 py-1 text-center text-[0.625rem] text-ash">
            {slug}.com
          </div>

          {/* Site header */}
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-aqua font-display text-xs font-bold text-ink-900">
                {shownName.charAt(0).toUpperCase()}
              </span>
              <span className="truncate text-[0.75rem] font-semibold text-bone">{shownName}</span>
            </span>
            <Menu aria-hidden="true" size={14} className="shrink-0 text-bone" />
          </div>

          {/* Hero photo with the name over it */}
          <div className="relative mx-2.5 h-36 overflow-hidden rounded-2xl bg-bone-50">
            <AnimatePresence initial={false}>
              <motion.img
                key={industry.id}
                src={niche.media.poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                initial={reduce ? false : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.6, ease: EASE_EDITORIAL }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-3 bottom-2.5">
              <p className="line-clamp-2 break-words font-display text-[1.25rem] font-semibold leading-[1.05] text-white">
                {shownName}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p key={industry.id} {...swap} className="mt-1 text-[0.6875rem] text-white/85">
                  {industry.tagline[locale]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Buttons, info, services */}
          <div className="px-2.5 pb-4 pt-2.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={industry.id} {...swap}>
                <span className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-aqua text-[0.75rem] font-semibold text-ink-900">
                  <Phone aria-hidden="true" size={13} strokeWidth={2.25} />
                  {industry.primary[locale]}
                </span>
                <span className="mt-1.5 flex h-8 w-full items-center justify-center rounded-xl text-[0.6875rem] font-semibold text-bone ring-1 ring-hairline-dark">
                  {industry.secondary[locale]}
                </span>
                <div className="mt-2.5 flex items-center justify-between gap-2 text-[0.5625rem] text-ash">
                  <span className="flex items-center gap-1">
                    <Clock aria-hidden="true" size={10} />
                    {P.hours[locale]}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin aria-hidden="true" size={10} />
                    {P.near[locale]}
                  </span>
                </div>
                <p className="mt-2.5 text-[0.5625rem] font-bold uppercase tracking-[0.12em] text-ash">{P.services[locale]}</p>
                <ul className="mt-1 grid grid-cols-3 gap-1">
                  {industry.services.map((s) => (
                    <li key={s.en} className="truncate rounded-lg bg-ink-700/60 px-1.5 py-1.5 text-center text-[0.5625rem] font-medium text-bone">
                      {s[locale]}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <figcaption className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-900 px-2.5 py-1 text-[0.625rem] font-semibold text-ash shadow-[0_0_0_1px_rgb(var(--hairline))]">
          {P.sample[locale]}
        </figcaption>
      </motion.figure>

      <button
        type="button"
        onClick={() => openMockup({ business: name.trim() })}
        aria-haspopup="dialog"
        className="group mx-auto mt-6 flex items-center gap-2 rounded-full px-3 py-2 text-[0.9375rem] font-semibold text-aqua transition-colors duration-150 hover:text-aqua-deep"
      >
        {P.cta[locale]}
        <ArrowRight aria-hidden="true" size={17} strokeWidth={2.25} className="transition-transform duration-150 group-hover:translate-x-1" />
      </button>
    </div>
  );
}
