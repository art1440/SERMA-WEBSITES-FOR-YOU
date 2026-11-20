# Demo sites + "Our work" gallery — design

Date: 2026-11-20 · Status: awaiting owner sign-off

## Intent

Serma sells websites to local business owners. Right now the flagship page shows the *system* (dashboard, simulator, calculator) but never shows a *website* Serma would build. Competitors like lvlgruppen.com prove the pattern: a gallery of demo sites, one per trade, each a real page a prospect can open. Serma has no demo sites yet, so we build them from scratch, then show them off in a new "Our work" section.

Success: a barber, salon owner, restaurant owner, beauty studio owner, contractor or home-service owner lands on the Serma site, finds a site built for their kind of business within one glance, opens it, and thinks "I want that, for me." Then they click through to pricing / the enquiry.

## Goals

- Six demo homepages, one per existing niche in `src/data/niches.ts`: barbershop, salon, beauty, restaurant, contractor, service (home service).
- Each one looks deliberately different from the others: own type pairing, palette, layout rhythm, and **one signature motion moment**.
- A new "Our work" section on the home page: live grid on desktop/tablet, compact swipe row on phones.
- Every demo pushes back to Serma: a slim ribbon and demo-booking sheet that lead to the enquiry.

## Non-goals

- Inner pages (Services, About, Contact) for the demos. Can be added later for the best-selling niches.
- Real booking, forms or data capture on demo pages.
- Subdomains (`barbershop.serma…`). Routes now; DNS can point at them later.
- Changing the existing industries carousel, dashboard or pricing sections.

## Anti-goals (failure even if it "works")

- **Template look.** If two demos read as the same layout reskinned, the "custom design" pitch is dead. Each needs a different structure, not only different colours.
- **Scroll-jacking the gallery.** No pinned section. On phones the gallery must cost about one card of vertical scroll — the owner explicitly does not want people scrolling past all six sites to reach pricing.
- **Breaking the zero-third-party promise.** No iframes, CDNs, external fonts or images. CSP stays exactly as it is.
- **Passing fictional businesses off as clients.** Every demo is labelled as a demo; `/disclaimer` says the businesses are fictional.
- **Slow demos.** A slow demo page is an argument against hiring Serma. Target LCP < 2.5 s on mid phones, transform/opacity-only animation.

## Constraints

- Stack: Next.js 16 App Router, React 19, Tailwind 3.4, Framer Motion 14, static export for Netlify (`STATIC_EXPORT=true`, `trailingSlash: true`, optional `basePath` → use `asset()` for every media URL).
- CSP: `img-src 'self' data: blob:`, `font-src 'self'`, `frame-ancestors 'none'`, `X-Frame-Options: DENY`. All assets self-hosted.
- Bilingual EN/ES via `LanguageContext` + `src/i18n/dictionary.ts`; copy types use `L10n` (`{ en, es }`).
- Motion rules from `docs/design-system.md`: transform/opacity only (sanctioned exceptions for the signature moments only: `clip-path` reveals, SVG `stroke-dashoffset` line drawing and a CSS-variable accent swap, each on a single bounded element, checked in a performance trace), respect `useReducedMotionSafe` and the global Pause (`MotionPauseContext`), no backdrop blur inside 3D transforms.
- `/media/*` is cached immutable for a year: never overwrite a file, version the name (`-v1`, `-v2`).

## Approaches considered

**Demo depth** — (1) one polished homepage per niche, (2) a 4-page site per niche, (3) one shared template with per-niche skins. **Picked 1**: effort goes where prospects actually look; 2 is ~3× the work for pages few people open; 3 undermines the custom-design pitch.

**Images** — (1) generated with Higgsfield, (2) free stock, self-hosted, (3) typographic/illustrated only. **Picked 1**, 18–25 images, used selectively (several heroes are type-led), each approved by the owner.

**Where the showcase lives** — (1) merge into the industries carousel, (2) a separate "Our work" section. **Owner picked 2.**

