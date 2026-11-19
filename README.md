# SermaWebDesign — Flagship Site (Milestone 1)

Bilingual (EN/ES), cookieless, interactive sales showcase, light by default with a dark-mode toggle. One section is on screen at a time, picked from a tab bar: Home (hero), How it works, Industries, Dashboard (6 niches), Missed calls (call → SMS simulator), Calculator, Compare, and Pricing (three packages, prices in `src/data/pricing.ts`, plus the enquiry form). Legal pages sit outside the tabs. **No cookies, no trackers.** The only personal data collected is what a visitor types into the enquiry form (see below).

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 3.4 · Framer Motion · three.js + React Three Fiber (WebGL) · Lucide · self-hosted fonts via `next/font/local` (Source Serif 4, Work Sans, Geist Mono) · Higgsfield-generated motion loops.

## Hosting (Netlify)

`netlify.toml` holds everything Netlify needs: build command, output folder (`out/`), Node version, the full security headers (CSP, HSTS, X-Frame-Options, …), and a one-year immutable cache for `/media/*` and `/_next/static/*` (so never overwrite a file in `public/media`: give a changed file a new name and update its reference).

One-time setup: Netlify → **Add new site → Import an existing project → GitHub** → pick `art1440/SERMA-WEBSITES-FOR-YOU`, branch `main`. Leave the build settings as detected and deploy. After that, every push to `main` redeploys automatically. Add your custom domain under Site configuration → Domain management.

## Run locally

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. Production check: `npm run build` then `npm start`. Static (Netlify) build: `STATIC_EXPORT=true npm run build` → `out/`.

## Environment variables

Set in your host (Netlify → Site configuration → Environment variables). See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | Recommended | Canonical URL for social previews, e.g. `https://www.sermawebdesign.com`. |

## Before launch — required edits

1. **`src/config/site.ts`** — `contactEmail` (`serma.support@gmail.com`; the Pricing tab's email link and the form's error fallback use it), `contactPhone` (`(512) 774-0374`; shows a "Call" button, set to `null` to hide), `governingLaw` (Texas) and `legalLastUpdated` are filled in: confirm they are the real, final values. `legalEntity` is still the bare `SermaWebDesign`: set the registered legal name (e.g. with "LLC").
2. **Prices** (`src/data/pricing.ts`) — all three packages still have `price: null` and `monthly: null`, so the cards show "Price coming soon". Publish numbers (US dollars) before launch, or leave as is on purpose. Note the Terms say "We do not publish pricing": change one or the other.
3. **Netlify Forms** — after the first deploy, check Forms → `enquiries` is registered, and add an email notification (Forms → Settings & usage → Form notifications) to the inbox. The Privacy Policy says submissions "reach our email inbox"; that is a Netlify dashboard setting, not code. Without it submissions only sit in the Netlify form list.
4. **Legal pages** (`src/i18n/legal.ts`) — the text is a structured draft. Have an attorney review it, or paste in static text exported from Termageddon / iubenda. Do **not** embed their JavaScript widget: the site's CSP would block it and it would break the zero-third-party promise.

## Compliance & performance notes

