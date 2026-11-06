"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { Reveal, RevealLines } from "@/components/ui/Reveal";

/**
 * The System — pinned while scroll drives the 3D engine through four
 * particle formations (scatter → captured → pulse → calendar → orbit).
 * Each step's copy cross-fades in lockstep. All four steps stay in the DOM
 * for screen readers; only their visual opacity changes.
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
      className="relative text-bone motion-safe:h-[240vh] motion-reduce:bg-ink motion-reduce:py-24"
    >
      <div className="relative motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
        {/* Legibility scrim on phones, where copy sits over the particles */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/85 to-transparent lg:hidden" />

        <div className="frame relative flex h-full flex-col pb-10 pt-24 motion-safe:justify-end lg:motion-safe:justify-center">
          <div className="lg:w-5/12">
            <Reveal y={12}>
              <p className="eyebrow flex items-baseline gap-3 text-ash">
                <span className="text-signal">{t.system.index}</span>
                <span aria-hidden="true" className="inline-block h-px w-6 translate-y-[-3px] bg-ash" />
                <span>{t.system.eyebrow}</span>
              </p>
            </Reveal>
            <RevealLines id="system-title" lines={[t.system.title]} className="mt-5 font-display text-display-md text-balance" />
            <p className="mt-4 hidden max-w-md text-pretty leading-relaxed text-ash sm:block">{t.system.body}</p>

            <p className="mt-5 font-mono text-micro uppercase text-ash">
              {t.system.inputs.join(" · ")} <span className="text-signal">→ {t.system.core} →</span> {t.system.outputs.join(" · ")}
            </p>

            {reduce ? (
              <ol className="mt-8 space-y-6 border-t border-hairline-dark pt-6">
                {steps.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-x-4">
                    <span className="font-mono text-sm text-signal">0{i + 1}</span>
                    <div>
                      <h3 className="font-display text-3xl leading-none">{step.title}</h3>
                      <p className="mt-2 leading-relaxed text-ash">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="mt-8 grid grid-cols-[auto_1fr] gap-x-6">
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
      <p className="font-mono text-micro uppercase text-signal">
        0{index + 1} / 0{count}
      </p>
      <h3 className="mt-2 font-display text-5xl leading-none">{title}</h3>
      <p className="mt-3 max-w-sm text-pretty leading-relaxed text-ash">{body}</p>
    </motion.li>
  );
}

function StepRail({ progress, count }: { progress: MotionValue<number>; count: number }) {
  const fill = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div aria-hidden="true" className="relative h-[11.5rem] w-px bg-hairline-dark sm:h-[10.5rem]">
      <motion.span className="absolute inset-x-0 top-0 block h-full origin-top bg-signal" style={{ scaleY: fill }} />
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute -left-[3px] h-[7px] w-[7px] border border-signal bg-ink"
          style={{ top: `calc(${(i / (count - 1)) * 100}% - 3px)` }}
        />
      ))}
    </div>
  );
}
