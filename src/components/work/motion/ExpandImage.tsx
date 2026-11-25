"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";
import { useIsDesktop } from "./hooks";

/**
 * The page's big breath: a framed photo that opens out to full bleed as you
 * scroll, while the photo inside eases back from a zoom. The stage pins for
 * the length of the move (a little less on phones), then the overlay content
 * rises in over a local scrim and the pin releases.
 *
 *   inset    starting frame, % from each edge [top/bottom, left/right]
 *   radius   starting corner radius (px); it opens to 0
 *   children overlay content shown once the photo is open (keep it short and
 *            non-interactive: it is transparent until the photo has opened)
 *
 * Still: the photo at full bleed with the overlay on it, nothing pinned.
 */
type Props = {
  image: DemoImage;
  alt: string;
  children?: ReactNode;
  /** CSS length the stage pins below, e.g. "calc(var(--demo-ribbon) + 64px)". */
  top: string;
  inset?: [number, number];
  radius?: number;
  className?: string;
  imgClassName?: string;
  /** Classes for the overlay layer (position the content inside it). */
  overlayClassName?: string;
  /** Scrim behind the overlay copy, e.g. "bg-gradient-to-t from-black/70 to-transparent". */
  scrimClassName?: string;
};

export function ExpandImage({
  image,
  alt,
  children,
  top,
  inset = [12, 18],
  radius = 28,
  className = "",
  imgClassName = "",
  overlayClassName = "flex items-end p-6 sm:p-10 lg:p-14",
  scrimClassName = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useDemoStill();
  const desktop = useIsDesktop();
  const [iy, ix] = desktop ? inset : [inset[0] * 0.6, Math.min(inset[1], 6)];
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.7],
    [`inset(${iy}% ${ix}% ${iy}% ${ix}% round ${radius}px)`, "inset(0% 0% 0% 0% round 0px)"],
  );
  const scale = useTransform(scrollYProgress, [0, 0.8], [1.28, 1]);
  const contentY = useTransform(scrollYProgress, [0.55, 0.85], [48, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0.55, 0.8], [0, 1]);

  const img = (
    <img
      src={image.src}
      srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
      sizes="100vw"
      width={image.width}
      height={image.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
    />
  );

  if (still) {
    return (
      <div ref={ref} className={`relative h-[min(86svh,860px)] min-h-[480px] overflow-hidden ${className}`}>
        {img}
        {children && (
          <>
            <div aria-hidden="true" className={`absolute inset-0 ${scrimClassName}`} />
            <div className={`absolute inset-0 ${overlayClassName}`}>{children}</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`} style={{ height: desktop ? "230svh" : "170svh" }}>
      <div className="sticky overflow-hidden" style={{ top, height: `calc(100svh - ${top})` }}>
        <motion.div className="absolute inset-0 will-change-[clip-path]" style={{ clipPath }}>
          <motion.div className="absolute inset-0 will-change-transform" style={{ scale }}>
            {img}
          </motion.div>
          {children && <motion.div aria-hidden="true" className={`absolute inset-0 ${scrimClassName}`} style={{ opacity: contentOpacity }} />}
        </motion.div>
        {children && (
          <motion.div className={`absolute inset-0 ${overlayClassName}`} style={{ y: contentY, opacity: contentOpacity }}>
            {children}
          </motion.div>
        )}
      </div>
    </div>
  );
}
