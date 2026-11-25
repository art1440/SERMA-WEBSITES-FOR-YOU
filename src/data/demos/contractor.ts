import type { L10n } from "@/i18n/types";
import { demoImage, heroImage, type DemoContent, type DemoImage } from "./index";

/**
 * Trueframe Builders (fictional remodeling contractor). Every user-facing
 * string on /work/contractor/ lives here, in US English and in formal
 * ("usted") Spanish. Prices are typical starting points in USD.
 *
 * Feet-and-inch dimensions are written the way they are on a drawing, with
 * straight marks: 24'-0", 1/4" = 1'-0". (Barlow's true primes, U+2032/2033,
 * carry a wide right side-bearing that opens a gap before the hyphen:
 * "24′ -0″". The straight marks set tight.)
 *
 * Photos: addition and deck are the original set; everything else (the hero
 * kitchen included) is from Unsplash (photographers in `photoCredits`), graded
 * cool so the set reads as one shoot: daylight, white and navy, pale oak.
 */

export type ContractorService = {
  id: "kitchens" | "baths" | "additions" | "decks" | "whole";
  name: L10n;
  includes: L10n;
  schedule: L10n;
  /** Typical starting price, USD. */
  from: number;
  /** Shown beside the row while a mouse hovers it (decorative). */
  preview: DemoImage;
};

export type ContractorProject = {
  id: "addition" | "kitchen" | "bath" | "wholehome" | "deck" | "attic" | "porch" | "windowseat";
  /** The detail number on the sheet: "3" reads A-201.3. */
  detail: string;
  title: L10n;
  location: string;
  duration: L10n;
  /** The dimension set over the photo, e.g. 24'-0". */
  dimension: string;
  /** Scope first, then one detail worth knowing. */
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
  image: DemoImage;
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
    /** The full-width hero photo (heroImage: 640 / 1600 / 2560 px files). */
    image: DemoImage;
    /** Dimension strings the drawing sets over the photo (language-neutral). */
    dims: { pendants: string; island: string; height: string };
    /** Two annotations on the drawing (decorative: they fade with the linework). */
    labels: [L10n, L10n];
    /** The slim title block along the foot of the hero: project, duration. */
    titleBlock: { label: L10n; value: L10n }[];
    sheetLabel: L10n;
  };
  services: {
    sheet: string;
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
    /** Accessible name of the sideways scroller on phones. */
    label: L10n;
    items: ContractorProject[];
  };
  process: {
    sheet: string;
    title: L10n;
    intro: L10n;
    deliverableLabel: L10n;
    steps: ContractorStep[];
  };
  reviewsBlock: {
    sheet: string;
    kicker: L10n;
    title: L10n;
    /** The type row that runs with the scroll. */
    trades: L10n[];
  };
  estimate: {
    sheet: string;
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
    elevationLabel: L10n;
    /** Overall width set over the elevation photo (language-neutral). */
    elevationDim: string;
    image: DemoImage;
  };
  footer: { tagline: L10n; credit: L10n; sheets: L10n };
};

/* ------------------------------------------------------------------ photos */

/** The hero: one wide daylight kitchen, 3200 px source (Clay Banks), graded cool. */
const HERO_KITCHEN = heroImage(
  "contractor",
  "hero-wide",
  {
    en: "A finished kitchen remodel in daylight: a slate-navy island with a white quartz top and four black stools, three pleated pendant lights, a stainless range hood over marble subway tile, and a glass door open to the garden.",
    es: "Una cocina reformada y terminada, a la luz del día: una isla azul pizarra con cubierta de cuarzo blanco y cuatro taburetes negros, tres lámparas colgantes plisadas, una campana de acero sobre azulejo de mármol y una puerta de vidrio abierta al jardín.",
  },
  1600,
  1067,
);

const ADDITION = demoImage(
  "contractor",
  "addition",
  {
    en: "A two-story addition clad in navy board-and-batten siding, with tall black-framed windows and glass doors, joined to an older shingled house at golden hour.",
    es: "Una ampliación de dos plantas revestida de tablas verticales azul marino, con ventanales de marco negro y puertas acristaladas, unida a una casa más antigua de tejas al atardecer.",
  },
  896,
  1120,
);

const DECK = demoImage(
  "contractor",
  "deck",
  {
    en: "A cedar deck with a built-in L-shaped bench, black cable railings and wide steps down to the lawn, string lights overhead at sunset.",
    es: "Una terraza de cedro con un banco en L integrado, barandillas negras de cable y escalones anchos hasta el césped, con guirnaldas de luces al atardecer.",
  },
  896,
  1120,
);

