import type { Metadata } from "next";
import { DEMOS, type DemoId } from "@/data/demos";
import { BASE_PATH } from "@/lib/asset";

/** Demo pages are fictional: never indexed, never followed, canonical to themselves. */
export function demoMetadata(id: DemoId): Metadata {
  const business = DEMOS.find((d) => d.id === id)?.business ?? id;
  const title = `${business} (demo)`;
  return {
    title,
    robots: { index: false, follow: false },
    alternates: { canonical: `${BASE_PATH}/work/${id}/` },
    openGraph: { title },
  };
}
