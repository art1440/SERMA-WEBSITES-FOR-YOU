"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { Reveal, RevealLines, staggerDelay } from "@/components/ui/Reveal";
import { SectionChip } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { DEMOS, type DemoId } from "@/data/demos";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { WorkCard } from "./WorkCard";
import { WorkPreview } from "./WorkPreview";

/**
 * "Our work": the six demo sites as small browser windows. Hover (or keyboard
 * focus) scrolls a card's screenshot, the mouse tilts it, and a click grows the
 * window into a large scrollable preview. Under reduced motion or Pause the
 * cards rest at the top, don't tilt, and the preview fades in place.
 */
export function WorkGallery() {
  const { t } = useLanguage();
  const g = t.work.gallery;
  const reduce = useReducedMotionSafe();
  const { paused } = useMotionPause();
  const still = reduce || paused;

  const [openId, setOpenId] = useState<DemoId | null>(null);
  // The card the preview last grew from stays lifted while it shrinks back into its slot.
  const [raisedId, setRaisedId] = useState<DemoId | null>(null);
  const [touch, setTouch] = useState(false);
  const [landing, setLanding] = useState<{ id: DemoId; ratio: number; n: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const onOpen = useCallback((id: DemoId) => {
    setRaisedId(id);
    setOpenId(id);
  }, []);
  const openRef = useRef(openId);
  openRef.current = openId;
  const onClose = useCallback((ratio = 0) => {
    const id = openRef.current;
    if (!id) return;
    setLanding((prev) => ({ id, ratio, n: (prev?.n ?? 0) + 1 }));
    setOpenId(null);
  }, []);

  const open = DEMOS.find((d) => d.id === openId) ?? null;

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      data-theme="dark"
      className="relative isolate z-10 overflow-hidden py-24 text-bone lg:py-32"
    >
      <AmbientField tone="dark" variant={1} />
      <div className="frame relative">
        <div className="grid grid-cols-12 items-end gap-x-4 gap-y-6 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-7">
            <Reveal>
              <SectionChip index={g.index} label={g.eyebrow} />
            </Reveal>
            <RevealLines
              id="work-title"
              lines={g.title}
              emphasis={g.titleEmphasis}
              className="mt-5 font-display text-display-md text-balance"
            />
          </div>
          <Reveal className="col-span-12 lg:col-span-5" delay={0.12}>
            <p className="max-w-md text-pretty leading-relaxed text-ash lg:ml-auto">{touch ? g.bodyTouch : g.body}</p>
          </Reveal>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {DEMOS.map((demo, i) => (
            <li key={demo.id} className={raisedId === demo.id ? "relative z-20" : "relative"}>
              <Reveal delay={staggerDelay(i)}>
                <WorkCard
                  demo={demo}
                  onOpen={onOpen}
                  live={still ? "off" : "hover"}
                  morph={!still}
                  raised={raisedId === demo.id}
                  landing={landing?.id === demo.id ? landing : null}
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
      <WorkPreview demo={open} onClose={onClose} morph={!still} />
    </section>
  );
}
