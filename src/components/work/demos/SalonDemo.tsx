"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DemoCredit } from "@/components/work/DemoCredit";
import { PhotoCredit } from "@/components/work/PhotoCredit";
import { salon as c } from "@/data/demos/salon";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";
import {
  HoverPreview,
  Magnetic,
  Parallax,
  RevealImage,
  RollText,
  ScrollProgress,
  TextReveal,
  useFinePointer,
  waveDelay,
} from "@/components/work/motion";
import { BookButton } from "../DemoShell";
import { ColourRibbon } from "../signatures/ColourRibbon";
import { useDemoStill } from "../useDemoStill";
import { HeroPlanes } from "./salon/HeroPlanes";
import { Lookbook } from "./salon/Lookbook";
import { ACCENT_T, DISPLAY, Em, FOCUS, KICKER, NAV_H, PILL, Rise, SCROLL_MARGIN, Title, WRAP } from "./salon/ui";

/*
 * Maison Lumière. Palette is hard-coded (the site's theme tokens flip under
 * html.dark) and the root sets color-scheme: light, so the page is identical
 * in either OS theme.
 *   blush  #F6E9EA  page            deep blush #EFDCDE  reviews band
 *   aubergine #3B1F2B  text / visit band        mauve #6E4E5A  secondary text
 * Contrast: aubergine on blush 12.5:1, on deep blush 11.3:1; mauve on blush
 * 6.1:1, on deep blush 5.5:1; blush on aubergine 12.5:1, #E6C9CE on it 9.6:1.
 *
 * Accent: --salon-accent (raw shade: decoration only, never text) and
 * --salon-ink (AA-safe tone of the same shade: CTA fills and accent text, only
 * ever on the #F6E9EA page or the lighter #FBF4F3 menu band, never on the
 * deep blush or aubergine bands). Default plum #9B4A6B (4.95:1); the ColourRibbon
 * swaps both as the page scrolls. Every consumer transitions over 400 ms.
 *
 * Page grammar (one device per section, never the same one twice in a row):
 *   hero      three Parallax planes (arch photo, detail photo, outline arch) + line masks
 *   shades    ColourRibbon, the signature (recolours the accent)
 *   menu      sticky title + HoverPreview (inline arched thumbnails on touch / still)
 *   lookbook  the PEAK: Parallax columns shearing past each other, RevealImage wipes
 *   reviews   TextReveal (line mode) on the lead quote
 *   studio    RevealImage spread with a two-photo collage
 *   visit     arched photo drifting in its frame (Parallax), Magnetic + RollText CTA
 */

