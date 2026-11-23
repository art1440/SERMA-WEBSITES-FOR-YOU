"use client";

import { animate, motion, useMotionValue, useSpring, type AnimationPlaybackControls } from "framer-motion";
import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { DemoCard, DemoId } from "@/data/demos";
import { fill } from "@/i18n/types";
import { MOTION, SPRING_SMOOTH } from "@/lib/motion";

/**
 * "hover": scroll on mouse hover / keyboard focus. "auto": loop down and back up on its own while the prop
 * says so (the phone row's active card, section on screen). "off": rest at the top.
 */
export type WorkCardLive = "hover" | "auto" | "off";

type Props = {
  demo: DemoCard;
  onOpen: (id: DemoId) => void;
  live: WorkCardLive;
  /** Shared-layout grow into the preview (off under reduced motion / Pause: the preview fades instead). */
  morph?: boolean;
  /**
   * Phones: the picture itself is a shared element too (`work-shot-<id>`). The preview there is much taller
   * than 16:10, so the page view's grow stretches non-uniformly; pairing the pictures (same aspect ratio)
   * keeps the screenshot undistorted while its window grows around it.
   */
  shotMorph?: boolean;
  /** Lift the card above its neighbours (the card the preview grows from / shrinks back into). */
  raised?: boolean;
  /** Set when the preview closes into this card: where the visitor had scrolled to (0..1 of the shot). */
  landing?: { ratio: number; n: number } | null;
};

/** About when the shrink has landed (SPRING_MORPH); the picture eases back to the top after that. */
export const LAND_MS = 380;

