"use client";

import { HeroChapter } from "@/components/chapters/HeroChapter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TabPanels } from "@/components/layout/TabPanels";
import { ComparisonMatrix } from "@/components/sections/ComparisonMatrix";
import { InclusionsList } from "@/components/sections/InclusionsList";
import { PricingSection } from "@/components/sections/PricingSection";
import { RevenueCalculator } from "@/components/sections/RevenueCalculator";
import { WorkGallery } from "@/components/sections/work/WorkGallery";
import { Stage } from "@/components/three/Stage";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { useLanguage } from "@/context/LanguageContext";
import { NicheProvider } from "@/context/NicheContext";
import { SceneProvider } from "@/context/SceneContext";
import { TabsProvider } from "@/context/TabsContext";

/**
 * One page: every section stacked in order; the navbar scrolls between them.
 * Transparent sections (the pricing finale) reveal the fixed 3D <Stage>;
 * opaque sections cover it. Each keeps its own scroll choreography.
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
                { id: "work", node: <WorkGallery /> },
                { id: "calculator", node: <RevenueCalculator /> },
                { id: "compare", node: <ComparisonMatrix /> },
                { id: "pricing", node: <PricingSection /> },
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
