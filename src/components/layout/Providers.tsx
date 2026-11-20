"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import { MockupProvider } from "@/context/MockupContext";
import { MotionPauseProvider } from "@/context/MotionPauseContext";
import { GlassSheen } from "@/components/ui/GlassSheen";

/**
 * `reducedMotion="user"` makes every Framer Motion animation honor the OS
 * "reduce motion" setting: transforms are skipped, opacity fades remain.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <MotionPauseProvider>
        <MotionConfig reducedMotion="user">
          <GlassSheen />
          <MockupProvider>{children}</MockupProvider>
        </MotionConfig>
      </MotionPauseProvider>
    </LanguageProvider>
  );
}
