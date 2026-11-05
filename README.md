# Serma website

Marketing site for Serma, an Austin web studio that builds websites with booking built in for service businesses.

The plan, concepts, and budgets are in [`docs/PLAN.md`](docs/PLAN.md). The chosen direction is **Concept C, Built From Blocks**, with the **Marigold & Mint** palette.

## Run it

Requires Node 22.23.4 or newer.

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
npm run build      # static build into dist/
npm run preview    # serve the build
npm run check      # type-check everything
```

QA pass (layout at 360 to 1440 px, tap targets, axe accessibility, key flows, screenshots), against a running preview:

```bash
node scripts/qa.mjs http://127.0.0.1:4321 reports/qa
```

## Where things live

| Path | What |
|---|---|
| `src/design/tokens.ts` | Design tokens: color, type, spacing, radius, depth, motion. The only place values are defined. |
| `src/config/site.ts` | Business facts (name, contact, industries) and placeholders. |
| `src/i18n/en.ts` | All homepage and UI copy. Spanish (`es.ts`) mirrors it in Phase 6. |
| `src/sections/` | Homepage sections, in page order. |
| `src/components/` | Shared pieces: header, footer, lead form, dialogs, poster art. |
| `src/scripts/` | Small client scripts: site UI, lead form, booking demo. |
| `src/lib/lead.ts` | Lead validation shared by the browser and (Phase 5) the server. |
| `src/pages/styleguide.astro` | Living style guide at `/styleguide` (not indexed). |
| `CREDITS.md` | Every third-party asset and its license. |

## Placeholders still open

Search the code for `[` placeholders and `draft: true`. They render with a visible dashed "Needs your confirmation" or "Placeholder" tag, so nothing ships by accident.

- Business name (working name: Serma), email, phone, service area: `src/config/site.ts`
- FAQ answers on ownership, cancelling, timing, and domains: `src/i18n/en.ts`
- How "Book a call" works: `src/pages/book-a-call.astro`
- Real domain: `astro.config.mjs`
- Portfolio: real client sites only, `src/sections/Work.astro`

## Phase status

1. Concepts and plan: done
2. Design system and homepage without 3D: **done (this build)**. The lead form runs in preview mode: it validates and shows the thank-you state but doesn't send anything yet.
3. Hero 3D scene: next
4. Scroll-driven 3D and remaining polish
5. Lead capture backend and admin
6. Other pages and Spanish
7. Final performance, accessibility, and device pass
