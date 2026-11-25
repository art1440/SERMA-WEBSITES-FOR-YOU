"use client";

import { motion, type Variants } from "framer-motion";
import { Fragment, type ReactNode } from "react";
import { useDemoStill } from "../useDemoStill";
import { waveDelay } from "./hooks";

/**
 * Masked type entrance for headings. Each word (or line) rises out of its own
 * mask with a slight tilt; the gaps between words shrink as the line goes on,
 * so it lands as one wave. Transform only: text is opaque at every frame, so
 * contrast checks and screen captures never see faded copy.
 *
 *   text   word mode: one string, split on spaces. The heading's accessible
 *          name is the plain string (visual words are aria-hidden).
 *   lines  line mode: rich lines (may hold <em> etc.), real content, read as-is.
 *
 * Still: plain heading, no masks.
 */

type Tag = "h1" | "h2" | "h3" | "p" | "div";

type Props = {
  as?: Tag;
  id?: string;
  className?: string;
  /** Classes on each line block (line mode). */
  lineClassName?: string;
  text?: string;
  lines?: ReactNode[];
  trigger?: "inView" | "mount";
  delay?: number;
  /** Delay of the last word / line, seconds. */
  spread?: number;
  /** Tilt in degrees each piece rises from. */
  tilt?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function TextReveal({
  as = "h2",
  id,
  className,
  lineClassName = "",
  text,
  lines,
  trigger = "inView",
  delay = 0,
  spread,
  tilt = 4,
}: Props) {
  const still = useDemoStill();
  const T = as;
  const M = motion[as];

  if (still) {
    return (
      <T id={id} className={className}>
        {text ?? lines?.map((l, i) => (
          <span key={i} className={`block ${lineClassName}`}>
            {l}
            {i < lines.length - 1 ? " " : null}
          </span>
        ))}
      </T>
    );
  }

  const pieces = text ? text.split(/\s+/).filter(Boolean) : (lines ?? []);
  const n = pieces.length;
  const total = spread ?? Math.min(0.5, 0.06 * n);
  const rise: Variants = {
    hidden: { y: "112%", rotate: tilt },
    shown: (i: number) => ({ y: "0%", rotate: 0, transition: { duration: 1.05, ease: EASE, delay: delay + waveDelay(i, n, total) } }),
  };
  const play =
    trigger === "mount"
      ? { initial: "hidden", animate: "shown" }
      : { initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.4 } };

  if (text) {
    return (
      <M id={id} className={className} {...play}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {pieces.map((w, i) => (
            <Fragment key={i}>
              <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
                <motion.span className="inline-block origin-bottom-left will-change-transform" variants={rise} custom={i}>
                  {w}
                </motion.span>
              </span>
              {i < n - 1 ? " " : null}
            </Fragment>
          ))}
        </span>
      </M>
    );
  }

  return (
    <M id={id} className={className} {...play}>
      {pieces.map((l, i) => (
        <span key={i} className={`-mb-[0.14em] block overflow-hidden pb-[0.14em] ${lineClassName}`}>
          <motion.span className="block origin-bottom-left will-change-transform" variants={rise} custom={i}>
            {l}
            {i < n - 1 ? " " : null}
          </motion.span>
        </span>
      ))}
    </M>
  );
}
