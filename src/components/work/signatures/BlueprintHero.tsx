"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { HeroBackdrop } from "@/components/work/motion";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";

/**
 * Trueframe's signature, at hero scale: the kitchen is drawn before it is built.
 *
 * The signature IS the hero backdrop. Put it as the first child of a
 * `relative isolate overflow-hidden` hero section: it fills the section
 * (absolute, inset 0, -z-10) and the section's own markup (h1, CTAs) sits over
 * it in normal flow. Three layers, bottom to top:
 *   [data-photo]     the kit's HeroBackdrop (full-width photo + scrims), wiped
 *                    in left to right with clip-path;
 *   [data-linework]  a faint drafting grid and a fine trace of the room (island,
 *                    counter, hood, pendants) with three dimension strings and
 *                    two annotations, laid exactly over the photo;
 *   a 3px safety-orange edge that travels with the wipe.
 *
 * Timeline (CSS animations, started by the server-rendered markup, so the
 * sequence begins at first paint, not at hydration; nothing loops):
 *   0.10-1.45 s  the trace draws over the navy (4 groups, 0.15 s apart)
 *   0.60-1.75 s  dimension lines and leaders draw; strings fade in 1.15-1.95 s
 *   1.90-3.10 s  the photo wipes in under the drawing, the orange edge leading
 *   3.40-4.10 s  the drawing fades away, so the headline reads on the photo
 *   ~4.1 s       every animation has finished -> data-state="rest"
 * At rest (and from the start under reduced motion, Pause or capture) the photo
 * is unclipped and fully opaque, and [data-linework] is visibility:hidden. One
 * React state flip when the sequence ends; no per-frame state.
 *
 * Alignment: the trace is drawn in the photo's own pixels (1600 x 1067) on a
 * box that reproduces the photo's object-fit: cover + object-position (CSS
 * container units against the same parallax plane HeroBackdrop uses), and that
 * plane gets the same scroll drift and load settle, so the lines sit on the
 * island, the hood and the pendants at every viewport.
 *
 * Everything in the drawing is decorative (aria-hidden); the photo's alt text
 * carries the picture.
 */

const VB_W = 1600;
const VB_H = 1067;
const RATIO = (VB_W / VB_H).toFixed(5);
const LINE = "#9BB8E0";
const EASE_DRAW = "cubic-bezier(.45,0,.2,1)";
const EASE_WIPE = "cubic-bezier(.65,0,.25,1)";
/** Must match HeroBackdrop's load settle so the drawing stays on the photo. */
const SETTLE = [0.22, 1, 0.36, 1] as const;

const CSS = `
.tf-draw{stroke-dasharray:1 1;stroke-dashoffset:1;animation:tf-draw .9s ${EASE_DRAW} var(--d,0s) both}
@keyframes tf-draw{to{stroke-dashoffset:0}}
.tf-wipe{clip-path:inset(0 100% 0 0);animation:tf-wipe 1.2s ${EASE_WIPE} 1.9s forwards}
@keyframes tf-wipe{to{clip-path:inset(0 0 0 0)}}
.tf-track{transform:translateX(0);animation:tf-track 1.2s ${EASE_WIPE} 1.9s forwards}
@keyframes tf-track{to{transform:translateX(100%)}}
.tf-edge{opacity:0;animation:tf-edge 1.5s linear 1.9s forwards}
@keyframes tf-edge{0%,80%{opacity:1}100%{opacity:0}}
.tf-fade{opacity:0;animation:tf-fade .4s ease-out var(--d,0s) forwards}
@keyframes tf-fade{to{opacity:1}}
.tf-out{animation:tf-out .7s cubic-bezier(.22,1,.36,1) 3.4s forwards}
@keyframes tf-out{to{opacity:0}}
.tf-box{container-type:size}
.tf-cover{--w:max(100cqw,calc(100cqh*${RATIO}));position:absolute;width:var(--w);height:calc(var(--w)/${RATIO});left:calc((100cqw - var(--w))*var(--tf-px-m));top:calc((100cqh - var(--w)/${RATIO})*var(--tf-py-m))}
@media (min-width:640px){.tf-cover{left:calc((100cqw - var(--w))*var(--tf-px));top:calc((100cqh - var(--w)/${RATIO})*var(--tf-py))}}
[data-signature="contractor"][data-state="rest"] [data-linework]{visibility:hidden}
`;

