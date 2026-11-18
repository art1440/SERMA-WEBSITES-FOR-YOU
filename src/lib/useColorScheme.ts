"use client";

import { useSyncExternalStore } from "react";
import { currentScheme, type Scheme } from "./theme";

function subscribe(onChange: () => void) {
  // Watching the class (not React state) keeps every consumer — including the WebGL scene,
  // which must not remount — in step with whatever changed <html>.
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** Current colour scheme. "light" on the server and during hydration, then the real one. */
export function useColorScheme(): Scheme {
  return useSyncExternalStore(subscribe, currentScheme, () => "light");
}
