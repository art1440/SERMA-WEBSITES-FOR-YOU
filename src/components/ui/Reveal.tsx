"use client";

import { motion } from "framer-motion";
import { Fragment, type ElementType, type ReactNode } from "react";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** "inView" reveals on scroll (default); "mount" reveals immediately (above the fold). */
  trigger?: "inView" | "mount";
};

/** Fade-up section entrance. Transform + opacity only. */
export function Reveal({ children, className, delay = 0, y = 28, trigger = "inView" }: RevealProps) {
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(trigger === "mount" ? { animate: target } : { whileInView: target, viewport: VIEWPORT_ONCE })}
      transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay }}
    >
      {children}
    </motion.div>
  );
}

type RevealLinesProps = {
  lines: readonly string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** A word rendered in the italic display cut. */
  emphasis?: string;
  delay?: number;
  stagger?: number;
  trigger?: "inView" | "mount";
  id?: string;
};

function withEmphasis(line: string, emphasis?: string): ReactNode {
  if (!emphasis || !line.includes(emphasis)) return line;
  const [before, ...rest] = line.split(emphasis);
  return (
    <Fragment>
      {before}
      <em className="italic">{emphasis}</em>
      {rest.join(emphasis)}
    </Fragment>
  );
}

/**
 * Line-by-line editorial headline reveal: each line slides up from behind a
 * mask (overflow-hidden parent), staggered.
 *
 * The in-view trigger lives on an un-transformed wrapper: observing the
 * translated line itself would fail, because it sits fully outside its own
 * clipping mask before it animates (IntersectionObserver sees zero area).
 */
export function RevealLines({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  emphasis,
  delay = 0,
  stagger = 0.09,
  trigger = "inView",
  id,
}: RevealLinesProps) {
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const line = {
    hidden: { y: "108%", opacity: 0 },
    show: { y: "0%", opacity: 1, transition: { duration: 1, ease: EASE_EDITORIAL } },
  };
  return (
    <Tag className={className} id={id}>
      <motion.span
        className="block"
        variants={container}
        initial="hidden"
        {...(trigger === "mount" ? { animate: "show" } : { whileInView: "show", viewport: VIEWPORT_ONCE })}
      >
        {lines.map((text, i) => (
          <span key={i} className={`block overflow-hidden pb-[0.1em] ${lineClassName ?? ""}`}>
            <motion.span className="block" variants={line}>
              {withEmphasis(text, emphasis)}
            </motion.span>
            {i < lines.length - 1 ? " " : null}
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
