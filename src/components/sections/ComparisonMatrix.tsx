"use client";

import { motion, useInView } from "framer-motion";
import { Check, Rotate3d, X } from "lucide-react";
import { useRef } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { EASE_EDITORIAL } from "@/lib/motion";

type Row = { capability: string; brochure: string; engine: string };

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
  "[background:linear-gradient(160deg,rgba(41,59,87,0.9)_0%,rgba(30,46,72,0.92)_55%,rgba(23,37,59,0.92)_100%)_padding-box,linear-gradient(150deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04)_30%,rgba(255,255,255,0.02)_70%,rgba(255,255,255,0.1))_border-box] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_48px_-24px_rgba(0,0,0,0.85)]";
const BACK_FACE =
  `${FACE} text-bone ` +
  "[background:radial-gradient(120%_90%_at_100%_100%,rgba(232,223,207,0.2),transparent_58%)_padding-box,linear-gradient(160deg,rgba(23,37,59,0.95)_0%,rgba(15,26,42,0.95)_55%,rgba(19,32,51,0.95)_100%)_padding-box,linear-gradient(150deg,rgba(243,237,225,0.7),rgba(255,255,255,0.12)_30%,rgba(255,255,255,0.05)_70%,rgba(232,223,207,0.65))_border-box] " +
  "shadow-[inset_0_1px_0_rgba(243,237,225,0.22),inset_0_-1px_0_rgba(0,0,0,0.3),0_12px_24px_-16px_rgba(0,0,0,0.7),0_30px_64px_-28px_rgba(232,223,207,0.4)]";
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
            <FlipCard key={i} index={i} row={row} reduce={reduce} brochureLabel={t.compare.colBrochure} engineLabel={t.compare.colEngine} notIncluded={t.compare.notIncluded} included={t.compare.included} />
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
}: {
  index: number;
  row: Row;
  reduce: boolean;
  brochureLabel: string;
  engineLabel: string;
  notIncluded: string;
  included: string;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const col = index % 4;
  // Flip once the card is mostly on screen; the row flips left to right.
  const shown = useInView(ref, { amount: 0.6, once: true });

  const front = (
    <div className={FRONT_FACE}>
      {/* ash on the smoked body ≥ 5.5:1 */}
      <p className="eyebrow inline-flex items-center gap-2 self-start rounded-full bg-white/[0.05] px-3 py-1 text-ash ring-1 ring-inset ring-white/10">
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
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-aqua shadow-[0_0_8px_1px_rgba(232,223,207,0.55)]" />
        {engineLabel}
      </p>
      <p aria-hidden="true" className={TITLE}>
        {row.capability}
      </p>
      <p className={STATEMENT}>
        <span
          className={`${BADGE} bg-aqua text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_6px_14px_-6px_rgba(232,223,207,0.7)]`}
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

  if (reduce) {
    return (
      <li ref={ref} className="grid gap-3">
        {front}
        {back}
      </li>
    );
  }

  return (
    <li ref={ref} className="[perspective:1200px]">
      {/* Both faces share one grid cell: the card is as tall as its taller face. */}
      <motion.div
        className="relative grid h-full w-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: shown ? 180 : 0 }}
        transition={{ duration: 0.9, delay: shown ? 0.25 + col * 0.12 : 0, ease: EASE_EDITORIAL }}
      >
        <div className="[grid-area:1/1] [-webkit-backface-visibility:hidden] [backface-visibility:hidden]">{front}</div>
        <div className="[grid-area:1/1] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
    </li>
  );
}
