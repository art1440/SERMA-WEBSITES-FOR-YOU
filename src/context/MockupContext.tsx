"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { MockupModal } from "@/components/layout/MockupModal";

type MockupValue = { openMockup: () => void };

const MockupContext = createContext<MockupValue | null>(null);

/** Holds the "Get your free preview" pop-up so any button on any page can open it. */
export function MockupProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openMockup = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openMockup }), [openMockup]);
  return (
    <MockupContext.Provider value={value}>
      {children}
      <MockupModal open={open} onClose={close} />
    </MockupContext.Provider>
  );
}

export function useMockup(): MockupValue {
  const ctx = useContext(MockupContext);
  if (!ctx) throw new Error("useMockup must be used inside <MockupProvider>.");
  return ctx;
}
