/**
 * The engine mark (same drawing as the browser-tab icon): faceted core inside
 * the signal orbit, on a soft app-icon tile. Decorative — the wordmark carries
 * the accessible name.
 */
function EngineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <rect width="64" height="64" rx="16" fill="#0D0D0B" />
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="1.5" />
      <g transform="rotate(-22 32 32)">
        <ellipse cx="32" cy="32" rx="26" ry="9.5" fill="none" stroke="#E5582A" strokeWidth="3.2" strokeDasharray="58 8" strokeDashoffset="-34" />
      </g>
      <polygon points="32,14 47,26 42,46 22,46 17,26" fill="#F1EDE4" />
      <polygon points="32,14 47,26 32,31" fill="#D6CFC0" />
      <polygon points="17,26 32,31 22,46" fill="#A8A296" />
      <polygon points="32,31 42,46 22,46" fill="#E6E0D4" />
      <g transform="rotate(-22 32 32)">
        <path d="M6 32 A26 9.5 0 0 0 58 32" fill="none" stroke="#E5582A" strokeWidth="3.2" />
      </g>
    </svg>
  );
}

/**
 * SermaWebDesign wordmark — a modern Geist lockup: "Serma" set firm,
 * "WebDesign" lighter and quieter. One accessible name (sr-only).
 */
export function Wordmark({ tone = "light", size = "md" }: { tone?: "light" | "dark"; size?: "md" | "xl" }) {
  const dark = tone === "dark";
  if (size === "xl") {
    return (
      <span className={`block leading-none ${dark ? "text-bone" : "text-ink"}`}>
        <span className="sr-only">SermaWebDesign</span>
        {/* `sd-wordmark` drives the CSS scroll-linked slide-in — keep it on this element. */}
        <span
          aria-hidden="true"
          className="sd-wordmark block whitespace-nowrap pb-[0.14em] font-sans text-[clamp(2.75rem,11.4vw,10.75rem)] leading-none tracking-[-0.055em]"
        >
          <span
            className={`font-semibold ${
              dark ? "bg-gradient-to-b from-bone via-bone to-bone/70 bg-clip-text text-transparent" : ""
            }`}
          >
            Serma
          </span>
          <span
            className={`font-light ${
              dark ? "bg-gradient-to-b from-ash to-ash/55 bg-clip-text text-transparent" : "text-muted"
            }`}
          >
            WebDesign
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2 ${dark ? "text-bone" : "text-ink"}`}>
      <span className="sr-only">SermaWebDesign</span>
      <EngineMark className="h-[26px] w-[26px] shrink-0 rounded-[7px] shadow-[0_6px_14px_-6px_rgba(13,13,11,0.55)] max-[389px]:hidden" />
      <span aria-hidden="true" className="whitespace-nowrap font-sans text-[1.125rem] leading-none tracking-[-0.035em] sm:text-[1.25rem]">
        <span className="font-semibold">Serma</span>
        <span className={`font-normal ${dark ? "text-ash" : "text-muted"}`}>WebDesign</span>
      </span>
    </span>
  );
}
