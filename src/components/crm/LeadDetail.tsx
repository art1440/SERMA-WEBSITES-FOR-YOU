"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Check, Copy, Loader2, MessageSquareText, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ACTION_PRIMARY, ACTION_SECONDARY, Avatar, LABEL } from "@/components/sections/dashboard/ui";
import { EASE_EDITORIAL, SPRING_SNAPPY } from "@/lib/motion";
import { STATUSES, STATUS_LABEL, dialable, fullDate, relativeTime, sourceOf, type Lead } from "./data";

type Props = {
  lead: Lead;
  onPatch: (id: string, c: Partial<Pick<Lead, "status" | "note">>) => Promise<void>;
  say: (m: string) => void;
  onClose?: () => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function LeadDetail({ lead, onPatch, say, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const tel = dialable(lead.phone);

  async function copy() {
    try {
      await navigator.clipboard.writeText(lead.phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      say("Could not copy. Long-press the number instead.");
    }
  }

  /** Calling or texting a brand-new lead moves it to "Contacted" (with a toast so it is never silent). */
  function reached() {
    if (lead.status !== "new") return;
    onPatch(lead.id, { status: "contacted" })
      .then(() => say(`${lead.name.split(" ")[0] || "Lead"} moved to Contacted.`))
      .catch(() => undefined);
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="origin-left scale-[1.35] pt-0.5">
          <Avatar name={lead.name || "?"} tone="aqua" />
        </span>
        <div className="ml-2 min-w-0 flex-1">
          <h2 className="font-display text-2xl leading-tight tracking-[-0.02em] text-bone">{lead.name || "No name"}</h2>
          <p className="truncate text-[0.9375rem] text-ash">{lead.business || "No business name"}</p>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close" className={`${ACTION_SECONDARY} h-11 w-11 shrink-0 !px-0`}>
            <X aria-hidden="true" size={18} />
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-[0.8125rem] text-ash">
        <time dateTime={lead.receivedAt}>{fullDate(lead.receivedAt)}</time> · {relativeTime(lead.receivedAt)} · {sourceOf(lead)}
      </p>

      {lead.phone ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <a href={`tel:${tel}`} onClick={reached} className={ACTION_PRIMARY}>
            <Phone aria-hidden="true" size={15} strokeWidth={2} /> Call
          </a>
          <a href={`sms:${tel}`} onClick={reached} className={ACTION_SECONDARY}>
            <MessageSquareText aria-hidden="true" size={15} strokeWidth={2} /> Text
          </a>
          <button type="button" onClick={copy} className={ACTION_SECONDARY}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={copied ? "y" : "n"}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={SPRING_SNAPPY}
                className="grid place-items-center"
              >
                {copied ? <Check aria-hidden="true" size={15} className="text-aqua" /> : <Copy aria-hidden="true" size={15} />}
              </motion.span>
            </AnimatePresence>
            <span className="tabular">{lead.phone}</span>
            <span className="sr-only" aria-live="polite">
              {copied ? "Copied" : ""}
            </span>
          </button>
        </div>
      ) : null}

      <StageControl lead={lead} onPatch={onPatch} />

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4">
        <Fact label="Package" value={lead.package || "Not sure yet"} />
        <Fact label="Industry" value={lead.industry || "Not given"} />
      </dl>

      <div className="mt-6">
        <h3 className={LABEL}>What they need</h3>
        <p className="mt-2 whitespace-pre-wrap rounded-glass-sm bg-aqua/[0.052] px-4 py-3 text-[0.9375rem] leading-relaxed text-bone">
          {lead.need || "They left this blank."}
        </p>
      </div>

      <NoteBox key={lead.id} lead={lead} onPatch={onPatch} />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={LABEL}>{label}</dt>
      <dd className="mt-1 text-[0.9375rem] text-bone">{value}</dd>
    </div>
  );
}

/**
 * Five stages as one segmented track. The aqua capsule slides to the chosen stage
 * (a shared layout spring), so the change reads as "moved forward", not as a repaint.
 */
function StageControl({ lead, onPatch }: Pick<Props, "lead" | "onPatch">) {
  return (
    <div className="mt-6">
      <h3 id={`stage-${lead.id}`} className={LABEL}>
        Stage
      </h3>
      <LayoutGroup id={`stage-${lead.id}`}>
        <div role="group" aria-labelledby={`stage-${lead.id}`} className="mt-2 flex gap-0.5 overflow-x-auto rounded-full bg-aqua/[0.052] p-1 [scrollbar-width:none]">
          {STATUSES.map((s) => {
            const on = lead.status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => !on && onPatch(lead.id, { status: s }).catch(() => undefined)}
                className={`relative min-h-[40px] flex-auto shrink-0 rounded-full px-2 text-[0.8125rem] sm:px-2.5 font-medium transition-colors duration-fast ${on ? "text-ink" : "text-bone/85 hover:text-bone"}`}
              >
                {on ? (
                  <motion.span
                    layoutId="stage-on"
                    transition={SPRING_SNAPPY}
                    className={`absolute inset-0 rounded-full ${s === "won" ? "bg-live" : s === "lost" ? "bg-bone/70" : "bg-aqua"} shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] forced-colors:outline forced-colors:outline-2 forced-colors:outline-[Highlight]`}
                  />
                ) : null}
                <span className="relative whitespace-nowrap">{STATUS_LABEL[s]}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

/** Private notes. Saves itself 900ms after you stop typing, and on leaving the box. */
function NoteBox({ lead, onPatch }: Pick<Props, "lead" | "onPatch">) {
  const [draft, setDraft] = useState(lead.note);
  const [state, setState] = useState<SaveState>("idle");
  const saved = useRef(lead.note);
  const timer = useRef<number | undefined>(undefined);

  async function flush(value: string) {
    window.clearTimeout(timer.current);
    if (value === saved.current) return;
    setState("saving");
    try {
      await onPatch(lead.id, { note: value });
      saved.current = value;
      setState("saved");
    } catch {
      setState("error");
    }
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`note-${lead.id}`} className={LABEL}>
          Your notes
        </label>
        <span className="min-h-[1rem] text-[0.75rem] text-ash" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: EASE_EDITORIAL }}
              className="inline-flex items-center gap-1.5"
            >
              {state === "saving" ? (
                <>
                  <Loader2 aria-hidden="true" size={12} className="animate-spin" /> Saving…
                </>
              ) : state === "saved" ? (
                <>
                  <Check aria-hidden="true" size={12} className="text-aqua" /> Saved
                </>
              ) : state === "error" ? (
                "Not saved. Keep typing to retry."
              ) : (
                "Only you see these"
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <textarea
        id={`note-${lead.id}`}
        value={draft}
        maxLength={4000}
        rows={4}
        placeholder="Called Tuesday, wants photos of past work…"
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => flush(v), 900);
        }}
        onBlur={(e) => flush(e.target.value)}
        className="field mt-2 resize-y text-[0.9375rem]"
      />
      {lead.updatedAt ? <p className="mt-2 text-[0.75rem] text-ash">Last change {relativeTime(lead.updatedAt)}</p> : null}
    </div>
  );
}
