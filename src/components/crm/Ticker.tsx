"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { SPRING_NUMBER } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * A number that rolls to each new value (on load, and again whenever a lead changes
 * stage), so a change is seen happening rather than just appearing. Digits are written
 * by a MotionValue (no re-render per frame); screen readers get the final value only.
 */
export function Ticker({ value }: { value: number }) {
  const reduce = useReducedMotionSafe();
  const spring = useSpring(0, SPRING_NUMBER);
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString("en-US"));
  useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [value, reduce, spring]);
  return (
    <span className="tabular">
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
