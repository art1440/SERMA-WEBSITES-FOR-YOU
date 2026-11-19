import type { L10n } from "@/i18n/types";

/**
 * "Our promise" band at the end of the How It Works tab.
 * Only promises the site already makes elsewhere (pricing tiers, process copy, privacy badge).
 * No testimonials, numbers or guarantees beyond those.
 */
export type PromiseIcon = "draft" | "price" | "copy" | "domain";

export type PromiseItem = {
  icon: PromiseIcon;
  title: L10n;
  detail: L10n;
};

export const PROMISE_HEADING: L10n = {
  en: "Our promise",
  es: "Nuestra promesa",
};

export const PROMISE_ITEMS: PromiseItem[] = [
  {
    icon: "draft",
    title: { en: "See it before you pay", es: "Véalo antes de pagar" },
    detail: {
      en: "You see the finished draft before you pay anything.",
      es: "Usted ve el borrador terminado antes de pagar nada.",
    },
  },
  {
    icon: "price",
    title: { en: "Clear, fixed pricing", es: "Precios claros y fijos" },
    detail: {
      en: "A fixed build price plus one flat monthly fee. No hourly billing, no surprises.",
      es: "Un precio fijo por el sitio más una cuota mensual fija. Sin cobro por hora, sin sorpresas.",
    },
  },
  {
    icon: "copy",
    title: { en: "Your words, approved by you", es: "Textos aprobados por usted" },
    detail: {
      en: "We write the copy for you, and you approve it, with a round of revisions included.",
      es: "Nosotros escribimos los textos y usted los aprueba, con una ronda de cambios incluida.",
    },
  },
  {
    icon: "domain",
    title: { en: "Live on your own domain", es: "En su propio dominio" },
    detail: {
      en: "Your site goes live on your domain, with no cookies and no trackers.",
      es: "Su sitio se publica en su dominio, sin cookies y sin rastreadores.",
    },
  },
];

export const PROMISE_CLOSING: L10n = {
  en: "See it finished. Approve it. Then you pay.",
  es: "Véalo terminado. Apruébelo. Y entonces pague.",
};
