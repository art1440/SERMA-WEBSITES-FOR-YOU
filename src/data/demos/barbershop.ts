import type { L10n } from "@/i18n/types";
import { demoImage, heroImage, type DemoContent, type DemoImage } from "./index";

/**
 * Ironside Barber Co. (fictional). Every user-facing string on /work/barbershop/
 * lives here, in English and in formal ("usted") Spanish. Prices in USD.
 *
 * Photos: fade / razor / interior are the original warm, cinematic set; the
 * rest are Unsplash photos (credited in the footer) graded warm to match.
 */

export type BarberService = { name: L10n; detail: L10n; minutes: number; price: number; image: DemoImage };
export type RitualStep = { key: string; tool: L10n; title: L10n; body: L10n; image: DemoImage };
export type Barber = { name: string; role: L10n; bio: L10n; image: DemoImage };

export type BarberContent = DemoContent & {
  nav: { services: L10n; shop: L10n; barbers: L10n; reviews: L10n; book: L10n; home: L10n; primary: L10n };
  hero: { lines: [L10n, L10n]; intro: L10n; cta: L10n; prices: L10n; image: DemoImage };
  services: { title: L10n; intro: L10n; items: BarberService[]; minutes: L10n; note: L10n };
  ritual: { title: L10n; intro: L10n; steps: RitualStep[] };
  craft: { title: L10n; words: L10n[]; items: { image: DemoImage; caption: L10n }[] };
  shop: {
    title: L10n;
    lead: L10n;
    overlay: L10n;
    body: L10n;
    image: DemoImage;
    hoursLabel: L10n;
    closed: L10n;
    findUs: L10n;
  };
  barbers: { title: L10n; intro: L10n; book: L10n; items: Barber[] };
  reviewsTitle: L10n;
  book: { title: L10n; body: L10n; cta: L10n; call: L10n };
  footer: { tagline: L10n; credit: L10n };
};

const img = (name: string, en: string, es: string, w: number, h: number) => demoImage("barbershop", name, { en, es }, w, h);

/* The original set. */
const FADE = img(
  "fade",
  "A barber's tattooed hands taking a gold clipper up the back of a client's head, blending a skin fade.",
  "Las manos tatuadas de un barbero pasan una máquina dorada por la nuca de un cliente, difuminando un degradado a piel.",
  896,
  1120,
);
const RAZOR = img(
  "razor",
  "Close-up of a straight razor with a brass handle edging a client's beard along the cheek, under warm lamps.",
  "Primer plano de una navaja recta con mango de latón perfilando la barba de un cliente en la mejilla, bajo luces cálidas.",
  896,
  1120,
);

/* Unsplash, graded warm. The hero is the wide one (640 / 1600 / 2560 files). */
const HERO = heroImage(
  "barbershop",
  "hero-wide",
  {
    en: "A barber's tattooed hand trims a reclining client's grey beard with scissors, the shop warm and dim behind them.",
    es: "La mano tatuada de un barbero recorta con tijeras la barba canosa de un cliente recostado, con la barbería cálida y en penumbra al fondo.",
  },
  1600,
  1067,
);
const CLASSIC_CUT = img(
  "classic-cut",
  "A barber's tattooed hands brushing loose hair off a client's freshly styled pompadour under warm pendant lights.",
  "Las manos tatuadas de un barbero retiran con un cepillo el pelo suelto de un tupé recién peinado, bajo lámparas cálidas.",
  1120,
  1400,
);
const HOT_TOWEL = img(
  "hot-towel",
  "A client reclined in the chair with a dark towel over his eyes while the barber trims around his ear.",
  "Un cliente recostado en el sillón con una toalla oscura sobre los ojos mientras el barbero recorta alrededor de la oreja.",
  1120,
  1400,
);
const RAZOR_FINISH = img(
  "razor-finish",
  "Tattooed hands holding a comb and a straight razor to the back of a client's neck.",
  "Manos tatuadas sostienen un peine y una navaja recta en la nuca de un cliente.",
  1120,
  1400,
);
const BARBER_HANDS = img(
  "barber-hands",
  "A barber seated in a leather chair, hands resting over a comb and a pair of scissors.",
  "Un barbero sentado en un sillón de cuero, con las manos sobre un peine y unas tijeras.",
  1400,
  933,
);
const CLIPPER_WORK = img(
  "clipper-work",
  "Close-up of a clipper taking a client's hair down at the temple, the barber's other hand steadying his head.",
  "Primer plano de una máquina rebajando el pelo de un cliente en la sien, con la otra mano del barbero sujetándole la cabeza.",
  1120,
  1400,
);

