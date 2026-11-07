"use client";

import { motion } from "framer-motion";
import { CornerDownRight, Megaphone, MessageSquareQuote, Reply, Send, Sparkles, Star } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { NICHE_VIEWS, type NicheViews, type Review, type ReviewPlatform } from "@/data/dashboard-views";
import type { NicheId } from "@/data/niches";
import { fill, type L10n } from "@/i18n/types";
import { EASE_EDITORIAL, SPRING_SMOOTH } from "@/lib/motion";
import { useDashboardView } from "./DashboardViewContext";
import {
  ACTION_PRIMARY,
  ACTION_SECONDARY,
  Avatar,
  CARD,
  DoneButton,
  LABEL,
  PILL,
  PILL_OFF,
  PILL_ON,
  StatusChip,
  ViewHeader,
  revealInPage,
} from "./ui";

/* ------------------------------------------------------------------ *
 * Reviews: rating summary + the latest reviews with one-tap replies.
 *
 * lg+: summary column (left) + review list (right, scrolls inside the
 *      locked plate). <lg: summary cards, then the list, natural height.
 * "Reply" reveals the drafted reply as a read-only card (no text input
 * anywhere); "Post reply" marks `reply:<id>` and turns it into an
 * "Owner replied" block. Nothing is posted or sent.
 * ------------------------------------------------------------------ */

const RECENT_CLIENTS = 12;

const COPY = {
  title: { en: "Reviews", es: "Reseñas" },
  subtitle: { en: "{avg} average · {total} reviews · {needs} need a reply", es: "Promedio de {avg} · {total} reseñas · {needs} sin responder" },
  subtitleOne: { en: "{avg} average · {total} reviews · 1 needs a reply", es: "Promedio de {avg} · {total} reseñas · 1 sin responder" },
  subtitleDone: { en: "{avg} average · {total} reviews · every review answered", es: "Promedio de {avg} · {total} reseñas · todas respondidas" },
  filterGroup: { en: "Filter reviews", es: "Filtrar reseñas" },
  filterAll: { en: "All", es: "Todas" },
  stars: { en: "stars", es: "estrellas" },
  filterNeeds: { en: "Needs reply", es: "Sin responder" },
  filterAnnounce: { en: "Showing {count} reviews.", es: "Mostrando {count} reseñas." },
  summaryTitle: { en: "Average rating", es: "Calificación promedio" },
  outOf5: { en: "{value} out of 5 stars", es: "{value} de 5 estrellas" },
  totalReviews: { en: "{total} reviews", es: "{total} reseñas" },
  platforms: { en: "Google, Yelp and Facebook", es: "Google, Yelp y Facebook" },
  breakdown: { en: "Rating breakdown", es: "Desglose por estrellas" },
  breakdownRow: { en: "{n} stars: {count} reviews ({pct})", es: "{n} estrellas: {count} reseñas ({pct})" },
  breakdownRowOne: { en: "1 star: {count} reviews ({pct})", es: "1 estrella: {count} reseñas ({pct})" },
  requestTitle: { en: "Get more reviews", es: "Consiga más reseñas" },
  requestBody: {
    en: "Text a review link to the clients you saw last week. One tap takes them straight to your Google profile.",
    es: "Envíe por texto un enlace para reseñar a los clientes que atendió la semana pasada. Con un toque llegan directo a su perfil de Google.",
  },
  requestButton: { en: "Request reviews from recent clients", es: "Pedir reseñas a clientes recientes" },
  // Last week's clients only: today's and upcoming bookings (the Calendar) haven't been seen yet at 9:41 AM Monday.
  requestDone: { en: "Sent to {count} clients from last week (demo)", es: "Enviado a {count} clientes de la semana pasada (demo)" },
  requestAnnounce: {
    en: "Review requests sent to {count} clients from last week. Demo only, nothing was sent.",
    es: "Solicitudes de reseña enviadas a {count} clientes de la semana pasada. Es una demo: no se envió nada.",
  },
  listLabel: { en: "Latest reviews", es: "Reseñas más recientes" },
  reply: { en: "Reply", es: "Responder" },
  draftReady: { en: "Reply drafted for you", es: "Respuesta lista para usted" },
  needsReply: { en: "Needs reply", es: "Sin responder" },
  lowRating: { en: "Low rating · reply first", es: "Calificación baja · responda primero" },
  suggested: { en: "Suggested reply", es: "Respuesta sugerida" },
  readOnly: { en: "Read-only in this demo", es: "Solo lectura en esta demo" },
  postingAs: { en: "Posts as {business} on {platform}", es: "Se publica como {business} en {platform}" },
  cancel: { en: "Cancel", es: "Cancelar" },
  post: { en: "Post reply", es: "Publicar respuesta" },
  posted: { en: "Reply posted", es: "Respuesta publicada" },
  ownerReplied: { en: "Owner replied", es: "Respuesta del propietario" },
  justNow: { en: "Just now · demo", es: "Ahora · demo" },
  postedAnnounce: {
    en: "Reply posted on {name}'s review. Demo only, nothing was posted.",
    es: "Respuesta publicada en la reseña de {name}. Es una demo: no se publicó nada.",
  },
  emptyTitle: { en: "All caught up", es: "Todo al día" },
  emptyBody: { en: "Every review in this list has a reply.", es: "Todas las reseñas de esta lista tienen respuesta." },
} satisfies Record<string, L10n>;

