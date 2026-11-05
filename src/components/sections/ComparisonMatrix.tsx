"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_EDITORIAL } from "@/lib/motion";

/**
 * Stark two-column architectural matrix. Built as a list of rows (not a
 * <table>) so it can restack on phones without losing semantics: every cell
 * carries its own column label (visible on mobile, screen-reader-only on desktop).
 * Icons are always paired with text — never colour alone.
 */
export function ComparisonMatrix() {
  const { t } = useLanguage();

  return (
    <section id="compare" aria-labelledby="compare-title" data-theme="dark" className="bg-ink py-24 text-bone lg:py-32">
      <div className="frame">
        <SectionHeader
          tone="dark"
          headingId="compare-title"
          index={t.compare.index}
          eyebrow={t.compare.eyebrow}
          title={t.compare.title}
          body={t.compare.body}
        />

        <div className="mt-14 lg:mt-20">
          {/* Column headers (visual only on desktop; each row repeats them for AT) */}
          <div aria-hidden="true" className="hidden grid-cols-12 gap-x-8 border-b border-bone pb-4 md:grid">
            <p className="col-span-3 eyebrow text-ash">{t.compare.capability}</p>
            <p className="col-span-4 eyebrow text-ash">{t.compare.colBrochure}</p>
            <p className="col-span-5 eyebrow flex items-center gap-2 text-bone">
              <span className="h-2 w-2 bg-signal" />
              {t.compare.colEngine}
            </p>
          </div>

          <ul>
            {t.compare.rows.map((row, i) => (
              <motion.li
                key={i}
                className="grid grid-cols-12 gap-x-8 gap-y-3 border-b border-hairline-dark py-6"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.75, ease: EASE_EDITORIAL, delay: (i % 4) * 0.06 }}
              >
                <h3 className="col-span-12 font-display text-3xl leading-none md:col-span-3">{row.capability}</h3>
                <dl className="col-span-12 grid grid-cols-1 gap-3 md:col-span-9 md:grid-cols-9 md:gap-x-8">
                  <div className="md:col-span-4">
                    <dt className="eyebrow mb-1.5 text-ash md:sr-only">{t.compare.colBrochure}</dt>
                    <dd className="flex gap-3 text-ash">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center border border-ash/60">
                        <X aria-hidden="true" size={12} strokeWidth={2} />
                        <span className="sr-only">{t.compare.notIncluded}:</span>
                      </span>
                      <span className="text-pretty leading-relaxed">{row.brochure}</span>
                    </dd>
                  </div>
                  <div className="md:col-span-5">
                    <dt className="eyebrow mb-1.5 text-bone md:sr-only">{t.compare.colEngine}</dt>
                    <dd className="flex gap-3 text-bone">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-signal text-ink">
                        <Check aria-hidden="true" size={12} strokeWidth={2.5} />
                        <span className="sr-only">{t.compare.included}:</span>
                      </span>
                      <span className="text-pretty leading-relaxed">{row.engine}</span>
                    </dd>
                  </div>
                </dl>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
