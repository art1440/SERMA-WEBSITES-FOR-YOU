"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DemoCredit } from "@/components/work/DemoCredit";
import { PhotoCredit } from "@/components/work/PhotoCredit";
import { service as c } from "@/data/demos/service";
import type { L10n } from "@/i18n/types";
import { BookButton } from "../DemoShell";
import { BeforeAfterSlider } from "../signatures/BeforeAfterSlider";
import { useDemoStill } from "../useDemoStill";
import {
  Magnetic,
  Parallax,
  RevealImage,
  RollText,
  ScrollProgress,
  StickyStory,
  TextReveal,
  waveDelay,
  type StoryStep,
} from "../motion";
import { JobLog } from "./service/JobLog";
import { RadiusMap } from "./service/RadiusMap";

/*
 * Brightline Home, set as the daylight demo: a pale teal ground, deep teal ink
 * and one confident yellow, used as the "bright line" (a highlighter stroke
 * under the headline, the slider handle, the story's progress rule, CTA fills).
 * The voice is dispatch: an example arrival estimate, a typical visit told step
 * by step, a service radius, all written as typical examples, never live data.
 *
 * Rhythm (one device per section, never the same one twice in a row):
 *   hero        three depth planes: the photo plate drifts slowest, the
 *               headline is the mid plane, the dispatch card is the foreground
 *               and overlaps the photo's edge (Parallax + RevealImage, the h1
 *               rises line by line with TextReveal on load)
 *   visit       THE PEAK: "What happens when you call" pinned (StickyStory),
 *               four steps, each with its own photo, a yellow progress rule
 *   prices      four trade cards, photos wiping open as one wave (RevealImage,
 *               waveDelay), demo-zoom on hover
 *   work        the before/after slider (signature) + two jobs from the same
 *               week on separate Parallax planes
 *   guarantees  deep teal; each promise rises word by word (TextReveal) beside
 *               a photo of a tech explaining the repair (RevealImage)
 *   job log     recent jobs that slide sideways only while scrolling (ScrollMarquee)
 *   reviews     typography only (the quiet stretch)
 *   area        street photo plate behind the radius map card (Parallax)
 *   band        yellow booking band (Magnetic + RollText), then the footer
 * Pacing is snappier than the spa / salon demos (0.6 to 0.9 s on bespoke moves).
 *
 * Palette (hard-coded; the root sets color-scheme: light, so the page is the
 * same in either OS theme):
 *   ground #EAF6F4   ink #0C3A36   white #FFFFFF   yellow #FFD23F
 *   teal   #0F8F80 (decoration and >= 24px text only)
 *   teal-d #0A6B60 (small accent text)   muted #3F625E   mist #A9D3CC (on ink)
 * Contrast: ink on ground 11.3:1, on white 12.5:1, on yellow 8.7:1; muted on
 * ground 6.1:1, on white 6.7:1; teal-d on ground 5.8:1, on white 6.4:1;
 * ground on ink 11.3:1, mist on ink 7.7:1, yellow on ink 8.7:1; teal on
 * ground 3.6:1 (large display only). Yellow is never text on the light grounds.
 *
 * Bricolage Grotesque (variable, opsz + wght; font-optical-sizing auto picks
 * the optical size from the font size) for display; Figtree for body.
 */

const NAV_H = 64;
const PIN_TOP = `calc(var(--demo-ribbon) + ${NAV_H}px)`;
const SCROLL_MARGIN: CSSProperties = { scrollMarginTop: PIN_TOP };
const WRAP = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10";
const FOCUS =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0C3A36]";
const FOCUS_DARK =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#FFD23F]";
const KICKER =
  "text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#0A6B60] sm:text-[0.8125rem] sm:tracking-[0.14em]";
const SMALL_LABEL =
  "text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#0A6B60]";
const BTN_Y =
  "group demo-display inline-flex items-center justify-center gap-2.5 rounded-full bg-[#FFD23F] font-bold text-[#0C3A36] transition-[background-color,transform] duration-200 hover:bg-[#FFC70A] active:scale-[0.98] " +
  FOCUS;
const BTN_INK =
  "demo-display inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0C3A36] font-bold text-[#0C3A36] transition-[background-color,color,transform] duration-200 hover:bg-[#0C3A36] hover:text-[#EAF6F4] active:scale-[0.98] " +
  FOCUS;
const BTN_SOLID_INK =
  "group demo-display inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0C3A36] font-bold text-[#FFD23F] transition-[background-color,transform] duration-200 hover:bg-[#08302C] active:scale-[0.98] " +
  FOCUS;

