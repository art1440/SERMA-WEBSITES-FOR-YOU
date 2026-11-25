"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useDemoStill } from "../useDemoStill";
import { useIsDesktop } from "./hooks";

/**
 * Pinned horizontal travel. Desktop: the section pins below the header and the
 * vertical scroll walks the track sideways (exactly as far as it is wider than
 * the screen, so the last card lands flush right before the pin releases).
 *
 * Phones, tablets and still mode: a native horizontal scroller with snap
 * points; it is keyboard-focusable and named (axe: scrollable-region-focusable).
 *
 * `children` are the cards, laid out in a row (give each a width and
 * `shrink-0`). `lead` is optional content pinned at the start of the row.
 */
type Props = {
  children: ReactNode;
  lead?: ReactNode;
  /** Accessible name for the scroller on phones. */
  label: string;
  /** CSS length the stage pins below, e.g. "calc(var(--demo-ribbon) + 64px)". */
  top: string;
  className?: string;
  trackClassName?: string;
  /** Horizontal padding of the track, e.g. "px-4 sm:px-8 lg:px-12". */
  gutterClassName?: string;
};

export function HorizontalGallery({ children, lead, label, top, className = "", trackClassName = "gap-6", gutterClassName = "px-4 sm:px-8 lg:px-12" }: Props) {
  const still = useDemoStill();
  const desktop = useIsDesktop();
  const pinned = desktop && !still;
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  useLayoutEffect(() => {
    if (!pinned) return;
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setTravel(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // Lenis already weights the wheel; a second spring here would only add lag.
  const x = useTransform(scrollYProgress, (p) => -p * travel);

  if (!pinned) {
    return (
      <div ref={sectionRef} className={className}>
        <div
          role="region"
          aria-label={label}
          tabIndex={0}
          className={`flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:thin] ${gutterClassName} ${trackClassName} scroll-px-4 sm:scroll-px-8 focus-visible:outline-offset-[-2px]`}
        >
          {lead && <div className="w-[82vw] max-w-[420px] shrink-0 snap-start sm:w-[60vw]">{lead}</div>}
          {Array.isArray(children)
            ? children.map((c, i) => (
                <div key={i} className="shrink-0 snap-start">
                  {c}
                </div>
              ))
            : children}
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className={`relative ${className}`} style={{ height: `calc(100svh - ${top} + ${travel}px)` }}>
      <div className="sticky flex items-center overflow-hidden" style={{ top, height: `calc(100svh - ${top})` }}>
        <motion.div ref={trackRef} className={`flex w-max items-center will-change-transform ${gutterClassName} ${trackClassName}`} style={{ x }}>
          {lead && <div className="w-[min(36vw,520px)] shrink-0">{lead}</div>}
          {children}
        </motion.div>
      </div>
    </div>
  );
}
