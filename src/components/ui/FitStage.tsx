"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scales its content down (never up) so a pinned scene always fits the
 * viewport. Measures on resize only — never on scroll.
 */
export function FitStage({ children, enabled, className }: { children: ReactNode; enabled: boolean; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      return;
    }
    const measure = () => {
      const o = outer.current;
      const i = inner.current;
      if (!o || !i || i.offsetHeight === 0) return;
      setScale(Math.max(0.55, Math.min(1, o.clientHeight / i.offsetHeight)));
    };
    const ro = new ResizeObserver(measure);
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    measure();
    return () => ro.disconnect();
  }, [enabled]);

  return (
    <div ref={outer} className={`relative w-full ${enabled ? "h-full min-h-0" : ""} ${className ?? ""}`}>
      <div
        ref={inner}
        className="w-full"
        style={enabled ? { transform: `scale(${scale})`, transformOrigin: "50% 0%" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}