/** The faint drafting sheet under the trace (fades with it). */
const GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(155,184,224,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(155,184,224,0.08) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

/** The trace, in the photo's own pixels (1600 x 1067), in four drawing groups. */
const TRACE: string[][] = [
  // 0 - back counter, open shelf, backsplash edge and the plaster panel
  ["M760 604L1578 623", "M768 507H1145", "M1145 264V597", "M1388 248V515H1575"],
  // 1 - the island: slab top, slab edge, body
  ["M614 686L1048 748L1360 647L1000 622Z", "M614 686V700L1048 762L1360 657V647M1048 748V762", "M627 700V982L940 1067", "M952 748V1067"],
  // 2 - range hood
  ["M1212 256V372M1281 256V372", "M1212 372L1140 425H1344L1281 372Z", "M1140 425V432H1344V425"],
  // 3 - pendants: canopy, cord, shade
  [
    "M866 99H896M881 99V355M852 385L881 355L910 385Z",
    "M1000 151H1028M1014 151V369M989 396L1014 369L1040 396Z",
    "M1112 191H1140M1126 191V387M1104 412L1126 387L1148 412Z",
  ],
];

/** Dimension lines (with slash ticks and extension lines) and their string positions. */
const DIMS = {
  pendants: {
    d: "M881 240H1126M875 246L887 234M1008 246L1020 234M1120 246L1132 234",
    at: [
      [947.5, 240],
      [1070, 240],
    ],
  },
  island: { d: "M614 566H1360M614 576V676M1360 576V637M608 572L620 560M1354 572L1366 560", at: [[987, 566]] },
  height: { d: "M1560 226V836M1546 226H1574M1546 836H1574M1554 232L1566 220M1554 842L1566 830", at: [[1560, 531]] },
};

/** Annotation leaders: a dot on the feature, a dogleg, then the label (desktop only). */
const LEADERS: { d: string; dot: [number, number]; label: [number, number] }[] = [
  { d: "M1014 151L1052 118H1096", dot: [1014, 151], label: [1102, 118] },
  { d: "M1046 704L1088 842H1128", dot: [1046, 704], label: [1134, 842] },
];

type Props = {
  image: DemoImage;
  alt: string;
  dims: { pendants: string; island: string; height: string };
  labels: [string, string];
  /** object-position of the photo as fractions [x, y], from 640px up and below it. */
  focus: [number, number];
  mobileFocus: [number, number];
  /** Legibility scrims, passed to HeroBackdrop (they wipe in with the photo). */
  scrims: string[];
  parallax?: number;
};

function delay(s: number): CSSProperties {
  return { "--d": `${s}s` } as CSSProperties;
}

const pct = (x: number, y: number): CSSProperties => ({ left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` });
const CHIP = "absolute whitespace-nowrap bg-[#0F2440] leading-none text-[#C4D5EC]";

function Drawing({ dims, labels, parallax }: { dims: Props["dims"]; labels: Props["labels"]; parallax: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // The same drift and settle HeroBackdrop gives the photo, on a plane of the same box.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${parallax}%`]);
  let i = 0;
  const path = (d: string, at: number, width = 1.25) => (
    <path
      key={i++}
      d={d}
      pathLength={1}
      stroke={LINE}
      strokeWidth={width}
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
      className="tf-draw"
      style={delay(at)}
    />
  );
  return (
    <div ref={ref} className="absolute inset-0">
      <motion.div className="absolute inset-x-0 top-0 will-change-transform" style={{ y, bottom: `-${parallax}%` }}>
        <motion.div
          className="tf-box absolute inset-0"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: SETTLE }}
        >
          <div className="tf-cover">
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" fill="none">
              {TRACE.map((group, g) => group.map((d) => path(d, 0.1 + g * 0.15)))}
              {path(DIMS.pendants.d, 0.6, 1)}
              {path(DIMS.island.d, 0.75, 1)}
              {path(DIMS.height.d, 0.85, 1)}
              <g className="max-lg:hidden">
                {LEADERS.map((l, n) => (
                  <g key={n}>
                    {path(l.d, 0.9 + n * 0.15, 1)}
                    <circle cx={l.dot[0]} cy={l.dot[1]} r={4} fill="#FF7A1A" className="tf-fade" style={delay(0.9 + n * 0.15)} />
                  </g>
                ))}
              </g>
            </svg>
            {DIMS.pendants.at.map(([x, yy], n) => (
              <span
                key={`p${n}`}
                className={`${CHIP} tf-fade -translate-x-1/2 -translate-y-1/2 px-1 text-[0.75rem] font-medium tabular-nums sm:text-[0.8125rem]`}
                style={{ ...pct(x, yy), ...delay(1.15 + n * 0.08) }}
              >
                {dims.pendants}
              </span>
            ))}
            <span
              className={`${CHIP} tf-fade -translate-x-1/2 -translate-y-1/2 px-1.5 text-[0.8125rem] font-medium tabular-nums sm:text-[0.875rem]`}
              style={{ ...pct(DIMS.island.at[0][0], DIMS.island.at[0][1]), ...delay(1.3) }}
            >
              {dims.island}
            </span>
            <span
              className={`${CHIP} tf-fade -translate-x-1/2 -translate-y-1/2 -rotate-90 px-1.5 text-[0.8125rem] font-medium tabular-nums sm:text-[0.875rem]`}
              style={{ ...pct(DIMS.height.at[0][0], DIMS.height.at[0][1]), ...delay(1.4) }}
            >
              {dims.height}
            </span>
            {LEADERS.map((l, n) => (
              <span
                key={`l${n}`}
                className={`${CHIP} tf-fade -translate-y-1/2 px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[#E9F0FA] max-lg:hidden`}
                style={{ ...pct(l.label[0], l.label[1]), ...delay(1.35 + n * 0.15) }}
              >
                {labels[n]}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function BlueprintHero({ image, alt, dims, labels, focus, mobileFocus, scrims, parallax = 12 }: Props) {
  const still = useDemoStill();
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const live = !still && !done;

  // One state flip when the drawing's own CSS animations (tf-*) have finished or
  // been cancelled. getAnimations() also catches a sequence that already ran
  // out before hydration; the timer is a backstop for a browser without it.
  useEffect(() => {
    if (still || done) return;
    const el = ref.current;
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setDone(true);
    };
    const backstop = window.setTimeout(finish, 5000);
    if (el && typeof el.getAnimations === "function") {
      const anims = el.getAnimations({ subtree: true }).filter((a) => String((a as CSSAnimation).animationName ?? "").startsWith("tf-"));
      Promise.allSettled(anims.map((a) => a.finished)).then(finish);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(backstop);
    };
  }, [still, done]);

  const vars = {
    "--tf-px": focus[0],
    "--tf-py": focus[1],
    "--tf-px-m": mobileFocus[0],
    "--tf-py-m": mobileFocus[1],
  } as CSSProperties;
  const pos = (f: [number, number]) => `${f[0] * 100}% ${f[1] * 100}%`;

  return (
    <div
      ref={ref}
      data-signature="contractor"
      data-state={live ? "drawing" : "rest"}
      className="absolute inset-0 -z-10 overflow-hidden bg-[#0F2440]"
      style={vars}
    >
      <style>{CSS}</style>
      <div data-photo="" className={`absolute inset-0 isolate ${live ? "tf-wipe" : ""}`}>
        <HeroBackdrop image={image} alt={alt} position={pos(focus)} mobilePosition={pos(mobileFocus)} parallax={parallax} scrims={scrims} />
      </div>
      <div
        data-linework=""
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 overflow-hidden ${live ? "tf-out" : ""}`}
        style={GRID}
      >
        {live && <Drawing dims={dims} labels={labels} parallax={parallax} />}
      </div>
      {live && (
        <div aria-hidden="true" className="tf-track pointer-events-none absolute inset-0">
          <span className="tf-edge absolute inset-y-0 -left-[1.5px] w-[3px] bg-[#FF7A1A]" />
        </div>
      )}
    </div>
  );
}
