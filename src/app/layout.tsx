import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";
import { SkipLink } from "@/components/layout/SkipLink";
import { displaySerif, geistMono, geistSans } from "./fonts";
import "./globals.css";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SermaWebDesign — Client-Acquisition Systems for Local Business",
    template: "%s — SermaWebDesign",
  },
  description:
    "Custom high-converting websites wired into a private Client Dashboard: missed-call text-back, automated bookings, lead tracking, and repeat business for barbershops, salons, beauty studios, restaurants, contractors, and service businesses. English & Spanish.",
  openGraph: {
    type: "website",
    siteName: "SermaWebDesign",
    title: "SermaWebDesign — Not a brochure. A system that books clients.",
    description:
      "Websites + Client Dashboard + missed-call SMS recovery for local businesses. Book a live system demo.",
    images: [{ url: "/media/hero-poster.jpg", width: 1600, height: 900, alt: "SermaWebDesign" }],
    locale: "en_US",
    alternateLocale: ["es_US"],
  },
  robots: { index: true, follow: true },
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
      <body>
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
