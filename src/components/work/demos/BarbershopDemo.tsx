"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DemoCredit } from "@/components/work/DemoCredit";
import { barbershop as c } from "@/data/demos/barbershop";
import type { DemoImage } from "@/data/demos";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { staggerDelay } from "@/components/ui/Reveal";
import { BookButton } from "../DemoShell";
import { RazorCutHero } from "../signatures/RazorCutHero";
import { useDemoStill } from "../useDemoStill";

/*
 * Ironside Barber Co. Palette is hard-coded (the site's theme tokens flip
 * under html.dark): black #0E0E0E, bone #EFE6D6, brass #C9A45C, and a
 * secondary text grey #A8A091. Contrast on #0E0E0E: bone 15.6:1, grey 7.4:1,
 * brass 8.2:1; black on brass 8.2:1.
 */
// Display type uses the shared `.demo-display` hook (globals.css); body type comes from the shared reset there.
const DISPLAY = "demo-display font-normal";
const NAV_H = 64;
const SCROLL_MARGIN = { scrollMarginTop: `calc(var(--demo-ribbon) + ${NAV_H}px)` };
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A45C]";
const usd = (n: number) => `$${n}`;

/** Fade-and-rise on first view; renders plain markup (final state) when still. */
function Rise({ children, className, delay = 0, as = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "li" }) {
  const still = useDemoStill();
  if (still) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const M = as === "li" ? motion.li : motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay }}
    >
      {children}
    </M>
  );
}

/** Dotted leader between a service name and its price; draws left to right on first view. */
function Leader({ delay }: { delay: number }) {
  const still = useDemoStill();
  const cls =
    "mx-3 mb-[0.42em] h-[3px] min-w-[3rem] flex-1 origin-left bg-[radial-gradient(circle,#C9A45C_1.1px,transparent_1.4px)] bg-[length:7px_3px] bg-repeat-x opacity-70";
  if (still) return <span aria-hidden="true" className={cls} />;
  return (
    <motion.span
      aria-hidden="true"
      className={cls}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay }}
    />
  );
}

/** Portrait photo with a slow scroll-linked drift inside its frame (transform only). */
function DriftImage({ image, alt, sizes }: { image: DemoImage; alt: string; sizes: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useDemoStill();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);
  return (
    <div ref={ref} className="relative overflow-hidden bg-[#1A1917]" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
      <motion.img
        src={image.src}
        srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        style={still ? { scale: 1 } : { y, scale: 1.1 }}
      />
    </div>
  );
}

