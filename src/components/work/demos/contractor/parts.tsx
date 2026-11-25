"use client";

import type { CSSProperties, ReactNode } from "react";
import { TextReveal } from "@/components/work/motion";

/*
 * Shared pieces of the Trueframe page (see ContractorDemo.tsx for the palette
 * and contrast notes). Everything here is static markup except SectionHead's
 * optional masked heading.
 */

export const NAV_H = 60;
/** The sticky header's bottom edge: what anchors land under and what pinned stages pin below. */
export const UNDER_HEADER = `calc(var(--demo-ribbon) + ${NAV_H}px)`;
export const SCROLL_MARGIN: CSSProperties = { scrollMarginTop: UNDER_HEADER };
export const WRAP = "mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-10";
export const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A1A]";
export const LABEL = "text-[0.75rem] font-medium uppercase tracking-[0.16em]";
export const BTN =
  "demo-display inline-flex items-center justify-center gap-3 bg-[#FF7A1A] font-semibold uppercase tracking-[0.08em] text-[#0F2440] transition-colors duration-200 hover:bg-[#E9F0FA] " +
  FOCUS;

export const GRID_DARK: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(155,184,224,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(155,184,224,0.07) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};
export const GRID_PAPER: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(15,36,64,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(15,36,64,0.055) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

/** The carpenter's framing square: Trueframe's mark. */
export function SquareMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className={className}>
      <path d="M2 2H7V13H18V18H2Z" fill="#FF7A1A" />
      <path d="M4 5H5.4M4 8H5.4M4 11H5.4M9 15.6V14.2M12 15.6V14.2M15 15.6V14.2" stroke="#0F2440" strokeWidth="1" />
    </svg>
  );
}

export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-2.5 leading-none">
      <SquareMark className={big ? "h-7 w-7" : "h-5 w-5"} />
      <span className="flex items-baseline gap-2">
        <span className={`demo-display font-extrabold uppercase tracking-[0.02em] text-[#E9F0FA] ${big ? "text-[2.25rem]" : "text-[1.5rem]"}`}>
          Trueframe
        </span>
        <span className={`demo-display font-semibold uppercase tracking-[0.22em] text-[#9BB8E0] ${big ? "text-[1rem]" : "hidden text-[0.8125rem] sm:inline"}`}>
          Builders
        </span>
      </span>
    </span>
  );
}

/** Sheet number tag, e.g. A-102. */
export function SheetTag({ children, paper = false }: { children: ReactNode; paper?: boolean }) {
  return (
    <span
      className={`demo-display inline-flex h-7 items-center border px-2 text-[0.9375rem] font-semibold leading-none tracking-[0.06em] ${
        paper ? "border-[#0F2440] text-[#0F2440]" : "border-[#9BB8E0] text-[#E9F0FA]"
      }`}
    >
      {children}
    </span>
  );
}

const H2 = "demo-display mt-5 text-balance text-[clamp(2.5rem,9vw,3.25rem)] font-extrabold leading-[0.95] tracking-[-0.005em] sm:text-[clamp(3rem,6vw,4.5rem)]";

export function SectionHead({
  id,
  sheet,
  kicker,
  title,
  intro,
  paper = false,
  reveal = false,
}: {
  id: string;
  sheet: string;
  /** Eyebrow beside the sheet tag; used on every other sheet only. */
  kicker?: string;
  title: string;
  intro?: string;
  paper?: boolean;
  /** Masked word entrance for the heading (TextReveal). */
  reveal?: boolean;
}) {
  const h2Class = `${H2} ${paper ? "text-[#0F2440]" : "text-[#E9F0FA]"}`;
  return (
    <div className={`grid gap-5 border-t pt-5 lg:grid-cols-12 lg:gap-10 ${paper ? "border-[#0F2440]" : "border-[#9BB8E0]/60"}`}>
      <div className="lg:col-span-7">
        <p className={`flex items-center gap-3 ${LABEL} ${paper ? "text-[#3D5878]" : "text-[#9BB8E0]"}`}>
          <SheetTag paper={paper}>{sheet}</SheetTag>
          {kicker && <span>{kicker}</span>}
        </p>
        {reveal ? (
          <TextReveal as="h2" id={id} text={title} className={h2Class} />
        ) : (
          <h2 id={id} className={h2Class}>
            {title}
          </h2>
        )}
      </div>
      {intro && (
        <p className={`max-w-[56ch] text-[1.0625rem] leading-relaxed lg:col-span-5 lg:self-end ${paper ? "text-[#3D5878]" : "text-[#C4D5EC]"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}

/** Static horizontal dimension: slash ticks at both ends, the string in a gap. */
export function Dimension({ label, className, bg = "bg-[#0F2440]" }: { label: string; className?: string; bg?: string }) {
  return (
    <div aria-hidden="true" className={`relative flex h-8 items-center ${className ?? ""}`}>
      <span className="absolute inset-x-0 top-1/2 h-px bg-[#9BB8E0]" />
      <span className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#9BB8E0]" />
      <span className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#9BB8E0]" />
      <span className="absolute left-0 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 translate-x-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className={`relative mx-auto px-1.5 text-[0.875rem] font-medium leading-none text-[#C4D5EC] ${bg}`}>{label}</span>
    </div>
  );
}

/** Revision delta: a triangle with the review's number. */
export function Delta({ n }: { n: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 28" className="h-7 w-8">
      <path d="M16 2L30 26H2Z" fill="none" stroke="#A84300" strokeWidth="1.75" strokeLinejoin="round" />
      <text x="16" y="22" textAnchor="middle" fontSize="12" fontWeight="500" fill="#0F2440" fontFamily="var(--demo-body)">
        {n}
      </text>
    </svg>
  );
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M0 6H18M13 1L18 6L13 11" />
    </svg>
  );
}
