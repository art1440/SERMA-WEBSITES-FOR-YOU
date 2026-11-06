"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { CurvedCarousel, type CarouselItem } from "@/components/ui/CurvedCarousel";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { useScene, useTrackProgress } from "@/context/SceneContext";
import { NICHES } from "@/data/niches";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";

/**
 * "Built for" — pinned while scroll spins a curved 3D carousel of the six
 * industries one full lap. Visitors can also swipe / drag / use keys at any
 * time. The front card drives the dashboard's industry below.
 */
export function IndustriesChapter() {
  const { t, locale } = useLanguage();
  const { setNicheId } = useNiche();
  const { reduce } = useScene();
  const track = useTrackProgress();
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

  return (
    <section
      id="industries"
      ref={track.ref}
      aria-labelledby="industries-title"
      data-theme="dark"
      className="relative z-10 bg-ink text-bone motion-safe:h-[280vh]"
    >
      <div className="relative motion-safe:sticky motion-safe:top-0 motion-safe:h-[100svh] motion-safe:overflow-hidden">
        <div className="flex h-full flex-col justify-center py-24 motion-safe:py-0 motion-safe:pt-16">
          <div className="frame grid grid-cols-12 items-end gap-x-4 gap-y-4 lg:gap-x-8">
            <div className="col-span-12 lg:col-span-7">
              <Reveal y={12}>
                <p className="eyebrow flex items-baseline gap-3 text-ash">
                  <span className="text-signal">{t.industries.index}</span>
                  <span aria-hidden="true" className="inline-block h-px w-6 translate-y-[-3px] bg-ash" />
                  <span>{t.industries.eyebrow}</span>
                </p>
              </Reveal>
              <RevealLines
                id="industries-title"
                lines={t.industries.title}
                emphasis={locale === "es" ? "Un motor." : "One engine."}
                className="mt-4 font-display text-display-md"
              />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <p className="max-w-md text-pretty leading-relaxed text-ash">{t.industries.body}</p>
              <p className="mt-3 font-mono text-micro uppercase text-signal">{t.industries.swipeHint}</p>
            </div>
          </div>

          <div className="mt-6 lg:mt-8">
            <CurvedCarousel
              items={items}
              scrollProgress={reduce ? undefined : track.progress}
              onActiveChange={onActiveChange}
              regionLabel={t.industries.carouselLabel}
              prevLabel={t.industries.prev}
              nextLabel={t.industries.next}
            />
          </div>

          <div className="frame mt-4 flex flex-col items-center gap-3 text-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={`${niche.id}-${locale}`}
                className="font-display text-2xl text-bone sm:text-3xl"
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
              <ArrowDown aria-hidden="true" size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
