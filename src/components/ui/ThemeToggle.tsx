"use client";

import { useRef, type MouseEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { setScheme } from "@/lib/theme";
import { useColorScheme } from "@/lib/useColorScheme";

/** A crescent moon in both modes: outline in light, filled with a warm glow and stars in dark. */
const MOON = "M20.6 14.2A8.6 8.6 0 1 1 9.8 3.4a7 7 0 0 0 10.8 10.8Z";
/** Tiny stars beside the moon: [cx, cy, r]. They fade and scale in with a 40ms stagger. */
const STARS = [
  [19.2, 4.6, 1],
  [21.4, 8.4, 0.7],
  [15.6, 2.8, 0.6],
] as const;

type Props = {
  /** "icon" = the 44px round bar button; "menu" = the full-width mobile-menu row. */
  variant?: "icon" | "menu";
  className?: string;
  onToggled?: () => void;
};

/**
 * Dark-mode toggle. The visual state is driven purely by `html.dark` (Tailwind `dark:`), so it never
 * flashes; React state only feeds aria-pressed. The accessible name stays constant ("Switch to dark
 * mode") and aria-pressed carries the state. Under prefers-reduced-motion everything is instant.
 */
export function ThemeToggle({ variant = "icon", className = "", onToggled }: Props) {
  const { t } = useLanguage();
  const scheme = useColorScheme();
  const moonRef = useRef<SVGGElement>(null);

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Tilt about -30deg and settle back; the per-keyframe easing gives the overshoot on the return.
    if (!reduce && typeof moonRef.current?.animate === "function") {
      moonRef.current.animate(
        [{ transform: "rotate(0deg)" }, { transform: "rotate(-30deg)", offset: 0.35 }, { transform: "rotate(0deg)" }],
        { duration: 450, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      );
    }
    setScheme(scheme === "dark" ? "light" : "dark", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    onToggled?.();
  };

  const base =
    variant === "icon"
      ? "btn-line-dark btn-sm glass-flat h-11 w-11 shrink-0 p-0"
      : "btn-line-dark glass-flat w-full";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={scheme === "dark"}
      aria-label={t.common.darkMode}
      title={t.common.darkMode}
      className={`${base} theme-toggle motion-reduce:!transition-none ${className}`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" className="overflow-visible">
        {/* Stars sit outside the rotating group so only the moon tilts. */}
        {STARS.map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="rgb(var(--star))"
            className="origin-center scale-0 opacity-0 transition-[opacity,transform] duration-300 [transform-box:fill-box] motion-reduce:!transition-none dark:scale-100 dark:opacity-100"
            style={{ transitionDelay: `${i * 40}ms` }}
          />
        ))}
        <g ref={moonRef} className="[transform-box:fill-box] [transform-origin:center]">
          {/* Outline moon (light) */}
          <path
            d={MOON}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
            className="opacity-100 transition-opacity duration-300 motion-reduce:!transition-none dark:opacity-0"
          />
          {/* Filled warm moon with a soft glow (dark) */}
          <path
            d={MOON}
            fill="rgb(var(--star))"
            className="opacity-0 transition-opacity duration-300 [filter:drop-shadow(0_0_5px_rgb(var(--star)/0.55))] motion-reduce:!transition-none dark:opacity-100"
          />
        </g>
      </svg>
      {variant === "menu" ? t.common.darkMode : null}
    </button>
  );
}
