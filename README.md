# SermaWebDesign — Flagship Site (Milestone 1)

Bilingual (EN/ES), cookieless, interactive sales showcase: hero, system architecture, 6-niche Client Dashboard, missed-call → SMS simulator, revenue calculator, comparison matrix, a three-package Pricing tab (prices in `src/data/pricing.ts`) with the enquiry form, and legal pages. **The site collects no personal information** — no forms, no cookies, no trackers.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 3.4 · Framer Motion · Lenis (demo pages) · three.js + React Three Fiber (WebGL) · Lucide · self-hosted fonts via `next/font/local` · Higgsfield-generated motion loops.

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

## Lead CRM (`/admin/`)

A private dashboard for everything people send through the pricing form and the free-mockup pop-up (both post to the Netlify form **enquiries**). It shows every lead with a pipeline stage (New → Contacted → Mockup sent → Won / Lost), private notes, call / text / copy buttons, search, filters and a CSV export. It refreshes itself every minute.

- Page: `src/app/admin/page.tsx` → `src/components/crm/` (same Liquid Glass components and motion tokens as the site). `noindex`, not in the sitemap, `no-store`.
- API: `netlify/functions/crm.ts` at `/api/crm/*`. It reads submissions from the Netlify API and keeps stage + notes in Netlify Blobs (store `crm`). Same origin, so the CSP is unchanged.
- Sign-in: one password. The session is an HttpOnly, Secure, SameSite=Strict cookie scoped to `/api/crm`, valid 12 hours (strictly necessary, admin only: visitors never get it). 10 wrong tries per IP lock sign-in for 15 minutes.

**One-time setup** (Netlify → Site configuration → Environment variables, scope must include **Functions**):

| Variable | Value |
| --- | --- |
| `CRM_PASSWORD` | The password you will type on `/admin/`. Use a long one. |
| `CRM_SESSION_SECRET` | 32+ random characters, e.g. the output of `openssl rand -base64 48`. Changing it signs everyone out. |
| `NETLIFY_API_TOKEN` | A personal access token: Netlify → User settings → Applications → New access token. |

Then redeploy and open `https://<your-domain>/admin/`.

**Local preview:** `npm run dev` and open http://localhost:3000/admin. Without the Netlify function running, any password opens fictional sample leads so the layout can be worked on. `netlify dev` runs the real function locally.

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

**Motion kit** (`src/components/work/motion/`, shared by all six demos)

| Device | What it does |
| --- | --- |
| `SmoothScroll` | Lenis wheel smoothing + anchor links that glide to their section and move focus there. Mounted by `DemoShell`; touch and keyboard stay native. |
| `RevealImage` | Clip-path wipe (from any edge or the centre) while the photo settles from a zoom, then drifts inside its frame. |
| `TextReveal` | Masked word or line entrance for headings; transform only, so text is never semi-transparent. |
| `Parallax` | A depth plane: content travels at its own rate (plus optional x / rotate / scale) for layered heroes and collages. |
| `StickyStory` | Desktop: the photo frame pins while steps scroll past and each step wipes its photo in. Phones: a plain stacked sequence. |
| `HorizontalGallery` | Desktop: the section pins and vertical scroll walks a row of cards sideways. Phones: a native, focusable snap scroller. |
| `ExpandImage` | A framed photo opens to full bleed while pinned, then short overlay copy rises in over a local scrim. |
| `ScrollMarquee` | A row that moves only while the page scrolls (no autoplay, so no pause control needed); optional speed skew for type. |
| `HoverPreview` | Cursor-following photo preview for price lists and menus (mouse / trackpad only, decorative). |
| `Magnetic`, `RollText`, `ScrollProgress` | Primary-button pull, rolling labels, and a hairline progress bar in the sticky header. CSS helpers `demo-zoom` and `demo-underline` live in `globals.css`. |

Rules the kit enforces: only `transform`, `opacity` and `clip-path` are animated; every device reads `useDemoStill()` and renders its final, unpinned state under reduced motion, the Pause switch, or `?capture=1` (so gallery screenshots show the whole page); pinned and hover devices are desktop / fine-pointer only, and only one layout variant is ever in the DOM, so no lazy image waits in a hidden branch.

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

The original demo-site photos in `public/media/work/` (the `*-v1.webp` files listed in each demo's data file without a photographer) are AI-generated (Higgsfield, GPT Image 2.6) for this project and depict no real businesses or clients.

The additional demo photos come from [Unsplash](https://unsplash.com/) (Unsplash License: free to use, no permission needed), downloaded through the Unsplash connector, re-encoded to WebP and self-hosted (the CSP allows no third-party images). Each demo credits its photographers in its footer (`photoCredits` in `src/data/demos/<id>.ts`). They are stock photos of other places and people, used to illustrate fictional businesses.

To add another photo: download it into its own scratch folder, then

```bash
python3 -I scripts/import-photo.py path/to/photo.jpg public/media/work/<id> <name> --crop 4:5 --grade warm
```

which writes `<name>-v1.webp` (long edge 1600) and `<name>-v1-640.webp` and prints the width and height for `demoImage(...)`. `python3 -I scripts/import-photo.py contact sheet.jpg a.jpg b.jpg ...` builds a labelled contact sheet for choosing between candidates.
