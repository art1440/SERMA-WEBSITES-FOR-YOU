import type { NicheViews } from "./types";

/**
 * Ridgeline Builders — a residential remodeling contractor (owner: Matt).
 * FICTIONAL demo data only: every client, phone (555-01xx) and email
 * (example domains) is made up. The demo week runs Mon–Sat; "today" is Monday.
 * Crew events carry the value of that phase (progress draw), and site visits
 * carry the estimated job value, so the week's numbers read the way a
 * contractor thinks about them.
 */

const SIGNOFF = { en: "— Your SermaWebDesign system", es: "— Su sistema SermaWebDesign" };

const CREW_A = { en: "Crew A", es: "Cuadrilla A" };
const CREW_B = { en: "Crew B", es: "Cuadrilla B" };
const ESTIMATES = { en: "Estimates · Matt", es: "Presupuestos · Matt" };

export const contractorViews: NicheViews = {
  leads: [
    {
      id: "co-l1",
      name: "Karen W.",
      phone: "(602) 555-0131",
      service: { en: "Kitchen refresh: cabinets + quartz", es: "Renovación de cocina: gabinetes + cuarzo" },
      value: 18500,
      source: "referral",
      status: "booked",
      received: { en: "Today, 9:29 AM", es: "Hoy, 9:29 AM" },
      note: {
        en: "Referred by Linda N.; booked a site visit online for Wed 8:30 AM",
        es: "Recomendada por Linda N.; agendó en línea una visita para el miércoles 8:30 AM",
      },
    },
    {
      id: "co-l2",
      name: "Sandra K.",
      phone: "(602) 555-0188",
      service: { en: "Garage-to-ADU conversion", es: "Conversión de garaje en ADU" },
      value: 62000,
      source: "website",
      status: "new",
      received: { en: "Today, 7:42 AM", es: "Hoy, 7:42 AM" },
      note: {
        en: "Has architect plans; wants a bid before her city permit meeting",
        es: "Ya tiene planos del arquitecto; quiere un presupuesto antes de su cita de permisos con la ciudad",
      },
    },
    {
      id: "co-l3",
      name: "Greg H.",
      phone: "(480) 555-0174",
      service: { en: "Kitchen remodel, sink moved to island", es: "Remodelación de cocina, fregadero a la isla" },
      value: 34000,
      source: "google",
      status: "contacted",
      received: { en: "Sat, 8:05 AM", es: "Sáb, 8:05 AM" },
      note: {
        en: "1978 ranch house; wants to open the kitchen wall to the dining room",
        es: "Casa estilo rancho de 1978; quiere abrir el muro entre la cocina y el comedor",
      },
    },
    {
      id: "co-l4",
      name: "Luis P.",
      phone: "(602) 555-0105",
      service: { en: "Covered patio + cedar pergola", es: "Patio techado + pérgola de cedro" },
      value: 14800,
      source: "instagram",
      status: "contacted",
      received: { en: "Fri, 4:52 PM", es: "Vie, 4:52 PM" },
      note: {
        en: "Saw the cedar pergola post; needs HOA approval before work starts",
        es: "Vio la publicación de la pérgola de cedro; necesita la aprobación de su HOA antes de empezar",
      },
    },
    {
      id: "co-l5",
      name: "Monica D.",
      phone: "(623) 555-0146",
      service: { en: "Tub-to-curbless shower conversion", es: "Cambio de tina a regadera sin escalón" },
      value: 21500,
      source: "missedCall",
      status: "new",
      received: { en: "Fri, 12:10 PM", es: "Vie, 12:10 PM" },
      note: {
        en: "Called while you were on a roof; auto-text sent and she replied this morning",
        es: "Llamó mientras usted estaba en un techo; se le envió un texto y respondió esta mañana",
      },
    },
    {
      id: "co-l6",
      name: "Derek S.",
      phone: "(480) 555-0162",
      service: { en: "Ceiling + drywall repair after a storm leak", es: "Reparación de cielo raso y tablaroca por filtración" },
      value: 6200,
      source: "google",
      status: "booked",
      received: { en: "Thu, 10:05 AM", es: "Jue, 10:05 AM" },
      note: {
        en: "Insurance adjuster already signed off; Crew B starts Mon 9:00 AM",
        es: "El ajustador del seguro ya aprobó; la Cuadrilla B empieza el lunes 9:00 AM",
      },
    },
    {
      id: "co-l7",
      name: "Brian T.",
      phone: "(602) 555-0197",
      service: { en: "Room addition, 350 sq ft", es: "Ampliación de 350 pies cuadrados" },
      value: 68000,
      source: "website",
      status: "lost",
      received: { en: "Last week", es: "La semana pasada" },
      note: {
        en: "Went with a builder who could start sooner; asked you to stay in touch",
        es: "Eligió a un constructor que podía empezar antes; pidió seguir en contacto",
      },
    },
  ],

  calendar: {
    resources: [CREW_A, CREW_B, ESTIMATES],
    events: [
      // Crew A — Linda N.'s kitchen, then Erin F.'s bath
      {
        id: "co-c1",
        day: 0,
        start: "08:00",
        durationMin: 480,
        client: "Linda N.",
        service: { en: "Kitchen remodel: demo + haul-off", es: "Remodelación de cocina: demolición + retiro de escombros" },
        resource: CREW_A,
        status: "confirmed",
        value: 3800,
      },
      {
        id: "co-c2",
        day: 1,
        start: "08:00",
        durationMin: 480,
        client: "Linda N.",
        service: { en: "Kitchen remodel: framing + rough electrical", es: "Remodelación de cocina: estructura + electricidad preliminar" },
        resource: CREW_A,
        status: "confirmed",
        value: 5200,
      },
      {
        id: "co-c3",
        day: 2,
        start: "08:00",
        durationMin: 300,
        client: "Linda N.",
        service: { en: "Kitchen remodel: rough plumbing + city inspection", es: "Remodelación de cocina: plomería preliminar + inspección de la ciudad" },
        resource: CREW_A,
        status: "confirmed",
        value: 2900,
      },
      {
        id: "co-c4",
        day: 3,
        start: "08:00",
        durationMin: 480,
        client: "Erin F.",
        service: { en: "Bath remodel: shower pan + waterproofing", es: "Remodelación de baño: base de regadera + impermeabilización" },
        resource: CREW_A,
        status: "deposit",
        value: 4400,
      },
      {
        id: "co-c5",
        day: 4,
        start: "08:00",
        durationMin: 420,
        client: "Erin F.",
        service: { en: "Bath remodel: tile, grout + fixtures", es: "Remodelación de baño: azulejo, lechada + accesorios" },
        resource: CREW_A,
        status: "confirmed",
        value: 3900,
      },
      // Crew B — repairs, Paula G.'s patio cover, small jobs
      {
        id: "co-c6",
        day: 0,
        start: "09:00",
        durationMin: 360,
        client: "Derek S.",
        service: { en: "Ceiling + drywall repair (storm leak)", es: "Reparación de cielo raso + tablaroca (filtración)" },
        resource: CREW_B,
        status: "deposit",
        value: 3400,
      },
      {
        id: "co-c7",
        day: 1,
        start: "08:00",
        durationMin: 300,
        client: "Derek S.",
        service: { en: "Ceiling + drywall: texture + paint", es: "Cielo raso + tablaroca: textura + pintura" },
        resource: CREW_B,
        status: "confirmed",
        value: 2800,
      },
      {
        id: "co-c8",
        day: 2,
        start: "08:00",
        durationMin: 480,
        client: "Paula G.",
        service: { en: "Covered patio: footings + posts", es: "Patio techado: zapatas + postes" },
        resource: CREW_B,
        status: "deposit",
        value: 5400,
      },
      {
        id: "co-c9",
        day: 3,
        start: "08:00",
        durationMin: 480,
        client: "Paula G.",
        service: { en: "Covered patio: beams + roof panels", es: "Patio techado: vigas + paneles del techo" },
        resource: CREW_B,
        status: "confirmed",
        value: 6600,
      },
      {
        id: "co-c10",
        day: 4,
        start: "08:00",
        durationMin: 240,
        client: "Ruth A.",
        service: { en: "Exterior door + trim install", es: "Instalación de puerta exterior + molduras" },
        resource: CREW_B,
        status: "confirmed",
        value: 1850,
      },
      {
        id: "co-c11",
        day: 5,
        start: "08:00",
        durationMin: 240,
        client: "Rita J.",
        service: { en: "Punch list: caulk, trim + touch-ups", es: "Lista de pendientes: sellador, molduras + retoques" },
        resource: CREW_B,
        status: "pending",
        value: 650,
      },
      // Estimates — Matt's site visits and walkthroughs
      {
        id: "co-c12",
        day: 0,
        start: "16:30",
        durationMin: 60,
        client: "Sam T.",
        service: { en: "Final walkthrough: hall bath", es: "Recorrido final: baño del pasillo" },
        resource: ESTIMATES,
        status: "confirmed",
        value: 2100,
      },
      {
        id: "co-c13",
        day: 1,
        start: "16:00",
        durationMin: 75,
        client: "Jenna P.",
        service: { en: "Estimate review: primary bath remodel", es: "Revisión de presupuesto: baño principal" },
        resource: ESTIMATES,
        status: "confirmed",
        value: 19500,
      },
      {
        id: "co-c14",
        day: 2,
        start: "08:30",
        durationMin: 90,
        client: "Karen W.",
        service: { en: "Site visit: kitchen refresh", es: "Visita: renovación de cocina" },
        resource: ESTIMATES,
        status: "pending",
        value: 18500,
      },
      {
        id: "co-c15",
        day: 3,
        start: "15:00",
        durationMin: 60,
        client: "Howard L.",
        service: { en: "Site visit: stucco repair + exterior paint", es: "Visita: reparación de estuco + pintura exterior" },
        resource: ESTIMATES,
        status: "confirmed",
        value: 9800,
      },
      {
        id: "co-c16",
        day: 4,
        start: "13:00",
        durationMin: 60,
        client: "Gina R.",
        service: { en: "Site visit: water-damage repair", es: "Visita: reparación por daños de agua" },
        resource: ESTIMATES,
        status: "pending",
        value: 4500,
      },
    ],
  },

  inbox: [
    {
      id: "co-m1",
      kind: "booking",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "New site visit: Karen W. — Wed 8:30 AM (kitchen refresh)",
        es: "Nueva visita: Karen W. — mié 8:30 AM (renovación de cocina)",
      },
      preview: {
        en: "Cabinets + quartz counters, budget $15k–$20k. Referred by Linda N.",
        es: "Gabinetes + cubiertas de cuarzo, presupuesto de $15k–$20k. Recomendada por Linda N.",
      },
      received: { en: "9:32 AM", es: "9:32 AM" },
      unread: true,
      email: {
        greeting: { en: "Hi Matt,", es: "Hola, Matt:" },
        paragraphs: [
          {
            en: "Karen booked a site visit from your website a few minutes ago. She's planning a kitchen refresh with new shaker cabinets and quartz counters, and says Linda N. sent her your way.",
            es: "Karen agendó una visita desde su sitio web hace unos minutos. Quiere renovar su cocina con gabinetes estilo shaker y cubiertas de cuarzo, y dice que Linda N. le dio su contacto.",
          },
          {
            en: "Wednesday at 8:30 AM is on hold for her. Once you confirm, she gets a text with your arrival window and a short list of what to have ready (photos of the current layout and any inspiration pictures).",
            es: "El miércoles a las 8:30 AM queda apartado para ella. Cuando usted confirme, recibirá un texto con su horario de llegada y una lista breve de lo que conviene tener a mano (fotos de la distribución actual e ideas que le gusten).",
          },
        ],
        details: [
          { label: { en: "Client", es: "Cliente" }, value: { en: "Karen W. · (602) 555-0131", es: "Karen W. · (602) 555-0131" } },
          { label: { en: "Project", es: "Proyecto" }, value: { en: "Kitchen refresh: cabinets + quartz", es: "Renovación de cocina: gabinetes + cuarzo" } },
          { label: { en: "Budget", es: "Presupuesto" }, value: { en: "$15,000–$20,000", es: "$15,000–$20,000" } },
          { label: { en: "Visit", es: "Visita" }, value: { en: "Wed, 8:30–10:00 AM", es: "Mié, 8:30–10:00 AM" } },
          { label: { en: "Referred by", es: "Recomendada por" }, value: { en: "Linda N.", es: "Linda N." } },
        ],
        primary: {
          label: { en: "Confirm site visit", es: "Confirmar visita" },
          action: "confirm",
          done: { en: "Site visit confirmed", es: "Visita confirmada" },
        },
        secondary: {
          label: { en: "View in calendar", es: "Ver en el calendario" },
          action: "openCalendar",
          done: { en: "Opened in calendar", es: "Abierta en el calendario" },
        },
        calendarEventId: "co-c14",
        signoff: SIGNOFF,
      },
    },
    {
      id: "co-m2",
      kind: "textback",
      from: "Monica D.",
      fromEmail: "monica.d@example.net",
      subject: {
        en: "Monica D. replied to your missed-call text",
        es: "Monica D. respondió a su texto de llamada perdida",
      },
      preview: {
        en: "“How soon could you start, and do you pull the permit?”",
        es: "“¿Qué tan pronto podrían empezar? ¿Ustedes sacan el permiso?”",
      },
      received: { en: "9:05 AM", es: "9:05 AM" },
      unread: true,
      email: {
        greeting: { en: "Hi Matt,", es: "Hola, Matt:" },
        paragraphs: [
          {
            en: "Thanks for the text on Friday! We'd like to turn our hall bathtub into a curbless walk-in shower, mostly so my dad can use it safely.",
            es: "¡Gracias por el texto del viernes! Queremos cambiar la tina del baño del pasillo por una regadera sin escalón, sobre todo para que mi papá la use con seguridad.",
          },
          {
            en: "How soon could you start, and do you pull the permit or do we?",
            es: "¿Qué tan pronto podrían empezar? ¿El permiso lo sacan ustedes o nosotros?",
          },
        ],
        details: [
          { label: { en: "Missed call", es: "Llamada perdida" }, value: { en: "Fri, 12:10 PM", es: "Vie, 12:10 PM" } },
          { label: { en: "Auto-text sent", es: "Texto automático" }, value: { en: "7 seconds later", es: "7 segundos después" } },
          { label: { en: "Phone", es: "Teléfono" }, value: { en: "(623) 555-0146", es: "(623) 555-0146" } },
          { label: { en: "Project", es: "Proyecto" }, value: { en: "Tub-to-shower conversion", es: "Cambio de tina a regadera" } },
        ],
        primary: {
          label: { en: "Reply with a quick text", es: "Responder con un texto rápido" },
          action: "quickReply",
          done: { en: "Reply sent", es: "Respuesta enviada" },
        },
        secondary: {
          label: { en: "View lead", es: "Ver prospecto" },
          action: "openLeads",
          done: { en: "Opened in Leads", es: "Abierto en Prospectos" },
        },
        quickReplies: [
          {
            en: "Hi Monica, it's Matt. Yes, we pull the permit. Once the estimate is signed we can usually start in 3–4 weeks. Could I come measure Thursday at 4:30 PM?",
            es: "Hola, Monica, habla Matt. Sí, nosotros sacamos el permiso. Con el presupuesto firmado, normalmente empezamos en 3 a 4 semanas. ¿Puedo pasar a medir el jueves a las 4:30 PM?",
          },
          {
            en: "Great project! I have site-visit openings Tuesday at 2:00 PM or Friday at 3:00 PM. Which works better for you?",
            es: "¡Buen proyecto! Tengo espacio para la visita el martes a las 2:00 PM o el viernes a las 3:00 PM. ¿Cuál le queda mejor?",
          },
          {
            en: "Thanks, Monica! I'm on a job site right now — I'll call you after 3 PM today.",
            es: "¡Gracias, Monica! Estoy en una obra en este momento; le llamo hoy después de las 3 PM.",
          },
        ],
        signoff: { en: "— Monica D. (replied by text)", es: "— Monica D. (respondió por texto)" },
      },
    },
    {
      id: "co-m3",
      kind: "lead",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "High-ticket lead: garage-to-ADU conversion (est. $62,000)",
        es: "Prospecto de alto valor: conversión de garaje en ADU (aprox. $62,000)",
      },
      preview: {
        en: "Sandra K. has architect plans and wants a bid before her permit meeting.",
        es: "Sandra K. tiene planos del arquitecto y quiere un presupuesto antes de su cita de permisos.",
      },
      received: { en: "7:44 AM", es: "7:44 AM" },
      unread: false,
      email: {
        greeting: { en: "Hi Matt,", es: "Hola, Matt:" },
        paragraphs: [
          {
            en: "Sandra filled out the quote form on your website at 7:42 AM. She wants to turn her two-car garage into a one-bedroom ADU and already has drawings from her architect.",
            es: "Sandra llenó el formulario de cotización en su sitio web a las 7:42 AM. Quiere convertir su garaje para dos autos en una ADU de una recámara y ya tiene los planos de su arquitecto.",
          },
          {
            en: "Because the estimated value is over $10,000, she's flagged as high-ticket and pinned to the top of your Leads list.",
            es: "Como el valor estimado supera los $10,000, aparece marcada como prospecto de alto valor y en primer lugar de su lista de Prospectos.",
          },
        ],
        details: [
          { label: { en: "Contact", es: "Contacto" }, value: { en: "Sandra K. · (602) 555-0188", es: "Sandra K. · (602) 555-0188" } },
          { label: { en: "Project", es: "Proyecto" }, value: { en: "Garage to ADU (1 bed, 1 bath)", es: "Garaje a ADU (1 recámara, 1 baño)" } },
          { label: { en: "Est. value", es: "Valor estimado" }, value: { en: "$62,000", es: "$62,000" } },
          { label: { en: "Timeline", es: "Plazo" }, value: { en: "Permit meeting in 3 weeks", es: "Cita de permisos en 3 semanas" } },
          { label: { en: "Source", es: "Origen" }, value: { en: "Website quote form", es: "Formulario de cotización del sitio" } },
        ],
        primary: {
          label: { en: "Open in Leads", es: "Abrir en Prospectos" },
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
      id: "co-m4",
      kind: "payment",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "Deposit paid: $3,600 from Paula G. — covered patio",
        es: "Depósito pagado: $3,600 de Paula G. — patio techado",
      },
      preview: {
        en: "30% deposit on the 12×20 ft patio cover. Crew B starts Wednesday.",
        es: "Depósito del 30% para el patio techado de 12×20 pies. La Cuadrilla B empieza el miércoles.",
      },
      received: { en: "Yesterday, 6:12 PM", es: "Ayer, 6:12 PM" },
      unread: false,
      email: {
        greeting: { en: "Hi Matt,", es: "Hola, Matt:" },
        paragraphs: [
          {
            en: "Paula paid the 30% deposit on her covered patio, so the job is locked in for Crew B starting Wednesday. The receipt is below for your records.",
            es: "Paula pagó el depósito del 30% de su patio techado, así que el trabajo queda asegurado para la Cuadrilla B a partir del miércoles. Abajo tiene el recibo para sus registros.",
          },
        ],
        details: [
          { label: { en: "Invoice", es: "Factura" }, value: { en: "#1047", es: "#1047" } },
          { label: { en: "Project", es: "Proyecto" }, value: { en: "Covered patio, 12×20 ft, insulated roof", es: "Patio techado, 12×20 pies, techo aislado" } },
          { label: { en: "Contract total", es: "Total del contrato" }, value: { en: "$12,000.00", es: "$12,000.00" } },
          { label: { en: "Deposit (30%)", es: "Depósito (30%)" }, value: { en: "$3,600.00", es: "$3,600.00" } },
          { label: { en: "Paid with", es: "Forma de pago" }, value: { en: "Bank transfer (ACH)", es: "Transferencia bancaria (ACH)" } },
          { label: { en: "Balance at completion", es: "Saldo al terminar" }, value: { en: "$8,400.00", es: "$8,400.00" } },
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
      id: "co-m5",
      kind: "review",
      from: "SermaWebDesign Alerts",
      fromEmail: "alerts@example.com",
      subject: {
        en: "New 5★ Google review from Nicole B.",
        es: "Nueva reseña de 5★ en Google de Nicole B.",
      },
      preview: {
        en: "“Matt texted a photo update every afternoon, and the tile lines are perfect.”",
        es: "“Matt nos mandaba una foto del avance cada tarde, y las líneas del azulejo quedaron perfectas.”",
      },
      received: { en: "Sat, 11:15 AM", es: "Sáb, 11:15 AM" },
      unread: false,
      email: {
        greeting: { en: "Hi Matt,", es: "Hola, Matt:" },
        paragraphs: [
          {
            en: "Nicole B. left you a 5-star review on Google for her hall bath remodel:",
            es: "Nicole B. le dejó una reseña de 5 estrellas en Google por la remodelación de su baño:",
          },
          {
            en: "“Ridgeline redid our hall bath in under three weeks. Matt texted a photo update every afternoon, the crew covered our floors every morning, and the tile lines are perfect.”",
            es: "“Ridgeline remodeló nuestro baño en menos de tres semanas. Matt nos mandaba una foto del avance cada tarde, la cuadrilla cubría los pisos cada mañana y las líneas del azulejo quedaron perfectas.”",
          },
          {
            en: "A suggested reply is ready for you in Reviews.",
            es: "En Reseñas ya tiene lista una respuesta sugerida.",
          },
        ],
        primary: {
          label: { en: "Reply in Reviews", es: "Responder en Reseñas" },
          action: "openReviews",
          done: { en: "Opened Reviews", es: "Reseñas abiertas" },
        },
        signoff: SIGNOFF,
      },
    },
  ],

  reviews: {
    average: 4.8,
    total: 118,
    distribution: [101, 11, 3, 1, 2],
    items: [
      {
        id: "co-r1",
        author: "Nicole B.",
        rating: 5,
        platform: "google",
        when: { en: "2 days ago", es: "Hace 2 días" },
        text: {
          en: "Ridgeline redid our hall bath in under three weeks. Matt texted a photo update every afternoon, the crew covered our floors every morning, and the tile lines are perfect.",
          es: "Ridgeline remodeló nuestro baño en menos de tres semanas. Matt nos mandaba una foto del avance cada tarde, la cuadrilla cubría los pisos cada mañana y las líneas del azulejo quedaron perfectas.",
        },
        suggestedReply: {
          en: "Thank you, Nicole! Those afternoon photo updates are the best part of my day. Enjoy the new bath, and those straight grout lines.",
          es: "¡Gracias, Nicole! Esas fotos de cada tarde son lo mejor de mi día. Disfrute su baño nuevo y esas líneas bien derechas.",
        },
        replied: false,
      },
      {
        id: "co-r2",
        author: "Jorge V.",
        rating: 5,
        platform: "yelp",
        when: { en: "1 week ago", es: "Hace 1 semana" },
        text: {
          en: "We got three bids for our kitchen. Ridgeline's was the most detailed, with every line item explained, and the final invoice matched the estimate.",
          es: "Pedimos tres presupuestos para la cocina. El de Ridgeline fue el más detallado, con cada concepto explicado, y la factura final coincidió con lo cotizado.",
        },
        suggestedReply: {
          en: "Jorge, thanks for choosing us out of three bids. Clear numbers up front is how we like to work. Enjoy cooking in the new kitchen!",
          es: "Jorge, gracias por elegirnos entre tres presupuestos. Nos gusta trabajar con números claros desde el principio. ¡Disfrute cocinar en su cocina nueva!",
        },
        replied: true,
      },
      {
        id: "co-r3",
        author: "Amy L.",
        rating: 4,
        platform: "google",
        when: { en: "2 weeks ago", es: "Hace 2 semanas" },
        text: {
          en: "Beautiful work on our patio cover and a respectful crew. One star off because we lost two days waiting on beams, though they told us right away.",
          es: "Un trabajo precioso en nuestro patio techado y una cuadrilla muy respetuosa. Le quito una estrella porque perdimos dos días esperando las vigas, aunque nos avisaron de inmediato.",
        },
        suggestedReply: {
          en: "Thanks, Amy, and thank you for your patience on the beam delivery. We've since added a second lumber supplier so one late truck doesn't hold up a job. Enjoy the shade!",
          es: "Gracias, Amy, y gracias por su paciencia con la entrega de las vigas. Desde entonces trabajamos con un segundo proveedor de madera para que un camión atrasado no detenga una obra. ¡Disfrute la sombra!",
        },
        replied: false,
      },
      {
        id: "co-r4",
        author: "Kevin M.",
        rating: 3,
        platform: "facebook",
        when: { en: "3 weeks ago", es: "Hace 3 semanas" },
        text: {
          en: "The drywall repair itself looks great, but the crew left dust in the hallway and I had to call twice to get the final walkthrough on the calendar.",
          es: "La reparación de la tablaroca quedó muy bien, pero la cuadrilla dejó polvo en el pasillo y tuve que llamar dos veces para que agendaran el recorrido final.",
        },
        suggestedReply: {
          en: "Kevin, we're sorry about the dust and the runaround on scheduling. That's not how we want to finish a job. We've tightened our cleanup checklist, and I'd like to come by myself to do that final walkthrough properly.",
          es: "Kevin, lamentamos el polvo y la vuelta que tuvo que dar para agendar. Así no queremos terminar un trabajo. Ya reforzamos nuestra lista de limpieza y me gustaría pasar yo mismo a hacer ese recorrido final como se debe.",
        },
        replied: false,
      },
      {
        id: "co-r5",
        author: "Patrice H.",
        rating: 5,
        platform: "google",
        when: { en: "1 month ago", es: "Hace 1 mes" },
        text: {
          en: "After a monsoon storm soaked our garage ceiling, they had someone out the next morning and worked directly with our insurance adjuster. Took a huge weight off our shoulders.",
          es: "Después de que una tormenta del monzón empapó el techo de nuestro garaje, mandaron a alguien a la mañana siguiente y trataron directamente con el ajustador del seguro. Nos quitaron un gran peso de encima.",
        },
        suggestedReply: {
          en: "Patrice, storms like that are stressful, and we're glad we could make it easier. Thank you for trusting Ridgeline with your home.",
          es: "Patrice, esas tormentas son muy estresantes y nos alegra haberle facilitado las cosas. Gracias por confiar su casa a Ridgeline.",
        },
        replied: true,
      },
    ],
  },
};
