"use client";

import { Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/** FTC micro-copy rendered directly under every interactive simulation. */
export function SimulationDisclaimer({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const { t } = useLanguage();
  return (
    <p
      className={`flex max-w-3xl items-start gap-2 text-pretty text-xs leading-relaxed ${tone === "dark" ? "text-ash" : "text-muted"} ${className ?? ""}`}
    >
      <Info aria-hidden="true" size={13} strokeWidth={1.75} className="mt-[2px] shrink-0 opacity-80" />
      <span>{t.common.simulationDisclaimer}</span>
    </p>
  );
}
