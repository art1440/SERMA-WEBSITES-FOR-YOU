# Demo Sites + "Our work" Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build six one-page demo websites (one per niche) at `/work/<niche>` and a new "Our work" section on the home page that previews them: a live grid on desktop, a single swipe row on phones.

**Architecture:** Each demo is its own static route rendering a self-contained component tree inside a shared `DemoShell` (Serma ribbon, booking sheet, language/capture query handling). The home-page gallery shows pre-captured full-page screenshots of each demo (Playwright script, committed), never iframes. All motion is Framer Motion on transform/opacity, with the three sanctioned exceptions named in the spec.

**Tech Stack:** Next.js 16 App Router (static export), React 19, Tailwind 3.4, Framer Motion 14, `next/font/local`, Playwright (pre-installed in the environment, global `require('playwright')`), axe-core.

**Spec:** `docs/superpowers/specs/2026-11-20-demo-sites-and-work-gallery-design.md`

## Global Constraints

- CSP unchanged: `img-src 'self' data: blob:`, `font-src 'self'`, no frames. Every asset self-hosted; every media URL goes through `asset()` from `src/lib/asset.ts`.
- `/media/*` is cached immutable: never overwrite a file; new versions get a new suffix (`-v2`).
- Motion: transform/opacity only, except `clip-path` reveals (beauty), SVG `stroke-dashoffset` (contractor) and a CSS-variable accent swap (salon), each on one bounded element.
- Every animated component respects `useReducedMotionSafe()` and `useMotionPause().paused`: when either is true, render the final state with no auto-motion.
- Copy is bilingual: every user-facing string is `L10n` (`{ en, es }`) or lives in `src/i18n/dictionary.ts` (both `en` and `es` objects; `es` is type-checked against `en`). Spanish uses formal "usted".
- Fictional data only: phone numbers in the `(555) 01XX` range, made-up street addresses, review names first name + initial.
- Demo routes: `robots: { index: false, follow: false }`, absent from `src/app/sitemap.ts`.
- No new runtime dependencies. Dev dependency allowed: `axe-core`.
- Business names (final): Ironside Barber Co. · Maison Lumière · Velvet Room · Ember & Oak · Trueframe Builders · Brightline Home. Pitch domains: `ironsidebarber.com`, `maisonlumiere.com`, `velvetroomstudio.com`, `emberandoak.com`, `trueframebuilders.com`, `brightlinehome.com`.
- Phones (< 768px): the "Our work" section must not stack the six demos vertically.

## Review Focus

1. A shared demo link opened directly (`/work/salon/?lang=es`) must render Spanish, and the EN/ES toggle must keep the URL's `lang` in sync. Test in Task 4.
2. Mouse leaving a card mid hover-scroll, or a click while it scrolls, must ease back / expand from the current position without a jump. Test in Task 12.
3. Closing the preview by Esc, backdrop or Close must return focus to the card that opened it, and Tab must not escape the open preview. Test in Task 12.
4. On a phone, a horizontal swipe on the row must not open the preview; only a tap does. The section must be ≤ 1.4 × the viewport width tall, excluding the heading. Test in Task 13.
5. With Pause on, or reduced motion, no card auto-scrolls, no demo signature animates, and every demo's content is fully visible at rest. Test in Task 4 (shell), each demo task (5–10), and Task 13.

---

## File Structure

```
scripts/
  verify-work.mjs              # Playwright check runner (starts `next start`, runs named checks)
  capture-work.mjs             # Full-page screenshots of each demo, EN + ES
src/app/work/
  fonts.ts                     # localFont exports for the six demos (preload: false)
  fonts/*.woff2 + OFL.txt      # self-hosted demo fonts
  demo-metadata.ts             # demoMetadata(id) → Metadata (noindex, title)
  barbershop/page.tsx … service/page.tsx   # six tiny static routes
src/data/demos/
  types.ts                     # DemoId, DemoCard, DemoContent
  index.ts                     # DEMOS: DemoCard[] (gallery-facing)
  barbershop.ts … service.ts   # per-demo copy + image refs
src/components/work/
  DemoShell.tsx                # ribbon, booking sheet, ?lang / ?capture, DemoBookingContext
  DemoBookingSheet.tsx
  demos/<Name>Demo.tsx         # one per niche
  signatures/RazorCutHero.tsx, ColourRibbon.tsx, MaskWindows.tsx,
             MenuPlating.tsx, BlueprintHero.tsx, BeforeAfterSlider.tsx
src/components/sections/work/
  WorkGallery.tsx              # the home-page section
  WorkCard.tsx                 # browser frame, hover-scroll, tilt
  WorkPreview.tsx              # expanded dialog (shared layoutId)
src/lib/useFocusTrap.ts
public/media/work/<niche>/*.webp, shot-*.jpg
```

