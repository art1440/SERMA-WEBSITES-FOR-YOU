"use client";

import type { DemoImage } from "@/data/demos";
import type { L10n } from "@/i18n/types";
import { ScrollMarquee } from "@/components/work/motion";
import { DISPLAY } from "./ui";

/**
 * The craft strip: a row of detail photos that slides one way while the page
 * scrolls, and a row of display type that counter-runs beneath it, leaning
 * with scroll speed. Neither moves on its own (no autoplay, no pause control
 * needed); each wrapper clips its own sideways travel.
 */
export function CraftStrip({
  title,
  items,
  words,
  L,
}: {
  title: L10n;
  items: { image: DemoImage; caption: L10n }[];
  words: L10n[];
  L: (v: L10n) => string;
}) {
  return (
    <section aria-labelledby="craft-title" className="border-t border-[#EFE6D6]/10 py-20 md:py-28">
      <h2 id="craft-title" className="sr-only">
        {L(title)}
      </h2>
      <ScrollMarquee distance={28} rowClassName="gap-4 sm:gap-6">
        {items.map((it) => (
          <figure key={it.image.src} className="group shrink-0">
            <div
              className="relative h-[260px] overflow-hidden bg-[#1A1917] sm:h-[340px] lg:h-[420px]"
              style={{ aspectRatio: `${it.image.width} / ${it.image.height}` }}
            >
              <img
                src={it.image.src}
                srcSet={`${it.image.small} 640w, ${it.image.src} ${it.image.width}w`}
                sizes="(min-width: 1024px) 420px, (min-width: 640px) 340px, 260px"
                width={it.image.width}
                height={it.image.height}
                alt={L(it.image.alt)}
                loading="lazy"
                decoding="async"
                className="demo-zoom absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#A8A091]">{L(it.caption)}</figcaption>
          </figure>
        ))}
      </ScrollMarquee>
      <ScrollMarquee distance={22} direction={-1} skew className="mt-12 md:mt-16" rowClassName="gap-8 md:gap-12">
        {words.map((w) => (
          <span key={w.en} className="flex shrink-0 items-center gap-8 md:gap-12">
            <span className={`${DISPLAY} whitespace-nowrap text-[clamp(3rem,9vw,8.5rem)] uppercase leading-[1.05] tracking-[-0.01em]`}>{L(w)}</span>
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rotate-45 bg-[#C9A45C] md:h-4 md:w-4" />
          </span>
        ))}
      </ScrollMarquee>
    </section>
  );
}
