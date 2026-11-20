"use client";

import { motion, type Variants } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoImage } from "@/data/demos";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { useDemoStill } from "../useDemoStill";

/**
 * Ember & Oak's signature: the printed menu card, where every dish is "plated"
 * (set down from just above the table) as its course comes into view.
 *
 * - Three courses, each its own trigger: whileInView + VIEWPORT_ONCE on the
 *   course block ([data-course]), which is never transformed itself, so the
 *   observer always sees its full box.
 * - Timeline per course (one wave, heading first):
 *     course heading  0 ms     opacity 0→1, y −10→0, 0.5 s   (lead)
 *     item i          120 + 70·i ms  opacity 0→1, y −14→0, scale 1.02→1, 0.6 s
 *     photo j (fire)  after the last item + 100·j ms  opacity 0→1, scale 1.03→1, 0.9 s
 *   Ease EASE_EDITORIAL (fast start, long settle) so each plate lands softly.
 * - Only transform and opacity animate. The card, rules and footnote never move.
 * - data-state is "live" until all three courses have finished plating, then
 *   "rest" (written straight to the DOM from onAnimationComplete).
 * - Reduced motion or Pause: plain markup, everything plated, data-state="rest".
 * - Once plated, a course stays plated: each course decides at mount whether it
 *   starts plated (useState initializer), so a re-render (EN/ES) never changes
 *   its motion props, and a remount after Pause is lifted starts plated.
 */

export type PlatingItem = {
  id: string;
  name: string;
  price: number;
  detail: string;
};
export type PlatingPhoto = {
  image: DemoImage;
  alt: string;
  caption: string;
  price: number;
};
export type PlatingCourse = {
  id: string;
  title: string;
  note: string;
  items: PlatingItem[];
  /** Photos set beside this course on desktop (the fire course). */
  photos?: PlatingPhoto[];
};

type Props = {
  courses: PlatingCourse[];
  /** Card masthead: house name, course-card title, service line. */
  house: string;
  title: string;
  sub: string;
  footnote: string;
  className?: string;
};

const ITEM_START = 0.12;
const ITEM_STEP = 0.07;
const PHOTO_STEP = 0.1;

const headVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  plated: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_EDITORIAL },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: -14, scale: 1.02 },
  plated: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: EASE_EDITORIAL,
      delay: ITEM_START + ITEM_STEP * i,
    },
  }),
};

const photoVariants: Variants = {
  hidden: { opacity: 0, scale: 1.03 },
  plated: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: EASE_EDITORIAL, delay },
  }),
};

// Ink on the cream card (#F7E4CF): ink #2A0F0C 14.5:1, smoke #6E4636 6.5:1, burnt #9A3B12 5.6:1.
const SMALL_CAPS = "text-[0.6875rem] font-semibold uppercase tracking-[0.24em]";

function Price({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`demo-display shrink-0 lining-nums text-[#9A3B12] ${className ?? ""}`}>
      <span className="sr-only">$</span>
      {value}
    </span>
  );
}

