"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useDemoStill } from "../useDemoStill";

/**
 * A hairline under the demo's sticky header that fills with page progress.
 * Decorative (aria-hidden). Place it inside the sticky <header> as its last
 * child; it sits on the header's bottom edge. Still: not rendered.
 */
export function ScrollProgress({ className = "bg-current" }: { className?: string }) {
  const still = useDemoStill();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  if (still) return null;
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-[-1px] h-[2px] origin-left ${className}`}
      style={{ scaleX }}
    />
  );
}
