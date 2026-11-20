import type { L10n } from "@/i18n/types";
import { demoImage, type DemoContent, type DemoImage } from "./index";

/**
 * Ironside Barber Co. (fictional). Every user-facing string on /work/barbershop/
 * lives here, in English and in formal ("usted") Spanish. Prices in USD.
 */

export type BarberService = { name: L10n; detail: L10n; minutes: number; price: number };

export type BarberContent = DemoContent & {
  nav: { services: L10n; shop: L10n; reviews: L10n; book: L10n; home: L10n; primary: L10n };
  hero: { lines: [L10n, L10n]; intro: L10n; cta: L10n; prices: L10n; walkIns: L10n };
  services: { title: L10n; intro: L10n; items: BarberService[]; minutes: L10n; note: L10n };
  craft: { title: L10n; items: { image: DemoImage; caption: L10n; detail: L10n }[] };
  shop: { title: L10n; body: L10n; image: DemoImage; hoursLabel: L10n; closed: L10n; findUs: L10n };
  reviewsTitle: L10n;
  book: { title: L10n; body: L10n; cta: L10n; call: L10n };
  footer: { tagline: L10n; credit: L10n };
};

export const barbershop: BarberContent = {
  id: "barbershop",
  business: "Ironside Barber Co.",
  phone: "(555) 0142",
  address: "1408 Calder Ave",
  hours: [
    { days: { en: "Tue to Fri", es: "Mar. a vie." }, time: { en: "9am – 7pm", es: "9:00 – 19:00" } },
    { days: { en: "Saturday", es: "Sábado" }, time: { en: "8am – 4pm", es: "8:00 – 16:00" } },
  ],
  nav: {
    services: { en: "Prices", es: "Precios" },
    shop: { en: "The shop", es: "La barbería" },
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
    walkIns: {
      en: "Walk-ins welcome when a chair is free",
      es: "Le atendemos sin cita si hay un sillón libre",
    },
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
      },
      {
        name: { en: "Skin fade", es: "Degradado a piel" },
        detail: {
          en: "Taken down to the skin and blended by hand. No lines, no shadows, no rushing it.",
          es: "Rebajado hasta la piel y difuminado a mano. Sin líneas, sin sombras y sin prisas.",
        },
        minutes: 45,
        price: 40,
      },
      {
        name: { en: "Beard line-up", es: "Perfilado de barba" },
        detail: {
          en: "Shaped to your jaw, edged with a straight razor, finished with oil.",
          es: "Perfilada según su mandíbula, definida con navaja recta y terminada con aceite.",
        },
        minutes: 20,
        price: 25,
      },
      {
        name: { en: "Hot-towel shave", es: "Afeitado con toalla caliente" },
        detail: {
          en: "Two hot towels, pre-shave oil, a straight razor, then a cold towel to close. Worth a Friday.",
          es: "Dos toallas calientes, aceite previo, navaja recta y una toalla fría para cerrar. Ideal para un viernes.",
        },
        minutes: 40,
        price: 45,
      },
      {
        name: { en: "Cut + beard", es: "Corte + barba" },
        detail: {
          en: "The full chair: any cut plus a beard line-up, in one appointment.",
          es: "El servicio completo: cualquier corte más el perfilado de barba, en una sola cita.",
        },
        minutes: 60,
        price: 60,
      },
    ],
    note: {
      en: "Card or cash. If you are running late, call and we will hold the chair for ten minutes.",
      es: "Tarjeta o efectivo. Si se retrasa, llámenos y le guardamos el sillón diez minutos.",
    },
  },
  craft: {
    title: { en: "Done by hand", es: "Hecho a mano" },
    items: [
      {
        image: demoImage(
          "barbershop",
          "fade",
          {
            en: "A barber's tattooed hands taking a gold clipper up the back of a client's head, blending a skin fade.",
            es: "Las manos tatuadas de un barbero pasan una máquina dorada por la nuca de un cliente, difuminando un degradado a piel.",
          },
          896,
          1120,
        ),
        caption: { en: "Skin fade", es: "Degradado a piel" },
        detail: {
          en: "Blended by hand from the skin up, checked in two mirrors.",
          es: "Difuminado a mano desde la piel, revisado con dos espejos.",
        },
      },
      {
        image: demoImage(
          "barbershop",
          "razor",
          {
            en: "Close-up of a straight razor with a brass handle edging a client's beard along the cheek, under warm lamps.",
            es: "Primer plano de una navaja recta con mango de latón perfilando la barba de un cliente en la mejilla, bajo luces cálidas.",
          },
          896,
          1120,
        ),
        caption: { en: "Straight razor", es: "Navaja recta" },
        detail: {
          en: "Hot lather and a fresh blade for every client.",
          es: "Espuma caliente y una hoja nueva para cada cliente.",
        },
      },
    ],
  },
  shop: {
    title: { en: "The shop", es: "La barbería" },
    body: {
      en: "Three chairs, round brass mirrors, and coffee on the counter. Bookings always come first; if a chair is free, we will take you as you are.",
      es: "Tres sillones, espejos redondos de latón y café en el mostrador. Las reservas siempre tienen prioridad; si hay un sillón libre, le atendemos en el momento.",
    },
    image: demoImage(
      "barbershop",
      "interior",
      {
        en: "Inside Ironside at dusk: three black leather barber chairs facing round brass mirrors, pendant lamps and a tall window.",
        es: "El interior de Ironside al anochecer: tres sillones de barbero de cuero negro frente a espejos redondos de latón, lámparas colgantes y un gran ventanal.",
      },
      1024,
      688,
    ),
    hoursLabel: { en: "Hours", es: "Horario" },
    closed: { en: "Closed Sunday and Monday", es: "Cerrado domingo y lunes" },
    findUs: { en: "Find us", es: "Dónde estamos" },
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
};
