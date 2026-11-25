"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { useDemoStill } from "../useDemoStill";
import { useFinePointer } from "./hooks";

/**
 * A light magnetic pull for primary buttons: within its own box the child
 * leans toward the pointer (at most `strength` of the offset, capped at
 * `max` px) and springs back on leave. Mouse / trackpad only; inert in still
 * mode and on touch. Wrap the button, don't replace it.
 */
export function Magnetic({ children, strength = 0.3, max = 12, className = "" }: { children: ReactNode; strength?: number; max?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const still = useDemoStill();
  const fine = useFinePointer();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });

  if (still || !fine) return <span className={`inline-flex ${className}`}>{children}</span>;

  const clamp = (v: number) => Math.max(-max, Math.min(max, v));
  return (
    <motion.span
      ref={ref}
      className={`inline-flex ${className}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength));
        y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}
