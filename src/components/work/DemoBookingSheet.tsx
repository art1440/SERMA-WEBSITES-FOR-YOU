"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { EASE_EDITORIAL, SPRING_SMOOTH } from "@/lib/motion";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Props = { open: boolean; onClose: () => void; onMockup: () => void };

/** "This is a demo" sheet shown when a visitor tries to book on a demo site. */
export function DemoBookingSheet({ open, onClose, onMockup }: Props) {
  const { t } = useLanguage();
  const d = t.work.demo;
  const { paused } = useMotionPause();
  const reduced = useReducedMotionSafe();
  const flat = reduced || paused;
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);

  const sheet = flat
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 24 },
        transition: SPRING_SMOOTH,
      };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center md:items-center">
          <motion.div
            className="absolute inset-0 bg-[#0d2447]/60"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-sheet-title"
            aria-describedby="demo-sheet-body"
            className="relative w-full rounded-t-3xl bg-white p-6 text-[#0d2447] shadow-2xl md:max-w-md md:rounded-3xl md:p-8"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))", fontFamily: "var(--font-sans, system-ui, sans-serif)" }}
            {...sheet}
          >
            <h2 id="demo-sheet-title" className="text-xl font-semibold tracking-tight">
              {d.sheetTitle}
            </h2>
            <p id="demo-sheet-body" className="mt-2 text-[0.9375rem] leading-relaxed text-[#0d2447]/75">
              {d.sheetBody}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                data-autofocus
                className="btn-aqua"
                onClick={() => {
                  onClose();
                  onMockup();
                }}
              >
                {d.sheetCta}
              </button>
              <button
                type="button"
                className="inline-flex min-h-[50px] items-center justify-center rounded-full px-6 text-[0.9375rem] font-semibold text-[#0d2447]/80 underline-offset-4 hover:underline"
                onClick={onClose}
              >
                {d.sheetClose}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
