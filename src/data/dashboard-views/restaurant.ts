import type { NicheViews } from "./types";

/**
 * Brasa Kitchen — a wood-fired grill restaurant (owner: Lucía).
 * FICTIONAL demo data only: every guest, phone (555-01xx) and email
 * (example domains) is made up. The demo week runs Mon–Sat; "today" is Monday.
 * Calendar = reservations for larger parties, private events and catering
 * (the bookings that need a human eye), not every walk-in table.
 */

const SIGNOFF = { en: "— Your SermaWebDesign system", es: "— Su sistema SermaWebDesign" };

const MAIN = { en: "Main room", es: "Salón principal" };
const PATIO = { en: "Patio", es: "Terraza" };
const PRIVATE = { en: "Private room", es: "Salón privado" };
const CATERING = { en: "Catering", es: "Catering" };

export const restaurantViews: NicheViews = {
  leads: [
    {
      id: "re-l1",
      name: "Natalie C.",
      phone: "(213) 555-0123",
      service: { en: "Rehearsal dinner, 30 guests", es: "Cena de ensayo, 30 personas" },
      value: 3200,
      source: "website",
      status: "new",
      received: { en: "Today, 9:03 AM", es: "Hoy, 9:03 AM" },
      note: {
        en: "Asked if the private room seats 30 and whether you offer a set menu",
        es: "Preguntó si el salón privado tiene cupo para 30 y si ofrecen menú fijo",
      },
    },
    {
      id: "re-l2",
      name: "Kim T.",
      phone: "(323) 555-0171",
      service: { en: "Birthday dinner, party of 12", es: "Cena de cumpleaños, grupo de 12" },
      value: 620,
      source: "missedCall",
      status: "new",
      received: { en: "Sat, 7:48 PM", es: "Sáb, 7:48 PM" },
      note: {
        en: "Called during the dinner rush; auto-text sent. Wants the patio this Saturday",
        es: "Llamó en plena hora de la cena; se le envió un texto. Quiere la terraza este sábado",
      },
    },
    {
      id: "re-l3",
      name: "Rosa M.",
      phone: "(213) 555-0135",
      service: { en: "50th anniversary catering, 60 guests", es: "Catering para 50.º aniversario, 60 personas" },
      value: 2400,
      source: "referral",
      status: "contacted",
      received: { en: "Yesterday, 2:15 PM", es: "Ayer, 2:15 PM" },
      note: {
        en: "Referred by Marco D.; wants family-style grill platters for a backyard party",
        es: "Recomendada por Marco D.; quiere bandejas a la parrilla para una fiesta en el jardín",
      },
    },
    {
      id: "re-l4",
      name: "Victor O.",
      phone: "(213) 555-0148",
      service: { en: "Office lunch catering, 40 guests", es: "Catering de almuerzo para oficina, 40 personas" },
      value: 1450,
      source: "google",
      status: "contacted",
      received: { en: "Sat, 10:12 AM", es: "Sáb, 10:12 AM" },
      note: {
        en: "Needs delivery by 11:30 AM; 6 vegetarian and 2 gluten-free",
        es: "Necesita la entrega antes de las 11:30 AM; 6 vegetarianos y 2 sin gluten",
      },
    },
    {
      id: "re-l5",
      name: "Ethan W.",
      phone: "(310) 555-0109",
      service: { en: "Holiday party, private room, 25 guests", es: "Fiesta de fin de año, salón privado, 25 personas" },
      value: 2100,
      source: "instagram",
      status: "booked",
      received: { en: "Sat, 4:30 PM", es: "Sáb, 4:30 PM" },
      note: {
        en: "Saw the short rib reel; booked the private room and paid the deposit",
        es: "Vio el reel de las costillas; reservó el salón privado y pagó el depósito",
      },
    },
    {
      id: "re-l6",
      name: "Jasmine W.",
      phone: "(213) 555-0192",
      service: { en: "Birthday dinner, party of 10", es: "Cena de cumpleaños, grupo de 10" },
      value: 520,
      source: "website",
      status: "booked",
      received: { en: "Fri, 11:20 AM", es: "Vie, 11:20 AM" },
      note: {
        en: "Booked Tue 5:00 PM on the patio; asked for a candle on the tres leches",
        es: "Reservó el martes a las 5:00 PM en la terraza; pidió una vela en el tres leches",
      },
    },
    {
      id: "re-l7",
      name: "Paul R.",
      phone: "(818) 555-0157",
      service: { en: "Wedding brunch, 45 guests", es: "Brunch de boda, 45 personas" },
      value: 2700,
      source: "google",
      status: "lost",
      received: { en: "Last week", es: "La semana pasada" },
      note: {
        en: "Chose a venue with on-site parking; asked you to keep him in mind next year",
        es: "Eligió un lugar con estacionamiento propio; pidió que lo tengan en cuenta el próximo año",
      },
    },
  ],

  calendar: {
    resources: [MAIN, PATIO, PRIVATE, CATERING],
    events: [
      // Monday
      {
        id: "re-c1",
        day: 0,
        start: "11:00",
        durationMin: 30,
        client: "Nina P.",
        service: { en: "Catering drop-off: office lunch for 25", es: "Entrega de catering: almuerzo de oficina para 25" },
        resource: CATERING,
        status: "confirmed",
        value: 725,
      },
      {
        id: "re-c2",
        day: 0,
        start: "17:30",
        durationMin: 90,
        client: "Owen B.",
        service: { en: "Table for 6", es: "Mesa para 6" },
        resource: MAIN,
        status: "confirmed",
        value: 270,
      },
      // Tuesday
      {
        id: "re-c3",
        day: 1,
        start: "12:00",
        durationMin: 90,
        client: "Meera S.",
        service: { en: "Business lunch, 12 guests", es: "Almuerzo de negocios, 12 personas" },
        resource: PRIVATE,
        status: "confirmed",
        value: 540,
      },
      {
        id: "re-c4",
        day: 1,
        start: "17:00",
        durationMin: 120,
        client: "Jasmine W.",
        service: { en: "Birthday dinner, party of 10", es: "Cena de cumpleaños, grupo de 10" },
        resource: PATIO,
        status: "deposit",
        value: 520,
      },
      // Wednesday
      {
        id: "re-c5",
        day: 2,
        start: "11:30",
        durationMin: 75,
        client: "Theo M.",
        service: { en: "Lunch, table for 4", es: "Almuerzo, mesa para 4" },
        resource: MAIN,
        status: "confirmed",
        value: 140,
      },
      {
        id: "re-c6",
        day: 2,
        start: "16:00",
        durationMin: 30,
        client: "Marco D.",
        service: { en: "Catering pickup: grill platters for 20", es: "Catering para recoger: bandejas a la parrilla para 20" },
        resource: CATERING,
        status: "confirmed",
        value: 560,
      },
      {
        id: "re-c7",
        day: 2,
        start: "17:30",
        durationMin: 90,
        client: "Kenji A.",
        service: { en: "Table for 6", es: "Mesa para 6" },
        resource: PATIO,
        status: "pending",
        value: 260,
      },
      // Thursday
      {
        id: "re-c8",
        day: 3,
        start: "15:00",
        durationMin: 60,
        client: "Claire B.",
        service: { en: "Menu tasting for a rehearsal dinner", es: "Degustación de menú para cena de ensayo" },
        resource: PRIVATE,
        status: "confirmed",
        value: 90,
      },
      {
        id: "re-c9",
        day: 3,
        start: "17:00",
        durationMin: 120,
        client: "Gloria V.",
        service: { en: "Retirement dinner, 16 guests", es: "Cena de jubilación, 16 personas" },
        resource: PRIVATE,
        status: "deposit",
        value: 1150,
      },
      {
        id: "re-c10",
        day: 3,
        start: "17:30",
        durationMin: 90,
        client: "Isaac R.",
        service: { en: "Table for 8", es: "Mesa para 8" },
        resource: MAIN,
        status: "confirmed",
        value: 380,
      },
      // Friday
      {
        id: "re-c11",
        day: 4,
        start: "11:30",
        durationMin: 30,
        client: "Bianca T.",
        service: { en: "Catering drop-off: law office lunch for 40", es: "Entrega de catering: almuerzo para un despacho de abogados, 40 personas" },
        resource: CATERING,
        status: "confirmed",
        value: 1400,
      },
      {
        id: "re-c12",
        day: 4,
        start: "12:30",
        durationMin: 90,
        client: "Leo F.",
        service: { en: "Team lunch, party of 8", es: "Almuerzo de equipo, grupo de 8" },
        resource: PATIO,
        status: "confirmed",
        value: 330,
      },
      {
        id: "re-c13",
        day: 4,
        start: "16:00",
        durationMin: 180,
        client: "Megan H.",
        service: { en: "Rehearsal dinner, 22 guests", es: "Cena de ensayo, 22 personas" },
        resource: PRIVATE,
        status: "deposit",
        value: 2400,
      },
      {
        id: "re-c14",
        day: 4,
        start: "17:30",
        durationMin: 90,
        client: "Ruben C.",
        service: { en: "Table for 6", es: "Mesa para 6" },
        resource: MAIN,
        status: "pending",
        value: 250,
      },
      // Saturday
      {
        id: "re-c15",
        day: 5,
        start: "10:00",
        durationMin: 120,
        client: "Alicia M.",
        service: { en: "Baby shower brunch, 12 guests", es: "Brunch de baby shower, 12 personas" },
        resource: PATIO,
        status: "deposit",
        value: 560,
      },
      {
        id: "re-c16",
        day: 5,
        start: "11:00",
        durationMin: 90,
        client: "Grant P.",
        service: { en: "Brunch, table for 6", es: "Brunch, mesa para 6" },
        resource: MAIN,
        status: "confirmed",
        value: 210,
      },
      {
        id: "re-c17",
        day: 5,
        start: "17:00",
        durationMin: 120,
        client: "Camila R.",
        service: { en: "Birthday dinner, party of 8", es: "Cena de cumpleaños, grupo de 8" },
        resource: PATIO,
        status: "pending",
        value: 400,
      },
    ],
  },

  inbox: [
    {
      id: "re-m1",
      kind: "booking",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "New reservation: Camila R., party of 8 — Sat 5:00 PM",
        es: "Nueva reservación: Camila R., grupo de 8 — sáb 5:00 PM",
      },
      preview: {
        en: "Birthday dinner on the patio. One guest is gluten-free.",
        es: "Cena de cumpleaños en la terraza. Una persona come sin gluten.",
      },
      received: { en: "9:36 AM", es: "9:36 AM" },
      unread: true,
      email: {
        greeting: { en: "Hi Lucía,", es: "Hola, Lucía:" },
        paragraphs: [
          {
            en: "Camila just booked a table on your website: a birthday dinner for 8 on the patio this Saturday. She added a note that one guest is gluten-free.",
            es: "Camila acaba de reservar en su sitio web: una cena de cumpleaños para 8 en la terraza este sábado. Agregó una nota: una de las personas come sin gluten.",
          },
          {
            en: "The table and her $160 deposit are on hold until you confirm. Once you do, she gets a confirmation text and a reminder the afternoon before.",
            es: "La mesa queda apartada y su depósito de $160 retenido hasta que usted confirme. Al hacerlo, ella recibe un texto de confirmación y un recordatorio la tarde anterior.",
          },
        ],
        details: [
          { label: { en: "Guest", es: "Cliente" }, value: { en: "Camila R. · (213) 555-0186", es: "Camila R. · (213) 555-0186" } },
          { label: { en: "Party", es: "Personas" }, value: { en: "8 guests", es: "8 personas" } },
          { label: { en: "When", es: "Cuándo" }, value: { en: "Sat, 5:00–7:00 PM", es: "Sáb, 5:00–7:00 PM" } },
          { label: { en: "Area", es: "Área" }, value: { en: "Patio", es: "Terraza" } },
          { label: { en: "Note", es: "Nota" }, value: { en: "Birthday · 1 gluten-free guest", es: "Cumpleaños · 1 persona sin gluten" } },
          { label: { en: "Deposit", es: "Depósito" }, value: { en: "$160 on hold · $20 per guest, parties of 8+", es: "$160 retenidos · $20 por persona, grupos de 8 o más" } },
        ],
        primary: {
          label: { en: "Confirm reservation", es: "Confirmar reservación" },
          action: "confirm",
          done: { en: "Reservation confirmed", es: "Reservación confirmada" },
        },
        secondary: {
          label: { en: "View in calendar", es: "Ver en el calendario" },
          action: "openCalendar",
          done: { en: "Opened in calendar", es: "Abierta en el calendario" },
        },
        calendarEventId: "re-c17",
        signoff: SIGNOFF,
      },
    },
    {
      id: "re-m2",
      kind: "textback",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "Kim T. replied to your text-back: “Patio for 12 on Saturday?”",
        es: "Kim T. respondió a su texto automático: “¿Terraza para 12 el sábado?”",
      },
      preview: {
        en: "“Can you fit 12 of us on the patio Saturday around 6? Can we bring a cake?”",
        es: "“¿Tienen lugar para 12 en la terraza el sábado como a las 6? ¿Podemos llevar pastel?”",
      },
      received: { en: "9:24 AM", es: "9:24 AM" },
      unread: true,
      email: {
        greeting: { en: "Hi Lucía,", es: "Hola, Lucía:" },
        paragraphs: [
          {
            en: "Kim T. called Saturday at 7:48 PM during the dinner rush. Your automatic text went out 5 seconds later, and she wrote back this morning at 9:24:",
            es: "Kim T. llamó el sábado a las 7:48 PM, en plena hora de la cena. Su texto automático salió 5 segundos después y ella respondió esta mañana a las 9:24:",
          },
          {
            en: "“Thanks for texting me back Saturday night! It's my sister's birthday and we're about 12 people. Can you fit us on the patio this Saturday around 6? Also, is it OK if we bring our own cake?”",
            es: "“¡Gracias por responderme el sábado en la noche! Es el cumpleaños de mi hermana y somos unas 12 personas. ¿Tienen lugar en la terraza este sábado como a las 6? Y otra pregunta: ¿podemos llevar nuestro propio pastel?”",
          },
          {
            en: "Pick a reply below and it goes out from the restaurant's number. No typing needed.",
            es: "Elija una respuesta abajo y se envía desde el número del restaurante. No hace falta escribir nada.",
          },
        ],
        details: [
          { label: { en: "Caller", es: "Llamada de" }, value: { en: "Kim T. · (323) 555-0171", es: "Kim T. · (323) 555-0171" } },
          { label: { en: "Missed call", es: "Llamada perdida" }, value: { en: "Sat, 7:48 PM", es: "Sáb, 7:48 PM" } },
          { label: { en: "Auto-text sent", es: "Texto automático" }, value: { en: "7:48 PM · 5 sec later", es: "7:48 PM · 5 s después" } },
          { label: { en: "Her reply", es: "Su respuesta" }, value: { en: "9:24 AM", es: "9:24 AM" } },
          { label: { en: "Request", es: "Solicitud" }, value: { en: "Party of 12 · Sat ~6:00 PM", es: "Grupo de 12 · sáb ~6:00 PM" } },
        ],
        primary: {
          label: { en: "Choose a quick reply", es: "Elegir una respuesta rápida" },
          action: "quickReply",
          done: { en: "Reply sent", es: "Respuesta enviada" },
        },
        secondary: {
          label: { en: "Open lead", es: "Abrir prospecto" },
          action: "openLeads",
          done: { en: "Opened in Leads", es: "Abierto en Prospectos" },
        },
        quickReplies: [
          {
            en: "Hi Kim, it's Lucía from Brasa! The patio is booked Saturday evening, but we can seat 12 in the main room at 6:00 PM. Want me to hold it?",
            es: "Hola, Kim, habla Lucía de Brasa. La terraza ya está reservada el sábado por la tarde, pero podemos recibir a 12 personas en el salón principal a las 6:00 PM. ¿Se la aparto?",
          },
          {
            en: "Of course you can bring your cake — we'll plate and serve it for $2 per guest. A $20-per-guest deposit ($240) holds a table for 12.",
            es: "Claro que puede traer su pastel; nosotros lo servimos por $2 por persona. Con un depósito de $20 por persona ($240) apartamos la mesa para 12.",
          },
          {
            en: "Thanks for the text, Kim! I'm prepping for lunch right now — I'll call you before 3 PM to set everything up.",
            es: "¡Gracias por su mensaje, Kim! Estoy preparando el servicio del almuerzo; la llamo antes de las 3 PM para dejar todo listo.",
          },
        ],
        signoff: { en: "— Your SermaWebDesign text-back", es: "— Su texto automático de SermaWebDesign" },
      },
    },
    {
      id: "re-m3",
      kind: "lead",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "New private-event lead: rehearsal dinner for 30 (est. $3,200)",
        es: "Nuevo prospecto de evento privado: cena de ensayo para 30 (aprox. $3,200)",
      },
      preview: {
        en: "Natalie C. asked about the private room and a set menu.",
        es: "Natalie C. preguntó por el salón privado y un menú fijo.",
      },
      received: { en: "9:05 AM", es: "9:05 AM" },
      unread: false,
      email: {
        greeting: { en: "Hi Lucía,", es: "Hola, Lucía:" },
        paragraphs: [
          {
            en: "Natalie filled out the private-events form on your website. She's planning a rehearsal dinner for about 30 guests on a Friday this spring and wants to know if the private room fits that many and whether you offer a set menu.",
            es: "Natalie llenó el formulario de eventos privados en su sitio web. Está organizando una cena de ensayo para unas 30 personas un viernes de esta primavera y quiere saber si el salón privado tiene cupo y si ofrecen menú fijo.",
          },
          {
            en: "At $3,200 it's one of your highest-value leads this month; it's waiting in Leads. A call or text today keeps it warm.",
            es: "Con $3,200 es uno de sus prospectos de mayor valor del mes; lo encuentra en Prospectos. Una llamada o un texto hoy mantiene el interés.",
          },
        ],
        details: [
          { label: { en: "Contact", es: "Contacto" }, value: { en: "Natalie C. · (213) 555-0123", es: "Natalie C. · (213) 555-0123" } },
          { label: { en: "Event", es: "Evento" }, value: { en: "Rehearsal dinner", es: "Cena de ensayo" } },
          { label: { en: "Guests", es: "Personas" }, value: { en: "About 30", es: "Unas 30" } },
          { label: { en: "Est. value", es: "Valor estimado" }, value: { en: "$3,200", es: "$3,200" } },
          { label: { en: "Source", es: "Origen" }, value: { en: "Website form", es: "Formulario del sitio web" } },
        ],
        primary: {
          label: { en: "Open lead", es: "Abrir prospecto" },
          action: "openLeads",
          done: { en: "Opened in Leads", es: "Abierto en Prospectos" },
        },
        secondary: {
          label: { en: "Mark as handled", es: "Marcar como atendido" },
          action: "acknowledge",
          done: { en: "Marked as handled", es: "Marcado como atendido" },
        },
        signoff: SIGNOFF,
      },
    },
    {
      id: "re-m4",
      kind: "payment",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "Deposit received: $500 from Ethan W. — holiday party",
        es: "Depósito recibido: $500 de Ethan W. — fiesta de fin de año",
      },
      preview: {
        en: "Private room held for 25 guests. Balance due the night of the event.",
        es: "Salón privado apartado para 25 personas. El saldo se paga la noche del evento.",
      },
      received: { en: "Yesterday, 4:18 PM", es: "Ayer, 4:18 PM" },
      unread: false,
      email: {
        greeting: { en: "Hi Lucía,", es: "Hola, Lucía:" },
        paragraphs: [
          {
            en: "Ethan paid the deposit for his company's holiday party, so the private room is now held for his group. The receipt is below for your records.",
            es: "Ethan pagó el depósito de la fiesta de fin de año de su empresa, así que el salón privado ya está apartado para su grupo. Abajo tiene el recibo para sus registros.",
          },
        ],
        details: [
          { label: { en: "Receipt", es: "Recibo" }, value: { en: "#BK-2291", es: "#BK-2291" } },
          { label: { en: "Event", es: "Evento" }, value: { en: "Holiday party · Private room", es: "Fiesta de fin de año · Salón privado" } },
          { label: { en: "Guests", es: "Personas" }, value: { en: "25", es: "25" } },
          { label: { en: "Deposit paid", es: "Depósito pagado" }, value: { en: "$500.00", es: "$500.00" } },
          { label: { en: "Paid with", es: "Forma de pago" }, value: { en: "Visa ending 4417", es: "Visa terminada en 4417" } },
          { label: { en: "Est. balance", es: "Saldo estimado" }, value: { en: "$1,600, due at the event", es: "$1,600, a pagar en el evento" } },
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
        signoff: SIGNOFF,
      },
    },
    {
      id: "re-m5",
      kind: "review",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "New 5★ Google review from Sophie A.",
        es: "Nueva reseña de 5★ en Google de Sophie A.",
      },
      preview: {
        en: "“We came for my mom's 60th and there was a handwritten card waiting…”",
        es: "“Vinimos por los 60 años de mi mamá y nos esperaba una tarjeta escrita a mano…”",
      },
      received: { en: "Yesterday, 1:30 PM", es: "Ayer, 1:30 PM" },
      unread: false,
      email: {
        greeting: { en: "Hi Lucía,", es: "Hola, Lucía:" },
        paragraphs: [
          {
            en: "Sophie A. left you a 5-star review on Google after her family's dinner on Saturday:",
            es: "Sophie A. le dejó una reseña de 5 estrellas en Google después de la cena familiar del sábado:",
          },
          {
            en: "“We came for my mom's 60th and there was a handwritten card waiting at the table. The short rib falls apart, and the chimichurri is the best I've had outside Buenos Aires.”",
            es: "“Vinimos por los 60 años de mi mamá y en la mesa nos esperaba una tarjeta escrita a mano. Las costillas se deshacen y el chimichurri es el mejor que he probado fuera de Buenos Aires.”",
          },
          {
            en: "A short, personal reply is ready for you in Reviews.",
            es: "En Reseñas ya tiene lista una respuesta breve y personal.",
          },
        ],
        primary: {
          label: { en: "Review & reply", es: "Revisar y responder" },
          action: "openReviews",
          done: { en: "Opened in Reviews", es: "Abierta en Reseñas" },
        },
        signoff: SIGNOFF,
      },
    },
  ],

  reviews: {
    average: 4.7,
    total: 286,
    distribution: [221, 46, 12, 4, 3],
    items: [
      {
        id: "re-r1",
        author: "Sophie A.",
        rating: 5,
        platform: "google",
        when: { en: "Yesterday", es: "Ayer" },
        text: {
          en: "We came for my mom's 60th and there was a handwritten card waiting at the table. The short rib falls apart, and the chimichurri is the best I've had outside Buenos Aires. Booking by text took two minutes.",
          es: "Vinimos por los 60 años de mi mamá y en la mesa nos esperaba una tarjeta escrita a mano. Las costillas se deshacen y el chimichurri es el mejor que he probado fuera de Buenos Aires. Reservar por texto tomó dos minutos.",
        },
        suggestedReply: {
          en: "Sophie, thank you for celebrating your mom with us! The grill team is thrilled the chimichurri passed the Buenos Aires test. Happy 60th to her, and we hope to see you all again soon.",
          es: "Sophie, ¡gracias por celebrar a su mamá con nosotros! El equipo de la parrilla está feliz de que el chimichurri pasara la prueba de Buenos Aires. Feliz cumpleaños 60 para ella; esperamos verlos pronto.",
        },
        replied: false,
      },
      {
        id: "re-r2",
        author: "Diego F.",
        rating: 5,
        platform: "yelp",
        when: { en: "4 days ago", es: "Hace 4 días" },
        text: {
          en: "Ordered pickup straight from their website instead of an app. It was ready right on time, still hot, and cheaper. The grilled octopus traveled surprisingly well.",
          es: "Pedí para recoger directamente en su sitio web en lugar de una app. Estuvo listo a tiempo, todavía caliente y más barato. El pulpo a la parrilla aguantó muy bien el viaje.",
        },
        suggestedReply: {
          en: "Diego, thanks for ordering direct — it means a lot to a local kitchen. Glad the octopus held up! Next time, try it fresh off the grill on the patio.",
          es: "Diego, gracias por pedir directo; eso significa mucho para una cocina local. ¡Qué bueno que el pulpo llegó bien! La próxima vez pruébelo recién salido de la parrilla en la terraza.",
        },
        replied: true,
      },
      {
        id: "re-r3",
        author: "Hannah K.",
        rating: 4,
        platform: "google",
        when: { en: "1 week ago", es: "Hace 1 semana" },
        text: {
          en: "Great food, and our server Luis was wonderful. One star off only because the patio got loud on a Friday night and it was hard to talk.",
          es: "La comida excelente y nuestro mesero, Luis, fue encantador. Le quito una estrella solo porque la terraza estaba muy ruidosa un viernes por la noche y costaba platicar.",
        },
        suggestedReply: {
          en: "Thank you, Hannah — we'll pass your kind words to Luis. You're right about Friday nights on the patio. For a quieter evening, ask for a window table in the main room when you book.",
          es: "Gracias, Hannah; le pasaremos sus palabras a Luis. Tiene razón sobre los viernes en la terraza. Si busca algo más tranquilo, pida una mesa junto a la ventana en el salón principal al reservar.",
        },
        replied: false,
      },
      {
        id: "re-r4",
        author: "Tom B.",
        rating: 3,
        platform: "yelp",
        when: { en: "2 weeks ago", es: "Hace 2 semanas" },
        text: {
          en: "The food was very good, but we waited 25 minutes past our reservation time even though we booked ahead. The host apologized and comped dessert, but it put a damper on the night.",
          es: "La comida estuvo muy buena, pero esperamos 25 minutos después de la hora de nuestra reservación, aunque reservamos con tiempo. El anfitrión se disculpó y nos invitó el postre, pero nos arruinó un poco la noche.",
        },
        suggestedReply: {
          en: "Tom, we're sorry. A 25-minute wait on a reserved table isn't the evening we want for anyone. We've changed how we space Saturday reservations so it doesn't happen again. We'd love another chance; mention this review when you book and the first round is on us.",
          es: "Tom, lo sentimos mucho. Esperar 25 minutos con una mesa reservada no es la experiencia que queremos para nadie. Ya ajustamos cómo espaciamos las reservaciones de los sábados para que no se repita. Nos encantaría tener otra oportunidad: mencione esta reseña al reservar y la primera ronda corre por nuestra cuenta.",
        },
        replied: false,
      },
      {
        id: "re-r5",
        author: "Alejandra R.",
        rating: 5,
        platform: "facebook",
        when: { en: "3 weeks ago", es: "Hace 3 semanas" },
        text: {
          en: "Hosted our team dinner in the private room for 18. They handled the set menu, the vegetarian options and the split checks without a single hiccup.",
          es: "Hicimos la cena de nuestro equipo en el salón privado para 18 personas. Se encargaron del menú fijo, las opciones vegetarianas y las cuentas separadas sin ningún problema.",
        },
        suggestedReply: {
          en: "Alejandra, thank you for trusting us with your team's dinner! Split checks for 18 is our kind of challenge. We'd be glad to host you again.",
          es: "Alejandra, ¡gracias por confiarnos la cena de su equipo! Dividir la cuenta entre 18 es nuestro tipo de reto. Con gusto los recibimos otra vez.",
        },
        replied: true,
      },
    ],
  },
};
