"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

/**
 * A card that tilts toward the pointer in 3D and settles back with a spring,
 * and swings up into place when it first scrolls into view. Transform-only.
 */
export function TiltCard({ children, className, max = 9 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const rect = useRef<DOMRect | null>(null);
  const rx = useSpring(useMotionValue(0), SPRING);
  const ry = useSpring(useMotionValue(0), SPRING);

  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    rect.current = e.currentTarget.getBoundingClientRect();
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse" || !rect.current) return;
    const r = rect.current;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    rect.current = null;
  };

  return (
    <div className="h-full [perspective:1400px]">
      {/* Entrance: swings up into place once */}
      <motion.div
        className="h-full [transform-style:preserve-3d]"
        initial={{ opacity: 0, rotateX: 35, y: 80 }}
        whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Pointer tilt */}
        <motion.div
          className={className}
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          onPointerEnter={onEnter}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
