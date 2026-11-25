"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import type { DemoImage } from "@/data/demos";
import { HorizontalGallery, RevealImage, TextReveal, useIsDesktop } from "@/components/work/motion";
import { useDemoStill } from "@/components/work/useDemoStill";
import type { ContractorContent, ContractorProject } from "@/data/demos/contractor";
import type { L10n } from "@/i18n/types";
import { Dimension, LABEL, SCROLL_MARGIN, SheetTag, UNDER_HEADER } from "./parts";

/*
 * Sheet A-201, the page's peak: the finished work as a run of drawing details
 * travelling sideways while the section is pinned (desktop), or a native snap
 * scroller (phones, tablets, still mode). Every card is a detail on the sheet:
 * a dimension string over the photo, the photo wiping in from the left inside
 * its already-drawn hairline frame, then the tag (A-201.n), the weeks it took,
 * the name and two lines of scope.
 *
 * Desktop sizing: every photo shares one height, --ph, worked out from the
 * viewport so a whole card (dimension + photo + caption) fits the pinned stage
 * at 720px tall and up; portraits are 0.8 of it wide, landscapes 1.5.
 *
 * Unpinned (the native scroller), the photos do not use RevealImage: its
 * clip-path hides an image from the browser's lazy loader until the card is
 * on screen, and Chrome's lazy loader never starts an image that sits outside
 * a horizontal scroller's visible area either, so cards further along the row
 * would never load while the page is only scrolled down. So, unpinned: the
 * photos switch from lazy to eager once the section is within 600px of the
 * viewport (all eight then load, before anyone swipes), and a navy curtain
 * (scaleX, origin right) slides off each photo the first time it is in view,
 * transform only; the image itself is never clipped.
 */

const STAGE = {
  "--ph": "clamp(240px, calc(100svh - var(--demo-ribbon) - 380px), 540px)",
} as CSSProperties;

const FRAME = "mt-2 aspect-[4/5] w-full bg-[#0A1B31] outline outline-1 outline-[#9BB8E0]/45 lg:aspect-auto lg:h-[var(--ph)]";

/** The unpinned card photo: lazy, never clipped; a curtain wipes off it the first time it is in view. */
function ScrollerPhoto({ image, alt, sizes, near }: { image: DemoImage; alt: string; sizes: string; near: boolean }) {
  const still = useDemoStill();
  return (
    <div className={`relative overflow-hidden ${FRAME}`}>
      <img
        src={image.src}
        srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={near ? "eager" : "lazy"}
        decoding="async"
        className="demo-zoom absolute inset-0 h-full w-full object-cover"
      />
      {!still && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 origin-right bg-[#0A1B31]"
          initial={{ scaleX: 1 }}
          whileInView={{ scaleX: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
    </div>
  );
}

function ProjectCard({ p, sheet, pinned, near, L }: { p: ContractorProject; sheet: string; pinned: boolean; near: boolean; L: (v: L10n) => string }) {
  const wide = p.image.width > p.image.height;
  const sizes = wide ? "(min-width: 1024px) 820px, min(80vw, 340px)" : "(min-width: 1024px) 440px, min(80vw, 340px)";
  return (
    <article
      className={`group w-[80vw] max-w-[340px] lg:max-w-none ${wide ? "lg:w-[calc(var(--ph)*1.5)]" : "lg:w-[calc(var(--ph)*0.8)]"}`}
    >
      <Dimension label={p.dimension} />
      {pinned ? (
        <RevealImage image={p.image} alt={L(p.image.alt)} fill from="left" parallax={4} sizes={sizes} className={FRAME} imgClassName="demo-zoom" />
      ) : (
        <ScrollerPhoto image={p.image} alt={L(p.image.alt)} sizes={sizes} near={near} />
      )}
      <div className="mt-5 lg:h-[13.5rem]">
        <div className="flex items-center justify-between gap-4">
          <SheetTag>{`${sheet}.${p.detail}`}</SheetTag>
          <span className="demo-display text-[1.125rem] font-semibold tracking-[0.02em] text-[#9BB8E0]">{L(p.duration)}</span>
        </div>
        <p className={`${LABEL} mt-4 text-[#FF7A1A]`}>{p.location}</p>
        <h3 className="demo-display mt-1.5 text-balance text-[1.75rem] font-extrabold leading-[0.98] text-[#E9F0FA] sm:text-[1.875rem]">
          {L(p.title)}
        </h3>
        <dl className="mt-3 space-y-1.5 text-[0.9375rem] leading-snug">
          {p.facts.map((f, k) => (
            <div key={k}>
              <dt className="inline font-medium text-[#9BB8E0]">{L(f.label)} · </dt>
              <dd className="inline text-[#C4D5EC]">{L(f.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

export function ProjectsGallery({ projects, L }: { projects: ContractorContent["projects"]; L: (v: L10n) => string }) {
  const still = useDemoStill();
  const desktop = useIsDesktop();
  const pinned = desktop && !still;
  const sectionRef = useRef<HTMLElement>(null);
  const near = useInView(sectionRef, { once: true, margin: "600px 0px 600px 0px" });

  const lead = (
    <div className={pinned ? "pr-12" : "grid gap-x-10 lg:grid-cols-12 lg:items-end [&>*]:lg:col-span-7 [&>p:last-child]:lg:col-span-5"}>
      <p className={`flex items-center gap-3 ${LABEL} text-[#9BB8E0]`}>
        <SheetTag>{projects.sheet}</SheetTag>
        <span>{L(projects.kicker)}</span>
      </p>
      <TextReveal
        as="h2"
        id="projects-title"
        text={L(projects.title)}
        className="demo-display mt-5 text-balance text-[clamp(2.5rem,9vw,3.25rem)] font-extrabold leading-[0.95] tracking-[-0.005em] text-[#E9F0FA] lg:text-[clamp(3.25rem,4.6vw,4.75rem)]"
      />
      <p className="mt-6 max-w-[40ch] text-[1.0625rem] leading-relaxed text-[#C4D5EC]">{L(projects.intro)}</p>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="projects"
      aria-labelledby="projects-title"
      style={{ ...SCROLL_MARGIN, ...STAGE }}
      className={`border-t border-[#9BB8E0]/25 bg-[#0F2440] ${pinned ? "" : "py-14 sm:py-20 lg:py-24"}`}
    >
      {/* Unpinned (phones, tablets, still), the heading sits above the scroller so the first card is in view. */}
      {!pinned && <div className="mx-auto mb-10 w-full max-w-[1360px] px-4 sm:px-6 lg:px-10">{lead}</div>}
      <HorizontalGallery
        label={L(projects.label)}
        top={UNDER_HEADER}
        lead={pinned ? lead : undefined}
        trackClassName="gap-6 sm:gap-8 lg:gap-14"
        gutterClassName="px-4 sm:px-6 lg:px-10"
      >
        {projects.items.map((p) => (
          <ProjectCard key={p.id} p={p} sheet={projects.sheet} pinned={pinned} near={near} L={L} />
        ))}
      </HorizontalGallery>
    </section>
  );
}
