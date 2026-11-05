"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Check, MessageSquareText, PhoneIncoming, PhoneMissed, RotateCcw, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SimulationDisclaimer } from "@/components/ui/SimulationDisclaimer";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { fill } from "@/i18n/types";
import { formatCurrency } from "@/lib/format";
import { EASE_EDITORIAL } from "@/lib/motion";

/** Ordered phases of the scripted timeline. */
const PHASES = ["idle", "ringing", "missed", "typing1", "sms1", "reply", "typing2", "confirm", "logged"] as const;
type Phase = (typeof PHASES)[number];

/** ms offsets from "Simulate" click. */
const TIMELINE: [Phase, number][] = [
  ["ringing", 0],
  ["missed", 1900],
  ["typing1", 2900],
  ["sms1", 4100],
  ["reply", 5600],
  ["typing2", 6500],
  ["confirm", 7600],
  ["logged", 8600],
];

const at = (phase: Phase, min: Phase) => PHASES.indexOf(phase) >= PHASES.indexOf(min);

export function MissedCallSimulator() {
  const { t, locale, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const sim = niche.simulator;
  const [phase, setPhase] = useState<Phase>("idle");
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  // A new industry resets the scenario.
  useEffect(() => {
    clearTimers();
    setPhase("idle");
    setAnnouncement("");
  }, [niche.id, clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const running = phase !== "idle" && phase !== "logged";
  const service = sim.service[locale];
  const time = sim.time[locale];
  const amountLabel = formatCurrency(sim.amount, intlLocale);

  const start = () => {
    if (running) return;
    clearTimers();
    setPhase("idle");
    TIMELINE.forEach(([p, ms]) => {
      timers.current.push(
        window.setTimeout(() => {
          setPhase(p);
          if (p === "ringing") setAnnouncement(fill(t.simulator.announceIncoming, { name: sim.caller }));
          if (p === "missed") setAnnouncement(fill(t.simulator.announceMissed, { name: sim.caller }));
          if (p === "logged")
            setAnnouncement(fill(t.simulator.announceBooked, { name: sim.caller, service, time, amount: amountLabel }));
        }, ms + 30),
      );
    });
  };

  const stepDone = [at(phase, "missed"), at(phase, "sms1"), at(phase, "confirm"), at(phase, "logged")];
  const currentStep = phase === "idle" ? -1 : stepDone.findIndex((d) => !d);

  return (
    <section id="simulator" aria-labelledby="simulator-title" data-theme="dark" className="bg-ink py-24 text-bone lg:py-32">
      <div className="frame">
        <SectionHeader
          tone="dark"
          headingId="simulator-title"
          index={t.simulator.index}
          eyebrow={t.simulator.eyebrow}
          title={t.simulator.title}
          body={t.simulator.body}
        />

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-12 lg:mt-20 lg:gap-x-10">
          {/* ---------- Left: phone ---------- */}
          <Reveal className="col-span-12 md:col-span-6 lg:col-span-5">
            <Phone phase={phase} />
          </Reveal>

          {/* ---------- Right: controls, progress, dashboard ---------- */}
          <div className="col-span-12 flex flex-col gap-8 md:col-span-6 lg:col-span-7">
            <Reveal>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <MagneticButton onClick={start} aria-disabled={running} className="btn-bone px-6 py-4 text-[0.8rem] aria-disabled:cursor-progress">
                  {phase === "logged" ? (
                    <RotateCcw aria-hidden="true" size={15} strokeWidth={1.5} />
                  ) : (
                    <PhoneIncoming aria-hidden="true" size={15} strokeWidth={1.5} />
                  )}
                  {running ? t.simulator.running : phase === "logged" ? t.simulator.replay : t.simulator.button}
                </MagneticButton>
                <p className="font-mono text-micro uppercase text-ash">
                  {niche.label[locale]} · {sim.business}
                </p>
              </div>
            </Reveal>

            {/* Progress */}
            <Reveal delay={0.05}>
              <h3 className="sr-only">{t.simulator.stepsLabel}</h3>
              <ol className="grid grid-cols-2 gap-px border border-hairline-dark bg-hairline-dark sm:grid-cols-4">
                {t.simulator.steps.map((label, i) => {
                  const done = stepDone[i];
                  const current = i === currentStep;
                  return (
                    <li key={label} className="relative overflow-hidden bg-ink p-3">
                      <motion.span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-signal"
                        initial={false}
                        animate={{ scaleX: done ? 1 : current ? 0.4 : 0 }}
                        transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                      />
                      <span className="flex items-center gap-2 font-mono text-[0.68rem] text-ash">
                        {done ? (
                          <Check aria-hidden="true" size={12} strokeWidth={2} className="text-signal" />
                        ) : (
                          <span aria-hidden="true">0{i + 1}</span>
                        )}
                        <span className="sr-only">
                          {i + 1}. {done ? t.simulator.stepDone : current ? t.simulator.stepCurrent : ""}
                        </span>
                      </span>
                      <span className={`mt-1.5 block text-sm leading-snug ${done || current ? "text-bone" : "text-ash"}`}>
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Reveal>

            {/* Mini dashboard tracker */}
            <Reveal delay={0.1}>
              <div role="region" aria-label={t.simulator.dashboardRegionLabel} className="border border-hairline-dark">
                <div className="grid grid-cols-2 border-b border-hairline-dark">
                  <div className="border-r border-hairline-dark p-4">
                    <p className="font-mono text-micro uppercase text-ash">{t.simulator.recovered}</p>
                    <p className="mt-2 font-display text-4xl leading-none text-bone sm:text-5xl">
                      <AnimatedNumber value={phase === "logged" ? sim.amount : 0} format="currency" />
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="font-mono text-micro uppercase text-ash">{t.simulator.responseTime}</p>
                    <p className="mt-2 flex items-center gap-2 font-display text-4xl leading-none text-bone sm:text-5xl">
                      <Zap aria-hidden="true" size={22} strokeWidth={1.25} className="text-signal" />
                      {at(phase, "sms1") ? t.simulator.responseValue : "—"}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-mono text-micro uppercase text-ash">{t.simulator.trackerTitle}</h3>
                  <LayoutGroup>
                    <ul className="mt-3 space-y-2">
                      <AnimatePresence initial={false}>
                        {phase === "logged" ? (
                          <motion.li
                            key={`new-${niche.id}`}
                            layout
                            className="flex items-center justify-between gap-3 border border-signal bg-ink-800 p-3"
                            initial={{ opacity: 0, y: -24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
                          >
                            <div className="min-w-0">
                              <p className="flex flex-wrap items-center gap-2 text-sm text-bone">
                                <span className="bg-signal px-1.5 py-0.5 font-mono text-[0.6rem] uppercase text-ink">
                                  {t.simulator.newBadge}
                                </span>
                                <span className="font-medium">{sim.caller}</span>
                                <span className="text-ash">· {service}</span>
                              </p>
                              <p className="mt-1 font-mono text-[0.65rem] uppercase text-ash">
                                {time} · {t.simulator.source}
                              </p>
                            </div>
                            <span className="shrink-0 font-mono text-sm text-live">+{amountLabel}</span>
                          </motion.li>
                        ) : null}
                        {sim.earlier.map((b) => (
                          <motion.li
                            key={`${niche.id}-${b.name}`}
                            layout
                            transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
                            className="flex items-center justify-between gap-3 border border-hairline-dark p-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-bone">
                                {b.name} <span className="text-ash">· {b.service[locale]}</span>
                              </p>
                              <p className="mt-1 font-mono text-[0.65rem] uppercase text-ash">{t.simulator.earlier}</p>
                            </div>
                            <span className="shrink-0 font-mono text-sm text-ash">{formatCurrency(b.amount, intlLocale)}</span>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </LayoutGroup>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <SimulationDisclaimer tone="dark" className="mt-8" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Phone({ phase }: { phase: Phase }) {
  const { t, locale } = useLanguage();
  const { niche } = useNiche();
  const sim = niche.simulator;
  const vars = { name: sim.caller, business: sim.business, time: sim.time[locale], service: sim.service[locale] };
  const callScreen = phase === "ringing" || phase === "missed";

  return (
    <div role="region" aria-label={t.simulator.phoneRegionLabel} className="sd-rise mx-auto w-full max-w-[330px]">
      <div className="rounded-[2.6rem] border border-hairline-dark bg-ink-800 p-2.5">
        <div className="relative aspect-[9/18.5] overflow-hidden rounded-[2.1rem] bg-[#080807]">
          {/* Status bar */}
          <div aria-hidden="true" className="flex items-center justify-between px-6 pt-4 font-mono text-[0.65rem] text-ash">
            <span>3:12</span>
            <span className="h-4 w-16 rounded-full bg-ink-800" />
            <span>5G</span>
          </div>

          {/* Thread header */}
          <div className="mt-3 border-b border-hairline-dark px-5 pb-3">
            <p className="font-mono text-[0.6rem] uppercase text-ash">{t.simulator.phoneLabel}</p>
            <p className="mt-0.5 truncate text-sm text-bone">{sim.business}</p>
            <p className="mt-0.5 font-mono text-[0.65rem] text-ash">
              ↔ {sim.caller} · {sim.callerNumber}
            </p>
          </div>

          {/* Thread */}
          <div className="flex flex-col gap-2.5 px-4 pt-4">
            <AnimatePresence initial={false}>
              {phase === "idle" ? (
                <motion.p
                  key="idle"
                  className="mt-16 px-4 text-center text-sm leading-relaxed text-ash"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {t.simulator.idleScreen}
                </motion.p>
              ) : null}

              {at(phase, "typing1") && !at(phase, "sms1") ? <Typing key="typing1" side="out" label={t.simulator.typing} /> : null}

              {at(phase, "sms1") ? (
                <Bubble key="sms1" side="out" meta={`${t.simulator.autoTag} · ${t.simulator.responseValue}`}>
                  {fill(t.simulator.smsAuto, vars)}
                </Bubble>
              ) : null}

              {at(phase, "reply") ? (
                <Bubble key="reply" side="in">
                  {t.simulator.smsReply}
                </Bubble>
              ) : null}

              {at(phase, "typing2") && !at(phase, "confirm") ? <Typing key="typing2" side="out" label={t.simulator.typing} /> : null}

              {at(phase, "confirm") ? (
                <Bubble key="confirm" side="out" meta={t.simulator.autoTag}>
                  {fill(t.simulator.smsConfirm, vars)}
                </Bubble>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Call overlay */}
          <AnimatePresence>
            {callScreen ? (
              <motion.div
                key="call"
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#080807]/95 px-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
              >
                <div className="relative grid h-20 w-20 place-items-center">
                  {phase === "ringing"
                    ? [0, 1].map((i) => (
                        <motion.span
                          key={i}
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border border-bone/40"
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 1.9, opacity: 0 }}
                          transition={{ duration: 1.2, repeat: 1, delay: i * 0.5, ease: "easeOut" }}
                        />
                      ))
                    : null}
                  <span
                    className={`relative grid h-16 w-16 place-items-center rounded-full ${phase === "missed" ? "bg-signal text-ink" : "bg-bone text-ink"}`}
                  >
                    {phase === "missed" ? (
                      <PhoneMissed aria-hidden="true" size={26} strokeWidth={1.5} />
                    ) : (
                      <PhoneIncoming aria-hidden="true" size={26} strokeWidth={1.5} />
                    )}
                  </span>
                </div>
                <p className="mt-6 font-mono text-micro uppercase text-ash">
                  {phase === "missed" ? t.simulator.missed : t.simulator.incoming}
                </p>
                <p className="mt-2 font-display text-4xl text-bone">{sim.caller}</p>
                <p className="mt-1 font-mono text-xs text-ash">{sim.callerNumber}</p>
                <p className="mt-6 flex items-center gap-2 border border-hairline-dark px-3 py-2 text-xs text-ash">
                  {phase === "missed" ? (
                    <>
                      <MessageSquareText aria-hidden="true" size={13} strokeWidth={1.5} className="text-signal" />
                      {t.simulator.typing}
                    </>
                  ) : (
                    t.simulator.busy
                  )}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, children, meta }: { side: "in" | "out"; children: string; meta?: string }) {
  const out = side === "out";
  return (
    <motion.div
      layout
      className={`flex max-w-[86%] flex-col ${out ? "self-end items-end" : "self-start items-start"}`}
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE_EDITORIAL }}
      style={{ originX: out ? 1 : 0, originY: 1 }}
    >
      <p
        className={`px-3 py-2 text-[0.8rem] leading-snug ${
          out ? "rounded-2xl rounded-br-sm bg-bone text-ink" : "rounded-2xl rounded-bl-sm bg-ink-600 text-bone"
        }`}
      >
        {children}
      </p>
      {meta ? <span className="mt-1 font-mono text-[0.55rem] uppercase text-ash">{meta}</span> : null}
    </motion.div>
  );
}

function Typing({ side, label }: { side: "in" | "out"; label: string }) {
  return (
    <motion.div
      className={`flex gap-1 rounded-2xl px-3 py-3 ${side === "out" ? "self-end bg-bone/90" : "self-start bg-ink-600"}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
    >
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-ink"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  );
}
