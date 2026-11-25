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

/** `amount` in USD; `from` prefixes "from"; no amount means priced at the consultation. `image`: the hover / inline preview. */
export type SalonService = { name: L10n; detail: L10n; time: L10n; amount?: number; from?: boolean; image: DemoImage };

/** One lookbook portrait: the shade (set in italic), how it was done, and by whom. */
export type SalonLook = { image: DemoImage; shade: L10n; technique: L10n; by: string };

export type SalonContent = DemoContent & {
  nav: { menu: L10n; shades: L10n; lookbook: L10n; studio: L10n; reviews: L10n; visit: L10n; book: L10n; home: L10n; primary: L10n };
  hero: { kicker: L10n; lines: [L10n, L10n]; intro: L10n; cta: L10n; menuLink: L10n; open: L10n; image: DemoImage; detail: DemoImage; caption: L10n };
  ribbon: { title: SalonHeading; intro: L10n; label: L10n; swatches: SalonSwatch[] };
  services: { kicker: L10n; title: SalonHeading; intro: L10n; items: SalonService[]; from: L10n; consult: L10n; note: L10n };
  lookbook: { title: SalonHeading; intro: L10n; label: L10n; looks: SalonLook[] };
  work: {
    title: SalonHeading;
    colour: { body: L10n; image: DemoImage; caption: L10n };
    studio: { title: L10n; body: L10n; image: DemoImage; caption: L10n };
    /** The small collage under the colour photo: two studio details and one shared caption. */
    details: { images: [DemoImage, DemoImage]; caption: L10n };
  };
  reviewsTitle: L10n;
  visit: {
    title: SalonHeading;
    body: L10n;
    cta: L10n;
    call: L10n;
    hoursLabel: L10n;
    closed: L10n;
    findUs: L10n;
    directions: L10n;
    image: DemoImage;
    imageCaption: L10n;
  };
  footer: { tagline: L10n; credit: L10n };
};

/** New photography (Unsplash, see photoCredits). Shared by the lookbook and the menu previews. */
const IMG = {
  copper: demoImage(
    "salon",
    "look-copper",
    {
      en: "A young woman with long, bright copper hair looks back over her bare shoulder against a warm terracotta wall.",
      es: "Una joven de cabello largo color cobre intenso mira por encima de su hombro desnudo ante una pared terracota cálida.",
    },
    933,
    1400,
  ),
  honey: demoImage(
    "salon",
    "look-honey",
    {
      en: "A smiling woman in a camel turtleneck, her long brown hair in loose waves with honey balayage framing her face.",
      es: "Una mujer sonriente con cuello alto color camel y el cabello castaño largo en ondas sueltas, con balayage miel que enmarca el rostro.",
    },
    1120,
    1400,
  ),
  ash: demoImage(
    "salon",
    "look-ash",
    {
      en: "The back of a head of shoulder-length waves, a dark shadow root melting into cool ash and silver ends.",
      es: "La nuca de una melena ondulada por los hombros: raíz oscura difuminada que se funde en puntas ceniza y plata.",
    },
    1120,
    1400,
  ),
  chignon: demoImage(
    "salon",
    "look-chignon",
    {
      en: "A client in a black cape, seen from behind, with auburn hair pinned into a full, textured chignon and a small jewelled pin.",
      es: "Una clienta con capa negra, de espaldas, con el cabello caoba recogido en un moño amplio y texturizado con una pequeña horquilla de pedrería.",
    },
    1066,
    1333,
  ),
  butter: demoImage(
    "salon",
    "look-butter",
    {
      en: "A woman in soft daylight with tousled butter-blonde hair falling across one eye.",
      es: "Una mujer con luz natural suave y el cabello rubio mantequilla despeinado cayendo sobre un ojo.",
    },
    1050,
    1400,
  ),
  auburn: demoImage(
    "salon",
    "look-auburn",
    {
      en: "A woman in a lace blouse glances over her shoulder, glossy chestnut-auburn hair set in smooth vintage waves.",
      es: "Una mujer con blusa de encaje mira por encima del hombro, con el cabello castaño caoba brillante marcado en ondas suaves de estilo vintage.",
    },
    933,
    1400,
  ),
  bronde: demoImage(
    "salon",
    "look-bronde",
    {
      en: "Long waves seen from behind by a sunny window, a deep brunette root softening into beige-blonde lengths.",
      es: "Ondas largas vistas de espaldas junto a una ventana soleada: raíz castaño oscuro que se suaviza en largos rubio beige.",
    },
    933,
    1400,
  ),
  espresso: demoImage(
    "salon",
    "look-espresso",
    {
      en: "A woman in a knitted sweater looks off to the side, her long espresso-brown hair in glossy loose curls.",
      es: "Una mujer con jersey de punto mira hacia un lado, con el cabello largo castaño espresso en rizos sueltos y brillantes.",
    },
    1050,
    1400,
  ),
  bridal: demoImage(
    "salon",
    "look-bridal",
    {
      en: "A bride in profile holding a small bouquet, her pale blonde hair in a soft low updo with a sprig of white flowers.",
      es: "Una novia de perfil con un pequeño ramo, el cabello rubio claro en un recogido bajo y suave con una ramita de flores blancas.",
    },
    1120,
    1400,
  ),
  blowdry: demoImage(
    "salon",
    "studio-blowdry",
    {
      en: "A stylist's hands finishing a blow-dry, a round brush lifting a section of light brown hair under the dryer.",
      es: "Las manos de una estilista terminando un secado: un cepillo redondo levanta un mechón de cabello castaño claro bajo el secador.",
    },
    960,
    1200,
  ),
  mirrors: demoImage(
    "salon",
    "studio-mirrors",
    {
      en: "Late sun across a round black-framed mirror and a pale wooden styling station.",
      es: "Sol de tarde sobre un espejo redondo de marco negro y un tocador de madera clara.",
    },
    960,
    1200,
  ),
  stairs: demoImage(
    "salon",
    "stairs",
    {
      en: "A quiet entrance hall in afternoon light: a curved staircase on the left and an arched glass door at the end.",
      es: "Un vestíbulo tranquilo con luz de tarde: una escalera curva a la izquierda y una puerta de cristal en arco al fondo.",
    },
    1120,
    1400,
  ),
};