/** Hover-scroll speed (px/s of travel) and its duration bounds, per the gallery spec. */
const SPEED = 140;
const MIN_S = 4;
const MAX_S = 9;
/** Auto-scroll (phones): px/s of travel, duration bounds (s), the pause at each end (ms) and the trip back up. */
const AUTO_SPEED = 60;
const AUTO_MIN_S = 8;
const AUTO_MAX_S = 16;
const AUTO_HOLD_MS = 1200;
const AUTO_RETURN = { duration: 1.1, ease: [0.77, 0, 0.175, 1] } as const;
/** A pointer that travels this far (px) between down and up is a swipe / drag, not a tap. */
const TAP_SLOP = 8;
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
 * - Phones (`live="auto"` on the row's centred card): the picture loops down
 *   and back up on its own (see startAuto); the full-screen preview is not
 *   16:10, so the picture is shared too (`shotMorph`) and does not stretch.
 * - Tap vs swipe: a pointer click only opens if the pointer moved < 8 px
 *   between down and up (a cancelled pointer, i.e. a native scroll, never opens).
 */
export function WorkCard({ demo, onOpen, live, morph = true, shotMorph = false, raised = false, landing = null }: Props) {
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
  const prefetched = useRef(false);
  /**
   * True from the click that opens the preview until the shrink back has landed. The preview's root
   * stops catching the pointer as it exits, so the card sees enter / move / focus mid-shrink: tilting
   * (an ancestor of the shared view) or starting a glide then would skew the landing or overwrite the
   * handed-back scroll position.
   */
  const settling = useRef(false);
  const settleTimer = useRef(0);
  const setSettling = (on: boolean) => {
    settling.current = on;
    // Imperative attribute (no re-render): suppresses the hover rim while settling.
    if (on) buttonRef.current?.setAttribute("data-settling", "");
    else buttonRef.current?.removeAttribute("data-settling");
  };
  const liveRef = useRef(live);
  liveRef.current = live;
  const shotMorphRef = useRef(shotMorph && morph);
  shotMorphRef.current = shotMorph && morph;
  /** Auto loop: a token invalidates pending steps; the timer holds the pause at either end. */
  const autoToken = useRef(0);
  const autoOn = useRef(false);
  const autoTimer = useRef(0);
  /** Tap vs swipe: where the pointer went down, and whether it has since moved TAP_SLOP or more. */
  const press = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  const setLayerHint = (on: boolean) => {
    if (imgRef.current) imgRef.current.style.willChange = on ? "transform" : "";
  };

  const stopAuto = useCallback(() => {
    autoToken.current++;
    autoOn.current = false;
    window.clearTimeout(autoTimer.current);
  }, []);

  /**
   * Phone auto-scroll: hold at the top, glide down at ~60 px/s (8–16 s for the whole page, linear), hold
   * at the bottom, ease back up, repeat. Starts from wherever the picture is (e.g. handed back by the
   * preview). Same motion value as the hover glide; any other mode change cancels it via stopAuto.
   */
  const startAuto = useCallback(() => {
    stopAuto();
    anim.current?.stop();
    anim.current = null;
    wantDown.current = false;
    autoOn.current = true;
    const token = autoToken.current;
    const alive = () => token === autoToken.current;
    const hold = (next: () => void) => {
      autoTimer.current = window.setTimeout(() => alive() && next(), AUTO_HOLD_MS);
    };
    const down = () => {
      const total = travel.current;
      if (total <= 1) return; // the measure effect restarts the loop once the picture has a height
      const remaining = total + y.get();
      const fullS = Math.min(AUTO_MAX_S, Math.max(AUTO_MIN_S, total / AUTO_SPEED));
      setLayerHint(true);
      const a = animate(y, -total, { duration: Math.max(0, (fullS * remaining) / total), ease: "linear" });
      anim.current = a;
      a.then(() => {
        if (alive() && anim.current === a) hold(up);
      });
    };
    const up = () => {
      const a = animate(y, 0, AUTO_RETURN);
      anim.current = a;
      a.then(() => {
        if (alive() && anim.current === a) hold(down);
      });
    };
    if (y.get() > -0.5) hold(down);
    else down();
  }, [y, stopAuto]);

  /** Glide down from the current position at constant speed (duration scales with what is left). */
  const descend = useCallback(() => {
    stopAuto();
    wantDown.current = true;
    const total = travel.current;
    if (total <= 1) return;
    const remaining = total + y.get();
    if (remaining <= 0.5) return;
    const fullS = Math.min(MAX_S, Math.max(MIN_S, total / SPEED));
    anim.current?.stop();
    setLayerHint(true);
    anim.current = animate(y, -total, { duration: (fullS * remaining) / total, ease: "linear" });
  }, [y, stopAuto]);

  /** Ease back to the top from wherever the glide is (no jump). */
  const ascend = useCallback(() => {
    stopAuto();
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
  }, [y, stopAuto]);

  /** Snap everything to rest immediately (before the shared-layout snapshot, and when motion turns off). */
  const rest = useCallback(() => {
    stopAuto();
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
  }, [y, rotateX, rotateY, stopAuto]);

  // Travel = rendered image height minus the viewport height; re-measured on resize and image load.
  useEffect(() => {
    const vp = viewportRef.current;
    const img = imgRef.current;
    if (!vp || !img) return;
    const measure = () => {
      const next = Math.max(0, img.offsetHeight - vp.clientHeight);
      if (Math.abs(next - travel.current) < 0.5) return;
      travel.current = next;
      if (autoOn.current && !settling.current) startAuto();
      else if (wantDown.current) descend();
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
  }, [descend, startAuto, y]);

  // React to the live mode changing (Pause toggled, reduced motion, phone auto-scroll).
  const prevLive = useRef(live);
  useEffect(() => {
    const prev = prevLive.current;
    prevLive.current = live;
    // A phone card that stops being the live one (swiped away, section scrolled off) eases back to the top;
    // Pause / reduced motion (morph off) stop it dead at the top.
    if (live === "off") {
      if (prev === "auto" && morph) ascend();
      else rest();
    } else if (live === "auto") {
      // While settling (preview open or shrinking back) the landing effect restarts the loop.
      if (!settling.current) startAuto();
    } else if (hovered.current || buttonRef.current?.matches(":focus-visible")) descend();
    else ascend();
  }, [live, morph, rest, descend, ascend, startAuto]);

  // Closing into this card: show the picture where the preview was, then ease back to the top once landed
  // (or carry on gliding if the pointer / keyboard focus is still on the card).
  useEffect(() => {
    if (!landing) return;
    const img = imgRef.current;
    stopAuto();
    // With the picture shared (phones), the shrink carries it from where it was in the preview by itself:
    // offsetting it here as well would be counted twice.
    if (img && landing.ratio > 0 && liveRef.current !== "off" && !shotMorphRef.current) {
      anim.current?.stop();
      y.jump(-Math.min(travel.current, landing.ratio * img.offsetHeight));
      setLayerHint(true);
    }
    setSettling(true);
    // Deliberately not cleared when `landing` changes: no effect cleanup may end settling early (cleanups
    // run before the preview's focus restore, which would then start a glide mid-shrink).
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      setSettling(false);
      const engaged = hovered.current || buttonRef.current?.matches(":focus-visible");
      if (liveRef.current === "hover" && engaged) descend();
      else if (liveRef.current === "auto") startAuto();
      else ascend();
    }, LAND_MS);
  }, [landing, y, descend, ascend, startAuto, stopAuto]);

  useEffect(
    () => () => {
      anim.current?.stop();
      window.clearTimeout(settleTimer.current);
      autoToken.current++;
      window.clearTimeout(autoTimer.current);
    },
    [],
  );

  const prefetch = () => {
    if (prefetched.current) return;
    prefetched.current = true;
    const img = new Image();
    img.decoding = "async";
    img.src = shot.full;
  };

  const onPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    hovered.current = true;
    rect.current = e.currentTarget.getBoundingClientRect();
    prefetch();
    if (liveRef.current === "hover" && !settling.current) descend();
  };

  // Touch / pen only: a mouse click keeps the desktop behaviour (opens wherever the button was released).
  const trackPress = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "mouse") return;
    const p = press.current;
    if (p && !dragged.current && Math.hypot(e.clientX - p.x, e.clientY - p.y) >= TAP_SLOP) dragged.current = true;
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    press.current = e.pointerType === "mouse" ? null : { x: e.clientX, y: e.clientY };
    dragged.current = false;
  };

  const onPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    trackPress(e);
    press.current = null;
  };

  // The browser took the touch over for scrolling (a swipe along the row or down the page): never a tap.
  const onPointerCancel = () => {
    press.current = null;
    dragged.current = true;
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    trackPress(e);
    if (e.pointerType !== "mouse" || liveRef.current === "off" || settling.current) return;
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
    if (liveRef.current === "hover" && !settling.current && buttonRef.current?.matches(":focus-visible")) {
      prefetch();
      descend();
    }
  };

  const onBlur = () => {
    if (liveRef.current === "hover" && !hovered.current) ascend();
  };

  const open = (e: MouseEvent<HTMLButtonElement>) => {
    // Tap vs swipe: a pointer click only counts if the pointer stayed within TAP_SLOP between down and up.
    // Keyboard activation (Enter / Space: detail 0) always opens.
    const swiped = e.detail !== 0 && dragged.current;
    dragged.current = false;
    if (swiped) return;
    // Settling covers the whole open period too: focus is restored to this card (firing onFocus)
    // before the landing effect runs. A settle timer still pending from a fast close-and-reopen must not
    // end it early.
    window.clearTimeout(settleTimer.current);
    setSettling(true);
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
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`group relative block w-full rounded-[18px] text-left [perspective:1100px] ${raised ? "z-20" : "z-0"}`}
      style={{ ["--work-accent" as string]: demo.accent }}
    >
      <motion.span ref={tiltRef} data-work-tilt className="block" style={{ rotateX, rotateY }}>
        <span className="relative block rounded-[14px] bg-ink-900 shadow-[0_0_0_1px_rgb(var(--bone)/0.1),0_18px_40px_-24px_rgb(var(--shadow)/0.55)]">
          {/* Accent rim on hover / focus: opacity only. An outer ring, painted under the content, so it never
              lies over the page view while that grows into (or shrinks back from) the preview. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 shadow-[0_0_0_1.5px_var(--work-accent)] transition-opacity duration-300 ease-editorial group-hover:opacity-80 group-focus-visible:opacity-80 group-data-[settling]:!opacity-0"
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
            layoutCrossfade={!shotMorph}
            transition={{ layout: SPRING_MORPH }}
            // Pinned phone row: the gallery sets --work-view (taller, up to square, fitted to the screen height).
            className="relative block aspect-[16/10] overflow-hidden bg-ink-800 pan:aspect-auto pan:h-[var(--work-view)]"
            style={{ borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}
          >
            <motion.img
              ref={imgRef}
              data-work-shot
              layoutId={morph && shotMorph ? `work-shot-${demo.id}` : undefined}
              layoutCrossfade={false}
              transition={{ layout: SPRING_MORPH }}
              src={shot.small}
              width={shot.width}
              height={shot.height}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="block h-auto w-full select-none"
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
