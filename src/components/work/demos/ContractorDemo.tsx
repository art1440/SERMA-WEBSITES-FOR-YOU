"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { contractor as c } from "@/data/demos/contractor";
import type { L10n } from "@/i18n/types";
import { BookButton } from "../DemoShell";
import { BlueprintHero } from "../signatures/BlueprintHero";

/*
 * Trueframe Builders, set like a small set of construction documents: every
 * section is a "sheet" (A-101 ... A-501) with its number in a tag, the hero is
 * a drawing sheet with a title block along its foot, services are a schedule
 * (spec table), the process is a chain dimension, reviews carry revision
 * deltas. Palette is hard-coded and the root sets color-scheme: dark, so the
 * page is identical in either OS theme.
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
 */
const NAV_H = 60;
const SCROLL_MARGIN: CSSProperties = { scrollMarginTop: `calc(var(--demo-ribbon) + ${NAV_H}px)` };
const WRAP = "mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A1A]";
const LABEL = "text-[0.75rem] font-medium uppercase tracking-[0.16em]";
const BTN =
  "demo-display inline-flex items-center justify-center gap-3 bg-[#FF7A1A] font-semibold uppercase tracking-[0.08em] text-[#0F2440] transition-colors duration-200 hover:bg-[#E9F0FA] " +
  FOCUS;

const GRID_DARK: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(155,184,224,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(155,184,224,0.07) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};
const GRID_PAPER: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(15,36,64,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(15,36,64,0.055) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** The carpenter's framing square: Trueframe's mark. */
function SquareMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className}>
      <path d="M2 2H7V13H18V18H2Z" fill="#FF7A1A" />
      <path d="M4 5H5.4M4 8H5.4M4 11H5.4M9 15.6V14.2M12 15.6V14.2M15 15.6V14.2" stroke="#0F2440" strokeWidth="1" />
    </svg>
  );
}

function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-2.5 leading-none">
      <SquareMark className={big ? "h-7 w-7" : "h-5 w-5"} />
      <span className="flex items-baseline gap-2">
        <span className={`demo-display font-extrabold uppercase tracking-[0.02em] text-[#E9F0FA] ${big ? "text-[2.25rem]" : "text-[1.5rem]"}`}>
          Trueframe
        </span>
        <span className={`demo-display font-semibold uppercase tracking-[0.22em] text-[#9BB8E0] ${big ? "text-[1rem]" : "hidden text-[0.8125rem] sm:inline"}`}>
          Builders
        </span>
      </span>
    </span>
  );
}

/** Sheet number tag, e.g. A-102. */
function SheetTag({ children, paper = false }: { children: ReactNode; paper?: boolean }) {
  return (
    <span
      className={`demo-display inline-flex h-7 items-center border px-2 text-[0.9375rem] font-semibold leading-none tracking-[0.06em] ${
        paper ? "border-[#0F2440] text-[#0F2440]" : "border-[#9BB8E0] text-[#E9F0FA]"
      }`}
    >
      {children}
    </span>
  );
}

