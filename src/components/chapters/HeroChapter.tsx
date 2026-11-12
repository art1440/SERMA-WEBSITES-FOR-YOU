"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { HeroFlowCard } from "@/components/ui/HeroFlowCard";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToDemo } from "@/lib/scroll";
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

  const copyOpacity = useTransform(p, [0.03, 0.18], [1, 0]);
  const copyY = useTransform(p, [0.03, 0.2], [0, -60]);
  const copyPointer = useTransform(p, (v) => (v > 0.12 ? "none" : "auto"));
  // Once the copy has faded away, take its buttons out of the Tab order (state flips only at the threshold).
  const [copyHidden, setCopyHidden] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    const hidden = v > 0.12;
    if (hidden !== copyHidden) setCopyHidden(hidden);
  });
  const hintOpacity = useTransform(p, [0, 0.05], [1, 0]);

  const stOpacity = useTransform(p, [0.5, 0.6, 0.84, 0.95], [0, 1, 1, 0]);
  const stZ = useTransform(p, [0.5, 0.62, 0.84, 0.97], [-520, 0, 0, 420]);
  const stRotateX = useTransform(p, [0.5, 0.62], [24, 0]);

  const onDemoClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    goToDemo();
  };

  return (
    <section
      ref={hero.ref}
      aria-labelledby="hero-title"
      data-theme="dark"
      className="relative motion-safe:h-[180vh] motion-reduce:isolate motion-reduce:overflow-hidden"
    >
      {/* Reduced motion: the 3D stage is off, so the glass sits in a warm light field instead. */}
      <AmbientField variant={0} className="hidden motion-reduce:block" />

      <div className="relative motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
        {/* Phones: soft ink fade behind the copy so the 3D engine and threads never fight the headline */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: copyOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[74%] bg-gradient-to-t from-ink via-ink/90 to-transparent motion-reduce:hidden lg:hidden"
        />
        <div className="frame relative flex h-full flex-col pb-10 pt-8 motion-safe:justify-end motion-safe:lg:justify-center motion-safe:lg:pb-16">
          {/* Meta chips: what we do + live status */}
          <motion.div
            style={reduce ? undefined : { opacity: copyOpacity }}
            className="flex flex-wrap items-center gap-2.5"
          >
            <p className="chip-dark glass-flat hidden text-ash sm:inline-flex">{t.hero.eyebrow}</p>
            <p className="chip-dark text-bone">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#8FBFA3]" />
              </span>
              {t.hero.status}
            </p>
          </motion.div>

          {/* Headline — mounts with a masked reveal, then shears apart in 3D on scroll */}
          <div className="[perspective:900px]">
            <h1
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

          <motion.div
            style={reduce ? undefined : { opacity: copyOpacity, y: copyY, pointerEvents: copyPointer }}
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
              <MagneticButton href="#demo" onClick={onDemoClick} className="btn-aqua">
                {t.common.bookDemo}
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
              </MagneticButton>
              <a href="#dashboard" className="link-quiet group">
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
            className="mt-10 hidden aspect-[16/9] w-full rounded-glass-lg object-cover shadow-[0_30px_70px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15 motion-reduce:block"
          />
        </div>

        {/* Booking-flow card (desktop): floats over the engine, fades out with the copy */}
        <div
          className="pointer-events-none absolute bottom-16 right-6 hidden w-[21rem] motion-reduce:hidden lg:block lg:right-10 xl:bottom-20 xl:w-[23rem]"
          inert={!reduce && copyHidden}
        >
          <HeroFlowCard opacity={reduce ? undefined : copyOpacity} />
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
          <span className="relative block h-10 w-[3px] overflow-hidden rounded-full bg-white/15">
            <span className="absolute inset-x-0 top-0 block h-1/2 animate-scroll-cue rounded-full bg-aqua" />
          </span>
        </motion.div>

        {/* Statement — emerges from depth over the film, then flies past the camera */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center [perspective:900px] motion-safe:flex">
          <motion.p
            style={{ opacity: stOpacity, z: stZ, rotateX: stRotateX }}
            className="frame text-center font-display text-display-lg text-bone text-balance"
          >
            {t.hero.statement[0]}
            <br />
            <em className="font-serif font-normal italic tracking-[-0.01em] text-aqua">{t.hero.statement[1]}</em>
          </motion.p>
        </div>
      </div>
    </section>
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
  const range = [0.05 + index * 0.02, 0.38 + index * 0.02];
  const x = useTransform(progress, range, ["0%", path.x]);
  const z = useTransform(progress, range, [0, path.z]);
  const rotateX = useTransform(progress, range, [0, path.rx]);
  const rotateY = useTransform(progress, range, [0, path.ry]);
  const opacity = useTransform(progress, [range[0] + 0.1, range[1] - 0.02], [1, 0]);

  const indent = ["", "pl-[8%] lg:pl-[14%]", "pl-[2%] lg:pl-[5%]"][index] ?? "";
  const parts = children.includes(emphasis) ? children.split(emphasis) : null;

  return (
    <motion.span
      className={`block overflow-hidden pb-[0.1em] ${indent}`}
      style={reduce ? undefined : { x, z, rotateX, rotateY, opacity }}
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
            <em className="mr-[-0.12em] bg-gradient-to-r from-aqua-glow to-aqua bg-clip-text pr-[0.12em] font-serif font-normal italic tracking-[-0.01em] text-transparent [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
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
