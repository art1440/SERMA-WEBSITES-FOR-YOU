import type { NicheViews } from "./types";

/**
 * Clearline Home Services — HVAC, plumbing, exterior and cleaning crews
 * (owner: Dana). FICTIONAL demo data only: every customer, phone (555-01xx)
 * and email (example domains) is made up. The demo week runs Mon–Sat;
 * "today" is Monday.
 */

const SIGNOFF = { en: "— Your SermaWebDesign system", es: "— Su sistema SermaWebDesign" };

const MIKE = { en: "Tech Mike (HVAC)", es: "Técnico Mike (HVAC)" };
const ANA = { en: "Tech Ana (plumbing)", es: "Técnica Ana (plomería)" };
const EXTERIOR = { en: "Exterior crew", es: "Equipo de exteriores" };
const CLEANING = { en: "Cleaning team", es: "Equipo de limpieza" };

export const serviceViews: NicheViews = {
  leads: [
    {
      id: "se-l1",
      name: "Elaine F.",
      phone: "(404) 555-0138",
      service: { en: "Furnace tune-up", es: "Mantenimiento del calefactor" },
      value: 129,
      source: "website",
      status: "booked",
      received: { en: "Today, 8:30 AM", es: "Hoy, 8:30 AM" },
      note: {
        en: "Booked online for Thu; asked the tech to test her CO detectors too",
        es: "Agendó en línea para el jueves; pidió que también revisen sus detectores de CO",
      },
    },
    {
      id: "se-l2",
      name: "Keisha M.",
      phone: "(678) 555-0115",
      service: { en: "No heat: furnace won't light", es: "Sin calefacción: el calefactor no enciende" },
      value: 340,
      source: "missedCall",
      status: "new",
      received: { en: "Today, 7:52 AM", es: "Hoy, 7:52 AM" },
      note: {
        en: "Called before you opened; auto-text sent. House is at 58 °F with a toddler",
        es: "Llamó antes de abrir; se le envió un texto. La casa está a 58 °F y tiene un niño pequeño",
      },
    },
    {
      id: "se-l3",
      name: "Andrew P.",
      phone: "(770) 555-0183",
      service: { en: "Gutter guards, whole house", es: "Protectores de canaletas, toda la casa" },
      value: 1850,
      source: "google",
      status: "new",
      received: { en: "Yesterday, 9:40 PM", es: "Ayer, 9:40 PM" },
      note: {
        en: "Two-story home under big oaks; has the gutters cleaned 3 times a year now",
        es: "Casa de dos pisos bajo robles grandes; actualmente manda limpiar las canaletas 3 veces al año",
      },
    },
    {
      id: "se-l4",
      name: "Lauren G.",
      phone: "(404) 555-0126",
      service: { en: "Tankless water heater install", es: "Instalación de calentador sin tanque" },
      value: 3800,
      source: "website",
      status: "contacted",
      received: { en: "Yesterday, 3:40 PM", es: "Ayer, 3:40 PM" },
      note: {
        en: "Her 50-gallon tank is 14 years old; comparing tankless vs. a new tank",
        es: "Su tanque de 50 galones tiene 14 años; compara un calentador sin tanque con uno de tanque nuevo",
      },
    },
    {
      id: "se-l5",
      name: "Marisol V.",
      phone: "(404) 555-0191",
      service: { en: "Gutter cleaning + downspout flush", es: "Limpieza de canaletas + bajantes" },
      value: 180,
      source: "referral",
      status: "booked",
      received: { en: "Sat, 2:30 PM", es: "Sáb, 2:30 PM" },
      note: {
        en: "Referred by her neighbor Beth A.; booked Tue with the exterior crew",
        es: "Recomendada por su vecina Beth A.; agendó el martes con el equipo de exteriores",
      },
    },
    {
      id: "se-l6",
      name: "Jamal E.",
      phone: "(470) 555-0169",
      service: { en: "Move-out deep clean", es: "Limpieza profunda de mudanza" },
      value: 340,
      source: "instagram",
      status: "contacted",
      received: { en: "Sat, 11:15 AM", es: "Sáb, 11:15 AM" },
      note: {
        en: "Lease ends at month-end; needs it done before the landlord walkthrough",
        es: "Su contrato termina a fin de mes; lo necesita antes de la revisión del arrendador",
      },
    },
    {
      id: "se-l7",
      name: "Doug H.",
      phone: "(678) 555-0144",
      service: { en: "Whole-house duct cleaning", es: "Limpieza de ductos de toda la casa" },
      value: 480,
      source: "google",
      status: "lost",
      received: { en: "Last week", es: "La semana pasada" },
      note: {
        en: "Went with a $99 coupon company; may call back about the dryer vent",
        es: "Se fue con una empresa de cupones de $99; quizá llame por el ducto de la secadora",
      },
    },
  ],

  calendar: {
    resources: [MIKE, ANA, EXTERIOR, CLEANING],
    events: [
      // Tech Mike — heating and cooling
      {
        id: "se-c1",
        day: 0,
        start: "08:00",
        durationMin: 90,
        client: "Joan P.",
        service: { en: "Furnace safety check + filter change", es: "Revisión de seguridad del calefactor + cambio de filtro" },
        resource: MIKE,
        status: "confirmed",
        value: 129,
      },
      {
        id: "se-c2",
        day: 0,
        start: "11:00",
        durationMin: 120,
        client: "Rob K.",
        service: { en: "Heat pump diagnostic + repair", es: "Diagnóstico y reparación de bomba de calor" },
        resource: MIKE,
        status: "confirmed",
        value: 340,
      },
      {
        id: "se-c3",
        day: 1,
        start: "13:00",
        durationMin: 90,
        client: "Alicia W.",
        service: { en: "Smart thermostat install", es: "Instalación de termostato inteligente" },
        resource: MIKE,
        status: "confirmed",
        value: 245,
      },
      {
        id: "se-c4",
        day: 3,
        start: "09:00",
        durationMin: 90,
        client: "Elaine F.",
        service: { en: "Furnace tune-up + CO detector check", es: "Mantenimiento del calefactor + revisión de detectores de CO" },
        resource: MIKE,
        status: "pending",
        value: 129,
      },
      {
        id: "se-c5",
        day: 4,
        start: "14:00",
        durationMin: 120,
        client: "Terrence J.",
        service: { en: "Heat pump tune-up", es: "Mantenimiento de bomba de calor" },
        resource: MIKE,
        status: "confirmed",
        value: 149,
      },
      // Tech Ana — plumbing and water heaters
      {
        id: "se-c6",
        day: 0,
        start: "09:00",
        durationMin: 60,
        client: "Gloria S.",
        service: { en: "Kitchen faucet replacement", es: "Cambio de llave de la cocina" },
        resource: ANA,
        status: "confirmed",
        value: 185,
      },
      {
        id: "se-c7",
        day: 1,
        start: "08:00",
        durationMin: 90,
        client: "Nathan B.",
        service: { en: "Water heater flush + anode check", es: "Purga del calentador de agua + revisión del ánodo" },
        resource: ANA,
        status: "confirmed",
        value: 120,
      },
      {
        id: "se-c8",
        day: 2,
        start: "08:00",
        durationMin: 480,
        client: "Yvonne T.",
        service: { en: "Tankless water heater install", es: "Instalación de calentador sin tanque" },
        resource: ANA,
        status: "deposit",
        value: 3650,
      },
      {
        id: "se-c9",
        day: 4,
        start: "10:00",
        durationMin: 60,
        client: "Kyle B.",
        service: { en: "Garbage disposal replacement", es: "Cambio de triturador de basura" },
        resource: ANA,
        status: "confirmed",
        value: 295,
      },
      // Exterior crew — gutters, pressure washing, windows
      {
        id: "se-c10",
        day: 1,
        start: "09:00",
        durationMin: 180,
        client: "Marisol V.",
        service: { en: "Gutter cleaning + downspout flush", es: "Limpieza de canaletas + bajantes" },
        resource: EXTERIOR,
        status: "confirmed",
        value: 180,
      },
      {
        id: "se-c11",
        day: 2,
        start: "13:00",
        durationMin: 240,
        client: "Hector R.",
        service: { en: "Pressure washing: driveway + siding", es: "Lavado a presión: entrada + fachada" },
        resource: EXTERIOR,
        status: "deposit",
        value: 425,
      },
      {
        id: "se-c12",
        day: 3,
        start: "08:30",
        durationMin: 180,
        client: "Brenda O.",
        service: { en: "Gutter cleaning, two-story", es: "Limpieza de canaletas, dos pisos" },
        resource: EXTERIOR,
        status: "confirmed",
        value: 240,
      },
      {
        id: "se-c13",
        day: 5,
        start: "09:00",
        durationMin: 180,
        client: "Faith K.",
        service: { en: "Window cleaning, inside + out", es: "Limpieza de ventanas, por dentro + por fuera" },
        resource: EXTERIOR,
        status: "pending",
        value: 360,
      },
      // Cleaning team
      {
        id: "se-c14",
        day: 0,
        start: "13:00",
        durationMin: 240,
        client: "Sam W.",
        service: { en: "Move-out deep clean", es: "Limpieza profunda de mudanza" },
        resource: CLEANING,
        status: "confirmed",
        value: 320,
      },
      {
        id: "se-c15",
        day: 2,
        start: "09:00",
        durationMin: 180,
        client: "Renee C.",
        service: { en: "Deep clean, 3 bed / 2 bath", es: "Limpieza profunda, 3 recámaras / 2 baños" },
        resource: CLEANING,
        status: "confirmed",
        value: 280,
      },
      {
        id: "se-c16",
        day: 4,
        start: "09:00",
        durationMin: 180,
        client: "Nadia H.",
        service: { en: "Biweekly home cleaning", es: "Limpieza quincenal de la casa" },
        resource: CLEANING,
        status: "confirmed",
        value: 165,
      },
      {
        id: "se-c17",
        day: 5,
        start: "10:00",
        durationMin: 240,
        client: "Gavin P.",
        service: { en: "Post-renovation clean", es: "Limpieza después de remodelación" },
        resource: CLEANING,
        status: "deposit",
        value: 450,
      },
    ],
  },

  inbox: [
    {
      id: "se-m1",
      kind: "booking",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "New booking: Elaine F. — furnace tune-up, Thu 9:00 AM",
        es: "Nueva cita: Elaine F. — mantenimiento del calefactor, jue 9:00 AM",
      },
      preview: {
        en: "Booked online with Mike. She asked for a CO detector check too.",
        es: "Agendó en línea con Mike. También pidió revisar los detectores de CO.",
      },
      received: { en: "8:31 AM", es: "8:31 AM" },
      unread: true,
      email: {
        greeting: { en: "Hi Dana,", es: "Hola, Dana:" },
        paragraphs: [
          {
            en: "Elaine booked a furnace tune-up on your website at 8:30 AM. She picked Thursday, 9:00–10:30 AM with Mike and asked him to test her carbon monoxide detectors while he's there.",
            es: "Elaine agendó un mantenimiento del calefactor en su sitio web a las 8:30 AM. Eligió el jueves de 9:00 a 10:30 AM con Mike y pidió que, de paso, revise sus detectores de monóxido de carbono.",
          },
          {
            en: "Confirm the visit and she gets a text with Mike's name and photo, plus a reminder the evening before.",
            es: "Confirme la cita y ella recibirá un texto con el nombre y la foto de Mike, además de un recordatorio la noche anterior.",
          },
        ],
        details: [
          { label: { en: "Customer", es: "Cliente" }, value: { en: "Elaine F. · (404) 555-0138", es: "Elaine F. · (404) 555-0138" } },
          { label: { en: "Service", es: "Servicio" }, value: { en: "Furnace tune-up + CO check", es: "Mantenimiento del calefactor + revisión de CO" } },
          { label: { en: "When", es: "Cuándo" }, value: { en: "Thu, 9:00–10:30 AM", es: "Jue, 9:00–10:30 AM" } },
          { label: { en: "Technician", es: "Técnico" }, value: { en: "Mike", es: "Mike" } },
          { label: { en: "Price", es: "Precio" }, value: { en: "$129 flat rate", es: "$129 tarifa fija" } },
        ],
        primary: {
          label: { en: "Confirm visit", es: "Confirmar cita" },
          action: "confirm",
          done: { en: "Visit confirmed", es: "Cita confirmada" },
        },
        secondary: {
          label: { en: "View in calendar", es: "Ver en el calendario" },
          action: "openCalendar",
          done: { en: "Opened in calendar", es: "Abierta en el calendario" },
        },
        calendarEventId: "se-c4",
        signoff: SIGNOFF,
      },
    },
    {
      id: "se-m2",
      kind: "textback",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "Keisha M. replied to your text-back: “Can someone come today?”",
        es: "Keisha M. respondió a su texto automático: “¿Puede venir alguien hoy?”",
      },
      preview: {
        en: "“Our furnace clicks but won't light, and it's 58 degrees in here with a toddler.”",
        es: "“Nuestro calefactor hace clic pero no enciende, y la casa está a 58 grados con un niño pequeño.”",
      },
      received: { en: "8:05 AM", es: "8:05 AM" },
      unread: true,
      email: {
        greeting: { en: "Hi Dana,", es: "Hola, Dana:" },
        paragraphs: [
          {
            en: "Keisha M. called at 7:52 AM, before you opened. Your automatic text went out 6 seconds later, and she wrote back at 8:05:",
            es: "Keisha M. llamó a las 7:52 AM, antes de que usted abriera. Su texto automático salió 6 segundos después y ella respondió a las 8:05:",
          },
          {
            en: "“Thanks for texting back so fast! Our furnace clicks but won't light, and it's 58 degrees in here with a toddler. Can someone come out today? And what do you charge for a service call?”",
            es: "“¡Gracias por responder tan rápido! Nuestro calefactor hace clic pero no enciende, y la casa está a 58 grados con un niño pequeño. ¿Puede venir alguien hoy? ¿Y cuánto cobran por la visita?”",
          },
          {
            en: "Pick a reply below and it goes out from your business number. No typing needed.",
            es: "Elija una respuesta abajo y se envía desde el número de su negocio. No hace falta escribir nada.",
          },
        ],
        details: [
          { label: { en: "Caller", es: "Llamada de" }, value: { en: "Keisha M. · (678) 555-0115", es: "Keisha M. · (678) 555-0115" } },
          { label: { en: "Missed call", es: "Llamada perdida" }, value: { en: "7:52 AM", es: "7:52 AM" } },
          { label: { en: "Auto-text sent", es: "Texto automático" }, value: { en: "7:52 AM · 6 sec later", es: "7:52 AM · 6 s después" } },
          { label: { en: "Her reply", es: "Su respuesta" }, value: { en: "8:05 AM", es: "8:05 AM" } },
          { label: { en: "System", es: "Equipo" }, value: { en: "Gas furnace, about 12 years old", es: "Calefactor de gas, unos 12 años" } },
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
            en: "Hi Keisha, it's Dana at Clearline. Mike can be there today between 2 and 4 PM. A $50 deposit holds the visit, and it's credited toward the repair.",
            es: "Hola, Keisha, habla Dana de Clearline. Mike puede llegar hoy entre las 2 y las 4 PM. Un depósito de $50 aparta la visita y se descuenta de la reparación.",
          },
          {
            en: "Today is full, but I can hold our first slot tomorrow, 8–10 AM. In the meantime, check that the furnace switch is on and the filter isn't clogged.",
            es: "Hoy ya no tenemos espacio, pero le puedo apartar el primer horario de mañana, de 8 a 10 AM. Mientras tanto, revise que el interruptor del calefactor esté encendido y que el filtro no esté tapado.",
          },
          {
            en: "So sorry about the cold! I'll call you in 5 minutes to walk you through a quick reset.",
            es: "¡Lamento mucho el frío! La llamo en 5 minutos para guiarla en un reinicio rápido.",
          },
        ],
        signoff: { en: "— Your SermaWebDesign text-back", es: "— Su texto automático de SermaWebDesign" },
      },
    },
    {
      id: "se-m3",
      kind: "system",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "Your week at Clearline: 38 jobs, $10,480 invoiced",
        es: "Su semana en Clearline: 38 trabajos, $10,480 facturados",
      },
      preview: {
        en: "Plus 19 review requests sent and a 9-second average text-back time.",
        es: "Además, 19 solicitudes de reseña enviadas y 9 segundos de respuesta promedio.",
      },
      received: { en: "6:00 AM", es: "6:00 AM" },
      unread: false,
      email: {
        greeting: { en: "Good morning, Dana,", es: "Buenos días, Dana:" },
        paragraphs: [
          {
            en: "Here's how last week went. Thursday was your busiest day, and gutter cleaning was the most-booked service.",
            es: "Así le fue la semana pasada. El jueves fue su día más ocupado y la limpieza de canaletas fue el servicio más agendado.",
          },
          {
            en: "One larger quote is still open: Lauren G.'s tankless water heater (est. $3,800). It's waiting for you in Leads.",
            es: "Queda abierta una cotización grande: el calentador sin tanque de Lauren G. (aprox. $3,800). La encuentra en Prospectos.",
          },
        ],
        details: [
          { label: { en: "Jobs completed", es: "Trabajos completados" }, value: { en: "38", es: "38" } },
          { label: { en: "Invoiced", es: "Facturado" }, value: { en: "$10,480", es: "$10,480" } },
          { label: { en: "New leads", es: "Nuevos prospectos" }, value: { en: "27", es: "27" } },
          { label: { en: "Review requests sent", es: "Solicitudes de reseña" }, value: { en: "19", es: "19" } },
          { label: { en: "New reviews", es: "Reseñas nuevas" }, value: { en: "7 (avg. 4.9★)", es: "7 (prom. 4.9★)" } },
          { label: { en: "Avg. text-back time", es: "Respuesta promedio" }, value: { en: "9 seconds", es: "9 segundos" } },
        ],
        primary: {
          label: { en: "Mark as reviewed", es: "Marcar como revisado" },
          action: "acknowledge",
          done: { en: "Marked as reviewed", es: "Marcado como revisado" },
        },
        secondary: {
          label: { en: "Open lead", es: "Abrir prospecto" },
          action: "openLeads",
          done: { en: "Opened in Leads", es: "Abierto en Prospectos" },
        },
        signoff: SIGNOFF,
      },
    },
    {
      id: "se-m4",
      kind: "review",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "New 5★ Google review from Beth A.",
        es: "Nueva reseña de 5★ en Google de Beth A.",
      },
      preview: {
        en: "“Gutters and dryer vent done in one visit, with before-and-after photos.”",
        es: "“Canaletas y ducto de la secadora en una sola visita, con fotos de antes y después.”",
      },
      received: { en: "Yesterday, 6:40 PM", es: "Ayer, 6:40 PM" },
      unread: false,
      email: {
        greeting: { en: "Hi Dana,", es: "Hola, Dana:" },
        paragraphs: [
          {
            en: "Beth A. left you a 5-star review on Google, the day after her gutter cleaning (job #318):",
            es: "Beth A. le dejó una reseña de 5 estrellas en Google, un día después de la limpieza de sus canaletas (trabajo #318):",
          },
          {
            en: "“Gutters AND dryer vent done in one visit. They texted when they were 20 minutes out, wore shoe covers inside, and sent before-and-after photos.”",
            es: "“Canaletas Y ducto de la secadora en una sola visita. Avisaron por texto 20 minutos antes de llegar, usaron cubrezapatos adentro y mandaron fotos de antes y después.”",
          },
          {
            en: "A suggested reply is ready for you in Reviews.",
            es: "En Reseñas ya tiene lista una respuesta sugerida.",
          },
        ],
        primary: {
          label: { en: "Review & reply", es: "Revisar y responder" },
          action: "openReviews",
          done: { en: "Opened in Reviews", es: "Abierto en Reseñas" },
        },
        signoff: SIGNOFF,
      },
    },
    {
      id: "se-m5",
      kind: "payment",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "Invoice #318 paid: $349 from Beth A.",
        es: "Factura #318 pagada: $349 de Beth A.",
      },
      preview: {
        en: "Gutter cleaning, downspout flush and dryer vent. Paid in full by card.",
        es: "Limpieza de canaletas, bajantes y ducto de la secadora. Pagada completa con tarjeta.",
      },
      received: { en: "Sat, 2:51 PM", es: "Sáb, 2:51 PM" },
      unread: false,
      email: {
        greeting: { en: "Hi Dana,", es: "Hola, Dana:" },
        paragraphs: [
          {
            en: "Beth paid invoice #318 in full from the text link right after the crew wrapped up. Her receipt is below.",
            es: "Beth pagó la factura #318 completa desde el enlace del texto en cuanto el equipo terminó. Abajo está su recibo.",
          },
          {
            en: "A review request goes out to her automatically tomorrow morning.",
            es: "Mañana por la mañana se le enviará automáticamente una solicitud de reseña.",
          },
        ],
        details: [
          { label: { en: "Gutter cleaning, 1-story (160 ft)", es: "Limpieza de canaletas, 1 piso (160 pies)" }, value: { en: "$180.00", es: "$180.00" } },
          { label: { en: "Downspout flush (×4)", es: "Limpieza de bajantes (×4)" }, value: { en: "$40.00", es: "$40.00" } },
          { label: { en: "Dryer vent cleaning", es: "Limpieza del ducto de la secadora" }, value: { en: "$129.00", es: "$129.00" } },
          { label: { en: "Total paid", es: "Total pagado" }, value: { en: "$349.00", es: "$349.00" } },
          { label: { en: "Paid with", es: "Forma de pago" }, value: { en: "Visa ending 0198", es: "Visa terminada en 0198" } },
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
  ],

  reviews: {
    average: 4.9,
    total: 164,
    distribution: [151, 9, 2, 1, 1],
    items: [
      {
        id: "se-r1",
        author: "Beth A.",
        rating: 5,
        platform: "google",
        when: { en: "Yesterday", es: "Ayer" },
        text: {
          en: "Gutters AND dryer vent done in one visit. They texted when they were 20 minutes out, wore shoe covers inside, and sent before-and-after photos. Already booked them again for spring.",
          es: "Canaletas Y ducto de la secadora en una sola visita. Avisaron por texto 20 minutos antes de llegar, usaron cubrezapatos adentro y mandaron fotos de antes y después. Ya los agendé otra vez para la primavera.",
        },
        suggestedReply: {
          en: "Thank you, Beth! Those before-and-after photos were satisfying for us too. We'll see you in the spring, and your reminder will come by text a few days before.",
          es: "¡Gracias, Beth! Esas fotos de antes y después también nos dieron gusto a nosotros. La esperamos en la primavera; le llegará un recordatorio por texto unos días antes.",
        },
        replied: false,
      },
      {
        id: "se-r2",
        author: "Carlos M.",
        rating: 5,
        platform: "facebook",
        when: { en: "5 days ago", es: "Hace 5 días" },
        text: {
          en: "Our water heater started leaking on a Sunday. I got a text back within seconds, and Ana had a new one installed by Monday afternoon. Fair price, and she explained every step.",
          es: "Nuestro calentador empezó a gotear un domingo. Me respondieron por texto en segundos y Ana instaló uno nuevo el lunes por la tarde. Precio justo, y nos explicó cada paso.",
        },
        suggestedReply: {
          en: "Carlos, a leaking water heater on a Sunday is no fun. We're glad Ana got you back to hot showers fast. Thanks for the kind words; we'll pass them on to her.",
          es: "Carlos, un calentador goteando en domingo no es nada agradable. Nos alegra que Ana les devolviera el agua caliente tan rápido. Gracias por sus palabras; se las haremos llegar.",
        },
        replied: true,
      },
      {
        id: "se-r3",
        author: "Wendy S.",
        rating: 4,
        platform: "yelp",
        when: { en: "1 week ago", es: "Hace 1 semana" },
        text: {
          en: "Very thorough deep clean and a friendly team. The only reason for 4 stars: they arrived at the very end of the 2-hour window, though they did text to let me know.",
          es: "Una limpieza profunda muy minuciosa y un equipo amable. La única razón de las 4 estrellas: llegaron al final de la ventana de 2 horas, aunque sí me avisaron por texto.",
        },
        suggestedReply: {
          en: "Thanks, Wendy, we're glad the house sparkled. A late-window arrival eats into your day, so we're moving cleaning visits to tighter one-hour windows.",
          es: "Gracias, Wendy; nos alegra que la casa quedara reluciente. Sabemos que llegar al final de la ventana le quita tiempo, así que estamos pasando las limpiezas a ventanas más cortas de una hora.",
        },
        replied: false,
      },
      {
        id: "se-r4",
        author: "Ron D.",
        rating: 3,
        platform: "google",
        when: { en: "2 weeks ago", es: "Hace 2 semanas" },
        text: {
          en: "The tech knew his stuff and the furnace works now, but I was quoted one price on the phone and the invoice was $60 higher because of a part. I wish that had been explained before the work started.",
          es: "El técnico sabía lo que hacía y el calefactor ya funciona, pero me dieron un precio por teléfono y la factura salió $60 más alta por una pieza. Me hubiera gustado que me lo explicaran antes de empezar.",
        },
        suggestedReply: {
          en: "Ron, you're right: any change to the price should be explained and approved before we start, and we're sorry it wasn't. We've reminded the whole team to get your OK first. We'd like to make it right on your next visit; just mention this review when you book.",
          es: "Ron, tiene toda la razón: cualquier cambio de precio debe explicarse y aprobarse antes de empezar, y lamentamos que no fuera así. Ya le recordamos a todo el equipo que pida su visto bueno primero. Queremos compensarlo en su próxima visita; solo mencione esta reseña al agendar.",
        },
        replied: false,
      },
      {
        id: "se-r5",
        author: "Tasha L.",
        rating: 5,
        platform: "google",
        when: { en: "1 month ago", es: "Hace 1 mes" },
        text: {
          en: "We use Clearline for everything now: gutters, the AC, even our move-in clean. Booking online takes a minute, and they always confirm by text.",
          es: "Ahora usamos Clearline para todo: canaletas, el aire acondicionado y hasta la limpieza cuando nos mudamos. Agendar en línea toma un minuto y siempre confirman por texto.",
        },
        suggestedReply: {
          en: "Tasha, thank you for trusting us with so much of your home! It's a pleasure to be your go-to crew.",
          es: "Tasha, ¡gracias por confiarnos tantas cosas de su casa! Es un gusto ser su equipo de confianza.",
        },
        replied: true,
      },
    ],
  },
};
