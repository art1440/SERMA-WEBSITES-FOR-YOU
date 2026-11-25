"use client";

import { useLanguage } from "@/context/LanguageContext";
import { DemoCredit } from "@/components/work/DemoCredit";
import { PhotoCredit } from "@/components/work/PhotoCredit";
import { ExpandImage, Magnetic, Parallax, RollText, ScrollProgress, TextReveal, waveDelay } from "@/components/work/motion";
import { barbershop as c } from "@/data/demos/barbershop";
import type { L10n } from "@/i18n/types";
import { BookButton } from "../DemoShell";
import { RazorCutHero } from "../signatures/RazorCutHero";
import { Barbers } from "./barbershop/Barbers";
import { CraftStrip } from "./barbershop/CraftStrip";
import { HeroPlate } from "./barbershop/HeroPlate";
import { PriceList } from "./barbershop/PriceList";
import { Ritual } from "./barbershop/Ritual";
import { DISPLAY, FOCUS, NAV_H, Rise, SCROLL_MARGIN, STICKY_TOP } from "./barbershop/ui";

/*
 * Ironside Barber Co. Page grammar (one device per section, never repeated
 * next door):
 *   hero      RazorCutHero (signature) over a slow Parallax photo plate
 *   prices    HoverPreview price list (inline thumbnails on touch)
 *   ritual    StickyStory, square frame, brass progress rule
 *   craft     ScrollMarquee photo row + counter-running type row
 *   shop      ExpandImage: the PEAK (the room opens to full bleed), after a quiet heading
 *   barbers   RevealImage portrait cards in one wave
 *   reviews   TextReveal heading, quotes as one wave
 *   book      brass band, Magnetic + RollText CTA (resolves the page)
 * Palette and contrast notes live in ./barbershop/ui.tsx.
 */