---

### Task 1: Verification harness

**Files:**
- Create: `scripts/verify-work.mjs`
- Modify: `package.json` (scripts + devDependency `axe-core`)

**Interfaces:**
- Produces: `node scripts/verify-work.mjs <check…>`. Starts `npx next start -p 3123` from the existing `.next` build, waits for HTTP 200 on `/`, runs each named check, prints `PASS <name>` / `FAIL <name>: <reason>`, kills the server, exits 1 on any failure. Checks are registered in a `CHECKS` object `{ [name]: async ({ browser, base }) => void }` that throws on failure. Helpers exported inside the file: `openPage(browser, url, { width=1280, height=800, reducedMotion=false })` returning `{ page, errors }` where `errors` collects console errors, page errors and CSP violations (`securitypolicyviolation` listener via `addInitScript`); `runAxe(page)` injecting `node_modules/axe-core/axe.min.js` and throwing on any violation.
- npm scripts: `"verify:work": "node scripts/verify-work.mjs"`.

- [ ] **Step 1:** `npm install` then `npm install -D axe-core@4.10.3`.
- [ ] **Step 2:** Write `scripts/verify-work.mjs` with one check `home-smoke`: opens `/`, asserts `errors.length === 0` and `runAxe` passes.
- [ ] **Step 3:** Run `npm run build && npm run verify:work home-smoke`. Expected: `PASS home-smoke` (the home page already passes axe per README). If it fails on a pre-existing issue, record it in the commit message and exclude that rule only for `home-smoke`.
- [ ] **Step 4:** Commit `chore: Playwright + axe verification harness for demo work`.

---

### Task 2: Approved images, fonts, provenance, disclaimer

**Files:**
- Create: `public/media/work/<niche>/<name>-v1.webp` and `<name>-v1-640.webp` (36 files)
- Create: `src/app/work/fonts/*.woff2`, `src/app/work/fonts/OFL.txt`, `src/app/work/fonts.ts`
- Modify: `README.md` (Media provenance), `src/i18n/legal.ts` (disclaimer EN + ES)

**Interfaces:**
- Produces image paths (all under `/media/work/`):
  - barbershop: `fade`, `razor`, `interior` · salon: `hero`, `colour`, `interior` · beauty: `lashes`, `brows`, `facial` · restaurant: `hero`, `flatbread`, `steak`, `room` · contractor: `kitchen`, `addition`, `deck` · service: `before`, `after`
- Produces from `src/app/work/fonts.ts`: `barberDisplay` (Archivo Black), `barberBody` (Archivo), `salonDisplay` (Cormorant Garamond 500/600 + italic), `salonBody` (Jost), `beautyDisplay` (Fraunces, variable opsz/SOFT), `beautyBody` (Karla), `restaurantDisplay` (Young Serif), `restaurantBody` (Instrument Sans), `contractorDisplay` (Barlow Condensed 600/800), `contractorBody` (Barlow 400/500), `serviceDisplay` (Bricolage Grotesque variable), `serviceBody` (Figtree). Each `localFont({ …, variable: "--demo-display" | "--demo-body", display: "swap", preload: false, fallback: [...] })`, latin subset only.

