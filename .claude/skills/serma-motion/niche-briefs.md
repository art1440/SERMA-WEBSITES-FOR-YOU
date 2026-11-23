# Niche briefs: the six demo sites

Each demo has one signature, and every other section on the page either echoes its motif or stays still. Contractor and Home services are the model: nothing moves except the signature. Barbershop, Salon, Beauty and Restaurant also put a fade-and-rise helper on most sections, so check the budget before adding anything there.

| Demo (`/work/<id>`) | Business | Signature (where) | Motif to echo once | Tempo |
|---|---|---|---|---|
| `barbershop` | Ironside Barber Co. | `RazorCutHero` (hero): the headline is cut at −6° by a brass line drawn with `scaleX`, and the two halves split apart on scroll | A 2px brass `#C9A45C` hairline at −6°, or the dotted `Leader` inking in | Sharp, short, decisive. No soft drifts beyond what's there. |
| `salon` | Maison Lumière | `ColourRibbon` (`#shades`): the swatch band pans with scroll and the swatch under the centre retints the page through `--salon-accent` / `--salon-ink` | The accent retint (consumers transition over 400 ms), or an underline in `--salon-accent` | Fluid, warm, slow settle. |
| `beauty` | Velvet Room | `MaskWindows` (`#treatments`): pill-shaped `clip-path` windows open into rounded photos, with the image settling 1.12 → 1 | One rounded-window reveal, or a slow settle from a slight zoom | Slow and soft (1.3 s hero lines). Nothing snappy. |
| `restaurant` | Ember & Oak | `MenuPlating` (`#menu`): each course is set down from just above, heading first, then items, then photos | One item set down (y −14 → 0, scale 1.02 → 1) | Unhurried, like courses arriving. |
| `contractor` | Trueframe Builders | `BlueprintHero` (hero): SVG linework draws with `stroke-dashoffset`, then the photo wipes in with `clip-path` behind a safety-orange edge | A dimension line extending (transform), or a sheet tag | Precise, mechanical, linear-feeling, done in about 3.3 s. Everything else is static drawings. |
| `service` | Brightline Home | `BeforeAfterSlider` (`#work`): a drag handle splits before and after, with one hint sweep 50 → 62 → 50 on first view | The yellow `#FFD23F` highlighter stroke under a phrase | Practical and immediate. Feedback only; nothing decorative. |

## Writing a brief for a new or rebuilt signature

A brief is specific enough when it fills in every line below. "Make it premium" fills in none of them. Return the brief for approval before building anything.

```
Business / niche:   <name>, <what they sell>, <who books>
Signature idea:     <one sentence: what the motion MEANS for this business>
                    (razor cuts the headline; the kitchen is drawn before it's built)
Where:              <hero | one named section>, and why there
Layers:             <back / subject / front, or "single layer">
Trigger:            <load | first view | scroll range "start start -> end start" | drag>
Timeline (ms):      <element  start-end  property  from -> to>
Mobile (< 768px):   <what is cut or simplified, e.g. parallax halved, no pin>
Still state:        <exact final frame under reduced motion or Pause>
Banned here:        <fade-up on every block, word-split body copy, ...>
Done when:          <data-state reaches "rest"; demo:<id> check passes; screenshots at 1280 and 390 match the brief>
```
