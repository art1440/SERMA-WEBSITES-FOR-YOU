/**
 * Shared validation for the demo-request form.
 * Runs in the browser (instant feedback) AND on the server (the real gate —
 * client-side checks can always be bypassed).
 */

export const INDUSTRY_VALUES = [
  "barbershop",
  "salon",
  "beauty",
  "restaurant",
  "contractor",
  "service",
  "other",
] as const;
export type IndustryValue = (typeof INDUSTRY_VALUES)[number];

export type DemoRequestInput = {
  name: string;
  business: string;
  industry: string;
  email: string;
  phone: string;
  language: string;
  message: string;
  smsConsent: boolean;
  policyConsent: boolean;
  /** Honeypot — real people never see or fill this field. */
  website: string;
  /** ms the visitor spent on the form, measured client-side (avoids clock-skew issues). */
  elapsedMs: number;
};

export type DemoRequestClean = {
  name: string;
  business: string;
  industry: IndustryValue;
  email: string;
  /** E.164 (+1XXXXXXXXXX) or empty. */
  phone: string;
  language: "en" | "es";
  message: string;
  smsConsent: boolean;
  policyConsent: true;
};

export type FieldErrorCode =
  | "required"
  | "name"
  | "business"
  | "industry"
  | "email"
  | "phone"
  | "smsConsent"
  | "policy"
  | "unsafe"
  | "tooLong";

export type FieldErrors = Partial<Record<keyof DemoRequestClean, FieldErrorCode>>;

const LIMITS = { name: 80, business: 120, email: 254, message: 1000 } as const;

/** Characters with no place in a name/business/message — blocks markup & template injection attempts. */
const UNSAFE = /[<>{}[\]`\\]|javascript:|data:text\/html/i;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const NAME = /^[\p{L}\p{M}'’.\- ]{2,}$/u;
const EMAIL = /^[A-Za-z0-9.!#$%&'*+/=?^_|~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

/** Trims, strips control characters, collapses whitespace. */
export function clean(value: unknown, multiline = false): string {
  if (typeof value !== "string") return "";
  const stripped = value.replace(CONTROL, "");
  return multiline
    ? stripped.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()
    : stripped.replace(/\s+/g, " ").trim();
}

/** Returns a U.S. number as E.164 (+1XXXXXXXXXX), or null if invalid. */
export function normalizeUsPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return null;
  // NANP: area code and exchange cannot start with 0 or 1.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(ten)) return null;
  return `+1${ten}`;
}

export function validateDemoRequest(
  input: Partial<DemoRequestInput>,
): { ok: true; data: DemoRequestClean } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const name = clean(input.name);
  const business = clean(input.business);
  const industry = clean(input.industry);
  const email = clean(input.email).toLowerCase();
  const phoneRaw = clean(input.phone);
  const language = input.language === "es" ? "es" : "en";
  const message = clean(input.message, true);
  const smsConsent = input.smsConsent === true;
  const policyConsent = input.policyConsent === true;

  if (!name) errors.name = "required";
  else if (name.length > LIMITS.name) errors.name = "tooLong";
  else if (UNSAFE.test(name)) errors.name = "unsafe";
  else if (!NAME.test(name)) errors.name = "name";

  if (!business) errors.business = "required";
  else if (business.length > LIMITS.business) errors.business = "tooLong";
  else if (UNSAFE.test(business)) errors.business = "unsafe";
  else if (business.length < 2) errors.business = "business";

  if (!industry) errors.industry = "required";
  else if (!(INDUSTRY_VALUES as readonly string[]).includes(industry)) errors.industry = "industry";

  if (!email) errors.email = "required";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "email";

  let phone = "";
  if (phoneRaw) {
    const normalized = normalizeUsPhone(phoneRaw);
    if (!normalized) errors.phone = "phone";
    else phone = normalized;
    // TCPA / A2P 10DLC: never collect a number for texting without explicit, unchecked-by-default consent.
    if (!smsConsent) errors.smsConsent = "smsConsent";
  }

  if (message.length > LIMITS.message) errors.message = "tooLong";
  else if (UNSAFE.test(message)) errors.message = "unsafe";

  if (!policyConsent) errors.policyConsent = "policy";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      business,
      industry: industry as IndustryValue,
      email,
      phone,
      language,
      message,
      // Consent is only meaningful (and only stored as true) when a number was actually given.
      smsConsent: phone ? smsConsent : false,
      policyConsent: true,
    },
  };
}

/** Basic bot heuristics: honeypot filled, or submitted faster than a human could type. */
export function looksLikeBot(input: Partial<DemoRequestInput>): boolean {
  if (typeof input.website === "string" && input.website.trim() !== "") return true;
  if (typeof input.elapsedMs !== "number" || !Number.isFinite(input.elapsedMs)) return true;
  return input.elapsedMs < 2500;
}
