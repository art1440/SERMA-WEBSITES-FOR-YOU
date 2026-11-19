"use client";

import { inView, motion } from "framer-motion";
import { Fragment, useEffect, useRef, useState, type ElementType, type ReactNode, type RefObject } from "react";
import { usePanelRepeat, usePanelVisit } from "@/context/TabsContext";
import { EASE_EDITORIAL } from "@/lib/motion";

/** Bottom-only trigger band: an element at the very top of a tab can never be stranded above it. */
const REVEAL_MARGIN = "0px 0px -5% 0px";
export const REVEAL_S = 0.6;
/** Later visits to a tab: a short fade with at most this much rise, no delay or stagger. */
export const REPEAT_S = 0.3;
export const REPEAT_Y = 8;

/** False while the panel is hidden; true once `ref` has entered the viewport during this visit. */
export function useVisitReveal(ref: RefObject<Element | null>, trigger: "inView" | "mount" = "inView") {
  const visit = usePanelVisit();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setShown(false);
    if (visit === null) return;
    if (trigger === "mount") {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    // A fresh observer per visit: its first reading is taken after the swap's scroll reset.
    return inView(el, () => {
      setShown(true);
    }, { margin: REVEAL_MARGIN });
  }, [visit, trigger, ref]);
  return shown;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** "inView" reveals on scroll (default); "mount" reveals immediately (above the fold). */
  trigger?: "inView" | "mount";
};

/** Delay (seconds) for item `i` of a group of cards / list items: 60ms apart, capped so long lists don't drag. */
export const staggerDelay = (i: number, base = 0) => base + Math.min(i, 8) * 0.06;

/** Fade-up section entrance (16px rise). Transform + opacity only. */
export function Reveal({ children, className, delay = 0, y = 16, trigger = "inView" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useVisitReveal(ref, trigger);
  const repeat = usePanelRepeat();
  const ry = repeat ? Math.min(y, REPEAT_Y) : y;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={
        shown
          ? { opacity: 1, y: 0, transition: { duration: repeat ? REPEAT_S : REVEAL_S, ease: EASE_EDITORIAL, delay: repeat ? 0 : delay } }
          : { opacity: 0, y: ry, transition: { duration: 0 } }
      }
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
      <em className="font-serif font-normal italic tracking-[-0.01em]">{emphasis}</em>
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
  stagger = 0.08,
  trigger = "inView",
  id,
}: RevealLinesProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useVisitReveal(ref, trigger);
  const repeat = usePanelRepeat();
  // Later visits: the headline fades in as one block (no mask slide, no stagger).
  const container = {
    hidden: {},
    show: { transition: repeat ? {} : { staggerChildren: stagger, delayChildren: delay } },
  };
  const line = repeat
    ? {
        hidden: { y: "0%", opacity: 0, transition: { duration: 0 } },
        show: { y: "0%", opacity: 1, transition: { duration: REPEAT_S, ease: EASE_EDITORIAL } },
      }
    : {
        hidden: { y: "108%", opacity: 0, transition: { duration: 0 } },
        show: { y: "0%", opacity: 1, transition: { duration: 0.8, ease: EASE_EDITORIAL } },
      };
  return (
    <Tag className={className} id={id}>
      <motion.span
        ref={ref}
        className="block"
        variants={container}
        initial="hidden"
        animate={shown ? "show" : "hidden"}
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
