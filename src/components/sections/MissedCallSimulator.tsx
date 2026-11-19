"use client";

import {
  AnimatePresence,
  LayoutGroup,
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { Check, MessageSquareText, Pause, PhoneIncoming, PhoneMissed, Play, RotateCcw, SkipForward, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SimulationDisclaimer } from "@/components/ui/SimulationDisclaimer";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useNiche } from "@/context/NicheContext";
import { useScene } from "@/context/SceneContext";
import { useTabs } from "@/context/TabsContext";
import { fill } from "@/i18n/types";
import { formatCurrency } from "@/lib/format";
import { EASE_EDITORIAL, MOTION } from "@/lib/motion";

/** Ordered phases of the scripted timeline. */
const PHASES = ["idle", "ringing", "missed", "typing1", "sms1", "reply", "typing2", "confirm", "logged"] as const;
type Phase = (typeof PHASES)[number];

const at = (phase: Phase, min: Phase) => PHASES.indexOf(phase) >= PHASES.indexOf(min);

/** Story beats, ms from "Simulate". One linear clock drives everything; the rail scrubs it. */
const BEAT = { ringing: 0, missed: 1300, typing1: 2100, sms1: 2700, reply: 4200, typing2: 4800, confirm: 5400, logged: 6400, end: 7400 } as const;
type Beat = Exclude<Phase, "idle">;
const ORDER: Beat[] = ["ringing", "missed", "typing1", "sms1", "reply", "typing2", "confirm", "logged"];
/** Clock → phase. The clock never maps to "idle": idle is a status (never started / reset). */
const phaseAt = (ms: number): Beat => {
  let p: Beat = "ringing";
  for (const b of ORDER) if (ms >= BEAT[b]) p = b;
  return p;
};
/** Where Arrow keys and "Next step" stop. */
const STOPS = [0, BEAT.missed, BEAT.sms1, BEAT.reply, BEAT.confirm, BEAT.end];
/** Rail tick dots = the four progress chips completing. */
const TICKS = [BEAT.missed, BEAT.sms1, BEAT.confirm, BEAT.logged];
const EASE_COUNT = cubicBezier(...EASE_EDITORIAL);
type Status = "idle" | "playing" | "paused" | "done";
type Tempo = "play" | "scrub" | "instant";
const dur = (t: Tempo, s: number) => (t === "instant" ? 0 : t === "scrub" ? Math.min(s, 0.15) : s);

/* ------------------------------------------------------------------ *
 * Liquid Glass finish — static decorative gradients only (no filters,
 * no animated colour). Everything below sits inside 3D-rotated wrappers
 * on desktop, so every glass surface here is `glass-flat` (no backdrop
 * blur, which would flatten the 3D).
 * ------------------------------------------------------------------ */

/** Light-catching 1px rim around the device: bright top-left, aqua bottom-right. */
const DEVICE_RIM =
  "linear-gradient(150deg, rgba(255,255,255,0.62), rgba(255,255,255,0.1) 26%, rgba(255,255,255,0.03) 60%, rgba(42,107,191,0.4))";
/** Glossy dark titanium body. */
const DEVICE_BODY = "linear-gradient(160deg, rgb(var(--ink-600)) 0%, rgb(var(--ink-850)) 40%, rgb(var(--ink-900)) 68%, rgb(var(--ink-700)) 100%)";
/** Aqua halo and soft contact shadow that give the device depth on the dark field. */
const DEVICE_HALO = "radial-gradient(closest-side, rgba(42,107,191,0.16), rgba(90,151,224,0.09) 55%, transparent)";
const DEVICE_SHADOW = "radial-gradient(closest-side, rgba(30,64,120,0.279), transparent)";
/** Screen wallpaper: near-black with an aqua glow (top) and slate glow (bottom). */
const SCREEN_WALLPAPER =
  "radial-gradient(120% 55% at 100% 0%, rgba(42,107,191,0.14), transparent 62%), radial-gradient(120% 60% at 0% 100%, rgb(var(--sand) / 0.55), transparent 66%), linear-gradient(180deg, rgb(var(--ink-900)), rgb(var(--ink-900)))";
