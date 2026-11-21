import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";
import { SkipLink } from "@/components/layout/SkipLink";
import { displaySerif, geistMono, workSans } from "./fonts";
import { buildCsp } from "@/config/csp";
import { siteConfig } from "@/config/site";
import { BASE_PATH } from "@/lib/asset";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";
import "./motion.css";

const siteUrl = process.env.SITE_URL ?? "https://sermawebdesign.com";
/** Only for static hosts that can't send headers (Netlify sends them via netlify.toml). */
const cspMeta = process.env.CSP_META === "true";

const SITE_DESCRIPTION =
  "Websites for barbershops, salons, restaurants and contractors that turn searches into calls. We write and build it for you, and you only pay once you’ve seen it and said yes. Get your free mockup.";

/** Structured data for search engines. Only facts we hold: no ratings, reviews, addresses or prices. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  url: `${siteUrl}${BASE_PATH}/`,
  description: SITE_DESCRIPTION,
  ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
  ...(siteConfig.contactPhone ? { telephone: siteConfig.contactPhone.e164 } : {}),
  areaServed: { "@type": "Country", name: "US" },
  availableLanguage: ["en", "es"],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SermaWebDesign — Websites That Bring In More Customers",
    template: "%s — SermaWebDesign",
  },
  description: SITE_DESCRIPTION,
  // Home page defaults; /es sets its own, and the legal pages override with their canonical only.
  alternates: {
    canonical: `${BASE_PATH}/`,
    languages: {
      en: `${BASE_PATH}/`,
      es: `${BASE_PATH}/es/`,
      "x-default": `${BASE_PATH}/`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "SermaWebDesign",
    title: "Premium websites that get you picked first",
    description:
      "Your next customer is searching for you right now. We build the website that makes them call you, and you don’t pay until you’ve seen it and said yes.",
    // The image comes from src/app/opengraph-image.tsx (built at export time, 1200x630).
    locale: "en_US",
    alternateLocale: ["es_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium websites that get you picked first",
    description: "Your next customer is searching for you. We build the website that makes them call you. Pay only when you love it.",
  },
  robots: { index: true, follow: true },
  referrer: "strict-origin-when-cross-origin",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7FAFE" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1220" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${displaySerif.variable} ${workSans.variable} ${geistMono.variable}`}
      // The inline script below may add `dark` to <html> before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {cspMeta ? <meta httpEquiv="Content-Security-Policy" content={buildCsp({ meta: true })} /> : null}
        {/* Sets html.dark before first paint (no flash of the wrong theme). Inline scripts are allowed by the CSP. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
