"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, Check, Circle, Pause, Play } from "lucide-react";
import { startTransition, useRef, useState } from "react";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { FitStage } from "@/components/ui/FitStage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SimulationDisclaimer } from "@/components/ui/SimulationDisclaimer";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { useScene, useTrackProgress } from "@/context/SceneContext";
import { NICHES } from "@/data/niches";
import { formatCurrency } from "@/lib/format";
import { EASE_EDITORIAL } from "@/lib/motion";
import { fill } from "@/i18n/types";
import { DASHBOARD_PANEL_ID, NicheTabs, tabId } from "./NicheTabs";

const BAR_SPRING = { type: "spring", stiffness: 120, damping: 20, mass: 0.8 } as const;

export function DashboardShowcase() {
  const { t } = useLanguage();
  const { nicheId, setNicheId } = useNiche();
  const { reduce, desktop } = useScene();
  const track = useTrackProgress();
  const pinned = desktop && !reduce;
  const d = track.progress;

  // 1 · Rise off the table → 2 · explode into layers → 3 · reassemble → 4 · cycle industries
  const rotateX = useTransform(d, [0, 0.14, 0.19, 0.29, 0.38], [64, 0, 0, 16, 0]);
  const rotateY = useTransform(d, [0.19, 0.29, 0.38], [0, -32, 0]);
  const y = useTransform(d, [0, 0.14], ["36%", "0%"]);
  const z = useTransform(d, [0, 0.14], [-460, 0]);
  const opacity = useTransform(d, [0, 0.07], [0, 1]);
  const explode = useTransform(d, [0.19, 0.28, 0.33, 0.4], [0, 1, 1, 0]);
  const zChrome = useTransform(explode, (e) => e * 340);
  const zSidebar = useTransform(explode, (e) => e * 60);
  const zKpi = useTransform(explode, (e) => e * 260);
  const zMid = useTransform(explode, (e) => e * 150);
  const zBottom = useTransform(explode, (e) => e * 420);

  // Scroll cycles all six industries, starting from whichever one is selected.
  const nicheRef = useRef(nicheId);
  nicheRef.current = nicheId;
  const baseRef = useRef(0);
  useMotionValueEvent(d, "change", (v) => {
    if (!pinned) return;
    if (v < 0.42) {
      baseRef.current = Math.max(0, NICHES.findIndex((n) => n.id === nicheRef.current));
      return;
    }
    const k = Math.min(NICHES.length - 1, Math.floor(((v - 0.42) / 0.56) * NICHES.length));
    const next = NICHES[(baseRef.current + k) % NICHES.length].id;
    if (next !== nicheRef.current) startTransition(() => setNicheId(next));
  });

  const layerZ = (mv: MotionValue<number>) => (pinned ? { z: mv } : undefined);

  return (
    <section
      id="dashboard"
      ref={track.ref}
      aria-labelledby="dashboard-title"
      className="relative z-10 bg-bone py-24 motion-safe:lg:h-[520vh] motion-safe:lg:py-0"
    >
      <div className="motion-safe:lg:sticky motion-safe:lg:top-0 motion-safe:lg:h-[100svh] motion-safe:lg:overflow-hidden motion-safe:lg:pb-4 motion-safe:lg:pt-20">
        <div className="frame flex h-full flex-col">
          <SectionHeader
            headingId="dashboard-title"
            index={t.dashboard.index}
            eyebrow={t.dashboard.eyebrow}
            title={t.dashboard.title}
            body={pinned ? undefined : t.dashboard.body}
          />
          {pinned ? <p className="mt-2 font-mono text-micro uppercase text-signal-deep md:pl-[25%]">{t.dashboard.scrollHint}</p> : null}

          <FitStage enabled={pinned} className="mt-6 flex-1">
            <div className="[perspective:1800px]">
              <motion.div
                data-theme="dark"
                className="border border-ink bg-ink text-bone [transform-style:preserve-3d]"
                style={pinned ? { rotateX, rotateY, y, z, opacity, transformOrigin: "50% 100%" } : undefined}
                {...(pinned
                  ? {}
                  : {
                      initial: { opacity: 0, rotateX: 28, y: 80 },
                      whileInView: { opacity: 1, rotateX: 0, y: 0 },
                      viewport: { once: true, margin: "-10%" },
                      transition: { duration: 1.1, ease: EASE_EDITORIAL },
                    })}
              >
                <motion.div className="relative bg-ink" style={layerZ(zChrome)}>
                  <WindowChrome />
                  <NicheTabs />
                </motion.div>
                <div
                  id={DASHBOARD_PANEL_ID}
                  role="tabpanel"
                  aria-labelledby={tabId(nicheId)}
                  tabIndex={0}
                  className="grid grid-cols-12 [transform-style:preserve-3d]"
                >
                  <motion.div className="hidden bg-ink lg:col-span-2 lg:block" style={layerZ(zSidebar)}>
                    <Sidebar />
                  </motion.div>
                  <div className="col-span-12 [transform-style:preserve-3d] lg:col-span-10">
                    <motion.div className="relative bg-ink" style={layerZ(zKpi)}>
                      <KpiRow />
                    </motion.div>
                    <motion.div className="grid grid-cols-12 border-t border-hairline-dark bg-ink" style={layerZ(zMid)}>
                      <RevenueChart />
                      <NichePreview />
                    </motion.div>
                    <motion.div className="grid grid-cols-12 border-t border-hairline-dark bg-ink" style={layerZ(zBottom)}>
                      <Pipeline />
                      <ActivityStream />
                      <Modules />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
            <SimulationDisclaimer className="mt-4" />
          </FitStage>
        </div>
      </div>
    </section>
  );
}

