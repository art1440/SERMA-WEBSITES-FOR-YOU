import type { NicheId } from "@/data/niches";
import type { L10n, Locale } from "@/i18n/types";

/**
 * Shared types for the fictional demo websites at /work/<niche>/ and the
 * gallery cards that link to them. Every business here is fictional.
 */

export type DemoId = NicheId;

export type DemoImage = { src: string; small: string; alt: L10n; width: number; height: number };

export type DemoCard = {
  id: DemoId;
  business: string;
  pitchDomain: string;
  tag: L10n;
  href: `/work/${DemoId}/`;
  /**
   * /media/work/<id>/shot-<locale>-v1(.jpg|-640.jpg). `width`/`height` are the full
   * (1280 w) file's pixels; `small` is the same shot at 640 w (same aspect ratio).
   */
  shots: Record<Locale, { full: string; small: string; width: number; height: number }>;
  /** Hex colour used for the card's hover glow. */
  accent: string;
};

export type DemoContent = {
  id: DemoId;
  business: string;
  phone: string;
  address: string;
  hours: { days: L10n; time: L10n }[];
  reviews: { quote: L10n; name: string }[];
};
