import type { L10n } from "@/i18n/types";
import { demoImage, type DemoContent, type DemoImage } from "./index";

/**
 * Trueframe Builders (fictional remodeling contractor). Every user-facing
 * string on /work/contractor/ lives here, in US English and in formal
 * ("usted") Spanish. Prices are typical starting points in USD.
 *
 * Feet-and-inch dimensions are written the way they are on a drawing, with
 * straight marks: 24'-0", 1/4" = 1'-0". (Barlow's true primes, U+2032/2033,
 * carry a wide right side-bearing that opens a gap before the hyphen:
 * "24′ -0″". The straight marks set tight.)
 */

export type ContractorService = {
  id: "kitchens" | "baths" | "additions" | "decks" | "whole";
  name: L10n;
  includes: L10n;
  schedule: L10n;
  /** Typical starting price, USD. */
  from: number;
};

export type ContractorProject = {
  id: "addition" | "deck";
  /** The detail tag on the drawing: "1" over "A-201". */
  detail: string;
  title: L10n;
  location: string;
  duration: L10n;
  /** The dimension set over the photo, e.g. 24'-0". */
  dimension: string;
  facts: { label: L10n; value: L10n }[];
  image: DemoImage;
};

export type ContractorStep = {
  id: "estimate" | "design" | "build" | "walkthrough";
  title: L10n;
  /** The span on the chain dimension above the step. */
  span: L10n;
  body: L10n;
  deliverable: L10n;
};

export type ContractorReview = DemoContent["reviews"][number] & { project: L10n };

export type ContractorContent = Omit<DemoContent, "reviews"> & {
  reviews: ContractorReview[];
  licence: L10n;
  nav: {
    services: L10n;
    projects: L10n;
    process: L10n;
    reviews: L10n;
    estimate: L10n;
    estimateShort: L10n;
    home: L10n;
    primary: L10n;
  };
  hero: {
    kicker: L10n;
    /** Two lines; the h1 reads "Built right the first time." */
    headline: [L10n, L10n];
    intro: L10n;
    cta: L10n;
    secondary: L10n;
    promise: L10n;
    image: DemoImage;
    /** Dimension strings around the drawing (language-neutral). */
    dims: { overall: string; height: string; island: string };
    /** Keynotes: numbered tags on the photo, listed under it. */
    keynotes: L10n[];
    keynotesLabel: L10n;
    titleBlock: { label: L10n; value: L10n }[];
    sheetLabel: L10n;
  };
  services: {
    sheet: string;
    kicker: L10n;
    title: L10n;
    intro: L10n;
    cols: { no: L10n; scope: L10n; includes: L10n; schedule: L10n; from: L10n };
    fromWord: L10n;
    items: ContractorService[];
    footnote: L10n;
  };
  projects: {
    sheet: string;
    kicker: L10n;
    title: L10n;
    intro: L10n;
    items: ContractorProject[];
  };
  process: {
    sheet: string;
    kicker: L10n;
    title: L10n;
    intro: L10n;
    deliverableLabel: L10n;
    steps: ContractorStep[];
  };
  reviewsBlock: { sheet: string; kicker: L10n; title: L10n };
  estimate: {
    sheet: string;
    kicker: L10n;
    title: L10n;
    body: L10n;
    cta: L10n;
    hoursLabel: L10n;
    closed: L10n;
    officeLabel: L10n;
    officeNote: L10n;
    phoneLabel: L10n;
    warrantyLabel: L10n;
    warranty: L10n;
    areaLabel: L10n;
    area: L10n;
  };
  footer: { tagline: L10n; credit: L10n; sheets: L10n };
};

