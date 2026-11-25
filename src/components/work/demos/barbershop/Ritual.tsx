"use client";

import type { RitualStep } from "@/data/demos/barbershop";
import type { L10n } from "@/i18n/types";
import { StickyStory, useIsDesktop, type StoryStep } from "@/components/work/motion";
import { useDemoStill } from "../../useDemoStill";
import { DISPLAY, STICKY_TOP } from "./ui";

/** Brass corner ticks for the square frame (decorative, inside the pinned frame). */
function Corners() {
  const tick = "absolute h-5 w-5 border-[#C9A45C]";
  return (
    <div aria-hidden="true" className="absolute inset-4 sm:inset-5">
      <span className={`${tick} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${tick} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${tick} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${tick} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  );
}

/**
 * "The ritual": four steps on a pinned, square-edged frame with a brass
 * progress rule (desktop); a plain stacked sequence on phones and in still
 * mode. On the pinned layout the active step's brass marker draws in
 * (transform only); text never dims.
 */
export function Ritual({ steps, L }: { steps: RitualStep[]; L: (v: L10n) => string }) {
  // Same fork as StickyStory: the marker only animates on the pinned (desktop, motion) layout.
  const desktop = useIsDesktop();
  const still = useDemoStill();
  const pinned = desktop && !still;
  const story: StoryStep[] = steps.map((s) => ({
    key: s.key,
    image: s.image,
    alt: L(s.image.alt),
    content: (
      <div className="max-w-[30rem]">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="relative h-[2px] w-12 bg-[#EFE6D6]/25">
            <span
              className={`absolute inset-0 origin-left bg-[#C9A45C] ${
                pinned ? "scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/step:scale-x-100" : ""
              }`}
            />
          </span>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#A8A091]">{L(s.tool)}</p>
        </div>
        <h3 className={`${DISPLAY} mt-5 text-[clamp(2rem,3.6vw,3.25rem)] uppercase leading-[0.95]`}>{L(s.title)}</h3>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-[#EFE6D6]/85 sm:text-[1.125rem]">{L(s.body)}</p>
      </div>
    ),
  }));

  return (
    <StickyStory
      steps={story}
      top={STICKY_TOP}
      mediaSide="right"
      frameClassName="bg-[#1A1917]"
      progressClassName="bg-[#C9A45C]"
      stepClassName="group/step"
      mobileImageClassName="aspect-[5/4] sm:aspect-[16/10] lg:w-[min(100%,760px)] lg:aspect-[3/2]"
      sizes="(min-width: 1024px) 46vw, 100vw"
      overlay={() => <Corners />}
      className="mt-14 lg:mt-6"
    />
  );
}
