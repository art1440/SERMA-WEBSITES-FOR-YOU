/**
 * The brand mark: a faceted core inside an orbit, on a friendly-blue app-icon tile.
 * Colours are CSS variables (set on the <svg> via `style`, since SVG presentation attributes
 * don't reliably resolve var()), so the mark re-tints in dark mode: the tile brightens to the
 * dark accent while the white core keeps its contrast against it.
 * Decorative — the wordmark carries the accessible name.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={`brand-mark ${className ?? ""}`}>
      <rect width="64" height="64" rx="16" style={{ fill: "var(--mark-tile)" }} />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.5" />
      <g transform="rotate(-22 32 32)">
        <ellipse cx="32" cy="32" rx="26" ry="9.5" fill="none" stroke="#CFE5FC" strokeWidth="3.2" strokeDasharray="58 8" strokeDashoffset="-34" />
      </g>
      <polygon points="32,14 47,26 42,46 22,46 17,26" fill="#FFFFFF" />
      <polygon points="32,14 47,26 32,31" fill="#DCEBFB" />
      <polygon points="17,26 32,31 22,46" fill="#BCD9F5" />
      <polygon points="32,31 42,46 22,46" fill="#F2F8FF" />
      <g transform="rotate(-22 32 32)">
        <path d="M6 32 A26 9.5 0 0 0 58 32" fill="none" stroke="#FFFFFF" strokeWidth="3.2" />
      </g>
    </svg>
  );
}

/**
 * SERMA wordmark — Source Serif 4, set firm, wide tracking, always on brand
 * (text colour follows the `bone` token: deep blue in light, soft off-white in dark).
 * One accessible name (sr-only).
 * `tone` is kept for API compatibility and ignored.
 */
export function Wordmark({ size = "md" }: { tone?: "light" | "dark"; size?: "md" | "xl" }) {
  if (size === "xl") {
    return (
      <span className="block leading-none text-bone">
        <span className="sr-only">SERMA</span>
        {/* `sd-wordmark` drives the CSS scroll-linked slide-in — keep it on this element. */}
        <span
          aria-hidden="true"
          className="sd-wordmark block whitespace-nowrap pb-[0.14em] font-serif text-[clamp(2.5rem,10.5vw,9.5rem)] font-semibold uppercase leading-none tracking-[0.06em]"
        >
          SERMA
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-bone">
      <span className="sr-only">SERMA</span>
      <BrandMark className="h-[26px] w-[26px] shrink-0 rounded-[7px] shadow-[0_6px_14px_-6px_rgb(var(--shadow)/0.7)] max-[389px]:hidden" />
      <span aria-hidden="true" className="whitespace-nowrap font-serif text-[1.0625rem] font-semibold uppercase leading-none tracking-[0.18em] sm:text-[1.125rem]">
        SERMA
      </span>
    </span>
  );
}
