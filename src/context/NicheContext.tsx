"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { NICHE_BY_ID, type Niche, type NicheId } from "@/data/niches";

/** Shares the selected industry across the Dashboard, Simulator and Calculator. */
type NicheContextValue = {
  nicheId: NicheId;
  niche: Niche;
  setNicheId: (id: NicheId) => void;
};

const NicheContext = createContext<NicheContextValue | null>(null);

export function NicheProvider({ children }: { children: ReactNode }) {
  const [nicheId, setNicheId] = useState<NicheId>("barbershop");
  const value = useMemo(() => ({ nicheId, niche: NICHE_BY_ID[nicheId], setNicheId }), [nicheId]);
  return <NicheContext.Provider value={value}>{children}</NicheContext.Provider>;
}

export function useNiche(): NicheContextValue {
  const ctx = useContext(NicheContext);
  if (!ctx) throw new Error("useNiche must be used inside <NicheProvider>.");
  return ctx;
}
