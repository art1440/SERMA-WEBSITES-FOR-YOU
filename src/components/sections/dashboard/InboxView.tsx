"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  Check,
  CheckCheck,
  ChevronDown,
  CreditCard,
  MailCheck,
  MailOpen,
  MessageSquareReply,
  MessageSquareText,
  Receipt,
  Send,
  Star,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type RefObject } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import {
  NICHE_VIEWS,
  type EmailAction,
  type EmailButton,
  type InboxKind,
  type InboxMessage,
  type NicheViews,
} from "@/data/dashboard-views";
import type { NicheId } from "@/data/niches";
import { fill, type L10n, type Locale } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";
import { useDashboardView } from "./DashboardViewContext";
import { findMentioned, leadTextMessage } from "./LeadsView";
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  Avatar,
  CARD_FLUSH,
  DoneButton,
  PILL,
  PILL_OFF,
  PILL_ON,
  ROW,
  ROW_SELECTED,
  StatusChip,
  ViewHeader,
  revealInPage,
} from "./ui";

/* ------------------------------------------------------------------ *
 * Inbox: a small mail client inside the demo dashboard.
 *
 * lg+: message list (≈40%) | reading pane (≈60%), each scrolling on its own
 * inside the locked-height plate. Below lg: list first; opening a message
 * swaps in the reading view with a Back button (Escape also goes back).
 *
 * Every email is a branded SermaWebDesign notification and its buttons work:
 * confirm a booking (synced with the Calendar), jump to Calendar / Leads /
 * Reviews, reveal a receipt, mark handled, or pick a prewritten text reply.
 * DEMO ONLY: nothing is sent, fetched or stored; there is no free-text input.
 * Done flags live in the shared DashboardView context, so they survive
 * switching sections.
 * ------------------------------------------------------------------ */

const COPY = {
  title: { en: "Inbox", es: "Bandeja de entrada" },
  subtitle: {
    en: "Booking, payment and review alerts, plus replies to your text-backs.",
    es: "Alertas de citas, pagos y reseñas, junto con las respuestas a sus textos automáticos.",
  },
  alertSettings: { en: "Alert settings", es: "Ajustes de alertas" },
  messages: { en: "Messages", es: "Mensajes" },
  filterLabel: { en: "Filter messages", es: "Filtrar mensajes" },
  all: { en: "All", es: "Todos" },
  unread: { en: "Unread", es: "No leídos" },
  unreadOne: { en: "Unread", es: "No leído" },
  markAllRead: { en: "Mark all read", es: "Marcar todo como leído" },
  allMarkedRead: { en: "All messages marked as read.", es: "Todos los mensajes se marcaron como leídos." },
  showingAll: { en: "Showing all {n} messages.", es: "Se muestran los {n} mensajes." },
  showingUnread: { en: "Showing {n} unread.", es: "Se muestran {n} sin leer." },
  caughtUp: { en: "You're all caught up", es: "Está al día" },
  caughtUpBody: {
    en: "No unread messages. New alerts land here the moment they come in.",
    es: "No tiene mensajes sin leer. Las alertas nuevas llegan aquí en cuanto se generan.",
  },
  showAll: { en: "Show all messages", es: "Ver todos los mensajes" },
  pickTitle: { en: "No message selected", es: "Ningún mensaje seleccionado" },
  pickBody: { en: "Choose a message from the list to read it here.", es: "Elija un mensaje de la lista para leerlo aquí." },
  back: { en: "Back to inbox", es: "Volver a la bandeja" },
  to: { en: "To", es: "Para" },
  you: { en: "you", es: "usted" },
  received: { en: "Received", es: "Recibido" },
  today: { en: "Today", es: "Hoy" },
  footer: {
    en: "You're receiving this because alerts are on in",
    es: "Recibe este correo porque tiene las alertas activadas en",
  },
  settings: { en: "Settings", es: "Ajustes" },
  footerDemo: { en: "Sample email: nothing was sent.", es: "Correo de ejemplo: no se envió nada." },
  pickReply: {
    en: "Pick a reply. It goes out from your business number, no typing needed.",
    es: "Elija una respuesta. Se envía desde el número de su negocio, sin escribir nada.",
  },
  sendThis: { en: "send this reply", es: "enviar esta respuesta" },
  repliesShown: { en: "{n} quick replies shown below the buttons.", es: "Se muestran {n} respuestas rápidas debajo de los botones." },
  thread: { en: "Text thread with {name}", es: "Conversación por texto con {name}" },
  youJustNow: { en: "You · just now", es: "Usted · justo ahora" },
  sentDemo: { en: "Sent (demo)", es: "Enviado (demo)" },
  sentFromLeads: { en: "Sent from Leads (demo)", es: "Enviado desde Prospectos (demo)" },
  theySaid: { en: "{name} wrote at {time}:", es: "{name} escribió a las {time}:" },
  youSent: { en: "You sent, just now (demo):", es: "Usted envió, justo ahora (demo):" },
  youSentFromLeads: { en: "You sent from Leads, just now (demo):", es: "Usted envió desde Prospectos, justo ahora (demo):" },
  replySent: {
    en: "Reply sent to {name}. Demo only: nothing was actually sent.",
    es: "Respuesta enviada a {name}. Es una demo: en realidad no se envió nada.",
  },
  theClient: { en: "the client", es: "el cliente" },
  confirmNote: {
    en: "Now shown as Confirmed in your Calendar. Demo only: no text went out.",
    es: "Ahora aparece como confirmada en su Calendario. Es una demo: no se envió ningún texto.",
  },
  receipt: { en: "Receipt", es: "Recibo" },
  paid: { en: "Paid", es: "Pagado" },
  totalPaid: { en: "Total paid", es: "Total pagado" },
  paymentReceived: { en: "Payment received", es: "Pago recibido" },
  statusConfirmed: { en: "Confirmed", es: "Confirmada" },
  statusReplied: { en: "Replied", es: "Respondido" },
  statusHandled: { en: "Handled", es: "Atendido" },
} satisfies Record<string, L10n>;

