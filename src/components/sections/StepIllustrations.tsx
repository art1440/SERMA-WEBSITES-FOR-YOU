"use client";

import { motion } from "framer-motion";
import { EASE_EDITORIAL } from "@/lib/motion";

/**
 * Line illustrations for the four "How it works" steps: a thick rounded outline
 * in the card's ink plus one solid accent shape. When the card scrolls into view
 * the outline draws itself (pathLength) and the accent pops in after it.
 * All strokes use `currentColor`; the accent colour comes from `accentClass`.
 */
type Props = { on: boolean; delay: number; reduce: boolean; accentClass: string };

const DRAW_S = 0.9;

function useTimings({ on, delay, reduce }: Pick<Props, "on" | "delay" | "reduce">) {
  const draw = (i = 0) => ({
    initial: false as const,
    animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 },
    transition: reduce
      ? { duration: 0 }
      : {
          pathLength: { duration: DRAW_S, ease: EASE_EDITORIAL, delay: delay + i * 0.08 },
          opacity: { duration: 0.01, delay: delay + i * 0.08 },
        },
  });
  const pop = (i = 0) => ({
    initial: false as const,
    animate: on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 },
    transition: reduce
      ? { duration: 0 }
      : { type: "spring" as const, stiffness: 420, damping: 18, delay: delay + DRAW_S * 0.7 + i * 0.08 },
    style: { transformBox: "fill-box" as const, transformOrigin: "center" },
  });
  return { draw, pop };
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** 01 — the intro call: a phone with a chat bubble. */
export function CallIllustration(props: Props) {
  const { draw, pop } = useTimings(props);
  return (
    <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
      <motion.rect x="14" y="10" width="44" height="78" rx="9" {...stroke} {...draw(0)} />
      <motion.path d="M30 20h12" {...stroke} {...draw(1)} />
      <motion.path d="M31 78h10" {...stroke} {...draw(2)} />
      <motion.path d="M64 20h42a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H84l-12 10v-10h-8" {...stroke} {...draw(1)} />
      <motion.g {...pop(0)} className={props.accentClass}>
        <circle cx="76" cy="40" r="4.5" fill="currentColor" />
        <circle cx="89" cy="40" r="4.5" fill="currentColor" />
        <circle cx="102" cy="40" r="4.5" fill="currentColor" />
      </motion.g>
    </svg>
  );
}

/** 02 — we build it: a browser window with an image block, text lines and a pencil. */
export function BuildIllustration(props: Props) {
  const { draw, pop } = useTimings(props);
  return (
    <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
      <motion.rect x="6" y="8" width="92" height="72" rx="10" {...stroke} {...draw(0)} />
      <motion.path d="M6 26h92" {...stroke} {...draw(1)} />
      <motion.path d="M60 44h26M60 56h18" {...stroke} {...draw(2)} />
      <motion.g {...pop(0)}>
        <rect x="16" y="36" width="34" height="32" rx="5" className={props.accentClass} fill="currentColor" />
        <path d="M18 64l10-12 8 8 6-6 8 10" {...stroke} strokeWidth={3.5} />
      </motion.g>
      <motion.g {...pop(1)} className={props.accentClass}>
        <circle cx="17" cy="17" r="2.6" fill="currentColor" />
        <circle cx="26" cy="17" r="2.6" fill="currentColor" />
        <circle cx="35" cy="17" r="2.6" fill="currentColor" />
      </motion.g>
      <motion.path d="M90 88l4-14 18-18a5 5 0 0 1 7 7l-18 18z" {...stroke} {...draw(3)} />
    </svg>
  );
}

/** 03 — see it before you pay: a browser with an approval check. */
export function PreviewIllustration(props: Props) {
  const { draw, pop } = useTimings(props);
  return (
    <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
      <motion.rect x="6" y="14" width="86" height="66" rx="10" {...stroke} {...draw(0)} />
      <motion.path d="M6 32h86" {...stroke} {...draw(1)} />
      <motion.path d="M18 46h40M18 58h28M18 70h34" {...stroke} {...draw(2)} />
      <motion.g {...pop(0)}>
        <circle cx="92" cy="62" r="20" className={props.accentClass} fill="currentColor" />
        <path d="M83 62l6 6 12-13" {...stroke} strokeWidth={5} className="text-ink-900" />
      </motion.g>
    </svg>
  );
}

/** 04 — go live: a globe with a launch badge. */
export function LiveIllustration(props: Props) {
  const { draw, pop } = useTimings(props);
  return (
    <svg viewBox="0 0 120 96" className="h-full w-full" aria-hidden="true">
      <motion.circle cx="48" cy="50" r="36" {...stroke} {...draw(0)} />
      <motion.path d="M12 50h72M48 14c-12 12-12 60 0 72M48 14c12 12 12 60 0 72" {...stroke} {...draw(1)} />
      <motion.g {...pop(0)}>
        <circle cx="94" cy="24" r="18" className={props.accentClass} fill="currentColor" />
        <path d="M87 31l14-14M90 17h11v11" {...stroke} strokeWidth={4.5} className="text-ink-900" />
      </motion.g>
    </svg>
  );
}

export const STEP_ILLUSTRATIONS = [CallIllustration, BuildIllustration, PreviewIllustration, LiveIllustration];
