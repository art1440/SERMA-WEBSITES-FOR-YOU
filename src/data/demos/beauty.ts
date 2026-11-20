import type { L10n } from "@/i18n/types";
import { demoImage, type DemoContent, type DemoImage } from "./index";

/**
 * Velvet Room (fictional lash, brow and skin studio). Every user-facing string
 * on /work/beauty/ lives here, in English and in formal ("usted") Spanish.
 * Prices in USD.
 */

export type BeautyTreatment = {
  name: L10n;
  minutes: number;
  amount: number;
  detail: L10n;
  /** One concrete aftercare rule, shown under the detail. */
  aftercare: L10n;
  image: DemoImage;
};

export type BeautyStep = { when: L10n; title: L10n; body: L10n };

/** A review with the treatment it was written about. */
export type BeautyReview = DemoContent["reviews"][number] & { treatment: L10n };

export type BeautyContent = Omit<DemoContent, "reviews"> & {
  reviews: BeautyReview[];
  nav: { treatments: L10n; visit: L10n; reviews: L10n; hours: L10n; book: L10n; home: L10n; primary: L10n };
  hero: { kicker: L10n; headline: [L10n, L10n, L10n]; intro: L10n; cta: L10n; link: L10n; note: L10n };
  treatments: { kicker: L10n; title: L10n; intro: L10n; label: L10n; minutes: L10n; aftercareLabel: L10n; items: BeautyTreatment[] };
  steps: { kicker: L10n; title: L10n; intro: L10n; items: BeautyStep[] };
  reviewsTitle: L10n;
  reviewsKicker: L10n;
  visit: {
    kicker: L10n;
    title: L10n;
    body: L10n;
    cta: L10n;
    policy: L10n;
    call: L10n;
    hoursLabel: L10n;
    closed: L10n;
    findUs: L10n;
    directions: L10n;
  };
  footer: { tagline: L10n; credit: L10n };
};

