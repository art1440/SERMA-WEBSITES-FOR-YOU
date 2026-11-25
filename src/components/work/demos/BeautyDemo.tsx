"use client";

import { motion } from "framer-motion";
import { useMemo, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { DemoCredit } from "@/components/work/DemoCredit";
import { PhotoCredit } from "@/components/work/PhotoCredit";
import { Magnetic, RevealImage, RollText, ScrollProgress, StickyStory, TextReveal, type StoryStep } from "@/components/work/motion";
import { beauty as c } from "@/data/demos/beauty";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";
import { BookButton } from "../DemoShell";
import { MaskWindows } from "../signatures/MaskWindows";
import { useDemoStill } from "../useDemoStill";
import { HeroWindows } from "./beauty/HeroWindows";
import { RoomStrip } from "./beauty/RoomStrip";

/*
 * Velvet Room. Palette is hard-coded (the site's theme tokens flip under
 * html.dark) and the root sets color-scheme: dark, so the page is identical in
 * either OS theme.
 *   deep sage  #1E2A24  page              moss   #26352D  raised panels
 *   mist       #E8EFE9  text / steps band sage   #9CC5A6  accent, CTA fill
 *   lichen     #B4C4B9  secondary text    fern   #2F5A3E  accent text on mist
 * Contrast: mist on deep sage 12.7:1, on moss 11.0:1; sage on deep sage 7.8:1,
 * on moss 6.7:1; lichen on deep sage 8.2:1, on moss 7.1:1; deep sage on sage
 * 7.8:1, on mist 12.7:1; fern on mist 6.8:1; #4A5D51 on mist 6.0:1; mist on
 * fern 6.8:1.
 *
 * Fraunces is used light (300) with SOFT 100 and automatic optical sizing,
 * so display sizes get the soft, rounded high-opsz cut. Upright only.
 *
 * Pace: the slowest site in the collection. Entrances run 1.2-1.6 s over
 * short distances (14-24px), nothing skews or snaps; hover moves stay in the
 * 300-450ms band.
 *
 * Page grammar (one device per section, never repeated next door):
 *   hero        Parallax planes: the window frame, the room inside it, a
 *               smaller sage window in front (HeroWindows)
 *   treatments  MaskWindows, the signature
 *   the room    ScrollMarquee of textures, the quiet before the peak (RoomStrip)
 *   your visit  StickyStory on the mist panel: THE PEAK (longest scroll span)
 *   reviews     TextReveal heading over three floating quotes
 *   book        RevealImage photo half + Magnetic / RollText CTA, then footer
 */
const NAV_H = 64;
const STICKY_TOP = `calc(var(--demo-ribbon) + ${NAV_H}px)`;
const SCROLL_MARGIN = { scrollMarginTop: STICKY_TOP };
const WRAP = "mx-auto max-w-[1280px] px-4 sm:px-8 lg:px-12";
const SOFT = "demo-display [font-variation-settings:'SOFT'_100]";
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9CC5A6]";
const KICKER = "text-[0.75rem] font-medium uppercase tracking-[0.22em]";
const PILL = `inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-300 ${FOCUS}`;
/** Desktop offsets for the three quotes: left, right, then in between. */
const REVIEW_OFFSETS = ["md:mr-[22%] lg:mr-[38%]", "md:ml-[22%] lg:ml-[38%]", "md:mx-[8%] lg:ml-[14%] lg:mr-[30%]"];
const PILL_SOLID = `group ${PILL} bg-[#9CC5A6] text-[#1E2A24] hover:bg-[#E8EFE9]`;
/** Text links: the underline draws in from the left (globals.css demo-underline). */
const UNDERLINE = `demo-underline rounded-[2px] pb-0.5 ${FOCUS}`;

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
      initial={{ opacity: 0, y: 14 }}
      {...(onLoad ? { animate: to } : { whileInView: to, viewport: VIEWPORT_ONCE })}
      transition={{ duration: 1.4, ease: EASE_EDITORIAL, delay }}
    >
      {children}
    </M>
  );
}

/**
 * The h1, one word per line, each line a step softer: Fraunces at wght 420
 * and SOFT 0, then 350 / SOFT 50, then 300 / SOFT 100 in sage (optical size
 * stays automatic, so every line gets the display cut). The lines rise into
 * place on load; transform only, the h1 is opaque from the first paint (LCP).
 */
