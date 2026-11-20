import { asset } from "@/lib/asset";
import type { L10n } from "@/i18n/types";
import type { DemoCard, DemoId, DemoImage } from "./types";

export type { DemoCard, DemoContent, DemoId, DemoImage } from "./types";

/**
 * Gallery-facing records for the six demo websites at /work/<niche>/.
 * Every business here is fictional; the domains are pitch ideas, not real sites.
 */

const RECORDS: Record<DemoId, Omit<DemoCard, "id" | "href" | "shots">> = {
  barbershop: {
    business: "Ironside Barber Co.",
    pitchDomain: "ironsidebarber.com",
    tag: { en: "Barbershop", es: "Barbería" },
    accent: "#C9A45C",
  },
  salon: {
    business: "Maison Lumière",
    pitchDomain: "maisonlumiere.com",
    tag: { en: "Hair salon", es: "Salón de belleza" },
    accent: "#9B4A6B",
  },
  beauty: {
    business: "Velvet Room",
    pitchDomain: "velvetroomstudio.com",
    tag: { en: "Beauty studio", es: "Estudio de belleza" },
    accent: "#9CC5A6",
  },
  restaurant: {
    business: "Ember & Oak",
    pitchDomain: "emberandoak.com",
    tag: { en: "Restaurant", es: "Restaurante" },
    accent: "#E0902F",
  },
  contractor: {
    business: "Trueframe Builders",
    pitchDomain: "trueframebuilders.com",
    tag: { en: "Contractor", es: "Contratista" },
    accent: "#FF7A1A",
  },
  service: {
    business: "Brightline Home",
    pitchDomain: "brightlinehome.com",
    tag: { en: "Home services", es: "Servicios del hogar" },
    accent: "#0F8F80",
  },
};

const ORDER: DemoId[] = ["barbershop", "salon", "beauty", "restaurant", "contractor", "service"];

/** Pixel height of each full shot (all are 1280 wide), read from the files. Re-read after a re-capture. */
const SHOT_HEIGHT: Record<DemoId, Record<"en" | "es", number>> = {
  barbershop: { en: 5127, es: 5293 },
  salon: { en: 5900, es: 6038 },
  beauty: { en: 5262, es: 5467 },
  restaurant: { en: 5187, es: 5380 },
  contractor: { en: 6223, es: 6472 },
  service: { en: 5793, es: 5988 },
};

const shot = (id: DemoId, locale: "en" | "es") => ({
  full: asset(`/media/work/${id}/shot-${locale}-v1.jpg`),
  small: asset(`/media/work/${id}/shot-${locale}-v1-640.jpg`),
  width: 1280,
  height: SHOT_HEIGHT[id][locale],
});

export const DEMOS: DemoCard[] = ORDER.map((id) => ({
  id,
  ...RECORDS[id],
  href: `/work/${id}/`,
  shots: { en: shot(id, "en"), es: shot(id, "es") },
}));

export function demoImage(id: DemoId, name: string, alt: L10n, width: number, height: number): DemoImage {
  return {
    src: asset(`/media/work/${id}/${name}-v1.webp`),
    small: asset(`/media/work/${id}/${name}-v1-640.webp`),
    alt,
    width,
    height,
  };
}
