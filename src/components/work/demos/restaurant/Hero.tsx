"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { HeroBackdrop, Magnetic, RollText } from "@/components/work/motion";
import { restaurant as c } from "@/data/demos/restaurant";
import type { L10n } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";
import { BookButton } from "../../DemoShell";
import { useDemoStill } from "../../useDemoStill";
import { BTN_LINE, BTN_SOLID, NAV_H, Rise, SMALL_CAPS, WRAP } from "./ui";

/**
 * The hero: one wide photo of the open fire at the kitchen counter, late, with
 * the headline set over it. HeroBackdrop owns the photo (load settle + a slow
 * drift while the hero leaves); the type sits in normal flow on top. Nothing
 * else floats over the picture.
 *
 * Composition (the 3200 px source is 16:9; the flames sit right of centre, at
 * 47-63% across and 50-82% down; a server stands at the far right):
 *   >= 1024  the hero fills the first screen (capped at 960 px); type
 *            bottom-left, the fire beside it on the right. The plane is a touch
 *            narrower than the photo, so the photo is pinned to its left edge,
 *            which keeps the fire clear of the headline. Scrims: hearth from the
 *            left (>= 80% under the type column, gone by 60% across), ember up
 *            from the bottom edge so the hero melts into the menu.
 *   <  1024  the photo still fills the whole hero, behind the type, but a
 *            portrait frame crops it to a narrow strip, cover-scaled by height,
 *            so the fire always sits 50-82% down the hero. The type therefore
 *            runs from the top, over the dark ceiling and the copper hood, and
 *            the content's bottom padding (28rem phones, 34rem tablets) makes the
 *            hero about twice the type's height, so the flames start just under
 *            the walk-in line (in the moving plane, 12% taller, a little lower).
 *            The hero is taller than the screen there; the fire arrives as you
 *            scroll. object-position 57-58% centres the fire in the strip.
 *            Scrims: hearth down from the top behind the type (78% easing to 58%,
 *            gone by 60% down, so the hood reads through), ember up from the
 *            bottom edge.
 * Contrast is checked against the real pixels (herocontrast.cjs, EN + ES at
 * 1280 / 1440 / 390). Motion: the headline lines rise on load (transform only,
 * opaque from the first paint); kicker, intro and walk-in line fade up. Still:
 * everything at rest.
 */

const SCRIMS = [
  // Desktop: hearth from the left, under the type column.
  "lg:bg-[linear-gradient(to_right,rgba(30,9,7,0.9)_0%,rgba(30,9,7,0.8)_30%,rgba(30,9,7,0.42)_46%,rgba(30,9,7,0)_60%)]",
  // Phones and tablets: hearth down from the top, behind the type.
  "max-lg:bg-[linear-gradient(to_bottom,rgba(30,9,7,0.78)_0%,rgba(30,9,7,0.7)_30%,rgba(30,9,7,0.58)_46%,rgba(30,9,7,0)_60%)]",
  // Every size: ember up from the bottom edge, into the menu section (drawn last, so the seam is exactly ember).
  "bg-[linear-gradient(to_top,#2A0F0C_0%,rgba(42,15,12,0.5)_8%,rgba(42,15,12,0)_22%)]",
];

function HeroHeadline({ lines, es, still }: { lines: string[]; es: boolean; still: boolean }) {
  // The Spanish lines are half as long again, so they run a size smaller.
  const size = es
    ? "text-[clamp(2.25rem,9.6vw,3.5rem)] sm:text-[clamp(3.75rem,8.6vw,5.5rem)] lg:text-[clamp(4rem,5.1vw,6rem)]"
    : "text-[clamp(3.25rem,14.6vw,4.5rem)] sm:text-[clamp(4.5rem,11.5vw,6.75rem)] lg:text-[clamp(4.75rem,6.5vw,7.25rem)]";
  return (
    <h1 className={`demo-display mt-4 leading-[0.96] tracking-[-0.025em] text-[#F7E4CF] sm:mt-5 ${size}`}>
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
  const still = useDemoStill();
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];
  const es = locale === "es";
  const fill = `calc(100svh - var(--demo-ribbon) - ${NAV_H}px)`;

  return (
    <section
      aria-label={L(c.hero.kicker)}
      className="relative isolate flex min-h-[var(--hero-fill)] flex-col overflow-hidden lg:min-h-[min(var(--hero-fill),960px)] lg:justify-end"
      style={{ "--hero-fill": fill } as CSSProperties}
    >
      <HeroBackdrop
        image={c.hero.image}
        alt={L(c.hero.image.alt)}
        position="58% 50%"
        mobilePosition="57% 50%"
        imgClassName="lg:[object-position:0%_50%]"
        scrims={SCRIMS}
      />

      <div className={`${WRAP} w-full pb-[28rem] pt-8 sm:pb-[34rem] sm:pt-14 lg:pb-16 lg:pt-28 xl:pb-20`}>
        <Rise onLoad delay={0.15}>
          <p className={`${SMALL_CAPS} text-[#E0902F] max-sm:tracking-[0.18em]`}>{L(c.hero.kicker)}</p>
        </Rise>
        <HeroHeadline lines={c.hero.headline.map(L)} es={es} still={still} />
        <Rise onLoad delay={0.35}>
          <p className="mt-5 max-w-[40ch] text-[1rem] leading-relaxed text-[#F7E4CF]/90 sm:mt-7 sm:text-[1.0625rem] lg:max-w-[38ch] lg:text-[1.125rem]">
            {L(c.hero.intro)}
          </p>
        </Rise>
        <Rise onLoad yOnly delay={0.45}>
          <div className="mt-6 flex flex-wrap gap-3 sm:mt-9 sm:gap-4">
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
          <p className="mt-5 flex items-center gap-3 text-[0.875rem] text-[#D4B49A] sm:mt-7">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E0902F]" />
            {L(c.hero.tonight)}
          </p>
        </Rise>
      </div>
    </section>
  );
}
