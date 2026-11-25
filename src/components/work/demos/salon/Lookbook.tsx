"use client";

import type { SalonLook } from "@/data/demos/salon";
import type { L10n } from "@/i18n/types";
import { Parallax, RevealImage, useMediaQuery } from "@/components/work/motion";

/**
 * The page's peak: a magazine collage of hair portraits in columns that
 * travel at different depths while the section crosses the screen. The outer
 * columns rise (Parallax, positive distance), the middle one sinks (negative),
 * so the grid shears past itself; each portrait wipes open from a different
 * edge (RevealImage). One entrance per figure; captions never animate.
 *
 *   >= 768px  three columns of three, middle column set lower to start
 *   phones    two columns, a gentler shear
 * Still (reduced motion / Pause): every Parallax and RevealImage renders at rest.
 * Looks are listed in reading order, column by column.
 */

type Dir = "left" | "right" | "bottom" | "top" | "center";

// Wipe edge per slot: alternates across and down the grid.
const FROM_WIDE: Dir[][] = [
  ["left", "bottom", "left"],
  ["top", "right", "bottom"],
  ["right", "left", "right"],
];
const FROM_PHONE: Dir[][] = [
  ["left", "bottom", "left", "top", "left"],
  ["right", "top", "right", "bottom", "right"],
];
// One arched frame per column, on a diagonal (the studio's mirrors).
const ARCHED_WIDE = [0, 1, 2];

export function Lookbook({ looks, L }: { looks: SalonLook[]; L: (v: L10n) => string }) {
  const wide = useMediaQuery("(min-width: 768px)");
  const columns = wide ? [looks.slice(0, 3), looks.slice(3, 6), looks.slice(6, 9)] : [looks.filter((_, i) => i % 2 === 0), looks.filter((_, i) => i % 2 === 1)];
  const distance = wide ? [150, -150, 150] : [44, -44];

  return (
    // Wide: the sinking middle column is narrower, so it reads as the far plane.
    <div className={`grid gap-x-4 sm:gap-x-6 ${wide ? "grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-x-12" : "grid-cols-2"}`}>
      {columns.map((col, ci) => (
        <Parallax
          key={`${wide ? "w" : "p"}-${ci}`}
          distance={distance[ci]}
          // The sinking column starts lower and the shear never covers the heading.
          className={ci === 1 ? (wide ? "pt-44" : "pt-20") : wide ? "pt-12" : ""}
          innerClassName="flex flex-col gap-12 md:gap-16 lg:gap-24"
        >
          {col.map((look, k) => {
            const arched = wide ? ARCHED_WIDE[ci] === k : k === ci;
            const from = (wide ? FROM_WIDE : FROM_PHONE)[ci][k] ?? "bottom";
            return (
              <figure key={look.image.src} className="group">
                <RevealImage
                  image={look.image}
                  alt={L(look.image.alt)}
                  sizes="(min-width: 1440px) 440px, (min-width: 768px) 32vw, 46vw"
                  from={from}
                  parallax={5}
                  className={`bg-[#E9D3D6] ${arched ? "rounded-t-[999px]" : "rounded-[3px]"}`}
                  imgClassName="demo-zoom"
                />
                <figcaption className="mt-3 sm:mt-4">
                  <p className="demo-display text-[1.1875rem] italic leading-tight text-[#3B1F2B] sm:text-[1.5rem]">{L(look.shade)}</p>
                  <p className="mt-1 text-[0.75rem] leading-snug text-[#6E4E5A] sm:text-[0.8125rem]">
                    {L(look.technique)}
                    <span aria-hidden="true" className="px-1.5">
                      ·
                    </span>
                    {look.by}
                  </p>
                </figcaption>
              </figure>
            );
          })}
        </Parallax>
      ))}
    </div>
  );
}
