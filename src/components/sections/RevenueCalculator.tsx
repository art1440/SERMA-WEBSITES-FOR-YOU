"use client";

import { animate, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SimulationDisclaimer } from "@/components/ui/SimulationDisclaimer";
import { TiltCard } from "@/components/ui/TiltCard";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { NICHE_BY_ID, NICHES, type NicheId } from "@/data/niches";
import { fill } from "@/i18n/types";
import { formatCurrency } from "@/lib/format";
import { SPRING_SMOOTH, SPRING_SOFT } from "@/lib/motion";
import { useMockup } from "@/context/MockupContext";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const WEEKS_PER_MONTH = 4.33;
const MILESTONE = 5000; // the annual figure pulses every $5,000
const CHIP_WINDOW_MS = 900; // deltas inside this window accumulate into one chip

/* Average ticket uses a logarithmic slider so $20 haircuts and $10k remodels both feel precise. */
const TICKET_MIN = 20;
const TICKET_MAX = 10000;
const ticketFromPos = (pos: number) => {
  const raw = TICKET_MIN * Math.pow(TICKET_MAX / TICKET_MIN, pos / 1000);
  const step = raw < 200 ? 5 : raw < 1000 ? 10 : raw < 5000 ? 50 : 100;
  return Math.round(raw / step) * step;
};
const posFromTicket = (ticket: number) =>
  Math.round((Math.log(ticket / TICKET_MIN) / Math.log(TICKET_MAX / TICKET_MIN)) * 1000);

/* ------------------------------------------------------------------ *
 * Liquid-glass materials for this section (see docs/design-system.md).
 * ------------------------------------------------------------------ */
/** Idle preset capsule: a faint light pebble inside the dark panel (level 2: tint, not another glass). */
const PRESET_IDLE =
  "bg-aqua/[0.078] text-bone hover:bg-aqua/[0.156] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(30,64,120,0.135)]";
/** Result card: dark flat glass (it sits in a preserve-3d chain) with an aqua under-glow. */
const RESULT_CARD =
  "glass-dark glass-flat flex h-full flex-col justify-between rounded-glass-lg p-6 text-bone sm:p-8 lg:p-9 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.04),0_2px_6px_rgba(30,64,120,0.135),0_40px_80px_-32px_rgba(30,64,120,0.338),0_70px_140px_-60px_rgba(42,107,191,0.32)]";
const RESULT_GLOW =
  "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] " +
  "bg-[radial-gradient(90%_70%_at_88%_0%,rgba(42,107,191,0.16),transparent_60%),radial-gradient(70%_60%_at_0%_100%,rgba(90,151,224,0.12),transparent_65%)]";
/** Inner tiles: concentric radius (card 30 − ~16px inset ≈ 14). */
const TILE_BASE =
  "flex items-center justify-between gap-4 rounded-glass-sm px-4 py-3 ring-1 ring-inset " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:block sm:p-4 lg:flex lg:px-4 lg:py-3 xl:block xl:p-4";
const TILE = `${TILE_BASE} bg-aqua/[0.065] ring-bone/[0.112]`;
const TILE_ACCENT = `${TILE_BASE} bg-aqua/[0.08] ring-aqua/25`;
/* bone/70 keeps ≥ 4.5:1 on both tile tints. */
const TILE_LABEL = "text-[0.8125rem] font-medium leading-snug text-bone/70";
const TILE_VALUE =
  "font-display text-2xl leading-none tracking-[-0.03em] sm:mt-2.5 sm:text-[1.75rem] lg:mt-0 lg:text-2xl xl:mt-2.5 xl:text-[1.75rem]";

