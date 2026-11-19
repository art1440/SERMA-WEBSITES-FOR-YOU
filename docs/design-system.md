# SermaWebDesign — Liquid Glass Design System

The site's visual language: a light "morning sky" (white + sky blue) with a deep-navy dark mode, seen through
translucent, light-catching **glass** surfaces that float over soft **ambient light fields**
and the 3D engine. Modern, calm, tactile. Motion stays on the GPU (transform/opacity only).

Source of truth: `src/app/globals.css` (colour tokens, materials, buttons, chips, fallbacks),
`tailwind.config.ts` (token wiring), `src/components/ui/AmbientField.tsx`, `src/components/ui/GlassSheen.tsx`,
`src/lib/motion.ts` + `src/app/motion.css` (motion tokens).

---

## 0. Theme: light by default, dark on request

- The site is **light** (white + sky blue). A `ThemeToggle` switches to a **dark** (deep navy) scheme. The scheme is a `dark` class on `<html>` (not `data-theme`, a legacy hook). `src/lib/theme.ts` owns it: the choice lives in `sessionStorage` only (no cookies, no localStorage), with no stored choice it follows `prefers-color-scheme`, and an inline script in `layout.tsx` applies it before first paint. The switch is a circular View Transition from the toggle (instant under reduced motion or without the API). Components that must follow it read `useColorScheme()` (`src/lib/useColorScheme.ts`, watches the `<html>` class; "light" during SSR). The WebGL scene reads it too, so it never remounts.
- **Colour tokens are CSS channel variables** (`--ink: R G B`, light in `:root`, dark in `html.dark`, both in `globals.css`), wired in `tailwind.config.ts` as `rgb(var(--x) / <alpha-value>)`, so `bg-ink/90`, `text-bone/[0.21]` etc. keep working. **Use the token, never a hex.**
- **Names are legacy from the old dark theme, and they are semantic, not literal.** `ink` = ground/surface, `bone` = primary text, `ash`/`muted` = secondary text. In light, `bg-ink` is the near-white page and `text-bone` is deep navy.

| Token | Light | Dark | Role |
|---|---|---|---|
| `ink` | `#F7FAFE` | `#0A1220` | Page ground. `ink-900` (`#FFFFFF` / `#131F35`) and `ink-850`…`ink-500` step toward raised surfaces |
| `bone` | `#15315A` | `#E6EDF7` | Primary text (`bone-50…300` are text/line shades) |
| `ash` | `#52698A` | `#9CADC6` | Secondary text |
| `muted` | `#4A5F7E` | `#A9B8CE` | Secondary text (a touch stronger than `ash`) |
| `aqua` | `#2A6BBF` | `#5B9DEB` | **The one accent** (friendly blue): focus rings, fills, rails, links. `aqua-deep`, `aqua-glow`, `aqua-hi` are its shades |
| `signal` | `#9CCBF6` | `#7FB2EE` | Soft blue highlight / alert marker (no longer orange). `signal-deep` = `#2A6BBF` / `#7FB2EE`, the text-safe one |
| `live` | `#1F7A50` | `#4CC38A` | "Live / ok" green |
| `hairline` | `#D6E4F4` | `#2A3C5A` | Dividers (decorative only) |
| `sand` · `amber` · `ember` | pale blues | navy lifts | Ambient tints, decorative only, never text |

