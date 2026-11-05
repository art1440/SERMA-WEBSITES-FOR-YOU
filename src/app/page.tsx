"use client";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ComparisonMatrix } from "@/components/sections/ComparisonMatrix";
import { DashboardShowcase } from "@/components/sections/DashboardShowcase";
import { DemoContact } from "@/components/sections/DemoContact";
import { Hero } from "@/components/sections/Hero";
import { MissedCallSimulator } from "@/components/sections/MissedCallSimulator";
import { RevenueCalculator } from "@/components/sections/RevenueCalculator";
import { SystemArchitecture } from "@/components/sections/SystemArchitecture";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { KineticBand } from "@/components/ui/KineticBand";
import { NICHES } from "@/data/niches";
import { useLanguage } from "@/context/LanguageContext";
import { NicheProvider } from "@/context/NicheContext";

export default function HomePage() {
  const { t, locale } = useLanguage();
  return (
    <>
      <DocumentTitle title={t.meta.title} />
      <span id="top" aria-hidden="true" />
      <Navbar />
      <NicheProvider>
        <main id="main" tabIndex={-1} className="focus:outline-none">
          <Hero />
          <KineticBand words={NICHES.map((n) => n.label[locale])} />
          <SystemArchitecture />
          <DashboardShowcase />
          <MissedCallSimulator />
          <RevenueCalculator />
          <KineticBand words={t.hero.stack} />
          <ComparisonMatrix />
          <DemoContact />
        </main>
      </NicheProvider>
      <Footer />
    </>
  );
}
