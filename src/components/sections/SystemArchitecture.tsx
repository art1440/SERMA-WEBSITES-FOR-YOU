"use client";

import { motion } from "framer-motion";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";

export function SystemArchitecture() {
  const { t } = useLanguage();

  return (
    <section id="system" aria-labelledby="system-title" data-theme="dark" className="bg-ink py-24 text-bone lg:py-32">
      <div className="frame">
        <SectionHeader
          tone="dark"
          headingId="system-title"
          index={t.system.index}
          eyebrow={t.system.eyebrow}
          title={t.system.title}
          body={t.system.body}
        />

        <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-12 lg:mt-20 lg:gap-x-8">
          {/* Architecture motion graphic + routing schema */}
          <Reveal className="col-span-12 lg:col-span-7">
            <figure>
              <AmbientVideo
                src="/media/architecture"
                poster="/media/architecture-poster.jpg"
                label={t.system.videoLabel}
                className="aspect-video w-full border border-hairline-dark"
                videoClassName="sd-parallax"
              />
              <figcaption className="mt-3 font-mono text-micro uppercase text-ash">{t.system.figure}</figcaption>
            </figure>

            {/* Routing schema: In → Engine → Out. Lines "draw" with scaleX (transform only). */}
            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
              <RouteColumn label={t.system.inputsLabel} items={t.system.inputs} align="left" />
              <div className="relative flex items-center">
                <motion.span
                  aria-hidden="true"
                  className="block h-px w-6 origin-left bg-ash sm:w-12"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.2 }}
                />
                <motion.p
                  className="border border-signal px-3 py-3 text-center font-mono text-[0.68rem] uppercase leading-tight tracking-[0.08em] text-bone sm:px-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.5 }}
                >
                  {t.system.core}
                </motion.p>
                <motion.span
                  aria-hidden="true"
                  className="block h-px w-6 origin-left bg-ash sm:w-12"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={VIEWPORT_ONCE}
                  transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.8 }}
                />
              </div>
              <RouteColumn label={t.system.outputsLabel} items={t.system.outputs} align="right" />
            </div>
          </Reveal>

          {/* Four-step engine */}
          <ol className="col-span-12 border-t border-hairline-dark lg:col-span-5">
            {t.system.steps.map((step, i) => (
              <motion.li
                key={step.title}
                className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-hairline-dark py-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: i * 0.08 }}
              >
                <span className="font-mono text-sm text-signal">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-3xl leading-none">{step.title}</h3>
                  <p className="mt-2 text-pretty leading-relaxed text-ash">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function RouteColumn({ label, items, align }: { label: string; items: readonly string[]; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="eyebrow text-ash">{label}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item, i) => (
          <motion.li
            key={item}
            className="text-sm text-bone sm:text-base"
            initial={{ opacity: 0, x: align === "left" ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT_ONCE}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: (align === "left" ? 0 : 0.9) + i * 0.08 }}
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
