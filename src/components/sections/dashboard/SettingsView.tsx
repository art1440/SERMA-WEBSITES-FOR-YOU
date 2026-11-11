"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BellRing,
  Check,
  Clock3,
  Info,
  Languages,
  LayoutGrid,
  MessageSquareText,
  Minus,
  PhoneMissed,
  Plus,
  Save,
  ShieldCheck,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import type { Niche, NicheId } from "@/data/niches";
import { fill, type L10n, type Locale } from "@/i18n/types";
import { formatCurrency } from "@/lib/format";
import { EASE_EDITORIAL, SPRING_SNAPPY } from "@/lib/motion";
import { useDashboardView } from "./DashboardViewContext";
import {
  ACTION_SECONDARY,
  CARD,
  DoneButton,
  PILL,
  PILL_OFF,
  PILL_ON,
  ROW,
  StatusChip,
  ViewHeader,
  formatClock,
  revealInPage,
} from "./ui";

/* ------------------------------------------------------------------ *
 * Settings: believable, working settings for the demo business.
 *
 * lg+: two columns of cards scroll inside the locked plate; the header
 *      and the save bar stay put. <lg: one column at natural height and
 *      the save bar sticks to the bottom of the screen while in view.
 *
 * Every control only changes local state. "Save changes" copies the
 * draft into an in-memory snapshot and marks `settings:saved`; any later
 * change re-arms it. The snapshot lives in a module variable (memory
 * only, gone on reload) so the settings survive switching sections, and
 * resets when the industry changes. Nothing is sent, fetched or stored.
 * ------------------------------------------------------------------ */

const COPY = {
  title: { en: "Settings", es: "Ajustes" },
  subtitle: { en: "{business} · Alerts, text-back, deposits and hours", es: "{business} · Alertas, texto automático, depósitos y horario" },
  on: { en: "On", es: "Activado" },
  off: { en: "Off", es: "Desactivado" },

  notifTitle: { en: "Notifications", es: "Notificaciones" },
  notifBody: { en: "How and when we let you know.", es: "Cómo y cuándo le avisamos." },
  emailLabel: { en: "Email alerts", es: "Alertas por correo" },
  emailBody: { en: "New bookings, payments and messages, sent to {email}.", es: "Nuevas citas, pagos y mensajes, enviados a {email}." },
  smsLabel: { en: "Text (SMS) alerts", es: "Alertas por texto (SMS)" },
  smsBody: { en: "Instant texts to {phone} when something needs you.", es: "Textos al instante al {phone} cuando algo requiera su atención." },
  summaryLabel: { en: "Daily summary at {time}", es: "Resumen diario a las {time}" },
  summaryBody: {
    en: "Tomorrow's bookings, today's deposits and new reviews in one email.",
    es: "Las citas de mañana, los depósitos de hoy y las reseñas nuevas en un solo correo.",
  },
  scopeLabel: { en: "Notify me for", es: "Notificarme sobre" },
  scopeAll: { en: "All activity", es: "Toda la actividad" },
  scopeBookings: { en: "Bookings and payments only", es: "Solo citas y pagos" },
  scopeAllHint: { en: "Bookings, payments, messages, reviews and missed calls.", es: "Citas, pagos, mensajes, reseñas y llamadas perdidas." },
  scopeBookingsHint: { en: "Messages and reviews still show in your Inbox.", es: "Los mensajes y las reseñas se siguen mostrando en su Bandeja." },
  alertsOff: {
    en: "Email and text alerts are off. Activity still shows in this dashboard.",
    es: "Las alertas por correo y por texto están desactivadas. La actividad se sigue mostrando en este panel.",
  },

  textBackTitle: { en: "Missed-call text-back", es: "Texto automático por llamada perdida" },
  textBackBody: {
    en: "When you can't pick up, the caller gets a text with your booking link.",
    es: "Si no puede contestar, quien llama recibe un texto con su enlace para agendar.",
  },
  active: { en: "Active", es: "Activo" },
  paused: { en: "Paused", es: "En pausa" },
  textBackLabel: { en: "Text back missed calls", es: "Responder llamadas perdidas por texto" },
  textBackHint: { en: "Runs 24/7, including after hours.", es: "Funciona 24/7, también fuera de horario." },
  preview: { en: "Preview", es: "Vista previa" },
  previewTo: { en: "To {phone}", es: "Para {phone}" },
  textMessage: { en: "Text message · Today", es: "Mensaje de texto · Hoy" },
  missedCall: { en: "Missed call · {time}", es: "Llamada perdida · {time}" },
  delivered: { en: "Delivered · {time}", es: "Entregado · {time}" },
  notSent: { en: "Not sent while text-back is paused", es: "No se envía mientras esté en pausa" },
  delayLabel: { en: "Reply delay", es: "Tiempo de espera" },
  delayInstant: { en: "Instantly", es: "Al instante" },
  delay1: { en: "1 min", es: "1 min" },
  delay5: { en: "5 min", es: "5 min" },
  delayInstantHint: { en: "Sent the moment the call ends.", es: "Se envía en cuanto termina la llamada." },
  delayHint: { en: "Gives you {delay} to call back yourself first.", es: "Le da {delay} para devolver la llamada usted primero." },
  oneMinute: { en: "1 minute", es: "1 minuto" },
  fiveMinutes: { en: "5 minutes", es: "5 minutos" },

  langTitle: { en: "Client messages language", es: "Idioma de los mensajes a clientes" },
  langBody: {
    en: "Texts, reminders and review requests go out in this language.",
    es: "Los textos, recordatorios y solicitudes de reseña se envían en este idioma.",
  },
  langBoth: { en: "Both", es: "Ambos" },
  langHintEn: { en: "Every client text goes out in English.", es: "Cada texto a clientes se envía en inglés." },
  langHintEs: { en: "Every client text goes out in Spanish.", es: "Cada texto a clientes se envía en español." },
  langHintBoth: { en: "Each text goes out in English, then Spanish.", es: "Cada texto se envía en inglés y luego en español." },
  langPreviewNote: { en: "The text-back preview updates to match.", es: "La vista previa del texto automático se actualiza." },

  depTitle: { en: "Deposits & reminders", es: "Depósitos y recordatorios" },
  depBody: { en: "Hold every slot and cut down on no-shows.", es: "Asegure cada horario y reduzca las inasistencias." },
  decrease: { en: "Decrease deposit by {step}", es: "Reducir el depósito en {step}" },
  increase: { en: "Increase deposit by {step}", es: "Aumentar el depósito en {step}" },
  depRange: { en: "Adjust from {min} to {max} in {step} steps.", es: "Ajústelo de {min} a {max}, en pasos de {step}." },
  depSet: { en: "Deposit set to {amount}.", es: "Depósito ajustado a {amount}." },
  depMin: { en: "The minimum deposit is {amount}.", es: "El depósito mínimo es de {amount}." },
  depMax: { en: "The maximum deposit is {amount}.", es: "El depósito máximo es de {amount}." },
  reminderLabel: { en: "Reminder texts", es: "Recordatorios por texto" },
  before: { en: "before", es: "antes" },
  reminderBoth: { en: "Both", es: "Ambos" },
  reminder24Hint: { en: "One text the day before.", es: "Un texto el día anterior." },
  reminder2Hint: { en: "One text 2 hours before.", es: "Un texto 2 horas antes." },
  reminderBothHint: { en: "A text the day before, and another 2 hours before.", es: "Un texto el día anterior y otro 2 horas antes." },
  noShowLabel: { en: "No-show policy", es: "Política de inasistencias" },
  noShowBody: {
    en: "Keep the deposit if a {who} doesn't show or cancels with less than 24 h notice.",
    es: "Se conserva el depósito si {who} no se presenta o cancela con menos de 24 h de aviso.",
  },

  modulesTitle: { en: "Active modules", es: "Módulos activos" },
  modulesBody: { en: "Turn features on or off for {business}.", es: "Active o desactive funciones para {business}." },
  modulesCount: { en: "{on} of {total} on", es: "{on} de {total} activos" },

  hoursTitle: { en: "Business hours", es: "Horario de atención" },
  hoursBody: { en: "Shown on your website and booking page.", es: "Se muestra en su sitio web y en su página para agendar." },
  readOnly: { en: "Read-only", es: "Solo lectura" },
  closed: { en: "Closed", es: "Cerrado" },
  to: { en: "to", es: "a" },

  local: { en: "Changes are local to this demo", es: "Los cambios solo aplican a esta demo" },
  unsavedOne: { en: "1 unsaved change", es: "1 cambio sin guardar" },
  unsaved: { en: "{n} unsaved changes", es: "{n} cambios sin guardar" },
  allSaved: { en: "All changes saved", es: "Todos los cambios guardados" },
  discard: { en: "Discard", es: "Descartar" },
  save: { en: "Save changes", es: "Guardar cambios" },
  saved: { en: "Saved", es: "Guardado" },
  savedAnnounce: {
    en: "Settings saved. Demo only: nothing was sent or stored.",
    es: "Ajustes guardados. Es una demo: no se envió ni almacenó nada.",
  },
  discardedAnnounce: { en: "Changes discarded.", es: "Cambios descartados." },
} satisfies Record<string, L10n>;

