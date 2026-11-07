"use client";

import { useMotionValue, useScroll, useSpring, type MotionValue } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * Scroll "chapters". Each pinned chapter is a tall track with a sticky stage;
 * its scroll progress (0 → 1) is exposed as a MotionValue, so the 3D engine
 * and CSS-3D choreography read it every frame WITHOUT React re-renders.
 */
type Chapter = {
  ref: RefObject<HTMLElement | null>;
  /** Smoothed (cinematic spring) — for motion. */
  progress: MotionValue<number>;
  /** Unsmoothed — for things that must never lag, like the backdrop colour behind text. */
  raw: MotionValue<number>;
};

type SceneValue = {
  hero: Chapter;
  system: Chapter;
  finale: Chapter;
  /** True when the visitor prefers reduced motion → chapters render static, unpinned. */
  reduce: boolean;
  /** True on wide screens (≥1024px): desktop layouts, and the chapters that pin there. Updated on resize only. */
  desktop: boolean;
  /**
   * True when the window is wide AND tall enough (≥1280×840) for the dashboard
   * to pin and still render near full size. Same query as the `pin:` Tailwind
   * variant (tailwind.config.ts), so CSS and JS agree. Updated on resize only.
   */
  pin: boolean;
};

const SceneContext = createContext<SceneValue | null>(null);

function useChapter(offset: ["start start", "end end"] | ["start end", "end end"]): Chapter {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  // Cinematic smoothing: filters trackpad/wheel jitter and gives scroll-linked motion weight.
  const progress = useSpring(scrollYProgress, MOTION.cinematic);
  return { ref, progress, raw: scrollYProgress };
}

export function SceneProvider({ children }: { children: ReactNode }) {
  const hero = useChapter(["start start", "end end"]);
  const system = useChapter(["start start", "end end"]);
  const finale = useChapter(["start end", "end end"]);
  const reduce = useReducedMotionSafe();
  const [desktop, setDesktop] = useState(false);
  const [pin, setPin] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px) and (min-height: 840px)");
    const update = () => setPin(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return <SceneContext.Provider value={{ hero, system, finale, reduce, desktop, pin }}>{children}</SceneContext.Provider>;
}

export function useScene(): SceneValue {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene must be used inside <SceneProvider>.");
  return ctx;
}

/** Progress of any element's own pinned track (start start → end end). */
export function useTrackProgress() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, MOTION.cinematic);
  return { ref, progress };
}

/** A MotionValue pinned at a constant — used when motion is reduced or a chapter is unpinned. */
export function useStatic(value: number) {
  return useMotionValue(value);
}
