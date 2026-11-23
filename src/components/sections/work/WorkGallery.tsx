"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { Reveal, RevealLines, staggerDelay } from "@/components/ui/Reveal";
import { SectionChip } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { DEMOS, type DemoId } from "@/data/demos";
import { fill } from "@/i18n/types";
import { MOTION } from "@/lib/motion";
import { navBottom } from "@/lib/tabs";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { LAND_MS, WorkCard } from "./WorkCard";
import { WorkPreview } from "./WorkPreview";

/** Phones that pin the row. Keep in sync with the `pan:` variant in tailwind.config.ts. */
const PAN_QUERY = "(max-width: 767px) and (min-height: 500px) and (prefers-reduced-motion: no-preference)";
const N = DEMOS.length;
/** How long each card holds still in the centre, in units of one card-to-card glide. */
const HOLD = 0.5;
const UNITS = N * HOLD + (N - 1);
/** Page scroll per unit, in card strides (card + gap): a glide costs ~0.7 of a card's width of thumb travel. */
const SCROLL_PER_UNIT = 0.7;
/** The pinned row's scroll room. Same stride as the row itself (80vw cards, max 360px, 1rem gap). */
const RUNWAY = `calc(${(UNITS * SCROLL_PER_UNIT).toFixed(2)} * (min(80vw, 360px) + 1rem))`;
/** Sticky top: centred between the nav (header + section rail) and the bottom of the small viewport. */
const STAGE_TOP = "max(var(--work-nav, 7.5rem), calc(50svh + var(--work-nav, 7.5rem) / 2 - var(--work-stage, 22rem) / 2))";
/** A sideways swipe this far (px) moves to the next / previous card. */
const FLICK = 36;
/** Dot pitch (px): 24 px buttons, 4 px apart. The accent pill slides along it. */
const DOT_PITCH = 28;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Pinned progress (0..1) to the row's position in cards (0..N-1): a hold on each card, a sine glide between. */
function cardAt(p: number) {
  const u = clamp01(p) * UNITS;
  const k = Math.min(N - 1, Math.floor(u / (HOLD + 1)));
  const r = u - k * (HOLD + 1);
  if (k === N - 1 || r <= HOLD) return k;
  return k + (1 - Math.cos(Math.PI * (r - HOLD))) / 2;
}

/** Progress (0..1) at the middle of card i's hold. */
const holdOf = (i: number) => (i * (HOLD + 1) + HOLD / 2) / UNITS;

/**
 * One slot in the row. While the row is pinned the cards either side of centre sit a little smaller with a
 * scrim of the page colour over their window (never over the caption, so its contrast holds), and grow /
 * clear as they reach the centre. Transform + opacity only. Neutral whenever the row is not pinned.
 */
