"use client";

import { animate, motion, useInView, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { SectionChip } from "@/components/ui/SectionHeader";

/** Seconds each step holds before the next one plays. */
const DWELL = 4.6;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/**
 * The System — a normal-height section (no scroll pin). While it's on screen,
 * a timeline plays the four steps on its own: the copy cross-fades, the rail
 * fills toward the next marker like a countdown, and the 3D engine morphs
 * through its formations (it reads the same `system.progress` value).
 * After "Return" the rail rewinds and the loop starts over.
 *
 * Hover or focus pauses it; markers jump to a step. Offscreen, hidden tab or the
 * site-wide pause switch stop the clock. All four steps stay in the DOM for
 * screen readers; only their visual opacity changes.
 */
export function SystemChapter() {
  const { t } = useLanguage();
  const { system, reduce } = useScene();
  const { paused } = useMotionPause();
  const steps = t.system.steps;
  const count = steps.length;
  const progress = system.progress;

  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { amount: 0.35 });
  const [step, setStep] = useState(0);
  const [held, setHeld] = useState(false);
  const live = inView && !paused && !reduce;
  const running = live && !held;

  useEffect(() => {
    // `live`: glide the rail to the chosen step (marker jumps work even while hovered).
    // `running`: also count down and advance. Hover only freezes the countdown.
    if (!live) return;
    const start = step / count;
    const end = (step + 1) / count;
    let ctrl: { stop: () => void } | undefined;
    const play = () => {
      if (!running) return;
      const remaining = Math.max(0, end - progress.get()) * count * DWELL;
      ctrl = animate(progress, end, {
        duration: remaining,
        ease: "linear",
        onComplete: () => setStep((s) => (s + 1) % count),
      });
    };
    const p = progress.get();
    if (p < start - 0.001 || p > end) {
      // Jumped (marker click) or looping back from the last step: glide the rail there first.
      ctrl = animate(progress, start, { duration: p > end && step === 0 ? 1.1 : 0.7, ease: EASE_IN_OUT, onComplete: play });
    } else {
      play();
    }
    return () => ctrl?.stop();
  }, [live, running, step, count, progress]);

  return (
    <section
      id="system"
      ref={system.ref}
      aria-labelledby="system-title"
      data-theme="dark"
      className="relative isolate text-bone motion-reduce:overflow-hidden motion-reduce:py-24"
    >
      {/* Reduced motion: no 3D stage behind, so the panel sits in a dark light field instead of flat ink. */}
      <AmbientField tone="dark" variant={1} className="hidden motion-reduce:block" />

      <div className="relative">
        {/* Legibility scrim on phones, where the panel sits over the particles */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/85 to-transparent lg:hidden" />

        <div className="frame relative flex flex-col pb-4 pt-20 motion-safe:min-h-[100svh] motion-safe:justify-end sm:pb-10 sm:pt-24 lg:pb-6 lg:pt-20 lg:motion-safe:justify-center">
          <div
            ref={panelRef}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHeld(false)}
            className="glass-dark glass-solid w-full rounded-glass p-4 [--glass-blur:26px] max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] sm:max-w-[34rem] sm:rounded-glass-lg sm:p-8 lg:w-6/12 lg:max-w-[36rem]"
          >
            <Reveal y={12}>
              <SectionChip index={t.system.index} label={t.system.eyebrow} />
            </Reveal>
            <RevealLines
              id="system-title"
              lines={[t.system.title]}
              className="mt-4 font-display text-display-md text-balance sm:mt-5 lg:text-[clamp(1.9rem,3vw,2.75rem)]"
            />
            <p className="mt-4 hidden text-pretty leading-relaxed text-ash sm:block">{t.system.body}</p>

            <p className="mt-3 text-pretty text-[0.8125rem] font-medium leading-6 text-ash sm:mt-4">
              {t.system.inputs.join(" · ")} →{" "}
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-aqua/[0.12] px-2.5 py-0.5 leading-5 text-bone ring-1 ring-inset ring-aqua/40">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px_2px_rgba(232,223,207,0.55)]" />
                {t.system.core}
              </span>{" "}
              → {t.system.outputs.join(" · ")}
            </p>

            {reduce ? (
              <ol className="mt-6 space-y-6 border-t border-white/10 pt-6">
                {steps.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[2.75rem_1fr] gap-x-4">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-sm font-medium tabular text-bone ring-1 ring-inset ring-aqua/50">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-3xl leading-none">{step.title}</h3>
                      <p className="mt-2 leading-relaxed text-ash">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 border-t border-white/10 pt-5 sm:mt-6 sm:gap-x-6 sm:pt-6">
                <StepRail progress={progress} steps={steps} active={step} onSelect={setStep} />
                <ol className="relative h-[11.5rem] sm:h-[10.5rem]">
                  {steps.map((s, i) => (
                    <Step key={s.title} index={i} count={count} active={step} title={s.title} body={s.body} />
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ index, count, active, title, body }: { index: number; count: number; active: number; title: string; body: string }) {
  const on = index === active;
  // Outgoing steps lift away; incoming rise from below. The loop back to 01 enters from below too.
  const y = on ? 0 : index < active ? -28 : 28;
  return (
    <motion.li
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y, filter: on ? "blur(0px)" : "blur(6px)" }}
      transition={on ? { duration: 0.7, delay: 0.12, ease: EASE_OUT } : { duration: 0.35, ease: EASE_IN_OUT }}
    >
      <p className="text-[0.8125rem] font-medium leading-5 tabular text-ash">
        <span className="text-bone">0{index + 1}</span> / 0{count}
      </p>
      <h3 className="mt-2 font-display text-[2.5rem] leading-none sm:text-5xl">{title}</h3>
      <p className="mt-3 max-w-sm text-pretty text-[0.9375rem] leading-relaxed text-ash sm:text-base">{body}</p>
    </motion.li>
  );
}

/**
 * Slim rounded track. The fill creeps toward the next marker while a step holds
 * (a quiet countdown), and each marker lights as the fill reaches it.
 * Markers are buttons: click/tap to jump to that step.
 */
function StepRail({
  progress,
  steps,
  active,
  onSelect,
}: {
  progress: MotionValue<number>;
  steps: readonly { title: string }[];
  active: number;
  onSelect: (i: number) => void;
}) {
  const count = steps.length;
  const fill = useTransform(progress, (p) => Math.min(1, (p * count) / (count - 1)));
  return (
    <div className="relative h-[11.5rem] w-[3px] rounded-full bg-white/10 sm:h-[10.5rem]">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 block origin-top rounded-full bg-gradient-to-b from-aqua-deep to-aqua"
        style={{ scaleY: fill }}
      />
      {steps.map((s, i) => (
        <RailMarker
          key={s.title}
          fill={fill}
          at={i / (count - 1)}
          current={i === active}
          label={`0${i + 1} — ${s.title}`}
          onClick={() => onSelect(i)}
        />
      ))}
    </div>
  );
}

function RailMarker({
  fill,
  at,
  current,
  label,
  onClick,
}: {
  fill: MotionValue<number>;
  at: number;
  current: boolean;
  label: string;
  onClick: () => void;
}) {
  const lit = useTransform(fill, [at - 0.035, at - 0.005], [0, 1]);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={current ? "step" : undefined}
      className="group absolute left-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-none"
      style={{ top: `${at * 100}%` }}
    >
      <span
        className={`grid h-3 w-3 place-items-center rounded-full bg-ink-800 ring-1 ring-inset transition-[transform,box-shadow] duration-300 ease-out group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-aqua ${
          current ? "scale-125 ring-aqua/70" : "ring-white/25"
        }`}
      >
        <motion.span
          className="block h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px_1px_rgba(232,223,207,0.7)]"
          style={{ opacity: lit }}
        />
      </span>
    </button>
  );
}
