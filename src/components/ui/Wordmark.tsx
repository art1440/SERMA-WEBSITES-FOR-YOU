/** SermaWebDesign wordmark — editorial serif + technical mono, one accessible name. */
export function Wordmark({ tone = "light", size = "md" }: { tone?: "light" | "dark"; size?: "md" | "xl" }) {
  const dark = tone === "dark";
  if (size === "xl") {
    return (
      <span className={`block leading-none ${dark ? "text-bone" : "text-ink"}`}>
        <span className="sr-only">SermaWebDesign</span>
        <span aria-hidden="true" className="font-display text-[clamp(4rem,16vw,15rem)] tracking-[-0.03em]">
          Serma<span className="italic">Web</span>Design
        </span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${dark ? "text-bone" : "text-ink"}`}>
      <span className="sr-only">SermaWebDesign</span>
      <span aria-hidden="true" className="font-display text-[1.65rem] leading-none tracking-[-0.01em]">
        Serma
      </span>
      <span aria-hidden="true" className="font-mono text-[0.62rem] uppercase tracking-[0.22em]">
        WebDesign
      </span>
    </span>
  );
}
