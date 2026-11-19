"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Site-wide "Pause animations" switch (WCAG 2.2.2 Pause, Stop, Hide).
 * Stops the 3D engine's render loop, every looping video and CSS keyframe loops. Kept in memory only.
 */
type MotionPauseValue = { paused: boolean; toggle: () => void };

const MotionPauseContext = createContext<MotionPauseValue>({ paused: false, toggle: () => undefined });

export function MotionPauseProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const value = useMemo(() => ({ paused, toggle: () => setPaused((p) => !p) }), [paused]);
  // Lets CSS freeze keyframe loops too (see globals.css: html[data-motion-paused]).
  useEffect(() => {
    document.documentElement.dataset.motionPaused = String(paused);
  }, [paused]);
  return <MotionPauseContext.Provider value={value}>{children}</MotionPauseContext.Provider>;
}

export const useMotionPause = () => useContext(MotionPauseContext);
