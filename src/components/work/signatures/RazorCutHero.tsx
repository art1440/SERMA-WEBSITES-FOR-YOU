"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { EASE_EDITORIAL } from "@/lib/motion";
import { useDemoStill } from "../useDemoStill";

/**
 * Ironside's signature: a text-led hero whose headline is "cut" by a razor.
 *
 * - One real <h1> (visually hidden) carries the headline for every reader.
 *   What you see is two aria-hidden copies of it, stacked in one grid cell and
 *   clipped (static clip-path) to either side of a line through the block's
 *   centre at -6deg.
 * - On load a 2px brass line draws along that cut (scaleX 0 -> 1, 0.7s).
 * - Scroll-linked over the hero (offset start start -> end start): from
 *   progress 0 to 0.6 the top half slides up-left (x -4%, y -18%), the bottom
 *   half down-right (x 4%, y 18%), both fading to 0.25. Motion values only:
 *   no React render per frame; transform and opacity only.
 *   Once the hero is fully out of view the halves get visibility:hidden, so
 *   no faded (low-contrast) copy lingers in the page.
 * - The line ends ~1% of the block's width past the headline's longest line
 *   (measured with a ResizeObserver, so font swap and wrapping are covered;
 *   it re-measures on resize only, never per frame).
 * - Reduced motion or Pause: line fully drawn, halves at rest, data-state="rest".
 *
 * The slope of the clip is written in container-query units: the cut drops
 * tan(6deg) * width across the block, i.e. +/-5.255cqw either side of centre
 * (5.78cqw at the -5% / 105% overhang points used so overhanging glyphs are
 * not trimmed at the sides).
 */

const TOP_CLIP = "polygon(-5% -60%, 105% -60%, 105% calc(50% - 5.78cqw), -5% calc(50% + 5.78cqw))";
const BOTTOM_CLIP = "polygon(-5% calc(50% + 5.78cqw), 105% calc(50% - 5.78cqw), 105% 160%, -5% 160%)";

type Props = {
  /** The headline, as its two lines. */
  lines: [string, string];
  /** Rendered above the headline (inside the hero). */
  before?: ReactNode;
  /** Rendered below the headline (inside the hero). */
  after?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Class for the headline type (font, size, leading). */
  headlineClassName?: string;
};

export function RazorCutHero({ lines, before, after, className, style, headlineClassName }: Props) {
  const ref = useRef<HTMLElement>(null);
  const still = useDemoStill();
  const [drawn, setDrawn] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const topX = useTransform(scrollYProgress, [0, 0.6], ["0%", "-4%"]);
  const topY = useTransform(scrollYProgress, [0, 0.6], ["0%", "-18%"]);
  const botX = useTransform(scrollYProgress, [0, 0.6], ["0%", "4%"]);
  const botY = useTransform(scrollYProgress, [0, 0.6], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0.25]);

  // Once the hero has fully left the viewport the faded halves are hidden
  // outright (direct DOM write on a threshold crossing, not a React render).
  const halvesRef = useRef<HTMLDivElement>(null);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const el = halvesRef.current;
    if (!el) return;
    const v = !still && p >= 0.999 ? "hidden" : "";
    if (el.style.visibility !== v) el.style.visibility = v;
  });

  // Trim the drawn line so it stops just past the headline's right edge.
  // The rotated track spans 104% of the block centred on it, so it starts at
  // x0 = 0.5 - 0.52cos6 (of W) and covers 1.04cos6 W horizontally.
  const wrapRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [lineFrac, setLineFrac] = useState(1);
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const copyEl = measureRef.current;
    if (!wrap || !copyEl) return;
    const COS6 = Math.cos((6 * Math.PI) / 180);
    const measure = () => {
      const W = wrap.clientWidth;
      if (!W) return;
      const left = copyEl.getBoundingClientRect().left;
      // Text line boxes (not element boxes): a wrapped line's span is as wide as the block.
      const range = document.createRange();
      let right = 0;
      for (const span of copyEl.children) {
        if (!span.firstChild) continue;
        range.selectNodeContents(span.firstChild);
        for (const r of range.getClientRects()) right = Math.max(right, r.right - left);
      }
      const x0 = (0.5 - 0.52 * COS6) * W;
      const f = (right + 0.01 * W - x0) / (1.04 * COS6 * W);
      setLineFrac(Math.min(1, Math.max(0.2, f)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    ro.observe(copyEl);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => ro.disconnect();
  }, [lines]);

  const rest = { x: 0, y: 0, opacity: 1 };
  const topStyle = still ? rest : { x: topX, y: topY, opacity: fade };
  const botStyle = still ? rest : { x: botX, y: botY, opacity: fade };

  const copy = (
    <>
      <span className="block">{lines[0]}</span>
      <span className="block">{lines[1]}</span>
    </>
  );

  return (
    <section
      ref={ref}
      data-signature="barbershop"
      data-state={still || drawn ? "rest" : "drawing"}
      className={className}
      style={style}
    >
      {before}
      <div ref={wrapRef} className="relative [container-type:inline-size]">
        <h1 className="sr-only">{`${lines[0]} ${lines[1]}`}</h1>
        <div ref={halvesRef} aria-hidden="true" className={`grid ${headlineClassName ?? ""}`}>
          <motion.div ref={measureRef} className="[grid-area:1/1] will-change-transform" style={{ clipPath: TOP_CLIP, ...topStyle }}>
            {copy}
          </motion.div>
          <motion.div className="[grid-area:1/1] will-change-transform" style={{ clipPath: BOTTOM_CLIP, ...botStyle }}>
            {copy}
          </motion.div>
        </div>
        {/* The cut: rotated wrapper (static), inner line draws along it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-2%] top-1/2 h-[2px] w-[104%] -translate-y-1/2 -rotate-6"
        >
          <motion.div
            key={still ? "still" : "draw"}
            className="h-full origin-left bg-[#C9A45C]"
            style={{ width: `${lineFrac * 100}%` }}
            initial={still ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.2 }}
            onAnimationComplete={() => setDrawn(true)}
          />
        </div>
      </div>
      {after}
    </section>
  );
}