- **Zero cookies / zero third parties:** no analytics, pixels, CDNs or external fonts. A strict Content-Security-Policy (`next.config.ts`) blocks any third-party script, style, font, or beacon at the browser level. No cookie banner is needed because nothing non-essential is stored. If you ever add analytics or a pixel, a consent banner with prior-consent blocking must be added first.
- **Language:** held in React state only (no cookie/storage). Detected from the browser on first visit; persists across pages via client-side navigation. Spanish content is not separately indexable by search engines yet — a future `/es` route would fix that.
- **The enquiry form is the only data collection.** On the Pricing tab, `src/components/sections/EnquiryForm.tsx` asks for four things: name, business name, phone, and "what do you need?" (a plan picked above pre-fills the last one). A required consent checkbox links the Privacy Policy and Terms. On submit the browser strips control characters and `<>`, length-limits each field, checks the phone (7–15 digits), and POSTs `application/x-www-form-urlencoded` to **`/__forms.html` on the same origin**, adding `form-name=enquiries`, `consent=yes` and a `submitted_on` ISO timestamp. **Netlify Forms** receives it: `public/__forms.html` is the static copy of the form that makes Netlify register `enquiries` at deploy. Nothing leaves the site's own origin (CSP `connect-src` and `form-action` are `'self'`), there is no custom API route, and no third party sees the data. Spam: a hidden honeypot (`bot-field`) plus a 3-second minimum fill time; bots get a fake success and nothing is sent. On failure the visitor sees the error and a `mailto:` fallback. This only works on Netlify: under `npm run dev` / `npm start` the POST fails and the form shows its error state. The Pricing tab also offers a pre-filled `mailto:` link and an optional `tel:` call button, which hand off to the visitor's own apps. If you add analytics, SMS or more fields, update the Privacy Policy and add consent first (a cookie banner with prior-consent blocking for trackers).
- **Accessibility:** WCAG 2.1 AA — audited with axe-core (0 violations on every page and every tab, EN and ES, with motion on and reduced, including the open login modal; re-run after big changes). Keyboard-operable tabs, dialog focus trap, skip link, `prefers-reduced-motion` respected (videos stay paused), pause controls on every looping video.
- **Tabs and 3D:** the page is tabs, one section at a time (`src/context/TabsContext.tsx`): a swap is a crossfade (150ms out, 250ms in) that resets scroll to the top, panels stay mounted so state survives, `/#dashboard`-style links and back/forward work, and a tab opened before replays a quicker entrance. A fixed backdrop (`src/components/three/`) stacks the page ground, a page-wide shader of light threads, the architecture film (pre-rendered light and dark files, cross-faded with the theme), and the WebGL "engine" sculpture (particle formations morph on the GPU). Scroll-driven parts are few: the **Home hero** is a 150vh scene (headline shears apart in 3D, the sculpture dives and settles, then a statement and hand-off to How it works), and the **Dashboard** explodes into 3D layers on a 200vh pinned track, only at **≥1280×840** with motion allowed. Every other tab is unpinned and complete at scroll 0. The Industries tab is a swipeable curved 3D carousel, Compare has 3D flip cards, the Calculator a tilt card, and the Missed calls simulator plays on its own clock with a scrub rail (no scroll-jacking).
- **Performance:** only `transform` and `opacity` are animated. Scroll progress is read from Framer Motion MotionValues (no React re-renders per frame); the engine's render loop stops when none of the stage-backed sections is on screen (plus a short fade-out); three.js loads lazily after first paint (`dynamic`, `ssr: false`); the light-threads shader renders at reduced resolution and is capped at 60 fps (30 on phones). Phones and narrower windows skip pinning but keep the 3D entrances. No frame-rate figure is promised: measure on a real GPU.
- **Motion controls:** a "Pause animations" button (in the footer, reachable from every tab) stops the 3D engine and every looping video (WCAG 2.2.2). Visitors with "reduce motion" get a calm, unpinned layout with no WebGL stage and no translate motion (fades only). Light or dark follows the system setting until the visitor toggles it; the choice is kept in `sessionStorage` for the session only (no cookie, no localStorage).

## Media provenance

Everything in `public/media/` is illustrative and was generated with Higgsfield (Kling 3.0 Pro, silent, 1080p source) for this project, then re-encoded as seamless loops. It does not depict real client businesses (also stated on `/disclaimer`).

- **Architecture film**, the "site being built" backdrop: `architecture-v2.{webm,mp4}` + poster (dark scheme) and `architecture-v2-light.{webm,mp4}` + poster (a pre-rendered light-scheme version, so no per-frame CSS filter is needed).
- **Six niche loops** (`src/data/niches.ts`), each as WebM + MP4 + poster: `barbershop-v3`, `salon-v3`, `beauty-v3`, `restaurant-v3`, `contractor-v3`, `service-v3`.
- **Stills and textures:** `hero-v2-poster.jpg` (reduced-motion stand-in on Home), `og-render-pass-v2.jpg` (social preview image). `grain.png` is currently unreferenced.

The old hero film files were removed; nothing references them. Filenames carry a version: when you replace a file, rename it (see the cache note under Hosting).