function Course({
  course,
  still,
  startPlated,
  onPlated,
}: {
  course: PlatingCourse;
  still: boolean;
  startPlated: boolean;
  onPlated: (id: string) => void;
}) {
  // Decided once per mount: a re-render never swaps the motion props.
  const [plated] = useState(startPlated);
  const animated = !still;
  const fire = Boolean(course.photos?.length);
  const headingId = `course-${course.id}`;

  const triggerProps = !animated
    ? {}
    : plated
      ? { initial: "plated" as const }
      : {
          initial: "hidden" as const,
          whileInView: "plated",
          viewport: VIEWPORT_ONCE,
        };

  const Block = animated ? motion.div : "div";
  const Head = animated ? motion.div : "div";
  const Item = animated ? motion.li : "li";
  const Figure = animated ? motion.figure : "figure";

  const lastItemEnd = ITEM_START + ITEM_STEP * (course.items.length - 1) + 0.1;

  const list = (
    <ul
      className={`grid content-start gap-x-12 gap-y-8 ${fire ? "sm:gap-y-11" : "sm:gap-y-9"} ${
        fire ? "" : course.items.length === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
      }`}
    >
      {course.items.map((item, i) => (
        <Item key={item.id} data-plate {...(animated ? { variants: itemVariants, custom: i } : {})} className="min-w-0">
          <p className="flex items-baseline gap-4">
            <span className={`demo-display leading-[1.2] text-[#2A0F0C] ${fire ? "text-[1.5rem] sm:text-[1.875rem]" : "text-[1.375rem] sm:text-[1.5rem]"}`}>
              {item.name}
            </span>
            <Price value={item.price} className={fire ? "text-[1.375rem] sm:text-[1.625rem]" : "text-[1.25rem] sm:text-[1.375rem]"} />
          </p>
          <p className="mt-2 max-w-[44ch] text-[0.9375rem] leading-relaxed text-[#6E4636]">{item.detail}</p>
        </Item>
      ))}
    </ul>
  );

  return (
    <Block
      data-course={course.id}
      role="group"
      aria-labelledby={headingId}
      className="relative"
      {...triggerProps}
      {...(animated
        ? {
            onAnimationComplete: (def: unknown) => {
              if (def === "plated") onPlated(course.id);
            },
          }
        : {})}
    >
      <Head {...(animated ? { variants: headVariants } : {})} className="flex flex-wrap items-end gap-x-5 gap-y-3">
        <h3 id={headingId} className="demo-display shrink-0 text-[2rem] leading-none text-[#2A0F0C] sm:text-[2.5rem]">
          {course.title}
        </h3>
        <span aria-hidden="true" className="mb-[0.45rem] hidden h-px min-w-6 flex-1 bg-[#2A0F0C]/30 sm:block" />
        {/* Phones: the note drops under the title (no rule). */}
        <p className={`${SMALL_CAPS} mb-[0.2rem] shrink-0 basis-full text-[#9A3B12] sm:basis-auto`}>{course.note}</p>
      </Head>
      {fire ? (
        <div className="mt-9 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          {list}
          <div className="grid grid-cols-2 gap-4 lg:block">
            {course.photos!.map((p, j) => {
              const caption = (
                <figcaption
                  className={`${SMALL_CAPS} flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[#6E4636] max-sm:tracking-[0.14em] ${j === 0 ? "mb-3" : "mt-3 justify-end"}`}
                >
                  <span>{p.caption}</span>
                  <Price value={p.price} className="hidden text-[0.875rem] tracking-normal sm:inline" />
                </figcaption>
              );
              return (
                <Figure
                  key={p.image.src}
                  {...(animated
                    ? {
                        variants: photoVariants,
                        custom: lastItemEnd + PHOTO_STEP * j,
                      }
                    : {})}
                  className={
                    j === 0
                      ? "lg:w-[78%]"
                      : // Desktop: the steak sits lower and to the right, overlapping the flatbread's corner.
                        "lg:relative lg:z-10 lg:-mt-20 lg:ml-auto lg:w-[64%]"
                  }
                >
                  {/* The flatbread's caption sits above it, so the steak can overlap its lower corner on desktop
                    (and the pair reads as staggered on phones). */}
                  {j === 0 && caption}
                  <div className={`overflow-hidden bg-[#2A0F0C] ${j === 1 ? "lg:outline lg:outline-[8px] lg:outline-[#F7E4CF]" : ""}`}>
                    <img
                      src={p.image.src}
                      srcSet={`${p.image.small} 640w, ${p.image.src} ${p.image.width}w`}
                      // Square boxes: phones/tablets half the card (<= ~480px), desktop <= ~340px.
                      sizes="(min-width: 1024px) 340px, 45vw"
                      width={p.image.width}
                      height={p.image.height}
                      alt={p.alt}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square h-auto w-full object-cover"
                    />
                  </div>
                  {j === 1 && caption}
                </Figure>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-9">{list}</div>
      )}
    </Block>
  );
}

export function MenuPlating({ courses, house, title, sub, footnote, className }: Props) {
  const still = useDemoStill();
  const ref = useRef<HTMLDivElement>(null);
  // Courses that have been seen plated. Survives still <-> motion switches.
  const plated = useRef(new Set<string>());

  useEffect(() => {
    if (still) courses.forEach((c) => plated.current.add(c.id));
  }, [still, courses]);

  const onPlated = useCallback(
    (id: string) => {
      plated.current.add(id);
      if (plated.current.size >= courses.length && ref.current) ref.current.dataset.state = "rest";
    },
    [courses.length],
  );

  return (
    <div
      ref={ref}
      data-signature="restaurant"
      data-state={still || plated.current.size >= courses.length ? "rest" : "live"}
      className={`relative bg-[#F7E4CF] text-[#2A0F0C] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.65)] ${className ?? ""}`}
    >
      {/* A printed double frame inside the sheet. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[#2A0F0C]/25 sm:inset-4" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-[18px] border border-[#2A0F0C]/12 sm:inset-[22px]" />
      <div className="relative px-6 pb-12 pt-12 sm:px-12 sm:pb-16 sm:pt-16 lg:px-16">
        <header className="text-center">
          <p className={`${SMALL_CAPS} text-[#9A3B12]`}>{house}</p>
          <p className="demo-display mt-3 text-[2.75rem] leading-none sm:text-[3.5rem]">{title}</p>
          <p className="mt-3 text-[0.9375rem] text-[#6E4636]">{sub}</p>
          <div aria-hidden="true" className="mx-auto mt-7 flex max-w-[14rem] items-center gap-3">
            <span className="h-px flex-1 bg-[#2A0F0C]/30" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#9A3B12]" />
            <span className="h-px flex-1 bg-[#2A0F0C]/30" />
          </div>
        </header>
        <div className="mt-12 space-y-16 sm:mt-14 sm:space-y-20">
          {courses.map((course) => (
            <Course
              // Remount on a still <-> motion switch, so the course re-reads whether it was plated.
              key={`${course.id}-${still ? "still" : "live"}`}
              course={course}
              still={still}
              startPlated={plated.current.has(course.id)}
              onPlated={onPlated}
            />
          ))}
        </div>
        <p className="mx-auto mt-16 max-w-[60ch] border-t border-[#2A0F0C]/20 pt-6 text-center text-[0.8125rem] leading-relaxed text-[#6E4636]">
          {footnote}
        </p>
      </div>
    </div>
  );
}
