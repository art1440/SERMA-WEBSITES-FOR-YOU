"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Hydration-safe reduced-motion flag: returns false on the server AND on the
 * first client render (so the HTML matches), then the visitor's real
 * preference right after mount. Use this for anything that changes markup.
 */
export function useReducedMotionSafe(): boolean {
  const prefers = useReducedMotion();
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(Boolean(prefers)), [prefers]);
  return reduce;
}
