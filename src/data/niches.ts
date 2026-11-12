import type { L10n } from "@/i18n/types";
import { asset } from "@/lib/asset";

/**
 * Illustrative dataset for the interactive Client Dashboard showcase.
 * Every number here is SIMULATED demo data (see the FTC disclaimer rendered
 * under each interactive widget) — not a client result or a performance claim.
 */

export type NicheId = "barbershop" | "salon" | "beauty" | "restaurant" | "contractor" | "service";

export type MetricFormat = "number" | "currency" | "percent" | "seconds";

export type Kpi = {
  label: L10n;
  value: number;
  format: MetricFormat;
  delta: L10n;
};

export type StreamEvent = {
  text: L10n;
  amount?: number;
  minutesAgo: number;
};

export type Niche = {
  id: NicheId;
  label: L10n;
  shortLabel: L10n;
  tagline: L10n;
  media: { src: string; poster: string; alt: L10n };
  modules: { name: L10n; detail: L10n }[];
  kpis: [Kpi, Kpi, Kpi, Kpi];
  /** Weekly booked revenue (USD), oldest → newest. */
  weekly: number[];
  pipeline: { stage: L10n; count: number }[];
  stream: StreamEvent[];
  simulator: {
    business: string;
    caller: string;
    callerNumber: string;
    service: L10n;
    time: L10n;
    amount: number;
    earlier: { name: string; service: L10n; amount: number }[];
  };
  calculator: { missedCalls: number; avgTicket: number; bookingRate: number };
};