- Contrast (WCAG AA) tables for both schemes sit beside the values in `globals.css`. Light: bone on ink 12.4:1, ash on ink 5.4:1, aqua on ink 5.1:1. Dark: bone on ground ~15.9:1, ash ~8.2:1, aqua ~6.5:1. Ink text on an aqua fill passes in both. Recheck both schemes when you add a pairing.
- `muted` is fine on both schemes now (it was "never on dark" in the old theme).
- Buttons come in two sizes only: `.btn` (50px, in-page CTAs) and `.btn btn-sm` (44px, for nav, footer, legal and utility use). **There is one primary look:** `btn-ink`, `btn-bone`, `btn-signal` and `btn-aqua` all resolve to the same sky-gradient capsule with a deep-blue label (a deeper-blue-edged variant in dark). Pick by intent, not by colour. `btn-line` / `btn-line-dark` are the quiet hairline secondary.
- Section labels: always `<SectionHeader>` or `<SectionChip index label />` (number · accent dot · label).
- **Backdrop:** `<Stage>` = ground (`bg-ink` with soft `amber`/`sand` pools) → `<LightThreads>` (a page-wide strand bundle, one shader at reduced resolution, dimmed over the reading column, stopped by Pause) → **architecture film** → `<Engine3D>`. The film ships pre-rendered in two files (`architecture-v2-light.*` and `architecture-v2.*`) and the two layers cross-fade by scheme; only the visible one plays. There is no CSS filter on video (a per-frame `invert/hue-rotate` was removed as a GPU cost). The old hero film is gone. `AmbientField` is a translucent ink wash (`bg-ink/[0.86]`) with static blue orbs, so the threads glow faintly through opaque sections. Under reduced motion the Stage renders nothing.
- The hero shows the product working via `HeroFlowCard`, captioned as an illustration (FTC).

## 1. Materials

| Class | Use | Notes |
|---|---|---|
| `glass` | Frosted glass (real backdrop blur) | Nav, chips, small/medium panels over *detailed* backdrops (3D, video, photos) |
| `glass-dark` | Same material, slightly bluer and denser | Legacy name kept so old markup re-themed in place. Both are light in the light scheme; `html.dark` overrides re-tint both |
| `+ glass-flat` | Same look, **no blur** (cheap) | Large surfaces; anything inside a 3D transform; surfaces over soft gradients |
| `+ glass-solid` | Denser tint | Any panel that holds body text or small text |

Rules
- **Shape is separate:** add `rounded-glass-sm` (14px) · `rounded-glass` (22px) · `rounded-glass-lg` (30px) · `rounded-full` (capsules).
- **Never put real blur (`backdrop-filter`) inside a `preserve-3d` chain** or on a 3D root — it flattens the 3D. Use `glass-flat` there.
- **Never put `overflow-hidden` on a `preserve-3d` element** — same flattening. Round corners with radius on the element and its corner children instead.
- **Never put `glass`/`glass-dark` (even with `glass-flat`) on an element that itself has `preserve-3d`.** The material sets `isolation: isolate`, a grouping property that forces `transform-style: flat`. Use the material only on leaf layers inside the 3D chain.
- **Responsive blur removal:** `max-lg:glass-flat` works (the flat rules are one selector each); `max-lg:[backdrop-filter:none] max-lg:[-webkit-backdrop-filter:none]` also works and keeps the current tint.
- `glass-solid` + `glass-flat` together keep the dense tint (for text-heavy panels without blur).
- **Blur budget:** at most ~4 real-blur surfaces visible at once, and avoid real blur on surfaces larger than ~40% of the viewport. Prefer `glass-flat` for big panels.
- `--glass-blur` (default 22px) can be lowered per element, e.g. `[--glass-blur:14px]`.
- The `::before` (specular rim) and `::after` (pointer sheen) pseudo-elements belong to the material. Don't add your own `::before/::after` to a glass element.
- Fallbacks are automatic: no backdrop-filter support, `prefers-reduced-transparency`, and `prefers-contrast: more` all switch to solid panels.

## 2. Ambient light fields

