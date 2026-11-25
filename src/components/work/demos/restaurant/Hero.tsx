"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Magnetic, RollText, useIsDesktop } from "@/components/work/motion";
import { restaurant as c } from "@/data/demos/restaurant";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";
import { BookButton } from "../../DemoShell";
import { useDemoStill } from "../../useDemoStill";
import { BTN_LINE, BTN_SOLID, Rise, SMALL_CAPS, WRAP } from "./ui";

/**
 * The hero, in three planes that separate as the page scrolls away:
 *   back        the photo, inside its fixed frame: it eases back from a slight
 *               zoom on load ("the room comes into focus"), then drifts down and
 *               leans in while the hero leaves (slower than the page)
 *   type        the kicker, h1, intro and CTAs: on desktop they rise a little
 *               faster than the page; on phones/tablets they ride at page speed,
 *               because there the h1 overlaps the photo's bottom fade and must
 *               stay on it
 *   foreground  a small print of oak embers over the photo: the fastest plane
 * The scrims belong to the fixed frame, never to the moving photo, so the
 * headline always sits on the same amount of ember. Transform / opacity only.
 * Still: every plane at rest, no load zoom, no veil.
 */

const GLOW = "radial-gradient(50% 60% at 50% 25%, rgba(224,144,47,0.32), rgba(224,144,47,0) 70%)";

/**
 * The hero photo. Frame sizes (the photo is a 1024px source):
 *   < 640     full width, square box
 *   640-1023  full width, 16:10 box
 *   >= 1024   right-hand panel, min(62vw, 1024px) wide and <= 688px tall
 * The moving plane is 12% taller than the frame (6% bleed top and bottom), so
 * the drift (<= 5.6% of the frame) never shows an edge; at most it draws the
 * photo ~10% wider than its source on large desktops, which the dark, grainy
 * plate hides.
 * Scrims (on the frame): phones/tablets fade the bottom into ember (the
 * headline overlaps the last ~20%, where the scrim is >= 85% ember); desktop
 * fades the left edge over a fixed 560px, so the headline's overlap (<= ~230px)
 * sits on >= 80% ember and the intro on >= 90%. Worst case (a white pixel under
 * 80% ember): cream 6.5:1, ochre 3.9:1 on the large-text h1.
 * Motion on load: a dark veil lifts off the photo and a soft ochre glow over the
 * oven flares once and settles (done by ~4.3 s; nothing loops).
 */
function HeroPhoto({ y, scale, still }: { y: MotionValue<string>; scale: MotionValue<number>; still: boolean }) {
  const { locale } = useLanguage();
  const img = c.hero.image;
  const photo = (
    <img
      src={img.src}
      srcSet={`${img.small} 640w, ${img.src} ${img.width}w`}
      sizes="(min-width: 1024px) 1024px, (min-width: 640px) 100vw, 150vw"
      width={img.width}
      height={img.height}
      alt={img.alt[locale]}
      fetchPriority="high"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover object-[60%_50%]"
    />
  );
  return (
    <div className="relative aspect-square w-full overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:h-full lg:w-[min(62vw,1024px)]">
      {still ? (
        <>
          {photo}
          <div aria-hidden="true" className="absolute inset-x-[20%] top-0 h-[55%] opacity-70" style={{ background: GLOW }} />
        </>
      ) : (
        <>
          <motion.div className="absolute inset-x-0 -bottom-[6%] -top-[6%] will-change-transform" style={{ y, scale }}>
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.4, ease: EASE_EDITORIAL }}
            >
              {photo}
            </motion.div>
          </motion.div>
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
            style={{ background: GLOW }}
            initial={{ opacity: 0.35 }}
            // One flare as the lights come up, then it settles to a static glow (done by ~4.3 s; no loop).
            animate={{ opacity: [0.35, 1, 0.7] }}
            transition={{ duration: 4, times: [0, 0.4, 1], ease: "easeInOut", delay: 0.3 }}
          />
        </>
      )}
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

