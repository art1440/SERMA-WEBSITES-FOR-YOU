/** Structured data (schema.org JSON-LD). Placeholders are left out rather than published. */
import { site, isPlaceholder } from '../config/site';
import { en } from '../i18n/en';

export function localBusiness(siteUrl: URL | undefined) {
  const url = siteUrl?.toString();
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    description: en.meta.description,
    url,
    address: { '@type': 'PostalAddress', addressLocality: site.city, addressRegion: site.region, addressCountry: 'US' },
    ...(isPlaceholder(site.email) ? {} : { email: site.email }),
    ...(isPlaceholder(site.phone) ? {} : { telephone: site.phone }),
    knowsLanguage: ['en', 'es'],
    priceRange: undefined,
  };
}

/** Only confirmed answers go into FAQ structured data. */
export function faqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: en.faq.items
      .filter((i) => !('draft' in i && i.draft))
      .map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}
