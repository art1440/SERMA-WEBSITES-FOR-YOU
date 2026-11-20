"use client";

import { useMotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";
import { LightThreads } from "./LightThreads";

const Engine3D = dynamic(() => import("./Engine3D"), { ssr: false });

/**
 * Fixed, full-screen backdrop behind the transparent chapters.
 * Light (white + sky blue). Layer order (back → front): sky base → light threads (whole page) → WebGL engine.
 * The hero is static and does not run the engine; the finale (pricing) does.
 * Opaque chapters (dashboard, simulator, …) simply cover it; the engine's render loop
 * stops whenever none of the transparent chapters is on screen.
 */
export function Stage() {
  const scene = useScene();
  const { system, reduce, desktop } = scene;
  const { paused } = useMotionPause();

  const finale = { ref: scene.finale.ref, progress: scene.finale.progress };

  // The hero is static now: the engine always sees it as finished.
  const heroDone = useMotionValue(1);
  // The site is light (white + sky blue): the engine reads 0 = light backdrop.
  const ink = useMotionValue(0);

  const [active, setActive] = useState(false);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const g = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
      setWebgl(Boolean(g));
      // Release the probe context now, instead of a later GC teardown stalling the GPU.
      g?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebgl(false);
    }
  }, []);

  // Render the engine only while a 3D chapter is (nearly) on screen.
  useEffect(() => {
    const els = [system.ref.current, finale.ref.current].filter(Boolean) as Element[];
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setActive(visible.size > 0);
      },
      { rootMargin: "15% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [system.ref, finale.ref]);

  // Keep the engine moving through its 500ms fade-out (a frozen frame dissolving reads as a hitch).
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (active) {
      setRunning(true);
      return;
    }
    const id = window.setTimeout(() => setRunning(false), 550);
    return () => window.clearTimeout(id);
  }, [active]);

  if (reduce) return null;

  return (
    // h-lvh: the backdrop keeps the large-viewport height, so the phone URL bar sliding in/out
    // never resizes (and re-renders) the two canvases mid-scroll.
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

      {/* The engine's last frame stays on its canvas when it stops, so hide it off-chapter. */}
      {webgl ? (
        <div className={`absolute inset-0 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
        <Engine3D
          active={running && !paused}
          desktop={desktop}
          hero={heroDone}
          system={system.progress}
          finale={finale.progress}
          ink={ink}
        />
        </div>
      ) : null}

      {/* Soft sky-blue edge light (static): frames the scene without darkening it. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 55% 50%, transparent 55%, rgb(var(--ink-500) / 0.55) 100%)" }}
      />
    </div>
  );
}
