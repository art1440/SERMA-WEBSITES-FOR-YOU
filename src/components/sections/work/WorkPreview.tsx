"use client";

import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/context/LanguageContext";
import type { DemoCard } from "@/data/demos";
import { fill } from "@/i18n/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { FrameDots, SPRING_MORPH } from "./WorkCard";

type Props = {
  demo: DemoCard | null;
  /** `scrollRatio`: how far down the shot the visitor was (scrollTop / image height). */
  onClose: (scrollRatio?: number) => void;
  /** Grow from the card (shared layoutId). Off under reduced motion / Pause: opacity only. */
  morph?: boolean;
  /** Phones: the preview fills the viewport (safe-area padded), title bar on top, CTA bar at the bottom. */
  full?: boolean;
};

const FADE_IN = { duration: 0.24, ease: [0.23, 1, 0.32, 1] } as const;
const FADE_OUT = { duration: 0.2, ease: [0.23, 1, 0.32, 1] } as const;

/**
 * Large preview of one demo. The card's 16:10 page view grows out of its grid
 * slot into the preview's (Framer shared layout, `work-frame-<id>`; same aspect
 * ratio and the same picture, so the crossfade is invisible) while a solid
 * scrim fades in and the title bar settles on top as it lands. The page view
 * scrolls through the full shot (wheel, keyboard: it is focused on open).
 * Esc, Close or a backdrop click shrink it back into its slot: the card takes
 * over the scroll position (same picture, so again no visible crossfade) and
 * eases back to the top once it has landed. Focus returns to the card.
 *
 * Sizing: the frame is at most min(92vw, 1100px) wide and min(82vh, 760px)
 * tall (title bar + 16:10 view), whichever binds first. Below 768 px (`full`)
 * it fills the viewport: title bar at the top, the page view below it taking
 * the rest, "Visit the full demo" in a bar at the bottom, so it is always on
 * screen without scrolling.
 */
export function WorkPreview({ demo, onClose, morph = true, full = false }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>{demo ? <PreviewDialog key={demo.id} demo={demo} onClose={onClose} morph={morph} full={full} /> : null}</AnimatePresence>,
    document.body,
  );
}

