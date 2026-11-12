"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { siteConfig } from "@/config/site";

type Status = "idle" | "sending" | "done" | "error";

/** Field limits (also enforced in the browser with maxLength). */
const MAX = { name: 80, business: 120, phone: 25, need: 1000 } as const;
/** A real person takes longer than this to fill four boxes; faster submissions are bots. */
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

/** 7 to 15 digits, the international range; formatting characters are allowed. */
const phoneOk = (v: string) => /^[0-9+().\-\s]+$/.test(v) && (v.match(/\d/g)?.length ?? 0) >= 7 && (v.match(/\d/g)?.length ?? 0) <= 15;

/**
 * Contact form: four fields, nothing else.
 * Submissions go to the Netlify form list "enquiries" (public/__forms.html is the
 * static definition Netlify detects at deploy). Same-origin POST, so the strict
 * CSP's connect-src 'self' still holds and no third party sees the data.
 */
export function EnquiryForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("idle");
  const doneRef = useRef<HTMLParagraphElement>(null);
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

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

    // Re-check after cleaning (a field of only spaces or symbols is empty now).
    const phoneInput = form.elements.namedItem("phone") as HTMLInputElement | null;
    phoneInput?.setCustomValidity(phoneOk(fields.phone) ? "" : t.demo.phoneHint);
    if (!fields.name || !fields.business || !fields.need || !phoneOk(fields.phone) || data.get("consent") !== "yes") {
      form.reportValidity();
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
      setStatus("done");
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-6 rounded-glass-sm border border-hairline-dark bg-white/[0.04] p-5 sm:p-6">
        <p
          ref={doneRef}
          tabIndex={-1}
          aria-live="polite"
          className="flex items-start gap-3 text-bone outline-none"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua text-ink"
          >
            <Check size={15} strokeWidth={2.25} />
          </span>
          <span>
            <span className="block font-display text-xl leading-snug text-balance">{t.demo.thanksTitle}</span>
            <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ash">{t.demo.thanksBody}</span>
          </span>
        </p>
      </div>
    );
  }

  return (
    <form id="enquiry-form" onSubmit={onSubmit} name="enquiries" className="mt-6 scroll-mt-28 grid gap-4">
      <input type="hidden" name="form-name" value="enquiries" />
      <p className="hidden">
        <label>
          Leave this field empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow text-ash">{t.demo.fieldName}</span>
          <input name="name" required maxLength={MAX.name} autoComplete="name" className="field mt-2" />
        </label>
        <label className="block">
          <span className="eyebrow text-ash">{t.demo.fieldBusiness}</span>
          <input name="business" required maxLength={MAX.business} autoComplete="organization" className="field mt-2" />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow text-ash">{t.demo.fieldPhone}</span>
        <input
          name="phone"
          type="tel"
          required
          maxLength={MAX.phone}
          pattern="[0-9+\(\)\.\-\s]{7,25}"
          title={t.demo.phoneHint}
          aria-describedby="enquiry-phone-hint"
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          autoComplete="tel"
          inputMode="tel"
          className="field mt-2"
        />
        <span id="enquiry-phone-hint" className="mt-1.5 block text-xs text-ash">
          {t.demo.phoneHint}
        </span>
      </label>

      <label className="block">
        <span className="eyebrow text-ash">{t.demo.fieldNeed}</span>
        <textarea name="need" required maxLength={MAX.need} rows={3} className="field mt-2 resize-y" placeholder={t.demo.fieldNeedHint} />
      </label>

      {/* Required consent before anything is sent; links open the legal pages in a new tab so the form is kept. */}
      <label className="flex items-start gap-3 text-[0.9375rem] leading-relaxed text-ash">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          required
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#3DDBC9]"
        />
        <span>
          {t.demo.consentPrefix}{" "}
          <a href="/privacy" target="_blank" rel="noopener" className="link-quiet text-bone underline underline-offset-2">
            {t.demo.consentPrivacy}
          </a>{" "}
          {t.demo.consentAnd}{" "}
          <a href="/terms" target="_blank" rel="noopener" className="link-quiet text-bone underline underline-offset-2">
            {t.demo.consentTerms}
          </a>
          {t.demo.consentSuffix}
        </span>
      </label>

      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === "sending"} className="btn-aqua">
          {status === "sending" ? t.demo.sending : t.demo.submit}
          <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
        </button>
        <span aria-live="polite" className="text-sm leading-relaxed text-ash">
          {status === "error" ? (
            <span className="text-bone">
              {t.demo.errorBody}{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="link-quiet">
                {siteConfig.contactEmail}
              </a>
            </span>
          ) : (
            t.demo.formNote
          )}
        </span>
      </div>
    </form>
  );
}