export const salon: SalonContent = {
  id: "salon",
  business: "Maison Lumière",
  phone: "(555) 555-0137",
  address: "22 Rue Lane, Suite 3",
  hours: [
    { days: { en: "Tuesday, Wednesday", es: "Martes y miércoles" }, time: { en: "10am – 6pm", es: "10:00 – 18:00" } },
    { days: { en: "Thursday, Friday", es: "Jueves y viernes" }, time: { en: "10am – 8pm", es: "10:00 – 20:00" } },
    { days: { en: "Saturday", es: "Sábado" }, time: { en: "9am – 5pm", es: "9:00 – 17:00" } },
  ],
  nav: {
    menu: { en: "Menu", es: "Servicios" },
    shades: { en: "Shades", es: "Tonos" },
    lookbook: { en: "Lookbook", es: "Lookbook" },
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
    detail: demoImage(
      "salon",
      "detail",
      {
        en: "Close on a client's hands holding a loose copper braid threaded with sprigs of baby's breath.",
        es: "Primer plano de las manos de una clienta sosteniendo una trenza suelta color cobre con ramitas de paniculata.",
      },
      800,
      1000,
    ),
    caption: {
      en: "Soft balayage, chestnut to honey. Inès, 3\u00a0h\u00a040\u00a0min.",
      es: "Balayage suave, de castaño a miel. Inès, 3\u00a0h\u00a040\u00a0min.",
    },
  },
  ribbon: {
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
        image: IMG.blowdry,
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
        image: IMG.honey,
      },
      {
        name: { en: "Gloss", es: "Baño de brillo" },
        detail: {
          en: "A demi-permanent refresh between colour visits: richer tone, mirror shine, no lift.",
          es: "Un repaso semipermanente entre citas de color: tono más rico, brillo de espejo, sin aclarar.",
        },
        time: { en: "45 min", es: "45 min" },
        amount: 65,
        image: IMG.auburn,
      },
      {
        name: { en: "Colour correction", es: "Corrección de color" },
        detail: {
          en: "Banding, brass or a box dye gone wrong. We test, plan the sessions and quote before we start.",
          es: "Franjas, tonos amarillentos o un tinte casero que salió mal. Hacemos la prueba, planificamos las sesiones y le damos el presupuesto antes de empezar.",
        },
        time: { en: "Half or full day", es: "Media jornada o jornada completa" },
        image: IMG.ash,
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
        image: IMG.bridal,
      },
    ],
    from: { en: "from", es: "desde" },
    consult: { en: "By consult", es: "Previa consulta" },
    note: {
      en: "First colour visit? The fifteen-minute consultation and strand test are free.",
      es: "¿Primera cita de color? La consulta de quince minutos y la prueba de mechón son gratuitas.",
    },
  },
  lookbook: {
    title: {
      pre: { en: "The shades, ", es: "Los tonos, " },
      em: { en: "worn", es: "en la calle" },
      post: { en: ".", es: "." },
    },
    intro: {
      en: "Nine clients from this season, photographed the week they left the chair. Every shade starts from the colour bar and ends up somewhere of its own.",
      es: "Nueve clientas de esta temporada, fotografiadas la semana en que se levantaron del sillón. Cada tono parte de la barra de color y termina siendo solo suyo.",
    },
    label: { en: "Lookbook, this season", es: "Lookbook de esta temporada" },
    // Read in column order: three columns of three on wide screens.
    looks: [
      {
        image: IMG.copper,
        shade: { en: "Copper", es: "Cobre" },
        technique: { en: "All-over colour, glossed bright", es: "Color completo con brillo intenso" },
        by: "Camille",
      },
      {
        image: IMG.ash,
        shade: { en: "Ash", es: "Ceniza" },
        technique: { en: "Shadow root, corrected over two visits", es: "Raíz difuminada, corregida en dos visitas" },
        by: "Inès",
      },
      {
        image: IMG.espresso,
        shade: { en: "Espresso", es: "Espresso" },
        technique: { en: "Gloss only, no lift", es: "Solo baño de brillo, sin aclarar" },
        by: "Margaux",
      },
      {
        image: IMG.honey,
        shade: { en: "Honey", es: "Miel" },
        technique: { en: "Face-framing balayage", es: "Balayage que enmarca el rostro" },
        by: "Inès",
      },
      {
        image: IMG.chignon,
        shade: { en: "Auburn", es: "Caoba" },
        technique: { en: "Bridal chignon, trial and day", es: "Moño de novia, prueba y día" },
        by: "Camille",
      },
      {
        image: IMG.auburn,
        shade: { en: "Chestnut", es: "Castaño" },
        technique: { en: "Rose-gold gloss, set in waves", es: "Brillo oro rosa, marcado en ondas" },
        by: "Margaux",
      },
      {
        image: IMG.butter,
        shade: { en: "Butter blonde", es: "Rubio mantequilla" },
        technique: { en: "Babylights and a soft toner", es: "Babylights y un matiz suave" },
        by: "Inès",
      },
      {
        image: IMG.bronde,
        shade: { en: "Bronde", es: "Bronde" },
        technique: { en: "Lived-in balayage, ten weeks on", es: "Balayage natural, diez semanas después" },
        by: "Camille",
      },
      {
        image: IMG.bridal,
        shade: { en: "Champagne", es: "Champán" },
        technique: { en: "Low updo for a spring wedding", es: "Recogido bajo para una boda de primavera" },
        by: "Margaux",
      },
    ],
  },
  work: {
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
    details: {
      images: [IMG.blowdry, IMG.mirrors],
      caption: {
        en: "Finishing at the back chair, and the mirrors at four o'clock.",
        es: "El acabado en el sillón del fondo y los espejos a las cuatro de la tarde.",
      },
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
      es: "Un piso arriba, encima de la floristería. Estacionamiento en Rue Lane.",
    },
    image: IMG.stairs,
    imageCaption: { en: "The hall and stair up from Rue Lane.", es: "El vestíbulo y la escalera desde Rue Lane." },
  },
  photoCredits: [
    "Alvin Mahmudov",
    "Gabriel Silvério",
    "OmAr Taha",
    "Lera Kogan",
    "Enis Yavuz",
    "Rachel McDermott",
    "Kari Bjorn Photography",
    "Crystal Clark",
    "Vivian K",
    "Rikonavt",
    "Adam Winger",
    "Giorgio Trovato",
    "Magic Fan",
  ],
  footer: {
    tagline: { en: "Hair colour, by hand, since 2014.", es: "Color de cabello, a mano, desde 2014." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
  },
};
