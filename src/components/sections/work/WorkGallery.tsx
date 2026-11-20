"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { Reveal, RevealLines, staggerDelay } from "@/components/ui/Reveal";
import { SectionChip } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { DEMOS, type DemoId } from "@/data/demos";
import { fill } from "@/i18n/types";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { LAND_MS, WorkCard } from "./WorkCard";
import { WorkPreview } from "./WorkPreview";

/**
 * "Our work": the six demo sites as small browser windows. Hover (or keyboard
 * focus) scrolls a card's screenshot, the mouse tilts it, and a click grows the
 * window into a large scrollable preview. Under reduced motion or Pause the
 * cards rest at the top, don't tilt, and the preview fades in place.
 *
 * Phones (< 768 px, the `md:` boundary): the six cards sit in one horizontal
 * snap row (80vw cards, max 360 px, so the next one peeks), with tappable dots
 * underneath, so the section costs about one card of height. The layout is pure
 * CSS (no hydration jump); `matchMedia` only switches behaviour. The centred card
 * (IntersectionObserver on the row, 60%) auto-scrolls its picture while the
 * section is on screen; the others rest. A tap opens the preview full-screen; a
 * swipe never does.
 */
export function WorkGallery() {
  const { t } = useLanguage();
  const g = t.work.gallery;
  const reduce = useReducedMotionSafe();
  const { paused } = useMotionPause();
  const still = reduce || paused;

  const [openId, setOpenId] = useState<DemoId | null>(null);
  // The card the preview last grew from stays lifted while it shrinks back into its slot.
  const [raisedId, setRaisedId] = useState<DemoId | null>(null);
  const [touch, setTouch] = useState(false);
  const [landing, setLanding] = useState<{ id: DemoId; ratio: number; n: number } | null>(null);
  // Behaviour only (layout switches in CSS): false on the server and the first client render.
  const [phone, setPhone] = useState(false);
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // The auto-scroll only runs while the section is actually on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !phone) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [phone]);

  // Active card = the one at least 60% inside the row (only one fits at 80vw).
  useEffect(() => {
    const row = rowRef.current;
    if (!row || !phone) return;
    const items = [...row.children];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(items.indexOf(e.target));
      },
      { root: row, threshold: 0.6 },
    );
    items.forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [phone]);

  const showCard = (i: number) => {
    const li = rowRef.current?.children[i] as HTMLElement | undefined;
    li?.scrollIntoView({ inline: "center", block: "nearest", behavior: still ? "auto" : "smooth" });
  };

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const lowerTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(lowerTimer.current), []);

  const onOpen = useCallback((id: DemoId) => {
    window.clearTimeout(lowerTimer.current);
    setRaisedId(id);
    setOpenId(id);
  }, []);
  const openRef = useRef(openId);
  openRef.current = openId;
  const onClose = useCallback((ratio = 0) => {
    const id = openRef.current;
    if (!id) return;
    setLanding((prev) => ({ id, ratio, n: (prev?.n ?? 0) + 1 }));
    setOpenId(null);
    // Drop the lift once the shrink has landed (a little margin over LAND_MS).
    window.clearTimeout(lowerTimer.current);
    lowerTimer.current = window.setTimeout(() => setRaisedId((r) => (r === id ? null : r)), LAND_MS + 120);
  }, []);

  const open = DEMOS.find((d) => d.id === openId) ?? null;
  const liveFor = (i: number) => {
    if (still) return "off" as const;
    if (!phone) return "hover" as const;
    return i === active && onScreen && !openId ? ("auto" as const) : ("off" as const);
  };

  return (
    <section
      ref={sectionRef}
      id="work"
      aria-labelledby="work-title"
      data-theme="dark"
      className="relative isolate z-10 overflow-hidden py-24 text-bone lg:py-32"
    >
      <AmbientField tone="dark" variant={1} />
      <div className="frame relative">
        <div className="grid grid-cols-12 items-end gap-x-4 gap-y-6 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <SectionChip index={g.index} label={g.eyebrow} />
            </Reveal>
            <RevealLines
              id="work-title"
              lines={g.title}
              emphasis={g.titleEmphasis}
              className="mt-5 font-display text-display-md text-balance"
            />
          </div>
          <Reveal className="col-span-12 lg:col-span-5" delay={0.12}>
            <p className="max-w-md text-pretty leading-relaxed text-ash lg:ml-auto">{touch || phone ? g.bodyTouch : g.body}</p>
          </Reveal>
        </div>

        {/* Phones: a full-bleed snap row (out past the frame's gutters) whose side padding lets the first and
            last card centre. md and up: the grid. */}
        <ul
          ref={rowRef}
          data-work-row
          className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-[calc((100vw-min(80vw,360px))/2)] pb-2 pt-1 [scrollbar-width:none] sm:-mx-6 md:mx-0 md:mt-12 md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:p-0 lg:mt-16 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        >
          {DEMOS.map((demo, i) => (
            <li
              key={demo.id}
              className={`relative w-[80vw] max-w-[360px] shrink-0 snap-center md:w-auto md:max-w-none ${raisedId === demo.id ? "z-20" : ""}`}
            >
              {/* In the row the off-screen cards are clipped by the row itself, so an in-view reveal would keep
                  the peeking neighbour invisible: on phones they show as soon as the behaviour switch lands. */}
              <Reveal delay={phone ? 0 : staggerDelay(i)} trigger={phone ? "mount" : "inView"}>
                <WorkCard
                  demo={demo}
                  onOpen={onOpen}
                  live={liveFor(i)}
                  morph={!still}
                  shotMorph={phone}
                  raised={raisedId === demo.id}
                  landing={landing?.id === demo.id ? landing : null}
                />
              </Reveal>
            </li>
          ))}
        </ul>
        <div role="group" aria-label={g.dots} className="mt-4 flex justify-center gap-1 md:hidden">
          {DEMOS.map((demo, i) => (
            <button
              key={demo.id}
              type="button"
              data-work-dot
              aria-label={fill(g.show, { business: demo.business })}
              aria-current={i === active ? "true" : undefined}
              onClick={() => showCard(i)}
              className="group grid h-6 w-6 place-items-center rounded-full"
            >
              <span
                aria-hidden="true"
                className="block h-1.5 w-1.5 rounded-full bg-bone/40 transition-[transform,background-color] duration-200 ease-editorial group-aria-[current=true]:scale-[1.5] group-aria-[current=true]:bg-aqua"
              />
            </button>
          ))}
        </div>
      </div>
      <WorkPreview demo={open} onClose={onClose} morph={!still} full={phone} />
    </section>
  );
}
