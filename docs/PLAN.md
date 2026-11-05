# Phase 1: Concepts and Plan

Status: **waiting for approval.** Nothing gets built until you pick a concept and answer the open questions at the end.

Working name in this document: **Serma** (from the repo name). Every `[BRACKET]` is something only you can fill in.

---

## 1. The story every concept tells

The site has one job: a barber lands, understands in 5 seconds that we build sites that **book customers for them**, and asks for a free preview.

The 3D tells that story in four beats, the same in every concept:

| Beat | What the visitor sees | Where it sits on the page |
|---|---|---|
| **Design** | Rough pieces turn into a designed site | Hero intro, then chapter 1 of "What every site includes" |
| **Build** | Pieces lock into a real page | Chapter 2 |
| **Booking** | A 3D calendar fills with appointments | Chapter 3 |
| **Launch** | The finished site lights up and a booking comes in | Chapter 4, and again in the final call to action |

The section "What every site includes" becomes four chapters, one per beat. The 7 features you listed group naturally:

- **Design:** mobile-first design, Spanish option
- **Build:** accessibility and legal pages, fast loading
- **Booking:** booking system, owner dashboard and calendar, email confirmations and reminders
- **Launch:** hosting, updates, monthly care

All text stays real HTML. The 3D sits behind or beside it and is marked decorative.

---

## 2. Three concepts

All three meet the brief: assembling hero, cursor and tilt reaction, scroll-driven camera, 3D calendar, finale. They differ in metaphor, mood, and cost.

### Concept A: Blueprint to Booked

> Your website goes from a sketch on the drafting table to a finished site that takes bookings.

- **Hero:** In a dark cyanotype space, thin cyan lines draw a phone and a browser window edge by edge. Gray layout blocks rise out of the lines (header, photo, service list, Book button). Orange color washes across them, photos snap in with a slight overshoot, the Book button glows, and a toast slides out: "New booking · Fade + beard · Sat 10:30" (marked as demo).
- **Cursor and tilt:** The device turns up to 6°. Floating measurement lines ("44 px tap target", "ES / EN") shift at different depths for parallax.
- **Scroll:** The camera travels across one huge drafting table.
  - Design: color chips, a type specimen, and the grid float up as cyan line work.
  - Build: blocks slide along rails into the phone like an assembly line. Lines retract as solid parts lock in.
  - Booking: the camera dips to a week calendar engraved into a plate. Appointment blocks drop in and land with an orange edge glow.
  - Launch: the phone stands up and the screen lights the scene. The blueprint cyan warms into night, and a pin lights up "Austin, TX".
- **Color rule:** cyan means "still a sketch", orange means "done and booked". The palette encodes the story.
- **Feel:** precise, crafted, "we're builders".
- **Cost:** light (lines and boxes, no downloaded models).
- **Risk:** blueprints are a familiar agency trope. It needs very good line work to feel premium.

### Concept B: Lights On, Main Street

> A street of local shops at night. Each one switches on when it gets a website that books customers.

- **Hero:** A miniature, toy-like barbershop storefront (with a pole) floats dark in space. Its window is a phone screen. Wireframe blocks appear on the glass, then color and photos, then a neon "OPEN · BOOK NOW" sign flickers on and light spills onto the sidewalk.
- **Cursor and tilt:** The diorama turns gently and the neon reflections move across the glass.
- **Scroll:** The camera dollies down the street, one shop per chapter.
  - Design: a nail salon window gets hand-painted. Brush strokes reveal the design.
  - Build: scaffolding around a spa. Panels fit into place.
  - Booking: a barbershop chalkboard becomes a 3D calendar and appointment blocks drop in like magnets.
  - Launch: the camera cranes up and every window on the street lights up in turn.
- **Reuse:** the storefronts become the icons for the Industries section.
- **Color rule:** amber is the streetlights (ambient), neon rose is the "open / booked" moment and the main button.
- **Feel:** warm, local, emotional. Barbers will see themselves immediately.
- **Cost:** heaviest. It needs a modeled diorama (about 300 to 500 KB compressed glTF, built by us so licensing is clean), more lights, and more art time. Phones get a baked-light version.
- **Risk:** toy-like can read cheap if the modeling isn't excellent. Slowest to build.

