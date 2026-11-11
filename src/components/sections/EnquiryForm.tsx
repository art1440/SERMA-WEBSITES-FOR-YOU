"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { siteConfig } from "@/config/site";

type Status = "idle" | "sending" | "done" | "error";

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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = new URLSearchParams();
    body.set("form-name", "enquiries");
    body.set("name", String(data.get("name") ?? "").trim());
    body.set("business", String(data.get("business") ?? "").trim());
    body.set("phone", String(data.get("phone") ?? "").trim());
    body.set("need", String(data.get("need") ?? "").trim());
    body.set("bot-field", String(data.get("bot-field") ?? ""));
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
          <input name="name" required autoComplete="name" className="field mt-2" />
        </label>
        <label className="block">
          <span className="eyebrow text-ash">{t.demo.fieldBusiness}</span>
          <input name="business" required autoComplete="organization" className="field mt-2" />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow text-ash">{t.demo.fieldPhone}</span>
        <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" className="field mt-2" />
      </label>

      <label className="block">
        <span className="eyebrow text-ash">{t.demo.fieldNeed}</span>
        <textarea name="need" required rows={3} className="field mt-2 resize-y" placeholder={t.demo.fieldNeedHint} />
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
