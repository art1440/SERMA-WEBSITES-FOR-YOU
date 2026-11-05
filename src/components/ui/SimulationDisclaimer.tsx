"use client";

import { useLanguage } from "@/context/LanguageContext";

/** FTC micro-copy rendered directly under every interactive simulation. */
export function SimulationDisclaimer({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { t } = useLanguage();
  return (
    <p className={`max-w-3xl text-xs leading-relaxed ${tone === "dark" ? "text-ash" : "text-muted"} ${className ?? ""}`}>
      <span aria-hidden="true">※ </span>
      {t.common.simulationDisclaimer}
    </p>
  );
}