function PanItem({ i, pos, on, className, children }: { i: number; pos: MotionValue<number>; on: MotionValue<number>; className: string; children: ReactNode }) {
  const near = useTransform(() => (on.get() ? Math.min(1, Math.abs(pos.get() - i)) : 0));
  const scale = useTransform(near, (d) => 1 - 0.1 * d);
  const dim = useTransform(near, (d) => 0.55 * d);
  return (
    <motion.li className={className} style={{ scale }}>
      {children}
      {/* The card's window: its 2rem browser bar + the page view. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[calc(2rem+var(--work-view))] rounded-[14px] bg-ink pan:block"
        style={{ opacity: dim }}
      />
    </motion.li>
  );
}

/**
 * "Our work": the six demo sites as small browser windows. Hover (or keyboard
 * focus) scrolls a card's screenshot, the mouse tilts it, and a click grows the
 * window into a large scrollable preview. Under reduced motion or Pause the
 * cards rest at the top, don't tilt, and the preview fades in place.
 *
 * Phones (< 768 px, `pan:` in tailwind.config.ts): nobody scrolls past the work
 * having seen only the first site. The row pins mid-screen (sticky, centred under
 * the nav) and the page scroll walks it sideways through all six: each card holds
 * in the centre for a moment, then glides out as the next one comes in. A spacer
 * after the stage gives it that scroll room (~2.7 screens on a 390 px phone), so
 * it is plain native scrolling: no wheel or touch hijacking, momentum intact.
 * A sideways swipe, a dot or keyboard focus scrolls the page to that card's hold.
 * The centred card auto-scrolls its picture; a tap opens it full-screen.
 *
 * Phones that can't pin (reduced motion, or too short, e.g. landscape) stack the
 * six cards in one column instead, so scrolling still passes every one. Layout is
 * pure CSS (no hydration jump); `matchMedia` only switches behaviour.
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
  const [pan, setPan] = useState(false);
  const [active, setActive] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);

  // Pinned progress (0..1 through the spacer), smoothed on the page's scroll spring, then mapped to cards.
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, MOTION.cinematic);
  const pos = useTransform(smooth, cardAt);
  const on = useMotionValue(0);
  const stride = useMotionValue(0);
  const x = useTransform(() => (on.get() ? -pos.get() * stride.get() : 0));
  const pill = useTransform(() => pos.get() * DOT_PITCH);

  // Held still while a preview is open or shrinking back: the body pin and the landing measure the slot.
  const frozen = useRef(false);
  frozen.current = openId !== null || raisedId !== null;
  const stillRef = useRef(still);
  stillRef.current = still;

  useEffect(() => {
    const phoneMq = window.matchMedia("(max-width: 767px)");
    const panMq = window.matchMedia(PAN_QUERY);
    const sync = () => {
      setPhone(phoneMq.matches);
      setPan(panMq.matches);
    };
    sync();
    phoneMq.addEventListener("change", sync);
    panMq.addEventListener("change", sync);
    return () => {
      phoneMq.removeEventListener("change", sync);
      panMq.removeEventListener("change", sync);
    };
  }, []);

  // Pinned row: progress = how far the sticky stage has slid down its runway. Read from layout (not
  // scrollY), so it holds while the preview pins the body at top: -scrollY.
  useEffect(() => {
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const spacer = spacerRef.current;
    const row = rowRef.current;
    on.set(pan ? 1 : 0);
    if (!pan || !runway || !stage || !spacer || !row) return;
    let first = true;
    const update = () => {
      if (frozen.current) return;
      const h = spacer.offsetHeight;
      const p = h ? clamp01((stage.getBoundingClientRect().top - runway.getBoundingClientRect().top) / h) : 0;
      raw.set(p);
      // No sweep across the row on arrival (deep link, reload mid-page); Pause follows the thumb exactly.
      if (first || stillRef.current) smooth.jump(p);
      first = false;
    };
    const measure = () => {
      const items = row.children;
      if (items.length > 1) stride.set((items[1] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft);
      stage.style.setProperty("--work-nav", `${Math.round(navBottom())}px`);
      stage.style.setProperty("--work-stage", `${stage.offsetHeight}px`);
      update();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(row);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [pan, on, raw, smooth, stride]);

  // Active card = the one nearest the centre.
  const activeRef = useRef(0);
  useMotionValueEvent(pos, "change", (v) => {
    const a = Math.min(N - 1, Math.max(0, Math.round(v)));
    if (a === activeRef.current) return;
    activeRef.current = a;
    setActive(a);
  });

  // The auto-scroll only runs while the stage itself (not just the section's padding) is on screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !pan) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting && e.intersectionRatio >= 0.25), {
      threshold: [0, 0.25],
    });
    io.observe(el);
    return () => io.disconnect();
  }, [pan]);

  /** Scrolls the page to the middle of card i's hold (the row follows on its own). */
  const goTo = useCallback((i: number) => {
    const runway = runwayRef.current;
    const stage = stageRef.current;
    const spacer = spacerRef.current;
    // Never while the preview pins the body: that scroll would land on the page behind it.
    if (!runway || !stage || !spacer || document.body.style.position === "fixed") return;
    const top = parseFloat(getComputedStyle(stage).top) || 0;
    const start = window.scrollY + runway.getBoundingClientRect().top - top;
    const y = Math.round(start + holdOf(Math.min(N - 1, Math.max(0, i))) * spacer.offsetHeight);
    window.scrollTo({ top: y, behavior: (stillRef.current ? "instant" : "smooth") as ScrollBehavior });
  }, []);

  // A sideways swipe on the row (touch / pen) steps one card. The row is `touch-action: pan-y`, so the
  // browser keeps vertical drags (and cancels the pointer); sideways ones reach us.
  const swipe = useRef<{ x: number; y: number; axis: "x" | "y" | null } | null>(null);
  const onSwipeStart = (e: PointerEvent<HTMLDivElement>) => {
    swipe.current = pan && e.pointerType !== "mouse" ? { x: e.clientX, y: e.clientY, axis: null } : null;
  };
  const onSwipeMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (!s.axis && Math.hypot(dx, dy) >= 10) s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (s.axis !== "x" || Math.abs(dx) < FLICK) return;
    swipe.current = null;
    const cur = pos.get();
    goTo(dx < 0 ? Math.floor(cur + 0.001) + 1 : Math.ceil(cur - 0.001) - 1);
  };
  const onSwipeEnd = () => {
    swipe.current = null;
  };

  // Keyboard focus on a card brings the row to it (the clip can't scroll, so the browser can't).
  const onRowFocus = (e: FocusEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement;
    if (!pan || frozen.current || !target.matches(":focus-visible")) return;
    const li = target.closest("li");
    const i = li ? Array.prototype.indexOf.call(e.currentTarget.children, li) : -1;
    if (i >= 0 && i !== Math.round(pos.get())) goTo(i);
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
    if (!pan) return "off" as const;
    return i === active && onScreen && !openId ? ("auto" as const) : ("off" as const);
  };

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      data-theme="dark"
      // `clip` where the row pins: `hidden` would make the section a scroll container and break sticky.
      className="relative isolate z-10 overflow-hidden py-24 text-bone pan:overflow-clip lg:py-32"
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

        {/* Phones that pin: the stage sticks and the spacer under it is the scroll room the row walks through.
            Other phones: one column. md and up: the grid. */}
        <div ref={runwayRef} data-work-runway className="relative mt-10 md:mt-12 lg:mt-16">
          <div ref={stageRef} data-work-stage className="pan:sticky" style={{ top: STAGE_TOP }}>
            {/* Full-bleed (out past the frame's gutters) and clipped sideways: `clip`, not `hidden`, so focus
                can never scroll it and knock the row off its transform. */}
            <div
              className="pan:mx-[calc(50%-50vw)] pan:touch-pan-y pan:overflow-x-clip"
              onPointerDown={onSwipeStart}
              onPointerMove={onSwipeMove}
              onPointerUp={onSwipeEnd}
              onPointerCancel={onSwipeEnd}
            >
              <motion.ul
                ref={rowRef}
                data-work-row
                onFocus={onRowFocus}
                style={{ x }}
                className="mx-auto flex max-w-[360px] flex-col gap-10 pan:mx-0 pan:max-w-none pan:flex-row pan:gap-4 pan:px-[calc((100vw-min(80vw,360px))/2)] pan:pb-2 pan:pt-1 md:mx-0 md:grid md:max-w-none md:grid-cols-2 md:gap-6 lg:grid-cols-3"
              >
                {DEMOS.map((demo, i) => (
                  <PanItem
                    key={demo.id}
                    i={i}
                    pos={pos}
                    on={on}
                    className={`relative pan:w-[80vw] pan:max-w-[360px] pan:shrink-0 pan:[container-type:inline-size] pan:[--work-view:clamp(62.5cqw,100svh-20rem,100cqw)] ${raisedId === demo.id ? "z-20" : ""}`}
                  >
                    {/* In the pinned row the off-centre cards are clipped, so an in-view reveal would keep the peeking
                        neighbour invisible: there they show as soon as the behaviour switch lands. */}
                    <Reveal delay={phone ? 0 : staggerDelay(i)} trigger={pan ? "mount" : "inView"}>
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
                  </PanItem>
                ))}
              </motion.ul>
            </div>
            <div role="group" aria-label={g.dots} className="relative mx-auto mt-4 hidden w-max gap-1 pan:flex">
              {DEMOS.map((demo, i) => (
                <button
                  key={demo.id}
                  type="button"
                  data-work-dot
                  aria-label={fill(g.show, { business: demo.business })}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="grid h-6 w-6 place-items-center rounded-full"
                >
                  <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-bone/40" />
                </button>
              ))}
              {/* The accent pill rides the row's position continuously, so it slides between dots mid-glide. */}
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute left-[5px] top-[9px] h-1.5 w-3.5 rounded-full bg-aqua"
                style={{ x: pill }}
              />
            </div>
          </div>
          <div ref={spacerRef} aria-hidden="true" data-work-spacer className="hidden pan:block" style={{ height: RUNWAY }} />
        </div>
      </div>
      <WorkPreview demo={open} onClose={onClose} morph={!still} full={phone} />
    </section>
  );
}
