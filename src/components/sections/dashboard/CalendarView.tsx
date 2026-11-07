"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  BellRing,
  CalendarCheck,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Globe,
  Mail,
  MessageSquareText,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { NICHE_VIEWS, type CalendarEvent, type CalendarEventStatus, type NicheViews } from "@/data/dashboard-views";
import type { NicheId } from "@/data/niches";
import { fill, type L10n, type Locale } from "@/i18n/types";
import { formatCurrency } from "@/lib/format";
import { EASE_EDITORIAL } from "@/lib/motion";
import { useDashboardView } from "./DashboardViewContext";
import {
  ACTION_SECONDARY,
  Avatar,
  CARD_FLUSH,
  DoneButton,
  LABEL,
  PILL,
  PILL_OFF,
  ROW,
  ROW_SELECTED,
  StatusChip,
  ViewHeader,
  formatClock,
  normalizeMeridiem,
  revealInPage,
} from "./ui";

/* ------------------------------------------------------------------ *
 * Calendar: the demo week (Mon–Sat) for the selected industry.
 *
 * xl+ (1280px): a week grid (hour axis 8 AM–7 PM, one column per day,
 *      events positioned by start and duration) plus a 300px side card:
 *      the week at a glance, or the open booking's details.
 * <xl: an agenda grouped by day; a booking opens its details right
 *      below it (Back / Escape returns to the item). On lg (fixed-height
 *      plate) the agenda list scrolls inside the plate.
 *
 * Status is DERIVED: data + the shared `confirm:<id>` flag, so a booking
 * confirmed from an Inbox email also reads "Confirmed" here (and back).
 * "Today" is Monday (day 0) and "now" is a fixed demo clock.
 * The data is a sample of the week (the Overview counts every booking),
 * so the counts and values here say "shown".
 * Nothing is sent: every action only flips local/context demo state.
 * ------------------------------------------------------------------ */

const COPY = {
  title: { en: "Calendar", es: "Calendario" },
  week: { en: "This week", es: "Esta semana" },
  subtitle: { en: "{week} · {range} · {count}, worth {value}", es: "{week} · {range} · {count}, con valor de {value}" },
  legend: { en: "Color key", es: "Leyenda de colores" },
  today: { en: "Today", es: "Hoy" },
  currentTime: { en: "Current time: {time}", es: "Hora actual: {time}" },
  // {book}: "agendar" (appointments) / "reservar" (restaurant tables), see BOOK_VERB.
  openSlot: { en: "Open — online booking available", es: "Libre — se puede {book} en línea" },
  // Details
  detailTitle: { en: "{Noun} details", es: "Detalles de la {noun}" },
  close: { en: "Close", es: "Cerrar" },
  closeDetails: { en: "Close details", es: "Cerrar detalles" },
  back: { en: "Back to agenda", es: "Volver a la agenda" },
  with: { en: "With", es: "Con" },
  area: { en: "Area", es: "Área" },
  value: { en: "Value", es: "Valor" },
  happeningNow: { en: "Happening now", es: "En curso" },
  confirm: { en: "Confirm", es: "Confirmar" },
  confirmed: { en: "Confirmed", es: "Confirmada" },
  sendReminder: { en: "Send reminder", es: "Enviar recordatorio" },
  reminderSent: { en: "Reminder sent (demo)", es: "Recordatorio enviado (demo)" },
  reminderPreview: { en: "The text {first} gets", es: "El texto que recibe {first}" },
  reminderSentMeta: { en: "Sent just now · demo, nothing was sent", es: "Enviado ahora · demo, no se envió nada" },
  noReminder: {
    en: "This {noun} has already started, so there's no reminder to send.",
    es: "Esta {noun} ya comenzó, así que no hay recordatorio que enviar.",
  },
  related: { en: "Related", es: "Relacionado" },
  openLead: { en: "Open lead", es: "Abrir prospecto" },
  openEmail: { en: "Open email", es: "Abrir correo" },
  demoNote: { en: "Demo: nothing is actually sent.", es: "Demo: en realidad no se envía nada." },
  confirmAnnounce: { en: "{name}'s {noun} is confirmed. Demo only.", es: "La {noun} de {name} quedó confirmada. Es una demo." },
  reminderAnnounce: {
    en: "Reminder sent to {name}. Demo only, nothing was sent.",
    es: "Recordatorio enviado a {name}. Es una demo: no se envió nada.",
  },
  leadAnnounce: { en: "Opening {name} in Leads.", es: "Abriendo a {name} en Prospectos." },
  emailAnnounce: { en: "Opening the email in your Inbox.", es: "Abriendo el correo en su bandeja de entrada." },
  // Week at a glance
  summaryTitle: { en: "This week", es: "Esta semana" },
  asOf: { en: "Updated {time}", es: "Actualizado {time}" },
  statValue: { en: "Value shown", es: "Valor mostrado" },
  statDeposits: { en: "Deposits held", es: "Depósitos retenidos" },
  statToConfirm: { en: "To confirm", es: "Por confirmar" },
  waiting: { en: "Waiting on you", es: "Pendientes de usted" },
  allConfirmed: { en: "Everything this week is confirmed.", es: "Todo lo de esta semana está confirmado." },
  key: { en: "Status key", es: "Leyenda de estados" },
  onlineNote: {
    en: "Open times are bookable online 24/7, and every client gets an automatic reminder.",
    es: "Los horarios libres se pueden {book} en línea 24/7 y cada cliente recibe un recordatorio automático.",
  },
  pickHint: { en: "Pick a {noun} in the grid to see the details.", es: "Elija una {noun} en la cuadrícula para ver los detalles." },
} satisfies Record<string, L10n>;

/** What a booking is called in each industry (Spanish nouns are all feminine: "la cita", "la reservación", as in the Inbox). */
const NOUN = {
  default: { one: { en: "booking", es: "cita" }, many: { en: "bookings", es: "citas" } },
  restaurant: { one: { en: "reservation", es: "reservación" }, many: { en: "reservations", es: "reservaciones" } },
} satisfies Record<string, { one: L10n; many: L10n }>;
const nounFor = (id: NicheId) => (id === "restaurant" ? NOUN.restaurant : NOUN.default);
const countOf = (n: number, id: NicheId, locale: Locale) => `${n} ${(n === 1 ? nounFor(id).one : nounFor(id).many)[locale]}`;
/** "17 bookings shown" / "17 citas mostradas": the calendar holds a sample of the week, not every booking. */
const shownOf = (n: number, id: NicheId, locale: Locale) =>
  `${countOf(n, id, locale)} ${locale === "es" ? (n === 1 ? "mostrada" : "mostradas") : "shown"}`;
/** Spanish verb for booking online: "reservar" a table (restaurant), "agendar" an appointment (every other industry). */
const BOOK_VERB = (id: NicheId) => (id === "restaurant" ? "reservar" : "agendar");
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const STATUS_WORD: Record<CalendarEventStatus, L10n> = {
  confirmed: { en: "Confirmed", es: "Confirmada" },
  deposit: { en: "Deposit held", es: "Depósito retenido" },
  pending: { en: "Pending", es: "Pendiente" },
};
const STATUS_HINT: Record<CalendarEventStatus, L10n> = {
  confirmed: { en: "All set", es: "Todo listo" },
  deposit: { en: "Paid up front", es: "Pago adelantado" },
  pending: { en: "Needs your OK", es: "Necesita su aprobación" },
};
const STATUS_ICON: Record<CalendarEventStatus, LucideIcon> = { confirmed: Check, deposit: CircleDollarSign, pending: Clock3 };
const STATUS_ICON_TONE: Record<CalendarEventStatus, string> = { confirmed: "text-live", deposit: "text-aqua", pending: "text-signal" };

/**
 * The prewritten reminder ("Send reminder"). Three shapes so every industry reads naturally:
 * appointments "with" a person, restaurant reservations, and crew / technician visits.
 * `{who}` is " with Andre" / " con Andre" when the resource names a person, else empty;
 * `{where}` is " on the patio" / " en la terraza" for a dining area, else empty.
 */