Glass needs depth behind it. Every **opaque** section is `relative isolate overflow-hidden` (use `overflow-clip` when it contains a sticky/pinned stage: `overflow-hidden` makes the section the sticky element's scroll container and the pin stops working) and
renders `<AmbientField variant={0|1|2} />` (`tone` is accepted but ignored; the field re-tints through the tokens) as its first child, *instead of*
`bg-bone`/`bg-ink` on the section. Vary `variant` between neighbouring sections.
Transparent chapters (hero and its stage-backed neighbours) sit over the 3D stage and don't need one.
Fields are static by design (moving light under blurred glass is expensive).

## 3. Shape & layout
- Cards/panels: `rounded-glass` or `rounded-glass-lg`, comfortable padding (`p-5 sm:p-7`).
- Buttons, tabs, toggles, chips, pagination dots: **capsules** (`rounded-full`).
- Hairline grids/dividers from the old Swiss style: replace with spacing + glass panels, or soften to `border-white/40` (light) / `border-white/10` (dark). No sharp black 1px boxes.
- Gaps between glass cards: `gap-3`–`gap-4`.

## 4. Buttons & chips
| Class | Use |
|---|---|
| `btn-aqua` (also `btn-ink`, `btn-bone`, `btn-signal`: identical look) | Primary. Max one per view |
| `btn-line` / `btn-line-dark` | Secondary: hairline capsule, translucent fill |
| `chip` / `chip-dark` | Small glass capsule for labels, status, indices |

All are capsules with a soft top-light hover. Text is sentence case, sans, medium — **no
uppercase mono on buttons**. Minimum 44×44px touch target.

## 5. Typography
- `font-display` = **Source Serif 4** (`next/font/local`, `src/app/fonts.ts`), weight 600. `globals.css` sets every `h1`–`h6` to it, so don't re-declare it on headings.
- `font-serif italic` (same Source Serif 4 italic) = **only** for 1–3 accent words inside a headline.
- Body: `font-sans` = **Work Sans** (set on `p`, `li`). Eyebrows: `.eyebrow` (sentence case, 13px, medium) — often inside a `chip`.
- `font-mono` (Geist Mono) only for genuinely tabular/technical bits (timestamps, codes, phone numbers, small KPI deltas). No more all-caps mono labels as decoration.
- Section index style: `chip` containing e.g. `02 · Built for` instead of `(02) —— BUILT FOR`.

## 6. Colour & contrast
- Palette and per-scheme values: the token table in §0. Use tokens, not hex; ambient tints (`sand`, `amber`, `ember`) are decorative only, never text.
- **No purple, indigo or neon gradients. No orange**: the old signal orange is gone; `signal` is now a soft blue.
- WCAG 2.1 AA in **both** schemes: body text ≥ 4.5:1, large text ≥ 3:1 **against the worst-case backdrop**.
  Body/small text on glass → use `glass-solid`. For accent *text* use `text-aqua` or `text-signal-deep`, never the pale `signal` fill colour.

## 7. Motion

The page is a set of **tabs**, not one long scroll. Motion is built for that.

**Tokens** (never invent ad-hoc curves)
- `src/lib/motion.ts`: springs `snappy` (controls, tabs, magnetic hover; 320/26/0.5), `smooth` (panels, cards, flips; 140/24/0.8), `cinematic` (scroll-linked 3D; overdamped 170/26/0.5, so scenes trail a flick by ~150ms); `EASE_EDITORIAL` = cubic-bezier(0.22, 1, 0.36, 1); `HERO_BEATS`, the hero's timeline (0 → 1 over its 150vh track), read by **HeroChapter** (copy), **Stage** (film) and **Engine3D** (sculpture + camera) so the 3D never drifts from the words. Change beats there only.
- `src/app/motion.css`: `--dur-fast` 150ms (press, small flips), `--dur-base` 250ms (hover, focus, colour, fades), `--dur-slow` 450ms (panels, larger moves); Tailwind `duration-fast|base|slow` and `ease-editorial` map to the same values. Under reduced motion the durations collapse to 1ms. A zero-specificity `:where()` rule gives every interactive element a 250ms colour transition; `.btn`/`transition-*` win over it.
- Animate only `transform` and `opacity`. No animating blur, width/height/top/left, or colour in JS.

**Tabs model** (`TabsContext`, `TabPanels`)
- One section on screen at a time. All panels stay mounted (`hidden`), so calculator inputs, dashboard view and simulator step survive a round trip.
- A swap is a **crossfade only**: panel area fades out over 150ms (ease-in), the page resets to scroll 0 while nothing is visible, then fades in over 250ms (editorial). No container transform, so sticky stages and 3D contexts at rest behave normally. Interruptible: a newer pick cancels the older one.
- A **visit counter** is bumped on every open. **First visit = full entrance** (`Reveal` 0.6s with a 16px rise, `RevealLines` mask slide, stagger). **Repeat visits = quick entrance**: 0.3s, at most 8px rise, no delay or stagger (`RevealLines` fades as one block). `Reveal`, `RevealLines` and `TiltCard` all key off `useVisitReveal`, which re-arms a fresh observer per visit after the scroll reset. Visited state is in memory only.
- **A tab must look finished at scroll 0.** Scroll may add something, never gate content.
- **No scroll-jacking.** Scroll scrubbing is flourish only. The missed-call simulator plays on a clock (play/pause/step) with a scrub rail; it does not hang on scroll.
- Scroll-driven pieces: the **Home hero** is a 150vh scene (sticky 100svh stage, motion-safe only). The **Dashboard** pins only where it can render near full size (`pin:` variant, ≥1280×840, motion allowed): a 200vh track whose scroll only explodes and reassembles the layers; the entrance there is time-based. Every other tab is unpinned.

**Reduced motion and Pause**
- Reduced motion = **opacity only, never translate** (first and repeat visits alike); no WebGL stage; no pinned scenes. `src/app/globals.css` also clamps CSS animation/transition durations.
- **Always pass a style object to a `motion` element, never swap `style` to `undefined`.** Framer leaves the last inline values behind, and the reduce flag only turns true after mount, so hero copy was stranded at opacity 0. Write `style={reduce ? { opacity: 1 } : { opacity: copyOpacity }}`.
- The footer **Pause animations** control (WCAG 2.2.2) is reachable from every tab. While paused, `html[data-motion-paused="true"]` freezes CSS keyframe loops (`animate-live-pulse`, `animate-scroll-cue`, …); JS/WebGL/video loops must read `useMotionPause()`.

**Controls and cards**
- `MagneticButton` leans toward a mouse cursor on `snappy`: capped at **5px horizontal / 3px vertical** (size-independent; label leads by 35% of that), presses to 0.97. It owns `transform`, so colour/border/shadow ease at 250ms via explicit classes instead of the `.btn` CSS transform transition. Touch and pen never pull.
- `TiltCard` (3D tilt + glare, `smooth` spring): pointer handlers sit on its **untransformed outer wrapper**, because a tilted layer's hit area moves out from under the cursor and pointerenter/leave fire in a loop (shiver). Its **3D entrance wrapper is `pointer-events-none`** and the inner tilt layer is `pointer-events-auto`; without that, the entrance's `preserve-3d` layer eats clicks aimed at tilted cards. The card is flat (`stage-flat`) at rest and only becomes a 3D stack while tilting, for sharp text.

**Focus and scroll padding**
- `html` has `scroll-padding-top: 5.5rem` so focused controls and anchors clear the sticky header (WCAG 2.4.11). But the header's own controls already sit in that band, so focusing one made the browser scroll to "clear" a header that was on screen. `html:has(header:focus-within) { scroll-padding-top: 0 }` (and `header [id] { scroll-margin-top: 0 }`) switches it off while focus is inside the header.

## Process

Work lands through the agent pipeline in `CLAUDE.md` (planner → coder → inspector → deep-reviewer for scroll, WebGL and choreography). The ticket history, rules and verdicts are in `docs/GAME-PLAN.md`; each ticket's plan is in `docs/plans/` (T1 dashboard, T2 simulator, T3/T3b WebGL, T4 hero, T5–T6 tabs and CTAs, T7 light film). Read the relevant plan before changing that area.

## 8. Don'ts
- Don't change copy, ids, aria attributes, data, or behaviour when restyling.
- Don't stack glass on glass on glass (max 2 levels).
- Don't use glass for long-form reading areas (legal pages): use `glass-solid` or plain bone.
