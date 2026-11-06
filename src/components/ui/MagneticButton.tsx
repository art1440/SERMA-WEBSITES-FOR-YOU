"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { MOTION } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  strength?: number;
  "aria-label"?: string;
  /** Keeps the button focusable while signalling it is unavailable (unlike `disabled`). */
  "aria-disabled"?: boolean;
  /** Marks the action that receives focus after "Book a demo" scrolls here. */
  "data-primary-action"?: boolean;
};

const SPRING = MOTION.snappy;

/**
 * A button that leans toward the cursor (mouse only) and settles back with a
 * spring. Pure transform via MotionValues — no React re-renders while moving.
 */
export function MagneticButton({ children, className, onClick, href, type = "button", disabled, strength = 0.28, ...aria }: Props) {
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
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    ix.set(dx * strength * 0.35);
    iy.set(dy * strength * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
    ix.set(0);
    iy.set(0);
    rect.current = null;
  };

  const shared = {
    className,
    style: { x: sx, y: sy },
    onPointerEnter: onEnter,
    onPointerMove: onMove,
    onPointerLeave: onLeave,
    whileTap: reduce ? undefined : { scale: 0.96 },
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