- [ ] **Step 1:** Approved originals: `/tmp/claude-0/-home-user-SERMA-WEBSITES-FOR-YOU/fb520f37-4bd6-599c-a255-bfc9dc433c88/scratchpad/imgs/NN-<niche>-<name>.webp` (00 restaurant-hero, 01 barber-fade, 02 barber-razor, 03 barber-interior, 04 salon-hero, 05 salon-colour, 06 salon-interior, 07 beauty-lashes, 08 beauty-brows, 09 beauty-facial, 10 restaurant-flatbread, 11 restaurant-steak, 12 restaurant-room, 13 contractor-kitchen, 14 contractor-addition, 15 contractor-deck, 16 service-before, 17 service-after). Convert each with Pillow: full size at WebP q82 → `-v1.webp`; 640 px wide at q78 → `-v1-640.webp`. Expected: every `-v1.webp` ≤ 260 KB.
- [ ] **Step 2:** Download each font's latin woff2 from `https://fonts.googleapis.com/css2?family=…` (request with a modern Chrome User-Agent to get woff2, keep only the `/* latin */` block's file), save as `<Family>-latin.woff2`. Add one `OFL.txt` noting the families (all SIL OFL 1.1).
- [ ] **Step 3:** Write `src/app/work/fonts.ts` with the exports above.
- [ ] **Step 4:** README "Media provenance": add a paragraph: demo-site photos in `public/media/work/` are AI-generated (Higgsfield, GPT Image 2.6) for this project and depict no real businesses or clients.
- [ ] **Step 5:** `src/i18n/legal.ts` disclaimer section 1, EN and ES: append a paragraph. EN: "The demo websites under /work (Ironside Barber Co., Maison Lumière, Velvet Room, Ember & Oak, Trueframe Builders and Brightline Home) are examples of our design work for fictional businesses. Their names, addresses, phone numbers, prices and reviews are invented, and their photos are AI-generated." ES equivalent in formal register.
- [ ] **Step 6:** `npm run typecheck`. Expected: no errors. Commit `feat(work): approved demo images, self-hosted demo fonts, provenance + disclaimer`.

---

### Task 3: Demo data model

**Files:**
- Create: `src/data/demos/types.ts`, `src/data/demos/index.ts`

**Interfaces:**
- Produces:
```ts
export type DemoId = NicheId; // from src/data/niches.ts
export type DemoImage = { src: string; small: string; alt: L10n; width: number; height: number };
export type DemoCard = {
  id: DemoId; business: string; pitchDomain: string; tag: L10n;
  href: `/work/${DemoId}/`;
  shots: Record<Locale, { full: string; small: string }>; // /media/work/<id>/shot-<locale>-v1(.jpg|-640.jpg)
  accent: string; // hex, used for the card's hover glow
};
export type DemoContent = {
  id: DemoId; business: string; phone: string; address: string;
  hours: { days: L10n; time: string }[];
  reviews: { quote: L10n; name: string }[];
};
export const DEMOS: DemoCard[]; // order: barbershop, salon, beauty, restaurant, contractor, service
export function demoImage(id: DemoId, name: string, alt: L10n, width: number, height: number): DemoImage; // builds asset() paths
```

- [ ] **Step 1:** Write both files. Type the list as `DEMOS: DemoCard[]` built from a `Record<DemoId, Omit<DemoCard, "id" | "href" | "shots">>` so a missing or extra niche is a type error (pure data; the type system is the test).
- [ ] **Step 2:** `npm run typecheck`. Expected: pass. Commit `feat(work): demo data types and gallery records`.

---

### Task 4: DemoShell (ribbon, booking sheet, language + capture query)

**Files:**
- Create: `src/lib/useFocusTrap.ts`, `src/components/work/DemoShell.tsx`, `src/components/work/DemoBookingSheet.tsx`, `src/app/work/demo-metadata.ts`
- Modify: `src/i18n/dictionary.ts` (new `work.demo` block, EN + ES)

**Interfaces:**
- Consumes: `DemoId`, `DEMOS` (Task 3), `useMockup()`, `useLanguage()`, `useMotionPause()`, `useReducedMotionSafe()`.
- Produces:
  - `useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape: () => void): void`. Traps Tab/Shift+Tab inside `ref`, focuses `[data-autofocus]` or the first focusable on activate, calls `onEscape` on Esc, restores focus to the previously focused element on deactivate.
  - `<DemoShell id={DemoId} className?: string>{children}</DemoShell>`: renders `<div data-demo={id}>` with the ribbon, then `children` in `<main id="main">`. Reads `?lang=es|en` on mount (`window.location.search`) and calls `setLocale`; the ribbon's EN/ES toggle calls `setLocale` and `history.replaceState` to update `lang`. `?capture=1` hides the ribbon (`data-capture` attribute on root).
  - `useDemoBooking(): { openBooking: () => void }` via `DemoBookingContext`.
  - `demoMetadata(id: DemoId): Metadata` → `{ title: \`${business} (demo)\`, robots: { index: false, follow: false } }`.