const OPEN_KITCHEN = demoImage(
  "contractor",
  "project-kitchen",
  {
    en: "An open kitchen with white quartz counters, a long island with walnut base cabinets and a built-in oven, glass pendants, and wide oak floors running into a bright living room.",
    es: "Una cocina abierta con cubiertas de cuarzo blanco, una isla larga con gabinetes bajos de nogal y horno integrado, lámparas colgantes de vidrio y suelo ancho de roble que continúa hasta una sala luminosa.",
  },
  1600,
  1066,
);

const BATH = demoImage(
  "contractor",
  "project-bath",
  {
    en: "A curbless walk-in shower behind a black-framed glass panel: white hexagon mosaic floor with a linear drain, a brushed brass rain head and hand shower, a tiled bench and a recessed niche, with a window onto green trees.",
    es: "Una ducha a ras de suelo tras un panel de vidrio con perfil negro: suelo de mosaico hexagonal blanco con desagüe lineal, rociador de lluvia y ducha de mano en latón cepillado, un banco alicatado y una hornacina, con una ventana hacia los árboles.",
  },
  1120,
  1400,
);

const WHOLE_HOME = demoImage(
  "contractor",
  "project-wholehome",
  {
    en: "A bright open living room under a vaulted ceiling with a cedar beam: two wood-and-linen armchairs and a white sofa on a pale rug, wide plank floors, and a white kitchen with brass pendants and a long island behind.",
    es: "Una sala abierta y luminosa bajo un techo abovedado con una viga de cedro: dos butacas de madera y lino y un sofá blanco sobre una alfombra clara, suelo de tablas anchas y, al fondo, una cocina blanca con lámparas de latón y una isla larga.",
  },
  1600,
  1066,
);

const ATTIC = demoImage(
  "contractor",
  "project-attic",
  {
    en: "An attic bedroom under exposed timber rafters and collar ties, with a stone fireplace, a pine wardrobe, wide pine floorboards and a patterned rug.",
    es: "Un dormitorio en el ático bajo pares y tirantes de madera a la vista, con chimenea de piedra, un armario de pino, tablas anchas de pino en el suelo y una alfombra estampada.",
  },
  1600,
  1066,
);

const PORCH = demoImage(
  "contractor",
  "project-porch",
  {
    en: "A covered back porch with a dark painted beadboard ceiling and a ceiling fan, white columns, gray painted floorboards, a gray Adirondack chair and a large fern, open to a green garden.",
    es: "Un porche trasero cubierto con techo de friso pintado en tono oscuro y ventilador, columnas blancas, tablas de suelo pintadas de gris, una silla Adirondack gris y un helecho grande, abierto a un jardín verde.",
  },
  1120,
  1400,
);

const WINDOW_SEAT = demoImage(
  "contractor",
  "project-windowseat",
  {
    en: "A built-in window seat with a channel-tufted cushion and drawers below, beside floor-to-ceiling white cabinets and open wood shelves with white vases, and a small round black-and-walnut table.",
    es: "Un banco de ventana a medida con cojín acolchado en canales y cajones debajo, junto a armarios blancos de suelo a techo y estantes abiertos de madera con jarrones blancos, y una mesita redonda negra y de nogal.",
  },
  1120,
  1400,
);

/* -------------------------------------------------------------- content */

