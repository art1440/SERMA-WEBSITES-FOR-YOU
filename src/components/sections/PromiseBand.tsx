"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Eye, Globe, PenLine, Receipt, type LucideIcon } from "lucide-react";
import type { MouseEvent } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, staggerDelay } from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { PROMISE_CLOSING, PROMISE_HEADING, PROMISE_ITEMS, type PromiseIcon } from "@/data/promise";
import { SPRING_SNAPPY, VIEWPORT_ONCE } from "@/lib/motion";
import { goToPricing } from "@/lib/scroll";

const ICONS: Record<PromiseIcon, LucideIcon> = {
  draft: Eye,
  price: Receipt,
  copy: PenLine,
  domain: Globe,
};

/** Icon that "stamps" in once: scale 0.8 to 1 on SPRING_SNAPPY. No movement under reduced motion. */
function StampIcon({ icon: Icon, delay }: { icon: LucideIcon; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-aqua ring-1 ring-aqua/30"
      initial={reduce ? false : { scale: 0.8 }}
      whileInView={{ scale: 1 }}
      viewport={VIEWPORT_ONCE}
      transition={{ ...SPRING_SNAPPY, delay: delay + 0.15 }}
    >
      <Icon size={18} strokeWidth={1.75} />
    </motion.span>
  );
}

export function PromiseBand() {
  const { locale, t } = useLanguage();

  const onPricingClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    goToPricing();
  };

  return (
    <div className="mt-16 md:mt-20" role="group" aria-labelledby="promise-title">
      <Reveal>
        <h3 id="promise-title" className="font-display text-2xl text-balance text-bone md:text-3xl">
          {PROMISE_HEADING[locale]}
        </h3>
      </Reveal>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {PROMISE_ITEMS.map((item, i) => (
          <li key={item.icon} className="flex">
            <Reveal delay={staggerDelay(i)} className="flex w-full">
              <div className="glass-dark glass-flat glass-solid flex w-full flex-col rounded-glass p-5 sm:p-6">
                <StampIcon icon={ICONS[item.icon]} delay={staggerDelay(i)} />
                <p className="mt-4 font-display text-lg leading-snug text-balance text-bone">{item.title[locale]}</p>
                <p className="mt-2 text-pretty text-[0.9375rem] leading-relaxed text-ash">{item.detail[locale]}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal delay={staggerDelay(PROMISE_ITEMS.length)}>
        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl text-balance text-bone md:text-2xl">{PROMISE_CLOSING[locale]}</p>
          <MagneticButton href="#pricing" onClick={onPricingClick} className="btn-aqua self-start sm:self-auto">
            {t.common.seePricing}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
          </MagneticButton>
        </div>
      </Reveal>
    </div>
  );
}
