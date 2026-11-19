"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowUpRight, Mail, Phone, ShieldCheck } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard } from "@/components/ui/TiltCard";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { TIERS, type Tier } from "@/data/pricing";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL, SPRING_SNAPPY } from "@/lib/motion";
import { goToForm } from "@/lib/scroll";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { EnquiryForm } from "./EnquiryForm";

/**
 * Entrance order: the featured (middle) card lands first, then its neighbours
 * swing in a beat later, so the row opens outward from the recommendation
 * instead of reading left to right like a table.
 */
const CARD_DELAY: Record<Tier["id"], number> = { starter: 0, business: 0.06, growth: 0.12 };

const listVariants: Variants = {
  hidden: {},
  shown: (delay: number) => ({ transition: { delayChildren: delay, staggerChildren: 0.045 } }),
};
const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_EDITORIAL } },
};
const tickVariants: Variants = {
  hidden: { pathLength: 0 },
  shown: { pathLength: 1, transition: { duration: 0.45, ease: EASE_EDITORIAL, delay: 0.08 } },
};

/** A check mark that draws itself in as its row arrives. */
function Tick({ soon }: { soon?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full ring-1 ring-inset ${
        soon ? "bg-transparent text-ash ring-bone/20" : "bg-aqua/15 text-aqua ring-aqua/40"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M4.5 12.5l5 5L19.5 7" variants={tickVariants} />
      </svg>
    </span>
  );
}

function PriceCard({ tier, onPick }: { tier: Tier; onPick: (tier: Tier) => void }) {
  const { t, locale } = useLanguage();
  const p = t.pricing;
  const delay = CARD_DELAY[tier.id];
  const name = tier.name[locale];

  return (
    <li className={`relative ${tier.featured ? "lg:-translate-y-5" : ""}`}>
      <TiltCard max={5} delay={delay} glare="rounded-glass-lg" className="h-full">
        <div
          className={`glass-dark glass-solid relative flex h-full flex-col rounded-glass-lg p-6 text-bone [-webkit-backdrop-filter:none] [backdrop-filter:none] sm:p-7 ${
            tier.featured ? "ring-2 ring-inset ring-aqua/60 shadow-[0_30px_80px_-30px_rgba(42,107,191,0.55)]" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-[1.75rem] leading-none tracking-[-0.03em]">{name}</h3>
            {tier.featured ? (
              <motion.span
                className="rounded-full bg-aqua px-3 py-1 text-[0.75rem] font-medium text-ink"
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...SPRING_SNAPPY, delay: delay + 0.45 }}
              >
                {p.popular}
              </motion.span>
            ) : null}
          </div>
          <p className="mt-3 min-h-[3em] text-pretty text-[0.9375rem] leading-relaxed text-ash">{tier.tagline[locale]}</p>

          {/* Price: a template slot until a number is set in src/data/pricing.ts. */}
          <div className="mt-6 border-t border-bone/[0.14] pt-6">
            <p className="flex items-baseline gap-2">
              {tier.price === null ? (
                <span className="font-display text-[3rem] leading-none tracking-[-0.04em] text-bone/40">$&thinsp;—</span>
              ) : (
                <AnimatedNumber value={tier.price} format="currency" className="font-display text-[3rem] leading-none tracking-[-0.04em]" />
              )}
              <span className="text-sm text-ash">{p.oneTime}</span>
            </p>
            <p className="mt-2 text-sm text-ash">
              {tier.price === null
                ? p.priceSoon
                : tier.monthly !== null
                  ? fill(p.monthly, { amount: `$${tier.monthly}` })
                  : p.noMonthly}
            </p>
          </div>

          <MagneticButton
            href="#enquiry-form"
            onClick={(e: MouseEvent<HTMLElement>) => {
              e.preventDefault();
              onPick(tier);
            }}
            className={`${tier.featured ? "btn-aqua" : "btn-line-dark glass-flat"} mt-6 w-full justify-center`}
          >
            {fill(p.choose, { plan: name })}
            <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.75} />
          </MagneticButton>

          {tier.inherits ? <p className="eyebrow mt-7 text-ash">{tier.inherits[locale]}</p> : <p className="eyebrow mt-7 text-ash">{p.includes}</p>}

          <motion.ul
            className="mt-4 grid gap-3"
            variants={listVariants}
            custom={delay + 0.35}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "-10%" }}
          >
            {tier.features.map((f) => (
              <motion.li key={f.en} variants={itemVariants} className="flex items-start gap-3 text-[0.9375rem] leading-snug">
                <Tick soon={f.soon} />
                <span className={f.soon ? "text-ash" : "text-bone"}>
                  {f[locale]}
                  {f.soon ? (
                    <span className="ml-2 inline-block whitespace-nowrap rounded-full border border-bone/20 px-2 py-px align-[1px] text-[0.6875rem] font-medium text-ash">
                      {p.soon}
                    </span>
                  ) : null}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </TiltCard>
    </li>
  );
}

/**
 * Pricing: three packages, then the enquiry form. Picking a package carries it
 * down to the form (a chip morphs in above the fields and the "What do you
 * need?" box is pre-filled), so there is one way to get in touch, not four.
 *
 * Finale: the section is the 3D engine's last chapter. The header sits over the
 * transparent stage (the sculpture returns on the right on desktop); the cards
 * and form sit on an ambient light field that fades in underneath.
 */
export function PricingSection() {
  const { t, locale } = useLanguage();
  const { finale } = useScene();
  const reduce = useReducedMotionSafe();
  const p = t.pricing;
  const [plan, setPlan] = useState<Tier | null>(null);
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(p.emailSubject)}&body=${encodeURIComponent(p.emailBody)}`;
  const phone = siteConfig.contactPhone;

  const pick = (tier: Tier) => {
    setPlan(tier);
    goToForm();
  };

  return (
    <section
      id="pricing"
      ref={finale.ref}
      aria-labelledby="pricing-title"
      data-theme="dark"
      className="relative z-10 pb-24 pt-[30vh] text-bone motion-reduce:isolate motion-reduce:overflow-hidden motion-reduce:pt-24 lg:pb-36 lg:pt-36"
    >
      {/* Reduced motion: no 3D stage behind, so the whole section sits in the light field. */}
      <AmbientField variant={0} className="hidden motion-reduce:block" />
      {/* Fade from the bare stage into the field the cards sit on (no seam: it ends at the field's ink wash). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[18vh] h-[14vh] bg-gradient-to-b from-transparent to-ink/[0.86] motion-reduce:hidden lg:top-[16rem] lg:h-48" />
      <AmbientField variant={0} className="top-[32vh] motion-reduce:hidden lg:top-[28rem]" />

      <div className="frame relative">
        <SectionHeader index={p.index} eyebrow={p.eyebrow} title={p.title} body={p.body} headingId="pricing-title" />

        <ol className="mt-12 grid items-stretch gap-6 md:mt-16 lg:grid-cols-3 lg:gap-5 xl:gap-7">
          {TIERS.map((tier) => (
            <PriceCard key={tier.id} tier={tier} onPick={pick} />
          ))}
        </ol>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center text-sm leading-relaxed text-ash">{p.footnote}</p>
        </Reveal>

        {/* Start: what happens next + the form. */}
        <div className="mt-20 grid grid-cols-12 gap-x-4 gap-y-10 lg:mt-28 lg:gap-x-10">
          <Reveal className="col-span-12 lg:col-span-5">
            <h3 className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.08] tracking-[-0.03em] text-balance">{p.nextTitle}</h3>
            <ol className="mt-6 grid gap-2.5">
              {p.next.map((step, i) => (
                <li key={step} className="glass-dark glass-flat flex min-h-[60px] items-center gap-3.5 rounded-glass-sm px-4 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/15 text-[0.75rem] font-medium tabular text-bone ring-1 ring-inset ring-aqua/45">
                    0{i + 1}
                  </span>
                  <span className="text-pretty text-[0.9375rem] leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-7" delay={0.1}>
            <div className="glass-dark glass-solid relative rounded-glass-lg p-5 text-bone [-webkit-backdrop-filter:none] [backdrop-filter:none] sm:p-8 xl:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <p className="eyebrow text-ash">{p.formLabel}</p>
                {/* The picked plan rides down from its card: pops in, and swaps in place on a re-pick. */}
                <AnimatePresence mode="popLayout" initial={false}>
                  {plan ? (
                    <motion.span
                      key={plan.id}
                      layout
                      className="inline-flex items-center gap-2 rounded-full bg-aqua px-3 py-1 text-[0.8125rem] font-medium text-ink"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
                      transition={SPRING_SNAPPY}
                    >
                      {fill(p.selected, { plan: plan.name[locale] })}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>

              <EnquiryForm prefill={plan ? fill(p.prefill, { plan: plan.name[locale] }) : undefined} />

              <div className="mt-7 flex flex-col gap-2.5 border-t border-bone/[0.14] pt-6 text-[0.9375rem]">
                <a href={mailto} className="link-quiet break-all">
                  <Mail aria-hidden="true" size={15} strokeWidth={1.75} className="shrink-0" />
                  {siteConfig.contactEmail}
                </a>
                {phone ? (
                  <a href={`tel:${phone.e164}`} className="link-quiet">
                    <Phone aria-hidden="true" size={15} strokeWidth={1.75} className="shrink-0" />
                    {fill(p.phoneCta, { phone: phone.display })}
                  </a>
                ) : null}
              </div>

              <p className="mt-8 flex items-start gap-3 border-t border-bone/[0.14] pt-6 text-sm leading-relaxed text-ash">
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/[0.078] text-aqua ring-1 ring-inset ring-bone/[0.14]">
                  <ShieldCheck size={16} strokeWidth={1.75} />
                </span>
                <span className="pt-1">{p.noFormNote}</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
