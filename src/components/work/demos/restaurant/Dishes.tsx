"use client";

import { useLanguage } from "@/context/LanguageContext";
import { ScrollMarquee } from "@/components/work/motion";
import { restaurant as c } from "@/data/demos/restaurant";
import type { DemoImage } from "@/data/demos";

/**
 * The interlude after the fire: two rows of plates that slide against each
 * other while the page scrolls (never on their own), then a row of dish names
 * that leans with scroll speed. Each ScrollMarquee clips itself, so the page
 * never scrolls sideways. Photos are portrait prints (4:5) mixed with the two
 * square menu photos; every row is one height, so widths follow the aspect.
 * Hover (fine pointers): the photo eases in inside its frame (demo-zoom).
 * Photos are lazy; ScrollMarquee switches them to eager as the row nears the
 * screen, so the clipped repeats load too (they share the same nine URLs).
 */

// Row height: 220px on phones, 26vw in between, 360px from ~1385px.
const ROW_H = "h-[clamp(220px,26vw,360px)]";
const SIZES = "(min-width: 1385px) 360px, (min-width: 846px) 26vw, 220px";

function Plate({ image, alt }: { image: DemoImage; alt: string }) {
  return (
    <figure
      className={`group relative shrink-0 overflow-hidden bg-[#1E0907] ${ROW_H}`}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <img
        src={image.src}
        srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
        sizes={SIZES}
        width={image.width}
        height={image.height}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="demo-zoom absolute inset-0 h-full w-full object-cover"
      />
    </figure>
  );
}

export function Dishes() {
  const { locale } = useLanguage();
  // Row A leads with the ribeye, row B with the carrots; the two menu photos are woven into row A.
  const rowA: DemoImage[] = [c.menu.steak, c.dishes.rowA[0], c.menu.flatbread, c.dishes.rowA[1], c.dishes.rowA[2]];
  const rowB: DemoImage[] = c.dishes.rowB;
  const names = c.dishes.names;

  return (
    <section aria-labelledby="dishes-title" className="pb-20 pt-4 md:pb-28 md:pt-8">
      <h2 id="dishes-title" className="sr-only">
        {c.dishes.title[locale]}
      </h2>
      <ScrollMarquee distance={28} direction={1} rowClassName="gap-3 sm:gap-5">
        {rowA.map((img) => (
          <Plate key={img.src} image={img} alt={img.alt[locale]} />
        ))}
      </ScrollMarquee>
      <ScrollMarquee distance={28} direction={-1} className="mt-3 sm:mt-5" rowClassName="gap-3 sm:gap-5">
        {rowB.map((img) => (
          <Plate key={img.src} image={img} alt={img.alt[locale]} />
        ))}
      </ScrollMarquee>
      {/* Type row: the names lean with scroll speed. A comma between names for screen readers. */}
      <ScrollMarquee distance={18} direction={1} skew className="mt-12 py-2 md:mt-16" rowClassName="gap-7 sm:gap-10">
        {names.map((n, i) => (
          // `relative`: contains the sr-only comma (position: absolute), which would otherwise escape the
          // marquee's clip when still (no transform there) and widen the page.
          <span key={n.en} className="relative flex shrink-0 items-center gap-7 sm:gap-10">
            <span className={`demo-display whitespace-nowrap text-[clamp(2.25rem,6vw,5.25rem)] leading-[1.1] ${i % 2 ? "text-[#D4B49A]" : "text-[#F7E4CF]"}`}>
              {n[locale]}
            </span>
            <span className="sr-only">,</span>
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rotate-45 bg-[#E0902F] sm:h-2.5 sm:w-2.5" />
          </span>
        ))}
      </ScrollMarquee>
    </section>
  );
}
