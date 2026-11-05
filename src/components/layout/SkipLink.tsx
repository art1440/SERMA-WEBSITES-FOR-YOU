"use client";

import { useLanguage } from "@/context/LanguageContext";

export function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:font-mono focus:text-sm focus:text-bone"
    >
      {t.common.skipToContent}
    </a>
  );
}
