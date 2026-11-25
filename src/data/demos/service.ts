import type { L10n } from "@/i18n/types";
import { demoImage, heroImage, type DemoContent, type DemoImage } from "./index";

/**
 * Brightline Home (fictional plumbing, electrical and HVAC company). Every
 * user-facing string on /work/service/ lives here, in US English and in formal
 * ("usted") Spanish. Prices are typical starting points in USD.
 *
 * Nothing on the page is live: the arrival time is labelled as an example and the
 * "what happens when you call" timeline is labelled as a typical example.
 */

export type ServiceTrade = {
  id: "plumbing" | "electrical" | "hvac" | "water";
  name: L10n;
  image: DemoImage;
  lede: L10n;
  /** Lowest of the jobs below, USD. */
  from: number;
  jobs: { name: L10n; from: number }[];
};

export type ServiceReview = DemoContent["reviews"][number] & { job: L10n };

export type ServiceContent = Omit<DemoContent, "reviews"> & {
  reviews: ServiceReview[];
  licence: L10n;
  nav: {
    services: L10n;
    work: L10n;
    guarantees: L10n;
    area: L10n;
    book: L10n;
    /** Phones (< 640px), where the full label would crowd the wordmark. */
    bookShort: L10n;
    home: L10n;
    primary: L10n;
  };
  hero: {
    kicker: L10n;
    /** Two lines; the h1 reads "Fixed today. Guaranteed." */
    headline: [L10n, L10n];
    intro: L10n;
    cta: L10n;
    call: L10n;
    /** Phones and 1024-1279px: the call button's short label, so the CTA row stays short. */
    callShort: L10n;
    /** The full-width photo behind the headline (the LCP image). */
    image: DemoImage;
    /** The small dispatch card (desktop only), labelled as an example. */
    eta: { tag: L10n; label: L10n; value: L10n };
  };
  /** "What happens when you call": the pinned story (the page's peak). */
  story: {
    title: L10n;
    intro: L10n;
    /** Labels the times as a typical example. */
    caption: L10n;
    steps: {
      key: string;
      time: string;
      title: L10n;
      body: L10n;
      image: DemoImage;
    }[];
  };
  services: {
    kicker: L10n;
    title: L10n;
    intro: L10n;
    fromWord: L10n;
    jobsLabel: L10n;
    visit: { label: L10n; price: number; body: L10n };
    items: ServiceTrade[];
    footnote: L10n;
  };
  work: {
    kicker: L10n;
    title: L10n;
    body: L10n;
    before: DemoImage;
    after: DemoImage;
    labels: { before: L10n; after: L10n };
    sliderName: L10n;
    /** "{n}% after" */
    valueText: L10n;
    hint: L10n;
    timeline: { label: L10n; value: L10n }[];
    scopeLabel: L10n;
    scope: L10n;
    quoted: L10n;
    paid: L10n;
    price: string;
  };
  guarantees: {
    kicker: L10n;
    title: L10n;
    intro: L10n;
    image: DemoImage;
    caption: L10n;
    items: {
      id: "upfront" | "workmanship" | "techs";
      label: L10n;
      promise: L10n;
      body: L10n;
    }[];
  };
  /** A scroll-driven strip of recent jobs between the guarantees and the reviews. */
  jobLog: {
    label: L10n;
    items: { image: DemoImage; caption: L10n }[];
  };
  reviewsBlock: { kicker: L10n; title: L10n };
  area: {
    kicker: L10n;
    title: L10n;
    body: L10n;
    neighborhoods: string[];
    ringLabels: [L10n, L10n];
    hoursLabel: L10n;
    afterHoursLabel: L10n;
    afterHours: L10n;
    phoneLabel: L10n;
    image: DemoImage;
  };
  /** The closing booking band above the footer. */
  band: { title: L10n; body: L10n; cta: L10n; call: L10n };
  footer: { tagline: L10n; credit: L10n };
};

