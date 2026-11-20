"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { beauty as c } from "@/data/demos/beauty";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { BookButton } from "../DemoShell";
import { MaskWindows } from "../signatures/MaskWindows";
import { useDemoStill } from "../useDemoStill";

/*
 * Velvet Room. Palette is hard-coded (the site's theme tokens flip under
 * html.dark) and the root sets color-scheme: dark, so the page is identical in
 * either OS theme.
 *   deep sage  #1E2A24  page              moss   #26352D  raised panels
 *   mist       #E8EFE9  text / steps band sage   #9CC5A6  accent, CTA fill
 *   lichen     #B4C4B9  secondary text    fern   #2F5A3E  accent text on mist
 * Contrast: mist on deep sage 12.7:1, on moss 11.0:1; sage on deep sage 7.8:1,
 * on moss 6.7:1; lichen on deep sage 8.2:1, on moss 7.1:1; deep sage on sage
 * 7.8:1, on mist 12.7:1; fern on mist 6.8:1; #4A5D51 on mist 6.0:1.
 *
 * Fraunces is used light (300) with SOFT 100 and automatic optical sizing,
 * so display sizes get the soft, rounded high-opsz cut. Upright only.
 */
const NAV_H = 64;
const SCROLL_MARGIN = { scrollMarginTop: `calc(var(--demo-ribbon) + ${NAV_H}px)` };
const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12";
const SOFT = "demo-display [font-variation-settings:'SOFT'_100]";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9CC5A6]";
const KICKER = "text-[0.75rem] font-medium uppercase tracking-[0.22em]";
const PILL = `inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-300 ${FOCUS}`;
const PILL_SOLID = `${PILL} bg-[#9CC5A6] text-[#1E2A24] hover:bg-[#E8EFE9]`;

/** Slow fade-and-rise. `onLoad` plays on mount (hero), otherwise on first view. Plain markup when still. */
function Drift({
  children,
  className,
  delay = 0,
  onLoad = false,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onLoad?: boolean;
  as?: "div" | "li";
}) {
  const still = useDemoStill();
  if (still) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const M = as === "li" ? motion.li : motion.div;
  const to = { opacity: 1, y: 0 };
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 18 }}
      {...(onLoad ? { animate: to } : { whileInView: to, viewport: VIEWPORT_ONCE })}
      transition={{ duration: 1.2, ease: EASE_EDITORIAL, delay }}
    >
      {children}
    </M>
  );
}

