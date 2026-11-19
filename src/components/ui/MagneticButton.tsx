"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { MOTION, SPRING_SNAPPY } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  /** 0–1 multiplier of the max pull (default 1). */
  strength?: number;
  "aria-label"?: string;
  /** Keeps the button focusable while signalling it is unavailable (unlike `disabled`). */
  "aria-disabled"?: boolean;
  /** Marks the action that receives focus after a CTA scrolls here. */
  "data-primary-action"?: boolean;
};

const SPRING = MOTION.snappy;
/** Max travel toward the cursor, reached at the button's edge. Size-independent (px). */
const PULL_X = 5;
const PULL_Y = 3;
/** The label leads the capsule by this share of its travel (≤1.75px): depth without decentring. */
const LABEL_LEAD = 0.35;
/** Colour, border and shadow ease like every other control; transform belongs to the springs. */
const EASE_CLASSES = "transition-[color,background-color,border-color,box-shadow] duration-base ease-editorial";

/**
 * A button that leans a few pixels toward a mouse cursor (its label leads it slightly)
 * and settles back with a spring. It presses to 0.97 on `snappy`; colours ease at 250ms.
 * Pure transform via MotionValues — no React re-renders while moving.
 */
export function MagneticButton({ children, className, onClick, href, type = "button", disabled, strength = 1, ...aria }: Props) {
  const reduce = useReducedMotionSafe();
  const rect = useRef<DOMRect | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const ix = useSpring(useMotionValue(0), SPRING);
  const iy = useSpring(useMotionValue(0), SPRING);

  const onEnter = (e: PointerEvent<HTMLElement>) => {
    rect.current = e.currentTarget.getBoundingClientRect();
  };
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse" || !rect.current) return;
    const r = rect.current;
    const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
    const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    const px = nx * PULL_X * strength;
    const py = ny * PULL_Y * strength;
    x.set(px);
    y.set(py);
    ix.set(px * LABEL_LEAD);
    iy.set(py * LABEL_LEAD);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
    iy.set(0);
    rect.current = null;
  };

  const shared = {
    // The springs own `transform` (a CSS transform transition would smooth it twice). Colour, border and shadow keep a 250ms editorial ease.
    className: `${className ?? ""} ${EASE_CLASSES}`,
    style: { x: sx, y: sy },
    onPointerEnter: onEnter,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    whileTap: { scale: 0.97 },
    transition: { scale: SPRING_SNAPPY },
    ...aria,
  };
  const inner = (
    <motion.span className="relative inline-flex items-center gap-2" style={{ x: ix, y: iy }}>
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <motion.a href={href} onClick={onClick} {...shared}>
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} {...shared}>
      {inner}
    </motion.button>
  );
}