export function RevenueCalculator() {
  const { t, locale, intlLocale } = useLanguage();
  const { niche, nicheId, pickNiche } = useNiche();

  const [missedCalls, setMissedCalls] = useState(niche.calculator.missedCalls);
  const [ticketPos, setTicketPos] = useState(posFromTicket(niche.calculator.avgTicket));
  const [bookingRate, setBookingRate] = useState(niche.calculator.bookingRate);

  // Presets load ONLY when the visitor taps an industry button here — never when the
  // industry changes elsewhere on the page — so their own numbers are never erased.
  const loadPreset = (id: NicheId) => {
    const preset = NICHE_BY_ID[id].calculator;
    pickNiche(id);
    setMissedCalls(preset.missedCalls);
    setTicketPos(posFromTicket(preset.avgTicket));
    setBookingRate(preset.bookingRate);
  };

  const avgTicket = ticketFromPos(ticketPos);
  const callsPerMonth = missedCalls * WEEKS_PER_MONTH;
  const bookingsPerMonth = callsPerMonth * (bookingRate / 100);
  const monthly = bookingsPerMonth * avgTicket;
  const annual = monthly * 12;

  // Delta chip + milestone pulse: written straight to the DOM (transform/opacity only),
  // so nothing re-renders per animation frame.
  const reduce = useReducedMotionSafe();
  const chipRef = useRef<HTMLSpanElement>(null);
  const pulseRef = useRef<HTMLSpanElement>(null);
  const annualRef = useRef<HTMLElement>(null);
  const prev = useRef<{ monthly: number; annual: number } | null>(null);
  const chipAcc = useRef({ sum: 0, at: 0 });

  useEffect(() => {
    const before = prev.current;
    prev.current = { monthly, annual };
    if (!before || reduce) return;

    const diff = Math.round(monthly) - Math.round(before.monthly);
    const chip = chipRef.current;
    if (chip && diff !== 0) {
      const now = performance.now();
      const acc = chipAcc.current;
      acc.sum = now - acc.at < CHIP_WINDOW_MS ? acc.sum + diff : diff;
      acc.at = now;
      if (acc.sum === 0) {
        chip.style.opacity = "0";
      } else {
        const up = acc.sum > 0;
        chip.textContent = `${up ? "+" : "−"}${formatCurrency(Math.abs(acc.sum), intlLocale)}`;
        chip.classList.toggle("text-live", up);
        chip.classList.toggle("text-signal", !up);
        animate(chip, { opacity: [1, 1, 0], y: [up ? 4 : -4, 0, up ? -6 : 6] }, { duration: 1.4, times: [0, 0.15, 1], ease: "easeOut" });
      }
    }

    if (Math.floor(annual / MILESTONE) !== Math.floor(before.annual / MILESTONE)) {
      if (pulseRef.current) animate(pulseRef.current, { opacity: [0, 1, 0] }, { duration: 0.9, ease: "easeOut" });
      if (annualRef.current) animate(annualRef.current, { scale: [1, 1.06, 1] }, { duration: 0.6, ease: "easeOut" });
    }
  }, [monthly, annual, reduce, intlLocale]);

  const { openMockup } = useMockup();
  const onCta = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    openMockup();
  };

  return (
    <section id="calculator" aria-labelledby="calculator-title" className="relative isolate z-10 overflow-hidden py-24 lg:py-32">
      <AmbientField variant={2} />
      <div className="frame">
        <SectionHeader
          headingId="calculator-title"
          index={t.calculator.index}
          eyebrow={t.calculator.eyebrow}
          title={t.calculator.title}
          body={t.calculator.body}
        />

        <div className="mt-12 grid grid-cols-12 gap-4 lg:mt-16 lg:gap-5">
          {/* Controls — dark glass panel with the dense tint and NO backdrop blur: it sits
              over a static light field, where blur is invisible (measured) but still costs. */}
          <Reveal className="col-span-12 lg:col-span-6">
            <div className="glass-dark glass-solid h-full rounded-glass-lg p-5 [-webkit-backdrop-filter:none] [backdrop-filter:none] sm:p-7 lg:p-9">
              <fieldset>
                <legend className="eyebrow text-ash">{t.calculator.presetLabel}</legend>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  {NICHES.map((n) => {
                    const active = n.id === nicheId;
                    return (
                      <motion.button
                        key={n.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => loadPreset(n.id)}
                        whileHover={active ? undefined : { y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={SPRING_SOFT}
                        className={`relative isolate min-h-[44px] rounded-full px-4 py-2 text-sm font-medium tracking-[-0.01em] ${
                          active ? "z-10" : `z-0 ${PRESET_IDLE}`
                        }`}
                      >
                        {active ? (
                          <motion.span
                            layoutId="calc-preset-indicator"
                            aria-hidden="true"
                            // Radius set via style so Framer corrects it during the slide (no squashed ends).
                            style={{ borderRadius: 9999 }}
                            className="absolute inset-0 -z-10 bg-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_20px_-8px_rgba(42,107,191,0.6),0_1px_2px_rgba(30,64,120,0.135)]"
                            transition={SPRING_SOFT}
                          />
                        ) : null}
                        <span className={active ? "text-ink" : "text-bone"}>{n.shortLabel[locale]}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Soft light-catching divider (decorative). */}
              <div aria-hidden="true" className="my-7 h-px bg-gradient-to-r from-transparent via-bone/[0.168] to-transparent sm:my-8" />

              <div className="space-y-6 sm:space-y-7">
                <Slider
                  label={t.calculator.missedCalls}
                  value={missedCalls}
                  min={1}
                  max={60}
                  step={1}
                  onChange={setMissedCalls}
                  display={fill(t.calculator.perWeek, { n: missedCalls })}
                  format={(v) => fill(t.calculator.perWeek, { n: v })}
                />
                <Slider
                  label={t.calculator.avgTicket}
                  value={ticketPos}
                  min={0}
                  max={1000}
                  step={1}
                  onChange={setTicketPos}
                  display={formatCurrency(avgTicket, intlLocale)}
                  format={(v) => formatCurrency(ticketFromPos(v), intlLocale)}
                />
                <Slider
                  label={t.calculator.bookingRate}
                  hint={t.calculator.bookingRateHint}
                  value={bookingRate}
                  min={5}
                  max={80}
                  step={1}
                  onChange={setBookingRate}
                  display={`${bookingRate}%`}
                  format={(v) => `${v}%`}
                />
              </div>
            </div>
          </Reveal>

          {/* Result — dark glass card. It lives inside TiltCard's preserve-3d chain, so it is
              glass-flat (backdrop blur would flatten the tilt) and never overflow-hidden. */}
          <div className="col-span-12 lg:col-span-6">
            <TiltCard className="h-full" glare="rounded-glass-lg" delay={0.06}>
              <div data-theme="dark" className={RESULT_CARD}>
                {/* Aqua inner light: sits above the glass body, below the content (isolated stack). */}
                <span aria-hidden="true" className={RESULT_GLOW} />
                <div>
                  {/* bone/70 (not ash): stays >= 4.5:1 where the aqua inner light is strongest. */}
                  <p className="eyebrow text-bone/70" id="calc-result-label">
                    {t.calculator.monthlyLabel}
                  </p>
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="font-display text-[clamp(2.75rem,11vw,4.5rem)] leading-[0.95] tracking-[-0.05em] md:text-[5.5rem] lg:text-[clamp(3.5rem,6vw,6rem)]">
                      <AnimatedNumber value={monthly} format="currency" />
                    </p>
                    {/* Delta chip: filled and faded imperatively; decorative (the number itself is announced). */}
                    <span
                      ref={chipRef}
                      aria-hidden="true"
                      className="tabular whitespace-nowrap font-mono text-sm font-medium opacity-0"
                    />
                  </div>

                  {/* Three soft inner tiles. Rows on phones and on the half-width lg card;
                      columns where the card is wide enough for large figures. */}
                  <dl className="mt-7 grid grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-3 sm:gap-3 lg:grid-cols-1 lg:gap-2 xl:grid-cols-3 xl:gap-3">
                    <div className={TILE}>
                      <dt className={TILE_LABEL}>{t.calculator.callsLabel}</dt>
                      <dd className={TILE_VALUE}>
                        <AnimatedNumber value={callsPerMonth} />
                      </dd>
                    </div>
                    <div className={TILE}>
                      <dt className={TILE_LABEL}>{t.calculator.bookingsLabel}</dt>
                      <dd className={TILE_VALUE}>
                        <AnimatedNumber value={bookingsPerMonth} />
                      </dd>
                    </div>
                    <div className={`${TILE_ACCENT} relative`}>
                      <span
                        ref={pulseRef}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-aqua/25 opacity-0"
                      />
                      <dt className={TILE_LABEL}>{t.calculator.annualLabel}</dt>
                      {/* Aqua on the tinted tile is >= 6:1 (and every size here is large text). */}
                      <dd ref={annualRef} className={`${TILE_VALUE} origin-left text-aqua`}>
                        <AnimatedNumber value={annual} format="currency" />
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-6 break-words font-mono text-xs leading-relaxed text-bone/70">
                    {fill(t.calculator.formula, {
                      calls: missedCalls,
                      rate: bookingRate,
                      ticket: formatCurrency(avgTicket, intlLocale),
                    })}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-bone/70">{t.calculator.assumption}</p>
                </div>

                <MagneticButton
                  href="#pricing"
                  onClick={onCta}
                  aria-haspopup="dialog"
                  className="btn-aqua mt-8 self-start whitespace-normal text-left leading-snug"
                >
                  {t.calculator.cta}
                  <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} className="shrink-0" />
                </MagneticButton>
              </div>
            </TiltCard>
          </div>
        </div>

        <SimulationDisclaimer variant="calculator" className="mt-6" />
      </div>
    </section>
  );
}

type SliderProps = {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  /** Formats an in-between value while the thumb glides to a preset. */
  format: (v: number) => string;
  onChange: (v: number) => void;
};

/**
 * Uncontrolled range: the thumb, the track fill (--fill) and the readout are written
 * straight to the DOM, so a preset can glide the slider with a spring and dragging
 * keeps the fill locked 1:1 to the thumb. React only renders on committed changes.
 */
function Slider({ label, hint, value, min, max, step, display, format, onChange }: SliderProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotionSafe();
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const from = Number(input.value);
    if (from === value) return;
    const paint = (v: number) => {
      input.value = String(v);
      input.style.setProperty("--fill", `${pct(v)}%`);
      const node = textRef.current?.firstChild;
      if (node) node.nodeValue = format(Math.round(v));
    };
    if (reduce) {
      paint(value);
      return;
    }
    const controls = animate(from, value, { ...SPRING_SMOOTH, onUpdate: paint, onComplete: () => paint(value) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[0.9375rem] font-medium leading-snug text-bone sm:text-base">
          {label}
        </label>
        {/* aria-hidden: the slider's aria-valuetext already announces this value. */}
        <output htmlFor={id} aria-hidden="true" className="tabular shrink-0 font-display text-[1.75rem] leading-none tracking-[-0.035em] text-bone sm:text-[2rem]">
          <span ref={textRef}>{display}</span>
        </output>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="range"
        className="range mt-1.5 [&:active::-moz-range-thumb]:scale-[1.25] [&:active::-webkit-slider-thumb]:scale-[1.25]"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          e.target.style.setProperty("--fill", `${pct(v)}%`);
          onChange(v);
        }}
        aria-valuetext={display}
        aria-describedby={hint ? hintId : undefined}
        style={{ ["--fill" as string]: `${pct(value)}%` }}
      />
      {hint ? (
        <p id={hintId} className="mt-1 text-sm leading-relaxed text-ash">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
