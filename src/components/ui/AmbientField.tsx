/**
 * Ambient light field: the soft, warm "world" that glass surfaces sit in.
 * Glass only reads as glass when there is depth behind it, so every opaque
 * section places one of these behind its content.
 *
 * Deliberately STATIC: moving light behind backdrop-filtered glass forces the
 * blur to be recomputed every frame. Pure CSS gradients — no images, no JS.
 * Usage: parent must be `relative isolate` (and usually `overflow-hidden`).
 */
type Props = { tone?: "light" | "dark"; variant?: 0 | 1 | 2; className?: string };

const LIGHT = [
  // [x, y, size(vmax), color]
  [
    ["12%", "18%", 70, "rgba(240,163,92,0.32)"],
    ["88%", "30%", 60, "rgba(229,88,42,0.16)"],
    ["55%", "95%", 75, "rgba(232,220,198,0.9)"],
    ["30%", "60%", 45, "rgba(255,255,255,0.7)"],
  ],
  [
    ["85%", "15%", 65, "rgba(240,163,92,0.3)"],
    ["10%", "75%", 60, "rgba(229,88,42,0.13)"],
    ["50%", "40%", 55, "rgba(255,255,255,0.75)"],
    ["70%", "100%", 70, "rgba(232,220,198,0.85)"],
  ],
  [
    ["50%", "0%", 75, "rgba(240,163,92,0.26)"],
    ["0%", "55%", 55, "rgba(232,220,198,0.95)"],
    ["100%", "70%", 60, "rgba(229,88,42,0.14)"],
    ["45%", "80%", 50, "rgba(255,255,255,0.7)"],
  ],
] as const;

const DARK = [
  [
    ["15%", "20%", 65, "rgba(122,46,18,0.55)"],
    ["85%", "35%", 55, "rgba(229,88,42,0.2)"],
    ["60%", "100%", 70, "rgba(43,52,64,0.55)"],
    ["40%", "55%", 40, "rgba(240,163,92,0.08)"],
  ],
  [
    ["90%", "10%", 60, "rgba(229,88,42,0.22)"],
    ["5%", "70%", 65, "rgba(122,46,18,0.5)"],
    ["55%", "45%", 50, "rgba(43,52,64,0.45)"],
    ["75%", "95%", 45, "rgba(240,163,92,0.1)"],
  ],
  [
    ["50%", "0%", 70, "rgba(122,46,18,0.5)"],
    ["0%", "60%", 55, "rgba(43,52,64,0.5)"],
    ["100%", "75%", 60, "rgba(229,88,42,0.18)"],
    ["50%", "100%", 45, "rgba(240,163,92,0.08)"],
  ],
] as const;

export function AmbientField({ tone = "light", variant = 0, className }: Props) {
  const orbs = (tone === "dark" ? DARK : LIGHT)[variant];
  const background = orbs
    .map(([x, y, size, color]) => `radial-gradient(${size}vmax ${size * 0.8}vmax at ${x} ${y}, ${color}, transparent 70%)`)
    .join(", ");
  return (
    <div
      aria-hidden="true"
      className={`ambient-field pointer-events-none absolute inset-0 -z-10 ${tone === "dark" ? "bg-ink" : "bg-bone"} ${className ?? ""}`}
      style={{ backgroundImage: background }}
    />
  );
}
