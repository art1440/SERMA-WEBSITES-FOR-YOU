"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { DemoImage } from "@/data/demos";
import { useDemoStill } from "../useDemoStill";

/**
 * Trueframe's signature: the hero kitchen is drawn before it is built.
 *
 * An inline SVG elevation of the kitchen (24 hand-placed rectangles and lines
 * on a faint grid, traced over the photo's composition) draws itself with
 * stroke-dashoffset, group by group; then the finished photo wipes in over it,
 * left to right, via clip-path, led by a 6px safety-orange edge that fades out
 * once the wipe lands. The dimension strings stay around the frame and three
 * keynote tags land on the photo, so the "drawing" is still there when the
 * job is done.
 *
 * Timeline (all CSS animations, started by the server-rendered markup, so the
 * sequence begins at first paint, not at hydration; nothing loops):
 *   0.00-1.60 s  linework draws (5 groups, 0.15 s apart, 1.0 s each)
 *   0.20-1.10 s  dimension lines extend (transform), labels fade in 0.9-1.3 s
 *   1.75-2.85 s  photo wipes in (clip-path inset), edge travels with it (transform)
 *   2.85-3.30 s  orange edge fades (opacity); keynote tags fade in 2.85-3.25 s
 *   ~3.30 s      every animation has finished -> data-state="rest"
 * At rest (and from the start when reduced motion or Pause is on) the photo is
 * unclipped, the linework is visibility:hidden behind it and nothing animates.
 * No React state changes per frame: one state flip when the sequence ends.
 *
 * Sizing: the frame has the photo's own aspect ratio (1344:752), so the image
 * is drawn at exactly the frame width, never wider than its 1344px source
 * (the hero caps the frame well below that at every breakpoint).
 *
 * Everything decorative (linework, dimensions, keynote tags) is aria-hidden;
 * the photo's alt text carries the picture and the keynote legend is real text.
 */

const LINE = "#9BB8E0";
const EASE_DRAW = "cubic-bezier(.45,0,.2,1)";
const EASE_WIPE = "cubic-bezier(.65,0,.25,1)";

const CSS = `
.tf-draw{stroke-dasharray:1 1;stroke-dashoffset:1;animation:tf-draw 1s ${EASE_DRAW} var(--d,0s) both}
@keyframes tf-draw{to{stroke-dashoffset:0}}
.tf-wipe{clip-path:inset(0 100% 0 0);animation:tf-wipe 1.1s ${EASE_WIPE} 1.75s forwards}
@keyframes tf-wipe{to{clip-path:inset(0 0 0 0)}}
.tf-track{transform:translateX(0);animation:tf-track 1.1s ${EASE_WIPE} 1.75s forwards}
@keyframes tf-track{to{transform:translateX(100%)}}
.tf-edge{opacity:0;animation:tf-edge 1.55s linear 1.75s forwards}
@keyframes tf-edge{0%,71%{opacity:1}100%{opacity:0}}
.tf-dimx{transform:scaleX(0);animation:tf-grow .9s ${EASE_DRAW} var(--d,0s) forwards}
.tf-dimy{transform:scaleY(0);animation:tf-grow .9s ${EASE_DRAW} var(--d,0s) forwards}
@keyframes tf-grow{to{transform:none}}
.tf-fade{opacity:0;animation:tf-fade .4s ease-out var(--d,0s) forwards}
@keyframes tf-fade{to{opacity:1}}
[data-signature="contractor"][data-state="rest"] [data-linework]{visibility:hidden}
`;

type Seg = { d: string };
/**
 * The elevation, in the photo's own coordinates (1344 x 752), so the photo
 * lands on top of its own drawing. 24 elements in 5 drawing groups.
 */
