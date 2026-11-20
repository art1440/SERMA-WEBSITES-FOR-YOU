"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { restaurant as c } from "@/data/demos/restaurant";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { BookButton } from "../DemoShell";
import { MenuPlating, type PlatingCourse } from "../signatures/MenuPlating";
import { useDemoStill } from "../useDemoStill";

/*
 * Ember & Oak. Palette is hard-coded (the site's theme tokens flip under
 * html.dark) and the root sets color-scheme: dark, so the page is identical in
 * either OS theme.
 *   ember  #2A0F0C  page               hearth #1E0907  reservations band
 *   cream  #F7E4CF  text / menu card   ochre  #E0902F  accent, CTA fill
 *   ash    #D4B49A  secondary text     burnt  #9A3B12  accent on the cream card
 *   smoke  #6E4636  secondary text on the cream card
 * Contrast: cream on ember 14.5:1, on hearth 15.5:1; ochre on ember 7.0:1, on
 * hearth 7.5:1; ash on ember 9.2:1, on hearth 9.8:1; ember on ochre 7.0:1;
 * on the cream card ember 14.5:1, smoke 6.5:1, burnt 5.6:1. Ochre is never
 * set on cream (2.1:1). Text over the hero photo sits on a scrim of >= 85%
 * ember (see HeroPhoto).
 *
 * Young Serif (one weight) carries every display line; Instrument Sans the
 * rest. Young Serif has no small caps, so "small caps" are Instrument Sans
 * capitals, small and tracked, as on a printed menu.
 */
const NAV_H = 64;
const SCROLL_MARGIN = { scrollMarginTop: `calc(var(--demo-ribbon) + ${NAV_H}px)` };
const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E0902F]";
const SMALL_CAPS = "text-[0.75rem] font-semibold uppercase tracking-[0.24em]";
const BTN = `inline-flex items-center justify-center rounded-[3px] font-semibold tracking-[0.01em] transition-colors duration-300 ${FOCUS}`;
const BTN_SOLID = `${BTN} bg-[#E0902F] text-[#2A0F0C] hover:bg-[#F7E4CF]`;
const BTN_LINE = `${BTN} border border-[#F7E4CF]/60 text-[#F7E4CF] hover:border-[#F7E4CF] hover:bg-[#F7E4CF] hover:text-[#2A0F0C]`;

