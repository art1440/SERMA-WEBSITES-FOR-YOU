"use client";

import { AnimatePresence, LayoutGroup, motion, useDragControls } from "framer-motion";
import { Download, LogOut, RefreshCw, Search, Inbox } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Avatar, CARD, CARD_FLUSH, PILL, PILL_OFF, PILL_ON, ROW, ROW_SELECTED, StatusChip } from "@/components/sections/dashboard/ui";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { EASE_EDITORIAL, SPRING_SMOOTH, SPRING_SNAPPY } from "@/lib/motion";
import { LeadDetail } from "./LeadDetail";
import { Ticker } from "./Ticker";
import {
  SAMPLE_LEADS,
  STATUSES,
  STATUS_FILL,
  STATUS_LABEL,
  STATUS_TONE,
  SignedOut,
  api,
  relativeTime,
  sourceOf,
  toCsv,
  type Lead,
  type Status,
} from "./data";

type Filter = "all" | Status;
const REFRESH_MS = 60_000;

/** null until measured, so a phone never briefly takes the wide layout (and auto-opens a lead). */
function useWide() {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

/**
 * The CRM. Motion here is a working tool, not a show: every movement reports a
 * change of state. Numbers tick to their new value, the pipeline bar re-proportions
 * when a lead moves stage, rows slide into their new order when a filter changes,
 * and a lead that arrives on refresh slides in at the top with a brief aqua wash.
 * Nothing loops, nothing is scroll-driven, and reduced motion keeps only fades.
 */
export function CrmBoard({ preview, onSignedOut }: { preview: boolean; onSignedOut: () => void }) {
  const wide = useWide();
  const [leads, setLeads] = useState<Lead[] | null>(preview ? SAMPLE_LEADS : null);
  const [loadError, setLoadError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastLoaded, setLastLoaded] = useState<number>(Date.now());
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [, tick] = useState(0);
  const known = useRef<Set<string> | null>(preview ? new Set(SAMPLE_LEADS.map((l) => l.id)) : null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastLoadedRef = useRef(lastLoaded);
  lastLoadedRef.current = lastLoaded;

  const say = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? "" : t)), 3200);
  }, []);

  const load = useCallback(async () => {
    if (preview) return;
    setRefreshing(true);
    try {
      const next = (await api.leads()).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
      if (known.current) {
        const arrived = next.filter((l) => !known.current!.has(l.id)).map((l) => l.id);
        if (arrived.length) {
          setFresh(new Set(arrived));
          say(arrived.length === 1 ? "1 new lead just came in." : `${arrived.length} new leads just came in.`);
          window.setTimeout(() => setFresh(new Set()), 2600);
        }
      }
      known.current = new Set(next.map((l) => l.id));
      setLeads(next);
      setLoadError("");
      setLastLoaded(Date.now());
    } catch (e) {
      if (e instanceof SignedOut) return onSignedOut();
      setLoadError(e instanceof Error ? e.message : "Could not load your leads.");
    } finally {
      setRefreshing(false);
    }
  }, [preview, onSignedOut, say]);

  // First load, then every minute while the tab is visible; the "x min ago" labels tick with it.
  useEffect(() => {
    load();
    const id = window.setInterval(() => {
      tick((n) => n + 1);
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    const onVis = () => document.visibilityState === "visible" && Date.now() - lastLoadedRef.current > REFRESH_MS && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);
  const counts = useMemo(() => {
    const c = { all: 0, new: 0, contacted: 0, mockup: 0, won: 0, lost: 0 } as Record<Filter, number>;
    for (const l of leads ?? []) {
      c.all++;
      c[l.status]++;
    }
    return c;
  }, [leads]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (leads ?? []).filter(
      (l) =>
        (filter === "all" || l.status === filter) &&
        (!q || [l.name, l.business, l.phone, l.need, l.note, l.industry].some((v) => v.toLowerCase().includes(q))),
    );
  }, [leads, filter, query]);

  // On wide screens keep something selected so the detail pane is never empty.
  useEffect(() => {
    if (wide === false) setSelectedId(null);
  }, [wide]);
  useEffect(() => {
    if (!wide || !leads?.length) return;
    if (!selectedId || !leads.some((l) => l.id === selectedId)) setSelectedId(visible[0]?.id ?? leads[0].id);
  }, [wide, leads, visible, selectedId]);

  const selected = leads?.find((l) => l.id === selectedId) ?? null;

  /** Optimistic: the UI moves first, and rolls back if the save fails. */
  async function patch(id: string, change: Partial<Pick<Lead, "status" | "note">>) {
    const before = leads?.find((l) => l.id === id);
    if (!before) return;
    setLeads((ls) => ls?.map((l) => (l.id === id ? { ...l, ...change, updatedAt: new Date().toISOString() } : l)) ?? ls);
    if (preview) return;
    try {
      await api.update(id, change);
    } catch (e) {
      if (e instanceof SignedOut) return onSignedOut();
      setLeads((ls) => ls?.map((l) => (l.id === id ? before : l)) ?? ls);
      say(e instanceof Error ? e.message : "Could not save that change.");
      throw e;
    }
  }

  async function signOut() {
    if (!preview) await api.logout().catch(() => undefined);
    onSignedOut();
  }

  function exportCsv() {
    if (!leads?.length) return;
    const url = URL.createObjectURL(new Blob(["﻿" + toCsv(visible.length ? visible : leads)], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `serma-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Arrow keys walk the list; on wide screens the detail follows focus. */
  function onRowKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const next = visible[i + (e.key === "ArrowDown" ? 1 : -1)];
    if (!next) return;
    listRef.current?.querySelector<HTMLButtonElement>(`[data-lead="${next.id}"]`)?.focus();
    if (wide) setSelectedId(next.id);
  }

  const won = counts.won;
  const closed = counts.won + counts.lost;
  const KPIS = [
    { label: "All leads", value: counts.all, hint: `${(leads ?? []).filter((l) => Date.now() - +new Date(l.receivedAt) < 7 * 864e5).length} this week` },
    { label: "Waiting on you", value: counts.new, hint: counts.new ? "Reply within a day" : "All answered", accent: counts.new > 0 },
    { label: "In progress", value: counts.contacted + counts.mockup, hint: `${counts.mockup} with a mockup` },
    { label: "Won", value: won, hint: closed ? `${Math.round((won / closed) * 100)}% of closed leads` : "None closed yet" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 pt-3">
        <div className="frame">
          <div className="glass-dark flex min-h-[60px] items-center gap-2 rounded-full py-2 pl-5 pr-2 sm:gap-3">
            <a href="/" className="link-quiet shrink-0" aria-label="SERMA home">
              <Wordmark />
            </a>
            <span className="chip-dark hidden text-ash sm:inline-flex">CRM</span>
            <span className="ml-auto hidden text-[0.8125rem] text-ash md:inline" aria-live="polite">
              {preview ? "Sample data" : refreshing ? "Updating…" : `Updated ${relativeTime(new Date(lastLoaded).toISOString())}`}
            </span>
            <button type="button" onClick={load} disabled={refreshing} className="btn-line-dark btn-sm glass-flat ml-auto h-11 w-11 shrink-0 p-0 md:ml-0" aria-label="Refresh leads" title="Refresh leads">
              <motion.span
                className="grid place-items-center"
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={refreshing ? { duration: 0.9, ease: "linear", repeat: Infinity } : { duration: 0 }}
              >
                <RefreshCw aria-hidden="true" size={17} strokeWidth={1.75} />
              </motion.span>
            </button>
            <button type="button" onClick={exportCsv} className="btn-line-dark btn-sm glass-flat h-11 w-11 shrink-0 p-0 sm:w-auto sm:px-4" title="Download as a spreadsheet (CSV)">
              <Download aria-hidden="true" size={17} strokeWidth={1.75} />
              <span className="sr-only sm:not-sr-only">Export</span>
            </button>
            <ThemeToggle />
            <button type="button" onClick={signOut} className="btn-line-dark btn-sm glass-flat h-11 w-11 shrink-0 p-0" aria-label="Sign out" title="Sign out">
              <LogOut aria-hidden="true" size={17} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="frame pb-20 pt-8 sm:pt-12">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_EDITORIAL }}>
          <h1 className="font-display text-display-md text-bone">
            Your <span className="font-serif font-normal italic text-aqua">leads</span>
          </h1>
          <p className="mt-2 text-[0.9375rem] text-ash">
            {preview ? "Local preview with sample people. " : ""}Everyone who sent the pricing form or asked for a free mockup.
          </p>
        </motion.div>

        {loadError ? (
          <div role="alert" className="mt-6 rounded-glass-sm border border-signal-deep bg-signal/[0.08] px-4 py-3 text-[0.9375rem] text-bone">
            {loadError}{" "}
            <button type="button" onClick={load} className="link-quiet font-medium underline underline-offset-2">
              Try again
            </button>
          </div>
        ) : null}

        {/* KPIs: tiles rise in a quick stagger; the numbers then tick up on their own spring. */}
        <ul className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPIS.map((k, i) => (
            <motion.li
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_SMOOTH, delay: 0.08 + i * 0.05 }}
              className="glass-dark glass-flat glass-solid rounded-glass p-4 sm:p-5"
            >
              <p className="eyebrow flex items-center gap-2 text-ash">
                {k.accent ? (
                  <span aria-hidden="true" className="relative inline-flex h-2 w-2">
                    <span className="absolute inset-0 animate-live-pulse rounded-full bg-aqua" />
                    <span className="relative h-2 w-2 rounded-full bg-aqua" />
                  </span>
                ) : null}
                {k.label}
              </p>
              <p className="mt-2 font-display text-[2.25rem] leading-none tracking-[-0.03em] text-bone sm:text-[2.75rem]">
                {leads ? <Ticker value={k.value} /> : <span className="text-ash">–</span>}
              </p>
              <p className="mt-2 text-[0.8125rem] text-ash">{leads ? k.hint : " "}</p>
            </motion.li>
          ))}
        </ul>

        <Pipeline counts={counts} />

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
          {/* ---------- list ---------- */}
          <section aria-label="Leads" className="glass-dark glass-flat glass-solid rounded-glass p-3 sm:p-4">
            <div className="flex flex-col gap-3 px-1 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <LayoutGroup id="filters">
                <div role="group" aria-label="Filter by stage" className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                  {(["all", ...STATUSES] as Filter[]).map((f) => {
                    const on = filter === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setFilter(f)}
                        className={`${PILL} relative shrink-0 ${on ? "text-ink" : PILL_OFF}`}
                      >
                        {/* The aqua capsule glides to the pressed filter instead of blinking between them. */}
                        {on ? <motion.span layoutId="filter-on" transition={SPRING_SNAPPY} className={`absolute inset-0 rounded-full ${PILL_ON}`} /> : null}
                        <span className="relative">{f === "all" ? "All" : STATUS_LABEL[f]}</span>
                        <span className={`relative tabular text-[0.75rem] ${on ? "text-ink/70" : "text-ash"}`}>{counts[f]}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
              <label className="relative block sm:w-56">
                <span className="sr-only">Search leads</span>
                <Search aria-hidden="true" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="field !rounded-full !py-2 pl-10 text-[0.9375rem]"
                />
              </label>
            </div>

            <p className="sr-only" aria-live="polite">
              {leads ? `Showing ${visible.length} leads.` : ""}
            </p>

            {!leads ? (
              <SkeletonRows />
            ) : visible.length === 0 ? (
              <EmptyState none={leads.length === 0} />
            ) : (
              <ul ref={listRef} className="mt-3 grid gap-1">
                <AnimatePresence initial={false} mode="popLayout">
                  {visible.map((l, i) => (
                    <motion.li
                      key={l.id}
                      layout="position"
                      initial={{ opacity: 0, y: fresh.has(l.id) ? -18 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                      transition={{ ...SPRING_SMOOTH, delay: Math.min(i, 10) * 0.025 }}
                      className="relative"
                    >
                      {fresh.has(l.id) ? (
                        <motion.span
                          aria-hidden="true"
                          initial={{ opacity: 0.9 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 2.2, ease: "easeOut", delay: 0.3 }}
                          className="pointer-events-none absolute inset-0 rounded-[12px] bg-aqua/25"
                        />
                      ) : null}
                      <LeadRow lead={l} selected={l.id === selectedId} onOpen={() => setSelectedId(l.id)} onKeyDown={(e) => onRowKey(e, i)} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>

          {/* ---------- detail: a sticky pane on wide screens, a sheet from the bottom on phones ---------- */}
          {wide ? (
            <aside aria-label="Lead details" className="sticky top-[92px]">
              <div className="glass-dark glass-flat glass-solid max-h-[calc(100svh-108px)] overflow-y-auto rounded-glass">
                <AnimatePresence mode="wait" initial={false}>
                  {selected ? (
                    <motion.div
                      key={selected.id}
                      initial={{ opacity: 0, x: 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8, transition: { duration: 0.12 } }}
                      transition={{ duration: 0.24, ease: EASE_EDITORIAL }}
                    >
                      <LeadDetail lead={selected} onPatch={patch} say={say} />
                    </motion.div>
                  ) : (
                    <p className="p-8 text-center text-[0.9375rem] text-ash">Pick a lead to see the details.</p>
                  )}
                </AnimatePresence>
              </div>
            </aside>
          ) : wide === false ? (
            <MobileSheet lead={selected} onClose={() => setSelectedId(null)} onPatch={patch} say={say} />
          ) : null}
        </div>
      </main>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        <AnimatePresence>
          {toast ? (
            <motion.p
              key={toast}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={SPRING_SNAPPY}
              className="glass-dark glass-solid rounded-full px-5 py-3 text-[0.9375rem] text-bone shadow-lg"
            >
              {toast}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}

/* ------------------------------ pieces ------------------------------ */

function LeadRow({
  lead,
  selected,
  onOpen,
  onKeyDown,
}: {
  lead: Lead;
  selected: boolean;
  onOpen: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      data-lead={lead.id}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      aria-current={selected || undefined}
      className={`${ROW} ${selected ? ROW_SELECTED : ""} relative flex w-full items-center gap-3 px-3 py-3 text-left transition-colors duration-fast`}
    >
      <span className="relative">
        <Avatar name={lead.name || "?"} tone={lead.status === "new" ? "aqua" : "neutral"} />
        {lead.status === "new" ? (
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5">
            <span className="absolute inset-0 animate-live-pulse rounded-full bg-aqua" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-aqua ring-2 ring-ink-900" />
          </span>
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-bone">{lead.name || "No name"}</span>
        <span className="block truncate text-[0.8125rem] text-ash">
          {lead.business || "—"}
          <span aria-hidden="true"> · </span>
          {sourceOf(lead)}
          {lead.package ? ` · ${lead.package}` : ""}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={lead.status}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
          >
            <StatusChip tone={STATUS_TONE[lead.status]}>{STATUS_LABEL[lead.status]}</StatusChip>
          </motion.span>
        </AnimatePresence>
        <span className="tabular text-[0.75rem] text-ash">{relativeTime(lead.receivedAt)}</span>
      </span>
    </button>
  );
}

/** One bar, five stages. Segments re-proportion with a layout spring when a lead changes stage. */
function Pipeline({ counts }: { counts: Record<Filter, number> }) {
  const total = counts.all;
  return (
    <section aria-label="Pipeline" className={`${CARD} glass-dark glass-flat mt-3 !rounded-glass`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="eyebrow text-ash">Pipeline</h2>
        <p className="text-[0.8125rem] text-ash">{total ? `${total} leads` : "Empty"}</p>
      </div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.25 }}
        className="mt-3 flex h-3 origin-left gap-[3px] overflow-hidden rounded-full bg-bone/[0.08]"
      >
        {STATUSES.map((s) =>
          counts[s] > 0 ? (
            <motion.span key={s} layout transition={SPRING_SMOOTH} className={`h-full rounded-full ${STATUS_FILL[s]}`} style={{ flexGrow: counts[s] }} />
          ) : null,
        )}
      </motion.div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {STATUSES.map((s) => (
          <li key={s} className="flex items-center gap-2 text-[0.8125rem] text-ash">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${STATUS_FILL[s]}`} />
            {STATUS_LABEL[s]}
            <span className="tabular font-medium text-bone">{counts[s]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MobileSheet({
  lead,
  onClose,
  onPatch,
  say,
}: {
  lead: Lead | null;
  onClose: () => void;
  onPatch: (id: string, c: Partial<Pick<Lead, "status" | "note">>) => Promise<void>;
  say: (m: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  useEffect(() => {
    if (!lead) return;
    const back = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => ref.current?.focus());
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      back?.focus();
    };
  }, [lead, onClose]);

  return (
    <AnimatePresence>
      {lead ? (
        <motion.div key="sheet" className="fixed inset-0 z-40 flex items-end" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-ink/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Drag the handle down to dismiss: the sheet follows the finger and a flick closes it. */}
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={`Lead: ${lead.name}`}
            tabIndex={-1}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && onClose()}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%", transition: { duration: 0.22, ease: EASE_EDITORIAL } }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="glass-dark glass-solid glass-flat relative max-h-[88svh] !bg-ink-900 w-full overflow-y-auto rounded-t-glass-lg outline-none"
          >
            <div
              onPointerDown={(e) => drag.start(e)}
              className="sticky top-0 z-10 flex cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
            >
              <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-bone/25" />
            </div>
            <LeadDetail lead={lead} onPatch={onPatch} say={say} onClose={onClose} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function SkeletonRows() {
  return (
    <ul aria-hidden="true" className="mt-3 grid gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-3" style={{ opacity: 1 - i * 0.16 }}>
          <span className="h-8 w-8 rounded-full bg-bone/[0.08]" />
          <span className="grid flex-1 gap-2">
            <span className="h-3 w-1/3 rounded-full bg-bone/[0.08]" />
            <span className="h-2.5 w-1/2 rounded-full bg-bone/[0.06]" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ none }: { none: boolean }) {
  return (
    <div className={`${CARD_FLUSH} mt-3 grid place-items-center px-6 py-14 text-center`}>
      <Inbox aria-hidden="true" size={26} strokeWidth={1.5} className="text-ash" />
      <p className="mt-3 font-display text-lg text-bone">{none ? "No leads yet" : "Nothing here"}</p>
      <p className="mt-1 max-w-xs text-[0.9375rem] text-ash">
        {none ? "When someone fills in a form on your site, they show up here." : "No lead matches this filter or search."}
      </p>
    </div>
  );
}
