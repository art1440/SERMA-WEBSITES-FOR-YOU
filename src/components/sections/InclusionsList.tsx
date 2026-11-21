"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToPricing } from "@/lib/scroll";
import { STEP_ILLUSTRATIONS } from "./StepIllustrations";

/** The step where the visitor pays: the dark, badged card. */
const FEATURED = 2;
/** Cards enter 90ms apart; each card's top bar then fills, handing off to the next (reads 1 → 4). */
const STAGGER_S = 0.09;
const BAR_START = 0.35;
const BAR_STEP = 0.28;

function withStrong(text: string, strong: string, className: string): ReactNode {
  if (!strong || !text.includes(strong)) return text;
  const [before, ...rest] = text.split(strong);
  return (
    <>
      {before}
      <strong className={className}>{strong}</strong>
      {rest.join(strong)}
    </>
  );
}

/**
 * How it works: four cards. Each has a line illustration that draws itself in,
 * a giant faint step number, one line of copy with the key phrase in bold, and
 * a few tags. The step where the visitor pays is the dark featured card.
 * Motion runs once when the grid scrolls into view (transform/opacity/pathLength
 * only) and is static under reduced motion.
 */
export function InclusionsList() {
  const { t } = useLanguage();
  const section = t.included;
  const steps = section.items;
  const gridRef = useRef<HTMLOListElement>(null);
  const inView = useInView(gridRef, { once: true, margin: "-10%" });
  const reduce = !!useReducedMotion();
  const on = reduce || inView;

  const onPricingClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    goToPricing();
  };

  return (
    <section id="included" aria-labelledby="included-title" className="relative z-10 bg-ink py-20 md:py-28">
      <div className="frame">
        <SectionHeader
          index={section.index}
          eyebrow={section.eyebrow}
          title={section.title}
          body={section.body}
          headingId="included-title"
        />

        <ol ref={gridRef} className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
          {steps.map((step, i) => {
            const featured = i === FEATURED;
            const Illustration = STEP_ILLUSTRATIONS[i] ?? STEP_ILLUSTRATIONS[0];
            const enter = reduce ? 0 : i * STAGGER_S;
            const bar = reduce ? 0 : BAR_START + i * BAR_STEP;
            return (
              <motion.li
                key={step.title}
                className="flex"
                initial={false}
                animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_EDITORIAL, delay: enter }}
              >
                <article
                  className={`group relative flex w-full flex-col overflow-hidden rounded-glass-lg p-7 transition-[box-shadow] duration-300 ease-editorial sm:p-8 ${
                    featured
                      ? "bg-bone-50 text-ink-900 shadow-[0_0_0_1px_rgb(var(--aqua-glow)/0.55),0_0_0_6px_rgb(var(--aqua-glow)/0.14),0_30px_60px_-28px_rgb(var(--aqua)/0.6)]"
                      : "bg-ink-900 text-bone shadow-[0_0_0_1px_rgb(var(--hairline)),0_24px_48px_-30px_rgb(var(--bone)/0.25)] hover:shadow-[0_0_0_1px_rgb(var(--aqua)/0.45),0_24px_48px_-30px_rgb(var(--bone)/0.3)]"
                  }`}
                >
                  {/* Featured only: a soft aqua light pooling behind the number. */}
                  {featured ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgb(var(--aqua-glow)/0.45),transparent)]"
                    />
                  ) : null}

                  {/* Top progress bar: fills once, in order across the cards. */}
                  <span aria-hidden="true" className={`absolute left-0 right-0 top-0 h-1.5 ${featured ? "bg-ink-900/10" : "bg-hairline-dark/70"}`} />
                  <motion.span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 top-0 h-1.5 origin-left ${featured ? "bg-aqua-glow" : "bg-aqua"}`}
                    initial={false}
                    animate={{ scaleX: on ? 1 : 0 }}
                    transition={reduce ? { duration: 0 } : { duration: BAR_STEP + 0.05, ease: "linear", delay: bar }}
                  />

                  {featured ? (
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl bg-aqua-glow px-4 pb-1.5 pt-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-bone-50 dark:text-ink-900">
                      {section.featuredBadge}
                    </span>
                  ) : null}

                  {/* Giant step number: pure decoration (the heading carries the step for screen readers).
                      Drawn as generated content, not a text node, so contrast checks treat it as the
                      ornament it is and it stays faint. */}
                  <span
                    aria-hidden="true"
                    data-step={String(i + 1).padStart(2, "0")}
                    className={`tabular pointer-events-none absolute right-6 top-6 select-none font-display text-[3.75rem] font-bold leading-none tracking-[-0.04em] before:content-[attr(data-step)] sm:text-[5rem] ${
                      featured ? "text-aqua-glow/80" : "text-bone/[0.07]"
                    }`}
                  />

                  <div className={`relative mt-2 h-16 w-20 sm:mt-6 sm:h-20 sm:w-24 ${featured ? "text-ink-900" : "text-bone"}`}>
                    <Illustration on={on} reduce={reduce} delay={enter + 0.15} accentClass={featured ? "text-aqua-glow" : "text-aqua"} />
                  </div>

                  <h3 className={`relative mt-6 font-display text-[1.5rem] sm:mt-8 sm:text-[1.625rem] font-semibold leading-[1.1] tracking-[-0.02em] text-balance ${featured ? "text-ink-900" : "text-bone"}`}>
                    <span className="sr-only">{`${i + 1}. `}</span>
                    {step.title}
                  </h3>
                  <p className={`relative mt-3 text-pretty text-[0.9375rem] leading-relaxed ${featured ? "text-ink-900/75" : "text-ash"}`}>
                    {withStrong(step.detail, step.strong, featured ? "font-semibold text-ink-900" : "font-semibold text-bone")}
                  </p>

                  <ul className="relative mt-auto flex flex-wrap gap-2 pt-5 sm:pt-6">
                    {step.tags.map((tag) => (
                      <li
                        key={tag}
                        className={`rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold ${
                          featured
                            ? "bg-aqua-glow/15 text-ink-900 ring-1 ring-aqua-glow/60"
                            : "bg-aqua/[0.07] text-bone ring-1 ring-aqua/25"
                        }`}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </article>
              </motion.li>
            );
          })}
        </ol>

        <Reveal>
          <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between md:mt-14">
            <p className="font-display text-xl text-balance text-bone md:text-2xl">{section.closing}</p>
            <MagneticButton href="#pricing" onClick={onPricingClick} className="btn-aqua self-start sm:self-auto">
              {t.common.seePricing}
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