### Concept C: Built From Blocks (recommended)

> Everything is made from one soft, rounded block: the same block that becomes a page section, a calendar slot, and a booked appointment.

- **Hero:** A few hundred rounded tiles float in a slow cloud. They fly together into a phone and a browser window, first as hollow mint outlines (empty slots). Then each tile flips like a card to show color and image fragments that together form the finished booking site. Last, the "Book" tile presses down and a marigold tile pops out: "Booked · Sat 10:30" (marked as demo).
- **Cursor and tilt:** Tiles near the pointer lift slightly, like a magnet passing under them. The device turns up to 6°.
- **Scroll:** The same tiles rearrange between forms as the camera moves.
  - Design: the phone spreads flat into a mood board: color swatches, an "Aa" type tile, photo tiles.
  - Build: tiles snap into a page grid that mirrors the bento cards in the HTML next to it.
  - Booking: tiles form a week calendar. Mint tiles are open slots. Marigold appointment blocks drop from above, bounce, and settle.
  - Launch: tiles reassemble into the phone, the screen lights, a ripple pulses outward, and a "New booking" tile slides in.
  - Final call to action: the cloud returns half-assembled next to the form. "Your site is next."
- **Small touches use the same block:** section transitions wipe in as a grid of squares, buttons press down like a tile, and the cursor follower is a small rounded square that stretches to the shape of the button you hover.
- **Color rule:** mint means open / available, marigold means booked / your next step. The main button is marigold.
- **Feel:** playful but premium, tactile, app-like. It connects the 3D, the bento layout, and the booking product with one shape.
- **Cost:** lightest of the three at runtime. Hundreds of tiles render in **one draw call** (instancing). No models to download. Images come from one small texture atlas.
- **Risk:** tile morphs can look like a generic particle effect. The fix is choreography: tiles move in readable groups with real weight, never as random noise.

**Why I recommend C:** it tells the booking story most directly (a slot gets filled), it runs best on mid-range phones, and one shape ties the whole site together. If you want more warmth, Concept B's neon "OPEN" moment can become C's Launch finale.

### Palettes

Every palette is dark-first with one vivid accent and one secondary accent. Contrast was measured with the WCAG formula. Any palette works with any concept.

| | Cyanotype (A) | Neon Night (B) | Marigold & Mint (C) |
|---|---|---|---|
| Background | `#0A1316` | `#120E0C` | `#0C1210` |
| Surface | `#122026` | `#1D1815` | `#15201C` |
| Text | `#EEF3F1` (16.8:1) | `#F8F0E6` (17.0:1) | `#F1F4EF` (17.1:1) |
| Muted text | `#9DB0B3` (8.3:1) | `#ACA197` (7.6:1) | `#A0AFA8` (8.3:1) |
| Form borders | `#62797E` (3.6:1 on surface) | `#7A6F66` (3.6:1) | `#66776F` (3.5:1) |
| **Accent** | Safety orange `#FF6B1F` (6.6:1) | Neon rose `#FF3D7A` (5.7:1) | Marigold `#FFC229` (11.7:1) |
| **Secondary** | Cyanotype `#7DD9E8` (11.6:1) | Sodium amber `#FFB43F` (10.8:1) | Mint `#8BE3BF` (12.5:1) |
| Button text | Dark on accent (6.6:1) | Dark on accent (5.7:1) | Dark on accent (11.7:1) |

Ratios are against the background unless noted. AA needs 4.5:1 for text and 3:1 for UI parts. White text on any of the accents fails, so buttons always use dark text.

The board also gets one light "paper" section (for example The Problem) so the page has chapter rhythm instead of one long dark scroll.

### Type pairings (all SIL Open Font License, free for commercial use, self-hosted)

| Concept | Display | Body |
|---|---|---|
| A | Archivo, expanded width, 800 to 900 | Instrument Sans |
| B | Big Shoulders Display, 800 to 900 | Figtree |
| C | Bricolage Grotesque, 96 pt optical size, 700 to 800 | Geist |

All cover Spanish characters (á é í ó ú ñ ü ¿ ¡). Fonts are subset to Latin and preloaded: 2 files, under 80 KB together.

