/**
 * Business facts in one place. Anything in [BRACKETS] is a placeholder waiting on the owner.
 * `isPlaceholder` lets components show a visible "placeholder" marker so nothing ships by accident.
 */

export const site = {
  /** TODO(owner): confirm the business name and how it's written. */
  name: 'Serma',
  legalName: 'Serma',
  city: 'Austin',
  region: 'TX',
  /** TODO(owner): footer + contact email. */
  email: '[EMAIL]',
  /** TODO(owner): phone in display form, e.g. (512) 555-0100. */
  phone: '[PHONE]',
  /** TODO(owner): "Austin and nearby" or "anywhere in the US". Copy avoids depending on it for now. */
  serviceArea: '[SERVICE AREA]',
  pricing: 'contact' as const,
} as const;

export const isPlaceholder = (value: string) => /^\[.*\]$/.test(value);

/**
 * Phase 2 preview build: the lead form validates and shows its success state,
 * but nothing is sent or saved. Phase 5 turns this off and wires the real endpoint.
 */
export const PREVIEW_MODE = true;

export const routes = {
  home: '/',
  freePreview: '/free-preview',
  bookCall: '/book-a-call',
  about: '/about',
  contact: '/contact',
  industries: '/industries',
  privacy: '/privacy',
  terms: '/terms',
  accessibility: '/accessibility',
  spanishHome: '/es',
} as const;

export const industries = [
  { slug: 'barbershops', name: 'Barbershops', formValue: 'Barbershop', line: 'Cuts, fades, and beard trims, booked online.' },
  { slug: 'nail-salons', name: 'Nail salons', formValue: 'Nail salon', line: 'Manicures, full sets, and fills, booked online.' },
  { slug: 'massage-therapists', name: 'Massage therapists', formValue: 'Massage therapy', line: '60 and 90-minute sessions, booked online.' },
  { slug: 'spas', name: 'Spas', formValue: 'Spa', line: 'Facials and treatments, booked online.' },
  { slug: 'personal-trainers', name: 'Personal trainers', formValue: 'Personal training', line: 'Training sessions, booked online.' },
  { slug: 'cleaning-services', name: 'Cleaning services', formValue: 'Cleaning service', line: 'Home and office cleanings, booked online.' },
  { slug: 'auto-detailing', name: 'Auto detailing', formValue: 'Auto detailing', line: 'Washes and full details, booked online.' },
] as const;

export const businessTypes = [...industries.map((i) => i.formValue), 'Other service business'] as const;