export function BarbershopDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];

  const navLinks = [
    { href: "#prices", label: L(c.nav.services) },
    { href: "#shop", label: L(c.nav.shop) },
    { href: "#barbers", label: L(c.nav.barbers) },
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
          <nav aria-label={L(c.nav.primary)} className="ml-auto hidden lg:block">
            <ul className="flex gap-8 text-[0.875rem] font-medium">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={`demo-underline pb-1 text-[#EFE6D6]/85 transition-colors hover:text-[#C9A45C] relative after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] ${FOCUS}`}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Magnetic className="ml-auto shrink-0 lg:ml-0" strength={0.25} max={8}>
            <BookButton
              className={`group inline-flex h-10 items-center whitespace-nowrap border border-[#C9A45C] px-3 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#C9A45C] transition-colors duration-300 hover:bg-[#C9A45C] hover:text-[#0E0E0E] sm:px-4 sm:text-[0.8125rem] sm:tracking-[0.12em] ${FOCUS}`}
            >
              <RollText>{L(c.nav.book)}</RollText>
            </BookButton>
          </Magnetic>
        </div>
        <ScrollProgress className="bg-[#C9A45C]" />
      </header>

      {/* --------------------------------------------------------------- hero */}
      <RazorCutHero
        lines={[L(c.hero.lines[0]), L(c.hero.lines[1])]}
        className="relative mx-auto flex max-w-[1480px] flex-col justify-between px-4 pb-10 pt-8 sm:px-8 sm:pb-12 lg:px-12"
        style={{ minHeight: `max(560px, calc(100svh - var(--demo-ribbon) - ${NAV_H}px))` }}
        headlineClassName={`${DISPLAY} text-[clamp(64px,13vw,200px)] leading-[0.9] tracking-[-0.02em] text-[#EFE6D6]`}
        before={
          <>
            <div className="relative z-10 -order-1 flex items-center justify-between gap-4 pb-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#A8A091] lg:order-none">
              <span>{c.address}</span>
              <span className="hidden sm:inline">{c.phone}</span>
            </div>
            <HeroPlate
              image={c.hero.plate}
              alt={L(c.hero.plate.alt)}
              caption={L(c.hero.caption)}
              className="relative order-1 -mx-4 mt-10 aspect-[4/3] sm:-mx-8 sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-[calc((100%-100vw)/2)] lg:order-none lg:mx-0 lg:mt-0 lg:aspect-auto lg:w-[min(66vw,1180px)]"
            />
          </>
        }
        after={
          <div className="relative z-10 order-2 mt-10 grid gap-8 border-t border-[#EFE6D6]/15 pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16 lg:order-none lg:mt-12">
            <div>
              <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-[#EFE6D6]/90 sm:text-[1.125rem]">{L(c.hero.intro)}</p>
              <p className="mt-4 flex items-center gap-3 text-[0.8125rem] text-[#A8A091]">
                <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-[#C9A45C]" />
                {L(c.hero.walkIns)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Magnetic>
                <BookButton
                  className={`group inline-flex h-14 items-center bg-[#C9A45C] px-8 text-[0.9375rem] font-semibold uppercase tracking-[0.14em] text-[#0E0E0E] transition-colors duration-300 hover:bg-[#EFE6D6] ${FOCUS}`}
                >
                  <RollText>{L(c.hero.cta)}</RollText>
                </BookButton>
              </Magnetic>
              <a href="#prices" className={`demo-underline pb-1 text-[0.9375rem] font-semibold text-[#EFE6D6] hover:text-[#C9A45C] ${FOCUS}`}>
                {L(c.hero.prices)}
              </a>
            </div>
          </div>
        }
      />

      {/* ----------------------------------------------------------- services */}
      <section id="prices" aria-labelledby="prices-title" style={SCROLL_MARGIN} className="relative border-t border-[#EFE6D6]/10 bg-[#0E0E0E]">
        <div className="mx-auto max-w-[1480px] px-4 py-24 sm:px-8 md:py-32 lg:px-12">
          <Rise className="grid gap-6 border-b border-[#EFE6D6]/15 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <h2 id="prices-title" className={`${DISPLAY} text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-[0.9]`}>
              {L(c.services.title)}
            </h2>
            <p className="max-w-[40ch] leading-relaxed text-[#A8A091] md:justify-self-end md:text-[1.0625rem]">{L(c.services.intro)}</p>
          </Rise>
          <PriceList items={c.services.items} note={c.services.note} minutes={c.services.minutes} L={L} />
        </div>
      </section>

      {/* ------------------------------------------------------------- ritual */}
      <section id="ritual" aria-labelledby="ritual-title" style={SCROLL_MARGIN} className="border-t border-[#EFE6D6]/10">
        <div className="mx-auto max-w-[1480px] px-4 pb-24 pt-24 sm:px-8 md:pb-32 md:pt-32 lg:px-12">
          <Rise className="max-w-[40rem]">
            <h2 id="ritual-title" className={`${DISPLAY} text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-[0.9]`}>
              {L(c.ritual.title)}
            </h2>
            <p className="mt-6 max-w-[40ch] leading-relaxed text-[#A8A091] md:text-[1.0625rem]">{L(c.ritual.intro)}</p>
          </Rise>
          <Ritual steps={c.ritual.steps} L={L} />
        </div>
      </section>

      {/* -------------------------------------------------------------- craft */}
      <CraftStrip title={c.craft.title} items={c.craft.items} words={c.craft.words} L={L} />

      {/* ----------------------------------------------------------- the shop */}
      <section id="shop" aria-labelledby="shop-title" style={SCROLL_MARGIN} className="border-t border-[#EFE6D6]/10">
        {/* The quiet beat before the peak: one heading, one line, room to breathe. */}
        <div className="mx-auto max-w-[1480px] px-4 pb-16 pt-28 sm:px-8 md:pb-20 md:pt-40 lg:px-12">
          <Rise className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <h2 id="shop-title" className={`${DISPLAY} text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-[0.9]`}>
              {L(c.shop.title)}
            </h2>
            <p className="max-w-[34ch] text-[1.125rem] leading-relaxed text-[#A8A091] md:justify-self-end md:text-[1.25rem]">{L(c.shop.lead)}</p>
          </Rise>
        </div>
        <ExpandImage
          image={c.shop.image}
          alt={L(c.shop.image.alt)}
          top={STICKY_TOP}
          inset={[14, 22]}
          radius={0}
          imgClassName="object-[30%_50%]"
          scrimClassName="bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          overlayClassName="flex items-end px-4 pb-10 sm:px-8 sm:pb-14 lg:px-12 lg:pb-16"
        >
          <p className={`${DISPLAY} mx-auto w-full max-w-[1384px] text-[clamp(2.75rem,8vw,7.5rem)] uppercase leading-[0.9] text-[#EFE6D6]`}>
            {L(c.shop.overlay)}
          </p>
        </ExpandImage>
        <div className="mx-auto grid max-w-[1480px] gap-12 px-4 py-20 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-16 md:py-28 lg:px-12">
          <Rise>
            <p className="max-w-[34ch] text-[1.25rem] leading-relaxed text-[#EFE6D6]/90 sm:text-[1.5rem]">{L(c.shop.body)}</p>
          </Rise>
          <Rise delay={0.12} y={12} className="border-t-2 border-[#C9A45C] bg-[#151413] p-6 sm:p-8">
            <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#C9A45C]">{L(c.shop.hoursLabel)}</h3>
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

      {/* ------------------------------------------------------------ barbers */}
      <section id="barbers" aria-labelledby="barbers-title" style={SCROLL_MARGIN} className="border-t border-[#EFE6D6]/10">
        <div className="mx-auto max-w-[1480px] px-4 py-24 sm:px-8 md:py-32 lg:px-12">
          <Rise className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <h2 id="barbers-title" className={`${DISPLAY} text-[clamp(2.5rem,6vw,5.5rem)] uppercase leading-[0.9]`}>
              {L(c.barbers.title)}
            </h2>
            <p className="max-w-[40ch] leading-relaxed text-[#A8A091] md:justify-self-end md:text-[1.0625rem]">{L(c.barbers.intro)}</p>
          </Rise>
          <Barbers items={c.barbers.items} book={c.barbers.book} L={L} />
        </div>
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section
        id="reviews"
        aria-labelledby="reviews-title"
        style={SCROLL_MARGIN}
        className="mx-auto max-w-[1480px] px-4 pb-24 pt-8 sm:px-8 md:pb-32 md:pt-12 lg:px-12"
      >
        <TextReveal
          id="reviews-title"
          text={L(c.reviewsTitle)}
          className={`${DISPLAY} max-w-[16ch] text-[clamp(2.25rem,4.5vw,3.75rem)] uppercase leading-[0.95]`}
        />
        <ul className="mt-14 border-t border-[#EFE6D6]/15">
          {c.reviews.map((r, i) => (
            <Rise
              as="li"
              key={r.name}
              delay={waveDelay(i, c.reviews.length, 0.3)}
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
            <Parallax distance={28}>
              <h2 id="book-title" className={`${DISPLAY} text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[0.88] tracking-[-0.01em]`}>
                {L(c.book.title)}
              </h2>
            </Parallax>
            <p className="mt-6 max-w-[40ch] text-[1.125rem] leading-relaxed">{L(c.book.body)}</p>
          </div>
          <div className="flex flex-col items-start gap-4 md:items-end">
            <Magnetic>
              <BookButton className="group inline-flex h-14 items-center bg-[#0E0E0E] px-8 text-[0.9375rem] font-semibold uppercase tracking-[0.14em] text-[#C9A45C] transition-colors duration-300 hover:text-[#EFE6D6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E0E0E]">
                <RollText>{L(c.book.cta)}</RollText>
              </BookButton>
            </Magnetic>
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
        <div className="mt-6 flex flex-col gap-2 text-[0.8125rem] text-[#A8A091] md:flex-row md:items-baseline md:justify-between md:gap-8">
          <p>
            <DemoCredit className={`underline decoration-[#A8A091]/50 underline-offset-4 hover:text-[#EFE6D6] ${FOCUS}`}>
              {L(c.footer.credit)}
            </DemoCredit>
          </p>
          <PhotoCredit
            names={c.photoCredits}
            className="max-w-[70ch] md:text-right"
            linkClassName={`underline decoration-[#A8A091]/50 underline-offset-4 hover:text-[#EFE6D6] ${FOCUS}`}
          />
        </div>
      </footer>
    </div>
  );
}
