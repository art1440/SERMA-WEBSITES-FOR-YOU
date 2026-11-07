import type { L10n } from "@/i18n/types";
import type { NicheViews } from "./types";

/**
 * Lacquer Studio (fictional, Houston, 713). Owner and lash artist: Vanessa.
 * Nail techs: Mia and Thao.
 * Every person, phone, email and number below is FICTIONAL demo data.
 */

const MIA: L10n = { en: "Mia · Nails", es: "Mia · Uñas" };
const THAO: L10n = { en: "Thao · Nails", es: "Thao · Uñas" };
const VANESSA: L10n = { en: "Vanessa · Lashes", es: "Vanessa · Pestañas" };

/** Menu: Gel-X full set $85 · 1½h, Gel manicure $45 · 45m, Gel spa pedicure $60 · 1h,
 *  Gel mani + pedi $95 · 1h45, Structured gel manicure $65 · 1h15, Acrylic fill $55 · 1h,
 *  Classic lash fill $65 · 1h, Hybrid full set $180 · 2½h, Volume full set $210 · 2½h,
 *  Lash lift + tint $95 · 1h, Brow lamination $75 · 45m. */
const SVC = {
  gelX: { en: "Gel-X full set", es: "Juego completo Gel-X" },
  gelMani: { en: "Gel manicure", es: "Manicura en gel" },
  gelPedi: { en: "Gel spa pedicure", es: "Pedicura spa en gel" },
  maniPedi: { en: "Gel mani + pedi", es: "Mani y pedi en gel" },
  structuredGel: { en: "Structured gel manicure", es: "Manicura de gel estructurado" },
  acrylicFill: { en: "Acrylic fill", es: "Relleno de acrílico" },
  lashFill: { en: "Classic lash fill", es: "Relleno clásico de pestañas" },
  hybridSet: { en: "Hybrid lash full set", es: "Juego híbrido de pestañas" },
  volumeSet: { en: "Volume lash full set", es: "Juego de pestañas de volumen" },
  lashLift: { en: "Lash lift + tint", es: "Lifting y tinte de pestañas" },
  browLam: { en: "Brow lamination", es: "Laminado de cejas" },
} satisfies Record<string, L10n>;

const ALERTS = { from: "SermaWebDesign Alerts", fromEmail: "alerts@example.com" } as const;
const HI: L10n = { en: "Hi Vanessa,", es: "Hola, Vanessa:" };

