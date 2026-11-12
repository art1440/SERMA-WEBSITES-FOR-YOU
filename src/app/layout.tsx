import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";
import { SkipLink } from "@/components/layout/SkipLink";
import { displaySerif, geistMono, workSans } from "./fonts";
import { buildCsp } from "@/config/csp";
import { asset } from "@/lib/asset";
import "./globals.css";

const siteUrl = process.env.SITE_URL ?? "https://sermawebdesign.com";
/** Only for static hosts that can't send headers (Netlify sends them via netlify.toml). */
const cspMeta = process.env.CSP_META === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SermaWebDesign — Websites That Bring In Customers",
    template: "%s — SermaWebDesign",
  },
  description:
    "Bilingual websites for barbershops, salons, restaurants and contractors, with missed-call text-back, 24/7 booking, deposits and reminders. Get your time back.",
  openGraph: {
    type: "website",
    siteName: "SermaWebDesign",
    title: "Websites that bring in customers",
    description:
      "Missed calls get a text back. Clients book themselves, day or night, with deposits and reminders. You stay with the work you opened the doors for.",
    // Its own file (not the hero poster): the standard 1200x630 size, and a new URL so social sites drop cached previews.
    images: [{ url: asset("/media/og-render-pass-v2.jpg"), width: 1200, height: 630, alt: "SermaWebDesign" }],
    locale: "en_US",
    alternateLocale: ["es_US"],
  },
  robots: { index: true, follow: true },
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  themeColor: "#17253B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displaySerif.variable} ${workSans.variable} ${geistMono.variable}`}
    >
      {cspMeta ? (
        <head>
          <meta httpEquiv="Content-Security-Policy" content={buildCsp({ meta: true })} />
        </head>
      ) : null}
      <body>
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