export const beauty: BeautyContent = {
  id: "beauty",
  business: "Velvet Room",
  phone: "(555) 555-0158",
  address: "9 Willow Court",
  hours: [
    { days: { en: "Tuesday – Thursday", es: "Martes a jueves" }, time: { en: "10am – 7pm", es: "10:00 – 19:00" } },
    { days: { en: "Friday", es: "Viernes" }, time: { en: "10am – 6pm", es: "10:00 – 18:00" } },
    { days: { en: "Saturday", es: "Sábado" }, time: { en: "9am – 4pm", es: "9:00 – 16:00" } },
  ],
  nav: {
    treatments: { en: "Treatments", es: "Tratamientos" },
    visit: { en: "Your visit", es: "Su visita" },
    reviews: { en: "Reviews", es: "Reseñas" },
    hours: { en: "Hours", es: "Horario" },
    book: { en: "Book", es: "Reservar" },
    home: { en: "Velvet Room, top of page", es: "Velvet Room, inicio de la página" },
    primary: { en: "Main", es: "Principal" },
  },
  hero: {
    kicker: { en: "Lash, brow & skin studio", es: "Estudio de pestañas, cejas y piel" },
    // One line each; the h1 reads as "Lashes, brows, skin."
    headline: [
      { en: "Lashes,", es: "Pestañas," },
      { en: "brows,", es: "cejas," },
      { en: "skin.", es: "piel." },
    ],
    intro: {
      en: "Three treatment beds, low light and appointments with fifteen spare minutes built in, so nobody is ever rushed off the table. Most clients fall asleep.",
      es: "Tres camillas, luz tenue y citas con quince minutos de margen, para que nadie tenga que levantarse con prisa. La mayoría de nuestras clientas se queda dormida.",
    },
    cta: { en: "Book a treatment", es: "Reserve un tratamiento" },
    link: { en: "See treatments", es: "Ver tratamientos" },
    note: { en: "Three beds · Tuesday to Saturday · 9\u00a0Willow\u00a0Court", es: "Tres camillas · de martes a sábado · 9\u00a0Willow\u00a0Court" },
  },
  treatments: {
    kicker: { en: "Treatments", es: "Tratamientos" },
    title: { en: "Three things, done slowly.", es: "Tres tratamientos, sin prisa." },
    intro: {
      en: "One therapist stays with you from consultation to aftercare. Prices include everything listed; nothing is added at the till.",
      es: "La misma especialista le acompaña desde la consulta hasta los cuidados posteriores. Los precios lo incluyen todo; no se añade nada al pagar.",
    },
    label: { en: "Treatments, with duration and price", es: "Tratamientos, con duración y precio" },
    minutes: { en: "min", es: "min" },
    aftercareLabel: { en: "Aftercare", es: "Cuidados" },
    items: [
      {
        name: { en: "Lash extensions", es: "Extensiones de pestañas" },
        minutes: 120,
        amount: 160,
        detail: {
          en: "Classic or soft-volume sets, mapped to your eye shape and applied one lash at a time while you rest with your eyes closed. Refills from three weeks.",
          es: "Juegos clásicos o de volumen suave, diseñados según la forma de sus ojos y aplicados pestaña a pestaña mientras usted descansa con los ojos cerrados. Retoques a partir de las tres semanas.",
        },
        aftercare: {
          en: "Keep them dry for 24 hours, then cleanse daily with an oil-free foam.",
          es: "No las moje durante 24 horas; después, límpielas a diario con una espuma sin aceites.",
        },
        image: demoImage(
          "beauty",
          "lashes",
          {
            en: "Close-up of a closed eye with a full, soft set of lash extensions, the client resting on a sage-green towel.",
            es: "Primer plano de un ojo cerrado con un juego de extensiones de pestañas suave y completo; la clienta descansa sobre una toalla verde salvia.",
          },
          896,
          1120,
        ),
      },
      {
        name: { en: "Brow lamination", es: "Laminado de cejas" },
        minutes: 45,
        amount: 70,
        detail: {
          en: "Brows set upward and in place for six to eight weeks, then tinted to match your hair and tidied by hand. Needs a patch test 48 hours before.",
          es: "Cejas fijadas hacia arriba durante seis a ocho semanas, teñidas a juego con su cabello y perfiladas a mano. Requiere una prueba de sensibilidad 48 horas antes.",
        },
        aftercare: {
          en: "No water, steam or makeup on the brows for 24 hours.",
          es: "Evite el agua, el vapor y el maquillaje en las cejas durante 24 horas.",
        },
        image: demoImage(
          "beauty",
          "brows",
          {
            en: "A green eye under a freshly laminated brow, every hair brushed upward and set, a sage towel wrapped around the head.",
            es: "Un ojo verde bajo una ceja recién laminada, con cada vello peinado hacia arriba y fijado, y una toalla salvia alrededor de la cabeza.",
          },
          896,
          1120,
        ),
      },
      {
        name: { en: "Signature facial", es: "Facial de la casa" },
        minutes: 60,
        amount: 95,
        detail: {
          en: "Double cleanse, enzyme peel, gentle extractions and a slow lymphatic massage, finished with SPF. Adjusted to how your skin is on the day.",
          es: "Doble limpieza, peeling enzimático, extracciones suaves y un masaje linfático lento, con protección solar al final. Se adapta a cómo esté su piel ese día.",
        },
        aftercare: {
          en: "Skip retinol and exfoliants for 48 hours; we write down what we used.",
          es: "Evite el retinol y los exfoliantes durante 48 horas; le anotamos lo que hemos usado.",
        },
        image: demoImage(
          "beauty",
          "facial",
          {
            en: "A therapist in gloves brushes a clear mask onto a relaxed client's cheek; she lies under a sage blanket by a bright window.",
            es: "Una especialista con guantes aplica con brocha una mascarilla transparente en la mejilla de una clienta relajada, tumbada bajo una manta salvia junto a una ventana luminosa.",
          },
          896,
          1120,
        ),
      },
    ],
  },
  steps: {
    kicker: { en: "Your visit", es: "Su visita" },
    title: { en: "How a visit works", es: "Cómo es una visita" },
    intro: {
      en: "The same three steps for every treatment, whether it is your first time or your fortieth.",
      es: "Los mismos tres pasos para cada tratamiento, tanto si es su primera visita como la número cuarenta.",
    },
    items: [
      {
        when: { en: "48 hours before", es: "48 horas antes" },
        title: { en: "A two-minute patch test", es: "Una prueba de dos minutos" },
        body: {
          en: "For lashes and any tint we dab a little adhesive or dye behind your ear. Drop in any time we are open, no appointment needed. If nothing itches after two days, you are set.",
          es: "Para pestañas y cualquier tinte, aplicamos un poco de adhesivo o tinte detrás de la oreja. Puede pasar cuando estemos abiertos, sin cita. Si en dos días no nota picor, todo está listo.",
        },
      },
      {
        when: { en: "On the day", es: "El día de la cita" },
        title: { en: "Come in, lie back", es: "Llegue y recuéstese" },
        body: {
          en: "Arrive with clean skin and no eye makeup. We talk through the look you want, then you settle under a warm blanket. Conversation is optional; we will not mind if you doze.",
          es: "Venga con la piel limpia y sin maquillaje en los ojos. Hablamos del resultado que desea y luego se acomoda bajo una manta templada. Conversar es opcional; no nos importa que se duerma.",
        },
      },
      {
        when: { en: "The next 48 hours", es: "Las 48 horas siguientes" },
        title: { en: "Aftercare, written down", es: "Cuidados, por escrito" },
        body: {
          en: "You leave with a printed aftercare card and a clean spoolie. Two days later we text to see how things have settled, and book your refill or next facial only if you want one.",
          es: "Se lleva una tarjeta impresa con los cuidados y un cepillo limpio. Dos días después le escribimos para saber cómo va y reservamos su retoque o su próximo facial solo si usted lo desea.",
        },
      },
    ],
  },
  reviewsKicker: { en: "Reviews", es: "Reseñas" },
  reviewsTitle: { en: "Said on the way out", es: "Lo que dicen al salir" },
  reviews: [
    {
      quote: {
        en: "I fell asleep during my lash set and woke up looking like I’d had eight hours. Three weeks on, they still look neat.",
        es: "Me quedé dormida durante las extensiones y me desperté como si hubiera descansado ocho horas. Tres semanas después siguen impecables.",
      },
      name: "Maya R.",
      treatment: { en: "Lash extensions", es: "Extensiones de pestañas" },
    },
    {
      quote: {
        en: "They did a patch test first and talked me out of tinting too dark. My brows finally look like mine.",
        es: "Primero me hicieron la prueba y me convencieron de no teñir demasiado oscuro. Por fin mis cejas parecen mías.",
      },
      name: "Daniela C.",
      treatment: { en: "Brow lamination", es: "Laminado de cejas" },
    },
    {
      quote: {
        en: "An hour of real quiet. My skin was calmer for a week, and nobody tried to sell me a shelf of products.",
        es: "Una hora de verdadera calma. Mi piel estuvo más tranquila toda la semana y nadie intentó venderme una estantería de productos.",
      },
      name: "Jordan T.",
      treatment: { en: "Signature facial", es: "Facial de la casa" },
    },
  ],
  visit: {
    kicker: { en: "Book", es: "Reservas" },
    title: { en: "Your hour starts here.", es: "Su hora empieza aquí." },
    body: {
      en: "New to Velvet Room? Book any treatment and we will message you to arrange the patch test first. Online booking shows every free slot for the next six weeks.",
      es: "¿Es su primera vez en Velvet Room? Reserve cualquier tratamiento y le escribiremos para concertar antes la prueba de sensibilidad. La reserva en línea muestra todos los huecos libres de las próximas seis semanas.",
    },
    cta: { en: "Book a treatment", es: "Reserve un tratamiento" },
    policy: {
      en: "Free to cancel or move up to 24 hours before.",
      es: "Puede cancelar o cambiar su cita sin coste hasta 24 horas antes.",
    },
    call: { en: "Or call", es: "O llame al" },
    hoursLabel: { en: "Hours", es: "Horario" },
    closed: { en: "Closed Sunday and Monday", es: "Cerrado domingo y lunes" },
    findUs: { en: "Find us", es: "Dónde estamos" },
    directions: {
      en: "Ground floor, the green door just past the bakery. Two-hour parking on Willow Court.",
      es: "Planta baja, la puerta verde justo después de la panadería. Estacionamiento de dos horas en Willow Court.",
    },
  },
  footer: {
    tagline: { en: "Lashes, brows and skin, done slowly.", es: "Pestañas, cejas y piel, sin prisa." },
    credit: { en: "Demo design by Serma", es: "Diseño de demostración por Serma" },
  },
};
