"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useNiche } from "@/context/NicheContext";
import { siteConfig } from "@/config/site";
import { ENQUIRY, phoneValid } from "@/data/enquiry";
import { NICHES } from "@/data/niches";
import { TIERS } from "@/data/pricing";
import { SPRING_SNAPPY } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Status = "idle" | "sending" | "done" | "error";
type Field = "name" | "business" | "phone" | "need" | "consent";
const ORDER: Field[] = ["name", "business", "phone", "need", "consent"];

/** Field limits (also enforced in the browser with maxLength). */
const MAX = { name: 80, business: 120, phone: 25, need: 1000 } as const;
/** A real person takes longer than this to fill the boxes; faster submissions are bots. */
const MIN_FILL_MS = 3000;

/**
 * Plain text only: strips control characters, angle brackets (no HTML or script can
 * ride along into the inbox or the Netlify dashboard), collapses runs of spaces and
 * caps the length. Line breaks are kept only where asked (the "what do you need" box).
 */
function clean(value: FormDataEntryValue | null, max: number, keepLines = false) {
  let v = String(value ?? "")
    .normalize("NFKC")
    .replace(keepLines ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ")
    .replace(/[<>]/g, "");
  v = keepLines ? v.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : v.replace(/\s+/g, " ");
  return v.trim().slice(0, max);
}

/** A plan picked on the Pricing tab arrives as a sentence naming it; find which tier that is. */
function tierFromPrefill(prefill?: string) {
  if (!prefill) return null;
  const hay = prefill.toLowerCase();
  return TIERS.find((t) => hay.includes(t.name.en.toLowerCase()) || hay.includes(t.name.es.toLowerCase())) ?? null;
}

/**
 * Contact form. Submissions go to the Netlify form list "enquiries" (public/__forms.html
 * is the static definition Netlify detects at deploy; field names must match it).
 * Same-origin POST, so the strict CSP's connect-src 'self' still holds and no third
 * party sees the data.
 */
export function EnquiryForm({ prefill }: { prefill?: string } = {}) {
  const { t, locale } = useLanguage();
  const { nicheId, userPicked } = useNiche();
  const reduce = useReducedMotionSafe();
  const E = ENQUIRY;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pkg, setPkg] = useState("");
  const [industry, setIndustry] = useState("");
  const industryTouched = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const needRef = useRef<HTMLTextAreaElement>(null);
  const lastPrefill = useRef("");
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  // A plan picked on the Pricing tab: preselect the package and write it into
  // "What do you need?", unless the visitor already typed something of their own there.
  useEffect(() => {
    if (!prefill) return;
    const tier = tierFromPrefill(prefill);
    if (tier) setPkg(tier.name.en);
    const box = needRef.current;
    if (box && (box.value.trim() === "" || box.value === lastPrefill.current)) {
      box.value = prefill;
      lastPrefill.current = prefill;
    }
  }, [prefill]);

  // An industry the visitor picked elsewhere on the site; their own choice here wins.
  useEffect(() => {
    if (userPicked.current && !industryTouched.current) {
      const n = NICHES.find((x) => x.id === nicheId);
      if (n) setIndustry(n.label.en);
    }
  }, [nicheId, userPicked]);

  /** Returns a kind message, or "" when the value is fine. Values are cleaned first. */
  function check(name: Field, raw: FormDataEntryValue | null): string {
    if (name === "consent") return raw === "yes" ? "" : E.errConsent[locale];
    const v = clean(raw, MAX[name], name === "need");
    if (!v) return { name: E.errName, business: E.errBusiness, phone: E.errPhone, need: E.errNeed }[name][locale];
    if (name === "phone" && !phoneValid(v)) return E.errPhone[locale];
    return "";
  }

  function setError(name: Field, msg: string) {
    setErrors((prev) => (prev[name] === msg || (!msg && !prev[name]) ? prev : { ...prev, [name]: msg || undefined }));
  }

  const valueOf = (el: HTMLInputElement | HTMLTextAreaElement) =>
    el instanceof HTMLInputElement && el.type === "checkbox" ? (el.checked ? "yes" : "") : el.value;

  // Validate when the visitor leaves a box, not on every keystroke. Once a box has been
  // flagged, it re-checks as they fix it so the message clears the moment it is right.
  const onBlur = (name: Field) => (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) =>
    setError(name, check(name, valueOf(e.currentTarget)));
  const onFix = (name: Field) => (e: { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
    if (errors[name]) setError(name, check(name, valueOf(e.currentTarget)));
  };

  const a11y = (name: Field, hint?: string) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": [errors[name] ? `enquiry-${name}-err` : "", hint ?? ""].filter(Boolean).join(" ") || undefined,
    "aria-required": true as const,
  });

  const err = (name: Field): ReactNode =>
    errors[name] ? (
      <span id={`enquiry-${name}-err`} className="mt-1.5 block text-sm leading-snug text-bone">
        <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />
        {errors[name]}
      </span>
    ) : null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const fields = {
      name: clean(data.get("name"), MAX.name),
      business: clean(data.get("business"), MAX.business),
      phone: clean(data.get("phone"), MAX.phone),
      need: clean(data.get("need"), MAX.need, true),
    };

    // Check every box; show all messages at once and move focus to the first one that needs attention.
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

    // Spam: a filled honeypot or an instant submission is a bot. Look successful, send nothing.
    if (String(data.get("bot-field") ?? "") !== "" || Date.now() - shownAt.current < MIN_FILL_MS) {
      form.reset();
      setStatus("done");
      return;
    }

    const body = new URLSearchParams();
    body.set("form-name", "enquiries");
    body.set("name", fields.name);
    body.set("business", fields.business);
    body.set("phone", fields.phone);
    body.set("package", clean(data.get("package"), 40));
    body.set("industry", clean(data.get("industry"), 60));
    body.set("need", fields.need);
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
      setPkg("");
      setIndustry("");
      setStatus("done");
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      // Everything typed stays in the boxes; the button is live again for a retry.
      setStatus("error");
    }
  }

  const done = status === "done";
  const sending = status === "sending";
  const swap = reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, scale: 0.92 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.92 },
        transition: SPRING_SNAPPY,
      };

  return (
    <form
      ref={formRef}
      id="enquiry-form"
      onSubmit={onSubmit}
      name="enquiries"
      noValidate
      aria-busy={sending}
      className="mt-6 scroll-mt-28 grid gap-4"
    >
      <input type="hidden" name="form-name" value="enquiries" />
      <p className="hidden">
        <label>
          Leave this field empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      {/* After a successful send the boxes step aside; the button's place becomes the thank-you. */}
      <fieldset disabled={sending} hidden={done} className={done ? "hidden" : "contents"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow text-ash">{t.pricing.fieldName}</span>
            <input name="name" maxLength={MAX.name} autoComplete="name" onBlur={onBlur("name")} onChange={onFix("name")} {...a11y("name")} className="field mt-2" />
            {err("name")}
          </label>
          <label className="block">
            <span className="eyebrow text-ash">{t.pricing.fieldBusiness}</span>
            <input name="business" maxLength={MAX.business} autoComplete="organization" onBlur={onBlur("business")} onChange={onFix("business")} {...a11y("business")} className="field mt-2" />
            {err("business")}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow text-ash">
              {E.fieldPackage[locale]} <span className="normal-case opacity-80">({E.optional[locale]})</span>
            </span>
            <select name="package" value={pkg} onChange={(e) => setPkg(e.target.value)} className="field mt-2">
              <option value="">{E.notSure[locale]}</option>
              {TIERS.map((tier) => (
                <option key={tier.id} value={tier.name.en}>
                  {tier.name[locale]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow text-ash">
              {E.fieldIndustry[locale]} <span className="normal-case opacity-80">({E.optional[locale]})</span>
            </span>
            <select
              name="industry"
              value={industry}
              onChange={(e) => {
                industryTouched.current = true;
                setIndustry(e.target.value);
              }}
              className="field mt-2"
            >
              <option value="">{E.notSure[locale]}</option>
              {NICHES.map((n) => (
                <option key={n.id} value={n.label.en}>
                  {n.label[locale]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="eyebrow text-ash">{t.pricing.fieldPhone}</span>
          <input
            name="phone"
            type="tel"
            maxLength={MAX.phone}
            autoComplete="tel"
            inputMode="tel"
            placeholder="(512) 555-0134"
            onBlur={onBlur("phone")}
            onChange={onFix("phone")}
            {...a11y("phone", "enquiry-phone-hint")}
            className="field mt-2"
          />
          {err("phone")}
          <span id="enquiry-phone-hint" className="mt-1.5 block text-xs text-ash">
            {t.pricing.phoneHint}
          </span>
        </label>

        <label className="block">
          <span className="eyebrow text-ash">{t.pricing.fieldNeed}</span>
          <textarea
            ref={needRef}
            name="need"
            maxLength={MAX.need}
            rows={3}
            onBlur={onBlur("need")}
            onChange={onFix("need")}
            {...a11y("need")}
            className="field mt-2 resize-y"
            placeholder={t.pricing.fieldNeedHint}
          />
          {err("need")}
        </label>

        {/* Required consent before anything is sent; links open the legal pages in a new tab so the form is kept. */}
        <div>
          <label className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ash">
            <input
              type="checkbox"
              name="consent"
              value="yes"
              onBlur={onBlur("consent")}
              onChange={onFix("consent")}
              {...a11y("consent")}
              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-aqua"
            />
            <span>
              {t.pricing.consentPrefix}{" "}
              <a href="/privacy" target="_blank" rel="noopener" className="link-quiet text-bone underline underline-offset-2">
                {t.pricing.consentPrivacy}
              </a>{" "}
              {t.pricing.consentAnd}{" "}
              <a href="/terms" target="_blank" rel="noopener" className="link-quiet text-bone underline underline-offset-2">
                {t.pricing.consentTerms}
              </a>
              {t.pricing.consentSuffix}
            </span>
          </label>
          {err("consent")}
        </div>
      </fieldset>

      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* One live region: the button swaps for the thank-you in place and screen readers hear it. */}
        <div ref={doneRef} tabIndex={-1} role="status" aria-live="polite" className="outline-none">
          <AnimatePresence mode="popLayout" initial={false}>
            {done ? (
              <motion.div
                key="done"
                {...swap}
                className="flex items-center gap-3 rounded-glass-sm border border-aqua/40 bg-aqua/[0.08] py-3 pl-3 pr-5 text-bone"
              >
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aqua text-ink">
                  <motion.span
                    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={SPRING_SNAPPY}
                    className="grid place-items-center"
                  >
                    <Check size={17} strokeWidth={2.25} />
                  </motion.span>
                </span>
                <span>
                  <span className="block font-display text-lg leading-snug">{E.doneTitle[locale]}</span>
                  <span className="block text-[0.9375rem] leading-snug text-ash">{E.doneBody[locale]}</span>
                </span>
              </motion.div>
            ) : (
              <motion.div key="send" {...swap}>
                <button type="submit" disabled={sending} className="btn-aqua">
                  {sending ? t.pricing.sending : t.pricing.submit}
                  {sending ? (
                    <Loader2 aria-hidden="true" size={16} strokeWidth={1.75} className="animate-spin" />
                  ) : (
                    <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!done && status !== "error" ? (
          <span className="text-sm leading-relaxed text-ash">
            {Object.values(errors).some(Boolean) ? E.fixBelow[locale] : t.pricing.formNote}
          </span>
        ) : null}
      </div>

      {status === "error" ? (
        <div role="alert" className="rounded-glass-sm border border-signal-deep bg-signal/[0.08] px-4 py-3 text-[0.9375rem] leading-relaxed text-bone">
          <p className="font-medium">{E.errorTitle[locale]}</p>
          <p className="mt-0.5 text-ash">
            {E.errorKept[locale]}{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="link-quiet text-bone">
              {siteConfig.contactEmail}
            </a>
          </p>
        </div>
      ) : null}
    </form>
  );
}
