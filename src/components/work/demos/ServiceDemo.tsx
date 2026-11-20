"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { service as c } from "@/data/demos/service";
import type { L10n } from "@/i18n/types";
import { BookButton } from "../DemoShell";
import { BeforeAfterSlider } from "../signatures/BeforeAfterSlider";
import { useDemoStill } from "../useDemoStill";

/*
 * Brightline Home, set as the daylight demo: a pale teal ground, deep teal ink
 * and one confident yellow, used as the "bright line" (a highlighter stroke
 * under the headline, the slider handle, CTA fills). The voice is dispatch:
 * a stated arrival average, a timeline of what happens when you call, a
 * service radius, all written as typical examples, never as live data.
 *
 * Rhythm: type-led hero (no photo above the fold) with a dispatch timeline;
 * a white price board in four columns under a yellow "$89 visit" bar; the
 * before/after slider beside a job ticket; guarantees as three big typeset
 * promises on deep teal; reviews as typography; a radius diagram for the
 * service area with hours; a deep teal footer.
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
const SCROLL_MARGIN: CSSProperties = {
  scrollMarginTop: `calc(var(--demo-ribbon) + ${NAV_H}px)`,
};
const WRAP = "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10";
const FOCUS =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#0C3A36]";
const FOCUS_DARK =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[#FFD23F]";
const KICKER =
  "text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#0A6B60] sm:text-[0.8125rem] sm:tracking-[0.14em]";
const BTN_Y =
  "demo-display inline-flex items-center justify-center gap-2.5 rounded-full bg-[#FFD23F] font-bold text-[#0C3A36] transition-[background-color,transform] duration-150 hover:bg-[#FFC70A] active:scale-[0.98] " +
  FOCUS;
const BTN_INK =
  "demo-display inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0C3A36] font-bold text-[#0C3A36] transition-[background-color,color,transform] duration-150 hover:bg-[#0C3A36] hover:text-[#EAF6F4] active:scale-[0.98] " +
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
  kicker: string;
  title: string;
  intro?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
      <div className="lg:col-span-7">
        <p className={`${KICKER} ${dark ? "!text-[#FFD23F]" : ""}`}>{kicker}</p>
        <h2
          id={id}
          className={`demo-display mt-4 text-balance text-[clamp(2.25rem,9vw,2.875rem)] font-bold leading-[1] tracking-[-0.03em] sm:text-[clamp(2.75rem,5.4vw,4.25rem)] ${
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

/** Service-area radius diagram: Lakeview at the centre, 10 and 20 mile rings, neighborhoods as dots. */
function RadiusMap({
  names,
  rings,
}: {
  names: string[];
  rings: [string, string];
}) {
  // Hand-placed in the 500 x 500 viewBox (rings r=100 and r=200 around 250,250):
  // [x, y, label side]. Order matches the neighborhoods list; Lakeview is the centre.
  const spots: [number, number, "start" | "end"][] = [
    [250, 250, "start"],
    [268, 118, "start"],
    [342, 186, "start"],
    [96, 296, "start"],
    [360, 380, "end"],
    [176, 140, "end"],
    [186, 352, "end"],
    [214, 432, "start"],
  ];
  const R = 200;
  return (
    <svg aria-hidden="true" viewBox="0 0 500 500" className="h-auto w-full">
      <circle
        cx="250"
        cy="250"
        r={R}
        fill="#EAF6F4"
        stroke="#0F8F80"
        strokeWidth="2"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <circle
        cx="250"
        cy="250"
        r={R / 2}
        fill="#D5EEEA"
        stroke="#0F8F80"
        strokeWidth="1.5"
      />
      <path
        d="M250 30V470M30 250H470"
        stroke="#0C3A36"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      <g
        fontFamily="var(--demo-body)"
        fontSize="14"
        fontWeight="600"
        fill="#0A6B60"
      >
        <text x={250 + R / 2 + 8} y="243">
          {rings[0]}
        </text>
        <text x={250 + R + 8} y="243">
          {rings[1]}
        </text>
      </g>
      {names.map((n, i) => {
        const [x, y, side] = spots[i] ?? [250, 250, "start"];
        const center = i === 0;
        return (
          <g key={n}>
            {center ? (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill="#FFD23F"
                  stroke="#0C3A36"
                  strokeWidth="3"
                />
                <circle cx={x} cy={y} r="4" fill="#0C3A36" />
              </>
            ) : (
              <circle cx={x} cy={y} r="5.5" fill="#0C3A36" />
            )}
            <text
              x={center ? x : side === "end" ? x - 11 : x + 11}
              y={center ? y + 40 : y + 5}
              textAnchor={center ? "middle" : side}
              fontFamily="var(--demo-display)"
              fontSize={center ? 20 : 15}
              fontWeight={center ? 800 : 600}
              fill="#0C3A36"
            >
              {n}
            </text>
          </g>
        );
      })}
    </svg>
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
    ? "text-[clamp(3rem,14vw,4.25rem)] sm:text-[clamp(4.5rem,10vw,6.5rem)] lg:text-[clamp(4.75rem,8vw,6.5rem)]"
    : "text-[clamp(3.25rem,16.5vw,4.5rem)] sm:text-[clamp(4.75rem,11vw,7rem)] lg:text-[clamp(5.5rem,9.2vw,8rem)]";

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
                    className={`rounded-sm underline-offset-[6px] hover:underline hover:decoration-[#0F8F80] hover:decoration-2 ${FOCUS}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton
            className={`${BTN_Y} ml-auto h-11 whitespace-nowrap px-4 text-[0.9375rem] sm:px-5 lg:ml-0`}
          >
            <span className="sm:hidden">{L(c.nav.bookShort)}</span>
            <span className="hidden sm:inline">{L(c.nav.book)}</span>
          </BookButton>
        </div>
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section aria-labelledby="hero-title" className="relative">
        <div
          className={`${WRAP} grid gap-x-12 gap-y-10 pb-14 pt-7 sm:pb-20 sm:pt-12 lg:grid-cols-12 lg:pb-24 lg:pt-14`}
        >
          <div className="lg:col-span-7">
            <p className={KICKER}>{L(c.hero.kicker)}</p>
            <h1
              id="hero-title"
              className={`demo-display mt-3 font-extrabold leading-[0.92] tracking-[-0.045em] text-[#0C3A36] sm:mt-4 ${h1Size}`}
            >
              <span className="block">{h1a}</span>
              <span className="block">
                <span style={HIGHLIGHT} className="-mx-[0.04em] px-[0.04em]">
                  {h1b}
                </span>
              </span>
            </h1>
            <div className="mt-6 sm:mt-10">
              <p className="max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#0C3A36] sm:text-[1.1875rem]">
                {L(c.hero.intro)}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                <BookButton
                  className={`${BTN_Y} h-[3.25rem] px-6 text-[1.0625rem]`}
                >
                  {L(c.hero.cta)}
                  <Arrow className="h-3 w-5" />
                </BookButton>
                <BookButton
                  className={`${BTN_INK} h-[3.25rem] px-5 text-[1.0625rem] tabular-nums`}
                >
                  <Phone className="h-5 w-5" />
                  {L(c.hero.call)}
                </BookButton>
              </div>

              {/* ETA strip: a stated average, not live tracking. */}
              <div className="mt-9 flex max-w-[34rem] items-stretch overflow-hidden rounded-[6px] bg-[#0C3A36] text-[#EAF6F4]">
                <div className="flex shrink-0 flex-col justify-center gap-1 border-r border-[#EAF6F4]/15 px-4 py-4 sm:px-5">
                  <span className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#A9D3CC]">
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
                  </span>
                  <span className="demo-display text-[2.25rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
                    {L(c.hero.eta.value)}
                  </span>
                </div>
                <div className="px-4 py-4 sm:px-5">
                  <p className="demo-display text-[1.0625rem] font-semibold leading-snug">
                    {L(c.hero.eta.label)}
                  </p>
                  <p className="mt-1 text-[0.875rem] leading-snug text-[#A9D3CC]">
                    {L(c.hero.eta.note)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What happens when you call: a typical example, labelled as such. */}
          <div className="lg:col-span-5 lg:pt-12">
            <div className="border-t-[3px] border-[#0C3A36] bg-white px-5 pb-6 pt-5 shadow-[0_1px_0_rgba(12,58,54,0.08)] sm:px-7 sm:pb-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="demo-display text-[1.375rem] font-bold tracking-[-0.02em] text-[#0C3A36]">
                  {L(c.hero.route.title)}
                </h2>
                <p className="text-[0.8125rem] font-medium text-[#3F625E]">
                  {L(c.hero.route.caption)}
                </p>
              </div>
              <ol className="relative mt-5">
                <span
                  aria-hidden="true"
                  className="absolute bottom-3 left-[3.75rem] top-3 w-[2px] bg-[#0F8F80]/35 sm:left-[4.25rem]"
                />
                {c.hero.route.stops.map((s, n) => {
                  const last = n === c.hero.route.stops.length - 1;
                  return (
                    <li
                      key={s.time}
                      className="relative grid grid-cols-[3.75rem_1fr] gap-x-0 py-2 sm:grid-cols-[4.25rem_1fr]"
                    >
                      <span className="demo-display pt-[1px] text-[1rem] font-bold tabular-nums text-[#0A6B60]">
                        {s.time}
                      </span>
                      <span className="relative pl-6 text-[0.9375rem] leading-snug text-[#0C3A36]">
                        <span
                          aria-hidden="true"
                          className={`absolute left-[-6px] top-[5px] h-3.5 w-3.5 rounded-full border-2 ${
                            last
                              ? "border-[#0C3A36] bg-[#FFD23F]"
                              : "border-[#0F8F80] bg-white"
                          }`}
                        />
                        {L(s.text)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- prices */}
      <section
        id="prices"
        aria-labelledby="prices-title"
        style={SCROLL_MARGIN}
        className="bg-white"
      >
        <div className={`${WRAP} py-16 sm:py-24`}>
          <SectionHead
            id="prices-title"
            kicker={L(c.services.kicker)}
            title={L(c.services.title)}
            intro={L(c.services.intro)}
          />

          <div className="mt-10 grid items-center gap-x-6 gap-y-2 rounded-[6px] bg-[#FFD23F] px-5 py-5 text-[#0C3A36] sm:mt-14 sm:grid-cols-[auto_1fr] sm:px-7 lg:grid-cols-[auto_auto_1fr]">
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

          <ul className="mt-10 grid gap-x-8 gap-y-12 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
            {c.services.items.map((s) => (
              <li
                key={s.id}
                className="flex flex-col border-t-2 border-[#0C3A36] pt-5"
              >
                <h3 className="demo-display text-[1.5rem] font-bold leading-tight tracking-[-0.02em] text-[#0C3A36]">
                  {L(s.name)}
                </h3>
                <p className="mt-4 flex items-baseline gap-2 text-[#0C3A36]">
                  <span className="text-[0.9375rem] font-medium text-[#3F625E]">
                    {L(c.services.fromWord)}
                  </span>
                  <span className="demo-display text-[3.5rem] font-extrabold leading-[0.9] tracking-[-0.05em] tabular-nums">
                    {usd(s.from)}
                  </span>
                </p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-[#3F625E] lg:min-h-[4.6rem]">
                  {L(s.lede)}
                </p>
                <p className="mt-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#0A6B60]">
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
          <p className="mt-10 max-w-[70ch] text-[0.875rem] leading-relaxed text-[#3F625E]">
            {L(c.services.footnote)}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- before / after work */}
      <section id="work" aria-labelledby="work-title" style={SCROLL_MARGIN}>
        <div
          className={`${WRAP} grid gap-x-12 gap-y-8 py-16 sm:py-24 lg:grid-cols-12`}
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
                  <span className="block text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#0A6B60]">
                    {L(t.label)}
                  </span>
                  <span className="demo-display mt-1 block text-[1.375rem] font-bold tabular-nums tracking-[-0.02em] text-[#0C3A36]">
                    {L(t.value)}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#0A6B60]">
              {L(c.work.scopeLabel)}
            </p>
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
      </section>

      {/* --------------------------------------------------------- guarantees */}
      <section
        id="guarantees"
        aria-labelledby="guarantees-title"
        style={SCROLL_MARGIN}
        className="bg-[#0C3A36]"
      >
        <div className={`${WRAP} py-16 sm:py-24`}>
          <SectionHead
            id="guarantees-title"
            kicker={L(c.guarantees.kicker)}
            title={L(c.guarantees.title)}
            intro={L(c.guarantees.intro)}
            dark
          />
          <ul className="mt-12 border-t border-[#EAF6F4]/20 sm:mt-16">
            {c.guarantees.items.map((g) => (
              <li
                key={g.id}
                className="grid gap-x-10 gap-y-3 border-b border-[#EAF6F4]/20 py-8 sm:py-10 lg:grid-cols-12"
              >
                <h3 className="flex items-center gap-3 text-[0.875rem] font-semibold uppercase tracking-[0.12em] text-[#FFD23F] lg:col-span-3 lg:items-start lg:pt-3">
                  <span
                    aria-hidden="true"
                    className="h-[3px] w-6 shrink-0 rounded-full bg-[#FFD23F] lg:mt-[0.55em]"
                  />
                  {L(g.label)}
                </h3>
                <p className="demo-display text-balance text-[clamp(1.75rem,6.6vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[#EAF6F4] sm:text-[clamp(2.25rem,3.6vw,3rem)] lg:col-span-6">
                  {L(g.promise)}
                </p>
                <p className="max-w-[44ch] text-[1rem] leading-relaxed text-[#A9D3CC] lg:col-span-3 lg:pt-3">
                  {L(g.body)}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.875rem] text-[#A9D3CC]">{L(c.licence)}</p>
        </div>
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section
        id="reviews"
        aria-labelledby="reviews-title"
        style={SCROLL_MARGIN}
      >
        <div className={`${WRAP} py-16 sm:py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
            <div>
              <p className={KICKER}>{L(c.reviewsBlock.kicker)}</p>
              <h2
                id="reviews-title"
                className="demo-display mt-3 text-[1.5rem] font-bold tracking-[-0.02em] text-[#0C3A36] sm:text-[1.75rem]"
              >
                {L(c.reviewsBlock.title)}
              </h2>
            </div>
            <p className="flex items-center gap-2 text-[0.9375rem] font-medium text-[#0C3A36]">
              <span
                aria-hidden="true"
                className="text-[1.125rem] leading-none tracking-[0.08em] text-[#0F8F80]"
              >
                ★★★★★
              </span>
              {L(c.reviewsBlock.rating)}
            </p>
          </div>

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
          className={`${WRAP} grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-14`}
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
                <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#0A6B60]">
                  {L(c.area.hoursLabel)}
                </dt>
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
                <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#0A6B60]">
                  {L(c.area.phoneLabel)}
                </dt>
                <dd className="demo-display mt-1.5 text-[1.75rem] font-bold tabular-nums tracking-[-0.02em] text-[#0C3A36]">
                  {c.phone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#0A6B60]">
                  {L(c.area.afterHoursLabel)}
                </dt>
                <dd className="mt-2 max-w-[56ch] text-[0.9375rem] leading-relaxed text-[#0C3A36]">
                  {L(c.area.afterHours)}
                </dd>
              </div>
            </dl>
            <BookButton
              className={`${BTN_Y} mt-9 h-[3.25rem] px-6 text-[1.0625rem]`}
            >
              {L(c.area.cta)}
              <Arrow className="h-3 w-5" />
            </BookButton>
          </div>
          <div className="mx-auto hidden w-full max-w-[520px] sm:block lg:col-span-6 lg:max-w-none lg:self-center">
            <RadiusMap
              names={c.area.neighborhoods}
              rings={[L(c.area.ringLabels[0]), L(c.area.ringLabels[1])]}
            />
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
          <div className="mt-12 flex flex-col gap-3 border-t border-[#EAF6F4]/15 pt-6 text-[0.8125rem] text-[#A9D3CC] sm:flex-row sm:justify-between">
            <p>{L(c.licence)}</p>
            <p>
              <Link
                href="/"
                className={`underline decoration-[#A9D3CC]/60 underline-offset-4 hover:text-[#EAF6F4] ${FOCUS_DARK}`}
              >
                {L(c.footer.credit)}
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
