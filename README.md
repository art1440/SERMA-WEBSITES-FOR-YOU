# SermaWebDesign — Flagship Site (Milestone 1)

Bilingual (EN/ES), cookieless, interactive sales showcase: hero, system architecture, 6-niche Client Dashboard, missed-call → SMS simulator, revenue calculator, comparison matrix, a three-package Pricing tab (prices in `src/data/pricing.ts`) with the enquiry form, and legal pages. **The site collects no personal information** — no forms, no cookies, no trackers.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 3.4 · Framer Motion · three.js + React Three Fiber (WebGL) · Lucide · self-hosted fonts via `next/font/local` · Higgsfield-generated motion loops.

## Hosting (Netlify)

`netlify.toml` holds everything Netlify needs: build command, output folder (`out/`), Node version, and the full security headers (CSP, HSTS, X-Frame-Options, …).

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

Set in your host (Vercel → Project → Settings → Environment Variables). See `.env.example`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | Recommended | Canonical URL for social previews, e.g. `https://www.sermawebdesign.com`. |

## Before launch — required edits

1. **`src/config/site.ts`** — set `contactEmail` (the email link on the Pricing tab opens an email to it; currently the placeholder `contact@example.com`), optionally `contactPhone` (shows a "Call" button), confirm `legalEntity`, set `governingLaw` (currently `[Your State]`).
2. **Legal pages** (`src/i18n/legal.ts`) — the text is a structured draft. Have an attorney review it, or paste in static text exported from Termageddon / iubenda. Do **not** embed their JavaScript widget: the site's CSP would block it and it would break the zero-third-party promise.

## Compliance & performance notes

- **Zero cookies / zero third parties:** no analytics, pixels, CDNs or external fonts. A strict Content-Security-Policy (`next.config.ts`) blocks any third-party script, style, font, or beacon at the browser level. No cookie banner is needed because nothing non-essential is stored. If you ever add analytics or a pixel, a consent banner with prior-consent blocking must be added first.
- **Language:** held in React state only (no cookie/storage). Detected from the browser on first visit; persists across pages via client-side navigation. Spanish content is not separately indexable by search engines yet — a future `/es` route would fix that.
- **No data collection:** "Book a Live System Demo" opens the visitor's own email app with a pre-filled subject/body (and an optional `tel:` call button). There is no form and no API endpoint. If you later add a form, analytics, or SMS, it needs a consent checkbox, a Privacy Policy update, and (for trackers) a cookie banner with prior-consent blocking — the original TCPA-ready form is in git history (commit `7d208c7`).
- **Accessibility:** WCAG 2.1 AA — audited with axe-core (0 violations on every page and every chapter in view, EN and ES, with motion on and reduced, including the open login modal). Keyboard-operable tabs, dialog focus trap, skip link, `prefers-reduced-motion` respected (videos stay paused), pause controls on every looping video.
- **Scroll-driven 3D ("chapters"):** the page is a sequence of pinned chapters — each locks in place while scroll drives its animation, then releases. A fixed WebGL stage (`src/components/three/`) renders the "engine" sculpture (particle formations morph on the GPU), the Higgsfield hero film the camera dives into, and the architecture film. Chapters: Hero (headline shears apart in 3D) → System (4 particle formations) → Industries (swipeable curved 3D carousel) → Dashboard (rises, explodes into 3D layers, cycles 6 industries) → Simulator (scroll scrubs the missed-call story; scroll back to rewind) → Calculator (3D tilt card) → Compare (3D flip cards) → Finale (engine returns).
- **60 fps:** only `transform` and `opacity` are animated. Scroll progress is read from Framer Motion MotionValues (no React re-renders per frame); the WebGL loop stops whenever no 3D chapter is on screen; three.js (≈240 KB gz) loads lazily after first paint. Heavy UI chapters pin only on desktop (≥1024px); phones get the same 3D entrances without pinning, plus tap-to-play on the simulator.
- **Motion controls:** a "Pause animations" button (in the footer, reachable from every tab) stops the 3D engine and every looping video (WCAG 2.2.2). Visitors with "reduce motion" get a calm, unpinned layout with no WebGL.

## Demo sites

Six fictional client websites live under `/work/`, shown in the home page's **Our work** section (`#work`, between How It Works and Industries) and linked from the nav:

| Route | Business | Signature move |
| --- | --- | --- |
| `/work/barbershop/` | Ironside Barber Co. | `RazorCutHero` |
| `/work/salon/` | Maison Lumière | `ColourRibbon` |
| `/work/beauty/` | Velvet Room | `MaskWindows` |
| `/work/restaurant/` | Ember & Oak | `MenuPlating` |
| `/work/contractor/` | Trueframe Builders | `BlueprintHero` |
| `/work/service/` | Brightline Home | `BeforeAfterSlider` |

Every demo is `noindex, nofollow` and is left out of `sitemap.xml`; `robots.txt` is unchanged. `?lang=es` opens a demo in Spanish.

**How they are built**

- `src/app/work/<id>/page.tsx` — the route: its fonts (`src/app/work/fonts.ts`, self-hosted, OFL licences beside the files), metadata (`demo-metadata.ts`) and the page wrapped in `DemoShell`.
- `src/components/work/DemoShell.tsx` — shared chrome: the "Demo site by Serma" ribbon with the EN/ES switch and the "Back to Serma" link (to `/#work` or `/es/#work`), and the booking sheet every `[data-book]` button opens (`DemoBookingSheet.tsx`: it explains this is a demo and offers a free mockup). `?capture=1` hides the ribbon for screenshots.
- `src/components/work/demos/<Name>Demo.tsx` — each page's layout. All user-facing copy (EN + formal-*usted* ES) and image records live in `src/data/demos/<id>.ts`; `src/data/demos/index.ts` holds the gallery records (business, tag, accent, shot paths and heights).
- `src/components/work/signatures/` — one bespoke scroll/drag interaction per demo (table above). Each marks itself with `data-signature="<id>"` and `data-state` (`rest` when settled; reduced motion always shows the rest state).
- The gallery itself is `src/components/sections/work/` (`WorkGallery`, `WorkCard`, `WorkPreview`).

**Re-capturing the gallery screenshots**

```bash
npm run build
npm run capture:work -- --version v2            # desktop (1280×800, + 640 px copies) and mobile (390×844 @2x) shots, EN + ES
npm run capture:work -- --version v2 --only mobile   # or --only desktop: one set
npm run capture:work -- --version v1 --overwrite     # only for a version that has never been deployed
```

Needs `python3` with Pillow (for the 640 px copies). `/media` is served immutable for a year, so **never overwrite a deployed version**: capture a new one (`--version v2`), then point the shot paths in `src/data/demos/index.ts` at the same version and update its `SHOT_HEIGHT` table from the new files.

Image provenance: see [Media provenance](#media-provenance) below.

**Verify suite** (`scripts/verify-work.mjs`; needs a prior `npm run build` and a global Playwright; it starts `next start` on port 3123, and every check also fails on any console error, page error or CSP violation):

```bash
npm run verify:work <check...>
```

Checks: `home-smoke`, `home-wiring` (nav link and tab, section order, Spanish label and shots), `sitemap-clean`, `home-axe-full` (whole home page scrolled through, EN + ES, light + dark, no axe rule disabled), `gallery-desktop`, `gallery-reduced`, `gallery-phone`, `gallery-phone-paused`, `demo:barbershop`, `demo:salon`, `demo:beauty`, `demo:restaurant`, `demo:contractor`, `demo:service`, `shell-lang`, `shell-booking`, `shell-capture`, `shell-noindex`. Full run:

```bash
npm run typecheck && npm run build && npm run verify:work home-smoke home-wiring sitemap-clean home-axe-full \
  shell-lang shell-booking shell-capture shell-noindex demo:barbershop demo:salon demo:beauty demo:restaurant \
  demo:contractor demo:service gallery-desktop gallery-reduced gallery-phone gallery-phone-paused
```

## Media provenance

All video loops in `public/media/` were generated with Higgsfield (Kling 3.0 Pro, silent, 1080p source) for this project, then re-encoded as seamless WebM + MP4 loops with posters (~7 MB total). They are illustrative renderings; they do not depict real client businesses (also stated on `/disclaimer`).

The demo-site photos in `public/media/work/` are AI-generated (Higgsfield, GPT Image 2.6) for this project and depict no real businesses or clients.