/** A soft, static sage glow (radial gradient, never animated, no filter). */
function Glow({ className, style }: { className: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full ${className}`}
      style={{ background: "radial-gradient(circle at center, rgba(156,197,166,0.30) 0%, rgba(156,197,166,0.12) 38%, rgba(156,197,166,0) 70%)", ...style }}
    />
  );
}

export function BeautyDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];

  const navLinks = [
    { href: "#treatments", label: L(c.nav.treatments) },
    { href: "#visit", label: L(c.nav.visit) },
    { href: "#reviews", label: L(c.nav.reviews) },
    { href: "#book", label: L(c.nav.hours) },
  ];

  const windows = useMemo(
    () =>
      c.treatments.items.map((t) => ({
        key: t.name.en,
        image: t.image,
        alt: t.image.alt[locale],
        name: t.name[locale],
        duration: `${t.minutes} ${c.treatments.minutes[locale]}`,
        price: `$${t.amount}`,
        detail: t.detail[locale],
        aftercare: t.aftercare[locale],
      })),
    [locale],
  );

  const wordmark = (size: string) => (
    <span className={`${SOFT} inline-flex items-center gap-2.5 font-normal leading-none ${size}`}>
      <span aria-hidden="true" className="inline-block h-[0.55em] w-[0.55em] rounded-full bg-[#9CC5A6]" />
      Velvet Room
    </span>
  );

  return (
    <div id="top" className="overflow-x-clip">
      {/* ---------------------------------------------------------------- nav */}
      <header
        className="sticky z-40 border-b border-[#E8EFE9]/10 bg-[#1E2A24]/95 backdrop-blur-sm"
        style={{ top: "var(--demo-ribbon)", height: NAV_H }}
      >
        <div className={`${WRAP} flex h-full items-center gap-8`}>
          <a href="#top" aria-label={L(c.nav.home)} className={`rounded-full ${FOCUS}`}>
            {wordmark("text-[1.375rem] sm:text-[1.5rem]")}
          </a>
          <nav aria-label={L(c.nav.primary)} className="ml-auto hidden lg:block">
            <ul className="flex gap-9 text-[0.9375rem]">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`rounded-full text-[#E8EFE9]/90 underline decoration-transparent underline-offset-[6px] transition-[text-decoration-color,color] duration-300 hover:text-[#E8EFE9] hover:decoration-[#9CC5A6] ${FOCUS}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton
            className={`${PILL} ml-auto h-10 shrink-0 border border-[#9CC5A6] px-5 text-[0.875rem] text-[#E8EFE9] hover:bg-[#9CC5A6] hover:text-[#1E2A24] lg:ml-0`}
          >
            {L(c.nav.book)}
          </BookButton>
        </div>
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section
        aria-label={L(c.hero.kicker)}
        className="relative isolate flex flex-col"
        style={{ minHeight: `calc(100svh - var(--demo-ribbon) - ${NAV_H}px)` }}
      >
        <Glow className="-left-[18vw] top-[-6%] -z-10 h-[62vw] max-h-[760px] w-[62vw] max-w-[760px] sm:-left-[8vw]" />
        <Glow className="-right-[22vw] bottom-[-14%] -z-10 h-[56vw] max-h-[680px] w-[56vw] max-w-[680px] opacity-80 sm:-right-[6vw]" />
        <div className={`${WRAP} flex flex-1 flex-col items-center justify-center pb-12 pt-10 text-center sm:pb-16 sm:pt-16 lg:pt-12`}>
          <Drift onLoad>
            <p className={`${KICKER} text-[#B4C4B9]`}>{L(c.hero.kicker)}</p>
          </Drift>
          <Drift onLoad delay={0.12}>
            <h1
              className={`${SOFT} mt-6 max-w-[11ch] text-[clamp(4rem,10vw,9rem)] font-light leading-[0.98] tracking-[-0.025em] sm:mt-8 lg:max-w-none`}
            >
              {L(c.hero.headline)}
            </h1>
          </Drift>
          <Drift onLoad delay={0.3}>
            <p className="mx-auto mt-7 max-w-[44ch] text-[1.0625rem] leading-relaxed text-[#E8EFE9]/90 sm:mt-9 sm:text-[1.1875rem]">
              {L(c.hero.intro)}
            </p>
          </Drift>
          <Drift onLoad delay={0.42}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:mt-10">
              <BookButton className={`${PILL_SOLID} h-14 px-8 text-[1rem]`}>{L(c.hero.cta)}</BookButton>
              <a
                href="#treatments"
                className={`rounded-full text-[1rem] font-medium underline decoration-[#9CC5A6] decoration-2 underline-offset-[7px] ${FOCUS}`}
              >
                {L(c.hero.link)}
              </a>
            </div>
          </Drift>
        </div>
        {/* A quiet index of the three treatments along the bottom of the hero. */}
        <div className={`${WRAP} w-full pb-8`}>
          <Drift onLoad delay={0.6}>
            <ul className="flex flex-wrap justify-center gap-x-3 gap-y-2.5 border-t border-[#E8EFE9]/10 pt-6 text-[0.875rem] text-[#B4C4B9]">
              {c.treatments.items.map((t) => (
                <li key={t.name.en} className="rounded-full border border-[#E8EFE9]/15 px-4 py-1.5">
                  {L(t.name)} <span className="text-[#9CC5A6]">· {t.minutes} {L(c.treatments.minutes)}</span>
                </li>
              ))}
            </ul>
          </Drift>
        </div>
      </section>

      {/* -------------------------------------------- treatments (signature) */}
      <section id="treatments" aria-labelledby="treatments-title" style={SCROLL_MARGIN} className="py-24 md:py-32">
        <div className={WRAP}>
          <Drift className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <div>
              <p className={`${KICKER} text-[#9CC5A6]`}>{L(c.treatments.kicker)}</p>
              <h2 id="treatments-title" className={`${SOFT} mt-4 text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.015em]`}>
                {L(c.treatments.title)}
              </h2>
            </div>
            <p className="max-w-[46ch] leading-relaxed text-[#B4C4B9] md:justify-self-end md:text-[1.0625rem]">{L(c.treatments.intro)}</p>
          </Drift>
          <MaskWindows
            className="mt-16 md:mt-20"
            items={windows}
            label={L(c.treatments.label)}
            aftercareLabel={L(c.treatments.aftercareLabel)}
          />
        </div>
      </section>

      {/* ------------------------------------------------- how a visit works */}
      <section
        id="visit"
        aria-labelledby="visit-title"
        style={SCROLL_MARGIN}
        className="mx-2 rounded-[32px] bg-[#E8EFE9] text-[#1E2A24] sm:mx-4 sm:rounded-[48px] lg:mx-8"
      >
        <div className={`${WRAP} py-20 md:py-28`}>
          <Drift className="max-w-[640px]">
            <p className={`${KICKER} text-[#2F5A3E]`}>{L(c.steps.kicker)}</p>
            <h2 id="visit-title" className={`${SOFT} mt-4 text-[clamp(2.375rem,4.6vw,4rem)] font-light leading-[1.04] tracking-[-0.015em]`}>
              {L(c.steps.title)}
            </h2>
            <p className="mt-5 max-w-[46ch] leading-relaxed text-[#4A5D51] md:text-[1.0625rem]">{L(c.steps.intro)}</p>
          </Drift>
          <ol className="relative mt-14 grid gap-12 md:mt-20 lg:grid-cols-3 lg:gap-10">
            {c.steps.items.map((s, i) => (
              <Drift
                as="li"
                key={s.title.en}
                delay={0.15 + i * 0.18}
                className="relative grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-6 lg:grid-cols-1 lg:gap-x-0"
              >
                {/* The thread to the next step: down the left on phones and tablets, across on desktop. */}
                {i < c.steps.items.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-7 top-14 h-[calc(100%-0.5rem)] w-px bg-[#1E2A24]/20 lg:left-14 lg:top-7 lg:h-px lg:w-[calc(100%-1rem)]"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`${SOFT} relative flex h-14 w-14 items-center justify-center rounded-full border border-[#1E2A24]/25 bg-[#E8EFE9] text-[1.5rem] font-normal`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 pt-1 lg:pt-8">
                  <p className={`${KICKER} text-[#2F5A3E]`}>{L(s.when)}</p>
                  <h3 className={`${SOFT} mt-3 text-[1.625rem] font-normal leading-[1.15] sm:text-[1.875rem]`}>{L(s.title)}</h3>
                  <p className="mt-4 max-w-[40ch] leading-relaxed text-[#4A5D51]">{L(s.body)}</p>
                </div>
              </Drift>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section id="reviews" aria-labelledby="reviews-title" style={SCROLL_MARGIN} className="py-24 md:py-32">
        <div className={WRAP}>
          <Drift>
            <p className={`${KICKER} text-[#9CC5A6]`}>{L(c.reviewsKicker)}</p>
            <h2 id="reviews-title" className={`${SOFT} mt-4 max-w-[18ch] text-[clamp(2.25rem,4.4vw,3.75rem)] font-light leading-[1.05] tracking-[-0.015em]`}>
              {L(c.reviewsTitle)}
            </h2>
          </Drift>
          <ul className="mt-14 grid gap-5 md:mt-16 lg:grid-cols-3 lg:gap-6">
            {c.reviews.map((r, i) => (
              <Drift as="li" key={r.name} delay={0.1 + i * 0.15} className={i === 1 ? "lg:mt-16" : ""}>
                <figure className="flex h-full flex-col rounded-[28px] bg-[#26352D] p-8 sm:p-10">
                  <span aria-hidden="true" className={`${SOFT} block h-8 text-[4rem] font-light leading-[0.9] text-[#9CC5A6]`}>
                    “
                  </span>
                  <blockquote className="mt-4 flex-1">
                    <p className={`${SOFT} text-[1.3125rem] font-light leading-[1.4] sm:text-[1.4375rem]`}>{L(r.quote)}</p>
                  </blockquote>
                  <figcaption className="mt-8 border-t border-[#E8EFE9]/10 pt-5 text-[0.9375rem]">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-[#B4C4B9]"> · {L(c.reviewTreatments[i])}</span>
                  </figcaption>
                </figure>
              </Drift>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- hours + book */}
      <section id="book" aria-labelledby="book-title" style={SCROLL_MARGIN} className={`${WRAP} pb-16`}>
        <Drift className="relative isolate overflow-hidden rounded-[40px] bg-[#26352D] sm:rounded-[48px]">
          <Glow className="-right-40 -top-40 -z-10 h-[520px] w-[520px]" />
          <div className="grid gap-14 px-6 py-14 sm:px-12 sm:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20 lg:px-16">
            <div>
              <p className={`${KICKER} text-[#9CC5A6]`}>{L(c.visit.kicker)}</p>
              <h2 id="book-title" className={`${SOFT} mt-4 max-w-[14ch] text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-[1.02] tracking-[-0.015em]`}>
                {L(c.visit.title)}
              </h2>
              <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#E8EFE9]/90">{L(c.visit.body)}</p>
              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                <BookButton className={`${PILL_SOLID} h-14 px-8 text-[1rem]`}>{L(c.visit.cta)}</BookButton>
                <p className="text-[0.9375rem] text-[#B4C4B9]">
                  {L(c.visit.call)} <span className="whitespace-nowrap font-semibold text-[#E8EFE9]">{c.phone}</span>
                </p>
              </div>
              <p className="mt-6 text-[0.9375rem] text-[#B4C4B9]">{L(c.visit.policy)}</p>
            </div>
            <div className="lg:pt-2">
              <h3 className={`${KICKER} text-[#9CC5A6]`}>{L(c.visit.hoursLabel)}</h3>
              <dl className="mt-4 border-t border-[#E8EFE9]/15">
                {c.hours.map((h) => (
                  <div key={h.days.en} className="flex items-baseline justify-between gap-6 border-b border-[#E8EFE9]/15 py-4">
                    <dt>{L(h.days)}</dt>
                    <dd className={`${SOFT} whitespace-nowrap text-[1.125rem] tabular-nums`}>{L(h.time)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[0.9375rem] text-[#B4C4B9]">{L(c.visit.closed)}</p>
              <h3 className={`${KICKER} mt-12 text-[#9CC5A6]`}>{L(c.visit.findUs)}</h3>
              <p className={`${SOFT} mt-4 text-[1.625rem] font-light leading-tight`}>{c.address}</p>
              <p className="mt-2 max-w-[40ch] text-[0.9375rem] leading-relaxed text-[#B4C4B9]">{L(c.visit.directions)}</p>
            </div>
          </div>
        </Drift>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className={`${WRAP} flex flex-col items-center pb-10 pt-12 text-center`}>
        <p>{wordmark("text-[1.875rem] sm:text-[2.25rem]")}</p>
        <p className="mt-3 text-[#B4C4B9]">{L(c.footer.tagline)}</p>
        <p className="mt-6 text-[0.9375rem]">
          {c.address}
          <span aria-hidden="true" className="px-3 text-[#9CC5A6]">
            ·
          </span>
          <span className="whitespace-nowrap">{c.phone}</span>
        </p>
        <p className="mt-14 w-full border-t border-[#E8EFE9]/10 pt-6 text-[0.8125rem] text-[#B4C4B9]">
          <Link href="/" className={`rounded underline decoration-[#B4C4B9]/50 underline-offset-4 hover:text-[#E8EFE9] ${FOCUS}`}>
            {L(c.footer.credit)}
          </Link>
        </p>
      </footer>
    </div>
  );
}
