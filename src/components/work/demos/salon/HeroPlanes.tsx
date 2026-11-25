"use client";

import { motion } from "framer-motion";
import type { DemoImage } from "@/data/demos";
import { EASE_EDITORIAL } from "@/lib/motion";
import { Parallax, useIsDesktop } from "@/components/work/motion";
import { useDemoStill } from "../../useDemoStill";
import { ACCENT_T } from "./ui";

/**
 * The hero's three depth planes, all transform-only (Parallax), all at rest
 * when still:
 *   mid         the arched photo (the studio's mirrors), the LCP image
 *   fast        a smaller detail photo overlapping the arch's lower-left corner
 *   foreground  a hairline outline arch in the live accent, offset up-right; it
 *               travels fastest but sits under the detail so it never slices it
 * The detail and outline planes travel further on desktop; they are keyed by
 * breakpoint so the new distance takes effect after the first client render.
 */

// The arch's shape at each breakpoint, shared by the photo frame and its outline.
const ARCH = "rounded-t-[999px] sm:rounded-t-[14rem] lg:rounded-t-[999px]";

/** Hero photo in an arched frame; settles from a slight zoom on load. */
function HeroArch({ image, alt }: { image: DemoImage; alt: string }) {
  const still = useDemoStill();
  // The source is 1024px wide. The frame is capped at 560px wide; at its
  // 560/680 lg ratio the photo is drawn ~1012px wide, so it is never upscaled at 1x.
  return (
    // Phones: a short arch (34svh) so the eyebrow, headline and CTA share the first screen.
    // 640-1023px: 3:2, wider than the photo's 1.49, so it is drawn at most ~1000px wide.
    <div className={`relative h-[34svh] min-h-[220px] w-full overflow-hidden bg-[#E9D3D6] sm:aspect-[3/2] sm:h-auto sm:min-h-0 lg:aspect-[560/680] ${ARCH}`}>
      <motion.img
        src={image.src}
        srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
        sizes="(min-width: 1024px) 1024px, (min-width: 640px) 100vw, 640px"
        width={image.width}
        height={image.height}
        alt={alt}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-[80%_50%]"
        initial={still ? false : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: EASE_EDITORIAL }}
      />
    </div>
  );
}

export function HeroPlanes({ image, alt, detail, detailAlt }: { image: DemoImage; alt: string; detail: DemoImage; detailAlt: string }) {
  const desktop = useIsDesktop();
  const bp = desktop ? "d" : "m";
  return (
    <div className="relative">
      <Parallax distance={28}>
        <HeroArch image={image} alt={alt} />
      </Parallax>

      {/* Fast plane: the detail. Lower-left corner of the arch, over the gutter on desktop. */}
      <Parallax
        key={`detail-${bp}`}
        distance={desktop ? 110 : 36}
        className="absolute bottom-[12%] right-[3%] z-10 w-[27%] max-w-[150px] sm:bottom-[6%] sm:right-auto sm:left-[-4%] sm:w-[26%] sm:max-w-none lg:bottom-[9%] lg:left-[-15%] lg:w-[38%]"
      >
        <div className="aspect-[4/5] overflow-hidden rounded-t-[999px] border-[5px] border-[#F6E9EA] bg-[#E9D3D6] shadow-[0_24px_50px_-28px_rgba(59,31,43,0.55)] lg:border-[7px]">
          <img
            src={detail.small}
            srcSet={`${detail.small} 640w, ${detail.src} ${detail.width}w`}
            sizes="(min-width: 1024px) 240px, 30vw"
            width={detail.width}
            height={detail.height}
            alt={detailAlt}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      </Parallax>

      {/* Foreground: a hairline arch in the live accent, drifting fastest. Decorative. */}
      <Parallax
        key={`outline-${bp}`}
        distance={desktop ? 170 : 56}
        className="pointer-events-none absolute inset-0 z-[5]"
        innerClassName="h-full w-full"
      >
        <span
          aria-hidden="true"
          className={`absolute inset-0 translate-x-2 -translate-y-2 border border-b-0 border-[var(--salon-accent)] lg:translate-x-5 lg:-translate-y-5 ${ARCH} ${ACCENT_T}`}
        />
      </Parallax>
    </div>
  );
}
