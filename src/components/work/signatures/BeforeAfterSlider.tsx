"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";

/**
 * Brightline's signature: one cabinet, before and after, split by a yellow
 * handle the visitor drags.
 *
 * - The after photo sits on top of the before photo; a wrapper ([data-after])
 *   around it is clipped with clip-path: inset(0 (100 - v)% 0 0), so the
 *   repaired cabinet is revealed from the left as the handle moves right.
 *   The value is "how much of the picture is after": 62 reads "62% after".
 *   clip-path on that one wrapper is the only non-transform property written;
 *   the handle moves by transform. The "After" label lives inside the clipped
 *   wrapper and "Before" under it, so a label is only ever on its own photo.
 * - Track phase is 1:1: pointer events on the frame with setPointerCapture,
 *   values written straight to the DOM through refs (clip-path, transform,
 *   aria-valuenow, aria-valuetext). React state is committed once on release
 *   (and on each key press), never per pointermove.
 * - Mouse/pen: pressing anywhere on the photo jumps the handle there and drags.
 *   Touch: the frame is touch-action: pan-y, so a vertical swipe still scrolls
 *   the page; a horizontal drag (or a press on the knob) moves the handle, and
 *   a tap on the photo never jumps it. There is no wheel handler, so the wheel
 *   over the photo scrolls the page.
 * - Keyboard: the knob is role="slider" (focusable, 56px; focus ring = yellow gap + ink ring, readable on light and dark photo areas):
 *   Arrow keys +/-5, PageUp/PageDown +/-10, Home 0, End 100.
 * - The first time the photo is 60% in view it does one hint sweep,
 *   50 -> 62 -> 50 over 1.3 s, visual only (aria-valuenow stays 50). Skipped
 *   when reduced motion or Pause is on, and cancelled by any interaction.
 *   data-state is "idle" until the sweep has run (or been skipped), then "rest".
 * - Alignment: the after image was generated from the before and lands about
 *   4px (of 688) lower. The frame is cropped to 1024:672 and the two photos use
 *   object-position 50% 50% (before) and 50% 75% (after), which shifts the after
 *   photo 4px up relative to the before: hinges, sink and cabinet edges line up.
 *   Neither photo is ever drawn wider than its 1024px source (the frame is
 *   capped at 1024px).
 */

type Props = {
  before: DemoImage;
  after: DemoImage;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  /** Accessible name of the slider. */
  name: string;
  /** "{n}% after" */
  valueText: string;
  hint: string;
  sizes: string;
  className?: string;
};

const START = 50;
const SWEEP_TO = 62;
const SWEEP_MS = 1300;

const clamp = (v: number) => Math.min(100, Math.max(0, v));

