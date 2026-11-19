"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { EASE_EDITORIAL, MOTION, VIEWPORT_ONCE } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

const SPRING = MOTION.smooth;

type Props = {
  children: ReactNode;
  className?: string;
  max?: number;
  /**
   * Rounding classes for an optional specular streak (e.g. "rounded-glass-lg"):
   * a soft band of light that glides across the card as it tilts, like light
   * catching a sheet of glass. Omit to disable.
   */
  glare?: string;
  /** Seconds to wait before the entrance swing, for staggering a row of cards. */
  delay?: number;
};

/**
 * A card that tilts toward the pointer in 3D and settles back with a spring,
 * and swings up into place when it first scrolls into view. Transform-only.
 *
 * The tilt layer stays `preserve-3d` with NO overflow/filters (either would
 * flatten the 3D). The glare is a separate leaf layer that clips itself, so
 * the card's own corners are never cut by an ancestor.
 */
export function TiltCard({ children, className, max = 9, glare, delay = 0 }: Props) {
  const reduce = useReducedMotionSafe();
  const rect = useRef<DOMRect | null>(null);
  const rx = useSpring(useMotionValue(0), SPRING);
  const ry = useSpring(useMotionValue(0), SPRING);
  const shine = useSpring(useMotionValue(0), SPRING);
  // The streak travels with the tilt (transform + opacity only).
  const shineX = useTransform(ry, [-max, max], ["-22%", "22%"]);
  const shineY = useTransform(rx, [-max, max], ["14%", "-14%"]);

  // Sharpness: preserve-3d makes the browser paint the card into a GPU texture and resample it,
  // which softens text (worst at fractional DPRs like Windows 125%). The card is flat at rest and
  // only becomes a 3D stack while the pointer tilts it; it flattens again once the spring has
  // settled back to 0°, so the swap is pixel-identical.
  const stage = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const settle = () => {
    if (!hovering.current && Math.abs(rx.get()) < 0.01 && Math.abs(ry.get()) < 0.01) {
      stage.current?.classList.add("stage-flat");
    }
  };
  useMotionValueEvent(rx, "change", settle);
  useMotionValueEvent(ry, "change", settle);

  const onEnter = (e: PointerEvent<HTMLDivElement>) => {
    rect.current = e.currentTarget.getBoundingClientRect();
    if (!reduce && e.pointerType === "mouse") {
      hovering.current = true;
      stage.current?.classList.remove("stage-flat");
    }
    if (!reduce && e.pointerType === "mouse") shine.set(1);
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
    hovering.current = false;
    rx.set(0);
    ry.set(0);
    shine.set(0);
    rect.current = null;
    settle();
  };

  return (
    <div ref={stage} className="stage-flat h-full [perspective:1400px]">
      {/* Entrance: swings up into place once */}
      <motion.div
        className="h-full [transform-style:preserve-3d]"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay }}
      >
        {/* Pointer tilt */}
        <motion.div
          className={`relative ${className ?? ""}`}
          style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
          onPointerEnter={onEnter}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
        >
          {children}
          {glare && !reduce ? (
            // Leaf layer lifted 1px off the card plane (no z-fighting); it clips only itself.
            // Cool white streak (matches the aqua accent on the dark cards). Peak tint stays
            // ≤10% so small text under it keeps AA contrast.
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 overflow-hidden ${glare}`}
              style={{ transform: "translateZ(1px)" }}
            >
              <motion.div
                className="absolute -inset-x-1/2 -inset-y-1/4 bg-[linear-gradient(112deg,transparent_36%,rgba(255,255,255,0.05)_44%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.05)_56%,transparent_64%)]"
                style={{ x: shineX, y: shineY, opacity: shine }}
              />
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
}
