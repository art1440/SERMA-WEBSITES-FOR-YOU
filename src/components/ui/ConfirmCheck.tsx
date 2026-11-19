"use client";

import { motion } from "framer-motion";

/**
 * Booking-confirmed mark: a check that draws in (SVG stroke-dashoffset via pathLength)
 * with one soft success pulse in the live token. Mount = play, unmount = rewind.
 * `still` (reduced motion) renders the finished state with no pulse and no draw.
 */
export function ConfirmCheck({ still = false, size = 18 }: { still?: boolean; size?: number }) {
  return (
    <span aria-hidden="true" className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      {still ? null : (
        <motion.span
          className="absolute inset-0 rounded-full bg-live/30 ring-1 ring-inset ring-live/60"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        />
      )}
      <span className="relative grid h-full w-full place-items-center rounded-full bg-live/20 ring-1 ring-inset ring-live/70">
        <svg
          viewBox="0 0 24 24"
          width={size * 0.62}
          height={size * 0.62}
          fill="none"
          stroke="currentColor"
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-live"
        >
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={still ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          />
        </svg>
      </span>
    </span>
  );
}
