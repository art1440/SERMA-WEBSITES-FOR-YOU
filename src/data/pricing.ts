import type { L10n } from "@/i18n/types";

/**
 * The three packages on the Pricing tab. TEMPLATE: prices are not set yet.
 *
 * To publish a price, replace `null` with a number in US dollars, e.g. `price: 1490`.
 * While a price is `null` the card shows a "—" and "Price coming soon".
 * `monthly` is an optional ongoing fee (management and care plan); leave it `null` to hide the line.
 *
 * Every feature is a two-language string. A feature with `soon: true` is shown with a
 * "When it launches" tag (the phone side is still being built).
 */
export type Feature = L10n & { soon?: boolean };

export type Tier = {
  id: "starter" | "business" | "growth";
  name: L10n;
  tagline: L10n;
  /** One-time build price in USD, or null while not decided. */
  price: number | null;
  /** True when `price` is a starting point ("$1,000+"): the final quote depends on scope. */
  from?: boolean;
  /** Optional monthly fee in USD, or null to hide it. */
  monthly: number | null;
  /**
   * The real regular price after the launch offer ends (shown struck through next to `price`
   * while LAUNCH.active is true). Only use a price you will actually charge afterwards:
   * a "was" price that is never charged is a deceptive comparison (FTC, 16 CFR 233.1).
   */
  regular?: number;
  /** True when the regular price is a starting point ("$1,200+"); after the sale the card shows it with a "+". */
  regularFrom?: boolean;
  /** Launch spots ALREADY SOLD on this package (real signed clients). Each package has LAUNCH.spots. */
  launchTaken?: number;
  /** Number of equal monthly payments the build can be split into (no interest), or unset for none. */
  installments?: number;
  /** The middle card: lifted and marked "Most popular". */
  featured?: boolean;
  /** "Everything in X, plus:" line above the list (tiers 2 and 3). */
  inherits?: L10n;
  features: Feature[];
};

/**
 * Limited-time offer (currently the Black Friday sale). While it is live, each card shows its
 * `price` with the `regular` price struck through; once `endsAt` passes, every card switches to its
 * regular price on its own and the sale banner, hero chip and sale FAQ disappear. KEEP IT TRUE:
 *  - `regular` prices must be what you really charge once the sale ends (FTC, 16 CFR 233.1).
 *  - `spots`: launch spots PER PACKAGE, or null for no spots limit (no meter is shown). With a
 *    number, each package's `launchTaken` is how many are already sold.
 *  - `endsAt`: optional REAL end date for the launch offer, e.g. "2027-01-31T23:59:59-06:00".
 *    When set, a live countdown appears; when it reaches zero the launch prices end for good.
 *    Never move it forward to restart the clock: a resetting countdown is a fake deadline (FTC).
 *  - `perks`: true lines shown under the price, one per card, in a different order on each visit.
 *    Only claims that apply to EVERY package belong here.
 */
