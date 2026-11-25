import type { L10n } from "@/i18n/types";

/**
 * Pricing FAQ, grouped in the order an owner's doubts arrive: "is this for me?",
 * "what does it cost and what's the risk?", "what happens after?", and finally
 * "why now?". Voice: calm and plain. Each answer opens with the reassurance
 * ("Yes." / "No." / "Not at all."), then the proof, then one gentle next step.
 *
 * RULE: every answer restates only what the site already promises (pricing.ts,
 * the dictionary, the preview pop-up). No contract, cancellation or hand-over policies:
 * the owner chose not to state them here.
 */
export type FaqGroupId = "start" | "money" | "after" | "why";

export type FaqItem = {
  id: string;
  group: FaqGroupId;
  q: L10n;
  a: L10n;
  /** Shown only while the limited-time offer (LAUNCH in pricing.ts) is live. */
  whileSale?: boolean;
};

export const FAQ_HEADING: L10n = {
  en: "Questions? Calm, straight answers.",
  es: "¿Preguntas? Respuestas claras y tranquilas.",
};

export const FAQ_GROUPS: { id: FaqGroupId; label: L10n }[] = [
  { id: "start", label: { en: "Before you start", es: "Antes de empezar" } },
  { id: "money", label: { en: "Price and peace of mind", es: "Precio y tranquilidad" } },
  { id: "after", label: { en: "After you go live", es: "Después de publicar" } },
  { id: "why", label: { en: "Why us, and why now", es: "Por qué nosotros, y por qué ahora" } },
];

