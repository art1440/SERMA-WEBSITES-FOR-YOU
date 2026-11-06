"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { MotionPauseProvider } from "@/context/MotionPauseContext";

/**
 * `reducedMotion="user"` makes every Framer Motion animation honor the OS
 * "reduce motion" setting: transforms are skipped, opacity fades remain.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <MotionPauseProvider>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </MotionPauseProvider>
    </LanguageProvider>
  );
}
