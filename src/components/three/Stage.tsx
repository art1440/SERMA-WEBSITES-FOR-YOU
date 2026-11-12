"use client";

import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";
import { asset } from "@/lib/asset";
import { LightThreads } from "./LightThreads";

const Engine3D = dynamic(() => import("./Engine3D"), { ssr: false });

/**
 * Fixed, full-screen backdrop shared by the transparent chapters (hero, system, finale).
 * Dark-first. Layer order (back → front):
 *   ink base → light threads (whole page) → hero film (3D dive) → architecture film → WebGL engine
 * The architecture film is the ambient "site being built" layer: faint behind the hero's first
 * screen, then behind How it works.
 * Opaque chapters (dashboard, simulator, …) simply cover it; the engine's render loop
 * stops whenever none of the transparent chapters is on screen.
 */
export function Stage() {
  const { hero, system, finale, reduce, desktop } = useScene();
  const { paused } = useMotionPause();

  // The site is dark from the first frame (the engine reads 1 = ink backdrop).
  const ink = useMotionValue(1);
  const filmOpacity = useTransform(hero.progress, [0.36, 0.48, 0.86, 0.97], [0, 1, 1, 0]);
  const filmScale = useTransform(hero.progress, [0.36, 0.8], [0.22, 1.08]);
  const filmRotateX = useTransform(hero.progress, [0.36, 0.8], [32, 0]);
  const filmRotateZ = useTransform(hero.progress, [0.36, 0.8], [-6, 0]);
  // The ambient "site being built" film: dimly behind the hero's first screen (gone before the
  // hero film flies in), then again behind How it works while its steps play.
  const archHero = useTransform(hero.progress, [0, 0.26, 0.38], [0.24, 0.24, 0]);
  const archSystem = useTransform(system.progress, [0, 0.1, 0.9, 1], [0, 0.32, 0.32, 0]);
  const archOpacity = useTransform([archHero, archSystem], ([h, s]: number[]) => Math.max(h, s));
  // On phones the first-screen copy covers the lower half, so there the film is masked to the top
  // (behind the sculpture). The flag flips once, while the film is invisible between the two uses.
  const [archInHero, setArchInHero] = useState(true);
  useMotionValueEvent(hero.progress, "change", (v) => {
    const inHero = v < 0.5;
    if (inHero !== archInHero) setArchInHero(inHero);
  });
  // Vignette deepens on the dark chapters.
  const vignetteOpacity = useTransform(ink, [0, 1], [0, 0.85]);

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
    const els = [hero.ref.current, system.ref.current, finale.ref.current].filter(Boolean) as Element[];
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
  }, [hero.ref, system.ref, finale.ref]);

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
      <div className="absolute inset-0 bg-ink" />

      {/* Light threads run behind every section; translucent sections let them glow through. */}
      <LightThreads paused={paused} desktop={desktop} />

      {/* Hero film: flies up out of depth and fills the screen — the camera "dives" into it. */}
      <div className="absolute inset-0 [perspective:1100px]">
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: filmOpacity, scale: filmScale, rotateX: filmRotateX, rotateZ: filmRotateZ }}
        >
          <LayerVideo src={asset("/media/hero")} poster={asset("/media/hero-poster.jpg")} visibility={filmOpacity} paused={paused} />
          <div className="absolute inset-0 bg-ink/45" />
        </motion.div>
      </div>

      <motion.div
        className={`absolute inset-0 ${archInHero ? "max-lg:[mask-image:linear-gradient(to_bottom,#000_0%,#000_30%,transparent_52%)]" : ""}`}
        style={{ opacity: archOpacity }}
      >
        {/* Phones show a narrow strip of the frame: aim it at the lit pages on the right. */}
        <LayerVideo
          src={asset("/media/architecture")}
          poster={asset("/media/architecture-poster.jpg")}
          visibility={archOpacity}
          paused={paused}
          className="max-lg:object-[72%_50%]"
        />
      </motion.div>

      {/* The engine's last frame stays on its canvas when it stops, so hide it off-chapter. */}
      {webgl ? (
        <div className={`absolute inset-0 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
        <Engine3D
          active={running && !paused}
          desktop={desktop}
          hero={hero.progress}
          system={system.progress}
          finale={finale.progress}
          ink={ink}
        />
        </div>
      ) : null}

      {/* Vignette (transform/opacity only) */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: vignetteOpacity, background: "radial-gradient(ellipse at 55% 50%, transparent 45%, rgba(13,13,11,0.75) 100%)" }}
      />
    </div>
  );
}

/** A backdrop film that only decodes/plays while its layer is visible. */
function LayerVideo({
  src,
  poster,
  visibility,
  paused,
  className = "",
}: {
  src: string;
  poster: string;
  visibility: MotionValue<number>;
  paused: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  const sync = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    const show = visibility.get() > 0.02 && !paused && document.visibilityState === "visible";
    if (show && v.paused) v.play().catch(() => undefined);
    else if (!show && !v.paused) v.pause();
  }, [visibility, paused]);

  useMotionValueEvent(visibility, "change", sync);

  useEffect(() => {
    if (ref.current) ref.current.muted = true;
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [sync]);

  return (
    <video
      ref={ref}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      tabIndex={-1}
    >
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
}
