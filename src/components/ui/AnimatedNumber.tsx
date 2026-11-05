"use client";

import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { MetricFormat } from "@/data/niches";
import { formatMetric } from "@/lib/format";
import { SPRING_NUMBER } from "@/lib/motion";

type Props = {
  value: number;
  format?: MetricFormat;
  className?: string;
};

/**
 * Spring-driven number ticker. The visible digits are written straight to the
 * DOM by a MotionValue (no React re-render per frame). Screen readers get the
 * final value only, via a visually-hidden twin.
 */
export function AnimatedNumber({ value, format = "number", className }: Props) {
  const { intlLocale } = useLanguage();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const spring = useSpring(0, SPRING_NUMBER);
  const text = useMotionValue(formatMetric(0, format, intlLocale));

  useEffect(() => {
    const render = (v: number) => text.set(formatMetric(v, format, intlLocale));
    render(spring.get());
    return spring.on("change", render);
  }, [spring, text, format, intlLocale]);

  useEffect(() => {
    if (!inView) return;
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [inView, value, reduce, spring]);

  return (
    <span ref={ref} className={`tabular ${className ?? ""}`}>
      <motion.span aria-hidden="true">{text}</motion.span>
      <span className="sr-only">{formatMetric(value, format, intlLocale)}</span>
    </span>
  );
}
