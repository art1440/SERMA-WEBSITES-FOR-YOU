/**
 * Business details used across the site and legal pages.
 */
export const siteConfig = {
  name: "SermaWebDesign",
  /** Registered legal name of the business (e.g. "SermaWebDesign LLC"). */
  legalEntity: "SermaWebDesign",
  /**
   * Where "Book a Live System Demo" sends people (mailto:) and the privacy/legal contact.
   */
  contactEmail: "serma.support@gmail.com",
  /** Optional "Call us" button. Leave null to hide it. Example: { display: "(312) 555-0100", e164: "+13125550100" } */
  contactPhone: { display: "(512) 774-0374", e164: "+15127740374" } as { display: string; e164: string } | null,
  /** State whose law governs the Terms of Service. */
  governingLaw: {
    en: "the State of Texas, United States",
    es: "el Estado de Texas, Estados Unidos",
  },
  /** Bump this whenever the legal pages change. */
  legalLastUpdated: "2026-11-11",
} as const;
