"use client";

import { motion, useScroll, useTransform, type MotionStyle } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useDemoStill } from "../useDemoStill";

/**
 * A depth plane. Its content travels `distance` px against (positive) or with
 * (negative) the page while it crosses the viewport, so stacked planes at
 * different distances separate into foreground / midground / background.
 * Optional `rotate` (deg over the crossing) and `scale` ([from, to]).
 * Transform only. Still: content sits at rest.
 */
type Props = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  distance?: number;
  x?: number;
  rotate?: number;
  scale?: [number, number];
  as?: "div" | "figure";
};

export function Parallax({ children, className, innerClassName, distance = 80, x = 0, rotate = 0, scale, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useDemoStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Framer keeps a transform's range from the first render, so the ranges are
  // read from a ref: a distance that changes with a breakpoint applies at once.
  const cfg = useRef({ distance, x, rotate, scale });
  cfg.current = { distance, x, rotate, scale };
  const ty = useTransform(scrollYProgress, (p) => cfg.current.distance * (1 - 2 * p));
  const tx = useTransform(scrollYProgress, (p) => cfg.current.x * (1 - 2 * p));
  const rot = useTransform(scrollYProgress, (p) => (cfg.current.rotate / 2) * (2 * p - 1));
  const sc = useTransform(scrollYProgress, (p) => {
    const [a, b] = cfg.current.scale ?? [1, 1];
    return a + (b - a) * p;
  });

  const Tag = as;
  if (still) {
    return (
      <Tag ref={ref} className={className}>
        <div className={innerClassName}>{children}</div>
      </Tag>
    );
  }
  const style: MotionStyle = { y: ty };
  if (x) style.x = tx;
  if (rotate) style.rotate = rot;
  if (scale) style.scale = sc;
  return (
    <Tag ref={ref} className={className}>
      <motion.div className={`will-change-transform ${innerClassName ?? ""}`} style={style}>
        {children}
      </motion.div>
    </Tag>
  );
}
