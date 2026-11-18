"use client";

import { HeroChapter } from "@/components/chapters/HeroChapter";
import { IndustriesChapter } from "@/components/chapters/IndustriesChapter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TabPanels } from "@/components/layout/TabPanels";
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
import { TabsProvider } from "@/context/TabsContext";

/**
 * The page is a set of tabbed "chapters", one on screen at a time (picked from
 * the navbar). Transparent chapters (hero, finale) reveal the fixed 3D
 * <Stage>; opaque chapters cover it. Each keeps its own scroll choreography.
 */
export default function HomePage() {
  const { t } = useLanguage();
  return (
    <SceneProvider>
      <NicheProvider>
        <TabsProvider>
          <DocumentTitle title={t.meta.title} />
          <span id="top" aria-hidden="true" />
          <Stage />
          <Navbar />
          <main id="main" tabIndex={-1} className="relative z-10 focus:outline-none">
            <TabPanels
              panels={[
                { id: "home", node: <HeroChapter /> },
                { id: "included", node: <InclusionsList /> },
                { id: "industries", node: <IndustriesChapter /> },
                { id: "dashboard", node: <DashboardShowcase /> },
                { id: "simulator", node: <MissedCallSimulator /> },
                { id: "calculator", node: <RevenueCalculator /> },
                { id: "compare", node: <ComparisonMatrix /> },
                { id: "demo", node: <DemoContact /> },
              ]}
            />
          </main>
          <div className="relative z-10">
            <Footer />
          </div>
        </TabsProvider>
      </NicheProvider>
    </SceneProvider>
  );
}
