# SermaWebDesign — Flagship Site (Milestone 1)

Bilingual (EN/ES), cookieless, interactive sales showcase: hero, system architecture, 6-niche Client Dashboard, missed-call → SMS simulator, revenue calculator, comparison matrix, TCPA-compliant demo form, and legal pages.

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

Set these in your host (Vercel → Project → Settings → Environment Variables). Never commit real values; see `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `LEAD_WEBHOOK_URL` | **Yes (production)** | Where demo requests are POSTed (Zapier / Make / n8n / CRM webhook). Without it, production returns 503 so leads are never silently lost. |
| `LEAD_WEBHOOK_SECRET` | Recommended | Sent as `X-Webhook-Secret` so your webhook can reject forged posts. |
| `SITE_URL` | Recommended | Canonical URL for social previews, e.g. `https://www.sermawebdesign.com`. |

Each lead payload includes a **consent record** (exact consent wording shown, language, version, timestamp, E.164 phone). Keep it in your CRM — it is your proof of consent for TCPA / A2P 10DLC.

## Before launch — required edits

1. **`src/config/site.ts`** — replace `contactEmail` (currently the reserved placeholder `contact@example.com`), confirm `legalEntity`, set `governingLaw` (currently `[Your State]`).
2. **Legal pages** (`src/i18n/legal.ts`) — the text is a structured draft. Have an attorney review it, or paste in static text exported from Termageddon / iubenda. Do **not** embed their JavaScript widget: it would be blocked by the site's CSP and would break the zero-third-party promise.
3. **A2P 10DLC** — register your brand/campaign with your SMS provider before texting anyone. The form's opt-in wording, the Privacy Policy's SMS section, and the "no sharing of mobile opt-in data" clause are written to match what carriers review.

## Compliance & performance notes

- **Zero cookies / zero third parties:** no analytics, pixels, CDNs or external fonts. A strict Content-Security-Policy (`next.config.ts`) blocks any third-party script, style, font, or beacon at the browser level. No cookie banner is needed because nothing non-essential is stored. If you ever add analytics or a pixel, a consent banner with prior-consent blocking must be added first.
- **Language:** held in React state only (no cookie/storage). Detected from the browser on first visit; persists across pages via client-side navigation. Spanish content is not separately indexable by search engines yet — a future `/es` route would fix that.
- **Demo form:** client + server validation (shared `src/lib/validation.ts`), XSS character blocking, honeypot, human-timing check, per-IP rate limit, 8 KB body cap. SMS consent is unchecked by default and becomes required as soon as a phone number is entered; leaving the phone empty lets a visitor book without SMS consent (carriers generally reject campaigns where texting consent is forced).
- **Accessibility:** WCAG 2.1 AA — audited with axe-core (0 violations on every page, EN and ES, including modal and form-error states). Keyboard-operable tabs, dialog focus trap, skip link, `prefers-reduced-motion` respected (videos stay paused), pause controls on every looping video.
- **60 fps:** only `transform` and `opacity` are animated; videos play only while on screen (IntersectionObserver) and never with scroll listeners.

## Media provenance

All video loops in `public/media/` were generated with Higgsfield (Kling 3.0 Pro, silent, 1080p source) for this project, then re-encoded as seamless WebM + MP4 loops with posters (~7 MB total). They are illustrative renderings; they do not depict real client businesses (also stated on `/disclaimer`).
