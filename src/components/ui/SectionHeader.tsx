"use client";

import { Reveal, RevealLines } from "./Reveal";

type Props = {
  index: string;
  eyebrow: string;
  title: string | readonly string[];
  body?: string;
  headingId: string;
  tone?: "light" | "dark";
};

/**
 * Section header: a small glass chip ("02 · Label") floating above a calm,
 * wide headline, with the supporting line in a quieter tone. Works on light
 * (chip) and dark (chip-dark) sections.
 */
export function SectionHeader({ index, eyebrow, title, body, headingId, tone = "light" }: Props) {
  const dark = tone === "dark";
  const lines = typeof title === "string" ? [title] : title;
  const number = index.replace(/[()]/g, "").trim();
  return (
    <div className="max-w-5xl">
      <Reveal y={12}>
        <p className={dark ? "chip-dark text-bone" : "chip text-ink"}>
          {/* bone/70 (not ash) on dark: stays ≥4.5:1 even when the chip sits over a warm glow. */}
          <span className={`tabular ${dark ? "text-bone/70" : "text-muted"}`}>{number}</span>
          <span aria-hidden="true" className="h-[5px] w-[5px] shrink-0 rounded-full bg-signal" />
          <span>{eyebrow}</span>
        </p>
      </Reveal>
      <RevealLines
        id={headingId}
        lines={lines}
        className={`mt-5 font-display text-display-md text-balance lg:mt-6 ${dark ? "text-bone" : "text-ink"}`}
      />
      {body ? (
        <Reveal delay={0.15} y={16}>
          <p className={`mt-5 max-w-2xl text-pretty text-base leading-relaxed md:text-lg ${dark ? "text-ash" : "text-muted"}`}>
            {body}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
