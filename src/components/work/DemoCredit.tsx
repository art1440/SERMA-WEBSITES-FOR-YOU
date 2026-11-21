"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";

/** A demo footer's "made by Serma" link: back to the Serma home page in the demo's language. */
export function DemoCredit({ className, children }: { className?: string; children: ReactNode }) {
  const { locale } = useLanguage();
  return (
    <Link href={locale === "es" ? "/es/" : "/"} className={className}>
      {children}
    </Link>
  );
}
