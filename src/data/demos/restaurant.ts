import type { L10n } from "@/i18n/types";
import { demoImage, type DemoContent, type DemoImage } from "./index";

/**
 * Ember & Oak (fictional wood-fired restaurant). Every user-facing string on
 * /work/restaurant/ lives here, in English and in formal ("usted") Spanish.
 * Prices in USD, set like a printed menu card (no currency sign on the card).
 */

export type MenuItem = {
  /** Stable key: never derived from the locale, so a language switch never remounts a row. */
  id: string;
  name: L10n;
  price: number;
  detail: L10n;
};

export type MenuCourse = {
  id: "small" | "fire" | "sweet";
  title: L10n;
  /** Small-caps note set at the end of the course rule, e.g. "to share". */
  note: L10n;
  items: MenuItem[];
};

/** A review with what the table ordered. */
export type RestaurantReview = DemoContent["reviews"][number] & { table: L10n; ordered: L10n };

export type RestaurantContent = Omit<DemoContent, "reviews"> & {
  reviews: RestaurantReview[];
  nav: { menu: L10n; fire: L10n; room: L10n; reviews: L10n; hours: L10n; reserve: L10n; home: L10n; primary: L10n };
  hero: {
    kicker: L10n;
    /** Two lines; the h1 reads "Wood fire. Late tables." */
    headline: [L10n, L10n];
    intro: L10n;
    reserve: L10n;
    pickup: L10n;
    tonight: L10n;
    /** The ticket pinned to the hero photo (desktop): what is in the photo, priced as on the menu. */
    special: { label: L10n; name: L10n; price: number };
    image: DemoImage;
    /** The small print of oak embers that floats over the hero photo (foreground plane). */
    embers: DemoImage;
  };
  menu: {
    title: L10n;
    intro: L10n;
    cardTitle: L10n;
    cardSub: L10n;
    footnote: L10n;
    courses: MenuCourse[];
    flatbread: DemoImage;
    steak: DemoImage;
    flatbreadCaption: L10n;
    steakCaption: L10n;
  };
  /** The page's peak: the oven opens to full bleed, then three lines on how the kitchen cooks. */
  fire: {
    image: DemoImage;
    /** Overlay line on the open photo (the section's h2). Short, non-interactive. */
    title: L10n;
    caption: L10n;
    kicker: L10n;
    /** Three lines, revealed one by one. */
    lines: [L10n, L10n, L10n];
    body: L10n;
  };
  /** Interlude: two counter-running rows of dish photos and a row of dish names. */
  dishes: {
    title: L10n;
    rowA: DemoImage[];
    rowB: DemoImage[];
    names: L10n[];
  };
  room: {
    kicker: L10n;
    title: L10n;
    body: L10n;
    facts: { label: L10n; value: L10n }[];
    cta: L10n;
    image: DemoImage;
    /** The collage beside the room photo: the long table, a glass by candlelight. */
    table: DemoImage;
    wine: DemoImage;
  };
  reviewsTitle: L10n;
  orderedLabel: L10n;
  visit: {
    kicker: L10n;
    title: L10n;
    body: L10n;
    reserve: L10n;
    pickup: L10n;
    walkIns: L10n;
    hoursLabel: L10n;
    closed: L10n;
    findUs: L10n;
    directions: L10n;
    call: L10n;
    image: DemoImage;
  };
  footer: { tagline: L10n; credit: L10n };
};

