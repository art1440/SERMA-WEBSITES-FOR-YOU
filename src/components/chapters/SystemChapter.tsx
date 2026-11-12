"use client";

import { animate, motion, useInView, useMotionValue, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { SectionChip } from "@/components/ui/SectionHeader";
import { EASE_EDITORIAL } from "@/lib/motion";

/** How long each step stays up before the next one plays in. */
const STEP_MS = 4200;
/** After the visitor picks a step by hand, auto-play picks up again after this long. */
const RESUME_MS = 9000;
/** Engine timeline position for step k: its formation has fully assembled (see Engine3D). */
const stepAt = (k: number, count: number) => k / count + 0.15;

/**
 * The System — one screen. Once the section is in view, the four steps play by
 * themselves (Capture → Respond → Book → Return, then loop), spotlighting each step
 * while the 3D engine morphs through its formations on the same timeline.
 *
 * All four steps are on show as cards (2×2 from sm, stacked on phones). Auto-play
 * spotlights one at a time, with a timer line filling across it, and the engine morphs
 * to match; a resting mouse or a tap never freezes it. Control (WCAG 2.2.2): the site-wide Pause, keyboard focus inside the panel holds it,
 * and each card is a button that spotlights it (auto-play resumes ~9s later).
 * Reduced motion: the same four cards, nothing moves.
 *
 * The copy floats on one dark glass panel over the engine and film. Real blur
 * on desktop; on phones the panel keeps the dense tint and drops the blur.
 */
export function SystemChapter() {
  const { t } = useLanguage();
  const { system, reduce } = useScene();
  const { paused } = useMotionPause();
  const steps = t.system.steps;
  const count = steps.length;

  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { amount: 0.4 });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // keyboard focus inside the panel
  const [manual, setManual] = useState(false); // the visitor just picked a step themselves
  const prevActive = useRef(0);
  // 0 → 1 over one step: drives the rail's "story timer" fill and the hand-off to the next step.
  const tick = useMotionValue(0);

  // Leaving the section: rewind to step 1 for the next visit.
  useEffect(() => {
    if (inView) return;
    setActive(0);
    setManual(false);
    tick.set(0);
  }, [inView, tick]);

  // A step picked by hand stays up a while, then auto-play carries on from there.
  useEffect(() => {
    if (!manual) return;
    const id = window.setTimeout(() => setManual(false), RESUME_MS);
    return () => window.clearTimeout(id);
  }, [manual, active]);

  const running = !reduce && inView && !paused && !held && !manual;

  // Auto-advance: the timer runs from wherever it was (a pause holds it, play resumes it).
  useEffect(() => {
    if (!running) return;
    const left = Math.max(0.05, 1 - tick.get());
    const controls = animate(tick, 1, {
      duration: (STEP_MS / 1000) * left,
      ease: "linear",
      onComplete: () => {
        tick.set(0);
        setActive((a) => (a + 1) % count);
      },
    });
    return () => controls.stop();
  }, [running, active, count, tick]);

  // Drive the shared timeline (the engine + architecture film read it).
  useEffect(() => {
    if (reduce) return;
    const wrapped = active < prevActive.current;
    prevActive.current = active;
    const target = inView ? stepAt(active, count) : 0;
    const controls = animate(system.progress, target, {
      duration: inView ? (wrapped ? 1.6 : 1.2) : 0.6,
      ease: EASE_EDITORIAL,
    });
    return () => controls.stop();
  }, [active, inView, reduce, count, system.progress]);

  const pick = (i: number) => {
    tick.set(0);
    setManual(true);
    setActive(i);
  };

  return (
    <section
      id="system"
      ref={system.ref}
      aria-labelledby="system-title"
      data-theme="dark"
      className="relative text-bone motion-safe:min-h-[100svh] motion-safe:scroll-mt-[-5.5rem] motion-reduce:isolate motion-reduce:overflow-hidden motion-reduce:py-24"
    >
      {/* Reduced motion: no 3D stage behind, so the panel sits in a dark light field instead of flat ink. */}
      <AmbientField tone="dark" variant={1} className="hidden motion-reduce:block" />

      <div className="relative motion-safe:min-h-[100svh]">
        {/* Legibility scrim on phones, where the panel sits over the particles */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/85 to-transparent lg:hidden" />

        <div className="frame relative flex flex-col pb-4 pt-20 motion-safe:min-h-[100svh] motion-safe:justify-end sm:pb-10 sm:pt-24 lg:pb-6 lg:pt-20 lg:motion-safe:justify-center">
          <div
            ref={panelRef}
            // Hold only for keyboard focus (so a resting mouse or a tap never freezes the steps).
            onFocus={(e) => {
              if (e.target.matches(":focus-visible")) setHeld(true);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
            }}
            className="glass-dark glass-solid w-full rounded-glass p-4 [--glass-blur:14px] max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] sm:max-w-[40rem] sm:rounded-glass-lg sm:p-7 lg:w-7/12 lg:max-w-[46rem] lg:p-7 xl:p-8">
            <Reveal y={12}>
              <SectionChip index={t.system.index} label={t.system.eyebrow} />
            </Reveal>
            <RevealLines
              id="system-title"
              lines={[t.system.title]}
              className="mt-3 font-display text-[1.75rem] leading-[1.05] text-balance sm:mt-4 sm:text-display-md lg:text-[clamp(1.9rem,2.6vw,2.5rem)]"
            />
            {/* The step cards say the same thing, so the intro only shows where there is room for it. */}
            <p className="mt-4 hidden text-pretty leading-relaxed text-ash sm:block [@media(max-height:960px)]:hidden">{t.system.body}</p>

            <p className="mt-3 text-pretty text-[0.8125rem] font-medium leading-6 text-ash sm:mt-4">
              {t.system.inputs.join(" · ")} →{" "}
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-aqua/[0.12] px-2.5 py-0.5 leading-5 text-bone ring-1 ring-inset ring-aqua/40">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px_2px_rgba(232,223,207,0.55)]" />
                {t.system.core}
              </span>{" "}
              → {t.system.outputs.join(" · ")}
            </p>

            {/* All four steps on show; auto-play spotlights one at a time (and morphs the engine). */}
            <div className="mt-4 border-t border-white/10 pt-4 sm:mt-5 sm:pt-5">
              <p className="eyebrow text-ash">{t.system.stepsHeading}</p>
              <ol className="mt-3 grid grid-cols-2 gap-2 sm:gap-2.5">
                {steps.map((step, i) => (
                  <StepCard
                    key={step.title}
                    index={i}
                    count={count}
                    title={step.title}
                    body={step.body}
                    on={!reduce && i === active}
                    interactive={!reduce}
                    tick={tick}
                    onPick={() => pick(i)}
                  />
                ))}
              </ol>
              {/* Phones: the cards show titles only; the spotlit step's description sits here.
                  (Stacked in one grid cell, so the box is as tall as the longest; each card keeps its own description for screen readers.) */}
              {reduce ? null : (
                <div aria-hidden="true" className="mt-3 grid sm:hidden">
                  {steps.map((step, i) => (
                    <motion.p
                      key={step.title}
                      className="text-pretty text-[0.875rem] leading-snug text-ash [grid-area:1/1]"
                      initial={false}
                      animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : 6 }}
                      transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
                    >
                      {step.body}
                    </motion.p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One step card. The spotlit card brightens, gets the accent ring and a timer line
 * that fills over the step's time on screen. The whole card is clickable through a
 * stretched button (headings can't live inside a <button>); aria-pressed marks the spotlit one.
 */
function StepCard({
  index,
  count,
  title,
  body,
  on,
  interactive,
  tick,
  onPick,
}: {
  index: number;
  count: number;
  title: string;
  body: string;
  on: boolean;
  interactive: boolean;
  tick: MotionValue<number>;
  onPick: () => void;
}) {
  return (
    <li
      className={`relative rounded-[16px] p-3 ring-1 ring-inset sm:rounded-[18px] transition-[background-color,box-shadow] duration-500 sm:p-4 ${
        on ? "bg-white/[0.07] ring-aqua/45 shadow-[0_0_28px_-10px_rgba(232,223,207,0.45)]" : "bg-white/[0.025] ring-white/10"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`text-xs font-medium tabular transition-colors duration-500 ${on ? "text-bone" : "text-ash"}`}>
          0{index + 1}
          <span className="sr-only"> / 0{count}</span>
        </span>
        <span aria-hidden="true" className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-white/10">
          {on ? <motion.span className="absolute inset-0 block origin-left rounded-full bg-aqua" style={{ scaleX: tick }} /> : null}
        </span>
      </div>
      <h3 className={`mt-2 font-display text-xl leading-none sm:text-2xl transition-colors duration-500 ${on ? "text-bone" : "text-bone/80"}`}>{title}</h3>
      <p className={`mt-1.5 text-pretty text-[0.8125rem] leading-snug text-ash ${interactive ? "max-sm:sr-only" : ""}`}>{body}</p>
      {interactive ? (
        <button
          type="button"
          aria-pressed={on}
          aria-label={`0${index + 1} / 0${count}: ${title}`}
          onClick={onPick}
          className="absolute inset-0 rounded-[18px] focus-visible:outline-offset-2"
        />
      ) : null}
    </li>
  );
}
