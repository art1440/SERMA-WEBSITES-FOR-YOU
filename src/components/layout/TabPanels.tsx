"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useTabs } from "@/context/TabsContext";
import type { TabId } from "@/lib/tabs";

/**
 * Holds every section, shows one. Hidden panels stay mounted (`hidden`), so a
 * section keeps its state — calculator inputs, dashboard view, simulator step —
 * when the visitor comes back to it. The swap animates this single wrapper only
 * (opacity, x drift, tiny scale), read off the provider's motion values. At rest
 * the transform is exactly `none` (see transformTemplate), so the sections'
 * sticky stages and 3D contexts behave exactly as before.
 */
export function TabPanels({ panels }: { panels: { id: TabId; node: ReactNode }[] }) {
  const tabs = useTabs();
  const { veil, shift: x, scale } = tabs!;
  return (
    <motion.div
      style={{ opacity: veil, x, scale }}
      transformTemplate={(_, generated) => (x.get() === 0 && scale.get() === 1 ? "none" : generated)}
    >
      {panels.map(({ id, node }) => (
        <div key={id} id={`panel-${id}`} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={tabs!.active !== id}>
          {node}
        </div>
      ))}
    </motion.div>
  );
}
