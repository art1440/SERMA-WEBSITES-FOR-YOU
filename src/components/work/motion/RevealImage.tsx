"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";

/**
 * The editorial image entrance: the frame wipes open (clip-path) while the
 * photo inside settles from a slight zoom, then drifts against the scroll for
 * depth. One gesture, transform + clip-path only.
 *
 *   from     which edge the wipe opens from ("center" opens from the middle out)
 *   parallax drift of the photo inside its frame, in % of the frame (0 = none)
 *   fill     the frame is sized by className (absolute / h-full) instead of the
 *            photo's own aspect ratio
 *
 * Still (reduced motion / Pause): a plain, fully visible photo, no drift.
 */

type From = "bottom" | "top" | "left" | "right" | "center";

const HIDDEN: Record<From, string> = {
  bottom: "inset(100% 0% 0% 0%)",
  top: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  center: "inset(50% 50% 50% 50%)",
};
const SHOWN = "inset(0% 0% 0% 0%)";
const EASE = [0.76, 0, 0.24, 1] as const; // in-out for the wipe: it reads as a curtain, not a fade
const SETTLE = [0.22, 1, 0.36, 1] as const;

type Props = {
  image: DemoImage;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  style?: CSSProperties;
  from?: From;
  parallax?: number;
  fill?: boolean;
  priority?: boolean;
  delay?: number;
  /** Starting zoom of the photo inside the wipe. */
  zoom?: number;
};

export function RevealImage({
  image,
  alt,
  sizes,
  className = "",
  imgClassName = "",
  style,
  from = "bottom",
  parallax = 6,
  fill = false,
  priority = false,
  delay = 0,
  zoom = 1.22,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useDemoStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${-parallax}%`, `${parallax}%`]);

  const frameStyle: CSSProperties = fill ? { ...style } : { aspectRatio: `${image.width} / ${image.height}`, ...style };
  const img = (
    <img
      src={image.src}
      srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
    />
  );

  if (still) {
    return (
      <div ref={ref} className={`relative overflow-hidden ${className}`} style={frameStyle}>
        {img}
      </div>
    );
  }

  const wipe: Variants = {
    hidden: { clipPath: HIDDEN[from] },
    shown: { clipPath: SHOWN, transition: { duration: 1.15, ease: EASE, delay } },
  };
  const settle: Variants = {
    hidden: { scale: zoom },
    shown: { scale: 1, transition: { duration: 1.7, ease: SETTLE, delay } },
  };
  // The parallax layer is taller than the frame by 2x the drift, so no edge ever shows.
  const bleed = parallax > 0 ? { top: `${-parallax}%`, bottom: `${-parallax}%` } : { top: 0, bottom: 0 };

  // The in-view trigger lives on the un-clipped frame: Chrome's IntersectionObserver
  // sees a target clipped to nothing (inset 100%) as never intersecting.
  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={frameStyle}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div className="absolute inset-0" variants={wipe}>
        <motion.div className="absolute inset-x-0 will-change-transform" style={{ ...bleed, y: parallax > 0 ? y : 0 }}>
          <motion.div className="absolute inset-0" variants={settle}>
            {img}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
