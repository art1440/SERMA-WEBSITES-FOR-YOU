import localFont from "next/font/local";

/**
 * Fonts for the /work demo sites, self-hosted from /src/app/work/fonts
 * (SIL Open Font License — see the OFL-*.txt files there). Same policy as /src/app/fonts.ts:
 * served from our own domain, no request to Google or any CDN.
 *
 * Each demo has its own display + body pair. A demo page only ever loads one
 * pair, so every display export uses "--demo-display" and every body export
 * "--demo-body". preload is off: these load only on the /work demo routes.
 * Latin subset only. (next/font needs literal option values, so fallbacks are inline.)
 */

// Ironside Barber Co.
export const barberDisplay = localFont({
  src: [{ path: "./fonts/ArchivoBlack-latin.woff2", weight: "400", style: "normal" }],
  variable: "--demo-display",
  display: "swap",
  preload: false,
  fallback: ["Impact", "Arial Black", "sans-serif"],
});

export const barberBody = localFont({
  src: [{ path: "./fonts/Archivo-latin.woff2", weight: "400 600", style: "normal" }],
  variable: "--demo-body",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Maison Lumière
export const salonDisplay = localFont({
  src: [
    { path: "./fonts/CormorantGaramond-latin.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/CormorantGaramond-Italic-latin.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--demo-display",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const salonBody = localFont({
  src: [{ path: "./fonts/Jost-latin.woff2", weight: "300 600", style: "normal" }],
  variable: "--demo-body",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Velvet Room (variable axes: opsz 9..144, wght 300..700, SOFT 0..100)
export const beautyDisplay = localFont({
  src: [{ path: "./fonts/Fraunces-latin.woff2", weight: "300 700", style: "normal" }],
  variable: "--demo-display",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const beautyBody = localFont({
  src: [{ path: "./fonts/Karla-latin.woff2", weight: "300 700", style: "normal" }],
  variable: "--demo-body",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Ember & Oak
export const restaurantDisplay = localFont({
  src: [{ path: "./fonts/YoungSerif-latin.woff2", weight: "400", style: "normal" }],
  variable: "--demo-display",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const restaurantBody = localFont({
  src: [{ path: "./fonts/InstrumentSans-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--demo-body",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Trueframe Builders
export const contractorDisplay = localFont({
  src: [
    { path: "./fonts/BarlowCondensed-normal-600-latin.woff2", weight: "600", style: "normal" },
    { path: "./fonts/BarlowCondensed-normal-800-latin.woff2", weight: "800", style: "normal" },
  ],
  variable: "--demo-display",
  display: "swap",
  preload: false,
  fallback: ["Arial Narrow", "Helvetica Neue", "Arial", "sans-serif"],
});

export const contractorBody = localFont({
  src: [
    { path: "./fonts/Barlow-normal-400-latin.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Barlow-normal-500-latin.woff2", weight: "500", style: "normal" },
  ],
  variable: "--demo-body",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

// Brightline Home (variable axes: opsz, wght)
export const serviceDisplay = localFont({
  src: [{ path: "./fonts/Bricolage-latin.woff2", weight: "200 800", style: "normal" }],
  variable: "--demo-display",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});

export const serviceBody = localFont({
  src: [{ path: "./fonts/Figtree-latin.woff2", weight: "300 700", style: "normal" }],
  variable: "--demo-body",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Helvetica Neue", "Arial", "sans-serif"],
});
