"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from "react";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";
import { useFinePointer } from "./hooks";

/**
 * Cursor-following photo preview for a list (price lists, menus, services):
 * hover a row and its photo floats beside the pointer, trailing it on a
 * spring; moving to the next row swaps the photo with a short vertical wipe.
 *
 * Mouse / trackpad only, and never in still mode. The floating layer is only
 * mounted after the first hover, so nothing extra loads for touch visitors.
 * The preview is decorative (aria-hidden): every row must already say what it
 * is in text.
 *
 * Usage:
 *   <HoverPreview images={items.map(i => i.image)} frameClassName="rounded-2xl">
 *     {(bind) => <ul>{items.map((it, i) => <li key={i} {...bind(i)}>...</li>)}</ul>}
 *   </HoverPreview>
 */
type Bind = (i: number) => { onPointerEnter: (e: PointerEvent) => void; "data-preview-row": number };

type Props = {
  images: (DemoImage | undefined)[];
  children: (bind: Bind) => ReactNode;
  /** Size + shape of the floating frame. */
  frameClassName?: string;
  className?: string;
};

const EASE = [0.76, 0, 0.24, 1] as const;

export function HoverPreview({ images, children, frameClassName = "w-[260px] aspect-[4/5] rounded-[18px]", className }: Props) {
  const still = useDemoStill();
  const fine = useFinePointer();
  const live = fine && !still;
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.6 });
  const first = useRef(true);
  const frameRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: PointerEvent) => {
      if (!live) return;
      // Sit right of the cursor; flip to its left near the right edge of the window.
      const w = frameRef.current?.offsetWidth ?? 280;
      const px = e.clientX + 28 + w > window.innerWidth - 16 ? e.clientX - 28 - w : e.clientX + 28;
      mx.set(px);
      my.set(e.clientY);
      if (first.current) {
        x.jump(px);
        y.jump(e.clientY);
        first.current = false;
      }
    },
    [live, mx, my, x, y],
  );

  const bind: Bind = (i) => ({
    "data-preview-row": i,
    onPointerEnter: (e) => {
      if (!live || !images[i]) return;
      if (!mounted) setMounted(true);
      onMove(e);
      setActive(i);
    },
  });

  return (
    <div
      className={className}
      onPointerMove={onMove}
      onPointerLeave={() => {
        setActive(null);
        first.current = true;
      }}
    >
      {children(bind)}
      {live && mounted && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[60]"
          style={{ x, y }}
        >
          <div className="-translate-y-1/2">
          <motion.div
            ref={frameRef}
            className={`relative overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] ${frameClassName}`}
            initial={false}
            animate={active === null ? { opacity: 0, scale: 0.86, rotate: -3 } : { opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence initial={false}>
              {active !== null && images[active] && (
                <motion.img
                  key={active}
                  src={images[active]!.small}
                  alt=""
                  width={images[active]!.width}
                  height={images[active]!.height}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.25 } }}
                  transition={{ duration: 0.55, ease: EASE }}
                />
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
