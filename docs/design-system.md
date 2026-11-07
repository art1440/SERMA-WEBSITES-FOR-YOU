# SermaWebDesign — Liquid Glass Design System

The site's visual language: warm brand colours (ink · bone · signal orange) seen through
translucent, light-catching **glass** surfaces that float over soft **ambient light fields**
and the 3D engine. Modern, calm, tactile. Motion stays on the GPU (transform/opacity only).

Source of truth: `src/app/globals.css` (materials, buttons, chips, fallbacks),
`tailwind.config.ts` (tokens), `src/components/ui/AmbientField.tsx`, `src/components/ui/GlassSheen.tsx`,
`src/lib/motion.ts` (motion tokens).

---

## 1. Materials

| Class | Use | Notes |
|---|---|---|
| `glass` | Light frosted glass (real backdrop blur) | Nav, chips, small/medium panels over *detailed* backdrops (3D, video, photos) |
| `glass-dark` | Dark frosted glass (real backdrop blur) | Same, on dark sections |
| `+ glass-flat` | Same look, **no blur** (cheap) | Large surfaces; anything inside a 3D transform; surfaces over soft gradients |
| `+ glass-solid` | Denser tint | Any panel that holds body text or small text |

Rules
- **Shape is separate:** add `rounded-glass-sm` (14px) · `rounded-glass` (22px) · `rounded-glass-lg` (30px) · `rounded-full` (capsules).
- **Never put real blur (`backdrop-filter`) inside a `preserve-3d` chain** or on a 3D root — it flattens the 3D. Use `glass-flat` there.
- **Never put `overflow-hidden` on a `preserve-3d` element** — same flattening. Round corners with radius on the element and its corner children instead.
- **Blur budget:** at most ~4 real-blur surfaces visible at once, and avoid real blur on surfaces larger than ~40% of the viewport. Prefer `glass-flat` for big panels.
- `--glass-blur` (default 22px) can be lowered per element, e.g. `[--glass-blur:14px]`.
- The `::before` (specular rim) and `::after` (pointer sheen) pseudo-elements belong to the material. Don't add your own `::before/::after` to a glass element.
- Fallbacks are automatic: no backdrop-filter support, `prefers-reduced-transparency`, and `prefers-contrast: more` all switch to solid panels.

## 2. Ambient light fields

Glass needs depth behind it. Every **opaque** section is `relative isolate overflow-hidden` and
renders `<AmbientField tone="light|dark" variant={0|1|2} />` as its first child, *instead of*
`bg-bone`/`bg-ink` on the section. Vary `variant` between neighbouring sections.
Transparent chapters (hero, system, finale) sit over the 3D stage and don't need one.
Fields are static by design (moving light under blurred glass is expensive).

## 3. Shape & layout
- Cards/panels: `rounded-glass` or `rounded-glass-lg`, comfortable padding (`p-5 sm:p-7`).
- Buttons, tabs, toggles, chips, pagination dots: **capsules** (`rounded-full`).
- Hairline grids/dividers from the old Swiss style: replace with spacing + glass panels, or soften to `border-white/40` (light) / `border-white/10` (dark). No sharp black 1px boxes.
- Gaps between glass cards: `gap-3`–`gap-4`.

## 4. Buttons & chips
| Class | Use |
|---|---|
| `btn-ink` | Primary on light backgrounds |
| `btn-bone` | Primary on dark backgrounds |
| `btn-line` / `btn-line-dark` | Secondary — glass capsule |
| `btn-signal` | Accent CTA (max one per view) |
| `chip` / `chip-dark` | Small glass capsule for labels, status, indices |

All are capsules with a soft top-light hover. Text is sentence case, sans, medium — **no
uppercase mono on buttons**. Minimum 44×44px touch target.

## 5. Typography
- `font-display` = Geist at weight ~580 with tight tracking (headlines, big numbers).
- `font-serif italic` (Instrument Serif) = **only** for 1–3 accent words inside a headline.
- Body: `font-sans` (Geist). Eyebrows: `.eyebrow` (sentence case, 13px, medium) — often inside a `chip`.
- `font-mono` only for genuinely tabular/technical bits (timestamps, codes, phone numbers, small KPI deltas). No more all-caps mono labels as decoration.
- Section index style: `chip` containing e.g. `02 · Built for` instead of `(02) —— BUILT FOR`.

## 6. Colour & contrast
- Palette: ink `#0D0D0B`, bone `#F1EDE4`, muted `#5C584F` (light text secondary), ash `#A8A296` (dark text secondary), signal `#E5582A`, signal-deep `#B23F14`.
  Ambient tints (`sand`, `amber`, `ember`) are decorative only — never text.
- **No purple, indigo or neon gradients.**
- WCAG 2.1 AA: body text ≥ 4.5:1, large text ≥ 3:1 **against the worst-case backdrop**.
  Body/small text on glass → use `glass-solid`. Signal orange text on light → use `text-signal-deep`.

## 7. Motion
- Tokens in `src/lib/motion.ts`: `snappy` (controls), `smooth` (panels/cards), `cinematic` (scroll/3D).
- Animate only `transform` and `opacity`. No animating blur, width/height/top/left, or colour.
- Respect `prefers-reduced-motion` (already global) and the "Pause animations" control.

## 8. Don'ts
- Don't change copy, ids, aria attributes, data, or behaviour when restyling.
- Don't stack glass on glass on glass (max 2 levels).
- Don't use glass for long-form reading areas (legal pages): use `glass-solid` or plain bone.
