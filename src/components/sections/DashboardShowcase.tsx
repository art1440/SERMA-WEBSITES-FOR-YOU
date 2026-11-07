"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, CalendarDays, Check, Circle, Inbox, LayoutGrid, Pause, Play, Settings2, Star, Users, type LucideIcon } from "lucide-react";
import { startTransition, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { AmbientVideo } from "@/components/ui/AmbientVideo";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { FitStage } from "@/components/ui/FitStage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SimulationDisclaimer } from "@/components/ui/SimulationDisclaimer";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { useScene, useTrackProgress } from "@/context/SceneContext";
import { NICHES } from "@/data/niches";
import { NICHE_VIEWS } from "@/data/dashboard-views";
import { formatCurrency, formatMetric } from "@/lib/format";
import { EASE_EDITORIAL, SPRING_SMOOTH } from "@/lib/motion";
import { fill } from "@/i18n/types";
import { DASHBOARD_PANEL_ID, NicheTabs, tabId } from "./NicheTabs";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { CalendarView } from "./dashboard/CalendarView";
import {
  DASHBOARD_VIEWS,
  DashboardViewProvider,
  VIEW_PANEL_ID,
  useDashboardView,
  viewTabId,
  type DashboardView,
} from "./dashboard/DashboardViewContext";
import { InboxView } from "./dashboard/InboxView";
import { LeadsView } from "./dashboard/LeadsView";
import { ReviewsView } from "./dashboard/ReviewsView";
import { SettingsView } from "./dashboard/SettingsView";
import { SampleTag } from "./dashboard/ui";

const BAR_SPRING = SPRING_SMOOTH;

/* ------------------------------------------------------------------ *
 * Liquid-glass app window materials.
 *
 * The window is a preserve-3d stack that explodes into layers on scroll, so
 * NOTHING in it may use backdrop-filter, `isolation`, `overflow` (other than
 * visible), filters or masks on the 3D elements themselves — each of those
 * flattens the 3D. Hence:
 *  - WINDOW (the preserve-3d root) is a hand-built dark glass: gradient body
 *    plus a light-catching gradient rim drawn with padding-box/border-box
 *    backgrounds (no pseudo-elements, no isolation).
 *  - Each exploding layer is a PLATE (`glass-dark glass-flat`, no blur). Plates
 *    are leaf 3D items, so the material's isolation only flattens their own
 *    (already flat) content.
 *  - Content sits on soft CARDS inside plates.
 * Radii are concentric: window 30 − 8px padding = plate 22 − 8px = card 14.
 *
 * On lg+ the window has a landscape design (~16:10): sidebar | KPIs, chart +
 * preview, pipeline strip | activity + modules in a right-hand rail. Phones
 * and tablets keep the stacked layout.
 *
 * It pins (300vh scroll track, sticky stage, 3D explode, scroll-cycled
 * industries) only where it still renders near full size: ≥1280×840 with
 * motion allowed (`motion-safe:pin:` in CSS, `pin && !reduce` in JS). There
 * FitStage scales it by height only, so a wide, short window keeps the scale
 * (and the text size) high. Smaller laptops get the same lg window at 1:1 in
 * normal flow.
 * ------------------------------------------------------------------ */
const WINDOW =
  "rounded-glass-lg border border-transparent p-1.5 text-bone sm:p-2 " +
  "[background:linear-gradient(165deg,#22231f_0%,#141513_36%,#0d0e0c_100%)_padding-box,linear-gradient(150deg,rgba(255,255,255,0.4),rgba(255,255,255,0.07)_28%,rgba(255,255,255,0.03)_68%,rgba(61,219,201,0.34))_border-box] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.3),0_40px_80px_-28px_rgba(0,0,0,0.7),0_0_120px_-40px_rgba(61,219,201,0.22),0_90px_150px_-60px_rgba(0,0,0,0.6)]";
const PLATE = "glass-dark glass-flat rounded-glass";
/** The window's full width (its max-w); the pinned stage always lays it out at this width. */
const WINDOW_W = 1240;
const CARD =
  "rounded-glass-sm bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:p-5 lg:p-4";
/* Ash on the lightest plate corner is still ≥ 5:1. */
const LABEL = "eyebrow text-ash";
const TRAFFIC_DOT = "h-3 w-3 rounded-full bg-white/[0.16] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]";

export function DashboardShowcase() {
  const { t } = useLanguage();
  const { nicheId, autoNiche, pickNiche, userPicked } = useNiche();
  const { reduce, desktop, pin } = useScene();
  const track = useTrackProgress();
  // Must match the `motion-safe:pin:` classes below (same media query as SceneContext's `pin`).
  const pinned = pin && !reduce;
  const d = track.progress;

  // 1 · Rise off the table → 2 · explode into layers → 3 · reassemble → 4 · cycle industries
  const rotateX = useTransform(d, [0, 0.14, 0.19, 0.29, 0.38], [64, 0, 0, 10, 0]);
  const rotateY = useTransform(d, [0.19, 0.29, 0.38], [0, -24, 0]);
  const y = useTransform(d, [0, 0.14], ["36%", "0%"]);
  const z = useTransform(d, [0, 0.14], [-460, 0]);
  const opacity = useTransform(d, [0, 0.07], [0, 1]);
  const explode = useTransform(d, [0.19, 0.28, 0.33, 0.4], [0, 1, 1, 0]);
  const zChrome = useTransform(explode, (e) => e * 180);
  const zSidebar = useTransform(explode, (e) => e * 60);
  const zKpi = useTransform(explode, (e) => e * 260);
  const zMid = useTransform(explode, (e) => e * 150);
  const zBottom = useTransform(explode, (e) => e * 420);
  // The right rail spans the full window height: kept shallow so it never swings over the heading.
  const zRail = useTransform(explode, (e) => e * 200);

  // Scroll cycles all six industries — but only until the visitor picks one themselves.
  const nicheRef = useRef(nicheId);
  nicheRef.current = nicheId;
  const baseRef = useRef(0);
  useMotionValueEvent(d, "change", (v) => {
    if (!pinned || userPicked.current) return;
    if (v < 0.42) {
      baseRef.current = Math.max(0, NICHES.findIndex((n) => n.id === nicheRef.current));
      return;
    }
    const k = Math.min(NICHES.length - 1, Math.floor(((v - 0.42) / 0.56) * NICHES.length));
    const next = NICHES[(baseRef.current + k) % NICHES.length].id;
    if (next !== nicheRef.current) startTransition(() => autoNiche(next));
  });

  const layerZ = (mv: MotionValue<number>) => (pinned ? { z: mv } : undefined);
  // Opening an inner section counts as the visitor's own choice: stop auto-cycling industries under them.
  const lockNiche = () => {
    if (!userPicked.current) pickNiche(nicheRef.current);
  };
  // The disclaimer sits outside FitStage (never scaled or clipped) but takes the scaled
  // window's width. Set as a CSS variable, so a resize never re-renders the dashboard.
  const column = useRef<HTMLDivElement>(null);
  const onScale = (scale: number) => column.current?.style.setProperty("--fit-scale", String(scale));

  return (
    <section
      id="dashboard"
      ref={track.ref}
      aria-labelledby="dashboard-title"
      // overflow-clip (not -hidden): clips like hidden but creates no scroll container,
      // so the pinned `sticky` stage below keeps sticking.
      className="relative isolate z-10 overflow-clip py-24 motion-safe:pin:h-[300vh] motion-safe:pin:py-0"
    >
      <AmbientField variant={1} />
      <div className="motion-safe:pin:sticky motion-safe:pin:top-0 motion-safe:pin:h-[100svh] motion-safe:pin:overflow-hidden motion-safe:pin:pb-4 motion-safe:pin:pt-20">
        <div ref={column} className="frame flex h-full flex-col">
          {/* z-10: the heading always paints above the exploding 3D stage. */}
          <div className="relative z-10">
            <SectionHeader
              tone="dark"
              headingId="dashboard-title"
              index={t.dashboard.index}
              eyebrow={t.dashboard.eyebrow}
              title={t.dashboard.title}
              body={pinned ? undefined : t.dashboard.body}
            />
            {pinned ? (
              // Sits on the chip row (top-right), so it costs the pinned stage no height.
              <p className="eyebrow absolute right-0 top-0 flex min-h-[2.125rem] items-center gap-2.5 text-ash">
                {/* Static scroll capsule (no looping animation: the Pause control doesn't reach CSS keyframes). */}
                <span aria-hidden="true" className="relative block h-4 w-[3px] shrink-0 overflow-hidden rounded-full bg-white/15">
                  <span className="absolute inset-x-0 top-0 block h-1/2 rounded-full bg-aqua" />
                </span>
                {t.dashboard.scrollHint}
              </p>
            ) : null}
          </div>

          {/* Pinned: takes what the heading and disclaimer leave (shrinks, min-h-0) and hugs the window, so the
              disclaimer below always sits right under it, never scaled and never clipped. */}
          {/* Pinned: always laid out at the full 1240px window width, so every screen gets the same
              layout (and the same per-language height, see OVERVIEW_MIN_H); only the scale differs. */}
          <FitStage enabled={pinned} hug onScale={onScale} width={pinned ? WINDOW_W : undefined} className={pinned ? "mt-4" : "mt-6"}>
            <div className="mx-auto max-w-[1240px] [perspective-origin:50%_70%] [perspective:1800px]">
              <motion.div
                data-theme="dark"
                className={`${WINDOW} [transform-style:preserve-3d]`}
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
                <motion.div className={`${PLATE} px-1.5 pb-1.5 sm:px-2 sm:pb-2`} style={layerZ(zChrome)}>
                  <WindowChrome />
                  <NicheTabs />
                </motion.div>
                <DashboardViewProvider onInteract={lockNiche} pinned={pinned}>
                  <div
                    id={DASHBOARD_PANEL_ID}
                    role="tabpanel"
                    aria-labelledby={tabId(nicheId)}
                    className="mt-1.5 grid grid-cols-12 gap-1.5 rounded-glass [transform-style:preserve-3d] sm:mt-2 sm:gap-2 lg:grid-cols-[10.25rem_minmax(0,1fr)]"
                  >
                    <motion.div className={`${PLATE} col-span-12 lg:col-span-1`} style={layerZ(zSidebar)}>
                      <Sidebar desktop={desktop} />
                    </motion.div>
                    <ViewPanel
                      desktop={desktop}
                      pinned={pinned}
                      layers={{ kpi: layerZ(zKpi), mid: layerZ(zMid), bottom: layerZ(zBottom), rail: layerZ(zRail) }}
                    />
                  </div>
                </DashboardViewProvider>
              </motion.div>
            </div>
          </FitStage>
          {/* FTC disclosure: outside the scaled stage, as wide as the (scaled) window. */}
          <div
            className="mx-auto shrink-0"
            style={{ width: "min(100%, calc(1240px * var(--fit-scale, 1)))" }}
          >
            <SimulationDisclaimer className="mt-3 lg:max-w-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Title bar. The "Sample data" tag lives here so every section, the Overview
 * included, is labelled as illustrative (FTC). On narrow windows the right
 * group wraps onto its own line under the title.
 */
function WindowChrome() {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-2 py-3 sm:px-2.5 lg:py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        {/* Window controls (decorative): neutral glass beads, so the accent stays on the data. */}
        <span aria-hidden="true" className="flex shrink-0 gap-1.5 sm:gap-2">
          <span className={TRAFFIC_DOT} />
          <span className={TRAFFIC_DOT} />
          <span className={TRAFFIC_DOT} />
        </span>
        <span className="min-w-0 text-[0.8125rem] font-medium leading-snug tracking-[-0.005em] text-bone/90">
          SermaWebDesign · {t.dashboard.windowTitle}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ash">
        <span className="hidden sm:inline">{t.dashboard.period}</span>
        <SampleTag />
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/[0.07] px-2.5 py-1 font-medium text-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
          </span>
          {t.dashboard.liveDemo}
        </span>
      </div>
    </div>
  );
}

const VIEW_ICONS: Record<DashboardView, LucideIcon> = {
  overview: LayoutGrid,
  leads: Users,
  calendar: CalendarDays,
  inbox: Inbox,
  reviews: Star,
  settings: Settings2,
};

/**
 * Dashboard sections as a WAI-ARIA tablist (automatic activation). Vertical
 * sidebar on lg+. Below lg a 3×2 grid (one row of six from sm) of stacked
 * icon-over-label tabs, so all six sections are always visible and nothing
 * scrolls or clips the focus ring. Arrow keys in either direction, Home and
 * End move between sections.
 */
function Sidebar({ desktop }: { desktop: boolean }) {
  const { t } = useLanguage();
  const { nicheId } = useNiche();
  const { view, setView, isDone } = useDashboardView();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const data = NICHE_VIEWS[nicheId];
  // Counts follow the demo: opening an email or texting a new lead clears it from the badge.
  const badges: Partial<Record<DashboardView, number>> = {
    inbox: data.inbox.filter((m) => m.unread && !isDone(`read:${m.id}`)).length,
    leads: data.leads.filter((l) => l.status === "new" && !isDone(`text:${l.id}`) && !isDone(`booked:${l.id}`)).length,
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = DASHBOARD_VIEWS.indexOf(view);
    let next = current;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (current + 1) % DASHBOARD_VIEWS.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (current - 1 + DASHBOARD_VIEWS.length) % DASHBOARD_VIEWS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = DASHBOARD_VIEWS.length - 1;
    else return;
    e.preventDefault();
    setView(DASHBOARD_VIEWS[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className="h-full p-1.5 lg:p-2">
      <div
        role="tablist"
        aria-label={t.dashboard.sidebarLabel}
        aria-orientation={desktop ? "vertical" : "horizontal"}
        onKeyDown={onKeyDown}
        className="grid grid-cols-3 gap-1 sm:grid-cols-6 lg:flex lg:flex-col"
      >
        {DASHBOARD_VIEWS.map((v, i) => {
          const selected = v === view;
          const Icon = VIEW_ICONS[v];
          const badge = badges[v];
          return (
            <button
              key={v}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={viewTabId(v)}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={VIEW_PANEL_ID}
              tabIndex={selected ? 0 : -1}
              onClick={(e) => {
                // Safari/iOS don't focus a clicked button; focus it so the panel's
                // lost-focus safety net doesn't pull focus to the section heading.
                e.currentTarget.focus({ preventScroll: true });
                setView(v);
              }}
              // Below lg: icon above label (radius concentric with the plate: 22 − 6px padding = 16).
              // lg+: one capsule row; the 10.25rem track fits the longest label + badge ("Prospectos" 2) untruncated.
              // Selection is a tint + shadow only, so forced colors get a system-colour outline.
              className={`relative flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-[16px] px-1.5 py-1.5 text-[0.8125rem] leading-tight lg:min-h-[44px] lg:flex-row lg:justify-start lg:gap-1.5 lg:rounded-full lg:px-2.5 lg:py-0 lg:text-sm ${
                selected
                  ? "bg-white/[0.08] font-medium text-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)] forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]"
                  : "text-ash hover:bg-white/[0.05] hover:text-bone"
              }`}
            >
              <Icon aria-hidden="true" size={15} strokeWidth={1.75} className={`shrink-0 ${selected ? "text-aqua" : ""}`} />
              <span className="min-w-0 max-w-full truncate">{t.dashboard.sidebar[i]}</span>
              {badge ? (
                // A small capsule on the tab's top-right corner below lg; inline at the row's end on lg+.
                <span className="tabular absolute right-1 top-1 grid h-[1.125rem] min-w-[1.125rem] shrink-0 place-items-center rounded-full bg-aqua px-1 text-[0.6875rem] font-semibold leading-none text-ink lg:static lg:ml-auto lg:h-5 lg:min-w-5 lg:px-1.5">
                  {badge}
                  <span className="sr-only"> {badge === 1 ? t.dashboard.newItemsOne : t.dashboard.newItems}</span>
                </span>
              ) : selected ? (
                <span aria-hidden="true" className="ml-auto hidden h-1.5 w-1.5 shrink-0 rounded-full bg-aqua shadow-[0_0_8px_rgba(61,219,201,0.7)] lg:block" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const VIEW_COMPONENTS: Record<Exclude<DashboardView, "overview">, () => React.JSX.Element> = {
  leads: LeadsView,
  calendar: CalendarView,
  inbox: InboxView,
  reviews: ReviewsView,
  settings: SettingsView,
};

/**
 * The open section. Overview keeps its exploding plates (KPIs, chart, pipeline,
 * right rail). Every other section is one plate spanning the same area.
 *
 * On lg+ the Overview stays mounted in normal flow at all times and sizes the
 * panel: while another section is open it is hidden (invisible + inert +
 * aria-hidden) and the section plate sits over it (absolute inset-0). So a
 * section always equals the current Overview height for the current language
 * and industry (inner lists scroll instead), nothing is measured, and returning
 * to the Overview never remounts it (no count-up from 0, no rescale). Below lg
 * only the open view renders, at its natural height.
 */
/**
 * Pinned stage only (the window is always laid out at WINDOW_W, so this panel is 1050px wide):
 * the Overview's minimum height per language = the tallest of the six industries. Switching
 * industry (or the scroll-driven auto-cycle) then never rescales the window, and a language
 * switch rescales once instead of following the staggered content swap. It is a minimum,
 * so taller content still wins and nothing can clip. Re-measure after big copy changes.
 */
const OVERVIEW_MIN_H = { en: 626, es: 648 } as const;

function ViewPanel({
  desktop,
  pinned,
  layers,
}: {
  desktop: boolean;
  pinned: boolean;
  layers: { kpi?: object; mid?: object; bottom?: object; rail?: object };
}) {
  const { view } = useDashboardView();
  const { locale } = useLanguage();
  const overviewRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;
  const shownView = useRef(view);

  // Focus safety net: if the control that switched sections went away with the old
  // section (focus fell back to <body>), land on the new section's heading instead.
  useEffect(() => {
    if (shownView.current === view) return; // first mount (and StrictMode's re-run)
    shownView.current = view;
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active && active !== document.body) return;
      const heading = (view === "overview" ? overviewRef.current : sectionRef.current)?.querySelector("h3");
      if (!heading) return;
      if (!heading.hasAttribute("tabindex")) heading.tabIndex = -1;
      // Pinned: the sticky stage is already on screen; scrolling would scrub the scene.
      heading.focus({ preventScroll: pinnedRef.current });
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);

  const overviewOpen = view === "overview";
  const Inner = overviewOpen ? null : VIEW_COMPONENTS[view];

  return (
    <div
      id={VIEW_PANEL_ID}
      role="tabpanel"
      aria-labelledby={viewTabId(view)}
      tabIndex={-1}
      className="relative col-span-12 [transform-style:preserve-3d] lg:col-span-1"
    >
      {overviewOpen || desktop ? (
        <div
          ref={overviewRef}
          style={pinned ? { minHeight: OVERVIEW_MIN_H[locale] } : undefined}
          inert={!overviewOpen}
          aria-hidden={overviewOpen ? undefined : true}
          className={`grid grid-cols-12 gap-1.5 [transform-style:preserve-3d] sm:gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] ${
            overviewOpen ? "" : "invisible"
          }`}
        >
          {/* lg: the pipeline plate takes any spare height, so the column never ends in a gap. */}
          <div className="col-span-12 grid content-start gap-1.5 [transform-style:preserve-3d] sm:gap-2 lg:col-span-1 lg:grid-rows-[auto_auto_minmax(0,1fr)] lg:content-stretch">
            <motion.div className={`${PLATE} p-1.5 sm:p-2`} style={layers.kpi}>
              <KpiRow />
            </motion.div>
            <motion.div className={`${PLATE} grid grid-cols-12 gap-1.5 p-1.5 sm:gap-2 sm:p-2`} style={layers.mid}>
              <RevenueChart />
              <NichePreview idle={!overviewOpen} />
            </motion.div>
            <motion.div className={`${PLATE} p-1.5 sm:p-2`} style={layers.bottom}>
              <Pipeline />
            </motion.div>
          </div>
          {/* Right-hand rail on lg+; a row of cards below the pipeline on smaller screens. */}
          <motion.div
            className={`${PLATE} col-span-12 grid grid-cols-12 content-start gap-1.5 p-1.5 sm:gap-2 sm:p-2 lg:col-span-1 lg:flex lg:flex-col`}
            style={layers.rail}
          >
            <ActivityStream />
            <Modules />
          </motion.div>
        </div>
      ) : null}
      {Inner ? (
        <motion.div
          ref={sectionRef}
          className={`${PLATE} flex flex-col p-1.5 sm:p-2 ${desktop ? "absolute inset-0" : ""}`}
          style={layers.mid}
        >
          <motion.div
            key={view}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
          >
            <Inner />
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}

function KpiRow() {
  const { locale, t } = useLanguage();
  const { niche } = useNiche();
  return (
    <dl className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-4">
      {niche.kpis.map((kpi, i) => (
        // Container-sized numerals: "$186,400" always fits its tile, from phone to wide desktop.
        <div key={i} className={`${CARD} [container-type:inline-size]`}>
          <dt className="eyebrow min-h-[2.5rem] text-ash">
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
          <dd className="mt-3 lg:mt-2">
            <AnimatedNumber
              value={kpi.value}
              format={kpi.format}
              className="block font-display text-4xl leading-none tracking-[-0.04em] [font-size:clamp(1.75rem,21cqi,3rem)]"
            />
            <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 lg:mt-2.5">
              {/* Ring-only capsule: no tinted fill, so live-on-dark contrast stays ≥ 4.5:1. */}
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.6875rem] text-live ring-1 ring-inset ring-live/30">
                <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.75} />
                {kpi.delta[locale]}
              </span>
              <span className="text-xs text-ash">{t.dashboard.vsPrevious}</span>
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
    <div ref={ref} className={`${CARD} col-span-12 lg:col-span-7`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className={LABEL}>{t.dashboard.revenueTitle}</h3>
          <p className="mt-2 font-display text-3xl leading-none tracking-[-0.035em]">
            <AnimatedNumber value={total} format="currency" />
          </p>
        </div>
        <p className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-bone/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
          {t.dashboard.revenueTotal}
        </p>
      </div>

      <div role="img" aria-label={summary} className="mt-6 lg:mt-5">
        {/* Bars rise inside soft glass wells. They translate (not scale), so the rounded tops never squash. */}
        <div aria-hidden="true" className="flex h-44 items-end gap-2 sm:gap-3 lg:h-32">
          {niche.weekly.map((value, i) => {
            const last = i === niche.weekly.length - 1;
            return (
              <div key={i} className="relative isolate h-full flex-1 overflow-hidden rounded-[8px] bg-white/[0.035]">
                <motion.div
                  className={`gpu absolute inset-0 rounded-[8px] ${
                    last
                      ? "bg-[linear-gradient(to_top,#12A594,#3DDBC9_70%)] shadow-[inset_0_1px_0_rgba(214,255,250,0.65)]"
                      : "bg-[linear-gradient(to_top,rgba(241,237,228,0.4),rgba(241,237,228,0.88))] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                  }`}
                  initial={{ y: "100%" }}
                  animate={{ y: inView ? `${(1 - value / max) * 100}%` : "100%" }}
                  transition={{ ...BAR_SPRING, delay: inView ? i * 0.04 : 0 }}
                />
              </div>
            );
          })}
        </div>
        <div aria-hidden="true" className="tabular mt-2 flex gap-2 text-[0.6875rem] font-medium text-ash sm:gap-3">
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

/** `idle`: the Overview is hidden behind another section (lg+), so the clip pauses. */
function NichePreview({ idle = false }: { idle?: boolean }) {
  const { t, locale } = useLanguage();
  const { niche } = useNiche();
  const reduce = useReducedMotionSafe();
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? Boolean(reduce);

  return (
    <div className={`${CARD} col-span-12 flex flex-col lg:col-span-5`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className={LABEL}>{t.dashboard.previewLabel}</h3>
        <button
          type="button"
          onClick={() => setUserPaused(!paused)}
          aria-label={paused ? t.common.playMotion : t.common.pauseMotion}
          className="-my-1.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.06] text-bone shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.08)] transition-transform duration-300 ease-editorial hover:bg-white/[0.1] active:scale-95"
        >
          {paused ? <Play aria-hidden="true" size={14} strokeWidth={1.5} /> : <Pause aria-hidden="true" size={14} strokeWidth={1.5} />}
        </button>
      </div>
      {/* Higgsfield niche loops cross-fade: the new clip fades in over the outgoing one. */}
      <div className="relative isolate mt-3 aspect-video w-full overflow-hidden rounded-[10px] bg-ink-800">
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
              paused={paused || idle}
              showControl={false}
              className="h-full w-full"
            />
          </motion.div>
        </AnimatePresence>
        {/* Light-catching glass edge over the footage. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.16)]"
        />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={`${niche.id}-${locale}`}
          className="mt-4 font-display text-2xl leading-tight tracking-[-0.03em] lg:mt-3 lg:text-xl"
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
  const { t, locale, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const top = niche.pipeline[0]?.count || 1;

  return (
    <div ref={ref} className={CARD}>
      <h3 className={LABEL}>{t.dashboard.pipelineTitle}</h3>
      {/* A funnel strip: stacked on phones, 2-up on small tablets, one row of four in the landscape window. */}
      <ol className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-x-6 lg:mt-3 lg:grid-cols-4 lg:gap-x-5">
        {niche.pipeline.map((stage, i) => (
          <li key={i}>
            {/* The count-up must not reflow the label: the number reserves the width of its
                final value (tabular digits ≤ 1ch each), so the row is as tall at 0 as at the end. */}
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 text-bone">{stage.stage[locale]}</span>
              <span
                className="tabular shrink-0 text-right font-medium text-bone"
                style={{ minWidth: `${formatMetric(stage.count, "number", intlLocale).length}ch` }}
              >
                <AnimatedNumber value={stage.count} />
              </span>
            </div>
            {/* Capsule meter: the fill slides in (translate, not scale) so its rounded end stays crisp. */}
            <div
              aria-hidden="true"
              className="relative isolate mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.07] shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]"
            >
              <motion.div
                className="h-full w-full rounded-full bg-[linear-gradient(90deg,rgba(18,165,148,0.75),#3DDBC9)] shadow-[inset_0_1px_0_rgba(214,255,250,0.6)]"
                initial={{ x: "-100%" }}
                animate={{ x: inView ? `${(stage.count / top - 1) * 100}%` : "-100%" }}
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
    <div className={`${CARD} col-span-12 md:col-span-6`}>
      <h3 className={`${LABEL} flex items-center justify-between gap-3`}>
        {t.dashboard.streamTitle}
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs text-live ring-1 ring-inset ring-live/30">
          <Circle aria-hidden="true" size={6} fill="currentColor" strokeWidth={0} />
          {t.dashboard.live}
        </span>
      </h3>
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={`${niche.id}-${locale}`}
          className="mt-2 divide-y divide-white/[0.07]"
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
              className="flex items-start justify-between gap-3 py-3 last:pb-0"
              variants={{
                hidden: { opacity: 0, x: -14 },
                show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_EDITORIAL } },
              }}
            >
              <div>
                <p className="text-sm leading-snug text-bone">{event.text[locale]}</p>
                <p className="mt-1 font-mono text-[0.6875rem] text-ash">{fill(t.dashboard.minutesAgo, { n: event.minutesAgo })}</p>
              </div>
              {event.amount ? (
                <span className="tabular shrink-0 text-sm font-medium text-live">+{formatCurrency(event.amount, intlLocale)}</span>
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
    <div className={`${CARD} col-span-12 md:col-span-6`}>
      <h3 className={LABEL}>{t.dashboard.modulesTitle}</h3>
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
              <span
                aria-hidden="true"
                className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aqua text-ink shadow-[inset_0_1px_0_rgba(214,255,250,0.7),0_0_0_3px_rgba(61,219,201,0.14)]"
              >
                <Check size={12} strokeWidth={2.5} />
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
