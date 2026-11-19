import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "How to read SermaWebDesign's interactive dashboard simulations and calculator figures. Illustrative only; no guarantee of results.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return <LegalPage slug="disclaimer" />;
}
