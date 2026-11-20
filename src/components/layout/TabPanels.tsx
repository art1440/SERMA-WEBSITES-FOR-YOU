import type { ReactNode } from "react";
import type { TabId } from "@/lib/tabs";

/** Every section, stacked in order on one page. Each section carries its own anchor id. */
export function TabPanels({ panels }: { panels: { id: TabId; node: ReactNode }[] }) {
  return (
    <>
      {panels.map(({ id, node }) => (
        <div key={id} data-section={id}>
          {node}
        </div>
      ))}
    </>
  );
}
