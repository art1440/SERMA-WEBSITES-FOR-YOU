"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { useDemoStill } from "../../useDemoStill";

/*
 * Shared tokens for Ember & Oak. Palette is hard-coded (the site's theme tokens
 * flip under html.dark) and the root sets color-scheme: dark, so the page is
 * identical in either OS theme.
 *   ember  #2A0F0C  page               hearth #1E0907  reservations band
 *   cream  #F7E4CF  text / menu card   ochre  #E0902F  accent, CTA fill
 *   ash    #D4B49A  secondary text     burnt  #9A3B12  accent on the cream card
 * Contrast: cream on ember 14.5:1, on hearth 15.5:1; ochre on ember 7.0:1, on
 * hearth 7.5:1; ash on ember 9.2:1, on hearth 9.8:1; ember on ochre 7.0:1.
 */
export const NAV_H = 64;
/** Where pinned stages sit: under the demo ribbon and the sticky header. */
export const STICKY_TOP = `calc(var(--demo-ribbon) + ${NAV_H}px)`;
export const SCROLL_MARGIN: CSSProperties = { scrollMarginTop: STICKY_TOP };
export const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12";
export const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E0902F]";
export const SMALL_CAPS = "text-[0.75rem] font-semibold uppercase tracking-[0.24em]";
const BTN = `group inline-flex items-center justify-center whitespace-nowrap rounded-[3px] font-semibold tracking-[0.01em] transition-colors duration-300 ${FOCUS}`;
export const BTN_SOLID = `${BTN} bg-[#E0902F] text-[#2A0F0C] hover:bg-[#F7E4CF]`;
export const BTN_LINE = `${BTN} border border-[#F7E4CF]/60 text-[#F7E4CF] hover:border-[#F7E4CF] hover:bg-[#F7E4CF] hover:text-[#2A0F0C]`;

/**
 * Fade-and-rise. `onLoad` plays on mount (hero), otherwise on first view.
 * `yOnly` drops the fade, so the content is opaque from the first paint (hero CTAs).
 * Plain markup when still.
 */
export function Rise({
  children,
  className,
  delay = 0,
  onLoad = false,
  yOnly = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onLoad?: boolean;
  yOnly?: boolean;
}) {
  const still = useDemoStill();
  if (still) return <div className={className}>{children}</div>;
  const to = yOnly ? { y: 0 } : { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={yOnly ? { y: 14 } : { opacity: 0, y: 14 }}
      {...(onLoad ? { animate: to } : { whileInView: to, viewport: VIEWPORT_ONCE })}
      transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay }}
    >
      {children}
    </motion.div>
  );
}
