import localFont from "next/font/local";

/**
 * All fonts are self-hosted from /src/app/fonts (SIL Open Font License — see OFL-*.txt).
 * next/font serves them from our own domain: zero requests to Google or any CDN,
 * so no visitor IP address ever leaks to a third party.
 *
 * Brand pairing (Paper and Navy):
 *  - Headings: Source Serif 4 (variable, covered by OFL-SourceSerif4.txt)
 *  - Body:     Work Sans (variable, covered by OFL-WorkSans.txt)
 */

export const displaySerif = localFont({
  src: [
    { path: "./fonts/SourceSerif4-latin.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/SourceSerif4-latin-ext.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/SourceSerif4-Italic-latin.woff2", weight: "200 900", style: "italic" },
    { path: "./fonts/SourceSerif4-Italic-latin-ext.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const workSans = localFont({
  src: [
    { path: "./fonts/WorkSans-latin.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/WorkSans-latin-ext.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

export const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "monospace"],
});
