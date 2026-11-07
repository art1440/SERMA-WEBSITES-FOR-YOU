"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useId, useState, type MouseEvent } from "react";
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
import { SPRING_SOFT } from "@/lib/motion";
import { goToDemo } from "@/lib/scroll";

const WEEKS_PER_MONTH = 4.33;

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
  "bg-white/[0.06] text-bone hover:bg-white/[0.12] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.3)]";
/** Result card: dark flat glass (it sits in a preserve-3d chain) with an aqua under-glow. */
const RESULT_CARD =
  "glass-dark glass-flat flex h-full flex-col justify-between rounded-glass-lg p-6 text-bone sm:p-8 lg:p-9 " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-1px_0_rgba(255,255,255,0.04),0_2px_6px_rgba(0,0,0,0.3),0_40px_80px_-32px_rgba(0,0,0,0.75),0_70px_140px_-60px_rgba(61,219,201,0.32)]";
const RESULT_GLOW =
  "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] " +
  "bg-[radial-gradient(90%_70%_at_88%_0%,rgba(61,219,201,0.16),transparent_60%),radial-gradient(70%_60%_at_0%_100%,rgba(18,165,148,0.12),transparent_65%)]";
/** Inner tiles: concentric radius (card 30 − ~16px inset ≈ 14). */
const TILE_BASE =
  "flex items-center justify-between gap-4 rounded-glass-sm px-4 py-3 ring-1 ring-inset " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:block sm:p-4 lg:flex lg:px-4 lg:py-3 xl:block xl:p-4";
const TILE = `${TILE_BASE} bg-white/[0.05] ring-white/[0.08]`;
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

  const onCta = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    goToDemo();
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
                        whileTap={{ scale: 0.95 }}
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
                            className="absolute inset-0 -z-10 bg-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_20px_-8px_rgba(61,219,201,0.6),0_1px_2px_rgba(0,0,0,0.3)]"
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
              <div aria-hidden="true" className="my-7 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent sm:my-8" />

              <div className="space-y-6 sm:space-y-7">
                <Slider
                  label={t.calculator.missedCalls}
                  value={missedCalls}
                  min={1}
                  max={60}
                  step={1}
                  onChange={setMissedCalls}
                  display={fill(t.calculator.perWeek, { n: missedCalls })}
                />
                <Slider
                  label={t.calculator.avgTicket}
                  value={ticketPos}
                  min={0}
                  max={1000}
                  step={1}
                  onChange={setTicketPos}
                  display={formatCurrency(avgTicket, intlLocale)}
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
                />
              </div>
            </div>
          </Reveal>

          {/* Result — dark glass card. It lives inside TiltCard's preserve-3d chain, so it is
              glass-flat (backdrop blur would flatten the tilt) and never overflow-hidden. */}
          <Reveal className="col-span-12 lg:col-span-6" delay={0.1}>
            <TiltCard className="h-full" glare="rounded-glass-lg">
              <div data-theme="dark" className={RESULT_CARD}>
                {/* Aqua inner light: sits above the glass body, below the content (isolated stack). */}
                <span aria-hidden="true" className={RESULT_GLOW} />
                <div>
                  {/* bone/70 (not ash): stays >= 4.5:1 where the aqua inner light is strongest. */}
                  <p className="eyebrow text-bone/70" id="calc-result-label">
                    {t.calculator.monthlyLabel}
                  </p>
                  <p className="mt-3 font-display text-[clamp(2.75rem,11vw,4.5rem)] leading-[0.95] tracking-[-0.05em] md:text-[5.5rem] lg:text-[clamp(3.5rem,6vw,6rem)]">
                    <AnimatedNumber value={monthly} format="currency" />
                  </p>

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
                    <div className={TILE_ACCENT}>
                      <dt className={TILE_LABEL}>{t.calculator.annualLabel}</dt>
                      {/* Aqua on the tinted tile is >= 6:1 (and every size here is large text). */}
                      <dd className={`${TILE_VALUE} text-aqua`}>
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
                  href="#demo"
                  onClick={onCta}
                  className="btn-aqua mt-8 self-start whitespace-normal text-left leading-snug"
                >
                  {t.calculator.cta}
                  <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} className="shrink-0" />
                </MagneticButton>
              </div>
            </TiltCard>
          </Reveal>
        </div>

        <SimulationDisclaimer className="mt-6" />
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
  onChange: (v: number) => void;
};

function Slider({ label, hint, value, min, max, step, display, onChange }: SliderProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const fillPct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[0.9375rem] font-medium leading-snug text-bone sm:text-base">
          {label}
        </label>
        {/* aria-hidden: the slider's aria-valuetext already announces this value. */}
        <output htmlFor={id} aria-hidden="true" className="tabular shrink-0 font-display text-[1.75rem] leading-none tracking-[-0.035em] text-bone sm:text-[2rem]">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range mt-1.5"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={display}
        aria-describedby={hint ? hintId : undefined}
        style={{ ["--fill" as string]: `${fillPct}%` }}
      />
      {hint ? (
        <p id={hintId} className="mt-1 text-sm leading-relaxed text-ash">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
