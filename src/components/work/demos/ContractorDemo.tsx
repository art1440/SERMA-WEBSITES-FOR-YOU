"use client";

import { useLanguage } from "@/context/LanguageContext";
import { DemoCredit } from "@/components/work/DemoCredit";
import { PhotoCredit } from "@/components/work/PhotoCredit";
import { HoverPreview, Magnetic, RevealImage, RollText, ScrollMarquee, ScrollProgress } from "@/components/work/motion";
import { contractor as c } from "@/data/demos/contractor";
import type { L10n } from "@/i18n/types";
import { BookButton } from "../DemoShell";
import { BlueprintHero } from "../signatures/BlueprintHero";
import { HeroDetail, HeroGrid } from "./contractor/HeroPlanes";
import { ProcessSteps } from "./contractor/ProcessSteps";
import { ProjectsGallery } from "./contractor/ProjectsGallery";
import {
  Arrow,
  BTN,
  Delta,
  Dimension,
  FOCUS,
  GRID_DARK,
  GRID_PAPER,
  LABEL,
  NAV_H,
  SCROLL_MARGIN,
  SectionHead,
  SheetTag,
  WRAP,
  Wordmark,
} from "./contractor/parts";

/*
 * Trueframe Builders, set like a small set of construction documents: every
 * section is a "sheet" (A-101 ... A-501) with its number in a tag, the hero is
 * a drawing sheet with a title block along its foot, services are a schedule
 * (spec table), projects are the details sheet, the process is a chain
 * dimension, reviews carry revision deltas. Palette is hard-coded and the root
 * sets color-scheme: dark, so the page is identical in either OS theme.
 *   navy   #0F2440  page                 deep   #0A1B31  process, footer
 *   paper  #E9F0FA  text on navy / light sheets (services, reviews)
 *   line   #9BB8E0  linework, labels     mist   #C4D5EC  secondary text on navy
 *   orange #FF7A1A  CTA fill, accents    rust   #A84300  accent text on paper
 *   slate  #3D5878  secondary text on paper
 * Contrast: paper on navy 13.6:1, on deep 15.1:1; mist on navy 10.5:1; line on
 * navy 7.7:1, on deep 8.5:1; orange on navy 6.0:1, on deep 6.6:1; navy on
 * orange 6.0:1; on paper navy 13.6:1, slate 6.4:1, rust 5.3:1. Orange is
 * never set as text on paper (2.3:1); it appears there only as a fill mark.
 *
 * Barlow Condensed (600/800) carries headings, numbers and tags; Barlow
 * (400/500) everything else, including the dimension strings.
 *
 * Motion, one device per sheet (all honour useDemoStill):
 *   A-101 hero      BlueprintHero (signature) + two Parallax planes: the grid
 *                   lags, a detail photo runs ahead (HeroPlanes.tsx)
 *   A-102 services  HoverPreview: a square, hard-edged photo trails the cursor
 *                   over the schedule (mouse only; phones keep the table)
 *   A-201 projects  the peak: HorizontalGallery of eight details, each photo a
 *                   RevealImage wiping in from the left (ProjectsGallery.tsx)
 *   A-301 process   the chain dimension drawn by the scroll + step photos
 *                   rising into their frames (ProcessSteps.tsx)
 *   A-401 reviews   a ScrollMarquee row of trades, leaning with scroll speed,
 *                   and a TextReveal heading
 *   A-501 estimate  the finished elevation curtains down (RevealImage), the
 *                   CTA is Magnetic; the ending is the title block + footer.
 * Header: ScrollProgress hairline in orange, demo-underline nav, RollText CTAs.
 */

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export function ContractorDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];
  const es = locale === "es";

  const navLinks = [
    { href: "#services", sheet: c.services.sheet, label: L(c.nav.services) },
    { href: "#projects", sheet: c.projects.sheet, label: L(c.nav.projects) },
    { href: "#process", sheet: c.process.sheet, label: L(c.nav.process) },
    { href: "#reviews", sheet: c.reviewsBlock.sheet, label: L(c.nav.reviews) },
  ];

  const h1Size = es
    ? "text-[clamp(2.625rem,11.5vw,3.5rem)] sm:text-[4.25rem] lg:text-[clamp(3.5rem,4.6vw,4.5rem)]"
    : "text-[clamp(3rem,14vw,4rem)] sm:text-[5rem] lg:text-[clamp(4rem,5.8vw,5.25rem)]";
  const [h1Lead, h1Tail] = c.hero.headline.map(L);

  return (
    <div id="top" className="overflow-x-clip">
      {/* ---------------------------------------------------------------- nav */}
      <header
        className="sticky z-40 border-b border-[#9BB8E0]/25 bg-[#0F2440]/95 backdrop-blur-sm"
        style={{ top: "var(--demo-ribbon)", height: NAV_H }}
      >
        <div className={`${WRAP} flex h-full items-center gap-8`}>
          <a href="#top" aria-label={L(c.nav.home)} className={`shrink-0 ${FOCUS}`}>
            <Wordmark />
          </a>
          <nav aria-label={L(c.nav.primary)} className="ml-auto hidden lg:block">
            <ul className="flex gap-8 text-[0.9375rem]">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={`demo-underline inline-flex items-baseline gap-2 pb-1 text-[#E9F0FA] ${FOCUS}`}>
                    <span aria-hidden="true" className="demo-display text-[0.8125rem] font-semibold tracking-[0.06em] text-[#9BB8E0]">
                      {l.sheet}
                    </span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton className={`${BTN} group ml-auto h-10 shrink-0 px-4 text-[0.9375rem] sm:px-5 lg:ml-0`}>
            <span className="sm:hidden">
              <RollText>{L(c.nav.estimateShort)}</RollText>
            </span>
            <span className="hidden sm:inline-flex">
              <RollText>{L(c.nav.estimate)}</RollText>
            </span>
          </BookButton>
        </div>
        <ScrollProgress className="bg-[#FF7A1A]" />
      </header>

      {/* ---------------------------------------------------- hero: sheet A-101 */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <HeroGrid />
        <div className={`${WRAP} relative pb-8 pt-3 max-sm:px-3 sm:pb-14 sm:pt-6 lg:pt-8`}>
          <div className="border border-[#9BB8E0]/40 bg-[#0F2440]/80">
            <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col px-5 pb-8 pt-6 sm:px-9 sm:pb-10 sm:pt-9 lg:border-r lg:border-[#9BB8E0]/40 lg:px-10 lg:py-12 xl:pb-10 xl:pt-11">
                <p className={`${LABEL} flex items-start gap-2.5 text-[#FF7A1A]`}>
                  <span aria-hidden="true" className="mt-[0.3em] h-2 w-2 shrink-0 bg-[#FF7A1A]" />
                  {L(c.hero.kicker)}
                </p>
                <h1
                  id="hero-title"
                  className={`demo-display mt-5 font-extrabold leading-[0.92] tracking-[-0.01em] text-[#E9F0FA] ${h1Size}`}
                >
                  <span className="block">{h1Lead} </span>
                  <span className="block text-[#FF7A1A]">{h1Tail}</span>
                </h1>
                <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#C4D5EC] lg:mt-7">{L(c.hero.intro)}</p>
                {/* At xl the CTAs stack so the detail photo can sit on the column line beside them. */}
                <div className="mt-7 lg:mt-auto lg:pt-9 xl:flex xl:items-end xl:justify-between xl:gap-6 xl:pt-8">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-7 gap-y-4 xl:flex-col xl:items-start">
                      <Magnetic>
                        <BookButton className={`${BTN} group h-[3.25rem] px-5 text-[1.0625rem] sm:px-6 sm:text-[1.125rem]`}>
                          <RollText>{L(c.hero.cta)}</RollText>
                          <Arrow className="h-3 w-5 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1" />
                        </BookButton>
                      </Magnetic>
                      <a
                        href="#projects"
                        className={`text-[1rem] font-medium text-[#E9F0FA] underline decoration-[#9BB8E0] underline-offset-[6px] transition-[text-decoration-color] duration-200 hover:decoration-[#FF7A1A] ${FOCUS}`}
                      >
                        {L(c.hero.secondary)}
                      </a>
                    </div>
                    <p className="mt-5 text-[0.875rem] text-[#9BB8E0]">{L(c.hero.promise)}</p>
                  </div>
                  {/* 100px wide, astride the column line (40px padding + 40px), hanging just below the CTA block. */}
                  <HeroDetail image={c.hero.detail} alt={L(c.hero.detail.alt)} className="-mb-[18px] -mr-[80px]" />
                </div>
              </div>
              <div className="relative border-t border-[#9BB8E0]/40 px-2 pb-6 pt-3 sm:px-8 sm:pb-9 sm:pt-6 lg:flex lg:flex-col lg:justify-center lg:border-t-0 lg:px-7 lg:py-8 xl:px-10">
                <BlueprintHero
                  image={c.hero.image}
                  alt={L(c.hero.image.alt)}
                  dims={c.hero.dims}
                  keynotes={c.hero.keynotes.map(L)}
                  keynotesLabel={L(c.hero.keynotesLabel)}
                  // The frame is the column minus padding and the 40px dimension gutter: <= ~700px.
                  sizes="(min-width: 1360px) 700px, (min-width: 1024px) 52vw, calc(100vw - 64px)"
                />
              </div>
            </div>
            {/* Title block along the foot of the sheet. */}
            <div className="grid grid-cols-2 border-t border-[#9BB8E0]/40 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="col-span-2 flex flex-col justify-center gap-1.5 border-b border-[#9BB8E0]/40 px-5 py-3.5 sm:col-span-1 sm:border-b-0 sm:px-6">
                <p className="demo-display text-[1.125rem] font-extrabold uppercase leading-none tracking-[0.03em] text-[#E9F0FA]">{c.business}</p>
                <p className="text-[0.8125rem] text-[#9BB8E0]">
                  {c.address} · {c.phone}
                </p>
              </div>
              {c.hero.titleBlock.map((row, n) => (
                <div
                  key={n}
                  className={`flex flex-col justify-center gap-1.5 px-5 py-3.5 sm:border-l sm:border-[#9BB8E0]/40 sm:px-5 ${
                    n === 0 ? "col-span-2 border-b border-[#9BB8E0]/40 sm:col-span-1 sm:border-b-0" : n === 1 ? "border-r border-[#9BB8E0]/40 sm:border-r-0" : ""
                  }`}
                >
                  <p className={`${LABEL} text-[0.6875rem] text-[#9BB8E0]`}>{L(row.label)}</p>
                  <p className="text-[0.9375rem] font-medium leading-tight text-[#E9F0FA]">{L(row.value)}</p>
                </div>
              ))}
              <div className="col-span-2 flex items-center justify-between gap-4 border-t border-[#9BB8E0]/40 bg-[#FF7A1A] px-5 py-3 sm:col-span-1 sm:flex-col sm:items-start sm:justify-center sm:gap-1 sm:border-t-0 sm:px-6">
                <p className={`${LABEL} text-[0.6875rem] text-[#0F2440]`}>{L(c.hero.sheetLabel)}</p>
                <p className="demo-display text-[1.75rem] font-extrabold leading-none tracking-[0.02em] text-[#0F2440]">A-101</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- services: schedule A-102 */}
      <section id="services" aria-labelledby="services-title" style={{ ...SCROLL_MARGIN, ...GRID_PAPER }} className="bg-[#E9F0FA] text-[#0F2440]">
        <div className={`${WRAP} py-14 sm:py-24 lg:py-28`}>
          <SectionHead
            id="services-title"
            paper
            sheet={c.services.sheet}
            title={L(c.services.title)}
            intro={L(c.services.intro)}
          />
          <div className="mt-12 lg:mt-16">
            {/* Column heads (visual only: each row labels its own cells for screen readers). */}
            <div
              aria-hidden="true"
              className={`hidden border-b-2 border-[#0F2440] pb-3 text-[#3D5878] lg:grid lg:grid-cols-[4.5rem_minmax(0,1.15fr)_minmax(0,2.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-8 ${LABEL}`}
            >
              <span>{L(c.services.cols.no)}</span>
              <span>{L(c.services.cols.scope)}</span>
              <span>{L(c.services.cols.includes)}</span>
              <span>{L(c.services.cols.schedule)}</span>
              <span className="text-right">{L(c.services.cols.from)}</span>
            </div>
            <HoverPreview
              images={c.services.items.map((s) => s.preview)}
              frameClassName="aspect-square w-[232px] rounded-none outline outline-1 outline-offset-4 outline-[#FF7A1A]"
            >
              {(bind) => (
                <ol className="border-t-2 border-[#0F2440] lg:border-t-0">
                  {c.services.items.map((s, n) => (
                    <li
                      key={s.id}
                      {...bind(n)}
                      className="group grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-[#0F2440]/25 py-6 lg:grid-cols-[4.5rem_minmax(0,1.15fr)_minmax(0,2.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-baseline lg:gap-x-8 lg:py-7"
                    >
                      <span
                        aria-hidden="true"
                        className="demo-display inline-flex h-8 w-10 items-center justify-center self-start border border-[#0F2440] text-[1rem] font-semibold leading-none tabular-nums transition-colors duration-300 group-hover:bg-[#FF7A1A]"
                      >
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      <h3 className="demo-display self-center text-[1.875rem] font-extrabold leading-none transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1.5 lg:self-baseline lg:text-[2.125rem]">
                        {L(s.name)}
                      </h3>
                      <p className="col-start-2 max-w-[52ch] text-[1rem] leading-relaxed text-[#3D5878] lg:col-start-auto">{L(s.includes)}</p>
                      <div className="col-start-2 flex items-end justify-between gap-4 border-t border-dashed border-[#0F2440]/30 pt-3 lg:contents">
                        <p className="lg:border-0 lg:pt-0">
                          <span className={`${LABEL} block whitespace-nowrap text-[0.6875rem] text-[#3D5878] lg:sr-only`}>{L(c.services.cols.schedule)}</span>
                          <span className="demo-display mt-1 block text-[1.25rem] font-semibold leading-none tabular-nums lg:mt-0">{L(s.schedule)}</span>
                        </p>
                        <p className="text-right">
                          <span className="text-[0.875rem] text-[#A84300]">{L(c.services.fromWord)} </span>
                          <span className="demo-display text-[1.875rem] font-extrabold leading-none tabular-nums lg:text-[2.125rem]">{usd(s.from)}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </HoverPreview>
            <p className="mt-6 flex max-w-[72ch] gap-3 text-[0.9375rem] leading-relaxed text-[#3D5878]">
              <span aria-hidden="true" className="mt-[0.45em] h-2 w-2 shrink-0 bg-[#FF7A1A] outline outline-1 outline-[#0F2440]" />
              {L(c.services.footnote)}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------- projects: details A-201 (the peak) */}
      <ProjectsGallery projects={c.projects} L={L} />

      {/* --------------------------------------------- process: chain dim A-301 */}
      <section id="process" aria-labelledby="process-title" style={{ ...SCROLL_MARGIN, ...GRID_DARK }} className="bg-[#0A1B31]">
        <div className={`${WRAP} py-14 sm:py-24 lg:py-28`}>
          <SectionHead
            id="process-title"
            sheet={c.process.sheet}
            title={L(c.process.title)}
            intro={L(c.process.intro)}
          />
          <ProcessSteps process={c.process} L={L} />
        </div>
      </section>

      {/* ------------------------------------------- reviews: revisions A-401 */}
      <section id="reviews" aria-labelledby="reviews-title" style={{ ...SCROLL_MARGIN, ...GRID_PAPER }} className="bg-[#E9F0FA] text-[#0F2440]">
        <div className="pt-14 sm:pt-20 lg:pt-24">
          <ScrollMarquee skew distance={18} className="border-y border-[#0F2440]/20 py-4 sm:py-6" rowClassName="gap-7 sm:gap-12">
            {c.reviewsBlock.trades.flatMap((t, i) => [
              <span
                key={`t${i}`}
                className="demo-display whitespace-nowrap text-[clamp(3.25rem,11vw,8.5rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.01em] text-[#0F2440]"
              >
                {L(t)}
              </span>,
              <span key={`d${i}`} aria-hidden="true" className="h-3 w-3 shrink-0 bg-[#FF7A1A] outline outline-1 outline-[#0F2440] sm:h-4 sm:w-4" />,
            ])}
          </ScrollMarquee>
        </div>
        <div className={`${WRAP} pb-14 pt-12 sm:pb-24 sm:pt-16 lg:pb-28 lg:pt-20`}>
          <SectionHead id="reviews-title" paper reveal sheet={c.reviewsBlock.sheet} kicker={L(c.reviewsBlock.kicker)} title={L(c.reviewsBlock.title)} />
          <ul className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-3 lg:gap-0">
            {c.reviews.map((r, n) => (
              <li key={r.name} className="flex flex-col lg:border-l lg:border-[#0F2440]/25 lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
                <figure className="flex h-full flex-col">
                  <p className="flex items-center gap-3">
                    <Delta n={n + 1} />
                    <span className={`${LABEL} text-[0.6875rem] text-[#A84300]`}>{L(r.project)}</span>
                  </p>
                  <blockquote className="demo-display mb-6 mt-5 text-[1.625rem] font-semibold leading-[1.12] text-[#0F2440] sm:text-[1.875rem]">
                    <p>“{L(r.quote)}”</p>
                  </blockquote>
                  <figcaption className="mt-auto border-t border-[#0F2440]/25 pt-3 text-[0.9375rem] font-medium text-[#3D5878]">
                    {r.name}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------ estimate + title block A-501 */}
      <section id="estimate" aria-labelledby="estimate-title" style={{ ...SCROLL_MARGIN, ...GRID_DARK }} className="bg-[#0F2440]">
        <div className={`${WRAP} py-14 sm:py-24 lg:py-28`}>
          <div className="grid border border-[#9BB8E0]/45 bg-[#0F2440] lg:grid-cols-12">
            {/* The finished elevation, measured across the top of the sheet. */}
            <div className="border-b border-[#9BB8E0]/45 px-3 pb-3 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:col-span-12 lg:px-8 lg:pb-8">
              <div className="flex items-center gap-5 sm:gap-8">
                <p className={`${LABEL} shrink-0 text-[0.6875rem] text-[#9BB8E0]`}>{L(c.estimate.elevationLabel)}</p>
                <Dimension label={c.estimate.elevationDim} className="min-w-0 flex-1" />
              </div>
              <RevealImage
                image={c.estimate.image}
                alt={L(c.estimate.image.alt)}
                fill
                from="top"
                parallax={7}
                sizes="(min-width: 1360px) 1214px, calc(100vw - 56px)"
                className="mt-2 aspect-[16/10] w-full bg-[#0A1B31] outline outline-1 outline-[#9BB8E0]/45 sm:aspect-[2/1] lg:aspect-[21/8]"
              />
            </div>
            <div className="px-5 py-9 sm:px-9 sm:py-12 lg:col-span-7 lg:border-r lg:border-[#9BB8E0]/45 lg:px-12 lg:py-14">
              <p className={`flex items-center gap-3 ${LABEL} text-[#9BB8E0]`}>
                <SheetTag>{c.estimate.sheet}</SheetTag>
              </p>
              <h2
                id="estimate-title"
                className="demo-display mt-6 text-balance text-[clamp(2.75rem,11vw,3.5rem)] font-extrabold leading-[0.93] text-[#E9F0FA] sm:text-[clamp(3.5rem,7vw,5rem)]"
              >
                {L(c.estimate.title)}
              </h2>
              <p className="mt-6 max-w-[50ch] text-[1.0625rem] leading-relaxed text-[#C4D5EC]">{L(c.estimate.body)}</p>
              <Magnetic className="mt-9">
                <BookButton className={`${BTN} group h-[3.25rem] px-5 text-[1.0625rem] sm:px-6 sm:text-[1.125rem]`}>
                  <RollText>{L(c.estimate.cta)}</RollText>
                  <Arrow className="h-3 w-5 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1" />
                </BookButton>
              </Magnetic>
              <p className="mt-6 flex items-start gap-2.5 text-[0.9375rem] font-medium text-[#E9F0FA]">
                <span aria-hidden="true" className="mt-[0.45em] h-2 w-2 shrink-0 bg-[#FF7A1A]" />
                {L(c.licence)}
              </p>
            </div>
            <dl className="grid border-t border-[#9BB8E0]/45 sm:grid-cols-2 lg:col-span-5 lg:border-t-0">
              <div className="border-b border-[#9BB8E0]/45 px-5 py-6 sm:col-span-2 sm:px-8">
                <dt className={`${LABEL} text-[0.6875rem] text-[#9BB8E0]`}>{L(c.estimate.hoursLabel)}</dt>
                <dd className="mt-3">
                  <ul className="space-y-1.5">
                    {c.hours.map((h, n) => (
                      <li key={n} className="flex justify-between gap-6 text-[1rem] text-[#E9F0FA]">
                        <span>{L(h.days)}</span>
                        <span className="tabular-nums">{L(h.time)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2.5 text-[0.875rem] text-[#C4D5EC]">{L(c.estimate.closed)}</p>
                </dd>
              </div>
              <div className="border-b border-[#9BB8E0]/45 px-5 py-6 sm:border-r sm:px-8">
                <dt className={`${LABEL} text-[0.6875rem] text-[#9BB8E0]`}>{L(c.estimate.officeLabel)}</dt>
                <dd className="mt-2">
                  <span className="demo-display block text-[1.5rem] font-semibold leading-tight text-[#E9F0FA]">{c.address}</span>
                  <span className="mt-1 block text-[0.875rem] text-[#C4D5EC]">{L(c.estimate.officeNote)}</span>
                </dd>
              </div>
              <div className="border-b border-[#9BB8E0]/45 px-5 py-6 sm:px-8">
                <dt className={`${LABEL} text-[0.6875rem] text-[#9BB8E0]`}>{L(c.estimate.phoneLabel)}</dt>
                <dd className="demo-display mt-2 text-[1.5rem] font-semibold leading-tight tabular-nums text-[#E9F0FA]">{c.phone}</dd>
              </div>
              <div className="border-b border-[#9BB8E0]/45 px-5 py-6 sm:border-b-0 sm:border-r sm:px-8">
                <dt className={`${LABEL} text-[0.6875rem] text-[#9BB8E0]`}>{L(c.estimate.warrantyLabel)}</dt>
                <dd className="mt-2 text-[1rem] font-medium leading-snug text-[#E9F0FA]">{L(c.estimate.warranty)}</dd>
              </div>
              <div className="px-5 py-6 sm:px-8">
                <dt className={`${LABEL} text-[0.6875rem] text-[#9BB8E0]`}>{L(c.estimate.areaLabel)}</dt>
                <dd className="mt-2 text-[1rem] font-medium leading-snug text-[#E9F0FA]">{L(c.estimate.area)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="bg-[#0A1B31]">
        <div className={`${WRAP} pb-10 pt-12`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p>
                <Wordmark size="lg" />
              </p>
              <p className="mt-4 text-[#C4D5EC]">{L(c.footer.tagline)}</p>
            </div>
            <p className="text-[0.9375rem] text-[#E9F0FA] sm:text-right">
              {c.address}
              <span aria-hidden="true" className="px-3 text-[#FF7A1A]">
                ·
              </span>
              <span className="whitespace-nowrap">{c.phone}</span>
            </p>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-[#9BB8E0]/25 pt-6 text-[0.8125rem] text-[#9BB8E0] sm:flex-row sm:justify-between">
            <p>{L(c.footer.sheets)}</p>
            <p>
              <DemoCredit className={`underline decoration-[#9BB8E0]/60 underline-offset-4 hover:text-[#E9F0FA] ${FOCUS}`}>
                {L(c.footer.credit)}
              </DemoCredit>
            </p>
          </div>
          <PhotoCredit
            names={c.photoCredits}
            className="mt-3 max-w-[80ch] text-[0.8125rem] leading-relaxed text-[#9BB8E0]"
            linkClassName={`underline decoration-[#9BB8E0]/60 underline-offset-4 hover:text-[#E9F0FA] ${FOCUS}`}
          />
        </div>
      </footer>
    </div>
  );
}
