"use client";

/**
 * Oversized editorial type in two rows that slide in opposite directions as
 * the band crosses the screen (CSS scroll-driven; static where unsupported).
 * Decorative only — the same words appear as real text elsewhere on the page.
 */
export function KineticBand({ words, tone = "light" }: { words: readonly string[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const row = [...words, ...words, ...words];
  const item = (w: string, i: number) => (
    <span key={i} className="flex items-center gap-[0.35em]">
      {w}
      <span className="text-[0.45em] text-signal">✳</span>
    </span>
  );
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden border-y py-8 lg:py-12 ${dark ? "border-hairline-dark bg-ink text-bone" : "border-ink bg-bone text-ink"}`}
    >
      <div className="sd-band-left flex w-max gap-[0.35em] whitespace-nowrap font-display text-[clamp(3rem,10vw,9rem)] leading-[1]">
        {row.map(item)}
      </div>
      <div
        className="sd-band-right mt-2 flex w-max gap-[0.35em] whitespace-nowrap font-display text-[clamp(3rem,10vw,9rem)] italic leading-[1] text-transparent"
        style={{ WebkitTextStroke: `1px ${dark ? "#F1EDE4" : "#0D0D0B"}` }}
      >
        {row.map(item)}
      </div>
    </div>
  );
}
