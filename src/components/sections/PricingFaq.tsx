"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { FAQ_GROUPS, FAQ_HEADING, FAQ_ITEMS as ALL_ITEMS } from "@/data/faq";
import { useLaunch } from "./LaunchOffer";
import { SPRING_SNAPPY } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * Pricing FAQ: an accordion, one question open at a time, in labelled groups
 * (FAQ_GROUPS order). Arrow keys run across groups as one list.
 * Each question is a button (aria-expanded, aria-controls) that owns a labelled region.
 * The answer height is never animated in JS: the wrapper transitions grid-template-rows
 * 0fr to 1fr in CSS, and the chevron rotates with SPRING_SNAPPY (transform only).
 * Reduced motion: instant open and close. Arrow keys, Home and End move between questions.
 */
export function PricingFaq() {
  const { locale } = useLanguage();
  // The sale question only shows while the offer is live.
  const { live } = useLaunch();
  const FAQ_ITEMS = ALL_ITEMS.filter((item) => !item.whileSale || live);
  const reduce = useReducedMotionSafe();
  const baseId = useId();
  const [open, setOpen] = useState<string | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = FAQ_ITEMS.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    buttons.current[next]?.focus();
  };

  // "<" is escaped so answer text can never close the script element.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q[locale],
      acceptedAnswer: { "@type": "Answer", text: item.a[locale] },
    })),
  }).replace(/</g, "\\u003c");

  const headingId = `${baseId}-title`;

  return (
    <Reveal>
      <section aria-labelledby={headingId} className="mx-auto mt-20 max-w-3xl lg:mt-28">
        <h3 id={headingId} className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.08] tracking-[-0.03em] text-balance text-bone">
          {FAQ_HEADING[locale]}
        </h3>

        {FAQ_GROUPS.map((group) => {
          const items = FAQ_ITEMS.filter((item) => item.group === group.id);
          if (!items.length) return null;
          const groupId = `${baseId}-g-${group.id}`;
          return (
            <div key={group.id} className="mt-10 first-of-type:mt-8">
              <p id={groupId} className="eyebrow text-aqua">{group.label[locale]}</p>
        <ul aria-labelledby={groupId} className="mt-3 grid gap-2.5">
          {items.map((item) => {
            const i = FAQ_ITEMS.indexOf(item);
            const isOpen = open === item.id;
            const buttonId = `${baseId}-q-${item.id}`;
            const panelId = `${baseId}-a-${item.id}`;
            return (
              <li key={item.id} className="glass-dark glass-flat glass-solid rounded-glass-sm text-bone">
                <h4>
                  <button
                    ref={(el) => {
                      buttons.current[i] = el;
                    }}
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : item.id)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 rounded-glass-sm px-4 py-3 text-left text-[0.9375rem] font-medium leading-snug text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aqua sm:px-5"
                  >
                    <span className="text-pretty">{item.q[locale]}</span>
                    <motion.span
                      aria-hidden="true"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/15 text-aqua ring-1 ring-inset ring-aqua/45"
                      initial={false}
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={reduce ? { duration: 0 } : SPRING_SNAPPY}
                    >
                      <ChevronDown size={16} strokeWidth={1.75} />
                    </motion.span>
                  </button>
                </h4>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid ${isOpen ? "grid-rows-[1fr] visible" : "grid-rows-[0fr] invisible"} ${
                    reduce ? "" : "transition-[grid-template-rows,visibility] duration-base ease-editorial"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="px-4 pb-5 text-pretty text-[0.9375rem] leading-relaxed text-bone/80 sm:px-5">{item.a[locale]}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
            </div>
          );
        })}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </section>
    </Reveal>
  );
}