/* ---------------------------- Trade presets ---------------------------- */

type Trade = {
  deposit: { label: L10n; unit: L10n; note: L10n; value: number; step: number; min: number; max: number };
  /** Who the no-show policy is about ("a client", "si el cliente…"). */
  who: L10n;
  /** The automatic text. `{business}` and `{link}` are filled in. */
  textBack: L10n;
  /** Monday … Saturday, 24h "HH:MM" [open, close]. Sunday is closed. Every Calendar booking fits inside these. */
  hours: [string, string][];
};

const PER_APPOINTMENT: L10n = { en: "Per appointment", es: "Por cita" };

const TRADE: Record<NicheId, Trade> = {
  barbershop: {
    deposit: {
      label: { en: "Booking deposit", es: "Depósito de cita" },
      unit: PER_APPOINTMENT,
      note: { en: "Credited to the cut at checkout.", es: "Se descuenta del corte al pagar." },
      value: 20,
      step: 5,
      min: 5,
      max: 60,
    },
    who: { en: "client", es: "el cliente" },
    textBack: {
      en: "Hi, this is {business}. Sorry we missed your call! Grab the next open chair here: {link}, or just reply to this text.",
      es: "Hola, le escribe {business}. ¡Disculpe que no hayamos podido contestar! Agende en la próxima silla disponible aquí: {link}, o simplemente responda a este mensaje.",
    },
    hours: [
      ["08:00", "18:00"],
      ["09:00", "19:00"],
      ["08:30", "19:00"],
      ["09:00", "19:00"],
      ["09:00", "19:00"],
      ["08:00", "16:00"],
    ],
  },
  salon: {
    deposit: {
      label: { en: "Booking deposit", es: "Depósito de cita" },
      unit: PER_APPOINTMENT,
      note: { en: "Credited to the service total.", es: "Se descuenta del total del servicio." },
      value: 50,
      step: 5,
      min: 10,
      max: 150,
    },
    who: { en: "client", es: "el cliente" },
    textBack: {
      en: "Hi, this is {business}. Sorry we missed your call! See your stylist's open times and book here: {link}, or reply and we'll help.",
      es: "Hola, le escribe {business}. ¡Disculpe que no hayamos podido contestar! Vea los horarios de su estilista y agende aquí: {link}, o responda y con gusto le ayudamos.",
    },
    hours: [
      ["09:00", "18:00"],
      ["09:00", "20:00"],
      ["09:00", "20:00"],
      ["10:00", "20:00"],
      ["09:00", "19:00"],
      ["09:00", "17:00"],
    ],
  },
  beauty: {
    deposit: {
      label: { en: "Booking deposit", es: "Depósito de cita" },
      unit: PER_APPOINTMENT,
      note: { en: "Credited to the set or lash service.", es: "Se descuenta del servicio de uñas o pestañas." },
      value: 40,
      step: 5,
      min: 10,
      max: 100,
    },
    who: { en: "client", es: "el cliente" },
    textBack: {
      en: "Hi, this is {business}. Sorry we missed your call! Book your nails or lashes here: {link}, or reply with any questions.",
      es: "Hola, le escribe {business}. ¡Disculpe que no hayamos podido contestar! Agende uñas o pestañas aquí: {link}, o responda con sus preguntas.",
    },
    hours: [
      ["10:00", "19:00"],
      ["09:00", "19:00"],
      ["09:00", "19:00"],
      ["10:00", "19:00"],
      ["10:00", "19:00"],
      ["09:00", "18:00"],
    ],
  },
  restaurant: {
    deposit: {
      label: { en: "Large-party deposit", es: "Depósito para grupos grandes" },
      unit: { en: "Per guest, parties of 8+", es: "Por persona, grupos de 8 o más" },
      note: { en: "Credited to the bill.", es: "Se descuenta de la cuenta." },
      value: 20,
      step: 5,
      min: 5,
      max: 50,
    },
    who: { en: "party", es: "el grupo" },
    textBack: {
      en: "Hi, this is {business}. Sorry we missed your call! Reserve a table or order pickup here: {link}, or reply and we'll hold a spot for you.",
      es: "Hola, le escribe {business}. ¡Disculpe que no hayamos podido contestar! Reserve una mesa o pida para recoger aquí: {link}, o responda y le apartamos un lugar.",
    },
    hours: [
      ["11:00", "22:00"],
      ["11:00", "22:00"],
      ["11:00", "22:00"],
      ["11:00", "22:00"],
      ["11:00", "23:00"],
      ["10:00", "23:00"],
    ],
  },
  contractor: {
    deposit: {
      label: { en: "Site-visit deposit", es: "Depósito por visita" },
      unit: { en: "Per estimate visit", es: "Por visita de presupuesto" },
      note: { en: "Credited to the job when the estimate is signed.", es: "Se acredita al trabajo al firmar el presupuesto." },
      value: 150,
      step: 25,
      min: 50,
      max: 500,
    },
    who: { en: "customer", es: "el cliente" },
    textBack: {
      en: "Hi, this is {business}. Sorry we missed your call, we're on a job site. Request your estimate here: {link}, or reply with a few details about the project.",
      es: "Hola, le escribe {business}. Disculpe que no hayamos podido contestar; estamos en una obra. Solicite su presupuesto aquí: {link}, o responda con algunos detalles del proyecto.",
    },
    hours: [
      ["07:00", "18:00"],
      ["07:00", "18:00"],
      ["07:00", "18:00"],
      ["07:00", "18:00"],
      ["07:00", "18:00"],
      ["08:00", "12:00"],
    ],
  },
  service: {
    deposit: {
      label: { en: "Booking deposit", es: "Depósito de cita" },
      unit: { en: "Per service call", es: "Por visita de servicio" },
      note: { en: "Credited to the final invoice.", es: "Se descuenta de la factura final." },
      value: 50,
      step: 10,
      min: 20,
      max: 200,
    },
    who: { en: "customer", es: "el cliente" },
    textBack: {
      en: "Hi, this is {business}. Sorry we missed your call! Pick a service window here: {link}, or reply and a technician will text you back.",
      es: "Hola, le escribe {business}. ¡Disculpe que no hayamos podido contestar! Elija un horario de servicio aquí: {link}, o responda y un técnico le escribirá.",
    },
    hours: [
      ["08:00", "18:00"],
      ["08:00", "18:00"],
      ["08:00", "18:00"],
      ["08:00", "18:00"],
      ["08:00", "18:00"],
      ["09:00", "14:00"],
    ],
  },
};

