import type { L10n } from "@/i18n/types";
import type { NicheViews } from "./types";

/**
 * Atelier Salon (fictional, Miami, 305). Owner: Nadia.
 * Stylists: Jenna (color), Nadia (owner: cut & color), Marco (cuts, blowouts, silk press).
 * Every person, phone, email and number below is FICTIONAL demo data.
 */

const JENNA: L10n = { en: "Jenna", es: "Jenna" };
const NADIA: L10n = { en: "Nadia", es: "Nadia" };
const MARCO: L10n = { en: "Marco", es: "Marco" };

/** Menu: Balayage + gloss $240 · 3h, Full highlights $210 · 2½h, Single-process color $120 · 2h,
 *  Root touch-up $95 · 1½h, Keratin $300 · 2½h, Cut & style $85 · 1h, Blowout $55 · 45m,
 *  Silk press $95 · 1½h, Men's cut $45 · 30m, Bridal hair trial $150 · 1½h. */
const SVC = {
  balayage: { en: "Balayage + gloss", es: "Balayage + gloss" },
  highlights: { en: "Full highlights", es: "Mechas completas" },
  singleColor: { en: "Single-process color", es: "Tinte completo" },
  rootTouch: { en: "Root touch-up", es: "Retoque de raíz" },
  keratin: { en: "Keratin smoothing treatment", es: "Tratamiento alisador de keratina" },
  cutStyle: { en: "Cut & style", es: "Corte y peinado" },
  blowout: { en: "Blowout", es: "Brushing" },
  silkPress: { en: "Silk press", es: "Silk press" },
  mensCut: { en: "Men's cut", es: "Corte de caballero" },
  bridalTrial: { en: "Bridal hair trial", es: "Prueba de peinado de novia" },
} satisfies Record<string, L10n>;

const ALERTS = { from: "SermaWebDesign Alerts", fromEmail: "alerts@example.com" } as const;
const HI: L10n = { en: "Hi Nadia,", es: "Hola, Nadia:" };