- Ribbon copy (dictionary `work.demo`): EN `label: "Demo site by Serma"`, `cta: "Want one like this?"`, `back: "Back to Serma"`; ES `"Sitio de demostración por Serma"`, `"¿Quiere uno así?"`, `"Volver a Serma"`. Ribbon: fixed top, 40 px tall, Serma ink background + aqua CTA, `back` links to `/#work` or `/es/#work` by locale, `cta` calls `openMockup()`. Dismiss button (×) hides it for the session (state only).
- Booking sheet copy: EN title "This is a demo", body "Booking is switched off on demo sites. Want this site, built for your business?", button "Get your free mockup" (calls `openMockup()` after closing the sheet), "Keep looking". ES formal equivalents. Sheet is a bottom sheet on phones, centred card ≥ 768px, `role="dialog" aria-modal="true"`, uses `useFocusTrap`.

- [ ] **Step 1:** Add checks to `verify-work.mjs` (they run in Task 5): `shell-lang` opens `/work/barbershop/?lang=es`, asserts the ribbon text is "Sitio de demostración por Serma" and `document.documentElement.lang === "es"`; clicks the EN toggle, asserts URL contains `lang=en` and ribbon reads "Demo site by Serma". `shell-booking` clicks the first `[data-book]` button, asserts a dialog named "This is a demo" is visible and focused within, presses Tab 10× and asserts `document.activeElement` is still inside the dialog, presses Esc and asserts focus is back on the `[data-book]` button. `shell-capture` opens `?capture=1` and asserts the ribbon is not visible. `shell-noindex` asserts `<meta name="robots" content="noindex, nofollow">`.
- [ ] **Step 2:** Implement `useFocusTrap`, `DemoShell`, `DemoBookingSheet`, `demoMetadata`, dictionary entries.
- [ ] **Step 3:** `npm run typecheck`. Expected: pass. Commit `feat(work): demo shell with Serma ribbon, booking sheet, ?lang and ?capture`.

---

### Tasks 5–10: The six demos

