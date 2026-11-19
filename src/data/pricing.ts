import type { L10n } from "@/i18n/types";

/**
 * The three packages on the Pricing tab. TEMPLATE: prices are not set yet.
 *
 * To publish a price, replace `null` with a number in US dollars, e.g. `price: 1490`.
 * While a price is `null` the card shows a "—" and "Price coming soon".
 * `monthly` is an optional ongoing fee (care plan / hosting); leave it `null` to hide the line.
 *
 * Every feature is a two-language string. A feature with `soon: true` is shown with a
 * "When it launches" tag (the phone side is still being built, see `included.roadmap`).
 */
export type Feature = L10n & { soon?: boolean };

export type Tier = {
  id: "starter" | "business" | "growth";
  name: L10n;
  tagline: L10n;
  /** One-time build price in USD, or null while not decided. */
  price: number | null;
  /** Optional monthly fee in USD, or null to hide it. */
  monthly: number | null;
  /** The middle card: lifted and marked "Most popular". */
  featured?: boolean;
  /** "Everything in X, plus:" line above the list (tiers 2 and 3). */
  inherits?: L10n;
  features: Feature[];
};

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: { en: "Starter", es: "Inicial" },
    tagline: {
      en: "One strong page that gets the phone ringing.",
      es: "Una página sólida que hace sonar el teléfono.",
    },
    price: null,
    monthly: null,
    features: [
      { en: "One-page website (services, hours, location, contact)", es: "Sitio de una página (servicios, horario, ubicación, contacto)" },
      { en: "15-minute intro call to get your details", es: "Llamada de presentación de 15 minutos" },
      { en: "Copy written for you, approved by you", es: "Textos escritos por nosotros, aprobados por usted" },
      { en: "Your best photos, picked and cropped", es: "Sus mejores fotos, elegidas y recortadas" },
      { en: "Tap-to-call button on every screen", es: "Botón para llamar en cada pantalla" },
      { en: "Fast on any phone", es: "Rápido en cualquier teléfono" },
      { en: "Live on your own domain", es: "Publicado en su propio dominio" },
      { en: "See the finished draft before you pay", es: "Vea el borrador terminado antes de pagar" },
      { en: "1 round of revisions", es: "1 ronda de cambios" },
    ],
  },
  {
    id: "business",
    name: { en: "Business", es: "Negocio" },
    tagline: {
      en: "A full site for a business that's ready to grow.",
      es: "Un sitio completo para un negocio listo para crecer.",
    },
    price: null,
    monthly: null,
    featured: true,
    inherits: { en: "Everything in Starter, plus:", es: "Todo lo de Inicial, y además:" },
    features: [
      { en: "Up to 5 pages (home, services, about, gallery, contact)", es: "Hasta 5 páginas (inicio, servicios, nosotros, galería, contacto)" },
      { en: "Enquiry form that lands in your inbox", es: "Formulario de contacto que llega a su correo" },
      { en: "Link to the booking tool you already use", es: "Enlace a la herramienta de citas que ya usa" },
      { en: "Google Business Profile set up or tidied", es: "Perfil de Google Business creado o actualizado" },
      { en: "Basic local SEO (titles, descriptions, map)", es: "SEO local básico (títulos, descripciones, mapa)" },
      { en: "2 rounds of revisions", es: "2 rondas de cambios" },
      { en: "Small text and photo edits each month", es: "Cambios pequeños de texto y fotos cada mes" },
      { en: "Replies within one business day", es: "Respuesta en un día hábil" },
    ],
  },
  {
    id: "growth",
    name: { en: "Growth", es: "Crecimiento" },
    tagline: {
      en: "The site, plus the system that answers for you.",
      es: "El sitio, más el sistema que contesta por usted.",
    },
    price: null,
    monthly: null,
    inherits: { en: "Everything in Business, plus:", es: "Todo lo de Negocio, y además:" },
    features: [
      { en: "Up to 10 pages, one per service", es: "Hasta 10 páginas, una por servicio" },
      { en: "Bilingual site (English and Spanish)", es: "Sitio bilingüe (inglés y español)" },
      { en: "Unlimited revisions before launch", es: "Cambios ilimitados antes del lanzamiento" },
      { en: "Priority same-day replies", es: "Respuesta prioritaria el mismo día" },
      { en: "Quarterly refresh of photos and offers", es: "Actualización trimestral de fotos y ofertas" },
      { en: "Missed calls answered by text in seconds", es: "Llamadas perdidas contestadas por texto en segundos", soon: true },
      { en: "Online booking with deposits", es: "Citas en línea con depósito", soon: true },
      { en: "Automatic reminder the day before", es: "Recordatorio automático un día antes", soon: true },
    ],
  },
];
