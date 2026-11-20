"use client";

import { motion, type Variants } from "framer-motion";
import { useCallback, useRef } from "react";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { staggerDelay } from "@/components/ui/Reveal";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";

/**
 * Velvet Room's signature: the three treatment photos in rounded "windows"
 * that open as they come into view.
 *
 * - Each window ([data-window]) starts clipped to a closed pill in its centre,
 *   clip-path: inset(50% 50% 50% 50% round 999px), and opens to
 *   inset(0% 0% 0% 0% round 28px) over 0.9 s (EASE_EDITORIAL) the first time its
 *   list item is 10% inside the viewport (whileInView + VIEWPORT_ONCE on the
 *   unclipped <li>; a fully clipped element never intersects), delayed by
 *   staggerDelay(i). Each window has its own trigger, so on phones (stacked)
 *   they open one by one as you reach them; on desktop (one row) they open as
 *   a soft left-to-right ripple.
 * - The photo inside settles from scale 1.12 to 1 over 1.4 s on the same
 *   trigger (driven by the parent's variant, no extra observer).
 * - clip-path is the only non-transform property animated, on the window
 *   elements only. No React state changes during the animation.
 * - data-state is "live" until all three windows have finished opening, then
 *   "rest" (written to the DOM directly from onAnimationComplete).
 * - Reduced motion or Pause: windows render open (border-radius + overflow
 *   clip, no clip-path), photos at scale 1, data-state="rest".
 */

export type MaskWindow = {
  key: string;
  image: DemoImage;
  alt: string;
  name: string;
  /** e.g. "120 min" */
  duration: string;
  /** e.g. "$160" */
  price: string;
  detail: string;
  aftercare: string;
};

type Props = {
  items: MaskWindow[];
  /** Accessible name for the list. */
  label: string;
  aftercareLabel: string;
  className?: string;
};

const CLOSED = "inset(50% 50% 50% 50% round 999px)";
const OPEN = "inset(0% 0% 0% 0% round 28px)";

const windowVariants: Variants = {
  closed: { clipPath: CLOSED },
  open: (i: number) => ({ clipPath: OPEN, transition: { duration: 0.9, ease: EASE_EDITORIAL, delay: staggerDelay(i) } }),
};

const imageVariants: Variants = {
  closed: { scale: 1.12 },
  open: (i: number) => ({ scale: 1, transition: { duration: 1.4, ease: EASE_EDITORIAL, delay: staggerDelay(i) } }),
};

// Never wider than the 896px source: <640 the window is at most 608px; 640-1023
// it is ~40% of the row (<= 410px); >= 1024 a third of a 1200px row (<= 380px).
const SIZES = "(min-width: 1024px) 380px, (min-width: 640px) 42vw, calc(100vw - 32px)";

export function MaskWindows({ items, label, aftercareLabel, className }: Props) {
  const still = useDemoStill();
  const ref = useRef<HTMLUListElement>(null);
  const opened = useRef(new Set<number>());

  const onOpened = useCallback(
    (i: number) => {
      opened.current.add(i);
      if (opened.current.size === items.length && ref.current) ref.current.dataset.state = "rest";
    },
    [items.length],
  );

  return (
    <ul
      ref={ref}
      aria-label={label}
      data-signature="beauty"
      data-state={still ? "rest" : "live"}
      className={`grid gap-16 sm:gap-20 lg:grid-cols-3 lg:gap-x-10 xl:gap-x-14 ${className ?? ""}`}
    >
      {items.map((t, i) => {
        const img = (
          <motion.img
            src={t.image.src}
            srcSet={`${t.image.small} 640w, ${t.image.src} ${t.image.width}w`}
            sizes={SIZES}
            width={t.image.width}
            height={t.image.height}
            alt={t.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            variants={still ? undefined : imageVariants}
            custom={i}
          />
        );
        const frame = "relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-[#26352D]";
        return (
          <motion.li
            key={t.key}
            // Middle window sits lower on desktop: the row reads as a slow wave, not a grid.
            className={`grid gap-7 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:items-center sm:gap-10 lg:grid-cols-1 lg:content-start lg:items-start lg:gap-8 ${i === 1 ? "lg:mt-28" : ""}`}
            // The trigger lives on the unclipped list item: a window clipped to
            // nothing has no visible area, so IntersectionObserver would never
            // see it. The variant propagates to the window and its photo.
            {...(still ? {} : { initial: "closed", whileInView: "open", viewport: VIEWPORT_ONCE })}
          >
            {still ? (
              <div data-window className={frame}>
                {img}
              </div>
            ) : (
              <motion.div
                data-window
                className={`${frame} will-change-[clip-path]`}
                variants={windowVariants}
                custom={i}
                onAnimationComplete={(def) => {
                  if (def === "open") onOpened(i);
                }}
              >
                {img}
              </motion.div>
            )}
            <div className="min-w-0">
              <p className="text-[0.75rem] font-medium uppercase tracking-[0.22em] text-[#9CC5A6]">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="demo-display mt-3 text-[1.875rem] font-light leading-[1.08] [font-variation-settings:'SOFT'_100] sm:text-[2.125rem]">
                {t.name}
              </h3>
              <p className="mt-4 flex items-center gap-4 border-y border-[#E8EFE9]/15 py-3">
                <span className="text-[0.9375rem] text-[#B4C4B9]">{t.duration}</span>
                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-[#9CC5A6]" />
                <span className="demo-display text-[1.625rem] font-normal leading-none text-[#9CC5A6] [font-variation-settings:'SOFT'_100]">
                  {t.price}
                </span>
              </p>
              <p className="mt-5 max-w-[42ch] leading-relaxed text-[#E8EFE9]/90">{t.detail}</p>
              <p className="mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed text-[#B4C4B9]">
                <span className="font-semibold text-[#E8EFE9]">{aftercareLabel}: </span>
                {t.aftercare}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
