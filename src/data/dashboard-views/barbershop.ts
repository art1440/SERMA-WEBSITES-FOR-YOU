import type { L10n } from "@/i18n/types";
import type { NicheViews } from "./types";

/**
 * Northside Barber Co. (fictional, Chicago, 312). Owner: Tony.
 * Three chairs: Andre (Chair 1), Tony (Chair 2), Rico (Chair 3).
 * Every person, phone, email and number below is FICTIONAL demo data.
 */

const CHAIR_ANDRE: L10n = { en: "Chair 1 · Andre", es: "Silla 1 · Andre" };
const CHAIR_TONY: L10n = { en: "Chair 2 · Tony", es: "Silla 2 · Tony" };
const CHAIR_RICO: L10n = { en: "Chair 3 · Rico", es: "Silla 3 · Rico" };

/** Menu: Classic cut $40 · 30m, Skin fade $45 · 45m, Cut + beard $60 · 60m, The Works $75 · 75m,
 *  Line-up $20 · 15m, Kids' cut $30 · 30m, Hot towel shave $45 · 45m, Taper + design $50 · 45m. */
const SVC = {
  classic: { en: "Classic cut", es: "Corte clásico" },
  skinFade: { en: "Skin fade", es: "Skin fade" },
  cutBeard: { en: "Cut + beard", es: "Corte + barba" },
  works: { en: "The Works: fade, beard, hot towel", es: "Servicio completo: fade, barba y toalla caliente" },
  lineUp: { en: "Line-up", es: "Perfilado" },
  kids: { en: "Kids' cut", es: "Corte infantil" },
  hotTowel: { en: "Hot towel shave", es: "Afeitado con toalla caliente" },
  taperDesign: { en: "Taper + design", es: "Taper con diseño" },
} satisfies Record<string, L10n>;

const ALERTS = { from: "SermaWebDesign Alerts", fromEmail: "alerts@example.com" } as const;
const HI: L10n = { en: "Hi Tony,", es: "Hola, Tony:" };