---

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Astro 7** (static output) | Pages ship as plain HTML and CSS with zero JavaScript by default. JS loads only in "islands" that need it. Built-in i18n routing, image optimization, sitemap. |
| Islands | **React 19** | Needed by React Three Fiber; also powers the interactive demo and the admin table. Loaded only where used. |
| 3D | **Three.js 0.187** with custom GLSL shaders | *Changed in Phase 3:* React Three Fiber was measured at 309 KB compressed before any scene code (it pulls in all of Three.js), over the 260 KB budget. Plain Three.js with the same features is 142 KB. Quality tiers, the frame-rate watchdog, and multi-scene support are written in-house. |
| Motion | CSS + a small in-house scroll reader | *Changed in Phase 4:* every 3D animation is a function of the page's native scroll position, and HTML motion is CSS, so GSAP wasn't needed (saves about 40 KB). It can still be added later if a timeline needs it. |
| Smooth scroll | Native scrolling | *Changed in Phase 4:* the smoothing is applied to the 3D camera instead of the page, so scrolling, the scrollbar, keyboard, anchors, and the back button stay 100% native. Lenis (desktop wheel only) is a one-line addition if you want the page itself to glide. |
| Hosting | **Netlify** with `@astrojs/netlify` | Static pages from the CDN. Server routes (form, admin) deploy as Netlify Functions. Deploy previews per branch so you can test on your phone. |
| Database | **Netlify Database** (`@netlify/database`, Postgres) + **Drizzle ORM** | Typed queries and versioned migrations. |
| Email | **Resend** | Lead alerts to you, optional confirmation to the lead, admin login links. Needs a verified sending domain. |
| Validation | **Zod** (bundled with Astro) | One schema shared by the browser and the server. |
| Testing (dev only) | Playwright, Lighthouse CI, axe-core | Automated performance and accessibility checks on every build. |

Libraries beyond your allowed list, and why: **Drizzle** (safe database queries and migrations), **Zod** (validation; already inside Astro), **Playwright / Lighthouse / axe-core** (testing only, never shipped to visitors). All are MIT or Apache 2.0.

**Deliberate deviations from the brief, for your approval:**

1. **Portfolio devices use CSS 3D, not WebGL.** Screenshots stay razor-sharp, every device is a real link, it works without WebGL, and it costs no extra GPU memory. It still tilts in 3D on hover and on keyboard focus.
2. **Phone tilt on iPhone.** iOS only allows motion sensors after a permission popup. I don't want a popup in the hero, so iPhones get a gentle automatic drift plus touch-drag parallax. Android gets real tilt with no prompt.
3. **Pricing on the site:** shows your plans if you give them, otherwise "Contact for pricing" with the free preview button.

---

## 4. How the 3D layer works

- **One canvas for the whole page.** It is fixed behind the content, `aria-hidden="true"`, with `pointer-events: none`. Several scenes share it (drei `<View>`), so phones never juggle multiple WebGL contexts.
- **Load order:**
  1. HTML and CSS arrive. The headline and the main button render immediately. The headline is the LCP element.
  2. A still "poster" of the finished scene shows behind the text. It is a CSS/SVG composition, not a big image, so it never becomes the LCP element and never shifts layout.
  3. After the page has loaded and the browser is idle, the device tier is checked and the 3D code is imported.
  4. Shaders compile in the background (`compileAsync`), with work split into small chunks so scrolling and tapping never stall.
  5. The canvas fades in over the poster in 400 ms. There is no loading screen.
- **Intro:** the assembly plays only on the first visit (about 2.4 s), remembered in local storage. Any scroll, tap, key press, or the visible "Skip intro" button jumps to the finished state. The text is readable from the first frame, so the intro never blocks anything.
- **Quality tiers:**
  - **Off:** no WebGL2, reduced motion, Data Saver on, or very low memory. Polished still images only.
  - **Low:** pixel ratio 1, fewer tiles, no shadows, no post-processing.
  - **Mid:** pixel ratio up to 1.5, glow faked in shaders.
  - **High:** pixel ratio up to 2, antialiasing, subtle film grain.
  - A frame-rate watchdog steps quality down if it drops below 45 fps for 2 seconds. Below 30 fps it freezes on the finished frame and stops rendering.
