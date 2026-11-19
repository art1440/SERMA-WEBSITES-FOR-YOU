import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the SermaWebDesign website, demo requests, and text-message communications.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