/** Diagonal glare across the cover glass. */
const SCREEN_GLARE = "linear-gradient(118deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.016) 30%, rgba(255,255,255,0) 44%)";
/** Call-screen glows: aqua while ringing, signal (alert) once missed (cross-faded with opacity). */
const CALL_GLOW_INCOMING = "radial-gradient(90% 55% at 50% 0%, rgba(42,107,191,0.24), transparent 72%)";
const CALL_GLOW_MISSED = "radial-gradient(90% 55% at 50% 0%, rgba(90,151,224,0.36), transparent 72%)";

/** Outgoing bubble: the business's own messages in aqua, with a specular top edge (ink on aqua 11:1). */
const AQUA_BUBBLE =
  "bg-gradient-to-b from-aqua-hi to-aqua text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-1px_0_rgba(30,64,120,0.036),0_10px_22px_-12px_rgba(30,64,120,0.35)]";
/** Inner surface for cards nested inside a glass panel (level 2: tint + hairline ring, not another glass). */
const INNER_SURFACE = "bg-aqua/[0.046] ring-1 ring-inset ring-bone/[0.112]";

export function MissedCallSimulator() {
  const { t, locale, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const sim = niche.simulator;
  const { reduce, desktop } = useScene();
  const service = sim.service[locale];
  const time = sim.time[locale];
  const amountLabel = formatCurrency(sim.amount, intlLocale);

  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLInputElement>(null);
  const scrubFrom = useRef<Status>("idle");

  const [announcement, setAnnouncement] = useState("");
  const clock = useMotionValue(0);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [phase, setPhase] = useState<Phase>("idle");
  const [scrubbing, setScrubbing] = useState(false);
  const statusRef = useRef(status);
  statusRef.current = status;
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  const announceOn = useRef(false); // true while playing or stepping; false while scrubbing / keyboard-seeking
  const { paused: globalPaused } = useMotionPause();
  const pausedRef = useRef(globalPaused);
  pausedRef.current = globalPaused;
  const tabs = useTabs();
  // Latest-render values for callbacks that outlive a render (announcements during a language switch).
  const live$ = useRef({ t, sim, service, time, amountLabel });
  live$.current = { t, sim, service, time, amountLabel };
  const scrubbingRef = useRef(false);

  // Phase follows the clock; React re-renders only when a boundary is crossed.
  const sync = (ms: number) => {
    const next = phaseAt(ms);
    if (next === phaseRef.current) return;
    phaseRef.current = next;
    setPhase(next);
    if (!announceOn.current) return;
    const L = live$.current;
    if (next === "ringing") setAnnouncement(fill(L.t.simulator.announceIncoming, { name: L.sim.caller }));
    if (next === "missed") setAnnouncement(fill(L.t.simulator.announceMissed, { name: L.sim.caller }));
    if (next === "logged")
      setAnnouncement(fill(L.t.simulator.announceBooked, { name: L.sim.caller, service: L.service, time: L.time, amount: L.amountLabel }));
  };
  useMotionValueEvent(clock, "change", (v) => {
    if (statusRef.current !== "idle") sync(v);
  });

  const halt = () => {
    run.current?.stop();
    run.current = null;
  };
  const play = (from: number) => {
    halt();
    announceOn.current = true;
    clock.set(from);
    statusRef.current = "playing";
    sync(from); // REQUIRED: set() to the same value fires no "change"
    setStatus("playing");
    run.current = animate(clock, BEAT.end, {
      duration: (BEAT.end - from) / 1000,
      ease: "linear",
      onComplete: () => {
        run.current = null;
        statusRef.current = "done";
        setStatus("done");
      },
    });
  };
  const pause = () => {
    if (!run.current) return;
    halt();
    statusRef.current = "paused";
    setStatus("paused");
  };
  const seek = (ms: number, opts: { announce?: boolean } = {}) => {
    const v = Math.max(0, Math.min(BEAT.end, ms));
    const keepPlaying = statusRef.current === "playing" && v < BEAT.end && !pausedRef.current;
    if (statusRef.current === "idle" && v === 0 && !opts.announce) return; // nothing started: stay idle
    halt();
    announceOn.current = !!opts.announce;
    statusRef.current = "paused"; // so sync() runs even when coming from idle
    clock.set(v);
    sync(v);
    if (keepPlaying) play(v);
    else {
      const next = v >= BEAT.end ? "done" : "paused";
      statusRef.current = next;
      setStatus(next);
    }
  };
  const reset = () => {
    halt();
    clock.set(0);
    statusRef.current = "idle";
    setStatus("idle");
    phaseRef.current = "idle";
    setPhase("idle");
    setAnnouncement("");
  };

  // A new industry resets the scenario.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, [niche.id]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => halt, []);
  // Site-wide pause: stop at once, never auto-resume when it lifts.
  useEffect(() => {
    if (globalPaused) pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalPaused]);
  // Leaving the tab / hiding the browser tab pauses.
  useEffect(() => {
    if (tabs && tabs.active !== "simulator") pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs?.active]);
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rail thumb: written imperatively, never through React state.
  useEffect(() => {
    const w = (v: number) => {
      const el = railRef.current;
      if (!el) return;
      el.value = String(Math.round(v));
      el.style.setProperty("--fill", `${(v / BEAT.end) * 100}%`);
    };
    w(clock.get());
    return clock.on("change", w);
  }, [clock]);

  // Scroll only adds a depth tilt (lg, motion allowed); the story never reads scroll.
  const tilt = desktop && !reduce;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const depth = useSpring(scrollYProgress, MOTION.cinematic);
  const phoneRotY = useTransform(depth, [0, 0.4], [0, 5]);
  const phoneRotX = useTransform(depth, [0, 0.4], [0, 3]);
  const panelRotY = useTransform(depth, [0, 0.4], [0, -3]);

  const tempo: Tempo = reduce ? "instant" : scrubbing ? "scrub" : "play";
  const live = status === "playing" && !scrubbing && !reduce && !globalPaused;

  const nudgePhone = () => {
    if (!window.matchMedia("(max-width: 767px)").matches || !phoneRef.current || !railRef.current) return;
    const r = phoneRef.current.getBoundingClientRect();
    const rail = railRef.current.getBoundingClientRect();
    const delta = Math.min(r.bottom + 16 - window.innerHeight, rail.top - 128); // keep the rail below navbar + tab strip
    if (delta > 0) window.scrollBy({ top: delta, behavior: reduce ? "auto" : "smooth" });
  };

  const onMain = () => {
    if (globalPaused) {
      seek(status === "idle" || status === "done" ? 0 : (STOPS.find((s) => s > clock.get()) ?? BEAT.end), { announce: true });
      return;
    }
    if (status === "playing") pause();
    else if (status === "paused") play(clock.get());
    else {
      play(0);
      nudgePhone();
    }
  };

  const endScrub = () => {
    window.removeEventListener("pointerup", endScrub);
    window.removeEventListener("pointercancel", endScrub);
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    setScrubbing(false);
    if (statusRef.current === "idle") return; // tapped the start of an unstarted rail
    const v = clock.get();
    if (scrubFrom.current === "playing" && v < BEAT.end && !pausedRef.current) play(v);
    else {
      const next = v >= BEAT.end ? "done" : "paused";
      statusRef.current = next;
      setStatus(next);
    }
  };
  const onRailDown = () => {
    scrubFrom.current = statusRef.current;
    halt();
    announceOn.current = false;
    scrubbingRef.current = true;
    setScrubbing(true);
    if (statusRef.current === "playing") {
      statusRef.current = "paused";
      setStatus("paused");
    }
    window.addEventListener("pointerup", endScrub);
    window.addEventListener("pointercancel", endScrub);
  };
  const onRailInput = (v: number) => {
    if (statusRef.current === "idle" && v > 0) {
      statusRef.current = "paused";
      setStatus("paused");
    }
    clock.set(v);
  };
  const onRailKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const v = clock.get();
    let target: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp") target = STOPS.find((s) => s > v) ?? BEAT.end;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "PageDown") target = [...STOPS].reverse().find((s) => s < v - 1) ?? 0;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = BEAT.end;
    if (target === null) return;
    e.preventDefault();
    seek(target);
  };

  const stepDone = [at(phase, "missed"), at(phase, "sms1"), at(phase, "confirm"), at(phase, "logged")];
  const currentStep = phase === "idle" ? -1 : stepDone.findIndex((d) => !d);
  const railN = currentStep === -1 ? 4 : currentStep + 1;
  const railText =
    status === "idle" ? t.simulator.railIdle : fill(t.simulator.railValue, { n: railN, total: 4, step: t.simulator.steps[railN - 1] });

  return (
    <section
      id="simulator"
      ref={sectionRef}
      aria-labelledby="simulator-title"
      data-theme="dark"
      className="relative isolate z-10 overflow-clip py-24 text-bone lg:pb-24 lg:pt-16"
    >
      <AmbientField variant={0} />
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

        <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-6 [perspective:1600px] md:mt-14 md:gap-y-12 lg:mt-10 lg:gap-x-10">
          {/* ---------- Left: phone ---------- */}
          <Reveal className="col-span-12 md:col-span-6 lg:col-span-5">
            <motion.div ref={phoneRef} style={tilt ? { rotateY: phoneRotY, rotateX: phoneRotX } : undefined}>
              <Phone phase={phase} tempo={tempo} live={live} />
            </motion.div>
          </Reveal>

          {/* ---------- Right: controls, progress, dashboard ----------
              Phones: the column dissolves (`contents`) so the controls can sit ABOVE the phone. */}
          <motion.div
            className="col-span-12 flex flex-col gap-6 max-md:contents md:col-span-6 lg:col-span-7"
            style={tilt ? { rotateY: panelRotY, transformOrigin: "100% 50%" } : undefined}
          >
            <Reveal className="order-first col-span-12 md:order-none">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <MagneticButton onClick={onMain} className="btn-aqua whitespace-normal text-center sm:min-w-[19rem] sm:whitespace-nowrap">
                    {globalPaused && status !== "done" ? (
                      <SkipForward aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                    ) : status === "done" ? (
                      <RotateCcw aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                    ) : status === "playing" ? (
                      <Pause aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                    ) : status === "paused" ? (
                      <Play aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                    ) : (
                      <PhoneIncoming aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                    )}
                    {globalPaused && status !== "done"
                      ? t.simulator.nextStep
                      : status === "done"
                        ? t.simulator.replay
                        : status === "playing"
                          ? t.simulator.pause
                          : status === "paused"
                            ? t.simulator.resume
                            : t.simulator.button}
                  </MagneticButton>
                  <p className="chip-dark glass-flat self-start text-ash sm:self-auto">
                    <span className="text-bone/85">{niche.label[locale]}</span> · {sim.business}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative min-w-0 flex-1">
                    <input
                      ref={railRef}
                      type="range"
                      min={0}
                      max={BEAT.end}
                      step={10}
                      defaultValue={0}
                      className="range"
                      aria-label={t.simulator.railLabel}
                      aria-valuetext={railText}
                      onPointerDown={onRailDown}
                      onChange={(e) => onRailInput(Number(e.currentTarget.value))}
                      onKeyDown={onRailKey}
                    />
                    {TICKS.map((ms) => (
                      <span
                        key={ms}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-[calc(50%+15px)] h-1 w-1 -translate-x-1/2 rounded-full bg-bone/35"
                        style={{ left: `calc(13px + (100% - 26px) * ${ms / BEAT.end})` }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => (globalPaused ? seek(0, { announce: true }) : play(0))}
                    disabled={status === "idle"}
                    aria-label={t.simulator.restart}
                    className="btn-line-dark btn-sm h-11 w-11 shrink-0 !px-0 disabled:opacity-40"
                  >
                    <RotateCcw aria-hidden="true" size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Progress: four glass chips, each with a rounded fill line. */}
            <Reveal delay={0.05} className="col-span-12">
              <h3 className="sr-only">{t.simulator.stepsLabel}</h3>
              <ol className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                {t.simulator.steps.map((label, i) => {
                  const done = stepDone[i];
                  const current = i === currentStep;
                  return (
                    <li
                      key={label}
                      className={`glass-dark glass-flat flex flex-col rounded-glass p-3 sm:p-3.5 ${current ? "border-aqua/50" : ""}`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold tabular ${
                            done
                              ? "bg-gradient-to-b from-aqua-glow to-aqua text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_6px_14px_-6px_rgba(42,107,191,0.8)]"
                              : current
                                ? "bg-aqua/15 text-bone ring-1 ring-inset ring-aqua/70 shadow-[0_0_16px_-3px_rgba(42,107,191,0.75)]"
                                : "bg-aqua/[0.065] text-ash ring-1 ring-inset ring-bone/[0.14]"
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
                    </li>
                  );
                })}
              </ol>
            </Reveal>

            {/* Mini dashboard tracker: one flat dark-glass card (dense tint for small text). */}
            <Reveal delay={0.1} className="col-span-12">
              <div
                role="region"
                aria-label={t.simulator.dashboardRegionLabel}
                className="glass-dark glass-flat glass-solid rounded-glass-lg p-3 sm:p-4"
              >
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-1 lg:grid-cols-2">
                  <div className={`min-w-0 rounded-glass-sm p-3.5 sm:p-4 ${INNER_SURFACE}`}>
                    <p className="eyebrow text-ash">{t.simulator.recovered}</p>
                    <p className="mt-3 font-display text-[clamp(1.6rem,8vw,2.25rem)] leading-none tracking-[-0.035em] text-bone tabular xl:text-5xl">
                      <RecoveredAmount clock={clock} amount={sim.amount} reduce={reduce} logged={phase === "logged"} />
                    </p>
                  </div>
                  <div className={`min-w-0 rounded-glass-sm p-3.5 sm:p-4 ${INNER_SURFACE}`}>
                    <p className="eyebrow text-ash">{t.simulator.responseTime}</p>
                    <p className="mt-3 flex items-center gap-2.5 font-display text-[clamp(1.6rem,8vw,2.25rem)] leading-none tracking-[-0.035em] text-bone xl:text-5xl">
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/15 ring-1 ring-inset ring-aqua/40 xl:h-10 xl:w-10"
                      >
                        <Zap size={16} strokeWidth={1.75} className="text-aqua" />
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
                            className="flex items-center justify-between gap-3 rounded-glass-sm bg-aqua/10 p-3 shadow-[0_14px_32px_-16px_rgba(42,107,191,0.6)] ring-1 ring-inset ring-aqua/45"
                            initial={tempo === "instant" ? false : { opacity: 0, y: -16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: dur(tempo, 0.45), ease: EASE_EDITORIAL }}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                aria-hidden="true"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-b from-aqua-glow to-aqua text-sm font-semibold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                              >
                                {sim.caller.charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-bone">
                                  <span className="rounded-full bg-signal px-2 py-0.5 text-[0.6875rem] font-semibold leading-4 text-ink shadow-[inset_0_1px_0_rgba(220,235,251,0.6)]">
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
                            transition={{ duration: dur(tempo, 0.45), ease: EASE_EDITORIAL }}
                            className={`flex items-center justify-between gap-3 rounded-glass-sm p-3 ${INNER_SURFACE}`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                aria-hidden="true"
                                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-aqua/[0.091] text-sm font-semibold text-bone/85 ring-1 ring-inset ring-bone/[0.14]"
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

        <SimulationDisclaimer variant="simulator" className="mt-8" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Revenue counter driven by the story clock (no spring): scrub-safe, never runs backwards or overshoots. */
function RecoveredAmount({ clock, amount, reduce, logged }: { clock: MotionValue<number>; amount: number; reduce: boolean; logged: boolean }) {
  const { intlLocale } = useLanguage();
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const valueAt = (ms: number) =>
      reduce ? (ms >= BEAT.logged ? amount : 0) : amount * EASE_COUNT(Math.min(1, Math.max(0, (ms - BEAT.logged) / (BEAT.end - BEAT.logged))));
    const render = (ms: number) => {
      if (ref.current) ref.current.textContent = formatCurrency(valueAt(ms), intlLocale);
    };
    render(clock.get());
    return clock.on("change", render);
  }, [clock, amount, reduce, intlLocale]);
  return (
    <span className="tabular whitespace-nowrap">
      <span ref={ref} aria-hidden="true">
        {formatCurrency(0, intlLocale)}
      </span>
      <span className="sr-only">{formatCurrency(logged ? amount : 0, intlLocale)}</span>
    </span>
  );
}

/** Hardware buttons on the device edge (decorative). */
const SIDE_KEYS = [
  "-left-[2px] top-[15%] h-6 rounded-l-[2px]",
  "-left-[2px] top-[22%] h-11 rounded-l-[2px]",
  "-left-[2px] top-[30%] h-11 rounded-l-[2px]",
  "-right-[2px] top-[25%] h-16 rounded-r-[2px]",
] as const;

function Phone({ phase, tempo, live }: { phase: Phase; tempo: Tempo; live: boolean }) {
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
          className={`pointer-events-none absolute w-[3px] bg-gradient-to-b from-ash via-ink-600 to-ink-500 ${pos}`}
        />
      ))}

      {/* Frame: a 1px light-catching rim around a glossy dark body. */}
      <div
        className="rounded-[2.75rem] p-px shadow-[0_60px_100px_-45px_rgba(30,64,120,0.35),0_30px_60px_-36px_rgba(90,151,224,0.45)]"
        style={{ backgroundImage: DEVICE_RIM }}
      >
        <div
          className="rounded-[calc(2.75rem_-_1px)] p-[9px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(30,64,120,0.225)]"
          style={{ backgroundImage: DEVICE_BODY }}
        >
          {/* Phones: height capped so the Simulate button and the idle screen fit in one view (the thread still fits). */}
          <div className="relative isolate aspect-[9/18.5] w-full overflow-hidden rounded-[2.125rem] bg-ink-900 ring-1 ring-bone/[0.07] max-md:max-h-[max(26rem,58svh)]">
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
                    initial={tempo === "instant" ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: dur(tempo, 0.25), ease: EASE_EDITORIAL }}
                  >
                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 place-items-center rounded-full bg-aqua/[0.078] text-bone/70 ring-1 ring-inset ring-bone/[0.14]"
                    >
                      <MessageSquareText size={18} strokeWidth={1.5} />
                    </span>
                    {t.simulator.idleScreen}
                  </motion.p>
                ) : null}

                {at(phase, "typing1") && !at(phase, "sms1") ? <Typing key="typing1" side="out" label={t.simulator.typing} tempo={tempo} live={live} /> : null}

                {at(phase, "sms1") ? (
                  <Bubble key="sms1" tempo={tempo} side="out" meta={`${t.simulator.autoTag} · ${t.simulator.responseValue}`}>
                    {fill(t.simulator.smsAuto, vars)}
                  </Bubble>
                ) : null}

                {at(phase, "reply") ? (
                  <Bubble key="reply" tempo={tempo} side="in">
                    {t.simulator.smsReply}
                  </Bubble>
                ) : null}

                {at(phase, "typing2") && !at(phase, "confirm") ? <Typing key="typing2" side="out" label={t.simulator.typing} tempo={tempo} live={live} /> : null}

                {at(phase, "confirm") ? (
                  <Bubble key="confirm" tempo={tempo} side="out" meta={t.simulator.autoTag}>
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
                  initial={tempo === "instant" ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: dur(tempo, 0.45), ease: EASE_EDITORIAL }}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] transition-opacity duration-slow ease-editorial ${phase === "missed" ? "opacity-0" : "opacity-100"}`}
                    style={{ backgroundImage: CALL_GLOW_INCOMING }}
                  />
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 -z-10 rounded-[inherit] transition-opacity duration-slow ease-editorial ${phase === "missed" ? "opacity-100" : "opacity-0"}`}
                    style={{ backgroundImage: CALL_GLOW_MISSED }}
                  />
                  <div className="relative grid h-20 w-20 place-items-center">
                    {phase === "ringing" && live
                      ? [0, 1].map((i) => (
                          <motion.span
                            key={i}
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full bg-aqua/10 ring-1 ring-inset ring-aqua/40"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 1.9, opacity: 0 }}
                            transition={{ duration: 0.85, delay: 0.2 + i * 0.35, ease: "easeOut" }}
                          />
                        ))
                      : null}
                    <span
                      className={`relative grid h-16 w-16 place-items-center rounded-full text-ink ${
                        phase === "missed"
                          ? "bg-gradient-to-b from-aqua-deep to-signal shadow-[inset_0_1px_0_rgba(220,235,251,0.75),0_14px_34px_-10px_rgba(90,151,224,0.75)]"
                          : "bg-gradient-to-b from-aqua-glow to-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_14px_34px_-12px_rgba(42,107,191,0.6)]"
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
                  <p className="mt-7 flex items-center gap-2 rounded-full bg-aqua/[0.091] px-3.5 py-2 text-xs font-medium text-bone/80 ring-1 ring-inset ring-bone/[0.14]">
                    {phase === "missed" ? (
                      <>
                        <MessageSquareText aria-hidden="true" size={13} strokeWidth={1.75} className="text-aqua" />
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

function Bubble({ side, children, meta, tempo }: { side: "in" | "out"; children: string; meta?: string; tempo: Tempo }) {
  const out = side === "out";
  return (
    <motion.div
      layout
      className={`flex max-w-[86%] flex-col ${out ? "self-end items-end" : "self-start items-start"}`}
      initial={tempo === "instant" ? false : { opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: dur(tempo, 0.15), ease: EASE_EDITORIAL } }}
      transition={{ duration: dur(tempo, 0.45), ease: EASE_EDITORIAL }}
      style={{ originX: out ? 1 : 0, originY: 1 }}
    >
      <p
        className={`px-3.5 py-2 text-[0.8rem] leading-snug ${
          out
            ? `rounded-[1.15rem] rounded-br-[0.4rem] ${AQUA_BUBBLE}`
            : "glass-dark glass-flat rounded-[1.15rem] rounded-bl-[0.4rem] text-bone"
        }`}
      >
        {children}
      </p>
      {meta ? <span className="mt-1 px-1.5 text-[0.625rem] font-medium leading-4 text-ash">{meta}</span> : null}
    </motion.div>
  );
}

function Typing({ side, label, tempo, live }: { side: "in" | "out"; label: string; tempo: Tempo; live: boolean }) {
  const out = side === "out";
  const dot = `h-1.5 w-1.5 rounded-full ${out ? "bg-ink/60" : "bg-bone/70"}`;
  return (
    <motion.div
      className={`flex items-center gap-1 rounded-full px-3.5 py-3 ${out ? `self-end ${AQUA_BUBBLE}` : "glass-dark glass-flat self-start"}`}
      initial={tempo === "instant" ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: dur(tempo, 0.15), ease: EASE_EDITORIAL } }}
      transition={{ duration: dur(tempo, 0.25), ease: EASE_EDITORIAL }}
    >
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((i) =>
        live ? (
          <motion.span
            key={i}
            aria-hidden="true"
            className={dot}
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ) : (
          <span key={i} aria-hidden="true" className={dot} style={{ opacity: 0.7 }} />
        ),
      )}
    </motion.div>
  );
}