const PLATFORM: Record<ReviewPlatform, string> = { google: "Google", yelp: "Yelp", facebook: "Facebook" };

/** The cross-link highlight ring is a box-shadow, which forced-colors mode drops: add a system-colour outline. */
const HIGHLIGHT_FORCED = "forced-colors:outline forced-colors:outline-2 forced-colors:-outline-offset-2 forced-colors:outline-[Highlight]";

type Filter = "all" | "five" | "needs";

/** Cross-links may hand us a review id or the id of an Inbox review alert. */
function resolveReview(id: string, data: NicheViews): Review | undefined {
  const items = data.reviews.items;
  const direct = items.find((r) => r.id === id);
  if (direct) return direct;
  const msg = data.inbox.find((m) => m.id === id);
  if (!msg) return undefined;
  const haystack = [msg.from, msg.subject.en, msg.preview.en].join(" ");
  return items.find((r) => haystack.includes(r.author));
}

/**
 * Focus a target without jolting the page: on lg+ only the list's own scroller
 * moves, revealing `area` (the block around the target: its draft, its card…).
 */
function focusInPane(el: HTMLElement | null, scroller: HTMLElement | null, area: HTMLElement | null, alignTop: boolean, pinned: boolean) {
  if (!el) return;
  const box = area ?? el;
  const lg = window.matchMedia("(min-width: 1024px)").matches;
  el.focus({ preventScroll: true });
  if (!lg) {
    box.scrollIntoView({ block: alignTop ? "start" : "nearest" });
    return;
  }
  scrollPaneTo(box, scroller, alignTop);
  // Unpinned laptops: the list itself may sit under the sticky header or below the fold.
  revealInPage(el, pinned);
}

/** Move only the list's scroller so `box` is inside it (lg+). */
function scrollPaneTo(box: HTMLElement, scroller: HTMLElement | null, alignTop: boolean) {
  if (!scroller) return;
  let top = 0;
  let node: HTMLElement | null = box;
  while (node && node !== scroller) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== scroller) return;
  const pad = 8;
  const fitsBelow = top + box.offsetHeight + pad <= scroller.scrollTop + scroller.clientHeight;
  if (alignTop || top - pad < scroller.scrollTop) scroller.scrollTop = Math.max(0, top - pad);
  else if (!fitsBelow) scroller.scrollTop = Math.min(top - pad, top + box.offsetHeight + pad - scroller.clientHeight);
}

