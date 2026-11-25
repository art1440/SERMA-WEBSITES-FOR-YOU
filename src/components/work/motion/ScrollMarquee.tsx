"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useDemoStill } from "../useDemoStill";

/**
 * A row that slides sideways only while the page scrolls: it never moves on
 * its own, so it needs no pause control (WCAG 2.2.2) and costs nothing at rest.
 * The row is repeated so it never shows an empty end; repeats are aria-hidden
 * (copies are separated by the same gap as the items, so the seam is invisible).
 * Give children their own semantics (figures with alt, plain text).
 * `skew` leans it a few degrees with scroll speed (good for type, use sparingly
 * on photos). Reverse direction with `direction={-1}` to counter-run two rows.
 *
 * The wrapper clips horizontally, so the page never gains a sideways scrollbar.
 * Still: one static row (the first copy), cropped by the wrapper.
 */
type Props = {
  children: ReactNode;
  /** How far the row travels while it crosses the viewport, in % of the whole (tripled) row. Keep it <= 40. */
  distance?: number;
  direction?: 1 | -1;
  skew?: boolean;
  className?: string;
  rowClassName?: string;
};

export function ScrollMarquee({ children, distance = 35, direction = 1, skew = false, className = "", rowClassName = "gap-4" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useDemoStill();
  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], direction === 1 ? [`${-distance}%`, "0%"] : ["0%", `${-distance}%`]);
  const velocity = useVelocity(scrollY);
  const lean = useSpring(useTransform(velocity, [-2500, 0, 2500], [6, 0, -6], { clamp: true }), { stiffness: 260, damping: 40 });

  const copy = (hidden: boolean) => (
    <div className={`flex shrink-0 items-center ${rowClassName}`} aria-hidden={hidden || undefined}>
      {children}
    </div>
  );

  if (still) {
    return (
      <div ref={ref} className={`overflow-hidden ${className}`}>
        <div className="flex w-max">{copy(false)}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div className={`flex w-max will-change-transform ${rowClassName}`} style={{ x, skewX: skew ? lean : 0 }}>
        {copy(false)}
        {copy(true)}
        {copy(true)}
      </motion.div>
    </div>
  );
}
