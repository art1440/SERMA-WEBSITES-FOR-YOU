"use client";

import { useLanguage } from "@/context/LanguageContext";

/**
 * Footer credit for the Unsplash photographers a demo uses:
 * "Photography by A, B and C on Unsplash." / "Fotografía de A, B y C en Unsplash."
 * Renders nothing when the list is empty.
 */
export function PhotoCredit({ names, className, linkClassName }: { names?: string[]; className?: string; linkClassName?: string }) {
  const { locale } = useLanguage();
  if (!names?.length) return null;
  const and = locale === "es" ? " y " : " and ";
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")}${and}${names[names.length - 1]}`;
  return (
    <p className={className}>
      {locale === "es" ? "Fotografía adicional de " : "Additional photography by "}
      {list}
      {locale === "es" ? " en " : " on "}
      <a href="https://unsplash.com/" rel="noopener noreferrer" target="_blank" className={linkClassName}>
        Unsplash
      </a>
      .
    </p>
  );
}
