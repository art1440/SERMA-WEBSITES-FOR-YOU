/**
 * English copy for the homepage and shared UI.
 * Spanish (es.ts) will mirror this shape in Phase 6.
 *
 * Rules for this file:
 * - Plain words a barber would use. No tech jargon.
 * - No invented clients, reviews, stats, or awards.
 * - Anything that states a business policy we haven't confirmed is marked `draft: true`
 *   and renders with a visible "Needs your confirmation" tag.
 */

export const en = {
  lang: 'en',
  meta: {
    title: 'Websites with Online Booking for Service Businesses | Serma, Austin TX',
    description:
      'We build websites with online booking, a calendar, and reminders built in for barbershops, salons, spas, and every service business. No booking app fees. Free website preview.',
  },
  a11y: {
    skip: 'Skip to main content',
    menu: 'Menu',
    closeMenu: 'Close menu',
    close: 'Close',
    mainNav: 'Main',
    footerNav: 'Footer',
    switchLang: 'Ver en español',
    newTab: '(opens in a new tab)',
  },
  nav: [
    { label: 'What you get', href: '/#included' },
    { label: 'Demo', href: '/#demo' },
    { label: 'Work', href: '/#work' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ],
  cta: {
    primary: 'Get your free website preview',
    primaryShort: 'Free preview',
    secondary: 'Book a call',
  },

  hero: {
    eyebrow: 'Websites for barbers, salons, spas, and every service business',
    title: 'Websites that book your customers for you.',
    lead: 'We design your website with online booking, a calendar, and reminders built in, then host and look after it for one monthly price. No Calendly. No Square. No extra app fees.',
    trust: ['Free preview, no credit card', 'English and Spanish', 'Based in Austin, TX'],
    skipIntro: 'Skip intro',
  },

  problem: {
    eyebrow: 'The problem',
    title: 'Every day without online booking, someone books the shop down the street.',
    items: [
      {
        title: 'No website, no booking',
        body: 'People look you up before they book. If all they find is an Instagram page that says "DM to book," plenty of them won\'t wait for a reply. They book whoever lets them pick a time right now.',
      },
      {
        title: 'Missed calls while you work',
        body: 'You can\'t pick up the phone in the middle of a cut or a massage. Every call you miss is a customer who might call someone else next.',
      },
      {
        title: 'Booking apps that bill you forever',
        body: 'Booking apps charge you every month, and some charge per staff member, on top of what you pay for a website. Your customers end up on their brand, not yours.',
      },
    ],
    resolve: 'One website with booking built in fixes all three.',
  },

  included: {
    eyebrow: 'What every site includes',
    title: 'Everything you need to get booked. Nothing extra to pay for.',
    lead: 'Every site comes with the full set. No add-ons to buy and no apps to connect.',
    chapters: [
      {
        id: 'design',
        label: 'Design',
        title: 'Designed for your business, made for phones.',
        cards: [
          { title: 'Mobile-first design', body: 'Your customers find you on their phone, so we design for that screen first, then make it look great on every other one.' },
          { title: 'English and Spanish', body: 'Offer your whole site, booking included, in both languages. Customers pick the one they\'re comfortable with.' },
        ],
      },
      {
        id: 'build',
        label: 'Build',
        title: 'Built right, so you never have to think about it.',
        cards: [
          { title: 'Fast on any connection', body: 'Pages open quickly, even on a weak signal. A slow site loses people before they ever see your services.' },
          { title: 'Accessible, with legal pages', body: 'Easy to use for people with screen readers or a keyboard. Privacy policy and terms pages included.' },
        ],
      },
      {
        id: 'booking',
        label: 'Booking',
        title: 'Booking that works while you work.',
        cards: [
          { title: 'Online booking', body: 'Customers pick a service and a time, and they\'re booked. No back-and-forth texts.' },
          { title: 'Your dashboard and calendar', body: 'Every appointment in one calendar you can check from your phone or computer.' },
          { title: 'Confirmations and reminders', body: 'Customers get an email when they book and a reminder before they come in. Fewer no-shows, less chasing.' },
        ],
      },
      {
        id: 'launch',
        label: 'Launch',
        title: 'Launched, hosted, and looked after.',
        cards: [
          { title: 'Hosting included', body: 'Your site runs on fast, secure hosting. No separate hosting bill.' },
          { title: 'Updates and care', body: 'We handle security and updates, so your site keeps working without you touching it.' },
        ],
      },
    ],
  },

  demo: {
    eyebrow: 'Try it',
    title: 'Book an appointment. Then see it from your side.',
    lead: 'A working demo with a made-up shop and fake data. Go ahead and click around.',
    note: 'Demo shop. Names, prices, and appointments are made up.',
  },

  how: {
    eyebrow: 'How it works',
    title: 'From free preview to fully booked.',
    steps: [
      { title: 'Free preview', body: 'Tell us about your business. We design a preview of your new homepage and send it to you, free.' },
      { title: 'Approve', body: 'Tell us what you\'d like changed. Once it feels right, you approve it.' },
      { title: 'Launch', body: 'We build the full site with booking, connect your domain, and put it live.' },
      { title: 'We maintain it', body: 'Hosting, updates, and help when you need it, on one monthly plan.' },
    ],
  },

  work: {
    eyebrow: 'Our work',
    title: 'Real sites for real local businesses.',
    lead: 'We only show real client sites here. Our first launches are on the way.',
    placeholder: 'Client site coming soon',
    placeholderTag: 'Placeholder',
    cta: 'Want yours here first?',
  },

  industriesSection: {
    eyebrow: 'Who it\'s for',
    title: 'Built for businesses that run on appointments.',
    other: { name: 'Any service business', line: 'If you charge for your time, we can build it.' },
  },

  pricing: {
    eyebrow: 'Pricing',
    title: 'One monthly plan. Everything included.',
    lead: 'Every business is a little different, so we quote after your free preview. You\'ll see your monthly price before you agree to anything.',
    includesTitle: 'Every plan includes',
    includes: [
      'Custom design for your business',
      'Online booking system',
      'Owner dashboard and calendar',
      'Email confirmations and reminders',
      'Mobile-first design',
      'English and Spanish',
      'Accessibility and legal pages',
      'Hosting, security, and updates',
    ],
    noFees: 'No booking app fees on top.',
    cta: 'Get your free preview and quote',
    contactLabel: 'Contact for pricing',
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Straight answers.',
    items: [
      {
        q: 'Who owns the website?',
        a: 'You own your business name, logo, photos, and domain. We own the code and booking system that run the site, which is how we keep it hosted and updated for one monthly price.',
        draft: true,
      },
      {
        q: 'What happens if I cancel?',
        a: 'You can cancel with [X] days\' notice. Your domain stays yours, and we\'ll help you move it. The site and booking system stop at the end of your last paid month.',
        draft: true,
      },
      {
        q: 'How long does it take?',
        a: 'Your free preview is usually ready in [X] days. After you approve it, the full site goes live in about [X] weeks.',
        draft: true,
      },
      {
        q: 'Do I need a domain?',
        a: 'No. If you already have one, we connect it. If not, we help you pick one and register it in your name.',
        draft: true,
      },
      {
        q: 'Is the preview really free?',
        a: 'Yes. We design a preview of your homepage at no cost and with no obligation. If it\'s not for you, you don\'t owe anything.',
      },
      {
        q: 'Do my customers need to download an app?',
        a: 'No. They book right on your website, from any phone or computer.',
      },
      {
        q: 'Can my site be in Spanish?',
        a: 'Yes. Your site can be in English, Spanish, or both, booking pages included.',
      },
      {
        q: 'I\'m not good with computers. Is that a problem?',
        a: 'Not at all. We set everything up for you. Day to day, you just check your calendar.',
      },
    ],
    draftTag: 'Needs your confirmation',
  },

  final: {
    eyebrow: 'Free website preview',
    title: 'Your site is next.',
    lead: 'Email or call us about your business. We\'ll design a free preview of your new website and send it to you.',
    talk: 'Rather talk first?',
    contactTitle: 'Ask for your free preview',
    contactLead: 'Tell us your business name and what you do. No credit card, no obligation.',
    email: 'Email',
    phone: 'Call or text',
    location: 'Based in',
  },

  footer: {
    tagline: 'Websites with booking built in, for businesses that run on appointments.',
    company: 'Company',
    industries: 'Industries',
    legal: 'Legal',
    contact: 'Contact',
    links: {
      about: 'About',
      contact: 'Contact',
      bookCall: 'Book a call',
      privacy: 'Privacy Policy',
      terms: 'Terms',
      accessibility: 'Accessibility Statement',
    },
    rights: 'All rights reserved.',
  },
} as const;

export type Copy = typeof en;
