"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  Camera,
  CircleDashed,
  Globe,
  Handshake,
  MessageSquareText,
  Phone,
  PhoneMissed,
  Search,
  Send,
  Users,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import {
  NICHE_VIEWS,
  type CalendarEvent,
  type InboxMessage,
  type Lead,
  type LeadSource,
  type LeadStatus,
  type NicheViews,
} from "@/data/dashboard-views";
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
  PILL_ON,
  ROW,
  ROW_SELECTED,
  StatusChip,
  ViewHeader,
  formatClock,
  revealInPage,
  type Tone,
} from "./ui";

/* ------------------------------------------------------------------ *
 * Leads: a demo CRM inbox for the selected industry.
 *
 * lg+: list (left) + detail card (right, 340px) inside the locked plate;
 *      each pane scrolls on its own, the header stays put. The list is a
 *      5-column table only from xl (it needs ~456px); at lg it keeps the
 *      compact row (name/service + value, chips on their own line).
 * <lg: one column. Tapping a lead swaps the list for its detail (Back /
 *      Escape returns to the row that opened it).
 *
 * Status is always DERIVED (data + shared "done" keys), so a lead texted
 * here also reads "Contacted" in the sidebar badge and anywhere else:
 *   booked:<leadId> → Booked · text:<leadId> → Contacted.
 * Nothing is sent: every action only flips local/context demo state.
 * ------------------------------------------------------------------ */

const COPY = {
  title: { en: "Leads", es: "Prospectos" },
  subtitle: { en: "{count} recent leads · {open} open, worth {value}", es: "{count} prospectos recientes · {open} abiertos, con valor de {value}" },
  filterGroup: { en: "Filter leads by status", es: "Filtrar prospectos por estado" },
  filterAll: { en: "All", es: "Todos" },
  filterNew: { en: "New", es: "Nuevos" },
  filterContacted: { en: "Contacted", es: "Contactados" },
  filterBooked: { en: "Booked", es: "Agendados" },
  filterAnnounce: { en: "Showing {count} leads.", es: "Mostrando {count} prospectos." },
  listLabel: { en: "Leads", es: "Prospectos" },
  colLead: { en: "Lead", es: "Prospecto" },
  colSource: { en: "Source", es: "Origen" },
  colStatus: { en: "Status", es: "Estado" },
  colValue: { en: "Value · received", es: "Valor · recibido" },
  emptyTitle: { en: "All caught up", es: "Todo al día" },
  emptyBody: { en: "No leads match this filter right now.", es: "Ningún prospecto coincide con este filtro por ahora." },
  back: { en: "Back to leads", es: "Volver a prospectos" },
  detailLabel: { en: "Lead details", es: "Detalles del prospecto" },
  selectHint: { en: "Pick a lead to see the details.", es: "Elija un prospecto para ver los detalles." },
  phone: { en: "Phone", es: "Teléfono" },
  service: { en: "Service", es: "Servicio" },
  value: { en: "Estimated value", es: "Valor estimado" },
  source: { en: "Source", es: "Origen" },
  appointment: { en: "Appointment", es: "Cita" },
  note: { en: "Note", es: "Nota" },
  activity: { en: "Activity", es: "Actividad" },
  sendText: { en: "Send text", es: "Enviar texto" },
  textSent: { en: "Text sent", es: "Texto enviado" },
  markBooked: { en: "Mark booked", es: "Marcar como agendado" },
  booked: { en: "Booked", es: "Agendado" },
  openCalendar: { en: "Open in calendar", es: "Abrir en el calendario" },
  demoNote: { en: "Demo: nothing is actually sent.", es: "Demo: en realidad no se envía nada." },
  textAnnounce: { en: "Text sent to {name}. Demo only, nothing was sent.", es: "Texto enviado a {name}. Es una demo: no se envió nada." },
  bookedAnnounce: { en: "{name} marked as booked.", es: "Se marcó como agendado: {name}." },
  calendarAnnounce: { en: "Opening {name}'s appointment in the calendar.", es: "Abriendo la cita de {name} en el calendario." },
  // Timeline
  automatic: { en: "Automatic, seconds later", es: "Automático, segundos después" },
  followedUp: { en: "Your team followed up", es: "Su equipo dio seguimiento" },
  followedUpMeta: { en: "Waiting for them to reply", es: "Esperando a que responda" },
  bookedFor: { en: "Booked for {when}", es: "Agendado para el {when}" },
  bookedNoEvent: { en: "Appointment booked", es: "Cita agendada" },
  lost: { en: "Marked lost", es: "Marcado como perdido" },
  youTexted: { en: "You texted (demo)", es: "Usted envió un texto (demo)" },
  youBooked: { en: "You marked it booked", es: "Usted lo marcó como agendado" },
  justNow: { en: "Just now", es: "Ahora" },
  justNowInbox: { en: "Just now · sent from the Inbox", es: "Ahora · enviado desde la Bandeja de entrada" },
  waiting: { en: "Waiting on you", es: "Pendiente de usted" },
  waitingMeta: { en: "Send a text to follow up", es: "Envíe un texto para dar seguimiento" },
} satisfies Record<string, L10n>;

