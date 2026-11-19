"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/types";

/**
 * Zero-cookie language engine.
 * - Language lives only in React state: no cookies, no localStorage, no tracking.
 * - Internal navigation uses next/link, so the choice survives page changes without storage.
 * - Switching is a synchronous state update (no network, no reload).
 * - First visit: follows the browser's preferred language (read locally, never transmitted).
 */
type LanguageContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (next: Locale) => void;
  /** BCP-47 tag for Intl formatting. */
  intlLocale: "en-US" | "es-US";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // First load: an explicit ?lang= hint (used by policy links that open in a new tab) wins,
  // otherwise follow the browser's preferred language. Read locally, never stored or sent.
  useEffect(() => {
    const hint = new URLSearchParams(window.location.search).get("lang");
    if (hint === "es" || hint === "en") {
      setLocaleState(hint);
      return;
    }
    const preferred = navigator.languages?.[0] ?? navigator.language ?? "en";
    if (preferred.toLowerCase().startsWith("es")) setLocaleState("es");
  }, []);

  // Keep <html lang> in sync so screen readers switch pronunciation (WCAG 3.1.1).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
      intlLocale: locale === "es" ? "es-US" : "en-US",
    }),
    [locale, setLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>.");
  return ctx;
}
