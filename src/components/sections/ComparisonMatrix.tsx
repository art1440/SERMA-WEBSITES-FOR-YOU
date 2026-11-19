"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { Check, Rotate3d, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { EASE_EDITORIAL, SPRING_SMOOTH } from "@/lib/motion";

type Row = { capability: string; brochure: string; engine: string };

/** One-time interactivity hint: set once the wiggle played or any card was flipped by hand. */
const hint = { done: false };

/* ------------------------------------------------------------------ *
 * Flip-card faces (Liquid Glass, see docs/design-system.md).
 *
 * The faces live inside a preserve-3d flip, so they are FLAT glass: no
 * backdrop-filter, no isolation/overflow/filters on the 3D items. Each face
 * is hand-built like the dashboard window: a translucent body on the
 * padding-box plus a light-catching gradient rim on the border-box (no
 * pseudo-elements needed).
 *  - FRONT  "a website that waits": dim, desaturated smoked glass with a
 *           small signal-orange alert accent (the problem state).
 *  - BACK   the engine: deep teal glass with an aqua rim and under-glow.
 * Cards size to their content: both faces share one grid cell, so the
 * card is as tall as its taller face (no fixed height, no empty body).
 * ------------------------------------------------------------------ */
const FACE = "flex h-full flex-col rounded-glass-lg border border-transparent p-5 sm:p-6";
const FRONT_FACE =
  `${FACE} text-bone ` +
  "[background:linear-gradient(160deg,rgb(var(--ink-800)/0.9)_0%,rgb(var(--ink-800)/0.92)_55%,rgb(var(--ink-800)/0.92)_100%)_padding-box,linear-gradient(150deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04)_30%,rgba(255,255,255,0.02)_70%,rgba(255,255,255,0.1))_border-box] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_48px_-24px_rgba(30,64,120,0.35)]";
const BACK_FACE =
  `${FACE} text-bone ` +
  "[background:radial-gradient(120%_90%_at_100%_100%,rgba(42,107,191,0.2),transparent_58%)_padding-box,linear-gradient(160deg,rgb(var(--ink-800)/0.95)_0%,rgb(var(--ink-800)/0.95)_55%,rgb(var(--ink-800)/0.95)_100%)_padding-box,linear-gradient(150deg,rgba(255,255,255,0.7),rgba(255,255,255,0.12)_30%,rgba(255,255,255,0.05)_70%,rgba(42,107,191,0.65))_border-box] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(30,64,120,0.135),0_12px_24px_-16px_rgba(30,64,120,0.315),0_30px_64px_-28px_rgba(42,107,191,0.4)]";
const TITLE = "mt-4 font-display text-2xl leading-[1.05] tracking-[-0.03em] text-balance xl:text-[1.75rem]";
const STATEMENT = "mt-4 flex gap-3 text-[0.9375rem] leading-snug";
const BADGE = "grid h-6 w-6 shrink-0 place-items-center rounded-full";

/**
 * Brochure vs. Growth Engine as 3D flip cards: each card shows the dead
 * brochure side, then flips once to the engine side when it is well into
 * view (a timed flip, staggered across the row). Not scrubbed by scroll, so
 * a card is never left frozen edge-on mid-flip when the visitor stops. Both faces stay in the DOM (screen readers read both); icons are
 * always paired with text.
 */
