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

const ORDER: DemoId[] = ["contractor", "service", "restaurant", "barbershop", "salon", "beauty"];

/** Pixel height of each full shot (all are 1280 wide), read from the files. Re-read after a re-capture. */
const SHOT_HEIGHT: Record<DemoId, Record<"en" | "es", number>> = {
  barbershop: { en: 10401, es: 10615 },
  salon: { en: 8885, es: 9162 },
  beauty: { en: 8599, es: 8820 },
  restaurant: { en: 7858, es: 8023 },
  contractor: { en: 6808, es: 6959 },
  service: { en: 9449, es: 9545 },
};

/** Pixel height of each phone shot (all are 780 wide: 390 CSS px at 2×), read from the files. */
const MOBILE_HEIGHT: Record<DemoId, Record<"en" | "es", number>> = {
  barbershop: { en: 22248, es: 22712 },
  salon: { en: 20096, es: 20840 },
  beauty: { en: 19592, es: 20180 },
  restaurant: { en: 18426, es: 19178 },
  contractor: { en: 18820, es: 19298 },
  service: { en: 27398, es: 28206 },
};

const shot = (id: DemoId, locale: "en" | "es") => ({
  full: asset(`/media/work/${id}/shot-${locale}-v3.jpg`),
  small: asset(`/media/work/${id}/shot-${locale}-v3-640.jpg`),
  width: 1280,
  height: SHOT_HEIGHT[id][locale],
  mobile: {
    src: asset(`/media/work/${id}/shot-${locale}-mobile-v3.jpg`),
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

/**
 * A full-width hero photo: like demoImage, plus the 2560 px file written by
 * `scripts/import-photo.py ... --hero`. `width` / `height` are the 1600 px file's pixels.
 */
export function heroImage(id: DemoId, name: string, alt: L10n, width: number, height: number): DemoImage {
  return { ...demoImage(id, name, alt, width, height), large: asset(`/media/work/${id}/${name}-v1-2560.webp`) };
}

export function demoImage(id: DemoId, name: string, alt: L10n, width: number, height: number): DemoImage {
  return {
    src: asset(`/media/work/${id}/${name}-v1.webp`),
    small: asset(`/media/work/${id}/${name}-v1-640.webp`),
    alt,
    width,
    height,
  };
}
