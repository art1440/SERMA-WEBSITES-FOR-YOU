"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { TIERS } from "@/data/pricing";
import { fill } from "@/i18n/types";
import { formatCurrency } from "@/lib/format";
import { EASE_EDITORIAL } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useLaunch } from "./LaunchOffer";

/** Low end of what agencies typically charge; the bars are drawn to scale against it. */
const AGENCY_FROM = 3000;

/**
 * Price anchor above the packages: what a typical agency charges next to where Serma starts,
 * as two bars that grow into place when they scroll into view. Drawn to scale (the agency bar
 * is $3,000), so the gap the eye sees is the real one. The Serma price follows the sale.
 */
export function PriceAnchor() {
  const { t, intlLocale } = useLanguage();
  const reduce = useReducedMotionSafe();
  // useInView on the block (not whileInView on each bar): inside the pricing section the per-bar trigger never fired.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const grown = reduce || inView;
  const a = t.pricing.anchor;
  const starter = TIERS[0];
  const { ended } = useLaunch(starter.launchTaken);
  const from = (ended && starter.regular !== undefined ? starter.regular : starter.price) ?? 0;
  const usWidth = Math.max(0.08, Math.min(1, from / AGENCY_FROM));

  const rows = [
    { label: a.agency, price: a.agencyPrice, width: 1, us: false },
    { label: a.us, price: fill(a.usPrice, { price: formatCurrency(from, intlLocale) }), width: usWidth, us: true },
  ];

  return (
    <div ref={ref} className="mt-10 rounded-glass-lg p-5 ring-1 ring-inset ring-bone/10 sm:p-6 md:mt-12">
      <p className="text-pretty font-display text-[1.25rem] font-bold leading-snug tracking-[-0.02em] text-bone-50 sm:text-[1.5rem]">{a.title}</p>
      <div className="mt-5 grid gap-4">
        {rows.map((r, i) => (
          <div key={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-[0.9375rem]">
              <span className={r.us ? "font-bold text-bone-50" : "font-medium text-bone/75"}>{r.label}</span>
              <span className={r.us ? "font-bold text-aqua-glow" : "font-semibold text-bone/75"}>{r.price}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-bone/[0.08]">
              <motion.div
                className={`h-full origin-left rounded-full ${
                  r.us
                    ? "bg-[linear-gradient(90deg,rgb(var(--aqua)),rgb(var(--aqua-glow)))] shadow-[0_0_14px_rgb(var(--aqua-glow)/0.6)]"
                    : "bg-bone/30"
                }`}
                style={{ width: `${r.width * 100}%` }}
                initial={false}
                animate={{ scaleX: grown ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: r.us ? 0.7 : 1.1, ease: EASE_EDITORIAL, delay: 0.15 + i * 0.35 }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[0.8125rem] text-ash">{a.note}</p>
    </div>
  );
}
