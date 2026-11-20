"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, X } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLaunch } from "@/components/sections/LaunchOffer";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import { TIERS } from "@/data/pricing";
import { fill } from "@/i18n/types";
import { formatCurrency } from "@/lib/format";
import { EASE_EDITORIAL } from "@/lib/motion";

/**
 * Column tracks. Phones: feature | the picked competitor | Serma.
 * lg+: feature | three competitors | Serma. The background columns and the rows share
 * the same template, so the card columns line up with the cells exactly.
 */
const GRID =
  "grid grid-cols-[minmax(0,1fr)_5.25rem_5.75rem] gap-x-2 sm:grid-cols-[minmax(0,1fr)_9rem_10rem] sm:gap-x-3 lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(0,1fr))_minmax(0,1.15fr)]";

/**
 * "Why Serma": you against the three usual alternatives. The Serma column is a dark,
 * glowing "Best choice" card; competitors are light cards with outline marks. Phones
 * show one competitor at a time (picked with a switch above the table).
 * Motion (once, when the table scrolls in): the cards rise in a short stagger, the Serma
 * card last, then each row's checks pop in order. "Get both." gets a marker sweep.
 * Transform/opacity only; static under reduced motion.
 */
export function ComparisonMatrix() {
  const { t, intlLocale } = useLanguage();
  const c = t.compare;
  const { openMockup } = useMockup();
  const [picked, setPicked] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const inView = useInView(tableRef, { once: true, margin: "-12%" });
  const headIn = useInView(headRef, { once: true, margin: "-10%" });
  const reduce = !!useReducedMotion();
  const on = reduce || inView;
  const headOn = reduce || headIn;
  const tr = (delay: number, duration = 0.6) => (reduce ? { duration: 0 } : { duration, ease: EASE_EDITORIAL, delay });

  // "Starts at": the lowest price a visitor can actually get today (launch price while it is live).
  const starter = TIERS[0];
  const { ended } = useLaunch(starter.launchTaken);
  const fromPrice = ended && starter.regular !== undefined ? starter.regular : starter.price;

  const onMockup = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    openMockup();
  };

  /** Competitor cells: only the picked one on phones, all three from lg. */
  const show = (j: number) => (j === picked ? "flex" : "hidden lg:flex");
  const rowCount = c.rows.length;

  return (
    <section id="compare" aria-labelledby="compare-title" data-theme="dark" className="relative isolate z-10 overflow-hidden py-24 text-bone lg:py-32">
      <AmbientField variant={2} />
      <div className="frame">
        {/* Header, centred */}
        <div ref={headRef} className="mx-auto max-w-4xl text-center">
          <p className="mx-auto inline-flex items-center gap-2.5 rounded-full bg-bone-50 px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.14em] text-ink-900">
            <span className="h-2 w-2 rounded-full bg-aqua-glow shadow-[0_0_10px_2px_rgb(var(--aqua-glow)/0.7)]" aria-hidden="true" />
            {c.eyebrow}
          </p>
          <h2 id="compare-title" className="mt-6 font-display text-[clamp(2.25rem,6vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance">
            <span className="block">{c.title[0]}</span>
            <span className="relative isolate mt-1 inline-block px-3">
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-[0.04em] top-[0.1em] -z-10 origin-left -rotate-1 rounded-xl bg-aqua-glow"
                initial={false}
                animate={{ scaleX: headOn ? 1 : 0 }}
                transition={tr(0.25, 0.6)}
              />
              <span className="text-bone-50">{c.titleMark}</span>
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ash sm:text-lg">
            {c.bodyBefore} <strong className="font-bold text-bone">{c.bodyStrong}</strong> {c.bodyAfter}
          </p>
        </div>

        {/* Phones: pick which alternative to compare against. */}
        <div role="radiogroup" aria-label={c.pickLabel} className="mx-auto mt-10 flex max-w-md justify-center gap-1 rounded-full bg-ink-900 p-1 shadow-[0_0_0_1px_rgb(var(--hairline))] lg:hidden">
          {c.others.map((o, j) => (
            <button
              key={o.name}
              type="button"
              role="radio"
              aria-checked={j === picked}
              onClick={() => setPicked(j)}
              className={`relative isolate flex-1 rounded-full px-2 py-2 text-[0.8125rem] font-semibold leading-tight transition-colors duration-150 ${j === picked ? "text-ink-900" : "text-bone"}`}
            >
              {j === picked ? (
                <motion.span
                  layoutId="compare-pick"
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-bone-50"
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                />
              ) : null}
              {o.name}
            </button>
          ))}
        </div>

        {/* The table */}
        <div ref={tableRef} className="relative mt-10 lg:mt-20">
          {/* Background columns (cards), same tracks as the rows. */}
          <div aria-hidden="true" className={`absolute inset-0 ${GRID}`}>
            <span />
            {c.others.map((o, j) => (
              <motion.span
                key={o.name}
                className={`${show(j)} rounded-[1.5rem] bg-ink-900 shadow-[0_0_0_1px_rgb(var(--hairline)),0_20px_40px_-30px_rgb(var(--bone)/0.3)] sm:rounded-[1.75rem]`}
                initial={false}
                animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={tr(0.05 + j * 0.08)}
              />
            ))}
            <motion.span
              className="relative -my-4 rounded-[1.5rem] bg-bone-50 shadow-[0_0_0_2px_rgb(var(--aqua-glow)/0.85),0_0_0_8px_rgb(var(--aqua-glow)/0.14),0_40px_80px_-30px_rgb(var(--aqua)/0.7)] sm:rounded-[1.75rem]"
              initial={false}
              animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={tr(0.3, 0.7)}
            >
              <span className="absolute inset-x-0 top-0 h-48 rounded-t-[inherit] bg-[radial-gradient(80%_100%_at_50%_0%,rgb(var(--aqua-glow)/0.35),transparent)]" />
              <span className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-b-lg bg-aqua-glow px-2 pb-1 pt-1.5 text-[0.5rem] font-bold uppercase tracking-[0.06em] text-bone-50 dark:text-ink-900 sm:rounded-b-xl sm:px-4 sm:pb-1.5 sm:pt-2 sm:text-[0.6875rem] sm:tracking-[0.14em]">
                {c.best}
              </span>
            </motion.span>
          </div>

          {/* Rows */}
          <div role="table" aria-labelledby="compare-title" className="relative">
            {/* Column headers */}
            <div role="row" className={`${GRID} items-start`}>
              <span role="columnheader" className="self-end pb-5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ash">
                {c.colFeature}
              </span>
              {c.others.map((o, j) => (
                <span key={o.name} role="columnheader" className={`${show(j)} flex-col items-center px-2 pb-5 pt-6 text-center sm:px-4 sm:pt-8`}>
                  <span className="font-display text-[0.9375rem] font-bold leading-tight sm:text-xl">{o.name}</span>
                  <span className="mt-2 hidden text-[0.8125rem] leading-snug text-ash sm:block">{o.note}</span>
                </span>
              ))}
              <span role="columnheader" className="flex flex-col items-center px-2 pb-5 pt-7 text-center sm:px-4 sm:pt-9">
                <span className="font-display text-base font-bold tracking-[0.18em] text-ink-900 sm:text-2xl">{c.us.name.toUpperCase()}</span>
                <span className="mt-2 hidden text-[0.8125rem] font-semibold leading-snug text-ink-900/80 sm:block">{c.us.note}</span>
              </span>
            </div>

            {c.rows.map((row, i) => {
              const d = 0.55 + i * 0.09;
              return (
                <div key={row.feature} role="row" className={`${GRID} items-stretch`}>
                  <span role="rowheader" className="flex items-center border-t border-dashed border-hairline-dark py-5 pr-2 text-[0.9375rem] font-bold leading-snug text-bone sm:py-6 sm:text-lg">
                    {row.feature}
                  </span>
                  {row.others.map((has, j) => (
                    <span key={j} role="cell" className={`${show(j)} items-center justify-center border-t border-hairline-dark/70`}>
                      <motion.span
                        key={`${j}-${picked}`}
                        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                        animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                        transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE_EDITORIAL, delay: on ? d : 0 }}
                        className={`grid h-8 w-8 place-items-center rounded-full ring-2 sm:h-10 sm:w-10 ${has ? "text-bone ring-bone/80" : "text-bone/25 ring-bone/15"}`}
                      >
                        {has ? <Check aria-hidden="true" size={18} strokeWidth={2.75} /> : <X aria-hidden="true" size={17} strokeWidth={2.25} />}
                        <span className="sr-only">{has ? c.yes : c.no}</span>
                      </motion.span>
                    </span>
                  ))}
                  <span role="cell" className="flex items-center justify-center border-t border-white/10">
                    <motion.span
                      initial={false}
                      animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 16, delay: d + 0.08 }}
                      className="grid h-9 w-9 place-items-center rounded-full bg-aqua-glow text-bone-50 shadow-[0_0_18px_2px_rgb(var(--aqua-glow)/0.55)] sm:h-11 sm:w-11"
                    >
                      <Check aria-hidden="true" size={20} strokeWidth={3.25} />
                      <span className="sr-only">{c.yes}</span>
                    </motion.span>
                  </span>
                </div>
              );
            })}

            {/* Price row */}
            <div role="row" className={`${GRID} items-stretch`}>
              <span role="rowheader" className="flex items-center border-t border-dashed border-hairline-dark py-6 pr-2 text-[0.9375rem] font-bold text-bone sm:text-lg">
                {c.priceLabel}
              </span>
              {c.prices.map((pr, j) => (
                <span key={pr} role="cell" className={`${show(j)} items-center justify-center border-t border-hairline-dark/70 px-1.5 text-center text-[0.75rem] font-semibold leading-tight text-ash sm:px-3 sm:text-[0.9375rem]`}>
                  {pr}
                </span>
              ))}
              {/* In dark mode the Serma column is a pale card: the light theme's brand blue keeps the price AA (5.1:1). */}
              <span role="cell" className="flex items-center justify-center border-t border-white/10 px-1.5 text-center text-[0.8125rem] font-bold leading-tight text-aqua-glow dark:text-[rgb(30_99_216)] sm:text-lg">
                {fromPrice !== null ? fill(c.usPrice, { price: formatCurrency(fromPrice, intlLocale) }) : null}
              </span>
            </div>
          </div>
        </div>

        <motion.div
          className="mt-16 flex flex-col items-center gap-3"
          initial={false}
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={tr(0.55 + rowCount * 0.09)}
        >
          <MagneticButton href="#pricing" onClick={onMockup} aria-haspopup="dialog" className="btn-aqua">
            {t.common.getStarted}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
          </MagneticButton>
          <span className="text-sm font-medium text-ash">{c.ctaNote}</span>
        </motion.div>
      </div>
    </section>
  );
}
