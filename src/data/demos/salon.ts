import type { L10n } from "@/i18n/types";
import { demoImage, type DemoContent, type DemoImage } from "./index";

/**
 * Maison Lumière (fictional colour studio). Every user-facing string on
 * /work/salon/ lives here, in English and in formal ("usted") Spanish. Prices in USD.
 */

/** A heading with one italic, accent-underlined phrase: `pre <em>em</em> post`. */
export type SalonHeading = { pre: L10n; em: L10n; post?: L10n };

export type SalonSwatch = {
  name: L10n;
  /** The shade as painted on the swatch. */
  hex: string;
  /** Written to --salon-accent while this swatch is centred (decoration only). Defaults to `hex`. */
  accent?: string;
  /** A deeper tone of the same shade that reaches AA (>= 4.5:1) on #F6E9EA, for text and CTA fills. */
  ink: string;
  note: L10n;
};

/** `amount` in USD; `from` prefixes "from"; no amount means priced at the consultation. */
export type SalonService = { name: L10n; detail: L10n; time: L10n; amount?: number; from?: boolean };

export type SalonContent = DemoContent & {
  nav: { menu: L10n; shades: L10n; studio: L10n; reviews: L10n; visit: L10n; book: L10n; home: L10n; primary: L10n };
  hero: { kicker: L10n; lines: [L10n, L10n]; intro: L10n; cta: L10n; menuLink: L10n; open: L10n; image: DemoImage; caption: L10n };
  ribbon: { kicker: L10n; title: SalonHeading; intro: L10n; label: L10n; swatches: SalonSwatch[] };
  services: { kicker: L10n; title: SalonHeading; intro: L10n; items: SalonService[]; from: L10n; consult: L10n; note: L10n };
  work: {
    kicker: L10n;
    title: SalonHeading;
    colour: { body: L10n; image: DemoImage; caption: L10n };
    studio: { title: L10n; body: L10n; image: DemoImage; caption: L10n };
  };
  reviewsTitle: L10n;
  visit: {
    kicker: L10n;
    title: SalonHeading;
    body: L10n;
    cta: L10n;
    call: L10n;
    hoursLabel: L10n;
    closed: L10n;
    findUs: L10n;
    directions: L10n;
  };
  footer: { tagline: L10n; credit: L10n };
};