function SectionHead({
  id,
  sheet,
  kicker,
  title,
  intro,
  paper = false,
}: {
  id: string;
  sheet: string;
  kicker: string;
  title: string;
  intro?: string;
  paper?: boolean;
}) {
  return (
    <div className={`grid gap-5 border-t pt-5 lg:grid-cols-12 lg:gap-10 ${paper ? "border-[#0F2440]" : "border-[#9BB8E0]/60"}`}>
      <div className="lg:col-span-7">
        <p className={`flex items-center gap-3 ${LABEL} ${paper ? "text-[#3D5878]" : "text-[#9BB8E0]"}`}>
          <SheetTag paper={paper}>{sheet}</SheetTag>
          <span>{kicker}</span>
        </p>
        <h2
          id={id}
          className={`demo-display mt-5 text-balance text-[clamp(2.5rem,9vw,3.25rem)] font-extrabold leading-[0.95] tracking-[-0.005em] sm:text-[clamp(3rem,6vw,4.5rem)] ${
            paper ? "text-[#0F2440]" : "text-[#E9F0FA]"
          }`}
        >
          {title}
        </h2>
      </div>
      {intro && (
        <p className={`max-w-[56ch] text-[1.0625rem] leading-relaxed lg:col-span-5 lg:self-end ${paper ? "text-[#3D5878]" : "text-[#C4D5EC]"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}

/** Static horizontal dimension used over the project photos. */
function Dimension({ label, className }: { label: string; className?: string }) {
  return (
    <div aria-hidden="true" className={`relative flex h-8 items-center ${className ?? ""}`}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-[#9BB8E0]" />
      <span className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#9BB8E0]" />
      <span className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#9BB8E0]" />
      <span className="absolute left-0 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 translate-x-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className="relative mx-auto bg-[#0F2440] px-1.5 text-[0.875rem] font-medium leading-none text-[#C4D5EC]">{label}</span>
    </div>
  );
}

/** Revision delta: a triangle with the review's number. */
function Delta({ n }: { n: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 28" className="h-7 w-8">
      <path d="M16 2L30 26H2Z" fill="none" stroke="#A84300" strokeWidth="1.75" strokeLinejoin="round" />
      <text x="16" y="22" textAnchor="middle" fontSize="12" fontWeight="500" fill="#0F2440" fontFamily="var(--demo-body)">
        {n}
      </text>
    </svg>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M0 6H18M13 1L18 6L13 11" />
    </svg>
  );
}

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
                  <a
                    href={l.href}
                    className={`group inline-flex items-baseline gap-2 text-[#E9F0FA] underline decoration-transparent underline-offset-[6px] transition-[text-decoration-color] duration-200 hover:decoration-[#FF7A1A] ${FOCUS}`}
                  >
                    <span aria-hidden="true" className="demo-display text-[0.8125rem] font-semibold tracking-[0.06em] text-[#9BB8E0]">
                      {l.sheet}
                    </span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton className={`${BTN} ml-auto h-10 shrink-0 px-4 text-[0.9375rem] sm:px-5 lg:ml-0`}>
            <span className="sm:hidden">{L(c.nav.estimateShort)}</span>
            <span className="hidden sm:inline">{L(c.nav.estimate)}</span>
          </BookButton>
        </div>
      </header>

      {/* ---------------------------------------------------- hero: sheet A-101 */}
      <section aria-labelledby="hero-title" className="relative" style={GRID_DARK}>
        <div className={`${WRAP} pb-8 pt-3 max-sm:px-3 sm:pb-14 sm:pt-6 lg:pt-8`}>
          <div className="border border-[#9BB8E0]/40 bg-[#0F2440]/80">
            <div className="grid lg:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
              <div className="flex flex-col px-5 pb-8 pt-6 sm:px-9 sm:pb-10 sm:pt-9 lg:border-r lg:border-[#9BB8E0]/40 lg:px-10 lg:py-12">
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
                <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 lg:mt-auto lg:pt-9">
                  <BookButton className={`${BTN} h-[3.25rem] px-5 text-[1.0625rem] sm:px-6 sm:text-[1.125rem]`}>
                    {L(c.hero.cta)}
                    <Arrow className="h-3 w-5" />
                  </BookButton>
                  <a
                    href="#projects"
                    className={`text-[1rem] font-medium text-[#E9F0FA] underline decoration-[#9BB8E0] underline-offset-[6px] hover:decoration-[#FF7A1A] ${FOCUS}`}
                  >
                    {L(c.hero.secondary)}
                  </a>
                </div>
                <p className="mt-5 text-[0.875rem] text-[#9BB8E0]">{L(c.hero.promise)}</p>
              </div>
              <div className="border-t border-[#9BB8E0]/40 px-2 pb-6 pt-3 sm:px-8 sm:pb-9 sm:pt-6 lg:flex lg:flex-col lg:justify-center lg:border-t-0 lg:px-7 lg:py-8 xl:px-10">
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
            kicker={L(c.services.kicker)}
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
            <ol className="border-t-2 border-[#0F2440] lg:border-t-0">
              {c.services.items.map((s, n) => (
                <li
                  key={s.id}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-[#0F2440]/25 py-6 lg:grid-cols-[4.5rem_minmax(0,1.15fr)_minmax(0,2.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-baseline lg:gap-x-8 lg:py-7"
                >
                  <span
                    aria-hidden="true"
                    className="demo-display inline-flex h-8 w-10 items-center justify-center self-start border border-[#0F2440] text-[1rem] font-semibold leading-none tabular-nums"
                  >
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <h3 className="demo-display self-center text-[1.875rem] font-extrabold leading-none lg:self-baseline lg:text-[2.125rem]">
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
            <p className="mt-6 flex max-w-[72ch] gap-3 text-[0.9375rem] leading-relaxed text-[#3D5878]">
              <span aria-hidden="true" className="mt-[0.45em] h-2 w-2 shrink-0 bg-[#FF7A1A] outline outline-1 outline-[#0F2440]" />
              {L(c.services.footnote)}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- projects: details A-201 */}
      <section id="projects" aria-labelledby="projects-title" style={SCROLL_MARGIN} className="bg-[#0F2440]">
        <div className={`${WRAP} py-14 sm:py-24 lg:py-28`}>
          <SectionHead
            id="projects-title"
            sheet={c.projects.sheet}
            kicker={L(c.projects.kicker)}
            title={L(c.projects.title)}
            intro={L(c.projects.intro)}
          />
          <div className="mt-10 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-x-10 lg:gap-x-16">
            {c.projects.items.map((p, n) => (
              <article key={p.id} className={n === 0 ? "md:col-span-6" : "md:col-span-6 md:mt-24 lg:mt-32"}>
                <Dimension label={p.dimension} />
                <div className="relative mt-2">
                  <div className="aspect-[4/5] overflow-hidden outline outline-1 outline-[#9BB8E0]/45">
                    <img
                      src={p.image.src}
                      srcSet={`${p.image.small} 640w, ${p.image.src} ${p.image.width}w`}
                      sizes="(min-width: 1360px) 620px, (min-width: 768px) 46vw, calc(100vw - 32px)"
                      width={p.image.width}
                      height={p.image.height}
                      alt={L(p.image.alt)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Detail bubble: detail number over sheet number. */}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-8 left-5 flex h-16 w-16 flex-col items-center justify-center rounded-full border-[1.5px] border-[#9BB8E0] bg-[#0F2440] leading-none"
                  >
                    <span className="demo-display text-[1.375rem] font-extrabold text-[#E9F0FA]">{p.detail}</span>
                    <span className="my-1 h-px w-[calc(100%-2px)] bg-[#9BB8E0]" />
                    <span className="demo-display text-[0.75rem] font-semibold tracking-[0.04em] text-[#9BB8E0]">{c.projects.sheet}</span>
                  </span>
                </div>
                <div className="mt-12 sm:pl-24">
                  <p className={`${LABEL} text-[#FF7A1A]`}>
                    {p.location}
                  </p>
                  <h3 className="demo-display mt-2 text-[2rem] font-extrabold leading-none text-[#E9F0FA] sm:text-[2.375rem]">
                    {L(p.title)} <span className="whitespace-nowrap font-semibold text-[#9BB8E0]">· {L(p.duration)}</span>
                  </h3>
                  <dl className="mt-5 border-t border-[#9BB8E0]/35">
                    {p.facts.map((f, k) => (
                      <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-[#9BB8E0]/35 py-3">
                        <dt className={`${LABEL} pt-0.5 text-[0.6875rem] text-[#9BB8E0]`}>{L(f.label)}</dt>
                        <dd className="text-[0.9375rem] leading-snug text-[#E9F0FA]">{L(f.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------- process: chain dim A-301 */}
      <section id="process" aria-labelledby="process-title" style={{ ...SCROLL_MARGIN, ...GRID_DARK }} className="bg-[#0A1B31]">
        <div className={`${WRAP} py-14 sm:py-24 lg:py-28`}>
          <SectionHead
            id="process-title"
            sheet={c.process.sheet}
            kicker={L(c.process.kicker)}
            title={L(c.process.title)}
            intro={L(c.process.intro)}
          />
          {/* Chain dimension over the four steps (desktop; each step also states its span). */}
          <div aria-hidden="true" className="relative mt-16 hidden h-10 lg:block">
            <span className="absolute inset-x-0 top-1/2 h-px bg-[#9BB8E0]" />
            {[0, 25, 50, 75, 100].map((x) => (
              <span key={x} className="absolute top-1/2" style={{ left: `${x}%` }}>
                <span className="absolute left-0 top-0 h-4 w-px -translate-y-1/2 bg-[#9BB8E0]" />
                <span className="absolute left-0 top-0 h-px w-3.5 -translate-x-1/2 -rotate-45 bg-[#9BB8E0]" />
              </span>
            ))}
            {c.process.steps.map((s, n) => (
              <span
                key={s.id}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0A1B31] px-2 text-[0.875rem] font-medium text-[#C4D5EC]"
                style={{ left: `${12.5 + n * 25}%` }}
              >
                {L(s.span)}
              </span>
            ))}
          </div>
          <ol className="mt-12 grid lg:mt-6 lg:grid-cols-4">
            {c.process.steps.map((s, n) => (
              <li
                key={s.id}
                className="relative flex flex-col border-l border-[#9BB8E0]/50 pb-8 pl-6 last:pb-0 sm:pl-8 lg:pb-0 lg:pl-6 lg:pr-6 lg:last:border-r xl:pl-8 xl:pr-8"
              >
                <span aria-hidden="true" className="absolute -left-[5px] top-1 h-[9px] w-[9px] bg-[#FF7A1A] lg:hidden" />
                <p className="flex items-baseline gap-3">
                  <span className="demo-display text-[3rem] font-extrabold leading-none tabular-nums text-[#FF7A1A]">
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <span className={`${LABEL} text-[0.6875rem] text-[#9BB8E0] lg:sr-only`}>{L(s.span)}</span>
                </p>
                <h3 className="demo-display mt-3 text-[2rem] font-extrabold leading-none text-[#E9F0FA]">{L(s.title)}</h3>
                <p className="mt-4 max-w-[40ch] text-[1rem] leading-relaxed text-[#C4D5EC] lg:pb-6">{L(s.body)}</p>
                <p className="mt-6 border-t border-[#9BB8E0]/35 pt-3 lg:mt-auto">
                  <span className={`${LABEL} block text-[0.6875rem] text-[#9BB8E0]`}>{L(c.process.deliverableLabel)}</span>
                  <span className="mt-1.5 block text-[1rem] font-medium leading-snug text-[#E9F0FA]">{L(s.deliverable)}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------- reviews: revisions A-401 */}
      <section id="reviews" aria-labelledby="reviews-title" style={{ ...SCROLL_MARGIN, ...GRID_PAPER }} className="bg-[#E9F0FA] text-[#0F2440]">
        <div className={`${WRAP} py-14 sm:py-24 lg:py-28`}>
          <SectionHead id="reviews-title" paper sheet={c.reviewsBlock.sheet} kicker={L(c.reviewsBlock.kicker)} title={L(c.reviewsBlock.title)} />
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
            <div className="px-5 py-9 sm:px-9 sm:py-12 lg:col-span-7 lg:border-r lg:border-[#9BB8E0]/45 lg:px-12 lg:py-14">
              <p className={`flex items-center gap-3 ${LABEL} text-[#9BB8E0]`}>
                <SheetTag>{c.estimate.sheet}</SheetTag>
                <span>{L(c.estimate.kicker)}</span>
              </p>
              <h2
                id="estimate-title"
                className="demo-display mt-6 text-balance text-[clamp(2.75rem,11vw,3.5rem)] font-extrabold leading-[0.93] text-[#E9F0FA] sm:text-[clamp(3.5rem,7vw,5rem)]"
              >
                {L(c.estimate.title)}
              </h2>
              <p className="mt-6 max-w-[50ch] text-[1.0625rem] leading-relaxed text-[#C4D5EC]">{L(c.estimate.body)}</p>
              <BookButton className={`${BTN} mt-9 h-[3.25rem] px-5 text-[1.0625rem] sm:px-6 sm:text-[1.125rem]`}>
                {L(c.estimate.cta)}
                <Arrow className="h-3 w-5" />
              </BookButton>
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
              <Link href="/" className={`underline decoration-[#9BB8E0]/60 underline-offset-4 hover:text-[#E9F0FA] ${FOCUS}`}>
                {L(c.footer.credit)}
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
