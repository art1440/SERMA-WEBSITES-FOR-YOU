"use client";

import { motion, type MotionValue } from "framer-motion";
import { BellRing, CalendarCheck, MessageSquareText, PhoneMissed, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const ICONS: LucideIcon[] = [PhoneMissed, MessageSquareText, CalendarCheck, BellRing];
const STEP_MS = 1300;
const HOLD_MS = 2600;

/**
 * Hero "booking flow" card: a missed call becoming a booking, one step at a
 * time. A floating dark-glass panel over the 3D engine (real blur, bounded
 * size). Clearly captioned as an illustration (FTC): no live data.
 *
 * Accessibility: a <figure> with a caption and an ordered list, so screen
 * readers get the four steps as plain text. The sequence is visual only
 * (opacity/transform); it stops with "Pause animations" and is static under
 * reduced motion (all steps shown as done).
 */
export function HeroFlowCard({ opacity, className }: { opacity?: MotionValue<number>; className?: string }) {
  const { t } = useLanguage();
  const reduce = useReducedMotionSafe();
  const { paused } = useMotionPause();
  const steps = t.hero.flow.steps;
  const still = reduce || paused;
  // -1 = nothing yet; 0…3 = steps reached.
  const [reached, setReached] = useState(steps.length - 1);

  useEffect(() => {
    if (still) {
      setReached(steps.length - 1);
      return;
    }
    let i = -1;
    let timer = 0;
    const tick = () => {
      i = i >= steps.length - 1 ? -1 : i + 1;
      setReached(i);
      timer = window.setTimeout(tick, i === steps.length - 1 ? HOLD_MS : i === -1 ? 500 : STEP_MS);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [still, steps.length]);

  return (
    <motion.figure
      style={opacity ? { opacity } : undefined}
      aria-labelledby="hero-flow-title"
      className={`glass-dark rounded-glass-lg p-5 [--glass-blur:18px] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p id="hero-flow-title" className="text-[0.9375rem] font-medium tracking-[-0.01em] text-bone">
          {t.hero.flow.title}
        </p>
        <span aria-hidden="true" className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px_2px_rgba(232,223,207,0.6)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
        </span>
      </div>

      <ol className="relative mt-4 space-y-1">
        {steps.map((step, i) => {
          const Icon = ICONS[i];
          const on = i <= reached;
          const current = i === reached && !still;
          const alert = i === 0;
          return (
            <li key={step.label} className="relative grid grid-cols-[2.25rem_1fr] items-center gap-3 py-1.5">
              {/* Connector to the next step: fills (scaleY) once this step is reached. */}
              {i < steps.length - 1 ? (
                <span aria-hidden="true" className="absolute left-[1.0625rem] top-[2.6rem] h-[calc(100%-1.9rem)] w-[2px] overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="block h-full w-full origin-top rounded-full bg-gradient-to-b from-aqua to-aqua-deep"
                    initial={false}
                    animate={{ scaleY: i < reached ? 1 : 0 }}
                    transition={{ duration: still ? 0 : 0.5, ease: EASE_EDITORIAL }}
                  />
                </span>
              ) : null}
              <span className="relative grid h-9 w-9 place-items-center">
                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/15" />
                {/* Idle icon (bone) and lit disc + ink icon cross-fade: opacity/scale only, no colour animation. */}
                <motion.span
                  aria-hidden="true"
                  className="relative grid place-items-center text-bone/70"
                  initial={false}
                  animate={{ opacity: on ? 0 : 1 }}
                  transition={{ duration: still ? 0 : 0.3 }}
                >
                  <Icon size={16} strokeWidth={1.9} />
                </motion.span>
                <motion.span
                  aria-hidden="true"
                  className={`absolute inset-0 grid place-items-center rounded-full text-ink ${
                    alert ? "bg-signal shadow-[0_0_16px_2px_rgba(229,88,42,0.45)]" : "bg-aqua shadow-[0_0_16px_2px_rgba(232,223,207,0.45)]"
                  }`}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
                  transition={{ duration: still ? 0 : 0.45, ease: EASE_EDITORIAL }}
                >
                  <Icon size={16} strokeWidth={1.9} />
                </motion.span>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-5 text-bone">{step.label}</span>
                <span className="block text-[0.8125rem] leading-5 text-ash">{step.meta}</span>
              </span>
              {current ? (
                <motion.span
                  aria-hidden="true"
                  layoutId="hero-flow-current"
                  className="pointer-events-none absolute -inset-x-2 inset-y-0 -z-10 rounded-glass-sm bg-white/[0.05] ring-1 ring-inset ring-white/10"
                  transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <figcaption className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-ash">{t.hero.flow.caption}</figcaption>
    </motion.figure>
  );
}
