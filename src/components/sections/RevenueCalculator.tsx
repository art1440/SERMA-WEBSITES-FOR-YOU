"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useId, useState, type MouseEvent } from "react";
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
    <section id="calculator" aria-labelledby="calculator-title" className="relative z-10 bg-bone py-24 lg:py-32">
      <div className="frame">
        <SectionHeader
          headingId="calculator-title"
          index={t.calculator.index}
          eyebrow={t.calculator.eyebrow}
          title={t.calculator.title}
          body={t.calculator.body}
        />

        <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-12 border-t border-ink lg:mt-20 lg:gap-x-10">
          {/* Controls */}
          <Reveal className="col-span-12 pt-8 lg:col-span-6">
            <fieldset>
              <legend className="eyebrow text-muted">{t.calculator.presetLabel}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
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
                      className={`relative isolate min-h-[44px] border px-3 py-2 text-sm ${active ? "border-ink" : "border-hairline-light"}`}
                    >
                      {active ? (
                        <motion.span
                          layoutId="calc-preset-indicator"
                          aria-hidden="true"
                          className="absolute inset-0 -z-10 bg-ink"
                          transition={SPRING_SOFT}
                        />
                      ) : null}
                      <span className={active ? "text-bone" : "text-ink"}>{n.shortLabel[locale]}</span>
                    </motion.button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-10 space-y-9">
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
          </Reveal>

          {/* Result */}
          <Reveal className="col-span-12 lg:col-span-6 lg:pt-8" delay={0.1}>
            <TiltCard className="h-full">
            <div data-theme="dark" className="flex h-full flex-col justify-between bg-ink p-6 text-bone sm:p-8">
              <div>
                <p className="eyebrow text-ash" id="calc-result-label">
                  {t.calculator.monthlyLabel}
                </p>
                <p className="mt-4 font-display text-[clamp(3.25rem,8vw,6.5rem)] leading-[0.9]">
                  <AnimatedNumber value={monthly} format="currency" />
                </p>

                <dl className="mt-8 grid grid-cols-3 border-y border-hairline-dark">
                  <div className="border-r border-hairline-dark py-4 pr-3">
                    <dt className="font-mono text-[0.62rem] uppercase leading-tight text-ash">{t.calculator.callsLabel}</dt>
                    <dd className="mt-2 font-display text-2xl sm:text-3xl">
                      <AnimatedNumber value={callsPerMonth} />
                    </dd>
                  </div>
                  <div className="border-r border-hairline-dark px-3 py-4">
                    <dt className="font-mono text-[0.62rem] uppercase leading-tight text-ash">{t.calculator.bookingsLabel}</dt>
                    <dd className="mt-2 font-display text-2xl sm:text-3xl">
                      <AnimatedNumber value={bookingsPerMonth} />
                    </dd>
                  </div>
                  <div className="py-4 pl-3">
                    <dt className="font-mono text-[0.62rem] uppercase leading-tight text-ash">{t.calculator.annualLabel}</dt>
                    <dd className="mt-2 font-display text-2xl text-signal sm:text-3xl">
                      <AnimatedNumber value={annual} format="currency" />
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 break-words font-mono text-xs leading-relaxed text-ash">
                  {fill(t.calculator.formula, {
                    calls: missedCalls,
                    rate: bookingRate,
                    ticket: formatCurrency(avgTicket, intlLocale),
                  })}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-ash">{t.calculator.assumption}</p>
              </div>

              <MagneticButton href="#demo" onClick={onCta} className="btn-bone mt-8 self-start px-6 py-4">
                {t.calculator.cta}
                <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
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
        <label htmlFor={id} className="text-base text-ink">
          {label}
        </label>
        {/* aria-hidden: the slider's aria-valuetext already announces this value. */}
        <output htmlFor={id} aria-hidden="true" className="tabular font-display text-3xl leading-none text-ink">
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range mt-2"
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
        <p id={hintId} className="mt-1 text-sm leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