const HEADLINE_LINES = [
  { cls: "text-[#E8EFE9]", fvs: "'SOFT' 0, 'wght' 420" },
  { cls: "text-[#E8EFE9] sm:pl-[0.5em]", fvs: "'SOFT' 50, 'wght' 350" },
  { cls: "text-[#9CC5A6] sm:pl-[1em]", fvs: "'SOFT' 100, 'wght' 300" },
];

function HeroHeadline({ lines }: { lines: string[] }) {
  const still = useDemoStill();
  return (
    <h1 className="demo-display mt-6 text-[clamp(4.25rem,9.6vw,9rem)] leading-[0.92] tracking-[-0.03em] sm:mt-8">
      {lines.map((text, i) => {
        const { cls, fvs } = HEADLINE_LINES[i];
        const style = { fontVariationSettings: fvs };
        // A space between lines keeps the accessible name "Lashes, brows, skin."
        return still ? (
          <span key={i} className={`block ${cls}`} style={style}>
            {text}{" "}
          </span>
        ) : (
          <motion.span
            key={i}
            className={`block ${cls}`}
            style={style}
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.5, ease: EASE_EDITORIAL, delay: 0.1 + i * 0.14 }}
          >
            {text}{" "}
          </motion.span>
        );
      })}
    </h1>
  );
}

