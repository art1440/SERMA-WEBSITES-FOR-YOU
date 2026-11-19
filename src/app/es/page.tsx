import type { Metadata } from "next";
import { BASE_PATH } from "@/lib/asset";
import { dictionaries } from "@/i18n/dictionary";
import HomePage from "../page";

const TITLE = dictionaries.es.meta.title;
const DESCRIPTION =
  "Sitios web bilingües para barberías, salones, restaurantes y contratistas. A cada llamada perdida le llega un mensaje de texto y sus clientes agendan a cualquier hora, con depósitos y recordatorios.";

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
    title: "Sitios web que le traen clientes",
    description:
      "A cada llamada perdida le llega un mensaje de texto. Sus clientes agendan solos, de día o de noche, con depósitos y recordatorios. Usted se queda con el trabajo para el que abrió sus puertas.",
    url: `${BASE_PATH}/es/`,
    locale: "es_US",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sitios web que le traen clientes",
    description: "A cada llamada perdida le llega un mensaje de texto. Sus clientes agendan solos, de día o de noche, con depósitos y recordatorios.",
  },
};

/** The same home page as /, rendered in Spanish (the language provider reads the /es path). */
export default function SpanishHomePage() {
  return <HomePage />;
}