export const barbershopViews: NicheViews = {
  leads: [
    {
      id: "bar-l1",
      name: "Jordan P.",
      phone: "(312) 555-0119",
      service: SVC.lineUp,
      value: 20,
      source: "missedCall",
      status: "new",
      received: { en: "Today, 8:41 AM", es: "Hoy, 8:41 AM" },
      note: {
        en: "Wants a line-up before a 1 PM job interview",
        es: "Quiere un perfilado antes de una entrevista de trabajo a la 1 PM",
      },
    },
    {
      id: "bar-l2",
      name: "Brandon T.",
      phone: "(312) 555-0163",
      service: { en: "Wedding party of 6: cuts + beards", es: "Boda, grupo de 6: cortes + barba" },
      value: 405,
      source: "website",
      status: "new",
      received: { en: "Yesterday, 9:26 PM", es: "Ayer, 9:26 PM" },
      note: {
        en: "Groom + 5 groomsmen, all three chairs Saturday 8 AM before photos",
        es: "El novio y 5 padrinos; las tres sillas el sábado a las 8 AM, antes de las fotos",
      },
    },
    {
      id: "bar-l3",
      name: "Kevin D.",
      phone: "(312) 555-0127",
      service: { en: "Kids' cuts ×2", es: "Cortes infantiles ×2" },
      value: 60,
      source: "google",
      status: "contacted",
      received: { en: "Yesterday, 4:20 PM", es: "Ayer, 4:20 PM" },
      note: {
        en: "Asked if you do kids' cuts on Saturdays — two boys, 6 and 9",
        es: "Preguntó si hacen cortes infantiles los sábados; dos niños de 6 y 9 años",
      },
    },
    {
      id: "bar-l4",
      name: "Omar S.",
      phone: "(312) 555-0185",
      service: { en: "Burst fade + beard sculpt", es: "Burst fade + perfilado de barba" },
      value: 60,
      source: "instagram",
      status: "contacted",
      received: { en: "Yesterday, 11:02 AM", es: "Ayer, 11:02 AM" },
      note: {
        en: "Sent a burst fade photo by DM — asked if Andre does those",
        es: "Mandó por DM una foto de un burst fade; preguntó si Andre los hace",
      },
    },
    {
      id: "bar-l5",
      name: "Javier M.",
      phone: "(312) 555-0134",
      service: SVC.works,
      value: 75,
      source: "website",
      status: "booked",
      received: { en: "Today, 7:58 AM", es: "Hoy, 7:58 AM" },
      note: {
        en: "Booked online before opening — Thu 5:15 PM with Andre",
        es: "Agendó en línea antes de abrir: jueves 5:15 PM con Andre",
      },
    },
    {
      id: "bar-l6",
      name: "Dwayne H.",
      phone: "(312) 555-0151",
      service: SVC.cutBeard,
      value: 60,
      source: "referral",
      status: "booked",
      received: { en: "Sat, 3:15 PM", es: "Sáb, 3:15 PM" },
      note: {
        en: "Referred by Luis G. — booked this Sat 10:00 AM with Tony",
        es: "Recomendado por Luis G.; agendó para este sábado 10:00 AM con Tony",
      },
    },
    {
      id: "bar-l7",
      name: "Nate F.",
      phone: "(312) 555-0108",
      service: SVC.hotTowel,
      value: 45,
      source: "google",
      status: "lost",
      received: { en: "Last week", es: "La semana pasada" },
      note: {
        en: "Only free on Sundays — the shop is closed Sundays",
        es: "Solo tiene libres los domingos y la barbería cierra ese día",
      },
    },
  ],

  calendar: {
    resources: [CHAIR_ANDRE, CHAIR_TONY, CHAIR_RICO],
    events: [
      // Monday
      { id: "bar-c1", day: 0, start: "10:00", durationMin: 60, client: "Luis G.", service: SVC.cutBeard, resource: CHAIR_TONY, status: "confirmed", value: 60 },
      { id: "bar-c2", day: 0, start: "13:00", durationMin: 45, client: "Ray C.", service: SVC.skinFade, resource: CHAIR_TONY, status: "confirmed", value: 45 },
      // Tuesday
      { id: "bar-c3", day: 1, start: "09:00", durationMin: 15, client: "Tyrell W.", service: SVC.lineUp, resource: CHAIR_ANDRE, status: "confirmed", value: 20 },
      { id: "bar-c4", day: 1, start: "11:30", durationMin: 45, client: "Sam O.", service: SVC.taperDesign, resource: CHAIR_RICO, status: "deposit", value: 50 },
      { id: "bar-c5", day: 1, start: "16:30", durationMin: 60, client: "Miguel A.", service: SVC.cutBeard, resource: CHAIR_TONY, status: "confirmed", value: 60 },
      // Wednesday
      { id: "bar-c6", day: 2, start: "08:30", durationMin: 45, client: "Chris L.", service: SVC.skinFade, resource: CHAIR_ANDRE, status: "confirmed", value: 45 },
      { id: "bar-c7", day: 2, start: "12:00", durationMin: 45, client: "Hector V.", service: SVC.hotTowel, resource: CHAIR_TONY, status: "pending", value: 45 },
      { id: "bar-c8", day: 2, start: "15:30", durationMin: 30, client: "Mateo S.", service: SVC.kids, resource: CHAIR_RICO, status: "confirmed", value: 30 },
      // Thursday
      { id: "bar-c9", day: 3, start: "10:30", durationMin: 45, client: "Marcus R.", service: SVC.skinFade, resource: CHAIR_ANDRE, status: "confirmed", value: 45 },
      { id: "bar-c10", day: 3, start: "13:00", durationMin: 30, client: "Bryce A.", service: SVC.classic, resource: CHAIR_RICO, status: "confirmed", value: 40 },
      { id: "bar-c11", day: 3, start: "17:15", durationMin: 75, client: "Javier M.", service: SVC.works, resource: CHAIR_ANDRE, status: "pending", value: 75 },
      // Friday
      { id: "bar-c12", day: 4, start: "09:30", durationMin: 60, client: "Keith B.", service: SVC.cutBeard, resource: CHAIR_TONY, status: "deposit", value: 60 },
      { id: "bar-c13", day: 4, start: "14:00", durationMin: 45, client: "Isaiah N.", service: SVC.skinFade, resource: CHAIR_ANDRE, status: "deposit", value: 45 },
      { id: "bar-c14", day: 4, start: "17:00", durationMin: 60, client: "Victor P.", service: SVC.cutBeard, resource: CHAIR_RICO, status: "confirmed", value: 60 },
      // Saturday
      { id: "bar-c15", day: 5, start: "08:00", durationMin: 45, client: "Tyler G.", service: SVC.skinFade, resource: CHAIR_ANDRE, status: "confirmed", value: 45 },
      { id: "bar-c16", day: 5, start: "10:00", durationMin: 60, client: "Dwayne H.", service: SVC.cutBeard, resource: CHAIR_TONY, status: "confirmed", value: 60 },
      { id: "bar-c17", day: 5, start: "10:00", durationMin: 30, client: "Leo B.", service: SVC.kids, resource: CHAIR_RICO, status: "confirmed", value: 30 },
    ],
  },

  inbox: [
    {
      id: "bar-m1",
      kind: "textback",
      ...ALERTS,
      subject: {
        en: "Jordan P. replied to your text-back: “Line-up before 1?”",
        es: "Jordan P. respondió a su texto automático: “¿Perfilado antes de la 1?”",
      },
      preview: {
        en: "“Any chance I can get a quick line-up before 1? Got a job interview today.”",
        es: "“¿Habrá chance de un perfilado rápido antes de la 1? Hoy tengo una entrevista de trabajo.”",
      },
      received: { en: "8:47 AM", es: "8:47 AM" },
      unread: true,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Jordan P. called the shop at 8:41 AM while you were with a client. Your automatic text went out 4 seconds later, and he wrote back at 8:47:",
            es: "Jordan P. llamó a la barbería a las 8:41 AM mientras usted atendía a un cliente. Su texto automático salió 4 segundos después y él respondió a las 8:47:",
          },
          {
            en: "“Hey, any chance I can get a quick line-up before 1? Got a job interview today.”",
            es: "“Hola, ¿habrá chance de un perfilado rápido antes de la 1? Hoy tengo una entrevista de trabajo.”",
          },
          {
            en: "Pick a reply below and it goes out from the shop's number. No typing needed.",
            es: "Elija una respuesta abajo y se envía desde el número de la barbería. No hace falta escribir nada.",
          },
        ],
        details: [
          { label: { en: "Caller", es: "Llamada de" }, value: { en: "Jordan P. · (312) 555-0119", es: "Jordan P. · (312) 555-0119" } },
          { label: { en: "Missed call", es: "Llamada perdida" }, value: { en: "8:41 AM", es: "8:41 AM" } },
          { label: { en: "Auto-text sent", es: "Texto automático" }, value: { en: "8:41 AM · 4 sec later", es: "8:41 AM · 4 s después" } },
          { label: { en: "His reply", es: "Su respuesta" }, value: { en: "8:47 AM", es: "8:47 AM" } },
        ],
        primary: {
          label: { en: "Choose a quick reply", es: "Elegir una respuesta rápida" },
          action: "quickReply",
          done: { en: "Reply sent", es: "Respuesta enviada" },
        },
        quickReplies: [
          {
            en: "Yes! Rico has 11:15 open. Reply YES and it's yours. Good luck at the interview!",
            es: "¡Claro que sí! Rico tiene libre a las 11:15. Responda SÍ y se lo apartamos. ¡Mucha suerte en la entrevista!",
          },
          {
            en: "Andre can fit you in at 12:15 for a line-up ($20, about 15 min). Want it?",
            es: "Andre puede atenderle a las 12:15 para un perfilado ($20, unos 15 min). ¿Le interesa?",
          },
          {
            en: "Sorry, we're booked solid until 1 today. Walk-ins are welcome after 4 if that works another day.",
            es: "Lo sentimos, hoy estamos llenos hasta la 1. Después de las 4 atendemos sin cita, por si le sirve otro día.",
          },
        ],
        signoff: { en: "— Your SermaWebDesign text-back", es: "— Su texto automático de SermaWebDesign" },
      },
    },
    {
      id: "bar-m2",
      kind: "booking",
      ...ALERTS,
      subject: {
        en: "New booking: Javier M. · Thu 5:15 PM with Andre",
        es: "Nueva cita: Javier M. · jueves 5:15 PM con Andre",
      },
      preview: {
        en: "The Works, 75 min · $20 deposit on hold until you confirm.",
        es: "Servicio completo, 75 min · Depósito de $20 retenido hasta que usted confirme.",
      },
      received: { en: "7:58 AM", es: "7:58 AM" },
      unread: true,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Javier M. booked himself online at 7:58 AM, before the shop even opened. He picked The Works with Andre, and he's a first-time client.",
            es: "Javier M. agendó en línea a las 7:58 AM, antes de que abriera la barbería. Eligió el Servicio completo con Andre y es cliente nuevo.",
          },
          {
            en: "His $20 no-show deposit is on hold and is charged when you confirm. He'll then get a text with the address, where to park and your 24-hour cancellation policy.",
            es: "Su depósito de $20 contra inasistencias está retenido y se cobra cuando usted confirme. Después recibirá un texto con la dirección, dónde estacionarse y su política de cancelación de 24 horas.",
          },
        ],
        details: [
          { label: { en: "Client", es: "Cliente" }, value: { en: "Javier M. · (312) 555-0134", es: "Javier M. · (312) 555-0134" } },
          { label: { en: "Service", es: "Servicio" }, value: SVC.works },
          { label: { en: "When", es: "Cuándo" }, value: { en: "Thu, 5:15–6:30 PM", es: "Jueves, 5:15–6:30 PM" } },
          { label: { en: "Barber", es: "Barbero" }, value: { en: "Andre · Chair 1", es: "Andre · Silla 1" } },
          { label: { en: "Deposit", es: "Depósito" }, value: { en: "$20 on hold · $55 due at the chair", es: "$20 retenidos · $55 al terminar" } },
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
        calendarEventId: "bar-c11",
        signoff: { en: "— Your SermaWebDesign booking system", es: "— Su sistema de citas de SermaWebDesign" },
      },
    },
    {
      id: "bar-m3",
      kind: "lead",
      ...ALERTS,
      subject: {
        en: "New lead: wedding party of 6, est. $405",
        es: "Nuevo prospecto: boda, grupo de 6, aprox. $405",
      },
      preview: {
        en: "Brandon T. wants cuts and beards for the groom and 5 groomsmen on a Saturday morning.",
        es: "Brandon T. quiere cortes y barba para el novio y 5 padrinos un sábado por la mañana.",
      },
      received: { en: "Yesterday, 9:26 PM", es: "Ayer, 9:26 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Brandon T. filled out the group-booking form on your website. He's getting married in three weeks and wants the whole party looking sharp for photos.",
            es: "Brandon T. llenó el formulario de grupos en su sitio web. Se casa en tres semanas y quiere que todo el grupo llegue bien arreglado a las fotos.",
          },
          {
            en: "He's asking for all three chairs from 8:00 AM, plus a hot towel shave for the groom. He mentioned he's checking with two other shops, so a quick reply helps.",
            es: "Pide las tres sillas desde las 8:00 AM y un afeitado con toalla caliente para el novio. Comentó que también está consultando con otras dos barberías, así que conviene responderle pronto.",
          },
        ],
        details: [
          { label: { en: "Contact", es: "Contacto" }, value: { en: "Brandon T. · (312) 555-0163", es: "Brandon T. · (312) 555-0163" } },
          { label: { en: "Party", es: "Grupo" }, value: { en: "Groom + 5 groomsmen", es: "Novio + 5 padrinos" } },
          { label: { en: "Date", es: "Fecha" }, value: { en: "Saturday, 3 weeks out · 8:00 AM", es: "Un sábado, dentro de 3 semanas · 8:00 AM" } },
          { label: { en: "Services", es: "Servicios" }, value: { en: "6 × cut + beard, 1 hot towel shave", es: "6 × corte + barba, 1 afeitado con toalla caliente" } },
          { label: { en: "Estimate", es: "Estimado" }, value: { en: "$405", es: "$405" } },
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
      id: "bar-m4",
      kind: "review",
      ...ALERTS,
      subject: {
        en: "New 5★ Google review from Darnell K.",
        es: "Nueva reseña de 5★ en Google de Darnell K.",
      },
      preview: {
        en: "“Booked on my phone at midnight, got a reminder the day before…”",
        es: "“Agendé desde el celular a medianoche, me llegó un recordatorio un día antes…”",
      },
      received: { en: "Yesterday, 6:12 PM", es: "Ayer, 6:12 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Darnell K. just gave you 5 stars on Google for his skin fade with Rico:",
            es: "Darnell K. le acaba de dar 5 estrellas en Google por su skin fade con Rico:",
          },
          {
            en: "“Booked on my phone at midnight, got a reminder the day before, and Rico gave me the cleanest skin fade I've had in years. In the chair right on time, out in 45 minutes.”",
            es: "“Agendé desde el celular a medianoche, me llegó un recordatorio un día antes y Rico me hizo el skin fade más limpio que me han hecho en años. Me sentaron a la hora exacta y salí en 45 minutos.”",
          },
          {
            en: "We drafted a short reply in your voice. Look it over in Reviews and post it with one tap.",
            es: "Le preparamos una respuesta breve con su estilo. Revísela en Reseñas y publíquela con un toque.",
          },
        ],
        details: [
          { label: { en: "Rating", es: "Calificación" }, value: { en: "5 of 5", es: "5 de 5" } },
          { label: { en: "Platform", es: "Plataforma" }, value: { en: "Google", es: "Google" } },
          { label: { en: "Barber", es: "Barbero" }, value: { en: "Rico", es: "Rico" } },
        ],
        primary: {
          label: { en: "Review & reply", es: "Revisar y responder" },
          action: "openReviews",
          done: { en: "Opened in Reviews", es: "Abierto en Reseñas" },
        },
        signoff: { en: "— SermaWebDesign review alerts", es: "— Alertas de reseñas de SermaWebDesign" },
      },
    },
    {
      id: "bar-m5",
      kind: "payment",
      ...ALERTS,
      subject: {
        en: "Deposit received: $20 from Keith B. for Fri 9:30 AM",
        es: "Depósito recibido: $20 de Keith B. para el viernes 9:30 AM",
      },
      preview: {
        en: "Cut + beard with Tony. $40 balance due at the chair.",
        es: "Corte + barba con Tony. Saldo de $40 al terminar.",
      },
      received: { en: "Yesterday, 2:30 PM", es: "Ayer, 2:30 PM" },
      unread: false,
      email: {
        greeting: HI,
        paragraphs: [
          {
            en: "Keith B. paid his no-show deposit for Friday, so his slot is held. If he cancels with less than 24 hours' notice, the deposit stays with the shop under your policy.",
            es: "Keith B. pagó su depósito contra inasistencias para el viernes, así que su horario queda asegurado. Si cancela con menos de 24 horas de aviso, el depósito se queda en la barbería según su política.",
          },
          {
            en: "The full receipt is below. Nothing else to do: the balance is collected at the chair.",
            es: "El recibo completo está abajo. No tiene que hacer nada más: el saldo se cobra al terminar el servicio.",
          },
        ],
        details: [
          { label: { en: "Receipt", es: "Recibo" }, value: { en: "#NBC-20418", es: "#NBC-20418" } },
          { label: { en: "Service", es: "Servicio" }, value: { en: "Cut + beard · Tony", es: "Corte + barba · Tony" } },
          { label: { en: "Appointment", es: "Cita" }, value: { en: "Fri, 9:30 AM · Chair 2", es: "Viernes, 9:30 AM · Silla 2" } },
          { label: { en: "Deposit paid", es: "Depósito pagado" }, value: { en: "$20.00", es: "$20.00" } },
          { label: { en: "Balance at the chair", es: "Saldo al terminar" }, value: { en: "$40.00", es: "$40.00" } },
          { label: { en: "Card", es: "Tarjeta" }, value: { en: "Visa ending 7731", es: "Visa terminada en 7731" } },
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
    average: 4.8,
    total: 212,
    distribution: [180, 22, 6, 2, 2],
    items: [
      {
        id: "bar-r1",
        author: "Darnell K.",
        rating: 5,
        platform: "google",
        when: { en: "Yesterday", es: "Ayer" },
        text: {
          en: "Booked on my phone at midnight, got a reminder the day before, and Rico gave me the cleanest skin fade I've had in years. In the chair right on time, out in 45 minutes.",
          es: "Agendé desde el celular a medianoche, me llegó un recordatorio un día antes y Rico me hizo el skin fade más limpio que me han hecho en años. Me sentaron a la hora exacta y salí en 45 minutos.",
        },
        suggestedReply: {
          en: "Appreciate you, Darnell! Rico's going to love reading this. Your next reminder will find you in about three weeks. See you then.",
          es: "¡Gracias, Darnell! A Rico le va a encantar leer esto. Su próximo recordatorio le llegará en unas tres semanas. ¡Lo esperamos!",
        },
        replied: false,
      },
      {
        id: "bar-r2",
        author: "Gabriel O.",
        rating: 5,
        platform: "yelp",
        when: { en: "1 week ago", es: "Hace 1 semana" },
        text: {
          en: "Brought my 7-year-old for his first real haircut. Andre was patient, let him hold the clippers (switched off), and took a photo for us at the end. He's already asking when he can go back.",
          es: "Llevé a mi hijo de 7 años a su primer corte de verdad. Andre tuvo mucha paciencia, le dejó sostener la máquina (apagada) y al final nos tomó una foto. Ya está preguntando cuándo puede volver.",
        },
        suggestedReply: {
          en: "Thanks, Gabriel! First cuts are a big deal around here. Andre says your son sat like a pro. Bring him back anytime.",
          es: "¡Gracias, Gabriel! Aquí los primeros cortes son algo especial. Andre dice que su hijo se portó como todo un profesional. Tráigalo cuando quiera.",
        },
        replied: true,
      },
      {
        id: "bar-r3",
        author: "Luis G.",
        rating: 5,
        platform: "google",
        when: { en: "2 weeks ago", es: "Hace 2 semanas" },
        text: {
          en: "Been going to Tony for four years. Hot towel, straight-razor neckline, real conversation. Now I book from my phone instead of calling between meetings.",
          es: "Llevo cuatro años yendo con Tony. Toalla caliente, nuca con navaja y buena plática. Ahora agendo desde el celular en vez de llamar entre reuniones.",
        },
        suggestedReply: {
          en: "Four years, Luis! Thank you for sticking with us. Your chair's always ready.",
          es: "¡Cuatro años, Luis! Gracias por su confianza. Su silla siempre está lista.",
        },
        replied: true,
      },
      {
        id: "bar-r4",
        author: "Sean M.",
        rating: 4,
        platform: "facebook",
        when: { en: "3 weeks ago", es: "Hace 3 semanas" },
        text: {
          en: "Great fade, fair price, friendly crew. Only knock is Saturday parking: took me 10 minutes to find a spot. Leave a little early.",
          es: "Excelente fade, buen precio y un equipo muy amable. Lo único es el estacionamiento los sábados: tardé 10 minutos en encontrar lugar. Salgan con tiempo.",
        },
        suggestedReply: {
          en: "Thanks for the honest note, Sean. Saturdays on our block are rough; the side street behind the shop usually has open spots before 10. Glad the fade made up for it.",
          es: "Gracias por su comentario honesto, Sean. Los sábados nuestra cuadra se llena; en la calle de atrás de la barbería casi siempre hay lugar antes de las 10. Qué bueno que el fade valió la pena.",
        },
        replied: false,
      },
      {
        id: "bar-r5",
        author: "Corey J.",
        rating: 3,
        platform: "yelp",
        when: { en: "1 month ago", es: "Hace 1 mes" },
        text: {
          en: "The cut itself was solid, but I waited 25 minutes past my booked time on a Friday evening and nobody gave me a heads-up. If you take appointments, keep to them.",
          es: "El corte estuvo bien, pero esperé 25 minutos después de la hora de mi cita un viernes en la tarde y nadie me avisó. Si dan citas, hay que respetarlas.",
        },
        suggestedReply: {
          en: "Corey, you're right, and I'm sorry. A 25-minute wait on a booked appointment isn't how we want to run. We've added buffer time on Friday evenings and now text clients if a barber is running behind. Your next cut is on me if you'll give us another shot. — Tony",
          es: "Corey, tiene toda la razón y le pido una disculpa. Esperar 25 minutos teniendo cita no es como queremos trabajar. Ya dejamos más margen entre citas los viernes en la tarde y ahora avisamos por texto si un barbero va atrasado. Si nos da otra oportunidad, su próximo corte va por nuestra cuenta. — Tony",
        },
        replied: false,
      },
    ],
  },
};
