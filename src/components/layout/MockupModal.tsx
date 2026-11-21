"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, Check, Loader2, Phone, User, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { clean, MAX, MIN_FILL_MS } from "@/components/sections/EnquiryForm";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { ENQUIRY, phoneValid } from "@/data/enquiry";
import { MOCKUP } from "@/data/mockup";
import { EASE_EDITORIAL } from "@/lib/motion";

type Props = { open: boolean; onClose: () => void };
type Status = "idle" | "sending" | "done" | "error";
type Field = "name" | "business" | "phone" | "consent";
const ORDER: Field[] = ["name", "business", "phone", "consent"];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SPRING_OPEN = { type: "spring", stiffness: 360, damping: 32, mass: 0.9 } as const;

/**
 * "Get your free preview" pop-up. Left: why a site matters and three easy steps.
 * Right: a three-field form. Posts to the same Netlify form ("enquiries") as the
 * pricing form, so every lead lands in one list.
 *
 * Motion: the sheet springs up from slightly below, the "free preview" highlight
 * sweeps in behind the words like a marker, and the three steps follow in order.
 * On send, the form gives way to a check that draws itself. Esc, backdrop and
 * the × all close; focus is trapped while open and returned afterwards.
 */
export function MockupModal({ open, onClose }: Props) {
  const { locale, t } = useLanguage();
  const M = MOCKUP;
  const E = ENQUIRY;
  const dialogRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [firstName, setFirstName] = useState("");
  const openedAt = useRef(0);

  useEffect(() => setMounted(true), []);

  // Each opening starts fresh, unless the last one is mid-send.
  useEffect(() => {
    if (!open) return;
    openedAt.current = Date.now();
    setStatus((s) => (s === "sending" ? s : "idle"));
    setErrors({});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const restoreTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Desktop: straight into the first box. Phones: the dialog itself, so the keyboard doesn't jump up over the pitch.
    const frame = requestAnimationFrame(() => {
      const wide = window.matchMedia("(min-width: 768px)").matches;
      const target = wide
        ? dialogRef.current?.querySelector<HTMLElement>("input[name='name']")
        : dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      target?.focus({ preventScroll: true });
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (!current || !items.includes(current)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  function check(name: Field, raw: FormDataEntryValue | null): string {
    if (name === "consent") return raw === "yes" ? "" : E.errConsent[locale];
    const v = clean(raw, MAX[name]);
    if (!v) return { name: E.errName, business: E.errBusiness, phone: E.errPhone }[name][locale];
    if (name === "phone" && !phoneValid(v)) return E.errPhone[locale];
    return "";
  }

  const recheck = (name: Field) => (e: { currentTarget: HTMLInputElement }) => {
    const el = e.currentTarget;
    const msg = check(name, el.type === "checkbox" ? (el.checked ? "yes" : "") : el.value);
    setErrors((prev) => (prev[name] === (msg || undefined) ? prev : { ...prev, [name]: msg || undefined }));
  };
  const fix = (name: Field) => (e: { currentTarget: HTMLInputElement }) => {
    if (errors[name]) recheck(name)(e);
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const found: Partial<Record<Field, string>> = {};
    for (const f of ORDER) {
      const m = check(f, data.get(f));
      if (m) found[f] = m;
    }
    setErrors(found);
    const firstBad = ORDER.find((f) => found[f]);
    if (firstBad) {
      (form.elements.namedItem(firstBad) as HTMLElement | null)?.focus();
      return;
    }
    const name = clean(data.get("name"), MAX.name);
    setFirstName(name.split(" ")[0] ?? "");

    // Spam: a filled honeypot or an instant submission is a bot. Look successful, send nothing.
    if (String(data.get("bot-field") ?? "") !== "" || Date.now() - openedAt.current < MIN_FILL_MS) {
      form.reset();
      setStatus("done");
      return;
    }

    const body = new URLSearchParams();
    body.set("form-name", "enquiries");
    body.set("name", name);
    body.set("business", clean(data.get("business"), MAX.business));
    body.set("phone", clean(data.get("phone"), MAX.phone));
    body.set("package", "");
    body.set("industry", "");
    body.set("need", M.needNote);
    body.set("consent", "yes");
    body.set("bot-field", "");
    body.set("submitted_on", new Date().toISOString());

    setStatus("sending");
    try {
      const res = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const done = status === "done";
  const sending = status === "sending";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mockup-overlay"
          className="fixed inset-0 z-[90] flex items-end justify-center md:items-center md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-bone-50/55" onClick={onClose} aria-hidden="true" />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mockup-title"
            className="relative flex max-h-[94svh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[1.75rem] shadow-[0_0_0_2px_rgb(var(--aqua-glow)/0.9),0_40px_100px_-30px_rgb(var(--bone-50)/0.6)] md:rounded-[2rem]"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.18, ease: "easeIn" } }}
            transition={SPRING_OPEN}
          >
            {/* Close: pinned to the sheet's corner (outside the scroller) so it is always in reach on phones. */}
            <button
              type="button"
              onClick={onClose}
              aria-label={M.close[locale]}
              className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-ink-700 text-bone shadow-[0_4px_14px_-6px_rgb(var(--bone-50)/0.5)] transition-colors duration-150 hover:bg-ink-600 sm:right-5 sm:top-5"
            >
              <X aria-hidden="true" size={20} strokeWidth={2} />
            </button>
            <div className="flex flex-col overflow-y-auto overscroll-contain md:grid md:grid-cols-[0.92fr_1.08fr]">
              <Pitch locale={locale} audience={t.hero.eyebrow} />

              {/* Right: the form (or the thank-you). */}
              <div className="relative shrink-0 bg-ink-900 px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-7 text-bone sm:px-10 sm:pb-10 sm:pt-10">
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <Done key="done" locale={locale} firstName={firstName} onClose={onClose} />
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                    >
                      <p className="inline-flex items-center gap-2 rounded-full bg-aqua/[0.08] px-3.5 py-1.5 pr-4 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-aqua ring-1 ring-aqua/30">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                          <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-live" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-live" />
                        </span>
                        {M.chip[locale]}
                      </p>
                      <h2
                        id="mockup-title"
                        data-autofocus
                        tabIndex={-1}
                        className="mt-5 pr-10 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] text-balance focus:outline-none sm:text-[2.5rem]"
                      >
                        {M.title[locale]}
                      </h2>
                      <p className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-ash sm:text-base">
                        {M.subBefore[locale]} <strong className="font-semibold text-bone">{M.subStrong[locale]}</strong> {M.subAfter[locale]}
                      </p>

                      <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={sending} className="mt-7 grid gap-4">
                        <p className="hidden">
                          <label>
                            Leave this field empty
                            <input name="bot-field" tabIndex={-1} autoComplete="off" />
                          </label>
                        </p>
                        <fieldset disabled={sending} className="contents">
                          <IconField
                            name="name"
                            label={M.fieldName[locale]}
                            icon={User}
                            placeholder={M.phName[locale]}
                            autoComplete="name"
                            maxLength={MAX.name}
                            error={errors.name}
                            onBlur={recheck("name")}
                            onChange={fix("name")}
                          />
                          <IconField
                            name="business"
                            label={M.fieldBusiness[locale]}
                            icon={Building2}
                            placeholder={M.phBusiness[locale]}
                            autoComplete="organization"
                            maxLength={MAX.business}
                            error={errors.business}
                            onBlur={recheck("business")}
                            onChange={fix("business")}
                          />
                          <IconField
                            name="phone"
                            label={M.fieldPhone[locale]}
                            icon={Phone}
                            placeholder="(512) 555-0134"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            maxLength={MAX.phone}
                            error={errors.phone}
                            onBlur={recheck("phone")}
                            onChange={fix("phone")}
                          />

                          <div>
                            <label className="flex items-start gap-3 text-[0.8125rem] leading-relaxed text-ash">
                              <input
                                type="checkbox"
                                name="consent"
                                value="yes"
                                onChange={recheck("consent")}
                                aria-invalid={errors.consent ? true : undefined}
                                aria-describedby={errors.consent ? "mockup-consent-err" : undefined}
                                className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-aqua"
                              />
                              <span>
                                {t.pricing.consentPrefix}{" "}
                                <a href="/privacy" target="_blank" rel="noopener" className="text-bone underline underline-offset-2">
                                  {t.pricing.consentPrivacy}
                                </a>{" "}
                                {t.pricing.consentAnd}{" "}
                                <a href="/terms" target="_blank" rel="noopener" className="text-bone underline underline-offset-2">
                                  {t.pricing.consentTerms}
                                </a>
                                {t.pricing.consentSuffix}
                              </span>
                            </label>
                            {errors.consent ? <FieldError id="mockup-consent-err">{errors.consent}</FieldError> : null}
                          </div>
                        </fieldset>

                        <button
                          type="submit"
                          disabled={sending}
                          className="group mt-1 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-aqua font-display text-lg font-semibold text-ink-900 shadow-[0_14px_30px_-12px_rgb(var(--aqua)/0.7)] transition-[background-color,transform] duration-150 hover:bg-aqua-deep active:scale-[0.98] disabled:opacity-80"
                        >
                          {sending ? M.sending[locale] : M.submit[locale]}
                          {sending ? (
                            <Loader2 aria-hidden="true" size={19} strokeWidth={2} className="animate-spin" />
                          ) : (
                            <ArrowRight
                              aria-hidden="true"
                              size={19}
                              strokeWidth={2.25}
                              className="transition-transform duration-150 ease-out group-hover:translate-x-1"
                            />
                          )}
                        </button>

                        {status === "error" ? (
                          <div role="alert" className="rounded-2xl border border-signal-deep bg-signal/[0.08] px-4 py-3 text-[0.9375rem] leading-relaxed text-bone">
                            <p className="font-medium">{E.errorTitle[locale]}</p>
                            <p className="mt-0.5 text-ash">
                              {E.errorKept[locale]}{" "}
                              <a href={`mailto:${siteConfig.contactEmail}`} className="text-bone underline underline-offset-2">
                                {siteConfig.contactEmail}
                              </a>
                            </p>
                          </div>
                        ) : null}

                        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.8125rem] font-medium text-ash">
                          {M.trust.map((item) => (
                            <li key={item.en} className="inline-flex items-center gap-1.5">
                              <Check aria-hidden="true" size={15} strokeWidth={2.5} className="text-aqua" />
                              {item[locale]}
                            </li>
                          ))}
                        </ul>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** Left panel: the headline with a marker sweep, the pitch, and the three easy steps. */
function Pitch({ locale, audience }: { locale: "en" | "es"; audience: string }) {
  const M = MOCKUP;
  return (
    <div className="relative isolate shrink-0 overflow-hidden bg-bone-50 px-6 pb-7 pt-8 text-ink-900 sm:px-10 sm:pb-10 sm:pt-10 md:flex md:flex-col">
      {/* Faint grid + a blue light pooling bottom-right. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgb(var(--aqua-glow)/0.5),transparent)]"
      />

      <p className="font-display text-lg font-semibold tracking-[0.28em]">SERMA</p>

      <h3 className="mt-6 font-display text-[2.125rem] font-semibold leading-[1.02] tracking-[-0.035em] text-balance sm:mt-10 sm:text-[2.75rem]">
        {M.headlineBefore[locale]}{" "}
        <span className="relative inline-block whitespace-nowrap px-1.5 text-bone-50">
          {/* Marker: sweeps in left to right behind the words, just after the sheet lands. */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[0.06em] top-[0.12em] -z-10 origin-left -rotate-1 rounded-md bg-aqua-glow"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: EASE_EDITORIAL, delay: 0.3 }}
          />
          {M.headlineMark[locale]}
        </span>{" "}
        {M.headlineAfter[locale]}
      </h3>

      <motion.p
        className="mt-4 max-w-sm text-pretty text-[0.9375rem] leading-relaxed text-ink-900/75 sm:mt-5 sm:text-base"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_EDITORIAL, delay: 0.4 }}
      >
        {M.pitch[locale]}
      </motion.p>

      <div className="mt-7 sm:mt-10 md:mt-auto md:pt-10">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-aqua-glow">{M.stepsLabel[locale]}</p>
        <ol className="mt-4 grid gap-4">
          {M.steps.map((step, i) => (
            <motion.li
              key={step.title.en}
              className="flex items-start gap-3.5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: EASE_EDITORIAL, delay: 0.5 + i * 0.09 }}
            >
              <motion.span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua-glow font-mono text-xs font-bold text-bone-50"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.55 + i * 0.09 }}
              >
                {i + 1}
              </motion.span>
              <span className="pt-0.5">
                <span className="block font-semibold leading-snug">{step.title[locale]}</span>
                <span className="block text-[0.875rem] leading-snug text-ink-900/65">{step.detail[locale]}</span>
              </span>
            </motion.li>
          ))}
        </ol>
        <p className="mt-8 hidden text-[0.8125rem] text-ink-900/55 md:block">{audience}</p>
      </div>
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={id} className="mt-1.5 block text-sm leading-snug text-bone">
      <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />
      {children}
    </span>
  );
}

/** A labelled input with a leading icon; on focus it lifts onto a hard blue offset shadow. */
function IconField({
  name,
  label,
  icon: Icon,
  error,
  ...input
}: {
  name: "name" | "business" | "phone";
  label: string;
  icon: LucideIcon;
  error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  const errId = `mockup-${name}-err`;
  return (
    <label className="group block">
      <span className="text-sm font-semibold text-bone">
        {label} <span aria-hidden="true" className="text-signal">*</span>
      </span>
      <span className="relative mt-2 block">
        <Icon
          aria-hidden="true"
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ash transition-colors duration-150 group-focus-within:text-aqua"
        />
        <input
          name={name}
          aria-required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className={`h-14 w-full rounded-2xl bg-ink-700/60 pl-12 pr-4 text-base text-bone ring-1 placeholder:text-ash/70 transition-[box-shadow,background-color] duration-150 ease-out focus:bg-ink-900 focus:shadow-[5px_5px_0_rgb(var(--aqua-glow))] focus:outline-none focus:ring-2 focus:ring-bone ${
            error ? "ring-signal" : "ring-hairline-dark"
          }`}
          {...input}
        />
      </span>
      {error ? <FieldError id={errId}>{error}</FieldError> : null}
    </label>
  );
}

/** Thank-you: a check that draws itself, then the message. */
function Done({ locale, firstName, onClose }: { locale: "en" | "es"; firstName: string; onClose: () => void }) {
  const M = MOCKUP;
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="flex min-h-[26rem] flex-col items-start justify-center outline-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
    >
      <motion.span
        className="grid h-16 w-16 place-items-center rounded-full bg-aqua text-ink-900"
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 16 }}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8" aria-hidden="true">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: EASE_EDITORIAL, delay: 0.15 }}
          />
        </svg>
      </motion.span>
      <h2 id="mockup-title" className="mt-6 font-display text-[2.25rem] font-semibold leading-tight tracking-[-0.03em]">
        {M.doneTitle[locale].replace("{name}", firstName ? `, ${firstName}` : "")}
      </h2>
      <p className="mt-3 max-w-md text-pretty text-base leading-relaxed text-ash">{M.doneBody[locale]}</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl px-5 font-semibold text-bone ring-1 ring-hairline-dark transition-colors duration-150 hover:bg-ink-700"
      >
        {M.doneBack[locale]}
      </button>
    </motion.div>
  );
}
