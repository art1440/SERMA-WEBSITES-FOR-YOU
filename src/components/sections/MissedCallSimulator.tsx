"use client";

import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useTransform } from "framer-motion";
import { ArrowDown, Check, MessageSquareText, PhoneIncoming, PhoneMissed, RotateCcw, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { FitStage } from "@/components/ui/FitStage";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SimulationDisclaimer } from "@/components/ui/SimulationDisclaimer";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { useScene, useTrackProgress } from "@/context/SceneContext";
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

/** Scroll-scrubbed mode: where each phase begins along the pinned track (0 → 1). */
const SCROLL_STARTS: [Phase, number][] = [
  ["logged", 0.8],
  ["confirm", 0.69],
  ["typing2", 0.61],
  ["reply", 0.53],
  ["sms1", 0.4],
  ["typing1", 0.32],
  ["missed", 0.21],
  ["ringing", 0.08],
];
const phaseAt = (v: number): Phase => SCROLL_STARTS.find(([, start]) => v >= start)?.[0] ?? "idle";

/* ------------------------------------------------------------------ *
 * Liquid Glass finish — static decorative gradients only (no filters,
 * no animated colour). Everything below sits inside 3D-rotated wrappers
 * on desktop, so every glass surface here is `glass-flat` (no backdrop
 * blur, which would flatten the 3D).
 * ------------------------------------------------------------------ */

/** Light-catching 1px rim around the device: bright top-left, warm bottom-right. */
const DEVICE_RIM =
  "linear-gradient(150deg, rgba(255,255,255,0.62), rgba(255,255,255,0.1) 26%, rgba(255,255,255,0.03) 60%, rgba(240,163,92,0.4))";
/** Glossy dark titanium body. */
const DEVICE_BODY = "linear-gradient(160deg, #302e2a 0%, #181715 40%, #0f0f0d 68%, #24221e 100%)";
/** Warm halo and soft contact shadow that give the device depth on the light field. */
const DEVICE_HALO = "radial-gradient(closest-side, rgba(229,88,42,0.2), rgba(122,46,18,0.12) 55%, transparent)";
const DEVICE_SHADOW = "radial-gradient(closest-side, rgba(0,0,0,0.62), transparent)";
/** Screen wallpaper: near-black with an ember glow (top) and slate glow (bottom). */
const SCREEN_WALLPAPER =
  "radial-gradient(120% 55% at 100% 0%, rgba(229,88,42,0.17), transparent 62%), radial-gradient(120% 60% at 0% 100%, rgba(43,52,64,0.55), transparent 66%), linear-gradient(180deg, #0e0e0c, #080807)";
/** Diagonal glare across the cover glass. */
const SCREEN_GLARE = "linear-gradient(118deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.016) 30%, rgba(255,255,255,0) 44%)";
/** Call-screen glows: warm while ringing, signal once missed (cross-faded with opacity). */
const CALL_GLOW_INCOMING = "radial-gradient(90% 55% at 50% 0%, rgba(240,163,92,0.24), transparent 72%)";
const CALL_GLOW_MISSED = "radial-gradient(90% 55% at 50% 0%, rgba(229,88,42,0.36), transparent 72%)";

/** Outgoing bubble: bone "light glass" with a specular top edge. */
const BONE_GLASS =
  "bg-gradient-to-b from-[#FBF8F2] to-bone-200 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(13,13,11,0.06),0_10px_22px_-12px_rgba(0,0,0,0.85)]";
/** Inner surface for cards nested inside a glass panel (level 2: tint + hairline ring, not another glass). */
const INNER_SURFACE = "bg-white/[0.035] ring-1 ring-inset ring-white/[0.08]";