Each demo task follows the same shape. **Files:** `src/data/demos/<id>.ts` (content), `src/components/work/signatures/<Signature>.tsx`, `src/components/work/demos/<Name>Demo.tsx`, `src/app/work/<id>/page.tsx` (`export const metadata = demoMetadata("<id>")`; renders `<DemoShell id="<id>"><NameDemo /></DemoShell>`, applying the demo's two font `.variable` classes on the shell root).

**Every demo page must have:** one `<h1>` containing the business name or the hero headline (business name then appears in the nav); services/menu with prices; gallery or project images (where the spec's §3 table assigns them); 2–3 reviews; hours + address + `(555) 01XX` phone; at least two `[data-book]` CTAs wired to `openBooking()`; footer with a small "Demo design by Serma" link to `/`. Layout must work from 360 px to 1600 px; images use `<img srcSet="<small> 640w, <src> <width>w" sizes=…>` with explicit `width`/`height`, hero image `fetchPriority="high"`, others `loading="lazy"`.

**Per-demo check** added to `verify-work.mjs` as `demo:<id>`: for widths 1280 and 390, open `/work/<id>/`; `errors` empty; exactly one `h1`; ≥ 2 `[data-book]`; `[data-signature="<id>"]` exists; scroll to bottom in 400 px steps with 150 ms waits, then every `img` has `naturalWidth > 0`; `runAxe` passes. Then with `reducedMotion: "reduce"`: open at 1280, no scrolling, assert `[data-signature]` final-state marker `data-state="rest"` is set and all text inside `main` has computed opacity 1 (check `main *:not(:empty)` elements with direct text).

Step pattern for each: **1** add `demo:<id>` check → **2** run `npm run build && npm run verify:work demo:<id>` → expect FAIL (404) → **3** implement content, signature, demo, route → **4** run again → expect PASS (Task 5 also runs `shell-lang shell-booking shell-capture shell-noindex` → PASS) → **5** take one 1280 and one 390 screenshot into the scratchpad and look at them against the "no template look" anti-goal → **6** commit `feat(work): <business> demo`.

Signature components all take no required props beyond content, expose `data-signature="<id>"` and set `data-state="rest"` when reduced motion or paused (and after their animation completes).

### Task 5: Ironside Barber Co. (`barbershop`)
- Look: background `#0E0E0E`, text `#EFE6D6`, brass `#C9A45C`; fonts `barberDisplay`/`barberBody`. Text-led hero, no photo.
- `RazorCutHero`: full-viewport-height hero (min 560 px), headline EN "Sharp cuts. / No waiting." ES "Cortes precisos. / Sin esperas." in Archivo Black at `clamp(64px, 13vw, 200px)`. On page load a 2 px brass line draws across the headline at −6° (`scaleX` 0→1, 0.7 s, `EASE_EDITORIAL`). Then scroll-linked (`useScroll` on the hero, offset `["start start", "end start"]`): the headline is two copies clipped to the top/bottom of the cut (static `clip-path: polygon` on each copy, not animated); progress 0→0.6 moves the top copy `x: 0→-4%`, `y: 0→-18%` and the bottom copy `x: 0→4%`, `y: 0→18%`, opacity of both 1→0.25 at 0.6. Reduced/paused: line fully drawn, halves at rest offset 0.
- Sections (in order): hero → services price list (Classic cut $35, Skin fade $40, Beard line-up $25, Hot-towel shave $45, Cut + beard $60) as a two-column menu with dotted leaders → image strip (fade, razor) side by side with captions → "The shop" (interior, full-bleed, hours overlaid) → reviews → book band → footer. Address "1408 Calder Ave", phone "(555) 0142".

### Task 6: Maison Lumière (`salon`)
- Look: `#F6E9EA` / `#3B1F2B`, plum `#9B4A6B`; `salonDisplay`/`salonBody`. Photo-led hero (`salon/hero`) on the right ≥ 1024px, top on phones; headline "Colour that turns heads." / "Color que hace voltear miradas."
- `ColourRibbon`: a horizontal band of 6 swatches (Honey `#D9A066`, Copper `#B5562F`, Rose gold `#D88C8C`, Espresso `#4A2C22`, Ash `#B9B4AD`, Plum `#7A3E5C`) that translates `x` with scroll (`useScroll` on the band, `-30%→0%`). The swatch nearest the viewport centre sets `--salon-accent` on the demo root (the sanctioned CSS-variable swap), used by headings' underline and CTAs; transition 400 ms. Reduced/paused: band static, accent stays plum.
- Sections: hero → ribbon → services (Cut & style $85, Balayage from $220, Gloss $65, Colour correction by consult, Bridal from $180) → colour result + interior two-up → reviews → hours/book → footer. Address "22 Rue Lane, Suite 3", phone "(555) 0137".

### Task 7: Velvet Room (`beauty`)
- Look: `#1E2A24` / `#E8EFE9`, sage `#9CC5A6`; `beautyDisplay`/`beautyBody`. Hero is type + two soft blurred sage circles (static radial gradients, no `filter` animation), headline "Lashes, brows, skin." / "Pestañas, cejas, piel."
- `MaskWindows`: the three treatment images in rounded "window" frames; each reveals once in view (`whileInView`, `VIEWPORT_ONCE`) by animating `clip-path: inset(50% 50% 50% 50% round 999px)` → `inset(0 0 0 0 round 28px)`, 0.9 s, staggered `staggerDelay(i)`; inner image scales 1.12→1. Each window has its treatment name, duration and price (Lash extensions 120 min $160; Brow lamination 45 min $70; Signature facial 60 min $95). Reduced/paused: windows fully open.
- Sections: hero → MaskWindows → "How a visit works" three steps (this is a real sequence) → reviews → hours/book → footer. Address "9 Willow Court", phone "(555) 0158".

### Task 8: Ember & Oak (`restaurant`)
- Look: `#2A0F0C` / `#F7E4CF`, ochre `#E0902F`; `restaurantDisplay`/`restaurantBody`. Photo-led hero (`restaurant/hero`, max rendered width 1280 px, dark gradient for text), headline "Wood fire. Late tables." / "Fuego de leña. Mesas hasta tarde." Two CTAs: "Reserve a table" and "Order pickup", both `[data-book]`.
- `MenuPlating`: menu in three courses (Small plates / From the fire / Sweet). Each item row "plates in" when its course enters view: `y: -14 → 0`, `opacity 0 → 1`, slight `scale 1.02 → 1`, staggered 70 ms, course headings first. The flatbread and steak photos sit beside "From the fire" on desktop. Items with prices (e.g., Burrata flatbread $19, Ember ribeye 14oz $48, Half chicken $29, Charred carrots $12, Olive-oil cake $11, 6–8 items total). Reduced/paused: all plated.
- Sections: hero → menu → dining room (`room`) with "Private dining for up to 24" → reviews → hours (Tue–Sun 5–11pm, Fri–Sat to midnight) / reservations → footer. Address "310 Foundry St", phone "(555) 0119".

### Task 9: Trueframe Builders (`contractor`)
- Look: `#0F2440` / `#E9F0FA`, safety orange `#FF7A1A`; `contractorDisplay`/`contractorBody`. Linework-led hero, headline "Built right the first time." / "Bien construido desde la primera vez." CTA "Get a free estimate".
- `BlueprintHero`: an inline SVG kitchen elevation (cabinet run, island, two pendants, window; ~25 paths, hand-authored simple rectangles/lines, `stroke` `#9BB8E0` 1.5px on a faint grid pattern) that draws on load via `stroke-dashoffset` (sanctioned), 1.6 s, staggered by group. Then the `contractor/kitchen` photo wipes in over it, left to right, via `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)` over 1.1 s, leaving a 6 px orange wipe edge that fades out. Dimension labels (e.g., `12'-6"`) in the body font. Reduced/paused: photo shown, linework hidden behind it.
- Sections: hero → services grid (Kitchens, Bathrooms, Additions, Decks, Whole-home remodels) → projects (addition, deck) with location + duration ("Two-story addition · 14 weeks") → process (Estimate → Design → Build → Walkthrough) → reviews → licence line ("Licensed & insured · Lic. #CB-000000 (demo)") + book → footer. Address "88 Millwork Rd", phone "(555) 0163".

### Task 10: Brightline Home (`service`)
- Look: `#EAF6F4` / `#0C3A36`, teal `#0F8F80`, yellow `#FFD23F`; `serviceDisplay`/`serviceBody`. Type-led hero "Fixed today. Guaranteed." / "Reparado hoy. Garantizado." with an ETA strip: "Next available tech: 42 min" with a pulsing dot (opacity loop, stopped when paused/reduced) and two CTAs "Book a visit" and "Call (555) 0171" (the call button is also `[data-book]`; no `tel:` link on the demo).
- `BeforeAfterSlider`: `before`/`after` stacked; the after image is revealed by a handle the user drags (pointer events with `setPointerCapture`, `touch-action: pan-y` so vertical page scroll still works), keyboard: handle is `role="slider"` with `aria-valuenow` 0–100, Arrow keys ±5, Home/End. Reveal implemented with `clip-path: inset(0 0 0 X%)` on the after image (sanctioned exception set, one element). On first entering view it does one hint sweep 50→62→50 % (skipped when reduced/paused). Labels "Before"/"After" (ES "Antes"/"Después").
- Sections: hero → services (Plumbing, Electrical, Heating & cooling, Water heaters) with "from" prices → slider ("Under-sink leak, fixed same day") → guarantees (Upfront pricing, 1-year workmanship guarantee, Background-checked techs) → reviews → service area + hours → footer. Address "Serving Greater Lakeview", phone "(555) 0171".
- Extra assertion in `demo:service`: dragging the handle from 50% to 80% with `page.mouse` changes `aria-valuenow` to within 78–82, and `page.mouse.wheel(0, 400)` with the pointer over the slider still scrolls the page.

---

### Task 11: Screenshots

**Files:**
- Create: `scripts/capture-work.mjs`, `public/media/work/<id>/shot-en-v1.jpg`, `shot-es-v1.jpg`, `shot-en-v1-640.jpg`, `shot-es-v1-640.jpg` (24 files)
- Modify: `package.json` (`"capture:work": "node scripts/capture-work.mjs"`)

**Interfaces:**
- Produces the `DemoCard.shots` files referenced in Task 3.

- [ ] **Step 1:** Write the script: starts `next start -p 3124`, for each demo and locale opens `/work/<id>/?capture=1&lang=<locale>` at 1280×800, `deviceScaleFactor: 1`, scrolls to the bottom in 400 px steps (150 ms waits) and back to top, waits 1500 ms, takes `fullPage: true` JPEG q80, then writes the 640-wide copy by shelling out to `python3 -c` with Pillow (LANCZOS, q78). No new npm dependency.
- [ ] **Step 2:** `npm run build && npm run capture:work`. Expected: 24 files; each `shot-*-v1.jpg` 1280 px wide, ≤ 900 KB.
- [ ] **Step 3:** Look at all 12 full shots in a contact sheet; confirm no ribbon, no half-animated sections, Spanish shots in Spanish.
- [ ] **Step 4:** Commit `feat(work): demo screenshots for the gallery (EN + ES)`.

---

### Task 12: Gallery, desktop/tablet (grid, hover-scroll, tilt, preview)

**Files:**
- Create: `src/components/sections/work/WorkCard.tsx`, `WorkPreview.tsx`, `WorkGallery.tsx`
- Modify: `src/i18n/dictionary.ts` (`work.gallery` block)

**Interfaces:**
- Consumes: `DEMOS`, `useFocusTrap`, `useLanguage`, `useMotionPause`, `useReducedMotionSafe`, `AmbientField`, `SectionChip`, `RevealLines`, `Reveal`.
- Produces: `<WorkGallery />` (section `id="work"`, `aria-labelledby="work-title"`, dark theme like `IndustriesChapter`).
  - `<WorkCard demo={DemoCard} onOpen={(id) => void} live: "hover" | "auto" | "off" />`: browser frame (chrome dots + `pitchDomain`), viewport `aspect-ratio: 16/10`, `<img>` of the locale's shot (`small` source on cards). `live="hover"`: on `pointerenter` (mouse only) and `focus`, animate the image `y` from current to `-(imgHeight - viewportHeight)` with `animate()` linear, duration `clamp(travel / 140, 4, 9)` s; on leave/blur animate back to 0 with `SPRING_SMOOTH`, starting from the current value (no jump). Tilt: `rotateX = -y * 7°`, `rotateY = x * 9°` via springs on pointer move, mouse only. Layout id on the frame: `work-frame-<id>`.
  - `<WorkPreview demo={DemoCard | null} onClose={() => void} />`: `AnimatePresence`; backdrop fade; frame with `layoutId="work-frame-<id>"` sized `min(92vw, 1100px)` × `min(82vh, 760px)`, scrollable inner viewport with the `full` shot, a "Visit the full demo →" `Link` to `demo.href` (adds `?lang=es` when Spanish), Close button; `role="dialog" aria-modal aria-labelledby`; `useFocusTrap(ref, open, onClose)`; backdrop click closes. Reduced/paused: opacity-only transition (no layout animation).
- Copy `work.gallery`: EN `index` (see Task 14), `eyebrow: "Our work"`, `title: ["Sites we'd build for you"]`, `titleEmphasis: "for you"`, `body: "Six demo sites, one per trade. Hover to scroll one, click to open it."`, `bodyTouch: "Six demo sites, one per trade. Swipe, then tap to open one."`, `demoTag: "Demo · {tag}"`, `open: "Preview {business}"`, `visit: "Visit the full demo"`, `close: "Close preview"`. ES formal equivalents ("Nuestro trabajo", "Sitios que haríamos para usted", …).
- Grid: `md:grid-cols-2 lg:grid-cols-3`, gap 24 px, inside `.frame`.

- [ ] **Step 1:** Add checks `gallery-desktop`: at 1280×900 open `/#work`; six `[data-work-card]`; hover the first card's viewport for 1500 ms → its image `transform` has a negative translateY; move the mouse away for 1200 ms → translateY returns to 0 ± 1 px; hover the second card 800 ms then click it → a dialog named after "Maison Lumière" is visible; Tab 15× stays inside; Esc closes and `document.activeElement` is the second card; reopen, click the backdrop corner → closed; `runAxe` with preview open passes. `gallery-reduced`: `reducedMotion: "reduce"`, hover a card 1500 ms → translateY stays 0.
- [ ] **Step 2:** Temporarily render `<WorkGallery />` after `InclusionsList` in `src/app/page.tsx` (Task 14 wires it properly). Run `npm run build && npm run verify:work gallery-desktop gallery-reduced` → FAIL.
- [ ] **Step 3:** Implement the three components and copy.
- [ ] **Step 4:** Run the checks → PASS.
- [ ] **Step 5:** Commit `feat(work): Our work gallery grid with hover-scroll, tilt and grow-to-preview`.

---

### Task 13: Gallery, phones (single swipe row)

**Files:**
- Modify: `src/components/sections/work/WorkGallery.tsx`, `WorkCard.tsx`

**Interfaces:**
- Below 768 px the card list is a `flex` row with `overflow-x: auto`, `scroll-snap-type: x mandatory`, cards `flex: 0 0 80vw` (max 360 px), `scroll-snap-align: center`, hidden scrollbar, side padding so the first and last can centre. Dots under the row (`<button aria-label="Show {business}">`, `aria-current` on the active one), tapping scrolls that card into centre. Active index from an `IntersectionObserver` (root = row, threshold 0.6). The active card gets `live="auto"`: its image scrolls slowly (`clamp(travel / 60, 8, 16)` s, linear, loops back with a 1.2 s pause at each end); others `live="off"`. Pause/reduced: all `off`.
- Tap vs swipe: open the preview only on `click` where the pointer moved < 8 px between `pointerdown` and `pointerup`.
- On phones the preview fills the viewport (`inset: 0`, safe-area padding).

- [ ] **Step 1:** Add check `gallery-phone`: Playwright `devices["iPhone 13"]`; open `/#work`; measure the row's `getBoundingClientRect().height` ≤ `1.4 * innerWidth`; all six cards share the same `top`; swipe the row left by 250 px with `page.touchscreen` / dispatched pointer events → no dialog opens and the second dot gets `aria-current="true"`; tap the centred card → dialog opens full-screen; close it. `gallery-phone-paused`: same device, click the footer "Pause animations" button first, wait 3 s, the active card's image translateY is 0.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat(work): phone swipe row with auto-preview and tap-to-open`.

---

### Task 14: Wire into the home page and ship checks

**Files:**
- Modify: `src/lib/tabs.ts` (`TAB_IDS`: insert `"work"` after `"included"`), `src/app/page.tsx` (panel `{ id: "work", node: <WorkGallery /> }` after `included`, remove the Task 12 temporary render), `src/components/layout/Navbar.tsx` (links: prepend `{ href: "/#work", label: t.nav.links.work }`), `src/i18n/dictionary.ts` (`nav.links.work` "Our work"/"Nuestro trabajo", `nav.tabs.work` same; section `index` values: `work.gallery.index = "(02)"`, and every section index after it shifts by one: current `(02)`→`(03)` … `(06)`→`(07)`, EN and ES)

- [ ] **Step 1:** Add check `home-wiring`: `/` has a nav link to `/#work`; `#work` section comes after `#included` and before `#industries` in DOM order; `/es/` shows "Nuestro trabajo"; the Spanish gallery images point at `shot-es-v1`. `sitemap-clean`: `/sitemap.xml` contains no `/work/`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement the wiring. **Step 4:** Run → PASS.
- [ ] **Step 5:** Full regression: `npm run typecheck && npm run build && npm run verify:work home-smoke shell-lang shell-booking shell-capture shell-noindex demo:barbershop demo:salon demo:beauty demo:restaurant demo:contractor demo:service gallery-desktop gallery-reduced gallery-phone gallery-phone-paused home-wiring sitemap-clean`. Expected: all PASS.
- [ ] **Step 6:** Static export: `STATIC_EXPORT=true npm run build`; expect `out/work/<id>/index.html` for all six and `out/media/work/` populated. Then `NEXT_PUBLIC_BASE_PATH=/sub STATIC_EXPORT=true npm run build` and grep `out/work/salon/index.html` for `/sub/media/work/` (base path respected).
- [ ] **Step 7:** README: add "Demo sites" section (routes, how to re-capture screenshots with `npm run capture:work`, image provenance pointer).
- [ ] **Step 8:** Commit `feat(work): Our work section in the home page and nav`, push.