const REMINDER: Record<"with" | "reservation" | "visit", L10n> = {
  with: {
    en: "Hi {first}, this is {business}. Reminder: “{service}”{who}, {when}. Reply C to confirm or R to reschedule.",
    es: "Hola, {first}, le escribe {business}. Le recordamos su cita: “{service}”{who}, {when}. Responda C para confirmar o R para cambiarla.",
  },
  reservation: {
    en: "Hi {first}, this is {business}. Reminder of your reservation: “{service}”{where}, {when}. Reply C to confirm or R if your plans change.",
    es: "Hola, {first}, le escribe {business}. Le recordamos su reservación: “{service}”{where}, {when}. Responda C para confirmar o R si cambian sus planes.",
  },
  visit: {
    en: "Hi {first}, this is {business}. Reminder: your “{service}”{who} is scheduled for {when}. Reply C to confirm or R to reschedule.",
    es: "Hola, {first}, le escribe {business}. Le recordamos su servicio agendado: “{service}”{who}, {when}. Responda C para confirmar o R para cambiar la fecha.",
  },
};
const WITH: L10n = { en: " with {name}", es: " con {name}" };
/** Restaurant areas as a guest would read them; anything else (e.g. "Catering") is left out of the text. */
const WHERE: Record<string, L10n> = {
  "Main room": { en: " in the main room", es: " en el salón principal" },
  Patio: { en: " on the patio", es: " en la terraza" },
  "Private room": { en: " in the private room", es: " en el salón privado" },
};
/** Resource words that are places, crews or service lines, never a person's name. */
const NOT_A_PERSON = /^(chair|silla|crew|cuadrilla|team|equipo|table|mesa|nails|uñas|lashes|pestañas|brows|cejas|estimates|presupuestos|patio|terraza|catering|bar)$/i;
/**
 * The person a resource stands for: "Chair 1 · Andre" → "Andre", "Vanessa · Lashes" → "Vanessa",
 * "Tech Mike (HVAC)" → "Mike". Crews, rooms and tables ("Crew A", "Patio") have none.
 */
function personOf(resource: string) {
  return resource
    .split(" · ")
    .map((part) => part.replace(/\s*\(.*\)$/, "").replace(/^(Tech|Técnic[oa])\s+/, "").trim())
    .find((part) => /^\p{Lu}\p{Ll}+$/u.test(part) && !NOT_A_PERSON.test(part));
}
const REMINDER_SHAPE: Record<NicheId, keyof typeof REMINDER> = {
  barbershop: "with",
  salon: "with",
  beauty: "with",
  restaurant: "reservation",
  contractor: "visit",
  service: "visit",
};

/* ------------------------------ time model ------------------------------ */

type Day = CalendarEvent["day"];
const DAYS: readonly Day[] = [0, 1, 2, 3, 4, 5];
/** The demo week's "today" (Monday: every industry's inbox and lead copy is written around it) and "now". */
const TODAY: Day = 0;
const NOW = "09:41";
const DAY_START = 8 * 60;
const DAY_END = 19 * 60;
const SPAN = DAY_END - DAY_START;
/** Hour lines / labels: 8 AM … 7 PM. */
const HOURS = Array.from({ length: SPAN / 60 + 1 }, (_, i) => 8 + i);
/** Blocks are never drawn shorter than this many minutes, so the overlap layout uses it too. */
const MIN_VISUAL_MIN = 30;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const endMin = (ev: CalendarEvent) => toMin(ev.start) + ev.durationMin;
const NOW_MIN = toMin(NOW);
const pct = (min: number) => ((Math.min(DAY_END, Math.max(DAY_START, min)) - DAY_START) / SPAN) * 100;
/** Day 0 = Monday 5 Jan 2026 (the same reference the other sections use). */
const dayDate = (day: number, min = 0) => new Date(2026, 0, 5 + day, Math.floor(min / 60), min % 60);

function weekday(day: number, intlLocale: string, style: "short" | "long") {
  return cap(new Intl.DateTimeFormat(intlLocale, { weekday: style }).format(dayDate(day)));
}
/* Every Intl time below goes through normalizeMeridiem: "AM"/"PM" in both languages, like the data. */
function timeRange(ev: CalendarEvent, intlLocale: string) {
  const s = toMin(ev.start);
  const f = new Intl.DateTimeFormat(intlLocale, { hour: "numeric", minute: "2-digit" });
  return normalizeMeridiem(f.formatRange(dayDate(ev.day, s), dayDate(ev.day, s + ev.durationMin)));
}
function hourLabel(h: number, intlLocale: string) {
  return normalizeMeridiem(new Intl.DateTimeFormat(intlLocale, { hour: "numeric" }).format(dayDate(0, h * 60)));
}
/** "9:41" without the day period, for the compact now capsule and narrow blocks on the grid. */
function shortClock(hhmm: string, intlLocale: string) {
  const parts = new Intl.DateTimeFormat(intlLocale, { hour: "numeric", minute: "2-digit" }).formatToParts(dayDate(0, toMin(hhmm)));
  return normalizeMeridiem(
    parts
      .filter((p) => p.type === "hour" || p.type === "minute" || (p.type === "literal" && p.value.trim() === ":"))
      .map((p) => p.value.trim())
      .join(""),
  );
}
function duration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}
/**
 * "today at 10:00 AM" / "hoy a las 10:00 AM", "tomorrow at …" / "mañana a las …", else
 * "Thursday at 10:30 AM" / "el jueves a las 10:30 AM" ("a la 1:00 PM").
 */
function whenPhrase(ev: CalendarEvent, locale: Locale, intlLocale: string) {
  const time = formatClock(ev.start, intlLocale);
  const offset = ev.day - TODAY;
  if (locale === "es") {
    const h = Math.floor(toMin(ev.start) / 60) % 12;
    const at = `a ${h === 1 ? "la" : "las"} ${time}`;
    if (offset === 0) return `hoy ${at}`;
    if (offset === 1) return `mañana ${at}`;
    return `el ${new Intl.DateTimeFormat(intlLocale, { weekday: "long" }).format(dayDate(ev.day))} ${at}`;
  }
  if (offset === 0) return `today at ${time}`;
  if (offset === 1) return `tomorrow at ${time}`;
  return `${cap(new Intl.DateTimeFormat(intlLocale, { weekday: "long" }).format(dayDate(ev.day)))} at ${time}`;
}

const isHappening = (ev: CalendarEvent) => ev.day === TODAY && toMin(ev.start) <= NOW_MIN && NOW_MIN < endMin(ev);
/** Under way or already over at the demo's "now": too late for a reminder. */
const hasStarted = (ev: CalendarEvent) => ev.day < TODAY || (ev.day === TODAY && toMin(ev.start) <= NOW_MIN);
const firstName = (name: string) => name.split(" ")[0] ?? name;
/** "Linda N." → "LN" (narrow grid blocks). */
const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/* ---------------------------- resource tints ---------------------------- */

type ResTone = { bar: string; fill: string; soft: string; swatch: string };
/** Aqua family + neutral/slate tints; the 4th adds a stripe pattern so it never relies on hue alone. */
const RES_TONES: readonly ResTone[] = [
  { bar: "bg-aqua", fill: "bg-aqua/[0.16]", soft: "bg-aqua/[0.06]", swatch: "bg-aqua" },
  { bar: "bg-[#A7B6CB]", fill: "bg-[#94A3B8]/[0.17]", soft: "bg-[#94A3B8]/[0.06]", swatch: "bg-[#A7B6CB]" },
  { bar: "bg-bone/80", fill: "bg-bone/[0.1]", soft: "bg-bone/[0.04]", swatch: "bg-bone/80" },
  {
    bar: "bg-aqua-deep",
    fill: "bg-[repeating-linear-gradient(135deg,rgba(18,165,148,0.28)_0_4px,rgba(18,165,148,0.12)_4px_8px)]",
    soft: "bg-aqua-deep/[0.07]",
    swatch: "bg-[repeating-linear-gradient(135deg,#12A594_0_2px,rgba(18,165,148,0.4)_2px_4px)]",
  },
];
const toneAt = (i: number) => RES_TONES[((i % RES_TONES.length) + RES_TONES.length) % RES_TONES.length];

