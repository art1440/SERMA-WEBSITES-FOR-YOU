import type { L10n } from "@/i18n/types";

/**
 * Pricing FAQ. The first three answer the doubts that stop an owner from
 * reaching out (do I need a site, is it hard, what if I don't like it).
 * Every answer restates only what the site already says (pricing.ts and the
 * dictionary). No timelines, guarantees, contract terms, refunds or
 * cancellation policies: if the site does not state a fact, it is not here.
 */
export type FaqItem = {
  id: string;
  q: L10n;
  a: L10n;
};

export const FAQ_HEADING: L10n = {
  en: "Questions? Here are straight answers.",
  es: "¿Preguntas? Aquí van respuestas claras.",
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "need-a-site",
    q: {
      en: "I already have Instagram or Facebook. Do I really need a website?",
      es: "Ya tengo Instagram o Facebook. ¿De verdad necesito un sitio web?",
    },
    a: {
      en: "Social pages are great for showing your work, but you don’t own them and customers can’t easily find your hours, prices or a way to book. A website is yours: it shows up when people search for you, puts your number one tap away, and doesn’t change when an app changes its rules.",
      es: "Las redes son buenas para mostrar su trabajo, pero no son suyas y ahí al cliente le cuesta encontrar su horario, sus precios o cómo agendar. Un sitio web es suyo: aparece cuando lo buscan, deja su número a un toque y no cambia cuando una aplicación cambia sus reglas.",
    },
  },
  {
    id: "not-techy",
    q: {
      en: "I’m not good with tech. Is that a problem?",
      es: "No soy bueno con la tecnología. ¿Es un problema?",
    },
    a: {
      en: "Not at all. Your part is a 15-minute call and a few photos from your phone. We write, design and set up everything, and you approve it before you pay.",
      es: "Para nada. Su parte es una llamada de 15 minutos y unas fotos de su teléfono. Nosotros escribimos, diseñamos y dejamos todo listo, y usted lo aprueba antes de pagar.",
    },
  },
  {
    id: "dont-like-it",
    q: {
      en: "What if I don’t like it?",
      es: "¿Y si no me gusta?",
    },
    a: {
      en: "Then you tell us what to change. You see the finished draft before you pay anything, so you never pay for a site you haven’t seen and approved.",
      es: "Entonces nos dice qué cambiar. Usted ve el borrador terminado antes de pagar nada, así que nunca paga por un sitio que no ha visto y aprobado.",
    },
  },
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
    id: "google-profile",
    q: {
      en: "What is the free Google profile makeover?",
      es: "¿Qué es la renovación gratis del perfil de Google?",
    },
    a: {
      en: "Your Google Business Profile is what people see in Google Maps and search. With every package we create it or clean it up for free: your best photos, correct hours, your services and categories, and a link to your new site, so you stand out next to the shop down the street.",
      es: "Su Perfil de Google Business es lo que la gente ve en Google Maps y en la búsqueda. Con cada paquete lo creamos o lo arreglamos gratis: sus mejores fotos, el horario correcto, sus servicios y categorías, y un enlace a su sitio nuevo, para que destaque frente al negocio de enfrente.",
    },
  },
  {
    id: "see-first",
    q: {
      en: "Can I see my site before I pay?",
      es: "¿Puedo ver mi sitio antes de pagar?",
    },
    a: {
      en: "Yes. You see the finished draft before you pay anything. We send you a link, you point out anything that reads or looks wrong, and we fix it. If you still don’t love it, you walk away and owe nothing.",
      es: "Sí. Usted ve el borrador terminado antes de pagar nada. Le mandamos un enlace, usted señala lo que se lee o se ve mal, y nosotros lo corregimos. Si aun así no le encanta, se va sin deber nada.",
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