export const contractor: ContractorContent = {
  id: "contractor",
  business: "Trueframe Builders",
  phone: "(555) 555-0163",
  address: "88 Millwork Rd",
  hours: [
    { days: { en: "Monday – Friday", es: "Lunes a viernes" }, time: { en: "7am – 5pm", es: "7:00 – 17:00" } },
    { days: { en: "Saturday", es: "Sábado" }, time: { en: "8am – noon", es: "8:00 – 12:00" } },
  ],
  licence: {
    en: "Licensed & insured · Lic. #CB-000000 (demo)",
    es: "Con licencia y seguro · Lic. #CB-000000 (demo)",
  },
  nav: {
    services: { en: "Services", es: "Servicios" },
    projects: { en: "Projects", es: "Proyectos" },
    process: { en: "Process", es: "Proceso" },
    reviews: { en: "Reviews", es: "Reseñas" },
    estimate: { en: "Free estimate", es: "Presupuesto gratis" },
    /** Phones (< 640px), where the full label would crowd the wordmark. */
    estimateShort: { en: "Free estimate", es: "Presupuesto" },
    home: { en: "Trueframe Builders, top of page", es: "Trueframe Builders, inicio de la página" },
    primary: { en: "Main", es: "Principal" },
  },
  hero: {
    kicker: { en: "Remodels & additions · since 2009", es: "Reformas y ampliaciones · desde 2009" },
    headline: [
      { en: "Built right", es: "Bien construido" },
      { en: "the first time.", es: "desde la primera vez." },
    ],
    intro: {
      en: "Kitchens, baths, additions and decks within 25 miles of Millwork Road. One project lead from the first tape measure to the final walkthrough, a dated schedule before demo day, and a job site swept clean every evening.",
      es: "Cocinas, baños, ampliaciones y terrazas a menos de 25 millas de Millwork Road. Un mismo jefe de obra desde la primera medición hasta la entrega, un calendario con fechas antes de empezar y la obra barrida cada tarde.",
    },
    cta: { en: "Get a free estimate", es: "Pida presupuesto gratis" },
    secondary: { en: "See recent projects", es: "Vea obras recientes" },
    promise: {
      en: "Free on-site visit · itemized written estimate within 48 hours",
      es: "Visita gratuita · presupuesto detallado por escrito en 48 horas",
    },
    image: demoImage(
      "contractor",
      "kitchen",
      {
        en: "A finished kitchen remodel: navy Shaker cabinets with brass pulls, two brass dome pendants over a white quartz waterfall island with three stools, and tall black-framed windows onto the garden.",
        es: "Una cocina reformada y terminada: gabinetes tipo Shaker azul marino con tiradores de latón, dos lámparas de cúpula de latón sobre una isla de cuarzo blanco en cascada con tres taburetes y ventanales de marco negro hacia el jardín.",
      },
      1344,
      752,
    ),
    // Proportional to the 1344:752 frame (1.79:1): 16'-0" x 9'-0" (1.78:1); the
    // island spans 46.7% of the width, 7'-6" of 16'-0".
    dims: { overall: "16'-0\"", height: "9'-0\"", island: "7'-6\"" },
    keynotes: [
      { en: "Brass dome pendants, on their own dimmer", es: "Lámparas de cúpula de latón, con regulador propio" },
      { en: "Quartz waterfall island, seats three", es: "Isla de cuarzo en cascada, para tres" },
      { en: "New window opening, header resized", es: "Nuevo hueco de ventana, dintel recalculado" },
    ],
    keynotesLabel: { en: "Keynotes", es: "Notas" },
    titleBlock: [
      { label: { en: "Project", es: "Proyecto" }, value: { en: "Kitchen remodel, Elm Park", es: "Reforma de cocina, Elm Park" } },
      { label: { en: "Duration", es: "Duración" }, value: { en: "7 weeks", es: "7 semanas" } },
      { label: { en: "Scale", es: "Escala" }, value: { en: "1/4\" = 1'-0\"", es: "1/4\" = 1'-0\"" } },
    ],
    sheetLabel: { en: "Sheet", es: "Hoja" },
  },
  services: {
    sheet: "A-102",
    kicker: { en: "Services", es: "Servicios" },
    title: { en: "What we build", es: "Lo que construimos" },
    intro: {
      en: "Five kinds of work, done by our own carpenters with the licensed electricians and plumbers we have used for years. Prices are typical starting points; your estimate is itemized and fixed before anything is torn out.",
      es: "Cinco tipos de obra, hechos por nuestros propios carpinteros junto con los electricistas y plomeros con licencia que nos acompañan desde hace años. Los precios son puntos de partida habituales; su presupuesto se detalla y se cierra antes de desmontar nada.",
    },
    cols: {
      no: { en: "No.", es: "N.º" },
      scope: { en: "Scope", es: "Obra" },
      includes: { en: "Includes", es: "Incluye" },
      schedule: { en: "Typical schedule", es: "Plazo habitual" },
      from: { en: "Starting at", es: "Desde" },
    },
    fromWord: { en: "from", es: "desde" },
    items: [
      {
        id: "kitchens",
        name: { en: "Kitchens", es: "Cocinas" },
        includes: {
          en: "Layout, cabinets, counters, lighting and appliance hookups; we move walls and plumbing when the plan needs it.",
          es: "Distribución, gabinetes, cubiertas, iluminación y conexión de electrodomésticos; movemos paredes y plomería si el plano lo pide.",
        },
        schedule: { en: "6–10 weeks", es: "6–10 semanas" },
        from: 38000,
      },
      {
        id: "baths",
        name: { en: "Bathrooms", es: "Baños" },
        includes: {
          en: "Waterproofing done right, tile, curbless showers or tubs, vanities and a fan that actually vents outside.",
          es: "Impermeabilización bien hecha, azulejos, duchas a ras de suelo o bañeras, muebles de lavabo y un extractor que de verdad saca el aire fuera.",
        },
        schedule: { en: "3–5 weeks", es: "3–5 semanas" },
        from: 16500,
      },
      {
        id: "additions",
        name: { en: "Additions", es: "Ampliaciones" },
        includes: {
          en: "Drawings and permits, foundation, framing, roof tie-in, HVAC and finishes, matched to the house you already have.",
          es: "Planos y permisos, cimentación, estructura, unión con el tejado, climatización y acabados, a juego con la casa que ya tiene.",
        },
        schedule: { en: "12–20 weeks", es: "12–20 semanas" },
        from: 145000,
      },
      {
        id: "decks",
        name: { en: "Decks", es: "Terrazas" },
        includes: {
          en: "Footings below the frost line, framing, cedar or composite boards, railings and stairs, inspected before the boards go down.",
          es: "Zapatas por debajo de la línea de helada, estructura, tablas de cedro o compuesto, barandillas y escaleras, inspeccionado antes de poner las tablas.",
        },
        schedule: { en: "2–4 weeks", es: "2–4 semanas" },
        from: 14000,
      },
      {
        id: "whole",
        name: { en: "Whole-home remodels", es: "Reformas integrales" },
        includes: {
          en: "Phased room by room so you can stay in the house when possible, with one schedule for every trade.",
          es: "Por fases, estancia por estancia, para que pueda seguir en casa siempre que sea posible, con un solo calendario para todos los oficios.",
        },
        schedule: { en: "4–8 months", es: "4–8 meses" },
        from: 180000,
      },
    ],
    footnote: {
      en: "Every estimate includes permits, the dumpster, floor protection and daily cleanup. No allowance games: if it is in the plan, it is in the price.",
      es: "Todos los presupuestos incluyen permisos, contenedor, protección de suelos y limpieza diaria. Sin partidas sorpresa: si está en el plano, está en el precio.",
    },
  },
  projects: {
    sheet: "A-201",
    kicker: { en: "Recent projects", es: "Obras recientes" },
    title: { en: "Two jobs from last season", es: "Dos obras de la última temporada" },
    intro: {
      en: "Both finished on the date written into the contract. Ask us for the homeowners’ numbers; they are happy to talk.",
      es: "Las dos se terminaron en la fecha que figuraba en el contrato. Pídanos el teléfono de los propietarios; están encantados de hablar con usted.",
    },
    items: [
      {
        id: "addition",
        detail: "1",
        title: { en: "Two-story addition", es: "Ampliación de dos plantas" },
        location: "Cedar Hollow",
        duration: { en: "14 weeks", es: "14 semanas" },
        dimension: "24'-0\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Family room below, primary suite above, board-and-batten siding",
              es: "Sala familiar abajo, dormitorio principal arriba, revestimiento de tablas verticales",
            },
          },
          {
            label: { en: "Permit", es: "Permiso" },
            value: { en: "Approved in 11 days; every inspection passed first time", es: "Aprobado en 11 días; todas las inspecciones superadas a la primera" },
          },
        ],
        image: demoImage(
          "contractor",
          "addition",
          {
            en: "A two-story addition clad in navy board-and-batten siding, with tall black-framed windows and glass doors, joined to an older shingled house at golden hour.",
            es: "Una ampliación de dos plantas revestida de tablas verticales azul marino, con ventanales de marco negro y puertas acristaladas, unida a una casa más antigua de tejas al atardecer.",
          },
          896,
          1120,
        ),
      },
      {
        id: "deck",
        detail: "2",
        title: { en: "Cedar deck & built-in bench", es: "Terraza de cedro con banco" },
        location: "Linden Park",
        duration: { en: "3 weeks", es: "3 semanas" },
        dimension: "16'-0\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Cable rail, wraparound bench, a wide stair down to the lawn",
              es: "Barandilla de cable, banco corrido y una escalera ancha hasta el césped",
            },
          },
          {
            label: { en: "Detail", es: "Detalle" },
            value: { en: "Hidden fasteners: no screw heads underfoot", es: "Fijaciones ocultas: ni un tornillo a la vista" },
          },
        ],
        image: demoImage(
          "contractor",
          "deck",
          {
            en: "A cedar deck with a built-in L-shaped bench, black cable railings and wide steps down to the lawn, string lights overhead at sunset.",
            es: "Una terraza de cedro con un banco en L integrado, barandillas negras de cable y escalones anchos hasta el césped, con guirnaldas de luces al atardecer.",
          },
          896,
          1120,
        ),
      },
    ],
  },
  process: {
    sheet: "A-301",
    kicker: { en: "Process", es: "Proceso" },
    title: { en: "How a job runs", es: "Cómo avanza una obra" },
    intro: {
      en: "Four steps, the same on a deck as on an addition. You always know what happens next and who is doing it.",
      es: "Cuatro pasos, iguales en una terraza que en una ampliación. Siempre sabrá qué viene después y quién se encarga.",
    },
    deliverableLabel: { en: "You get", es: "Usted recibe" },
    steps: [
      {
        id: "estimate",
        title: { en: "Estimate", es: "Presupuesto" },
        span: { en: "48 hours", es: "48 horas" },
        body: {
          en: "We walk the space with you, measure, and ask how you actually use the room. No charge, no pressure.",
          es: "Recorremos el espacio con usted, medimos y le preguntamos cómo usa de verdad la estancia. Sin coste ni compromiso.",
        },
        deliverable: { en: "An itemized written estimate", es: "Un presupuesto detallado por escrito" },
      },
      {
        id: "design",
        title: { en: "Design", es: "Diseño" },
        span: { en: "2–4 weeks", es: "2–4 semanas" },
        body: {
          en: "Drawings, selections and the permit set. Nothing is ordered until you have signed off on every finish.",
          es: "Planos, selección de materiales y documentación para el permiso. No se pide nada hasta que usted aprueba cada acabado.",
        },
        deliverable: { en: "Drawings and a filed permit", es: "Planos y permiso tramitado" },
      },
      {
        id: "build",
        title: { en: "Build", es: "Obra" },
        span: { en: "On schedule", es: "Según calendario" },
        body: {
          en: "A dated schedule on your fridge, a text from your project lead every Friday, and the site swept every evening.",
          es: "Un calendario con fechas en su refrigerador, un mensaje de su jefe de obra cada viernes y la obra barrida cada tarde.",
        },
        deliverable: { en: "A Friday update, every week", es: "Un resumen cada viernes" },
      },
      {
        id: "walkthrough",
        title: { en: "Walkthrough", es: "Entrega" },
        span: { en: "Final day", es: "Último día" },
        body: {
          en: "We go room by room with a punch list and stay until every item is closed out.",
          es: "Revisamos estancia por estancia con una lista de remates y no nos vamos hasta cerrarla entera.",
        },
        deliverable: { en: "A 2-year workmanship warranty, in writing", es: "Garantía de mano de obra de 2 años, por escrito" },
      },
    ],
  },
  reviewsBlock: {
    sheet: "A-401",
    kicker: { en: "Reviews", es: "Reseñas" },
    title: { en: "Signed off by the homeowners", es: "Con el visto bueno de los propietarios" },
  },
  reviews: [
    {
      quote: {
        en: "They found rot behind our old shower, sent photos and a price the same afternoon, and still finished the bathroom the week they promised.",
        es: "Encontraron madera podrida detrás de la ducha vieja, nos mandaron fotos y un precio esa misma tarde, y aun así terminaron el baño la semana prometida.",
      },
      name: "Dana R.",
      project: { en: "Bathroom · Elm Park", es: "Baño · Elm Park" },
    },
    {
      quote: {
        en: "Fourteen weeks on the schedule, fourteen weeks on the calendar. The crew swept up every single night; our kids never found a nail.",
        es: "Catorce semanas en el calendario y catorce semanas de obra. El equipo barrió todas las noches; nuestros hijos no encontraron ni un clavo.",
      },
      name: "Luis & Karen M.",
      project: { en: "Two-story addition · Cedar Hollow", es: "Ampliación de dos plantas · Cedar Hollow" },
    },
    {
      quote: {
        en: "The estimate was the bill. Not one surprise line on the final invoice, and the inspector signed off on the first visit.",
        es: "El presupuesto fue la factura. Ni una línea sorpresa al final, y el inspector lo aprobó en la primera visita.",
      },
      name: "Tom H.",
      project: { en: "Cedar deck · Linden Park", es: "Terraza de cedro · Linden Park" },
    },
  ],
  estimate: {
    sheet: "A-501",
    kicker: { en: "Free estimate", es: "Presupuesto gratis" },
    title: { en: "Let’s measure your project.", es: "Midamos su proyecto." },
    body: {
      en: "Tell us what you have in mind. We come out, measure, and send an itemized estimate within 48 hours. If we are not the right crew for the job, we will tell you who is.",
      es: "Cuéntenos qué tiene en mente. Vamos a su casa, medimos y le enviamos un presupuesto detallado en 48 horas. Si no somos el equipo adecuado para su obra, le diremos quién lo es.",
    },
    cta: { en: "Get a free estimate", es: "Pida presupuesto gratis" },
    hoursLabel: { en: "Office hours", es: "Horario de oficina" },
    closed: { en: "Sunday closed · site visits by appointment", es: "Domingo cerrado · visitas con cita previa" },
    officeLabel: { en: "Shop & office", es: "Taller y oficina" },
    officeNote: { en: "Parking in the yard", es: "Estacionamiento en el patio" },
    phoneLabel: { en: "Phone", es: "Teléfono" },
    warrantyLabel: { en: "Warranty", es: "Garantía" },
    warranty: { en: "2 years on workmanship, in writing", es: "2 años en mano de obra, por escrito" },
    areaLabel: { en: "Service area", es: "Zona de trabajo" },
    area: { en: "Within 25 miles of the shop", es: "A menos de 25 millas del taller" },
  },
  footer: {
    tagline: { en: "Remodels and additions, measured twice.", es: "Reformas y ampliaciones, medidas dos veces." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
    sheets: { en: "Sheets A-101 to A-501", es: "Hojas A-101 a A-501" },
  },
};
