"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { HeroLight } from "@/components/ui/HeroLight";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToPricing } from "@/lib/scroll";

/**
 * Static hero: one screen, no scroll track, no 3D. The only motion is the
 * one-time entrance (headline mask reveal, then sub copy and CTAs).
 */
export function HeroChapter() {
  const { t } = useLanguage();
  const { openMockup } = useMockup();

  const onMockupClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    openMockup();
  };

  const onPricingClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    goToPricing();
  };

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      data-theme="dark"
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      <AmbientField variant={0} />
      <HeroLight />

      <div className="frame relative flex min-h-[100svh] flex-col items-center justify-center pb-14 pt-36 text-center lg:pb-16 lg:pt-28">
        <div className="flex min-w-0 flex-col items-center">
        {/* Meta chips: what we do + live status */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <p className="chip-dark glass-flat shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgb(var(--bone)/0.08),0_10px_22px_-10px_rgb(var(--bone)/0.22)] hidden text-ash sm:inline-flex">{t.hero.eyebrow}</p>
          <p className="chip-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgb(var(--bone)/0.08),0_10px_22px_-10px_rgb(var(--bone)/0.22)] text-bone">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
            </span>
            {t.hero.status}
          </p>
        </div>

        <h1
          id="hero-title"
          className="mt-6 font-display text-display-xl text-bone max-sm:text-[clamp(2.25rem,10.4vw,3rem)] lg:mt-9 lg:text-[clamp(2.75rem,6.6vw,8rem)]"
        >
          {t.hero.headline.map((line, i) => (
            <HeadlineLine key={i} index={i} emphasis={t.hero.headlineEmphasis}>
              {line}
            </HeadlineLine>
          ))}
        </h1>

        <div className="mt-7 flex max-w-xl flex-col items-center lg:mt-9">
          <motion.p
            className="max-w-xl text-pretty text-base leading-relaxed text-ash sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.45 }}
          >
            {t.hero.sub}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.6 }}
          >
            <MagneticButton href="#pricing" onClick={onMockupClick} aria-haspopup="dialog" className="btn-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgb(var(--bone)/0.08),0_12px_24px_-10px_rgb(var(--bone)/0.28)]">
              {t.common.getStarted}
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
            </MagneticButton>
            <a href="#pricing" onClick={onPricingClick} className="link-quiet group">
              {t.hero.secondaryCta}
              <ArrowDown
                aria-hidden="true"
                size={16}
                strokeWidth={1.75}
                className="transition-transform duration-300 ease-editorial group-hover:translate-y-0.5"
              />
            </a>
          </motion.div>
          {/* Reassurance right under the buttons: removes the last reasons not to click. */}
          <motion.p
            className="mt-4 text-sm font-medium text-ash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: 0.75 }}
          >
            {t.hero.ctaNote}
          </motion.p>
        </div>
        </div>
      </div>
    </section>
  );
}

function HeadlineLine({ children, index, emphasis }: { children: string; index: number; emphasis: string }) {
  const parts = children.includes(emphasis) ? children.split(emphasis) : null;

  return (
    <span className="block overflow-hidden pb-[0.1em]">
      <motion.span
        className="block"
        initial={{ y: "108%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 1, ease: EASE_EDITORIAL, delay: 0.1 + index * 0.11 }}
      >
        {parts ? (
          <>
            {parts[0]}
            {/* Accent: serif italic with an aqua glow gradient (≥11:1 on ink). The padding stops the italic
                overhang from being cut off by background-clip; the negative margin keeps punctuation spacing. */}
            <em className="mr-[-0.12em] bg-gradient-to-r from-aqua-glow via-aqua to-aqua-deep bg-clip-text pr-[0.12em] font-serif font-normal italic tracking-[-0.01em] text-transparent [filter:drop-shadow(0_0_0.35em_theme(colors.aqua.glow/0.35))] [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              {emphasis}
            </em>
            {parts.slice(1).join(emphasis)}
          </>
        ) : (
          children
        )}
      </motion.span>{" "}
    </span>
  );
}
