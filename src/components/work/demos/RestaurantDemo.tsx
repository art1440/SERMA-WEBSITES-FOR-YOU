"use client";

import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DemoCredit } from "@/components/work/DemoCredit";
import { PhotoCredit } from "@/components/work/PhotoCredit";
import { ExpandImage, Magnetic, RevealImage, RollText, ScrollProgress, TextReveal, waveDelay } from "@/components/work/motion";
import { restaurant as c } from "@/data/demos/restaurant";
import type { L10n } from "@/i18n/types";
import { BookButton } from "../DemoShell";
import { MenuPlating, type PlatingCourse } from "../signatures/MenuPlating";
import { Dishes } from "./restaurant/Dishes";
import { Hero } from "./restaurant/Hero";
import { Room } from "./restaurant/Room";
import { BTN_LINE, BTN_SOLID, FOCUS, NAV_H, Rise, SCROLL_MARGIN, SMALL_CAPS, STICKY_TOP, WRAP } from "./restaurant/ui";

/*
 * Ember & Oak: a wood-fired kitchen, late tables. Palette and contrast notes in
 * ./restaurant/ui.tsx. Young Serif (one weight) carries every display line;
 * Instrument Sans the rest. Young Serif has no small caps, so "small caps" are
 * Instrument Sans capitals, small and tracked, as on a printed menu.
 *
 * The page, top to bottom (one device per section, never the same twice in a row):
 *   hero        one wide photo of the open fire behind the headline (HeroBackdrop, ./restaurant/Hero)
 *   menu        the signature: MenuPlating, dishes "plated" course by course
 *   fire        THE PEAK: ExpandImage opens the oven to full bleed (longest pin on
 *               the page, after the quiet of the menu card), then TextReveal lines
 *   dishes      interlude: two counter-running ScrollMarquee rows of plates + a type row
 *   room        RevealImage collage on Parallax planes
 *   reviews     TextReveal heading, quotes rise as one wave
 *   visit       the resolve: RevealImage of the bar, Magnetic + RollText CTAs, hours
 * Eyebrows on every other section only (hero, fire, room, visit).
 */

