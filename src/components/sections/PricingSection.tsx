"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue, type Variants } from "framer-motion";
import { ArrowUpRight, Mail, MapPin, Phone, ShieldCheck, Timer } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TiltCard } from "@/components/ui/TiltCard";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";
import { LAUNCH, PROMISES, TIERS, type Tier } from "@/data/pricing";
import { LaunchMeta, RotatingPerk, SaleBanner, useLaunch } from "./LaunchOffer";
import { PriceAnchor } from "./PriceAnchor";
import { fill } from "@/i18n/types";
import { formatMetric } from "@/lib/format";
import { EASE_EDITORIAL, SPRING_SNAPPY } from "@/lib/motion";
import { goToForm } from "@/lib/scroll";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { EnquiryForm } from "./EnquiryForm";
import { PricingFaq } from "./PricingFaq";

/**
 * Entrance order: the featured (middle) card lands first, then its neighbours
 * swing in a beat later, so the row opens outward from the recommendation
 * instead of reading left to right like a table.
 */
const PROMISE_ICON = { shield: ShieldCheck, clock: Timer, map: MapPin } as const;

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
      className={`mt-px grid h-[1.375rem] w-[1.375rem] shrink-0 place-items-center rounded-full ${
        soon ? "bg-transparent text-ash ring-[1.5px] ring-inset ring-bone/25" : "bg-aqua text-ink shadow-[0_4px_10px_-3px_rgb(var(--aqua)/0.6)]"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <motion.path d="M4.5 12.5l5 5L19.5 7" variants={tickVariants} />
      </svg>
    </span>
  );
}

/**
 * Price that counts up once (~600ms) when the card scrolls in. Digits are written
 * straight to the DOM; tabular-nums keeps the width steady. Reduced motion shows
 * the final value immediately, and screen readers always get the final value.
 */
function PriceNumber({ value, reduce, className }: { value: number; reduce: boolean; className?: string }) {
  const { intlLocale } = useLanguage();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  // Fail-safe: the real price is the resting state. The count-up only borrows a 0 start once the
  // card is on screen, and any interruption snaps back to the real price, so "$0" can never stick.
  const mv = useMotionValue(value);
  const text = useMotionValue(formatMetric(value, "currency", intlLocale));
  const played = useRef(false);

  useEffect(() => {
    const render = (v: number) => text.set(formatMetric(v, "currency", intlLocale));
    render(mv.get());
    return mv.on("change", render);
  }, [mv, text, intlLocale]);

  useEffect(() => {
    if (reduce || !inView || played.current) {
      mv.jump(value);
      return;
    }
    played.current = true;
    const controls = animate(mv, [0, value], { duration: 0.6, ease: EASE_EDITORIAL });
    return () => {
      controls.stop();
      mv.jump(value);
    };
  }, [inView, value, reduce, mv]);

  return (
    <span ref={ref} className={`tabular whitespace-nowrap [font-variant-numeric:tabular-nums] ${className ?? ""}`}>
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only">{formatMetric(value, "currency", intlLocale)}</span>
    </span>
  );
}

/**
 * The featured card's border: a 2px rim with one bright arc of light that travels around it
 * (a conic gradient spun behind the card, masked to the rim by the card itself sitting on top).
 * One lap every 6s; frozen with the motion pause control and gone for reduced motion.
 */
function RimLight({ still }: { still: boolean }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute -inset-[2px] overflow-hidden rounded-[32px] bg-[rgb(79_144_238/0.55)]">
      {still ? null : (
        <span className="absolute left-1/2 top-1/2 aspect-square min-h-[150%] min-w-[150%] -translate-x-1/2 -translate-y-1/2 animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,rgb(var(--aqua-glow))_320deg,#fff_345deg,transparent_360deg)] motion-reduce:hidden" />
      )}
    </span>
  );
}

function PriceCard({ tier, onPick }: { tier: Tier; onPick: (tier: Tier) => void }) {
  const { t, locale, intlLocale } = useLanguage();
  const { reduce } = useScene();
  const { paused } = useMotionPause();
  const p = t.pricing;
  // Launch offer (LAUNCH in pricing.ts): while live, the regular price is struck through beside today's
  // launch price; once the spots are gone or the real end date passes, the card shows the regular price.
  const { live, ended, left } = useLaunch(tier.launchTaken);
  const launch = live && tier.price !== null && tier.regular !== undefined && tier.regular > tier.price;
  const price = ended && tier.regular !== undefined ? tier.regular : tier.price;
  // "+" (a starting price): the sale price is exact; after the sale, Growth goes back to "$1,200+".
  const showFrom = ended && tier.regular !== undefined ? !!tier.regularFrom : !!tier.from;
  const saved = launch ? tier.regular! - tier.price! : 0;
  const save = launch ? (tier.regularFrom ? `$${Math.floor(saved / 50) * 50}+` : `$${saved}`) : null;
  const delay = CARD_DELAY[tier.id];
  const name = tier.name[locale];
  const still = reduce || paused;

  return (
    <li className={`relative ${tier.featured ? "lg:-translate-y-5" : ""}`}>
      {/* Hover lift (fine pointers only): transform on this wrapper; the deeper shadow fades in via opacity. */}
      <div
        className={`group/card relative h-full ${
          reduce ? "" : "transition-transform duration-base ease-editorial [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1.5"
        }`}
      >
        {reduce ? null : (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 rounded-glass-lg opacity-0 shadow-[0_30px_60px_-24px] shadow-ink/80 transition-opacity duration-base ease-editorial [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:opacity-100`}
          />
        )}
        {tier.featured ? (
          /* Slow aqua rim light: opacity-only breathing, held still when paused or reduced. */
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-glass-lg shadow-[0_0_64px_-10px] shadow-aqua/30"
            initial={false}
            animate={still ? { opacity: 0.8 } : { opacity: [0.55, 1, 0.55] }}
            transition={still ? { duration: 0 } : { duration: 8, ease: "easeInOut", repeat: Infinity }}
          />
        ) : null}
      <TiltCard max={5} delay={delay} glare="rounded-glass-lg" className="h-full">
        {tier.featured ? <RimLight still={still} /> : null}
        <div
          className={`relative flex h-full flex-col rounded-glass-lg p-6 text-bone sm:p-7 ${
            tier.featured
              ? "surface-navy shadow-[0_0_0_8px_rgb(79_144_238/0.12),0_40px_80px_-30px_rgb(30_99_216/0.7)]"
              : "glass-dark glass-solid ring-1 ring-inset ring-bone/10 [-webkit-backdrop-filter:none] [backdrop-filter:none]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-[2rem] font-extrabold leading-none tracking-[-0.035em] [font-variation-settings:'wght'_800]">{name}</h3>
            {tier.featured ? (
              <motion.span
                className="rounded-full bg-aqua-glow px-3.5 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-ink"
                initial={{ opacity: 0, scale: 0.6, y: 6 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...SPRING_SNAPPY, delay: delay + 0.45 }}
              >
                {p.popular}
              </motion.span>
            ) : null}
          </div>
          <p className="mt-3 min-h-[3em] text-pretty text-base font-medium leading-relaxed text-bone/80">{tier.tagline[locale]}</p>

          {/* Price: a template slot until a number is set in src/data/pricing.ts. */}
          <div className="mt-6 border-t border-bone/[0.14] pt-6">
            {launch ? <LaunchMeta left={left} save={save} /> : null}
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              {launch ? (
                <del className="font-display text-[1.5rem] font-bold leading-none tracking-[-0.02em] text-ash decoration-[#e5484d] decoration-[2.5px]">
                  <span className="sr-only">{LAUNCH.regular[locale]}: </span>
                  {formatMetric(tier.regular!, "currency", intlLocale)}
                  {tier.regularFrom ? "+" : ""}
                </del>
              ) : null}
              {price === null ? (
                <span className="font-display text-[3rem] leading-none tracking-[-0.04em] text-bone/40">$&thinsp;—</span>
              ) : (
                <span className="inline-flex items-start">
                  <PriceNumber
                    key={price}
                    value={price}
                    reduce={reduce}
                    className={`font-display text-[4rem] font-black leading-[0.9] tracking-[-0.05em] [font-variation-settings:'wght'_900] sm:text-[4.5rem] ${
                      tier.featured
                        ? "bg-gradient-to-b from-bone-50 to-aqua-glow bg-clip-text text-transparent"
                        : "text-bone-50"
                    }`}
                  />
                  {showFrom ? (
                    <span aria-hidden="true" className="ml-0.5 font-display text-[2.25rem] font-black leading-none text-aqua-glow [font-variation-settings:'wght'_900]">
                      +
                    </span>
                  ) : null}
                </span>
              )}
              <span className="text-sm font-semibold text-ash">{showFrom ? p.fromNote : p.oneTime}</span>
            </p>
            <p className="mt-2 text-sm font-medium text-bone/75">
              {tier.price === null
                ? p.priceSoon
                : tier.monthly !== null
                  ? fill(p.monthly, { amount: `$${tier.monthly}` })
                  : p.noMonthly}
            </p>
            {price !== null && tier.installments ? (
              <p className="mt-1.5 text-sm font-semibold text-aqua-glow">
                {fill(showFrom ? p.installmentsFrom : p.installments, {
                  n: tier.installments,
                  // Cents only when the split isn't a whole number ($266.33, but $333).
                  amount: ((v) =>
                    new Intl.NumberFormat(intlLocale, {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
                      maximumFractionDigits: 2,
                    }).format(v))(Math.round((price / tier.installments) * 100) / 100),
                })}
              </p>
            ) : null}
            {price === null ? null : <RotatingPerk index={TIERS.indexOf(tier)} />}
          </div>

          <MagneticButton
            href="#enquiry-form"
            onClick={(e: MouseEvent<HTMLElement>) => {
              e.preventDefault();
              onPick(tier);
            }}
            className="btn-aqua mt-6 w-full justify-center text-base"
          >
            {fill(p.choose, { plan: name })}
            <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.75} />
          </MagneticButton>

          <p className="mt-7 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-aqua">{tier.inherits ? tier.inherits[locale] : p.includes}</p>

          <motion.ul
            className="mt-4 grid gap-3"
            variants={listVariants}
            custom={delay + 0.35}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "-10%" }}
          >
            {tier.features.map((f) => (
              <motion.li key={f.en} variants={itemVariants} className="flex items-start gap-3 text-[0.9375rem] font-medium leading-snug">
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
      </div>
    </li>
  );
}

/**
 * Pricing: three packages, then the enquiry form. Picking a package carries it
 * down to the form (a chip morphs in above the fields and the "What do you
 * need?" box is pre-filled), so there is one way to get in touch, not four.
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
      className="relative isolate z-10 overflow-hidden py-24 text-bone lg:py-32"
    >
      <AmbientField variant={0} />

      <div className="frame relative">
        <SectionHeader index={p.index} eyebrow={p.eyebrow} title={p.title} body={p.body} headingId="pricing-title" />

        <SaleBanner />

        {PROMISES.length ? (
          <ul className="mt-10 grid gap-3 sm:gap-4 md:mt-12 lg:grid-cols-3">
            {PROMISES.map((item, i) => {
              const Icon = PROMISE_ICON[item.icon];
              return (
                <motion.li
                  key={item.icon}
                  className="h-full"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.05 + i * 0.08 }}
                >
                  <div className="flex h-full items-start gap-3.5 rounded-glass-lg bg-[linear-gradient(120deg,rgb(var(--aqua)/0.2),rgb(var(--aqua-glow)/0.06)_65%,transparent)] p-5 ring-1 ring-inset ring-aqua/30 max-sm:px-4 max-sm:py-4 sm:p-6">
                    <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl bg-aqua text-ink shadow-[0_10px_24px_-10px_rgb(var(--aqua)/0.9)]">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[1.25rem] font-black leading-tight tracking-[-0.025em] text-bone-50 [font-variation-settings:'wght'_900] sm:text-[1.375rem]">
                        {item.title[locale]}
                      </p>
                      <p className="mt-1 text-pretty text-[0.875rem] font-medium leading-snug text-bone/80 sm:mt-1.5 sm:text-[0.9375rem] sm:leading-relaxed">{item.detail[locale]}</p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        ) : null}

        <PriceAnchor />

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
                <li key={step} className="glass-dark glass-flat flex min-h-[64px] items-center gap-4 rounded-glass-sm px-4 py-3 ring-1 ring-inset ring-bone/10">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-aqua text-[0.8125rem] font-bold tabular text-ink shadow-[0_6px_14px_-6px_rgb(var(--aqua)/0.7)]">
                    0{i + 1}
                  </span>
                  <span className="text-pretty text-base font-semibold leading-snug">{step}</span>
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

        <PricingFaq />
      </div>
    </section>
  );
}