/** Five stars with fractional fill (e.g. 4.8). One image with a text equivalent. */
function Stars({ value, label, size = 14 }: { value: number; label: string; size?: number }) {
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => {
        const part = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} aria-hidden="true" className="relative block shrink-0" style={{ width: size, height: size }}>
            {/* Empty slots at white/40 (≈3.7:1 on the card); in forced colors GrayText vs CanvasText. */}
            <Star size={size} strokeWidth={0} fill="currentColor" className="absolute inset-0 text-white/40 forced-colors:text-[GrayText]" />
            {part > 0 ? (
              <span className="absolute inset-0" style={part < 1 ? { clipPath: `inset(0 ${(1 - part) * 100}% 0 0)` } : undefined}>
                <Star size={size} strokeWidth={0} fill="currentColor" className="text-aqua forced-colors:text-[CanvasText]" />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}

function PlatformChip({ platform }: { platform: ReviewPlatform }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-white/[0.03] px-2 py-0.5 text-[0.6875rem] font-medium text-bone/80 ring-1 ring-inset ring-white/[0.12]">
      {PLATFORM[platform]}
    </span>
  );
}

export function ReviewsView() {
  const { nicheId } = useNiche();
  // Keyed by industry: filter, open draft and focus state reset when the industry changes.
  return <ReviewsBoard key={nicheId} nicheId={nicheId} />;
}

function ReviewsBoard({ nicheId }: { nicheId: NicheId }) {
  const { locale, intlLocale } = useLanguage();
  const { niche } = useNiche();
  const { isDone, markDone, announce, focusId, clearFocus, pinned } = useDashboardView();
  const pinnedRef = useRef(pinned);
  pinnedRef.current = pinned;
  const data = NICHE_VIEWS[nicheId];
  const { average, total, distribution, items } = data.reviews;
  const business = niche.simulator.business;

  const [filter, setFilter] = useState<Filter>("all");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  /** Replied during this filter session: they stay listed under "Needs reply" until the filter changes. */
  const [kept, setKept] = useState<ReadonlySet<string>>(() => new Set());
  /** `area`: "card" reveals the whole review (cross-links), "block" the draft/reply block around the target. */
  const [focusReq, setFocusReq] = useState<{ id: string; area: "card" | "block"; tick: number } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const isReplied = (r: Review) => r.replied || isDone(`reply:${r.id}`);
  const needsCount = items.filter((r) => !isReplied(r)).length;
  const matches = (r: Review, f: Filter) => (f === "all" ? true : f === "five" ? r.rating === 5 : !isReplied(r));
  const visible = items.filter((r) => matches(r, filter) || kept.has(r.id));
  const counts: Record<Filter, number> = {
    all: items.length,
    five: items.filter((r) => r.rating === 5).length,
    needs: needsCount,
  };

  const uid = (reviewId: string, part: string) => `rv-${reviewId}-${part}`;
  const requestFocus = (id: string, area: "card" | "block" = "block") => setFocusReq((r) => ({ id, area, tick: (r?.tick ?? 0) + 1 }));
  useEffect(() => {
    if (!focusReq) return;
    const el = document.getElementById(focusReq.id);
    const area = focusReq.area === "card" ? el?.closest<HTMLElement>("article") : el?.closest<HTMLElement>("[data-reveal]");
    focusInPane(el, listRef.current, area ?? el, focusReq.area === "card", pinnedRef.current);
  }, [focusReq]);

  // Cross-links ("Review & reply" in an Inbox email) open that review's draft. Only focusId triggers it.
  const isDoneRef = useRef(isDone);
  isDoneRef.current = isDone;
  useEffect(() => {
    if (!focusId) return;
    const target = resolveReview(focusId, data);
    clearFocus();
    if (!target) return;
    const replied = target.replied || isDoneRef.current(`reply:${target.id}`);
    setFilter("all");
    setKept(new Set());
    setHighlightId(target.id);
    setDraftId(replied ? null : target.id);
    setFocusReq((r) => ({ id: `rv-${target.id}-${replied ? "author" : "draft"}`, area: "card", tick: (r?.tick ?? 0) + 1 }));
  }, [focusId, data, clearFocus]);

  const changeFilter = (next: Filter) => {
    if (next === filter) return;
    setFilter(next);
    setKept(new Set());
    setDraftId(null);
    announce(fill(COPY.filterAnnounce[locale], { count: items.filter((r) => matches(r, next)).length }));
  };

  const openDraft = (r: Review) => {
    setDraftId(r.id);
    setHighlightId(null);
    requestFocus(uid(r.id, "draft"));
  };
  const closeDraft = (r: Review) => {
    setDraftId(null);
    requestFocus(uid(r.id, "reply"));
  };
  const postReply = (r: Review) => {
    markDone(`reply:${r.id}`);
    setKept((prev) => new Set(prev).add(r.id));
    setDraftId(null);
    announce(fill(COPY.postedAnnounce[locale], { name: r.author }).replace(/\.\./g, ".")); // "Sophie A." + "." → one period
    requestFocus(uid(r.id, "owner"));
  };

  const avgText = new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average);
  const totalText = new Intl.NumberFormat(intlLocale).format(total);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-2 pb-3 pt-2 sm:px-3 sm:pt-3">
        <ViewHeader
          title={COPY.title[locale]}
          subtitle={fill((needsCount > 1 ? COPY.subtitle : needsCount === 1 ? COPY.subtitleOne : COPY.subtitleDone)[locale], { avg: avgText, total: totalText, needs: needsCount })}
          actions={
            <div role="group" aria-label={COPY.filterGroup[locale]} className="flex flex-wrap gap-1.5">
              {(["all", "five", "needs"] as const).map((f) => {
                const on = f === filter;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={on}
                    onClick={() => changeFilter(f)}
                    className={`${PILL} ${on ? PILL_ON : PILL_OFF} transition-transform duration-200 ease-editorial active:scale-[0.97]`}
                  >
                    {f === "all" ? (
                      COPY.filterAll[locale]
                    ) : f === "five" ? (
                      <span className="inline-flex items-center gap-0.5">
                        5
                        <Star aria-hidden="true" size={12} strokeWidth={0} fill="currentColor" className={on ? "" : "text-aqua"} />
                        <span className="sr-only"> {COPY.stars[locale]}</span>
                      </span>
                    ) : (
                      COPY.filterNeeds[locale]
                    )}
                    <span className={`tabular text-[0.75rem] ${on ? "text-ink/70" : "text-ash"}`}>{counts[f]}</span>
                  </button>
                );
              })}
            </div>
          }
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-1.5 sm:gap-2 lg:grid-cols-[20rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
        {/* ---------- Summary column ---------- */}
        <div className="grid content-start gap-1.5 sm:grid-cols-2 sm:gap-2 lg:min-h-0 lg:grid-cols-1 lg:overflow-y-auto">
          <RatingSummary average={average} avgText={avgText} totalText={totalText} distribution={distribution} />
          <RequestReviews nicheId={nicheId} />
        </div>

        {/* ---------- Review list ---------- */}
        {visible.length ? (
          <ul
            ref={listRef}
            aria-label={COPY.listLabel[locale]}
            className="relative flex flex-col gap-1.5 sm:gap-2 lg:min-h-0 lg:overflow-y-auto"
          >
            {visible.map((r, i) => (
              <motion.li
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE_EDITORIAL, delay: Math.min(i, 6) * 0.04 }}
              >
                <ReviewCard
                  review={r}
                  business={business}
                  replied={isReplied(r)}
                  repliedNow={!r.replied && isDone(`reply:${r.id}`)}
                  draftOpen={draftId === r.id}
                  highlighted={highlightId === r.id}
                  uid={uid}
                  onReply={() => openDraft(r)}
                  onCancel={() => closeDraft(r)}
                  onPost={() => postReply(r)}
                />
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className={`${CARD} grid place-items-center py-12 text-center`}>
            <div>
              <span aria-hidden="true" className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-aqua">
                <MessageSquareQuote size={18} strokeWidth={1.75} />
              </span>
              <p className="mt-3 text-sm font-medium text-bone">{COPY.emptyTitle[locale]}</p>
              <p className="mt-1 text-[0.8125rem] text-ash">{COPY.emptyBody[locale]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RatingSummary({
  average,
  avgText,
  totalText,
  distribution,
}: {
  average: number;
  avgText: string;
  totalText: string;
  distribution: [number, number, number, number, number];
}) {
  const { locale, intlLocale } = useLanguage();
  const pctFmt = new Intl.NumberFormat(intlLocale, { style: "percent", maximumFractionDigits: 0 });
  const sum = distribution.reduce((a, b) => a + b, 0) || 1;
  return (
    <section aria-labelledby="rv-summary-title" className={CARD}>
      <h4 id="rv-summary-title" className={LABEL}>
        {COPY.summaryTitle[locale]}
      </h4>
      <div className="mt-2 flex items-end gap-3">
        <p className="tabular font-display text-5xl leading-[0.9] tracking-[-0.045em] text-bone">{avgText}</p>
        <div className="pb-0.5">
          <Stars value={average} size={16} label={fill(COPY.outOf5[locale], { value: avgText })} />
          <p className="mt-1 text-xs text-ash">{fill(COPY.totalReviews[locale], { total: totalText })}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-ash">{COPY.platforms[locale]}</p>

      <h5 className="sr-only">{COPY.breakdown[locale]}</h5>
      <ul className="mt-4 flex flex-col gap-2">
        {distribution.map((count, i) => {
          const stars = 5 - i;
          const share = count / sum;
          // A non-zero count always shows a sliver of bar.
          const shown = count > 0 ? Math.max(share * 100, 2) : 0;
          return (
            <li key={stars} className="flex items-center gap-2.5">
              <span className="sr-only">
                {fill((stars === 1 ? COPY.breakdownRowOne : COPY.breakdownRow)[locale], {
                  n: stars,
                  count: new Intl.NumberFormat(intlLocale).format(count),
                  pct: pctFmt.format(share),
                })}
              </span>
              <span aria-hidden="true" className="tabular flex w-6 shrink-0 items-center gap-0.5 text-xs font-medium text-bone/85">
                {stars}
                <Star size={10} strokeWidth={0} fill="currentColor" className="text-ash" />
              </span>
              <span aria-hidden="true" className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.span
                  className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,#12A594,#3DDBC9)]"
                  initial={{ x: "-100%" }}
                  animate={{ x: `${shown - 100}%` }}
                  transition={{ ...SPRING_SMOOTH, delay: 0.1 + i * 0.05 }}
                />
              </span>
              <span aria-hidden="true" className="tabular w-8 shrink-0 text-right text-xs text-ash">
                {new Intl.NumberFormat(intlLocale).format(count)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function RequestReviews({ nicheId }: { nicheId: NicheId }) {
  const { locale } = useLanguage();
  const { isDone, markDone, announce } = useDashboardView();
  const key = `requestReviews:${nicheId}`;
  const done = isDone(key);
  return (
    <section aria-labelledby="rv-request-title" className={`${CARD} flex flex-col`}>
      <h4 id="rv-request-title" className={`${LABEL} flex items-center gap-1.5`}>
        <Megaphone aria-hidden="true" size={14} strokeWidth={2} className="text-aqua" />
        {COPY.requestTitle[locale]}
      </h4>
      <p className="mt-1.5 text-[0.8125rem] leading-snug text-bone/85">{COPY.requestBody[locale]}</p>
      <DoneButton
        label={COPY.requestButton[locale]}
        doneLabel={fill(COPY.requestDone[locale], { count: RECENT_CLIENTS })}
        done={done}
        onPress={() => {
          markDone(key);
          announce(fill(COPY.requestAnnounce[locale], { count: RECENT_CLIENTS }));
        }}
        icon={<Send aria-hidden="true" size={15} strokeWidth={2} />}
        className="mt-3 w-full !px-3 py-2 text-center !text-[0.8125rem] leading-tight"
      />
    </section>
  );
}

function ReviewCard({
  review: r,
  business,
  replied,
  repliedNow,
  draftOpen,
  highlighted,
  uid,
  onReply,
  onCancel,
  onPost,
}: {
  review: Review;
  business: string;
  replied: boolean;
  repliedNow: boolean;
  draftOpen: boolean;
  highlighted: boolean;
  uid: (id: string, part: string) => string;
  onReply: () => void;
  onCancel: () => void;
  onPost: () => void;
}) {
  const { locale } = useLanguage();
  const low = r.rating <= 3;
  // Low ratings get a thin signal edge (a small alert accent, never the only cue: the chip says it too).
  // A card opened from a cross-link gets the aqua selection ring.
  const edge = low
    ? highlighted
      ? "shadow-[inset_3px_0_0_rgba(229,88,42,0.8),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(61,219,201,0.45)]"
      : "shadow-[inset_3px_0_0_rgba(229,88,42,0.8),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(229,88,42,0.16)]"
    : highlighted
      ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(61,219,201,0.45)]"
      : "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_0_1px_rgba(255,255,255,0.04)]";

  return (
    <article
      aria-labelledby={uid(r.id, "author")}
      className={`rounded-glass-sm bg-white/[0.04] p-4 sm:p-5 lg:p-4 ${edge} ${highlighted ? HIGHLIGHT_FORCED : ""}`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={r.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h4
              id={uid(r.id, "author")}
              tabIndex={-1}
              className="rounded-md text-sm font-medium text-bone focus-visible:[outline-offset:2px]"
            >
              {r.author}
            </h4>
            <PlatformChip platform={r.platform} />
            <span className="text-xs text-ash">{r.when[locale]}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Stars value={r.rating} size={13} label={fill(COPY.outOf5[locale], { value: r.rating })} />
            {low ? (
              // Signal stays on the dot and ring (small alert accent); the word is bone for AA contrast.
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium text-bone/90 ring-1 ring-inset ring-signal/50">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                {COPY.lowRating[locale]}
              </span>
            ) : null}
          </div>
        </div>
        {!replied ? (
          <span className="hidden sm:inline-flex">
            <StatusChip tone="aqua">{COPY.needsReply[locale]}</StatusChip>
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-[0.875rem] leading-relaxed text-bone/90">{r.text[locale]}</p>

      {replied ? (
        <motion.div
          key="owner"
          data-reveal=""
          className="mt-3 rounded-[12px] bg-white/[0.035] px-3 py-2.5 shadow-[inset_2px_0_0_rgba(61,219,201,0.6)]"
          initial={repliedNow ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h5
              id={uid(r.id, "owner")}
              tabIndex={-1}
              className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-aqua focus-visible:[outline-offset:2px]"
            >
              <CornerDownRight aria-hidden="true" size={13} strokeWidth={2} />
              {COPY.ownerReplied[locale]}
            </h5>
            <span className="text-xs text-ash">
              {business}
              {repliedNow ? ` · ${COPY.justNow[locale]}` : ""}
            </span>
          </div>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-bone/85">{r.suggestedReply[locale]}</p>
        </motion.div>
      ) : draftOpen ? (
        <motion.div
          key="draft"
          data-reveal=""
          className="mt-3 rounded-[12px] bg-white/[0.03] p-3 shadow-[inset_0_0_0_1px_rgba(61,219,201,0.28)]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              onCancel();
            }
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h5
              id={uid(r.id, "draft")}
              tabIndex={-1}
              className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-aqua focus-visible:[outline-offset:2px]"
            >
              <Sparkles aria-hidden="true" size={13} strokeWidth={2} />
              {COPY.suggested[locale]}
            </h5>
            <span className="text-[0.6875rem] text-ash">{COPY.readOnly[locale]}</span>
          </div>
          {/* Looks like a text field, but it is plain text: nothing to type, nothing collected. */}
          <p className="mt-2 rounded-[10px] bg-black/25 px-3 py-2.5 text-[0.8125rem] leading-relaxed text-bone shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            {r.suggestedReply[locale]}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-ash">{fill(COPY.postingAs[locale], { business, platform: PLATFORM[r.platform] })}</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onCancel} className={ACTION_SECONDARY}>
                {COPY.cancel[locale]}
              </button>
              <DoneButton
                label={COPY.post[locale]}
                doneLabel={COPY.posted[locale]}
                done={false}
                onPress={onPost}
                icon={<Send aria-hidden="true" size={15} strokeWidth={2} />}
              />
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <button id={uid(r.id, "reply")} type="button" onClick={onReply} className={low ? ACTION_PRIMARY : ACTION_SECONDARY}>
            <Reply aria-hidden="true" size={15} strokeWidth={2} />
            {COPY.reply[locale]}
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs text-ash">
            <Sparkles aria-hidden="true" size={12} strokeWidth={2} className="text-aqua" />
            {COPY.draftReady[locale]}
          </span>
          <span className="sm:hidden">
            <StatusChip tone="aqua">{COPY.needsReply[locale]}</StatusChip>
          </span>
        </div>
      )}
    </article>
  );
}
