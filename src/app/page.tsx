"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ComparisonMatrix } from "@/components/sections/ComparisonMatrix";
import { DashboardShowcase } from "@/components/sections/DashboardShowcase";
import { DemoRequestForm } from "@/components/sections/DemoRequestForm";
import { Hero } from "@/components/sections/Hero";
import { MissedCallSimulator } from "@/components/sections/MissedCallSimulator";
import { RevenueCalculator } from "@/components/sections/RevenueCalculator";
import { SystemArchitecture } from "@/components/sections/SystemArchitecture";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { useLanguage } from "@/context/LanguageContext";
import { NicheProvider } from "@/context/NicheContext";

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <>
      <DocumentTitle title={t.meta.title} />
      <span id="top" aria-hidden="true" />
      <Navbar />
      <NicheProvider>
        <main id="main" tabIndex={-1} className="focus:outline-none">
          <Hero />
          <SystemArchitecture />
          <DashboardShowcase />
          <MissedCallSimulator />
          <RevenueCalculator />
          <ComparisonMatrix />
          <DemoRequestForm />
        </main>
      </NicheProvider>
      <Footer />
    </>
  );
}
