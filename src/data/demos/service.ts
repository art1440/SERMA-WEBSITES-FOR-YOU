import type { L10n } from "@/i18n/types";
import { demoImage, type DemoContent, type DemoImage } from "./index";

/**
 * Brightline Home (fictional plumbing, electrical and HVAC company). Every
 * user-facing string on /work/service/ lives here, in US English and in formal
 * ("usted") Spanish. Prices are typical starting points in USD.
 *
 * Nothing on the page is live: the arrival time is a stated average and the
 * "what happens when you call" timeline is labelled as a typical example.
 */

export type ServiceTrade = {
  id: "plumbing" | "electrical" | "hvac" | "water";
  name: L10n;
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
    eta: { tag: L10n; label: L10n; value: L10n; note: L10n };
    route: {
      title: L10n;
      caption: L10n;
      stops: { time: string; text: L10n }[];
    };
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
    items: {
      id: "upfront" | "workmanship" | "techs";
      label: L10n;
      promise: L10n;
      body: L10n;
    }[];
  };
  reviewsBlock: { kicker: L10n; title: L10n; rating: L10n };
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
    cta: L10n;
  };
  footer: { tagline: L10n; credit: L10n };
};

export const service: ServiceContent = {
  id: "service",
  business: "Brightline Home",
  phone: "(555) 0171",
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
      es: "Plomería · Electricidad · Calefacción y aire",
    },
    headline: [
      { en: "Fixed today.", es: "Reparado hoy." },
      { en: "Guaranteed.", es: "Garantizado." },
    ],
    intro: {
      en: "Call before 2pm and a licensed tech comes today. You get a fixed price before any work starts, and the repair is guaranteed for a full year.",
      es: "Llame antes de las 14:00 y un técnico con licencia va hoy mismo. Recibe un precio cerrado antes de empezar, y la reparación queda garantizada un año entero.",
    },
    cta: { en: "Book a visit", es: "Reserve una visita" },
    call: { en: "Call (555) 0171", es: "Llame al (555) 0171" },
    eta: {
      tag: { en: "Average", es: "Promedio" },
      label: {
        en: "Typical same-day arrival",
        es: "Llegada habitual el mismo día",
      },
      value: { en: "42 min", es: "42 min" },
      note: {
        en: "Our average from call to doorbell on same-day visits. You get a two-hour window and a text when your tech is on the way.",
        es: "Nuestro promedio desde la llamada hasta su puerta en visitas del mismo día. Le damos una franja de dos horas y un mensaje cuando el técnico va en camino.",
      },
    },
    route: {
      title: { en: "What happens when you call", es: "Qué pasa cuando llama" },
      caption: {
        en: "A typical same-day visit",
        es: "Una visita típica del mismo día",
      },
      stops: [
        {
          time: "9:02",
          text: {
            en: "A person in our Lakeview office answers. No phone tree.",
            es: "Le atiende una persona en nuestra oficina de Lakeview. Sin menús automáticos.",
          },
        },
        {
          time: "9:05",
          text: {
            en: "You get your arrival window and the $89 visit fee by text, before anyone drives out.",
            es: "Recibe por mensaje su franja de llegada y la tarifa de visita de $89, antes de que salgamos.",
          },
        },
        {
          time: "9:44",
          text: {
            en: "“Marcus, licensed plumber, is 10 minutes away,” with his photo.",
            es: "«Marcus, plomero con licencia, llega en 10 minutos», con su foto.",
          },
        },
        {
          time: "9:55",
          text: {
            en: "He finds the problem and quotes a fixed price. Nothing starts until you say yes.",
            es: "Encuentra el problema y le da un precio cerrado. No se empieza nada hasta que usted diga que sí.",
          },
        },
        {
          time: "11:20",
          text: {
            en: "Fixed, cleaned up, and guaranteed for a year.",
            es: "Reparado, limpio y con un año de garantía.",
          },
        },
      ],
    },
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
        name: { en: "Plumbing", es: "Plomería" },
        lede: {
          en: "Leaks, clogs, toilets, faucets, disposals and sump pumps.",
          es: "Fugas, atascos, inodoros, grifos, trituradores y bombas de sumidero.",
        },
        from: 149,
        jobs: [
          {
            name: { en: "Drain clearing", es: "Desatasco de desagüe" },
            from: 149,
          },
          {
            name: { en: "Toilet repair", es: "Reparación de inodoro" },
            from: 165,
          },
          {
            name: { en: "Faucet replacement", es: "Cambio de grifo" },
            from: 210,
          },
        ],
      },
      {
        id: "electrical",
        name: { en: "Electrical", es: "Electricidad" },
        lede: {
          en: "Outlets, breakers, lighting, EV chargers and panels. Master electricians on staff.",
          es: "Enchufes, disyuntores, iluminación, cargadores de auto eléctrico y paneles. Maestros electricistas en plantilla.",
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
          es: "Con licencia, antecedentes verificados y en nuestra plantilla.",
        },
        body: {
          en: "No subcontractors. You get your tech’s name and photo by text before the doorbell rings, and they wear shoe covers inside.",
          es: "Sin subcontratas. Recibe el nombre y la foto de su técnico por mensaje antes de que llame a la puerta, y dentro de casa usa cubrezapatos.",
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
    rating: {
      en: "4.9 average from 1,200+ reviews",
      es: "4.9 de media en más de 1,200 reseñas",
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
    cta: { en: "Book a visit", es: "Reserve una visita" },
  },
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
