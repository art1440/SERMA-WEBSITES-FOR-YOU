---
name: serma-motion
description: Use when adding, changing or reviewing any animation, transition, hover or press state, scroll effect, or reduced-motion / Pause behaviour in the SermaWebDesign repo, on the main site or a /work demo site. Also use for vague asks like "make it feel premium", "this section feels flat", "add some motion" or "animate this".
---

# Serma motion

## Core principle

**Each page has one signature moment. Everything else is quiet.** On this site, a section looks expensive because of its type, spacing and contrast, and because of one motion people remember. Giving every element an entrance does the opposite. Left alone, an agent turns "make it premium" into a staged entrance for every row. That pile of entrances is the generic AI-site look, and it is what this skill exists to prevent.

## Step 1: Fill in the motion budget before any code

Write this table at the top of your plan or reply for the page you are touching. Read the page's component to fill it in. Don't guess.

```
Page: /work/barbershop          Signature: RazorCutHero (hero), headline cut by a brass line
Section    | Motion now                          | Role
hero       | razor cut + scroll split            | signature
services   | Rise per item + Leader dots draw    | supporting
craft      | DriftImage parallax (±4%)           | supporting
shop       | Rise on the card                    | quiet
reviews    | Rise on heading + Rise per row      | quiet   <- requested
Decision: <what you will change, in one line>
```

| Role | What it may have |
|---|---|
| **signature** | The page's one memorable motion. It lives in `src/components/work/signatures/` (or its own component), with a spec comment, `data-signature` and `data-state`. Only one per page. |
| **supporting** | One small detail that echoes the signature motif or the niche (e.g. Leader dots inking in like a price list). It plays once. |
| **quiet** | At most one `Rise` on the section heading. Nothing per item. Nothing at all is fine. |

When the page already has two or more supporting sections, the section you are working on is quiet.

## Step 2: Decide what moves

For a quiet or supporting section, go through this list in order and stop at the first option that solves the request.

1. **Fix the static design.** A section that feels flat usually has a type-scale, contrast or spacing problem. Fix that first, without motion.
2. **Remove competing motion.** Per-item `Rise` on a list people read (reviews, prices, hours) is fade-up noise. Delete it.
3. **Echo the signature once.** Reuse the page's motif as a single detail, such as the barbershop's brass hairline at −6°. Motifs per niche are in [niche-briefs.md](niche-briefs.md).
4. **Only then add a new entrance**, and only one per section.

Say which option you stopped at and why. If the request asked for motion and you stopped at option 1 or 2, say so plainly in the first line of your reply ("No new motion here, because…") and offer option 3 as a one-line alternative the person can choose.

**Not allowed outside the signature:**
- Splitting body copy, quotes or reviews into words or letters. Only display headlines get split, and only with the visually-hidden real text plus `aria-hidden` copies pattern (see `RazorCutHero`). `aria-label` on a `<blockquote>` or `<p>` is not a replacement for that pattern.
- Hover motion on things that aren't clickable, like a review row, a caption or an hours table. Hover motion only goes on links, buttons and cards that navigate, behind `[@media(hover:hover)_and_(pointer:fine)]:hover:` (see `PricingSection.tsx`), with a matching `focus-visible` state.
- Animating several parts of every list item (rule, then name, then quote).

## Step 3: Write the spec comment (required)

Every component that animates starts with a doc comment in this shape. `RazorCutHero.tsx` and `MenuPlating.tsx` are the reference. If you can't fill in a line, the motion isn't designed yet.

```tsx
/**
 * <Business>'s <signature | detail>: <one line on what it means for this business>.
 *
 * - Moves: <element> <property> <from -> to>, <duration>, <ease>, <trigger>.
 * - Timeline (ms), only if more than one thing moves: <element  start-end>.
 * - Properties: transform / opacity (+ clip-path on <one element>, once).
 * - Still (reduced motion or Pause): <what renders>; data-state="rest".
 * - Replay: <what happens on EN/ES switch and when Pause is lifted>.
 */
```

