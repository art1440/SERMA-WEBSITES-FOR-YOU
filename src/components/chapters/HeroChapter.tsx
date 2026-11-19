"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { HeroFlowCard } from "@/components/ui/HeroFlowCard";
import { HeroLight, ParallaxLayer, PointerParallaxProvider } from "@/components/ui/HeroLight";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { EASE_EDITORIAL, HERO_BEATS } from "@/lib/motion";
import { goToPricing } from "@/lib/scroll";
import { asset } from "@/lib/asset";

/** Per-line 3D exit: each line flies toward the camera on its own path. */
const LINE_PATHS = [
  { x: "-38%", rx: -18, ry: 14, z: 520 },
  { x: "34%", rx: 22, ry: -16, z: 680 },
  { x: "-22%", rx: -12, ry: 10, z: 840 },
];

export function HeroChapter() {
  const { t } = useLanguage();
  const { hero, reduce } = useScene();
  const p = hero.progress;
  // Sharp at rest: the headline is a 3D stack only once the scroll shear begins (HERO_BEATS.shearStart); before
  // that every line's transform is `none`, so flattening it is pixel-identical but lets the
  // browser paint the glyphs natively instead of resampling a GPU texture.
  const headline = useRef<HTMLHeadingElement>(null);
  const flatten = (v: number) => headline.current?.classList.toggle("stage-flat", reduce || v < HERO_BEATS.shearStart);
  useMotionValueEvent(p, "change", flatten);
  useEffect(() => {
    flatten(p.get());
  });

  const copyOpacity = useTransform(p, [0.04, 0.3], [1, 0]);
  const copyY = useTransform(p, [0.04, 0.33], [0, -60]);
  const copyPointer = useTransform(p, (v) => (v > 0.2 ? "none" : "auto"));
  // Once the copy has faded away, take its buttons out of the Tab order (state flips only at the threshold).
  const [copyHidden, setCopyHidden] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    const hidden = v > 0.2;
    if (hidden !== copyHidden) setCopyHidden(hidden);
  });
  const hintOpacity = useTransform(p, [0, 0.06], [1, 0]);

  // Statement: the last beat. It emerges from depth as the headline's last line leaves, then rests to the end of
  // the track, so the sticky release carries it off like any other content (no exit, no empty screen).
  const stOpacity = useTransform(p, [HERO_BEATS.statementIn, 0.8], [0, 1]);
  const stZ = useTransform(p, [HERO_BEATS.statementIn, HERO_BEATS.statementSet], [-520, 0]);
  const stRotateX = useTransform(p, [HERO_BEATS.statementIn, HERO_BEATS.statementSet], [24, 0]);
  // Hand-off: "Next: How it works" settles in where the scroll cue sat at rest.
  const nextOpacity = useTransform(p, [0.78, 0.9], [0, 1]);
  const nextY = useTransform(p, [0.78, 0.9], [12, 0]);
  const [nextReady, setNextReady] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    const ready = v >= 0.84;
    if (ready !== nextReady) setNextReady(ready);
  });

  const onPricingClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    goToPricing();
  };

  return (
    <PointerParallaxProvider enabled={!reduce}>
    <section
      ref={hero.ref}
      aria-labelledby="hero-title"
      data-theme="dark"
      className="relative motion-safe:h-[150vh] motion-reduce:isolate motion-reduce:overflow-hidden"
    >
      {/* Reduced motion: the 3D stage is off, so the glass sits in a warm light field instead. */}
      <AmbientField variant={0} className="hidden motion-reduce:block" />

      <div className="relative motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
        {/* Tonal depth: key light behind the engine, calm plane behind the headline, vignette, bottom wash */}
        <HeroLight />
        {/* Phones: soft ink fade behind the copy so the 3D engine and threads never fight the headline */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: copyOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[74%] bg-gradient-to-t from-ink via-ink/90 to-transparent motion-reduce:hidden lg:hidden"
        />
        <div className="frame relative flex h-full flex-col pb-10 pt-8 motion-safe:justify-end motion-safe:lg:justify-center motion-safe:lg:pb-16">
          {/* Meta chips: what we do + live status */}
          <ParallaxLayer depth={4}>
          <motion.div
            // Always pass a style: dropping it (undefined) leaves Framer's last inline values behind, and the
            // reduce flag only turns true after mount, so the copy could stay stuck at opacity 0.
            style={{ opacity: reduce ? 1 : copyOpacity }}
            className="flex flex-wrap items-center gap-2.5"
          >
            <p className="chip-dark glass-flat shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgb(var(--bone)/0.08),0_10px_22px_-10px_rgb(var(--bone)/0.22)] hidden text-ash sm:inline-flex">{t.hero.eyebrow}</p>
            <p className="chip-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgb(var(--bone)/0.08),0_10px_22px_-10px_rgb(var(--bone)/0.22)] text-bone">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
              </span>
              {t.hero.status}
            </p>
          </motion.div>
          </ParallaxLayer>

          {/* Headline — mounts with a masked reveal, then shears apart in 3D on scroll */}
          <ParallaxLayer depth={8}>
          <div className="[perspective:900px]">
            <h1
              ref={headline}
              id="hero-title"
              className="mt-6 font-display text-display-xl text-bone [transform-style:preserve-3d] max-sm:text-[clamp(2.25rem,10.4vw,3rem)] lg:mt-9 lg:w-8/12 lg:text-[clamp(2.75rem,6.6vw,8rem)]"
            >
              {t.hero.headline.map((line, i) => (
                <HeadlineLine key={i} index={i} progress={p} reduce={reduce} emphasis={t.hero.headlineEmphasis}>
                  {line}
                </HeadlineLine>
              ))}
            </h1>
          </div>
          </ParallaxLayer>

          <motion.div
            style={reduce ? { opacity: 1, y: 0, pointerEvents: "auto" } : { opacity: copyOpacity, y: copyY, pointerEvents: copyPointer }}
            inert={!reduce && copyHidden}
            className="mt-7 lg:mt-9 lg:w-5/12"
          >
            <motion.p
              className="max-w-md text-pretty text-base leading-relaxed text-ash sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.45 }}
            >
              {t.hero.sub}
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.6 }}
            >
              <MagneticButton href="#pricing" onClick={onPricingClick} className="btn-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgb(var(--bone)/0.08),0_12px_24px_-10px_rgb(var(--bone)/0.28)]">
                {t.common.seePricing}
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
              </MagneticButton>
              <a href="#included" className="link-quiet group">
                {t.hero.secondaryCta}
                <ArrowDown
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.75}
                  className="transition-transform duration-300 ease-editorial group-hover:translate-y-0.5"
                />
              </a>
            </motion.div>
          </motion.div>

          {/* Static stand-in for the 3D engine when motion is reduced */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset("/media/hero-v2-poster.jpg")}
            alt=""
            className="mt-10 hidden aspect-[16/9] w-full rounded-glass-lg object-cover shadow-[0_30px_70px_-30px_rgb(var(--shadow)/0.35)] ring-1 ring-bone/[0.21] motion-reduce:block"
          />
        </div>

        {/* Booking-flow card (desktop): floats over the engine, fades out with the copy */}
        <div
          className="pointer-events-none absolute bottom-16 right-6 hidden w-[21rem] motion-reduce:hidden lg:block lg:right-10 xl:bottom-20 xl:w-[23rem]"
          inert={!reduce && copyHidden}
        >
          <ParallaxLayer depth={14}>
            <HeroFlowCard opacity={reduce ? undefined : copyOpacity} />
          </ParallaxLayer>
        </div>

        {/* Figure caption for the live engine (wide desktop) */}
        <motion.p
          aria-hidden="true"
          style={{ opacity: copyOpacity }}
          className="eyebrow absolute bottom-8 right-6 hidden text-ash motion-reduce:hidden 2xl:block lg:right-10"
        >
          {t.hero.figure}
        </motion.p>

        {/* Scroll cue (desktop: on phones the stacked CTAs already sit at the bottom edge) */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: hintOpacity }}
          className="eyebrow absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 text-ash motion-safe:lg:flex"
        >
          {t.hero.scrollHint}
          <span className="relative block h-10 w-[3px] overflow-hidden rounded-full bg-bone/[0.21]">
            <span className="absolute inset-x-0 top-0 block h-1/2 animate-scroll-cue rounded-full bg-aqua" />
          </span>
        </motion.div>

        {/* Statement — emerges from depth as the headline leaves, then rests: it's the last beat */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center [perspective:900px] motion-safe:flex">
          {/* Reading wash: the page ground (ink token: sky in light, navy in dark) pooled behind the statement, so the
              sculpture's ring and beams never cut through the final line. Fades in with the statement; opacity only. */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: stOpacity }}
            className="absolute left-1/2 top-1/2 h-[46%] w-[min(92vw,68rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(var(--ink)/0.82),rgb(var(--ink)/0.5)_55%,transparent)]"
          />
          <motion.p
            style={{ opacity: stOpacity, z: stZ, rotateX: stRotateX }}
            className="frame text-center font-display text-display-lg text-bone text-balance"
          >
            {t.hero.statement[0]}
            <br />
            <em className="font-serif font-normal italic tracking-[-0.01em] text-aqua">{t.hero.statement[1]}</em>
          </motion.p>
        </div>

        {/* Hand-off: where the scroll cue sat at rest, the next chapter waits. TabsContext turns #included into a tab swap. */}
        <motion.div
          style={{ opacity: nextOpacity, y: nextY }}
          inert={!nextReady}
          className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] pointer-events-none hidden flex-col items-center justify-center gap-3 motion-safe:flex sm:flex-row sm:gap-8 lg:bottom-10"
        >
          <MagneticButton href="#pricing" onClick={onPricingClick} className="btn-aqua pointer-events-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_1px_3px_rgb(var(--bone)/0.08),0_12px_24px_-10px_rgb(var(--bone)/0.28)]">
            {t.common.seePricing}
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
          </MagneticButton>
          <a href="#included" className="group pointer-events-auto flex min-h-[44px] flex-col items-center gap-1.5 px-4 py-1 text-center">
            {/* Light sky: `muted` keeps the 13px eyebrow clear of AA (ash measured 4.53:1 at worst); dark keeps ash. */}
            <span className="eyebrow text-muted dark:text-ash">
              {t.hero.next}
              <span className="sr-only">: </span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-bone underline decoration-bone/40 decoration-1 underline-offset-[4px] transition-[text-decoration-color] duration-base ease-editorial group-hover:decoration-aqua/90 group-focus-visible:decoration-aqua/90">
              {t.included.eyebrow}
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} className="transition-transform duration-base ease-editorial group-hover:translate-x-0.5" />
            </span>
          </a>
        </motion.div>
      </div>
    </section>
    </PointerParallaxProvider>
  );
}

