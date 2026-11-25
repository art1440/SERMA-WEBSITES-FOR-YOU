"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";

/**
 * The full-width hero photo every demo opens on: a landscape picture behind
 * the headline. Put it as the first child of a `relative isolate overflow-hidden`
 * hero section; it fills the section (absolute, inset 0) and sits under the
 * content (-z-10), so the section's own markup (h1, CTAs) stays in normal flow.
 *
 * Sharpness: srcSet carries the 640 / 1600 / 2560 px files (heroImage), and
 * sizes describes the drawn width honestly (100vw on landscape screens, about
 * 100vh x the photo's ratio on portrait ones, where cover crops it), so every
 * screen gets a file at least as wide as it is drawn.
 * It is the page's LCP image: eager, fetchPriority high, never faded in.
 *
 * Motion (editorial, restrained):
 *   - on load the photo settles from a 6% zoom over 2.4 s;
 *   - while the hero scrolls away the photo drifts down `parallax` % of the
 *     hero's height (it moves slower than the type: depth), on a plane that
 *     is taller than the frame so no edge ever shows.
 * Still (reduced motion / Pause / capture): the photo at rest, no drift.
 *
 *   position        object-position from 640 px up, e.g. "50% 40%"
 *   mobilePosition  object-position below 640 px (a landscape photo is cropped
 *                   hard on a portrait phone: aim it at the subject)
 *   scrimClassName  legibility shading ONLY where the type sits, e.g.
 *                   "bg-gradient-to-r from-black/75 via-black/35 to-transparent".
 *                   Never a flat full-frame wash. Several layers allowed via
 *                   `scrims` (each a className).
 *   children        optional foreground planes drawn above the photo and scrim
 *                   (keep them decorative and few)
 */
type Props = {
  image: DemoImage;
  alt: string;
  position?: string;
  mobilePosition?: string;
  scrims?: string[];
  parallax?: number;
  className?: string;
  imgClassName?: string;
  children?: ReactNode;
};

const SETTLE = [0.22, 1, 0.36, 1] as const;

export function HeroBackdrop({
  image,
  alt,
  position = "50% 50%",
  mobilePosition,
  scrims = [],
  parallax = 12,
  className = "",
  imgClassName = "",
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useDemoStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${parallax}%`]);

  const srcSet = [`${image.small} 640w`, `${image.src} ${image.width}w`, image.large ? `${image.large} 2560w` : null]
    .filter(Boolean)
    .join(", ");
  // object-fit: cover. When the screen is proportionally narrower than the photo (any portrait
  // phone), the photo is drawn height-bound, about 100vh x its aspect ratio wide, not 100vw:
  // say so, or the browser picks a file several times too small and the hero looks soft.
  const ratio = image.width / image.height;
  const sizes = `(max-aspect-ratio: ${image.width}/${image.height}) calc(100vh * ${ratio.toFixed(3)}), 100vw`;
  const posStyle = { "--hero-pos": position, "--hero-pos-m": mobilePosition ?? position } as CSSProperties;
  const imgCls = `absolute inset-0 h-full w-full object-cover [object-position:var(--hero-pos-m)] sm:[object-position:var(--hero-pos)] ${imgClassName}`;
  const imgProps = {
    src: image.src,
    srcSet,
    sizes,
    width: image.width,
    height: image.height,
    alt,
    loading: "eager" as const,
    fetchPriority: "high" as const,
    decoding: "async" as const,
  };

  return (
    <div ref={ref} data-hero-photo className={`absolute inset-0 -z-10 overflow-hidden ${className}`} style={posStyle}>
      {still ? (
        <img {...imgProps} className={imgCls} />
      ) : (
        <motion.div className="absolute inset-x-0 top-0 will-change-transform" style={{ y, bottom: `-${parallax}%` }}>
          <motion.img
            {...imgProps}
            className={imgCls}
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: SETTLE }}
          />
        </motion.div>
      )}
      {scrims.map((s, i) => (
        <div key={i} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${s}`} />
      ))}
      {children}
    </div>
  );
}