export const barbershop: BarberContent = {
  id: "barbershop",
  business: "Ironside Barber Co.",
  phone: "(555) 555-0142",
  address: "1408 Calder Ave",
  hours: [
    { days: { en: "Tue to Fri", es: "Mar. a vie." }, time: { en: "9am – 7pm", es: "9:00 – 19:00" } },
    { days: { en: "Saturday", es: "Sábado" }, time: { en: "8am – 4pm", es: "8:00 – 16:00" } },
  ],
  nav: {
    services: { en: "Prices", es: "Precios" },
    shop: { en: "The shop", es: "La barbería" },
    barbers: { en: "Barbers", es: "Barberos" },
    reviews: { en: "Reviews", es: "Reseñas" },
    book: { en: "Book a chair", es: "Reserve su silla" },
    home: { en: "Ironside Barber Co., top of page", es: "Ironside Barber Co., inicio de la página" },
    primary: { en: "Main", es: "Principal" },
  },
  hero: {
    lines: [
      { en: "Sharp cuts.", es: "Cortes precisos." },
      { en: "No waiting.", es: "Sin esperas." },
    ],
    intro: {
      en: "Book your time online, sit down when you arrive, and walk out with the cut you came in for. Three chairs on Calder Avenue, run on the clock.",
      es: "Reserve su hora en línea, siéntese en cuanto llegue y salga con el corte que vino a buscar. Tres sillones en Calder Avenue, siempre puntuales.",
    },
    cta: { en: "Book a chair", es: "Reserve su silla" },
    prices: { en: "See prices", es: "Ver precios" },
    image: HERO,
  },
  services: {
    title: { en: "Cuts & shaves", es: "Cortes y afeitado" },
    intro: {
      en: "One price on the wall, the same price at the register. Every service ends with a hot towel.",
      es: "El precio de la pared es el que paga en caja. Todos los servicios terminan con toalla caliente.",
    },
    minutes: { en: "min", es: "min" },
    items: [
      {
        name: { en: "Classic cut", es: "Corte clásico" },
        detail: {
          en: "Scissor and clipper, washed and styled, finished with a razor at the neck.",
          es: "Tijera y máquina, lavado y peinado, con acabado de navaja en la nuca.",
        },
        minutes: 40,
        price: 35,
        image: CLASSIC_CUT,
      },
      {
        name: { en: "Skin fade", es: "Degradado a piel" },
        detail: {
          en: "Taken down to the skin and blended by hand. No lines, no shadows, no rushing it.",
          es: "Rebajado hasta la piel y difuminado a mano. Sin líneas, sin sombras y sin prisas.",
        },
        minutes: 45,
        price: 40,
        image: FADE,
      },
      {
        name: { en: "Beard line-up", es: "Perfilado de barba" },
        detail: {
          en: "Shaped to your jaw, edged with a straight razor, finished with oil.",
          es: "Perfilada según su mandíbula, definida con navaja recta y terminada con aceite.",
        },
        minutes: 20,
        price: 25,
        image: RAZOR,
      },
      {
        name: { en: "Hot-towel shave", es: "Afeitado con toalla caliente" },
        detail: {
          en: "Two hot towels, pre-shave oil, a straight razor, then a cold towel to close. Worth a Friday.",
          es: "Dos toallas calientes, aceite previo, navaja recta y una toalla fría para cerrar. Ideal para un viernes.",
        },
        minutes: 40,
        price: 45,
        image: HOT_TOWEL,
      },
      {
        name: { en: "Cut + beard", es: "Corte + barba" },
        detail: {
          en: "The full chair: any cut plus a beard line-up, in one appointment.",
          es: "El servicio completo: cualquier corte más el perfilado de barba, en una sola cita.",
        },
        minutes: 60,
        price: 60,
        image: RAZOR_FINISH,
      },
    ],
    note: {
      en: "Card or cash. If you are running late, call and we will hold the chair for ten minutes.",
      es: "Tarjeta o efectivo. Si se retrasa, llámenos y le guardamos el sillón diez minutos.",
    },
  },
  ritual: {
    title: { en: "The ritual", es: "El ritual" },
    intro: {
      en: "Every chair runs the same steps, in the same order, on the same clock.",
      es: "Cada sillón sigue los mismos pasos, en el mismo orden y con el mismo reloj.",
    },
    steps: [
      {
        key: "consult",
        tool: { en: "The mirror", es: "El espejo" },
        title: { en: "The consult", es: "La consulta" },
        body: {
          en: "Two minutes in the mirror before anything is cut: length, line, and how you wear it on a Monday.",
          es: "Dos minutos frente al espejo antes de cortar nada: largo, línea y cómo lo lleva un lunes.",
        },
        image: BARBER_HANDS,
      },
      {
        key: "towel",
        tool: { en: "The towel", es: "La toalla" },
        title: { en: "Hot towel", es: "Toalla caliente" },
        body: {
          en: "A hot towel softens skin and beard while the tools come out. Nobody rushes this part.",
          es: "Una toalla caliente suaviza la piel y la barba mientras salen las herramientas. Esta parte no se apresura.",
        },
        image: HOT_TOWEL,
      },
      {
        key: "cut",
        tool: { en: "Clipper and scissor", es: "Máquina y tijera" },
        title: { en: "The cut", es: "El corte" },
        body: {
          en: "Blended by hand and checked in two mirrors. You see the back before you stand up.",
          es: "Difuminado a mano y revisado con dos espejos. Usted ve la nuca antes de levantarse.",
        },
        image: CLIPPER_WORK,
      },
      {
        key: "finish",
        tool: { en: "The straight razor", es: "La navaja recta" },
        title: { en: "Straight-razor finish", es: "Acabado con navaja" },
        body: {
          en: "A fresh blade on the neckline, a cold towel to close, and out of the chair on time.",
          es: "Una hoja nueva en la nuca, una toalla fría para cerrar y fuera del sillón a su hora.",
        },
        image: RAZOR_FINISH,
      },
    ],
  },
  craft: {
    title: { en: "Done by hand", es: "Hecho a mano" },
    words: [
      { en: "Fades", es: "Degradados" },
      { en: "Shaves", es: "Afeitados" },
      { en: "Beards", es: "Barbas" },
      { en: "Line-ups", es: "Perfilados" },
      { en: "Hot towels", es: "Toallas calientes" },
    ],
    items: [
      {
        image: img(
          "chair-mirror",
          "A quilted brown leather barber chair facing the mirror, shelves of bottles lit behind it.",
          "Un sillón de barbero de cuero marrón acolchado frente al espejo, con estantes de botellas iluminados detrás.",
          1120,
          1400,
        ),
        caption: { en: "The chair", es: "El sillón" },
      },
      {
        image: img(
          "clippers",
          "Rows of hair clippers and brass and black guide combs laid out on a wooden counter.",
          "Hileras de máquinas de cortar el pelo y peines guía dorados y negros sobre un mostrador de madera.",
          1200,
          1200,
        ),
        caption: { en: "Clippers, oiled daily", es: "Máquinas, engrasadas a diario" },
      },
      { image: FADE, caption: { en: "Skin fade", es: "Degradado a piel" } },
      {
        image: img(
          "razors",
          "Two folding straight razors resting on a ribbed wooden counter.",
          "Dos navajas rectas plegables sobre un mostrador de madera acanalada.",
          960,
          1200,
        ),
        caption: { en: "Straight razors", es: "Navajas rectas" },
      },
      {
        image: img(
          "combs",
          "Black barber combs and steel thinning shears on a polished wooden tray.",
          "Peines de barbero negros y tijeras de entresacar de acero sobre una bandeja de madera pulida.",
          893,
          1200,
        ),
        caption: { en: "Combs and shears", es: "Peines y tijeras" },
      },
      { image: RAZOR, caption: { en: "Hot lather, fresh blade", es: "Espuma caliente, hoja nueva" } },
    ],
  },
  shop: {
    title: { en: "The shop", es: "La barbería" },
    lead: {
      en: "Round brass mirrors, low light, and coffee on the counter.",
      es: "Espejos redondos de latón, luz tenue y café en el mostrador.",
    },
    overlay: { en: "Three chairs. One clock.", es: "Tres sillones. Un solo reloj." },
    body: {
      en: "Three chairs, round brass mirrors, and coffee on the counter. Bookings always come first; if a chair is free, we will take you as you are.",
      es: "Tres sillones, espejos redondos de latón y café en el mostrador. Las reservas siempre tienen prioridad; si hay un sillón libre, le atendemos en el momento.",
    },
    image: img(
      "interior",
      "Inside Ironside at dusk: three black leather barber chairs facing round brass mirrors, pendant lamps and a tall window.",
      "El interior de Ironside al anochecer: tres sillones de barbero de cuero negro frente a espejos redondos de latón, lámparas colgantes y un gran ventanal.",
      1024,
      688,
    ),
    hoursLabel: { en: "Hours", es: "Horario" },
    closed: { en: "Closed Sunday and Monday", es: "Cerrado domingo y lunes" },
    findUs: { en: "Find us", es: "Dónde estamos" },
  },
  barbers: {
    title: { en: "Your barbers", es: "Sus barberos" },
    intro: {
      en: "Pick a barber when you book, or take the first free chair. Same price either way.",
      es: "Elija barbero al reservar o tome el primer sillón libre. El precio es el mismo.",
    },
    book: { en: "Book with", es: "Reservar con" },
    items: [
      {
        name: "Sal",
        role: { en: "Classic cuts & hot-towel shaves", es: "Cortes clásicos y afeitado con toalla caliente" },
        bio: {
          en: "Opened the shop in 2011. Still takes the 8am chair on Saturdays.",
          es: "Abrió la barbería en 2011. Sigue atendiendo el sillón de las 8:00 los sábados.",
        },
        image: img(
          "barber-sal",
          "Portrait of Sal, a grey-bearded barber in a dark shirt, lit from one side against black.",
          "Retrato de Sal, un barbero de barba canosa con camisa oscura, iluminado de lado sobre fondo negro.",
          960,
          1200,
        ),
      },
      {
        name: "Dre",
        role: { en: "Beards & line-ups", es: "Barbas y perfilados" },
        bio: {
          en: "Shapes the beard to your jaw, not the trend. Asks a lot of questions first.",
          es: "Da forma a la barba según su mandíbula, no según la moda. Primero hace muchas preguntas.",
        },
        image: img(
          "barber-dre",
          "Portrait of Dre, a bearded barber in a black shirt, seated in a leather armchair.",
          "Retrato de Dre, un barbero con barba y camisa negra, sentado en un sillón de cuero.",
          960,
          1200,
        ),
      },
      {
        name: "Mateo",
        role: { en: "Skin fades & clipper work", es: "Degradados a piel y trabajo con máquina" },
        bio: {
          en: "Fades from the skin up. Quiet in the chair, exact at the neckline.",
          es: "Degradados desde la piel. Callado en el sillón, exacto en la nuca.",
        },
        image: img(
          "barber-mateo",
          "Portrait of Mateo, a barber with a short dark beard, half his face in shadow.",
          "Retrato de Mateo, un barbero de barba corta y oscura, con media cara en sombra.",
          960,
          1200,
        ),
      },
    ],
  },
  reviewsTitle: { en: "From the regulars", es: "Lo que dicen los clientes de siempre" },
  reviews: [
    {
      quote: {
        en: "Booked for 8:40, in the chair at 8:40. Best fade I have had in this city, and I have tried most of them.",
        es: "Reservé para las 8:40 y a las 8:40 ya estaba en el sillón. El mejor degradado que me han hecho en esta ciudad, y he probado casi todas las barberías.",
      },
      name: "Marcus T.",
    },
    {
      quote: {
        en: "Dre spent twenty minutes on my beard and asked more questions than my last three barbers combined. It shows.",
        es: "Dre dedicó veinte minutos a mi barba e hizo más preguntas que mis últimos tres barberos juntos. Se nota.",
      },
      name: "Luis R.",
    },
    {
      quote: {
        en: "I bring my son in every month. They are patient with him, and nobody tries to sell either of us anything.",
        es: "Traigo a mi hijo todos los meses. Tienen paciencia con él y nadie intenta vendernos nada a ninguno de los dos.",
      },
      name: "Daniel K.",
    },
  ],
  book: {
    title: { en: "Skip the wait.", es: "Olvídese de la espera." },
    body: {
      en: "Pick your barber and your time. The towel will be hot when you walk in.",
      es: "Elija barbero y hora. La toalla estará caliente cuando llegue.",
    },
    cta: { en: "Book a chair", es: "Reserve su silla" },
    call: { en: "Or call", es: "O llame al" },
  },
  footer: {
    tagline: { en: "Cuts, fades and shaves since 2011.", es: "Cortes, degradados y afeitados desde 2011." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
  },
  photoCredits: [
    "Allef Vinicius",
    "Redd Francisco",
    "André Reis",
    "Tá Focando",
    "Salah Regouane",
    "Fábio Alves",
    "Agustin Fernandez",
    "Jonathan Cooper",
    "Amr Taha",
    "Omar Abozeid",
    "Ernest Flowers",
    "Alexander Andrews",
  ],
};
