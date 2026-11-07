"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, MoveHorizontal } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { CurvedCarousel, type CarouselItem } from "@/components/ui/CurvedCarousel";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { NICHES } from "@/data/niches";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";

/**
 * "Built for" — a normal section (not pinned): page scroll passes straight by.
 * The curved 3D carousel moves only when the visitor swipes, drags, taps the
 * arrows, or uses the arrow keys. The front card drives the dashboard below.
 */
export function IndustriesChapter() {
  const { t, locale } = useLanguage();
  const { pickNiche: setNicheId } = useNiche();
  const [active, setActive] = useState(0);

  const items: CarouselItem[] = useMemo(
    () =>
      NICHES.map((niche, i) => ({
        id: niche.id,
        title: niche.label[locale],
        label: fill(t.industries.slideLabel, { n: i + 1, total: NICHES.length, name: niche.label[locale] }),
        poster: niche.media.poster,
        video: niche.media.src,
      })),
    [locale, t.industries.slideLabel],
  );

  const onActiveChange = (i: number) => {
    setActive(i);
    startTransition(() => setNicheId(NICHES[i].id));
  };

  const openDashboard = () => {
    setNicheId(NICHES[active].id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("dashboard")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  const niche = NICHES[active];
  const index = t.industries.index.replace(/[()]/g, "");

  return (
    <section
      id="industries"
      aria-labelledby="industries-title"
      data-theme="dark"
      className="relative isolate z-10 overflow-hidden py-24 text-bone lg:py-32"
    >
      <AmbientField tone="dark" variant={0} />
      <div className="relative">
        <div className="flex flex-col">
          <div className="frame grid grid-cols-12 items-end gap-x-4 gap-y-6 lg:gap-x-8">
            <div className="col-span-12 lg:col-span-7">
              <Reveal y={12}>
                {/* Flat chip: the light field behind is soft, so real blur would be invisible cost. */}
                <p className="chip-dark glass-flat text-ash">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_8px_1px_rgba(229,88,42,0.6)]" />
                  <span className="tabular text-bone">{index}</span>
                  <span>·</span>
                  <span>{t.industries.eyebrow}</span>
                </p>
              </Reveal>
              <RevealLines
                id="industries-title"
                lines={t.industries.title}
                emphasis={t.industries.titleEmphasis}
                className="mt-5 font-display text-display-md"
              />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <p className="max-w-md text-pretty leading-relaxed text-ash">{t.industries.body}</p>
              <p className="chip-dark glass-flat mt-4 text-ash">
                <MoveHorizontal aria-hidden="true" size={15} strokeWidth={1.75} className="text-signal" />
                {t.industries.swipeHint}
              </p>
            </div>
          </div>

          <div className="mt-8 lg:mt-10">
            <CurvedCarousel
              items={items}
              onActiveChange={onActiveChange}
              regionLabel={t.industries.carouselLabel}
              prevLabel={t.industries.prev}
              nextLabel={t.industries.next}
            />
          </div>

          <div className="frame mt-6 flex flex-col items-center gap-4 text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${niche.id}-${locale}`}
                className="font-display text-2xl text-bone text-balance sm:text-3xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              >
                {niche.tagline[locale]}
              </motion.p>
            </AnimatePresence>
            <button type="button" onClick={openDashboard} className="btn-line-dark">
              {t.industries.explore}
              <ArrowDown aria-hidden="true" size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
