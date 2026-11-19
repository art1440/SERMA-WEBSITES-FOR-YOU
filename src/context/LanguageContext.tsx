"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { dictionaries, type Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/types";
import { BASE_PATH } from "@/lib/asset";

/**
 * Zero-cookie language engine.
 * - Language lives only in React state: no cookies, no localStorage, no tracking.
 * - Internal navigation uses next/link, so the choice survives page changes without storage.
 * - Switching is a synchronous state update (no network, no reload).
 * - First visit to /: follows the browser's preferred language (read locally, never transmitted).
 * - /es is always Spanish. The EN/ES switch swaps between / and /es (history.pushState, so the
 *   page, open tab and scroll position stay put) and an explicit pick is never overridden by detection.
 */
type LanguageContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (next: Locale) => void;
  /** Explicit language pick: sets the locale and, on the home page, moves the URL between / and /es. */
  switchLocale: (next: Locale) => void;
  /** BCP-47 tag for Intl formatting. */
  intlLocale: "en-US" | "es-US";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Path without the deployment base path or trailing slash ("" is the home page). */
function bare(pathname: string): string {
  const p = BASE_PATH && pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) : pathname;
  return p.replace(/\/+$/, "");
}

const isEsPath = (pathname: string) => bare(pathname) === "/es";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // /es renders Spanish from the very first (server) render so the exported HTML is Spanish.
  const [locale, setLocaleState] = useState<Locale>(isEsPath(pathname) ? "es" : "en");
  const lastPath = useRef(bare(pathname));

  // First load on /: an explicit ?lang= hint (used by policy links that open in a new tab) wins,
  // otherwise follow the browser's preferred language. Read locally, never stored or sent.
  // /es is always Spanish and is never second-guessed by detection.
  useEffect(() => {
    if (isEsPath(window.location.pathname)) return;
    const hint = new URLSearchParams(window.location.search).get("lang");
    if (hint === "es" || hint === "en") {
      setLocaleState(hint);
      return;
    }
    const preferred = navigator.languages?.[0] ?? navigator.language ?? "en";
    if (preferred.toLowerCase().startsWith("es")) setLocaleState("es");
  }, []);

  // Arriving on /es (link, back/forward) makes Spanish the visitor's language for the rest of the visit.
  useEffect(() => {
    if (isEsPath(pathname)) setLocaleState("es");
    lastPath.current = bare(pathname);
  }, [pathname]);

  // Back/forward between / and /es follows the URL; other history moves (tabs, other pages) leave the language alone.
  useEffect(() => {
    const onPop = () => {
      const now = bare(window.location.pathname);
      const before = lastPath.current;
      lastPath.current = now;
      if (now === before) return;
      if (now === "/es") setLocaleState("es");
      else if (now === "" && before === "/es") setLocaleState("en");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Keep <html lang> in sync so screen readers switch pronunciation (WCAG 3.1.1).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const switchLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    const here = bare(window.location.pathname);
    if (here !== "" && here !== "/es") return; // legal pages keep their own URL
    if (here === (next === "es" ? "/es" : "")) return;
    const target = next === "es" ? "/es/" : "/";
    // Same document, new URL: the open tab and scroll position survive. Next syncs usePathname.
    window.history.pushState(null, "", `${BASE_PATH}${target}${window.location.search}${window.location.hash}`);
    lastPath.current = bare(window.location.pathname);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
      switchLocale,
      intlLocale: locale === "es" ? "es-US" : "en-US",
    }),
    [locale, setLocale, switchLocale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>.");
  return ctx;
}
