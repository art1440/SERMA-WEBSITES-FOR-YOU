"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { NICHE_BY_ID, type Niche, type NicheId } from "@/data/niches";

/** Shares the selected industry across the Dashboard, Simulator and Calculator. */
type NicheContextValue = {
  nicheId: NicheId;
  niche: Niche;
  /** A visitor's own choice (tabs, carousel, presets). Stops automatic cycling from overriding it. */
  pickNiche: (id: NicheId) => void;
  /** Automatic change (scroll-driven showcase). Ignored once the visitor has picked. */
  autoNiche: (id: NicheId) => void;
  /** Ref, not state: reading it never re-renders. */
  userPicked: { readonly current: boolean };
};

const NicheContext = createContext<NicheContextValue | null>(null);

export function NicheProvider({ children }: { children: ReactNode }) {
  const [nicheId, setNicheId] = useState<NicheId>("barbershop");
  const userPicked = useRef(false);
  const pickNiche = useCallback((id: NicheId) => {
    userPicked.current = true;
    setNicheId(id);
  }, []);
  const autoNiche = useCallback((id: NicheId) => {
    if (!userPicked.current) setNicheId(id);
  }, []);
  const value = useMemo(
    () => ({ nicheId, niche: NICHE_BY_ID[nicheId], pickNiche, autoNiche, userPicked }),
    [nicheId, pickNiche, autoNiche],
  );
  return <NicheContext.Provider value={value}>{children}</NicheContext.Provider>;
}

export function useNiche(): NicheContextValue {
  const ctx = useContext(NicheContext);
  if (!ctx) throw new Error("useNiche must be used inside <NicheProvider>.");
  return ctx;
}
