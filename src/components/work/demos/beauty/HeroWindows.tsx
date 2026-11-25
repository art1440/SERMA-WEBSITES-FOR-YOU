"use client";

import type { DemoImage } from "@/data/demos";
import { Parallax, RevealImage } from "@/components/work/motion";

/**
 * The hero's two windows, the "closed window" pill of the old hero finally
 * showing the room. Three depth planes, all transform-only:
 *
 *   1. the tall pill frame drifts slowly with the page (Parallax 24px);
 *   2. the room photo inside it drifts the other way within the frame
 *      (RevealImage's own 8% parallax), so the room reads as further back;
 *   3. the small sage window sits in front, overlapping the frame's lower
 *      left edge, and travels fastest (Parallax 64px).
 *
 * Entrance: the big window opens from its centre on load (RevealImage, in-out
 * wipe), the small one follows 0.7 s later. Decorative hairline ring only, no
 * glow. Still (reduced motion / Pause): both photos sit at rest, fully open.
 *
 * The room photo is the page's only eager, fetchPriority="high" image.
 *
 * Phones (< 640px): the parent grid places this in the headline's row, right
 * column, bottom-aligned, so a small window sits beside the headline's shorter
 * second and third lines and hangs a little into the gap above the intro. The
 * note moves under the CTAs there (BeautyDemo renders a phone copy).
 */
export function HeroWindows({ room, roomAlt, detail, detailAlt, note }: { room: DemoImage; roomAlt: string; detail: DemoImage; detailAlt: string; note: string }) {
  return (
    <div className="flex flex-col items-end max-sm:z-10 max-sm:col-start-2 max-sm:row-start-2 max-sm:-mb-7 max-sm:self-end max-sm:pl-3">
      {/* The anchor is exactly the big window's box, so the small one can be placed against its edge. */}
      <div className="relative sm:mr-10 lg:mr-8">
        <Parallax distance={24}>
          <div className="relative aspect-[5/8] w-[88px] sm:w-[300px] lg:h-[min(62svh,560px)] lg:w-auto">
            <RevealImage
              image={room}
              alt={roomAlt}
              sizes="(min-width: 1024px) 350px, (min-width: 640px) 300px, 88px"
              priority
              fill
              from="center"
              parallax={8}
              zoom={1.12}
              className="h-full w-full rounded-full bg-[#26352D]"
            />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-[#9CC5A6]/35" />
          </div>
        </Parallax>
        <Parallax distance={64} className="absolute -left-[34%] bottom-[9%] z-10 w-[44%] lg:-left-[30%] lg:w-[40%]">
          <div className="relative rounded-full bg-[#1E2A24] p-[5px] sm:p-[6px]">
            <RevealImage
              image={detail}
              alt={detailAlt}
              sizes="(min-width: 1024px) 140px, (min-width: 640px) 132px, 44px"
              fill
              from="center"
              parallax={0}
              zoom={1.16}
              delay={0.7}
              className="aspect-[3/4] w-full rounded-full bg-[#26352D]"
            />
          </div>
        </Parallax>
      </div>
      <p className="mt-8 flex max-w-[30ch] items-center justify-end gap-3 text-right text-[0.875rem] leading-relaxed text-[#B4C4B9] max-sm:hidden sm:max-w-none lg:mt-10">
        <span aria-hidden="true" className="hidden h-px w-8 shrink-0 bg-[#9CC5A6] sm:block" />
        {note}
      </p>
    </div>
  );
}
