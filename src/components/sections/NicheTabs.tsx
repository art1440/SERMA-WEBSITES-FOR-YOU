"use client";

import { motion } from "framer-motion";
import { useRef, type KeyboardEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { NICHES } from "@/data/niches";
import { SPRING_SOFT } from "@/lib/motion";

export const DASHBOARD_PANEL_ID = "dashboard-panel";
export const tabId = (id: string) => `niche-tab-${id}`;

/**
 * WAI-ARIA tablist (automatic activation): ←/→/Home/End move between
 * industries. Styled as a recessed capsule segmented control: a raised aqua
 * pill slides between tabs via `layoutId` (transform-only). One row on
 * desktop; wraps to a 2/3-column grid of capsules on smaller screens, with
 * the track radius kept concentric (tab radius 22 + 4px padding = 26).
 * No backdrop blur: this lives inside the dashboard's 3D layer stack.
 */
export function NicheTabs() {
  const { t, locale } = useLanguage();
  const { nicheId, pickNiche: setNicheId } = useNiche();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = NICHES.findIndex((n) => n.id === nicheId);
    let next = current;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % NICHES.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + NICHES.length) % NICHES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = NICHES.length - 1;
    else return;
    e.preventDefault();
    setNicheId(NICHES[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={t.dashboard.tablistLabel}
      onKeyDown={onKeyDown}
      className="grid grid-cols-2 gap-1 rounded-[26px] bg-black/30 p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.06),0_1px_0_rgba(255,255,255,0.05)] sm:grid-cols-3 lg:grid-cols-6 lg:rounded-full"
    >
      {NICHES.map((niche, i) => {
        const selected = niche.id === nicheId;
        return (
          <motion.button
            key={niche.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={tabId(niche.id)}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={DASHBOARD_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            onClick={() => setNicheId(niche.id)}
            whileHover={selected ? undefined : { y: -2 }}
            whileTap={{ scale: 0.97 }}
            // Forced colors drop the aqua pill (a background), so the selected tab gets a system-colour outline.
            className={`relative isolate flex min-h-[44px] items-center gap-2 rounded-[22px] px-3.5 py-2 text-left ${
              selected
                ? "z-10 forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]"
                : "z-0 hover:bg-white/[0.06]"
            }`}
          >
            {selected ? (
              <motion.span
                layoutId="niche-tab-indicator"
                aria-hidden="true"
                // Radius set via style so Framer corrects it during the layout slide (no squashed ends).
                style={{ borderRadius: 22 }}
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#6FE9DA_0%,#3DDBC9_55%,#2FCBB9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(13,13,11,0.08),0_0_0_1px_rgba(61,219,201,0.35),0_8px_22px_-8px_rgba(61,219,201,0.55),0_1px_2px_rgba(0,0,0,0.3)]"
                transition={SPRING_SOFT}
              />
            ) : null}
            {/* Alpha tints (bone/60, bone/90) keep ≥4.5:1 on the recessed track wherever the plate gradient sits;
                ink/70 on the aqua pill is ≥5:1 (ink 11:1). */}
            <span className={`tabular text-xs font-medium ${selected ? "text-ink/70" : "text-bone/60"}`}>0{i + 1}</span>
            <span className={`text-sm font-medium leading-tight tracking-[-0.01em] ${selected ? "text-ink" : "text-bone/90"}`}>
              {niche.label[locale]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
