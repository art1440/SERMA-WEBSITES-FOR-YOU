/**
 * Business details used across the site and legal pages.
 * TODO before launch: replace every placeholder below with your real details.
 */
export const siteConfig = {
  name: "SermaWebDesign",
  /** Registered legal name of the business (e.g. "SermaWebDesign LLC"). */
  legalEntity: "SermaWebDesign LLC",
  /** Public contact inbox for privacy / legal requests. example.com is a reserved placeholder domain. */
  contactEmail: "contact@example.com",
  /** State whose law governs the Terms of Service. */
  governingLaw: {
    en: "the State of [Your State], United States",
    es: "el Estado de [Su Estado], Estados Unidos",
  },
  /** Bump this whenever the legal pages or the SMS consent wording change. */
  legalLastUpdated: "2026-11-05",
  /** Version tag stored with every SMS consent record (proof of consent). */
  consentVersion: "2026-11-05.v1",
} as const;