/* ------------------------------- State -------------------------------- */

type Scope = "all" | "bookings";
type Delay = "instant" | "1m" | "5m";
type Reminder = "24h" | "2h" | "both";
type ClientLang = "en" | "es" | "both";

type Settings = {
  email: boolean;
  sms: boolean;
  summary: boolean;
  scope: Scope;
  textBack: boolean;
  delay: Delay;
  deposit: number;
  reminder: Reminder;
  noShow: boolean;
  modules: boolean[];
  clientLang: ClientLang;
};

type Snapshot = { nicheId: NicheId; draft: Settings; saved: Settings; hasSaved: boolean };

/** In-memory only (a page reload clears it): keeps the demo settings while the visitor switches sections. */
let memory: Snapshot | null = null;

function freshSnapshot(nicheId: NicheId, moduleCount: number): Snapshot {
  const defaults: Settings = {
    email: true,
    sms: true,
    summary: false,
    scope: "all",
    textBack: true,
    delay: "instant",
    deposit: TRADE[nicheId].deposit.value,
    reminder: "both",
    noShow: true,
    modules: Array.from({ length: moduleCount }, () => true),
    clientLang: "both",
  };
  return { nicheId, draft: defaults, saved: defaults, hasSaved: false };
}

function countChanges(a: Settings, b: Settings): number {
  let n = 0;
  for (const key of Object.keys(a) as (keyof Settings)[]) {
    if (key === "modules") a.modules.forEach((on, i) => (n += on !== b.modules[i] ? 1 : 0));
    else if (a[key] !== b[key]) n += 1;
  }
  return n;
}

