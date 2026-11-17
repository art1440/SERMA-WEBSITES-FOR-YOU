"use client";

import { motion, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useTabs } from "@/context/TabsContext";
import type { TabId } from "@/lib/tabs";

/**
 * Holds every section, shows one. Hidden panels stay mounted (`hidden`), so a
 * section keeps its state — calculator inputs, dashboard view, simulator step —
 * when the visitor comes back to it. The swap itself is opacity plus a 14px
 * rise, read off the provider's `veil`; at rest the transform is `none`, so the
 * sections' sticky stages and 3D contexts behave exactly as before.
 */
export function TabPanels({ panels }: { panels: { id: TabId; node: ReactNode }[] }) {
  const tabs = useTabs();
  const veil = tabs!.veil;
  const y = useTransform(veil, [0, 1], [14, 0]);
  return (
    <motion.div style={{ opacity: veil, y }}>
      {panels.map(({ id, node }) => (
        <div key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={tabs!.active !== id}>
          {node}
        </div>
      ))}
    </motion.div>
  );
}
