"use client";

import { useLanguage } from "@/context/LanguageContext";

export function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-bone focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_30px_-12px_rgba(13,13,11,0.7)]"
    >
      {t.common.skipToContent}
    </a>
  );
}