export const beautyViews: NicheViews = {
  leads: [
    {
      id: "bea-l1",
      name: "Alyssa R.",
      phone: "(713) 555-0131",
      service: { en: "Lash fill (another studio's set)", es: "Relleno de pestañas (de otro estudio)" },
      value: 85,
      source: "missedCall",
      status: "new",
      received: { en: "Today, 9:12 AM", es: "Hoy, 9:12 AM" },
      note: {
        en: "Has lashes from another studio — asked if you can fill them",
        es: "Trae pestañas de otro estudio; preguntó si se las pueden rellenar",
      },
    },
    {
      id: "bea-l2",
      name: "Gabby M.",
      phone: "(713) 555-0166",
      service: { en: "Birthday group: 5 gel manicures", es: "Cumpleaños: 5 manicuras en gel" },
      value: 245,
      source: "instagram",
      status: "new",
      received: { en: "Yesterday, 9:48 PM", es: "Ayer, 9:48 PM" },
      note: {
        en: "Wants Saturday at 2 PM, two at a time — asked if they can bring cupcakes",
        es: "Quiere el sábado a las 2 PM, de dos en dos; preguntó si pueden llevar cupcakes",
      },
    },
    {
      id: "bea-l3",
      name: "Tiana C.",
      phone: "(713) 555-0112",
      service: SVC.structuredGel,
      value: 65,
      source: "google",
      status: "contacted",
      received: { en: "Yesterday, 2:05 PM", es: "Ayer, 2:05 PM" },
      note: {
        en: "Asked if builder gel will help her nails recover after acrylics",
        es: "Preguntó si el gel estructurado le ayuda a recuperar las uñas después del acrílico",
      },
    },
    {
      id: "bea-l4",
      name: "Diana P.",
      phone: "(713) 555-0144",
      service: { en: "Brow lamination + tint", es: "Laminado y tinte de cejas" },
      value: 95,
      source: "referral",
      status: "contacted",
      received: { en: "Sat, 6:30 PM", es: "Sáb, 6:30 PM" },
      note: {
        en: "Referred by Kayla S. — wants brows done 2 days before a wedding",
        es: "Recomendada por Kayla S.; quiere las cejas listas 2 días antes de una boda",
      },
    },
    {
      id: "bea-l5",
      name: "Jade L.",
      phone: "(713) 555-0159",
      service: SVC.hybridSet,
      value: 180,
      source: "website",
      status: "booked",
      received: { en: "Today, 6:55 AM", es: "Hoy, 6:55 AM" },
      note: {
        en: "Booked Tue 11:00 AM with you — her first lash set ever",
        es: "Agendó el martes 11:00 AM con usted; es su primer juego de pestañas",
      },
    },
    {
      id: "bea-l6",
      name: "Ana P.",
      phone: "(713) 555-0128",
      service: SVC.gelX,
      value: 85,
      source: "missedCall",
      status: "booked",
      received: { en: "Sat, 4:12 PM", es: "Sáb, 4:12 PM" },
      note: {
        en: "Missed call → text-back → booked this Sat 10:15 AM with Mia",
        es: "Llamada perdida → texto automático → agendó para este sábado 10:15 AM con Mia",
      },
    },
    {
      id: "bea-l7",
      name: "Stephanie V.",
      phone: "(713) 555-0190",
      service: { en: "Acrylic full set", es: "Juego completo de acrílico" },
      value: 70,
      source: "google",
      status: "lost",
      received: { en: "Last week", es: "La semana pasada" },
      note: {
        en: "Was price-shopping for a $35 full set — went with another salon",
        es: "Buscaba un juego completo de $35; se fue con otro salón",
      },
    },
  ],

  calendar: {
    resources: [MIA, THAO, VANESSA],
    events: [
      // Monday
      { id: "bea-c1", day: 0, start: "10:00", durationMin: 60, client: "Kayla S.", service: SVC.lashFill, resource: VANESSA, status: "confirmed", value: 65 },
      { id: "bea-c2", day: 0, start: "12:00", durationMin: 45, client: "Mariela C.", service: SVC.gelMani, resource: MIA, status: "confirmed", value: 45 },
      // Tuesday
      { id: "bea-c3", day: 1, start: "09:30", durationMin: 90, client: "Brittany H.", service: SVC.gelX, resource: THAO, status: "deposit", value: 85 },
      { id: "bea-c4", day: 1, start: "11:00", durationMin: 150, client: "Jade L.", service: SVC.hybridSet, resource: VANESSA, status: "pending", value: 180 },
      { id: "bea-c5", day: 1, start: "14:00", durationMin: 60, client: "Rosa M.", service: SVC.gelPedi, resource: THAO, status: "confirmed", value: 60 },
      { id: "bea-c6", day: 1, start: "16:30", durationMin: 75, client: "Destiny W.", service: SVC.structuredGel, resource: MIA, status: "confirmed", value: 65 },
      // Wednesday
      { id: "bea-c7", day: 2, start: "09:00", durationMin: 60, client: "Lily T.", service: SVC.lashLift, resource: VANESSA, status: "confirmed", value: 95 },
      { id: "bea-c8", day: 2, start: "13:00", durationMin: 60, client: "Paola R.", service: SVC.acrylicFill, resource: THAO, status: "confirmed", value: 55 },
      { id: "bea-c9", day: 2, start: "15:00", durationMin: 45, client: "Imani J.", service: SVC.browLam, resource: VANESSA, status: "pending", value: 75 },
      // Thursday
      { id: "bea-c10", day: 3, start: "10:00", durationMin: 90, client: "Courtney B.", service: SVC.gelX, resource: MIA, status: "confirmed", value: 85 },
      { id: "bea-c11", day: 3, start: "13:00", durationMin: 60, client: "Sara N.", service: SVC.lashFill, resource: VANESSA, status: "confirmed", value: 65 },
      { id: "bea-c12", day: 3, start: "17:00", durationMin: 105, client: "Erica F.", service: SVC.maniPedi, resource: THAO, status: "confirmed", value: 95 },
      // Friday
      { id: "bea-c13", day: 4, start: "10:00", durationMin: 150, client: "Nicole A.", service: SVC.volumeSet, resource: VANESSA, status: "deposit", value: 210 },
      { id: "bea-c14", day: 4, start: "13:30", durationMin: 90, client: "Tanya G.", service: SVC.gelX, resource: MIA, status: "confirmed", value: 85 },
      { id: "bea-c15", day: 4, start: "16:00", durationMin: 45, client: "Megan O.", service: SVC.gelMani, resource: THAO, status: "confirmed", value: 45 },
      // Saturday
      { id: "bea-c16", day: 5, start: "09:00", durationMin: 60, client: "Vivian L.", service: SVC.gelPedi, resource: THAO, status: "confirmed", value: 60 },
      { id: "bea-c17", day: 5, start: "10:15", durationMin: 90, client: "Ana P.", service: SVC.gelX, resource: MIA, status: "deposit", value: 85 },
    ],
  },

  inbox: [
    {
      id: "bea-m1",
      kind: "textback",
      ...ALERTS,
      subject: {
        en: "Alyssa R. replied to your text-back: “Can you fill another studio's lashes?”",
        es: "Alyssa R. respondió a su texto automático: “¿Rellenan pestañas de otro estudio?”",
      },
      preview: {
        en: "“My lashes are from another place. Can you fill them or do I need a new set?”",
        es: "“Mis pestañas son de otro lugar. ¿Me las pueden rellenar o necesito un juego nuevo?”",
      },
      received: { en: "9:18 AM", es: "9:18 AM" },
      unread: true,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Alyssa R. called at 9:12 AM while you were setting up for your 10:00 client. Your automatic text went out 3 seconds later, and she wrote back at 9:17:",
            es: "Alyssa R. llamó a las 9:12 AM mientras usted se preparaba para su clienta de las 10:00. Su texto automático salió 3 segundos después y ella respondió a las 9:17:",
          },
          {
            en: "“Hi! My lashes are from another place and I'm due for a fill. Can you fill them, or do I need a whole new set?”",
            es: "“¡Hola! Mis pestañas son de otro lugar y ya me toca relleno. ¿Me las pueden rellenar o necesito un juego completo nuevo?”",
          },
          {
            en: "Pick a reply below and it goes out from the studio's number. No typing needed.",
            es: "Elija una respuesta abajo y se envía desde el número del estudio. No hace falta escribir nada.",
          },
        ],
        details: [
          { label: { en: "Caller", es: "Llamada de" }, value: { en: "Alyssa R. · (713) 555-0131", es: "Alyssa R. · (713) 555-0131" } },
          { label: { en: "Missed call", es: "Llamada perdida" }, value: { en: "9:12 AM", es: "9:12 AM" } },
          { label: { en: "Auto-text sent", es: "Texto automático" }, value: { en: "9:12 AM · 3 sec later", es: "9:12 AM · 3 s después" } },
          { label: { en: "Her reply", es: "Su respuesta" }, value: { en: "9:17 AM", es: "9:17 AM" } },
        ],
        primary: {
          label: { en: "Choose a quick reply", es: "Elegir una respuesta rápida" },
          action: "quickReply",
          done: { en: "Reply sent", es: "Respuesta enviada" },
        },
        quickReplies: [
          {
            en: "We can! If about half your lashes are still on, we'll do a foreign fill ($85, about 75 min). Vanessa has Thursday at 3 PM. Want it?",
            es: "¡Claro que sí! Si todavía tiene más o menos la mitad de sus pestañas, le hacemos un relleno sobre las pestañas que trae ($85, unos 75 min). Vanessa tiene el jueves a las 3 PM. ¿Se lo apartamos?",
          },
          {
            en: "Send us a close-up photo of your lashes and we'll tell you whether a fill or a fresh set makes more sense.",
            es: "Envíenos una foto de cerca de sus pestañas y le decimos si le conviene un relleno o un juego nuevo.",
          },
          {
            en: "For lashes from another studio, we start fresh with a full set so we know exactly what's on there. Classic sets are $150. Want a time this week?",
            es: "Cuando las pestañas son de otro estudio, empezamos con un juego completo nuevo para saber exactamente qué tiene puesto. El juego clásico cuesta $150. ¿Le buscamos un horario esta semana?",
          },
        ],
        signoff: { en: "— Your SermaWebDesign text-back", es: "— Su texto automático de SermaWebDesign" },
      },
    },
    {
      id: "bea-m2",
      kind: "booking",
      ...ALERTS,
      subject: {
        en: "New booking: Jade L. · Tue 11:00 AM with you",
        es: "Nueva cita: Jade L. · martes 11:00 AM con usted",
      },
      preview: {
        en: "Hybrid lash full set, 2½ hrs · First lash set ever · $40 deposit on hold.",
        es: "Juego híbrido de pestañas, 2½ h · Su primer juego · Depósito de $40 retenido.",
      },
      received: { en: "6:55 AM", es: "6:55 AM" },
      unread: true,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Jade L. booked a hybrid full set with you at 6:55 AM. It's her first time getting lash extensions, so she chose the 2½-hour slot that starts with a quick consult on length and curl.",
            es: "Jade L. agendó con usted un juego híbrido a las 6:55 AM. Es la primera vez que se pone extensiones, así que eligió el horario de 2½ horas, que empieza con una breve consulta sobre largo y curvatura.",
          },
          {
            en: "Her $40 deposit is on hold and is charged when you confirm. The confirmation text asks her to arrive with clean lashes and no mascara.",
            es: "Su depósito de $40 está retenido y se cobra cuando usted confirme. El texto de confirmación le pide llegar con las pestañas limpias y sin rímel.",
          },
        ],
        details: [
          { label: { en: "Client", es: "Clienta" }, value: { en: "Jade L. · (713) 555-0159", es: "Jade L. · (713) 555-0159" } },
          { label: { en: "Service", es: "Servicio" }, value: SVC.hybridSet },
          { label: { en: "When", es: "Cuándo" }, value: { en: "Tue, 11:00 AM–1:30 PM", es: "Martes, 11:00 AM–1:30 PM" } },
          { label: { en: "Artist", es: "Artista" }, value: { en: "Vanessa (you)", es: "Vanessa (usted)" } },
          { label: { en: "Deposit", es: "Depósito" }, value: { en: "$40 on hold · $140 due at checkout", es: "$40 retenidos · $140 al pagar" } },
          { label: { en: "Fill reminder", es: "Recordatorio de relleno" }, value: { en: "Set for 2 weeks after", es: "Programado 2 semanas después" } },
        ],
        primary: {
          label: { en: "Confirm booking", es: "Confirmar cita" },
          action: "confirm",
          done: { en: "Booking confirmed", es: "Cita confirmada" },
        },
        secondary: {
          label: { en: "View in calendar", es: "Ver en el calendario" },
          action: "openCalendar",
          done: { en: "Opened in calendar", es: "Abierta en el calendario" },
        },
        calendarEventId: "bea-c4",
        signoff: { en: "— Your SermaWebDesign booking system", es: "— Su sistema de citas de SermaWebDesign" },
      },
    },
    {
      id: "bea-m3",
      kind: "lead",
      ...ALERTS,
      subject: {
        en: "New lead: birthday group of 5, Saturday 2 PM",
        es: "Nuevo prospecto: cumpleaños, grupo de 5, sábado 2 PM",
      },
      preview: {
        en: "Gabby M. wants gel manicures for five, two at a time. Est. $245.",
        es: "Gabby M. quiere manicuras en gel para cinco, de dos en dos. Aprox. $245.",
      },
      received: { en: "Yesterday, 9:48 PM", es: "Ayer, 9:48 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Gabby M. sent a group request from the booking link in your Instagram bio. She's celebrating her 30th with four friends and wants gel manicures for everyone, with nail art for the birthday girl.",
            es: "Gabby M. envió una solicitud de grupo desde el enlace de citas en su perfil de Instagram. Celebra sus 30 años con cuatro amigas y quiere manicura en gel para todas, con diseño para la cumpleañera.",
          },
          {
            en: "Mia and Thao are both free Saturday from 2 PM, so two at a time fits in about 2½ hours. She also asked if they can bring cupcakes.",
            es: "Mia y Thao están libres el sábado desde las 2 PM, así que de dos en dos caben en unas 2½ horas. También preguntó si pueden llevar cupcakes.",
          },
        ],
        details: [
          { label: { en: "Contact", es: "Contacto" }, value: { en: "Gabby M. · (713) 555-0166", es: "Gabby M. · (713) 555-0166" } },
          { label: { en: "Group", es: "Grupo" }, value: { en: "5 guests", es: "5 personas" } },
          { label: { en: "Requested", es: "Solicitado" }, value: { en: "Sat, 2:00 PM", es: "Sábado, 2:00 PM" } },
          { label: { en: "Services", es: "Servicios" }, value: { en: "5 × gel manicure + nail art for 1", es: "5 × manicura en gel + diseño para 1" } },
          { label: { en: "Estimate", es: "Estimado" }, value: { en: "$245", es: "$245" } },
        ],
        primary: {
          label: { en: "Open lead", es: "Abrir prospecto" },
          action: "openLeads",
          done: { en: "Opened in Leads", es: "Abierto en Prospectos" },
        },
        signoff: { en: "— SermaWebDesign lead alerts", es: "— Alertas de prospectos de SermaWebDesign" },
      },
    },
    {
      id: "bea-m4",
      kind: "payment",
      ...ALERTS,
      subject: {
        en: "Deposit received: $40 from Nicole A. for Fri 10:00 AM",
        es: "Depósito recibido: $40 de Nicole A. para el viernes 10:00 AM",
      },
      preview: {
        en: "Volume lash full set with you. $170 balance due at checkout.",
        es: "Juego de pestañas de volumen con usted. Saldo de $170 al pagar.",
      },
      received: { en: "Yesterday, 4:40 PM", es: "Ayer, 4:40 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Nicole A. paid her deposit for a volume full set, so Friday morning is locked in. Under your policy, the deposit isn't refunded for cancellations with less than 24 hours' notice.",
            es: "Nicole A. pagó su depósito para un juego de volumen, así que el viernes por la mañana queda asegurado. Según su política, el depósito no se reembolsa si cancela con menos de 24 horas de aviso.",
          },
          {
            en: "Here's the receipt. The balance is collected at checkout, and her 2-week fill reminder is already scheduled.",
            es: "Aquí está el recibo. El saldo se cobra al pagar y su recordatorio de relleno a las 2 semanas ya está programado.",
          },
        ],
        details: [
          { label: { en: "Receipt", es: "Recibo" }, value: { en: "#LQS-3062", es: "#LQS-3062" } },
          { label: { en: "Service", es: "Servicio" }, value: { en: "Volume lash full set · Vanessa", es: "Juego de pestañas de volumen · Vanessa" } },
          { label: { en: "Appointment", es: "Cita" }, value: { en: "Fri, 10:00 AM–12:30 PM", es: "Viernes, 10:00 AM–12:30 PM" } },
          { label: { en: "Deposit paid", es: "Depósito pagado" }, value: { en: "$40.00", es: "$40.00" } },
          { label: { en: "Balance at checkout", es: "Saldo al pagar" }, value: { en: "$170.00", es: "$170.00" } },
          { label: { en: "Card", es: "Tarjeta" }, value: { en: "Visa ending 2209", es: "Visa terminada en 2209" } },
        ],
        primary: {
          label: { en: "View receipt", es: "Ver recibo" },
          action: "receipt",
          done: { en: "Receipt shown", es: "Recibo mostrado" },
        },
        secondary: {
          label: { en: "Mark as handled", es: "Marcar como atendido" },
          action: "acknowledge",
          done: { en: "Marked as handled", es: "Marcado como atendido" },
        },
        signoff: { en: "— SermaWebDesign payments", es: "— Pagos de SermaWebDesign" },
      },
    },
    {
      id: "bea-m5",
      kind: "review",
      ...ALERTS,
      subject: {
        en: "New 5★ Google review from Brenda T.",
        es: "Nueva reseña de 5★ en Google de Brenda T.",
      },
      preview: {
        en: "“Mia did a chrome French Gel-X set and it's still flawless at three weeks…”",
        es: "“Mia me hizo un juego Gel-X francés cromado y sigue perfecto a las tres semanas…”",
      },
      received: { en: "Yesterday, 11:20 AM", es: "Ayer, 11:20 AM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Brenda T. gave the studio 5 stars on Google for her Gel-X set with Mia:",
            es: "Brenda T. le dio 5 estrellas al estudio en Google por su juego Gel-X con Mia:",
          },
          {
            en: "“Mia did a chrome French Gel-X set and it's still flawless at three weeks. No lifting, not one chip. She also fixed the shape my old salon kept getting wrong.”",
            es: "“Mia me hizo un juego Gel-X francés cromado y sigue perfecto a las tres semanas. Nada se ha levantado ni se ha despostillado. Además, corrigió la forma que en mi salón anterior nunca me salía bien.”",
          },
          {
            en: "We drafted a reply that thanks her by name and mentions Mia. Look it over in Reviews and post it with one tap.",
            es: "Le preparamos una respuesta que le agradece por su nombre y menciona a Mia. Revísela en Reseñas y publíquela con un toque.",
          },
        ],
        details: [
          { label: { en: "Rating", es: "Calificación" }, value: { en: "5 of 5", es: "5 de 5" } },
          { label: { en: "Platform", es: "Plataforma" }, value: { en: "Google", es: "Google" } },
          { label: { en: "Nail tech", es: "Técnica de uñas" }, value: { en: "Mia", es: "Mia" } },
        ],
        primary: {
          label: { en: "Review & reply", es: "Revisar y responder" },
          action: "openReviews",
          done: { en: "Opened in Reviews", es: "Abierto en Reseñas" },
        },
        signoff: { en: "— SermaWebDesign review alerts", es: "— Alertas de reseñas de SermaWebDesign" },
      },
    },
  ],

  reviews: {
    average: 4.7,
    total: 287,
    distribution: [228, 39, 12, 5, 3],
    items: [
      {
        id: "bea-r1",
        author: "Brenda T.",
        rating: 5,
        platform: "google",
        when: { en: "Yesterday", es: "Ayer" },
        text: {
          en: "Mia did a chrome French Gel-X set and it's still flawless at three weeks. No lifting, not one chip. She also fixed the shape my old salon kept getting wrong.",
          es: "Mia me hizo un juego Gel-X francés cromado y sigue perfecto a las tres semanas. Nada se ha levantado ni se ha despostillado. Además, corrigió la forma que en mi salón anterior nunca me salía bien.",
        },
        suggestedReply: {
          en: "Brenda, thank you! Mia is so happy that set is holding up. The chrome French is officially your signature. See you for the next one!",
          es: "¡Gracias, Brenda! Mia está feliz de que el juego siga perfecto. El francés cromado ya es su sello. ¡La esperamos para el próximo!",
        },
        replied: false,
      },
      {
        id: "bea-r2",
        author: "Kayla S.",
        rating: 5,
        platform: "facebook",
        when: { en: "1 week ago", es: "Hace 1 semana" },
        text: {
          en: "Vanessa's lash fills are the one hour of my week when nobody needs anything from me. The reminder text comes at two weeks, I tap a time, done.",
          es: "Los rellenos de pestañas con Vanessa son la única hora de mi semana en la que nadie me necesita. El recordatorio me llega a las dos semanas, toco un horario y listo.",
        },
        suggestedReply: {
          en: "Kayla, that's exactly the vibe we're going for. Thank you! See you Monday.",
          es: "Kayla, ¡eso es justo lo que buscamos! Gracias. Nos vemos el lunes.",
        },
        replied: true,
      },
      {
        id: "bea-r3",
        author: "Rosa M.",
        rating: 5,
        platform: "yelp",
        when: { en: "2 weeks ago", es: "Hace 2 semanas" },
        text: {
          en: "Spotless studio, metal tools come out of sealed sterilization pouches, and Thao's pedicure massage is unreal. My go-to now.",
          es: "El estudio está impecable, las herramientas de metal salen de bolsas de esterilización selladas y el masaje de pedicura de Thao es increíble. Ya es mi lugar de siempre.",
        },
        suggestedReply: {
          en: "Thank you, Rosa! Clean tools are non-negotiable for us, and Thao says hi. See you soon.",
          es: "¡Gracias, Rosa! La higiene de nuestras herramientas no es negociable, y Thao le manda saludos. Hasta pronto.",
        },
        replied: true,
      },
      {
        id: "bea-r4",
        author: "Jessica L.",
        rating: 4,
        platform: "google",
        when: { en: "3 weeks ago", es: "Hace 3 semanas" },
        text: {
          en: "Beautiful, fluffy volume set, and Vanessa was super gentle. Only 4 stars because it took almost three hours. Next time I'm bringing a podcast.",
          es: "Un juego de volumen precioso y con mucho cuerpo, y Vanessa fue súper delicada. Solo 4 estrellas porque tardó casi tres horas. La próxima vez llevo un podcast.",
        },
        suggestedReply: {
          en: "Thanks, Jessica! Volume sets take time to do right, and we should have set that expectation up front. The booking page now says so clearly. Enjoy those lashes!",
          es: "¡Gracias, Jessica! Un juego de volumen bien hecho lleva su tiempo, y debimos avisarle desde el principio. Ya lo aclaramos en la página de citas. ¡Que disfrute sus pestañas!",
        },
        replied: false,
      },
      {
        id: "bea-r5",
        author: "Monica R.",
        rating: 3,
        platform: "yelp",
        when: { en: "1 month ago", es: "Hace 1 mes" },
        text: {
          en: "My gel mani looked great at first, but two nails lifted within a week. They offered to fix it when I texted, which I appreciate, but I had to take another afternoon off to come back.",
          es: "Mi manicura en gel se veía muy bien al principio, pero dos uñas se levantaron en menos de una semana. Cuando les escribí me ofrecieron arreglarlas, lo cual agradezco, pero tuve que pedir otra tarde libre para volver.",
        },
        suggestedReply: {
          en: "Monica, I'm sorry. Lifting within a week isn't our standard, and having to come back on your own time made it worse. We've gone over our prep steps as a team. Your next manicure is on us, at whatever time works best for you. — Vanessa",
          es: "Monica, le ofrezco una disculpa. Que se levanten en una semana no es el estándar que buscamos, y tener que volver en su tiempo libre lo empeoró. Ya revisamos con todo el equipo nuestros pasos de preparación. Su próxima manicura va por nuestra cuenta, en el horario que más le convenga. — Vanessa",
        },
        replied: false,
      },
    ],
  },
};