/** Selected grid block: the aqua ring, plus a system-colour outline (forced-colors mode drops rings/shadows). */
const SELECTED_BLOCK =
  "ring-1 ring-inset ring-aqua/80 forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]";

/** The grid sits in a solid, slightly recessed well so the sticky day headers can match it exactly. */
const WELL = "#191d1e";
const WELL_TODAY = "#1a2424";

/* ------------------------------ helpers ------------------------------ */

/** Horizontal placement inside a day column, as fractions of its width. */
type Placed = {
  ev: CalendarEvent;
  left: number;
  width: number;
  /** 1 = drawn over a longer booking that started well before it (calendar-style cascade). */
  layer: 0 | 1;
  /** Minutes of this block left uncovered at its top (decides how many text lines it shows). */
  visibleMin: number;
};

/** A booking that starts at least this long after the ones it overlaps is cascaded over them. */
const CASCADE_GAP = 30;

/**
 * Lays out one day like a desktop calendar:
 *  - bookings that start at (nearly) the same time share the width side by side;
 *  - a booking that starts well after a longer one it overlaps (a crew day, a 3-hour colour)
 *    is drawn on top of it with an indent, so neither gets squeezed into a sliver.
 * Falls back to plain side-by-side columns if a cascade would hide another booking's start.
 */
function layoutDay(events: CalendarEvent[], order: (ev: CalendarEvent) => number): Placed[] {
  const start = (ev: CalendarEvent) => toMin(ev.start);
  const visEnd = (ev: CalendarEvent) => Math.max(endMin(ev), start(ev) + MIN_VISUAL_MIN);
  const overlaps = (a: CalendarEvent, b: CalendarEvent) => start(a) < visEnd(b) && start(b) < visEnd(a);
  const sorted = [...events].sort((a, b) => start(a) - start(b) || order(a) - order(b) || b.durationMin - a.durationMin);

  let cascaded = new Set<CalendarEvent>();
  sorted.forEach((ev, i) => {
    const earlier = sorted.slice(0, i).filter((o) => overlaps(o, ev));
    if (earlier.length && earlier.every((o) => !cascaded.has(o) && start(ev) - start(o) >= CASCADE_GAP)) cascaded.add(ev);
  });
  const collides = sorted.some(
    (b) => !cascaded.has(b) && [...cascaded].some((c) => overlaps(b, c) && start(c) - start(b) < CASCADE_GAP),
  );
  if (collides) cascaded = new Set();

  // Side-by-side columns for the base layer: overlapping bookings form a cluster and share its
  // width; a booking widens to the right over columns that are free during its time.
  const base = sorted.filter((ev) => !cascaded.has(ev));
  const cols = new Map<CalendarEvent, { col: number; cols: number }>();
  let cluster: { ev: CalendarEvent; col: number }[] = [];
  let colEnds: number[] = [];
  let clusterEnd = -Infinity;
  const flush = () => {
    for (const c of cluster) cols.set(c.ev, { col: c.col, cols: colEnds.length });
    cluster = [];
    colEnds = [];
    clusterEnd = -Infinity;
  };
  for (const ev of base) {
    if (cluster.length && start(ev) >= clusterEnd) flush();
    let col = colEnds.findIndex((end) => end <= start(ev));
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(visEnd(ev));
    } else colEnds[col] = visEnd(ev);
    cluster.push({ ev, col });
    clusterEnd = Math.max(clusterEnd, visEnd(ev));
  }
  flush();

  const out: Placed[] = base.map((ev) => {
    const { col, cols: n } = cols.get(ev)!;
    let span = 1;
    for (let c = col + 1; c < n; c++) {
      if (base.some((o) => o !== ev && cols.get(o)!.col === c && overlaps(o, ev))) break;
      span++;
    }
    const coveredAt = [...cascaded].filter((c) => overlaps(c, ev)).reduce((m, c) => Math.min(m, start(c)), Infinity);
    return { ev, left: col / n, width: span / n, layer: 0, visibleMin: Math.min(ev.durationMin, coveredAt - start(ev)) };
  });
  // Every base booking a cascaded one overlaps started well before it, and nothing else is booked
  // in its time, so it takes the column's width minus an indent that keeps the one beneath visible.
  for (const c of cascaded) out.push({ ev: c, left: 0.25, width: 0.75, layer: 1, visibleMin: c.durationMin });
  // Chronological DOM (and Tab) order.
  return out.sort((a, b) => start(a.ev) - start(b.ev) || a.left - b.left);
}

/** Cross-links may hand us a calendar event id, an inbox message id or a lead id. */
function resolveEvent(id: string, data: NicheViews): CalendarEvent | undefined {
  const { events } = data.calendar;
  const direct = events.find((e) => e.id === id);
  if (direct) return direct;
  const msg = data.inbox.find((m) => m.id === id);
  if (msg?.email.calendarEventId) return events.find((e) => e.id === msg.email.calendarEventId);
  const lead = data.leads.find((l) => l.id === id);
  return lead ? events.find((e) => e.client === lead.name) : undefined;
}

/** Scroll `el` into view inside `scroller` only (never the page). Works under FitStage's scale. */
function revealInScroller(el: HTMLElement | null, scroller: HTMLElement | null, stickyTop = 0) {
  if (!el || !scroller) return;
  const s = scroller.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const scale = scroller.offsetHeight ? s.height / scroller.offsetHeight : 1;
  const top = (r.top - s.top) / scale;
  const bottom = (r.bottom - s.top) / scale;
  const pad = 10;
  if (top < stickyTop + pad) scroller.scrollTop += top - stickyTop - pad;
  else if (bottom > scroller.clientHeight - pad) scroller.scrollTop += Math.min(bottom - scroller.clientHeight + pad, top - stickyTop - pad);
}

/** The week grid needs room: below 1280px its columns cut names to a few letters, so the agenda shows instead. */
const WIDE_QUERY = "(min-width: 1280px)";
function subscribeWide(onChange: () => void) {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}
function useIsWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );
}
/** The agenda card scrolls on its own only on lg (fixed-height plate); below that the page scrolls. */
function activeScroller(el: HTMLElement | null) {
  if (!el) return null;
  const { overflowY } = window.getComputedStyle(el);
  return overflowY === "auto" || overflowY === "scroll" ? el : null;
}

type Status = CalendarEventStatus;
type FocusRequest = { kind: "heading"; id: string; reveal: boolean } | { kind: "origin"; id: string } | null;

/* ================================ view ================================ */

export function CalendarView() {
  const { nicheId } = useNiche();
  // Keyed by industry: selection, focus and pulse state reset when the industry changes.
  return <CalendarBoard key={nicheId} nicheId={nicheId} />;
}

