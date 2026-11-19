"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useScene } from "@/context/SceneContext";
import { useTabs } from "@/context/TabsContext";
import { asset } from "@/lib/asset";
import { HERO_BEATS } from "@/lib/motion";
import { LightThreads } from "./LightThreads";

const Engine3D = dynamic(() => import("./Engine3D"), { ssr: false });

/** The film was shot dark: inverted for the light scheme, shown as shot in dark mode. */
const FILM_LIGHT = "[filter:invert(1)_hue-rotate(180deg)_saturate(0.85)_brightness(1.04)] dark:[filter:none]";

/**
 * Fixed, full-screen backdrop shared by the transparent chapters (hero, system, finale).
 * Light (white + sky blue). Layer order (back → front):
 *   sky base → light threads (whole page) → architecture film → WebGL engine
 * The film was shot dark; it is shown "developed" (inverted, hue kept) so it reads as
 * a pale blue-and-white page instead of a navy one.
 * The architecture film is the ambient "site being built" layer: faint behind the hero's first
 * screen, then behind How it works.
 * Opaque chapters (dashboard, simulator, …) simply cover it; the engine's render loop
 * stops whenever none of the transparent chapters is on screen.
 */
export function Stage() {
  const scene = useScene();
  const { system, reduce, desktop } = scene;
  const { paused } = useMotionPause();
  const tabs = useTabs();
  const activeTab = tabs?.active ?? "home";

  // Tabs: a hidden chapter's scroll track can't be measured, so off-tab the hero reads as
  // finished (1) and the finale as not yet reached (0) — the poses they had on the long page.
  const onHero = useMotionValue(activeTab === "home" ? 1 : 0);
  const onFinale = useMotionValue(activeTab === "pricing" ? 1 : 0);
  useEffect(() => {
    onHero.set(activeTab === "home" ? 1 : 0);
    onFinale.set(activeTab === "pricing" ? 1 : 0);
  }, [activeTab, onHero, onFinale]);
  const heroProgress = useTransform([scene.hero.progress, onHero], ([p, on]: number[]) => (on ? p : 1));
  const heroRaw = useTransform([scene.hero.raw, onHero], ([p, on]: number[]) => (on ? p : 1));
  const finaleProgress = useTransform([scene.finale.progress, onFinale], ([p, on]: number[]) => (on ? p : 0));
  const hero = { ref: scene.hero.ref, progress: heroProgress, raw: heroRaw };
  const finale = { ref: scene.finale.ref, progress: finaleProgress };

  // The site is light (white + sky blue): the engine reads 0 = light backdrop.
  const ink = useMotionValue(0);
  // The ambient "site being built" film: dimly behind the hero's first screen (gone before the
  // statement emerges), then again behind How it works while its steps play.
  // It eases in just after the headline (never in the server-rendered first paint, and its decode waits
  // until the page has settled). Raw scroll, not the spring, so a mid-page load never flashes it.
  const archIntro = useMotionValue(0);
  useEffect(() => {
    const controls = animate(archIntro, 1, { delay: 0.6, duration: 1.4, ease: "easeOut" });
    return () => controls.stop();
  }, [archIntro]);
  // Reads hero.raw (not the spring) so a mid-page load never flashes the film.
  const archHeroBase = useTransform(hero.raw, [0, 0.37, HERO_BEATS.statementIn], [0.24, 0.24, 0]);
  const archHero = useTransform([archHeroBase, archIntro], ([h, k]: number[]) => h * k);
  const archSystem = useTransform(system.progress, [0, 0.1, 0.9, 1], [0, 0.32, 0.32, 0]);
  const archOpacity = useTransform([archHero, archSystem], ([h, s]: number[]) => Math.max(h, s));
  // During the hero the film is masked away from the copy: on desktop it fades in from the left (the
  // headline side), on phones it stays at the top behind the sculpture. The flag flips once, while the
  // film is invisible between its two uses.
  const [archInHero, setArchInHero] = useState(true);
  useMotionValueEvent(hero.raw, "change", (v) => {
    // flips while the film is invisible: on Home it is 0 from raw ≥ HERO_BEATS.statementIn
    const inHero = v < 0.8;
    if (inHero !== archInHero) setArchInHero(inHero);
  });

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

      <motion.div
        className={`absolute inset-0 ${
          archInHero
            ? "max-lg:[mask-image:linear-gradient(to_bottom,#000_0%,#000_16%,transparent_30%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,transparent_54%,#000_70%)]"
            : ""
        }`}
        style={{ opacity: archOpacity }}
      >
        {/* Phones show a narrow strip of the frame: aim it at the lit pages on the right. */}
        <LayerVideo
          src={asset("/media/architecture-v2")}
          poster={asset("/media/architecture-v2-poster.jpg")}
          visibility={archOpacity}
          paused={paused}
          className={`max-lg:object-[72%_50%] ${FILM_LIGHT}`}
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

      {/* Soft sky-blue edge light (static): frames the scene without darkening it. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 55% 50%, transparent 55%, rgb(var(--ink-500) / 0.55) 100%)" }}
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