/* ------------------------------------------------------------------ photos */
// Unsplash photos, graded cool so they sit with the before/after pair. Credits in photoCredits.

const heroWide = heroImage(
  "service",
  "hero-wide",
  {
    en: "In a bright, gray-tiled bathroom, a plumber in navy overalls works on the water pipes behind an open access panel, his blue toolbox resting on the toilet lid.",
    es: "En un baño luminoso de azulejos grises, un plomero con overol azul marino trabaja en las tuberías detrás de un panel de registro abierto, con su caja de herramientas azul sobre la tapa del inodoro.",
  },
  1600,
  1066,
);
const storyCall = demoImage(
  "service",
  "story-call",
  {
    en: "At home, a hand holds up a smartphone, ready to call, a fruit bowl blurred on the counter behind it.",
    es: "En casa, una mano sostiene un teléfono móvil listo para llamar, con un frutero desenfocado en la encimera detrás.",
  },
  1067,
  1334,
);
const storyArrive = demoImage(
  "service",
  "story-arrive",
  {
    en: "A technician in a blue hoodie and cap opens the electric meter box on the outside wall of a house.",
    es: "Un técnico con sudadera azul y gorra abre la caja del medidor eléctrico en la pared exterior de una casa.",
  },
  900,
  1125,
);
const storyFix = demoImage(
  "service",
  "story-fix",
  {
    en: "Close up, the plumber concentrates as he works on the pipes under the sink.",
    es: "De cerca, el plomero se concentra mientras trabaja en las tuberías bajo el fregadero.",
  },
  1120,
  1400,
);
const storyGuarantee = demoImage(
  "service",
  "story-guarantee",
  {
    en: "Across a dark table, a hand passes a pen over a clipboard while a homeowner signs the paperwork.",
    es: "Sobre una mesa oscura, una mano acerca un bolígrafo a una carpeta mientras una clienta firma los papeles.",
  },
  1066,
  1333,
);
const tradePlumbing = demoImage(
  "service",
  "trade-plumbing",
  {
    en: "Hands tightening a drain fitting under a sink, a steel watch on one wrist.",
    es: "Unas manos aprietan una conexión de desagüe bajo un fregadero, con un reloj de acero en la muñeca.",
  },
  960,
  1200,
);
const tradeElectrical = demoImage(
  "service",
  "trade-electrical",
  {
    en: "A gloved hand tests the terminals of an electrical panel with a red multimeter probe.",
    es: "Una mano con guante comprueba los bornes de un cuadro eléctrico con la punta roja de un multímetro.",
  },
  960,
  1200,
);
const tradeHvac = demoImage(
  "service",
  "trade-hvac",
  {
    en: "A technician in a yellow hi-vis jacket kneels at a wall cabinet, adjusting the manifold of a heating system.",
    es: "Un técnico con chaqueta reflectante amarilla, de rodillas junto a un armario de pared, ajusta el colector de un sistema de calefacción.",
  },
  960,
  1200,
);
const tradeWater = demoImage(
  "service",
  "trade-water",
  {
    en: "A pair of yellow-handled pliers grips the inlet pipe on top of a white tank water heater.",
    es: "Unos alicates de mango amarillo sujetan la tubería de entrada sobre un calentador de agua de tanque blanco.",
  },
  960,
  1200,
);
const explain = demoImage(
  "service",
  "explain",
  {
    en: "In a bright hallway, a technician in a navy T-shirt talks a smiling homeowner through the work.",
    es: "En un pasillo luminoso, un técnico con camiseta azul marino le explica el trabajo a una clienta sonriente.",
  },
  1600,
  1200,
);
const areaStreet = demoImage(
  "service",
  "area-street",
  {
    en: "A quiet suburban street in autumn: white clapboard houses, wide lawns and power lines under a soft sky.",
    es: "Una calle residencial tranquila en otoño: casas blancas de madera, jardines amplios y cables eléctricos bajo un cielo suave.",
  },
  1600,
  1200,
);
export const service: ServiceContent = {
  id: "service",
  business: "Brightline Home",
  phone: "(555) 555-0171",
  address: "Serving Greater Lakeview",
  hours: [
    {
      days: { en: "Monday – Saturday", es: "Lunes a sábado" },
      time: { en: "7am – 9pm", es: "7:00 – 21:00" },
    },
    {
      days: { en: "Sunday", es: "Domingo" },
      time: { en: "8am – 6pm", es: "8:00 – 18:00" },
    },
  ],
  licence: {
    en: "Licensed plumbing, electrical & HVAC contractor · Lic. #000000 (demo)",
    es: "Contratista con licencia de plomería, electricidad y climatización · Lic. #000000 (demo)",
  },
  nav: {
    services: { en: "Prices", es: "Precios" },
    work: { en: "Before & after", es: "Antes y después" },
    guarantees: { en: "Guarantees", es: "Garantías" },
    area: { en: "Service area", es: "Zona" },
    book: { en: "Book a visit", es: "Reserve una visita" },
    bookShort: { en: "Book a visit", es: "Reservar" },
    home: {
      en: "Brightline Home, top of page",
      es: "Brightline Home, inicio de la página",
    },
    primary: { en: "Main", es: "Principal" },
  },
  hero: {
    kicker: {
      en: "Plumbing · Electrical · Heating & cooling",
      es: "Plomería · Electricidad · Climatización",
    },
    headline: [
      { en: "Fixed today.", es: "Reparado hoy." },
      { en: "Guaranteed.", es: "Garantizado." },
    ],
    intro: {
      en: "Call before 2pm and a licensed tech comes today. A fixed price before any work starts, and the repair is guaranteed for a full year.",
      es: "Llame antes de las 14:00 y un técnico con licencia va hoy mismo. Un precio cerrado antes de empezar, y la reparación queda garantizada un año entero.",
    },
    cta: { en: "Book a visit", es: "Reserve una visita" },
    call: { en: "Call (555) 555-0171", es: "Llame al (555) 555-0171" },
    callShort: { en: "Call us", es: "Llámenos" },
    image: heroWide,
    eta: {
      tag: { en: "Example", es: "Ejemplo" },
      label: {
        en: "Next available tech",
        es: "Próximo técnico disponible",
      },
      value: { en: "42 min", es: "42 min" },
    },
  },
  story: {
    title: { en: "What happens when you call", es: "Qué pasa cuando llama" },
    intro: {
      en: "No mystery window, no surprise invoice. This is how a normal weekday call goes, from the first ring to the signed guarantee.",
      es: "Sin franjas misteriosas ni facturas sorpresa. Así va una llamada normal entre semana, desde el primer timbre hasta la garantía firmada.",
    },
    caption: {
      en: "Times are an example from a typical morning.",
      es: "Las horas son un ejemplo de una mañana típica.",
    },
    steps: [
      {
        key: "call",
        time: "9:02",
        title: {
          en: "You call. A person answers.",
          es: "Usted llama. Le atiende una persona.",
        },
        body: {
          en: "Someone in our Lakeview office picks up, not a phone tree. Within a few minutes you get your arrival window and the $89 visit fee by text, before anyone drives out.",
          es: "Contesta alguien de nuestra oficina de Lakeview, no un menú automático. En pocos minutos recibe por mensaje su franja de llegada y la tarifa de visita de $89, antes de que salgamos.",
        },
        image: storyCall,
      },
      {
        key: "arrive",
        time: "9:44",
        title: {
          en: "A tech arrives in the window.",
          es: "Un técnico llega dentro de la franja.",
        },
        body: {
          en: "Ten minutes out you get a text with your tech’s name and photo. They knock, introduce themselves and put on shoe covers before stepping inside.",
          es: "Diez minutos antes recibe un mensaje con el nombre y la foto de su técnico. Llama a la puerta, se presenta y se pone cubrezapatos antes de entrar.",
        },
        image: storyArrive,
      },
      {
        key: "fix",
        time: "9:55",
        title: { en: "Fixed, and explained.", es: "Reparado, y explicado." },
        body: {
          en: "Your tech finds the problem, shows it to you and quotes a fixed price. Nothing starts until you say yes, and before packing up they walk you through what was done.",
          es: "Su técnico encuentra el problema, se lo enseña y le da un precio cerrado. No se empieza nada hasta que usted diga que sí, y antes de recoger le explica lo que se hizo.",
        },
        image: storyFix,
      },
      {
        key: "guarantee",
        time: "11:20",
        title: { en: "Guaranteed in writing.", es: "Garantizado por escrito." },
        body: {
          en: "The invoice matches the quote, and the one-year workmanship guarantee is printed on it and signed by your tech. Cleaned up, tools out, done.",
          es: "La factura coincide con el presupuesto, y la garantía de un año de mano de obra va impresa en ella y firmada por su técnico. Todo limpio, herramientas recogidas, listo.",
        },
        image: storyGuarantee,
      },
    ],
  },
  services: {
    kicker: { en: "Services & prices", es: "Servicios y precios" },
    title: {
      en: "Four trades. One honest price list.",
      es: "Cuatro oficios. Una lista de precios honesta.",
    },
    intro: {
      en: "These are our real starting prices for the jobs we do most. Your tech confirms the exact price in writing before picking up a tool.",
      es: "Estos son nuestros precios reales de partida para los trabajos más habituales. Su técnico le confirma el precio exacto por escrito antes de tocar una herramienta.",
    },
    fromWord: { en: "from", es: "desde" },
    jobsLabel: { en: "Common jobs", es: "Trabajos habituales" },
    visit: {
      label: { en: "Every visit starts here", es: "Toda visita empieza aquí" },
      price: 89,
      body: {
        en: "Diagnosis and a fixed written quote. Go ahead with the repair and the $89 comes off your bill.",
        es: "Diagnóstico y presupuesto cerrado por escrito. Si sigue adelante con la reparación, descontamos los $89 de su factura.",
      },
    },
    items: [
      {
        id: "plumbing",
        image: tradePlumbing,
        name: { en: "Plumbing", es: "Plomería" },
        lede: {
          en: "Leaks, clogs, toilets, faucets, disposals and sump pumps.",
          es: "Fugas, tapones, inodoros, llaves, trituradores y bombas de sumidero.",
        },
        from: 149,
        jobs: [
          {
            name: { en: "Drain clearing", es: "Destape de desagüe" },
            from: 149,
          },
          {
            name: { en: "Toilet repair", es: "Reparación de inodoro" },
            from: 165,
          },
          {
            name: { en: "Faucet replacement", es: "Cambio de llave del agua" },
            from: 210,
          },
        ],
      },
      {
        id: "electrical",
        image: tradeElectrical,
        name: { en: "Electrical", es: "Electricidad" },
        lede: {
          en: "Outlets, breakers, lighting, EV chargers and panels. Master electricians on staff.",
          es: "Enchufes, disyuntores, iluminación, cargadores de auto eléctrico y paneles. Maestros electricistas en nómina.",
        },
        from: 129,
        jobs: [
          {
            name: { en: "Outlet or switch", es: "Enchufe o interruptor" },
            from: 129,
          },
          {
            name: {
              en: "Ceiling fan install",
              es: "Instalación de ventilador de techo",
            },
            from: 195,
          },
          {
            name: { en: "Panel upgrade", es: "Cambio de panel eléctrico" },
            from: 2400,
          },
        ],
      },
      {
        id: "hvac",
        image: tradeHvac,
        name: { en: "Heating & cooling", es: "Calefacción y aire" },
        lede: {
          en: "Furnaces, AC and heat pumps. Tune-ups before the season, repairs the day it quits.",
          es: "Calderas, aire acondicionado y bombas de calor. Revisión antes de la temporada y reparación el día que falla.",
        },
        from: 119,
        jobs: [
          {
            name: { en: "Seasonal tune-up", es: "Revisión de temporada" },
            from: 119,
          },
          {
            name: { en: "Thermostat install", es: "Instalación de termostato" },
            from: 185,
          },
          {
            name: { en: "AC repair", es: "Reparación de aire acondicionado" },
            from: 229,
          },
        ],
      },
      {
        id: "water",
        image: tradeWater,
        name: { en: "Water heaters", es: "Calentadores de agua" },
        lede: {
          en: "Tank and tankless: repair, flush or replace, usually installed the same day.",
          es: "De tanque o instantáneos: reparación, purga o cambio, normalmente instalados el mismo día.",
        },
        from: 139,
        jobs: [
          {
            name: { en: "Flush & inspection", es: "Purga e inspección" },
            from: 139,
          },
          { name: { en: "Repair", es: "Reparación" }, from: 189 },
          {
            name: {
              en: "50-gal tank, installed",
              es: "Tanque de 50 galones, instalado",
            },
            from: 1650,
          },
        ],
      },
    ],
    footnote: {
      en: "Prices include labor and standard parts for homes in our service area. After-hours emergency visits add $149, and we tell you before we roll a truck.",
      es: "Los precios incluyen mano de obra y piezas estándar para viviendas de nuestra zona. Las urgencias fuera de horario suman $149, y se lo decimos antes de enviar el camión.",
    },
  },
  work: {
    kicker: { en: "Before & after", es: "Antes y después" },
    title: {
      en: "Under-sink leak, fixed same day",
      es: "Fuga bajo el fregadero, reparada en el día",
    },
    body: {
      en: "A slow drip had been rotting this cabinet floor for months. One visit, one fixed price, and the bucket went in the recycling.",
      es: "Un goteo lento llevaba meses pudriendo el fondo de este mueble. Una visita, un precio cerrado y el balde acabó en el reciclaje.",
    },
    before: demoImage(
      "service",
      "before",
      {
        en: "Before: under a kitchen sink, a corroded galvanized drain trap and green-crusted copper lines drip into a plastic tub on a water-stained, warped cabinet floor.",
        es: "Antes: bajo un fregadero, un sifón galvanizado corroído y tuberías de cobre con verdín gotean en un balde de plástico sobre un fondo de mueble manchado y combado.",
      },
      1024,
      688,
    ),
    after: demoImage(
      "service",
      "after",
      {
        en: "After: the same cabinet with a new chrome drain trap, white supply lines with red and blue quarter-turn shutoffs, and a clean, dry new cabinet floor.",
        es: "Después: el mismo mueble con un sifón cromado nuevo, tuberías blancas con llaves de paso de cuarto de vuelta roja y azul, y un fondo nuevo, limpio y seco.",
      },
      1024,
      688,
    ),
    labels: {
      before: { en: "Before", es: "Antes" },
      after: { en: "After", es: "Después" },
    },
    sliderName: {
      en: "Compare before and after",
      es: "Comparar antes y después",
    },
    valueText: { en: "{n}% after", es: "{n}% después" },
    hint: {
      en: "Drag the handle, or use the arrow keys",
      es: "Arrastre el control o use las flechas",
    },
    timeline: [
      {
        label: { en: "Called", es: "Llamada" },
        value: { en: "9:10am", es: "9:10" },
      },
      {
        label: { en: "On site", es: "En casa" },
        value: { en: "9:52am", es: "9:52" },
      },
      {
        label: { en: "Fixed", es: "Reparado" },
        value: { en: "11:20am", es: "11:20" },
      },
    ],
    scopeLabel: { en: "What we did", es: "Qué hicimos" },
    scope: {
      en: "Replaced the corroded galvanized drain with a new chrome trap, swapped the leaking copper supply lines for PEX with quarter-turn shutoffs, then dried, sealed and re-floored the cabinet.",
      es: "Cambiamos el desagüe galvanizado corroído por un sifón cromado nuevo, sustituimos las tuberías de cobre con fugas por PEX con llaves de cuarto de vuelta, y secamos, sellamos y pusimos fondo nuevo al mueble.",
    },
    quoted: { en: "Quoted", es: "Presupuesto" },
    paid: { en: "Paid", es: "Pagado" },
    price: "$385",
  },

  guarantees: {
    kicker: { en: "Our guarantees", es: "Nuestras garantías" },
    title: {
      en: "Three promises, in writing.",
      es: "Tres promesas, por escrito.",
    },
    intro: {
      en: "They are printed on every invoice and signed by your tech, so you never have to take our word for it.",
      es: "Van impresas en cada factura y firmadas por su técnico, para que nunca tenga que fiarse solo de nuestra palabra.",
    },
    image: explain,
    caption: {
      en: "Before we leave, your tech walks you through the repair and the paperwork.",
      es: "Antes de irnos, su técnico le explica la reparación y los papeles.",
    },
    items: [
      {
        id: "upfront",
        label: { en: "Upfront pricing", es: "Precio por adelantado" },
        promise: {
          en: "The price we quote is the price you pay.",
          es: "El precio que le damos es el que paga.",
        },
        body: {
          en: "A fixed price in writing before any work starts. If we find something else behind the wall, we stop and ask first.",
          es: "Un precio cerrado por escrito antes de empezar. Si aparece algo más detrás de la pared, paramos y le preguntamos primero.",
        },
      },
      {
        id: "workmanship",
        label: {
          en: "1-year workmanship guarantee",
          es: "1 año de garantía de mano de obra",
        },
        promise: {
          en: "If our repair fails within a year, we fix it free.",
          es: "Si la reparación falla antes de un año, la arreglamos gratis.",
        },
        body: {
          en: "Parts also carry the manufacturer’s warranty, and we file that claim for you.",
          es: "Las piezas tienen además la garantía del fabricante, y nosotros tramitamos el reclamo por usted.",
        },
      },
      {
        id: "techs",
        label: { en: "Background-checked techs", es: "Técnicos verificados" },
        promise: {
          en: "Licensed, background-checked, on our own payroll.",
          es: "Con licencia, antecedentes verificados y en nuestra nómina.",
        },
        body: {
          en: "No subcontractors. You get your tech’s name and photo by text before the doorbell rings, and they wear shoe covers inside.",
          es: "Sin subcontratistas. Recibe el nombre y la foto de su técnico por mensaje antes de que llame a la puerta, y dentro de casa usa cubrezapatos.",
        },
      },
    ],
  },
  jobLog: {
    label: {
      en: "Recent jobs around Lakeview",
      es: "Trabajos recientes en Lakeview",
    },
    items: [
      {
        image: tradeWater,
        caption: {
          en: "Water heater flush · Elm Grove",
          es: "Purga de calentador · Elm Grove",
        },
      },
      {
        image: storyArrive,
        caption: {
          en: "Meter and panel check · Westbrook",
          es: "Revisión de medidor y panel · Westbrook",
        },
      },
      {
        image: tradeHvac,
        caption: {
          en: "Heating manifold repair · North Shore",
          es: "Reparación de colector · North Shore",
        },
      },
      {
        image: tradePlumbing,
        caption: {
          en: "Disposal swap · Millbrook",
          es: "Cambio de triturador · Millbrook",
        },
      },
      {
        image: tradeElectrical,
        caption: {
          en: "Breaker replacement · Cedar Flats",
          es: "Cambio de disyuntor · Cedar Flats",
        },
      },
    ],
  },
  reviewsBlock: {
    kicker: { en: "Reviews", es: "Reseñas" },
    title: {
      en: "From neighbors we have fixed things for",
      es: "De vecinos a los que les hemos arreglado algo",
    },
  },
  reviews: [
    {
      quote: {
        en: "Water was coming through the kitchen ceiling at 8am. A plumber was here by nine, and the price on the quote was the price on the invoice.",
        es: "A las 8 de la mañana entraba agua por el techo de la cocina. A las nueve ya había un plomero aquí, y el precio del presupuesto fue el de la factura.",
      },
      name: "Priya S.",
      job: {
        en: "Burst supply line · North Shore",
        es: "Tubería reventada · North Shore",
      },
    },
    {
      quote: {
        en: "Our furnace died the week of the first frost. Same-day visit, part on the truck, heat back on before dinner.",
        es: "La calefacción se nos murió la semana de la primera helada. Visita el mismo día, la pieza en el camión y calor de nuevo antes de la cena.",
      },
      name: "Mark & Jo T.",
      job: {
        en: "Furnace repair · Elm Grove",
        es: "Reparación de calefacción · Elm Grove",
      },
    },
    {
      quote: {
        en: "He explained both panel options without upselling, did the cheaper one properly, and left the basement cleaner than he found it.",
        es: "Nos explicó las dos opciones de panel sin presionar, hizo bien la más barata y dejó el sótano más limpio de lo que estaba.",
      },
      name: "Denise O.",
      job: {
        en: "Panel repair · Westbrook",
        es: "Reparación de panel · Westbrook",
      },
    },
  ],
  area: {
    kicker: { en: "Service area & hours", es: "Zona y horario" },
    title: {
      en: "Serving Greater Lakeview",
      es: "Damos servicio en Greater Lakeview",
    },
    body: {
      en: "Our trucks are based in Lakeview and cover about 20 miles in every direction. Just outside the ring? Call anyway; we will tell you honestly whether we can make it today.",
      es: "Nuestros camiones salen de Lakeview y cubren unas 20 millas a la redonda. ¿Vive justo fuera del círculo? Llame de todos modos; le diremos con honestidad si podemos llegar hoy.",
    },
    neighborhoods: [
      "Lakeview",
      "North Shore",
      "Elm Grove",
      "Westbrook",
      "Harbor Heights",
      "Pine Ridge",
      "Millbrook",
      "Cedar Flats",
    ],
    ringLabels: [
      { en: "10 mi", es: "10 mi" },
      { en: "20 mi", es: "20 mi" },
    ],
    hoursLabel: { en: "Phones answered", es: "Atendemos el teléfono" },
    afterHoursLabel: { en: "After hours", es: "Fuera de horario" },
    afterHours: {
      en: "Active leak, no heat or no power? The same number reaches our on-call tech. $149 after-hours fee, quoted upfront.",
      es: "¿Fuga activa, sin calefacción o sin luz? El mismo número le comunica con nuestro técnico de guardia. Recargo de $149, avisado por adelantado.",
    },
    phoneLabel: { en: "Phone", es: "Teléfono" },
    image: areaStreet,
  },
  band: {
    title: {
      en: "Something leaking, tripping or blowing cold?",
      es: "¿Algo gotea, salta o no calienta?",
    },
    body: {
      en: "Call before 2pm for a same-day visit. You get a fixed price before any work starts.",
      es: "Llame antes de las 14:00 para una visita hoy mismo. Recibe un precio cerrado antes de empezar.",
    },
    cta: { en: "Book a visit", es: "Reserve una visita" },
    call: { en: "Call (555) 555-0171", es: "Llame al (555) 555-0171" },
  },
  photoCredits: [
    "Timur Shakerzianov",
    "Jakub Żerdzicki",
    "Raze Solar",
    "Marc Zeman",
    "Toolmash Expo",
    "Marian Florinel Condruz",
    "HiveBoxx",
    "Eilis Garvey",
    "Annika Wischnewsky",
    "bhagya laxmi",
  ],
  footer: {
    tagline: {
      en: "Plumbing, electrical and heating & cooling for Greater Lakeview.",
      es: "Plomería, electricidad, calefacción y aire para Greater Lakeview.",
    },
    credit: {
      en: "Demo design by Serma",
      es: "Diseño de demostración por Serma",
    },
  },
};