export const FAQ_ITEMS: FaqItem[] = [
  /* ---------------- Before you start ---------------- */
  {
    id: "need-a-site",
    group: "start",
    q: {
      en: "I already have Instagram or Facebook. Do I really need a website?",
      es: "Ya tengo Instagram o Facebook. ¿De verdad necesito un sitio web?",
    },
    a: {
      en: "Your social pages are great for showing your work, keep them. But you don’t own them, and customers can’t easily find your hours, prices or a way to reach you there. A website is yours: it shows up when people search for you, puts your number one tap away, and doesn’t change when an app changes its rules. Your socials bring people in; your website turns them into calls.",
      es: "Sus redes son buenas para mostrar su trabajo, consérvelas. Pero no son suyas, y ahí al cliente le cuesta encontrar su horario, sus precios o cómo contactarlo. Un sitio web es suyo: aparece cuando lo buscan, deja su número a un toque y no cambia cuando una aplicación cambia sus reglas. Las redes atraen a la gente; su sitio web la convierte en llamadas.",
    },
  },
  {
    id: "not-techy",
    group: "start",
    q: {
      en: "I’m not good with tech. Is that a problem?",
      es: "No soy bueno con la tecnología. ¿Es un problema?",
    },
    a: {
      en: "Not at all, and you’re in good company. You never touch a setting. Your part is a 15-minute call and a few photos from your phone. We write every word, design every page and set everything up. When it’s ready, we send you a link and you simply say yes or tell us what to change.",
      es: "Para nada, y no es el único. Usted nunca toca una configuración. Su parte es una llamada de 15 minutos y unas fotos de su teléfono. Nosotros escribimos cada palabra, diseñamos cada página y dejamos todo listo. Cuando esté terminado, le mandamos un enlace y usted solo dice que sí o qué cambiar.",
    },
  },
  {
    id: "too-busy",
    group: "start",
    q: {
      en: "I barely have time to run my business. How much of my time does this take?",
      es: "Apenas tengo tiempo para mi negocio. ¿Cuánto tiempo me va a quitar?",
    },
    a: {
      en: "About 15 minutes. That’s the call where you tell us about your business, plus snapping a few photos when it suits you. No meetings, no homework, no forms to fill. We do the rest while you keep working.",
      es: "Unos 15 minutos. Es la llamada en la que nos cuenta de su negocio, más tomar unas fotos cuando le quede bien. Sin reuniones, sin tareas, sin formularios. Nosotros hacemos lo demás mientras usted sigue trabajando.",
    },
  },
  {
    id: "my-business",
    group: "start",
    q: {
      en: "Do you work with businesses like mine?",
      es: "¿Trabajan con negocios como el mío?",
    },
    a: {
      en: "If your customers call you or book with you, yes. We build for barbershops, salons, beauty studios, restaurants, contractors and home services. Scroll up to “Our work” to see a demo site for each.",
      es: "Si sus clientes le llaman o hacen cita con usted, sí. Hacemos sitios para barberías, salones, estudios de belleza, restaurantes, contratistas y servicios para el hogar. Suba a “Nuestro trabajo” para ver un sitio de demostración de cada uno.",
    },
  },
  {
    id: "burned-before",
    group: "start",
    q: {
      en: "I got burned by a web designer before. Why would this be different?",
      es: "Ya me fue mal con un diseñador web. ¿Por qué esto sería diferente?",
    },
    a: {
      en: "We hear this a lot, and it’s exactly why we work this way. You see your finished site before you pay anything. The price is fixed and written down. Your domain stays in your name. And a real person replies within one business day. If we don’t deliver something you love, you don’t pay.",
      es: "Lo escuchamos mucho, y por eso trabajamos así. Usted ve su sitio terminado antes de pagar nada. El precio es fijo y queda por escrito. Su dominio queda a su nombre. Y una persona real le responde en un día hábil. Si no le entregamos algo que le encante, no paga.",
    },
  },
  {
    id: "free-preview",
    group: "start",
    q: {
      en: "Is the free preview really free?",
      es: "¿La vista previa gratis de verdad es gratis?",
    },
    a: {
      en: "Yes. No card, no contract, no catch. Tell us about your business in one minute and we design your homepage for free. Love it? We build the rest. Not for you? You owe nothing, and we part as friends.",
      es: "Sí. Sin tarjeta, sin contrato y sin trampa. Cuéntenos de su negocio en un minuto y diseñamos su página de inicio gratis. ¿Le encanta? Hacemos el resto. ¿No es para usted? No debe nada, y quedamos como amigos.",
    },
  },

  /* ---------------- Price and peace of mind ---------------- */
  {
    id: "catch",
    group: "money",
    q: {
      en: "You don’t charge until I approve? What’s the catch?",
      es: "¿No cobran hasta que yo apruebe? ¿Cuál es la trampa?",
    },
    a: {
      en: "There isn’t one. We’re confident enough in our work to let you see it first. You get the finished site, you check every page, and you only pay once you’ve said yes. If you don’t love it, you walk away and owe nothing. The only risk here is ours.",
      es: "No hay ninguna. Confiamos tanto en nuestro trabajo que le dejamos verlo primero. Recibe el sitio terminado, revisa cada página y solo paga cuando dice que sí. Si no le encanta, se va sin deber nada. El único riesgo aquí es nuestro.",
    },
  },
  {
    id: "dont-like-it",
    group: "money",
    q: {
      en: "What if I don’t like it?",
      es: "¿Y si no me gusta?",
    },
    a: {
      en: "Then you tell us what to change, and we change it. You see the finished draft before you pay anything: we send you a link, you point out anything that reads or looks wrong, and we fix it. If you still don’t love it, you walk away and owe nothing. You never pay for a site you haven’t seen and approved.",
      es: "Entonces nos dice qué cambiar, y lo cambiamos. Usted ve el borrador terminado antes de pagar nada: le mandamos un enlace, señala lo que se lee o se ve mal, y lo corregimos. Si aun así no le encanta, se va sin deber nada. Nunca paga por un sitio que no haya visto y aprobado.",
    },
  },
  {
    id: "sale",
    group: "money",
    whileSale: true,
    q: {
      en: "Why are two prices shown, and how do I get the sale price?",
      es: "¿Por qué aparecen dos precios y cómo consigo el precio de oferta?",
    },
    a: {
      en: "The crossed-out number is our regular price. For Black Friday, every package is $200 off (Growth is $999 instead of $1,200 or more) until Monday, November 30 at 11:59 pm Central. Request your free preview before then and the sale price is locked in for your project, even though you only pay once you’ve seen and approved your site. After that, prices go back to normal.",
      es: "El número tachado es nuestro precio regular. Por Black Friday, cada paquete tiene $200 de descuento (Crecimiento cuesta $999 en lugar de $1,200 o más) hasta el lunes 30 de noviembre a las 11:59 pm, hora del centro. Pida su vista previa gratis antes de esa fecha y el precio de oferta queda asegurado para su proyecto, aunque solo paga cuando haya visto y aprobado su sitio. Después, los precios vuelven a la normalidad.",
    },
  },
  {
    id: "price-covers",
    group: "money",
    q: {
      en: "What does the one-time price cover, and what is the $99.99 a month?",
      es: "¿Qué cubre el pago único y qué es la cuota de $99.99 al mes?",
    },
    a: {
      en: "The one-time price is the fixed price to build your site, with everything listed in your package, paid only after you approve it. After that, it’s $99.99 a month for management and care: we keep your site online, fast and working on your domain, and a real person is there when you need something. No hourly billing, no surprise add-ons.",
      es: "El pago único es el precio fijo por construir su sitio, con todo lo que aparece en su paquete, y lo paga solo después de aprobarlo. Después son $99.99 al mes de gestión y mantenimiento: mantenemos su sitio en línea, rápido y funcionando en su dominio, y una persona real lo atiende cuando necesite algo. Sin cobro por hora y sin extras sorpresa.",
    },
  },
  {
    id: "which-package",
    group: "money",
    q: {
      en: "Which package is right for me?",
      es: "¿Qué paquete me conviene?",
    },
    a: {
      en: "Starter ($499) is one sharp page with everything a customer needs to call you. Business ($799) is the full site most owners choose: up to 5 pages, a gallery, a contact form, local SEO basics and monthly edits. Growth ($1,000+) is for owners with many services or Spanish-speaking customers: up to 10 pages, in English and Spanish. Still not sure? Get the free preview first. We’ll tell you honestly which one fits, even if it’s the smallest.",
      es: "Inicial ($499) es una página impecable con todo lo que un cliente necesita para llamarle. Negocio ($799) es el sitio completo que elige la mayoría: hasta 5 páginas, galería, formulario de contacto, SEO local básico y cambios cada mes. Crecimiento ($1,000+) es para negocios con muchos servicios o clientes que hablan español: hasta 10 páginas, en inglés y español. ¿Aún no está seguro? Pida primero la vista previa gratis. Le diremos con honestidad cuál le conviene, aunque sea el más pequeño.",
    },
  },
  {
    id: "seven-days",
    group: "money",
    q: {
      en: "How fast will my site be ready?",
      es: "¿Qué tan rápido estará listo mi sitio?",
    },
    a: {
      en: "Your finished site is ready for you to review within 7 days of our 15-minute intro call, once we have your details and photos. If it isn’t, your first month of management and care ($99.99) is free. Going live then happens as soon as you say yes.",
      es: "Su sitio terminado está listo para que lo revise a más tardar 7 días después de nuestra llamada de 15 minutos, una vez que tengamos sus datos y fotos. Si no lo está, su primer mes de gestión y mantenimiento ($99.99) es gratis. Se publica en cuanto usted diga que sí.",
    },
  },
  {
    id: "revisions",
    group: "money",
    q: {
      en: "How do revisions work?",
      es: "¿Cómo funcionan los cambios?",
    },
    a: {
      en: "Starter includes 1 round of revisions, Business includes 2, and Growth includes unlimited revisions before launch. In practice, most owners only need small tweaks, because we start from your call and your photos, not from a template.",
      es: "Inicial incluye 1 ronda de cambios, Negocio incluye 2 y Crecimiento incluye cambios ilimitados antes del lanzamiento. En la práctica, la mayoría solo pide ajustes pequeños, porque partimos de su llamada y sus fotos, no de una plantilla.",
    },
  },
  {
    id: "vs-agency",
    group: "money",
    q: {
      en: "Agencies charge thousands. Why are you less? Is the quality lower?",
      es: "Las agencias cobran miles. ¿Por qué ustedes cobran menos? ¿La calidad es menor?",
    },
    a: {
      en: "No, and you can judge for yourself: look at “Our work”, or get your free preview. Agencies bill for account managers, long meetings and hourly changes. We only build for local businesses, with clear fixed packages, so you pay for the website, not the overhead.",
      es: "No, y usted mismo puede juzgarlo: vea “Nuestro trabajo” o pida su vista previa gratis. Las agencias cobran por gerentes de cuenta, reuniones largas y cambios por hora. Nosotros solo hacemos sitios para negocios locales, con paquetes fijos y claros, así que paga por el sitio web, no por los gastos de la agencia.",
    },
  },

  /* ---------------- After you go live ---------------- */
  {
    id: "google",
    group: "after",
    q: {
      en: "Will customers find me on Google?",
      es: "¿Los clientes me van a encontrar en Google?",
    },
    a: {
      en: "We give you the best start Google offers. Every package includes a free Google Business Profile makeover (the box people see in Maps), and Business and Growth add local SEO basics like page titles, descriptions and your map. We won’t promise you the #1 spot, because nobody honest can. We will make sure you look like the best choice when people find you.",
      es: "Le damos el mejor arranque posible en Google. Cada paquete incluye la renovación gratis de su Perfil de Google Business (el recuadro que la gente ve en Maps), y Negocio y Crecimiento suman SEO local básico como títulos, descripciones y su mapa. No le prometemos el primer lugar, porque nadie honesto puede. Sí nos aseguramos de que usted se vea como la mejor opción cuando lo encuentren.",
    },
  },
  {
    id: "google-profile",
    group: "after",
    q: {
      en: "What is the free Google profile makeover?",
      es: "¿Qué es la renovación gratis del perfil de Google?",
    },
    a: {
      en: "Your Google Business Profile is what people see in Google Maps and search, often before they ever visit a website. With every package we create it or clean it up for free: your best photos, correct hours, your services and categories, and a link to your new site, so you stand out next to the shop down the street.",
      es: "Su Perfil de Google Business es lo que la gente ve en Google Maps y en la búsqueda, muchas veces antes de entrar a un sitio web. Con cada paquete lo creamos o lo arreglamos gratis: sus mejores fotos, el horario correcto, sus servicios y categorías, y un enlace a su sitio nuevo, para que destaque frente al negocio de enfrente.",
    },
  },
  {
    id: "phones",
    group: "after",
    q: {
      en: "Will it work well on phones?",
      es: "¿Va a funcionar bien en celulares?",
    },
    a: {
      en: "Yes, that’s where we design it first, because that’s where your customers are. It loads fast on any phone, and a tap-to-call button stays on every screen, so calling you is always one tap away.",
      es: "Sí, ahí lo diseñamos primero, porque ahí están sus clientes. Carga rápido en cualquier teléfono y el botón para llamar está en cada pantalla, así que llamarle siempre está a un toque.",
    },
  },
  {
    id: "updates",
    group: "after",
    q: {
      en: "What if I need to change something later, like prices or hours?",
      es: "¿Y si después necesito cambiar algo, como precios u horario?",
    },
    a: {
      en: "Just text or email us the change. You never have to log in or learn anything. Business and Growth include small text and photo edits every month, and Growth adds a quarterly refresh of your photos and offers. On Starter, just ask: we’ll always tell you upfront if something costs extra, never after.",
      es: "Solo mándenos el cambio por mensaje o correo. Nunca tiene que entrar a ningún lado ni aprender nada. Negocio y Crecimiento incluyen cambios pequeños de texto y fotos cada mes, y Crecimiento suma una actualización trimestral de fotos y ofertas. En Inicial, solo pregunte: siempre le diremos antes si algo cuesta extra, nunca después.",
    },
  },
  {
    id: "ownership",
    group: "after",
    q: {
      en: "Do I own my domain and my photos?",
      es: "¿El dominio y mis fotos son míos?",
    },
    a: {
      en: "Yes. Your site goes live on your own domain, and the domain and your photos stay in your name. They’re yours, not ours.",
      es: "Sí. Su sitio se publica en su propio dominio, y el dominio y sus fotos quedan a su nombre. Son suyos, no nuestros.",
    },
  },
  {
    id: "languages",
    group: "after",
    q: {
      en: "Can my site be in English and Spanish?",
      es: "¿Mi sitio puede estar en inglés y en español?",
    },
    a: {
      en: "Yes. The Growth package includes a bilingual site, so your Spanish-speaking customers feel just as welcome as everyone else.",
      es: "Sí. El paquete Crecimiento incluye un sitio bilingüe, para que sus clientes que hablan español se sientan igual de bienvenidos.",
    },
  },
  {
    id: "when-it-launches",
    group: "after",
    q: {
      en: "What does “When it launches” mean on some features?",
      es: "¿Qué significa “Cuando se lance” en algunas funciones?",
    },
    a: {
      en: "Those features are the phone side, and we’re still building them: missed calls answered by text, online booking with deposits, and an automatic reminder the day before. We list them so you know what’s coming, but your price only covers what’s ready today. Ask us where it stands and we’ll tell you straight.",
      es: "Esas funciones son el lado del teléfono y todavía las estamos construyendo: llamadas perdidas contestadas por mensaje de texto, citas en línea con anticipo y un recordatorio automático un día antes. Las mostramos para que sepa lo que viene, pero su precio solo cubre lo que ya está listo. Pregúntenos cómo vamos y le diremos la verdad.",
    },
  },
  {
    id: "privacy",
    group: "after",
    q: {
      en: "Is my information safe with you?",
      es: "¿Mi información está segura con ustedes?",
    },
    a: {
      en: "Yes. This site uses no cookies, no trackers and no mailing list, and we never sell data. The details you send us are used to reply to you, nothing else.",
      es: "Sí. Este sitio no usa cookies, rastreadores ni listas de correo, y nunca vendemos datos. Los datos que nos envía se usan para contestarle, nada más.",
    },
  },

  /* ---------------- Why us, and why now ---------------- */
  {
    id: "more-customers",
    group: "why",
    q: {
      en: "Will a website really bring me more customers?",
      es: "¿De verdad un sitio web me va a traer más clientes?",
    },
    a: {
      en: "Most customers look you up before they call. If they can’t find you, or what they find looks out of date, they call someone else, and you never even know you lost them. A clear, fast site with your number one tap away gives those people a reason to pick you. We can’t promise a number, but we build every page for one job: making your phone ring.",
      es: "La mayoría de los clientes lo buscan antes de llamar. Si no lo encuentran, o lo que encuentran se ve viejo, le llaman a otro, y usted ni se entera de que los perdió. Un sitio claro y rápido, con su número a un toque, les da una razón para elegirlo a usted. No podemos prometer una cifra, pero cada página la construimos para un solo trabajo: que su teléfono suene.",
    },
  },
  {
    id: "why-now",
    group: "why",
    q: {
      en: "Why not wait until things slow down?",
      es: "¿Por qué no esperar a que las cosas se calmen?",
    },
    a: {
      en: "Because people are searching for what you do today, and every week without a site sends some of them to a competitor. Starting costs you nothing: the preview is free, you pay only when you love the finished site, and it’s ready to review within 7 days. The only thing waiting saves you is the calls you would have gotten.",
      es: "Porque hoy mismo hay gente buscando lo que usted hace, y cada semana sin sitio manda a algunos con la competencia. Empezar no le cuesta nada: la vista previa es gratis, solo paga cuando le encanta el sitio terminado y está listo para revisar en 7 días. Lo único que se ahorra esperando son las llamadas que habría recibido.",
    },
  },
  {
    id: "next-step",
    group: "why",
    q: {
      en: "Okay, I’m interested. What happens next?",
      es: "Bien, me interesa. ¿Qué sigue?",
    },
    a: {
      en: "Leave your name and number in the form above (it takes a minute). We call or text you within one business day to set up a relaxed 15-minute chat. No card, no pressure, nothing to prepare. From there, you’ll see your site before you pay a cent.",
      es: "Deje su nombre y número en el formulario de arriba (toma un minuto). Le llamamos o escribimos en un día hábil para agendar una charla tranquila de 15 minutos. Sin tarjeta, sin presión, nada que preparar. A partir de ahí, verá su sitio antes de pagar un centavo.",
    },
  },
];
