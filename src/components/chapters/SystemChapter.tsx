"use client";

import { animate, motion, useInView, useTransform, type MotionValue } from "framer-motion";
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
/** Engine timeline position for step k: its formation has fully assembled (see Engine3D). */
const stepAt = (k: number, count: number) => k / count + 0.15;

/**
 * The System — one screen. Once the section is in view, the four steps play by
 * themselves (Capture → Respond → Book → Return, then loop), cross-fading the copy
 * while the 3D engine morphs through its formations on the same timeline.
 *
 * Control (WCAG 2.2.2): the site-wide Pause stops it, hovering or focusing the
 * panel holds it, and each rail marker is a button that jumps to that step (which
 * also stops the auto-play until the section is left). All four steps stay in the
 * DOM for screen readers; reduced motion shows them as a static list.
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
  const inView = useInView(panelRef, { amount: 0.5 });
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false); // pointer over / focus inside the panel
  const [manual, setManual] = useState(false); // the visitor picked a step themselves
  const prevActive = useRef(0);

  // Leaving the section: rewind to step 1 for the next visit and hand control back to auto-play.
  useEffect(() => {
    if (inView) return;
    setActive(0);
    setManual(false);
  }, [inView]);

  // Auto-advance while on screen, unless paused, held or chosen by hand.
  useEffect(() => {
    if (reduce || !inView || paused || held || manual) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % count), STEP_MS);
    return () => window.clearTimeout(id);
  }, [reduce, inView, paused, held, manual, active, count]);

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
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setHeld(true);
            }}
            onPointerLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
            }}
            className="glass-dark glass-solid w-full rounded-glass p-4 [--glass-blur:14px] max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] sm:max-w-[34rem] sm:rounded-glass-lg sm:p-8 lg:w-6/12 lg:max-w-[36rem]">
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
                <StepRail
                  progress={system.progress}
                  count={count}
                  active={active}
                  titles={steps.map((st) => st.title)}
                  label={t.system.eyebrow}
                  onPick={pick}
                />
                <ol className="relative h-[11.5rem] sm:h-[10.5rem]">
                  {steps.map((step, i) => (
                    <Step key={step.title} index={i} count={count} active={active} title={step.title} body={step.body} />
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

function Step({
  index,
  count,
  active,
  title,
  body,
}: {
  index: number;
  count: number;
  active: number;
  title: string;
  body: string;
}) {
  const on = index === active;
  return (
    <motion.li
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : index < active ? -24 : 24 }}
      transition={{ duration: on ? 0.7 : 0.45, delay: on ? 0.15 : 0, ease: EASE_EDITORIAL }}
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
 * Slim rounded track: the fill follows the shared timeline, and each marker is a button
 * (32px hit area) that jumps to its step. aria-pressed marks the step on screen.
 */
function StepRail({
  progress,
  count,
  active,
  titles,
  label,
  onPick,
}: {
  progress: MotionValue<number>;
  count: number;
  active: number;
  titles: string[];
  label: string;
  onPick: (i: number) => void;
}) {
  const fill = useTransform(progress, [stepAt(0, count), stepAt(count - 1, count)], [0, 1]);
  return (
    <div role="group" aria-label={label} className="relative h-[11.5rem] w-[3px] rounded-full bg-white/10 sm:h-[10.5rem]">
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 block origin-top rounded-full bg-gradient-to-b from-aqua-deep to-aqua"
        style={{ scaleY: fill }}
      />
      {titles.map((title, i) => {
        const lit = i <= active;
        return (
          <button
            key={title}
            type="button"
            aria-pressed={i === active}
            aria-label={`0${i + 1} / 0${count}: ${title}`}
            onClick={() => onPick(i)}
            className="group absolute left-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
            style={{ top: `${(i / (count - 1)) * 100}%` }}
          >
            <span className="grid h-3 w-3 place-items-center rounded-full bg-ink-800 ring-1 ring-inset ring-white/25 transition-transform duration-200 group-hover:scale-125">
              <motion.span
                className="block h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px_1px_rgba(232,223,207,0.7)]"
                initial={false}
                animate={{ opacity: lit ? 1 : 0, scale: lit ? 1 : 0.4 }}
                transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
