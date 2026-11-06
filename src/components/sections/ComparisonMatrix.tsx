"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Check, X } from "lucide-react";
import { useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";

type Row = { capability: string; brochure: string; engine: string };

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
    <section id="compare" aria-labelledby="compare-title" data-theme="dark" className="relative z-10 bg-ink py-24 text-bone lg:py-32">
      <div className="frame">
        <SectionHeader
          tone="dark"
          headingId="compare-title"
          index={t.compare.index}
          eyebrow={t.compare.eyebrow}
          title={t.compare.title}
          body={t.compare.body}
        />
        <p className="mt-4 font-mono text-micro uppercase text-signal md:pl-[25%]">{t.compare.flipHint}</p>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
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
  const rotateY = useSpring(raw, { stiffness: 120, damping: 22, mass: 0.6 });
  const lift = useTransform(rotateY, [0, 90, 180], [0, 60, 0]);

  const front = (
    <div className="flex h-full flex-col border border-hairline-dark bg-ink-800 p-5">
      <p className="eyebrow text-ash">{brochureLabel}</p>
      <h3 className="mt-3 font-display text-3xl leading-none text-bone">{row.capability}</h3>
      <p className="mt-auto flex gap-3 pt-6 text-ash">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-ash/60">
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
    <div className="flex h-full flex-col bg-bone p-5 text-ink">
      <p className="eyebrow flex items-center gap-2 text-signal-deep">
        <span aria-hidden="true" className="h-2 w-2 bg-signal" />
        {engineLabel}
      </p>
      <p aria-hidden="true" className="mt-3 font-display text-3xl leading-none">
        {row.capability}
      </p>
      <p className="mt-auto flex gap-3 pt-6">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-signal text-ink">
          <Check aria-hidden="true" size={12} strokeWidth={2.5} />
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
      <li ref={ref} className="grid gap-2">
        {front}
        {back}
      </li>
    );
  }

  return (
    <li ref={ref} className="h-[16rem] [perspective:1200px]">
      <motion.div className="relative h-full w-full [transform-style:preserve-3d]" style={{ rotateY, z: lift }}>
        <div className="absolute inset-0 [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</div>
      </motion.div>
    </li>
  );
}
