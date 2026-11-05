import type { Locale } from "./types";

/**
 * Bilingual legal page content.
 *
 * IMPORTANT: This is a structured starting draft, not legal advice. Before
 * launch, have it reviewed by a licensed attorney or replace the section text
 * with output from an auto-updating policy service (e.g. Termageddon, iubenda)
 * exported as static text — do NOT embed their third-party script, which would
 * break the zero-third-party CSP and the zero-cookie promise.
 *
 * Tokens: {entity} {email} {law} are filled from src/config/site.ts.
 */

export type LegalSection = { id: string; heading: string; paragraphs?: string[]; list?: string[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };
export type LegalSlug = "privacy" | "terms" | "disclaimer";

const privacyEn: LegalDoc = {
  title: "Privacy Policy",
  intro:
    "{entity} (“SermaWebDesign,” “we,” “us”) builds websites and client-acquisition systems for local businesses. This policy explains what personal information this website collects, why, and the choices you have. The short version: we do not use cookies or trackers, we collect only what you choose to send us, and we never sell your data.",
  sections: [
    {
      id: "zero-cookie",
      heading: "1. Our zero-cookie, zero-tracker design",
      paragraphs: [
        "This website does not set cookies and does not use analytics scripts, advertising pixels, session-replay tools, fingerprinting, or any other third-party tracking technology. Fonts, images, and videos are served from our own domain, so your browser does not contact Google or any other third party when you visit.",
        "Your language choice (English or Spanish) is kept only in your browser’s memory while the page is open. It is not stored in a cookie or in local storage and is never sent to us. On your first visit we read your browser’s preferred language locally to choose a default.",
        "Because we use no cookies or trackers, we do not display a cookie banner. If this ever changes, we will update this policy and ask for your consent before any non-essential technology is used.",
      ],
    },
    {
      id: "collect",
      heading: "2. Information we collect",
      paragraphs: ["We collect personal information only when you submit our demo request form:"],
      list: [
        "Contact details: your name, business name, industry, email address, and — only if you choose to provide it — your mobile phone number.",
        "Your preferred demo language and anything you write in the optional message field.",
        "Consent records: whether you agreed to our Privacy Policy and Terms, whether you agreed to receive text messages, the exact consent wording shown, its version, and the date and time of your submission.",
        "Technical data processed by our hosting provider to deliver and secure the site (such as IP address, browser type, and request time in server logs). We do not use this data to identify or profile visitors.",
      ],
    },
    {
      id: "use",
      heading: "3. How we use your information",
      list: [
        "To respond to your inquiry and schedule and deliver your live demo and revenue audit.",
        "To send you text messages or calls about your inquiry and demo, only if you gave express consent.",
        "To keep records of consent as required by law, and to protect the security and integrity of our website.",
        "To comply with legal obligations and enforce our Terms.",
      ],
    },
    {
      id: "sms",
      heading: "4. Text messaging (SMS) program",
      paragraphs: [
        "If you check the text-message consent box, you agree to receive automated text messages and calls from SermaWebDesign regarding your inquiry and demo request. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply.",
        "Reply STOP at any time to opt out, or HELP for help. You may also opt out by emailing {email}. After you opt out, we will send one final message confirming your request.",
        "Mobile information and SMS opt-in consent will not be shared with third parties or affiliates for marketing or promotional purposes. Text-messaging originator opt-in data and consent will not be shared with any third parties, except service providers that deliver messages on our behalf.",
      ],
    },
    {
      id: "no-sale",
      heading: "5. We do not sell or share your data",
      paragraphs: [
        "We do not sell, rent, or trade personal information, and we do not “share” it for cross-context behavioral advertising, as those terms are defined under the California Consumer Privacy Act (as amended by the CPRA) and similar state laws. We have not done so in the preceding 12 months.",
      ],
    },
    {
      id: "providers",
      heading: "6. Service providers",
      paragraphs: [
        "We use a limited number of service providers to operate our business — for example, website hosting, email, scheduling, customer-relationship management, and SMS delivery. They process personal information only on our instructions, under contract, and may not use it for their own purposes.",
      ],
    },
    {
      id: "retention",
      heading: "7. Data retention",
      paragraphs: [
        "We keep inquiry information only as long as needed to respond to you and provide our services, and then delete or anonymize it. Consent records may be kept longer where required to demonstrate compliance with telemarketing and messaging laws.",
      ],
    },
    {
      id: "security",
      heading: "8. Security",
      paragraphs: [
        "We protect information with encryption in transit (HTTPS), a strict Content Security Policy that blocks third-party scripts, server-side input validation, and access controls. No method of transmission or storage is completely secure, but we work to protect your information and will notify you of a breach where the law requires.",
      ],
    },
    {
      id: "rights",
      heading: "9. Your privacy rights",
      paragraphs: [
        "Depending on where you live (including California, Colorado, Connecticut, Texas, Virginia, and other U.S. states), you may have the right to know what personal information we hold about you, to access or receive a copy of it, to correct it, to delete it, and to opt out of its sale, sharing, or use for targeted advertising (which we do not do). We honor Global Privacy Control browser signals.",
        "To exercise a right, email {email}. We will verify your request and respond within the time required by law. You may use an authorized agent. We will not discriminate against you for exercising any privacy right.",
      ],
    },
    {
      id: "children",
      heading: "10. Children",
      paragraphs: [
        "This website is intended for business owners and is not directed to children under 16. We do not knowingly collect personal information from children. If you believe a child has sent us information, contact us and we will delete it.",
      ],
    },
    {
      id: "clients",
      heading: "11. Websites and dashboards we build for clients",
      paragraphs: [
        "This policy covers the SermaWebDesign website only. Websites, dashboards, and messaging programs we build for our clients are operated by those businesses under their own privacy policies; when we process data for them, we act as their service provider.",
      ],
    },
    {
      id: "changes",
      heading: "12. Changes to this policy",
      paragraphs: [
        "We may update this policy from time to time. The “Last updated” date above shows when it was last revised. Material changes will be highlighted on this page.",
      ],
    },
    {
      id: "contact",
      heading: "13. Contact us",
      paragraphs: ["Questions or requests: {email}."],
    },
  ],
};

const privacyEs: LegalDoc = {
  title: "Política de Privacidad",
  intro:
    "{entity} (“SermaWebDesign”, “nosotros”) crea sitios web y sistemas de captación de clientes para negocios locales. Esta política explica qué información personal recopila este sitio web, por qué y qué opciones tiene usted. En resumen: no usamos cookies ni rastreadores, solo recopilamos lo que usted decide enviarnos y nunca vendemos sus datos.",
  sections: [
    {
      id: "zero-cookie",
      heading: "1. Diseño sin cookies y sin rastreadores",
      paragraphs: [
        "Este sitio web no instala cookies y no utiliza scripts de analítica, píxeles publicitarios, herramientas de grabación de sesiones, huellas digitales del navegador ni ninguna otra tecnología de rastreo de terceros. Las fuentes, imágenes y videos se sirven desde nuestro propio dominio, por lo que su navegador no se comunica con Google ni con ningún otro tercero cuando nos visita.",
        "Su elección de idioma (inglés o español) se conserva únicamente en la memoria de su navegador mientras la página está abierta. No se guarda en una cookie ni en el almacenamiento local y nunca se nos envía. En su primera visita leemos localmente el idioma preferido de su navegador para elegir un idioma predeterminado.",
        "Como no usamos cookies ni rastreadores, no mostramos un aviso de cookies. Si esto cambia, actualizaremos esta política y le pediremos su consentimiento antes de usar cualquier tecnología no esencial.",
      ],
    },
    {
      id: "collect",
      heading: "2. Información que recopilamos",
      paragraphs: ["Solo recopilamos información personal cuando usted envía nuestro formulario para solicitar una demostración:"],
      list: [
        "Datos de contacto: su nombre, el nombre de su negocio, su industria, su correo electrónico y, solo si decide proporcionarlo, su número de teléfono móvil.",
        "El idioma preferido para su demostración y lo que escriba en el campo opcional de mensaje.",
        "Registros de consentimiento: si aceptó nuestra Política de Privacidad y Términos, si aceptó recibir mensajes de texto, el texto exacto del consentimiento mostrado, su versión y la fecha y hora de su envío.",
        "Datos técnicos procesados por nuestro proveedor de alojamiento para entregar y proteger el sitio (como dirección IP, tipo de navegador y hora de la solicitud en los registros del servidor). No usamos estos datos para identificar ni perfilar a los visitantes.",
      ],
    },
    {
      id: "use",
      heading: "3. Cómo usamos su información",
      list: [
        "Para responder a su consulta y para agendar y realizar su demostración en vivo y auditoría de ingresos.",
        "Para enviarle mensajes de texto o llamadas sobre su consulta y demostración, solo si otorgó su consentimiento expreso.",
        "Para conservar los registros de consentimiento exigidos por la ley y proteger la seguridad e integridad de nuestro sitio web.",
        "Para cumplir con obligaciones legales y hacer valer nuestros Términos.",
      ],
    },
    {
      id: "sms",
      heading: "4. Programa de mensajes de texto (SMS)",
      paragraphs: [
        "Si marca la casilla de consentimiento para mensajes de texto, acepta recibir mensajes de texto y llamadas automatizadas de SermaWebDesign sobre su consulta y su solicitud de demostración. El consentimiento no es condición de compra. La frecuencia de mensajes varía. Pueden aplicarse tarifas de mensajes y datos.",
        "Responda STOP en cualquier momento para cancelar, o HELP para obtener ayuda. También puede cancelar escribiendo a {email}. Después de cancelar, le enviaremos un último mensaje para confirmar su solicitud.",
        "La información móvil y el consentimiento para recibir SMS no se compartirán con terceros ni afiliados con fines de marketing o promoción. Los datos de suscripción y consentimiento para mensajes de texto no se compartirán con terceros, excepto con los proveedores de servicios que entregan los mensajes en nuestro nombre.",
      ],
    },
    {
      id: "no-sale",
      heading: "5. No vendemos ni compartimos sus datos",
      paragraphs: [
        "No vendemos, alquilamos ni intercambiamos información personal, y no la “compartimos” para publicidad conductual entre contextos, según se definen esos términos en la Ley de Privacidad del Consumidor de California (modificada por la CPRA) y leyes estatales similares. No lo hemos hecho en los últimos 12 meses.",
      ],
    },
    {
      id: "providers",
      heading: "6. Proveedores de servicios",
      paragraphs: [
        "Utilizamos un número limitado de proveedores de servicios para operar nuestro negocio, por ejemplo: alojamiento web, correo electrónico, agenda, gestión de relaciones con clientes y envío de SMS. Ellos procesan información personal solo según nuestras instrucciones, bajo contrato, y no pueden usarla para sus propios fines.",
      ],
    },
    {
      id: "retention",
      heading: "7. Conservación de datos",
      paragraphs: [
        "Conservamos la información de las consultas solo el tiempo necesario para responderle y prestar nuestros servicios, y después la eliminamos o anonimizamos. Los registros de consentimiento pueden conservarse por más tiempo cuando sea necesario para demostrar el cumplimiento de las leyes de telemercadeo y mensajería.",
      ],
    },
    {
      id: "security",
      heading: "8. Seguridad",
      paragraphs: [
        "Protegemos la información con cifrado en tránsito (HTTPS), una Política de Seguridad de Contenido estricta que bloquea scripts de terceros, validación de datos en el servidor y controles de acceso. Ningún método de transmisión o almacenamiento es completamente seguro, pero trabajamos para proteger su información y le notificaremos de una violación de seguridad cuando la ley lo exija.",
      ],
    },
    {
      id: "rights",
      heading: "9. Sus derechos de privacidad",
      paragraphs: [
        "Según el lugar donde viva (incluidos California, Colorado, Connecticut, Texas, Virginia y otros estados de EE. UU.), puede tener derecho a saber qué información personal tenemos sobre usted, a acceder a ella o recibir una copia, a corregirla, a eliminarla y a oponerse a su venta, a que se comparta o a su uso para publicidad dirigida (lo cual no hacemos). Respetamos las señales de Global Privacy Control del navegador.",
        "Para ejercer un derecho, escriba a {email}. Verificaremos su solicitud y responderemos dentro del plazo que exige la ley. Puede actuar mediante un agente autorizado. No le discriminaremos por ejercer ningún derecho de privacidad.",
      ],
    },
    {
      id: "children",
      heading: "10. Menores de edad",
      paragraphs: [
        "Este sitio web está dirigido a dueños de negocios y no a menores de 16 años. No recopilamos a sabiendas información personal de menores. Si cree que un menor nos envió información, contáctenos y la eliminaremos.",
      ],
    },
    {
      id: "clients",
      heading: "11. Sitios web y paneles que creamos para clientes",
      paragraphs: [
        "Esta política solo cubre el sitio web de SermaWebDesign. Los sitios web, paneles y programas de mensajería que creamos para nuestros clientes son operados por esos negocios conforme a sus propias políticas de privacidad; cuando procesamos datos para ellos, actuamos como su proveedor de servicios.",
      ],
    },
    {
      id: "changes",
      heading: "12. Cambios a esta política",
      paragraphs: [
        "Podemos actualizar esta política periódicamente. La fecha de “Última actualización” indica cuándo se revisó por última vez. Los cambios importantes se destacarán en esta página.",
      ],
    },
    {
      id: "contact",
      heading: "13. Contacto",
      paragraphs: ["Preguntas o solicitudes: {email}."],
    },
  ],
};

const termsEn: LegalDoc = {
  title: "Terms of Service",
  intro:
    "These Terms of Service (“Terms”) govern your use of the SermaWebDesign website operated by {entity}. By using this website, you agree to these Terms. If you do not agree, please do not use the site.",
  sections: [
    {
      id: "services",
      heading: "1. About our services",
      paragraphs: [
        "This website describes the websites, Client Dashboard, and automation systems we build for local businesses. It is informational. Any services we provide are governed by a separate written agreement (such as a Master Services Agreement and statement of work), which controls if it conflicts with these Terms. We do not publish pricing; scope and fees are agreed in writing.",
      ],
    },
    {
      id: "simulations",
      heading: "2. Interactive simulations",
      paragraphs: [
        "The Client Dashboard showcase, missed-call simulator, and revenue calculator are illustrative interactive simulations using sample data. They are not a promise, projection, or guarantee of any result. Actual lead volume, bookings, and revenue depend on market, industry, and business operations. See our Disclaimer for details.",
      ],
    },
    {
      id: "communications",
      heading: "3. Demo requests and communications",
      paragraphs: [
        "When you request a demo, you agree to provide accurate information. If you consent to text messages, you agree to receive automated texts and calls about your inquiry and demo request; message frequency varies, message and data rates may apply, and you can reply STOP to opt out or HELP for help at any time. Consent is not a condition of purchase.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "4. Acceptable use",
      paragraphs: ["You agree not to:"],
      list: [
        "Submit false, misleading, or someone else’s information.",
        "Attempt to probe, scan, disrupt, or gain unauthorized access to the site, its servers, or the Client Portal.",
        "Scrape, copy, or republish site content, designs, or media at scale without written permission.",
        "Use the site to send spam or to transmit malicious code.",
      ],
    },
    {
      id: "portal",
      heading: "5. Client Portal access",
      paragraphs: [
        "Access to the SermaWebDesign Client Dashboard is provided only to onboarded clients under their service agreement. Credentials are personal to the client and must be kept confidential.",
      ],
    },
    {
      id: "ip",
      heading: "6. Intellectual property",
      paragraphs: [
        "The site’s text, design, code, graphics, and motion media are owned by or licensed to SermaWebDesign and protected by intellectual-property laws. Third-party names and trademarks (for example, Google) belong to their owners and are used for identification only; no endorsement or affiliation is implied.",
      ],
    },
    {
      id: "warranties",
      heading: "7. Disclaimer of warranties",
      paragraphs: [
        "The website is provided “as is” and “as available,” without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement, to the fullest extent permitted by law.",
      ],
    },
    {
      id: "liability",
      heading: "8. Limitation of liability",
      paragraphs: [
        "To the fullest extent permitted by law, SermaWebDesign will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits or revenue, arising from your use of this website. Our total liability for any claim relating to the website will not exceed one hundred U.S. dollars (US$100).",
      ],
    },
    {
      id: "indemnity",
      heading: "9. Indemnification",
      paragraphs: [
        "You agree to indemnify and hold harmless SermaWebDesign from claims arising out of your misuse of the website or your violation of these Terms.",
      ],
    },
    {
      id: "law",
      heading: "10. Governing law",
      paragraphs: [
        "These Terms are governed by the laws of {law}, without regard to conflict-of-law rules. Any dispute will be resolved in the state or federal courts located there, unless your service agreement provides otherwise.",
      ],
    },
    {
      id: "changes",
      heading: "11. Changes",
      paragraphs: [
        "We may update these Terms. Continued use of the website after an update means you accept the revised Terms. The “Last updated” date shows the latest version.",
      ],
    },
    {
      id: "contact",
      heading: "12. Contact",
      paragraphs: ["Questions about these Terms: {email}."],
    },
  ],
};

const termsEs: LegalDoc = {
  title: "Términos de Servicio",
  intro:
    "Estos Términos de Servicio (“Términos”) rigen el uso del sitio web de SermaWebDesign operado por {entity}. Al usar este sitio web, usted acepta estos Términos. Si no está de acuerdo, por favor no use el sitio.",
  sections: [
    {
      id: "services",
      heading: "1. Sobre nuestros servicios",
      paragraphs: [
        "Este sitio web describe los sitios web, el Panel de Control de Clientes y los sistemas de automatización que creamos para negocios locales. Su contenido es informativo. Los servicios que prestamos se rigen por un acuerdo escrito independiente (como un Acuerdo Maestro de Servicios y una declaración de trabajo), que prevalecerá en caso de conflicto con estos Términos. No publicamos precios; el alcance y las tarifas se acuerdan por escrito.",
      ],
    },
    {
      id: "simulations",
      heading: "2. Simulaciones interactivas",
      paragraphs: [
        "La muestra del Panel de Control de Clientes, el simulador de llamadas perdidas y la calculadora de ingresos son simulaciones interactivas ilustrativas que usan datos de ejemplo. No constituyen una promesa, proyección ni garantía de ningún resultado. El volumen real de prospectos, citas e ingresos depende del mercado, la industria y la operación del negocio. Consulte nuestro Aviso Legal para más detalles.",
      ],
    },
    {
      id: "communications",
      heading: "3. Solicitudes de demostración y comunicaciones",
      paragraphs: [
        "Al solicitar una demostración, usted se compromete a proporcionar información veraz. Si acepta recibir mensajes de texto, acepta recibir textos y llamadas automatizadas sobre su consulta y su solicitud de demostración; la frecuencia de mensajes varía, pueden aplicarse tarifas de mensajes y datos, y puede responder STOP para cancelar o HELP para obtener ayuda en cualquier momento. El consentimiento no es condición de compra.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "4. Uso aceptable",
      paragraphs: ["Usted se compromete a no:"],
      list: [
        "Enviar información falsa, engañosa o de otra persona.",
        "Intentar sondear, escanear, interrumpir u obtener acceso no autorizado al sitio, sus servidores o el Portal de Clientes.",
        "Extraer, copiar o republicar a gran escala el contenido, los diseños o los medios del sitio sin permiso por escrito.",
        "Usar el sitio para enviar spam o transmitir código malicioso.",
      ],
    },
    {
      id: "portal",
      heading: "5. Acceso al Portal de Clientes",
      paragraphs: [
        "El acceso al Panel de Control de Clientes de SermaWebDesign se otorga únicamente a clientes incorporados conforme a su acuerdo de servicios. Las credenciales son personales del cliente y deben mantenerse confidenciales.",
      ],
    },
    {
      id: "ip",
      heading: "6. Propiedad intelectual",
      paragraphs: [
        "Los textos, el diseño, el código, los gráficos y los medios en movimiento del sitio son propiedad de SermaWebDesign o se usan bajo licencia, y están protegidos por las leyes de propiedad intelectual. Los nombres y marcas de terceros (por ejemplo, Google) pertenecen a sus dueños y se usan solo con fines de identificación; no implican respaldo ni afiliación.",
      ],
    },
    {
      id: "warranties",
      heading: "7. Exclusión de garantías",
      paragraphs: [
        "El sitio web se ofrece “tal cual” y “según disponibilidad”, sin garantías de ningún tipo, expresas o implícitas, incluidas las garantías de comerciabilidad, idoneidad para un fin particular y no infracción, en la medida máxima permitida por la ley.",
      ],
    },
    {
      id: "liability",
      heading: "8. Limitación de responsabilidad",
      paragraphs: [
        "En la medida máxima permitida por la ley, SermaWebDesign no será responsable de daños indirectos, incidentales, especiales, consecuentes o punitivos, ni de la pérdida de ganancias o ingresos, derivados del uso de este sitio web. Nuestra responsabilidad total por cualquier reclamación relacionada con el sitio web no excederá cien dólares estadounidenses (US$100).",
      ],
    },
    {
      id: "indemnity",
      heading: "9. Indemnización",
      paragraphs: [
        "Usted acepta indemnizar y mantener indemne a SermaWebDesign frente a reclamaciones derivadas del mal uso del sitio web o del incumplimiento de estos Términos.",
      ],
    },
    {
      id: "law",
      heading: "10. Ley aplicable",
      paragraphs: [
        "Estos Términos se rigen por las leyes de {law}, sin considerar sus normas sobre conflicto de leyes. Cualquier disputa se resolverá en los tribunales estatales o federales de esa jurisdicción, salvo que su acuerdo de servicios disponga otra cosa.",
      ],
    },
    {
      id: "changes",
      heading: "11. Cambios",
      paragraphs: [
        "Podemos actualizar estos Términos. El uso continuo del sitio web después de una actualización significa que acepta los Términos revisados. La fecha de “Última actualización” indica la versión más reciente.",
      ],
    },
    {
      id: "contact",
      heading: "12. Contacto",
      paragraphs: ["Preguntas sobre estos Términos: {email}."],
    },
  ],
};

const disclaimerEn: LegalDoc = {
  title: "Disclaimer",
  intro: "Please read this disclaimer carefully. It explains how to interpret the interactive demonstrations and figures on this website.",
  sections: [
    {
      id: "simulations",
      heading: "1. Illustrative simulations",
      paragraphs: [
        "The Client Dashboard showcase, the missed-call simulator, and the missed-revenue calculator are illustrative interactive simulations of the SermaWebDesign Client Portal. All names, phone numbers, businesses, metrics, and amounts shown are fictional sample data created for demonstration. Phone numbers use the reserved 555-01XX range.",
        "Actual lead volume, bookings, and revenue depend on market, industry, and business operations.",
      ],
    },
    {
      id: "no-guarantee",
      heading: "2. No guarantee of results",
      paragraphs: [
        "We do not guarantee any specific number of leads, calls, bookings, reviews, rankings, or revenue. Calculator outputs are arithmetic based solely on the inputs you choose and the assumptions stated next to them; they are not projections of your results.",
      ],
    },
    {
      id: "not-advice",
      heading: "3. Not legal, tax, or financial advice",
      paragraphs: [
        "We build websites and systems to modern accessibility (WCAG 2.1 AA), privacy, and messaging-compliance practices. However, nothing on this website is legal, tax, or financial advice. Each business remains responsible for ensuring its own website content, privacy policy, accessibility, and text-messaging program comply with the laws that apply to it, and should consult its own attorney.",
      ],
    },
    {
      id: "messaging",
      heading: "4. Messaging and carrier approval",
      paragraphs: [
        "Business text messaging in the United States requires carrier registration (A2P 10DLC) and the recipient’s consent. Registration timelines and approval decisions are made by carriers and their partners and are outside our control.",
      ],
    },
    {
      id: "trademarks",
      heading: "5. Third-party trademarks",
      paragraphs: [
        "Third-party names and marks mentioned on this website belong to their respective owners. Their use does not imply endorsement, sponsorship, or affiliation.",
      ],
    },
    {
      id: "media",
      heading: "6. Motion media",
      paragraphs: [
        "Ambient videos and industry visuals on this website are AI-generated artistic renderings created for illustration. They do not depict real client businesses or locations.",
      ],
    },
    {
      id: "contact",
      heading: "7. Contact",
      paragraphs: ["Questions: {email}."],
    },
  ],
};

const disclaimerEs: LegalDoc = {
  title: "Aviso Legal",
  intro: "Lea este aviso con atención. Explica cómo interpretar las demostraciones interactivas y las cifras de este sitio web.",
  sections: [
    {
      id: "simulations",
      heading: "1. Simulaciones ilustrativas",
      paragraphs: [
        "La muestra del Panel de Control de Clientes, el simulador de llamadas perdidas y la calculadora de ingresos perdidos son simulaciones interactivas ilustrativas del Portal de Clientes de SermaWebDesign. Todos los nombres, números de teléfono, negocios, métricas y montos mostrados son datos de ejemplo ficticios creados para la demostración. Los números de teléfono usan el rango reservado 555-01XX.",
        "El volumen real de prospectos, citas e ingresos depende del mercado, la industria y la operación del negocio.",
      ],
    },
    {
      id: "no-guarantee",
      heading: "2. Sin garantía de resultados",
      paragraphs: [
        "No garantizamos ningún número específico de prospectos, llamadas, citas, reseñas, posiciones en buscadores ni ingresos. Los resultados de la calculadora son operaciones aritméticas basadas únicamente en los valores que usted elige y en las suposiciones indicadas junto a ellos; no son proyecciones de sus resultados.",
      ],
    },
    {
      id: "not-advice",
      heading: "3. No es asesoría legal, fiscal ni financiera",
      paragraphs: [
        "Creamos sitios web y sistemas conforme a prácticas modernas de accesibilidad (WCAG 2.1 AA), privacidad y cumplimiento en mensajería. Sin embargo, nada de lo publicado en este sitio constituye asesoría legal, fiscal ni financiera. Cada negocio sigue siendo responsable de que el contenido de su sitio web, su política de privacidad, su accesibilidad y su programa de mensajes de texto cumplan con las leyes que le aplican, y debe consultar a su propio abogado.",
      ],
    },
    {
      id: "messaging",
      heading: "4. Mensajería y aprobación de operadores",
      paragraphs: [
        "Los mensajes de texto comerciales en Estados Unidos requieren registro ante los operadores (A2P 10DLC) y el consentimiento del destinatario. Los plazos y las decisiones de aprobación dependen de los operadores y sus socios y están fuera de nuestro control.",
      ],
    },
    {
      id: "trademarks",
      heading: "5. Marcas de terceros",
      paragraphs: [
        "Los nombres y marcas de terceros mencionados en este sitio pertenecen a sus respectivos dueños. Su uso no implica respaldo, patrocinio ni afiliación.",
      ],
    },
    {
      id: "media",
      heading: "6. Medios en movimiento",
      paragraphs: [
        "Los videos ambientales y las imágenes de industrias de este sitio son representaciones artísticas generadas con IA con fines ilustrativos. No muestran negocios ni ubicaciones reales de clientes.",
      ],
    },
    {
      id: "contact",
      heading: "7. Contacto",
      paragraphs: ["Preguntas: {email}."],
    },
  ],
};

export const legalDocs: Record<LegalSlug, Record<Locale, LegalDoc>> = {
  privacy: { en: privacyEn, es: privacyEs },
  terms: { en: termsEn, es: termsEs },
  disclaimer: { en: disclaimerEn, es: disclaimerEs },
};