export const contractor: ContractorContent = {
  id: "contractor",
  business: "Trueframe Builders",
  phone: "(555) 555-0163",
  address: "88 Millwork Rd",
  hours: [
    { days: { en: "Monday – Friday", es: "Lunes a viernes" }, time: { en: "7am – 5pm", es: "7:00 – 17:00" } },
    { days: { en: "Saturday", es: "Sábado" }, time: { en: "8am – noon", es: "8:00 – 12:00" } },
  ],
  photoCredits: [
    "josh A. D.",
    "Lucas Kepner",
    "Troy Mortier",
    "Clay Banks",
    "Zac Gudakov",
    "Alexander Fife",
    "Bailey Alexander",
    "Tanner Marquis",
    "Franco Debartolo",
    "Roger Starnes Sr",
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
      en: "Kitchens, baths, additions and decks within 25 miles of Millwork Road, with one project lead from the first tape measure to the final walkthrough.",
      es: "Cocinas, baños, ampliaciones y terrazas a menos de 25 millas de Millwork Road, con un mismo jefe de obra desde la primera medición hasta la entrega.",
    },
    cta: { en: "Get a free estimate", es: "Pida presupuesto gratis" },
    secondary: { en: "See recent projects", es: "Vea obras recientes" },
    image: HERO_KITCHEN,
    // Pendants 2'-6" apart, an 8'-0" island, 9'-0" from floor to ceiling.
    dims: { pendants: "2'-6\"", island: "8'-0\"", height: "9'-0\"" },
    labels: [
      { en: "Three pendants, own dimmer", es: "Tres colgantes, regulador propio" },
      { en: "Quartz top, seats four", es: "Cubierta de cuarzo, para cuatro" },
    ],
    titleBlock: [
      { label: { en: "Project", es: "Proyecto" }, value: { en: "Kitchen remodel, Elm Park", es: "Reforma de cocina, Elm Park" } },
      { label: { en: "Duration", es: "Duración" }, value: { en: "7 weeks", es: "7 semanas" } },
    ],
    sheetLabel: { en: "Sheet", es: "Hoja" },
  },
  services: {
    sheet: "A-102",
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
        preview: OPEN_KITCHEN,
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
        preview: BATH,
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
        preview: ADDITION,
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
        preview: DECK,
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
        preview: WHOLE_HOME,
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
    title: { en: "Finished work, sheet by sheet", es: "Obra terminada, hoja por hoja" },
    intro: {
      en: "Every one finished on the date written into the contract. Ask us for the homeowners’ numbers; they are happy to talk.",
      es: "Todas se terminaron en la fecha que figuraba en el contrato. Pídanos el teléfono de los propietarios; están encantados de hablar con usted.",
    },
    label: { en: "Recent projects", es: "Obras recientes" },
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
        image: ADDITION,
      },
      {
        id: "kitchen",
        detail: "2",
        title: { en: "Open kitchen & island", es: "Cocina abierta con isla" },
        location: "Birch Hill",
        duration: { en: "9 weeks", es: "9 semanas" },
        dimension: "18'-6\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Wall to the dining room taken out, walnut and white cabinets, a long island with seating",
              es: "Muro hacia el comedor retirado, gabinetes de nogal y blancos, una isla larga con asientos",
            },
          },
          {
            label: { en: "Detail", es: "Detalle" },
            value: { en: "The new beam sits flush in the ceiling: no soffit", es: "La viga nueva queda a ras del techo: sin falso techo" },
          },
        ],
        image: OPEN_KITCHEN,
      },
      {
        id: "bath",
        detail: "3",
        title: { en: "Curbless primary shower", es: "Ducha a ras de suelo" },
        location: "Maple Row",
        duration: { en: "4 weeks", es: "4 semanas" },
        dimension: "9'-0\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Linear drain, hex mosaic floor, a tiled bench and a niche sized for real bottles",
              es: "Desagüe lineal, mosaico hexagonal, un banco alicatado y una hornacina a la medida de los frascos de verdad",
            },
          },
          {
            label: { en: "Detail", es: "Detalle" },
            value: { en: "Waterproofing flood-tested before a single tile went up", es: "Impermeabilización probada con agua antes de poner un solo azulejo" },
          },
        ],
        image: BATH,
      },
      {
        id: "wholehome",
        detail: "4",
        title: { en: "Whole-home remodel", es: "Reforma integral" },
        location: "Oak Terrace",
        duration: { en: "5 months", es: "5 meses" },
        dimension: "32'-0\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Kitchen and living room opened up, a vaulted ceiling, new floors throughout",
              es: "Cocina y sala unidas, techo abovedado y suelos nuevos en toda la casa",
            },
          },
          {
            label: { en: "Phasing", es: "Fases" },
            value: { en: "Three phases; the family stayed at home the whole time", es: "Tres fases; la familia siguió viviendo en casa todo el tiempo" },
          },
        ],
        image: WHOLE_HOME,
      },
      {
        id: "deck",
        detail: "5",
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
        image: DECK,
      },
      {
        id: "attic",
        detail: "6",
        title: { en: "Attic primary suite", es: "Suite en el ático" },
        location: "Willow Bend",
        duration: { en: "10 weeks", es: "10 semanas" },
        dimension: "22'-0\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Rafters and collar ties left exposed, new insulation, wide pine floors",
              es: "Pares y tirantes a la vista, aislamiento nuevo y suelo ancho de pino",
            },
          },
          {
            label: { en: "Structure", es: "Estructura" },
            value: { en: "Floor reframed to carry a bedroom, signed off by the engineer", es: "Suelo reforzado para un dormitorio, con el visto bueno del ingeniero" },
          },
        ],
        image: ATTIC,
      },
      {
        id: "porch",
        detail: "7",
        title: { en: "Covered back porch", es: "Porche trasero cubierto" },
        location: "Millbrook",
        duration: { en: "5 weeks", es: "5 semanas" },
        dimension: "14'-0\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Painted beadboard ceiling, a fan on its own switch, composite floorboards",
              es: "Techo de friso pintado, ventilador con interruptor propio y tablas de compuesto",
            },
          },
          {
            label: { en: "Detail", es: "Detalle" },
            value: { en: "Roof tied into the house with no seam you can see", es: "Tejado unido a la casa sin una sola junta a la vista" },
          },
        ],
        image: PORCH,
      },
      {
        id: "windowseat",
        detail: "8",
        title: { en: "Window seat & built-ins", es: "Banco de ventana a medida" },
        location: "Elm Park",
        duration: { en: "2 weeks", es: "2 semanas" },
        dimension: "7'-6\"",
        facts: [
          {
            label: { en: "Scope", es: "Obra" },
            value: {
              en: "Cushioned seat with drawers, floor-to-ceiling cabinets, open oak shelves",
              es: "Banco tapizado con cajones, armarios de suelo a techo y estantes abiertos de roble",
            },
          },
          {
            label: { en: "Detail", es: "Detalle" },
            value: { en: "Built in our shop, installed in two days", es: "Fabricado en nuestro taller, instalado en dos días" },
          },
        ],
        image: WINDOW_SEAT,
      },
    ],
  },
  process: {
    sheet: "A-301",
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
        image: demoImage(
          "contractor",
          "step-measure",
          {
            en: "A hand holding a tape measure up against a window opening, the yellow blade lit by daylight.",
            es: "Una mano sostiene una cinta métrica contra el hueco de una ventana, con la hoja amarilla iluminada por la luz del día.",
          },
          880,
          1100,
        ),
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
        image: demoImage(
          "contractor",
          "step-drawings",
          {
            en: "A pencil floor plan marked Second Level, Scale 1/8\" = 1'-0\", with a mechanical pencil, a roll of tape, a tray of drafting pens and a drawing tube.",
            es: "Un plano a lápiz rotulado Second Level, escala 1/8\" = 1'-0\", con un portaminas, un rollo de cinta, una bandeja de rotuladores técnicos y un tubo para planos.",
          },
          879,
          1100,
        ),
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
        image: demoImage(
          "contractor",
          "step-framing",
          {
            en: "New roof trusses in pale timber with steel connector plates, braced and standing against a clear blue sky.",
            es: "Cerchas nuevas de madera clara con placas de acero, arriostradas y recortadas contra un cielo azul despejado.",
          },
          880,
          1100,
        ),
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
        image: demoImage(
          "contractor",
          "step-walkthrough",
          {
            en: "A finished dining room: a long oak table on a cream rug under a round brass chandelier, with black-framed windows and glass doors onto a wooded yard.",
            es: "Un comedor terminado: una mesa larga de roble sobre una alfombra crema bajo una lámpara circular de latón, con ventanas de marco negro y puertas de vidrio hacia un jardín arbolado.",
          },
          880,
          1100,
        ),
      },
    ],
  },
  reviewsBlock: {
    sheet: "A-401",
    kicker: { en: "Reviews", es: "Reseñas" },
    title: { en: "Signed off by the homeowners", es: "Con el visto bueno de los propietarios" },
    trades: [
      { en: "Kitchens", es: "Cocinas" },
      { en: "Baths", es: "Baños" },
      { en: "Additions", es: "Ampliaciones" },
      { en: "Decks", es: "Terrazas" },
      { en: "Whole-home", es: "Reformas integrales" },
    ],
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
    elevationLabel: { en: "Front elevation, finished", es: "Alzado principal, terminado" },
    elevationDim: "64'-0\"",
    image: demoImage(
      "contractor",
      "exterior",
      {
        en: "A finished white farmhouse with a dark standing-seam porch roof, three dormers, black shutters and a wide front porch, behind a freshly mown lawn in evening light.",
        es: "Una casa de campo blanca terminada, con tejado de porche de chapa oscura, tres buhardillas, contraventanas negras y un amplio porche delantero, tras un césped recién cortado con luz de tarde.",
      },
      1600,
      800,
    ),
  },
  footer: {
    tagline: { en: "Remodels and additions, measured twice.", es: "Reformas y ampliaciones, medidas dos veces." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
    sheets: { en: "Sheets A-101 to A-501", es: "Hojas A-101 a A-501" },
  },
};
