/**
 * Business details used across the site and legal pages.
 * TODO before launch: replace every placeholder below with your real details.
 */
export const siteConfig = {
  name: "SermaWebDesign",
  /** Registered legal name of the business (e.g. "SermaWebDesign LLC"). */
  legalEntity: "SermaWebDesign LLC",
  /**
   * Where "Book a Live System Demo" sends people (mailto:) and the privacy/legal contact.
   * example.com is a reserved placeholder domain — REPLACE before launch.
   */
  contactEmail: "contact@example.com",
  /** Optional "Call us" button. Leave null to hide it. Example: { display: "(312) 555-0100", e164: "+13125550100" } */
  contactPhone: null as { display: string; e164: string } | null,
  /** State whose law governs the Terms of Service. */
  governingLaw: {
    en: "the State of [Your State], United States",
    es: "el Estado de [Su Estado], Estados Unidos",
  },
  /** Bump this whenever the legal pages change. */
  legalLastUpdated: "2026-11-05",
} as const;
