"use client";

import { Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/** Which surface the disclaimer sits under; each gets copy that matches what it shows. */
export type DisclaimerVariant = "dashboard" | "simulator" | "calculator";

/**
 * FTC micro-copy rendered directly under every interactive simulation.
 * `variant` picks the text: the Client Dashboard showcase (default), the
 * missed-call simulator or the ROI calculator (an estimate, not a portal demo).
 * Dark-first site: always ash (7.7:1 on ink). `tone` is kept for API
 * compatibility and no longer changes the colour.
 */
export function SimulationDisclaimer({
  variant = "dashboard",
  className,
}: {
  variant?: DisclaimerVariant;
  tone?: "light" | "dark";
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <p className={`flex max-w-3xl items-start gap-2 text-pretty text-xs leading-relaxed text-ash ${className ?? ""}`}>
      <Info aria-hidden="true" size={13} strokeWidth={1.75} className="mt-[2px] shrink-0 opacity-80" />
      <span>{t.common.simulationDisclaimer[variant]}</span>
    </p>
  );
}
