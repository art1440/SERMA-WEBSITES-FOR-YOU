"use client";

import type { DemoImage } from "@/data/demos";
import { Parallax, RevealImage } from "@/components/work/motion";

/**
 * The photographic back plane of the razor-cut hero.
 *
 * Desktop (lg+): absolutely placed behind the right two-thirds of the hero,
 * feathered into the black on its left and bottom (CSS masks, static), with a
 * local scrim over its upper part only, where the headline crosses it. The
 * plate rides a slow Parallax plane (it lags the page) while the cut headline
 * splits on its own scroll curve and the brass cut line stays put in front:
 * three planes at three rates.
 *
 * Phones: an in-flow band between the headline and the intro, clipped on the
 * same -6deg slope as the razor cut, no scrim (no type sits on it).
 *
 * The small caption is a separate, faster foreground plane on a solid chip.
 */
export function HeroPlate({ image, alt, caption, className = "" }: { image: DemoImage; alt: string; caption: string; className?: string }) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <div className="absolute inset-0 overflow-hidden bg-[#141312] [clip-path:polygon(0_10%,100%_0,100%_90%,0_100%)] lg:bg-transparent lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_46%)] lg:[clip-path:none] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_46%)]">
        <div className="absolute inset-0 lg:[-webkit-mask-image:linear-gradient(to_top,transparent_0%,#000_34%)] lg:[mask-image:linear-gradient(to_top,transparent_0%,#000_34%)]">
          <Parallax distance={-70} className="absolute inset-x-0 -inset-y-20" innerClassName="h-full">
            <RevealImage
              image={image}
              alt={alt}
              sizes="(min-width: 1024px) 66vw, 100vw"
              priority
              fill
              from="left"
              parallax={0}
              delay={0.3}
              zoom={1.14}
              className="h-full w-full"
              imgClassName="object-[62%_58%]"
            />
          </Parallax>
          {/* Local scrims, desktop only: over the upper plate where the headline crosses it, and under the CTA row. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 hidden h-[86%] bg-gradient-to-b from-[#0E0E0E]/75 via-[#0E0E0E]/60 to-transparent lg:block" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 hidden h-[30%] bg-gradient-to-t from-[#0E0E0E]/90 via-[#0E0E0E]/60 to-transparent lg:block" />
        </div>
      </div>
      <Parallax distance={36} className="absolute bottom-[14%] left-4 sm:left-8 lg:bottom-auto lg:left-auto lg:right-3 lg:top-[30%]">
        <p className="bg-[#0E0E0E] px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[#EFE6D6] lg:[writing-mode:vertical-rl] lg:px-2 lg:py-3">
          <span aria-hidden="true" className="mr-2 inline-block h-1.5 w-1.5 rotate-45 bg-[#C9A45C] align-middle lg:mb-2 lg:mr-0" />
          {caption}
        </p>
      </Parallax>
    </div>
  );
}
