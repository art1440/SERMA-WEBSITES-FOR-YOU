"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Site-wide "Pause animations" switch (WCAG 2.2.2 Pause, Stop, Hide).
 * Stops the 3D engine's render loop and every looping video. Kept in memory only.
 */
type MotionPauseValue = { paused: boolean; toggle: () => void };

const MotionPauseContext = createContext<MotionPauseValue>({ paused: false, toggle: () => undefined });

export function MotionPauseProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const value = useMemo(() => ({ paused, toggle: () => setPaused((p) => !p) }), [paused]);
  return <MotionPauseContext.Provider value={value}>{children}</MotionPauseContext.Provider>;
}

export const useMotionPause = () => useContext(MotionPauseContext);
