"use client";

import { useMotionPause } from "@/context/MotionPauseContext";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { useDemoCapture } from "./captureContext";

/**
 * True when a demo must render its final, motionless state: the visitor prefers
 * reduced motion, the site-wide Pause switch is on, or the page is being
 * captured for the gallery (?capture=1). Checked explicitly (not
 * left to MotionConfig) because MotionConfig still runs opacity animations.
 */
export function useDemoStill(): boolean {
  const reduce = useReducedMotionSafe();
  const { paused } = useMotionPause();
  const capture = useDemoCapture();
  return reduce || paused || capture;
}
