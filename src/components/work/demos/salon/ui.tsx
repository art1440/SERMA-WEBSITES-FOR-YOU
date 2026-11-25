"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { SalonHeading } from "@/data/demos/salon";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { useDemoStill } from "../../useDemoStill";

/*
 * Shared pieces of the Maison Lumière page (see SalonDemo.tsx for the palette
 * and the --salon-accent / --salon-ink contract).
 */
export const DISPLAY = "demo-display font-normal";
export const NAV_H = 72;
export const SCROLL_MARGIN = { scrollMarginTop: `calc(var(--demo-ribbon) + ${NAV_H}px)` };
export const WRAP = "mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-14";
export const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3B1F2B]";
export const ACCENT_T = "transition-[background-color,color,text-decoration-color,border-color] duration-[400ms] ease-out";
export const KICKER = "text-[0.75rem] font-medium uppercase tracking-[0.24em]";
export const PILL = `inline-flex items-center justify-center rounded-full font-medium tracking-[0.02em] ${FOCUS}`;

type RiseTag = "div" | "li" | "figure";

/**
 * Fade-and-rise on first view; renders plain markup (final state) when still.
 * `extra` passes through attributes/handlers (e.g. HoverPreview's row binding).
 */
export function Rise({
  children,
  className,
  delay = 0,
  as = "div",
  extra,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: RiseTag;
  extra?: Record<string, unknown>;
}) {
  const still = useDemoStill();
  if (still) {
    const Tag = as;
    return (
      <Tag className={className} {...extra}>
        {children}
      </Tag>
    );
  }
  const M = as === "li" ? motion.li : as === "figure" ? motion.figure : motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay }}
      {...extra}
    >
      {children}
    </M>
  );
}

/** A heading's italic phrase, underlined in the live accent. */
export function Em({ children, underline = "var(--salon-accent)" }: { children: ReactNode; underline?: string }) {
  return (
    <em
      className={`italic underline decoration-[0.04em] underline-offset-[0.16em] ${ACCENT_T}`}
      style={{ textDecorationColor: underline }}
    >
      {children}
    </em>
  );
}

export function Title({ h, L, id, className, underline }: { h: SalonHeading; L: (v: L10n) => string; id: string; className: string; underline?: string }) {
  return (
    <h2 id={id} className={`${DISPLAY} ${className}`}>
      {L(h.pre)}
      <Em underline={underline}>{L(h.em)}</Em>
      {h.post && L(h.post)}
    </h2>
  );
}
