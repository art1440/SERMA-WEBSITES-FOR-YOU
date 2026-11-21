"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import { LAUNCH } from "@/data/pricing";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToPricing } from "@/lib/scroll";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * Honest urgency for the limited-time offer (all driven by LAUNCH in src/data/pricing.ts):
 * a countdown to a REAL end date that never resets, an optional real spots-left meter, and one
 * true perk per card that changes on each visit. When the date passes (or the spots are gone),
 * `live` turns false: the cards fall back to their regular prices and the banner and hero chip
 * disappear on their own.
 */

const END = LAUNCH.endsAt ? Date.parse(LAUNCH.endsAt) : null;

/** Current time, ticking once a second only while a countdown is configured (null before mount). */
function useNow(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    if (END === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Offer state for one package: `left` = its real unsold spots (Infinity when there is no limit). */
export function useLaunch(taken = 0) {
  const left = LAUNCH.spots === null ? Infinity : Math.max(0, LAUNCH.spots - taken);
  const now = useNow();
  // Before mount (static HTML) the date check is skipped; the client corrects it on first paint.
  const beforeEnd = END === null || now === null || now < END;
  const live = LAUNCH.active && left > 0 && beforeEnd;
  return { live, ended: LAUNCH.active && !live, now, left };
}

/** Days, hours, minutes, seconds left (null before mount or without an end date). */
function remaining(now: number | null): [number, number, number, number] | null {
  if (END === null || now === null) return null;
  const ms = Math.max(0, END - now);
  return [Math.floor(ms / 86_400_000), Math.floor(ms / 3_600_000) % 24, Math.floor(ms / 60_000) % 60, Math.floor(ms / 1000) % 60];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Badge + savings (and the spots meter when spots are limited), shown above a card's price while the offer is live. */
export function LaunchMeta({ left, save }: { left: number; save: string | null }) {
  const { locale } = useLanguage();
  const spots = LAUNCH.spots;

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-aqua px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.06em] text-ink shadow-[0_6px_16px_-8px_rgb(var(--aqua)/0.9)]">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-ink" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
          </span>
          {LAUNCH.label[locale]}
        </p>
        {save ? (
          <p className="rounded-full px-3 py-1 text-[0.75rem] font-bold text-live ring-1 ring-inset ring-live/45">
            {fill(LAUNCH.save[locale], { amount: save })}
          </p>
        ) : null}
      </div>
      {spots !== null ? (
        <>
          <p className="mt-2.5 text-[0.8125rem] font-bold text-bone">{fill(LAUNCH.spotsLeft[locale], { left, spots })}</p>
          <div
            className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bone/[0.12]"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={spots}
            aria-valuenow={left}
            aria-label={fill(LAUNCH.spotsLeft[locale], { left, spots })}
          >
            <motion.div
              className="h-full origin-left rounded-full bg-[linear-gradient(90deg,rgb(var(--aqua-glow)),rgb(var(--aqua)))]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: left / spots }}
              transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.4 }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

/**
 * One countdown digit pair. Each digit rolls: the old one slides down and out while the new one
 * drops in from above, like a split-flap board. Reduced motion: the digits just change.
 */
function RollingPair({ value, reduce }: { value: string; reduce: boolean }) {
  return (
    <span className="inline-flex">
      {value.split("").map((ch, i) => (
        <span key={i} className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={ch}
              className="absolute inset-0 grid place-items-center"
              initial={reduce ? { opacity: 1 } : { y: "-100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "100%", opacity: 0 }}
              transition={reduce ? { duration: 0 } : { duration: 0.42, ease: EASE_EDITORIAL }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/**
 * The sale banner above the packages: what the deal is, the real deadline, a ticking countdown
 * and a button that opens the free-preview form. Gone once the offer ends.
 */
export function SaleBanner() {
  const { locale } = useLanguage();
  const { openMockup } = useMockup();
  const reduce = useReducedMotionSafe();
  const { live, now } = useLaunch();
  if (!live || END === null) return null;
  const b = LAUNCH.banner;
  const t = remaining(now);
  const units = b.units[locale];

  return (
    <motion.div
      className="relative mt-10 overflow-hidden rounded-glass-lg bg-[radial-gradient(110%_130%_at_0%_0%,rgba(30,99,216,0.55),transparent_60%),radial-gradient(80%_120%_at_100%_100%,rgba(79,144,238,0.35),transparent_60%),linear-gradient(115deg,#081226,#0f2350)] p-6 text-white shadow-[0_30px_60px_-30px_rgba(30,99,216,0.8)] ring-1 ring-inset ring-white/10 sm:p-8 md:mt-12"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
    >
      {/* One pass of light across the banner when it arrives. */}
      {reduce ? null : (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]"
          initial={{ x: "0%" }}
          whileInView={{ x: "420%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.45, 0, 0.2, 1], delay: 0.5 }}
        />
      )}
      <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#4f90ee] px-3 py-1 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-[#081226]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-[#081226]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#081226]" />
            </span>
            {b.eyebrow[locale]}
          </p>
          <p className="mt-3 font-display text-[clamp(1.9rem,4.2vw,3rem)] font-black leading-[1.02] tracking-[-0.035em] [font-variation-settings:'wght'_900]">
            {b.title[locale]}
          </p>
          <p className="mt-3 max-w-xl text-pretty text-[0.9375rem] font-medium leading-relaxed text-white/85">{b.body[locale]}</p>
          <p className="mt-2 text-[0.8125rem] font-semibold text-[#8dbbf5]">{b.endsOn[locale]}</p>
        </div>

        <div className="flex flex-col items-stretch gap-4 sm:items-start lg:items-end">
          <div role="timer" aria-label={b.endsOn[locale]} className="flex gap-2 sm:gap-3">
            {units.map((unit, i) => (
              <div key={unit} className="grid min-w-[4.25rem] place-items-center rounded-2xl bg-white/[0.08] px-2 py-3 ring-1 ring-inset ring-white/15 sm:min-w-[5rem]">
                <span aria-hidden="true" className="font-display text-[2rem] font-black leading-none tracking-[-0.03em] text-white [font-variation-settings:'wght'_900] [font-variant-numeric:tabular-nums] sm:text-[2.5rem]">
                  {t ? <RollingPair value={pad(t[i])} reduce={reduce} /> : "--"}
                </span>
                <span aria-hidden="true" className="mt-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#8dbbf5]">{unit}</span>
              </div>
            ))}
          </div>
          <MagneticButton
            href="#pricing"
            onClick={(e: MouseEvent<HTMLElement>) => {
              e.preventDefault();
              openMockup();
            }}
            aria-haspopup="dialog"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-bold text-[#081226] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.6)] transition-colors duration-200 hover:bg-[#e6effc]"
          >
            {b.cta[locale]}
            <ArrowUpRight aria-hidden="true" size={18} strokeWidth={2.25} />
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}

/** Hero chip: the deal and a minutes-level countdown; tapping it scrolls to the packages. Gone once the offer ends. */
export function HeroSaleChip() {
  const { locale } = useLanguage();
  const { live, now } = useLaunch();
  if (!live || END === null) return null;
  const t = remaining(now);
  const time = t ? `${t[0]}d ${pad(t[1])}h ${pad(t[2])}m` : "…";
  return (
    <a
      href="#pricing"
      onClick={(e) => {
        e.preventDefault();
        goToPricing();
      }}
      className="group inline-flex items-center gap-2 rounded-full bg-aqua px-4 py-2 text-sm font-bold text-ink shadow-[0_0_0_4px_rgb(var(--aqua-glow)/0.25),0_10px_22px_-10px_rgb(var(--aqua)/0.9)] transition-transform duration-200 ease-editorial hover:-translate-y-px"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-ink" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
      </span>
      <span className="[font-variant-numeric:tabular-nums]">{fill(LAUNCH.banner.chip[locale], { time })}</span>
      <ArrowUpRight aria-hidden="true" size={15} strokeWidth={2.5} className="rotate-90 transition-transform duration-200 group-hover:translate-y-0.5" />
    </a>
  );
}

// One shuffle per page load, shared by all cards so no two cards show the same perk.
let order: number[] | null = null;
function perkOrder(): number[] {
  if (!order) {
    order = LAUNCH.perks.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  return order;
}

/** A true perk under the price; which one changes on every visit (picked after mount, so no hydration mismatch). */
export function RotatingPerk({ index }: { index: number }) {
  const { locale } = useLanguage();
  const [i, setI] = useState(index % LAUNCH.perks.length);
  useEffect(() => setI(perkOrder()[index % LAUNCH.perks.length]), [index]);
  return (
    <motion.p
      key={i}
      className="mt-3 flex items-center gap-2 text-[0.8125rem] font-semibold text-bone/90"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
    >
      <Check aria-hidden="true" size={15} strokeWidth={3} className="shrink-0 text-live" />
      {LAUNCH.perks[i][locale]}
    </motion.p>
  );
}
