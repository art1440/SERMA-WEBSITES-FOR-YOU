/**
 * Lead form rules, shared by the browser and (in Phase 5) the server function,
 * so both always agree on what counts as valid.
 */
import { businessTypes } from '../config/site';

export const leadFields = ['businessName', 'businessType', 'phone', 'email', 'link', 'language'] as const;
export type LeadField = (typeof leadFields)[number];

export interface LeadInput {
  businessName: string;
  businessType: string;
  phone: string;
  email: string;
  link: string;
  language: string;
}

export interface CleanLead {
  businessName: string;
  businessType: string;
  /** Digits only, US 10-digit. */
  phone: string;
  email: string;
  link: string | null;
  language: 'en' | 'es';
}

export type LeadResult =
  | { ok: true; lead: CleanLead }
  | { ok: false; errors: Partial<Record<LeadField, true>> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE = /^@[A-Za-z0-9._]{1,30}$/;

function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits.length === 10 ? digits : null;
}

function normalizeLink(raw: string): string | null | false {
  const value = raw.trim();
  if (!value) return null;
  if (HANDLE.test(value)) return value;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!url.hostname.includes('.')) return false;
    return url.toString();
  } catch {
    return false;
  }
}

export function validateLead(input: Partial<LeadInput>): LeadResult {
  const errors: Partial<Record<LeadField, true>> = {};
  const businessName = (input.businessName ?? '').trim().replace(/\s+/g, ' ');
  const businessType = (input.businessType ?? '').trim();
  const email = (input.email ?? '').trim().toLowerCase();
  const phone = normalizePhone(input.phone ?? '');
  const link = normalizeLink(input.link ?? '');
  const language = input.language === 'es' ? 'es' : input.language === 'en' ? 'en' : null;

  if (businessName.length < 2 || businessName.length > 120) errors.businessName = true;
  if (!(businessTypes as readonly string[]).includes(businessType)) errors.businessType = true;
  if (!phone) errors.phone = true;
  if (!EMAIL.test(email) || email.length > 254) errors.email = true;
  if (link === false || (typeof link === 'string' && link.length > 500)) errors.link = true;
  if (!language) errors.language = true;

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    lead: { businessName, businessType, phone: phone!, email, link: link || null, language: language! },
  };
}
