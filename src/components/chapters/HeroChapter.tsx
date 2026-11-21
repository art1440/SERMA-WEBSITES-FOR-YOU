"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { type MouseEvent, type ReactNode } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { HeroLight } from "@/components/ui/HeroLight";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
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

      <div className="frame relative flex min-h-[100svh] flex-col items-center justify-center pb-12 pt-28 text-center lg:pb-16 lg:pt-28">
        <div className="flex min-w-0 flex-col items-center">
        {/* Meta chips: what we do + live status */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <p className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold shadow-[0_0_0_1px_rgb(var(--hairline)),0_10px_22px_-12px_rgb(var(--bone)/0.35)] hidden text-bone/75 sm:inline-flex">{t.hero.eyebrow}</p>
          <p className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold shadow-[0_0_0_1px_rgb(var(--hairline)),0_10px_22px_-12px_rgb(var(--bone)/0.35)] text-bone">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
            </span>
            {t.hero.status}
          </p>
        </div>

        <h1
          id="hero-title"
          className="mt-7 font-display text-display-xl font-black [font-variation-settings:'wght'_900] !leading-[0.92] !tracking-[-0.045em] text-bone-50 max-sm:text-[clamp(2.6rem,12.5vw,3.6rem)] lg:mt-9 lg:text-[clamp(3rem,7.4vw,9rem)]"
        >
          {t.hero.headline.map((line, i) => (
            <HeadlineLine key={i} index={i} emphasis={t.hero.headlineEmphasis}>
              {line}
            </HeadlineLine>
          ))}
        </h1>

        <div className="mt-6 flex max-w-2xl flex-col items-center sm:mt-8 lg:mt-10">
          <motion.p
            className="max-w-2xl text-pretty text-[1.0625rem] font-medium leading-relaxed text-bone/80 sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.45 }}
          >
            {withBold(t.hero.sub, t.hero.subBold)}
          </motion.p>
          <motion.div
            className="mt-7 flex flex-col items-center gap-4 sm:mt-9 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.6 }}
          >
            <MagneticButton
              href="#pricing"
              onClick={onMockupClick}
              aria-haspopup="dialog"
              className="inline-flex h-14 items-center gap-2.5 rounded-full bg-bone-50 px-8 text-[1.0625rem] font-bold text-ink-900 shadow-[0_0_0_4px_rgb(var(--aqua-glow)/0.25),0_18px_36px_-14px_rgb(var(--bone-50)/0.65)] transition-[background-color,box-shadow] duration-200 hover:bg-aqua-deep hover:shadow-[0_0_0_6px_rgb(var(--aqua-glow)/0.3),0_18px_36px_-14px_rgb(var(--bone-50)/0.65)] sm:h-16 sm:px-9 sm:text-lg"
            >
              {t.common.getStarted}
              <ArrowUpRight aria-hidden="true" size={19} strokeWidth={2.25} />
            </MagneticButton>
            <a href="#pricing" onClick={onPricingClick} className="link-quiet group text-[1.0625rem] font-bold text-bone sm:text-lg">
              {t.hero.secondaryCta}
              <ArrowDown
                aria-hidden="true"
                size={18}
                strokeWidth={2.25}
                className="transition-transform duration-300 ease-editorial group-hover:translate-y-0.5"
              />
            </a>
          </motion.div>
          {/* Reassurance right under the buttons: removes the last reasons not to click. */}
          <motion.p
            className="mt-5 text-[0.9375rem] font-semibold text-bone/70"
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

/** Bolds each listed phrase inside a sentence (phrases must appear verbatim). */
function withBold(text: string, phrases: readonly string[]): ReactNode {
  const hits = phrases.filter((p) => p && text.includes(p));
  if (hits.length === 0) return text;
  const re = new RegExp(`(${hits.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return text.split(re).map((part, i) =>
    hits.includes(part) ? (
      <strong key={i} className="font-bold text-bone-50">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function HeadlineLine({ children, index, emphasis }: { children: string; index: number; emphasis: string }) {
  const parts = children.includes(emphasis) ? children.split(emphasis) : null;

  return (
    <span className="block overflow-hidden pb-[0.2em] -mb-[0.1em]">
      <motion.span
        className="block"
        initial={{ y: "108%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ duration: 1, ease: EASE_EDITORIAL, delay: 0.1 + index * 0.11 }}
      >
        {parts ? (
          <>
            {parts[0]}
            <Emphasis delay={0.1 + index * 0.11 + 0.75}>{emphasis}</Emphasis>
            {parts.slice(1).join(emphasis)}
          </>
        ) : (
          children
        )}
      </motion.span>{" "}
    </span>
  );
}

/**
 * The promise words ("picked first"): the same black-weight serif in an aqua gradient (the
 * italic cut ships a single light weight, so it can't go bold).
 * Once the line has landed, a brush stroke draws itself underneath (left to right, like a
 * pen signing it) and a single sheen of light crosses the letters. Both run once, never
 * loop, and are skipped for visitors who prefer reduced motion (the stroke is simply there).
 */
function Emphasis({ children, delay }: { children: string; delay: number }) {
  const reduce = useReducedMotionSafe();
  return (
    <span className="relative inline-block whitespace-nowrap">
      {/* Padding stops background-clip from trimming the italic overhang. */}
      <motion.em
        key={reduce ? "still" : "sheen"}
        className="relative z-10 -mr-[0.06em] bg-[linear-gradient(100deg,rgb(var(--aqua-deep))_0%,rgb(var(--aqua))_35%,rgb(var(--aqua-glow))_47%,#fff_50%,rgb(var(--aqua-glow))_53%,rgb(var(--aqua))_65%,rgb(var(--aqua-deep))_100%)] bg-[length:250%_100%] bg-clip-text pr-[0.06em] font-display font-black not-italic [font-variation-settings:'wght'_900] text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
        initial={{ backgroundPosition: "100% 0%" }}
        animate={{ backgroundPosition: reduce ? "100% 0%" : "0% 0%" }}
        transition={{ duration: 1.6, ease: [0.45, 0, 0.2, 1], delay: delay + 0.55 }}
      >
        {children}
      </motion.em>
      {/* Brush swash behind the baseline: drawn by its path length, letters' descenders cross over it. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -bottom-[0.1em] left-[-0.03em] z-0 h-[0.22em] w-[calc(100%+0.02em)] overflow-visible"
      >
        <defs>
          <linearGradient id="hero-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="rgb(var(--aqua))" />
            <stop offset="0.6" stopColor="rgb(var(--aqua-glow))" />
            <stop offset="1" stopColor="rgb(var(--aqua-glow))" />
          </linearGradient>
        </defs>
        {/* Remount once the motion preference is known (it resolves after hydration), so a
            reduced-motion visitor gets the finished stroke instead of the in-flight draw. */}
        <motion.path
          key={reduce ? "still" : "draw"}
          d="M6 16 C 80 10, 170 7, 294 9"
          fill="none"
          stroke="url(#hero-stroke)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.85 : 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={
            reduce
              ? { duration: 0 }
              : { pathLength: { duration: 0.85, ease: [0.65, 0, 0.35, 1], delay }, opacity: { duration: 0.15, delay } }
          }
        />
      </svg>
    </span>
  );
}