export function BarbershopDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];

  const navLinks = [
    { href: "#prices", label: L(c.nav.services) },
    { href: "#shop", label: L(c.nav.shop) },
    { href: "#reviews", label: L(c.nav.reviews) },
  ];

  return (
    <div id="top" className="overflow-x-clip">
      {/* ---------------------------------------------------------------- nav */}
      <header
        className="sticky z-40 border-b border-[#EFE6D6]/10 bg-[#0E0E0E]/95 backdrop-blur-sm"
        style={{ top: "var(--demo-ribbon)", height: NAV_H }}
      >
        <div className="mx-auto flex h-full max-w-[1480px] items-center gap-6 px-4 sm:px-8 lg:px-12">
          <a href="#top" aria-label={L(c.nav.home)} className={`flex items-baseline gap-2 ${FOCUS}`}>
            <span className={`${DISPLAY} text-[1.25rem] uppercase tracking-[0.02em]`}>Ironside</span>
            <span className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#C9A45C] sm:inline">Barber Co.</span>
          </a>
          <nav aria-label={L(c.nav.primary)} className="ml-auto hidden md:block">
            <ul className="flex gap-8 text-[0.875rem] font-medium">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={`text-[#EFE6D6]/85 transition-colors hover:text-[#C9A45C] ${FOCUS}`}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton
            className={`ml-auto inline-flex h-10 shrink-0 items-center whitespace-nowrap border border-[#C9A45C] px-3 text-[0.75rem] font-semibold uppercase tracking-[0.1em] sm:px-4 sm:text-[0.8125rem] sm:tracking-[0.12em] text-[#C9A45C] transition-colors hover:bg-[#C9A45C] hover:text-[#0E0E0E] md:ml-0 ${FOCUS}`}
          >
            {L(c.nav.book)}
          </BookButton>
        </div>
      </header>

      {/* --------------------------------------------------------------- hero */}
      <RazorCutHero
        lines={[L(c.hero.lines[0]), L(c.hero.lines[1])]}
        className="relative mx-auto flex max-w-[1480px] flex-col justify-between px-4 pb-10 pt-8 sm:px-8 sm:pb-12 lg:px-12"
        style={{ minHeight: `max(560px, calc(100svh - var(--demo-ribbon) - ${NAV_H}px))` }}
        headlineClassName={`${DISPLAY} text-[clamp(64px,13vw,200px)] leading-[0.9] tracking-[-0.02em] text-[#EFE6D6]`}
        before={
          <div className="flex items-center justify-between gap-4 pb-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#A8A091]">
            <span>{c.address}</span>
            <span className="hidden sm:inline">{c.phone}</span>
          </div>
        }
        after={
          <div className="mt-12 grid gap-8 border-t border-[#EFE6D6]/15 pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
            <div>
              <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-[#EFE6D6]/90 sm:text-[1.125rem]">{L(c.hero.intro)}</p>
              <p className="mt-4 flex items-center gap-3 text-[0.8125rem] text-[#A8A091]">
                <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-[#C9A45C]" />
                {L(c.hero.walkIns)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <BookButton
                className={`inline-flex h-14 items-center bg-[#C9A45C] px-8 text-[0.9375rem] font-semibold uppercase tracking-[0.14em] text-[#0E0E0E] transition-colors hover:bg-[#EFE6D6] ${FOCUS}`}
              >
                {L(c.hero.cta)}
              </BookButton>
              <a
                href="#prices"
                className={`text-[0.9375rem] font-semibold text-[#EFE6D6] underline decoration-[#C9A45C] decoration-2 underline-offset-[6px] hover:text-[#C9A45C] ${FOCUS}`}
              >
                {L(c.hero.prices)}
              </a>
            </div>
          </div>
        }
      />

      {/* ----------------------------------------------------------- services */}
      <section id="prices" aria-labelledby="prices-title" style={SCROLL_MARGIN} className="border-t border-[#EFE6D6]/10">
        <div className="mx-auto max-w-[1480px] px-4 py-24 sm:px-8 md:py-32 lg:px-12">
          <Rise className="grid gap-6 border-b border-[#EFE6D6]/15 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <h2 id="prices-title" className={`${DISPLAY} text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-[0.9]`}>
              {L(c.services.title)}
            </h2>
            <p className="max-w-[40ch] leading-relaxed text-[#A8A091] md:justify-self-end md:text-[1.0625rem]">{L(c.services.intro)}</p>
          </Rise>
          <ul className="mt-14 grid gap-x-20 gap-y-14 md:grid-cols-2">
            {c.services.items.map((s, i) => (
              <Rise as="li" key={s.price + s.name.en} delay={staggerDelay(i)}>
                <div className="flex items-end">
                  <h3 className={`${DISPLAY} min-w-0 text-[1.375rem] uppercase leading-tight sm:text-[1.75rem]`}>{L(s.name)}</h3>
                  <Leader delay={staggerDelay(i, 0.15)} />
                  <p className={`${DISPLAY} text-[1.75rem] leading-none text-[#C9A45C] sm:text-[2.25rem]`}>{usd(s.price)}</p>
                </div>
                <p className="mt-3 max-w-[42ch] leading-relaxed text-[#EFE6D6]/80">{L(s.detail)}</p>
                <p className="mt-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#A8A091]">
                  {s.minutes} {L(c.services.minutes)}
                </p>
              </Rise>
            ))}
            <Rise as="li" delay={staggerDelay(5)} className="self-end border-l-2 border-[#C9A45C] pl-5">
              <p className="leading-relaxed text-[#A8A091]">{L(c.services.note)}</p>
            </Rise>
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- image strip */}
      <section aria-labelledby="craft-title" className="mx-auto max-w-[1480px] px-4 pb-24 sm:px-8 md:pb-32 lg:px-12">
        <h2 id="craft-title" className="sr-only">
          {L(c.craft.title)}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-10">
          {c.craft.items.map((item, i) => (
            <figure key={item.image.src} className={i === 1 ? "mt-12 md:mt-24" : undefined}>
              <DriftImage image={item.image} alt={L(item.image.alt)} sizes="(min-width: 1480px) 700px, 46vw" />
              <figcaption className="mt-4 grid gap-1 sm:mt-5 md:grid-cols-[auto_1fr] md:gap-6">
                <span className={`${DISPLAY} text-[0.9375rem] uppercase sm:text-[1.125rem]`}>{L(item.caption)}</span>
                <span className="text-[0.875rem] leading-relaxed text-[#A8A091] sm:text-[0.9375rem]">{L(item.detail)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- the shop */}
      <section id="shop" aria-labelledby="shop-title" style={SCROLL_MARGIN} className="relative">
        <div className="relative h-[min(62vh,520px)] md:h-[min(86vh,820px)]">
          <img
            src={c.shop.image.src}
            srcSet={`${c.shop.image.small} 640w, ${c.shop.image.src} ${c.shop.image.width}w`}
            sizes="100vw"
            width={c.shop.image.width}
            height={c.shop.image.height}
            alt={L(c.shop.image.alt)}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[30%_50%]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0E0E0E] to-transparent" />
        </div>
        <div className="relative mx-auto -mt-24 max-w-[1480px] px-4 sm:px-8 md:absolute md:inset-x-0 md:bottom-12 md:mt-0 lg:px-12">
          <Rise className="ml-auto max-w-[440px] border-t-2 border-[#C9A45C] bg-[#0E0E0E] p-6 sm:p-8">
            <h2 id="shop-title" className={`${DISPLAY} text-[2.25rem] uppercase leading-none sm:text-[2.75rem]`}>
              {L(c.shop.title)}
            </h2>
            <p className="mt-4 leading-relaxed text-[#EFE6D6]/85">{L(c.shop.body)}</p>
            <h3 className="mt-7 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#C9A45C]">{L(c.shop.hoursLabel)}</h3>
            <dl className="mt-3 divide-y divide-[#EFE6D6]/10 border-y border-[#EFE6D6]/10">
              {c.hours.map((h) => (
                <div key={h.days.en} className="flex justify-between gap-4 py-2.5">
                  <dt>{L(h.days)}</dt>
                  <dd className="tabular-nums">{L(h.time)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.875rem] text-[#A8A091]">{L(c.shop.closed)}</p>
            <h3 className="mt-7 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#C9A45C]">{L(c.shop.findUs)}</h3>
            <p className="mt-2">
              {c.address}
              <span aria-hidden="true" className="px-2 text-[#A8A091]">
                /
              </span>
              <span className="whitespace-nowrap">{c.phone}</span>
            </p>
          </Rise>
        </div>
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section id="reviews" aria-labelledby="reviews-title" style={SCROLL_MARGIN} className="mx-auto max-w-[1480px] px-4 py-24 sm:px-8 md:py-32 lg:px-12">
        <Rise>
          <h2 id="reviews-title" className={`${DISPLAY} max-w-[16ch] text-[clamp(2.25rem,4.5vw,3.75rem)] uppercase leading-[0.95]`}>
            {L(c.reviewsTitle)}
          </h2>
        </Rise>
        <ul className="mt-14 border-t border-[#EFE6D6]/15">
          {c.reviews.map((r, i) => (
            <Rise
              as="li"
              key={r.name}
              delay={staggerDelay(i)}
              className="grid gap-4 border-b border-[#EFE6D6]/15 py-8 md:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] md:gap-12 md:py-10"
            >
              <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.2em] text-[#C9A45C] md:pt-2">{r.name}</p>
              <blockquote className="max-w-[46ch] text-[1.25rem] font-medium leading-snug sm:text-[1.5rem] lg:text-[1.75rem]">
                <p>{`“${L(r.quote)}”`}</p>
              </blockquote>
            </Rise>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------------- book */}
      <section aria-labelledby="book-title" className="relative overflow-hidden bg-[#C9A45C] text-[#0E0E0E]">
        <div className="relative mx-auto grid max-w-[1480px] gap-8 px-4 py-20 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-28 lg:px-12">
          <div>
            <h2 id="book-title" className={`${DISPLAY} text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.88] tracking-[-0.01em]`}>
              {L(c.book.title)}
            </h2>
            <p className="mt-6 max-w-[40ch] text-[1.125rem] leading-relaxed">{L(c.book.body)}</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <BookButton
              className="inline-flex h-14 items-center bg-[#0E0E0E] px-8 text-[0.9375rem] font-semibold uppercase tracking-[0.14em] text-[#C9A45C] transition-colors hover:text-[#EFE6D6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E0E0E]"
            >
              {L(c.book.cta)}
            </BookButton>
            <p className="text-[0.9375rem]">
              {L(c.book.call)} <span className="whitespace-nowrap font-semibold">{c.phone}</span>
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="mx-auto max-w-[1480px] px-4 pb-10 pt-16 text-[0.9375rem] sm:px-8 lg:px-12">
        <div className="grid gap-10 border-b border-[#EFE6D6]/10 pb-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="flex items-baseline gap-2">
              <span className={`${DISPLAY} text-[1.5rem] uppercase`}>Ironside</span>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#C9A45C]">Barber Co.</span>
            </p>
            <p className="mt-3 text-[#A8A091]">{L(c.footer.tagline)}</p>
          </div>
          <div className="leading-relaxed">
            <p>{c.address}</p>
            <p>{c.phone}</p>
          </div>
          <div className="leading-relaxed">
            {c.hours.map((h) => (
              <p key={h.days.en}>
                {L(h.days)} <span className="text-[#A8A091]">{L(h.time)}</span>
              </p>
            ))}
            <p className="text-[#A8A091]">{L(c.shop.closed)}</p>
          </div>
        </div>
        <p className="mt-6 text-[0.8125rem] text-[#A8A091]">
          <DemoCredit className={`underline decoration-[#A8A091]/50 underline-offset-4 hover:text-[#EFE6D6] ${FOCUS}`}>
            {L(c.footer.credit)}
          </DemoCredit>
        </p>
      </footer>
    </div>
  );
}