export function RestaurantDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];

  const navLinks = [
    { href: "#menu", label: L(c.nav.menu) },
    { href: "#fire", label: L(c.nav.fire) },
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
            <ul className="flex gap-8 text-[0.9375rem]">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={`demo-underline rounded-[2px] pb-1 text-[#F7E4CF]/90 transition-colors duration-300 hover:text-[#F7E4CF] relative after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] ${FOCUS}`}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Magnetic className="ml-auto shrink-0 lg:ml-0" strength={0.2} max={6}>
            <BookButton className={`${BTN_SOLID} h-10 px-5 text-[0.875rem]`}>
              <RollText>{L(c.nav.reserve)}</RollText>
            </BookButton>
          </Magnetic>
        </div>
        <ScrollProgress className="bg-[#E0902F]" />
      </header>

      {/* --------------------------------------------------------------- hero */}
      <Hero />

      {/* ------------------------------------------------- menu (signature) */}
      <section id="menu" aria-labelledby="menu-title" style={SCROLL_MARGIN} className="relative isolate pb-28 pt-10 sm:pt-16 md:pb-40 md:pt-24">
        {/* The card lies on a table near the oven: a warm pool of light behind it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[18%] -z-10 h-[70%]"
          style={{ background: "radial-gradient(55% 50% at 50% 50%, rgba(224,144,47,0.16), rgba(224,144,47,0) 70%)" }}
        />
        <div className={WRAP}>
          <Rise className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <h2 id="menu-title" className="demo-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.02] tracking-[-0.015em]">
              {L(c.menu.title)}
            </h2>
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

      {/* ----------------------------------------------------- fire (the peak) */}
      <section id="fire" aria-labelledby="fire-title" style={SCROLL_MARGIN}>
        {/* The overlay sits on a bottom-up scrim of >= 85% hearth under the text block
            (cream on it, worst case a white pixel beneath: 10:1; ochre 5.2:1). */}
        <ExpandImage
          image={c.fire.image}
          alt={L(c.fire.image.alt)}
          top={STICKY_TOP}
          inset={[10, 16]}
          radius={6}
          imgClassName="object-[50%_45%]"
          overlayClassName="flex items-end"
          scrimClassName="bg-[linear-gradient(to_top,rgba(30,9,7,0.94)_0%,rgba(30,9,7,0.86)_38%,rgba(30,9,7,0.4)_58%,rgba(30,9,7,0)_76%)]"
        >
          <div className={`${WRAP} w-full pb-10 sm:pb-14 lg:pb-16`}>
            <h2 id="fire-title" className="demo-display max-w-[17ch] text-[clamp(2.5rem,5.6vw,5rem)] leading-[1] tracking-[-0.02em] text-[#F7E4CF]">
              {L(c.fire.title)}
            </h2>
            <p className={`${SMALL_CAPS} mt-5 text-[#E0902F]`}>{L(c.fire.caption)}</p>
          </div>
        </ExpandImage>
        {/* Three lines, one per line on desktop; the note below them, set to the right. */}
        <div className={`${WRAP} pb-16 pt-20 md:pb-20 md:pt-28`}>
          <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.fire.kicker)}</p>
          <TextReveal
            as="p"
            lines={c.fire.lines.map((l, i) => (i === 1 ? <span className="text-[#E0902F]">{L(l)}</span> : L(l)))}
            className="demo-display mt-6 text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.16] tracking-[-0.01em]"
            spread={0.42}
          />
          <div className="mt-10 grid md:mt-14 lg:grid-cols-2">
            <Rise delay={0.3} className="lg:col-start-2">
              <p className="max-w-[46ch] leading-relaxed text-[#D4B49A] md:text-[1.0625rem]">{L(c.fire.body)}</p>
            </Rise>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- dishes (interlude) */}
      <Dishes />

      {/* ------------------------------------------------------ private dining */}
      <Room />

      {/* ------------------------------------------------------------ reviews */}
      <section id="reviews" aria-labelledby="reviews-title" style={SCROLL_MARGIN} className="pb-24 pt-8 md:pb-32 md:pt-12">
        <div className={WRAP}>
          <TextReveal
            id="reviews-title"
            text={L(c.reviewsTitle)}
            className="demo-display max-w-[20ch] text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.05] tracking-[-0.015em]"
          />
          {/* Three order tickets: a torn (dashed) top edge, the table, the words, what came out of the kitchen.
              They rise as one wave (gaps shrink as it goes). */}
          <ul className="mt-14 grid gap-12 md:mt-16 lg:grid-cols-3 lg:gap-0">
            {c.reviews.map((r, i) => (
              <li key={r.name} className={`min-w-0 ${i > 0 ? "lg:border-l lg:border-[#F7E4CF]/12 lg:pl-10" : ""} ${i < 2 ? "lg:pr-10" : ""}`}>
                <Rise delay={waveDelay(i, c.reviews.length, 0.34)}>
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
        <div className={`${WRAP} grid gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16 xl:gap-20`}>
          <div className="min-w-0">
            <Rise>
              <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.visit.kicker)}</p>
              <h2 id="visit-title" className="demo-display mt-4 max-w-[15ch] text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.015em]">
                {L(c.visit.title)}
              </h2>
              <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#F7E4CF]/90">{L(c.visit.body)}</p>
              <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
                <Magnetic className="flex-1 sm:flex-none">
                  <BookButton className={`${BTN_SOLID} h-14 w-full px-4 text-[0.9375rem] sm:px-8 sm:text-[1rem]`}>
                    <RollText>{L(c.visit.reserve)}</RollText>
                  </BookButton>
                </Magnetic>
                <BookButton className={`${BTN_LINE} h-14 flex-1 px-4 text-[0.9375rem] sm:flex-none sm:px-8 sm:text-[1rem]`}>
                  <RollText>{L(c.visit.pickup)}</RollText>
                </BookButton>
              </div>
              <p className="mt-6 max-w-[46ch] text-[0.9375rem] text-[#D4B49A]">{L(c.visit.walkIns)}</p>
            </Rise>
            <Rise delay={0.12} className="mt-14 grid gap-10 border-t border-[#F7E4CF]/12 pt-10 sm:grid-cols-2 sm:gap-8">
              <div>
                <h3 className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.visit.hoursLabel)}</h3>
                <dl className="mt-5 space-y-5">
                  {c.hours.map((h) => (
                    <div key={h.days.en}>
                      <dt className="text-[0.9375rem] text-[#D4B49A]">{L(h.days)}</dt>
                      <dd className="demo-display mt-1 text-[1.75rem] leading-tight lining-nums">{L(h.time)}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[0.9375rem] text-[#D4B49A]">{L(c.visit.closed)}</p>
              </div>
              <div>
                <h3 className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.visit.findUs)}</h3>
                <p className="demo-display mt-5 text-[1.75rem] leading-tight">{c.address}</p>
                <p className="mt-2 max-w-[40ch] text-[0.9375rem] leading-relaxed text-[#D4B49A]">{L(c.visit.directions)}</p>
                <p className="mt-5 text-[0.9375rem] text-[#D4B49A]">
                  {L(c.visit.call)} <span className="whitespace-nowrap font-semibold text-[#F7E4CF]">{c.phone}</span>
                </p>
              </div>
            </Rise>
          </div>
          {/* The bar at night: first on phones (a 4:3 band over the copy), a 4:5 print in the right-hand column on desktop. */}
          <RevealImage
            image={c.visit.image}
            alt={L(c.visit.image.alt)}
            fill
            from="right"
            parallax={6}
            className="order-first aspect-[4/3] w-full sm:aspect-[16/10] lg:order-none lg:aspect-[4/5] lg:self-start"
            sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, 100vw"
          />
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
          <div className="mt-12 flex flex-col gap-3 text-[0.8125rem] text-[#D4B49A] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <PhotoCredit
              names={c.photoCredits}
              className="max-w-[70ch] leading-relaxed"
              linkClassName={`rounded-[2px] underline decoration-[#D4B49A]/50 underline-offset-4 hover:text-[#F7E4CF] ${FOCUS}`}
            />
            <p className="shrink-0">
              <DemoCredit className={`rounded underline decoration-[#D4B49A]/50 underline-offset-4 hover:text-[#F7E4CF] ${FOCUS}`}>
                {L(c.footer.credit)}
              </DemoCredit>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