const GROUPS: Seg[][] = [
  // 0 - floor, tall pantry wall and the doorway
  [{ d: "M0 704H1344" }, { d: "M18 58H226V690H18Z" }, { d: "M98 182H190V636H98Z" }, { d: "M236 184H386V528H236Z" }],
  // 1 - upper cabinet run and the hood
  [
    { d: "M410 140H1034V328H410Z" },
    { d: "M630 140V328" },
    { d: "M815 140V328" },
    { d: "M630 266H815" },
    { d: "M520 140V328" },
    { d: "M925 140V328" },
  ],
  // 2 - counters and the base run
  [{ d: "M400 404H1344" }, { d: "M956 412H1344V532H956Z" }, { d: "M640 394H808V420H640Z" }],
  // 3 - island and stools
  [
    { d: "M328 440H956V706H328Z" },
    { d: "M328 470H956" },
    { d: "M406 508H550V550H406Z" },
    { d: "M586 508H726V550H586Z" },
    { d: "M750 508H900V550H750Z" },
  ],
  // 4 - pendants and the window
  [
    { d: "M533 14V150" },
    { d: "M474 226Q474 150 533 150Q592 150 592 226Z" },
    { d: "M790 14V150" },
    { d: "M731 226Q731 150 790 150Q849 150 849 226Z" },
    { d: "M1080 70H1344V400H1080ZM1140 70V400M1212 70V400M1080 172H1344" },
  ],
];

/** Keynote tag positions on the frame, in % (left, top). */
const TAGS: [number, number][] = [
  [45.5, 23],
  [66, 64],
  [91, 15],
];

type Props = {
  image: DemoImage;
  alt: string;
  dims: { overall: string; height: string; island: string };
  keynotes: string[];
  keynotesLabel: string;
  /** `sizes` for the photo. */
  sizes: string;
  className?: string;
};

function delay(s: number): CSSProperties {
  return { "--d": `${s}s` } as CSSProperties;
}

const DIM_LABEL = "bg-[#0F2440] px-1.5 text-[0.8125rem] font-medium leading-none tracking-[0.02em] text-[#C4D5EC] tabular-nums sm:text-[0.875rem]";

