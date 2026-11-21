import type { Metadata } from "next";
import { BASE_PATH } from "@/lib/asset";
import { dictionaries } from "@/i18n/dictionary";
import HomePage from "../page";

const TITLE = dictionaries.es.meta.title;
const DESCRIPTION =
  "Sitios web para barberías, salones, restaurantes y contratistas que convierten búsquedas en llamadas. Lo escribimos y lo construimos por usted, y solo paga después de verlo y decir que sí. Pida su maqueta gratis.";

export const metadata: Metadata = {
  // `absolute` skips the "%s — SermaWebDesign" template: the dictionary title already carries the brand.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: {
    canonical: `${BASE_PATH}/es/`,
    languages: {
      en: `${BASE_PATH}/`,
      es: `${BASE_PATH}/es/`,
      "x-default": `${BASE_PATH}/`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "SermaWebDesign",
    title: "Sitios web premium para que lo elijan primero",
    description:
      "Su próximo cliente lo está buscando ahora mismo. Hacemos el sitio web que lo lleva a llamarle a usted, y no paga hasta verlo y decir que sí.",
    url: `${BASE_PATH}/es/`,
    locale: "es_US",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitios web premium para que lo elijan primero",
    description: "Su próximo cliente lo está buscando. Hacemos el sitio web que lo lleva a llamarle. Paga solo si le encanta.",
  },
};

/** The same home page as /, rendered in Spanish (the language provider reads the /es path). */
export default function SpanishHomePage() {
  return <HomePage />;
}
