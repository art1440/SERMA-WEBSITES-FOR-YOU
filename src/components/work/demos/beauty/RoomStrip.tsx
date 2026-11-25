"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import type { DemoImage } from "@/data/demos";
import { ScrollMarquee } from "@/components/work/motion";

/**
 * "The room" interlude: one slow row of texture photos (linen, stone, sage,
 * serum, towels, lashes) that slides only while the page scrolls, no skew.
 * Portrait photos sit in arched frames (the window motif), landscape ones in
 * soft rectangles; every frame is the same height so the row reads as a
 * single shelf. Each photo is a figure with its own alt and a short caption
 * below it (never on the photo, so no scrim is needed).
 *
 * The row is the quiet before the page's peak (the pinned visit story), so it
 * travels a short distance and has no entrance of its own.
 *
 * Loading: ScrollMarquee repeats the row three times inside an overflow-hidden
 * track, so the repeats sit outside the clip and a native lazy image there
 * would never start loading (and an img.decode() on it never settles). The
 * photos stay lazy until the strip is within ~900px of the viewport, then all
 * copies switch to eager (same six files, fetched once).
 */
export type RoomItem = {
  key: string;
  image: DemoImage;
  alt: string;
  caption: string;
};

const HEIGHT = "h-[230px] sm:h-[300px] lg:h-[360px]";

export function RoomStrip({
  items,
  className = "",
}: {
  items: RoomItem[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "900px 0px 900px 0px" });
  return (
    <div ref={ref} className={className}>
      <ScrollMarquee
        distance={14}
        rowClassName="items-start gap-5 sm:gap-8 lg:gap-10"
      >
        {items.map((it) => {
          const portrait = it.image.height > it.image.width;
          return (
            <figure key={it.key} className="shrink-0">
              <div
                className={`group relative overflow-hidden bg-[#26352D] ${HEIGHT} ${portrait ? "rounded-t-full rounded-b-[24px]" : "rounded-[24px]"}`}
                style={{
                  aspectRatio: `${it.image.width} / ${it.image.height}`,
                }}
              >
                <img
                  src={it.image.src}
                  srcSet={`${it.image.small} 640w, ${it.image.src} ${it.image.width}w`}
                  // Frames are 230-360px tall: portrait ones up to 270px wide, landscape ones up to 480px.
                  sizes={
                    portrait
                      ? "(min-width: 1024px) 270px, 225px"
                      : "(min-width: 1024px) 480px, 400px"
                  }
                  width={it.image.width}
                  height={it.image.height}
                  alt={it.alt}
                  loading={near ? "eager" : "lazy"}
                  decoding="async"
                  className="demo-zoom absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-4 text-[0.875rem] text-[#B4C4B9]">
                {it.caption}
              </figcaption>
            </figure>
          );
        })}
      </ScrollMarquee>
    </div>
  );
}
