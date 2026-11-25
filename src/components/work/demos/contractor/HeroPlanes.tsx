"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Parallax, RevealImage, useMediaQuery } from "@/components/work/motion";
import { useDemoStill } from "@/components/work/useDemoStill";
import type { DemoImage } from "@/data/demos";
import { GRID_DARK } from "./parts";

/*
 * Depth for sheet A-101 without touching the signature (BlueprintHero):
 *
 *   back   the drafting grid, a plane that lags the page (Parallax -64px),
 *          so the sheet seems to lift off the table as you scroll;
 *   middle the sheet itself, at page speed (text, BlueprintHero, title block);
 *   front  a small detail photo pinned on the column line, running ahead of
 *          the page (it rises 0.14 px per px scrolled, from exactly where it
 *          was laid out: the hero is the top of the page, so page scrollY is
 *          its progress and nothing is offset at load).
 *
 * The detail card exists only on wide screens (>= 1280px), where the corner it
 * sits in is free; it is never in the DOM elsewhere, so no lazy image waits in
 * a hidden branch. Its hairline frame is there from the first paint (drawn,
 * like the elevation); the photo wipes up into it once the hero photo has
 * landed (2.2 s). Still: the grid and the card sit at rest, photo shown.
 * Neither plane takes pointer events.
 */

export function HeroGrid() {
  return (
    <Parallax
      className="pointer-events-none absolute inset-0"
      innerClassName="absolute inset-x-0 -bottom-24 -top-24"
      distance={-64}
    >
      <div aria-hidden="true" className="h-full w-full" style={GRID_DARK} />
    </Parallax>
  );
}

/** In-flow at the foot of the hero's text column; its own negative margin carries it across the column line. */
export function HeroDetail({ image, alt, className = "" }: { image: DemoImage; alt: string; className?: string }) {
  const wide = useMediaQuery("(min-width: 1280px)");
  const still = useDemoStill();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -140], { clamp: true });
  if (!wide) return null;

  const card = (
    <>
      <RevealImage
        image={image}
        alt={alt}
        fill
        from="bottom"
        parallax={0}
        zoom={1.3}
        delay={2.2}
        sizes="100px"
        className="aspect-[4/5] w-full outline outline-1 outline-offset-[5px] outline-[#FF7A1A]"
      />
      <span aria-hidden="true" className="absolute -left-[9px] -top-[9px] h-[7px] w-[7px] bg-[#FF7A1A]" />
    </>
  );
  const cls = `pointer-events-none relative z-10 w-[100px] shrink-0 ${className}`;
  return still ? (
    <div className={cls}>{card}</div>
  ) : (
    <motion.div className={`${cls} will-change-transform`} style={{ y }}>
      {card}
    </motion.div>
  );
}
