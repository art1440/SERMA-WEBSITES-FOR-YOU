"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { PanelVisitContext, useTabs, useTabVisit } from "@/context/TabsContext";
import type { TabId } from "@/lib/tabs";

/**
 * Holds every section, shows one. Hidden panels stay mounted (`hidden`), so a
 * section keeps its state — calculator inputs, dashboard view, simulator step —
 * when the visitor comes back to it. The swap is opacity only. At rest the wrapper
 * carries no transform, so the sections' sticky stages and 3D contexts behave exactly
 * as before. Each panel gets the visit number so its reveals replay on every open.
 */
export function TabPanels({ panels }: { panels: { id: TabId; node: ReactNode }[] }) {
  const tabs = useTabs();
  const veil = tabs!.veil;
  const visit = useTabVisit();
  return (
    <motion.div style={{ opacity: veil }}>
      {panels.map(({ id, node }) => (
        <div key={id} id={`panel-${id}`} role="tabpanel" tabIndex={-1} className="outline-none" aria-labelledby={`tab-${id}`} hidden={tabs!.active !== id}>
          <PanelVisitContext.Provider value={visit?.id === id ? visit.n : null}>{node}</PanelVisitContext.Provider>
        </div>
      ))}
    </motion.div>
  );
}
