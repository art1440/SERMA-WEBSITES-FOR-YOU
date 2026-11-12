"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Props = {
  /** Path without extension — expects `${src}.webm` and `${src}.mp4`. */
  src: string;
  poster: string;
  /** Text alternative describing the visual (exposed as role="img"). */
  label: string;
  className?: string;
  videoClassName?: string;
  /** Controlled pause state (lets a parent keep one toggle across cross-fading videos). */
  paused?: boolean;
  showControl?: boolean;
  onPausedChange?: (paused: boolean) => void;
  controlClassName?: string;
};

/**
 * Zero-jank ambient loop:
 *  - muted / playsInline / loop / preload="metadata"
 *  - plays ONLY while on screen (IntersectionObserver) and while the tab is visible
 *  - never plays for prefers-reduced-motion users unless they press Play
 *  - visible pause control (WCAG 2.2.2 Pause, Stop, Hide)
 * No scroll listeners.
 */
export function AmbientVideo({
  src,
  poster,
  label,
  className,
  videoClassName,
  paused: controlledPaused,
  onPausedChange,
  showControl = true,
  controlClassName,
}: Props) {
  const { t } = useLanguage();
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotionSafe();
  const { paused: globalPaused } = useMotionPause();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = globalPaused || (controlledPaused ?? userPaused ?? Boolean(reduce));

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // property must be set for iOS autoplay, regardless of SSR attributes
    let onScreen = false;

    const sync = () => {
      const shouldPlay = onScreen && !paused && document.visibilityState === "visible";
      if (shouldPlay) {
        if (video.paused) video.play().catch(() => undefined);
      } else if (!video.paused) {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  const toggle = () => {
    const next = !paused;
    if (onPausedChange) onPausedChange(next);
    else setUserPaused(next);
  };

  return (
    <div className={`relative overflow-hidden bg-ink ${className ?? ""}`}>
      <div role="img" aria-label={label} className="absolute inset-0">
        <video
          ref={ref}
          className={`gpu absolute inset-0 h-full w-full object-cover ${videoClassName ?? ""}`}
          poster={poster}
          // No autoPlay/preload: the IntersectionObserver below starts it when it scrolls into view,
          // so below-the-fold films don't download during page load (the poster shows meanwhile).
          loop
          muted
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={`${src}.webm`} type="video/webm" />
          <source src={`${src}.mp4`} type="video/mp4" />
        </video>
      </div>
      {showControl ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? t.common.playMotion : t.common.pauseMotion}
          className={`absolute bottom-3 right-3 z-10 grid h-11 w-11 place-items-center border border-bone/40 bg-ink/70 text-bone hover:bg-ink ${controlClassName ?? ""}`}
        >
          {paused ? <Play aria-hidden="true" size={16} strokeWidth={1.5} /> : <Pause aria-hidden="true" size={16} strokeWidth={1.5} />}
        </button>
      ) : null}
    </div>
  );
}