**Gallery presentation** — prototyped three: A pinned film strip, B stacked deck, C live grid with expand (prototype: https://claude.ai/artifact/QzoC98gQV52rAhRFw3uAH4). **Owner picked C**, with the requirement that phones don't scroll through every site.

## Decided design

### 1. Demo data — `src/data/demos.ts`

One record per niche, keyed by `NicheId` so demos and the dashboard stay linked:

- `id: NicheId`, `slug` (same as id), `business` (fictional name), `pitchDomain` (shown in the browser frame, e.g. `ironsidebarber.com`), `tag: L10n`
- theme: palette tokens, display + body font, layout variant
- copy (all `L10n`): hero headline/sub, services/menu items with prices, gallery captions, 2–3 reviews, hours, address (fictional), CTA labels
- media: approved generated images (0–1 hero, plus section images per the table in §3), gallery screenshot paths
- `signature`: which signature-motion component the page uses

Working cast (names/copy can be refined during build):

| Niche | Business | Look | Signature motion |
|---|---|---|---|
| barbershop | Ironside Barber Co. | black, brass, heavy grotesk | Hero headline is cut by a straight-razor line on scroll; the two halves slide apart to reveal the services below |
| salon | Maison Lumière | blush/plum, high-contrast serif | Colour-swatch ribbon: scrolling sweeps a ribbon of hair-colour swatches across the hero, each one recolouring the accent |
| beauty | Velvet Room | deep sage, soft serif, lots of air | Treatments revealed through rounded mask "windows" that open as they enter (clip-path, no blur) |
| restaurant | Ember & Oak | ember red/ochre, editorial serif | Menu "plates in": dishes and prices set onto the page like courses, staggered, with a slight drop and settle |
| contractor | Trueframe Builders | blueprint blue + safety orange, condensed sans | Blueprint linework draws itself (SVG stroke), then the finished-build photo wipes in over it |
| service | Brightline Home | clean teal/yellow, friendly sans | Before/after drag slider on a repair photo (finger-tracked, interruptible), plus a "tech on the way" ETA strip |

Each page section order is the demo's own (not one shared order), but every page includes: hero, services/menu with prices, gallery, reviews, hours/location, booking CTA, footer.

### 2. Demo routes — `src/app/work/[niche]/page.tsx`

- `generateStaticParams` → six static pages, works with static export.
- Each page renders **only** the demo (no Serma navbar, Stage or 3D). Per-demo fonts load only on that route (`next/font` self-hosted output; see builder calls).
- **Serma ribbon** at the top: "Demo site by Serma · Want one like this?" → `/#pricing`, plus EN/ES toggle and "Back to Serma". Slim, dismissible, never covers the hero headline.
- **Booking buttons** ("Book now", "Reserve", "Get a quote") open a small sheet: "This is a demo. Get this site for your business" → opens Serma's existing free-mockup dialog (`MockupProvider`, already mounted in the root layout), with the niche passed in if it accepts one. The ribbon's "Want one like this?" opens the same dialog. No data is captured on the demo itself. *(Builder call: the mockup dialog is the site's real conversion path.)*
- Navigation: "Visit the full demo" opens **in the same tab** via next/link, so language state carries over. Demo routes also read `?lang=es` so shared/direct links can open in Spanish; the EN/ES toggle updates it. "Back to Serma" goes to `/#work` (or `/es#work` when Spanish). *(Builder call.)*
- Demos stay under the existing root layout (a separate root layout would force a full reload and drop language state). No `/es/work/*` routes.
- `robots: noindex` on demo routes and left out of `sitemap.ts` (they're fictional businesses).
- `/disclaimer` (EN + ES in `src/i18n/legal.ts`) gets a line: demo sites depict fictional businesses; images are AI-generated.

### 3. Images

**Owner's rules:** no existing niche videos or pictures in the demo heroes; use pictures only where they earn their place (like lvlgruppen, some demos are type-led with no hero photo); **18–25 well-made images in total**; **the owner approves every image before it is built into a demo.**

Where pictures go (and where they don't):

| Demo | Hero | Pictures | Count |
|---|---|---|---|
| Ironside Barber Co. | **Type-led.** Huge headline, razor-cut motion, no photo | Gallery: fade close-up, straight-razor line-up; shop interior | 3 |
| Maison Lumière | **Photo-led.** Editorial colour-work portrait (hair is the product) | Gallery: 1 colour result; salon interior | 3 |
| Velvet Room | **Type + soft shape.** No photo; calm typography on sage | The mask windows: 3 treatment close-ups (lashes, brows, skin) | 3 |
| Ember & Oak | **Photo-led.** Wood-fire dish, dark and warm (food sells on photos) | Menu highlights: 2 dishes; dining room | 4 |
| Trueframe Builders | **Linework-led.** Blueprint drawing, then one finished-build photo wipes in | Projects: 2 completed jobs (addition, deck); the kitchen is the hero wipe | 3 |
| Brightline Home | **Type-led.** Big promise + ETA strip, no photo | Before/after pair for the slider | 2 |
| **Total** | | | **18** |

- Generated with Higgsfield GPT Image 2.6 (low quality tier, 1k, 0.25 credits each) to fit the owner's 5-credit balance: 18 images = 4.5 credits, leaving 0.5 for two re-dos. Originals are kept outside the repo until approved.
- **Approval gate:** images are generated per niche and shown to the owner as a contact sheet. Only approved images go into the demos. Rejected ones are re-generated from the owner's notes. Demo layouts may be built in parallel with neutral placeholders, which are swapped for approved images only.
- Art direction per demo palette, no text in images, no recognisable real brands or people.
- Store under `public/media/work/<niche>/<name>-v1.webp` (+ sensible widths), alt text in `L10n`.
- Add provenance to the README "Media provenance" section.

### 4. Gallery screenshots

- `scripts/capture-work.mjs`: starts from a running build (`next start` or serving `out/`), opens each `/work/<niche>` with Playwright at 1280×800, scrolls through to trigger in-view animations, waits for them to settle, captures full-page with the ribbon hidden (`?capture=1` hides it). Captures **both languages** (`?lang=es`), output `public/media/work/<niche>/shot-en-v1.jpg` and `shot-es-v1.jpg` (≈ 1280 wide, quality ~80) plus 640-wide versions; the gallery picks the shot for the current locale. *(Builder call: automated, so the cost is small and Spanish visitors see Spanish demos.)*
- Run manually after demo changes and commit the images (`npm run capture:work`). Netlify does not run it.

### 5. "Our work" section — `src/components/sections/WorkGallery.tsx`

- Added to `TAB_IDS` as `"work"` after `"included"` (before `"industries"`), rendered in `src/app/page.tsx` (and `/es`), with a navbar link "Our work" / "Nuestro trabajo" and dictionary entries in both languages.
- Opaque dark section per design system: `AmbientField` background, `SectionChip` + `RevealLines` heading, short body line.

**Desktop / tablet (≥ 768px):** 3×2 grid (2×3 at tablet). Each card = browser frame (chrome dots + pitch domain) over a viewport showing the screenshot at the top, with business name and niche tag below.
- Hover or keyboard focus: the screenshot translates up through the full page at constant speed (~ page height / 6–8 s), returns with an ease on leave. Pointer tilt up to ~7°/9° that follows the cursor, springs back on leave. Mouse only.
- Click / Enter / Space: the frame **grows from its own grid position** into a large dialog preview (Framer Motion shared `layoutId`), backdrop dims, preview is scrollable through the full screenshot, with **"Visit the full demo →"** (link to `/work/<niche>`) and Close. Esc, Close or backdrop click shrinks it back into its slot; focus returns to the card. Dialog: `role="dialog"`, `aria-modal`, focus trap (follow the `MockupModal` pattern).

**Phones (< 768px):** single horizontal row, `scroll-snap-type: x mandatory`, cards ~80% viewport width so the next one peeks, page-dot indicator underneath (tappable). The whole section is about one card tall plus heading. The snapped card's screenshot auto-scrolls slowly while it's on screen (IntersectionObserver + snapped index), others rest at the top. Tap opens the same preview, full-screen.

**Reduced motion / Pause:** no auto-scroll, no tilt; the expand becomes a fade; screenshots rest at the top and the preview is user-scrolled.

### 6. Copy & honesty

- Section copy direction: "Sites we'd build for you" style. Name it plainly; each card labelled as a demo ("Demo · Barbershop").
- No invented results or performance numbers on demo pages beyond obviously fictional review quotes.

## Verification

- `npm run typecheck`, `npm run build` and `STATIC_EXPORT=true npm run build` succeed; `/work/<niche>/` pages exist in `out/`.
- Playwright pass: each demo route renders with no console errors and no CSP violations; gallery grid hover/expand/close works on desktop; phone viewport shows a single swipe row (section height ≤ ~1.3× viewport width + heading) and tap-to-preview works.
- axe-core: 0 violations on home (gallery in view, preview open) and on each demo route, EN and ES, motion on and reduced.
- Screenshots of each demo, desktop and phone, reviewed for "no two look alike".

## Left to the builder

- Exact fonts per demo (from Google Fonts via `next/font/google`, which self-hosts at build; fall back to committed woff2 via `next/font/local` if the build environment can't reach Google), exact palettes, final names and copy within the table's direction.
- Internal component structure of each demo, as long as signature motions live in their own components.
- Screenshot widths/quality, exact hover scroll speed, tilt amounts, spring settings (use `src/lib/motion.ts` tokens).
- Whether the booking sheet pre-selects the niche in the enquiry form (do it if `EnquiryForm` already accepts a prefill).

## As built

- Salon display face is **Bodoni Moda**, not Cormorant: Cormorant's "è" (in "Maison Lumière") was unreadable at display sizes.
- **18** demo images were generated and shipped (not 23).
- The phone gallery preview uses phone-size screenshots (390×844 @2x, `shot-<locale>-mobile-v1.jpg`), not the desktop capture scaled down.
- The contractor is **Trueframe Builders**.
- The section index is "(02)"; the later sections shift by one. The nav tab bar sits in the capsule from 1280px and in the rail below it under 1280px (eight tabs do not fit the capsule at 1024).
