"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { LAUNCH } from "@/data/pricing";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";

/**
 * Honest urgency for the launch offer (all driven by LAUNCH in src/data/pricing.ts):
 * a real spots-left meter, an optional countdown to a REAL end date (never resets), and one
 * true perk per card that changes on each visit. When the spots are gone or the date passes,
 * `live` turns false and the cards fall back to the regular prices on their own.
 */

const END = LAUNCH.endsAt ? Date.parse(LAUNCH.endsAt) : null;
const left = Math.max(0, LAUNCH.spots - LAUNCH.taken);

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

export function useLaunch() {
  const now = useNow();
  // Before mount (static HTML) the date check is skipped; the client corrects it on first paint.
  const beforeEnd = END === null || now === null || now < END;
  const live = LAUNCH.active && left > 0 && beforeEnd;
  return { live, ended: LAUNCH.active && !live, now };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Badge + spots meter + optional countdown, shown above the price while the launch offer is live. */
export function LaunchMeta({ now }: { now: number | null }) {
  const { locale } = useLanguage();
  const pct = (left / LAUNCH.spots) * 100;
  const ms = END !== null && now !== null ? Math.max(0, END - now) : null;

  return (
    <div className="mb-4">
      <p className="inline-flex items-center gap-2 rounded-full bg-aqua/[0.1] px-3 py-1 text-[0.75rem] font-medium text-aqua ring-1 ring-inset ring-aqua/25">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-aqua" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-aqua" />
        </span>
        {LAUNCH.label[locale]}
      </p>
      <p className="mt-2.5 text-[0.8125rem] font-medium text-bone">
        {fill(LAUNCH.spotsLeft[locale], { left, spots: LAUNCH.spots })}
      </p>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bone/[0.1]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={LAUNCH.spots}
        aria-valuenow={left}
        aria-label={fill(LAUNCH.spotsLeft[locale], { left, spots: LAUNCH.spots })}
      >
        <motion.div
          className="h-full origin-left rounded-full bg-[linear-gradient(90deg,rgb(var(--aqua-glow)),rgb(var(--aqua)))]"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: pct / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay: 0.2 }}
        />
      </div>
      {ms !== null ? (
        <p className="mt-2 text-[0.8125rem] text-ash" aria-live="off">
          {LAUNCH.endsIn[locale]}{" "}
          <span className="tabular font-medium text-bone [font-variant-numeric:tabular-nums]">
            {Math.floor(ms / 86_400_000)}d {pad(Math.floor(ms / 3_600_000) % 24)}:{pad(Math.floor(ms / 60_000) % 60)}:
            {pad(Math.floor(ms / 1000) % 60)}
          </span>
        </p>
      ) : null}
    </div>
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
      className="mt-3 flex items-center gap-2 text-[0.8125rem] text-bone/85"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
    >
      <Check aria-hidden="true" size={14} strokeWidth={2} className="shrink-0 text-live" />
      {LAUNCH.perks[i][locale]}
    </motion.p>
  );
}
