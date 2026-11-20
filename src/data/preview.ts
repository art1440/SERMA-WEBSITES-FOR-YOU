import type { L10n } from "@/i18n/types";
import type { NicheId } from "@/data/niches";

/**
 * Copy for the hero's live site preview: the visitor types their business name,
 * picks an industry, and a phone shows a sample site with their name on it.
 * Everything inside the phone is sample content, labelled as such.
 */
export const PREVIEW = {
  eyebrow: { en: "Try it now", es: "Pruébelo ahora" },
  title: { en: "See your business on a real website", es: "Vea su negocio en un sitio web de verdad" },
  inputLabel: { en: "Your business name", es: "Nombre de su negocio" },
  inputPlaceholder: { en: "Type your business name", es: "Escriba el nombre de su negocio" },
  industryLabel: { en: "Your industry", es: "Su industria" },
  cta: { en: "Get this as your free mockup", es: "Quiero esto como mi maqueta gratis" },
  sample: { en: "Sample preview", es: "Vista de ejemplo" },
  phoneLabel: {
    en: "Sample website preview for {name}",
    es: "Vista de ejemplo del sitio web de {name}",
  },
  hours: { en: "Open today · 9 AM–7 PM", es: "Abierto hoy · 9 AM–7 PM" },
  near: { en: "Near you", es: "Cerca de usted" },
  services: { en: "Services", es: "Servicios" },
};

export type PreviewIndustry = {
  id: NicheId;
  chip: L10n;
  tagline: L10n;
  primary: L10n;
  secondary: L10n;
  services: [L10n, L10n, L10n];
};

/** The four industries offered as chips (photos come from the matching niche). */
export const PREVIEW_INDUSTRIES: PreviewIndustry[] = [
  {
    id: "barbershop",
    chip: { en: "Barber", es: "Barbería" },
    tagline: { en: "Fresh cuts. No long waits.", es: "Cortes frescos. Sin largas esperas." },
    primary: { en: "Call to book", es: "Llame para agendar" },
    secondary: { en: "Book online", es: "Agendar en línea" },
    services: [
      { en: "Haircut", es: "Corte" },
      { en: "Skin fade", es: "Degradado" },
      { en: "Beard trim", es: "Barba" },
    ],
  },
  {
    id: "salon",
    chip: { en: "Salon", es: "Salón" },
    tagline: { en: "Color, cuts and care.", es: "Color, cortes y cuidado." },
    primary: { en: "Call to book", es: "Llame para agendar" },
    secondary: { en: "Book online", es: "Agendar en línea" },
    services: [
      { en: "Cut & style", es: "Corte y peinado" },
      { en: "Color", es: "Color" },
      { en: "Blowout", es: "Secado" },
    ],
  },
  {
    id: "restaurant",
    chip: { en: "Restaurant", es: "Restaurante" },
    tagline: { en: "Fresh food, made daily.", es: "Comida fresca, hecha a diario." },
    primary: { en: "Call to order", es: "Llame para ordenar" },
    secondary: { en: "See the menu", es: "Ver el menú" },
    services: [
      { en: "Lunch", es: "Almuerzo" },
      { en: "Dinner", es: "Cena" },
      { en: "Catering", es: "Banquetes" },
    ],
  },
  {
    id: "contractor",
    chip: { en: "Contractor", es: "Contratista" },
    tagline: { en: "Free estimates. Quality work.", es: "Presupuestos gratis. Trabajo de calidad." },
    primary: { en: "Call for a quote", es: "Llame para cotizar" },
    secondary: { en: "Request a quote", es: "Pedir cotización" },
    services: [
      { en: "Remodels", es: "Remodelaciones" },
      { en: "Roofing", es: "Techos" },
      { en: "Repairs", es: "Reparaciones" },
    ],
  },
];
