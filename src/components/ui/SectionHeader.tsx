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
 * Asymmetric Swiss header: a narrow index rail on the left (mono), a wide
 * editorial headline on the right, separated by an exposed 1px hairline.
 */
export function SectionHeader({ index, eyebrow, title, body, headingId, tone = "light" }: Props) {
  const dark = tone === "dark";
  const lines = typeof title === "string" ? [title] : title;
  return (
    <div className={`grid grid-cols-12 gap-x-4 gap-y-6 border-t pt-6 lg:gap-x-8 ${dark ? "border-hairline-dark" : "border-hairline-light"}`}>
      <Reveal className="col-span-12 md:col-span-3" y={12}>
        <p className={`eyebrow flex items-baseline gap-3 ${dark ? "text-ash" : "text-muted"}`}>
          <span className={dark ? "text-signal" : "text-signal-deep"}>{index}</span>
          <span aria-hidden="true" className={`inline-block h-px w-6 translate-y-[-3px] ${dark ? "bg-ash" : "bg-muted"}`} />
          <span>{eyebrow}</span>
        </p>
      </Reveal>
      <div className="col-span-12 md:col-span-9">
        <RevealLines
          id={headingId}
          lines={lines}
          className={`sd-title-drift font-display text-display-md text-balance ${dark ? "text-bone" : "text-ink"}`}
        />
        {body ? (
          <Reveal delay={0.15} y={16}>
            <p className={`mt-5 max-w-2xl text-pretty text-base leading-relaxed md:text-lg ${dark ? "text-ash" : "text-muted"}`}>
              {body}
            </p>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