function HeroHeadline({ lines, es, still }: { lines: string[]; es: boolean; still: boolean }) {
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

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const still = useDemoStill();
  const desktop = useIsDesktop();
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];
  const es = locale === "es";

  // 0 while the hero fills the top of the page, 1 once it has scrolled away.
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(p, [0, 1], ["0%", "5%"]);
  const photoScale = useTransform(p, [0, 1], [1, 1.06]);
  const typeY = useTransform(p, [0, 1], [0, desktop ? -110 : 0]);
  const printY = useTransform(p, [0, 1], [0, desktop ? -240 : -90]);
  const printRotate = useTransform(p, [0, 1], [4, -3]);
  const embers = c.hero.embers;

  return (
    <section
      ref={ref}
      aria-label={L(c.hero.kicker)}
      className="relative isolate lg:flex lg:h-[min(calc(100svh-var(--demo-ribbon)-64px),688px)] lg:min-h-[600px] lg:items-end"
    >
      <HeroPhoto y={photoY} scale={photoScale} still={still} />

      <motion.div
        className={`${WRAP} relative z-10 -mt-[4.5rem] w-full pb-14 sm:-mt-28 sm:pb-16 lg:mt-0 lg:pb-16`}
        style={still ? undefined : { y: typeY }}
      >
        <Rise onLoad delay={0.15}>
          <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.hero.kicker)}</p>
        </Rise>
        <HeroHeadline lines={c.hero.headline.map(L)} es={es} still={still} />
        <Rise onLoad delay={0.35} className="lg:max-w-[min(34rem,36vw)]">
          <p className="mt-5 max-w-[40ch] text-[1rem] leading-relaxed text-[#F7E4CF]/90 sm:mt-6 sm:text-[1.0625rem]">{L(c.hero.intro)}</p>
        </Rise>
        <Rise onLoad yOnly delay={0.45}>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
            <Magnetic className="flex-1 sm:flex-none">
              <BookButton className={`${BTN_SOLID} h-[3.25rem] w-full px-6 text-[0.9375rem] sm:h-14 sm:px-8 sm:text-[1rem]`}>
                <RollText>{L(c.hero.reserve)}</RollText>
              </BookButton>
            </Magnetic>
            <BookButton className={`${BTN_LINE} h-[3.25rem] flex-1 px-6 text-[0.9375rem] sm:h-14 sm:flex-none sm:px-8 sm:text-[1rem]`}>
              <RollText>{L(c.hero.pickup)}</RollText>
            </BookButton>
          </div>
        </Rise>
        <Rise onLoad delay={0.55}>
          <p className="mt-6 flex items-center gap-3 text-[0.875rem] text-[#D4B49A]">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#E0902F] shadow-[0_0_10px_2px_rgba(224,144,47,0.6)]" />
            {L(c.hero.tonight)}
          </p>
        </Rise>
      </motion.div>

      {/* Foreground plane: a print of the embers, laid over the photo's upper right corner.
          Decoration fades in (no text); it never takes the pointer. */}
      <motion.div
        className={`pointer-events-none absolute right-4 top-4 z-20 w-[26vw] max-w-[132px] sm:right-8 sm:top-8 sm:w-[17vw] sm:max-w-[170px] lg:right-[clamp(2rem,4.5vw,4.5rem)] lg:top-[9%] lg:w-[clamp(140px,12vw,196px)] lg:max-w-none ${still ? "rotate-[4deg]" : ""}`}
        style={still ? undefined : { y: printY, rotate: printRotate }}
      >
        <motion.div
          className="bg-[#F7E4CF] p-1.5 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.85)] sm:p-2"
          {...(still
            ? {}
            : {
                initial: { opacity: 0, scale: 1.04 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 1.2, ease: EASE_EDITORIAL, delay: 0.7 },
              })}
        >
          <img
            src={embers.src}
            srcSet={`${embers.small} 640w, ${embers.src} ${embers.width}w`}
            sizes="(min-width: 1024px) 196px, (min-width: 640px) 170px, 132px"
            width={embers.width}
            height={embers.height}
            alt={L(embers.alt)}
            loading="lazy"
            decoding="async"
            className="block aspect-[4/5] h-auto w-full object-cover"
          />
        </motion.div>
      </motion.div>

      {/* Desktop: a cream order ticket pinned to the photo's lower right, naming the dish in it.
          After the text in the DOM, so the h1 is read first; positioned against the section. */}
      <p className="absolute bottom-10 right-10 z-10 hidden -rotate-2 bg-[#F7E4CF] px-5 py-4 text-[#2A0F0C] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] lg:block">
        <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-[#9A3B12]">{L(c.hero.special.label)}</span>
        <span className="mt-1.5 flex items-baseline gap-4">
          <span className="demo-display text-[1.25rem] leading-tight">{L(c.hero.special.name)}</span>
          <span className="demo-display text-[1.25rem] text-[#9A3B12]">
            <span className="sr-only">$</span>
            {c.hero.special.price}
          </span>
        </span>
      </p>
    </section>
  );
}
