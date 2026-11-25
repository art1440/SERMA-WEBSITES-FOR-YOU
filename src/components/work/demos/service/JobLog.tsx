"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoImage } from "@/data/demos";
import { ScrollMarquee } from "../../motion";

/**
 * Brightline's job log: recent jobs that slide sideways only while the page
 * scrolls (ScrollMarquee). The kit repeats the row and clips it horizontally,
 * so a lazy image sitting past the clip edge would never load (the browser
 * treats it as never visible). Instead the photos are mounted once the strip
 * is within a screen or so of the viewport, and then load eagerly at low
 * priority: nothing is fetched up front, and every image in the DOM loads.
 * The photos are decorative (alt=""); each caption says what the job was.
 */
type Item = { image: DemoImage; caption: string };

export function JobLog({
  items,
  className = "",
}: {
  items: Item[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <div ref={ref} className={className}>
      <ScrollMarquee rowClassName="gap-4 sm:gap-6" distance={28}>
        {items.map((j) => (
          <figure key={j.image.src} className="w-[15rem] shrink-0 sm:w-[19rem]">
            <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-[#D5EEEA]">
              {near && (
                <img
                  src={j.image.small}
                  width={640}
                  height={Math.round((640 * j.image.height) / j.image.width)}
                  alt=""
                  loading="eager"
                  fetchPriority="low"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <figcaption className="mt-3 text-[0.9375rem] font-medium text-[#0C3A36]">
              {j.caption}
            </figcaption>
          </figure>
        ))}
      </ScrollMarquee>
    </div>
  );
}
