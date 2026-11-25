"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import {
  LOGO_LETTERS,
  LOGO_LOCKUP_VIEWBOX,
  LOGO_SWOOSH,
  LOGO_SWOOSH_FROM,
  LOGO_SWOOSH_STOPS,
  LOGO_SWOOSH_TO,
  LOGO_TAGLINE,
  LOGO_VIEWBOX,
} from "./logo-paths";

/** Left edge and full width of the swoosh, for the draw-in clip. */
const SWOOSH_X = LOGO_SWOOSH_FROM.x - 1;
const SWOOSH_W = LOGO_SWOOSH_TO.x - LOGO_SWOOSH_FROM.x + 2;

/**
 * The SERMA logo: Cinzel letters with a blue swoosh sweeping out from under the A
 * (artwork in logo-paths.ts, traced from the brand card).
 *
 * Letters follow `currentColor` (the `bone` token: deep navy in light, off-white in dark); the
 * swoosh keeps the brand gradient. Motion: once, on mount, the swoosh draws itself out of the A,
 * left to right, like a pen stroke. Reduced motion: it is simply there.
 *
 * `md` is the mark alone (navbar, CRM); `xl` adds "WEBSITE DESIGNS" (footer).
 * One accessible name (sr-only). `tone` is kept for API compatibility and ignored.
 * `className` overrides the letter colour (e.g. on a panel that stays light in dark mode);
 * `markClassName` overrides the mark's height.
 */
export function Wordmark({
  size = "md",
  className = "text-bone",
  markClassName = "h-[22px] sm:h-6",
}: {
  tone?: "light" | "dark";
  size?: "md" | "xl";
  className?: string;
  markClassName?: string;
}) {
  const id = useId();
  const reduce = useReducedMotionSafe();
  const gradId = `${id}-swoosh`;
  const clipId = `${id}-draw`;
  const xl = size === "xl";

  const svg = (
    <svg
      viewBox={xl ? LOGO_LOCKUP_VIEWBOX : LOGO_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      className={xl ? "block h-auto w-full overflow-visible" : `block w-auto overflow-visible ${markClassName}`}
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={LOGO_SWOOSH_FROM.x}
          y1={LOGO_SWOOSH_FROM.y}
          x2={LOGO_SWOOSH_TO.x}
          y2={LOGO_SWOOSH_TO.y}
        >
          <stop offset="0" stopColor={LOGO_SWOOSH_STOPS[0]} />
          <stop offset="1" stopColor={LOGO_SWOOSH_STOPS[1]} />
        </linearGradient>
        <clipPath id={clipId}>
          <motion.rect
            key={reduce ? "still" : "draw"}
            x={SWOOSH_X}
            y={50}
            height={30}
            initial={{ width: reduce ? SWOOSH_W : 0 }}
            animate={{ width: SWOOSH_W }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, ease: [0.65, 0, 0.35, 1], delay: 0.35 }}
          />
        </clipPath>
      </defs>
      <path d={LOGO_LETTERS} fill="currentColor" />
      <path d={LOGO_SWOOSH} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
      {xl ? <path d={LOGO_TAGLINE} fill="currentColor" fillOpacity={0.8} /> : null}
    </svg>
  );

  if (xl) {
    return (
      <span className={`block leading-none ${className}`}>
        <span className="sr-only">SERMA Website Designs</span>
        {/* `sd-wordmark` drives the CSS scroll-linked slide-in — keep it on this element. */}
        <span className="sd-wordmark block w-full max-w-[min(100%,58rem)] pb-[0.5em]">{svg}</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="sr-only">SERMA</span>
      {svg}
    </span>
  );
}
