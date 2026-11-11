"use client";

import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useMotionPause } from "@/context/MotionPauseContext";
import { SPRING_SMOOTH } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

export type CarouselItem = {
  id: string;
  title: string;
  /** Accessible slide label, e.g. "1 of 6: Barbershops". */
  label: string;
  poster: string;
  /** Video path without extension (expects .webm + .mp4). Plays on the front card only. */
  video?: string;
};

type Props = {
  items: CarouselItem[];
  /** Optional scroll progress (0 → 1) that also spins the ring — one full lap of the items. */
  scrollProgress?: MotionValue<number>;
  onActiveChange?: (index: number) => void;
  regionLabel: string;
  prevLabel: string;
  nextLabel: string;
};

const COPIES = 3; // the ring holds the items three times so it always looks full
const GAP = 18;

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Curved 3D carousel: cards sit on the inside of a cylinder, so the outer
 * edges lean toward the viewer. Swipe / drag (with momentum + snap), arrow
 * keys, buttons, or scroll. Transform-only; React state changes only when the
 * front card changes.
 */
export function CurvedCarousel({ items, scrollProgress, onActiveChange, regionLabel, prevLabel, nextLabel }: Props) {
  const reduce = useReducedMotionSafe();
  const { paused } = useMotionPause();
  const n = items.length;
  const slots = n * COPIES;
  const step = 360 / slots;

  // Card size follows the viewport (measured on resize only).
  const stageRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 260, h: 350, r: 760, p: 1700 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const vw = el.clientWidth;
      const w = Math.round(Math.min(300, Math.max(176, vw * (vw < 640 ? 0.52 : 0.2))));
      const h = Math.round(w * 1.34);
      const r = (w + GAP) / (2 * Math.tan(((step / 2) * Math.PI) / 180));
      setDims({ w, h, r, p: Math.round(r * 2.3) });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [step]);

  // Rotation = scroll-driven part + user-driven part (drag / keys / buttons).
  const zero = useMotionValue(0);
  const scrollRot = useTransform(scrollProgress ?? zero, [0.06, 0.94], [0, reduce || !scrollProgress ? 0 : n * step]);
  const offset = useMotionValue(0);
  const rotation = useTransform([scrollRot, offset], ([a, b]: number[]) => a + b);

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [announce, setAnnounce] = useState("");
  useMotionValueEvent(rotation, "change", (v) => {
    const idx = mod(Math.round(v / step), n);
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx);
      onActiveChange?.(idx);
    }
  });

  const settle = useCallback(
    (targetRotation: number, velocity = 0) => {
      const target = targetRotation - scrollRot.get();
      animate(offset, target, reduce ? { duration: 0 } : { ...SPRING_SMOOTH, velocity });
    },
    [offset, scrollRot, reduce],
  );

  const goTo = useCallback(
    (index: number, speak = false) => {
      const cur = rotation.get();
      // Nearest ring angle that shows `index` (each item appears every n·step degrees).
      const lap = n * step;
      let delta = mod(index * step - cur, lap);
      if (delta > lap / 2) delta -= lap;
      settle(cur + delta);
      if (speak) setAnnounce(items[index]?.label ?? "");
    },
    [rotation, n, step, settle, items],
  );

  const nudge = (dir: 1 | -1) => {
    const snapped = Math.round(rotation.get() / step) * step;
    settle(snapped + dir * step);
    setAnnounce(items[mod(Math.round(snapped / step) + dir, n)]?.label ?? "");
  };

  // ---- Drag / swipe ------------------------------------------------------
  const dragStart = useRef(0);
  const dragged = useRef(false);
  const degPerPx = step / (dims.w + GAP);

  const onPanStart = () => {
    offset.stop();
    dragStart.current = offset.get();
    dragged.current = false;
  };
  const onPan = (_: PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 6) dragged.current = true;
    offset.set(dragStart.current - info.offset.x * degPerPx);
  };
  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    const v = -info.velocity.x * degPerPx;
    const projected = rotation.get() + v * 0.22;
    settle(Math.round(projected / step) * step, v);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nudge(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nudge(-1);
    }
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label={regionLabel} onKeyDown={onKeyDown} className="relative">
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>

      {/* Soft edge fade (mask on the perspective parent, never on the preserve-3d ring). */}
      <motion.div
        ref={stageRef}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        className="relative w-full cursor-grab select-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)] active:cursor-grabbing"
        style={{ height: dims.h + 90, perspective: dims.p, touchAction: "pan-y" }}
      >
        <motion.div
          className="absolute inset-0 [transform-style:preserve-3d]"
          style={{ z: dims.r, rotateY: rotation }}
        >
          {Array.from({ length: slots }).map((_, slot) => {
            const i = slot % n;
            const item = items[i];
            const original = slot < n;
            const front = i === active && mod(Math.round(rotation.get() / step), slots) === slot;
            return (
              <div
                key={slot}
                role={original ? "group" : undefined}
                aria-roledescription={original ? "slide" : undefined}
                aria-label={original ? item.label : undefined}
                aria-hidden={original ? undefined : true}
                className="absolute left-1/2 top-1/2 [backface-visibility:hidden]"
                style={{
                  width: dims.w,
                  height: dims.h,
                  marginLeft: -dims.w / 2,
                  marginTop: -dims.h / 2,
                  transform: `rotateY(${-slot * step}deg) translateZ(${-dims.r}px)`,
                }}
              >
                <button
                  type="button"
                  tabIndex={original ? 0 : -1}
                  onFocus={(e) => {
                    // Keyboard focus spins the ring to the card; mouse/touch focus is left to drag/tap.
                    if (e.currentTarget.matches(":focus-visible")) goTo(i);
                  }}
                  onClick={() => {
                    if (dragged.current) return;
                    goTo(i, true);
                  }}
                  className="group relative isolate block h-full w-full overflow-hidden rounded-glass bg-ink-800 text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)] outline-offset-4 xl:rounded-glass-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.poster}
                    alt=""
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  />
                  {item.video && front && !paused && !reduce ? (
                    <video
                      key={item.video}
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                      poster={item.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      tabIndex={-1}
                    >
                      <source src={`${item.video}.webm`} type="video/webm" />
                      <source src={`${item.video}.mp4`} type="video/mp4" />
                    </video>
                  ) : null}
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
                  {/* Light-catching edge: specular top rim + soft inner ring */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.32),inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                  />
                  {/* Caption bar: flat glass (cards are 3D-transformed, so no backdrop blur in here).
                      Radius is concentric with the card (outer radius minus the inset). Sizes step up at
                      xl, where cards reach ~256px+ (card width follows the viewport, see `measure`). */}
                  <span className="glass-dark glass-flat absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-glass-sm py-2 pl-3 pr-2 xl:inset-x-3 xl:bottom-3 xl:gap-3 xl:rounded-[18px] xl:py-3 xl:pl-4 xl:pr-3">
                    <span className="min-w-0 font-display text-[0.9375rem] leading-tight text-bone [overflow-wrap:anywhere] xl:text-xl">
                      {item.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[0.625rem] font-medium tabular text-bone/85 ring-1 ring-inset ring-white/15 xl:h-7 xl:w-7 xl:text-[0.6875rem]"
                    >
                      0{i + 1}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button type="button" onClick={() => nudge(-1)} aria-label={prevLabel} className="btn-line-dark glass-flat h-[50px] w-[50px] p-0">
          <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.75} />
        </button>
        {/* Arrows are flat glass (static dark gradient behind: blur would be invisible cost).
            Capsule pagination: the active dot stretches into an aqua pill and glides (layout = transform). */}
        <ol aria-hidden="true" className="flex items-center gap-4 rounded-full bg-white/[0.05] px-5 py-3.5 ring-1 ring-inset ring-white/10">
          {items.map((item, i) => (
            <li key={item.id} className="relative h-2 w-2 rounded-full bg-bone/25">
              {i === active ? (
                <motion.span
                  layoutId="carousel-dot"
                  className="absolute -inset-x-1.5 inset-y-0 rounded-full bg-aqua shadow-[0_0_10px_rgba(61,219,201,0.55)]"
                />
              ) : null}
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => nudge(1)} aria-label={nextLabel} className="btn-line-dark glass-flat h-[50px] w-[50px] p-0">
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
