"use client";

import { motion } from "framer-motion";
import type { BarberService } from "@/data/demos/barbershop";
import type { L10n } from "@/i18n/types";
import { HoverPreview, useFinePointer, useMediaQuery, waveDelay } from "@/components/work/motion";
import { useDemoStill } from "../../useDemoStill";
import { DISPLAY, EDITORIAL, Rise, usd } from "./ui";

/** Dotted leader between a service name and its price; draws left to right on first view. */
function Leader({ delay }: { delay: number }) {
  const still = useDemoStill();
  const cls =
    "mx-3 mb-[0.42em] h-[3px] min-w-[2rem] flex-1 origin-left bg-[radial-gradient(circle,#C9A45C_1.1px,transparent_1.4px)] bg-[length:7px_3px] bg-repeat-x opacity-70";
  if (still) return <span aria-hidden="true" className={cls} />;
  return (
    <motion.span
      aria-hidden="true"
      className={cls}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: EDITORIAL, delay }}
    />
  );
}

/**
 * The price list. Mouse / trackpad on a wide window: each row floats its
 * photo beside the pointer (HoverPreview, decorative). Touch, narrow windows,
 * reduced motion or Pause: every row carries a small inline thumbnail instead
 * (only one of the two is ever active, and no lazy image waits in a hidden
 * branch).
 */
export function PriceList({ items, note, minutes, L }: { items: BarberService[]; note: L10n; minutes: L10n; L: (v: L10n) => string }) {
  const still = useDemoStill();
  const fine = useFinePointer();
  const wide = useMediaQuery("(min-width: 768px)");
  // Thumbnails on touch, on narrow windows and when still; the floating preview only where there are none.
  const thumbs = still || !fine || !wide;
  const n = items.length + 1;

  return (
    <HoverPreview images={thumbs ? [] : items.map((s) => s.image)} frameClassName="w-[240px] aspect-[4/5] bg-[#1A1917]" className="mt-14">
      {(bind) => (
        <ul className="grid gap-x-20 gap-y-12 md:grid-cols-2 md:gap-y-14">
          {items.map((s, i) => (
            <Rise as="li" key={s.name.en} delay={waveDelay(i, n, 0.42)} className="group/row flex gap-4 sm:gap-5" {...bind(i)}>
              {thumbs && (
                <div className="relative mt-1 h-[84px] w-[67px] shrink-0 overflow-hidden bg-[#1A1917] sm:h-[100px] sm:w-[80px]">
                  <img
                    src={s.image.small}
                    width={s.image.width}
                    height={s.image.height}
                    alt={L(s.image.alt)}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-end">
                  <h3
                    className={`${DISPLAY} min-w-0 text-[1.375rem] uppercase leading-tight transition-colors duration-300 group-hover/row:text-[#C9A45C] sm:text-[1.75rem]`}
                  >
                    {L(s.name)}
                  </h3>
                  <Leader delay={waveDelay(i, n, 0.42) + 0.15} />
                  <p className={`${DISPLAY} text-[1.75rem] leading-none text-[#C9A45C] sm:text-[2.25rem]`}>{usd(s.price)}</p>
                </div>
                <p className="mt-3 max-w-[42ch] leading-relaxed text-[#EFE6D6]/80">{L(s.detail)}</p>
                <p className="mt-2 text-[0.8125rem] font-semibold uppercase tracking-[0.16em] text-[#A8A091]">
                  {s.minutes} {L(minutes)}
                </p>
              </div>
            </Rise>
          ))}
          <Rise as="li" delay={waveDelay(n - 1, n, 0.42)} className="self-end border-l-2 border-[#C9A45C] pl-5">
            <p className="leading-relaxed text-[#A8A091]">{L(note)}</p>
          </Rise>
        </ul>
      )}
    </HoverPreview>
  );
}
