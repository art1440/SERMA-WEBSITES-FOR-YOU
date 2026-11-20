import type { Metadata } from "next";
import { DEMOS, type DemoId } from "@/data/demos";

/** Demo pages are fictional: never indexed, never followed. */
export function demoMetadata(id: DemoId): Metadata {
  const business = DEMOS.find((d) => d.id === id)?.business ?? id;
  return { title: `${business} (demo)`, robots: { index: false, follow: false } };
}
