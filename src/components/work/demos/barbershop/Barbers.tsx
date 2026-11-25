"use client";

import type { Barber } from "@/data/demos/barbershop";
import type { L10n } from "@/i18n/types";
import { RevealImage, waveDelay } from "@/components/work/motion";
import { BookButton } from "../../DemoShell";
import { DISPLAY, FOCUS, Rise } from "./ui";

/**
 * "Your barbers": three portrait cards. The portrait is the lead (clip wipe +
 * settle, one wave across the row); the name block follows with a shorter
 * rise. Hovering a card eases the portrait in (demo-zoom).
 */
export function Barbers({ items, book, L }: { items: Barber[]; book: L10n; L: (v: L10n) => string }) {
  const n = items.length;
  return (
    <ul className="mt-14 grid gap-14 sm:grid-cols-2 md:mt-16 md:grid-cols-3 md:gap-6 lg:gap-10">
      {items.map((b, i) => {
        const d = waveDelay(i, n, 0.32);
        return (
          <li key={b.name} className="group">
            <RevealImage
              image={b.image}
              alt={L(b.image.alt)}
              sizes="(min-width: 1480px) 440px, (min-width: 768px) 31vw, (min-width: 640px) 46vw, 100vw"
              fill
              from="bottom"
              parallax={5}
              delay={d}
              className="aspect-[4/5] w-full bg-[#1A1917]"
              imgClassName="demo-zoom"
            />
            <Rise delay={d + 0.25} y={10}>
              <div className="mt-5 border-t border-[#EFE6D6]/15 pt-4">
                <h3 className={`${DISPLAY} text-[2rem] uppercase leading-none sm:text-[2.25rem]`}>{b.name}</h3>
                <p className="mt-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#C9A45C]">{L(b.role)}</p>
              </div>
              <p className="mt-3 max-w-[38ch] leading-relaxed text-[#EFE6D6]/80">{L(b.bio)}</p>
              <BookButton
                className={`demo-underline mt-4 inline-flex pb-1 text-[0.875rem] font-semibold uppercase tracking-[0.14em] text-[#EFE6D6] transition-colors hover:text-[#C9A45C] ${FOCUS}`}
              >
                {`${L(book)} ${b.name}`}
              </BookButton>
            </Rise>
          </li>
        );
      })}
    </ul>
  );
}