/** Primary booking button: magnetic pull, label rolls on hover / focus. */
function PrimaryBook({ label, className }: { label: string; className: string }) {
  return (
    <Magnetic strength={0.22} max={8}>
      <BookButton className={`${PILL_SOLID} ${className}`}>
        <RollText>{label}</RollText>
      </BookButton>
    </Magnetic>
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

  const roomItems = useMemo(
    () => c.room.items.map((it) => ({ key: it.image.src, image: it.image, alt: it.image.alt[locale], caption: it.caption[locale] })),
    [locale],
  );

  const storySteps: StoryStep[] = c.steps.items.map((s, i) => ({
    key: s.title.en,
    image: s.image,
    alt: s.image.alt[locale],
    content: (
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-6 lg:max-w-[460px]">
        {/* The marker fills with fern while its step is the one on the pinned photo. */}
        <span
          aria-hidden="true"
          className={`${SOFT} flex h-14 w-14 items-center justify-center rounded-full border border-[#1E2A24]/25 bg-[#E8EFE9] text-[1.5rem] font-normal text-[#1E2A24] transition-colors duration-700 group-data-[active=true]/step:border-[#2F5A3E] group-data-[active=true]/step:bg-[#2F5A3E] group-data-[active=true]/step:text-[#E8EFE9]`}
        >
          {i + 1}
        </span>
        <div className="min-w-0 pt-1">
          <p className={`${KICKER} text-[#2F5A3E]`}>{L(s.when)}</p>
          <h3 className={`${SOFT} mt-3 text-[1.75rem] font-normal leading-[1.12] sm:text-[2.125rem]`}>{L(s.title)}</h3>
          <p className="mt-4 max-w-[40ch] leading-relaxed text-[#4A5D51] md:text-[1.0625rem]">{L(s.body)}</p>
        </div>
      </div>
    ),
  }));

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
                  <a href={l.href} className={`${UNDERLINE} text-[#E8EFE9]/90 transition-colors duration-300 hover:text-[#E8EFE9]`}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BookButton
            className={`group ${PILL} ml-auto h-10 shrink-0 border border-[#9CC5A6] px-5 text-[0.875rem] text-[#E8EFE9] hover:bg-[#9CC5A6] hover:text-[#1E2A24] lg:ml-0`}
          >
            <RollText>{L(c.nav.book)}</RollText>
          </BookButton>
        </div>
        <ScrollProgress className="bg-[#9CC5A6]" />
      </header>

      {/* --------------------------------------------------------------- hero */}
      <section
        aria-label={L(c.hero.kicker)}
        className="relative isolate flex flex-col"
        style={{ minHeight: `calc(100svh - var(--demo-ribbon) - ${NAV_H}px)` }}
      >
        <div
          className={`${WRAP} grid w-full flex-1 content-center gap-y-14 pb-16 pt-8 sm:pb-20 sm:pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:content-end lg:items-end lg:gap-x-16`}
        >
          <div>
            <Drift onLoad>
              <p className={`${KICKER} text-[#B4C4B9]`}>{L(c.hero.kicker)}</p>
            </Drift>
            <HeroHeadline lines={c.hero.headline.map(L)} />
            <Drift onLoad delay={0.5}>
              <p className="mt-8 max-w-[40ch] text-[1.0625rem] leading-relaxed text-[#E8EFE9]/90 sm:mt-10 sm:text-[1.125rem]">{L(c.hero.intro)}</p>
            </Drift>
            <Drift onLoad delay={0.62}>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-9">
                <PrimaryBook label={L(c.hero.cta)} className="h-14 px-8 text-[1rem]" />
                <a
                  href="#treatments"
                  className={`rounded-full text-[1rem] font-medium underline decoration-[#9CC5A6] decoration-2 underline-offset-[7px] transition-colors duration-300 hover:text-[#9CC5A6] ${FOCUS}`}
                >
                  {L(c.hero.link)}
                </a>
              </div>
            </Drift>
          </div>
          <HeroWindows
            room={c.hero.room}
            roomAlt={c.hero.room.alt[locale]}
            detail={c.hero.detail}
            detailAlt={c.hero.detail.alt[locale]}
            note={L(c.hero.note)}
          />
        </div>
      </section>

      {/* -------------------------------------------- treatments (signature) */}
      <section id="treatments" aria-labelledby="treatments-title" style={SCROLL_MARGIN} className="py-24 md:py-36">
        <div className={WRAP}>
          <Drift className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end md:gap-16">
            <h2 id="treatments-title" className={`${SOFT} text-[clamp(2.5rem,5vw,4.25rem)] font-light leading-[1.02] tracking-[-0.015em]`}>
              {L(c.treatments.title)}
            </h2>
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

      {/* ------------------------------------------- the room (quiet interlude) */}
      <section aria-labelledby="room-title" className="pb-28 md:pb-40">
        <div className={WRAP}>
          <Drift className="grid gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-end md:gap-16">
            <h2 id="room-title" className={`${SOFT} text-[clamp(2.125rem,3.8vw,3.25rem)] font-light leading-[1.05] tracking-[-0.015em]`}>
              {L(c.room.title)}
            </h2>
            <p className="max-w-[48ch] leading-relaxed text-[#B4C4B9] md:justify-self-end md:text-[1.0625rem]">{L(c.room.intro)}</p>
          </Drift>
        </div>
        <RoomStrip items={roomItems} className="mt-12 md:mt-16" />
      </section>

      {/* ------------------------------------------ how a visit works (PEAK) */}
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
          <StickyStory
            className="mt-14 md:mt-20"
            steps={storySteps}
            top={STICKY_TOP}
            mediaSide="left"
            sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 100vw"
            frameClassName="rounded-t-full rounded-b-[36px] bg-[#D5E0D8]"
            progressClassName="bg-[#2F5A3E]"
            stepClassName="group/step"
            mobileImageClassName="aspect-[4/5] max-w-[460px] rounded-t-full rounded-b-[28px] bg-[#D5E0D8]"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------ reviews */}
      <section id="reviews" aria-labelledby="reviews-title" style={SCROLL_MARGIN} className="py-28 md:py-40">
        <div className={WRAP}>
          <TextReveal
            id="reviews-title"
            text={L(c.reviewsTitle)}
            tilt={2}
            className={`${SOFT} max-w-[18ch] text-[clamp(2.25rem,4.4vw,3.75rem)] font-light leading-[1.08] tracking-[-0.015em]`}
          />
          {/* Plain typography, no boxes: three quotes stepping across the page like the windows above. */}
          <ul className="mt-14 space-y-16 md:mt-20 md:space-y-24">
            {c.reviews.map((r, i) => (
              <Drift as="li" key={r.name} delay={0.1} className={REVIEW_OFFSETS[i]}>
                <figure>
                  <span aria-hidden="true" className="block h-px w-14 bg-[#9CC5A6]" />
                  <blockquote className="mt-8">
                    <p className={`${SOFT} text-[clamp(1.625rem,3vw,2.5rem)] font-light leading-[1.22] tracking-[-0.01em] [text-indent:-0.42em]`}>
                      {`“${L(r.quote)}”`}
                    </p>
                  </blockquote>
                  <figcaption className="mt-6 text-[0.9375rem]">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-[#B4C4B9]"> · {L(r.treatment)}</span>
                  </figcaption>
                </figure>
              </Drift>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- hours + book */}
      <section id="book" aria-labelledby="book-title" style={SCROLL_MARGIN} className={`${WRAP} pb-16`}>
        {/*
          Phones: photo, then the booking copy and hours, then "Find us".
          Desktop: the photo half and "Find us" on the left, the booking copy
          and hours on the right (spanning both rows).
        */}
        <div className="relative isolate grid overflow-hidden rounded-[40px] bg-[#26352D] sm:rounded-[48px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr]">
          {/* The treatment room. Its own wipe is the card's only entrance. */}
          <RevealImage
            image={c.visit.image}
            alt={c.visit.image.alt[locale]}
            sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, 100vw"
            fill
            from="bottom"
            parallax={6}
            className="aspect-[4/3] w-full sm:aspect-[16/10] lg:col-start-1 lg:row-start-1 lg:aspect-square"
            imgClassName="object-[50%_55%]"
          />
          <div className="px-6 pb-4 pt-12 sm:px-12 sm:pt-16 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:px-14 lg:py-20">
            <p className={`${KICKER} text-[#9CC5A6]`}>{L(c.visit.kicker)}</p>
            <h2 id="book-title" className={`${SOFT} mt-4 max-w-[14ch] text-[clamp(2.5rem,4.6vw,4.25rem)] font-light leading-[1.02] tracking-[-0.015em]`}>
              {L(c.visit.title)}
            </h2>
            <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[#E8EFE9]/90">{L(c.visit.body)}</p>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <PrimaryBook label={L(c.visit.cta)} className="h-14 px-8 text-[1rem]" />
              <p className="text-[0.9375rem] text-[#B4C4B9]">
                {L(c.visit.call)} <span className="whitespace-nowrap font-semibold text-[#E8EFE9]">{c.phone}</span>
              </p>
            </div>
            <p className="mt-6 text-[0.9375rem] text-[#B4C4B9]">{L(c.visit.policy)}</p>
            <h3 className={`${KICKER} mt-12 text-[#9CC5A6]`}>{L(c.visit.hoursLabel)}</h3>
            <dl className="mt-4 max-w-[520px] border-t border-[#E8EFE9]/15">
              {c.hours.map((h) => (
                <div key={h.days.en} className="flex items-baseline justify-between gap-6 border-b border-[#E8EFE9]/15 py-4">
                  <dt>{L(h.days)}</dt>
                  <dd className={`${SOFT} whitespace-nowrap text-[1.125rem] tabular-nums`}>{L(h.time)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.9375rem] text-[#B4C4B9]">{L(c.visit.closed)}</p>
          </div>
          <div className="px-6 pb-14 pt-10 sm:px-12 sm:pb-16 lg:col-start-1 lg:row-start-2 lg:px-14 lg:pb-20 lg:pt-12">
            <h3 className={`${KICKER} text-[#9CC5A6]`}>{L(c.visit.findUs)}</h3>
            <p className={`${SOFT} mt-4 text-[1.625rem] font-light leading-tight`}>{c.address}</p>
            <p className="mt-2 max-w-[40ch] text-[0.9375rem] leading-relaxed text-[#B4C4B9]">{L(c.visit.directions)}</p>
          </div>
        </div>
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
        <div className="mt-14 w-full space-y-2 border-t border-[#E8EFE9]/10 pt-6 text-[0.8125rem] text-[#B4C4B9]">
          <PhotoCredit
            names={c.photoCredits}
            linkClassName={`rounded underline decoration-[#B4C4B9]/50 underline-offset-4 hover:text-[#E8EFE9] ${FOCUS}`}
          />
          <p>
            <DemoCredit className={`rounded underline decoration-[#B4C4B9]/50 underline-offset-4 hover:text-[#E8EFE9] ${FOCUS}`}>
              {L(c.footer.credit)}
            </DemoCredit>
          </p>
        </div>
      </footer>
    </div>
  );
}
