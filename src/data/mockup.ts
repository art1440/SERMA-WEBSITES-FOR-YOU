import type { L10n } from "@/i18n/types";

/**
 * Copy for the "Get your free preview" pop-up. Only promises the site already
 * makes elsewhere: see it before you pay, fixed price, no card, a reply within
 * one business day, a 15-minute call.
 */
export const MOCKUP = {
  // Left panel: why, and how easy it is.
  headlineBefore: { en: "Get a", es: "Reciba una" },
  headlineMark: { en: "free preview", es: "vista previa gratis" },
  headlineAfter: { en: "of your new website.", es: "de su nuevo sitio web." },
  pitch: {
    en: "Most customers look you up before they call. If they can’t find you, they call someone they can.",
    es: "La mayoría de los clientes lo buscan antes de llamar. Si no lo encuentran, le llaman a otro.",
  },
  stepsLabel: { en: "Three easy steps", es: "Tres pasos sencillos" },
  steps: [
    {
      title: { en: "Tell us about your business", es: "Cuéntenos de su negocio" },
      detail: { en: "One minute, right here.", es: "Un minuto, aquí mismo." },
    },
    {
      title: { en: "We design your homepage", es: "Diseñamos su página de inicio" },
      detail: { en: "Free. No card, no contract.", es: "Gratis. Sin tarjeta, sin contrato." },
    },
    {
      title: { en: "Love it? We build the rest", es: "¿Le gusta? Hacemos el resto" },
      detail: { en: "Not for you? You owe nothing.", es: "¿No es para usted? No debe nada." },
    },
  ] as { title: L10n; detail: L10n }[],

  // Right panel: the form.
  chip: { en: "Free homepage preview · No card needed", es: "Vista previa gratis · Sin tarjeta" },
  title: { en: "Let’s get your website started", es: "Empecemos su sitio web" },
  subBefore: { en: "Leave your details and we’ll", es: "Deje sus datos y" },
  subStrong: { en: "call or text you within one business day", es: "le llamamos o escribimos en un día hábil" },
  subAfter: { en: "to set up a quick 15-minute chat.", es: "para una charla rápida de 15 minutos." },
  fieldName: { en: "Your name", es: "Su nombre" },
  fieldBusiness: { en: "Business name", es: "Nombre del negocio" },
  fieldPhone: { en: "Phone number", es: "Teléfono" },
  phName: { en: "Maria Lopez", es: "María López" },
  phBusiness: { en: "Lopez Barbershop", es: "Barbería López" },
  submit: { en: "Get my free preview", es: "Quiero mi vista previa gratis" },
  sending: { en: "Sending…", es: "Enviando…" },
  trust: [
    { en: "No spam, ever", es: "Nada de spam" },
    { en: "Reply within 1 business day", es: "Respuesta en 1 día hábil" },
    { en: "100% free", es: "100% gratis" },
  ] as L10n[],
  close: { en: "Close", es: "Cerrar" },

  // After sending.
  /** `{name}` becomes ", Maria" (or nothing). */
  doneTitle: { en: "You’re in{name}!", es: "¡Listo{name}!" },
  doneBody: {
    en: "We’ll call or text you within one business day to set up your free 15-minute call. Nothing to pay, nothing to prepare.",
    es: "Le llamaremos o escribiremos en un día hábil para agendar su llamada gratis de 15 minutos. Nada que pagar, nada que preparar.",
  },
  doneBack: { en: "Back to the site", es: "Volver al sitio" },

  /** Written into the enquiry's "What do you need?" so the inbox shows where it came from. */
  needNote: "Free homepage preview request (website pop-up)",
  /** Earlier wordings of needNote, so leads sent before a rename still show as pop-up leads in the CRM. */
  legacyNeedNotes: ["Free homepage mockup request (website pop-up)"] as string[],
};
