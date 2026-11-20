"use client";

import { animate, motion, useMotionValue, useSpring, type AnimationPlaybackControls } from "framer-motion";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { DemoCard, DemoId } from "@/data/demos";
import { fill } from "@/i18n/types";
import { MOTION, SPRING_SMOOTH } from "@/lib/motion";

/** "hover": scroll on mouse hover / keyboard focus. "auto": scroll while the prop says so (phones). "off": rest at the top. */
export type WorkCardLive = "hover" | "auto" | "off";

type Props = {
  demo: DemoCard;
  onOpen: (id: DemoId) => void;
  live: WorkCardLive;
  /** Shared-layout grow into the preview (off under reduced motion / Pause: the preview fades instead). */
  morph?: boolean;
  /** Lift the card above its neighbours (the card the preview grows from / shrinks back into). */
  raised?: boolean;
  /** Set when the preview closes into this card: where the visitor had scrolled to (0..1 of the shot). */
  landing?: { ratio: number; n: number } | null;
};

/** About when the shrink has landed (SPRING_MORPH); the picture eases back to the top after that. */
const LAND_MS = 380;

/** Hover-scroll speed (px/s of travel) and its duration bounds, per the gallery spec. */
const SPEED = 140;
const MIN_S = 4;
const MAX_S = 9;
/**
 * The captures carry the demo page's 15 px scrollbar lane at their right edge
 * (content is 1265 of 1280 px). Widen the image so the lane falls outside the
 * clipped viewport. Remove once the shots are re-captured without it.
 */
export const SHOT_WIDTH = "w-[101.1858%] max-w-none"; // 1280 / 1265

/** Max pointer tilt, degrees. */
const TILT_X = 7;
const TILT_Y = 9;

/** The browser-window chrome shared by the card and the preview (dots + address). */
export function FrameDots() {
  return (
    <span aria-hidden="true" className="flex shrink-0 gap-1.5">
      <span className="h-2 w-2 rounded-full bg-bone/25" />
      <span className="h-2 w-2 rounded-full bg-bone/25" />
      <span className="h-2 w-2 rounded-full bg-bone/25" />
    </span>
  );
}

/**
 * One gallery card: a small browser window showing the top of the demo's
 * full-page screenshot, the business name and trade below.
 *
 * Motion (transform only, no React state per frame):
 * - Hover / keyboard focus: the screenshot glides up through the whole page at
 *   a constant ~140 px/s (`animate()` linear on a motion value). Leaving eases it
 *   back to the top with the smooth spring, from wherever it is; re-entering
 *   resumes the glide from there.
 * - Mouse tilt: the window leans toward the pointer (up to 7° / 9°) on snappy
 *   springs and springs back flat on leave. Nothing inside the tilted element
 *   uses backdrop-filter.
 * - Open: tilt and scroll snap to rest, then the page view (layoutId
 *   `work-frame-<id>`, 16:10 like the preview's) grows into the preview.
 */
