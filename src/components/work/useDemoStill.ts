"use client";

import { useMotionPause } from "@/context/MotionPauseContext";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * True when a demo must render its final, motionless state: the visitor prefers
 * reduced motion, or the site-wide Pause switch is on. Checked explicitly (not
 * left to MotionConfig) because MotionConfig still runs opacity animations.
 */
export function useDemoStill(): boolean {
  const reduce = useReducedMotionSafe();
  const { paused } = useMotionPause();
  return reduce || paused;
}