export const salonViews: NicheViews = {
  leads: [
    {
      id: "sal-l1",
      name: "Alexis R.",
      phone: "(305) 555-0146",
      service: { en: "Color correction", es: "Corrección de color" },
      value: 250,
      source: "missedCall",
      status: "new",
      received: { en: "Today, 9:03 AM", es: "Hoy, 9:03 AM" },
      note: {
        en: "Boxed dye turned orange — wants a price before booking",
        es: "Un tinte de caja le quedó naranja; quiere saber el precio antes de agendar",
      },
    },
    {
      id: "sal-l2",
      name: "Natalie S.",
      phone: "(305) 555-0172",
      service: { en: "Bridal party: bride + 4 bridesmaids", es: "Boda: novia + 4 damas" },
      value: 765,
      source: "website",
      status: "new",
      received: { en: "Yesterday, 8:40 PM", es: "Ayer, 8:40 PM" },
      note: {
        en: "March wedding — asked if you do on-site styling at the venue",
        es: "Boda en marzo; preguntó si hacen los peinados en el lugar del evento",
      },
    },
    {
      id: "sal-l3",
      name: "Monique A.",
      phone: "(305) 555-0158",
      service: SVC.silkPress,
      value: 95,
      source: "instagram",
      status: "contacted",
      received: { en: "Yesterday, 1:15 PM", es: "Ayer, 1:15 PM" },
      note: {
        en: "Asked if Marco works with 4C hair and how long a press lasts in the humidity",
        es: "Preguntó si Marco trabaja cabello 4C y cuánto dura el planchado con la humedad",
      },
    },
    {
      id: "sal-l4",
      name: "Hannah W.",
      phone: "(305) 555-0123",
      service: SVC.balayage,
      value: 240,
      source: "google",
      status: "contacted",
      received: { en: "Sat, 5:50 PM", es: "Sáb, 5:50 PM" },
      note: {
        en: "Wants a lived-in blonde she only has to refresh twice a year",
        es: "Quiere un rubio natural que solo tenga que retocar dos veces al año",
      },
    },
    {
      id: "sal-l5",
      name: "Lauren H.",
      phone: "(305) 555-0139",
      service: SVC.highlights,
      value: 210,
      source: "website",
      status: "booked",
      received: { en: "Today, 7:22 AM", es: "Hoy, 7:22 AM" },
      note: {
        en: "Booked Fri 9:30 AM with Jenna — new color client, needs a patch test",
        es: "Agendó el viernes a las 9:30 AM con Jenna; clienta nueva de color, necesita prueba de alergia",
      },
    },
    {
      id: "sal-l6",
      name: "Isabel M.",
      phone: "(305) 555-0181",
      service: SVC.bridalTrial,
      value: 150,
      source: "referral",
      status: "booked",
      received: { en: "Sat, 11:10 AM", es: "Sáb, 11:10 AM" },
      note: {
        en: "Referred by her sister Camila R. — trial set for this Sat 9:00 AM with Nadia",
        es: "Recomendada por su hermana Camila R.; prueba este sábado a las 9:00 AM con Nadia",
      },
    },
    {
      id: "sal-l7",
      name: "Rachel B.",
      phone: "(305) 555-0105",
      service: SVC.keratin,
      value: 300,
      source: "google",
      status: "lost",
      received: { en: "Last week", es: "La semana pasada" },
      note: {
        en: "Needed it same-day before a trip — no openings that week",
        es: "Lo necesitaba el mismo día antes de un viaje; no había espacio esa semana",
      },
    },
  ],

  calendar: {
    resources: [JENNA, NADIA, MARCO],
    events: [
      // Monday
      { id: "sal-c1", day: 0, start: "10:00", durationMin: 90, client: "Priya N.", service: SVC.rootTouch, resource: NADIA, status: "confirmed", value: 95 },
      { id: "sal-c2", day: 0, start: "14:00", durationMin: 60, client: "Daniela F.", service: SVC.cutStyle, resource: MARCO, status: "confirmed", value: 85 },
      // Tuesday
      { id: "sal-c3", day: 1, start: "09:30", durationMin: 180, client: "Camila R.", service: SVC.balayage, resource: JENNA, status: "deposit", value: 240 },
      { id: "sal-c4", day: 1, start: "11:00", durationMin: 45, client: "Elena V.", service: SVC.blowout, resource: NADIA, status: "confirmed", value: 55 },
      { id: "sal-c5", day: 1, start: "14:00", durationMin: 120, client: "Renee W.", service: SVC.singleColor, resource: JENNA, status: "confirmed", value: 120 },
      { id: "sal-c6", day: 1, start: "15:00", durationMin: 30, client: "David K.", service: SVC.mensCut, resource: MARCO, status: "confirmed", value: 45 },
      // Wednesday
      { id: "sal-c7", day: 2, start: "09:00", durationMin: 150, client: "Gabriela S.", service: SVC.keratin, resource: NADIA, status: "deposit", value: 300 },
      { id: "sal-c8", day: 2, start: "13:00", durationMin: 150, client: "Monica T.", service: SVC.highlights, resource: JENNA, status: "confirmed", value: 210 },
      { id: "sal-c9", day: 2, start: "17:00", durationMin: 90, client: "Aaliyah B.", service: SVC.silkPress, resource: MARCO, status: "pending", value: 95 },
      // Thursday
      { id: "sal-c10", day: 3, start: "10:00", durationMin: 60, client: "Tasha G.", service: SVC.cutStyle, resource: MARCO, status: "confirmed", value: 85 },
      { id: "sal-c11", day: 3, start: "11:00", durationMin: 180, client: "Sofia L.", service: SVC.balayage, resource: JENNA, status: "deposit", value: 240 },
      { id: "sal-c12", day: 3, start: "15:30", durationMin: 90, client: "Michelle D.", service: SVC.rootTouch, resource: NADIA, status: "confirmed", value: 95 },
      // Friday
      { id: "sal-c13", day: 4, start: "09:30", durationMin: 150, client: "Lauren H.", service: SVC.highlights, resource: JENNA, status: "pending", value: 210 },
      { id: "sal-c14", day: 4, start: "13:00", durationMin: 60, client: "Andrea P.", service: SVC.cutStyle, resource: NADIA, status: "confirmed", value: 85 },
      { id: "sal-c15", day: 4, start: "16:00", durationMin: 45, client: "Jasmine O.", service: SVC.blowout, resource: MARCO, status: "confirmed", value: 55 },
      // Saturday
      { id: "sal-c16", day: 5, start: "09:00", durationMin: 90, client: "Isabel M.", service: SVC.bridalTrial, resource: NADIA, status: "deposit", value: 150 },
      { id: "sal-c17", day: 5, start: "10:00", durationMin: 120, client: "Karina V.", service: SVC.singleColor, resource: JENNA, status: "confirmed", value: 120 },
    ],
  },

  inbox: [
    {
      id: "sal-m1",
      kind: "textback",
      ...ALERTS,
      subject: {
        en: "Alexis R. replied to your text-back: “Can you fix orange hair?”",
        es: "Alexis R. respondió a su texto automático: “¿Pueden arreglar un tono naranja?”",
      },
      preview: {
        en: "“I tried boxed dye and it went orange. Do you do color corrections? How much?”",
        es: "“Me puse un tinte de caja y me quedó naranja. ¿Hacen correcciones de color? ¿Cuánto cuesta?”",
      },
      received: { en: "9:09 AM", es: "9:09 AM" },
      unread: true,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Alexis R. called at 9:03 AM while the front desk was with a client. Your automatic text went out 5 seconds later, and she wrote back at 9:09:",
            es: "Alexis R. llamó a las 9:03 AM mientras la recepción atendía a una clienta. Su texto automático salió 5 segundos después y ella respondió a las 9:09:",
          },
          {
            en: "“Hi! I tried boxed dye and it went orange. Do you do color corrections? How much would that be?”",
            es: "“¡Hola! Me puse un tinte de caja y me quedó naranja. ¿Hacen correcciones de color? ¿Más o menos cuánto saldría?”",
          },
          {
            en: "Pick a reply below and it goes out from the salon's number. No typing needed.",
            es: "Elija una respuesta abajo y se envía desde el número del salón. No hace falta escribir nada.",
          },
        ],
        details: [
          { label: { en: "Caller", es: "Llamada de" }, value: { en: "Alexis R. · (305) 555-0146", es: "Alexis R. · (305) 555-0146" } },
          { label: { en: "Missed call", es: "Llamada perdida" }, value: { en: "9:03 AM", es: "9:03 AM" } },
          { label: { en: "Auto-text sent", es: "Texto automático" }, value: { en: "9:03 AM · 5 sec later", es: "9:03 AM · 5 s después" } },
          { label: { en: "Her reply", es: "Su respuesta" }, value: { en: "9:09 AM", es: "9:09 AM" } },
        ],
        primary: {
          label: { en: "Choose a quick reply", es: "Elegir una respuesta rápida" },
          action: "quickReply",
          done: { en: "Reply sent", es: "Respuesta enviada" },
        },
        quickReplies: [
          {
            en: "We can definitely help! Corrections start with a free 15-minute consult so Jenna can see your hair in person. She has Thursday at 4:30. Want it?",
            es: "¡Claro que podemos ayudarle! Las correcciones empiezan con una consulta gratis de 15 minutos para que Jenna vea su cabello en persona. Tiene el jueves a las 4:30. ¿Se lo apartamos?",
          },
          {
            en: "Yes! Send us a photo in natural light and Jenna will reply today with a price range.",
            es: "¡Sí! Envíenos una foto con luz natural y Jenna le responde hoy con un rango de precio.",
          },
          {
            en: "We do. Corrections usually run $180–$350, depending on your hair's length and color history. Use the booking link in our last text to grab a consult.",
            es: "Sí, las hacemos. Las correcciones suelen costar entre $180 y $350, según el largo y el historial de color de su cabello. Use el enlace de nuestro mensaje anterior para agendar una consulta.",
          },
        ],
        signoff: { en: "— Your SermaWebDesign text-back", es: "— Su texto automático de SermaWebDesign" },
      },
    },
    {
      id: "sal-m2",
      kind: "booking",
      ...ALERTS,
      subject: {
        en: "New booking: Lauren H. · Fri 9:30 AM with Jenna",
        es: "Nueva cita: Lauren H. · viernes 9:30 AM con Jenna",
      },
      preview: {
        en: "Full highlights, 2½ hrs · New color client · $50 deposit on hold.",
        es: "Mechas completas, 2½ h · Clienta nueva de color · Depósito de $50 retenido.",
      },
      received: { en: "7:22 AM", es: "7:22 AM" },
      unread: true,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Lauren H. booked full highlights with Jenna online this morning. She's new to the salon and sent two inspiration photos: dark blonde to bright and sunny for summer.",
            es: "Lauren H. agendó en línea esta mañana unas mechas completas con Jenna. Es clienta nueva y envió dos fotos de referencia: de rubio oscuro a un rubio luminoso para el verano.",
          },
          {
            en: "Her $50 deposit is on hold and is charged when you confirm. Since she's a new color client, the confirmation text also asks her to stop by for a quick patch test 48 hours before.",
            es: "Su depósito de $50 está retenido y se cobra cuando usted confirme. Como es clienta nueva de color, el texto de confirmación también le pide pasar a una breve prueba de alergia 48 horas antes.",
          },
        ],
        details: [
          { label: { en: "Client", es: "Clienta" }, value: { en: "Lauren H. · (305) 555-0139", es: "Lauren H. · (305) 555-0139" } },
          { label: { en: "Service", es: "Servicio" }, value: SVC.highlights },
          { label: { en: "When", es: "Cuándo" }, value: { en: "Fri, 9:30 AM–12:00 PM", es: "Viernes, 9:30 AM–12:00 PM" } },
          { label: { en: "Stylist", es: "Estilista" }, value: { en: "Jenna", es: "Jenna" } },
          { label: { en: "Deposit", es: "Depósito" }, value: { en: "$50 on hold · $160 due at checkout", es: "$50 retenidos · $160 al pagar" } },
          { label: { en: "Patch test", es: "Prueba de alergia" }, value: { en: "By Wednesday", es: "A más tardar el miércoles" } },
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
        calendarEventId: "sal-c13",
        signoff: { en: "— Your SermaWebDesign booking system", es: "— Su sistema de citas de SermaWebDesign" },
      },
    },
    {
      id: "sal-m3",
      kind: "review",
      ...ALERTS,
      subject: {
        en: "New 5★ Google review from Mariana G.",
        es: "Nueva reseña de 5★ en Google de Mariana G.",
      },
      preview: {
        en: "“Jenna took my brassy box-dye mess to a soft, buttery balayage…”",
        es: "“Jenna convirtió mi desastre de tinte de caja en un balayage suave y luminoso…”",
      },
      received: { en: "Yesterday, 7:45 PM", es: "Ayer, 7:45 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Mariana G. gave you 5 stars on Google after her balayage with Jenna:",
            es: "Mariana G. le dio 5 estrellas en Google después de su balayage con Jenna:",
          },
          {
            en: "“Jenna took my brassy box-dye mess to a soft, buttery balayage in one visit, and she was honest that my ends needed a trim first. The whole afternoon flew by. Booking online at 11 PM was a bonus.”",
            es: "“Jenna convirtió mi desastre de tinte de caja en un balayage suave y luminoso en una sola visita, y fue honesta al decirme que primero había que cortar las puntas. La tarde se me pasó volando. Y poder agendar en línea a las 11 de la noche fue un plus.”",
          },
          {
            en: "We drafted a warm reply that mentions her gloss refresh. Look it over in Reviews and post it with one tap.",
            es: "Le preparamos una respuesta cálida que menciona su próximo gloss. Revísela en Reseñas y publíquela con un toque.",
          },
        ],
        details: [
          { label: { en: "Rating", es: "Calificación" }, value: { en: "5 of 5", es: "5 de 5" } },
          { label: { en: "Platform", es: "Plataforma" }, value: { en: "Google", es: "Google" } },
          { label: { en: "Stylist", es: "Estilista" }, value: { en: "Jenna", es: "Jenna" } },
        ],
        primary: {
          label: { en: "Review & reply", es: "Revisar y responder" },
          action: "openReviews",
          done: { en: "Opened in Reviews", es: "Abierta en Reseñas" },
        },
        signoff: { en: "— SermaWebDesign review alerts", es: "— Alertas de reseñas de SermaWebDesign" },
      },
    },
    {
      id: "sal-m5",
      kind: "system",
      ...ALERTS,
      subject: {
        en: "Your weekly summary: 58 appointments, 11 color clients due back",
        es: "Su resumen semanal: 58 citas y 11 retoques de color por agendar",
      },
      preview: {
        en: "Jenna was booked solid. You have open time Wednesday afternoon and Friday morning.",
        es: "Jenna tuvo la agenda llena. Usted tiene espacio el miércoles por la tarde y el viernes por la mañana.",
      },
      received: { en: "Yesterday, 6:00 PM", es: "Ayer, 6:00 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Here's last week at Atelier Salon at a glance. Jenna had the fullest book, and most new clients found you through Google and Instagram.",
            es: "Este es un vistazo rápido a la semana pasada en Atelier Salon. Jenna tuvo la agenda más llena y la mayoría de los clientes nuevos llegaron por Google e Instagram.",
          },
          {
            en: "11 color clients reach their 5-week mark this week, and their rebooking reminders go out Tuesday morning. Your open Wednesday afternoon and Friday morning are a good fit for them.",
            es: "Esta semana, 11 clientes cumplen 5 semanas desde su último color y sus recordatorios para volver a agendar salen el martes por la mañana. Sus espacios libres del miércoles por la tarde y del viernes por la mañana son ideales para ellos.",
          },
        ],
        details: [
          { label: { en: "Appointments", es: "Citas" }, value: { en: "58", es: "58" } },
          { label: { en: "Booked online", es: "Agendadas en línea" }, value: { en: "33", es: "33" } },
          { label: { en: "Rebooked before leaving", es: "Reagendadas antes de salir" }, value: { en: "21", es: "21" } },
          { label: { en: "Missed calls answered by text", es: "Llamadas perdidas respondidas por texto" }, value: { en: "9", es: "9" } },
          { label: { en: "No-shows", es: "Inasistencias" }, value: { en: "1 · deposit kept", es: "1 · depósito retenido" } },
        ],
        primary: {
          label: { en: "Mark as reviewed", es: "Marcar como revisado" },
          action: "acknowledge",
          done: { en: "Marked as reviewed", es: "Marcado como revisado" },
        },
        signoff: { en: "— Your SermaWebDesign weekly summary", es: "— Su resumen semanal de SermaWebDesign" },
      },
    },
    {
      id: "sal-m4",
      kind: "payment",
      ...ALERTS,
      subject: {
        en: "Package purchased: 3 root touch-ups, $255 from Priya N.",
        es: "Paquete comprado: 3 retoques de raíz, $255 de Priya N.",
      },
      preview: {
        en: "Paid in full online. Her next visit is Mon 10:00 AM with you.",
        es: "Pagado por completo en línea. Su próxima visita es el lunes a las 10:00 AM con usted.",
      },
      received: { en: "Yesterday, 3:18 PM", es: "Ayer, 3:18 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Priya N. bought a root touch-up package from your booking page: three visits, paid in full, saving her $30 over booking them one at a time.",
            es: "Priya N. compró un paquete de retoques de raíz en su página de citas: tres visitas pagadas por completo, con un ahorro de $30 frente a pagarlas una por una.",
          },
          {
            en: "Each visit is deducted automatically at checkout, and her reminders stay on her usual 5-week cycle.",
            es: "Cada visita se descuenta automáticamente al pagar y sus recordatorios siguen su ciclo habitual de 5 semanas.",
          },
        ],
        details: [
          { label: { en: "Receipt", es: "Recibo" }, value: { en: "#ATS-1187", es: "#ATS-1187" } },
          { label: { en: "Package", es: "Paquete" }, value: { en: "Root touch-up × 3", es: "Retoque de raíz × 3" } },
          { label: { en: "Regular price", es: "Precio normal" }, value: { en: "$285.00", es: "$285.00" } },
          { label: { en: "Package price", es: "Precio del paquete" }, value: { en: "$255.00", es: "$255.00" } },
          { label: { en: "Next visit", es: "Próxima visita" }, value: { en: "Mon, 10:00 AM · Nadia", es: "Lunes, 10:00 AM · Nadia" } },
          { label: { en: "Card", es: "Tarjeta" }, value: { en: "Mastercard ending 0716", es: "Mastercard terminada en 0716" } },
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
  ],

  reviews: {
    average: 4.9,
    total: 164,
    distribution: [150, 10, 3, 1, 0],
    items: [
      {
        id: "sal-r1",
        author: "Mariana G.",
        rating: 5,
        platform: "google",
        when: { en: "Yesterday", es: "Ayer" },
        text: {
          en: "Jenna took my brassy box-dye mess to a soft, buttery balayage in one visit, and she was honest that my ends needed a trim first. The whole afternoon flew by. Booking online at 11 PM was a bonus.",
          es: "Jenna convirtió mi desastre de tinte de caja en un balayage suave y luminoso en una sola visita, y fue honesta al decirme que primero había que cortar las puntas. La tarde se me pasó volando. Y poder agendar en línea a las 11 de la noche fue un plus.",
        },
        suggestedReply: {
          en: "Mariana, thank you! Jenna loved this transformation. Your gloss refresh reminder will arrive in about 8 weeks to keep that tone just right.",
          es: "¡Gracias, Mariana! A Jenna le encantó esta transformación. En unas 8 semanas le llegará el recordatorio para su gloss y así mantener ese tono perfecto.",
        },
        replied: false,
      },
      {
        id: "sal-r2",
        author: "Elena V.",
        rating: 5,
        platform: "yelp",
        when: { en: "1 week ago", es: "Hace 1 semana" },
        text: {
          en: "Best blowout in Miami that actually survives the humidity. Nadia remembered how I like my part, and my last visit was three months ago.",
          es: "El mejor brushing de Miami, y de verdad aguanta la humedad. Nadia se acordó de cómo me gusta la raya, y mi última visita fue hace tres meses.",
        },
        suggestedReply: {
          en: "Elena, this made our day! See you before your next big event.",
          es: "¡Elena, nos alegró el día! La esperamos antes de su próximo evento.",
        },
        replied: true,
      },
      {
        id: "sal-r3",
        author: "Priya N.",
        rating: 5,
        platform: "facebook",
        when: { en: "2 weeks ago", es: "Hace 2 semanas" },
        text: {
          en: "Two years of root touch-ups here. The reminder texts land right on time, so I never end up with a grown-out stripe, and Nadia's color is always even.",
          es: "Llevo dos años haciéndome el retoque de raíz aquí. Los recordatorios llegan justo a tiempo, así que nunca se me nota la raíz crecida, y el color de Nadia siempre queda parejo.",
        },
        suggestedReply: {
          en: "Priya, thank you for two wonderful years! See you Monday.",
          es: "¡Priya, gracias por estos dos años tan bonitos! Nos vemos el lunes.",
        },
        replied: true,
      },
      {
        id: "sal-r4",
        author: "Tiffany K.",
        rating: 4,
        platform: "google",
        when: { en: "3 weeks ago", es: "Hace 3 semanas" },
        text: {
          en: "Gorgeous color, and Jenna really listened. Taking off one star because it ran about 45 minutes past the time I was quoted. If you're getting balayage, plan for extra time.",
          es: "Un color precioso y Jenna de verdad escuchó lo que yo quería. Le quito una estrella porque se tardó unos 45 minutos más de lo que me dijeron. Si va a hacerse balayage, reserve tiempo extra.",
        },
        suggestedReply: {
          en: "Thank you, Tiffany, and fair point. We've updated our balayage booking times so the estimate matches the real chair time. Can't wait to see you for your gloss.",
          es: "Gracias, Tiffany, y tiene razón. Ya ajustamos la duración de las citas de balayage para que el tiempo estimado coincida con el real. La esperamos para su gloss.",
        },
        replied: false,
      },
      {
        id: "sal-r5",
        author: "Kim D.",
        rating: 3,
        platform: "yelp",
        when: { en: "1 month ago", es: "Hace 1 mes" },
        text: {
          en: "My cut was lovely, but the toner came out much ashier than the photo I showed, and I was in a rush so I didn't say anything. I wish someone had checked the color with me before I left.",
          es: "El corte me quedó lindo, pero el matiz salió mucho más cenizo que la foto que mostré, y como iba con prisa no dije nada. Me hubiera gustado que alguien revisara el color conmigo antes de irme.",
        },
        suggestedReply: {
          en: "Kim, I'm so sorry the tone wasn't what you pictured, and thank you for telling us. We should have checked it with you in daylight before you left. Please come back for a complimentary gloss adjustment with Jenna; just mention this review when you book. — Nadia",
          es: "Kim, lamento mucho que el tono no fuera el que usted esperaba, y gracias por decírnoslo. Debimos revisarlo con usted con luz natural antes de que se fuera. La invitamos a volver para un ajuste de gloss sin costo con Jenna; solo mencione esta reseña al agendar. — Nadia",
        },
        replied: false,
      },
    ],
  },
};