/** The yellow highlighter stroke behind a run of text. */
const HIGHLIGHT: CSSProperties = {
  backgroundImage:
    "linear-gradient(transparent 58%, #FFD23F 58%, #FFD23F 90%, transparent 90%)",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
};

const CSS = `
.bl-ping{animation:bl-ping 1.2s cubic-bezier(0,0,.2,1) 3 both}
@keyframes bl-ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(2.6);opacity:0}}
@media (prefers-reduced-motion: reduce){.bl-ping{animation:none;opacity:0}}
`;

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Brightline's mark: a yellow line with a teal pin dropped on it. */
function Mark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 24" className={className}>
      <rect x="0" y="16" width="28" height="5" rx="2.5" fill="#FFD23F" />
      <path
        d="M14 18C14 18 7 11.6 7 7.2C7 3.2 10.1 0.5 14 0.5C17.9 0.5 21 3.2 21 7.2C21 11.6 14 18 14 18Z"
        fill="#0F8F80"
      />
      <circle cx="14" cy="7.2" r="2.6" fill="#EAF6F4" />
    </svg>
  );
}

function Wordmark({
  size = "md",
  dark = false,
}: {
  size?: "md" | "lg";
  dark?: boolean;
}) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <Mark className={big ? "h-8 w-9" : "h-6 w-7"} />
      <span
        className={`demo-display tracking-[-0.02em] ${big ? "text-[2rem]" : "text-[1.4375rem]"} ${dark ? "text-[#EAF6F4]" : "text-[#0C3A36]"}`}
      >
        <span className="font-extrabold">Brightline</span>
        <span
          className={`font-medium ${dark ? "text-[#A9D3CC]" : "text-[#0A6B60]"}`}
        >
          {" "}
          Home
        </span>
      </span>
    </span>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 12"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 6H18M13 1L18 6L13 11" />
    </svg>
  );
}

function Phone({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 3.5H9L10.5 8L8.2 9.5C9.3 11.8 12.2 14.7 14.5 15.8L16 13.5L20.5 15V19C20.5 19.8 19.8 20.5 19 20.5C10.9 20.5 3.5 13.1 3.5 5C3.5 4.2 4.2 3.5 5 3.5Z" />
    </svg>
  );
}