export function BeforeAfterSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel,
  afterLabel,
  name,
  valueText,
  hint,
  sizes,
  className,
}: Props) {
  const still = useDemoStill();
  const [value, setValue] = useState(START);
  const [swept, setSwept] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(START);
  const touchedRef = useRef(false);
  const sweepRaf = useRef(0);
  const drag = useRef<{
    id: number;
    active: boolean;
    x0: number;
    touch: boolean;
  } | null>(null);

  const text = useCallback(
    (v: number) => valueText.replace("{n}", String(v)),
    [valueText],
  );

  /** Visual write: clip + handle position (fractional values allowed). */
  const paint = useCallback((v: number) => {
    if (afterRef.current)
      afterRef.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    if (trackRef.current)
      trackRef.current.style.transform = `translateX(${v}%)`;
  }, []);

  /** Value write: visuals + ARIA, no React render. */
  const write = useCallback(
    (raw: number) => {
      const v = Math.round(clamp(raw));
      valueRef.current = v;
      paint(v);
      const k = knobRef.current;
      if (k) {
        k.setAttribute("aria-valuenow", String(v));
        k.setAttribute("aria-valuetext", text(v));
      }
    },
    [paint, text],
  );

  const stopSweep = useCallback(() => {
    touchedRef.current = true;
    if (sweepRaf.current) {
      cancelAnimationFrame(sweepRaf.current);
      sweepRaf.current = 0;
      paint(valueRef.current);
    }
    setSwept(true);
  }, [paint]);

  // One hint sweep on first view (skipped when still).
  useEffect(() => {
    if (still || swept) return;
    const frame = frameRef.current;
    if (!frame) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || touchedRef.current)
          return;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / SWEEP_MS);
          // 0 -> 1 -> 0 with eased ends: sin^2 over half a turn.
          const s = Math.sin(Math.PI * p);
          paint(START + (SWEEP_TO - START) * s * s);
          if (p < 1) sweepRaf.current = requestAnimationFrame(step);
          else {
            sweepRaf.current = 0;
            paint(valueRef.current);
            setSwept(true);
          }
        };
        sweepRaf.current = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(frame);
    return () => {
      io.disconnect();
      if (sweepRaf.current) {
        cancelAnimationFrame(sweepRaf.current);
        sweepRaf.current = 0;
        paint(valueRef.current);
      }
    };
  }, [still, swept, paint]);

  const fromX = (clientX: number) => {
    const r = frameRef.current!.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * 100;
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    stopSweep();
    const onKnob = Boolean(
      (e.target as HTMLElement).closest('[role="slider"]'),
    );
    const touch = e.pointerType === "touch";
    drag.current = {
      id: e.pointerId,
      active: !touch || onKnob,
      x0: e.clientX,
      touch,
    };
    if (!touch || onKnob) {
      e.currentTarget.setPointerCapture(e.pointerId);
      if (!onKnob) write(fromX(e.clientX));
      if (!touch) e.preventDefault(); // no text selection / image drag
      knobRef.current?.focus({ preventScroll: true });
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.active) {
      // Touch on the photo: start only once the finger has clearly gone sideways
      // (vertical swipes are the browser's: touch-action: pan-y).
      if (Math.abs(e.clientX - d.x0) < 8) return;
      d.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    write(fromX(e.clientX));
  };

  const end = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (d.active) setValue(valueRef.current);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const v = valueRef.current;
    const next: Record<string, number> = {
      ArrowRight: v + 5,
      ArrowUp: v + 5,
      ArrowLeft: v - 5,
      ArrowDown: v - 5,
      PageUp: v + 10,
      PageDown: v - 10,
      Home: 0,
      End: 100,
    };
    if (!(e.key in next)) return;
    e.preventDefault();
    stopSweep();
    write(next[e.key]);
    setValue(valueRef.current);
  };

  const state = still || swept ? "rest" : "idle";

  return (
    <figure data-signature="service" data-state={state} className={className}>
      <div
        ref={frameRef}
        data-frame
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        className="relative mx-auto aspect-[1024/672] w-full max-w-[1024px] cursor-ew-resize select-none overflow-hidden rounded-[6px] bg-[#0C3A36] [touch-action:pan-y]"
      >
        {/* Before: underneath. */}
        <img
          src={before.src}
          srcSet={`${before.small} 640w, ${before.src} ${before.width}w`}
          sizes={sizes}
          width={before.width}
          height={before.height}
          alt={beforeAlt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 50%" }}
        />
        <span
          aria-hidden="true"
          className="demo-display absolute right-3 top-3 rounded-full bg-[#0C3A36] px-3 py-1.5 text-[0.875rem] font-semibold leading-none text-[#EAF6F4] sm:right-4 sm:top-4 sm:text-[1rem]"
        >
          {beforeLabel}
        </span>

        {/* After: on top, clipped from the right. */}
        <div
          ref={afterRef}
          data-after
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
        >
          <img
            src={after.src}
            srcSet={`${after.small} 640w, ${after.src} ${after.width}w`}
            sizes={sizes}
            width={after.width}
            height={after.height}
            alt={afterAlt}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 75%" }}
          />
          <span
            aria-hidden="true"
            className="demo-display absolute left-3 top-3 rounded-full bg-[#FFD23F] px-3 py-1.5 text-[0.875rem] font-semibold leading-none text-[#0C3A36] sm:left-4 sm:top-4 sm:text-[1rem]"
          >
            {afterLabel}
          </span>
        </div>

        {/* Handle: a full-width track moved by transform; the line and knob sit at its left edge. */}
        <div
          ref={trackRef}
          className="pointer-events-none absolute inset-0"
          style={{ transform: `translateX(${value}%)` }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[3px] -translate-x-1/2 bg-[#FFD23F] shadow-[0_0_0_1px_rgba(12,58,54,0.35)]"
          />
          <div
            ref={knobRef}
            role="slider"
            tabIndex={0}
            aria-label={name}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            aria-valuetext={text(value)}
            onKeyDown={onKeyDown}
            className="pointer-events-auto absolute left-0 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-[3px] border-[#0C3A36] bg-[#FFD23F] text-[#0C3A36] shadow-[0_6px_18px_-6px_rgba(12,58,54,0.55)] outline-none focus-visible:ring-[3px] focus-visible:ring-[#0C3A36] focus-visible:ring-offset-[3px] focus-visible:ring-offset-[#FFD23F] active:cursor-grabbing"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6L3 12L9 18M15 6L21 12L15 18" />
            </svg>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 text-[0.9375rem] text-[#3F625E]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 12"
          className="h-3 w-6 shrink-0"
          fill="none"
          stroke="#0A6B60"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 1L1 6L6 11M18 1L23 6L18 11M1 6H23" />
        </svg>
        {hint}
      </figcaption>
    </figure>
  );
}
