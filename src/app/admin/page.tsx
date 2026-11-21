import type { Metadata } from "next";
import { CrmApp } from "@/components/crm/CrmApp";

/** Private lead dashboard. Never indexed or followed, and left out of the sitemap. */
export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

export default function AdminPage() {
  return <CrmApp />;
}
