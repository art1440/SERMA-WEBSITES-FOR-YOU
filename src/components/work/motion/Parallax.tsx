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
  const ty = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const tx = useTransform(scrollYProgress, [0, 1], [x, -x]);
  const rot = useTransform(scrollYProgress, [0, 1], [-rotate / 2, rotate / 2]);
  const sc = useTransform(scrollYProgress, [0, 1], scale ?? [1, 1]);

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
