"use client";

import { useMotionValue, useReducedMotion, useScroll, type MotionValue } from "framer-motion";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/**
 * Scroll "chapters". Each pinned chapter is a tall track with a sticky stage;
 * its scroll progress (0 → 1) is exposed as a MotionValue, so the 3D engine
 * and CSS-3D choreography read it every frame WITHOUT React re-renders.
 */
type Chapter = { ref: RefObject<HTMLElement | null>; progress: MotionValue<number> };

type SceneValue = {
  hero: Chapter;
  system: Chapter;
  finale: Chapter;
  /** True when the visitor prefers reduced motion → chapters render static, unpinned. */
  reduce: boolean;
  /** True on wide screens (≥1024px) where heavy UI chapters pin. Updated on resize only. */
  desktop: boolean;
};

const SceneContext = createContext<SceneValue | null>(null);

function useChapter(offset: ["start start", "end end"] | ["start end", "end end"]): Chapter {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return { ref, progress: scrollYProgress };
}

export function SceneProvider({ children }: { children: ReactNode }) {
  const hero = useChapter(["start start", "end end"]);
  const system = useChapter(["start start", "end end"]);
  const finale = useChapter(["start end", "end end"]);
  const reduce = Boolean(useReducedMotion());
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return <SceneContext.Provider value={{ hero, system, finale, reduce, desktop }}>{children}</SceneContext.Provider>;
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
  return { ref, progress: scrollYProgress };
}

/** A MotionValue pinned at a constant — used when motion is reduced or a chapter is unpinned. */
export function useStatic(value: number) {
  return useMotionValue(value);
}
