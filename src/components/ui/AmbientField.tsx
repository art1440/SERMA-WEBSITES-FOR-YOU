/**
 * Ambient light field: the soft "world" that glass surfaces sit in.
 * Glass only reads as glass when there is depth behind it, so every opaque
 * section places one of these behind its content.
 *
 * Dark-first site: the field is a translucent ink wash (so the page-wide
 * light threads glow faintly through) plus static aqua / slate / ember orbs.
 * Deliberately STATIC: moving light behind backdrop-filtered glass forces the
 * blur to be recomputed every frame. Pure CSS gradients — no images, no JS.
 * Usage: parent must be `relative isolate` (and usually `overflow-hidden`).
 * `tone` is kept for API compatibility; both tones render the dark field.
 */
type Props = { tone?: "light" | "dark"; variant?: 0 | 1 | 2; className?: string };

/* Orb colours are token references (channel vars), so the field re-tints with the colour scheme:
   glow = --aqua-glow, deep = --aqua, tint = --amber (a pale wash in light, a deep navy lift in dark). */
const glow = (a: number) => `rgb(var(--aqua-glow) / ${a})`;
const deep = (a: number) => `rgb(var(--aqua) / ${a})`;
const tint = (a: number) => `rgb(var(--amber) / ${a})`;

const ORBS = [
  // [x, y, size(vmax), color]
  [
    ["12%", "18%", 65, glow(0.2)],
    ["88%", "35%", 55, deep(0.07)],
    ["60%", "100%", 70, tint(0.55)],
    ["35%", "60%", 40, glow(0.05)],
  ],
  [
    ["90%", "10%", 60, glow(0.18)],
    ["5%", "70%", 65, tint(0.5)],
    ["55%", "45%", 50, deep(0.06)],
    ["75%", "95%", 45, glow(0.05)],
  ],
  [
    ["50%", "0%", 70, tint(0.5)],
    ["0%", "60%", 55, glow(0.16)],
    ["100%", "75%", 60, deep(0.07)],
    ["50%", "100%", 45, glow(0.04)],
  ],
] as const;

export function AmbientField({ variant = 0, className }: Props) {
  const background = ORBS[variant]
    .map(([x, y, size, color]) => `radial-gradient(${size}vmax ${size * 0.8}vmax at ${x} ${y}, ${color}, transparent 70%)`)
    .join(", ");
  return (
    <div
      aria-hidden="true"
      className={`ambient-field pointer-events-none absolute inset-0 -z-10 bg-ink/[0.86] ${className ?? ""}`}
      style={{ backgroundImage: background }}
    />
  );
}
