"use client";

import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";
import { LightThreads } from "./LightThreads";

/**
 * Fixed, full-screen backdrop behind the transparent chapters.
 * Layer order (back → front): sky base → light threads (whole page) → soft edge light.
 * Every section sits on a translucent ink wash, so the threads glow faintly through.
 */
export function Stage() {
  const { reduce, desktop } = useScene();
  const { paused } = useMotionPause();

  if (reduce) return null;

  return (
    // h-lvh: the backdrop keeps the large-viewport height, so the phone URL bar sliding in/out
    // never resizes (and re-renders) the threads canvas mid-scroll.
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-screen h-lvh overflow-hidden">
      {/* Base ground (morning sky in light, deep navy in dark), with a soft blue light pooling from the top right. */}
      <div
        className="absolute inset-0 bg-ink"
        style={{
          backgroundImage:
            "radial-gradient(90% 70% at 85% 0%, rgb(var(--amber) / 0.55), transparent 70%), radial-gradient(70% 60% at 0% 100%, rgb(var(--sand) / 0.7), transparent 70%)",
        }}
      />

      {/* Light threads run behind every section; translucent sections let them glow through. */}
      <LightThreads paused={paused} desktop={desktop} />

      {/* Soft sky-blue edge light (static): frames the scene without darkening it. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 55% 50%, transparent 55%, rgb(var(--ink-500) / 0.55) 100%)" }}
      />
    </div>
  );
}
