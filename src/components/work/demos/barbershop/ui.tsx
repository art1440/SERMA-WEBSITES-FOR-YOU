"use client";

import { motion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
import { useDemoStill } from "../../useDemoStill";

/*
 * Ironside Barber Co. shared bits. Palette is hard-coded (the site's theme
 * tokens flip under html.dark): black #0E0E0E, bone #EFE6D6, brass #C9A45C,
 * secondary grey #A8A091. Contrast on #0E0E0E: bone 15.6:1, grey 7.4:1,
 * brass 8.2:1; black on brass 8.2:1.
 */

/** Display type uses the shared `.demo-display` hook (globals.css). */
export const DISPLAY = "demo-display font-normal";
export const NAV_H = 64;
export const STICKY_TOP = `calc(var(--demo-ribbon) + ${NAV_H}px)`;
export const SCROLL_MARGIN = { scrollMarginTop: STICKY_TOP };
export const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A45C]";
export const EDITORIAL = [0.22, 1, 0.36, 1] as const;
export const usd = (n: number) => `$${n}`;

type RiseProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
  /** Travel in px (support pieces move less than the lead). */
  y?: number;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className">;

/** Fade-and-rise on first view (0.9s editorial out-curve); plain markup when still. */
export function Rise({ children, className, delay = 0, as = "div", y = 18, ...rest }: RiseProps) {
  const still = useDemoStill();
  if (still) {
    const Tag = as;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }
  const M = as === "li" ? motion.li : motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: EDITORIAL, delay }}
      {...(rest as object)}
    >
      {children}
    </M>
  );
}
