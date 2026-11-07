"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Check, Rotate3d, X } from "lucide-react";
import { useRef } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { MOTION } from "@/lib/motion";

type Row = { capability: string; brochure: string; engine: string };

/* ------------------------------------------------------------------ *
 * Flip-card faces (Liquid Glass, see docs/design-system.md).
 *
 * The faces live inside a preserve-3d flip, so they are FLAT glass: no
 * backdrop-filter, no isolation/overflow/filters on the 3D items. Each face
 * is hand-built like the dashboard window: a translucent body on the
 * padding-box plus a light-catching gradient rim on the border-box (no
 * pseudo-elements needed).
 *  - FRONT  "a website that waits": dim, desaturated smoked glass.
 *  - BACK   the engine: bright bone glass with a warm under-glow.
 * ------------------------------------------------------------------ */
const FACE = "flex h-full flex-col rounded-glass-lg border border-transparent p-5 sm:p-6";
const FRONT_FACE =
  `${FACE} text-bone ` +
  "[background:linear-gradient(160deg,rgba(46,46,44,0.9)_0%,rgba(26,26,25,0.92)_55%,rgba(33,33,32,0.92)_100%)_padding-box,linear-gradient(150deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04)_30%,rgba(255,255,255,0.02)_70%,rgba(255,255,255,0.1))_border-box] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_48px_-24px_rgba(0,0,0,0.85)]";
const BACK_FACE =
  `${FACE} text-ink ` +
  "[background:radial-gradient(120%_90%_at_100%_100%,rgba(240,163,92,0.24),transparent_58%)_padding-box,linear-gradient(160deg,rgba(255,253,249,0.97)_0%,rgba(247,243,235,0.96)_50%,rgba(239,233,222,0.97)_100%)_padding-box,linear-gradient(150deg,#ffffff,rgba(255,255,255,0.45)_30%,rgba(214,207,192,0.55)_70%,rgba(240,163,92,0.8))_border-box] " +
  "shadow-[inset_0_1px_0_#ffffff,inset_0_-1px_0_rgba(13,13,11,0.05),0_12px_24px_-16px_rgba(0,0,0,0.6),0_30px_64px_-28px_rgba(229,88,42,0.5)]";
const TITLE = "mt-4 font-display text-2xl leading-[1.05] tracking-[-0.03em] text-balance xl:text-[1.75rem]";
const STATEMENT = "mt-auto flex gap-3 pt-5 text-[0.9375rem] leading-snug";
const BADGE = "grid h-6 w-6 shrink-0 place-items-center rounded-full";

/**
 * Brochure vs. Growth Engine as 3D flip cards: each card shows the dead
 * brochure side, then flips to the engine side as it scrolls through the
 * viewport. Both faces stay in the DOM (screen readers read both); icons are
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
      <AmbientField tone="dark" variant={2} />
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
          <Rotate3d aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0 text-signal" />
          {t.compare.flipHint}
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${0.92 - col * 0.04}`, `start ${0.42 - col * 0.04}`] as unknown as ["start end", "start start"],
  });
  const raw = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotateY = useSpring(raw, MOTION.smooth);
  const lift = useTransform(rotateY, [0, 90, 180], [0, 60, 0]);

  const front = (
    <div className={FRONT_FACE}>
      {/* ash on the smoked body ≥ 5.5:1 */}
      <p className="eyebrow inline-flex items-center gap-2 self-start rounded-full bg-white/[0.05] px-3 py-1 text-ash ring-1 ring-inset ring-white/10">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-ash/60" />
        {brochureLabel}
      </p>
      <h3 className={`${TITLE} text-bone/80`}>{row.capability}</h3>
      <p className={`${STATEMENT} text-ash`}>
        <span className={`${BADGE} bg-white/[0.04] ring-1 ring-inset ring-white/15`}>
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
      {/* signal-deep on the white capsule ≥ 5.5:1 */}
      <p className="eyebrow inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1 text-signal-deep shadow-[inset_0_0_0_1px_rgba(178,63,20,0.14),0_1px_2px_rgba(13,13,11,0.06)]">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
        {engineLabel}
      </p>
      <p aria-hidden="true" className={TITLE}>
        {row.capability}
      </p>
      <p className={STATEMENT}>
        <span
          className={`${BADGE} bg-signal text-ink shadow-[inset_0_1px_0_rgba(255,220,190,0.65),0_6px_14px_-6px_rgba(178,63,20,0.75)]`}
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
    <li ref={ref} className="h-[17rem] [perspective:1200px]">
      <motion.div className="relative h-full w-full [transform-style:preserve-3d]" style={{ rotateY, z: lift }}>
        <div className="absolute inset-0 [-webkit-backface-visibility:hidden] [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </motion.div>
    </li>
  );
}
