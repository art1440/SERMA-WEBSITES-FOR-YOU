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
 * industries. The active block slides between tabs via `layoutId`.
 */
export function NicheTabs() {
  const { t, locale } = useLanguage();
  const { nicheId, setNicheId } = useNiche();
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
      className="grid grid-cols-2 overflow-hidden sm:grid-cols-3 lg:grid-cols-6"
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
            className={`relative isolate flex min-h-[56px] items-center gap-2.5 px-4 py-3 text-left shadow-[inset_-1px_0_0_0_#2E2E29,inset_0_-1px_0_0_#2E2E29] ${selected ? "z-10" : "z-0"}`}
          >
            {selected ? (
              <motion.span
                layoutId="niche-tab-indicator"
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-bone"
                transition={SPRING_SOFT}
              />
            ) : null}
            <span className={`font-mono text-[0.68rem] ${selected ? "text-signal-deep" : "text-ash"}`}>0{i + 1}</span>
            <span className={`text-sm leading-tight ${selected ? "text-ink" : "text-bone"}`}>{niche.label[locale]}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
