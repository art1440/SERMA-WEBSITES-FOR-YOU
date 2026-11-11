"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { AmbientField } from "@/components/ui/AmbientField";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { SectionChip } from "@/components/ui/SectionHeader";

/**
 * The System — pinned while scroll drives the 3D engine through four
 * particle formations (scatter → captured → pulse → calendar → orbit).
 * Each step's copy cross-fades in lockstep. All four steps stay in the DOM
 * for screen readers; only their visual opacity changes.
 *
 * The copy floats on one dark glass panel over the engine and film. Real blur
 * on desktop (medium surface over a detailed backdrop); on phones the panel
 * covers most of the screen, so it keeps the dense tint and drops the blur.
 */
export function SystemChapter() {
  const { t } = useLanguage();
  const { system, reduce } = useScene();
  const steps = t.system.steps;

  return (
    <section
      id="system"
      ref={system.ref}
      aria-labelledby="system-title"
      data-theme="dark"
      className="relative text-bone motion-safe:h-[240vh] motion-reduce:isolate motion-reduce:overflow-hidden motion-reduce:py-24"
    >
      {/* Reduced motion: no 3D stage behind, so the panel sits in a dark light field instead of flat ink. */}
      <AmbientField tone="dark" variant={1} className="hidden motion-reduce:block" />

      <div className="relative motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
        {/* Legibility scrim on phones, where the panel sits over the particles */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/85 to-transparent lg:hidden" />

        <div className="frame relative flex h-full flex-col pb-4 pt-20 motion-safe:justify-end sm:pb-10 sm:pt-24 lg:pb-6 lg:pt-20 lg:motion-safe:justify-center">
          <div className="glass-dark glass-solid w-full rounded-glass p-4 [--glass-blur:14px] max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] sm:max-w-[34rem] sm:rounded-glass-lg sm:p-8 lg:w-6/12 lg:max-w-[36rem]">
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
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px_2px_rgba(61,219,201,0.55)]" />
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
                <StepRail progress={system.progress} count={steps.length} />
                <ol className="relative h-[11.5rem] sm:h-[10.5rem]">
                  {steps.map((step, i) => (
                    <Step key={step.title} index={i} count={steps.length} progress={system.progress} title={step.title} body={step.body} />
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
  progress,
  title,
  body,
}: {
  index: number;
  count: number;
  progress: MotionValue<number>;
  title: string;
  body: string;
}) {
  const a = index / count;
  const b = (index + 1) / count;
  const first = index === 0;
  const last = index === count - 1;
  const input = first ? [0, b - 0.04, b + 0.01] : last ? [a - 0.01, a + 0.04, 1] : [a - 0.01, a + 0.04, b - 0.04, b + 0.01];
  const opacityOut = first ? [1, 1, 0] : last ? [0, 1, 1] : [0, 1, 1, 0];
  const yOut = first ? [0, 0, -36] : last ? [36, 0, 0] : [36, 0, 0, -36];
  const opacity = useTransform(progress, input, opacityOut);
  const y = useTransform(progress, input, yOut);

  return (
    <motion.li className="absolute inset-0" style={{ opacity, y }}>
      <p className="text-[0.8125rem] font-medium leading-5 tabular text-ash">
        <span className="text-bone">0{index + 1}</span> / 0{count}
      </p>
      <h3 className="mt-2 font-display text-[2.5rem] leading-none sm:text-5xl">{title}</h3>
      <p className="mt-3 max-w-sm text-pretty text-[0.9375rem] leading-relaxed text-ash sm:text-base">{body}</p>
    </motion.li>
  );
}

/** Slim rounded track: aqua fill grows with scroll; each round marker lights as the fill reaches it. */
function StepRail({ progress, count }: { progress: MotionValue<number>; count: number }) {
  const fill = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div aria-hidden="true" className="relative h-[11.5rem] w-[3px] rounded-full bg-white/10 sm:h-[10.5rem]">
      <motion.span
        className="absolute inset-0 block origin-top rounded-full bg-gradient-to-b from-aqua-deep to-aqua"
        style={{ scaleY: fill }}
      />
      {Array.from({ length: count }).map((_, i) => (
        <RailMarker key={i} progress={progress} at={i / (count - 1)} />
      ))}
    </div>
  );
}

function RailMarker({ progress, at }: { progress: MotionValue<number>; at: number }) {
  const lit = useTransform(progress, [at - 0.03, at], [0, 1]);
  return (
    <span
      className="absolute left-1/2 grid h-3 w-3 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink-800 ring-1 ring-inset ring-white/25"
      style={{ top: `${at * 100}%` }}
    >
      <motion.span
        className="block h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px_1px_rgba(61,219,201,0.7)]"
        style={{ opacity: lit }}
      />
    </span>
  );
}