export const NICHES: Niche[] = [
  {
    id: "barbershop",
    label: { en: "Barbershops", es: "Barberías" },
    shortLabel: { en: "Barbers", es: "Barberías" },
    tagline: { en: "Chairs full. No-shows covered.", es: "Sillas llenas. Inasistencias cubiertas." },
    media: {
      src: asset("/media/barbershop"),
      poster: asset("/media/barbershop-poster.jpg"),
      alt: {
        en: "A barber fades the side of a client's head with clippers and a comb, hair clippings falling.",
        es: "Un barbero hace un degradado en el costado de la cabeza de un cliente con máquina y peine; caen recortes de cabello.",
      },
    },
    modules: [
      { name: { en: "Per-Chair Bookings", es: "Citas por Silla" }, detail: { en: "Each barber's chair has its own live calendar.", es: "Cada silla tiene su propio calendario en vivo." } },
      { name: { en: "No-Show Deposit Protection", es: "Protección con Depósito contra Inasistencias" }, detail: { en: "Card-on-file deposits hold every slot.", es: "Un depósito con tarjeta asegura cada horario." } },
      { name: { en: "VIP Cut Reminders", es: "Recordatorios VIP de Corte" }, detail: { en: "Regulars get nudged on their own cut cycle.", es: "Los clientes frecuentes reciben aviso según su ciclo de corte." } },
      { name: { en: "Chair Utilization %", es: "% de Ocupación por Silla" }, detail: { en: "See which chairs and hours sit empty.", es: "Vea qué sillas y horarios quedan vacíos." } },
    ],
    kpis: [
      { label: { en: "Bookings per chair / wk", es: "Citas por silla / sem" }, value: 38, format: "number", delta: { en: "+12%", es: "+12%" } },
      { label: { en: "No-show deposits held", es: "Depósitos contra inasistencias" }, value: 1240, format: "currency", delta: { en: "+$310", es: "+$310" } },
      { label: { en: "VIP cut reminders sent", es: "Recordatorios VIP enviados" }, value: 214, format: "number", delta: { en: "+38", es: "+38" } },
      { label: { en: "Chair utilization", es: "Ocupación de sillas" }, value: 87, format: "percent", delta: { en: "+9 pts", es: "+9 pts" } },
    ],
    weekly: [3100, 3600, 3400, 4200, 4000, 4800, 5100, 5600],
    pipeline: [
      { stage: { en: "Requested", es: "Solicitadas" }, count: 64 },
      { stage: { en: "Deposit paid", es: "Depósito pagado" }, count: 51 },
      { stage: { en: "In the chair", es: "En la silla" }, count: 44 },
      { stage: { en: "Re-booked", es: "Reagendadas" }, count: 29 },
    ],
    stream: [
      { text: { en: "Marcus R. booked Skin Fade · Chair 1 · Andre", es: "Marcus R. agendó Skin Fade · Silla 1 · Andre" }, amount: 45, minutesAgo: 2 },
      { text: { en: "No-show deposit captured", es: "Depósito por inasistencia cobrado" }, amount: 20, minutesAgo: 14 },
      { text: { en: "VIP reminder sent to Dre T. (3-week cycle)", es: "Recordatorio VIP enviado a Dre T. (ciclo de 3 sem)" }, minutesAgo: 31 },
      { text: { en: "Missed call → text-back → Classic Cut booked", es: "Llamada perdida → texto automático → cita de Corte clásico" }, amount: 40, minutesAgo: 48 },
    ],
    simulator: {
      business: "Northside Barber Co.",
      caller: "Marcus",
      callerNumber: "(312) 555-0142",
      service: { en: "Skin Fade with Andre", es: "Skin Fade con Andre" },
      time: { en: "today, 3:30 PM", es: "hoy, 3:30 PM" },
      amount: 45,
      earlier: [
        { name: "Luis G.", service: { en: "Cut + Beard", es: "Corte + Barba" }, amount: 60 },
        { name: "Tyrell W.", service: { en: "Line-up", es: "Perfilado" }, amount: 20 },
      ],
    },
    calculator: { missedCalls: 12, avgTicket: 40, bookingRate: 35 },
  },
  {
    id: "salon",
    label: { en: "Salons", es: "Salones" },
    shortLabel: { en: "Salons", es: "Salones" },
    tagline: { en: "Every stylist booked, every color on cycle.", es: "Cada estilista ocupado, cada color a tiempo." },
    media: {
      src: asset("/media/salon"),
      poster: asset("/media/salon-poster.jpg"),
      alt: {
        en: "A stylist blow-dries a client's long hair with a round brush, the strands lifting and flowing.",
        es: "Una estilista seca el cabello largo de una clienta con cepillo redondo; los mechones se elevan y fluyen.",
      },
    },
    modules: [
      { name: { en: "Stylist Chair Schedules", es: "Agenda por Estilista" }, detail: { en: "Every stylist's book, color-coded and live.", es: "La agenda de cada estilista, en vivo y por colores." } },
      { name: { en: "Color & Treatment Packages", es: "Paquetes de Color y Tratamiento" }, detail: { en: "Sell multi-session packages online.", es: "Venda paquetes de varias sesiones en línea." } },
      { name: { en: "Automated Re-booking Reminders", es: "Recordatorios Automáticos de Nueva Cita" }, detail: { en: "Timed to each client's color cycle.", es: "Sincronizados con el ciclo de color de cada cliente." } },
    ],
    kpis: [
      { label: { en: "Stylist chairs booked", es: "Sillas de estilistas ocupadas" }, value: 91, format: "percent", delta: { en: "+7 pts", es: "+7 pts" } },
      { label: { en: "Color packages sold", es: "Paquetes de color vendidos" }, value: 46, format: "number", delta: { en: "+11", es: "+11" } },
      { label: { en: "Re-booking rate", es: "Tasa de nueva cita" }, value: 68, format: "percent", delta: { en: "+14 pts", es: "+14 pts" } },
      { label: { en: "Average ticket", es: "Ticket promedio" }, value: 142, format: "currency", delta: { en: "+$18", es: "+$18" } },
    ],
    weekly: [8200, 9100, 8800, 10400, 11000, 10700, 12300, 13100],
    pipeline: [
      { stage: { en: "Consult requested", es: "Consulta solicitada" }, count: 48 },
      { stage: { en: "Booked", es: "Agendada" }, count: 41 },
      { stage: { en: "Serviced", es: "Atendida" }, count: 37 },
      { stage: { en: "Re-booked", es: "Reagendada" }, count: 25 },
    ],
    stream: [
      { text: { en: "Sofia L. booked Balayage + Gloss with Jenna", es: "Sofia L. agendó Balayage + Gloss con Jenna" }, amount: 240, minutesAgo: 4 },
      { text: { en: "Re-booking reminder sent (5-week color cycle)", es: "Recordatorio enviado (ciclo de color de 5 sem)" }, minutesAgo: 18 },
      { text: { en: "Keratin package sold — 3 sessions", es: "Paquete de keratina vendido — 3 sesiones" }, amount: 810, minutesAgo: 37 },
      { text: { en: "Missed call → text-back → Blowout booked", es: "Llamada perdida → texto automático → cita de Brushing" }, amount: 55, minutesAgo: 52 },
    ],
    simulator: {
      business: "Atelier Salon",
      caller: "Sofia",
      callerNumber: "(305) 555-0177",
      service: { en: "Balayage + Gloss with Jenna", es: "Balayage + Gloss con Jenna" },
      time: { en: "Thursday, 11:00 AM", es: "jueves, 11:00 AM" },
      amount: 240,
      earlier: [
        { name: "Priya N.", service: { en: "Root touch-up", es: "Retoque de raíz" }, amount: 95 },
        { name: "Elena V.", service: { en: "Blowout", es: "Brushing" }, amount: 55 },
      ],
    },
    calculator: { missedCalls: 10, avgTicket: 140, bookingRate: 30 },
  },
  {
    id: "beauty",
    label: { en: "Beauty & Nails", es: "Belleza y Uñas" },
    shortLabel: { en: "Beauty", es: "Belleza" },
    tagline: { en: "Sets, lashes, and deposits — handled.", es: "Uñas, pestañas y depósitos, resueltos." },
    media: {
      src: asset("/media/beauty"),
      poster: asset("/media/beauty-poster.jpg"),
      alt: {
        en: "Close-up of a nail technician painting a glossy coat of polish onto a client's fingernail.",
        es: "Primer plano de una técnica de uñas aplicando una capa de esmalte brillante en la uña de una clienta.",
      },
    },
    modules: [
      { name: { en: "Technician Calendars", es: "Calendarios por Técnico" }, detail: { en: "Each tech's availability, synced live.", es: "La disponibilidad de cada técnico, en vivo." } },
      { name: { en: "Set & Lash Bookings", es: "Citas de Uñas y Pestañas" }, detail: { en: "Full sets, fills, and lash services online.", es: "Juegos completos, rellenos y pestañas en línea." } },
      { name: { en: "Deposit Tracking", es: "Control de Depósitos" }, detail: { en: "Every deposit tied to its appointment.", es: "Cada depósito vinculado a su cita." } },
      { name: { en: "VIP Client Reactivation", es: "Reactivación de Clientes VIP" }, detail: { en: "Win back regulars who've gone quiet.", es: "Recupere a clientes frecuentes que dejaron de venir." } },
    ],
    kpis: [
      { label: { en: "Set & lash bookings", es: "Citas de uñas y pestañas" }, value: 186, format: "number", delta: { en: "+22", es: "+22" } },
      { label: { en: "Deposits tracked", es: "Depósitos registrados" }, value: 2180, format: "currency", delta: { en: "+$420", es: "+$420" } },
      { label: { en: "VIP clients reactivated", es: "Clientes VIP reactivados" }, value: 27, format: "number", delta: { en: "+9", es: "+9" } },
      { label: { en: "Technician utilization", es: "Ocupación de técnicos" }, value: 84, format: "percent", delta: { en: "+6 pts", es: "+6 pts" } },
    ],
    weekly: [5400, 5900, 6300, 6100, 7200, 7800, 7500, 8600],
    pipeline: [
      { stage: { en: "Inquiry", es: "Consulta" }, count: 72 },
      { stage: { en: "Deposit paid", es: "Depósito pagado" }, count: 58 },
      { stage: { en: "Completed", es: "Completada" }, count: 53 },
      { stage: { en: "Fill booked", es: "Relleno agendado" }, count: 34 },
    ],
    stream: [
      { text: { en: "Imani J. booked Brow Lamination with Vanessa", es: "Imani J. agendó Laminado de cejas con Vanessa" }, amount: 75, minutesAgo: 3 },
      { text: { en: "Deposit received — Lash Lift", es: "Depósito recibido — Lifting de pestañas" }, amount: 40, minutesAgo: 11 },
      { text: { en: "VIP win-back text sent to 12 clients (60+ days)", es: "Mensaje VIP enviado a 12 clientes (60+ días)" }, minutesAgo: 26 },
      { text: { en: "Missed call → text-back → Lash Fill booked", es: "Llamada perdida → texto automático → Relleno de pestañas" }, amount: 65, minutesAgo: 44 },
    ],
    simulator: {
      business: "Lacquer Studio",
      caller: "Ana",
      callerNumber: "(713) 555-0128",
      service: { en: "Gel-X Full Set with Mia", es: "Juego Gel-X con Mia" },
      time: { en: "Saturday, 10:15 AM", es: "sábado, 10:15 AM" },
      amount: 85,
      earlier: [
        { name: "Kayla S.", service: { en: "Classic lash fill", es: "Relleno clásico" }, amount: 65 },
        { name: "Mariela C.", service: { en: "Gel manicure", es: "Manicura en gel" }, amount: 45 },
      ],
    },
    calculator: { missedCalls: 14, avgTicket: 70, bookingRate: 35 },
  },
  {
    id: "restaurant",
    label: { en: "Restaurants", es: "Restaurantes" },
    shortLabel: { en: "Restaurants", es: "Restaurantes" },
    tagline: { en: "Your orders, your tables, your guests.", es: "Sus pedidos, sus mesas, sus comensales." },
    media: {
      src: asset("/media/restaurant"),
      poster: asset("/media/restaurant-poster.jpg"),
      alt: {
        en: "A chef drizzles sauce over a plated fish while a pan flares and steams behind.",
        es: "Un chef vierte salsa sobre un pescado emplatado mientras detrás un sartén se enciende y humea.",
      },
    },
    modules: [
      { name: { en: "Commission-Free Online Orders", es: "Pedidos en Línea sin Comisiones" }, detail: { en: "Direct ordering from your own site.", es: "Pedidos directos desde su propio sitio." } },
      { name: { en: "Table Reservations", es: "Reservaciones de Mesa" }, detail: { en: "Party size, time, and notes — confirmed by text.", es: "Personas, hora y notas, confirmadas por texto." } },
      { name: { en: "VIP SMS Club Broadcasts", es: "Club VIP por SMS" }, detail: { en: "Opt-in specials that fill slow nights.", es: "Promociones con suscripción para llenar noches lentas." } },
    ],
    kpis: [
      { label: { en: "Direct online orders", es: "Pedidos directos en línea" }, value: 642, format: "number", delta: { en: "+18%", es: "+18%" } },
      { label: { en: "Commissions avoided", es: "Comisiones evitadas" }, value: 4820, format: "currency", delta: { en: "+$760", es: "+$760" } },
      { label: { en: "Table reservations", es: "Reservaciones de mesa" }, value: 318, format: "number", delta: { en: "+41", es: "+41" } },
      { label: { en: "VIP SMS club members", es: "Miembros del club VIP por SMS" }, value: 1460, format: "number", delta: { en: "+126", es: "+126" } },
    ],
    weekly: [14200, 15800, 15100, 17600, 18400, 17900, 20200, 21500],
    pipeline: [
      { stage: { en: "Orders placed", es: "Pedidos recibidos" }, count: 642 },
      { stage: { en: "Prepared", es: "Preparados" }, count: 628 },
      { stage: { en: "Picked up", es: "Entregados" }, count: 611 },
      { stage: { en: "Ordered again", es: "Volvieron a pedir" }, count: 274 },
    ],
    stream: [
      { text: { en: "Online order #1042 — 2× Short Rib, 1× Burrata", es: "Pedido #1042 — 2× Short Rib, 1× Burrata" }, amount: 86, minutesAgo: 1 },
      { text: { en: "Table for 4 reserved — Fri 7:30 PM", es: "Mesa para 4 reservada — vie 7:30 PM" }, minutesAgo: 9 },
      { text: { en: "VIP Club broadcast sent to 1,460 members", es: "Mensaje del Club VIP enviado a 1,460 miembros" }, minutesAgo: 22 },
      { text: { en: "Missed call → text-back → party of 6 booked", es: "Llamada perdida → texto automático → mesa para 6" }, amount: 270, minutesAgo: 41 },
    ],
    simulator: {
      business: "Brasa Kitchen",
      caller: "Daniel",
      callerNumber: "(213) 555-0164",
      service: { en: "Table for 4", es: "Mesa para 4" },
      time: { en: "Friday, 7:30 PM", es: "viernes, 7:30 PM" },
      amount: 180,
      earlier: [
        { name: "Grace H.", service: { en: "Pickup order", es: "Pedido para recoger" }, amount: 64 },
        { name: "Omar F.", service: { en: "Table for 2", es: "Mesa para 2" }, amount: 95 },
      ],
    },
    calculator: { missedCalls: 25, avgTicket: 55, bookingRate: 40 },
  },
  {
    id: "contractor",
    label: { en: "Contractors", es: "Contratistas" },
    shortLabel: { en: "Contractors", es: "Contratistas" },
    tagline: { en: "Every missed call is a quote you lost.", es: "Cada llamada perdida es una cotización perdida." },
    media: {
      src: asset("/media/contractor"),
      poster: asset("/media/contractor-poster.jpg"),
      alt: {
        en: "A carpenter guides a circular saw through a board at dusk, sawdust flying, a timber-framed house behind.",
        es: "Un carpintero corta una tabla con sierra circular al anochecer, con aserrín en el aire y una casa en construcción detrás.",
      },
    },
    modules: [
      { name: { en: "Missed-Call Instant Quote Recovery", es: "Recuperación Inmediata de Cotizaciones" }, detail: { en: "Callers get a quote-request link in seconds.", es: "Quien llama recibe al instante un enlace para cotizar." } },
      { name: { en: "Estimate Pipeline", es: "Embudo de Presupuestos" }, detail: { en: "From site visit to signed estimate.", es: "De la visita al presupuesto firmado." } },
      { name: { en: "Dispatched Jobs", es: "Trabajos Asignados" }, detail: { en: "Crews, addresses, and status in one view.", es: "Cuadrillas, direcciones y estado en una sola vista." } },
      { name: { en: "High-Ticket Lead Tracking", es: "Seguimiento de Prospectos de Alto Valor" }, detail: { en: "Big jobs get followed up first.", es: "Los trabajos grandes se atienden primero." } },
    ],
    kpis: [
      { label: { en: "Quote requests recovered", es: "Cotizaciones recuperadas" }, value: 23, format: "number", delta: { en: "+8", es: "+8" } },
      { label: { en: "Open estimate value", es: "Presupuestos abiertos" }, value: 186400, format: "currency", delta: { en: "+$41.2k", es: "+$41.2k" } },
      { label: { en: "Jobs dispatched", es: "Trabajos asignados" }, value: 41, format: "number", delta: { en: "+6", es: "+6" } },
      { label: { en: "High-ticket leads (> $10k)", es: "Prospectos de más de $10k" }, value: 9, format: "number", delta: { en: "+3", es: "+3" } },
    ],
    weekly: [22000, 31000, 27000, 38000, 35000, 44000, 41000, 52000],
    pipeline: [
      { stage: { en: "New lead", es: "Nuevo prospecto" }, count: 58 },
      { stage: { en: "Site visit", es: "Visita al sitio" }, count: 34 },
      { stage: { en: "Estimate sent", es: "Presupuesto enviado" }, count: 26 },
      { stage: { en: "Won", es: "Ganado" }, count: 12 },
    ],
    stream: [
      { text: { en: "Primary bath estimate sent — Jenna P.", es: "Presupuesto de baño enviado — Jenna P." }, amount: 19500, minutesAgo: 6 },
      { text: { en: "High-ticket lead: kitchen refresh, Karen W.", es: "Prospecto de alto valor: cocina, Karen W." }, amount: 18500, minutesAgo: 12 },
      { text: { en: "Crew B dispatched — ceiling repair, Derek S.", es: "Cuadrilla B asignada — cielo raso, Derek S." }, minutesAgo: 41 },
      { text: { en: "Missed call → text-back → site visit booked", es: "Llamada perdida → texto automático → visita agendada" }, minutesAgo: 51 },
    ],
    simulator: {
      business: "Ridgeline Builders",
      caller: "Rafael",
      callerNumber: "(602) 555-0119",
      service: { en: "Kitchen remodel site visit", es: "Visita para remodelación de cocina" },
      time: { en: "tomorrow, 8:00 AM", es: "mañana, 8:00 AM" },
      amount: 28500,
      earlier: [
        { name: "Hannah B.", service: { en: "Deck repair estimate", es: "Presupuesto de terraza" }, amount: 6400 },
        { name: "Victor M.", service: { en: "Bathroom refresh", es: "Renovación de baño" }, amount: 14200 },
      ],
    },
    calculator: { missedCalls: 6, avgTicket: 4500, bookingRate: 20 },
  },
  {
    id: "service",
    label: { en: "Service Businesses", es: "Negocios de Servicios" },
    shortLabel: { en: "Services", es: "Servicios" },
    tagline: { en: "Leads in, conversations handled, reviews out.", es: "Entran prospectos, se atienden conversaciones, salen reseñas." },
    media: {
      src: asset("/media/service"),
      poster: asset("/media/service-poster.jpg"),
      alt: {
        en: "A technician tightens a pipe fitting under a sink with a wrench, lit by a headlamp.",
        es: "Un técnico aprieta una conexión de tubería bajo un fregadero con una llave, iluminado por una linterna frontal.",
      },
    },
    modules: [
      { name: { en: "Automated Lead Capture", es: "Captura Automática de Prospectos" }, detail: { en: "Every form and call logged with source.", es: "Cada formulario y llamada registrados con su origen." } },
      { name: { en: "2-Way SMS Customer Inbox", es: "Bandeja de SMS Bidireccional" }, detail: { en: "Text customers from one shared inbox.", es: "Escriba a sus clientes desde una bandeja compartida." } },
      { name: { en: "Automated 5-Star Google Review Requests", es: "Solicitudes Automáticas de Reseñas de 5 Estrellas en Google" }, detail: { en: "Sent after every completed job.", es: "Enviadas después de cada trabajo completado." } },
    ],
    kpis: [
      { label: { en: "Leads captured", es: "Prospectos captados" }, value: 132, format: "number", delta: { en: "+24", es: "+24" } },
      { label: { en: "SMS conversations", es: "Conversaciones por SMS" }, value: 418, format: "number", delta: { en: "+67", es: "+67" } },
      { label: { en: "Review requests sent", es: "Solicitudes de reseña enviadas" }, value: 96, format: "number", delta: { en: "+19", es: "+19" } },
      { label: { en: "Avg. text-back time", es: "Tiempo promedio de respuesta" }, value: 9, format: "seconds", delta: { en: "−51s", es: "−51 s" } },
    ],
    weekly: [6800, 7400, 7100, 8300, 8900, 9600, 9200, 10500],
    pipeline: [
      { stage: { en: "Captured", es: "Captados" }, count: 132 },
      { stage: { en: "Contacted", es: "Contactados" }, count: 121 },
      { stage: { en: "Booked", es: "Agendados" }, count: 74 },
      { stage: { en: "Reviewed", es: "Con reseña" }, count: 38 },
    ],
    stream: [
      { text: { en: "New lead: AC tune-up request via website", es: "Nuevo prospecto: mantenimiento de A/C desde el sitio" }, amount: 149, minutesAgo: 2 },
      { text: { en: "2-way SMS: Marisol V. confirmed Tuesday window", es: "SMS: Marisol V. confirmó el horario del martes" }, minutesAgo: 12 },
      { text: { en: "Review request sent after job #322", es: "Solicitud de reseña enviada tras el trabajo #322" }, minutesAgo: 27 },
      { text: { en: "Missed call → text-back → deep clean booked", es: "Llamada perdida → texto automático → limpieza profunda" }, amount: 220, minutesAgo: 45 },
    ],
    simulator: {
      business: "Clearline Home Services",
      caller: "Jordan",
      callerNumber: "(404) 555-0153",
      service: { en: "AC tune-up", es: "Mantenimiento de A/C" },
      time: { en: "Tuesday, 9–11 AM", es: "martes, 9–11 AM" },
      amount: 149,
      earlier: [
        { name: "Beth A.", service: { en: "Gutter cleaning", es: "Limpieza de canaletas" }, amount: 180 },
        { name: "Chris D.", service: { en: "Water heater check", es: "Revisión de calentador" }, amount: 120 },
      ],
    },
    calculator: { missedCalls: 9, avgTicket: 220, bookingRate: 30 },
  },
];

export const NICHE_BY_ID: Record<NicheId, Niche> = Object.fromEntries(
  NICHES.map((n) => [n.id, n]),
) as Record<NicheId, Niche>;