export const salon: SalonContent = {
  id: "salon",
  business: "Maison Lumière",
  phone: "(555) 0137",
  address: "22 Rue Lane, Suite 3",
  hours: [
    { days: { en: "Tuesday, Wednesday", es: "Martes y miércoles" }, time: { en: "10am – 6pm", es: "10:00 – 18:00" } },
    { days: { en: "Thursday, Friday", es: "Jueves y viernes" }, time: { en: "10am – 8pm", es: "10:00 – 20:00" } },
    { days: { en: "Saturday", es: "Sábado" }, time: { en: "9am – 5pm", es: "9:00 – 17:00" } },
  ],
  nav: {
    menu: { en: "Menu", es: "Servicios" },
    shades: { en: "Shades", es: "Tonos" },
    studio: { en: "Studio", es: "El salón" },
    reviews: { en: "Reviews", es: "Reseñas" },
    visit: { en: "Visit", es: "Visítenos" },
    book: { en: "Book", es: "Reservar" },
    home: { en: "Maison Lumière, top of page", es: "Maison Lumière, inicio de la página" },
    primary: { en: "Main", es: "Principal" },
  },
  hero: {
    kicker: { en: "Colour studio, est. 2014", es: "Estudio de color, desde 2014" },
    lines: [
      { en: "Colour that", es: "Color que hace" },
      { en: "turns heads.", es: "voltear miradas." },
    ],
    intro: {
      en: "Balayage, glosses and corrections, painted by hand by three colourists who only do colour. Every appointment starts with a strand test and a price you agree to before anything is mixed.",
      es: "Balayage, baños de brillo y correcciones, pintados a mano por tres coloristas que solo se dedican al color. Cada cita empieza con una prueba de mechón y un precio que usted aprueba antes de preparar la mezcla.",
    },
    cta: { en: "Book a consultation", es: "Reserve una consulta" },
    menuLink: { en: "See the menu", es: "Ver servicios y precios" },
    open: { en: "Open Tuesday to Saturday", es: "Abierto de martes a sábado" },
    image: demoImage(
      "salon",
      "hero",
      {
        en: "A woman seen from behind against a dusty-rose wall, her long hair in loose waves of chestnut melting into honey-gold balayage.",
        es: "Una mujer de espaldas ante una pared rosa empolvado, con el cabello largo en ondas sueltas que pasan del castaño a un balayage dorado miel.",
      },
      1024,
      688,
    ),
    caption: {
      en: "Soft balayage, chestnut to honey. Inès, 3\u00a0h\u00a040\u00a0min.",
      es: "Balayage suave, de castaño a miel. Inès, 3\u00a0h\u00a040\u00a0min.",
    },
  },
  ribbon: {
    kicker: { en: "The colour bar", es: "La barra de color" },
    title: {
      pre: { en: "Six house ", es: "Seis tonos " },
      em: { en: "shades", es: "de la casa" },
    },
    intro: {
      en: "Every formula we mix starts from one of six bases, then is tuned to your skin, your natural level and how often you want to come back.",
      es: "Cada fórmula que preparamos parte de una de estas seis bases y se ajusta a su tono de piel, a su color natural y a la frecuencia con la que desee volver.",
    },
    label: { en: "House shades", es: "Tonos de la casa" },
    swatches: [
      {
        name: { en: "Honey", es: "Miel" },
        hex: "#D9A066",
        ink: "#865719",
        note: { en: "Warm gold through brunette", es: "Oro cálido sobre castaño" },
      },
      {
        name: { en: "Copper", es: "Cobre" },
        hex: "#B5562F",
        ink: "#9A4626",
        note: { en: "Bright, for natural redheads", es: "Intenso, para pelirrojas naturales" },
      },
      {
        name: { en: "Rose gold", es: "Oro rosa" },
        hex: "#D88C8C",
        ink: "#96444F",
        note: { en: "A gloss over pale blonde", es: "Un brillo sobre rubio claro" },
      },
      {
        name: { en: "Espresso", es: "Espresso" },
        hex: "#4A2C22",
        ink: "#4A2C22",
        note: { en: "Deep, glossy, low upkeep", es: "Profundo, brillante, poco mantenimiento" },
      },
      {
        name: { en: "Ash", es: "Ceniza" },
        hex: "#B9B4AD",
        ink: "#5C5650",
        note: { en: "Cool, cancels brass", es: "Frío, neutraliza el amarillo" },
      },
      {
        name: { en: "Plum", es: "Ciruela" },
        hex: "#7A3E5C",
        // Ends the page on the brand plum it opened with (4.95:1 on #F6E9EA).
        accent: "#9B4A6B",
        ink: "#9B4A6B",
        note: { en: "Violet in the light only", es: "Violeta solo a contraluz" },
      },
    ],
  },
  services: {
    kicker: { en: "Services", es: "Servicios" },
    title: {
      pre: { en: "The ", es: "La " },
      em: { en: "menu", es: "carta" },
    },
    intro: {
      en: "Prices include a wash, a blow-dry and a written note of your formula, so any of us can repeat it.",
      es: "Los precios incluyen lavado, secado y la fórmula de su color por escrito, para que cualquiera de nosotras pueda repetirla.",
    },
    items: [
      {
        name: { en: "Cut & style", es: "Corte y peinado" },
        detail: {
          en: "Cut dry for shape, finished wet for detail, styled the way you will wear it on a Tuesday.",
          es: "Cortado en seco para dar forma, rematado en mojado para el detalle y peinado como usted lo llevará un martes cualquiera.",
        },
        time: { en: "60 min", es: "60 min" },
        amount: 85,
      },
      {
        name: { en: "Balayage", es: "Balayage" },
        detail: {
          en: "Hand-painted lightness that grows out softly. Includes a toner and a gloss to set the shade.",
          es: "Claridad pintada a mano que crece con suavidad. Incluye matizador y baño de brillo para fijar el tono.",
        },
        time: { en: "3 – 4 h", es: "3 – 4 h" },
        amount: 220,
        from: true,
      },
      {
        name: { en: "Gloss", es: "Baño de brillo" },
        detail: {
          en: "A demi-permanent refresh between colour visits: richer tone, mirror shine, no lift.",
          es: "Un repaso semipermanente entre citas de color: tono más rico, brillo de espejo, sin aclarar.",
        },
        time: { en: "45 min", es: "45 min" },
        amount: 65,
      },
      {
        name: { en: "Colour correction", es: "Corrección de color" },
        detail: {
          en: "Banding, brass or a box dye gone wrong. We test, plan the sessions and quote before we start.",
          es: "Franjas, tonos amarillentos o un tinte casero que salió mal. Hacemos la prueba, planificamos las sesiones y le damos el presupuesto antes de empezar.",
        },
        time: { en: "Half or full day", es: "Media jornada o jornada completa" },
      },
      {
        name: { en: "Bridal", es: "Novias" },
        detail: {
          en: "A trial a month ahead, then hair on the day for you and up to four others, here or on location.",
          es: "Una prueba un mes antes y el peinado del gran día para usted y hasta cuatro personas más, aquí o en el lugar de la celebración.",
        },
        time: { en: "Trial + day", es: "Prueba + día" },
        amount: 180,
        from: true,
      },
    ],
    from: { en: "from", es: "desde" },
    consult: { en: "By consult", es: "Previa consulta" },
    note: {
      en: "First colour visit? The fifteen-minute consultation and strand test are free.",
      es: "¿Primera cita de color? La consulta de quince minutos y la prueba de mechón son gratuitas.",
    },
  },
  work: {
    kicker: { en: "Recent work", es: "Trabajos recientes" },
    title: {
      pre: { en: "Copper, ", es: "Cobre " },
      em: { en: "melted", es: "fundido" },
      post: { en: " into rose", es: " en rosa" },
    },
    colour: {
      body: {
        en: "Camille lifted the ends two levels, laid a copper base at the root and glossed rose gold through the lengths, so the grow-out looks planned rather than overdue.",
        es: "Camille aclaró las puntas dos niveles, aplicó una base cobre en la raíz y un brillo oro rosa en los largos, para que el crecimiento parezca intencionado y no un retoque pendiente.",
      },
      image: demoImage(
        "salon",
        "colour",
        {
          en: "The back of a shoulder-length bob in glossy waves, deep copper at the roots melting into rose-gold ends.",
          es: "La parte posterior de una melena por los hombros en ondas brillantes, cobre intenso en la raíz que se funde en puntas oro rosa.",
        },
        896,
        1120,
      ),
      caption: {
        en: "Copper base, rose-gold gloss through the ends. Camille, 2\u00a0h\u00a030\u00a0min.",
        es: "Base cobre y brillo oro rosa en las puntas. Camille, 2\u00a0h\u00a030\u00a0min.",
      },
    },
    studio: {
      title: { en: "The studio", es: "El estudio" },
      body: {
        en: "Four chairs under tall windows, a quiet wash room at the back, and a colour bar where you can watch your formula being weighed. Tea, oat milk and nobody in a hurry.",
        es: "Cuatro sillones bajo ventanales, una sala de lavado tranquila al fondo y una barra de color donde puede ver cómo se pesa su fórmula. Té, leche de avena y nadie con prisa.",
      },
      image: demoImage(
        "salon",
        "interior",
        {
          en: "The salon in afternoon light: blush velvet chairs with brass bases, a marble counter, arched gold mirrors on a plum wall and tall windows onto the street.",
          es: "El salón con luz de tarde: sillones de terciopelo rosa con base de latón, un mostrador de mármol, espejos dorados en arco sobre una pared ciruela y ventanales a la calle.",
        },
        1024,
        688,
      ),
      caption: { en: "The studio, Suite 3.", es: "El estudio, Suite 3." },
    },
  },
  reviewsTitle: { en: "In their words", es: "En palabras de nuestras clientas" },
  reviews: [
    {
      quote: {
        en: "Three salons tried to fix my box dye. Inès did it in two visits, and it finally looks like my own hair, only better.",
        es: "Tres salones intentaron arreglar mi tinte casero. Inès lo consiguió en dos visitas y por fin parece mi propio pelo, solo que mejor.",
      },
      name: "Hannah W.",
    },
    {
      quote: {
        en: "They wrote down my formula, so my gloss looks the same every six weeks.",
        es: "Anotaron mi fórmula, así que mi baño de brillo queda igual cada seis semanas.",
      },
      name: "Priya S.",
    },
    {
      quote: {
        en: "Camille did my bridal trial and the day itself. Not one pin moved until midnight.",
        es: "Camille me hizo la prueba de novia y el peinado del día. No se movió ni una horquilla hasta medianoche.",
      },
      name: "Sofía M.",
    },
  ],
  visit: {
    kicker: { en: "Visit", es: "Visítenos" },
    title: {
      pre: { en: "Start with a ", es: "Empiece con una " },
      em: { en: "consultation.", es: "consulta." },
    },
    body: {
      en: "Fifteen minutes, free, with the colourist who will do your hair. We look at your colour history, test a strand and give you a price before anything is mixed.",
      es: "Quince minutos, sin coste, con la colorista que se ocupará de su cabello. Revisamos su historial de color, probamos un mechón y le damos un precio antes de preparar nada.",
    },
    cta: { en: "Book a consultation", es: "Reserve una consulta" },
    call: { en: "Or call", es: "O llame al" },
    hoursLabel: { en: "Hours", es: "Horario" },
    closed: { en: "Closed Sunday and Monday", es: "Cerrado domingo y lunes" },
    findUs: { en: "Find us", es: "Dónde estamos" },
    directions: {
      en: "Up one flight, above the florist. Street parking on Rue Lane.",
      es: "Un piso arriba, encima de la floristería. Aparcamiento en Rue Lane.",
    },
  },
  footer: {
    tagline: { en: "Hair colour, by hand, since 2014.", es: "Color de cabello, a mano, desde 2014." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
  },
};
