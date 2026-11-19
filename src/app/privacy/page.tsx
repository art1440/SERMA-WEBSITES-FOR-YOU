import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SermaWebDesign is cookieless by default: no trackers, no analytics pixels, and no sale or sharing of personal data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
