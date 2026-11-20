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
  barbershop: { en: 5136, es: 5303 },
  salon: { en: 5905, es: 6043 },
  beauty: { en: 5270, es: 5448 },
  restaurant: { en: 5195, es: 5387 },
  contractor: { en: 6232, es: 6421 },
  service: { en: 5743, es: 5920 },
};

/** Pixel height of each phone shot (all are 780 wide: 390 CSS px at 2×), read from the files. */
const MOBILE_HEIGHT: Record<DemoId, Record<"en" | "es", number>> = {
  barbershop: { en: 10730, es: 10962 },
  salon: { en: 13996, es: 14594 },
  beauty: { en: 15040, es: 15568 },
  restaurant: { en: 13388, es: 14196 },
  contractor: { en: 18460, es: 19130 },
  service: { en: 15878, es: 16678 },
};

const shot = (id: DemoId, locale: "en" | "es") => ({
  full: asset(`/media/work/${id}/shot-${locale}-v1.jpg`),
  small: asset(`/media/work/${id}/shot-${locale}-v1-640.jpg`),
  width: 1280,
  height: SHOT_HEIGHT[id][locale],
  mobile: {
    src: asset(`/media/work/${id}/shot-${locale}-mobile-v1.jpg`),
    width: 780,
    height: MOBILE_HEIGHT[id][locale],
  },
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