export function ComparisonMatrix() {
  const { t } = useLanguage();
  const { reduce } = useScene();

  return (
    <section
      id="compare"
      aria-labelledby="compare-title"
      data-theme="dark"
      className="relative isolate z-10 overflow-hidden py-24 text-bone lg:py-32"
    >
      <AmbientField variant={2} />
      <div className="frame">
        <SectionHeader
          tone="dark"
          headingId="compare-title"
          index={t.compare.index}
          eyebrow={t.compare.eyebrow}
          title={t.compare.title}
          body={t.compare.body}
        />
        <p className="chip-dark glass-flat mt-6 text-bone/80">
          <Rotate3d aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0 text-aqua" />
          {t.compare.flipHint}
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-y-8 lg:mt-14 lg:grid-cols-4">
          {t.compare.rows.map((row, i) => (
            <FlipCard key={i} index={i} row={row} reduce={reduce} brochureLabel={t.compare.colBrochure} engineLabel={t.compare.colEngine} notIncluded={t.compare.notIncluded} included={t.compare.included} flipHint={t.compare.flipHint} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function FlipCard({
  index,
  row,
  reduce,
  brochureLabel,
  engineLabel,
  notIncluded,
  included,
  flipHint,
}: {
  index: number;
  row: Row;
  reduce: boolean;
  brochureLabel: string;
  engineLabel: string;
  notIncluded: string;
  included: string;
  flipHint: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const col = index % 4;
  // Flip once the card is mostly on screen; the row flips left to right.
  const shown = useInView(ref, { amount: 0.6, once: true });

  // `flipped` is React state (changes per tap, never per frame); the rotation itself is a
  // MotionValue, so the lift (scale / translateZ) is derived without any re-render.
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);
  const touched = useRef(false); // the visitor flipped this card: stop auto-flipping it
  const rotateY = useMotionValue(0);
  const scale = useTransform(rotateY, [0, 90, 180], [1, 1.02, 1]);
  const z = useTransform(rotateY, [0, 90, 180], [0, 40, 0]);

  const setSide = (next: boolean) => {
    flippedRef.current = next;
    setFlipped(next);
    if (!reduce) animate(rotateY, next ? 180 : 0, SPRING_SMOOTH);
  };

  // Auto-flip to the engine side, then (first card only, once ever) a half-flip wiggle
  // hints that the cards are interactive.
  useEffect(() => {
    if (!shown) return;
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        if (!touched.current) setSide(true);
      }, (0.25 + col * 0.12) * 1000),
    );
    if (index === 0 && !reduce) {
      timers.push(
        window.setTimeout(() => {
          if (touched.current || hint.done) return;
          hint.done = true;
          animate(rotateY, [180, 140, 180], { duration: 0.9, ease: EASE_EDITORIAL });
        }, 2400),
      );
    }
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, reduce]);

  const toggle = () => {
    touched.current = true;
    hint.done = true;
    setSide(!flippedRef.current);
  };

  const front = (
    <div className={FRONT_FACE}>
      {/* ash on the smoked body ≥ 5.5:1 */}
      <p className="eyebrow inline-flex items-center gap-2 self-start rounded-full bg-aqua/[0.065] px-3 py-1 text-ash ring-1 ring-inset ring-bone/[0.14]">
        {/* Small alert accent: this is the problem state. */}
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
        {brochureLabel}
      </p>
      <h3 className={`${TITLE} text-bone/80`}>{row.capability}</h3>
      <p className={`${STATEMENT} text-ash`}>
        <span className={`${BADGE} bg-signal/10 text-signal ring-1 ring-inset ring-signal/30`}>
          <X aria-hidden="true" size={12} strokeWidth={2} />
        </span>
        <span>
          <span className="sr-only">{notIncluded}: </span>
          {row.brochure}
        </span>
      </p>
    </div>
  );

  const back = (
    <div className={BACK_FACE}>
      {/* aqua on the tinted capsule over the teal body ≥ 6.5:1 */}
      <p className="eyebrow inline-flex items-center gap-2 self-start rounded-full bg-aqua/10 px-3 py-1 text-aqua ring-1 ring-inset ring-aqua/25">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-aqua shadow-[0_0_8px_1px_rgba(42,107,191,0.55)]" />
        {engineLabel}
      </p>
      <p aria-hidden="true" className={TITLE}>
        {row.capability}
      </p>
      <p className={STATEMENT}>
        <span
          className={`${BADGE} bg-aqua text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_14px_-6px_rgba(42,107,191,0.7)]`}
        >
          <Check aria-hidden="true" size={13} strokeWidth={2.5} />
        </span>
        <span>
          <span className="sr-only">{included}: </span>
          {row.engine}
        </span>
      </p>
    </div>
  );

  // One real button over the card: tap, click and Enter/Space all land here (the faces
  // stay in the DOM for screen readers).
  const trigger = (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={flipped}
      aria-label={`${row.capability}. ${flipHint}`}
      className="absolute inset-0 z-10 cursor-pointer rounded-glass-lg [-webkit-tap-highlight-color:transparent]"
    />
  );

  if (reduce) {
    // Reduced motion: no flip; the faces cross-fade in place.
    return (
      <li ref={ref} className="relative grid">
        <div className={`[grid-area:1/1] transition-opacity duration-base ${flipped ? "opacity-0" : "opacity-100"}`}>{front}</div>
        <div className={`[grid-area:1/1] transition-opacity duration-base ${flipped ? "opacity-100" : "opacity-0"}`}>{back}</div>
        {trigger}
      </li>
    );
  }

  return (
    <li ref={ref} className="relative [perspective:1000px]">
      {/* Both faces share one grid cell: the card is as tall as its taller face. */}
      <motion.div
        className="relative grid h-full w-full [transform-style:preserve-3d]"
        style={{ rotateY, scale, z }}
      >
        <div className="[grid-area:1/1] [-webkit-backface-visibility:hidden] [backface-visibility:hidden]">{front}</div>
        <div className="[grid-area:1/1] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
      {trigger}
    </li>
  );
}