export function WorkCard({ demo, onOpen, live, morph = true, raised = false, landing = null }: Props) {
  const { t, locale } = useLanguage();
  const g = t.work.gallery;
  const shot = demo.shots[locale];

  const buttonRef = useRef<HTMLButtonElement>(null);
  const tiltRef = useRef<HTMLSpanElement>(null);
  const viewportRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const y = useMotionValue(0);
  const rotateX = useSpring(0, MOTION.snappy);
  const rotateY = useSpring(0, MOTION.snappy);

  const travel = useRef(0);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const wantDown = useRef(false);
  const hovered = useRef(false);
  const rect = useRef<DOMRect | null>(null);
  const liveRef = useRef(live);
  liveRef.current = live;

  const setLayerHint = (on: boolean) => {
    if (imgRef.current) imgRef.current.style.willChange = on ? "transform" : "";
  };

  /** Glide down from the current position at constant speed (duration scales with what is left). */
  const descend = useCallback(() => {
    wantDown.current = true;
    const total = travel.current;
    if (total <= 1) return;
    const remaining = total + y.get();
    if (remaining <= 0.5) return;
    const fullS = Math.min(MAX_S, Math.max(MIN_S, total / SPEED));
    anim.current?.stop();
    setLayerHint(true);
    anim.current = animate(y, -total, { duration: (fullS * remaining) / total, ease: "linear" });
  }, [y]);

  /** Ease back to the top from wherever the glide is (no jump). */
  const ascend = useCallback(() => {
    wantDown.current = false;
    anim.current?.stop();
    if (Math.abs(y.get()) < 0.5) {
      y.set(0);
      setLayerHint(false);
      return;
    }
    setLayerHint(true);
    const a = animate(y, 0, SPRING_SMOOTH);
    anim.current = a;
    a.then(() => {
      if (anim.current === a) setLayerHint(false);
    });
  }, [y]);

  /** Snap everything to rest immediately (before the shared-layout snapshot, and when motion turns off). */
  const rest = useCallback(() => {
    wantDown.current = false;
    anim.current?.stop();
    anim.current = null;
    y.jump(0);
    rotateX.jump(0);
    rotateY.jump(0);
    // Write the DOM now: the layout snapshot is taken before the next animation frame renders the values.
    if (imgRef.current) imgRef.current.style.transform = "none";
    if (tiltRef.current) tiltRef.current.style.transform = "none";
    setLayerHint(false);
  }, [y, rotateX, rotateY]);

  // Travel = rendered image height minus the viewport height; re-measured on resize and image load.
  useEffect(() => {
    const vp = viewportRef.current;
    const img = imgRef.current;
    if (!vp || !img) return;
    const measure = () => {
      const next = Math.max(0, img.offsetHeight - vp.clientHeight);
      if (Math.abs(next - travel.current) < 0.5) return;
      travel.current = next;
      if (wantDown.current) descend();
      else if (y.get() < -next) y.set(-next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    ro.observe(img);
    img.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      img.removeEventListener("load", measure);
    };
  }, [descend, y]);

  // React to the live mode changing (Pause toggled, reduced motion, phone auto-scroll).
  useEffect(() => {
    if (live === "off") rest();
    else if (live === "auto") descend();
    else if (hovered.current || buttonRef.current?.matches(":focus-visible")) descend();
    else ascend();
  }, [live, rest, descend, ascend]);

  // Closing into this card: show the picture where the preview was, then ease back to the top once landed
  // (or carry on gliding if the pointer / keyboard focus is still on the card).
  useEffect(() => {
    if (!landing) return;
    const img = imgRef.current;
    if (img && landing.ratio > 0 && liveRef.current !== "off") {
      anim.current?.stop();
      y.jump(-Math.min(travel.current, landing.ratio * img.offsetHeight));
      setLayerHint(true);
    }
    const id = window.setTimeout(() => {
      const engaged = hovered.current || buttonRef.current?.matches(":focus-visible");
      if (liveRef.current === "hover" && engaged) descend();
      else if (liveRef.current !== "auto") ascend();
    }, LAND_MS);
    return () => window.clearTimeout(id);
  }, [landing, y, descend, ascend]);

  useEffect(() => () => anim.current?.stop(), []);

  const prefetch = () => {
    const img = new Image();
    img.decoding = "async";
    img.src = shot.full;
  };

  const onPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    hovered.current = true;
    rect.current = e.currentTarget.getBoundingClientRect();
    prefetch();
    if (liveRef.current === "hover") descend();
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse" || liveRef.current === "off") return;
    const r = rect.current ?? (rect.current = e.currentTarget.getBoundingClientRect());
    const px = Math.min(0.5, Math.max(-0.5, (e.clientX - r.left) / r.width - 0.5));
    const py = Math.min(0.5, Math.max(-0.5, (e.clientY - r.top) / r.height - 0.5));
    rotateX.set(-py * TILT_X * 2);
    rotateY.set(px * TILT_Y * 2);
    if (tiltRef.current) tiltRef.current.style.willChange = "transform";
  };

  const onPointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    hovered.current = false;
    rect.current = null;
    rotateX.set(0);
    rotateY.set(0);
    if (tiltRef.current) tiltRef.current.style.willChange = "";
    if (liveRef.current === "hover" && !e.currentTarget.matches(":focus-visible")) ascend();
  };

  const onFocus = () => {
    // Keyboard focus only: a mouse click (or focus restored after closing the preview) must not start a glide.
    if (liveRef.current === "hover" && buttonRef.current?.matches(":focus-visible")) {
      prefetch();
      descend();
    }
  };

  const onBlur = () => {
    if (liveRef.current === "hover" && !hovered.current) ascend();
  };

  const open = () => {
    rest();
    onOpen(demo.id);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      data-work-card={demo.id}
      aria-label={fill(g.open, { business: demo.business })}
      onClick={open}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`group relative block w-full rounded-[18px] text-left [perspective:1100px] ${raised ? "z-20" : "z-0"}`}
      style={{ ["--work-accent" as string]: demo.accent }}
    >
      <motion.span ref={tiltRef} className="block" style={{ rotateX, rotateY }}>
        <span className="relative block rounded-[14px] bg-ink-900 shadow-[0_0_0_1px_rgb(var(--bone)/0.1),0_18px_40px_-24px_rgb(var(--shadow)/0.55)]">
          {/* Accent rim on hover / focus: opacity only. An outer ring, painted under the content, so it never
              lies over the page view while that grows into (or shrinks back from) the preview. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_0_0_1.5px_var(--work-accent)] transition-opacity duration-300 ease-editorial group-hover:opacity-80 group-focus-visible:opacity-80"
          />
          <span className="flex h-8 items-center gap-3 rounded-t-[14px] border-b border-bone/10 bg-ink-800 px-3">
            <FrameDots />
            <span className="min-w-0 flex-1 truncate rounded-full bg-ink-900 px-3 py-0.5 text-center text-[0.75rem] font-medium text-ash">
              {demo.pitchDomain}
            </span>
            <span aria-hidden="true" className="w-[1.875rem] shrink-0" />
          </span>
          {/* The shared element: a 16:10 page view, the same shape as the preview's, so the grow never stretches.
              The frame does not clip it (it rounds its own corners), so mid-shrink it can sit exactly under the preview. */}
          <motion.span
            ref={viewportRef}
            data-work-viewport
            layoutId={morph ? `work-frame-${demo.id}` : undefined}
            transition={{ layout: SPRING_MORPH }}
            className="relative block aspect-[16/10] overflow-hidden bg-ink-800"
            style={{ borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}
          >
            <motion.img
              ref={imgRef}
              data-work-shot
              src={shot.small}
              width={shot.width}
              height={shot.height}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className={`block h-auto select-none ${SHOT_WIDTH}`}
              style={{ y }}
            />
          </motion.span>
        </span>
      </motion.span>
      <span className="mt-4 flex items-baseline justify-between gap-3 px-1">
        <span className="font-display text-lg leading-tight text-bone">{demo.business}</span>
        <span className="shrink-0 text-sm text-ash">{fill(g.demoTag, { tag: demo.tag[locale] })}</span>
      </span>
    </button>
  );
}

/** The grow / shrink between card and preview (mirrors MockupModal's open spring: quick, no overshoot). */
export const SPRING_MORPH = { type: "spring", stiffness: 360, damping: 34, mass: 0.9 } as const;