const SECTIONS = ["notifications", "textback", "language", "deposits", "modules", "hours"] as const;
type SectionKey = (typeof SECTIONS)[number];

/** Before the demo's "now" (Monday 9:41 AM), so "Today · Missed call 8:41 AM" reads true. */
const MISSED_AT = "08:41";
const DELAY_MINUTES: Record<Delay, number> = { instant: 0, "1m": 1, "5m": 5 };

/** Fills `{business}`; a name that already ends in "." (e.g. "Northside Barber Co.") doesn't get a second one. */
function withBusiness(template: string, business: string) {
  const t = business.endsWith(".") ? template.replace(/\{business\}\./g, "{business}") : template;
  return fill(t, { business });
}

function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/* ------------------------------- View --------------------------------- */

export function SettingsView() {
  const { nicheId, niche } = useNiche();
  // Keyed by industry: every setting resets to that trade's defaults when the industry changes.
  return <SettingsBoard key={nicheId} nicheId={nicheId} niche={niche} />;
}

function SettingsBoard({ nicheId, niche }: { nicheId: NicheId; niche: Niche }) {
  const { locale, intlLocale } = useLanguage();
  const { markDone, announce, focusId, clearFocus, pinned } = useDashboardView();
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;
  const uid = useId();
  const id = (part: string) => `st${uid}${part}`;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLDivElement>(null);

  const trade = TRADE[nicheId];
  const business = niche.simulator.business;
  const slug = business.split(" ")[0].toLowerCase();
  const ownerEmail = `${slug}@example.com`;
  const ownerPhone = `${niche.simulator.callerNumber.slice(0, 5)} 555-0100`;
  const bookingLink = `book.example.com/${slug}`;

  const [snap, setSnap] = useState<Snapshot>(() =>
    memory && memory.nicheId === nicheId && memory.draft.modules.length === niche.modules.length
      ? memory
      : freshSnapshot(nicheId, niche.modules.length),
  );
  useEffect(() => {
    memory = snap;
  }, [snap]);

  const s = snap.draft;
  const changes = countChanges(s, snap.saved);
  const saved = snap.hasSaved && changes === 0;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSnap((prev) => ({ ...prev, draft: { ...prev.draft, [key]: value } }));
  const setModule = (index: number, on: boolean) =>
    setSnap((prev) => ({ ...prev, draft: { ...prev.draft, modules: prev.draft.modules.map((v, i) => (i === index ? on : v)) } }));

  const money = (v: number) => formatCurrency(v, intlLocale);
  const { min, max, step } = trade.deposit;
  const stepDeposit = (dir: 1 | -1) => {
    const next = Math.min(max, Math.max(min, s.deposit + dir * step));
    if (next === s.deposit) {
      announce(fill((dir < 0 ? COPY.depMin : COPY.depMax)[locale], { amount: money(next) }));
      return;
    }
    set("deposit", next);
    announce(fill(COPY.depSet[locale], { amount: money(next) }));
  };

  const save = () => {
    setSnap((prev) => ({ ...prev, saved: prev.draft, hasSaved: true }));
    markDone("settings:saved");
    announce(COPY.savedAnnounce[locale]);
  };
  const discard = () => {
    setSnap((prev) => ({ ...prev, draft: prev.saved }));
    announce(COPY.discardedAnnounce[locale]);
    // The Discard button disappears: keep keyboard focus on the save bar.
    requestAnimationFrame(() => saveRef.current?.querySelector("button")?.focus());
  };

  // Below lg the save bar sticks to the bottom of the screen. Reserve its height (≈84px + 12px offset)
  // so the browser scrolls a focused control clear of it (WCAG 2.4.11); restored on unmount and on lg.
  useEffect(() => {
    const root = document.documentElement;
    const lg = window.matchMedia("(min-width: 1024px)");
    const previous = root.style.scrollPaddingBottom;
    const apply = () => {
      root.style.scrollPaddingBottom = lg.matches ? previous : "7rem";
    };
    apply();
    lg.addEventListener("change", apply);
    return () => {
      lg.removeEventListener("change", apply);
      root.style.scrollPaddingBottom = previous;
    };
  }, []);

  // A cross-link may open Settings at one card (focusId = a section key): focus its heading.
  useEffect(() => {
    if (!focusId) return;
    clearFocus();
    if (!(SECTIONS as readonly string[]).includes(focusId)) return;
    const el = document.getElementById(`st${uid}${focusId}`);
    const scroller = scrollerRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    if (!window.matchMedia("(min-width: 1024px)").matches || !scroller) {
      el.closest("section")?.scrollIntoView({ block: "start" });
      return;
    }
    // FitStage may scale the window: convert screen pixels back to CSS pixels.
    const box = scroller.getBoundingClientRect();
    const scale = box.height / (scroller.offsetHeight || 1) || 1;
    const top = (el.closest("section") ?? el).getBoundingClientRect().top;
    scroller.scrollTop += (top - box.top) / scale - 8;
    // Unpinned laptops: the pane itself may sit under the sticky header or off screen.
    revealInPage(el, pinnedRef.current);
  }, [focusId, clearFocus, uid]);

  /* ---- derived copy ---- */
  const summaryTime = formatClock("19:00", intlLocale);
  const modulesOn = s.modules.filter(Boolean).length;
  const missedTime = formatClock(MISSED_AT, intlLocale);
  const sentTime = formatClock(addMinutes(MISSED_AT, DELAY_MINUTES[s.delay]), intlLocale);
  const bubbleLangs: Locale[] = s.clientLang === "both" ? ["en", "es"] : [s.clientLang];
  const weekday = new Intl.DateTimeFormat(intlLocale, { weekday: "long" });
  const dayName = (i: number) => {
    const name = weekday.format(new Date(2026, 0, 5 + i)); // 5 Jan 2026 is a Monday
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const heading = (key: SectionKey) => id(key);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-3 pt-2 sm:px-3 sm:pt-3">
        <ViewHeader title={COPY.title[locale]} subtitle={fill(COPY.subtitle[locale], { business })} />
      </div>

      <div
        ref={scrollerRef}
        // max-lg scroll-mb: focused controls stop above the sticky save bar (pairs with the scroll padding above).
        className="max-lg:[&_button]:scroll-mb-28 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[scrollbar-color:rgba(255,255,255,0.18)_transparent] lg:[scrollbar-width:thin]"
      >
        {/* grid-cols-1 = minmax(0,1fr): cards shrink to the screen instead of growing to their longest word. */}
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2 lg:grid-cols-2 lg:items-start">
          {/* ---------------- Column 1 ---------------- */}
          <div className="grid grid-cols-1 content-start gap-1.5 sm:gap-2">
            {/* Notifications */}
            <section aria-labelledby={heading("notifications")} className={CARD}>
              <CardHead id={heading("notifications")} icon={BellRing} title={COPY.notifTitle[locale]} description={COPY.notifBody[locale]} />
              <ul className="-mx-2.5 mt-2">
                <li>
                  <SwitchRow
                    id={id("email")}
                    label={COPY.emailLabel[locale]}
                    description={fill(COPY.emailBody[locale], { email: ownerEmail })}
                    checked={s.email}
                    onChange={(v) => set("email", v)}
                  />
                </li>
                <li>
                  <SwitchRow
                    id={id("sms")}
                    label={COPY.smsLabel[locale]}
                    description={fill(COPY.smsBody[locale], { phone: ownerPhone })}
                    checked={s.sms}
                    onChange={(v) => set("sms", v)}
                  />
                </li>
                <li>
                  <SwitchRow
                    id={id("summary")}
                    label={fill(COPY.summaryLabel[locale], { time: summaryTime })}
                    description={COPY.summaryBody[locale]}
                    checked={s.summary}
                    onChange={(v) => set("summary", v)}
                  />
                </li>
              </ul>
              <Divider />
              <p id={id("scope")} className="text-[0.8125rem] font-medium text-bone">
                {COPY.scopeLabel[locale]}
              </p>
              <div role="group" aria-labelledby={id("scope")} aria-describedby={id("scope-hint")} className="mt-2 flex flex-wrap gap-1.5">
                {(["all", "bookings"] as const).map((value) => {
                  const on = s.scope === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("scope", value)}
                      className={`${PILL} ${on ? PILL_ON : PILL_OFF} transition-transform duration-200 ease-editorial active:scale-[0.97]`}
                    >
                      {on ? <Check aria-hidden="true" size={13} strokeWidth={2.5} /> : null}
                      {(value === "all" ? COPY.scopeAll : COPY.scopeBookings)[locale]}
                    </button>
                  );
                })}
              </div>
              <p id={id("scope-hint")} className="mt-2 text-xs leading-snug text-ash">
                {(s.scope === "all" ? COPY.scopeAllHint : COPY.scopeBookingsHint)[locale]}
              </p>
              <AnimatePresence initial={false}>
                {!s.email && !s.sms ? (
                  <motion.p
                    key="alerts-off"
                    className="mt-2.5 flex items-start gap-2 rounded-[10px] bg-white/[0.04] px-2.5 py-2 text-xs leading-snug text-bone/90 shadow-[inset_2px_0_0_rgba(229,88,42,0.75)]"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
                  >
                    <Info aria-hidden="true" size={14} strokeWidth={2} className="mt-px shrink-0 text-signal" />
                    {COPY.alertsOff[locale]}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </section>

            {/* Missed-call text-back */}
            <section aria-labelledby={heading("textback")} className={CARD}>
              <CardHead
                id={heading("textback")}
                icon={MessageSquareText}
                title={COPY.textBackTitle[locale]}
                description={COPY.textBackBody[locale]}
                aside={
                  s.textBack ? (
                    <StatusChip tone="live">{COPY.active[locale]}</StatusChip>
                  ) : (
                    <StatusChip tone="neutral">{COPY.paused[locale]}</StatusChip>
                  )
                }
              />
              <div className="-mx-2.5 mt-2">
                <SwitchRow
                  id={id("textback-switch")}
                  label={COPY.textBackLabel[locale]}
                  description={COPY.textBackHint[locale]}
                  checked={s.textBack}
                  onChange={(v) => set("textBack", v)}
                />
              </div>

              <figure
                aria-labelledby={id("preview")}
                className="mt-2 rounded-[14px] bg-black/25 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07),inset_0_1px_2px_rgba(0,0,0,0.3)]"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <figcaption id={id("preview")} className="text-xs font-medium text-bone">
                    {COPY.preview[locale]}
                    <span className="font-normal text-ash"> · {fill(COPY.previewTo[locale], { phone: niche.simulator.callerNumber })}</span>
                  </figcaption>
                  <span className="text-[0.6875rem] text-ash">{COPY.textMessage[locale]}</span>
                </div>
                <p className="mx-auto mt-2.5 flex w-fit items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[0.6875rem] font-medium text-bone/85">
                  <PhoneMissed aria-hidden="true" size={12} strokeWidth={2.25} className="text-signal" />
                  {fill(COPY.missedCall[locale], { time: missedTime })}
                </p>
                <div className="mt-2.5 flex flex-col items-end gap-1.5">
                  {bubbleLangs.map((lang, i) => (
                    <motion.p
                      key={`${lang}-${s.textBack ? "on" : "off"}`}
                      lang={lang}
                      className={`max-w-[92%] rounded-[18px] rounded-br-[6px] px-3.5 py-2.5 text-[0.8125rem] leading-snug sm:max-w-[86%] ${
                        s.textBack
                          ? "bg-[linear-gradient(180deg,#F3EDE1_0%,#E8DFCF_60%,#E8DFCF_100%)] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_6px_16px_-10px_rgba(61,219,201,0.7)]"
                          : "border border-dashed border-white/20 bg-white/[0.04] text-bone/85"
                      }`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE_EDITORIAL, delay: i * 0.06 }}
                    >
                      <BubbleText template={withBusiness(trade.textBack[lang], business)} link={bookingLink} />
                    </motion.p>
                  ))}
                  <p className="inline-flex items-center gap-1 text-[0.6875rem] text-ash">
                    {s.textBack ? (
                      <>
                        <Check aria-hidden="true" size={12} strokeWidth={2.5} className="text-aqua" />
                        {fill(COPY.delivered[locale], { time: sentTime })}
                      </>
                    ) : (
                      COPY.notSent[locale]
                    )}
                  </p>
                </div>
              </figure>

              <Divider />
              <p id={id("delay")} className="text-[0.8125rem] font-medium text-bone">
                {COPY.delayLabel[locale]}
              </p>
              <Segmented
                className="mt-2"
                labelledBy={id("delay")}
                describedBy={id("delay-hint")}
                value={s.delay}
                onChange={(v) => set("delay", v)}
                options={[
                  { value: "instant", label: COPY.delayInstant[locale] },
                  { value: "1m", label: COPY.delay1[locale] },
                  { value: "5m", label: COPY.delay5[locale] },
                ]}
              />
              <p id={id("delay-hint")} className="mt-2 text-xs leading-snug text-ash">
                {s.delay === "instant"
                  ? COPY.delayInstantHint[locale]
                  : fill(COPY.delayHint[locale], { delay: (s.delay === "1m" ? COPY.oneMinute : COPY.fiveMinutes)[locale] })}
              </p>
            </section>

            {/* Client messages language */}
            <section aria-labelledby={heading("language")} className={CARD}>
              <CardHead id={heading("language")} icon={Languages} title={COPY.langTitle[locale]} description={COPY.langBody[locale]} />
              <Segmented
                className="mt-3"
                labelledBy={heading("language")}
                describedBy={id("lang-hint")}
                value={s.clientLang}
                onChange={(v) => set("clientLang", v)}
                options={[
                  { value: "en", label: "English", lang: "en" },
                  { value: "es", label: "Español", lang: "es" },
                  { value: "both", label: COPY.langBoth[locale] },
                ]}
              />
              <p id={id("lang-hint")} className="mt-2 text-xs leading-snug text-ash">
                {(s.clientLang === "en" ? COPY.langHintEn : s.clientLang === "es" ? COPY.langHintEs : COPY.langHintBoth)[locale]}{" "}
                {COPY.langPreviewNote[locale]}
              </p>
            </section>
          </div>

          {/* ---------------- Column 2 ---------------- */}
          <div className="grid grid-cols-1 content-start gap-1.5 sm:gap-2">
            {/* Deposits & reminders */}
            <section aria-labelledby={heading("deposits")} className={CARD}>
              <CardHead id={heading("deposits")} icon={ShieldCheck} title={COPY.depTitle[locale]} description={COPY.depBody[locale]} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
                <div className="min-w-0">
                  <p id={id("deposit")} className="text-[0.8125rem] font-medium text-bone">
                    {trade.deposit.label[locale]}
                  </p>
                  <p className="mt-0.5 text-xs text-ash">{trade.deposit.unit[locale]}</p>
                </div>
                <div
                  role="group"
                  aria-labelledby={id("deposit")}
                  className="flex items-center gap-1 rounded-full bg-black/25 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_2px_rgba(0,0,0,0.35)]"
                >
                  <StepButton
                    label={fill(COPY.decrease[locale], { step: money(step) })}
                    describedBy={id("deposit-value")}
                    atBound={s.deposit <= min}
                    onPress={() => stepDeposit(-1)}
                    icon={Minus}
                  />
                  <span id={id("deposit-value")} className="relative grid min-w-[4.75rem] place-items-center overflow-hidden">
                    <motion.span
                      key={s.deposit}
                      className="tabular font-display text-xl leading-none tracking-[-0.02em] text-bone"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
                    >
                      {money(s.deposit)}
                    </motion.span>
                  </span>
                  <StepButton
                    label={fill(COPY.increase[locale], { step: money(step) })}
                    describedBy={id("deposit-value")}
                    atBound={s.deposit >= max}
                    onPress={() => stepDeposit(1)}
                    icon={Plus}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs leading-snug text-ash">
                {trade.deposit.note[locale]} {fill(COPY.depRange[locale], { min: money(min), max: money(max), step: money(step) })}
              </p>

              <Divider />
              <p id={id("reminder")} className="text-[0.8125rem] font-medium text-bone">
                {COPY.reminderLabel[locale]}
              </p>
              <Segmented
                className="mt-2"
                labelledBy={id("reminder")}
                describedBy={id("reminder-hint")}
                value={s.reminder}
                onChange={(v) => set("reminder", v)}
                options={[
                  { value: "24h", label: <HoursBefore hours="24" before={COPY.before[locale]} /> },
                  { value: "2h", label: <HoursBefore hours="2" before={COPY.before[locale]} /> },
                  { value: "both", label: COPY.reminderBoth[locale] },
                ]}
              />
              <p id={id("reminder-hint")} className="mt-2 text-xs leading-snug text-ash">
                {(s.reminder === "24h" ? COPY.reminder24Hint : s.reminder === "2h" ? COPY.reminder2Hint : COPY.reminderBothHint)[locale]}
              </p>

              <Divider />
              <div className="-mx-2.5 -mb-1">
                <SwitchRow
                  id={id("noshow")}
                  label={COPY.noShowLabel[locale]}
                  description={fill(COPY.noShowBody[locale], { who: trade.who[locale] })}
                  checked={s.noShow}
                  onChange={(v) => set("noShow", v)}
                />
              </div>
            </section>

            {/* Active modules */}
            <section aria-labelledby={heading("modules")} className={CARD}>
              <CardHead
                id={heading("modules")}
                icon={LayoutGrid}
                title={COPY.modulesTitle[locale]}
                description={withBusiness(COPY.modulesBody[locale], business)}
                aside={
                  <StatusChip tone={modulesOn === niche.modules.length ? "aqua" : "neutral"}>
                    {fill(COPY.modulesCount[locale], { on: modulesOn, total: niche.modules.length })}
                  </StatusChip>
                }
              />
              <ul className="-mx-2.5 -mb-1 mt-2">
                {niche.modules.map((mod, i) => (
                  <li key={mod.name.en}>
                    <SwitchRow
                      id={id(`module-${i}`)}
                      label={mod.name[locale]}
                      description={mod.detail[locale]}
                      checked={s.modules[i] ?? true}
                      onChange={(v) => setModule(i, v)}
                    />
                  </li>
                ))}
              </ul>
            </section>

            {/* Business hours */}
            <section aria-labelledby={heading("hours")} className={CARD}>
              <CardHead
                id={heading("hours")}
                icon={Clock3}
                title={COPY.hoursTitle[locale]}
                description={COPY.hoursBody[locale]}
                aside={<StatusChip tone="neutral">{COPY.readOnly[locale]}</StatusChip>}
              />
              <dl className="mt-2.5 divide-y divide-white/[0.06]">
                {trade.hours.map(([open, close], i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-[0.4375rem] text-[0.8125rem]">
                    <dt className="text-bone/90">{dayName(i)}</dt>
                    <dd className="tabular text-right text-bone">
                      {formatClock(open, intlLocale)}
                      <span aria-hidden="true" className="text-ash">
                        {" – "}
                      </span>
                      <span className="sr-only"> {COPY.to[locale]} </span>
                      {formatClock(close, intlLocale)}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 py-[0.4375rem] text-[0.8125rem]">
                  <dt className="text-bone/90">{dayName(6)}</dt>
                  <dd className="text-ash">{COPY.closed[locale]}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>

      {/* ---------------- Save bar ---------------- */}
      <div className="z-10 mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-glass-sm bg-[#17253B] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_0_0_1px_rgba(255,255,255,0.06),0_-12px_28px_-14px_rgba(0,0,0,0.75)] max-lg:sticky max-lg:bottom-3 sm:mt-2 sm:pl-4">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs leading-snug text-ash">
          {changes > 0 ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-bone">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_0_3px_rgba(61,219,201,0.18)]" />
              {changes === 1 ? COPY.unsavedOne[locale] : fill(COPY.unsaved[locale], { n: changes })}
            </span>
          ) : saved ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-bone">
              <Check aria-hidden="true" size={13} strokeWidth={2.5} className="text-aqua" />
              {COPY.allSaved[locale]}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Info aria-hidden="true" size={13} strokeWidth={2} />
            {COPY.local[locale]}
          </span>
        </p>
        <div className="flex items-center gap-2 max-sm:w-full">
          {changes > 0 ? (
            <button type="button" onClick={discard} className={`${ACTION_SECONDARY} max-sm:flex-1`}>
              <Undo2 aria-hidden="true" size={15} strokeWidth={2} />
              {COPY.discard[locale]}
            </button>
          ) : null}
          <div ref={saveRef} className="contents">
            <DoneButton
              label={COPY.save[locale]}
              doneLabel={COPY.saved[locale]}
              done={saved}
              onPress={save}
              icon={<Save aria-hidden="true" size={15} strokeWidth={2} />}
              className="max-sm:flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Building blocks --------------------------- */

function CardHead({
  id,
  icon: Icon,
  title,
  description,
  aside,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-white/[0.06] text-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      >
        <Icon size={16} strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        {/* The status chip rides on the title line (wraps under it on narrow cards). */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4 id={id} tabIndex={-1} className="rounded-md text-sm font-medium leading-snug text-bone focus-visible:[outline-offset:2px]">
            {title}
          </h4>
          {aside}
        </div>
        {description ? <p className="mt-0.5 text-xs leading-snug text-ash">{description}</p> : null}
      </div>
    </div>
  );
}

function Divider() {
  return <div aria-hidden="true" className="my-3 h-px bg-white/[0.07]" />;
}

/**
 * A full-width settings row that is itself the switch: label and description
 * on the left, a 44×26 capsule on the right. The whole row is the touch target.
 */
function SwitchRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const { locale } = useLanguage();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onClick={() => onChange(!checked)}
      className={`${ROW} flex min-h-[52px] w-full items-center gap-3 px-2.5 py-2 text-left`}
    >
      <span className="min-w-0 flex-1">
        <span id={`${id}-label`} className="block text-[0.8125rem] font-medium leading-snug text-bone [overflow-wrap:anywhere]">
          {label}
        </span>
        {description ? (
          <span id={`${id}-desc`} className="mt-0.5 block text-xs leading-snug text-ash">
            {description}
          </span>
        ) : null}
      </span>
      <Toggle on={checked} locale={locale} />
    </button>
  );
}

/**
 * The switch capsule. State reads from the thumb position and the On/Off word, not colour alone.
 * Both words sit in one grid cell (only the current one visible), so the column is as wide as the
 * longer word ("Off" / "Desactivado") and the switch never shifts when it flips.
 * Forced colors: the track gets a CanvasText border and the thumb a CanvasText fill.
 */
function Toggle({ on, locale }: { on: boolean; locale: Locale }) {
  return (
    // Under 360px (e.g. 400% zoom) the word sits under the capsule so long Spanish labels still fit.
    <span
      aria-hidden="true"
      className="flex shrink-0 flex-col-reverse items-end gap-1 min-[360px]:flex-row min-[360px]:items-center min-[360px]:gap-2"
    >
      <span className={`grid text-right text-[0.6875rem] font-medium ${on ? "text-aqua" : "text-ash"}`}>
        <span className={`col-start-1 row-start-1 ${on ? "" : "invisible"}`}>{COPY.on[locale]}</span>
        <span className={`col-start-1 row-start-1 ${on ? "invisible" : ""}`}>{COPY.off[locale]}</span>
      </span>
      <span className="relative block h-[26px] w-[44px] rounded-full bg-white/[0.1] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),inset_0_1px_2px_rgba(0,0,0,0.4)] forced-colors:border forced-colors:border-[CanvasText]">
        <span
          className={`absolute inset-0 rounded-full bg-[linear-gradient(180deg,#F3EDE1_0%,#E8DFCF_55%,#C9B893_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_0_14px_-3px_rgba(61,219,201,0.6)] transition-opacity duration-200 ease-editorial ${
            on ? "opacity-100" : "opacity-0"
          }`}
        />
        <motion.span
          className="absolute left-[3px] top-[3px] block h-5 w-5 rounded-full bg-bone shadow-[0_1px_2px_rgba(0,0,0,0.45),0_3px_8px_-2px_rgba(0,0,0,0.45)] [forced-color-adjust:none] forced-colors:bg-[CanvasText]"
          initial={false}
          animate={{ x: on ? 18 : 0 }}
          transition={SPRING_SNAPPY}
        />
      </span>
    </span>
  );
}

/**
 * Equal-width segmented capsules (aria-pressed); the aqua indicator slides via transform.
 * Forced colors: the indicator keeps a Highlight fill and the pressed label turns HighlightText.
 */
function Segmented<T extends string>({
  labelledBy,
  describedBy,
  value,
  options,
  onChange,
  className,
}: {
  labelledBy: string;
  describedBy?: string;
  value: T;
  options: { value: T; label: ReactNode; lang?: string }[];
  onChange: (next: T) => void;
  className?: string;
}) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={`relative grid w-full rounded-full bg-black/25 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_2px_rgba(0,0,0,0.35)] sm:max-w-sm ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <motion.span
        aria-hidden="true"
        className="absolute bottom-1 left-1 top-1 rounded-full bg-aqua shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_14px_-6px_rgba(61,219,201,0.75)] [forced-color-adjust:none] forced-colors:bg-[Highlight]"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})` }}
        initial={false}
        animate={{ x: `${index * 100}%` }}
        transition={SPRING_SNAPPY}
      />
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            lang={o.lang}
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`relative min-h-[36px] whitespace-nowrap rounded-full px-1.5 text-[0.75rem] font-medium leading-tight sm:px-2 sm:text-[0.8125rem] ${
              // No backplate on the pressed label, so HighlightText sits on the Highlight indicator (as in LanguageToggle).
              on ? "text-ink forced-colors:text-[HighlightText] forced-colors:[forced-color-adjust:none]" : "text-bone/90 hover:bg-white/[0.06]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** "24 h" on screen, "24 h before" for screen readers (the name still starts with the visible text). */
function HoursBefore({ hours, before }: { hours: string; before: string }) {
  return (
    <>
      {hours} h<span className="sr-only"> {before}</span>
    </>
  );
}

function StepButton({
  label,
  describedBy,
  atBound,
  onPress,
  icon: Icon,
}: {
  label: string;
  describedBy: string;
  atBound: boolean;
  onPress: () => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-describedby={describedBy}
      // aria-disabled (not disabled) keeps focus on the button at the limit; pressing it announces the bound.
      aria-disabled={atBound || undefined}
      onClick={onPress}
      className={`grid h-11 w-11 place-items-center rounded-full transition-transform duration-200 ease-editorial ${
        atBound
          ? "cursor-not-allowed text-bone/35 forced-colors:text-[GrayText]"
          : "bg-white/[0.07] text-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.1)] hover:bg-white/[0.12] active:scale-[0.94]"
      }`}
    >
      <Icon aria-hidden="true" size={16} strokeWidth={2.25} />
    </button>
  );
}

/** The automatic text, with the booking link styled as a link (it is plain text: nothing to open). */
function BubbleText({ template, link }: { template: string; link: string }) {
  const [before, after = ""] = template.split("{link}");
  return (
    <>
      {before}
      <span className="font-medium underline decoration-1 underline-offset-2">{link}</span>
      {after}
    </>
  );
}
