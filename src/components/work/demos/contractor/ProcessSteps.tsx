"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { RevealImage, useIsDesktop, waveDelay } from "@/components/work/motion";
import { useDemoStill } from "@/components/work/useDemoStill";
import type { ContractorContent } from "@/data/demos/contractor";
import type { L10n } from "@/i18n/types";
import { LABEL } from "./parts";

/*
 * Sheet A-301: the chain dimension over the four steps is drawn by the scroll.
 *
 * Desktop: the dimension line grows left to right (scaleX, origin left) while
 * the steps rise from 85% to 40% of the viewport; each tick pops in as the
 * line reaches it and each span label settles in over its bay. Phones: one
 * vertical line down the left edge of the list grows (scaleY) as the list is
 * read. Transform and opacity only, tied to scroll position (no timers), so
 * scrolling back undraws it.
 *
 * Still (reduced motion / Pause): the finished drawing, nothing moves, every
 * label fully opaque. The chain is decorative (aria-hidden); each step also
 * states its span in text for screen readers.
 */

function Tick({ x, progress, still }: { x: number; progress: MotionValue<number>; still: boolean }) {
  const at = x / 100;
  const scale = useTransform(progress, [Math.max(0, at - 0.05), at], [0, 1], { clamp: true });
  const opacity = useTransform(progress, [Math.max(0, at - 0.05), at], [0, 1], { clamp: true });
  const marks = (
    <>
      <span className="absolute left-0 top-0 h-4 w-px -translate-y-1/2 bg-[#9BB8E0]" />
      <span className="absolute left-0 top-0 h-px w-3.5 -translate-x-1/2 -rotate-45 bg-[#9BB8E0]" />
    </>
  );
  if (still) {
    return (
      <span className="absolute top-1/2" style={{ left: `${x}%` }}>
        {marks}
      </span>
    );
  }
  return (
    <motion.span className="absolute top-1/2" style={{ left: `${x}%`, scale, opacity }}>
      {marks}
    </motion.span>
  );
}

function SpanLabel({ text, n, progress, still }: { text: string; n: number; progress: MotionValue<number>; still: boolean }) {
  // Settles once the line has crossed the middle of its bay.
  const at = (n + 0.5) / 4;
  const opacity = useTransform(progress, [at - 0.04, at + 0.06], [0, 1], { clamp: true });
  const y = useTransform(progress, [at - 0.04, at + 0.1], [10, 0], { clamp: true });
  const cls = "block whitespace-nowrap bg-[#0A1B31] px-2 text-[0.875rem] font-medium leading-none text-[#C4D5EC]";
  return (
    <span className="absolute top-1/2" style={{ left: `${12.5 + n * 25}%` }}>
      <span className="block -translate-x-1/2 -translate-y-1/2">
        {still ? (
          <span className={cls}>{text}</span>
        ) : (
          <motion.span className={cls} style={{ opacity, y }}>
            {text}
          </motion.span>
        )}
      </span>
    </span>
  );
}

export function ProcessSteps({ process, L }: { process: ContractorContent["process"]; L: (v: L10n) => string }) {
  const still = useDemoStill();
  const desktop = useIsDesktop();
  const listRef = useRef<HTMLOListElement>(null);
  // Across (desktop): drawn while the steps rise from 85% to 40% of the viewport.
  const { scrollYProgress: across } = useScroll({ target: listRef, offset: ["start 85%", "start 40%"] });
  // Down (phones): the line follows the reader down the list.
  const { scrollYProgress: down } = useScroll({ target: listRef, offset: ["start 75%", "end 75%"] });
  const steps = process.steps;

  return (
    <div className="mt-14 lg:mt-20">
      {/* Chain dimension over the four bays (desktop). */}
      <div aria-hidden="true" className="relative mb-6 hidden h-10 lg:block">
        {still ? (
          <span className="absolute inset-x-0 top-1/2 h-px bg-[#9BB8E0]" />
        ) : (
          <motion.span className="absolute inset-x-0 top-1/2 h-px origin-left bg-[#9BB8E0]" style={{ scaleX: across }} />
        )}
        {[0, 25, 50, 75, 100].map((x) => (
          <Tick key={x} x={x} progress={across} still={still} />
        ))}
        {steps.map((s, n) => (
          <SpanLabel key={s.id} text={L(s.span)} n={n} progress={across} still={still} />
        ))}
      </div>

      <ol ref={listRef} className="relative grid lg:grid-cols-4">
        {/* The same line, run down the left edge on phones. */}
        {still ? (
          <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px bg-[#9BB8E0]/60 lg:hidden" />
        ) : (
          <motion.span
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-[#9BB8E0]/60 lg:hidden"
            style={{ scaleY: down }}
          />
        )}
        {steps.map((s, n) => (
          <li
            key={s.id}
            className="relative flex flex-col pb-12 pl-6 last:pb-0 sm:pl-8 lg:border-l lg:border-[#9BB8E0]/50 lg:pb-0 lg:pl-6 lg:pr-6 lg:last:border-r xl:pl-8 xl:pr-8"
          >
            <span aria-hidden="true" className="absolute -left-[4px] top-0 h-[9px] w-[9px] bg-[#FF7A1A] lg:hidden" />
            <RevealImage
              image={s.image}
              alt={L(s.image.alt)}
              fill
              from="bottom"
              parallax={5}
              delay={desktop ? waveDelay(n, steps.length, 0.32) : 0}
              sizes="(min-width: 1360px) 290px, (min-width: 1024px) 22vw, calc(100vw - 72px)"
              className="aspect-[3/2] w-full bg-[#0F2440] outline outline-1 outline-[#9BB8E0]/40 sm:aspect-[16/10] lg:aspect-[4/5]"
            />
            <p className="mt-6 flex items-baseline gap-3">
              <span className="demo-display text-[3rem] font-extrabold leading-none tabular-nums text-[#FF7A1A]">{String(n + 1).padStart(2, "0")}</span>
              <span className={`${LABEL} text-[0.6875rem] text-[#9BB8E0] lg:sr-only`}>{L(s.span)}</span>
            </p>
            <h3 className="demo-display mt-3 text-[2rem] font-extrabold leading-none text-[#E9F0FA]">{L(s.title)}</h3>
            <p className="mt-4 max-w-[40ch] text-[1rem] leading-relaxed text-[#C4D5EC] lg:pb-6">{L(s.body)}</p>
            <p className="mt-6 border-t border-[#9BB8E0]/35 pt-3 lg:mt-auto">
              <span className={`${LABEL} block text-[0.6875rem] text-[#9BB8E0]`}>{L(process.deliverableLabel)}</span>
              <span className="mt-1.5 block text-[1rem] font-medium leading-snug text-[#E9F0FA]">{L(s.deliverable)}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