const STATUS_WORD: Record<LeadStatus, L10n> = {
  new: { en: "New", es: "Nuevo" },
  contacted: { en: "Contacted", es: "Contactado" },
  booked: { en: "Booked", es: "Agendado" },
  lost: { en: "Lost", es: "Perdido" },
};
const STATUS_TONE: Record<LeadStatus, Tone> = { new: "aqua", contacted: "neutral", booked: "live", lost: "neutral" };

const SOURCE: Record<LeadSource, { label: L10n; icon: LucideIcon; event: L10n; auto: L10n }> = {
  missedCall: {
    label: { en: "Missed call", es: "Llamada perdida" },
    icon: PhoneMissed,
    event: { en: "Missed call", es: "Llamada perdida" },
    auto: { en: "Auto-text sent", es: "Texto automático enviado" },
  },
  website: {
    label: { en: "Website", es: "Sitio web" },
    icon: Globe,
    event: { en: "Request from your website", es: "Solicitud desde su sitio web" },
    auto: { en: "Instant reply sent", es: "Respuesta instantánea enviada" },
  },
  google: {
    label: { en: "Google", es: "Google" },
    icon: Search,
    event: { en: "Message from your Google profile", es: "Mensaje desde su perfil de Google" },
    auto: { en: "Auto-reply sent", es: "Respuesta automática enviada" },
  },
  instagram: {
    label: { en: "Instagram", es: "Instagram" },
    icon: Camera,
    event: { en: "Instagram DM", es: "Mensaje directo de Instagram" },
    auto: { en: "Auto-reply with your booking link", es: "Respuesta automática con su enlace para agendar" },
  },
  referral: {
    label: { en: "Referral", es: "Recomendación" },
    icon: Handshake,
    event: { en: "Referred by a client", es: "Recomendado por un cliente" },
    auto: { en: "Welcome text sent", es: "Texto de bienvenida enviado" },
  },
};

/** The prewritten follow-up text ("Send text"), built from the lead's name and service. */
const TEXT_TEMPLATE: Record<"open" | "booked" | "lost", L10n> = {
  open: {
    en: "Hi {first}, this is {business}. Thanks for reaching out about “{service}”. {closer}",
    es: "Hola, {first}, le escribe {business}. Gracias por su interés en “{service}”. {closer}",
  },
  booked: {
    en: "Hi {first}, this is {business}. You're all set for “{service}”{when}. Reply C to confirm or R to reschedule.",
    es: "Hola, {first}, le escribe {business}. Su cita para “{service}”{when} está lista. Responda C para confirmar o R para cambiarla.",
  },
  lost: {
    en: "Hi {first}, this is {business}. Still thinking about “{service}”? If your plans change, reply here and we'll find a time that works.",
    es: "Hola, {first}, le escribe {business}. ¿Sigue pensando en “{service}”? Si sus planes cambian, responda aquí y buscamos un horario que le funcione.",
  },
};
const CLOSER: Record<NicheId, L10n> = {
  barbershop: { en: "We have openings this week. Want us to hold a time for you?", es: "Tenemos espacios esta semana. ¿Le apartamos un horario?" },
  salon: { en: "We have openings this week. Want us to hold a time for you?", es: "Tenemos espacios esta semana. ¿Le apartamos un horario?" },
  beauty: { en: "We have openings this week. Want us to hold a time for you?", es: "Tenemos espacios esta semana. ¿Le apartamos un horario?" },
  restaurant: {
    en: "We'd love to host you. Want us to send a few open dates and our group menu?",
    es: "Será un gusto recibirlos. ¿Le enviamos algunas fechas disponibles y nuestro menú para grupos?",
  },
  contractor: {
    en: "When works for an on-site estimate this week? The $150 visit fee is credited to your project.",
    es: "¿Qué día le queda bien esta semana para un presupuesto en sitio? La visita de $150 se acredita a su proyecto.",
  },
  service: {
    en: "We can get a technician out this week. Want us to hold a time?",
    es: "Podemos enviarle un técnico esta semana. ¿Le apartamos un horario?",
  },
};

