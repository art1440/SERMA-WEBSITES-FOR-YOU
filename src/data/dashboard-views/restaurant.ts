import type { NicheViews } from "./types";

/** PLACEHOLDER — replaced by the full sample set. Fictional demo data only. */
export const restaurantViews: NicheViews = {
  leads: [
    {
      id: "re-l1",
      name: "Marcus R.",
      phone: "(305) 555-0142",
      service: { en: "Skin fade + beard", es: "Degradado + barba" },
      value: 55,
      source: "missedCall",
      status: "new",
      received: { en: "Today, 9:12 AM", es: "Hoy, 9:12 AM" },
      note: { en: "Called during a cut — texted back in 4 sec", es: "Llamó durante un corte; se le escribió en 4 s" },
    },
    {
      id: "re-l2",
      name: "Andre T.",
      phone: "(305) 555-0177",
      service: { en: "Kid's cut", es: "Corte infantil" },
      value: 25,
      source: "website",
      status: "booked",
      received: { en: "Yesterday, 6:40 PM", es: "Ayer, 6:40 PM" },
      note: { en: "Booked Saturday 10:00 with Chair 2", es: "Agendó el sábado 10:00 en la Silla 2" },
    },
  ],
  calendar: {
    resources: [
      { en: "Chair 1", es: "Silla 1" },
      { en: "Chair 2", es: "Silla 2" },
    ],
    events: [
      {
        id: "re-c1",
        day: 3,
        start: "10:30",
        durationMin: 45,
        client: "Marcus R.",
        service: { en: "Skin fade + beard", es: "Degradado + barba" },
        resource: { en: "Chair 1", es: "Silla 1" },
        status: "deposit",
        value: 55,
      },
      {
        id: "re-c2",
        day: 5,
        start: "10:00",
        durationMin: 30,
        client: "Andre T.",
        service: { en: "Kid's cut", es: "Corte infantil" },
        resource: { en: "Chair 2", es: "Silla 2" },
        status: "confirmed",
        value: 25,
      },
    ],
  },
  inbox: [
    {
      id: "re-m1",
      kind: "booking",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: { en: "New booking: Marcus R. — Thursday 10:30 AM", es: "Nueva cita: Marcus R. — jueves 10:30 AM" },
      preview: { en: "Skin fade + beard on Chair 1. $15 deposit held.", es: "Degradado + barba en la Silla 1. Depósito de $15 retenido." },
      received: { en: "9:14 AM", es: "9:14 AM" },
      unread: true,
      email: {
        greeting: { en: "Hi Tony,", es: "Hola, Tony:" },
        paragraphs: [
          { en: "Marcus called while you were with a client. The system texted him back in 4 seconds and he booked himself.", es: "Marcus llamó mientras usted atendía a un cliente. El sistema le respondió por texto en 4 segundos y él mismo agendó." },
        ],
        details: [
          { label: { en: "Service", es: "Servicio" }, value: { en: "Skin fade + beard", es: "Degradado + barba" } },
          { label: { en: "When", es: "Cuándo" }, value: { en: "Thu, 10:30 AM · Chair 1", es: "Jue, 10:30 AM · Silla 1" } },
          { label: { en: "Deposit", es: "Depósito" }, value: { en: "$15 held", es: "$15 retenidos" } },
        ],
        primary: { label: { en: "Confirm booking", es: "Confirmar cita" }, action: "confirm", done: { en: "Booking confirmed", es: "Cita confirmada" } },
        secondary: { label: { en: "View in calendar", es: "Ver en el calendario" }, action: "openCalendar", done: { en: "Opened", es: "Abierto" } },
        calendarEventId: "re-c1",
        signoff: { en: "— Your SermaWebDesign system", es: "— Su sistema SermaWebDesign" },
      },
    },
  ],
  reviews: {
    average: 4.9,
    total: 212,
    distribution: [196, 12, 3, 1, 0],
    items: [
      {
        id: "re-r1",
        author: "Darnell K.",
        rating: 5,
        platform: "google",
        when: { en: "2 days ago", es: "Hace 2 días" },
        text: { en: "Booked online at midnight, got a reminder the day before, cleanest fade in town.", es: "Agendé en línea a medianoche, recibí un recordatorio un día antes y el mejor degradado de la ciudad." },
        suggestedReply: { en: "Thanks, Darnell! See you on your next cut.", es: "¡Gracias, Darnell! Lo esperamos en su próximo corte." },
        replied: false,
      },
    ],
  },
};
