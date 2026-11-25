"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Parallax, RevealImage, RollText, useIsDesktop, waveDelay } from "@/components/work/motion";
import { restaurant as c } from "@/data/demos/restaurant";
import type { L10n } from "@/i18n/types";
import { BookButton } from "../../DemoShell";
import { BTN_LINE, Rise, SCROLL_MARGIN, SMALL_CAPS, WRAP } from "./ui";

/**
 * Private dining: a collage of three prints beside the copy.
 *   room   the dining room (1024:688), 84% of the collage width, top left
 *   table  the long table (4:5), 40% wide, bottom right, over the room's corner
 *   wine   a glass by candlelight (4:5), 26% wide, bottom left, over the room's edge
 * Each print wipes open from its own side (left / bottom / right) in one wave,
 * and each sits on its own Parallax plane (room slowest, wine fastest), so the
 * three separate in depth while the section crosses the screen. All sizes are
 * percentages of the collage, so the same composition holds on phones, with
 * shorter travel there. An ember outline keeps overlapping prints apart.
 */
export function Room() {
  const { locale } = useLanguage();
  const L = (v: L10n) => v[locale];
  const desktop = useIsDesktop();
  const k = desktop ? 1 : 0.5;
  const prints = [c.room.image, c.room.table, c.room.wine];
  const delay = (i: number) => waveDelay(i, prints.length, 0.3);

  return (
    <section id="room" aria-labelledby="room-title" style={SCROLL_MARGIN} className="py-20 md:py-28 lg:py-32">
      <div className={`${WRAP} grid gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16 xl:gap-20`}>
        {/* Room photo in flow; the extra bottom space (24% of the width) holds the two prints below it. */}
        <div className="relative pb-[24%]">
          <Parallax distance={24 * k} className="w-[84%]">
            <RevealImage
              image={c.room.image}
              alt={L(c.room.image.alt)}
              from="left"
              parallax={5}
              delay={delay(0)}
              sizes="(min-width: 1280px) 620px, (min-width: 1024px) 48vw, 84vw"
            />
          </Parallax>
          <Parallax distance={70 * k} className="absolute bottom-0 right-0 w-[40%]" innerClassName="outline outline-[6px] outline-[#2A0F0C] sm:outline-[8px]">
            <RevealImage
              image={c.room.table}
              alt={L(c.room.table.alt)}
              from="bottom"
              parallax={4}
              delay={delay(1)}
              sizes="(min-width: 1280px) 296px, (min-width: 1024px) 23vw, 40vw"
            />
          </Parallax>
          <Parallax distance={110 * k} className="absolute bottom-[4%] left-[8%] w-[26%]" innerClassName="outline outline-[6px] outline-[#2A0F0C] sm:outline-[8px]">
            <RevealImage
              image={c.room.wine}
              alt={L(c.room.wine.alt)}
              from="right"
              parallax={0}
              delay={delay(2)}
              sizes="(min-width: 1280px) 192px, (min-width: 1024px) 15vw, 26vw"
            />
          </Parallax>
        </div>

        <Rise>
          <p className={`${SMALL_CAPS} text-[#E0902F]`}>{L(c.room.kicker)}</p>
          <h2 id="room-title" className="demo-display mt-4 max-w-[16ch] text-[clamp(2.25rem,4.2vw,3.5rem)] leading-[1.05] tracking-[-0.015em]">
            {L(c.room.title)}
          </h2>
          <p className="mt-6 max-w-[46ch] leading-relaxed text-[#F7E4CF]/90 md:text-[1.0625rem]">{L(c.room.body)}</p>
          <dl className="mt-8 max-w-[34rem] border-t border-[#F7E4CF]/15">
            {c.room.facts.map((f) => (
              <div key={f.label.en} className="flex items-baseline justify-between gap-6 border-b border-[#F7E4CF]/15 py-3.5">
                <dt className="text-[0.9375rem] text-[#D4B49A]">{L(f.label)}</dt>
                <dd className="text-right font-medium">{L(f.value)}</dd>
              </div>
            ))}
          </dl>
          <BookButton className={`${BTN_LINE} mt-9 h-12 px-6 text-[0.9375rem]`}>
            <RollText>{L(c.room.cta)}</RollText>
          </BookButton>
        </Rise>
      </div>
    </section>
  );
}
