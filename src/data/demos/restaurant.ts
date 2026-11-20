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
  nav: { menu: L10n; room: L10n; reviews: L10n; hours: L10n; reserve: L10n; home: L10n; primary: L10n };
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
  };
  menu: {
    kicker: L10n;
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
  room: {
    kicker: L10n;
    title: L10n;
    body: L10n;
    facts: { label: L10n; value: L10n }[];
    cta: L10n;
    image: DemoImage;
  };
  reviewsKicker: L10n;
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
  };
  footer: { tagline: L10n; credit: L10n };
};

export const restaurant: RestaurantContent = {
  id: "restaurant",
  business: "Ember & Oak",
  phone: "(555) 0119",
  address: "310 Foundry St",
  hours: [
    { days: { en: "Tuesday – Sunday", es: "Martes a domingo" }, time: { en: "5pm – 11pm", es: "17:00 – 23:00" } },
    { days: { en: "Friday & Saturday", es: "Viernes y sábado" }, time: { en: "5pm – midnight", es: "17:00 – 00:00" } },
  ],
  nav: {
    menu: { en: "Menu", es: "Carta" },
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
      en: "Everything on the menu meets the oak oven or the grill. Seventy seats, a long bar, and a kitchen that keeps cooking until eleven, midnight at the weekend.",
      es: "Todo lo que servimos pasa por el horno de roble o por la parrilla. Setenta cubiertos, una barra larga y una cocina que no cierra hasta las once; los fines de semana, hasta medianoche.",
    },
    reserve: { en: "Reserve a table", es: "Reserve mesa" },
    pickup: { en: "Order pickup", es: "Pida para llevar" },
    tonight: { en: "Kitchen open till 11 · Fri & Sat till midnight", es: "Cocina abierta hasta las 23:00 · viernes y sábado, hasta medianoche" },
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
  },
  menu: {
    kicker: { en: "The menu", es: "La carta" },
    title: { en: "Tonight, off the fire.", es: "Esta noche, a la brasa." },
    intro: {
      en: "The card changes with the market. Order a few small plates for the table, then something from the fire each; the ribeye is built for two.",
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
              en: "Whipped labneh, hazelnut dukkah, chilli honey, carrot-top salsa verde.",
              es: "Labneh batido, dukkah de avellana, miel picante y salsa verde de sus propias hojas.",
            },
          },
          {
            id: "clams",
            name: { en: "Clams in the embers", es: "Almejas en las brasas" },
            price: 18,
            detail: {
              en: "Littlenecks opened in a hot pan, ’nduja butter, white wine, lemon, grilled bread to mop.",
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
              en: "Dry-aged 28 days, seared hard over oak, rested and sliced. Chimichurri and grilled spring onions.",
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
        title: { en: "Sweet", es: "Dulces" },
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
        en: "Sliced ribeye, pink in the middle, under chimichurri, with grilled spring onions and the fire glowing behind.",
        es: "Ribeye cortado, rosado por dentro, con chimichurri, cebolletas a la parrilla y el fuego encendido al fondo.",
      },
      1024,
      1024,
    ),
    flatbreadCaption: { en: "Burrata flatbread", es: "Pan plano con burrata" },
    steakCaption: { en: "Ember ribeye", es: "Ribeye a la leña" },
  },
  room: {
    kicker: { en: "Private dining", es: "Comedor privado" },
    title: { en: "The back room seats up to 24.", es: "¿Una celebración? El salón del fondo acoge hasta 24." },
    body: {
      en: "One long oak table beside the oven, its own door and its own server. We cook a family-style menu for the whole table, so nobody spends the evening reading a card.",
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
  },
  reviewsKicker: { en: "Reviews", es: "Reseñas" },
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
      en: "The bar’s twelve seats are kept for walk-ins every night.",
      es: "Las doce plazas de la barra se reservan cada noche para quien llegue sin reserva.",
    },
    hoursLabel: { en: "Hours", es: "Horario" },
    closed: { en: "Closed Mondays", es: "Cerrado los lunes" },
    findUs: { en: "Find us", es: "Dónde estamos" },
    directions: {
      en: "In the old foundry building; look for the smoke. Street parking after 6pm.",
      es: "En el antiguo edificio de la fundición; busque el humo. Aparcamiento en la calle a partir de las 18:00.",
    },
    call: { en: "Phone", es: "Teléfono" },
  },
  footer: {
    tagline: { en: "Wood fire, late tables, Foundry Street.", es: "Fuego de leña y mesas hasta tarde en Foundry Street." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
  },
};
