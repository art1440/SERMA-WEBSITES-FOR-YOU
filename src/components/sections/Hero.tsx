"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { MouseEvent } from "react";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { NICHES } from "@/data/niches";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToDemo } from "@/lib/scroll";

export function Hero() {
  const { t, locale } = useLanguage();

  const onDemoClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    goToDemo();
  };

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-8 lg:pb-24 lg:pt-12">
      <div className="frame">
        {/* Meta rail */}
        <Reveal trigger="mount" y={8} className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline-light pb-4">
          <p className="eyebrow text-muted">{t.hero.eyebrow}</p>
          <p className="flex items-center gap-2.5 font-mono text-micro uppercase text-ink">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2F7D4F]" />
            </span>
            <span>{t.hero.status}</span>
            <span className="hidden text-muted sm:inline">/ {t.hero.statusDetail}</span>
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-12 gap-x-4 gap-y-10 lg:mt-12 lg:gap-x-8">
          {/* Headline — staggered line reveal, asymmetric indents */}
          <RevealLines
            as="h1"
            id="hero-title"
            trigger="mount"
            delay={0.1}
            stagger={0.11}
            lines={t.hero.headline}
            emphasis={t.hero.headlineEmphasis}
            className="sd-hero-title col-span-12 font-display text-display-xl text-ink lg:col-span-8 lg:text-[clamp(2.75rem,7.4vw,9rem)]"
            lineClassName="[&:nth-child(2)]:pl-[8%] [&:nth-child(3)]:pl-[2%] lg:[&:nth-child(2)]:pl-[14%] lg:[&:nth-child(3)]:pl-[5%]"
          />

          {/* Higgsfield ambient loop — sits in the headline's negative space */}
          <motion.figure
            className="col-span-12 sm:col-span-10 sm:col-start-3 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:pt-3"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE_EDITORIAL, delay: 0.3 }}
          >
            <AmbientVideo
              src="/media/hero"
              poster="/media/hero-poster.jpg"
              label={t.hero.videoLabel}
              className="sd-hero-media aspect-[4/3] w-full border border-ink lg:aspect-[4/5]"
              videoClassName="sd-zoom"
            />
            <figcaption className="mt-3 flex items-start justify-between gap-4 font-mono text-micro uppercase text-muted">
              <span>{t.hero.figure}</span>
              <span aria-hidden="true" className="whitespace-nowrap">
                ∞ 00:08.8
              </span>
            </figcaption>
          </motion.figure>

          {/* Copy + CTAs */}
          <div className="col-span-12 grid gap-10 lg:col-span-8 lg:grid-cols-8 lg:gap-x-8">
            <Reveal trigger="mount" delay={0.45} className="lg:col-span-5">
              <p className="max-w-md text-pretty text-lg leading-relaxed text-muted">{t.hero.sub}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <MagneticButton href="#demo" onClick={onDemoClick} className="btn-ink px-6 py-4 text-[0.8rem]">
                  {t.common.bookDemo}
                  <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
                </MagneticButton>
                <a
                  href="#dashboard"
                  className="group inline-flex min-h-[44px] items-center gap-2 px-1 font-mono text-[0.75rem] uppercase tracking-[0.08em] text-ink"
                >
                  {t.hero.secondaryCta}
                  <ArrowDown
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.5}
                    className="transition-transform duration-300 ease-editorial group-hover:translate-y-1"
                  />
                </a>
              </div>
            </Reveal>

            <Reveal trigger="mount" delay={0.6} className="hidden border-l border-hairline-light pl-6 lg:col-span-3 lg:block">
              <p className="eyebrow text-muted">{t.hero.builtFor}</p>
              <ul className="mt-3 space-y-1 font-display text-2xl leading-tight text-ink">
                {NICHES.map((n, i) => (
                  <li key={n.id} className="flex items-baseline gap-3">
                    <span aria-hidden="true" className="w-5 font-mono text-micro text-muted">
                      0{i + 1}
                    </span>
                    {n.label[locale]}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* System stack index */}
        <Reveal trigger="mount" delay={0.75}>
          <ol className="mt-14 grid grid-cols-2 border-t border-ink sm:grid-cols-3 lg:mt-20 lg:grid-cols-5">
            {t.hero.stack.map((item, i) => (
              <li
                key={item}
                className="flex items-baseline gap-3 border-b border-hairline-light py-4 pr-3 lg:border-b-0 lg:border-r lg:px-4 lg:first:pl-0 lg:last:border-r-0"
              >
                <span className="font-mono text-micro text-signal-deep">0{i + 1}</span>
                <span className="text-sm text-ink">{item}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