/** Fade-and-rise. `onLoad` plays on mount (hero), otherwise on first view. Plain markup when still. */
function Rise({
  children,
  className,
  delay = 0,
  onLoad = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onLoad?: boolean;
}) {
  const still = useDemoStill();
  if (still) return <div className={className}>{children}</div>;
  const to = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      {...(onLoad ? { animate: to } : { whileInView: to, viewport: VIEWPORT_ONCE })}
      transition={{ duration: 0.9, ease: EASE_EDITORIAL, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The hero photo. Never drawn wider than its 1024px source:
 *   < 640     full width, square box -> cover draws it at 1.49x the viewport (<= 952px)
 *   640-1023  full width, 16:10 box -> width-bound, drawn at the viewport width (<= 1023px)
 *   >= 1024   right-hand panel, min(62vw, 1024px) wide and <= 688px tall, so the
 *             cover width max(W, H * 1.488) is <= 1024px.
 * Scrims: phones/tablets fade the bottom into ember (the headline overlaps the
 * last ~20%, where the scrim is >= 85% ember); desktop fades the left edge
 * over a fixed 560px, so however wide the panel is, the headline's overlap
 * (<= ~230px, at 1600px) sits on >= 80% ember and the intro on >= 90%.
 * Worst case (a white pixel under 80% ember): cream 6.5:1, ochre 3.9:1 on
 * the large-text h1; ochre kicker on phones/tablets (>= 85%) 5.0:1.
 * Motion: a dark veil lifts off the photo on load ("the lights come up") and a
 * soft ochre glow over the oven flickers slowly. Opacity only; both are
 * dropped when still.
 */
function HeroPhoto() {
  const still = useDemoStill();
  const { locale } = useLanguage();
  const img = c.hero.image;
  return (
    <div className="relative aspect-square w-full overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:w-[min(62vw,1024px)]">
      <img
        src={img.src}
        srcSet={`${img.small} 640w, ${img.src} ${img.width}w`}
        // Desktop: cover can draw it up to 1024px wide (height-bound), so ask for the full source.
        sizes="(min-width: 1024px) 1024px, (min-width: 640px) 100vw, 150vw"
        width={img.width}
        height={img.height}
        alt={img.alt[locale]}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[60%_50%]"
      />
      {!still && (
        <>
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[#1E0907]"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: EASE_EDITORIAL, delay: 0.1 }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-[20%] top-0 h-[55%]"
            style={{ background: "radial-gradient(50% 60% at 50% 25%, rgba(224,144,47,0.32), rgba(224,144,47,0) 70%)" }}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.95, 0.65, 1, 0.55] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
          />
        </>
      )}
      {/* Desktop: a cream order ticket pinned to the photo, naming the dish in it. */}
      <p className="absolute bottom-10 right-10 z-10 hidden -rotate-2 bg-[#F7E4CF] px-5 py-4 text-[#2A0F0C] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] lg:block">
        <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-[#9A3B12]">{c.hero.special.label[locale]}</span>
        <span className="mt-1.5 flex items-baseline gap-4">
          <span className="demo-display text-[1.25rem] leading-tight">{c.hero.special.name[locale]}</span>
          <span className="demo-display text-[1.25rem] text-[#9A3B12]">
            <span className="sr-only">$</span>
            {c.hero.special.price}
          </span>
        </span>
      </p>
      {/* Phones and tablets: bottom fade under the overlapping headline. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(42,15,12,0.2) 0%, rgba(42,15,12,0) 20%, rgba(42,15,12,0) 50%, rgba(42,15,12,0.86) 78%, #2A0F0C 100%)",
        }}
      />
      {/* Desktop: left fade under the headline, a little weight along the bottom. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(to right, #2A0F0C 0px, rgba(42,15,12,0.9) 180px, rgba(42,15,12,0.6) 320px, rgba(42,15,12,0.2) 440px, rgba(42,15,12,0) 560px), linear-gradient(to top, #2A0F0C 0%, rgba(42,15,12,0.5) 14%, rgba(42,15,12,0) 32%)",
        }}
      />
    </div>
  );
}

function HeroHeadline({ lines, es }: { lines: string[]; es: boolean }) {
  const still = useDemoStill();
  // The Spanish lines are half as long again, so they run a size smaller.
  const size = es
    ? "text-[clamp(2.75rem,11vw,3.5rem)] sm:text-[clamp(3.5rem,8vw,4.75rem)] lg:text-[clamp(4rem,5.6vw,5.75rem)]"
    : "text-[clamp(3.25rem,14vw,4rem)] sm:text-[clamp(4.5rem,10vw,6rem)] lg:text-[clamp(5rem,7.2vw,7.25rem)]";
  return (
    <h1 className={`demo-display mt-4 leading-[0.98] tracking-[-0.02em] text-[#F7E4CF] ${size}`}>
      {lines.map((text, i) => {
        const cls = `block ${i === 1 ? "text-[#E0902F]" : ""}`;
        // The space keeps the accessible name "Wood fire. Late tables."
        return still ? (
          <span key={i} className={cls}>
            {text}{" "}
          </span>
        ) : (
          // Transform only: the h1 is opaque from the first paint.
          <motion.span
            key={i}
            className={cls}
            initial={{ y: 22 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: EASE_EDITORIAL, delay: 0.05 + i * 0.12 }}
          >
            {text}{" "}
          </motion.span>
        );
      })}
    </h1>
  );
}

export function RestaurantDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];
  const es = locale === "es";

  const navLinks = [
    { href: "#menu", label: L(c.nav.menu) },
    { href: "#room", label: L(c.nav.room) },
    { href: "#reviews", label: L(c.nav.reviews) },
    { href: "#visit", label: L(c.nav.hours) },
  ];

  const courses: PlatingCourse[] = useMemo(
    () =>
      c.menu.courses.map((course) => {
        const items = course.items.map((it) => ({ id: it.id, name: it.name[locale], price: it.price, detail: it.detail[locale] }));
        const priceOf = (id: string) => course.items.find((it) => it.id === id)?.price ?? 0;
        return {
          id: course.id,
          title: course.title[locale],
          note: course.note[locale],
          items,
          photos:
            course.id === "fire"
              ? [
                  { image: c.menu.flatbread, alt: c.menu.flatbread.alt[locale], caption: c.menu.flatbreadCaption[locale], price: priceOf("flatbread") },
                  { image: c.menu.steak, alt: c.menu.steak.alt[locale], caption: c.menu.steakCaption[locale], price: priceOf("ribeye") },
                ]
              : undefined,
        };
      }),
    [locale],
  );

  const wordmark = (size: string) => (
    <span className={`demo-display whitespace-nowrap leading-none ${size}`}>
      Ember <span className="text-[#E0902F]">&amp;</span> Oak
    </span>
  );

  return (
    <div id="top" className="overflow-x-clip">
      {/* ---------------------------------------------------------------- nav */}
      <header
        className="sticky z-40 border-b border-[#F7E4CF]/10 bg-[#2A0F0C]/95 backdrop-blur-sm"
        style={{ top: "var(--demo-ribbon)", height: NAV_H }}
      >
        <div className={`${WRAP} flex h-full items-center gap-8`}>
          <a href="#top" aria-label={L(c.nav.home)} className={`rounded-[3px] ${FOCUS}`}>
            {wordmark("text-[1.5rem] sm:text-[1.625rem]")}
          </a>
          <nav aria-label={L(c.nav.primary)} className="ml-auto hidden lg:block">
            <ul className="flex gap-9 text-[0.9375rem]">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`rounded-[3px] text-[#F7E4CF]/90 underline decoration-transparent underline-offset-[6px] transition-[text-decoration-color,color] duration-300 hover:text-[#F7E4CF] hover:decoration-[#E0902F] ${FOCUS}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton className={`${BTN_SOLID} ml-auto h-10 shrink-0 px-5 text-[0.875rem] lg:ml-0`}>{L(c.nav.reserve)}</BookButton>
        </div>
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section
        aria-label={L(c.hero.kicker)}
        className="relative isolate lg:flex lg:h-[min(calc(100svh-var(--demo-ribbon)-64px),688px)] lg:min-h-[600px] lg:items-end"
      >
        <HeroPhoto />
        <div className={`${WRAP} relative z-10 -mt-[4.5rem] w-full pb-14 sm:-mt-28 sm:pb-16 lg:mt-0 lg:pb-16`}>
          <Rise onLoad delay={0.15}>
            <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.hero.kicker)}</p>
          </Rise>
          <HeroHeadline lines={c.hero.headline.map(L)} es={es} />
          <Rise onLoad delay={0.35} className="lg:max-w-[min(34rem,36vw)]">
            <p className="mt-5 max-w-[40ch] text-[1rem] leading-relaxed text-[#F7E4CF]/90 sm:mt-6 sm:text-[1.0625rem]">{L(c.hero.intro)}</p>
          </Rise>
          <Rise onLoad delay={0.45}>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <BookButton className={`${BTN_SOLID} h-[3.25rem] flex-1 px-6 text-[0.9375rem] sm:h-14 sm:flex-none sm:px-8 sm:text-[1rem]`}>
                {L(c.hero.reserve)}
              </BookButton>
              <BookButton className={`${BTN_LINE} h-[3.25rem] flex-1 px-6 text-[0.9375rem] sm:h-14 sm:flex-none sm:px-8 sm:text-[1rem]`}>
                {L(c.hero.pickup)}
              </BookButton>
            </div>
          </Rise>
          <Rise onLoad delay={0.55}>
            <p className="mt-6 flex items-center gap-3 text-[0.875rem] text-[#D4B49A]">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#E0902F] shadow-[0_0_10px_2px_rgba(224,144,47,0.6)]" />
              {L(c.hero.tonight)}
            </p>
          </Rise>
        </div>
      </section>

      {/* ------------------------------------------------- menu (signature) */}
      <section id="menu" aria-labelledby="menu-title" style={SCROLL_MARGIN} className="relative isolate pb-24 pt-10 sm:pt-16 md:pb-32 md:pt-24">
        {/* The card lies on a table near the oven: a warm pool of light behind it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[18%] -z-10 h-[70%]"
          style={{ background: "radial-gradient(55% 50% at 50% 50%, rgba(224,144,47,0.16), rgba(224,144,47,0) 70%)" }}
        />
        <div className={WRAP}>
          <Rise className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <div>
              <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.menu.kicker)}</p>
              <h2 id="menu-title" className="demo-display mt-4 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.015em]">
                {L(c.menu.title)}
              </h2>
            </div>
            <p className="max-w-[46ch] leading-relaxed text-[#D4B49A] md:justify-self-end md:text-[1.0625rem]">{L(c.menu.intro)}</p>
          </Rise>
          <MenuPlating
            className="-mx-1 mt-14 sm:mx-0 md:mt-16"
            courses={courses}
            house={c.business}
            title={L(c.menu.cardTitle)}
            sub={L(c.menu.cardSub)}
            footnote={L(c.menu.footnote)}
          />
        </div>
      </section>

      {/* ------------------------------------------------------ private dining */}
      <section
        id="room"
        aria-labelledby="room-title"
        style={SCROLL_MARGIN}
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-center xl:grid-cols-[minmax(0,1fr)_minmax(0,36rem)]"
      >
        {/* Bleeds off the left edge on desktop; the box is the photo's own 1024:688, never wider than 1024px. */}
        <div className="relative aspect-[1024/688] w-full overflow-hidden lg:max-w-[1024px] lg:justify-self-end">
          <img
            src={c.room.image.src}
            srcSet={`${c.room.image.small} 640w, ${c.room.image.src} ${c.room.image.width}w`}
            sizes="(min-width: 1024px) min(calc(100vw - 32rem), 1024px), 100vw"
            width={c.room.image.width}
            height={c.room.image.height}
            alt={L(c.room.image.alt)}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <Rise className="px-4 pb-6 pt-12 sm:px-8 sm:pt-14 lg:px-12 lg:py-16 xl:px-16">
          <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.room.kicker)}</p>
          <h2 id="room-title" className="demo-display mt-4 max-w-[16ch] text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
            {L(c.room.title)}
          </h2>
          <p className="mt-6 max-w-[46ch] leading-relaxed text-[#F7E4CF]/90 md:text-[1.0625rem]">{L(c.room.body)}</p>
          <dl className="mt-8 max-w-[34rem] border-t border-[#F7E4CF]/15">
            {c.room.facts.map((f) => (
              <div key={f.label.en} className="flex items-baseline justify-between gap-6 border-b border-[#F7E4CF]/15 py-3.5">
                <dt className="text-[0.9375rem] text-[#D4B49A]">{L(f.label)}</dt>
                <dd className="text-right font-medium">{L(f.value)}</dd>
              </div>
            ))}
          </dl>
          <BookButton className={`${BTN_LINE} mt-9 h-12 px-6 text-[0.9375rem]`}>{L(c.room.cta)}</BookButton>
        </Rise>
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section id="reviews" aria-labelledby="reviews-title" style={SCROLL_MARGIN} className="py-24 md:py-32">
        <div className={WRAP}>
          <Rise>
            <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.reviewsKicker)}</p>
            <h2 id="reviews-title" className="demo-display mt-4 max-w-[20ch] text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
              {L(c.reviewsTitle)}
            </h2>
          </Rise>
          {/* Three order tickets: a torn (dashed) top edge, the table, the words, what came out of the kitchen. */}
          <ul className="mt-14 grid gap-12 md:mt-16 lg:grid-cols-3 lg:gap-0">
            {c.reviews.map((r, i) => (
              <li key={r.name} className={`min-w-0 ${i > 0 ? "lg:border-l lg:border-[#F7E4CF]/12 lg:pl-10" : ""} ${i < 2 ? "lg:pr-10" : ""}`}>
                <Rise delay={0.08 * i}>
                  <figure className="border-t border-dashed border-[#F7E4CF]/35 pt-6">
                    <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(r.table)}</p>
                    <blockquote className="mt-5">
                      <p className="demo-display text-[1.375rem] leading-[1.32] sm:text-[1.5rem]">{`“${L(r.quote)}”`}</p>
                    </blockquote>
                    <figcaption className="mt-6">
                      <p className="font-semibold">{r.name}</p>
                      <p className="mt-1 text-[0.9375rem] text-[#D4B49A]">
                        {L(c.orderedLabel)}: {L(r.ordered)}
                      </p>
                    </figcaption>
                  </figure>
                </Rise>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------- hours + reservations */}
      <section id="visit" aria-labelledby="visit-title" style={SCROLL_MARGIN} className="relative isolate overflow-hidden bg-[#1E0907]">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[#E0902F]/60" />
        {/* Embers under the band: a low ochre glow along the bottom edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[60%]"
          style={{ background: "radial-gradient(60% 80% at 30% 100%, rgba(224,144,47,0.18), rgba(224,144,47,0) 70%)" }}
        />
        <div className={`${WRAP} grid gap-16 py-20 md:py-28 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20`}>
          <Rise>
            <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.visit.kicker)}</p>
            <h2 id="visit-title" className="demo-display mt-4 max-w-[15ch] text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.015em]">
              {L(c.visit.title)}
            </h2>
            <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#F7E4CF]/90">{L(c.visit.body)}</p>
            <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
              <BookButton className={`${BTN_SOLID} h-14 flex-1 whitespace-nowrap px-4 text-[0.9375rem] sm:flex-none sm:px-8 sm:text-[1rem]`}>{L(c.visit.reserve)}</BookButton>
              <BookButton className={`${BTN_LINE} h-14 flex-1 whitespace-nowrap px-4 text-[0.9375rem] sm:flex-none sm:px-8 sm:text-[1rem]`}>{L(c.visit.pickup)}</BookButton>
            </div>
            <p className="mt-6 max-w-[46ch] text-[0.9375rem] text-[#D4B49A]">{L(c.visit.walkIns)}</p>
          </Rise>
          <Rise delay={0.1} className="lg:pt-2">
            <h3 className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.visit.hoursLabel)}</h3>
            <dl className="mt-5 space-y-5">
              {c.hours.map((h) => (
                <div key={h.days.en}>
                  <dt className="text-[0.9375rem] text-[#D4B49A]">{L(h.days)}</dt>
                  <dd className="demo-display mt-1 text-[2rem] leading-tight lining-nums">{L(h.time)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9375rem] text-[#D4B49A]">{L(c.visit.closed)}</p>
            <h3 className={`${SMALL_CAPS} mt-12 text-[#E0902F]`}>{L(c.visit.findUs)}</h3>
            <p className="demo-display mt-4 text-[1.75rem] leading-tight">{c.address}</p>
            <p className="mt-2 max-w-[40ch] text-[0.9375rem] leading-relaxed text-[#D4B49A]">{L(c.visit.directions)}</p>
            <p className="mt-5 text-[0.9375rem] text-[#D4B49A]">
              {L(c.visit.call)} <span className="whitespace-nowrap font-semibold text-[#F7E4CF]">{c.phone}</span>
            </p>
          </Rise>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="bg-[#1E0907]">
        <div className={`${WRAP} border-t border-[#F7E4CF]/10 pb-10 pt-12`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p>{wordmark("text-[2.25rem] sm:text-[2.75rem]")}</p>
              <p className="mt-3 text-[#D4B49A]">{L(c.footer.tagline)}</p>
            </div>
            <p className="text-[0.9375rem] sm:text-right">
              {c.address}
              <span aria-hidden="true" className="px-3 text-[#E0902F]">
                ·
              </span>
              <span className="whitespace-nowrap">{c.phone}</span>
            </p>
          </div>
          <p className="mt-12 text-[0.8125rem] text-[#D4B49A]">
            <Link href="/" className={`rounded underline decoration-[#D4B49A]/50 underline-offset-4 hover:text-[#F7E4CF] ${FOCUS}`}>
              {L(c.footer.credit)}
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
