"use client";

import { HeroChapter } from "@/components/chapters/HeroChapter";
import { IndustriesChapter } from "@/components/chapters/IndustriesChapter";
import { SystemChapter } from "@/components/chapters/SystemChapter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ComparisonMatrix } from "@/components/sections/ComparisonMatrix";
import { DashboardShowcase } from "@/components/sections/DashboardShowcase";
import { DemoContact } from "@/components/sections/DemoContact";
import { InclusionsList } from "@/components/sections/InclusionsList";
import { MissedCallSimulator } from "@/components/sections/MissedCallSimulator";
import { RevenueCalculator } from "@/components/sections/RevenueCalculator";
import { Stage } from "@/components/three/Stage";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { useLanguage } from "@/context/LanguageContext";
import { NicheProvider } from "@/context/NicheContext";
import { SceneProvider } from "@/context/SceneContext";

/**
 * The page is a sequence of scroll "chapters". Transparent chapters (hero,
 * system, finale) reveal the fixed 3D <Stage>; opaque chapters cover it.
 */
export default function HomePage() {
  const { t } = useLanguage();
  return (
    <SceneProvider>
      <NicheProvider>
        <DocumentTitle title={t.meta.title} />
        <span id="top" aria-hidden="true" />
        <Stage />
        <Navbar />
        <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
          <HeroChapter />
          <SystemChapter />
          <InclusionsList />
          <IndustriesChapter />
          <DashboardShowcase />
          <MissedCallSimulator />
          <RevenueCalculator />
          <ComparisonMatrix />
          <DemoContact />
        </main>
        <div className="relative z-10">
          <Footer />
        </div>
      </NicheProvider>
    </SceneProvider>
  );
}