function CalendarBoard({ nicheId }: { nicheId: NicheId }) {
  const { locale, intlLocale } = useLanguage();
  const { focusId, clearFocus, isDone, pinned } = useDashboardView();
  const isWide = useIsWide();
  const data = NICHE_VIEWS[nicheId];
  const { resources, events } = data.calendar;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pulse, setPulse] = useState<{ id: string; tick: number } | null>(null);
  const [, rerender] = useState(0);
  const focusRequest = useRef<FocusRequest>(null);
  const originRefs = useRef(new Map<string, HTMLButtonElement>());
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const agendaScrollRef = useRef<HTMLDivElement>(null);
  const detailId = `calendar-detail-${nicheId}`;

  const statusOf = (ev: CalendarEvent): Status => (ev.status === "confirmed" || isDone(`confirm:${ev.id}`) ? "confirmed" : ev.status);
  const toneOf = (ev: CalendarEvent) => Math.max(0, resources.findIndex((r) => r.en === ev.resource.en));
  const byDay = DAYS.map((d) =>
    events.filter((e) => e.day === d).sort((a, b) => toMin(a.start) - toMin(b.start) || toneOf(a) - toneOf(b)),
  );
  const selected = events.find((e) => e.id === selectedId) ?? null;

  const stats = {
    count: events.length,
    value: events.reduce((sum, e) => sum + e.value, 0),
    deposits: events.filter((e) => e.status === "deposit").length,
    toConfirm: events.filter((e) => statusOf(e) === "pending").length,
  };

  const open = (id: string, opts?: { pulse?: boolean }) => {
    setSelectedId(id);
    if (opts?.pulse) setPulse((p) => ({ id, tick: (p?.tick ?? 0) + 1 }));
    focusRequest.current = { kind: "heading", id, reveal: Boolean(opts?.pulse) };
    rerender((n) => n + 1);
  };
  const close = () => {
    if (!selectedId) return;
    focusRequest.current = { kind: "origin", id: selectedId };
    setSelectedId(null);
  };

  // Move focus after the render that opened / closed a booking (detail heading on open, its block on close).
  useEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    const origin = originRefs.current.get(request.id) ?? null;
    // On lg the agenda scrolls inside the plate: move only that pane, never the page.
    const agendaPane = isWide ? null : activeScroller(agendaScrollRef.current);
    if (request.kind === "origin") {
      origin?.focus({ preventScroll: isWide || Boolean(agendaPane) });
      if (agendaPane) revealInScroller(origin, agendaPane);
      // Unpinned laptops: the plate itself may sit under the sticky header.
      if (isWide || agendaPane) revealInPage(origin, pinned);
      return;
    }
    const heading = headingRef.current;
    if (isWide) {
      if (asideRef.current) asideRef.current.scrollTop = 0;
      heading?.focus({ preventScroll: true });
      // 56: the tallest sticky day header (narrow columns stack the "Today" pill).
      if (request.reveal) revealInScroller(origin, gridScrollRef.current, 56);
      revealInPage(heading, pinned);
    } else {
      heading?.focus({ preventScroll: true });
      const item = itemRefs.current.get(request.id) ?? heading;
      if (agendaPane) {
        revealInScroller(item, agendaPane);
        revealInPage(item, pinned);
      } else item?.scrollIntoView({ block: "nearest" });
    }
  });

  // Cross-links ("View in calendar" in an Inbox email, "Open in calendar" on a lead) open and highlight that booking.
  useEffect(() => {
    if (!focusId) return;
    const target = resolveEvent(focusId, data);
    clearFocus();
    if (target) open(target.id, { pulse: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  const registerOrigin = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) originRefs.current.set(id, el);
    else originRefs.current.delete(id);
  };
  const registerItem = (id: string) => (el: HTMLLIElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  };

  const detail = (ev: CalendarEvent, inline: boolean) => (
    <EventDetail
      key={ev.id}
      ev={ev}
      status={statusOf(ev)}
      tone={toneOf(ev)}
      nicheId={nicheId}
      data={data}
      headingRef={headingRef}
      inline={inline}
      onClose={close}
    />
  );

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      onKeyDown={(e) => {
        if (e.key === "Escape" && selectedId) {
          e.stopPropagation();
          close();
        }
      }}
    >
      <div className="px-2 pb-3 pt-2 sm:px-3 sm:pt-3 lg:pt-2.5">
        <ViewHeader
          title={COPY.title[locale]}
          subtitle={fill(COPY.subtitle[locale], {
            week: COPY.week[locale],
            range: `${weekday(0, intlLocale, "short")}–${weekday(5, intlLocale, "short")}`,
            count: shownOf(stats.count, nicheId, locale),
            value: formatCurrency(stats.value, intlLocale),
          })}
          actions={
            <ul aria-label={COPY.legend[locale]} className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 lg:max-w-[34rem] lg:justify-end">
              {resources.map((r, i) => (
                <li key={r.en} className="inline-flex items-center gap-1.5 text-xs text-bone/85">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${toneAt(i).swatch}`} />
                  {r[locale]}
                </li>
              ))}
            </ul>
          }
        />
      </div>

      {isWide ? (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_300px] grid-rows-[minmax(0,1fr)] gap-2">
          <WeekGrid
            nicheId={nicheId}
            byDay={byDay}
            statusOf={statusOf}
            toneOf={toneOf}
            selectedId={selectedId}
            pulse={pulse}
            controls={detailId}
            scrollRef={gridScrollRef}
            registerOrigin={registerOrigin}
            onOpen={(id) => open(id)}
          />
          <div
            ref={asideRef}
            id={detailId}
            className={`${CARD_FLUSH} min-h-0 overflow-y-auto [scrollbar-color:rgba(255,255,255,0.16)_transparent] [scrollbar-width:thin]`}
          >
            <motion.div
              key={selected?.id ?? "summary"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            >
              {selected ? (
                detail(selected, false)
              ) : (
                <WeekSummary
                  nicheId={nicheId}
                  events={events}
                  stats={stats}
                  statusOf={statusOf}
                  onOpen={(id) => open(id, { pulse: true })}
                />
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        // lg (1024–1279, fixed-height plate): the stats stay put and the agenda list scrolls.
        <div className="flex flex-col gap-1.5 sm:gap-2 lg:min-h-0 lg:flex-1">
          <WeekStats nicheId={nicheId} stats={stats} layout="strip" />
          <Agenda
            nicheId={nicheId}
            byDay={byDay}
            statusOf={statusOf}
            toneOf={toneOf}
            selectedId={selectedId}
            pulse={pulse}
            detailId={detailId}
            scrollRef={agendaScrollRef}
            registerOrigin={registerOrigin}
            registerItem={registerItem}
            onToggle={(id) => (id === selectedId ? close() : open(id))}
            renderDetail={(ev) => detail(ev, true)}
          />
        </div>
      )}
    </div>
  );
}

/* ============================== lg: week grid ============================== */

function WeekGrid({
  nicheId,
  byDay,
  statusOf,
  toneOf,
  selectedId,
  pulse,
  controls,
  scrollRef,
  registerOrigin,
  onOpen,
}: {
  nicheId: NicheId;
  byDay: CalendarEvent[][];
  statusOf: (ev: CalendarEvent) => Status;
  toneOf: (ev: CalendarEvent) => number;
  selectedId: string | null;
  pulse: { id: string; tick: number } | null;
  controls: string;
  scrollRef: RefObject<HTMLDivElement | null>;
  registerOrigin: (id: string) => (el: HTMLButtonElement | null) => void;
  onOpen: (id: string) => void;
}) {
  const { locale, intlLocale } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  // Track size (design px, unaffected by FitStage's scale) decides how many text lines a block can hold.
  const [track, setTrack] = useState({ w: 112, h: 470 });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setTrack((t) => (t.w === el.clientWidth && t.h === el.clientHeight ? t : { w: el.clientWidth, h: el.clientHeight }));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const nowPct = pct(NOW_MIN);
  // Narrow day columns stack the "Today" pill under the weekday; every header (and the axis corner) grows to match.
  const stackHead = track.w < 100;
  const headH = stackHead ? "h-14" : "h-12";

  return (
    <div className="relative flex min-h-0 flex-col overflow-hidden rounded-glass-sm" style={{ background: WELL }}>
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-color:rgba(255,255,255,0.16)_transparent] [scrollbar-width:thin]"
      >
        <div className="grid flex-1 grid-cols-[3.25rem_repeat(6,minmax(0,1fr))]">
          {/* Hour axis (decorative: every block carries its time in its accessible name). */}
          <div aria-hidden="true" className="flex flex-col">
            <div className={`sticky top-0 z-20 ${headH} shrink-0 border-b border-white/[0.06]`} style={{ background: WELL }} />
            <div className="relative min-h-[430px] flex-1">
              <div className="absolute inset-x-0 bottom-2 top-2.5">
                {HOURS.map((h, i) =>
                  Math.abs(h * 60 - NOW_MIN) < 20 ? null : (
                    <span
                      key={h}
                      className="tabular absolute right-2 -translate-y-1/2 whitespace-nowrap text-[0.6875rem] leading-none text-ash"
                      style={{ top: `${(i / (HOURS.length - 1)) * 100}%` }}
                    >
                      {hourLabel(h, intlLocale)}
                    </span>
                  ),
                )}
                <span
                  className="tabular absolute right-1 z-10 -translate-y-1/2 rounded-full bg-aqua px-1.5 py-px text-[0.625rem] font-semibold leading-[14px] text-ink shadow-[0_0_12px_rgba(61,219,201,0.45)]"
                  style={{ top: `${nowPct}%` }}
                >
                  {shortClock(NOW, intlLocale)}
                </span>
              </div>
            </div>
          </div>

          {DAYS.map((d) => {
            const today = d === TODAY;
            const list = byDay[d];
            const placed = layoutDay(list, toneOf);
            const headingId = `${nicheId}-cal-day-${d}`;
            const dayLong = weekday(d, intlLocale, "long");
            return (
              <section
                key={d}
                aria-labelledby={headingId}
                className="flex min-w-0 flex-col border-l border-white/[0.06]"
                style={today ? { background: WELL_TODAY } : undefined}
              >
                <div
                  className={`sticky top-0 z-20 flex ${headH} shrink-0 flex-col justify-center border-b border-white/[0.06] px-2.5`}
                  style={{ background: today ? WELL_TODAY : WELL }}
                >
                  <h4
                    id={headingId}
                    className={`flex text-[0.8125rem] font-medium leading-tight ${stackHead ? "flex-col items-start gap-0.5" : "items-center gap-1.5"} ${
                      today ? "text-aqua" : "text-bone"
                    }`}
                  >
                    <span aria-hidden="true">{weekday(d, intlLocale, "short")}</span>
                    <span className="sr-only">{dayLong}</span>
                    {today ? (
                      <span className="rounded-full bg-aqua px-1.5 text-[0.625rem] font-semibold leading-[15px] text-ink">{COPY.today[locale]}</span>
                    ) : null}
                  </h4>
                  <p className="mt-0.5 truncate text-[0.6875rem] leading-tight text-ash">{countOf(list.length, nicheId, locale)}</p>
                </div>
                <div className="relative min-h-[430px] flex-1">
                  <div ref={d === 0 ? trackRef : undefined} className="absolute inset-x-0 bottom-2 top-2.5">
                    {/* Hour and half-hour lines. */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                      {HOURS.map((h, i) => (
                        <span key={h} className="absolute inset-x-0 h-px bg-white/[0.06]" style={{ top: `${(i / (HOURS.length - 1)) * 100}%` }} />
                      ))}
                      {HOURS.slice(0, -1).map((h, i) => (
                        <span
                          key={`half-${h}`}
                          className="absolute inset-x-0 h-px bg-white/[0.025]"
                          style={{ top: `${((i + 0.5) / (HOURS.length - 1)) * 100}%` }}
                        />
                      ))}
                    </div>

                    {placed.length ? (
                      <ul className="absolute inset-0">
                        {placed.map((p, i) => (
                          <EventBlock
                            key={p.ev.id}
                            placed={p}
                            status={statusOf(p.ev)}
                            tone={toneAt(toneOf(p.ev))}
                            selected={p.ev.id === selectedId}
                            pulseTick={pulse && pulse.id === p.ev.id ? pulse.tick : 0}
                            dayLong={dayLong}
                            well={today ? WELL_TODAY : WELL}
                            trackW={track.w}
                            trackH={track.h}
                            delay={Math.min(0.3, d * 0.035 + i * 0.03)}
                            controls={controls}
                            buttonRef={registerOrigin(p.ev.id)}
                            onOpen={() => onOpen(p.ev.id)}
                          />
                        ))}
                      </ul>
                    ) : (
                      <OpenSlot nicheId={nicheId} className="absolute inset-x-1.5 bottom-[16%] top-[16%]" />
                    )}

                    {/* Now: a strong line on today, a faint guide across the other days. */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 ${today ? "z-[6]" : "z-0"}`}
                      style={{ top: `${nowPct}%` }}
                    >
                      {today ? (
                        <>
                          <span className="absolute inset-x-0 -top-px h-[2px] rounded-full bg-aqua shadow-[0_0_10px_rgba(61,219,201,0.55)]" />
                          <span className="absolute -left-[4px] -top-[4px] h-2 w-2 rounded-full bg-aqua shadow-[0_0_0_2px_#1a2424]" />
                        </>
                      ) : (
                        <span className="absolute inset-x-0 top-0 h-px bg-aqua/20" />
                      )}
                    </div>
                  </div>
                </div>
                {today ? <p className="sr-only">{fill(COPY.currentTime[locale], { time: formatClock(NOW, intlLocale) })}</p> : null}
              </section>
            );
          })}
        </div>
      </div>
      {/* Rim drawn above the sticky headers so the well's edge stays crisp. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.05)]"
      />
    </div>
  );
}

function EventBlock({
  placed,
  status,
  tone,
  selected,
  pulseTick,
  dayLong,
  well,
  trackW,
  trackH,
  delay,
  controls,
  buttonRef,
  onOpen,
}: {
  placed: Placed;
  status: Status;
  tone: ResTone;
  selected: boolean;
  pulseTick: number;
  dayLong: string;
  well: string;
  trackW: number;
  trackH: number;
  delay: number;
  controls: string;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onOpen: () => void;
}) {
  const { locale, intlLocale } = useLanguage();
  const { ev, layer } = placed;
  const top = pct(toMin(ev.start));
  const height = pct(endMin(ev)) - top;
  const left = placed.left * 100;
  const width = placed.width * 100;
  const px = Math.max(20, (placed.visibleMin / SPAN) * trackH - 2);
  const lines = px >= 60 ? 4 : px >= 46 ? 3 : px >= 31 ? 2 : 1;
  const narrow = trackW * placed.width < 64;
  // A single line sits centred in a short block, but at the top of a tall one that a cascade covers.
  const centred = lines === 1 && placed.visibleMin >= ev.durationMin;
  const pending = status === "pending";
  const Icon = STATUS_ICON[status];
  const range = timeRange(ev, intlLocale);

  return (
    <motion.li
      className="absolute rounded-[7px]"
      style={{
        top: `${top}%`,
        height: `max(calc(${height}% - 2px), 20px)`,
        left: `calc(${left}% + 3px)`,
        width: `calc(${width}% - 5px)`,
        zIndex: selected ? 5 : 1 + layer,
        // Opaque blocks: a cascaded booking cleanly covers the one beneath, with a hairline of "paper" around it.
        background: well,
        boxShadow: layer ? `0 0 0 1.5px ${well}` : undefined,
      }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_EDITORIAL, delay }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onOpen}
        aria-controls={controls}
        aria-current={selected ? "true" : undefined}
        className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[7px] border text-left transition-transform duration-150 ease-editorial active:scale-[0.98] focus-visible:[outline-offset:1px] ${
          pending ? `${tone.soft} border-dashed border-signal/60` : `${tone.fill} border-transparent`
        } ${selected ? SELECTED_BLOCK : ""} ${centred ? "justify-center" : "pt-[3px]"} ${narrow ? "pl-[7px] pr-1" : "pl-[9px] pr-4"}`}
      >
        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[3px] ${tone.bar}`} />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-white/[0.06] transition-opacity duration-150 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        />
        {!narrow ? (
          <Icon
            aria-hidden="true"
            size={11}
            strokeWidth={2.4}
            className={`absolute right-1 ${centred ? "top-1/2 -translate-y-1/2" : "top-[5px]"} ${STATUS_ICON_TONE[status]}`}
          />
        ) : null}
        {narrow ? (
          // Too narrow for a name: initials + start time (the accessible name below carries the full details).
          lines === 1 ? (
            // One row: the time wraps out of sight (clipped) rather than showing half of it.
            <span aria-hidden="true" className="relative flex h-[13px] flex-wrap gap-x-1 overflow-hidden text-[0.6875rem] leading-[13px]">
              <span className="font-medium text-bone">{initialsOf(ev.client)}</span>
              <span className="tabular text-bone/75">{shortClock(ev.start, intlLocale)}</span>
            </span>
          ) : (
            <span aria-hidden="true" className="relative block text-[0.6875rem] leading-[13px]">
              <span className="block truncate font-medium text-bone">{initialsOf(ev.client)}</span>
              <span className="tabular block overflow-hidden whitespace-nowrap text-bone/75">{shortClock(ev.start, intlLocale)}</span>
            </span>
          )
        ) : lines === 1 ? (
          <span className="relative block truncate text-[0.6875rem] leading-[13px]">
            <span className="font-medium text-bone">{ev.client}</span>
            <span className="text-bone/75">
              <span className="sr-only">,</span> {ev.service[locale]}
            </span>
          </span>
        ) : (
          <>
            <span className="relative block truncate text-[0.6875rem] font-medium leading-[13px] text-bone">{ev.client}</span>
            <span className="relative block truncate text-[0.6875rem] leading-[13px] text-bone/75">
              <span className="sr-only">, </span>
              {ev.service[locale]}
            </span>
            {lines >= 3 ? (
              <span aria-hidden="true" className="tabular relative block truncate text-[0.6875rem] leading-[13px] text-bone/70">
                {range}
              </span>
            ) : null}
            {lines === 4 ? (
              <span aria-hidden="true" className="relative block truncate text-[0.6875rem] leading-[13px] text-bone/70">
                {ev.resource[locale]}
              </span>
            ) : null}
          </>
        )}
        <span className="sr-only">
          {narrow ? `${ev.client}, ${ev.service[locale]}` : null}, {dayLong} {range}, {ev.resource[locale]}, {STATUS_WORD[status][locale]}
        </span>
      </button>
      {pulseTick ? <PulseRing key={pulseTick} className="-inset-[3px] rounded-[10px]" /> : null}
    </motion.li>
  );
}

/** Cross-link highlight: an aqua ring that blinks twice (opacity only) and settles. */
function PulseRing({ className }: { className: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 ring-2 ring-aqua shadow-[0_0_18px_rgba(61,219,201,0.5)] ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.15, 1, 0] }}
      transition={{ duration: 1.9, times: [0, 0.18, 0.45, 0.65, 1], ease: "easeInOut", delay: 0.25 }}
    />
  );
}