- **Rendering stops** when the 3D sections are off screen (IntersectionObserver) and when the tab is hidden.
- **Scroll never moves the page.** We only read the native scroll position, convert it to progress per chapter, smooth it, and drive the camera from it. Long chapters use CSS `position: sticky`, never scroll-jacking or JS pinning.
- **Reduced motion:** the camera path is replaced by one composed still per chapter, rendered from the real scene at build time. No scroll-linked movement and no autoplay.
- **No WebGL:** the same stills are used. Nothing is missing except the motion.
- **Models:** Concept A and C need none (built in code). Concept B's diorama would be modeled by us, compressed with Meshopt, and logged in `CREDITS.md` with fonts and any other assets.

---

## 5. Page structure

### Homepage

| # | Section | Content | 3D / motion |
|---|---|---|---|
| | Header (sticky) | Logo, nav (What you get, Demo, Work, Pricing, FAQ), EN/ES, "Book a call", primary button | Hides on scroll down, returns on scroll up |
| | Mobile CTA bar | "Get your free website preview" fixed to the bottom | Appears after the hero, hides while the form or keyboard is on screen |
| 1 | Hero | Headline, subline, both buttons, one trust line ("Free preview. No credit card. English and Spanish.") | Hero assembly |
| 2 | The problem | No website means customers book someone else. Booking apps charge every month. Light "paper" section. No invented statistics. | CSS only |
| 3 | What every site includes | Four chapters: Design, Build, Booking, Launch. Bento cards beside the scene. | Scroll-driven journey and 3D calendar |
| 4 | Interactive demo | Two tabs: **What your customer sees** (pick a service, pick a time, confirm, see the email) and **What you see** (dashboard and calendar where that booking just appeared). Industry switcher (barber / nails / massage) and EN/ES switch. Labeled "Demo shop, fake data". | React island, loaded when near the screen |
| 5 | How it works | Free preview, Approve, Launch, We maintain it monthly | CSS 3D tile flips |
| 6 | Portfolio | Real client sites only. Until you add them: clearly marked "Your site could be here" frames. | CSS 3D devices tilt on hover and focus |
| 7 | Industries | Cards linking to each industry page | CSS |
| 8 | Pricing | Plans or "Contact for pricing" | CSS |
| 9 | FAQ | Who owns the site, what if I cancel, how long it takes, do I need a domain, plus a few more. Native `<details>` so it works with no JS. | None |
| 10 | Final CTA | Short form inline, Book a call | 3D finale |
| | Footer | Business name, Austin TX, email, phone, legal links, © year | None |

### Other pages (English and Spanish, linked with hreflang)

| Page | English | Spanish |
|---|---|---|
| Home | `/` | `/es/` |
| Free preview form | `/free-preview` | `/es/vista-previa-gratis` |
| Book a call | `/book-a-call` | `/es/agendar-llamada` |
| Industries hub | `/industries` | `/es/industrias` |
| Barbershops | `/industries/barbershops` | `/es/industrias/barberias` |
| Nail salons | `/industries/nail-salons` | `/es/industrias/salones-de-unas` |
| Massage therapists | `/industries/massage-therapists` | `/es/industrias/masajistas` |
| Spas | `/industries/spas` | `/es/industrias/spas` |
| Personal trainers | `/industries/personal-trainers` | `/es/industrias/entrenadores-personales` |
| Cleaning services | `/industries/cleaning-services` | `/es/industrias/servicios-de-limpieza` |
| Auto detailing | `/industries/auto-detailing` | `/es/industrias/detallado-de-autos` |
| About | `/about` | `/es/nosotros` |
| Contact | `/contact` | `/es/contacto` |
| Privacy Policy | `/privacy` | `/es/privacidad` |
| Terms | `/terms` | `/es/terminos` |
| Accessibility Statement | `/accessibility` | `/es/accesibilidad` |
| Admin (no index) | `/admin` | English only |

Industry pages share one template: industry-specific headline, the demo preset to that industry, relevant FAQ, and the form with "type of business" already filled in. The 3D there is limited to the hero.

The primary button opens the form in a full-screen sheet on phones and a dialog on desktop. Without JavaScript it is a plain link to `/free-preview`, and the form posts normally.

