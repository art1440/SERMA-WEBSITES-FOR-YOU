"use client";

import { createContext, useContext } from "react";

/**
 * True on a demo opened with ?capture=1 (the gallery screenshot run). Set by
 * DemoShell. useDemoStill() treats it like reduced motion, so every scroll
 * device renders its final, unpinned layout and a full-page screenshot shows
 * the whole page instead of pinned stages with empty scroll room under them.
 */
export const DemoCaptureContext = createContext(false);
export const useDemoCapture = () => useContext(DemoCaptureContext);
