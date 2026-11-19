import type { L10n } from "@/i18n/types";

/**
 * Sample data for the dashboard's inner sections (Leads, Calendar, Inbox,
 * Reviews). Every name, number, phone and email here is FICTIONAL demo data
 * shown inside a labelled simulation ("Sample data" tag + the FTC disclaimer
 * under the dashboard). Rules for authors:
 *  - Names: first name + last initial only (e.g. "Marcus R."), clearly fictional.
 *  - Phones: the reserved fictional range only: (xxx) 555-01xx.
 *  - Emails: only @example.com / @example.net / @example.org (reserved domains).
 *  - Money in whole USD. Times as shown to the owner ("Today, 9:12 AM").
 *  - Spanish: formal "usted", natural US Spanish, same meaning as the English.
 */

export type LeadStatus = "new" | "contacted" | "booked" | "lost";
export type LeadSource = "missedCall" | "website" | "google" | "instagram" | "referral";

export type Lead = {
  id: string;
  name: string;
  /** Fictional, (xxx) 555-01xx only. */
  phone: string;
  service: L10n;
  /** Estimated value in USD. */
  value: number;
  source: LeadSource;
  status: LeadStatus;
  /** When it came in, e.g. "Today, 9:12 AM" / "Hoy, 9:12 AM". */
  received: L10n;
  /** One-line context the owner would see, e.g. "Asked about Saturday availability". */
  note: L10n;
};

export type CalendarEventStatus = "confirmed" | "deposit" | "pending";

export type CalendarEvent = {
  id: string;
  /** 0 = Monday … 5 = Saturday (the demo week). */
  day: 0 | 1 | 2 | 3 | 4 | 5;
  /** 24h "HH:MM", between 08:00 and 19:00. */
  start: string;
  durationMin: number;
  client: string;
  service: L10n;
  /** Who/what it is booked on: a chair, stylist, table, crew, technician. */
  resource: L10n;
  status: CalendarEventStatus;
  value: number;
};

export type InboxKind = "booking" | "payment" | "textback" | "review" | "lead" | "system";

/**
 * What a button inside an email does in the demo (nothing is ever sent):
 *  - confirm:       marks the booking confirmed
 *  - openCalendar:  jumps to the Calendar section and highlights `calendarEventId`
 *  - openReviews:   jumps to the Reviews section
 *  - openLeads:     jumps to the Leads section
 *  - quickReply:    reveals the prewritten `quickReplies`; picking one "sends" it into the thread
 *  - receipt:       reveals the receipt details already listed in `details`
 *  - acknowledge:   marks the notification handled
 */
export type EmailAction = "confirm" | "openCalendar" | "openReviews" | "openLeads" | "quickReply" | "receipt" | "acknowledge";

export type EmailButton = {
  label: L10n;
  action: EmailAction;
  /** Label once done, e.g. "Booking confirmed" / "Cita confirmada". */
  done: L10n;
};

export type InboxMessage = {
  id: string;
  kind: InboxKind;
  /** Display name, e.g. "SermaWebDesign Alerts" or a client's name. */
  from: string;
  /** Reserved example domains only. */
  fromEmail: string;
  subject: L10n;
  /** First line shown in the message list. */
  preview: L10n;
  received: L10n;
  unread: boolean;
  email: {
    greeting: L10n;
    paragraphs: L10n[];
    /** Key facts rendered as a small table (service, time, deposit…). */
    details?: { label: L10n; value: L10n }[];
    primary: EmailButton;
    secondary?: EmailButton;
    /** Prewritten replies for `quickReply` (2–3). No free-text input anywhere. */
    quickReplies?: L10n[];
    /** For openCalendar: the CalendarEvent id to highlight. */
    calendarEventId?: string;
    signoff: L10n;
  };
};

export type ReviewPlatform = "google" | "yelp" | "facebook";

export type Review = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  platform: ReviewPlatform;
  when: L10n;
  text: L10n;
  /** The reply the system drafts for the owner (warm, specific, short). */
  suggestedReply: L10n;
  replied: boolean;
};

export type NicheViews = {
  leads: Lead[];
  calendar: {
    /** The bookable resources shown as a legend, e.g. ["Chair 1", "Chair 2", "Chair 3"]. */
    resources: L10n[];
    events: CalendarEvent[];
  };
  inbox: InboxMessage[];
  reviews: {
    average: number;
    total: number;
    /** Counts for 5★, 4★, 3★, 2★, 1★. */
    distribution: [number, number, number, number, number];
    items: Review[];
  };
};