const KIND_LABEL: Record<InboxKind, L10n> = {
  booking: { en: "Booking", es: "Cita" },
  payment: { en: "Payment", es: "Pago" },
  textback: { en: "Text-back", es: "Texto automático" },
  review: { en: "Review", es: "Reseña" },
  lead: { en: "Lead", es: "Prospecto" },
  system: { en: "Summary", es: "Resumen" },
};

const DETAIL_TITLE: Record<InboxKind, L10n> = {
  booking: { en: "Booking details", es: "Detalles de la cita" },
  payment: { en: "Payment details", es: "Detalles del pago" },
  textback: { en: "Call log", es: "Registro de la llamada" },
  review: { en: "Review details", es: "Detalles de la reseña" },
  lead: { en: "Lead details", es: "Detalles del prospecto" },
  system: { en: "At a glance", es: "De un vistazo" },
};

const KIND_ICON: Record<InboxKind, LucideIcon> = {
  booking: CalendarCheck,
  payment: CreditCard,
  textback: MessageSquareReply,
  review: Star,
  lead: UserPlus,
  system: ChartColumn,
};

const ACTION_ICON: Record<EmailAction, LucideIcon> = {
  confirm: CalendarCheck,
  openCalendar: CalendarDays,
  openReviews: Star,
  openLeads: Users,
  quickReply: MessageSquareReply,
  receipt: Receipt,
  acknowledge: MailCheck,
};

/** The fictional owner each industry's alerts are addressed to (matches the data files). */
const OWNER: Record<NicheId, string> = {
  barbershop: "Tony",
  salon: "Nadia",
  beauty: "Vanessa",
  restaurant: "Lucía",
  contractor: "Matt",
  service: "Dana",
};

/** The email "paper": also used to cut the ticket notches in detail cards. */
const EMAIL_BG = "bg-[#121617]";
const SCROLLBAR = "[scrollbar-color:rgba(255,255,255,0.16)_transparent] [scrollbar-width:thin]";

type Slot = "primary" | "secondary";
const SLOTS: readonly Slot[] = ["primary", "secondary"];
type Filter = "all" | "unread";
type FocusRequest = { kind: "heading" } | { kind: "row"; id: string } | null;

/**
 * The message that was open when the visitor jumped to another section (e.g. "View in calendar"),
 * restored when they come back. In-memory only, and only for the same industry.
 */
let lastOpen: { nicheId: NicheId; id: string; open: boolean } | null = null;