function HeadlineLine({
  children,
  index,
  progress,
  reduce,
  emphasis,
}: {
  children: string;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean;
  emphasis: string;
}) {
  const path = LINE_PATHS[index] ?? LINE_PATHS[0];
  // Lines finish 0.03 apart; the last line (index 2) ends exactly at HERO_BEATS.divePeak.
  const range = [HERO_BEATS.shearStart + index * 0.03, HERO_BEATS.divePeak - 0.06 + index * 0.03];
  const x = useTransform(progress, range, ["0%", path.x]);
  const z = useTransform(progress, range, [0, path.z]);
  const rotateX = useTransform(progress, range, [0, path.rx]);
  const rotateY = useTransform(progress, range, [0, path.ry]);
  const opacity = useTransform(progress, [range[0] + 0.16, range[1] - 0.03], [1, 0]);

  const indent = ["", "pl-[8%] lg:pl-[14%]", "pl-[2%] lg:pl-[5%]"][index] ?? "";
  const parts = children.includes(emphasis) ? children.split(emphasis) : null;

  return (
    <motion.span
      className={`block overflow-hidden pb-[0.1em] ${indent}`}
      style={reduce ? { x: "0%", z: 0, rotateX: 0, rotateY: 0, opacity: 1 } : { x, z, rotateX, rotateY, opacity }}
    >
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
    </motion.span>
  );
}