export function MissedCallSimulator() {
  const { t, locale, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const sim = niche.simulator;
  const [phase, setPhase] = useState<Phase>("idle");
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef<number[]>([]);
  const { reduce, desktop } = useScene();
  const track = useTrackProgress();
  const scrubbed = desktop && !reduce; // desktop: scroll plays the story; phones: tap to play
  const p = track.progress;

  // 3D: the phone swings in, faces you for the call, then leans toward the dashboard.
  const phoneRotateY = useTransform(p, [0, 0.1, 0.45, 0.8, 1], [42, 0, -8, 10, 0]);
  const phoneRotateX = useTransform(p, [0, 0.1, 0.6, 1], [14, 0, 4, 0]);
  const phoneZ = useTransform(p, [0, 0.1, 0.21, 0.3, 0.8, 1], [-300, 0, 60, 0, 0, -40]);
  const panelRotateY = useTransform(p, [0, 0.12, 0.8, 0.9], [-30, -10, -10, 0]);
  const panelZ = useTransform(p, [0, 0.12, 0.8, 0.9], [-240, -80, -80, 0]);
  const panelX = useTransform(p, [0, 0.12], [120, 0]);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  // A new industry resets the scenario (or re-syncs it to the scroll position).
  useEffect(() => {
    clearTimers();
    setPhase(scrubbed ? phaseAt(p.get()) : "idle");
    setAnnouncement("");
  }, [niche.id, clearTimers, scrubbed, p]);

  // Scroll-scrubbed playback: state changes only when a phase boundary is crossed.
  useMotionValueEvent(p, "change", (v) => {
    if (!scrubbed) return;
    const next = phaseAt(v);
    if (next === phaseRef.current) return;
    setPhase(next);
    if (next === "ringing") setAnnouncement(fill(t.simulator.announceIncoming, { name: sim.caller }));
    if (next === "logged")
      setAnnouncement(fill(t.simulator.announceBooked, { name: sim.caller, service: sim.service[locale], time: sim.time[locale], amount: formatCurrency(sim.amount, intlLocale) }));
  });

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

  // `overflow-clip` (not hidden): clips like overflow-hidden but is not a scroll
  // container, so the pinned (sticky) stage inside keeps working.
  return (
    <section
      id="simulator"
      ref={track.ref}
      aria-labelledby="simulator-title"
      data-theme="dark"
      className="relative isolate z-10 overflow-clip py-24 text-bone lg:py-32 motion-safe:lg:h-[240vh] motion-safe:lg:py-0"
    >
      <AmbientField tone="dark" variant={1} />
      <div className="motion-safe:lg:sticky motion-safe:lg:top-0 motion-safe:lg:h-[100svh] motion-safe:lg:overflow-hidden motion-safe:lg:pb-4 motion-safe:lg:pt-20">
      <FitStage enabled={scrubbed} className="frame">
        <SectionHeader
          tone="dark"
          headingId="simulator-title"
          index={t.simulator.index}
          eyebrow={t.simulator.eyebrow}
          title={t.simulator.title}
          body={scrubbed ? undefined : t.simulator.body}
        />

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <div className={`grid grid-cols-12 gap-x-4 gap-y-12 [perspective:1600px] lg:gap-x-10 ${scrubbed ? "mt-6" : "mt-14 lg:mt-20"}`}>
          {/* ---------- Left: phone ---------- */}
          <Reveal className="col-span-12 md:col-span-6 lg:col-span-5">
            <motion.div style={scrubbed ? { rotateY: phoneRotateY, rotateX: phoneRotateX, z: phoneZ } : undefined}>
              <Phone phase={phase} />
            </motion.div>
          </Reveal>

          {/* ---------- Right: controls, progress, dashboard ---------- */}
          <motion.div
            className="col-span-12 flex flex-col gap-6 md:col-span-6 lg:col-span-7"
            style={scrubbed ? { rotateY: panelRotateY, z: panelZ, x: panelX, transformOrigin: "100% 50%" } : undefined}
          >
            <Reveal>
              {scrubbed ? (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="chip-dark glass-flat text-bone">
                    <ArrowDown aria-hidden="true" size={14} strokeWidth={1.75} className="text-signal" />
                    {t.simulator.scrollHint}
                  </span>
                  <span className="chip-dark glass-flat text-ash">
                    <span className="text-bone/85">{niche.label[locale]}</span> · {sim.business}
                  </span>
                </p>
              ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <MagneticButton
                  onClick={start}
                  aria-disabled={running}
                  className="btn-bone whitespace-normal text-center aria-disabled:cursor-progress sm:whitespace-nowrap"
                >
                  {phase === "logged" ? (
                    <RotateCcw aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                  ) : (
                    <PhoneIncoming aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                  )}
                  {running ? t.simulator.running : phase === "logged" ? t.simulator.replay : t.simulator.button}
                </MagneticButton>
                <p className="chip-dark glass-flat self-start text-ash sm:self-auto">
                  <span className="text-bone/85">{niche.label[locale]}</span> · {sim.business}
                </p>
              </div>
              )}
            </Reveal>

            {/* Progress: four glass chips, each with a rounded fill line. */}
            <Reveal delay={0.05}>
              <h3 className="sr-only">{t.simulator.stepsLabel}</h3>
              <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                {t.simulator.steps.map((label, i) => {
                  const done = stepDone[i];
                  const current = i === currentStep;
                  return (
                    <li
                      key={label}
                      className={`glass-dark glass-flat flex flex-col rounded-glass p-3 sm:p-3.5 ${current ? "border-signal/50" : ""}`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold tabular ${
                            done
                              ? "bg-gradient-to-b from-[#F07A4F] to-signal text-ink shadow-[inset_0_1px_0_rgba(255,225,200,0.7),0_6px_14px_-6px_rgba(229,88,42,0.8)]"
                              : current
                                ? "bg-signal/15 text-bone ring-1 ring-inset ring-signal/70 shadow-[0_0_16px_-3px_rgba(229,88,42,0.75)]"
                                : "bg-white/[0.05] text-ash ring-1 ring-inset ring-white/10"
                          }`}
                        >
                          {done ? <Check size={13} strokeWidth={2.5} /> : `0${i + 1}`}
                        </span>
                        <span className="sr-only">
                          {i + 1}. {done ? t.simulator.stepDone : current ? t.simulator.stepCurrent : ""}
                        </span>
                      </span>
                      <span className={`mt-2.5 block text-sm leading-snug ${done || current ? "text-bone" : "text-ash"}`}>
                        {label}
                      </span>
                      <span aria-hidden="true" className="mt-auto block pt-3">
                        <span className="block h-[3px] overflow-hidden rounded-full bg-white/10">
                          <motion.span
                            className="block h-full origin-left rounded-full bg-gradient-to-r from-amber to-signal"
                            initial={false}
                            animate={{ scaleX: done ? 1 : current ? 0.4 : 0 }}
                            transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                          />
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </Reveal>

            {/* Mini dashboard tracker: one flat dark-glass card (dense tint for small text). */}
            <Reveal delay={0.1}>
              <div
                role="region"
                aria-label={t.simulator.dashboardRegionLabel}
                className="glass-dark glass-flat glass-solid rounded-glass-lg p-3 sm:p-4"
              >
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-1 lg:grid-cols-2">
                  <div className={`min-w-0 rounded-glass-sm p-3.5 sm:p-4 ${INNER_SURFACE}`}>
                    <p className="eyebrow text-ash">{t.simulator.recovered}</p>
                    <p className="mt-3 font-display text-[clamp(1.6rem,8vw,2.25rem)] leading-none tracking-[-0.035em] text-bone tabular xl:text-5xl">
                      <AnimatedNumber value={phase === "logged" ? sim.amount : 0} format="currency" />
                    </p>
                  </div>
                  <div className={`min-w-0 rounded-glass-sm p-3.5 sm:p-4 ${INNER_SURFACE}`}>
                    <p className="eyebrow text-ash">{t.simulator.responseTime}</p>
                    <p className="mt-3 flex items-center gap-2.5 font-display text-[clamp(1.6rem,8vw,2.25rem)] leading-none tracking-[-0.035em] text-bone xl:text-5xl">
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-signal/15 ring-1 ring-inset ring-signal/40 xl:h-10 xl:w-10"
                      >
                        <Zap size={16} strokeWidth={1.75} className="text-signal" />
                      </span>
                      {at(phase, "sms1") ? t.simulator.responseValue : "—"}
                    </p>
                  </div>
                </div>
                <div className="px-1 pb-1 pt-5">
                  <h3 className="eyebrow text-ash">{t.simulator.trackerTitle}</h3>
                  <LayoutGroup>
                    <ul className="mt-3 space-y-2">
                      <AnimatePresence initial={false}>
                        {phase === "logged" ? (
                          <motion.li
                            key={`new-${niche.id}`}
                            layout
                            className="flex items-center justify-between gap-3 rounded-glass-sm bg-signal/10 p-3 shadow-[0_14px_32px_-16px_rgba(229,88,42,0.65)] ring-1 ring-inset ring-signal/45"
                            initial={{ opacity: 0, y: -24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                aria-hidden="true"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#F07A4F] to-signal text-sm font-semibold text-ink shadow-[inset_0_1px_0_rgba(255,225,200,0.7)]"
                              >
                                {sim.caller.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-bone">
                                  <span className="rounded-full bg-signal px-2 py-0.5 text-[0.6875rem] font-semibold leading-4 text-ink shadow-[inset_0_1px_0_rgba(255,225,200,0.6)]">
                                    {t.simulator.newBadge}
                                  </span>
                                  <span className="font-medium">{sim.caller}</span>
                                  <span className="text-ash">· {service}</span>
                                </p>
                                <p className="mt-1 text-xs text-ash">
                                  <span className="tabular">{time}</span> · {t.simulator.source}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 text-sm font-semibold tabular text-live">+{amountLabel}</span>
                          </motion.li>
                        ) : null}
                        {sim.earlier.map((b) => (
                          <motion.li
                            key={`${niche.id}-${b.name}`}
                            layout
                            transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
                            className={`flex items-center justify-between gap-3 rounded-glass-sm p-3 ${INNER_SURFACE}`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                aria-hidden="true"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.07] text-sm font-semibold text-bone/85 ring-1 ring-inset ring-white/10"
                              >
                                {b.name.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm text-bone">
                                  {b.name} <span className="text-ash">· {b.service[locale]}</span>
                                </p>
                                <p className="mt-1 text-xs text-ash">{t.simulator.earlier}</p>
                              </div>
                            </div>
                            <span className="shrink-0 text-sm font-medium tabular text-ash">{formatCurrency(b.amount, intlLocale)}</span>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </LayoutGroup>
                </div>
              </div>
            </Reveal>
          </motion.div>
        </div>

        <SimulationDisclaimer tone="dark" className={scrubbed ? "mt-4" : "mt-8"} />
      </FitStage>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Hardware buttons on the device edge (decorative). */
const SIDE_KEYS = [
  "-left-[2px] top-[15%] h-6 rounded-l-[2px]",
  "-left-[2px] top-[22%] h-11 rounded-l-[2px]",
  "-left-[2px] top-[30%] h-11 rounded-l-[2px]",
  "-right-[2px] top-[25%] h-16 rounded-r-[2px]",
] as const;

function Phone({ phase }: { phase: Phase }) {
  const { t, locale } = useLanguage();
  const { niche } = useNiche();
  const sim = niche.simulator;
  const vars = { name: sim.caller, business: sim.business, time: sim.time[locale], service: sim.service[locale] };
  const callScreen = phase === "ringing" || phase === "missed";

  return (
    <div role="region" aria-label={t.simulator.phoneRegionLabel} className="relative isolate mx-auto w-full max-w-[330px]">
      {/* Depth: warm halo behind the device and a soft contact shadow under it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[46%] -z-10 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ backgroundImage: DEVICE_HALO }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-7 left-1/2 -z-10 h-12 w-[78%] -translate-x-1/2 rounded-[50%]"
        style={{ backgroundImage: DEVICE_SHADOW }}
      />
      {SIDE_KEYS.map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`pointer-events-none absolute w-[3px] bg-gradient-to-b from-[#5c5952] via-[#2f2d29] to-[#48453f] ${pos}`}
        />
      ))}

      {/* Frame: a 1px light-catching rim around a glossy dark body. */}
      <div
        className="rounded-[2.75rem] p-px shadow-[0_60px_100px_-45px_rgba(0,0,0,0.95),0_30px_60px_-36px_rgba(122,46,18,0.7)]"
        style={{ backgroundImage: DEVICE_RIM }}
      >
        <div
          className="rounded-[calc(2.75rem_-_1px)] p-[9px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(0,0,0,0.5)]"
          style={{ backgroundImage: DEVICE_BODY }}
        >
          <div className="relative isolate aspect-[9/18.5] overflow-hidden rounded-[2.125rem] bg-[#080807] ring-1 ring-white/[0.05]">
            <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ backgroundImage: SCREEN_WALLPAPER }} />

            {/* Status bar */}
            <div aria-hidden="true" className="relative flex items-center justify-between px-6 pt-3.5 text-[0.7rem] font-semibold tabular text-bone/85">
              <span className="w-12">3:12</span>
              <span className="h-[1.45rem] w-[5.6rem] rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
              <span className="flex w-12 items-center justify-end gap-1.5">
                5G
                <span className="relative block h-[9px] w-[19px] rounded-[3px] ring-1 ring-inset ring-bone/50">
                  <span className="absolute inset-y-[2px] left-[2px] right-[5px] rounded-[1px] bg-bone/85" />
                </span>
              </span>
            </div>

            {/* Thread header: a floating glass bar, iOS style. */}
            <div className="glass-dark glass-flat mx-3 mt-2.5 rounded-[1.35rem] px-4 py-2.5 text-center">
              <p className="text-[0.625rem] font-medium leading-4 text-ash">{t.simulator.phoneLabel}</p>
              <p className="truncate text-sm font-semibold leading-5 tracking-[-0.01em] text-bone">{sim.business}</p>
              <p className="truncate text-[0.65rem] leading-4 text-ash">
                ↔ {sim.caller} · <span className="font-mono tabular">{sim.callerNumber}</span>
              </p>
            </div>

            {/* Thread */}
            <div className="relative flex flex-col gap-2 px-3.5 pt-4">
              <AnimatePresence initial={false}>
                {phase === "idle" ? (
                  <motion.p
                    key="idle"
                    className="mt-14 flex flex-col items-center gap-3 px-5 text-center text-[0.8125rem] leading-relaxed text-ash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-bone/70 ring-1 ring-inset ring-white/10"
                    >
                      <MessageSquareText size={18} strokeWidth={1.5} />
                    </span>
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

            {/* Call overlay: frosted dark glass (flat — it lives inside the 3D-rotated wrapper). */}
            <AnimatePresence>
              {callScreen ? (
                <motion.div
                  key="call"
                  className="glass-dark glass-flat absolute inset-0 flex flex-col items-center justify-center rounded-[2.125rem] px-6 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] transition-opacity duration-700 ease-editorial ${phase === "missed" ? "opacity-0" : "opacity-100"}`}
                    style={{ backgroundImage: CALL_GLOW_INCOMING }}
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] transition-opacity duration-700 ease-editorial ${phase === "missed" ? "opacity-100" : "opacity-0"}`}
                    style={{ backgroundImage: CALL_GLOW_MISSED }}
                  />
                  <div className="relative grid h-20 w-20 place-items-center">
                    {phase === "ringing"
                      ? [0, 1].map((i) => (
                          <motion.span
                            key={i}
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-bone/10 ring-1 ring-inset ring-bone/30"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 1.9, opacity: 0 }}
                            transition={{ duration: 1.2, repeat: 1, delay: i * 0.5, ease: "easeOut" }}
                          />
                        ))
                      : null}
                    <span
                      className={`relative grid h-16 w-16 place-items-center rounded-full text-ink ${
                        phase === "missed"
                          ? "bg-gradient-to-b from-[#F07A4F] to-signal shadow-[inset_0_1px_0_rgba(255,225,200,0.75),0_14px_34px_-10px_rgba(229,88,42,0.75)]"
                          : "bg-gradient-to-b from-bone-50 to-bone-200 shadow-[inset_0_1px_0_#fff,0_14px_34px_-12px_rgba(0,0,0,0.85)]"
                      }`}
                    >
                      {phase === "missed" ? (
                        <PhoneMissed aria-hidden="true" size={26} strokeWidth={1.5} />
                      ) : (
                        <PhoneIncoming aria-hidden="true" size={26} strokeWidth={1.5} />
                      )}
                    </span>
                  </div>
                  <p className="mt-6 text-[0.8125rem] font-medium text-ash">
                    {phase === "missed" ? t.simulator.missed : t.simulator.incoming}
                  </p>
                  <p className="mt-1.5 font-display text-4xl tracking-[-0.035em] text-bone">{sim.caller}</p>
                  <p className="mt-1 font-mono text-xs tabular text-ash">{sim.callerNumber}</p>
                  <p className="mt-7 flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 text-xs font-medium text-bone/80 ring-1 ring-inset ring-white/10">
                    {phase === "missed" ? (
                      <>
                        <MessageSquareText aria-hidden="true" size={13} strokeWidth={1.75} className="text-signal" />
                        {t.simulator.typing}
                      </>
                    ) : (
                      t.simulator.busy
                    )}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Home indicator + cover-glass glare (decorative, always on top). */}
            <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-1/2 h-[5px] w-[34%] -translate-x-1/2 rounded-full bg-bone/45" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ backgroundImage: SCREEN_GLARE }} />
          </div>
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
        className={`px-3.5 py-2 text-[0.8rem] leading-snug ${
          out
            ? `rounded-[1.15rem] rounded-br-[0.4rem] ${BONE_GLASS}`
            : "glass-dark glass-flat rounded-[1.15rem] rounded-bl-[0.4rem] text-bone"
        }`}
      >
        {children}
      </p>
      {meta ? <span className="mt-1 px-1.5 text-[0.625rem] font-medium leading-4 text-ash">{meta}</span> : null}
    </motion.div>
  );
}

function Typing({ side, label }: { side: "in" | "out"; label: string }) {
  const out = side === "out";
  return (
    <motion.div
      className={`flex items-center gap-1 rounded-full px-3.5 py-3 ${out ? `self-end ${BONE_GLASS}` : "glass-dark glass-flat self-start"}`}
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
          className={`h-1.5 w-1.5 rounded-full ${out ? "bg-ink/60" : "bg-bone/70"}`}
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </motion.div>
  );
}
