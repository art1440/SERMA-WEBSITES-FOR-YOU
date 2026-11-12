"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";

/**
 * "What you get": the eight deliverables in the order a client meets them.
 * A ruled list, not cards: one hairline per row, number on the left, the
 * thing you get in the brand serif, the specific detail under it.
 */
export function InclusionsList() {
  const { t } = useLanguage();
  const section = t.included;

  return (
    <section id="included" aria-labelledby="included-title" className="relative z-10 bg-ink py-20 md:py-28">
      <div className="frame">
        <SectionHeader
          index={section.index}
          eyebrow={section.eyebrow}
          title={section.title}
          body={section.body}
          headingId="included-title"
        />

        <ol className="mt-12 grid gap-x-10 md:mt-14 md:grid-cols-2 md:gap-x-14">
          {section.items.map((item, i) => (
            <li key={item.title} className="border-t border-hairline-dark py-6 md:py-7">
              <div className="flex items-baseline gap-4">
                <span aria-hidden="true" className="tabular shrink-0 font-mono text-[0.6875rem] text-ash">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[1.1875rem] leading-snug text-balance text-bone md:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-pretty text-[0.9375rem] leading-relaxed text-ash">{item.detail}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* The receptionist is kept visible, but labelled as not yet offered. */}
        <div className="mt-12 rounded-glass-sm border border-hairline-dark bg-white/[0.03] p-5 sm:p-6 md:mt-14">
          <p className="eyebrow text-ash">{section.roadmapLabel}</p>
          <h3 className="mt-3 font-display text-[1.1875rem] leading-snug text-bone md:text-xl">{section.roadmapTitle}</h3>
          <ul className="mt-3 grid gap-2 md:grid-cols-3 md:gap-x-8">
            {section.roadmap.map((line) => (
              <li key={line} className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-ash">
                <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-bone/40" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.875rem] leading-relaxed text-ash">{section.roadmapNote}</p>
        </div>
      </div>
    </section>
  );
}
