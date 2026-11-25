"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";
import { useIsDesktop } from "./hooks";
import { RevealImage } from "./RevealImage";

/**
 * Sticky scroll storytelling. Desktop: the photo frame pins while the steps
 * scroll past it; whichever step crosses the middle of the screen is active
 * and its photo wipes up over the previous one (scrolling back wipes it down
 * again). Each step's row gets data-active="true|false" so a page can style
 * its own marker; never dim the text itself (contrast).
 *
 * Phones, tablets and still mode: a plain sequence, each step with its photo
 * above it (RevealImage, so it still opens on scroll when motion is allowed).
 *
 * Only one variant is in the DOM at a time (useIsDesktop), so no lazy image
 * ever sits unloaded in a display:none branch.
 */

export type StoryStep = { key: string; image: DemoImage; alt: string; content: ReactNode };

type Props = {
  steps: StoryStep[];
  /** CSS length the frame pins below, e.g. "calc(var(--demo-ribbon) + 64px)". */
  top: string;
  /** Classes for the pinned frame (radius, background). */
  frameClassName?: string;
  /** Classes for each step row on desktop. */
  stepClassName?: string;
  /** Classes for the inline photo on phones; must size it (default aspect-[4/3]). */
  mobileImageClassName?: string;
  /** Classes for the thin progress rule under the frame (omit for none). */
  progressClassName?: string;
  /** Content rendered inside the frame, above the photos (captions, tags). */
  overlay?: (active: number) => ReactNode;
  mediaSide?: "left" | "right";
  sizes?: string;
  className?: string;
};

const EASE = [0.76, 0, 0.24, 1] as const;

export function StoryFrame({
  steps,
  active,
  frameClassName = "",
  progressClassName,
  overlay,
  sizes,
}: {
  steps: StoryStep[];
  active: number;
  frameClassName?: string;
  progressClassName?: string;
  overlay?: (active: number) => ReactNode;
  sizes: string;
}) {
  return (
    <div className={`relative h-full w-full overflow-hidden ${frameClassName}`}>
      {steps.map((s, i) => {
        const shown = i <= active;
        return (
          <motion.div
            key={s.key}
            className="absolute inset-0"
            style={{ zIndex: i }}
            initial={false}
            animate={{ clipPath: shown ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}
            transition={{ duration: 1.05, ease: EASE }}
          >
            <motion.img
              src={s.image.src}
              srcSet={`${s.image.small} 640w, ${s.image.src} ${s.image.width}w`}
              sizes={sizes}
              width={s.image.width}
              height={s.image.height}
              alt={i === active ? s.alt : ""}
              aria-hidden={i === active ? undefined : true}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              initial={false}
              animate={{ scale: i === active ? 1 : 1.14 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        );
      })}
      {overlay && <div className="pointer-events-none absolute inset-0" style={{ zIndex: steps.length + 1 }}>{overlay(active)}</div>}
      {progressClassName && (
        <motion.span
          aria-hidden="true"
          className={`absolute bottom-0 left-0 h-[3px] w-full origin-left ${progressClassName}`}
          style={{ zIndex: steps.length + 2 }}
          initial={false}
          animate={{ scaleX: (active + 1) / steps.length }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </div>
  );
}

export function StickyStory({
  steps,
  top,
  frameClassName = "",
  stepClassName = "",
  mobileImageClassName = "",
  progressClassName,
  overlay,
  mediaSide = "right",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "",
}: Props) {
  const still = useDemoStill();
  const desktop = useIsDesktop();
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pinned = desktop && !still;

  useEffect(() => {
    if (!pinned) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [pinned, steps.length]);

  if (!pinned) {
    return (
      <div data-story="stacked" className={className}>
        {steps.map((s) => (
          <div key={s.key} className="pb-14 last:pb-0 md:pb-20">
            <RevealImage image={s.image} alt={s.alt} sizes="100vw" fill className={`w-full ${mobileImageClassName || "aspect-[4/3]"}`} />
            <div className="mt-6">{s.content}</div>
          </div>
        ))}
      </div>
    );
  }

  const media = (
    <div className="relative">
      <div className="sticky" style={{ top, height: `calc(100svh - ${top} - 48px)`, marginTop: 24 }}>
        <StoryFrame
          steps={steps}
          active={active}
          frameClassName={frameClassName}
          progressClassName={progressClassName}
          overlay={overlay}
          sizes={sizes}
        />
      </div>
    </div>
  );

  return (
    <div data-story="pinned" className={`grid grid-cols-2 gap-16 xl:gap-24 ${className}`}>
      {mediaSide === "left" && media}
      <div>
        {steps.map((s, i) => (
          <div
            key={s.key}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            data-step={i}
            data-active={i === active}
            className={`flex min-h-[78svh] flex-col justify-center ${stepClassName}`}
          >
            {s.content}
          </div>
        ))}
      </div>
      {mediaSide === "right" && media}
    </div>
  );
}
