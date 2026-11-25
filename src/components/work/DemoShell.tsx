"use client";

import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import type { DemoId } from "@/data/demos";
import { DemoBookingSheet } from "./DemoBookingSheet";
import { DemoCaptureContext } from "./captureContext";
import { SmoothScroll } from "./motion/SmoothScroll";

type BookingValue = { openBooking: () => void };
const DemoBookingContext = createContext<BookingValue>({ openBooking: () => undefined });

export const useDemoBooking = () => useContext(DemoBookingContext);

/** Booking button for demo pages: opens the "this is a demo" sheet. */
export function BookButton({ className, children }: { className?: string; children: ReactNode }) {
  const { openBooking } = useDemoBooking();
  return (
    <button type="button" data-book className={className} onClick={openBooking}>
      {children}
    </button>
  );
}

/** Frame around every demo page: Serma ribbon, booking sheet, ?capture=1 support. */
export function DemoShell({ id, className, children }: { id: DemoId; className?: string; children: ReactNode }) {
  const { locale, t, setLocale } = useLanguage();
  const { openMockup } = useMockup();
  const d = t.work.demo;
  const [capture, setCapture] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCapture(new URLSearchParams(window.location.search).get("capture") === "1");
  }, []);

  const openBooking = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const ctx = useMemo(() => ({ openBooking }), [openBooking]);

  const showRibbon = !capture && !dismissed;

  const pick = (next: "en" | "es") => {
    setLocale(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  };

  return (
    <DemoBookingContext.Provider value={ctx}>
      <DemoCaptureContext.Provider value={capture}>
        <div
          data-demo={id}
          data-capture={capture ? "true" : undefined}
          className={className}
          style={{ "--demo-ribbon": showRibbon ? "40px" : "0px" } as CSSProperties}
        >
          {showRibbon && (
            <div
              data-demo-ribbon
              role="region"
              aria-label={d.label}
              className="fixed inset-x-0 top-0 z-[80] flex h-10 items-center gap-2 bg-[#0d2447] px-3 text-[0.8125rem] text-white sm:gap-4 sm:px-4"
              style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}
            >
              {/* Phones show "Demo"; the full label stays the region's name and is read in full. */}
              <span className="min-w-0 flex-1 truncate font-medium">
                <span className="sr-only sm:not-sr-only">{d.label}</span>
                <span aria-hidden="true" className="sm:hidden">
                  {d.labelShort}
                </span>
              </span>
              <Link
                href={locale === "es" ? "/es/#work" : "/#work"}
                aria-label={d.back}
                className="inline-flex shrink-0 items-center text-white/80 underline-offset-4 hover:underline"
              >
                <ArrowLeft className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">{d.back}</span>
              </Link>
              <div role="group" aria-label={d.language} className="flex shrink-0 overflow-hidden rounded-full border border-white/30">
                {(["en", "es"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    lang={l}
                    aria-pressed={locale === l}
                    data-lang={l}
                    onClick={() => pick(l)}
                    className={`px-2.5 py-1 text-[0.6875rem] font-semibold uppercase ${locale === l ? "bg-white text-[#0d2447]" : "text-white/80"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={openMockup}
                className="shrink-0 rounded-full bg-[#1E63D8] px-3 py-1 text-[0.75rem] font-semibold text-white"
              >
                {d.cta}
              </button>
              <button
                type="button"
                aria-label={d.dismiss}
                onClick={() => {
                  setDismissed(true);
                  mainRef.current?.focus({ preventScroll: true });
                }}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
          <main id="main" ref={mainRef} tabIndex={-1} className="focus:outline-none" style={showRibbon ? { paddingTop: 40 } : undefined}>
            {children}
          </main>
          <DemoBookingSheet open={sheetOpen} onClose={closeSheet} onMockup={openMockup} />
          <SmoothScroll />
        </div>
      </DemoCaptureContext.Provider>
    </DemoBookingContext.Provider>
  );
}