const slotKey = (m: InboxMessage, slot: Slot) => `email:${m.id}:${slot}`;
const confirmKey = (m: InboxMessage) => `confirm:${m.email.calendarEventId ?? m.id}`;
const slotOf = (m: InboxMessage, action: EmailAction) => SLOTS.find((s) => m.email[s]?.action === action);
const isNav = (a: EmailAction) => a === "openCalendar" || a === "openLeads" || a === "openReviews";
/** System alerts (vs. a client writing back through the text-back relay). */
const isAlert = (m: InboxMessage) => /serma/i.test(m.from) || m.fromEmail.startsWith("alerts@");
const isQuote = (s: string) => /^[“"]/.test(s.trim());
const unquote = (s: string) => s.trim().replace(/^[“"]\s*/, "").replace(/\s*[”"]$/, "");

/* ------------------------------ data helpers ------------------------------ */

const MONEY = /^\$[\d,]+(?:\.\d{2})?$/;

/** Index of the amount actually charged (the receipt's total line), or -1. */
function findTotal(details: NonNullable<InboxMessage["email"]["details"]>) {
  const money = details.map((d, i) => ({ d, i })).filter(({ d }) => MONEY.test(d.value.en.trim()));
  const pick = (re: RegExp) => money.find(({ d }) => re.test(d.label.en));
  return (pick(/total paid|amount paid/i) ?? pick(/paid/i) ?? pick(/deposit/i) ?? money[money.length - 1])?.i ?? -1;
}

/** Index of a receipt / invoice number row ("#NBC-20418"), or -1. */
function findNumber(details: NonNullable<InboxMessage["email"]["details"]>) {
  return details.findIndex((d) => /^#\S+$/.test(d.value.en.trim()));
}

/** Everything the UI derives from the shared done flags for one message. */
function messageState(m: InboxMessage, isDone: (key: string) => boolean, data: NicheViews) {
  const done = (slot: Slot | undefined) => slot !== undefined && isDone(slotKey(m, slot));
  const event = m.email.calendarEventId ? data.calendar.events.find((e) => e.id === m.email.calendarEventId) : undefined;
  const confirmSlot = slotOf(m, "confirm");
  const confirmed = confirmSlot !== undefined && (done(confirmSlot) || isDone(confirmKey(m)) || event?.status === "confirmed");
  const replySlot = slotOf(m, "quickReply");
  const sent = (m.email.quickReplies ?? []).map((_, i) => i).filter((i) => isDone(`qr:${m.id}:${i}`));
  // "Send text" on the same person in Leads (text:<leadId>) also answers this text-back.
  const lead = replySlot ? findMentioned(data.leads, (l) => l.name, m) : undefined;
  const fromLeads = sent.length === 0 && !done(replySlot) && lead !== undefined && isDone(`text:${lead.id}`);
  const replied = sent.length > 0 || done(replySlot) || fromLeads;
  const handled = done(slotOf(m, "acknowledge"));
  const receiptShown = done(slotOf(m, "receipt"));
  const status: L10n | null = confirmed ? COPY.statusConfirmed : replied ? COPY.statusReplied : handled ? COPY.statusHandled : null;
  const slotDone = (slot: Slot) => {
    const action = m.email[slot]?.action;
    if (action === "confirm") return confirmed;
    if (action === "quickReply") return replied;
    if (action === "receipt") return receiptShown;
    if (action === "acknowledge") return handled;
    return false;
  };
  return { confirmed, sent, fromLeads, replied, handled, receiptShown, status, slotDone };
}

/** "8:47 AM" → "Today, 8:47 AM" in the reading pane; longer stamps are kept as written. */
function stamp(received: L10n, locale: Locale) {
  const v = received[locale];
  return /^\d{1,2}:\d{2}\s?[AP]M$/i.test(v.trim()) ? `${COPY.today[locale]}, ${v}` : v;
}

/** Scroll `el` into view inside the reading pane (lg only, where the pane scrolls). FitStage-scale aware. */
function revealInPane(pane: HTMLElement | null, el: Element | null) {
  if (!pane || !el) return;
  const overflow = getComputedStyle(pane).overflowY;
  if ((overflow !== "auto" && overflow !== "scroll") || pane.scrollHeight <= pane.clientHeight + 1) return;
  const p = pane.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const scale = pane.offsetHeight ? p.height / pane.offsetHeight : 1;
  const below = (r.bottom - p.bottom) / scale + 16;
  if (below <= 0) return;
  const roomAbove = Math.max(0, (r.top - p.top) / scale - 12);
  const delta = Math.min(below, roomAbove);
  if (delta <= 0) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  pane.scrollBy({ top: delta, behavior: reduce ? "auto" : "smooth" });
}

/* --------------------------------- layout --------------------------------- */

const LG_QUERY = "(min-width: 1024px)";
const subscribeLg = (onChange: () => void) => {
  const mq = window.matchMedia(LG_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const readLg = () => window.matchMedia(LG_QUERY).matches;
function useIsLg() {
  return useSyncExternalStore(subscribeLg, readLg, () => false);
}

/* ================================= Inbox ================================== */

export function InboxView() {
  const { nicheId } = useNiche();
  // Keyed by industry: switching it resets selection, filter and open panels.
  return <InboxClient key={nicheId} nicheId={nicheId} />;
}

function InboxClient({ nicheId }: { nicheId: NicheId }) {
  const { locale } = useLanguage();
  const { niche } = useNiche();
  const { isDone, markDone, announce, setView, focusId, clearFocus, pinned } = useDashboardView();
  const isLg = useIsLg();
  const data = NICHE_VIEWS[nicheId];
  const messages = data.inbox;
  const isUnread = (m: InboxMessage) => m.unread && !isDone(`read:${m.id}`);
  const unreadCount = messages.filter(isUnread).length;

  // First message to show: a cross-link target, else the one open before leaving the Inbox,
  // else (lg only) the newest unread.
  const [boot] = useState<{ id: string | null; open: boolean; auto: boolean }>(() => {
    const linked = focusId ? messages.find((m) => m.id === focusId) : undefined;
    if (linked) return { id: linked.id, open: true, auto: false };
    const kept = lastOpen;
    if (kept && kept.nicheId === nicheId && messages.some((m) => m.id === kept.id)) return { id: kept.id, open: kept.open, auto: false };
    if (typeof window !== "undefined" && readLg()) {
      const first = messages.find(isUnread) ?? messages[0];
      if (first) return { id: first.id, open: false, auto: true };
    }
    return { id: null, open: false, auto: false };
  });
  const [selectedId, setSelectedId] = useState<string | null>(boot.id);
  const [readerOpen, setReaderOpen] = useState(boot.open);
  const [filter, setFilter] = useState<Filter>("all");
  // The Unread view keeps what was unread when it was chosen, so a row never vanishes under the pointer.
  const [snapshot, setSnapshot] = useState<readonly string[]>([]);
  const [, rerender] = useState(0);
  const focusRequest = useRef<FocusRequest>(null);
  const autoId = useRef(boot.auto ? boot.id : null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement>());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paneRef = useRef<HTMLDivElement>(null);
  const listHeadingId = useId();
  const readerId = useId();

  const openMessage = (id: string) => {
    autoId.current = null;
    setSelectedId(id);
    setReaderOpen(true);
    markDone(`read:${id}`);
    focusRequest.current = { kind: "heading" };
    rerender((n) => n + 1);
  };

  const returnToList = () => {
    if (!selectedId) return;
    if (!isLg) setReaderOpen(false);
    focusRequest.current = { kind: "row", id: selectedId };
    rerender((n) => n + 1);
  };

  const chooseFilter = (next: Filter) => {
    if (next === "all" && filter === "all") return;
    const unreadIds = messages.filter(isUnread).map((m) => m.id);
    if (next === "unread") setSnapshot(unreadIds);
    setFilter(next);
    announce(
      next === "all"
        ? fill(COPY.showingAll[locale], { n: messages.length })
        : fill(COPY.showingUnread[locale], { n: unreadIds.length }),
    );
  };

  const markAllRead = () => {
    const ids = messages.filter(isUnread).map((m) => m.id);
    if (!ids.length) return;
    autoId.current = null;
    ids.forEach((id) => markDone(`read:${id}`));
    announce(COPY.allMarkedRead[locale]);
  };

  // Move focus after the render that opened / closed something (heading on open, row on return).
  useEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    if (request.kind === "heading") {
      if (isLg && paneRef.current) paneRef.current.scrollTop = 0;
      headingRef.current?.focus({ preventScroll: isLg });
      // Unpinned laptops: the pane itself may sit under the sticky header.
      if (isLg) revealInPage(headingRef.current, pinned);
    } else {
      rowRefs.current.get(request.id)?.focus();
    }
  });

  // Cross-links from other sections: setView("inbox", "<inboxId>") opens that message.
  useEffect(() => {
    if (!focusId || !messages.some((m) => m.id === focusId)) return;
    clearFocus();
    openMessage(focusId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  // Remember the open message for a return visit; a different industry starts fresh.
  useEffect(() => {
    lastOpen = selectedId ? { nicheId, id: selectedId, open: readerOpen } : lastOpen?.nicheId === nicheId ? lastOpen : null;
  }, [nicheId, selectedId, readerOpen]);

  // The message opened for the visitor on lg counts as read after a beat (like a desktop mail client).
  useEffect(() => {
    const id = autoId.current;
    if (!id || selectedId !== id) return;
    const timer = window.setTimeout(() => {
      autoId.current = null;
      markDone(`read:${id}`);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [selectedId, markDone]);

  const visible = filter === "all" ? messages : messages.filter((m) => snapshot.includes(m.id));
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-3 pt-2 sm:px-3 sm:pt-3 lg:pt-2.5">
        <ViewHeader
          title={COPY.title[locale]}
          subtitle={COPY.subtitle[locale]}
          actions={
            <button type="button" onClick={() => setView("settings", "notifications")} className={ACTION_SECONDARY}>
              <Bell aria-hidden="true" size={15} strokeWidth={1.75} className="text-aqua" />
              {COPY.alertSettings[locale]}
            </button>
          }
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-1.5 sm:gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[minmax(0,1fr)]">
        {/* ── Message list ── */}
        <div className={`${CARD_FLUSH} flex min-h-0 flex-col ${readerOpen ? "max-lg:hidden" : ""}`}>
          <h4 id={listHeadingId} className="sr-only">
            {COPY.messages[locale]}
          </h4>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-2.5 py-2">
            <div role="group" aria-label={COPY.filterLabel[locale]} className="flex items-center gap-1.5">
              <FilterPill on={filter === "all"} label={COPY.all[locale]} count={messages.length} onPress={() => chooseFilter("all")} />
              <FilterPill on={filter === "unread"} label={COPY.unread[locale]} count={unreadCount} onPress={() => chooseFilter("unread")} />
            </div>
            <button
              type="button"
              onClick={markAllRead}
              aria-disabled={unreadCount === 0 || undefined}
              className={`${PILL} ${
                unreadCount === 0 ? "cursor-default text-ash/70" : "text-ash hover:bg-white/[0.06] hover:text-bone"
              }`}
            >
              <CheckCheck aria-hidden="true" size={14} strokeWidth={1.9} />
              {COPY.markAllRead[locale]}
            </button>
          </div>

          <div className={`min-h-0 flex-1 p-1.5 lg:overflow-y-auto ${SCROLLBAR}`}>
            {visible.length ? (
              <ul role="list" aria-labelledby={listHeadingId} className="space-y-0.5">
                {visible.map((m) => (
                  <li key={m.id}>
                    <MessageRow
                      m={m}
                      unread={isUnread(m)}
                      selected={m.id === selectedId}
                      status={messageState(m, isDone, data).status}
                      controls={readerId}
                      onOpen={() => openMessage(m.id)}
                      buttonRef={(el) => {
                        if (el) rowRefs.current.set(m.id, el);
                        else rowRefs.current.delete(m.id);
                      }}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyUnread onShowAll={() => chooseFilter("all")} />
            )}
          </div>
        </div>

        {/* ── Reading pane ── */}
        <div id={readerId} className={`${CARD_FLUSH} flex min-h-0 flex-col ${readerOpen ? "" : "max-lg:hidden"}`}>
          <div ref={paneRef} className={`min-h-0 flex-1 lg:overflow-y-auto ${SCROLLBAR}`}>
            {selected ? (
              <Reader
                key={selected.id}
                m={selected}
                data={data}
                nicheId={nicheId}
                owner={OWNER[nicheId]}
                business={niche.simulator.business}
                isLg={isLg}
                headingRef={headingRef}
                paneRef={paneRef}
                onBack={returnToList}
              />
            ) : (
              <NoSelection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- list parts ------------------------------- */

function FilterPill({ on, label, count, onPress }: { on: boolean; label: string; count: number; onPress: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onPress} className={`${PILL} ${on ? PILL_ON : PILL_OFF}`}>
      {label}
      <span className={`tabular text-[0.75rem] ${on ? "text-ink/70" : "text-ash"}`}>{count}</span>
    </button>
  );
}

function KindChip({ kind }: { kind: InboxKind }) {
  const { locale } = useLanguage();
  const Icon = KIND_ICON[kind];
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium leading-4 text-bone/85 ring-1 ring-inset ring-white/15">
      <Icon aria-hidden="true" size={11} strokeWidth={2} className="text-aqua" />
      {KIND_LABEL[kind][locale]}
    </span>
  );
}

/** Initials for a person; a kind icon for SermaWebDesign's own alerts. */
function SenderMark({ m }: { m: InboxMessage }) {
  if (!isAlert(m)) return <Avatar name={m.from} />;
  const Icon = KIND_ICON[m.kind];
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/[0.12] text-aqua ring-1 ring-inset ring-aqua/25"
    >
      <Icon size={15} strokeWidth={1.75} />
    </span>
  );
}

function MessageRow({
  m,
  unread,
  selected,
  status,
  controls,
  onOpen,
  buttonRef,
}: {
  m: InboxMessage;
  unread: boolean;
  selected: boolean;
  status: L10n | null;
  controls: string;
  onOpen: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const { locale } = useLanguage();
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onOpen}
      aria-current={selected ? "true" : undefined}
      aria-controls={controls}
      className={`${ROW} flex w-full items-start gap-2.5 py-2.5 pl-2 pr-3 text-left focus-visible:outline-offset-[-2px] ${
        selected ? ROW_SELECTED : ""
      }`}
    >
      {/* Unread dot: decorative; the word "Unread" is in the accessible name. */}
      <span aria-hidden="true" className="mt-[13px] grid h-2 w-2 shrink-0 place-items-center">
        <AnimatePresence initial={false}>
          {unread ? (
            <motion.span
              key="dot"
              className="h-2 w-2 rounded-full bg-aqua shadow-[0_0_8px_rgba(61,219,201,0.65)]"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
            />
          ) : null}
        </AnimatePresence>
      </span>
      <SenderMark m={m} />
      <span className="min-w-0 flex-1">
        {unread ? <span className="sr-only">{COPY.unreadOne[locale]}, </span> : null}
        <span className="flex items-baseline justify-between gap-3">
          <span className={`truncate text-[0.8125rem] leading-5 ${unread ? "font-semibold text-bone" : "font-medium text-bone/80"}`}>
            {m.from}
          </span>
          <span className="tabular shrink-0 text-[0.6875rem] leading-5 text-ash">{m.received[locale]}</span>
        </span>
        {/* Below xl, up to 2 lines: alerts share one sender, so the subject is what tells rows apart on narrow lists.
            xl+ (incl. the pinned stage) keeps 1 line so all five rows fit the pane without scrolling. */}
        <span className={`line-clamp-2 text-sm leading-5 xl:line-clamp-1 ${unread ? "font-semibold text-bone" : "text-bone/90"}`}>
          {m.subject[locale]}
        </span>
        <span className="mt-1 flex min-w-0 items-center gap-1.5">
          <KindChip kind={m.kind} />
          {status ? <StatusChip tone="live">{status[locale]}</StatusChip> : null}
          <span className="min-w-0 flex-1 truncate text-[0.8125rem] leading-5 text-ash">{m.preview[locale]}</span>
        </span>
      </span>
    </button>
  );
}

function EmptyUnread({ onShowAll }: { onShowAll: () => void }) {
  const { locale } = useLanguage();
  return (
    <motion.div
      className="flex flex-col items-center px-6 py-10 text-center"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
    >
      <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-aqua/[0.1] text-aqua ring-1 ring-inset ring-aqua/25">
        <CheckCheck size={18} strokeWidth={1.75} />
      </span>
      <p className="mt-3 text-sm font-medium text-bone">{COPY.caughtUp[locale]}</p>
      <p className="mt-1 max-w-[17rem] text-[0.8125rem] leading-snug text-ash">{COPY.caughtUpBody[locale]}</p>
      <button type="button" onClick={onShowAll} className={`${PILL} ${PILL_OFF} mt-4`}>
        {COPY.showAll[locale]}
      </button>
    </motion.div>
  );
}

function NoSelection() {
  const { locale } = useLanguage();
  return (
    <div className="flex h-full min-h-[16rem] flex-col items-center justify-center px-6 py-10 text-center">
      <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-ash ring-1 ring-inset ring-white/10">
        <MailOpen size={18} strokeWidth={1.75} />
      </span>
      <p className="mt-3 text-sm font-medium text-bone">{COPY.pickTitle[locale]}</p>
      <p className="mt-1 text-[0.8125rem] text-ash">{COPY.pickBody[locale]}</p>
    </div>
  );
}

/* ------------------------------ reading pane ------------------------------ */

type Reveal = "chips" | "receipt" | "thread" | null;

function Reader({
  m,
  data,
  nicheId,
  owner,
  business,
  isLg,
  headingRef,
  paneRef,
  onBack,
}: {
  m: InboxMessage;
  data: NicheViews;
  nicheId: NicheId;
  owner: string;
  business: string;
  isLg: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  paneRef: RefObject<HTMLDivElement | null>;
  onBack: () => void;
}) {
  const { locale, intlLocale } = useLanguage();
  const { isDone, markDone, announce, setView } = useDashboardView();
  const state = messageState(m, isDone, data);
  const replies = m.email.quickReplies ?? [];
  const [repliesOpen, setRepliesOpen] = useState(false);
  // Only animate things revealed in this visit; persisted ones simply render.
  const [fresh, setFresh] = useState<{ receipt?: boolean; reply?: number }>({});
  const pendingReveal = useRef<Reveal>(null);
  const replyButtonRef = useRef<HTMLButtonElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLElement>(null);
  const threadRef = useRef<HTMLElement>(null);
  const threadHeadingRef = useRef<HTMLHeadingElement>(null);
  const chipsId = useId();

  const lead = findMentioned(data.leads, (l) => l.name, m);
  const review = findMentioned(data.reviews.items, (r) => r.author, m);
  const contact = isAlert(m) ? (lead?.name ?? COPY.theClient[locale]) : m.from;
  const incoming = m.email.paragraphs.find((p) => isQuote(p.en)) ?? (isQuote(m.preview.en) ? m.preview : undefined);
  const details = m.email.details ?? [];
  const hasReceipt = slotOf(m, "receipt") !== undefined;
  // Texted from Leads instead of a quick reply: the thread shows that text.
  const leadText = state.fromLeads && lead ? leadTextMessage(lead, nicheId, business, data, locale, intlLocale) : null;
  // A reply to the text-back also counts as texting that lead (Leads status + sidebar badge read text:<leadId>).
  const markLeadTexted = () => {
    if (lead) markDone(`text:${lead.id}`);
  };

  // After a reveal renders: bring it into view inside the pane (and move focus to the sent thread).
  useEffect(() => {
    const reveal = pendingReveal.current;
    if (!reveal) return;
    pendingReveal.current = null;
    const el = reveal === "chips" ? chipsRef.current : reveal === "receipt" ? receiptRef.current : threadRef.current;
    if (reveal === "thread") threadHeadingRef.current?.focus({ preventScroll: isLg });
    // Wait a frame so the entering element has its layout box (not cancelled: a re-render
    // in between, e.g. from announce(), must not swallow the scroll).
    window.requestAnimationFrame(() => revealInPane(paneRef.current, el));
  });

  const run = (slot: Slot, b: EmailButton) => {
    const key = slotKey(m, slot);
    switch (b.action) {
      case "confirm":
        markDone(confirmKey(m));
        markDone(key);
        announce(`${b.done[locale]}. ${COPY.confirmNote[locale]}`);
        return;
      case "acknowledge":
        markDone(key);
        announce(b.done[locale]);
        return;
      case "receipt":
        markDone(key);
        setFresh((f) => ({ ...f, receipt: true }));
        pendingReveal.current = "receipt";
        announce(b.done[locale]);
        return;
      case "quickReply": {
        if (!replies.length) {
          markDone(key);
          markLeadTexted();
          announce(b.done[locale]);
          return;
        }
        const next = !repliesOpen;
        setRepliesOpen(next);
        if (next) {
          pendingReveal.current = "chips";
          announce(fill(COPY.repliesShown[locale], { n: replies.length }));
        }
        return;
      }
      case "openCalendar":
        markDone(key);
        announce(b.done[locale]);
        setView("calendar", m.email.calendarEventId);
        return;
      case "openReviews":
        markDone(key);
        announce(b.done[locale]);
        setView("reviews", review?.id);
        return;
      case "openLeads":
        markDone(key);
        announce(b.done[locale]);
        setView("leads", lead?.id);
        return;
    }
  };

  const sendReply = (index: number) => {
    markDone(`qr:${m.id}:${index}`);
    const slot = slotOf(m, "quickReply");
    if (slot) markDone(slotKey(m, slot));
    markLeadTexted();
    setRepliesOpen(false);
    setFresh((f) => ({ ...f, reply: index }));
    pendingReveal.current = "thread";
    announce(fill(COPY.replySent[locale], { name: contact }).replace(/\.\./g, ".")); // "Kim T." + "." → one period
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    if (repliesOpen) {
      setRepliesOpen(false);
      replyButtonRef.current?.focus();
      return;
    }
    onBack();
  };

  return (
    <motion.div
      className="pb-4 sm:pb-5"
      onKeyDown={onKeyDown}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
    >
      {/* ── Message header ── */}
      <div className="px-3 pt-2 sm:px-5 lg:pt-4">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 mb-2 inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-medium text-bone hover:bg-white/[0.06] lg:hidden"
        >
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.9} />
          {COPY.back[locale]}
        </button>
        <div className="flex flex-wrap items-center gap-1.5">
          <KindChip kind={m.kind} />
          {state.status ? <StatusChip tone="live">{state.status[locale]}</StatusChip> : null}
        </div>
        <h4
          ref={headingRef}
          tabIndex={-1}
          className="mt-2.5 font-display text-[1.1875rem] leading-[1.25] tracking-[-0.02em] text-bone"
        >
          {m.subject[locale]}
        </h4>
        <div className="mt-3 flex items-start gap-3 border-b border-white/[0.06] pb-4">
          <SenderMark m={m} />
          <div className="min-w-0 flex-1 text-[0.8125rem] leading-5">
            <p className="text-bone">
              <span className="font-semibold">{m.from}</span>{" "}
              <span className="block text-ash [overflow-wrap:anywhere] sm:inline">&lt;{m.fromEmail}&gt;</span>
            </p>
            <p className="text-ash">
              {COPY.to[locale]}: {owner} ({COPY.you[locale]})
            </p>
          </div>
          <p className="tabular max-w-[40%] shrink-0 text-right text-xs leading-5 text-ash">
            <span className="sr-only">{COPY.received[locale]}: </span>
            {stamp(m.received, locale)}
          </p>
        </div>
      </div>

      {/* ── The email ── */}
      <div
        className={`mx-3 mt-4 rounded-[14px] ${EMAIL_BG} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),0_18px_40px_-24px_rgba(0,0,0,0.9)] sm:mx-5`}
      >
        {/* Brand strip: ink on aqua is 11.3:1. */}
        <div className="flex items-center justify-between gap-3 rounded-t-[14px] bg-[linear-gradient(90deg,#2FCBB9_0%,#3DDBC9_45%,#6FE9DA_100%)] px-4 py-2 text-ink sm:px-6">
          <span className="inline-flex items-center gap-1.5 font-display text-[0.8125rem] tracking-[-0.01em]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ink" />
            SermaWebDesign
          </span>
          <span className="truncate text-[0.6875rem] font-medium text-ink/75">{business}</span>
        </div>

        <div className="px-4 pb-5 pt-5 sm:px-6">
          <p className="text-[0.9375rem] font-medium text-bone">{m.email.greeting[locale]}</p>
          {m.email.paragraphs.map((p, i) =>
            isQuote(p.en) ? (
              <blockquote key={i} className="mt-3 border-l-2 border-aqua/60 pl-3 text-sm italic leading-relaxed text-bone">
                {p[locale]}
              </blockquote>
            ) : (
              <p key={i} className="mt-3 text-sm leading-relaxed text-bone/85">
                {p[locale]}
              </p>
            ),
          )}

          {details.length ? (
            hasReceipt ? (
              <PaymentSummary m={m} />
            ) : m.kind === "system" ? (
              <StatGrid details={details} />
            ) : (
              <DetailsCard kind={m.kind} details={details} />
            )
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {SLOTS.map((slot) => {
              const b = m.email[slot];
              if (!b) return null;
              return (
                <ActionButton
                  key={slot}
                  b={b}
                  variant={slot}
                  done={state.slotDone(slot)}
                  expanded={b.action === "quickReply" ? repliesOpen : undefined}
                  controls={chipsId}
                  buttonRef={b.action === "quickReply" ? replyButtonRef : undefined}
                  onPress={() => run(slot, b)}
                />
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {repliesOpen && !state.replied ? (
              <motion.div
                key="chips"
                ref={chipsRef}
                id={chipsId}
                className="mt-4"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
              >
                <p id={`${chipsId}-label`} className="text-[0.75rem] leading-4 text-ash">
                  {COPY.pickReply[locale]}
                </p>
                <ul role="list" aria-labelledby={`${chipsId}-label`} className="mt-2 space-y-1.5">
                  {replies.map((r, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.05, ease: EASE_EDITORIAL }}
                    >
                      <button
                        type="button"
                        onClick={() => sendReply(i)}
                        className="group flex min-h-[44px] w-full items-center gap-3 rounded-[14px] bg-white/[0.05] px-3.5 py-2.5 text-left text-[0.8125rem] leading-snug text-bone shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-transform duration-200 ease-editorial hover:-translate-y-px hover:bg-aqua/[0.08] hover:shadow-[inset_0_0_0_1px_rgba(61,219,201,0.45)] active:scale-[0.99]"
                      >
                        <span className="flex-1">
                          {r[locale]}
                          <span className="sr-only"> ({COPY.sendThis[locale]})</span>
                        </span>
                        <Send aria-hidden="true" size={14} strokeWidth={1.9} className="shrink-0 text-aqua" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {state.confirmed ? (
            <motion.p
              className="mt-3 flex items-start gap-2 text-[0.8125rem] leading-snug text-ash"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            >
              <Check aria-hidden="true" size={14} strokeWidth={2.25} className="mt-0.5 shrink-0 text-live" />
              {COPY.confirmNote[locale]}
            </motion.p>
          ) : null}

          {state.receiptShown ? <ReceiptCard m={m} business={business} animate={Boolean(fresh.receipt)} sectionRef={receiptRef} /> : null}

          <p className="mt-6 text-sm text-bone/85">{m.email.signoff[locale]}</p>
        </div>

        <div className="border-t border-white/[0.06] px-4 py-3 text-[0.6875rem] leading-4 text-ash sm:px-6">
          {COPY.footer[locale]}{" "}
          <button
            type="button"
            onClick={() => setView("settings", "notifications")}
            className="font-medium text-aqua underline decoration-aqua/40 underline-offset-2 hover:decoration-aqua"
          >
            {COPY.settings[locale]}
          </button>
          . {COPY.footerDemo[locale]}
        </div>
      </div>

      {/* ── Text thread (after a quick reply is sent, or the lead was texted from Leads) ── */}
      {state.sent.length > 0 || leadText ? (
        <section ref={threadRef} aria-labelledby={`${chipsId}-thread`} className="mx-3 mt-5 sm:mx-5">
          <h5
            id={`${chipsId}-thread`}
            ref={threadHeadingRef}
            tabIndex={-1}
            className="flex items-center gap-2 text-[0.75rem] font-medium text-ash"
          >
            <MessageSquareText aria-hidden="true" size={14} strokeWidth={1.9} className="text-aqua" />
            {fill(COPY.thread[locale], { name: contact })}
          </h5>
          <ol role="list" className="mt-3 space-y-3">
            {incoming ? (
              <li className="flex flex-col items-start">
                <p className="max-w-[85%] rounded-[18px] rounded-bl-[6px] bg-white/[0.08] px-3.5 py-2 text-sm leading-snug text-bone shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  <span className="sr-only">{fill(COPY.theySaid[locale], { name: contact, time: m.received[locale] })} </span>
                  {unquote(incoming[locale])}
                </p>
                <p aria-hidden="true" className="mt-1 px-1 text-[0.6875rem] text-ash">
                  {contact} · {m.received[locale]}
                </p>
              </li>
            ) : null}
            {state.sent.map((i) => (
              <motion.li
                key={i}
                className="flex flex-col items-end"
                style={{ transformOrigin: "100% 100%" }}
                initial={fresh.reply === i ? { opacity: 0, y: 10, scale: 0.97 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
              >
                <p className="max-w-[85%] rounded-[18px] rounded-br-[6px] bg-[linear-gradient(180deg,#6FE9DA_0%,#3DDBC9_100%)] px-3.5 py-2 text-sm leading-snug text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_20px_-12px_rgba(61,219,201,0.6)]">
                  <span className="sr-only">{COPY.youSent[locale]} </span>
                  {replies[i]?.[locale]}
                </p>
                <p aria-hidden="true" className="mt-1 inline-flex items-center gap-1 px-1 text-[0.6875rem] text-ash">
                  {COPY.youJustNow[locale]} ·
                  <CheckCheck size={12} strokeWidth={2} className="text-aqua" />
                  {COPY.sentDemo[locale]}
                </p>
              </motion.li>
            ))}
            {leadText ? (
              <li className="flex flex-col items-end">
                <p className="max-w-[85%] rounded-[18px] rounded-br-[6px] bg-[linear-gradient(180deg,#6FE9DA_0%,#3DDBC9_100%)] px-3.5 py-2 text-sm leading-snug text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_20px_-12px_rgba(61,219,201,0.6)]">
                  <span className="sr-only">{COPY.youSentFromLeads[locale]} </span>
                  {leadText}
                </p>
                <p aria-hidden="true" className="mt-1 inline-flex items-center gap-1 px-1 text-[0.6875rem] text-ash">
                  {COPY.youJustNow[locale]} ·
                  <CheckCheck size={12} strokeWidth={2} className="text-aqua" />
                  {COPY.sentFromLeads[locale]}
                </p>
              </li>
            ) : null}
          </ol>
        </section>
      ) : null}
    </motion.div>
  );
}

/** Email button. Done-able actions flip to their done label; navigation stays a working jump. */
function ActionButton({
  b,
  variant,
  done,
  expanded,
  controls,
  buttonRef,
  onPress,
}: {
  b: EmailButton;
  variant: Slot;
  done: boolean;
  expanded?: boolean;
  controls: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onPress: () => void;
}) {
  const { locale } = useLanguage();
  const Icon = ACTION_ICON[b.action];
  const base = variant === "primary" ? ACTION_PRIMARY : ACTION_SECONDARY;
  const icon = <Icon aria-hidden="true" size={15} strokeWidth={1.9} />;

  if (isNav(b.action)) {
    return (
      <button type="button" onClick={onPress} className={base}>
        {icon}
        {b.label[locale]}
        <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.9} className="-mr-0.5 opacity-70" />
      </button>
    );
  }
  if (b.action === "quickReply" && !done) {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={onPress}
        aria-expanded={expanded}
        aria-controls={expanded ? controls : undefined}
        className={base}
      >
        {icon}
        {b.label[locale]}
        <ChevronDown
          aria-hidden="true"
          size={14}
          strokeWidth={2}
          className={`-mr-0.5 transition-transform duration-300 ease-editorial ${expanded ? "rotate-180" : ""}`}
        />
      </button>
    );
  }
  return <DoneButton label={b.label[locale]} doneLabel={b.done[locale]} done={done} onPress={onPress} variant={variant} icon={icon} />;
}

/* --------------------------- email body blocks ---------------------------- */

type Details = NonNullable<InboxMessage["email"]["details"]>;

/** Dashed tear line with ticket notches cut in the email paper colour. */
function Perforation() {
  return (
    <div aria-hidden="true" className="relative h-0 border-t border-dashed border-white/[0.12]">
      <span className={`absolute -left-[7px] -top-[7px] h-3.5 w-3.5 rounded-full ${EMAIL_BG} shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)]`} />
      <span className={`absolute -right-[7px] -top-[7px] h-3.5 w-3.5 rounded-full ${EMAIL_BG} shadow-[inset_1px_0_0_rgba(255,255,255,0.08)]`} />
    </div>
  );
}

function Stars({ value }: { value: string }) {
  const n = Number(value.trim().charAt(0));
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return (
    <span aria-hidden="true" className="mr-1.5 inline-flex translate-y-[1px] gap-0.5 text-aqua">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={11} strokeWidth={1.75} fill={i < n ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

/** Booking-card style facts table. */
function DetailsCard({ kind, details }: { kind: InboxKind; details: Details }) {
  const { locale } = useLanguage();
  const Icon = KIND_ICON[kind];
  const id = useId();
  return (
    <section aria-labelledby={id} className="relative mt-5 rounded-[12px] bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <Icon aria-hidden="true" size={14} strokeWidth={1.9} className="text-aqua" />
        <h5 id={id} className="text-[0.75rem] font-medium text-ash">
          {DETAIL_TITLE[kind][locale]}
        </h5>
      </div>
      <Perforation />
      <dl className="divide-y divide-white/[0.05] px-4 py-1">
        {details.map((d, i) => (
          <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2">
            <dt className="text-[0.8125rem] text-ash">{d.label[locale]}</dt>
            <dd className="ml-auto text-right text-[0.8125rem] font-medium text-bone">
              {/rating/i.test(d.label.en) ? <Stars value={d.value.en} /> : null}
              {d.value[locale]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Weekly summary numbers as small stat tiles. */
function StatGrid({ details }: { details: Details }) {
  const { locale } = useLanguage();
  const id = useId();
  return (
    <section aria-labelledby={id} className="mt-5">
      <h5 id={id} className="flex items-center gap-2 text-[0.75rem] font-medium text-ash">
        <ChartColumn aria-hidden="true" size={14} strokeWidth={1.9} className="text-aqua" />
        {DETAIL_TITLE.system[locale]}
      </h5>
      <dl className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {details.map((d, i) => (
          <div
            key={i}
            className="flex flex-col-reverse justify-end rounded-[12px] bg-white/[0.04] px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
          >
            <dt className="mt-1 text-[0.75rem] leading-4 text-ash">{d.label[locale]}</dt>
            <dd className="tabular font-display text-lg leading-tight tracking-[-0.02em] text-bone">{d.value[locale]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Payment hero in the email body; the itemized receipt opens below the buttons. */
function PaymentSummary({ m }: { m: InboxMessage }) {
  const { locale } = useLanguage();
  const details = m.email.details ?? [];
  const total = details[findTotal(details)];
  const number = details[findNumber(details)];
  const card = details.find((d) => /card|paid with/i.test(d.label.en));
  const meta = [total?.label[locale], number?.value[locale], card?.value[locale]].filter(Boolean).join(" · ");
  return (
    <div className="mt-5 flex items-center gap-3.5 rounded-[12px] bg-white/[0.04] px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-live/[0.12] text-live ring-1 ring-inset ring-live/30">
        <CreditCard size={17} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.75rem] leading-4 text-ash">{COPY.paymentReceived[locale]}</p>
        {total ? (
          <p className="tabular mt-0.5 font-display text-2xl leading-tight tracking-[-0.03em] text-bone">{total.value[locale]}</p>
        ) : null}
        {meta ? <p className="mt-0.5 text-[0.75rem] leading-4 text-ash">{meta}</p> : null}
      </div>
    </div>
  );
}

/** Itemized receipt with a printed-line reveal and a total line. */
function ReceiptCard({
  m,
  business,
  animate,
  sectionRef,
}: {
  m: InboxMessage;
  business: string;
  animate: boolean;
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const { locale } = useLanguage();
  const id = useId();
  const details = m.email.details ?? [];
  const ti = findTotal(details);
  const ni = findNumber(details);
  const total = details[ti];
  const number = details[ni];
  const lines = details.filter((_, i) => i !== ti && i !== ni);
  const showSubLabel = total && !/^total/i.test(total.label.en);
  const item = {
    hidden: { opacity: 0, y: -4 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_EDITORIAL } },
  };

  return (
    <motion.section
      ref={sectionRef}
      aria-labelledby={id}
      className="relative mt-4 rounded-[12px] bg-white/[0.05] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09),0_14px_30px_-20px_rgba(0,0,0,0.9)]"
      initial={animate ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
    >
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua/[0.12] text-aqua ring-1 ring-inset ring-aqua/25">
            <Receipt size={15} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h5 id={id} className="text-sm font-semibold text-bone">
              {COPY.receipt[locale]}
              {number ? <span className="tabular whitespace-nowrap font-medium text-ash"> {number.value[locale]}</span> : null}
            </h5>
            <p className="truncate text-[0.75rem] text-ash">{business}</p>
          </div>
        </div>
        <StatusChip tone="live">{COPY.paid[locale]}</StatusChip>
      </div>
      <Perforation />
      <motion.dl
        className="px-4 pb-3.5 pt-2"
        initial={animate ? "hidden" : false}
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
      >
        {lines.map((d, i) => (
          <motion.div key={i} variants={item} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-1.5">
            <dt className="text-[0.8125rem] text-ash">{d.label[locale]}</dt>
            <dd className="tabular ml-auto text-right text-[0.8125rem] font-medium text-bone">{d.value[locale]}</dd>
          </motion.div>
        ))}
        {total ? (
          <motion.div
            variants={item}
            className="mt-2 flex items-end justify-between gap-4 border-t border-dashed border-white/[0.14] pt-3"
          >
            <dt>
              <span className="block text-sm font-semibold text-bone">{COPY.totalPaid[locale]}</span>
              {showSubLabel ? <span className="block text-[0.75rem] text-ash">{total.label[locale]}</span> : null}
            </dt>
            <dd className="tabular font-display text-2xl leading-none tracking-[-0.03em] text-bone">{total.value[locale]}</dd>
          </motion.div>
        ) : null}
      </motion.dl>
    </motion.section>
  );
}