/** The hero headline: each line rises out of its own mask on load. */
function HeroHeadline({ lines, className }: { lines: [string, string]; className: string }) {
  const still = useDemoStill();
  const line = (text: string, i: number, italic: boolean) => {
    const inner = italic ? <Em underline="var(--salon-accent)">{text}</Em> : text;
    return (
      <span key={i} className="-mb-[0.14em] block overflow-hidden pb-[0.14em] pr-[0.12em]">
        {still ? (
          <span className="block">{inner}</span>
        ) : (
          <motion.span
            className="block"
            initial={{ y: "108%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: EASE_EDITORIAL, delay: 0.15 + i * 0.12 }}
          >
            {inner}
          </motion.span>
        )}
      </span>
    );
  };
  return (
    <h1 className={className}>
      {line(lines[0], 0, false)}
      {line(lines[1], 1, true)}
    </h1>
  );
}

export function SalonDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];
  const usd = (n: number) => `$${n}`;
  const still = useDemoStill();
  const fine = useFinePointer();
  // Touch screens (no hover) and still mode get the service photos inline instead.
  const thumbs = !fine || still;

  const navLinks = [
    { href: "#menu", label: L(c.nav.menu) },
    { href: "#shades", label: L(c.nav.shades) },
    { href: "#lookbook", label: L(c.nav.lookbook) },
    { href: "#reviews", label: L(c.nav.reviews) },
    { href: "#studio", label: L(c.nav.studio) },
    { href: "#visit", label: L(c.nav.visit) },
  ];

  const wordmark = (size: string) => (
    <span className={`demo-display font-normal leading-none ${size}`}>
      Maison <span className="italic">Lumière</span>
    </span>
  );

  const [lead, ...rest] = c.reviews;
  // The lead quote, one masked line per sentence, wrapped in curly quotes.
  const leadLines = L(lead.quote)
    .split(/(?<=[.!?])\s+/)
    .map((s, i, all) => `${i === 0 ? "“" : ""}${s}${i === all.length - 1 ? "”" : ""}`);
  const swatches = useMemo(
    () => c.ribbon.swatches.map((s) => ({ name: s.name[locale], note: s.note[locale], hex: s.hex, accent: s.accent ?? s.hex, ink: s.ink })),
    [locale],
  );

  return (
    <div id="top" className="overflow-x-clip">
      {/* ---------------------------------------------------------------- nav */}
      <header className="sticky z-40 border-b border-[#3B1F2B]/10 bg-[#F6E9EA]/95 backdrop-blur-sm" style={{ top: "var(--demo-ribbon)", height: NAV_H }}>
        <div className={`${WRAP} flex h-full items-center gap-8`}>
          <a href="#top" aria-label={L(c.nav.home)} className={FOCUS}>
            {wordmark("text-[1.25rem] sm:text-[1.4375rem]")}
          </a>
          <nav aria-label={L(c.nav.primary)} className="ml-auto hidden lg:block">
            <ul className="flex gap-8 text-[0.8125rem] uppercase tracking-[0.16em] xl:gap-9">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={`demo-underline pb-1 ${FOCUS}`}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton className={`group ${PILL} ${ACCENT_T} ml-auto h-10 shrink-0 bg-[var(--salon-ink)] px-5 text-[0.875rem] text-[#F6E9EA] hover:bg-[#3B1F2B] lg:ml-0`}>
            <RollText>{L(c.nav.book)}</RollText>
          </BookButton>
        </div>
        <ScrollProgress className={`bg-[var(--salon-accent)] ${ACCENT_T}`} />
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section
        aria-label={L(c.hero.kicker)}
        className={`${WRAP} grid items-center gap-y-8 pb-16 pt-5 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,min(560px,44vw))] lg:gap-x-16 lg:py-12 xl:gap-x-24`}
        style={{ minHeight: `calc(100svh - var(--demo-ribbon) - ${NAV_H}px)` }}
      >
        <figure className="lg:order-2">
          <HeroPlanes image={c.hero.image} alt={L(c.hero.image.alt)} detail={c.hero.detail} detailAlt={L(c.hero.detail.alt)} />
          <figcaption className="mt-3 flex items-center gap-3 text-[0.8125rem] text-[#6E4E5A] lg:justify-end">
            <span aria-hidden="true" className={`h-px w-8 bg-[var(--salon-accent)] ${ACCENT_T}`} />
            {L(c.hero.caption)}
          </figcaption>
        </figure>
        <div className="relative z-30 flex flex-col lg:order-1">
          <Rise>
            <p className={`${KICKER} text-[#6E4E5A]`}>
              {L(c.hero.kicker)}
              <span aria-hidden="true" className="hidden px-2 sm:inline">
                ·
              </span>
              <span className="mt-1.5 block whitespace-nowrap sm:mt-0 sm:inline">{c.address}</span>
            </p>
          </Rise>
          <HeroHeadline
            lines={[L(c.hero.lines[0]), L(c.hero.lines[1])]}
            className={`${DISPLAY} mt-4 text-[clamp(2.625rem,4.9vw,5.5rem)] leading-[1] tracking-[-0.02em] text-[#3B1F2B] sm:mt-5 lg:mt-7`}
          />
          {/* Phones: CTA straight under the headline, intro after it; sm+: intro first. */}
          <Rise delay={0.4} className="sm:order-2">
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mt-8">
              <Magnetic>
                <BookButton className={`group ${PILL} ${ACCENT_T} h-14 bg-[var(--salon-ink)] px-8 text-[1rem] text-[#F6E9EA] hover:bg-[#3B1F2B]`}>
                  <RollText>{L(c.hero.cta)}</RollText>
                </BookButton>
              </Magnetic>
              <a
                href="#menu"
                className={`text-[1rem] font-medium underline decoration-2 underline-offset-[7px] ${ACCENT_T} ${FOCUS}`}
                style={{ textDecorationColor: "var(--salon-accent)" }}
              >
                {L(c.hero.menuLink)}
              </a>
            </div>
          </Rise>
          <Rise delay={0.45} className="sm:order-1">
            <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#3B1F2B]/90 sm:mt-7 lg:mt-9 lg:text-[1.125rem]">{L(c.hero.intro)}</p>
          </Rise>
          <Rise delay={0.5} className="sm:order-3">
            <p className="mt-6 text-[0.875rem] text-[#6E4E5A] sm:mt-8">{L(c.hero.open)}</p>
          </Rise>
        </div>
      </section>

      {/* ------------------------------------------------- colour ribbon (sig) */}
      <section id="shades" aria-labelledby="shades-title" style={SCROLL_MARGIN} className="border-t border-[#3B1F2B]/10 pb-16 pt-20 md:pb-20 md:pt-28">
        <div className={`${WRAP} grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16`}>
          <Rise>
            <Title h={c.ribbon.title} L={L} id="shades-title" className="text-[clamp(2.5rem,5vw,4.75rem)] leading-[1]" />
          </Rise>
          <Rise delay={0.1}>
            <p className="max-w-[44ch] leading-relaxed text-[#3B1F2B]/90 md:justify-self-end md:text-[1.0625rem]">{L(c.ribbon.intro)}</p>
          </Rise>
        </div>
        <ColourRibbon className="mt-14 md:mt-16" label={L(c.ribbon.label)} swatches={swatches} />
      </section>

      {/* ----------------------------------------------------------- services */}
      <section id="menu" aria-labelledby="menu-title" style={SCROLL_MARGIN} className="bg-[#FBF4F3]">
        <div className={`${WRAP} grid gap-12 py-24 md:py-32 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20`}>
          <div className="lg:sticky lg:self-start" style={{ top: `calc(var(--demo-ribbon) + ${NAV_H + 48}px)` }}>
            <Rise>
              <p className={`${KICKER} text-[#6E4E5A]`}>{L(c.services.kicker)}</p>
              <Title h={c.services.title} L={L} id="menu-title" className="mt-4 text-[clamp(2.75rem,5.2vw,5rem)] leading-[1]" />
              <p className="mt-6 max-w-[36ch] leading-relaxed text-[#3B1F2B]/90">{L(c.services.intro)}</p>
              <p className={`mt-8 max-w-[36ch] border-l-2 pl-4 text-[0.9375rem] leading-relaxed text-[#6E4E5A] ${ACCENT_T}`} style={{ borderColor: "var(--salon-accent)" }}>
                {L(c.services.note)}
              </p>
            </Rise>
          </div>
          <HoverPreview images={c.services.items.map((s) => s.image)} frameClassName="w-[230px] aspect-[3/4] rounded-t-[999px]" className="min-w-0">
            {(bind) => (
              <ol className="border-t border-[#3B1F2B]/15">
                {c.services.items.map((s, i, all) => (
                  <Rise
                    as="li"
                    key={s.name.en}
                    delay={waveDelay(i, all.length, 0.3)}
                    extra={bind(i)}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-[#3B1F2B]/15 py-8 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-6 md:py-10"
                  >
                    <span aria-hidden="true" className={`demo-display pt-1 text-[1.25rem] italic leading-none text-[var(--salon-ink)] ${ACCENT_T}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className={`${DISPLAY} text-[1.625rem] leading-[1.1] sm:text-[2rem]`}>{L(s.name)}</h3>
                        <p className="mt-3 max-w-[50ch] leading-relaxed text-[#3B1F2B]/85">{L(s.detail)}</p>
                        <p className="mt-3 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-[#6E4E5A]">{L(s.time)}</p>
                      </div>
                      {thumbs && (
                        <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-t-[999px] bg-[#E9D3D6] sm:w-20">
                          <img
                            src={s.image.small}
                            width={s.image.width}
                            height={s.image.height}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            sizes="80px"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <p className="col-start-2 whitespace-nowrap sm:col-start-3 sm:pt-1 sm:text-right">
                      {s.amount ? (
                        <>
                          {s.from && <span className="mr-2 text-[0.75rem] font-medium uppercase tracking-[0.18em] text-[#6E4E5A]">{L(c.services.from)}</span>}
                          <span className="demo-display text-[1.75rem] font-normal leading-none sm:text-[2rem]">{usd(s.amount)}</span>
                        </>
                      ) : (
                        <span className="demo-display text-[1.25rem] italic leading-none sm:text-[1.5rem]">{L(c.services.consult)}</span>
                      )}
                    </p>
                  </Rise>
                ))}
              </ol>
            )}
          </HoverPreview>
        </div>
      </section>

      {/* ------------------------------------------------------ lookbook (peak) */}
      <section id="lookbook" aria-labelledby="lookbook-title" style={SCROLL_MARGIN} className="pb-28 pt-24 md:pb-44 md:pt-32">
        <div className={WRAP}>
          <div className="grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-16">
            <Rise>
              <Title h={c.lookbook.title} L={L} id="lookbook-title" className="text-[clamp(2.75rem,6.4vw,6.25rem)] leading-[0.98] tracking-[-0.01em]" />
            </Rise>
            <Rise delay={0.1}>
              <p className="max-w-[40ch] leading-relaxed text-[#3B1F2B]/90 md:justify-self-end md:text-[1.0625rem]">{L(c.lookbook.intro)}</p>
            </Rise>
          </div>
          <div role="group" aria-label={L(c.lookbook.label)} className="mt-16 md:mt-24">
            <Lookbook looks={c.lookbook.looks} L={L} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section id="reviews" aria-labelledby="reviews-title" style={SCROLL_MARGIN} className="bg-[#EFDCDE]">
        <div className={`${WRAP} py-24 md:py-32`}>
          <h2 id="reviews-title" className={`${KICKER} text-center text-[#6E4E5A]`}>
            {L(c.reviewsTitle)}
          </h2>
          <figure className="mx-auto mt-10 max-w-[980px] text-center">
            <span aria-hidden="true" className={`mx-auto mb-10 block h-[2px] w-12 bg-[var(--salon-accent)] ${ACCENT_T}`} />
            <blockquote className="demo-display mx-auto max-w-[26ch] text-[clamp(1.75rem,3.4vw,2.875rem)] italic leading-[1.2] text-[#3B1F2B]">
              <TextReveal as="p" className="demo-display" lines={leadLines} spread={0.22} />
            </blockquote>
            <figcaption className={`${KICKER} mt-8 text-[#6E4E5A]`}>{lead.name}</figcaption>
          </figure>
          <ul className="mx-auto mt-20 grid max-w-[980px] gap-10 border-t border-[#3B1F2B]/15 pt-10 md:grid-cols-2 md:gap-0">
            {rest.map((r, i) => (
              <Rise as="li" key={r.name} delay={waveDelay(i, rest.length, 0.15)} className={i === 1 ? "md:border-l md:border-[#3B1F2B]/15 md:pl-12" : "md:pr-12"}>
                <figure>
                  <blockquote className="demo-display text-[1.25rem] italic leading-snug text-[#3B1F2B] sm:text-[1.4375rem]">
                    <p className="demo-display">{`“${L(r.quote)}”`}</p>
                  </blockquote>
                  <figcaption className={`${KICKER} mt-5 text-[#6E4E5A]`}>{r.name}</figcaption>
                </figure>
              </Rise>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ work + studio spread */}
      <section aria-labelledby="work-title" className={`${WRAP} py-24 md:py-32`}>
        {/* Phones read title, colour photo, studio, collage (the columns dissolve with
            display: contents and `order`); desktop keeps two staggered columns. */}
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
          <div className="contents lg:col-span-5 lg:block">
            <figure className="group order-2 lg:order-none">
              <RevealImage
                image={c.work.colour.image}
                alt={L(c.work.colour.image.alt)}
                sizes="(min-width: 1024px) 560px, 100vw"
                from="left"
                className="bg-[#E9D3D6]"
                imgClassName="demo-zoom"
              />
              <figcaption className="mt-4 flex gap-3 text-[0.8125rem] leading-relaxed text-[#6E4E5A]">
                <span className="demo-display text-[1rem] italic text-[#3B1F2B]">i.</span>
                {L(c.work.colour.caption)}
              </figcaption>
            </figure>
            {/* Two studio details as a matched pair of arches (the salon's mirror shape). */}
            <figure className="order-4 lg:order-none lg:mt-20">
              <div className="grid grid-cols-2 items-start gap-4 sm:gap-6">
                {c.work.details.images.map((img, i) => (
                  <div key={img.src} className="group">
                    <RevealImage
                      image={img}
                      alt={L(img.alt)}
                      sizes="(min-width: 1024px) 270px, 50vw"
                      from={i === 0 ? "bottom" : "top"}
                      delay={i * 0.12}
                      parallax={8}
                      className="rounded-t-[999px] bg-[#E9D3D6]"
                      imgClassName="demo-zoom"
                    />
                  </div>
                ))}
              </div>
              <figcaption className="mt-4 flex gap-3 text-[0.8125rem] leading-relaxed text-[#6E4E5A]">
                <span className="demo-display text-[1rem] italic text-[#3B1F2B]">iii.</span>
                {L(c.work.details.caption)}
              </figcaption>
            </figure>
          </div>
          <div className="contents lg:col-span-6 lg:col-start-7 lg:flex lg:flex-col">
            <Rise className="order-1 lg:order-none lg:pt-10">
              <Title h={c.work.title} L={L} id="work-title" className="text-[clamp(2.25rem,4vw,3.875rem)] leading-[1.05]" />
              <p className="mt-6 max-w-[44ch] leading-relaxed text-[#3B1F2B]/90 md:text-[1.0625rem]">{L(c.work.colour.body)}</p>
            </Rise>
            <figure className="group order-3 lg:order-none lg:mt-20">
              <div id="studio" style={SCROLL_MARGIN}>
                <RevealImage
                  image={c.work.studio.image}
                  alt={L(c.work.studio.image.alt)}
                  sizes="(min-width: 1024px) 680px, 100vw"
                  from="right"
                  className="bg-[#E9D3D6]"
                  imgClassName="demo-zoom"
                />
              </div>
              <figcaption className="mt-5 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8">
                <h3 className={`${DISPLAY} text-[1.5rem] leading-none`}>
                  <span className="demo-display mr-3 text-[1rem] italic text-[#3B1F2B]">ii.</span>
                  {L(c.work.studio.title)}
                </h3>
                <p className="max-w-[48ch] text-[0.9375rem] leading-relaxed text-[#3B1F2B]/85">{L(c.work.studio.body)}</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- visit + book */}
      <section id="visit" aria-labelledby="visit-title" style={SCROLL_MARGIN} className="bg-[#3B1F2B] text-[#F6E9EA]">
        <div className={`${WRAP} grid gap-16 py-24 md:py-32 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0`}>
          <div className="lg:col-span-7">
            <Rise>
              <Title
                h={c.visit.title}
                L={L}
                id="visit-title"
                underline="#D88C8C"
                className="max-w-[14ch] text-[clamp(2.5rem,5.6vw,5.25rem)] leading-[1.02]"
              />
              <p className="mt-8 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#F6E9EA]/90">{L(c.visit.body)}</p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Magnetic>
                  <BookButton
                    className={`group ${PILL} h-14 bg-[#F6E9EA] px-8 text-[1rem] text-[#3B1F2B] transition-colors duration-200 hover:bg-[#D88C8C] focus-visible:outline-[#F6E9EA]`}
                  >
                    <RollText>{L(c.visit.cta)}</RollText>
                  </BookButton>
                </Magnetic>
                <p className="text-[0.9375rem] text-[#E6C9CE]">
                  {L(c.visit.call)} <span className="whitespace-nowrap font-medium text-[#F6E9EA]">{c.phone}</span>
                </p>
              </div>
            </Rise>
            <Rise delay={0.1} className="mt-16 grid gap-12 sm:grid-cols-2 sm:gap-10">
              <div>
                <h3 className={`${KICKER} text-[#E6C9CE]`}>{L(c.visit.hoursLabel)}</h3>
                <dl className="mt-4 border-t border-[#F6E9EA]/20">
                  {c.hours.map((h) => (
                    <div key={h.days.en} className="flex items-baseline justify-between gap-6 border-b border-[#F6E9EA]/20 py-4">
                      <dt>{L(h.days)}</dt>
                      <dd className="demo-display whitespace-nowrap text-[1.125rem] lining-nums tabular-nums">{L(h.time)}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-[0.9375rem] text-[#E6C9CE]">{L(c.visit.closed)}</p>
              </div>
              <div>
                <h3 className={`${KICKER} text-[#E6C9CE]`}>{L(c.visit.findUs)}</h3>
                <p className="demo-display mt-4 text-[1.5rem] leading-tight">{c.address}</p>
                <p className="mt-2 max-w-[40ch] text-[0.9375rem] leading-relaxed text-[#E6C9CE]">{L(c.visit.directions)}</p>
              </div>
            </Rise>
          </div>
          <figure className="lg:col-span-4 lg:col-start-9 lg:pt-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-t-[999px] bg-[#4A2C36]">
              {/* The photo drifts inside its arch; the 8% bleed covers the travel. */}
              <Parallax distance={36} className="absolute inset-x-0 -bottom-[8%] -top-[8%]" innerClassName="h-full w-full">
                <img
                  src={c.visit.image.src}
                  srcSet={`${c.visit.image.small} 640w, ${c.visit.image.src} ${c.visit.image.width}w`}
                  sizes="(min-width: 480px) 420px, 100vw"
                  width={c.visit.image.width}
                  height={c.visit.image.height}
                  alt={L(c.visit.image.alt)}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </Parallax>
            </div>
            <figcaption className="mx-auto mt-4 flex max-w-[420px] items-center gap-3 text-[0.8125rem] text-[#E6C9CE]">
              <span aria-hidden="true" className="h-px w-8 bg-[#D88C8C]" />
              {L(c.visit.imageCaption)}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className={`${WRAP} flex flex-col items-center pb-10 pt-20 text-center`}>
        <svg aria-hidden="true" width="28" height="36" viewBox="0 0 28 36" fill="none" className="mb-6">
          <path d="M1 35V14C1 6.8 6.8 1 14 1s13 5.8 13 13v21" stroke="#3B1F2B" strokeWidth="1.2" />
        </svg>
        <p>{wordmark("text-[1.875rem] sm:text-[2.25rem]")}</p>
        <p className="mt-3 text-[#6E4E5A]">{L(c.footer.tagline)}</p>
        <p className="mt-8 text-[0.9375rem]">
          {c.address}
          <span aria-hidden="true" className="px-3 text-[#6E4E5A]">
            ·
          </span>
          <span className="whitespace-nowrap">{c.phone}</span>
        </p>
        <div className="mt-16 w-full border-t border-[#3B1F2B]/10 pt-6 text-[0.8125rem] text-[#6E4E5A]">
          <p>
            <DemoCredit className={`underline decoration-[#6E4E5A]/50 underline-offset-4 hover:text-[#3B1F2B] ${FOCUS}`}>
              {L(c.footer.credit)}
            </DemoCredit>
          </p>
          <PhotoCredit
            names={c.photoCredits}
            className="mx-auto mt-2 max-w-[70ch] leading-relaxed"
            linkClassName={`underline decoration-[#6E4E5A]/50 underline-offset-4 hover:text-[#3B1F2B] ${FOCUS}`}
          />
        </div>
      </footer>
    </div>
  );
}
