import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "How to read the demo websites on SermaWebDesign. Illustrative only; no guarantee of results.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return <LegalPage slug="disclaimer" />;
}
