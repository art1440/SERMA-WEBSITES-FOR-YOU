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

      </div>
    </section>
  );
}