function SectionHead({
  id,
  kicker,
  title,
  intro,
  dark = false,
}: {
  id: string;
  kicker?: string;
  title: string;
  intro?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
      <div className="lg:col-span-7">
        {kicker && (
          <p className={`${KICKER} mb-4 ${dark ? "!text-[#FFD23F]" : ""}`}>
            {kicker}
          </p>
        )}
        <h2
          id={id}
          className={`demo-display text-balance text-[clamp(2.25rem,9vw,2.875rem)] font-bold leading-[1] tracking-[-0.03em] sm:text-[clamp(2.75rem,5.4vw,4.25rem)] ${
            dark ? "text-[#EAF6F4]" : "text-[#0C3A36]"
          }`}
        >
          {title}
        </h2>
      </div>
      {intro && (
        <p
          className={`max-w-[52ch] text-[1.0625rem] leading-relaxed lg:col-span-5 ${dark ? "text-[#A9D3CC]" : "text-[#3F625E]"}`}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

/** A plain lazy photo filling its frame (srcset from the record). */
function Photo({
  image,
  alt,
  sizes,
  className = "",
}: {
  image: (typeof c)["hero"]["image"];
  alt: string;
  sizes: string;
  className?: string;
}) {
  return (
    <img
      src={image.src}
      srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export function ServiceDemo() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];
  const es = locale === "es";
  const still = useDemoStill();

  const navLinks = [
    { href: "#prices", label: L(c.nav.services) },
    { href: "#work", label: L(c.nav.work) },
    { href: "#guarantees", label: L(c.nav.guarantees) },
    { href: "#area", label: L(c.nav.area) },
  ];
  const [h1a, h1b] = c.hero.headline.map(L);
  const h1Size = es
    ? "text-[clamp(3rem,14vw,4.25rem)] sm:text-[clamp(4.5rem,10vw,6.5rem)] lg:text-[clamp(4.5rem,7.4vw,6.25rem)]"
    : "text-[clamp(3.25rem,16.5vw,4.5rem)] sm:text-[clamp(4.75rem,11vw,7rem)] lg:text-[clamp(5.25rem,8.6vw,7.5rem)]";

  const storySteps: StoryStep[] = c.story.steps.map((s) => ({
    key: s.key,
    image: s.image,
    alt: L(s.image.alt),
    content: (
      <div className="max-w-[31rem]">
        {/* Step marker: full yellow when active, a short teal stub otherwise (transform only). */}
        <span
          aria-hidden="true"
          className="block h-[5px] w-16 origin-left rounded-full bg-[#FFD23F] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=false]:scale-x-[0.35] group-data-[active=false]:bg-[#0F8F80]/45"
        />
        <p className="demo-display mt-5 text-[2.75rem] font-extrabold leading-none tracking-[-0.04em] text-[#0F8F80] tabular-nums lg:text-[4rem]">
          {s.time}
        </p>
        <h3 className="demo-display mt-3 text-balance text-[1.75rem] font-bold leading-[1.05] tracking-[-0.025em] text-[#0C3A36] lg:text-[2.375rem]">
          {L(s.title)}
        </h3>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-[#3F625E] lg:text-[1.125rem]">
          {L(s.body)}
        </p>
      </div>
    ),
  }));

  return (
    <div id="top" className="overflow-x-clip">
      <style>{CSS}</style>

      {/* ---------------------------------------------------------------- nav */}
      <header
        className="sticky z-40 border-b border-[#0C3A36]/10 bg-[#EAF6F4]/95 backdrop-blur-sm"
        style={{ top: "var(--demo-ribbon)", height: NAV_H }}
      >
        <div className={`${WRAP} flex h-full items-center gap-6`}>
          <a
            href="#top"
            aria-label={L(c.nav.home)}
            className={`shrink-0 rounded-sm ${FOCUS}`}
          >
            <Wordmark />
          </a>
          <nav
            aria-label={L(c.nav.primary)}
            className="ml-auto hidden lg:block"
          >
            <ul className="flex gap-7 text-[0.9375rem] font-medium text-[#0C3A36]">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`demo-underline rounded-sm pb-0.5 relative after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] ${FOCUS}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <Magnetic className="ml-auto lg:ml-0" max={8}>
            <BookButton
              className={`${BTN_Y} h-11 whitespace-nowrap px-4 text-[0.9375rem] sm:px-5`}
            >
              <span className="sm:hidden">
                <RollText>{L(c.nav.bookShort)}</RollText>
              </span>
              <span className="hidden sm:inline-flex">
                <RollText>{L(c.nav.book)}</RollText>
              </span>
            </BookButton>
          </Magnetic>
        </div>
        <ScrollProgress className="bg-[#0F8F80]" />
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section aria-labelledby="hero-title" className="relative">
        <div
          className={`${WRAP} grid gap-x-10 gap-y-10 pb-20 pt-7 sm:pb-28 sm:pt-12 lg:grid-cols-12 lg:items-center lg:gap-x-8 lg:pb-32 lg:pt-12`}
        >
          {/* Mid plane: the type. */}
          <Parallax className="relative z-10 lg:col-span-7" distance={16}>
            <p className={KICKER}>{L(c.hero.kicker)}</p>
            <TextReveal
              as="h1"
              id="hero-title"
              trigger="mount"
              delay={0.1}
              spread={0.14}
              tilt={3}
              className={`demo-display mt-3 font-extrabold leading-[0.92] tracking-[-0.045em] text-[#0C3A36] sm:mt-4 ${h1Size}`}
              lines={[
                h1a,
                <span
                  key="b"
                  style={HIGHLIGHT}
                  className="-mx-[0.04em] px-[0.04em]"
                >
                  {h1b}
                </span>,
              ]}
            />
            <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-relaxed text-[#0C3A36] sm:mt-9 sm:text-[1.1875rem]">
              {L(c.hero.intro)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
              <Magnetic>
                <BookButton
                  className={`${BTN_Y} h-[3.25rem] px-6 text-[1.0625rem]`}
                >
                  <RollText>{L(c.hero.cta)}</RollText>
                  <Arrow className="h-3 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </BookButton>
              </Magnetic>
              <BookButton
                className={`${BTN_INK} h-[3.25rem] px-5 text-[1.0625rem] tabular-nums`}
              >
                <Phone className="h-5 w-5" />
                {L(c.hero.call)}
              </BookButton>
            </div>
          </Parallax>

          <div className="relative mb-16 sm:mx-auto sm:w-[78%] lg:col-span-5 lg:mb-0 lg:w-full">
            {/* Back plane: the photo plate, drifting slower than the page. */}
            <Parallax distance={-40}>
              <RevealImage
                image={c.hero.image}
                alt={L(c.hero.image.alt)}
                priority
                fill
                from="bottom"
                parallax={4}
                zoom={1.14}
                sizes="(min-width: 1280px) 470px, (min-width: 1024px) 38vw, (min-width: 640px) 78vw, calc(100vw - 32px)"
                className="aspect-[4/5] w-full rounded-[28px] bg-[#0C3A36]"
              />
            </Parallax>

            {/* Foreground plane: the dispatch card, drifting faster and overlapping the photo's edge. */}
            <Parallax
              className="absolute -bottom-14 left-3 right-3 z-20 sm:-left-10 sm:right-auto sm:w-[23rem] lg:-left-20 lg:-bottom-12"
              distance={64}
            >
              <div className="rounded-[20px] bg-[#0C3A36] p-5 text-[#EAF6F4] shadow-[0_24px_48px_-24px_rgba(12,58,54,0.65)] sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#A9D3CC]">
                      <span
                        aria-hidden="true"
                        className="relative inline-flex h-2.5 w-2.5"
                      >
                        {!still && (
                          <span className="bl-ping absolute inset-0 rounded-full bg-[#FFD23F]" />
                        )}
                        <span className="relative h-2.5 w-2.5 rounded-full bg-[#FFD23F]" />
                      </span>
                      {L(c.hero.eta.tag)}
                    </p>
                    <p className="demo-display mt-1.5 text-[1.0625rem] font-semibold leading-snug">
                      {L(c.hero.eta.label)}
                    </p>
                  </div>
                  <p className="demo-display shrink-0 text-[2.5rem] font-extrabold leading-none tracking-[-0.04em] text-[#FFD23F] tabular-nums">
                    {L(c.hero.eta.value)}
                  </p>
                </div>
                <ol className="mt-5 grid grid-cols-3 gap-3 border-t border-[#EAF6F4]/15 pt-4">
                  {c.hero.stops.map((s, n) => (
                    <li key={s.time}>
                      <span
                        className={`demo-display block text-[1rem] font-bold tabular-nums ${n === c.hero.stops.length - 1 ? "text-[#FFD23F]" : "text-[#EAF6F4]"}`}
                      >
                        {s.time}
                      </span>
                      <span className="mt-0.5 block text-[0.8125rem] leading-snug text-[#A9D3CC]">
                        {L(s.text)}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-[0.8125rem] leading-snug text-[#A9D3CC]">
                  {L(c.hero.eta.note)}
                </p>
              </div>
            </Parallax>
          </div>
        </div>
      </section>

      {/* ------------------------------------------- the visit (pinned story) */}
      <section
        id="visit"
        aria-labelledby="visit-title"
        style={SCROLL_MARGIN}
        className="bg-white"
      >
        <div className={`${WRAP} pb-20 pt-20 sm:pb-28 sm:pt-28 lg:pb-32`}>
          <SectionHead
            id="visit-title"
            title={L(c.story.title)}
            intro={
              <>
                {L(c.story.intro)}{" "}
                <span className="text-[0.9375rem] font-medium text-[#0A6B60]">
                  {L(c.story.caption)}
                </span>
              </>
            }
          />
          <StickyStory
            className="mt-14 sm:grid sm:grid-cols-2 sm:gap-x-10 lg:mt-10 lg:gap-x-16 xl:gap-x-24"
            steps={storySteps}
            top={PIN_TOP}
            mediaSide="right"
            frameClassName="rounded-[28px] bg-[#0C3A36]"
            progressClassName="bg-[#FFD23F]"
            stepClassName="group"
            mobileImageClassName="aspect-[4/5] rounded-[22px] bg-[#0C3A36] sm:max-w-[30rem]"
            sizes="(min-width: 1280px) 560px, 46vw"
            overlay={(a) => (
              <span
                aria-hidden="true"
                className="demo-display absolute left-5 top-5 rounded-full bg-[#FFD23F] px-4 py-2 text-[1.125rem] font-bold leading-none text-[#0C3A36] tabular-nums"
              >
                {c.story.steps[a]?.time}
              </span>
            )}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- prices */}
      <section id="prices" aria-labelledby="prices-title" style={SCROLL_MARGIN}>
        <div className={`${WRAP} py-20 sm:py-28`}>
          <SectionHead
            id="prices-title"
            title={L(c.services.title)}
            intro={L(c.services.intro)}
          />

          <div className="mt-10 grid items-center gap-x-6 gap-y-2 rounded-[16px] bg-[#FFD23F] px-5 py-5 text-[#0C3A36] sm:mt-14 sm:grid-cols-[auto_1fr] sm:px-7 lg:grid-cols-[auto_auto_1fr]">
            <p className="demo-display flex items-baseline gap-2 text-[2.75rem] font-extrabold leading-none tracking-[-0.04em] tabular-nums">
              {usd(c.services.visit.price)}
            </p>
            <p className="demo-display text-[1.25rem] font-bold leading-tight lg:border-r lg:border-[#0C3A36]/25 lg:pr-6">
              {L(c.services.visit.label)}
            </p>
            <p className="max-w-[60ch] text-[0.9375rem] leading-snug sm:col-span-2 lg:col-span-1">
              {L(c.services.visit.body)}
            </p>
          </div>

          <ul className="mt-12 grid gap-x-6 gap-y-14 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {c.services.items.map((s, i, all) => (
              <li key={s.id} className="group flex flex-col">
                <RevealImage
                  image={s.image}
                  alt={L(s.image.alt)}
                  fill
                  from="bottom"
                  parallax={4}
                  zoom={1.16}
                  delay={waveDelay(i, all.length, 0.3)}
                  imgClassName="demo-zoom"
                  sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 640px) 46vw, calc(100vw - 32px)"
                  className="aspect-[4/3] w-full rounded-[20px] bg-[#D5EEEA] sm:aspect-[4/5]"
                />
                <h3 className="demo-display mt-6 text-[1.5rem] font-bold leading-tight tracking-[-0.02em] text-[#0C3A36]">
                  {L(s.name)}
                </h3>
                <p className="mt-3 flex items-baseline gap-2 text-[#0C3A36]">
                  <span className="text-[0.9375rem] font-medium text-[#3F625E]">
                    {L(c.services.fromWord)}
                  </span>
                  <span className="demo-display text-[3.25rem] font-extrabold leading-[0.9] tracking-[-0.05em] tabular-nums">
                    {usd(s.from)}
                  </span>
                </p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-[#3F625E] lg:min-h-[4.6rem]">
                  {L(s.lede)}
                </p>
                <p className={`mt-5 ${SMALL_LABEL}`}>
                  {L(c.services.jobsLabel)}
                </p>
                <ul className="mt-2">
                  {s.jobs.map((j) => (
                    <li
                      key={j.name.en}
                      className="flex items-baseline justify-between gap-4 border-b border-[#0C3A36]/12 py-2.5 text-[0.9375rem] text-[#0C3A36]"
                    >
                      <span>{L(j.name)}</span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {usd(j.from)}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className="mt-12 max-w-[70ch] text-[0.875rem] leading-relaxed text-[#3F625E]">
            {L(c.services.footnote)}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- before / after work */}
      <section
        id="work"
        aria-labelledby="work-title"
        style={SCROLL_MARGIN}
        className="bg-white"
      >
        <div
          className={`${WRAP} grid gap-x-12 gap-y-8 pt-20 sm:pt-28 lg:grid-cols-12`}
        >
          <div className="lg:col-span-5 lg:row-start-1 lg:self-end">
            <p className={KICKER}>{L(c.work.kicker)}</p>
            <h2
              id="work-title"
              className="demo-display mt-4 text-balance text-[clamp(2.25rem,9vw,2.875rem)] font-bold leading-[1] tracking-[-0.03em] text-[#0C3A36] sm:text-[clamp(2.75rem,4.6vw,3.75rem)]"
            >
              {L(c.work.title)}
            </h2>
            <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#3F625E]">
              {L(c.work.body)}
            </p>
          </div>

          <BeforeAfterSlider
            className="lg:col-span-7 lg:row-span-2 lg:row-start-1 lg:self-center"
            before={c.work.before}
            after={c.work.after}
            beforeAlt={L(c.work.before.alt)}
            afterAlt={L(c.work.after.alt)}
            beforeLabel={L(c.work.labels.before)}
            afterLabel={L(c.work.labels.after)}
            name={L(c.work.sliderName)}
            valueText={L(c.work.valueText)}
            hint={L(c.work.hint)}
            sizes="(min-width: 1280px) 700px, (min-width: 1024px) 56vw, calc(100vw - 48px)"
          />

          <div className="lg:col-span-5 lg:row-start-2 lg:self-start">
            <ol className="grid grid-cols-3 border-y border-[#0C3A36]/15">
              {c.work.timeline.map((t, n) => (
                <li
                  key={n}
                  className={`py-4 ${n ? "border-l border-[#0C3A36]/15 pl-4" : ""}`}
                >
                  <span className={`block ${SMALL_LABEL}`}>{L(t.label)}</span>
                  <span className="demo-display mt-1 block text-[1.375rem] font-bold tabular-nums tracking-[-0.02em] text-[#0C3A36]">
                    {L(t.value)}
                  </span>
                </li>
              ))}
            </ol>
            <p className={`mt-6 ${SMALL_LABEL}`}>{L(c.work.scopeLabel)}</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#0C3A36]">
              {L(c.work.scope)}
            </p>
            <p className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-[#0C3A36]">
              <span className="text-[0.9375rem]">
                {L(c.work.quoted)}{" "}
                <strong className="demo-display text-[1.25rem] font-bold tabular-nums">
                  {c.work.price}
                </strong>
              </span>
              <span aria-hidden="true" className="text-[#0F8F80]">
                =
              </span>
              <span className="text-[0.9375rem]">
                {L(c.work.paid)}{" "}
                <strong className="demo-display text-[1.25rem] font-bold tabular-nums">
                  {c.work.price}
                </strong>
              </span>
            </p>
          </div>
        </div>

        {/* Same week, other jobs: two photos on separate depth planes. */}
        <div
          className={`${WRAP} grid gap-x-8 gap-y-10 pb-24 pt-16 sm:grid-cols-2 sm:pb-32 sm:pt-20 lg:grid-cols-12`}
        >
          <div className="sm:col-span-2 lg:col-span-4 lg:pt-6">
            <h3 className="demo-display text-[1.5rem] font-bold leading-tight tracking-[-0.02em] text-[#0C3A36] sm:text-[1.75rem]">
              {L(c.work.more.title)}
            </h3>
            <p className="mt-3 max-w-[38ch] text-[1rem] leading-relaxed text-[#3F625E]">
              {L(c.work.more.body)}
            </p>
          </div>
          {c.work.more.items.map((m, i) => (
            <Parallax
              key={m.image.src}
              className={`lg:col-span-4 ${i ? "lg:mt-20" : ""}`}
              distance={i ? 56 : 18}
            >
              <figure className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-[#D5EEEA]">
                  <Photo
                    image={m.image}
                    alt={L(m.image.alt)}
                    sizes="(min-width: 1280px) 380px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, calc(100vw - 32px)"
                    className="demo-zoom"
                  />
                </div>
                <figcaption className="mt-3 text-[0.9375rem] font-medium text-[#0C3A36]">
                  {L(m.caption)}
                </figcaption>
              </figure>
            </Parallax>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- guarantees */}
      <section
        id="guarantees"
        aria-labelledby="guarantees-title"
        style={SCROLL_MARGIN}
        className="bg-[#0C3A36]"
      >
        <div className={`${WRAP} py-20 sm:py-28`}>
          <SectionHead
            id="guarantees-title"
            title={L(c.guarantees.title)}
            intro={L(c.guarantees.intro)}
            dark
          />
          <div className="mt-12 grid gap-x-14 gap-y-12 sm:mt-16 lg:grid-cols-12">
            <figure
              className="lg:sticky lg:col-span-5 lg:self-start"
              style={{ top: `calc(${PIN_TOP} + 32px)` }}
            >
              <RevealImage
                image={c.guarantees.image}
                alt={L(c.guarantees.image.alt)}
                fill
                from="left"
                parallax={5}
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 38vw, calc(100vw - 32px)"
                className="aspect-[4/3] w-full rounded-[24px] bg-[#08302C] lg:aspect-[4/5]"
              />
              <figcaption className="mt-4 max-w-[44ch] text-[0.9375rem] leading-relaxed text-[#A9D3CC]">
                {L(c.guarantees.caption)}
              </figcaption>
            </figure>
            <ul className="border-t border-[#EAF6F4]/20 lg:col-span-7">
              {c.guarantees.items.map((g) => (
                <li
                  key={g.id}
                  className="border-b border-[#EAF6F4]/20 py-8 sm:py-10"
                >
                  <h3 className="flex items-center gap-3 text-[0.875rem] font-semibold uppercase tracking-[0.12em] text-[#FFD23F]">
                    <span
                      aria-hidden="true"
                      className="h-[3px] w-6 shrink-0 rounded-full bg-[#FFD23F]"
                    />
                    {L(g.label)}
                  </h3>
                  <TextReveal
                    as="p"
                    text={L(g.promise)}
                    spread={0.32}
                    tilt={3}
                    className="demo-display mt-4 text-balance text-[clamp(1.75rem,6.6vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[#EAF6F4] sm:text-[clamp(2.25rem,3.6vw,3rem)]"
                  />
                  <p className="mt-4 max-w-[52ch] text-[1rem] leading-relaxed text-[#A9D3CC]">
                    {L(g.body)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 text-[0.875rem] text-[#A9D3CC]">{L(c.licence)}</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ job log */}
      <section aria-labelledby="joblog-title" className="pt-20 sm:pt-28">
        <h2 id="joblog-title" className={`${WRAP} ${KICKER}`}>
          {L(c.jobLog.label)}
        </h2>
        <JobLog
          className="mt-6 sm:mt-8"
          items={c.jobLog.items.map((j) => ({
            image: j.image,
            caption: L(j.caption),
          }))}
        />
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section
        id="reviews"
        aria-labelledby="reviews-title"
        style={SCROLL_MARGIN}
      >
        <div className={`${WRAP} pb-20 pt-16 sm:pb-28 sm:pt-24`}>
          <h2
            id="reviews-title"
            className="demo-display text-[1.5rem] font-bold tracking-[-0.02em] text-[#0C3A36] sm:text-[1.75rem]"
          >
            {L(c.reviewsBlock.title)}
          </h2>

          {(() => {
            const [lead, ...rest] = c.reviews;
            return (
              <div className="mt-10 sm:mt-14">
                <figure className="border-t-2 border-[#0C3A36] pt-8 sm:pt-10">
                  <blockquote>
                    <span
                      aria-hidden="true"
                      className="demo-display block h-[0.5em] select-none text-[6rem] font-extrabold leading-[0.85] text-[#0F8F80] sm:text-[8rem]"
                    >
                      “
                    </span>
                    <p className="demo-display relative max-w-[30ch] text-balance text-[clamp(1.75rem,7vw,2.25rem)] font-medium leading-[1.12] tracking-[-0.025em] text-[#0C3A36] sm:text-[clamp(2.25rem,4.4vw,3.5rem)]">
                      {L(lead.quote)}
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-3 text-[0.9375rem]">
                    <span className="font-semibold text-[#0C3A36]">
                      {lead.name}
                    </span>
                    <span className="text-[#3F625E]">{L(lead.job)}</span>
                  </figcaption>
                </figure>
                <ul className="mt-12 grid gap-10 sm:mt-16 md:grid-cols-2 md:gap-12">
                  {rest.map((r) => (
                    <li key={r.name}>
                      <figure className="border-t border-[#0C3A36]/25 pt-6">
                        <blockquote>
                          <p className="demo-display text-[1.375rem] font-medium leading-[1.25] tracking-[-0.015em] text-[#0C3A36] sm:text-[1.5rem]">
                            “{L(r.quote)}”
                          </p>
                        </blockquote>
                        <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-3 text-[0.9375rem]">
                          <span className="font-semibold text-[#0C3A36]">
                            {r.name}
                          </span>
                          <span className="text-[#3F625E]">{L(r.job)}</span>
                        </figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ------------------------------------------------- service area + hours */}
      <section
        id="area"
        aria-labelledby="area-title"
        style={SCROLL_MARGIN}
        className="bg-white"
      >
        <div
          className={`${WRAP} grid gap-x-14 gap-y-14 py-20 sm:py-28 lg:grid-cols-12`}
        >
          <div className="lg:col-span-6">
            <p className={KICKER}>{L(c.area.kicker)}</p>
            <h2
              id="area-title"
              className="demo-display mt-4 text-balance text-[clamp(2.25rem,9vw,2.875rem)] font-bold leading-[1] tracking-[-0.03em] text-[#0C3A36] sm:text-[clamp(2.75rem,5vw,4rem)]"
            >
              {L(c.area.title)}
            </h2>
            <p className="mt-5 max-w-[50ch] text-[1.0625rem] leading-relaxed text-[#3F625E]">
              {L(c.area.body)}
            </p>
            <ul className="demo-display mt-6 flex flex-wrap gap-x-2 gap-y-1 text-[1.125rem] font-semibold text-[#0C3A36]">
              {c.area.neighborhoods.map((n, i) => (
                <li key={n} className="flex items-center gap-2">
                  {n}
                  {i < c.area.neighborhoods.length - 1 && (
                    <span aria-hidden="true" className="text-[#0F8F80]">
                      ·
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <dl className="mt-10 grid gap-x-8 gap-y-7 border-t-2 border-[#0C3A36] pt-7 sm:grid-cols-2">
              <div>
                <dt className={SMALL_LABEL}>{L(c.area.hoursLabel)}</dt>
                <dd className="mt-2">
                  <ul className="space-y-1">
                    {c.hours.map((h, n) => (
                      <li
                        key={n}
                        className="flex justify-between gap-6 text-[1rem] text-[#0C3A36]"
                      >
                        <span>{L(h.days)}</span>
                        <span className="font-semibold tabular-nums">
                          {L(h.time)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className={SMALL_LABEL}>{L(c.area.phoneLabel)}</dt>
                <dd className="demo-display mt-1.5 text-[1.75rem] font-bold tabular-nums tracking-[-0.02em] text-[#0C3A36]">
                  {c.phone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className={SMALL_LABEL}>{L(c.area.afterHoursLabel)}</dt>
                <dd className="mt-2 max-w-[56ch] text-[0.9375rem] leading-relaxed text-[#0C3A36]">
                  {L(c.area.afterHours)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Two planes: the street photo behind (slow), the radius map card in front (fast). */}
          <div className="relative lg:col-span-6 lg:self-center">
            <Parallax distance={-32}>
              <div className="aspect-[4/3] overflow-hidden rounded-[28px] bg-[#D5EEEA] sm:ml-[16%]">
                <Photo
                  image={c.area.image}
                  alt={L(c.area.image.alt)}
                  sizes="(min-width: 1280px) 500px, (min-width: 1024px) 42vw, (min-width: 640px) 76vw, calc(100vw - 32px)"
                />
              </div>
            </Parallax>
            <Parallax
              className="relative z-10 -mt-28 hidden w-[60%] max-w-[360px] sm:block lg:-mt-32"
              distance={60}
            >
              <div className="rounded-[28px] bg-white p-3 shadow-[0_24px_60px_-28px_rgba(12,58,54,0.55)] ring-1 ring-[#0C3A36]/10">
                <RadiusMap
                  names={c.area.neighborhoods}
                  rings={[L(c.area.ringLabels[0]), L(c.area.ringLabels[1])]}
                />
              </div>
            </Parallax>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ booking band */}
      <section aria-labelledby="band-title" className="bg-[#FFD23F]">
        <div
          className={`${WRAP} flex flex-col gap-8 py-16 sm:py-20 lg:flex-row lg:items-end lg:justify-between`}
        >
          <div>
            <h2
              id="band-title"
              className="demo-display max-w-[18ch] text-balance text-[clamp(2.25rem,8.4vw,2.75rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#0C3A36] sm:text-[clamp(2.75rem,5.2vw,4.25rem)]"
            >
              {L(c.band.title)}
            </h2>
            <p className="mt-4 max-w-[48ch] text-[1.0625rem] leading-relaxed text-[#0C3A36]">
              {L(c.band.body)}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Magnetic>
              <BookButton
                className={`${BTN_SOLID_INK} h-[3.5rem] px-7 text-[1.125rem]`}
              >
                <RollText>{L(c.band.cta)}</RollText>
                <Arrow className="h-3 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </BookButton>
            </Magnetic>
            <BookButton
              className={`${BTN_INK} h-[3.5rem] px-6 text-[1.0625rem] tabular-nums`}
            >
              <Phone className="h-5 w-5" />
              {L(c.band.call)}
            </BookButton>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- footer */}
      <footer className="bg-[#0C3A36]">
        <div className={`${WRAP} pb-10 pt-12`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p>
                <Wordmark size="lg" dark />
              </p>
              <p className="mt-4 max-w-[40ch] text-[#A9D3CC]">
                {L(c.footer.tagline)}
              </p>
            </div>
            <p className="text-[0.9375rem] text-[#EAF6F4] sm:text-right">
              {c.address}
              <span aria-hidden="true" className="px-3 text-[#FFD23F]">
                ·
              </span>
              <span className="whitespace-nowrap tabular-nums">{c.phone}</span>
            </p>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-[#EAF6F4]/15 pt-6 text-[0.8125rem] text-[#A9D3CC] sm:flex-row sm:justify-between sm:gap-8">
            <div className="space-y-2">
              <p>{L(c.licence)}</p>
              <PhotoCredit
                names={c.photoCredits}
                linkClassName={`demo-underline rounded-sm text-[#EAF6F4] ${FOCUS_DARK}`}
              />
            </div>
            <p className="shrink-0">
              <DemoCredit
                className={`underline decoration-[#A9D3CC]/60 underline-offset-4 hover:text-[#EAF6F4] ${FOCUS_DARK}`}
              >
                {L(c.footer.credit)}
              </DemoCredit>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