function WindowChrome() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline-dark px-4 py-3">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 border border-ash" />
          <span className="h-2.5 w-2.5 border border-ash" />
          <span className="h-2.5 w-2.5 bg-signal" />
        </span>
        <span className="font-mono text-micro uppercase text-bone">SermaWebDesign · {t.dashboard.windowTitle}</span>
      </div>
      <div className="flex items-center gap-4 font-mono text-micro uppercase text-ash">
        <span className="hidden sm:inline">{t.dashboard.period}</span>
        <span className="flex items-center gap-2 text-bone">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
          </span>
          {t.dashboard.live}
        </span>
      </div>
    </div>
  );
}

function Sidebar() {
  const { t } = useLanguage();
  return (
    <div className="h-full border-r border-hairline-dark p-4">
      <ul aria-label={t.dashboard.sidebarLabel} className="space-y-1">
        {t.dashboard.sidebar.map((item, i) => (
          <li
            key={item}
            aria-current={i === 0 ? "page" : undefined}
            className={`flex items-center justify-between px-2 py-2 text-sm ${i === 0 ? "bg-ink-700 text-bone" : "text-ash"}`}
          >
            {item}
            {i === 0 ? <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal" /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function KpiRow() {
  const { locale, t } = useLanguage();
  const { niche } = useNiche();
  return (
    <dl className="grid grid-cols-2 lg:grid-cols-4">
      {niche.kpis.map((kpi, i) => (
        <div
          key={i}
          className={`border-hairline-dark p-4 sm:p-5 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} lg:border-r lg:last:border-r-0`}
        >
          <dt className="min-h-[2.5em] font-mono text-micro uppercase text-ash">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={kpi.label[locale]}
                className="block"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
              >
                {kpi.label[locale]}
              </motion.span>
            </AnimatePresence>
          </dt>
          <dd className="mt-3">
            <AnimatedNumber value={kpi.value} format={kpi.format} className="block font-display text-4xl leading-none sm:text-5xl" />
            <span className="mt-2 flex items-center gap-1.5 font-mono text-[0.68rem] text-live">
              <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.75} />
              {kpi.delta[locale]}
              <span className="text-ash">{t.dashboard.vsPrevious}</span>
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function RevenueChart() {
  const { t, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const max = Math.max(...niche.weekly);
  const total = niche.weekly.reduce((a, b) => a + b, 0);
  const summary = fill(t.dashboard.chartSummary, {
    values: niche.weekly.map((v, i) => `${t.dashboard.weekShort}${i + 1} ${formatCurrency(v, intlLocale)}`).join(", "),
  });

  return (
    <div ref={ref} className="col-span-12 border-hairline-dark p-4 sm:p-5 lg:col-span-7 lg:border-r">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-mono text-micro uppercase text-ash">{t.dashboard.revenueTitle}</h3>
          <p className="mt-2 font-display text-3xl leading-none">
            <AnimatedNumber value={total} format="currency" />
          </p>
        </div>
        <p className="font-mono text-micro uppercase text-ash">{t.dashboard.revenueTotal}</p>
      </div>

      <div role="img" aria-label={summary} className="mt-6">
        <div aria-hidden="true" className="flex h-44 items-end gap-2 border-b border-hairline-dark sm:gap-3">
          {niche.weekly.map((value, i) => {
            const last = i === niche.weekly.length - 1;
            return (
              <div key={i} className="relative flex h-full flex-1 items-end">
                <motion.div
                  className={`gpu h-full w-full ${last ? "bg-signal" : "bg-bone/80"}`}
                  style={{ originY: 1 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: inView ? value / max : 0 }}
                  transition={{ ...BAR_SPRING, delay: inView ? i * 0.04 : 0 }}
                />
              </div>
            );
          })}
        </div>
        <div aria-hidden="true" className="mt-2 flex gap-2 font-mono text-[0.62rem] text-ash sm:gap-3">
          {niche.weekly.map((_, i) => (
            <span key={i} className="flex-1 text-center">
              {t.dashboard.weekShort}
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function NichePreview() {
  const { t, locale } = useLanguage();
  const { niche } = useNiche();
  const reduce = useReducedMotion();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? Boolean(reduce);

  return (
    <div className="col-span-12 flex flex-col p-4 sm:p-5 lg:col-span-5">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-micro uppercase text-ash">{t.dashboard.previewLabel}</h3>
        <button
          type="button"
          onClick={() => setUserPaused(!paused)}
          aria-label={paused ? t.common.playMotion : t.common.pauseMotion}
          className="grid h-11 w-11 place-items-center border border-hairline-dark text-bone hover:border-ash"
        >
          {paused ? <Play aria-hidden="true" size={14} strokeWidth={1.5} /> : <Pause aria-hidden="true" size={14} strokeWidth={1.5} />}
        </button>
      </div>
      {/* Higgsfield niche loops cross-fade: the new clip fades in over the outgoing one. */}
      <div className="relative mt-3 aspect-video w-full overflow-hidden border border-hairline-dark bg-ink-800">
        <AnimatePresence initial={false}>
          <motion.div
            key={niche.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE_EDITORIAL }}
          >
            <AmbientVideo
              src={niche.media.src}
              poster={niche.media.poster}
              label={niche.media.alt[locale]}
              paused={paused}
              showControl={false}
              className="h-full w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={`${niche.id}-${locale}`}
          className="mt-4 font-display text-2xl leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
        >
          {niche.tagline[locale]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function Pipeline() {
  const { t, locale } = useLanguage();
  const { niche } = useNiche();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const top = niche.pipeline[0]?.count || 1;

  return (
    <div ref={ref} className="col-span-12 border-b border-hairline-dark p-4 sm:p-5 md:col-span-6 md:border-r lg:col-span-4 lg:border-b-0">
      <h3 className="font-mono text-micro uppercase text-ash">{t.dashboard.pipelineTitle}</h3>
      <ol className="mt-4 space-y-4">
        {niche.pipeline.map((stage, i) => (
          <li key={i}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-bone">{stage.stage[locale]}</span>
              <AnimatedNumber value={stage.count} className="font-mono text-bone" />
            </div>
            <div aria-hidden="true" className="mt-1.5 h-1 w-full bg-ink-600">
              <motion.div
                className="h-full w-full bg-bone"
                style={{ originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: inView ? stage.count / top : 0 }}
                transition={{ ...BAR_SPRING, delay: inView ? i * 0.06 : 0 }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ActivityStream() {
  const { t, locale, intlLocale } = useLanguage();
  const { niche } = useNiche();

  return (
    <div className="col-span-12 border-b border-hairline-dark p-4 sm:p-5 md:col-span-6 lg:col-span-5 lg:border-b-0 lg:border-r">
      <h3 className="flex items-center justify-between font-mono text-micro uppercase text-ash">
        {t.dashboard.streamTitle}
        <span className="flex items-center gap-1.5 text-live">
          <Circle aria-hidden="true" size={6} fill="currentColor" strokeWidth={0} />
          {t.dashboard.live}
        </span>
      </h3>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={`${niche.id}-${locale}`}
          className="mt-3 divide-y divide-hairline-dark"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
            exit: { opacity: 0, transition: { duration: 0.15 } },
          }}
        >
          {niche.stream.map((event, i) => (
            <motion.li
              key={i}
              className="flex items-start justify-between gap-3 py-3"
              variants={{
                hidden: { opacity: 0, x: -14 },
                show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_EDITORIAL } },
              }}
            >
              <div>
                <p className="text-sm leading-snug text-bone">{event.text[locale]}</p>
                <p className="mt-1 font-mono text-[0.65rem] uppercase text-ash">
                  {fill(t.dashboard.minutesAgo, { n: event.minutesAgo })}
                </p>
              </div>
              {event.amount ? (
                <span className="shrink-0 font-mono text-sm text-live">+{formatCurrency(event.amount, intlLocale)}</span>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

function Modules() {
  const { t, locale } = useLanguage();
  const { niche } = useNiche();
  return (
    <div className="col-span-12 p-4 sm:p-5 lg:col-span-3">
      <h3 className="font-mono text-micro uppercase text-ash">{t.dashboard.modulesTitle}</h3>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={`${niche.id}-${locale}`}
          className="mt-3 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
        >
          {niche.modules.map((mod) => (
            <li key={mod.name.en} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center bg-signal text-ink">
                <Check size={11} strokeWidth={2.5} />
              </span>
              <span>
                <span className="block text-sm leading-snug text-bone">{mod.name[locale]}</span>
                <span className="mt-0.5 block text-xs leading-snug text-ash">{mod.detail[locale]}</span>
              </span>
            </li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