export const LAUNCH = {
  active: true,
  spots: null as number | null,
  /** End of Cyber Monday, Central time. Do not move it later to restart the clock. */
  endsAt: "2026-11-30T23:59:59-06:00" as string | null,
  label: { en: "Black Friday price", es: "Precio de Black Friday" },
  save: { en: "Save {amount}", es: "Ahorre {amount}" },
  /** The countdown banner above the packages and the chip in the hero. */
  banner: {
    eyebrow: { en: "Black Friday sale", es: "Oferta de Black Friday" },
    title: { en: "$200 off every package.", es: "$200 de descuento en cada paquete." },
    body: {
      en: "Request your free preview before the timer runs out and the sale price is locked in for your project. When it hits zero, prices go back up.",
      es: "Pida su vista previa gratis antes de que se acabe el tiempo y el precio de oferta queda asegurado para su proyecto. Cuando llegue a cero, los precios vuelven a subir.",
    },
    endsOn: { en: "Ends Monday, Nov 30 at 11:59 pm CT", es: "Termina el lunes 30 de nov. a las 11:59 pm (hora del centro)" },
    units: { en: ["Days", "Hours", "Min", "Sec"], es: ["Días", "Horas", "Min", "Seg"] },
    cta: { en: "Lock in my price", es: "Asegurar mi precio" },
    chip: { en: "Black Friday · $200 off · {time}", es: "Black Friday · $200 menos · {time}" },
  },
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
      en: "Everything a customer needs to call you, on one sharp page.",
      es: "Todo lo que un cliente necesita para llamarle, en una página impecable.",
    },
    price: 499,
    regular: 699,
    monthly: 99.99,
    features: [
      { en: "One-page website (services, hours, location, contact)", es: "Sitio de una página (servicios, horario, ubicación, contacto)" },
      { en: "15-minute intro call to get your details", es: "Llamada de presentación de 15 minutos" },
      { en: "Copy written for you, approved by you", es: "Textos redactados por nosotros, aprobados por usted" },
      { en: "Your best photos, picked and cropped", es: "Sus mejores fotos, elegidas y recortadas" },
      { en: "Tap-to-call button on every screen", es: "Botón para llamar en cada pantalla" },
      { en: "Fast on any phone", es: "Rápido en cualquier teléfono" },
      { en: "Live on your own domain", es: "Publicado en su propio dominio" },
      { en: "Free Google Business Profile makeover", es: "Renovación gratis de su Perfil de Google Business" },
      { en: "See the finished draft before you pay", es: "Vea el borrador terminado antes de pagar" },
      { en: "1 round of revisions", es: "1 ronda de cambios" },
    ],
  },
  {
    id: "business",
    name: { en: "Business", es: "Negocio" },
    tagline: {
      en: "The full website that makes you look like the best in town.",
      es: "El sitio completo que lo hace ver como el mejor de la zona.",
    },
    price: 799,
    installments: 3,
    regular: 999,
    monthly: 99.99,
    featured: true,
    inherits: { en: "Everything in Starter, plus:", es: "Todo lo de Inicial, y además:" },
    features: [
      { en: "Up to 5 pages (home, services, about, gallery, contact)", es: "Hasta 5 páginas (inicio, servicios, nosotros, galería, contacto)" },
      { en: "Enquiry form that lands in your inbox", es: "Formulario de contacto que llega a su correo" },
      { en: "Link to the booking tool you already use", es: "Enlace a la herramienta de citas que ya usa" },
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
      en: "Your site in English and Spanish, plus the phone tools as they launch.",
      es: "Su sitio en inglés y español, más las herramientas del teléfono al lanzarse.",
    },
    price: 999,
    installments: 3,
    regular: 1200,
    regularFrom: true,
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

/**
 * The promises shown above the packages, side by side. Each applies to EVERY package, so only
 * keep one while you can honor it for every client. Remove an entry to drop it; an empty list
 * hides the banner. `icon` picks the glyph in PricingSection.
 * The 7-day promise says "ready to review" (not "live") on purpose: going live also waits on
 * the client's approval.
 */
export type Promise = {
  icon: "shield" | "clock" | "map";
  title: { en: string; es: string };
  detail: { en: string; es: string };
};

export const PROMISES: Promise[] = [
  {
    icon: "shield",
    title: { en: "Love it or don't pay", es: "Si no le encanta, no paga" },
    detail: {
      en: "See your finished site before you pay a cent. Don't love it? Walk away and owe nothing.",
      es: "Vea su sitio terminado antes de pagar un centavo. ¿No le encanta? Se va sin deber nada.",
    },
  },
  {
    icon: "clock",
    title: { en: "Ready in 7 days", es: "Listo en 7 días" },
    detail: {
      en: "Ready to review within 7 days of our intro call, or your first month of care ($99.99) is free.",
      es: "Listo para revisar a más tardar 7 días después de nuestra llamada, o su primer mes de mantenimiento ($99.99) es gratis.",
    },
  },
  {
    icon: "map",
    title: { en: "Free Google profile makeover", es: "Perfil de Google renovado, gratis" },
    detail: {
      en: "With every package we set up or polish your Google Business Profile so you stand out in Maps.",
      es: "Con cada paquete creamos o mejoramos su Perfil de Google Business para que destaque en Maps.",
    },
  },
];
