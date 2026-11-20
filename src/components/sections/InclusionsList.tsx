"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, type MouseEvent } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToPricing } from "@/lib/scroll";

/** The step where the visitor pays: its node stays lit and its "pay after" tag is aqua. */
const PAY_STEP = 2;
/** How long the progress line takes to draw across all steps (s). */
const DRAW_S = 1.1;
const DRAW_START = 0.15;

/**
 * How it works: four steps on one rail. When the rail scrolls into view a line
 * draws through the steps once and each step lights as the line reaches it, so
 * the eye reads 1 → 4 in order. Transform + opacity only; static under reduced motion.
 */
export function InclusionsList() {
  const { t } = useLanguage();
  const section = t.included;
  const steps = section.items;
  const railRef = useRef<HTMLOListElement>(null);
  const inView = useInView(railRef, { once: true, margin: "-15%" });
  const reduce = !!useReducedMotion();
  const on = reduce || inView;

  // When the line reaches step i. The line draws at a constant speed so each node lights exactly as it arrives.
  const reach = (i: number) => (reduce ? 0 : DRAW_START + (i / Math.max(1, steps.length - 1)) * DRAW_S);
  const lineTransition = reduce ? { duration: 0 } : { duration: DRAW_S, ease: "linear" as const, delay: DRAW_START };

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

        <ol ref={railRef} className="relative mt-12 grid gap-9 md:mt-16 md:grid-cols-4 md:gap-8">
          {/* Rail: a hairline track with the aqua progress line drawn over it.
              md+: one horizontal line from the first node's centre to the last (4 columns, 2rem gaps). Phones: vertical segments
              between nodes (rendered per step below), so the line stops at the last node. */}
          <span
            aria-hidden="true"
            className="absolute left-5 right-[calc((100%_-_6rem)/4_-_1.25rem)] top-5 hidden h-px bg-hairline-dark md:block"
          />
          <motion.span
            aria-hidden="true"
            className="absolute left-5 right-[calc((100%_-_6rem)/4_-_1.25rem)] top-5 hidden h-px origin-left bg-aqua md:block"
            initial={false}
            animate={{ scaleX: on ? 1 : 0 }}
            transition={lineTransition}
          />

          {steps.map((step, i) => {
            const delay = reach(i);
            const pay = i === PAY_STEP;
            return (
              <li key={step.title} className="relative flex gap-5 md:flex-col md:gap-6">
                {i < steps.length - 1 ? (
                  <>
                    {/* Phones: segment from this node's centre to the next one's (li height + the 2.25rem gap). */}
                    <span aria-hidden="true" className="absolute left-5 top-5 h-[calc(100%+2.25rem)] w-px -translate-x-1/2 bg-hairline-dark md:hidden" />
                    <motion.span
                      aria-hidden="true"
                      className="absolute left-5 top-5 h-[calc(100%+2.25rem)] w-px -translate-x-1/2 origin-top bg-aqua md:hidden"
                      initial={false}
                      animate={{ scaleY: on ? 1 : 0 }}
                      transition={reduce ? { duration: 0 } : { duration: reach(i + 1) - reach(i), ease: "linear", delay }}
                    />
                  </>
                ) : null}
                {/* Node: hairline ring; an aqua fill fades + settles in when the line arrives. */}
                <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink ring-1 ring-hairline-dark">
                  <motion.span
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-full ${pay ? "bg-aqua" : "bg-aqua/15 ring-1 ring-aqua/50"}`}
                    initial={false}
                    animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE_EDITORIAL, delay }}
                  />
                  <span className={`tabular relative font-mono text-xs ${pay && on ? "text-ink" : "text-bone"} transition-colors duration-300`} style={{ transitionDelay: `${delay}s` }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>

                <motion.div
                  className="min-w-0 pt-1.5 md:pt-0"
                  initial={false}
                  animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.6, ease: EASE_EDITORIAL, delay }}
                >
                  <h3 className="font-display text-xl leading-snug text-balance text-bone md:text-[1.375rem]">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-pretty text-[0.9375rem] leading-relaxed text-ash">{step.detail}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {step.tags.map((tag, j) => (
                      <li
                        key={tag}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          pay && j === step.tags.length - 1
                            ? "bg-aqua/[0.12] text-aqua ring-1 ring-aqua/40"
                            : "text-ash ring-1 ring-hairline-dark"
                        }`}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </li>
            );
          })}
        </ol>

        <Reveal>
          <div className="mt-14 flex flex-col gap-5 border-t border-hairline-dark pt-8 sm:flex-row sm:items-center sm:justify-between md:mt-16">
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
