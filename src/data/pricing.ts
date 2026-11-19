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
  /**
   * The real regular price after the launch offer ends (shown struck through next to `price`
   * while LAUNCH.active is true). Only use a price you will actually charge afterwards:
   * a "was" price that is never charged is a deceptive comparison (FTC, 16 CFR 233.1).
   */
  regular?: number;
  /** The middle card: lifted and marked "Most popular". */
  featured?: boolean;
  /** "Everything in X, plus:" line above the list (tiers 2 and 3). */
  inherits?: L10n;
  features: Feature[];
};

/**
 * Launch offer. Today's prices are launch prices for the first `spots` clients; after that each
 * package goes to its `regular` price. KEEP IT TRUE:
 *  - `taken`: how many launch spots are already sold. Bump it each time you sign a client. When
 *    `taken` reaches `spots`, every card switches to the regular price automatically.
 *  - `endsAt`: optional REAL end date for the launch offer, e.g. "2027-01-31T23:59:59-06:00".
 *    When set, a live countdown appears; when it reaches zero the launch prices end for good.
 *    Never move it forward to restart the clock: a resetting countdown is a fake deadline (FTC).
 *  - `perks`: true lines shown under the price, one per card, in a different order on each visit.
 *    Only claims that apply to EVERY package belong here.
 */
export const LAUNCH = {
  active: true,
  spots: 10,
  taken: 0,
  endsAt: null as string | null,
  label: { en: "Launch price", es: "Precio de lanzamiento" },
  regular: { en: "Regular price", es: "Precio regular" },
  spotsLeft: { en: "{left} of {spots} launch spots left", es: "Quedan {left} de {spots} lugares de lanzamiento" },
  endsIn: { en: "Ends in", es: "Termina en" },
  perks: [
    { en: "See the finished draft before you pay", es: "Vea el borrador terminado antes de pagar" },
    { en: "Copy written for you, approved by you", es: "Textos escritos para usted, aprobados por usted" },
    { en: "Live on your own domain", es: "Publicado en su propio dominio" },
    { en: "Tap-to-call button on every screen", es: "Botón para llamar en cada pantalla" },
    { en: "Fixed price, no hourly billing", es: "Precio fijo, sin cobro por hora" },
    { en: "Fast on any phone", es: "Rápido en cualquier teléfono" },
  ],
} as const;

export const TIERS: Tier[] = [
  {
    id: "starter",
    name: { en: "Starter", es: "Inicial" },
    tagline: {
      en: "One strong page that gets the phone ringing.",
      es: "Una página sólida que hace sonar el teléfono.",
    },
    price: 299,
    regular: 599,
    monthly: 99.99,
    features: [
      { en: "One-page website (services, hours, location, contact)", es: "Sitio de una página (servicios, horario, ubicación, contacto)" },
      { en: "15-minute intro call to get your details", es: "Llamada de presentación de 15 minutos" },
      { en: "Copy written for you, approved by you", es: "Textos redactados por nosotros, aprobados por usted" },
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
    price: 599,
    regular: 1199,
    monthly: 99.99,
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
    price: 999,
    regular: 1999,
    monthly: 99.99,
    inherits: { en: "Everything in Business, plus:", es: "Todo lo de Negocio, y además:" },
    features: [
      { en: "Up to 10 pages, one per service", es: "Hasta 10 páginas, una por servicio" },
      { en: "Bilingual site (English and Spanish)", es: "Sitio bilingüe (inglés y español)" },
      { en: "Unlimited revisions before launch", es: "Cambios ilimitados antes del lanzamiento" },
      { en: "Priority same-day replies", es: "Respuesta prioritaria el mismo día" },
      { en: "Quarterly refresh of photos and offers", es: "Actualización trimestral de fotos y ofertas" },
      { en: "Missed calls answered by text in seconds", es: "Llamadas perdidas contestadas por mensaje de texto en segundos", soon: true },
      { en: "Online booking with deposits", es: "Citas en línea con anticipo", soon: true },
      { en: "Automatic reminder the day before", es: "Recordatorio automático un día antes", soon: true },
    ],
  },
];