function OpenSlot({ nicheId, className }: { nicheId: NicheId; className: string }) {
  const { locale } = useLanguage();
  return (
    <div
      className={`grid place-items-center rounded-[10px] border border-dashed border-white/[0.18] bg-white/[0.015] px-2 text-center text-[0.6875rem] leading-snug text-ash ${className}`}
    >
      <span className="inline-flex flex-col items-center gap-1">
        <Globe aria-hidden="true" size={13} strokeWidth={1.9} className="text-aqua" />
        {fill(COPY.openSlot[locale], { book: BOOK_VERB(nicheId) })}
      </span>
    </div>
  );
}

/* ============================== side card ============================== */

type Stats = { count: number; value: number; deposits: number; toConfirm: number };

/** `card`: 2×2 in the xl side card; `strip`: one row of four from sm up, above the agenda. */
function WeekStats({ nicheId, stats, layout }: { nicheId: NicheId; stats: Stats; layout: "card" | "strip" }) {
  const { locale, intlLocale } = useLanguage();
  const tiles: { label: string; value: string; alert?: boolean }[] = [
    { label: cap(nounFor(nicheId).many[locale]), value: String(stats.count) },
    { label: COPY.statValue[locale], value: formatCurrency(stats.value, intlLocale) },
    { label: COPY.statDeposits[locale], value: String(stats.deposits) },
    { label: COPY.statToConfirm[locale], value: String(stats.toConfirm), alert: stats.toConfirm > 0 },
  ];
  return (
    <dl className={`grid shrink-0 grid-cols-2 gap-1.5 ${layout === "strip" ? "sm:grid-cols-4" : ""}`}>
      {tiles.map((t) => (
        <div key={t.label} className="rounded-[12px] bg-white/[0.04] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
          <dt className="truncate text-[0.6875rem] font-medium text-ash">{t.label}</dt>
          <dd className="mt-1 flex items-center gap-1.5 font-display text-lg leading-none tracking-[-0.02em] text-bone">
            <span className="tabular">{t.value}</span>
            {t.alert ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function WeekSummary({
  nicheId,
  events,
  stats,
  statusOf,
  onOpen,
}: {
  nicheId: NicheId;
  events: CalendarEvent[];
  stats: Stats;
  statusOf: (ev: CalendarEvent) => Status;
  onOpen: (id: string) => void;
}) {
  const { locale, intlLocale } = useLanguage();
  const waiting = events
    .filter((e) => statusOf(e) === "pending")
    .sort((a, b) => a.day - b.day || toMin(a.start) - toMin(b.start));
  const noun = nounFor(nicheId).one[locale];

  return (
    <section aria-labelledby={`${nicheId}-cal-summary`} className="p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h4 id={`${nicheId}-cal-summary`} className="font-display text-base leading-tight tracking-[-0.015em] text-bone">
          {COPY.summaryTitle[locale]}
        </h4>
        <p className="text-[0.6875rem] text-ash">{fill(COPY.asOf[locale], { time: formatClock(NOW, intlLocale) })}</p>
      </div>
      <div className="mt-3">
        <WeekStats nicheId={nicheId} stats={stats} layout="card" />
      </div>

      <h5 className={`${LABEL} mt-5`}>{COPY.waiting[locale]}</h5>
      {waiting.length ? (
        <ul className="-mx-1.5 mt-1.5 space-y-0.5">
          {waiting.map((ev) => (
            <li key={ev.id}>
              <button
                type="button"
                onClick={() => onOpen(ev.id)}
                className={`${ROW} flex min-h-[44px] w-full items-center gap-2.5 px-1.5 py-1.5 text-left`}
              >
                <span
                  aria-hidden="true"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal/[0.12] text-signal ring-1 ring-inset ring-signal/30"
                >
                  <Clock3 size={13} strokeWidth={2.1} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-medium text-bone">{ev.client}</span>
                  <span className="block truncate text-[0.6875rem] text-ash">
                    <span className="sr-only">, </span>
                    {weekday(ev.day, intlLocale, "short")}, {formatClock(ev.start, intlLocale)} · {ev.service[locale]}
                    <span className="sr-only">, {STATUS_WORD.pending[locale]}</span>
                  </span>
                </span>
                <ChevronRight aria-hidden="true" size={14} strokeWidth={2} className="shrink-0 text-ash" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 flex items-center gap-2 rounded-[12px] bg-live/[0.06] px-3 py-2.5 text-[0.8125rem] text-bone ring-1 ring-inset ring-live/25">
          <CalendarCheck aria-hidden="true" size={15} strokeWidth={2} className="shrink-0 text-live" />
          {COPY.allConfirmed[locale]}
        </p>
      )}

      <h5 className={`${LABEL} mt-5`}>{COPY.key[locale]}</h5>
      <ul className="mt-2 space-y-2">
        {(["confirmed", "deposit", "pending"] as const).map((st) => {
          const Icon = STATUS_ICON[st];
          return (
            <li key={st} className="flex items-center gap-2.5 text-[0.8125rem]">
              <span
                aria-hidden="true"
                className={`relative grid h-[18px] w-7 shrink-0 place-items-center overflow-hidden rounded-[5px] border ${
                  st === "pending" ? "border-dashed border-signal/60 bg-aqua/[0.06]" : "border-transparent bg-aqua/[0.16]"
                }`}
              >
                <span className="absolute inset-y-0 left-0 w-[2px] bg-aqua" />
                <Icon size={10} strokeWidth={2.6} className={STATUS_ICON_TONE[st]} />
              </span>
              <span className="shrink-0 whitespace-nowrap text-bone">{STATUS_WORD[st][locale]}</span>
              <span className="min-w-0 truncate text-[0.75rem] text-ash">· {STATUS_HINT[st][locale]}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 flex gap-2 border-t border-white/[0.07] pt-4 text-[0.75rem] leading-snug text-ash">
        <Globe aria-hidden="true" size={14} strokeWidth={1.9} className="mt-px shrink-0 text-aqua" />
        {fill(COPY.onlineNote[locale], { book: BOOK_VERB(nicheId) })}
      </p>
      <p className="mt-2 text-[0.75rem] leading-snug text-ash">{fill(COPY.pickHint[locale], { noun })}</p>
    </section>
  );
}

/** Pending reads as a signal accent plus the word (bone text keeps 4.5:1 on any card). */
function StateChip({ status }: { status: Status }) {
  const { locale } = useLanguage();
  const word = STATUS_WORD[status][locale];
  if (status === "pending") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium text-bone ring-1 ring-inset ring-signal/50">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
        {word}
      </span>
    );
  }
  return <StatusChip tone={status === "confirmed" ? "live" : "aqua"}>{word}</StatusChip>;
}

function EventDetail({
  ev,
  status,
  tone,
  nicheId,
  data,
  headingRef,
  inline,
  onClose,
}: {
  ev: CalendarEvent;
  status: Status;
  tone: number;
  nicheId: NicheId;
  data: NicheViews;
  headingRef: RefObject<HTMLHeadingElement | null>;
  inline: boolean;
  onClose: () => void;
}) {
  const { locale, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const { isDone, markDone, announce, setView } = useDashboardView();
  const noun = nounFor(nicheId).one[locale];
  const Heading = inline ? "h5" : "h4";
  const Sub = inline ? "h6" : "h5";

  const wasPending = ev.status === "pending";
  const confirmed = status === "confirmed";
  const reminded = isDone(`reminder:${ev.id}`);
  const first = firstName(ev.client);
  const happening = isHappening(ev);
  // Under way or over at "now": no reminder to offer.
  const canRemind = !hasStarted(ev);
  const lead = data.leads.find((l) => l.name === ev.client);
  const email = data.inbox.find((m) => m.email.calendarEventId === ev.id);

  // The text names the person ("with Andre"), never the resource label ("Chair 1 · Andre").
  const person = personOf(ev.resource[locale]) ?? personOf(ev.resource.en);
  const reminder = fill(REMINDER[REMINDER_SHAPE[nicheId]][locale], {
    first,
    business: niche.simulator.business,
    service: ev.service[locale],
    who: person ? fill(WITH[locale], { name: person }) : "",
    where: WHERE[ev.resource.en]?.[locale] ?? "",
    when: whenPhrase(ev, locale, intlLocale),
  }).replace(/\.\./g, "."); // "Northside Barber Co." + "." → one period

  const facts: { label: string; value: ReactNode; mono?: boolean }[] = [
    {
      label: (nicheId === "restaurant" ? COPY.area : COPY.with)[locale],
      value: (
        <span className="inline-flex items-center justify-end gap-1.5">
          <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-[3px] ${toneAt(tone).swatch}`} />
          {ev.resource[locale]}
        </span>
      ),
    },
    { label: COPY.value[locale], value: formatCurrency(ev.value, intlLocale), mono: true },
  ];

  return (
    <section aria-labelledby={`cal-detail-heading-${ev.id}`} className={inline ? "" : "p-4"}>
      {inline ? (
        <button type="button" onClick={onClose} className={`${ACTION_SECONDARY} -ml-1 mb-4 pl-3`}>
          <ArrowLeft aria-hidden="true" size={15} strokeWidth={2} />
          {COPY.back[locale]}
        </button>
      ) : (
        <div className="-mt-1 mb-3 flex items-center justify-between gap-3">
          <p className={LABEL}>{fill(COPY.detailTitle[locale], { Noun: cap(noun), noun })}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={COPY.closeDetails[locale]}
            className={`${PILL} ${PILL_OFF} -mr-1 pl-2.5 transition-transform duration-200 ease-editorial active:scale-[0.97]`}
          >
            <X aria-hidden="true" size={14} strokeWidth={2} />
            {COPY.close[locale]}
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="contents [&>span]:h-10 [&>span]:w-10 [&>span]:text-xs">
          <Avatar name={ev.client} tone={confirmed ? "neutral" : "aqua"} />
        </span>
        <div className="min-w-0 flex-1">
          <Heading
            ref={headingRef}
            id={`cal-detail-heading-${ev.id}`}
            tabIndex={-1}
            className="rounded-md font-display text-lg leading-tight tracking-[-0.02em] text-bone focus-visible:[outline-offset:2px]"
          >
            {ev.client}
          </Heading>
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-bone/85">{ev.service[locale]}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StateChip status={status} />
            {happening ? <StatusChip tone="neutral">{COPY.happeningNow[locale]}</StatusChip> : null}
          </div>
        </div>
      </div>

      {/* The time "ticket". */}
      <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-white/[0.04] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_0_0_1px_rgba(255,255,255,0.04)]">
        <span
          aria-hidden="true"
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-center ${
            ev.day === TODAY ? "bg-aqua text-ink" : "bg-white/[0.07] text-bone ring-1 ring-inset ring-white/10"
          }`}
        >
          <span className="text-[0.6875rem] font-semibold leading-tight">
            {weekday(ev.day, intlLocale, "short")}
            {ev.day === TODAY ? <span className="block text-[0.5625rem] font-semibold uppercase tracking-[0.04em]">{COPY.today[locale]}</span> : null}
          </span>
        </span>
        <div className="min-w-0">
          <p className="tabular text-[0.875rem] font-medium leading-snug text-bone">
            <span className="sr-only">{weekday(ev.day, intlLocale, "long")}{ev.day === TODAY ? ` (${COPY.today[locale]})` : ""}, </span>
            {timeRange(ev, intlLocale)}
          </p>
          <p className="mt-0.5 text-[0.75rem] text-ash">{duration(ev.durationMin)}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.8125rem]">
        {facts.map((f) => (
          <div key={f.label} className="contents">
            <dt className="text-ash">{f.label}</dt>
            <dd className={`min-w-0 text-right text-bone ${f.mono ? "tabular font-medium" : ""}`}>{f.value}</dd>
          </div>
        ))}
      </dl>

      {wasPending || canRemind ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {wasPending ? (
            <DoneButton
              label={COPY.confirm[locale]}
              doneLabel={COPY.confirmed[locale]}
              done={confirmed}
              onPress={() => {
                markDone(`confirm:${ev.id}`);
                announce(fill(COPY.confirmAnnounce[locale], { name: ev.client, noun }));
              }}
              icon={<CalendarCheck aria-hidden="true" size={15} strokeWidth={2} />}
              className="flex-[1_1_auto]"
            />
          ) : null}
          {canRemind ? (
            <DoneButton
              label={COPY.sendReminder[locale]}
              doneLabel={COPY.reminderSent[locale]}
              done={reminded}
              variant={wasPending && !confirmed ? "secondary" : "primary"}
              onPress={() => {
                markDone(`reminder:${ev.id}`);
                announce(fill(COPY.reminderAnnounce[locale], { name: ev.client }));
              }}
              icon={<BellRing aria-hidden="true" size={15} strokeWidth={2} />}
              className="flex-[1_1_auto]"
            />
          ) : null}
        </div>
      ) : null}

      {/* The made-up reminder text: a preview before, the "sent" bubble after. */}
      {canRemind ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-[0.6875rem] font-medium text-ash">
            {reminded ? (
              <Check aria-hidden="true" size={12} strokeWidth={2.4} className="text-aqua" />
            ) : (
              <MessageSquareText aria-hidden="true" size={12} strokeWidth={2} />
            )}
            {reminded ? COPY.reminderSentMeta[locale] : fill(COPY.reminderPreview[locale], { first })}
          </p>
          <motion.p
            key={reminded ? "sent" : "draft"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            className={`mt-1.5 rounded-[12px] rounded-tl-[4px] px-3 py-2 text-[0.8125rem] leading-snug ${
              reminded
                ? "bg-aqua/[0.1] text-bone shadow-[inset_0_0_0_1px_rgba(61,219,201,0.22)]"
                : "bg-white/[0.035] text-bone/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
            }`}
          >
            {reminder}
          </motion.p>
        </div>
      ) : (
        <p className="mt-4 flex items-start gap-1.5 text-[0.75rem] leading-snug text-ash">
          <BellRing aria-hidden="true" size={13} strokeWidth={2} className="mt-px shrink-0" />
          {fill(COPY.noReminder[locale], { noun })}
        </p>
      )}

      {lead || email ? (
        <div className="mt-4 border-t border-white/[0.07] pt-4">
          <Sub className={LABEL}>{COPY.related[locale]}</Sub>
          <ul className="mt-2 grid grid-cols-1 gap-1.5">
            {lead ? (
              <li>
                <RelatedLink
                  icon={UserRound}
                  label={COPY.openLead[locale]}
                  meta={lead.service[locale]}
                  onPress={() => {
                    announce(fill(COPY.leadAnnounce[locale], { name: lead.name }));
                    setView("leads", lead.id);
                  }}
                />
              </li>
            ) : null}
            {email ? (
              <li>
                <RelatedLink
                  icon={Mail}
                  label={COPY.openEmail[locale]}
                  meta={email.subject[locale]}
                  onPress={() => {
                    announce(COPY.emailAnnounce[locale]);
                    setView("inbox", email.id);
                  }}
                />
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}

      <p className="mt-3 text-[0.6875rem] text-ash">{COPY.demoNote[locale]}</p>
    </section>
  );
}

function RelatedLink({ icon: Icon, label, meta, onPress }: { icon: LucideIcon; label: string; meta: string; onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`${ROW} flex min-h-[44px] w-full items-center gap-2.5 bg-white/[0.03] px-2.5 py-2 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]`}
    >
      <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua/[0.1] text-aqua ring-1 ring-inset ring-aqua/25">
        <Icon size={13} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.8125rem] font-medium text-bone">{label}</span>
        <span className="block truncate text-[0.6875rem] text-ash">
          <span className="sr-only">: </span>
          {meta}
        </span>
      </span>
      <ChevronRight aria-hidden="true" size={14} strokeWidth={2} className="shrink-0 text-ash" />
    </button>
  );
}

/* ============================== <lg: agenda ============================== */

function Agenda({
  nicheId,
  byDay,
  statusOf,
  toneOf,
  selectedId,
  pulse,
  detailId,
  scrollRef,
  registerOrigin,
  registerItem,
  onToggle,
  renderDetail,
}: {
  nicheId: NicheId;
  byDay: CalendarEvent[][];
  statusOf: (ev: CalendarEvent) => Status;
  toneOf: (ev: CalendarEvent) => number;
  selectedId: string | null;
  pulse: { id: string; tick: number } | null;
  detailId: string;
  scrollRef: RefObject<HTMLDivElement | null>;
  registerOrigin: (id: string) => (el: HTMLButtonElement | null) => void;
  registerItem: (id: string) => (el: HTMLLIElement | null) => void;
  onToggle: (id: string) => void;
  renderDetail: (ev: CalendarEvent) => ReactNode;
}) {
  const { locale, intlLocale } = useLanguage();

  return (
    <div
      ref={scrollRef}
      className={`${CARD_FLUSH} px-1.5 py-1 sm:px-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[scrollbar-color:rgba(255,255,255,0.16)_transparent] lg:[scrollbar-width:thin]`}
    >
      {DAYS.map((d) => {
        const today = d === TODAY;
        const list = byDay[d];
        const headingId = `${nicheId}-agenda-day-${d}`;
        // Today: a "now" divider before the first booking that hasn't started yet.
        const nowAt = today ? list.findIndex((e) => toMin(e.start) > NOW_MIN) : -1;
        const nowIndex = today ? (nowAt === -1 ? list.length : nowAt) : -1;
        return (
          <section key={d} aria-labelledby={headingId} className="border-t border-white/[0.06] py-3 first:border-t-0">
            <div className="flex items-center justify-between gap-3 px-2">
              <h4 id={headingId} className={`flex items-center gap-2 text-sm font-medium ${today ? "text-aqua" : "text-bone"}`}>
                {weekday(d, intlLocale, "long")}
                {today ? (
                  <span className="rounded-full bg-aqua px-2 text-[0.6875rem] font-semibold leading-[18px] text-ink">{COPY.today[locale]}</span>
                ) : null}
              </h4>
              <p className="text-xs text-ash">{countOf(list.length, nicheId, locale)}</p>
            </div>
            {today ? <p className="sr-only">{fill(COPY.currentTime[locale], { time: formatClock(NOW, intlLocale) })}</p> : null}

            {list.length ? (
              <ul className="mt-2 space-y-1">
                {list.map((ev, i) => {
                  const status = statusOf(ev);
                  const open = ev.id === selectedId;
                  return (
                    <AgendaEntry
                      key={ev.id}
                      ev={ev}
                      status={status}
                      tone={toneAt(toneOf(ev))}
                      open={open}
                      showNow={i === nowIndex}
                      pulseTick={pulse && pulse.id === ev.id ? pulse.tick : 0}
                      detailId={detailId}
                      itemRef={registerItem(ev.id)}
                      buttonRef={registerOrigin(ev.id)}
                      onToggle={() => onToggle(ev.id)}
                      detail={open ? renderDetail(ev) : null}
                    />
                  );
                })}
                {nowIndex === list.length ? <NowDivider /> : null}
              </ul>
            ) : (
              <OpenSlot nicheId={nicheId} className="mx-1 mt-2 min-h-[56px] py-3" />
            )}
          </section>
        );
      })}
    </div>
  );
}

function NowDivider() {
  const { intlLocale, locale } = useLanguage();
  return (
    <li aria-hidden="true" className="flex items-center gap-2 px-2 py-0.5">
      <span className="tabular rounded-full bg-aqua px-1.5 text-[0.625rem] font-semibold leading-[16px] text-ink">
        {COPY.today[locale]} · {formatClock(NOW, intlLocale)}
      </span>
      <span className="h-[2px] flex-1 rounded-full bg-aqua/70" />
    </li>
  );
}

function AgendaEntry({
  ev,
  status,
  tone,
  open,
  showNow,
  pulseTick,
  detailId,
  itemRef,
  buttonRef,
  onToggle,
  detail,
}: {
  ev: CalendarEvent;
  status: Status;
  tone: ResTone;
  open: boolean;
  showNow: boolean;
  pulseTick: number;
  detailId: string;
  itemRef: (el: HTMLLIElement | null) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onToggle: () => void;
  detail: ReactNode;
}) {
  const { locale, intlLocale } = useLanguage();
  return (
    <>
      {showNow ? <NowDivider /> : null}
      <li ref={itemRef}>
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={open ? detailId : undefined}
            className={`${ROW} ${open ? ROW_SELECTED : ""} grid min-h-[56px] w-full grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-3 px-2.5 py-2.5 text-left focus-visible:[outline-offset:-2px]`}
          >
            <span className="tabular pt-px">
              <span className="block whitespace-nowrap text-[0.8125rem] font-medium text-bone">{formatClock(ev.start, intlLocale)}</span>
              <span className="block text-[0.6875rem] text-ash">
                <span className="sr-only">, </span>
                {duration(ev.durationMin)}
              </span>
            </span>
            <span className="flex min-w-0 gap-2.5">
              <span aria-hidden="true" className={`w-[3px] shrink-0 self-stretch rounded-full ${tone.bar}`} />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-medium text-bone">
                    <span className="sr-only">, </span>
                    {ev.client}
                  </span>
                  <span className="sr-only">, </span>
                  <StateChip status={status} />
                </span>
                <span className="mt-0.5 block truncate text-xs text-ash">
                  <span className="sr-only">, </span>
                  {ev.service[locale]}
                  <span aria-hidden="true"> · </span>
                  <span className="sr-only">, </span>
                  {ev.resource[locale]}
                </span>
              </span>
            </span>
          </button>
          {pulseTick ? <PulseRing key={pulseTick} className="inset-0 rounded-[12px]" /> : null}
        </div>
        {detail ? (
          <motion.div
            id={detailId}
            className="mx-0.5 mb-2 mt-1.5 rounded-glass-sm bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:p-5"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
          >
            {detail}
          </motion.div>
        ) : null}
      </li>
    </>
  );
}