/** A horizontal dimension line with architectural slash ticks and its string in a gap. */
function DimX({ label, live, d, className }: { label: string; live: boolean; d: number; className: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute flex items-center ${className}`}>
      <span className={`absolute inset-x-0 top-1/2 h-px origin-center bg-[#9BB8E0] ${live ? "tf-dimx" : ""}`} style={live ? delay(d) : undefined} />
      <span className="absolute left-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#9BB8E0]" />
      <span className="absolute right-0 top-1/2 h-3 w-px -translate-y-1/2 bg-[#9BB8E0]" />
      <span className="absolute left-0 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 translate-x-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className={`relative mx-auto ${DIM_LABEL} ${live ? "tf-fade" : ""}`} style={live ? delay(d + 0.7) : undefined}>
        {label}
      </span>
    </div>
  );
}

/** The vertical dimension, string turned to read bottom-to-top. */
function DimY({ label, live, d, className }: { label: string; live: boolean; d: number; className: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute flex items-center justify-center ${className}`}>
      <span className={`absolute inset-y-0 left-1/2 w-px origin-center bg-[#9BB8E0] ${live ? "tf-dimy" : ""}`} style={live ? delay(d) : undefined} />
      <span className="absolute left-1/2 top-0 h-px w-3 -translate-x-1/2 bg-[#9BB8E0]" />
      <span className="absolute bottom-0 left-1/2 h-px w-3 -translate-x-1/2 bg-[#9BB8E0]" />
      <span className="absolute left-1/2 top-0 h-px w-3 -translate-x-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className="absolute bottom-0 left-1/2 h-px w-3 -translate-x-1/2 -rotate-45 bg-[#9BB8E0]" />
      <span className={`relative -rotate-90 whitespace-nowrap ${DIM_LABEL} ${live ? "tf-fade" : ""}`} style={live ? delay(d + 0.7) : undefined}>
        {label}
      </span>
    </div>
  );
}

export function BlueprintHero({ image, alt, dims, keynotes, keynotesLabel, sizes, className }: Props) {
  const still = useDemoStill();
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const live = !still && !done;

  // One state flip when every animation in the figure has finished (or been
  // cancelled). getAnimations() also catches a sequence that already ran out
  // before hydration; the timer is a backstop for a browser without it.
  useEffect(() => {
    if (still || done) return;
    const el = ref.current;
    let cancelled = false;
    const finish = () => {
      if (!cancelled) setDone(true);
    };
    const backstop = window.setTimeout(finish, 4500);
    if (el && typeof el.getAnimations === "function") {
      const anims = el.getAnimations({ subtree: true });
      Promise.allSettled(anims.map((a) => a.finished)).then(finish);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(backstop);
    };
  }, [still, done]);

  let i = 0;
  return (
    <figure ref={ref} data-signature="contractor" data-state={live ? "drawing" : "rest"} className={className}>
      <style>{CSS}</style>
      {/* Frame, with room around it for the dimension strings. */}
      <div className="relative mb-9 ml-6 mt-7 sm:mb-10 sm:ml-10 sm:mt-9">
        <div className="relative aspect-[1344/752] overflow-hidden bg-[#0F2440] outline outline-1 outline-offset-0 outline-[#9BB8E0]/45">
          <svg
            data-linework=""
            aria-hidden="true"
            viewBox="0 0 1344 752"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            <defs>
              <pattern id="tf-grid" width="48" height="47" patternUnits="userSpaceOnUse">
                <path d="M48 0H0V47" stroke={LINE} strokeOpacity="0.16" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </pattern>
            </defs>
            <rect width="1344" height="752" fill="url(#tf-grid)" />
            {GROUPS.map((group, g) =>
              group.map((seg) => (
                <path
                  key={i++}
                  d={seg.d}
                  pathLength={1}
                  stroke={LINE}
                  strokeWidth={1.5}
                  strokeLinejoin="miter"
                  vectorEffect="non-scaling-stroke"
                  className={live ? "tf-draw" : undefined}
                  style={live ? delay(g * 0.15) : undefined}
                />
              )),
            )}
          </svg>
          <div data-photo="" className={`absolute inset-0 ${live ? "tf-wipe" : ""}`}>
            <img
              src={image.src}
              srcSet={`${image.small} 640w, ${image.src} ${image.width}w`}
              sizes={sizes}
              width={image.width}
              height={image.height}
              alt={alt}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          {live && (
            <div aria-hidden="true" className="tf-track pointer-events-none absolute inset-0">
              <span className="tf-edge absolute inset-y-0 -left-[3px] w-[6px] bg-[#FF7A1A]" />
            </div>
          )}
          {TAGS.map(([x, y], n) => (
            <span
              key={n}
              aria-hidden="true"
              className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-[#FF7A1A] bg-[#0F2440] text-[0.75rem] font-medium leading-none text-[#E9F0FA] sm:h-7 sm:w-7 sm:text-[0.8125rem] ${live ? "tf-fade" : ""}`}
              style={{ left: `${x}%`, top: `${y}%`, ...(live ? delay(2.85 + n * 0.1) : {}) }}
            >
              {n + 1}
            </span>
          ))}
        </div>
        <DimX label={dims.overall} live={live} d={0.2} className="bottom-full left-0 right-0 h-7 sm:h-9" />
        <DimY label={dims.height} live={live} d={0.35} className="right-full top-0 bottom-0 w-6 sm:w-10" />
        {/* The island, 24.4% - 71.1% of the frame. */}
        <DimX label={dims.island} live={live} d={0.5} className="left-[24.4%] right-[28.9%] top-full h-9 sm:h-10" />
      </div>
      <figcaption className="ml-6 sm:ml-10">
        <span className="sr-only">{keynotesLabel}: </span>
        <ol className="grid gap-x-6 gap-y-1.5 text-[0.875rem] leading-snug text-[#C4D5EC] sm:grid-cols-3">
          {keynotes.map((k, n) => (
            <li key={n} className="flex gap-2.5">
              <span
                aria-hidden="true"
                className="mt-px flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border border-[#FF7A1A] text-[0.6875rem] font-medium leading-none text-[#E9F0FA]"
              >
                {n + 1}
              </span>
              <span>{k}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
