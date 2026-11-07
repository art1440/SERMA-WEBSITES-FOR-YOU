"use client";

import { Reveal, RevealLines } from "./Reveal";

type Props = {
  index: string;
  eyebrow: string;
  title: string | readonly string[];
  body?: string;
  headingId: string;
  /** A wider headline measure (72rem instead of 64rem), e.g. for a pinned stage where a wrapped title costs height. */
  wide?: boolean;
  /** Kept for API compatibility only: the site is dark-first, so every header renders the dark treatment. */
  tone?: "light" | "dark";
};

type SectionChipProps = {
  /** Section index as it appears in the dictionary, e.g. "(02)" or "02". Parentheses are stripped. */
  index: string;
  /** Eyebrow label, e.g. "Built for". */
  label: string;
  className?: string;
};

/**
 * Section eyebrow chip, the one grammar used for every section index:
 * "02 ● Label". Flat dark glass (no backdrop blur: chips sit over soft fields
 * or inside other glass, where blur is invisible cost). The number is bone,
 * the label ash (5.8:1 on the flat tint), the dot is the aqua accent.
 */
export function SectionChip({ index, label, className }: SectionChipProps) {
  const number = index.replace(/[()]/g, "").trim();
  return (
    <p className={`chip-dark glass-flat text-ash${className ? ` ${className}` : ""}`}>
      <span className="tabular text-bone">{number}</span>
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-aqua shadow-[0_0_8px_1px_rgba(61,219,201,0.6)]" />
      <span>{label}</span>
    </p>
  );
}

/**
 * Section header: the section chip floating above a calm, wide headline, with
 * the supporting line in a quieter tone. Always dark (bone headline, ash body).
 */
export function SectionHeader({ index, eyebrow, title, body, headingId, wide = false }: Props) {
  const lines = typeof title === "string" ? [title] : title;
  return (
    <div className={wide ? "max-w-6xl" : "max-w-5xl"}>
      <Reveal y={12}>
        <SectionChip index={index} label={eyebrow} />
      </Reveal>
      <RevealLines id={headingId} lines={lines} className="mt-5 font-display text-display-md text-balance text-bone lg:mt-6" />
      {body ? (
        <Reveal delay={0.15} y={16}>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ash md:text-lg">{body}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