---

## 6. Design system

Tokens live in one TypeScript file and are generated into CSS custom properties, so CSS, GSAP, and the 3D shaders all read the same values.

- **Color:** background, surface, raised, line, text, muted, accent, on-accent, secondary, focus, success, error.
- **Type:** fluid scale with `clamp()`, display sizes from about 44 px on phones to 160 px on desktop, body 17 to 19 px, line length about 65 characters.
- **Spacing:** 4 px base, fluid section spacing.
- **Radius and depth:** one tile radius used everywhere (cards, buttons, 3D tiles), three shadow levels.
- **Motion:**
  - Easing: `out` = `cubic-bezier(0.16, 1, 0.3, 1)`, `in-out` = `cubic-bezier(0.65, 0, 0.35, 1)`, `spring` = CSS `linear()` spring with a matching GSAP curve.
  - Duration: 120 ms (press), 240 ms (UI), 480 ms (reveal), 900 ms (chapter).
- **States:** every interactive element gets hover, focus-visible, active, disabled, and loading states, documented on a `/styleguide` page (no index) so you can review them.

---

## 7. Lead capture and admin

**Form fields:** business name, type of business, phone, email, Google Maps or Instagram link (optional), preferred language. Hidden: honeypot field, time-on-form check, source page.

**On submit:**
1. Server-side validation with the same Zod schema as the browser. Clear errors next to each field, in the visitor's language.
2. Spam checks: honeypot, minimum time on form, Netlify's built-in function rate limit, plus a per-IP limit in the database (IP stored only as a salted hash).
3. Save the lead first. Then send your alert through Resend. If the email fails, the lead is still saved and marked "alert not sent" in the admin.
4. The visitor sees a thank-you message: what happens next and when.
5. The form works without JavaScript (normal POST, then a thank-you page).

**Admin:**
- Login by email link (no password to manage). Only addresses in an allowlist can log in. The session is a secure, HttpOnly cookie that expires after 7 days and can be revoked.
- Leads table: filter by status, search, newest first, click to see details and add notes.
- Status: new, contacted, preview sent, won, lost. Each change is logged with the time.
- Admin pages are server-rendered, `noindex`, and never cached.

**Tables:** `leads`, `lead_status_changes`, `admin_login_tokens`, `admin_sessions`.

---

## 8. Performance budget

Measured on Lighthouse mobile (slow 4G, 4x CPU slowdown) and on a real mid-range Android phone.

| Metric | Budget | Target |
|---|---|---|
| Lighthouse Performance (mobile) | ≥ 90 | 95+ |
| Accessibility, Best Practices, SEO | ≥ 95 | 100 |
| LCP | < 2.5 s | < 1.8 s |
| CLS | < 0.05 | 0 |
| INP | < 200 ms | < 100 ms |
| Total Blocking Time | < 200 ms | < 100 ms |

| Payload | Budget (compressed) |
|---|---|
| HTML (homepage) | ≤ 35 KB |
| CSS (inlined critical) | ≤ 20 KB |
| Fonts (2 preloaded files) | ≤ 80 KB |
| JS before the 3D (nav, dialog, reveals) | ≤ 15 KB |
| 3D JavaScript (three, R3F, React, scenes; loaded after first paint) | ≤ 260 KB |
| 3D assets on phones / desktop | ≤ 150 KB / ≤ 350 KB |
| Demo island (loaded when near the screen) | ≤ 40 KB |
| Homepage total without 3D | ≤ 250 KB |
| Homepage total with 3D, phone | ≤ 800 KB |

| GPU | Budget |
|---|---|
| WebGL contexts | 1 |
| Draw calls (hero) | ≤ 40 |
| Triangles | ≤ 50k phone / ≤ 150k desktop |
| Textures | ≤ 1024 px on phones, ≤ 2048 px on desktop |
| Frame rate | 60 fps desktop, ≥ 45 fps mid-range phone, or auto-downgrade |

Budgets are enforced in CI: the build fails if a bundle grows past its budget or Lighthouse drops below 90.

