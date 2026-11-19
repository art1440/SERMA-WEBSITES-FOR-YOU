"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scales its content down (never up) so a pinned scene always fits the
 * viewport. Measures on resize only — never on scroll.
 *  - Default: fills its parent's height (`h-full`) and fits the content in it.
 *  - `hug` (for a flex-column parent): sized by its content and allowed to
 *    shrink (flex 0 1 auto + min-h-0), but never to grow past the content, so
 *    a sibling after it sits right under the (scaled) content even at scale 1.
 *  - `onScale`: reports the current scale (1 when disabled), e.g. to give an
 *    unscaled caption below the stage the same width as the scaled content.
 *  - `width` (px): while enabled, lay the content out at this fixed width
 *    (centred, even if wider than the stage) and also scale it to fit the
 *    stage's width. The layout, and so its height, is then identical on every
 *    screen; only the scale changes.
 */
export function FitStage({
  children,
  enabled,
  className,
  hug = false,
  onScale,
  width,
}: {
  children: ReactNode;
  enabled: boolean;
  className?: string;
  hug?: boolean;
  onScale?: (scale: number) => void;
  width?: number;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const report = useRef(onScale);
  report.current = onScale;

  useEffect(() => {
    if (!enabled) {
      setScale(1);
      return;
    }
    const measure = () => {
      const o = outer.current;
      const i = inner.current;
      if (!o || !i || i.offsetHeight === 0) return;
      const byHeight = o.clientHeight / i.offsetHeight;
      const byWidth = width ? o.clientWidth / width : 1;
      setScale(Math.max(0.55, Math.min(1, byHeight, byWidth)));
    };
    const ro = new ResizeObserver(measure);
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    measure();
    return () => ro.disconnect();
  }, [enabled, width]);

  useEffect(() => {
    report.current?.(scale);
  }, [scale]);

  return (
    <div ref={outer} className={`relative w-full ${enabled ? (hug ? "min-h-0" : "h-full min-h-0") : ""} ${className ?? ""}`}>
      <div
        ref={inner}
        className="w-full"
        style={
          enabled
            ? {
                transform: `scale(${scale})`,
                transformOrigin: "50% 0%",
                // Centred on the stage even when wider than it (the scale brings it back inside).
                ...(width ? { width, marginLeft: `calc(50% - ${width / 2}px)` } : null),
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