function PreviewDialog({
  demo,
  onClose,
  morph,
  full,
}: {
  demo: DemoCard;
  onClose: Props["onClose"];
  morph: boolean;
  full: boolean;
}) {
  const { t, locale } = useLanguage();
  const g = t.work.gallery;
  const shot = demo.shots[locale];
  const present = useIsPresent();
  const ref = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const titleId = `work-preview-title-${demo.id}`;
  const href = locale === "es" ? `${demo.href}?lang=es` : demo.href;

  /** Hands the card the scroll position the visitor closed at (0..1), so the shrink lands on the same picture. */
  const close = useCallback(() => {
    const scroller = scrollerRef.current;
    const img = imgRef.current;
    onClose(scroller && img && img.offsetHeight > 0 ? scroller.scrollTop / img.offsetHeight : 0);
  }, [onClose]);

  useFocusTrap(ref, present, close);

  // Lock page scroll while open. html reserves the scrollbar lane (scrollbar-gutter: stable), so nothing shifts.
  useEffect(() => {
    if (!present) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [present]);

  // Still (reduced motion / Pause): the whole window fades. Otherwise the page view grows (shared layout)
  // and the title bar, a supporting element, fades in as it lands and leaves first on close.
  const still = !morph;
  const radius = full ? 0 : 18;
  return (
    <div
      className={`fixed inset-0 z-[90] grid ${full ? "" : "place-items-center p-4"}`}
      style={{ pointerEvents: present ? "auto" : "none" }}
    >
      {/* Solid scrim, no backdrop blur (blur budget). */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[rgb(4_10_22/0.74)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: FADE_IN }}
        exit={{ opacity: 0, transition: FADE_OUT }}
        onClick={close}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex min-h-0 flex-col"
        style={
          full
            ? {
                width: "100%",
                height: "100%",
                padding:
                  "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
              }
            : { width: "min(92vw, 1100px, calc((min(82vh, 760px) - 3.5rem) * 1.6))" }
        }
        initial={still ? { opacity: 0 } : false}
        animate={still ? { opacity: 1, transition: FADE_IN } : undefined}
        exit={still ? { opacity: 0, transition: FADE_OUT } : undefined}
      >
        <motion.div
          className={`flex h-14 shrink-0 items-center gap-3 ${full ? "" : "rounded-t-[18px]"} border-b border-bone/10 bg-ink-800 pl-4 pr-2 shadow-[0_0_0_1px_rgb(var(--bone)/0.12)] sm:gap-4 sm:pl-5`}
          initial={still ? false : { opacity: 0, y: 8 }}
          animate={still ? undefined : { opacity: 1, y: 0, transition: { ...FADE_IN, delay: 0.24 } }}
          exit={still ? undefined : { opacity: 0, transition: { duration: 0.12, ease: "easeOut" } }}
        >
          <FrameDots />
          <h2 className="flex min-w-0 items-baseline gap-3">
            <span id={titleId} className="truncate font-display text-base text-bone">
              {demo.business}
            </span>
            <span className="hidden truncate text-sm text-ash sm:inline">{demo.pitchDomain}</span>
          </h2>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            {full ? null : (
              <Link href={href} className="btn btn-sm btn-aqua">
                {g.visit}
                <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
              </Link>
            )}
            <button
              type="button"
              onClick={close}
              aria-label={g.close}
              className="grid h-11 w-11 place-items-center rounded-full text-bone transition-colors duration-150 hover:bg-bone/10"
            >
              <X aria-hidden="true" size={20} strokeWidth={2} />
            </button>
          </span>
        </motion.div>
        {/* The shared element: grows out of the card's 16:10 page view. Scrolls the full shot (wheel / keys). */}
        <motion.div
          ref={scrollerRef}
          role="region"
          aria-label={fill(g.shotLabel, { business: demo.business })}
          tabIndex={0}
          data-autofocus
          layoutId={morph ? `work-frame-${demo.id}` : undefined}
          // Phones pair the picture inside too: its measurements must account for how far it was scrolled.
          layoutScroll={full}
          // Phones: no crossfade between the card's window and this one (it would fade the picture inside with it).
          layoutCrossfade={!full}
          transition={{ layout: SPRING_MORPH }}
          className={`relative w-full overflow-y-auto overscroll-contain bg-ink-800 ${full ? "min-h-0 flex-1" : "aspect-[16/10]"} shadow-[0_0_0_1px_rgb(var(--bone)/0.12),0_40px_120px_-30px_rgba(0,0,0,0.7)] focus-visible:outline-offset-[-3px]`}
          style={{ borderBottomLeftRadius: radius, borderBottomRightRadius: radius }}
        >
          {/* The card's small shot (already cached) paints underneath until the full one arrives. */}
          <motion.img
            ref={imgRef}
            layoutId={morph && full ? `work-shot-${demo.id}` : undefined}
            layoutCrossfade={false}
            transition={{ layout: SPRING_MORPH }}
            src={shot.full}
            width={shot.width}
            height={shot.height}
            alt=""
            decoding="async"
            draggable={false}
            className="block h-auto w-full select-none bg-[length:100%_auto] bg-top bg-no-repeat"
            style={{ backgroundImage: `url(${shot.small})` }}
          />
        </motion.div>
        {full ? (
          <motion.div
            className="shrink-0 border-t border-bone/10 bg-ink-800 p-3"
            initial={still ? false : { opacity: 0, y: 8 }}
            animate={still ? undefined : { opacity: 1, y: 0, transition: { ...FADE_IN, delay: 0.24 } }}
            exit={still ? undefined : { opacity: 0, transition: { duration: 0.12, ease: "easeOut" } }}
          >
            <Link href={href} className="btn btn-aqua w-full justify-center">
              {g.visit}
              <ArrowRight aria-hidden="true" size={16} strokeWidth={2} />
            </Link>
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