An honest note: a WebGL hero with Lighthouse 90+ on mobile is doable but leaves no slack. The plan above (headline as LCP, 3D after idle, chunked shader compile, tiering) is what makes it work. We measure after every phase, not at the end.

---

## 9. Accessibility (WCAG 2.2 AA)

- Canvas is decorative (`aria-hidden`), and every message it shows also exists as real text.
- Full keyboard path: skip link, logical order, visible focus ring (3:1 or better) on every control, focus trapped only inside open dialogs and returned on close.
- Tap targets at least 44 × 44 px. Tested from 360 px wide.
- Every color pair checked; results kept in the style guide.
- Forms: visible labels, errors linked with `aria-describedby`, errors announced, no placeholder-only fields.
- `prefers-reduced-motion` honored everywhere, including CSS reveals and the cursor follower.
- The cursor follower is extra. The native cursor always stays visible.
- `lang` set per page, Spanish pages with `lang="es"`.

## 10. SEO

- Unique title and description per page and language.
- `LocalBusiness` (ProfessionalService) schema with Austin, TX address and service area. `FAQPage` schema on the FAQ. `BreadcrumbList` on industry pages.
- hreflang `en`, `es`, and `x-default` on every page pair. Sitemap with alternates.
- Open Graph images generated at build time for every page, in both languages.
- Canonical URLs, `robots.txt`, admin excluded.

## 11. Analytics and cookies

If there is no tracking, there is no cookie banner. If you want Meta Pixel or analytics, a consent banner loads first and the scripts stay blocked until the visitor accepts. "Decline" is as easy as "Accept".

## 12. Phases and what I can test from here

| Phase | Output |
|---|---|
| 1 | This plan |
| 2 | Design system, homepage with final copy, no 3D (posters in place) |
| 3 | Hero 3D scene |
| 4 | Scroll journey, 3D calendar, remaining sections, demo |
| 5 | Lead form, Netlify Database, Resend, admin |
| 6 | Industry pages, About, Contact, legal pages, Spanish |
| 7 | Performance, accessibility, cross-browser pass |

What I can run in this environment: Chromium with Lighthouse, axe-core, Playwright at phone and desktop sizes, bundle-size checks.

What needs you: Safari on iPhone and a real mid-range Android phone. Each phase gets a Netlify deploy preview link plus a short checklist and a hidden `?debug` overlay that shows the quality tier and frame rate, so testing takes you about 10 minutes.

Legal pages: I'll draft Privacy, Terms, and Accessibility Statement from your real practices. They are templates, not legal advice; have a Texas lawyer review them before launch.

---

## 13. Open questions

**Needed before Phase 2 (copy and layout):**

1. **Name:** is it "Serma", "Serma Websites", or something else? How should it be written (SERMA vs Serma)? Do you have a logo?
2. **Service area:** Austin and nearby only, or anywhere in the US? This changes the headline and the local SEO.
3. **Pricing:** your plans and prices, or "Contact for pricing"? Is there a setup fee?
4. **FAQ answers:** who owns the site and domain, what happens if someone cancels, typical turnaround, and whether you buy the domain for them. I won't invent these.
5. **Contact:** email and phone for the footer, and the email that should receive lead alerts.
6. **Your booking product:** do you have screenshots of the real booking flow and owner dashboard your clients get? The demo should match what you actually deliver, feature for feature. Are reminders email only, or SMS too?
7. **Industries at launch:** are these 7 right (barbershops, nail salons, massage therapists, spas, personal trainers, cleaning services, auto detailing)? Add or drop any?

**Needed before Phase 5:**

8. **"Book a call":** I recommend booking calls through your own booking system (it proves the product). Alternatives: a "request a call" form, or a phone/text link. Which one?
9. **Domain:** do you own one yet? Resend needs a verified sending domain.
10. **Lead confirmation email:** should the visitor also get a "we got your request" email in their language?
11. **Admin users:** just you, or more people?

**Needed before launch:**

12. **Tracking:** will you run Meta ads (Pixel) or use analytics? If no, there's no cookie banner.
13. **Spanish:** I'll write the Spanish, aimed at Texas / Mexican Spanish. Can a native speaker review it?
14. **Photos:** do you have photos of real work or local shops we may use? Otherwise the demo uses illustrations, not stock photos that could look like fake clients.
