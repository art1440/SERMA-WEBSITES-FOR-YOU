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
    default: "SermaWebDesign — Websites That Give Local Business Owners Their Time Back",
    template: "%s — SermaWebDesign",
  },
  description:
    "Websites and quiet booking systems for barbershops, salons, beauty studios, restaurants, contractors and service businesses. Calls answered, appointments booked, customers back — so owners get their time back. English & Spanish.",
  openGraph: {
    type: "website",
    siteName: "SermaWebDesign",
    title: "SermaWebDesign — You started this for the craft, not the phone.",
    description:
      "Calls answered, appointments booked, customers back — so you can get back to the work you love. Book a live walkthrough.",
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
