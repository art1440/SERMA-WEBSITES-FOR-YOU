"use client";

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { useDemoStill } from "../useDemoStill";

/**
 * Maison Lumière's signature: a horizontal ribbon of six hair-colour swatches.
 *
 * - The band translates x from -30% to 0% of its own width as the ribbon
 *   scrolls through the viewport (useScroll on the ribbon, offset
 *   "start end" -> "end start"). Motion values only; transform only.
 * - The six swatches are laid out three times in a row. -30% of a band that
 *   holds one set would only ever bring two shades past the centre of the
 *   screen; across three sets the same -30% sweeps ~5.4 swatch pitches past
 *   it, so every shade takes its turn. Set 1 is the accessible list; sets 2
 *   and 3 are aria-hidden copies.
 * - The band is offset (CSS margin) so that at progress 1 (x = 0) the Plum
 *   swatch of set 1 sits on the viewport's centre line; then the index under
 *   the centre is simply round(5 + (1 - p) * 0.3 * bandWidth / pitch) mod 6.
 *   Band width and pitch are measured on resize only, never per frame.
 * - Whenever that index changes (not per frame), the swatch's colour is
 *   written straight to the demo root as --salon-accent (the shade, used for
 *   decoration: heading underlines, rules) and --salon-ink (a deeper tone of
 *   the same shade that meets 4.5:1 on the blush page, used for CTA fills and
 *   accent text). Consumers transition those properties over 400 ms. Above
 *   the ribbon (p = 0) the inline values are removed, so the root's default,
 *   plum #9B4A6B, applies again. The Plum swatch (painted #7A3E5C) writes
 *   the brand plum #9B4A6B, so a page scrolled past the ribbon ends on the
 *   accent it opened with. The swatch under the centre gets
 *   data-active (it lifts 10px, a CSS transform transition).
 * - data-state is "live" while the ribbon is travelling and "rest" once it has
 *   reached its final position (p = 1).
 * - Reduced motion or Pause: band static at x = 0, no swatch active, accent
 *   stays plum, data-state="rest".
 */

/** hex: painted shade; accent: written to --salon-accent (decoration); ink: written to --salon-ink (AA text/fills). */
export type RibbonSwatch = { name: string; note: string; hex: string; accent: string; ink: string };

type Props = {
  swatches: RibbonSwatch[];
  /** Accessible name for the list of shades. */
  label: string;
  className?: string;
};

const SETS = 3;

/** Hair-like sheen over the flat shade: a soft highlight and fine strands. Static. */
const sheen = (hex: string) =>
  `linear-gradient(168deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 42%, rgba(0,0,0,0.12) 100%), repeating-linear-gradient(97deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 7px), ${hex}`;

export function ColourRibbon({ swatches, label, className }: Props) {
  const still = useDemoStill();
  const ref = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const geo = useRef({ width: 0, pitch: 0 });
  const active = useRef(-1);
  // Latest swatches, read at write time: a re-render (e.g. EN/ES switch) must
  // not change setActive's identity, or effect cleanups would reset the accent.
  const swatchesRef = useRef(swatches);
  swatchesRef.current = swatches;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);

  const setActive = useCallback(
    (i: number) => {
      if (i === active.current) return;
      active.current = i;
      const root = ref.current?.closest<HTMLElement>("[data-demo]");
      if (root) {
        if (i < 0) {
          root.style.removeProperty("--salon-accent");
          root.style.removeProperty("--salon-ink");
        } else {
          const s = swatchesRef.current[i];
          root.style.setProperty("--salon-accent", s.accent);
          root.style.setProperty("--salon-ink", s.ink);
        }
      }
      bandRef.current?.querySelectorAll<HTMLElement>("[data-swatch]").forEach((el) => {
        const on = Number(el.dataset.swatch) === i;
        if (on) el.setAttribute("data-active", "");
        else el.removeAttribute("data-active");
      });
    },
    [],
  );

  const update = useCallback(
    (p: number) => {
      const el = ref.current;
      if (!el || still) return;
      const state = p >= 1 ? "rest" : "live";
      if (el.dataset.state !== state) el.dataset.state = state;
      const { width, pitch } = geo.current;
      if (p <= 0 || !pitch) return setActive(-1);
      const n = swatches.length;
      const i = Math.round(n - 1 + ((1 - p) * 0.3 * width) / pitch);
      setActive(((i % n) + n) % n);
    },
    [still, swatches.length, setActive],
  );

  useMotionValueEvent(scrollYProgress, "change", update);

  // Geometry: on mount and on resize only.
  useLayoutEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const measure = () => {
      const items = band.querySelectorAll<HTMLElement>("[data-swatch]");
      if (items.length < 2) return;
      geo.current = {
        width: band.offsetWidth,
        pitch: items[1].getBoundingClientRect().left - items[0].getBoundingClientRect().left,
      };
      if (!still) {
        active.current = -2; // force a re-apply with the new geometry
        update(scrollYProgress.get());
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(band);
    return () => ro.disconnect();
  }, [still, update, scrollYProgress]);

  // Still: back to plum, nothing active.
  useEffect(() => {
    if (still) {
      active.current = -2;
      setActive(-1);
    }
  }, [still, setActive]);

  // On unmount only: leave the demo root clean.
  useEffect(
    () => () => {
      active.current = -2;
      setActive(-1);
    },
    [setActive],
  );

  const set = (copy: number) => {
    const Tag = copy === 0 ? "ul" : "div";
    return (
      <Tag
        key={copy}
        aria-label={copy === 0 ? label : undefined}
        aria-hidden={copy === 0 ? undefined : true}
        className="flex shrink-0 gap-[var(--gap)]"
      >
        {swatches.map((s, i) => {
          const Item = copy === 0 ? "li" : "div";
          return (
            <Item
              key={s.hex}
              data-swatch={i}
              className="group w-[var(--sw)] shrink-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] data-[active]:-translate-y-2.5"
            >
              <div
                className="aspect-[3/4] w-full rounded-t-[999px] shadow-[inset_0_0_0_1px_rgba(59,31,43,0.08)]"
                style={{ background: sheen(s.hex) }}
              />
              <div className="mt-4 flex items-baseline gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#6E4E5A]">
                <span>{`No. ${String(i + 1).padStart(2, "0")}`}</span>
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-[#3B1F2B] opacity-0 transition-opacity duration-[400ms] group-data-[active]:opacity-100"
                />
              </div>
              <p className="demo-display mt-1 text-[1.125rem] italic leading-tight text-[#3B1F2B] sm:text-[1.3125rem]">{s.name}</p>
              <p className="mt-1 text-[0.8125rem] leading-snug text-[#6E4E5A]">{s.note}</p>
            </Item>
          );
        })}
      </Tag>
    );
  };

  const bandStyle = {
    // Plum (index 5) of set 1 centred in the viewport when x = 0.
    marginLeft: "calc(50% - 5 * (var(--sw) + var(--gap)) - var(--sw) / 2)",
    ...(still ? {} : { x: x as MotionValue<string> }),
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-signature="salon"
      data-state={still ? "rest" : "live"}
      className={`overflow-hidden pt-4 [--gap:12px] [--sw:136px] sm:[--gap:18px] sm:[--sw:180px] lg:[--gap:22px] lg:[--sw:212px] ${className ?? ""}`}
    >
      <motion.div ref={bandRef} className={`flex w-max gap-[var(--gap)] ${still ? "" : "will-change-transform"}`} style={bandStyle}>
        {Array.from({ length: SETS }, (_, k) => set(k))}
      </motion.div>
    </div>
  );
}
