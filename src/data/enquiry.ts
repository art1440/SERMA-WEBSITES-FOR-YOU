import type { L10n } from "@/i18n/types";

/**
 * Extra bilingual labels for the enquiry form (package + industry pickers,
 * kind validation messages, the in-place success state and the error state).
 * Field names here must match public/__forms.html.
 */
export const ENQUIRY: Record<
  | "fieldPackage"
  | "fieldIndustry"
  | "notSure"
  | "optional"
  | "errName"
  | "errBusiness"
  | "errPhone"
  | "errNeed"
  | "errConsent"
  | "fixBelow"
  | "doneTitle"
  | "doneBody"
  | "errorTitle"
  | "errorKept"
  | "errorMail",
  L10n
> = {
  fieldPackage: { en: "Package", es: "Paquete" },
  fieldIndustry: { en: "Your industry", es: "Su tipo de negocio" },
  notSure: { en: "Not sure yet", es: "Aún no lo sé" },
  optional: { en: "optional", es: "opcional" },
  errName: { en: "Please tell us your name so we know who to ask for.", es: "Díganos su nombre para saber con quién hablar." },
  errBusiness: { en: "What is your business called?", es: "¿Cómo se llama su negocio?" },
  errPhone: {
    en: "That number looks short. Please add the area code, e.g. (512) 555-0134.",
    es: "Ese número parece incompleto. Agregue el código de área, p. ej. (512) 555-0134.",
  },
  errNeed: { en: "A line or two about what you need is plenty.", es: "Con una o dos líneas sobre lo que necesita basta." },
  errConsent: { en: "Please tick this box so we can contact you.", es: "Marque esta casilla para que podamos contactarlo." },
  fixBelow: { en: "Almost there. Please check the highlighted box.", es: "Ya casi. Revise el campo marcado." },
  doneTitle: { en: "Thanks, we have it.", es: "Gracias, ya lo tenemos." },
  doneBody: {
    en: "We will text or call you within one business day.",
    es: "Le enviaremos un mensaje o le llamaremos dentro de un día hábil.",
  },
  errorTitle: { en: "That did not go through.", es: "No se pudo enviar." },
  errorKept: {
    en: "Nothing you typed was lost. Press the button to try again, or email us at",
    es: "No se perdió nada de lo que escribió. Presione el botón para intentar de nuevo, o escríbanos a",
  },
  errorMail: { en: "Email us instead", es: "Escríbanos por correo" },
};

/** US phone: any common format, with optional +1. 10 digits (11 with a leading 1). */
export function phoneValid(v: string): boolean {
  if (!/^[0-9+().\-\s]+$/.test(v)) return false;
  const digits = v.replace(/\D/g, "");
  if (digits.length === 10) return true;
  return digits.length === 11 && digits.startsWith("1");
}
