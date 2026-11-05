# SermaWebDesign — Flagship Site (Milestone 1)

Bilingual (EN/ES), cookieless, interactive sales showcase: hero, system architecture, 6-niche Client Dashboard, missed-call → SMS simulator, revenue calculator, comparison matrix, direct-contact demo booking, and legal pages. **The site collects no personal information** — no forms, no cookies, no trackers.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 3.4 · Framer Motion · Lucide · self-hosted fonts via `next/font/local` · Higgsfield-generated motion loops.

## Run locally

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. Production check: `npm run build` then `npm start`.

## Environment variables

Set in your host (Vercel → Project → Settings → Environment Variables). See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | Recommended | Canonical URL for social previews, e.g. `https://www.sermawebdesign.com`. |

## Before launch — required edits

1. **`src/config/site.ts`** — set `contactEmail` (the "Book a Live System Demo" buttons open an email to it; currently the placeholder `contact@example.com`), optionally `contactPhone` (shows a "Call" button), confirm `legalEntity`, set `governingLaw` (currently `[Your State]`).
2. **Legal pages** (`src/i18n/legal.ts`) — the text is a structured draft. Have an attorney review it, or paste in static text exported from Termageddon / iubenda. Do **not** embed their JavaScript widget: the site's CSP would block it and it would break the zero-third-party promise.

## Compliance & performance notes

- **Zero cookies / zero third parties:** no analytics, pixels, CDNs or external fonts. A strict Content-Security-Policy (`next.config.ts`) blocks any third-party script, style, font, or beacon at the browser level. No cookie banner is needed because nothing non-essential is stored. If you ever add analytics or a pixel, a consent banner with prior-consent blocking must be added first.
- **Language:** held in React state only (no cookie/storage). Detected from the browser on first visit; persists across pages via client-side navigation. Spanish content is not separately indexable by search engines yet — a future `/es` route would fix that.
- **No data collection:** "Book a Live System Demo" opens the visitor's own email app with a pre-filled subject/body (and an optional `tel:` call button). There is no form and no API endpoint. If you later add a form, analytics, or SMS, it needs a consent checkbox, a Privacy Policy update, and (for trackers) a cookie banner with prior-consent blocking — the original TCPA-ready form is in git history (commit `7d208c7`).
- **Accessibility:** WCAG 2.1 AA — audited with axe-core (0 violations on every page, EN and ES, including the open login modal). Keyboard-operable tabs, dialog focus trap, skip link, `prefers-reduced-motion` respected (videos stay paused), pause controls on every looping video.
- **60 fps:** only `transform` and `opacity` are animated. Scroll-linked effects (headline shear, dashboard tilt, kinetic type bands, parallax, progress line) use CSS scroll-driven animations (`animation-timeline`) — zero JavaScript, zero scroll listeners; unsupported browsers and reduced-motion visitors get the static layout. Videos play only while on screen (IntersectionObserver).

## Media provenance

All video loops in `public/media/` were generated with Higgsfield (Kling 3.0 Pro, silent, 1080p source) for this project, then re-encoded as seamless WebM + MP4 loops with posters (~7 MB total). They are illustrative renderings; they do not depict real client businesses (also stated on `/disclaimer`).
