import type { L10n } from "@/i18n/types";

/**
 * Pricing tab FAQ. Every answer restates only what the site already says
 * (pricing.ts, promise.ts and the dictionary). No timelines, guarantees,
 * contract terms, refunds or cancellation policies: if the site does not
 * state a fact, the question does not belong here.
 */
export type FaqItem = {
  id: string;
  q: L10n;
  a: L10n;
};

export const FAQ_HEADING: L10n = {
  en: "Questions before you buy",
  es: "Preguntas antes de comprar",
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "price-covers",
    q: {
      en: "What does the one-time price cover, and what is the $99.99 a month?",
      es: "¿Qué cubre el pago único y qué es la cuota de $99.99 al mes?",
    },
    a: {
      en: "The one-time price is the fixed price to build your site, with everything listed in your package. After that, it is $99.99 a month for hosting and care. There is no hourly billing and no surprises.",
      es: "El pago único es el precio fijo por construir su sitio, con todo lo que aparece en su paquete. Después son $99.99 al mes de alojamiento y mantenimiento. No hay cobro por hora ni sorpresas.",
    },
  },
  {
    id: "launch-price",
    q: {
      en: "Why are two prices shown?",
      es: "¿Por qué aparecen dos precios?",
    },
    a: {
      en: "The crossed-out number is our regular price. The first 10 clients on each package get the lower launch price; once a package’s spots are taken, it goes to the regular price. The $99.99 a month is the same either way.",
      es: "El número tachado es nuestro precio regular. Los primeros 10 clientes de cada paquete reciben el precio de lanzamiento, más bajo; cuando se ocupan los lugares de un paquete, ese paquete pasa al precio regular. La cuota de $99.99 al mes es igual en ambos casos.",
    },
  },
  {
    id: "see-first",
    q: {
      en: "Can I see my site before I pay?",
      es: "¿Puedo ver mi sitio antes de pagar?",
    },
    a: {
      en: "Yes. You see the finished draft before you pay anything. We send you a link, you point out anything that reads or looks wrong, and we fix it.",
      es: "Sí. Usted ve el borrador terminado antes de pagar nada. Le mandamos un enlace, usted señala lo que se lee o se ve mal, y nosotros lo corregimos.",
    },
  },
  {
    id: "revisions",
    q: {
      en: "How do revisions work?",
      es: "¿Cómo funcionan los cambios?",
    },
    a: {
      en: "Starter includes 1 round of revisions. Business includes 2 rounds. Growth includes unlimited revisions before launch.",
      es: "El paquete Inicial incluye 1 ronda de cambios. Negocio incluye 2 rondas. Crecimiento incluye cambios ilimitados antes del lanzamiento.",
    },
  },
  {
    id: "ownership",
    q: {
      en: "Do I own my domain and my photos?",
      es: "¿El dominio y mis fotos son míos?",
    },
    a: {
      en: "Yes. Your site goes live on your own domain, and the domain and your photos stay in your name.",
      es: "Sí. Su sitio se publica en su propio dominio, y el dominio y sus fotos quedan a su nombre.",
    },
  },
  {
    id: "languages",
    q: {
      en: "Will my site be in English and Spanish?",
      es: "¿Mi sitio estará en inglés y en español?",
    },
    a: {
      en: "The Growth package includes a bilingual site, in English and Spanish.",
      es: "El paquete Crecimiento incluye un sitio bilingüe, en inglés y en español.",
    },
  },
  {
    id: "when-it-launches",
    q: {
      en: "What does “When it launches” mean on some features?",
      es: "¿Qué significa “Cuando se lance” en algunas funciones?",
    },
    a: {
      en: "Those features are the phone side, and we are still building them: missed calls answered by text, online booking with deposits, and an automatic reminder the day before. Websites come first. Ask us where it stands and we will tell you straight.",
      es: "Esas funciones son el lado del teléfono y todavía las estamos construyendo: llamadas perdidas contestadas por mensaje de texto, citas en línea con anticipo y un recordatorio automático un día antes. Los sitios web van primero. Pregúntenos cómo vamos y le diremos la verdad.",
    },
  },
  {
    id: "privacy",
    q: {
      en: "Do you use cookies or trackers?",
      es: "¿Usan cookies o rastreadores?",
    },
    a: {
      en: "No. No cookies, no trackers and no data resale. The details you send us are used to reply to you, nothing else.",
      es: "No. Sin cookies, sin rastreadores y sin venta de datos. Los datos que nos envía se usan para contestarle, nada más.",
    },
  },
];