## Step 4: Build with the house rules

**Tokens.** Reuse these and don't invent one-off curves.

| Use | Token |
|---|---|
| Ease for everything entering | `EASE_EDITORIAL` (`src/lib/motion.ts`), `ease-editorial` in Tailwind |
| Controls: press, toggle, magnetic | `SPRING_SNAPPY` |
| Panels, cards, flips | `SPRING_SMOOTH` |
| Smoothing a scroll-linked value | `useSpring(progress, MOTION.cinematic)` |
| CSS transitions | `duration-fast` 150 / `duration-base` 250 / `duration-slow` 450 + `ease-editorial` |
| In-view trigger | `VIEWPORT_ONCE` (plays once, −10% margin) |
| Stagger between items | `staggerDelay(i)` from `Reveal.tsx` (60 ms, capped at 8) |
| Durations already in use in Framer | 0.7 s rise, 0.8 s draw, 0.9–1.1 s mask or line reveal, up to 1.3 s for a hero headline. Pick one of these. |

**Properties.** Animate `transform` and `opacity` only. `clip-path` is allowed for a one-time reveal on a single element (`MaskWindows`, `BlueprintHero`, `BeforeAfterSlider`), without `will-change`. Colour changes stay CSS transitions, and `motion.css` already provides them. Never animate width, height, top, left, blur, filter or box-shadow. To make a shadow grow, fade in the opacity of a pre-shadowed layer (see `PricingSection.tsx`).

**Still state.** On demo sites, call `const still = useDemoStill()`. When it is true, render the final markup with no motion props at all. `MotionConfig reducedMotion="user"` is not enough, because it still runs opacity animations. On the main site, use `useReducedMotionSafe()` for anything that changes markup, and `useMotionPause()` for JS loops and video. CSS keyframe loops freeze by themselves through `html[data-motion-paused]`. At rest, no text is left below full opacity.

**Triggers.** Put `whileInView` on a wrapper that is neither transformed nor clipped, because IntersectionObserver sees zero area on a fully clipped or translated-out element. Measure with `ResizeObserver` on resize, never per frame.

**Replay.** Something that has played stays played. Decide at mount (with a `useState` initializer) whether it starts at rest, so an EN/ES switch or lifting Pause never replays it. `MenuPlating` and `MaskWindows` show how.

**Scroll-linked.** Drive it with `useScroll` + `useTransform` MotionValues, and never `setState` per frame. Write threshold crossings straight to the DOM from `useMotionValueEvent`.

**Signature root.** Give it `data-signature="<demo id>"` and `data-state` set to `"live"`/`"drawing"` while it runs and `"rest"` when it's done. The verification script reads both.

## Step 5: Verify

```bash
npm run typecheck
```

```bash
npm run build
```

```bash
node scripts/verify-work.mjs demo:<id>
```

For the main site, run `home-smoke home-axe-full gallery-reduced gallery-phone-paused`. The demo check asserts that with reduced motion the signature reaches `data-state="rest"` and no text is left faded. In your report, say which checks you ran and which you didn't.

## Red flags

| Thought | What's true |
|---|---|
| "Premium means more entrances" | Premium means one moment, everything else calm. Start at Step 2, option 1. |
| "Each row gets a rule draw, a name slide and a quote rise" | That is the generic recipe. Two agents without this skill both wrote exactly that. |
| "A hover nudge makes it tactile" | On something that isn't clickable, it suggests a click that does nothing. |
| "`aria-label` on the blockquote covers screen readers" | Keep the real text whole. Split only aria-hidden display copies. |
| "MotionConfig handles reduced motion" | It still fades opacity. Use `useDemoStill()` and render the final markup. |
| "It replays on remount, that's fine" | Lifting Pause or switching language must not replay an entrance. |
| "`duration-500 ease-out` is close enough" | Use `duration-slow ease-editorial`. One-off timings are why sites feel randomly bouncy. |
