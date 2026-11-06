"use client";

import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";

const Engine3D = dynamic(() => import("./Engine3D"), { ssr: false });

/**
 * Fixed, full-screen backdrop shared by the transparent chapters (hero, system, finale).
 * Layer order (back → front):
 *   bone base → Higgsfield hero film (3D dive) → ink wash → Higgsfield architecture film → WebGL engine
 * Opaque chapters (dashboard, simulator, …) simply cover it; the engine's render loop
 * stops whenever none of the transparent chapters is on screen.
 */
export function Stage() {
  const { hero, system, finale, reduce, desktop } = useScene();
  const { paused } = useMotionPause();

  const ink = useTransform(hero.progress, [0.6, 0.9], [0, 1]);
  const filmOpacity = useTransform(hero.progress, [0.36, 0.48, 0.86, 0.97], [0, 1, 1, 0]);
  const filmScale = useTransform(hero.progress, [0.36, 0.8], [0.22, 1.08]);
  const filmRotateX = useTransform(hero.progress, [0.36, 0.8], [32, 0]);
  const filmRotateZ = useTransform(hero.progress, [0.36, 0.8], [-6, 0]);
  const archOpacity = useTransform(system.progress, [0, 0.1, 0.9, 1], [0, 0.32, 0.32, 0]);

  const [active, setActive] = useState(false);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(Boolean(c.getContext("webgl2") || c.getContext("webgl")));
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

  if (reduce) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-bone" />

      {/* Hero film: flies up out of depth and fills the screen — the camera "dives" into it. */}
      <div className="absolute inset-0 [perspective:1100px]">
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: filmOpacity, scale: filmScale, rotateX: filmRotateX, rotateZ: filmRotateZ }}
        >
          <LayerVideo src="/media/hero" poster="/media/hero-poster.jpg" visibility={filmOpacity} paused={paused} />
          <div className="absolute inset-0 bg-ink/45" />
        </motion.div>
      </div>

      <motion.div className="absolute inset-0 bg-ink" style={{ opacity: ink }} />

      <motion.div className="absolute inset-0" style={{ opacity: archOpacity }}>
        <LayerVideo src="/media/architecture" poster="/media/architecture-poster.jpg" visibility={archOpacity} paused={paused} />
      </motion.div>

      {webgl ? (
        <Engine3D
          active={active && !paused}
          desktop={desktop}
          hero={hero.progress}
          system={system.progress}
          finale={finale.progress}
          ink={ink}
        />
      ) : null}
    </div>
  );
}

/** A backdrop film that only decodes/plays while its layer is visible. */
function LayerVideo({
  src,
  poster,
  visibility,
  paused,
}: {
  src: string;
  poster: string;
  visibility: MotionValue<number>;
  paused: boolean;
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
      className="absolute inset-0 h-full w-full object-cover"
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
