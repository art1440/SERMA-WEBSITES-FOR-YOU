"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { EASE_EDITORIAL } from "@/lib/motion";
import { useDemoStill } from "../useDemoStill";

/**
 * Ironside's signature: a text-led hero whose headline is "cut" by a razor.
 *
 * - One real <h1> (visually hidden) carries the headline for every reader.
 *   What you see is two aria-hidden copies of it, stacked in one grid cell and
 *   clipped (static clip-path) to either side of a line through the block's
 *   centre at -6deg.
 * - On load a 2px brass line draws along that cut (scaleX 0 -> 1, 0.7s). It
 *   enters just left of the headline and runs on to the hero's right edge, so
 *   it slices across whatever sits behind the type (the hero photo); the hero
 *   section clips it (give it overflow-hidden).
 * - Scroll-linked over the hero (offset start start -> end start): from
 *   progress 0 to 0.6 the top half slides up-left (x -4%, y -18%), the bottom
 *   half down-right (x 4%, y 18%), both fading to 0.25. Motion values only:
 *   no React render per frame; transform and opacity only.
 *   Once the hero is fully out of view the halves get visibility:hidden, so
 *   no faded (low-contrast) copy lingers in the page.
 * - Reduced motion or Pause: line fully drawn, halves at rest, data-state="rest".
 *
 * The slope of the clip is written in container-query units: the cut drops
 * tan(6deg) * width across the block, i.e. +/-5.255cqw either side of centre
 * (5.78cqw at the -5% / 105% overhang points used so overhanging glyphs are
 * not trimmed at the sides). The line's track is in the same units: it starts
 * at -2cqw and turns about the block's centre (52cqw along the track), so it
 * lies exactly on the cut; its length (to the centre, then 50vw + 4rem on to
 * the right) always reaches past the hero's right edge.
 */

const TOP_CLIP = "polygon(-5% -60%, 105% -60%, 105% calc(50% - 5.78cqw), -5% calc(50% + 5.78cqw))";
const BOTTOM_CLIP = "polygon(-5% calc(50% + 5.78cqw), 105% calc(50% - 5.78cqw), 105% 160%, -5% 160%)";
const TRACK: CSSProperties = {
  left: "-2cqw",
  width: "calc(52cqw + 50vw + 4rem)",
  transformOrigin: "52cqw 50%",
};

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
      <div className="relative [container-type:inline-size]">
        <h1 className="sr-only">{`${lines[0]} ${lines[1]}`}</h1>
        <div ref={halvesRef} aria-hidden="true" className={`grid ${headlineClassName ?? ""}`}>
          <motion.div className="[grid-area:1/1] will-change-transform" style={{ clipPath: TOP_CLIP, ...topStyle }}>
            {copy}
          </motion.div>
          <motion.div className="[grid-area:1/1] will-change-transform" style={{ clipPath: BOTTOM_CLIP, ...botStyle }}>
            {copy}
          </motion.div>
        </div>
        {/* The cut: rotated track (static) through the block's centre; the line draws along it. */}
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 h-[2px] -translate-y-1/2 -rotate-6" style={TRACK}>
          <motion.div
            key={still ? "still" : "draw"}
            className="h-full w-full origin-left bg-[#C9A45C]"
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
