"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, X } from "lucide-react";
import { useRef, type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import { EASE_EDITORIAL } from "@/lib/motion";

/** Column widths: the Serma band behind the last column must match its track exactly. */
const COLS = "grid-cols-[minmax(0,1fr)_6.5rem_4.75rem] sm:grid-cols-[minmax(0,1fr)_11rem_9rem] lg:grid-cols-[minmax(0,1fr)_14rem_11rem]";
const BAND_W = "w-[4.75rem] sm:w-[9rem] lg:w-[11rem]";
/** Row dividers stop short of the band (band width + column gap), so the navy column stays one piece. */
const DIVIDER_R = "right-[5.5rem] sm:right-[10.5rem] lg:right-[12.5rem]";

/**
 * "Why Serma": one scannable table instead of eight flip cards. Each row is a
 * short promise; the middle column is what a typical web designer does, the
 * last column is a navy band of checks. On scroll-in the band rises, the rows
 * follow, and each check pops in as its row lands. Transform/opacity only;
 * static under reduced motion. Every row is a promise the site already makes.
 */
export function ComparisonMatrix() {
  const { t } = useLanguage();
  const c = t.compare;
  const { openMockup } = useMockup();
  const tableRef = useRef<HTMLDivElement>(null);
  const inView = useInView(tableRef, { once: true, margin: "-15%" });
  const reduce = !!useReducedMotion();
  const on = reduce || inView;
  const tr = (delay: number, duration = 0.5) => (reduce ? { duration: 0 } : { duration, ease: EASE_EDITORIAL, delay });

  const onMockup = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    openMockup();
  };

  return (
    <section
      id="compare"
      aria-labelledby="compare-title"
      data-theme="dark"
      className="relative isolate z-10 overflow-hidden py-24 text-bone lg:py-32"
    >
      <AmbientField variant={2} />
      <div className="frame">
        <SectionHeader headingId="compare-title" index={c.index} eyebrow={c.eyebrow} title={c.title} body={c.body} />

        <div
          ref={tableRef}
          role="table"
          aria-labelledby="compare-title"
          className="relative mt-10 max-w-4xl rounded-glass-lg bg-ink-900 px-4 shadow-[0_0_0_1px_rgb(var(--hairline)),0_30px_60px_-36px_rgb(var(--bone)/0.35)] sm:px-8 lg:mt-14"
        >
          {/* The Serma column: a navy band that rises behind the checks. */}
          <motion.div
            aria-hidden="true"
            className={`absolute -bottom-3 -top-3 right-4 origin-bottom rounded-[1.5rem] bg-bone-50 shadow-[0_0_0_1px_rgb(var(--aqua-glow)/0.55),0_0_0_6px_rgb(var(--aqua-glow)/0.12),0_24px_48px_-20px_rgb(var(--aqua)/0.55)] sm:right-8 ${BAND_W}`}
            initial={false}
            animate={on ? { scaleY: 1, opacity: 1 } : { scaleY: 0.6, opacity: 0 }}
            transition={tr(0, 0.6)}
          />

          {/* Header row */}
          <div role="row" className={`relative grid ${COLS} items-end gap-x-3 pb-4 pt-6 sm:gap-x-6 sm:pt-8`}>
            <span role="columnheader" className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-ash">
              {c.colFeature}
            </span>
            <span role="columnheader" className="text-center text-[0.6875rem] font-bold uppercase leading-tight tracking-[0.1em] text-ash">
              {c.colOthers}
            </span>
            <span role="columnheader" className="text-center font-display text-[0.9375rem] font-semibold tracking-[0.12em] text-ink-900 sm:text-lg sm:tracking-[0.22em]">
              {c.colUs.toUpperCase()}
            </span>
          </div>

          {c.rows.map((row, i) => {
            const d = 0.25 + i * 0.08;
            return (
              <motion.div
                key={row.feature}
                role="row"
                className={`relative grid ${COLS} items-center gap-x-3 py-4 sm:gap-x-6 sm:py-5`}
                initial={false}
                animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={tr(d)}
              >
                <span aria-hidden="true" className={`absolute left-0 top-0 h-px bg-hairline-dark ${DIVIDER_R}`} />
                <span role="rowheader" className="text-pretty text-[0.9375rem] font-semibold leading-snug text-bone sm:text-lg">
                  {row.feature}
                </span>

                <span role="cell" className="flex items-center justify-center gap-1.5 text-center text-[0.75rem] leading-tight text-ash sm:text-sm">
                  <span className="sr-only">{c.no} </span>
                  <X aria-hidden="true" size={15} strokeWidth={2.5} className="hidden shrink-0 text-ash/70 sm:block" />
                  {row.others}
                </span>

                <span role="cell" className="flex justify-center">
                  <motion.span
                    className="grid h-8 w-8 place-items-center rounded-full bg-aqua-glow text-bone-50 sm:h-9 sm:w-9"
                    initial={false}
                    animate={on ? { scale: 1, opacity: 1 } : { scale: 0.3, opacity: 0 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 17, delay: d + 0.12 }}
                  >
                    <Check aria-hidden="true" size={18} strokeWidth={3} />
                    <span className="sr-only">{c.yes}</span>
                  </motion.span>
                </span>
              </motion.div>
            );
          })}
          <div aria-hidden="true" className="h-4 sm:h-6" />
        </div>

        <motion.div
          className="mt-14 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5"
          initial={false}
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={tr(0.25 + c.rows.length * 0.08)}
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
