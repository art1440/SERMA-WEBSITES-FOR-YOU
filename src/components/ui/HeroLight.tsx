"use client";

import { motion, useMotionValue, useSpring, type MotionValue } from "framer-motion";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { MOTION } from "@/lib/motion";

/**
 * Hero-only tonal depth. Static, cheap layers (gradients + opacity, no blur filters),
 * built from theme tokens so they re-theme with the palette.
 */
export function HeroLight({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {/* Key light: soft glow behind the 3D engine (right side). */}
      <div className="absolute -right-[8%] top-[4%] hidden h-[90%] w-[62%] bg-[radial-gradient(closest-side,theme(colors.aqua.glow/0.28),theme(colors.signal.DEFAULT/0.12)_55%,transparent)] opacity-90 lg:block" />
      {/* Calm, lighter plane behind the headline. */}
      <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-[radial-gradient(ellipse_at_28%_46%,theme(colors.ink.900/0.55),transparent_70%)] lg:block" />
      {/* Vignette toward the edges. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,theme(colors.ink.500/0.45)_100%)]" />
      {/* Deeper wash at the bottom. */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink-600/60 via-ink-600/20 to-transparent" />
    </div>
  );
}

type Pointer = { x: MotionValue<number>; y: MotionValue<number> } | null;
const PointerContext = createContext<Pointer>(null);

/** Tracks the pointer (desktop fine pointers only) as -1…1 MotionValues; no React re-renders. */
export function PointerParallaxProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!enabled) return;
    const mq = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const onMove = (e: PointerEvent) => {
      x.set((e.clientX / window.innerWidth) * 2 - 1);
      y.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    const sync = () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (mq.matches) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
      } else onLeave();
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  const value = useMemo(() => (enabled ? { x, y } : null), [enabled, x, y]);
  return <PointerContext.Provider value={value}>{children}</PointerContext.Provider>;
}

/** Drifts its children `depth` px toward the cursor. Wraps (never replaces) the child's own transforms. */
export function ParallaxLayer({ depth, className, children }: { depth: number; className?: string; children: ReactNode }) {
  const pointer = useContext(PointerContext);
  if (!pointer) return <div className={className}>{children}</div>;
  return (
    <ParallaxInner pointer={pointer} depth={depth} className={className}>
      {children}
    </ParallaxInner>
  );
}

function ParallaxInner({
  pointer,
  depth,
  className,
  children,
}: {
  pointer: NonNullable<Pointer>;
  depth: number;
  className?: string;
  children: ReactNode;
}) {
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, MOTION.smooth);
  const y = useSpring(ty, MOTION.smooth);
  useEffect(() => {
    const ux = pointer.x.on("change", (v) => tx.set(v * depth));
    const uy = pointer.y.on("change", (v) => ty.set(v * depth));
    return () => {
      ux();
      uy();
    };
  }, [pointer, depth, tx, ty]);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