export const restaurant: RestaurantContent = {
  id: "restaurant",
  business: "Ember & Oak",
  phone: "(555) 555-0119",
  address: "310 Foundry St",
  hours: [
    { days: { en: "Tuesday – Sunday", es: "Martes a domingo" }, time: { en: "5pm – 11pm", es: "17:00 – 23:00" } },
    { days: { en: "Friday & Saturday", es: "Viernes y sábado" }, time: { en: "5pm – midnight", es: "17:00 – 00:00" } },
  ],
  nav: {
    menu: { en: "Menu", es: "Carta" },
    fire: { en: "The fire", es: "El fuego" },
    room: { en: "Private dining", es: "Comedor privado" },
    reviews: { en: "Reviews", es: "Reseñas" },
    hours: { en: "Hours", es: "Horario" },
    reserve: { en: "Reserve", es: "Reservar" },
    home: { en: "Ember & Oak, top of page", es: "Ember & Oak, inicio de la página" },
    primary: { en: "Main", es: "Principal" },
  },
  hero: {
    kicker: { en: "Wood-fired kitchen · 310 Foundry St", es: "Cocina de leña · 310 Foundry St" },
    headline: [
      { en: "Wood fire.", es: "Fuego de leña." },
      { en: "Late tables.", es: "Mesas hasta tarde." },
    ],
    intro: {
      en: "Everything on the menu meets the oak oven or the grill. Seventy seats, a long bar, and a kitchen that keeps cooking until eleven, midnight on weekends.",
      es: "Todo lo que servimos pasa por el horno de roble o por la parrilla. Setenta cubiertos, una barra larga y una cocina que no cierra hasta las once; los fines de semana, hasta medianoche.",
    },
    reserve: { en: "Reserve a table", es: "Reserve mesa" },
    pickup: { en: "Order pickup", es: "Pida para llevar" },
    tonight: {
      en: "Twelve bar seats held for walk-ins every night",
      es: "Doce plazas en la barra para quien llegue sin reserva, cada noche",
    },
    special: {
      label: { en: "Out of the oven", es: "Recién salido del horno" },
      name: { en: "Half chicken, charred lemon", es: "Medio pollo, limón tostado" },
      price: 29,
    },
    image: demoImage(
      "restaurant",
      "hero",
      {
        en: "A spatchcocked chicken in a cast-iron pan with charred lemon halves and rosemary, the wood oven burning behind it.",
        es: "Un pollo abierto en una sartén de hierro con medios limones tostados y romero, con el horno de leña encendido al fondo.",
      },
      1024,
      688,
    ),
    embers: demoImage(
      "restaurant",
      "embers",
      { en: "Oak embers glowing red under a charred log.", es: "Brasas de roble al rojo bajo un tronco carbonizado." },
      720,
      900,
    ),
  },
  menu: {
    title: { en: "Tonight, off the fire.", es: "Esta noche, a la brasa." },
    intro: {
      en: "The menu changes with the market. Order a few small plates for the table, then something from the fire each; the ribeye is built for two.",
      es: "La carta cambia según el mercado. Pida unos platos pequeños para compartir y luego algo de la brasa para cada uno; el ribeye está pensado para dos.",
    },
    cardTitle: { en: "Dinner", es: "Cena" },
    cardSub: { en: "Served from 5pm · cooked over red oak", es: "Desde las 17:00 · cocinado con roble rojo" },
    footnote: {
      en: "Prices in US dollars. Please tell your server about any allergies; most dishes can be made without nuts or dairy.",
      es: "Precios en dólares estadounidenses. Indique cualquier alergia a su camarero; casi todos los platos pueden prepararse sin frutos secos ni lácteos.",
    },
    courses: [
      {
        id: "small",
        title: { en: "Small plates", es: "Para compartir" },
        note: { en: "to share", es: "al centro" },
        items: [
          {
            id: "bread",
            name: { en: "Oak-grilled sourdough", es: "Masa madre a la brasa" },
            price: 7,
            detail: {
              en: "Two-day sourdough charred over the coals, cultured butter, flaky salt.",
              es: "Pan de masa madre de dos días tostado sobre las brasas, mantequilla cultivada y sal en escamas.",
            },
          },
          {
            id: "carrots",
            name: { en: "Charred carrots", es: "Zanahorias tatemadas" },
            price: 12,
            detail: {
              en: "Whipped labneh, hazelnut dukkah, chile honey, carrot-top salsa verde.",
              es: "Labneh batido, dukkah de avellana, miel picante y salsa verde de sus propias hojas.",
            },
          },
          {
            id: "clams",
            name: { en: "Clams in the embers", es: "Almejas en las brasas" },
            price: 18,
            detail: {
              en: "Littlenecks opened in a hot pan, ’nduja butter, white wine, lemon, grilled bread alongside.",
              es: "Almejas abiertas en sartén muy caliente, mantequilla de ’nduja, vino blanco, limón y pan tostado para mojar.",
            },
          },
        ],
      },
      {
        id: "fire",
        title: { en: "From the fire", es: "De la brasa" },
        note: { en: "oven & grill", es: "horno y parrilla" },
        items: [
          {
            id: "flatbread",
            name: { en: "Burrata flatbread", es: "Pan plano con burrata" },
            price: 19,
            detail: {
              en: "Blistered in the oak oven, slow-roasted cherry tomatoes, basil, a whole burrata, green olive oil.",
              es: "Horneado en el horno de roble, tomates cherry asados lentamente, albahaca, una burrata entera y aceite de oliva verde.",
            },
          },
          {
            id: "ribeye",
            name: { en: "Ember ribeye, 14 oz", es: "Ribeye a la leña, 14 oz" },
            price: 48,
            detail: {
              en: "Dry-aged 28 days, seared hard over oak, rested and sliced. Chimichurri and grilled scallions.",
              es: "Madurado 28 días, sellado a fuego vivo con roble, reposado y cortado. Chimichurri y cebolletas a la parrilla.",
            },
          },
          {
            id: "chicken",
            name: { en: "Half chicken", es: "Medio pollo" },
            price: 29,
            detail: {
              en: "Brined overnight, roasted in cast iron at the mouth of the oven, charred lemon, rosemary pan juices.",
              es: "En salmuera toda la noche, asado en hierro fundido a la boca del horno, limón tostado y su jugo al romero.",
            },
          },
        ],
      },
      {
        id: "sweet",
        title: { en: "Sweet", es: "Postres" },
        note: { en: "to finish", es: "para terminar" },
        items: [
          {
            id: "cake",
            name: { en: "Olive-oil cake", es: "Bizcocho de aceite de oliva" },
            price: 11,
            detail: {
              en: "Warm from the oven, blood-orange syrup, crème fraîche, a pinch of sea salt.",
              es: "Tibio, recién salido del horno, almíbar de naranja sanguina, crème fraîche y una pizca de sal marina.",
            },
          },
          {
            id: "chocolate",
            name: { en: "Smoked chocolate pot", es: "Crema de chocolate ahumado" },
            price: 10,
            detail: {
              en: "Dark chocolate set with oak-smoked cream, brown-butter shortbread on the side.",
              es: "Chocolate negro cuajado con nata ahumada en roble y galleta de mantequilla tostada.",
            },
          },
        ],
      },
    ],
    flatbread: demoImage(
      "restaurant",
      "flatbread",
      {
        en: "Burrata flatbread from above: a blistered crust, roasted cherry tomatoes, basil leaves and a torn burrata glossed with olive oil.",
        es: "Pan plano con burrata visto desde arriba: masa con burbujas tostadas, tomates cherry asados, hojas de albahaca y una burrata abierta con aceite de oliva.",
      },
      1024,
      1024,
    ),
    steak: demoImage(
      "restaurant",
      "steak",
      {
        en: "Sliced ribeye, pink in the middle, under chimichurri, with grilled scallions and the fire glowing behind.",
        es: "Ribeye cortado, rosado por dentro, con chimichurri, cebolletas a la parrilla y el fuego encendido al fondo.",
      },
      1024,
      1024,
    ),
    flatbreadCaption: { en: "Burrata flatbread", es: "Pan plano con burrata" },
    steakCaption: { en: "Ember ribeye", es: "Ribeye a la leña" },
  },
  fire: {
    image: demoImage(
      "restaurant",
      "hearth",
      {
        en: "Inside the oak oven at full heat: split logs burning under a curl of flame, the light thrown back off the hearth stone.",
        es: "El interior del horno de roble a pleno fuego: troncos partidos ardiendo bajo una lengua de llama, con su luz reflejada en la piedra del hogar.",
      },
      1600,
      1202,
    ),
    title: { en: "Everything here touches the fire.", es: "Aquí todo pasa por el fuego." },
    caption: { en: "The oak oven, an hour before service", es: "El horno de roble, una hora antes del servicio" },
    kicker: { en: "How we cook", es: "Cómo cocinamos" },
    lines: [
      { en: "We light the oak at three every afternoon.", es: "Encendemos el roble cada tarde a las tres." },
      { en: "Nothing on the menu sees a gas flame.", es: "Ningún plato de la carta pasa por una llama de gas." },
      { en: "The last table eats as well as the first.", es: "La última mesa come tan bien como la primera." },
    ],
    body: {
      en: "Red oak burns hot and clean and leaves a sweet smoke. The oven bakes the bread and blisters the flatbreads; its coals go under the grill for the steaks and into the pan for the clams. By closing there is nothing left but embers.",
      es: "El roble rojo arde fuerte y limpio y deja un humo dulce. El horno cuece el pan y tuesta los panes planos; sus brasas pasan a la parrilla para la carne y a la sartén para las almejas. Al cerrar, solo quedan brasas.",
    },
  },
  dishes: {
    title: { en: "Out of the kitchen tonight", es: "Esta noche, de la cocina" },
    rowA: [
      demoImage(
        "restaurant",
        "oysters",
        {
          en: "Oysters on crushed ice on a wooden board, a lemon wedge beside them.",
          es: "Ostras sobre hielo picado en una tabla de madera, con una cuña de limón al lado.",
        },
        880,
        1100,
      ),
      demoImage(
        "restaurant",
        "cocktail",
        {
          en: "An amber cocktail over ice on a wooden board, finished with rosemary and a dried orange wheel.",
          es: "Un cóctel ámbar con hielo sobre una tabla de madera, con romero y una rodaja de naranja deshidratada.",
        },
        880,
        1100,
      ),
      demoImage(
        "restaurant",
        "chocolate",
        {
          en: "A dark chocolate cake under a slow pour of warm chocolate sauce.",
          es: "Un bizcocho de chocolate negro bajo un hilo lento de salsa de chocolate caliente.",
        },
        880,
        1100,
      ),
    ],
    rowB: [
      demoImage(
        "restaurant",
        "roots",
        {
          en: "Charred carrots and roasted roots in a black bowl, two serving spoons resting on the rim.",
          es: "Zanahorias tatemadas y raíces asadas en un cuenco negro, con dos cucharas de servir apoyadas en el borde.",
        },
        880,
        1100,
      ),
      demoImage(
        "restaurant",
        "grill",
        {
          en: "The wood grill at full flame, split oak burning behind the iron grates.",
          es: "La parrilla de leña a pleno fuego, con troncos de roble ardiendo tras las rejillas de hierro.",
        },
        880,
        1100,
      ),
      demoImage(
        "restaurant",
        "fish",
        {
          en: "A whole fish off the grill on a slate board, with charred green beans, cherry tomatoes and half a lime.",
          es: "Un pescado entero a la parrilla sobre una pizarra, con judías verdes tostadas, tomates cherry y medio limón.",
        },
        880,
        1100,
      ),
      demoImage(
        "restaurant",
        "negroni",
        {
          en: "The bartender twists an orange peel over a short amber drink, the oils catching the light.",
          es: "El barman retuerce una piel de naranja sobre un trago corto de color ámbar; los aceites brillan a contraluz.",
        },
        880,
        1100,
      ),
    ],
    names: [
      { en: "Ember ribeye", es: "Ribeye a la leña" },
      { en: "Oysters on ice", es: "Ostras sobre hielo" },
      { en: "Burrata flatbread", es: "Pan plano con burrata" },
      { en: "Charred carrots", es: "Zanahorias tatemadas" },
      { en: "Whole fish over the coals", es: "Pescado entero a las brasas" },
      { en: "Clams in the embers", es: "Almejas en las brasas" },
      { en: "Smoked chocolate", es: "Chocolate ahumado" },
      { en: "Oak-smoked old fashioned", es: "Old fashioned ahumado en roble" },
    ],
  },
  room: {
    kicker: { en: "Private dining", es: "Comedor privado" },
    title: { en: "The back room seats up to 24.", es: "¿Una celebración? El salón del fondo acoge hasta 24." },
    body: {
      en: "One long oak table beside the oven, its own door and its own server. We cook a family-style menu for the whole table, so nobody spends the evening reading a menu.",
      es: "Una mesa larga de roble junto al horno, con entrada y camarero propios. Cocinamos un menú para compartir para toda la mesa, así nadie pasa la velada leyendo la carta.",
    },
    facts: [
      { label: { en: "Guests", es: "Invitados" }, value: { en: "10 to 24", es: "De 10 a 24" } },
      { label: { en: "Family-style menu", es: "Menú para compartir" }, value: { en: "from $65 a head", es: "desde $65 por persona" } },
      { label: { en: "Booked", es: "Reservas" }, value: { en: "Tuesday to Sunday, from 5pm", es: "De martes a domingo, desde las 17:00" } },
    ],
    cta: { en: "Ask about the back room", es: "Consulte por el salón" },
    image: demoImage(
      "restaurant",
      "room",
      {
        en: "The dining room at night: red leather banquettes, brick walls, candles on wooden tables and the domed wood oven glowing at the back.",
        es: "El comedor de noche: banquetas de cuero rojo, paredes de ladrillo, velas sobre mesas de madera y el horno de leña encendido al fondo.",
      },
      1024,
      688,
    ),
    table: demoImage(
      "restaurant",
      "table",
      {
        en: "A long wooden table set family-style: shared plates, open wine and candles down the middle.",
        es: "Una mesa larga de madera preparada para compartir: platos al centro, vino abierto y velas a lo largo.",
      },
      1120,
      1400,
    ),
    wine: demoImage(
      "restaurant",
      "wine",
      { en: "A glass of red wine catching the candlelight.", es: "Una copa de vino tinto a la luz de las velas." },
      880,
      1100,
    ),
  },
  reviewsTitle: { en: "What they ordered, and what they said.", es: "Qué pidieron y qué dijeron." },
  orderedLabel: { en: "Ordered", es: "Pidieron" },
  reviews: [
    {
      quote: {
        en: "We came for the ribeye and ended up ordering the carrots twice. Best table in town at ten on a Tuesday.",
        es: "Vinimos por el ribeye y acabamos pidiendo las zanahorias dos veces. La mejor mesa de la ciudad un martes a las diez.",
      },
      name: "Marcus L.",
      table: { en: "Table for two · Tuesday", es: "Mesa para dos · martes" },
      ordered: { en: "Ribeye, charred carrots ×2, olive-oil cake", es: "Ribeye, zanahorias ×2, bizcocho de aceite" },
    },
    {
      quote: {
        en: "Booked the back room for my dad’s seventieth. They cooked for all twenty of us and nobody looked at a menu all night.",
        es: "Reservé el salón del fondo para los setenta de mi padre. Cocinaron para los veinte y nadie tuvo que mirar la carta en toda la noche.",
      },
      name: "Ana P.",
      table: { en: "Back room · Saturday", es: "Salón del fondo · sábado" },
      ordered: { en: "The family-style menu", es: "El menú para compartir" },
    },
    {
      quote: {
        en: "The flatbread survives the drive home. The pickup was ready the minute they said, still blistered.",
        es: "El pan plano aguanta el viaje a casa. El pedido estaba listo justo a la hora prometida, todavía crujiente.",
      },
      name: "Priya S.",
      table: { en: "Pickup · Friday", es: "Para recoger · viernes" },
      ordered: { en: "Burrata flatbread, half chicken", es: "Pan plano con burrata, medio pollo" },
    },
  ],
  visit: {
    kicker: { en: "Reservations", es: "Reservas" },
    title: { en: "Book a table, or take the fire home.", es: "Reserve mesa o llévese el fuego a casa." },
    body: {
      en: "Tables open thirty days ahead. Pickup orders are ready in twenty-five minutes and travel in boxes that keep the crust crisp.",
      es: "Las mesas se abren con treinta días de antelación. Los pedidos para recoger están listos en veinticinco minutos y viajan en cajas que mantienen la masa crujiente.",
    },
    reserve: { en: "Reserve a table", es: "Reserve mesa" },
    pickup: { en: "Order pickup", es: "Pida para llevar" },
    walkIns: {
      en: "Running late? We hold your table for fifteen minutes; a quick call buys you more.",
      es: "¿Llega tarde? Guardamos su mesa quince minutos; si nos llama, le esperamos más.",
    },
    hoursLabel: { en: "Hours", es: "Horario" },
    closed: { en: "Closed Mondays", es: "Cerrado los lunes" },
    findUs: { en: "Find us", es: "Dónde estamos" },
    directions: {
      en: "In the old foundry building; look for the smoke. Street parking after 6pm.",
      es: "En el antiguo edificio de la fundición; busque el humo. Estacionamiento en la calle a partir de las 18:00.",
    },
    call: { en: "Phone", es: "Teléfono" },
    image: demoImage(
      "restaurant",
      "bar",
      {
        en: "The long bar at night: low stools, candles on the counter and shelves of bottles lit warm behind it.",
        es: "La barra larga de noche: taburetes bajos, velas sobre la barra y estantes de botellas con luz cálida al fondo.",
      },
      1066,
      1333,
    ),
  },
  footer: {
    tagline: { en: "Wood fire, late tables, Foundry Street.", es: "Fuego de leña y mesas hasta tarde en Foundry Street." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
  },
  photoCredits: [
    "Ty Finck",
    "Marius",
    "Mitili Mitili",
    "Ash Edmonds",
    "Jordane Mathieu",
    "Christina Rumpf",
    "Maxim Abramov",
    "Alina Bosakova",
    "Martina Alpeza",
    "Stephanie McCabe",
    "Austin",
    "Shawn DENG",
  ],
};
