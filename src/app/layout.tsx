import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";
import { SkipLink } from "@/components/layout/SkipLink";
import { displaySerif, geistMono, geistSans } from "./fonts";
import { buildCsp } from "@/config/csp";
import { asset } from "@/lib/asset";
import "./globals.css";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
/** Only for static hosts that can't send headers (Netlify sends them via netlify.toml). */
const cspMeta = process.env.CSP_META === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SermaWebDesign — Websites That Book Clients for You",
    template: "%s — SermaWebDesign",
  },
  description:
    "Bilingual websites for barbershops, salons, restaurants and contractors, with missed-call text-back, 24/7 booking, deposits and reminders. Get your time back.",
  openGraph: {
    type: "website",
    siteName: "SermaWebDesign",
    title: "Websites that book clients for you",
    description:
      "Missed calls get a text back. Clients book themselves, day or night, with deposits and reminders. You stay with the work you opened the doors for.",
    images: [{ url: asset("/media/hero-poster.jpg"), width: 1600, height: 900, alt: "SermaWebDesign" }],
    locale: "en_US",
    alternateLocale: ["es_US"],
  },
  robots: { index: true, follow: true },
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  themeColor: "#F1EDE4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displaySerif.variable} ${geistSans.variable} ${geistMono.variable}`}
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