type Filter = "all" | "new" | "contacted" | "booked";
const FILTERS: { id: Filter; label: L10n }[] = [
  { id: "all", label: COPY.filterAll },
  { id: "new", label: COPY.filterNew },
  { id: "contacted", label: COPY.filterContacted },
  { id: "booked", label: COPY.filterBooked },
];

/** The status every section should show for a lead: data + shared demo actions. */
export function leadStatus(lead: Lead, isDone: (key: string) => boolean): LeadStatus {
  if (lead.status === "booked" || isDone(`booked:${lead.id}`)) return "booked";
  if (isDone(`text:${lead.id}`)) return "contacted";
  return lead.status;
}

const firstName = (name: string) => name.split(" ")[0] ?? name;
const CLOCK_RE = /\d{1,2}:\d{2}\s?[AP]M/i;

/**
 * "Thu, 5:15 PM" for a demo-week event (day 0 = Monday 5 Jan 2026). Spanish keeps
 * the weekday lowercase ("jue, 5:15 PM"), so "Agendado para el jue, …" reads right.
 */
function eventWhen(ev: CalendarEvent, intlLocale: string) {
  const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: "short" }).format(new Date(2026, 0, 5 + ev.day));
  const day = intlLocale.startsWith("es") ? weekday.toLocaleLowerCase(intlLocale) : `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;
  return `${day}, ${formatClock(ev.start, intlLocale)}`;
}

/**
 * The lead / review an Inbox email talks about: the one whose name appears first in it
 * (sender, subject, preview, body, details). Works for system alerts that quote the
 * client ("SermaWebDesign Alerts") and for emails sent by the client.
 * Shared with the Inbox so both sections pair an email with the same lead.
 */
export function findMentioned<T>(items: readonly T[], name: (item: T) => string, m: InboxMessage): T | undefined {
  const haystack = [m.from, m.subject.en, m.preview.en, ...m.email.paragraphs.map((p) => p.en), ...(m.email.details ?? []).map((d) => d.value.en)].join("\n");
  let best: T | undefined;
  let at = Infinity;
  for (const item of items) {
    const i = haystack.indexOf(name(item));
    if (i >= 0 && i < at) {
      best = item;
      at = i;
    }
  }
  return best;
}

const hasQuickReply = (m: InboxMessage) => m.email.primary.action === "quickReply" || m.email.secondary?.action === "quickReply";

/** The text-back email about this lead (the one with quick replies), if there is one. */
function textBackFor(lead: Lead, data: NicheViews): InboxMessage | undefined {
  return data.inbox.find((m) => hasQuickReply(m) && findMentioned(data.leads, (l) => l.name, m)?.id === lead.id);
}

/** The lead's booking in the demo week, matched by name. */
const eventFor = (lead: Lead, data: NicheViews) => data.calendar.events.find((e) => e.client === lead.name);

/**
 * The prewritten "Send text" message for a lead, built from its name and service.
 * Also used by the Inbox to show the same words in the text-back thread when the
 * lead was texted from here.
 */
export function leadTextMessage(lead: Lead, nicheId: NicheId, business: string, data: NicheViews, locale: Locale, intlLocale: string) {
  // The lead already asked something in a text-back thread: answer that question (its first
  // prewritten reply), so the Leads bubble and the Inbox thread show the same, relevant text.
  const answer = textBackFor(lead, data)?.email.quickReplies?.[0];
  if (answer) return answer[locale];
  const event = eventFor(lead, data);
  const when = event ? eventWhen(event, intlLocale) : null;
  const template = lead.status === "booked" ? TEXT_TEMPLATE.booked : lead.status === "lost" ? TEXT_TEMPLATE.lost : TEXT_TEMPLATE.open;
  return fill(template[locale], {
    first: firstName(lead.name),
    business,
    service: lead.service[locale],
    closer: CLOSER[nicheId][locale],
    when: when ? ` (${when})` : "",
  }).replace(/\.\./g, "."); // "Northside Barber Co." + "." → one period
}

/** Cross-links may hand us a lead id, a calendar event id or an inbox message id. */
function resolveLead(id: string, data: NicheViews): Lead | undefined {
  const direct = data.leads.find((l) => l.id === id);
  if (direct) return direct;
  const ev = data.calendar.events.find((e) => e.id === id);
  if (ev) return data.leads.find((l) => l.name === ev.client);
  const msg = data.inbox.find((m) => m.id === id);
  return msg ? findMentioned(data.leads, (l) => l.name, msg) : undefined;
}

/** Focus a target without jolting the page: on lg+ only the pane's own scroller moves. */
function focusInPane(el: HTMLElement | null, scroller: HTMLElement | null, toTop: boolean, pinned: boolean) {
  if (!el) return;
  const lg = window.matchMedia("(min-width: 1024px)").matches;
  el.focus({ preventScroll: true });
  if (!lg) {
    el.scrollIntoView({ block: "nearest" });
    return;
  }
  scrollPaneTo(el, scroller, toTop);
  // Unpinned laptops: the pane itself may sit under the sticky header or below the fold.
  revealInPage(el, pinned);
}

/** Move only the pane's scroller so `el` is inside it (lg+). */
function scrollPaneTo(el: HTMLElement, scroller: HTMLElement | null, toTop: boolean) {
  if (!scroller) return;
  if (toTop) {
    scroller.scrollTop = 0;
    return;
  }
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== scroller) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== scroller) return;
  const pad = 8;
  if (top - pad < scroller.scrollTop) scroller.scrollTop = Math.max(0, top - pad);
  else if (top + el.offsetHeight + pad > scroller.scrollTop + scroller.clientHeight)
    scroller.scrollTop = top + el.offsetHeight + pad - scroller.clientHeight;
}

export function LeadsView() {
  const { nicheId } = useNiche();
  // Keyed by industry: selection, filter and focus state reset when the industry changes.
  return <LeadsBoard key={nicheId} nicheId={nicheId} />;
}

function LeadsBoard({ nicheId }: { nicheId: NicheId }) {
  const { locale, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const { isDone, markDone, announce, setView, focusId, clearFocus, pinned } = useDashboardView();
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;
  const data = NICHE_VIEWS[nicheId];
  const leads = data.leads;

  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(leads[0]?.id ?? null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [focusReq, setFocusReq] = useState<{ target: "heading" | "row"; tick: number }>({ target: "heading", tick: 0 });

  const listScrollRef = useRef<HTMLUListElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());

  const statusOf = (l: Lead) => leadStatus(l, isDone);
  const counts: Record<Filter, number> = {
    all: leads.length,
    new: leads.filter((l) => statusOf(l) === "new").length,
    contacted: leads.filter((l) => statusOf(l) === "contacted").length,
    booked: leads.filter((l) => statusOf(l) === "booked").length,
  };
  const openLeads = leads.filter((l) => {
    const s = statusOf(l);
    return s === "new" || s === "contacted";
  });
  const openValue = openLeads.reduce((sum, l) => sum + l.value, 0);

  // The open lead stays listed while it is open, even if an action moves it out of the filter.
  const visible = leads.filter((l) => filter === "all" || statusOf(l) === filter || l.id === selectedId);
  const selected = leads.find((l) => l.id === selectedId) ?? visible[0] ?? null;

  const requestFocus = (target: "heading" | "row") => setFocusReq((r) => ({ target, tick: r.tick + 1 }));

  // Only an explicit request moves focus (open → detail heading, back → the row); selection alone never does.
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;
  useEffect(() => {
    if (!focusReq.tick) return;
    if (focusReq.target === "heading") focusInPane(headingRef.current, detailScrollRef.current, true, pinnedRef.current);
    else if (selectedRef.current)
      focusInPane(rowRefs.current.get(selectedRef.current) ?? null, listScrollRef.current, false, pinnedRef.current);
  }, [focusReq]);

  // Cross-links ("Open lead" in an Inbox email, a calendar event…) open that lead directly.
  useEffect(() => {
    if (!focusId) return;
    const target = resolveLead(focusId, data);
    clearFocus();
    if (!target) return;
    setFilter("all");
    setSelectedId(target.id);
    setDetailOpen(true);
    requestFocus("heading");
  }, [focusId, data, clearFocus]);

  const openLead = (id: string) => {
    setSelectedId(id);
    setDetailOpen(true);
    requestFocus("heading");
  };
  const closeDetail = () => {
    setDetailOpen(false);
    requestFocus("row");
  };
  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    const matches = leads.filter((l) => next === "all" || statusOf(l) === next);
    setFilter(next);
    setDetailOpen(false);
    setSelectedId(matches[0]?.id ?? null);
    announce(fill(COPY.filterAnnounce[locale], { count: matches.length }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-3 pt-2 sm:px-3 sm:pt-3">
        <ViewHeader
          title={COPY.title[locale]}
          subtitle={fill(COPY.subtitle[locale], {
            count: leads.length,
            open: openLeads.length,
            value: formatCurrency(openValue, intlLocale),
          })}
          actions={
            <div role="group" aria-label={COPY.filterGroup[locale]} className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const on = f.id === filter;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => changeFilter(f.id)}
                    className={`${PILL} ${on ? PILL_ON : PILL_OFF} transition-transform duration-200 ease-editorial active:scale-[0.97]`}
                  >
                    {f.label[locale]}
                    <span className={`tabular text-[0.75rem] ${on ? "text-ink/70" : "text-ash"}`}>{counts[f.id]}</span>
                  </button>
                );
              })}
            </div>
          }
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-1.5 sm:gap-2 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[minmax(0,1fr)]">
        {/* ---------- List ---------- */}
        <section
          className={`${CARD_FLUSH} flex min-h-0 flex-col ${detailOpen ? "max-lg:hidden" : ""}`}
        >
          <div
            aria-hidden="true"
            className="hidden grid-cols-[2rem_minmax(0,1fr)_8.25rem_6.5rem_7.5rem] gap-x-3 px-4 pb-2 pt-3 text-[0.6875rem] font-medium text-ash xl:grid"
          >
            <span />
            <span>{COPY.colLead[locale]}</span>
            <span>{COPY.colSource[locale]}</span>
            <span>{COPY.colStatus[locale]}</span>
            <span className="text-right">{COPY.colValue[locale]}</span>
          </div>
          {visible.length ? (
            <ul
              ref={listScrollRef}
              aria-label={COPY.listLabel[locale]}
              className="relative flex flex-col gap-0.5 p-1.5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto xl:pt-0"
            >
              {visible.map((lead, i) => (
                <motion.li
                  key={lead.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE_EDITORIAL, delay: Math.min(i, 8) * 0.03 }}
                >
                  <LeadRow
                    lead={lead}
                    status={statusOf(lead)}
                    selected={lead.id === selected?.id}
                    onOpen={() => openLead(lead.id)}
                    controls={`lead-detail-${nicheId}`}
                    buttonRef={(el) => {
                      if (el) rowRefs.current.set(lead.id, el);
                      else rowRefs.current.delete(lead.id);
                    }}
                  />
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="grid flex-1 place-items-center px-6 py-12 text-center">
              <div>
                <span aria-hidden="true" className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-aqua">
                  <Users size={18} strokeWidth={1.75} />
                </span>
                <p className="mt-3 text-sm font-medium text-bone">{COPY.emptyTitle[locale]}</p>
                <p className="mt-1 text-[0.8125rem] text-ash">{COPY.emptyBody[locale]}</p>
              </div>
            </div>
          )}
        </section>

        {/* ---------- Detail ---------- */}
        {selected ? (
          <section
            aria-label={COPY.detailLabel[locale]}
            id={`lead-detail-${nicheId}`}
            onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                closeDetail();
              }
            }}
            className={`${CARD_FLUSH} flex min-h-0 flex-col ${detailOpen ? "" : "max-lg:hidden"}`}
          >
            <div ref={detailScrollRef} className="relative p-4 sm:p-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:p-4">
              <button
                type="button"
                onClick={closeDetail}
                className={`${ACTION_SECONDARY} -ml-1 mb-4 pl-3 lg:hidden`}
              >
                <ArrowLeft aria-hidden="true" size={15} strokeWidth={2} />
                {COPY.back[locale]}
              </button>
              <LeadDetail
                key={selected.id}
                lead={selected}
                nicheId={nicheId}
                business={niche.simulator.business}
                data={data}
                status={statusOf(selected)}
                headingRef={headingRef}
                onText={() => {
                  markDone(`text:${selected.id}`);
                  announce(fill(COPY.textAnnounce[locale], { name: selected.name }));
                }}
                onBook={() => {
                  markDone(`booked:${selected.id}`);
                  announce(fill(COPY.bookedAnnounce[locale], { name: selected.name }));
                }}
                onCalendar={(ev) => {
                  announce(fill(COPY.calendarAnnounce[locale], { name: selected.name }));
                  setView("calendar", ev.id);
                }}
              />
            </div>
          </section>
        ) : (
          <div className={`${CARD_FLUSH} hidden place-items-center p-6 text-center text-[0.8125rem] text-ash lg:grid`}>
            {COPY.selectHint[locale]}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceChip({ source, locale }: { source: LeadSource; locale: Locale }) {
  const { label, icon: Icon } = SOURCE[source];
  return (
    <span className="inline-flex max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.03] px-2 py-0.5 text-[0.6875rem] font-medium text-bone/80 ring-1 ring-inset ring-white/[0.12]">
      <Icon aria-hidden="true" size={12} strokeWidth={2} className={source === "missedCall" ? "text-signal" : "text-ash"} />
      {label[locale]}
    </span>
  );
}

function LeadRow({
  lead,
  status,
  selected,
  onOpen,
  buttonRef,
  controls,
}: {
  lead: Lead;
  status: LeadStatus;
  selected: boolean;
  onOpen: () => void;
  controls: string;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const { locale, intlLocale } = useLanguage();
  const chip = <StatusChip tone={STATUS_TONE[status]}>{STATUS_WORD[status][locale]}</StatusChip>;
  // Ash on the selected tint is too close to 4.5:1; bone/70 keeps the secondary lines readable.
  const muted = selected ? "text-bone/70" : "text-ash";
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onOpen}
      aria-controls={controls}
      aria-current={selected ? "true" : undefined}
      className={`${ROW} ${selected ? ROW_SELECTED : ""} grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 px-2.5 py-2.5 text-left transition-colors duration-150 focus-visible:[outline-offset:-2px] xl:grid-cols-[2rem_minmax(0,1fr)_8.25rem_6.5rem_7.5rem] xl:py-2`}
    >
      <Avatar name={lead.name} tone={status === "new" ? "aqua" : "neutral"} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-bone">{lead.name}</span>
        <span className={`mt-0.5 block truncate text-xs ${muted}`}>{lead.service[locale]}</span>
      </span>
      <span className="hidden min-w-0 xl:flex">
        <SourceChip source={lead.source} locale={locale} />
      </span>
      <span className="hidden xl:flex">{chip}</span>
      <span className="self-start text-right xl:self-center">
        <span className="tabular block text-sm font-medium text-bone">{formatCurrency(lead.value, intlLocale)}</span>
        <span className={`mt-0.5 block whitespace-nowrap text-[0.6875rem] ${muted}`}>{lead.received[locale]}</span>
      </span>
      {/* Below xl (phones, and the narrow lg list beside the detail card): the chips get their own line under the name. */}
      <span className="col-span-2 col-start-2 mt-1.5 flex flex-wrap gap-1.5 xl:hidden">
        <SourceChip source={lead.source} locale={locale} />
        {chip}
      </span>
    </button>
  );
}

type Step = {
  key: string;
  icon: LucideIcon;
  tone: "alert" | "auto" | "team" | "done" | "you" | "pending" | "lost";
  title: string;
  meta?: string;
  bubble?: string;
};

const STEP_ICON_TONE: Record<Step["tone"], string> = {
  alert: "bg-signal/[0.12] text-signal ring-1 ring-inset ring-signal/30",
  auto: "bg-aqua/[0.1] text-aqua ring-1 ring-inset ring-aqua/25",
  team: "bg-white/[0.07] text-bone ring-1 ring-inset ring-white/10",
  done: "bg-live/[0.12] text-live ring-1 ring-inset ring-live/30",
  you: "bg-aqua text-ink",
  pending: "border border-dashed border-white/25 text-ash",
  lost: "bg-white/[0.05] text-ash ring-1 ring-inset ring-white/10",
};

function LeadDetail({
  lead,
  nicheId,
  business,
  data,
  status,
  headingRef,
  onText,
  onBook,
  onCalendar,
}: {
  lead: Lead;
  nicheId: NicheId;
  business: string;
  data: NicheViews;
  status: LeadStatus;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onText: () => void;
  onBook: () => void;
  onCalendar: (ev: CalendarEvent) => void;
}) {
  const { locale, intlLocale } = useLanguage();
  const { isDone } = useDashboardView();
  const texted = isDone(`text:${lead.id}`);
  const bookedHere = isDone(`booked:${lead.id}`);
  const isBooked = status === "booked";
  const event = eventFor(lead, data);
  const when = event ? eventWhen(event, intlLocale) : null;

  // Texted through a quick reply on the Inbox text-back email: show the words that went out.
  const textBack = textBackFor(lead, data);
  const inboxReply = textBack?.email.quickReplies?.find((_, i) => isDone(`qr:${textBack.id}:${i}`));
  const message = inboxReply ? inboxReply[locale] : leadTextMessage(lead, nicheId, business, data, locale, intlLocale);

  const clock = lead.received[locale].match(CLOCK_RE)?.[0];
  const src = SOURCE[lead.source];
  const steps: Step[] = [
    { key: "in", icon: src.icon, tone: lead.source === "missedCall" ? "alert" : "team", title: src.event[locale], meta: lead.received[locale] },
    { key: "auto", icon: Zap, tone: "auto", title: src.auto[locale], meta: clock ? `${clock} · ${COPY.automatic[locale]}` : COPY.automatic[locale] },
  ];
  if (lead.status === "contacted")
    steps.push({ key: "team", icon: MessageSquareText, tone: "team", title: COPY.followedUp[locale], meta: COPY.followedUpMeta[locale] });
  if (lead.status === "booked")
    steps.push({
      key: "booked",
      icon: CalendarCheck,
      tone: "done",
      title: when ? fill(COPY.bookedFor[locale], { when }) : COPY.bookedNoEvent[locale],
      meta: event?.resource[locale],
    });
  if (lead.status === "lost") steps.push({ key: "lost", icon: XCircle, tone: "lost", title: COPY.lost[locale] });
  if (texted)
    steps.push({
      key: "you-text",
      icon: Send,
      tone: "you",
      title: COPY.youTexted[locale],
      meta: inboxReply ? COPY.justNowInbox[locale] : COPY.justNow[locale],
      bubble: message,
    });
  if (bookedHere && lead.status !== "booked")
    steps.push({ key: "you-book", icon: CalendarCheck, tone: "done", title: COPY.youBooked[locale], meta: COPY.justNow[locale] });
  if (status === "new")
    steps.push({ key: "waiting", icon: CircleDashed, tone: "pending", title: COPY.waiting[locale], meta: COPY.waitingMeta[locale] });

  const facts: { label: string; value: string; mono?: boolean }[] = [
    { label: COPY.service[locale], value: lead.service[locale] },
    { label: COPY.value[locale], value: formatCurrency(lead.value, intlLocale), mono: true },
    { label: COPY.source[locale], value: SOURCE[lead.source].label[locale] },
  ];
  if (event && when) facts.push({ label: COPY.appointment[locale], value: `${when} · ${event.resource[locale]}` });

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE_EDITORIAL }}>
      <div className="flex items-start gap-3">
        <span className="contents [&>span]:h-10 [&>span]:w-10 [&>span]:text-xs">
          <Avatar name={lead.name} tone={status === "new" ? "aqua" : "neutral"} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h4
              ref={headingRef}
              id={`lead-heading-${lead.id}`}
              tabIndex={-1}
              className="rounded-md font-display text-lg leading-tight tracking-[-0.02em] text-bone focus-visible:[outline-offset:2px]"
            >
              {lead.name}
            </h4>
            <StatusChip tone={STATUS_TONE[status]}>{STATUS_WORD[status][locale]}</StatusChip>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-ash">
            <Phone aria-hidden="true" size={12} strokeWidth={2} />
            <span className="sr-only">{COPY.phone[locale]}: </span>
            <span className="tabular font-mono text-bone/85">{lead.phone}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <DoneButton
          label={COPY.sendText[locale]}
          doneLabel={COPY.textSent[locale]}
          done={texted}
          onPress={onText}
          icon={<Send aria-hidden="true" size={15} strokeWidth={2} />}
          className="flex-[1_1_auto]"
        />
        <DoneButton
          label={COPY.markBooked[locale]}
          doneLabel={COPY.booked[locale]}
          done={isBooked}
          onPress={onBook}
          variant={texted ? "primary" : "secondary"}
          icon={<CalendarCheck aria-hidden="true" size={15} strokeWidth={2} />}
          className="flex-[1_1_auto]"
        />
        {event && when ? (
          <button type="button" onClick={() => onCalendar(event)} className={`${ACTION_SECONDARY} w-full justify-between`}>
            <span className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden="true" size={15} strokeWidth={2} className="text-aqua" />
              {COPY.openCalendar[locale]}
            </span>
            <span className="tabular text-xs font-normal text-ash">{when}</span>
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-[0.6875rem] text-ash">{COPY.demoNote[locale]}</p>

      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 border-t border-white/[0.07] pt-4 text-[0.8125rem]">
        {facts.map((f) => (
          <div key={f.label} className="contents">
            <dt className="text-ash">{f.label}</dt>
            <dd className={`text-right text-bone ${f.mono ? "tabular font-medium" : ""}`}>{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded-[12px] bg-white/[0.035] px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        <p className="text-[0.6875rem] font-medium text-ash">{COPY.note[locale]}</p>
        <p className="mt-0.5 text-[0.8125rem] leading-snug text-bone/90">{lead.note[locale]}</p>
      </div>

      <h5 className={`${LABEL} mt-5`}>{COPY.activity[locale]}</h5>
      <ol className="mt-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const last = i === steps.length - 1;
          return (
            <motion.li
              key={step.key}
              className="relative flex gap-3 pb-3.5 last:pb-0"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            >
              {!last ? <span aria-hidden="true" className="absolute bottom-0 left-[11.5px] top-7 w-px bg-white/10" /> : null}
              <span aria-hidden="true" className={`relative grid h-6 w-6 shrink-0 place-items-center rounded-full ${STEP_ICON_TONE[step.tone]}`}>
                <Icon size={12} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1 pt-[3px]">
                <p className={`text-[0.8125rem] leading-snug ${step.tone === "pending" ? "text-ash" : "text-bone"}`}>{step.title}</p>
                {step.bubble ? (
                  <p className="mt-1.5 rounded-[12px] rounded-tl-[4px] bg-aqua/[0.1] px-3 py-2 text-[0.8125rem] leading-snug text-bone shadow-[inset_0_0_0_1px_rgba(61,219,201,0.22)]">
                    “{step.bubble}”
                  </p>
                ) : null}
                {step.meta ? <p className="mt-0.5 text-[0.6875rem] text-ash">{step.meta}</p> : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}
