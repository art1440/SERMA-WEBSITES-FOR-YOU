"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Fragment, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { useLanguage } from "@/context/LanguageContext";
import { NICHES } from "@/data/niches";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL } from "@/lib/motion";
import { validateDemoRequest, type FieldErrorCode, type FieldErrors } from "@/lib/validation";

type Values = {
  name: string;
  business: string;
  industry: string;
  email: string;
  phone: string;
  language: "en" | "es";
  message: string;
  smsConsent: boolean;
  policyConsent: boolean;
  website: string; // honeypot
};

type FieldKey = keyof FieldErrors;

const FIELD_ORDER: FieldKey[] = ["name", "business", "industry", "email", "phone", "smsConsent", "message", "policyConsent"];
const fieldId = (key: FieldKey) => `demo-${key}`;

/** Splits "{privacy}"-style tokens into React nodes. */
function withLinks(template: string, nodes: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/g).map((part, i) => {
    const token = /^\{(\w+)\}$/.exec(part)?.[1];
    return <Fragment key={i}>{token && token in nodes ? nodes[token] : part}</Fragment>;
  });
}

export function DemoRequestForm() {
  const { t, locale } = useLanguage();
  const [values, setValues] = useState<Values>({
    name: "",
    business: "",
    industry: "",
    email: "",
    phone: "",
    language: locale,
    message: "",
    smsConsent: false, // TCPA: never pre-checked
    policyConsent: false,
    website: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState("");
  /** Fields listed in the error summary — frozen at submit so the summary never reflows while typing. */
  const [summary, setSummary] = useState<FieldKey[]>([]);
  const [firstName, setFirstName] = useState("");
  const [languageTouched, setLanguageTouched] = useState(false);
  const startedAt = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  // Follow the site language for the "preferred demo language" until the visitor picks one.
  useEffect(() => {
    if (!languageTouched) setValues((v) => ({ ...v, language: locale }));
  }, [locale, languageTouched]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const phoneEntered = values.phone.trim().length > 0;

  /** Re-checks only `keys`. On blur we skip "required" so tabbing through empty fields never nags. */
  const revalidate = (next: Values, keys: FieldKey[], skipRequired = false) => {
    const result = validateDemoRequest(next);
    const all: FieldErrors = result.ok ? {} : result.errors;
    setErrors((prev) => {
      const merged = { ...prev };
      keys.forEach((k) => {
        const code = all[k];
        if (code && !(skipRequired && code === "required" && !prev[k])) merged[k] = code;
        else delete merged[k];
      });
      return merged;
    });
  };

  const update =
    (key: keyof Values) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = e.target;
      const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
      const next = { ...values, [key]: value } as Values;
      setValues(next);
      if (key === "language") setLanguageTouched(true);
      // Re-check fields that already show an error so messages clear as soon as they're fixed.
      const recheck = (Object.keys(errors) as FieldKey[]).filter((k) => touched[k] || errors[k]);
      if (key === "phone" || key === "smsConsent") recheck.push("smsConsent");
      if (recheck.length) revalidate(next, recheck);
    };

  const blur = (key: FieldKey) => () => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    revalidate(values, [key], true);
  };

  const errorText = (code?: FieldErrorCode) => (code ? t.demo.errors[code] : "");
  /** Label shown (struck through) once a summary item has been fixed. */
  const summaryLabel = (k: FieldKey): string => {
    if (k === "smsConsent") return t.demo.fields.phone;
    if (k === "policyConsent") return `${t.demo.privacyLink} / ${t.demo.termsLink}`;
    if (k === "language" || k === "industry" || k === "name" || k === "business" || k === "email" || k === "phone" || k === "message")
      return k === "language" ? t.demo.fields.language : t.demo.fields[k];
    return k;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setFormError("");
    setSummary([]);

    const result = validateDemoRequest(values);
    if (!result.ok) {
      setErrors(result.errors);
      setSummary(FIELD_ORDER.filter((k) => result.errors[k]));
      setTouched(Object.fromEntries(FIELD_ORDER.map((k) => [k, true])));
      setFormError(t.demo.errorSummary);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({ ...values, elapsedMs: Math.round(performance.now() - startedAt.current) }),
      });
      if (res.ok) {
        setFirstName(result.data.name.split(" ")[0] ?? "");
        setStatus("success");
        return;
      }
      setStatus("idle");
      if (res.status === 422) {
        const body = (await res.json().catch(() => ({}))) as { fields?: FieldErrors };
        const fields = body.fields ?? {};
        setErrors(fields);
        setSummary(FIELD_ORDER.filter((k) => fields[k]));
        setFormError(t.demo.errorSummary);
      } else if (res.status === 429) {
        setFormError(t.demo.errors.rateLimited);
      } else {
        setFormError(t.demo.errors.server);
      }
    } catch {
      setStatus("idle");
      setFormError(t.demo.errors.server);
    }
    requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const reset = () => {
    setValues((v) => ({ ...v, name: "", business: "", industry: "", email: "", phone: "", message: "", smsConsent: false, policyConsent: false }));
    setErrors({});
    setTouched({});
    setStatus("idle");
    startedAt.current = performance.now();
  };

  const describedBy = (key: FieldKey, hintId?: string) =>
    [hintId, errors[key] ? `${fieldId(key)}-error` : null].filter(Boolean).join(" ") || undefined;

  const legalLink = (href: string, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-1 underline-offset-2 hover:text-signal-deep">
      {label}
      <span className="sr-only"> {t.common.newTab}</span>
    </a>
  );
  const links = {
    privacy: legalLink(`/privacy?lang=${locale}`, t.demo.privacyLink),
    terms: legalLink(`/terms?lang=${locale}`, t.demo.termsLink),
  };


  return (
    <section id="demo" aria-labelledby="demo-title" className="border-t border-ink py-24 lg:py-32">
      <div className="frame grid grid-cols-12 gap-x-4 gap-y-12 lg:gap-x-10">
        {/* Pitch column */}
        <div className="col-span-12 lg:col-span-5">
          <Reveal y={12}>
            <p className="eyebrow flex items-baseline gap-3 text-muted">
              <span className="text-signal-deep">{t.demo.index}</span>
              <span aria-hidden="true" className="inline-block h-px w-6 translate-y-[-3px] bg-muted" />
              <span>{t.demo.eyebrow}</span>
            </p>
          </Reveal>
          <RevealLines id="demo-title" lines={[t.demo.title]} className="mt-6 font-display text-display-md text-balance" />
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted">{t.demo.body}</p>
            <h3 className="eyebrow mt-10 text-muted">{t.demo.expectLabel}</h3>
            <ul className="mt-3 border-t border-hairline-light">
              {t.demo.expect.map((item, i) => (
                <li key={item} className="flex items-baseline gap-4 border-b border-hairline-light py-3">
                  <span className="font-mono text-micro text-signal-deep">0{i + 1}</span>
                  <span className="text-ink">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex max-w-md gap-2.5 text-sm leading-relaxed text-muted">
              <ShieldCheck aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink" />
              {t.demo.privacyNote}
            </p>
          </Reveal>
        </div>

        {/* Form column */}
        <Reveal className="col-span-12 lg:col-span-7" delay={0.1}>
          <div className="border border-ink bg-bone-50 p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <motion.div
                  key="success"
                  role="status"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
                  className="py-10 text-center"
                >
                  <motion.span
                    className="mx-auto grid h-16 w-16 place-items-center bg-ink text-bone"
                    initial={{ scale: 0.6, rotate: -8 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  >
                    <CheckCircle2 aria-hidden="true" size={28} strokeWidth={1.5} />
                  </motion.span>
                  <h3 ref={successRef} tabIndex={-1} className="mt-6 font-display text-5xl focus:outline-none">
                    {t.demo.successTitle}
                  </h3>
                  <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted">
                    {fill(t.demo.successBody, { name: firstName })}
                  </p>
                  <button type="button" onClick={reset} className="btn-line mt-8">
                    {t.demo.successReset}
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={onSubmit}
                  aria-label={t.demo.formLabel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
                  className="relative"
                >
                  <p className="text-sm text-muted">{t.demo.requiredNote}</p>

                  {/* Error summary (focused on failed submit) */}
                  <div ref={summaryRef} tabIndex={-1} role="alert" className="focus:outline-none">
                    {formError ? (
                      <div className="mt-4 border border-l-4 border-signal-deep bg-bone p-4">
                        <p className="font-medium text-ink">{formError}</p>
                        {summary.length ? (
                          <ul className="mt-2 space-y-1 text-sm">
                            {summary.map((k) => {
                              const fixed = !errors[k];
                              return (
                                <li key={k} className="flex items-start gap-2">
                                  <span aria-hidden="true" className="w-3 font-mono">
                                    {fixed ? "✓" : "•"}
                                  </span>
                                  {fixed ? (
                                    <span className="text-muted line-through">{summaryLabel(k)}</span>
                                  ) : (
                                    <a href={`#${fieldId(k)}`} className="text-ink underline decoration-signal-deep decoration-2 underline-offset-2">
                                      <span className="font-medium">{summaryLabel(k)}:</span> {errorText(errors[k])}
                                    </a>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-2 sm:grid-cols-2">
                    <TextField
                      id={fieldId("name")}
                      label={t.demo.fields.name}
                      required
                      autoComplete="name"
                      value={values.name}
                      onChange={update("name")}
                      onBlur={blur("name")}
                      error={errorText(errors.name)}
                      describedBy={describedBy("name")}
                      maxLength={80}
                    />
                    <TextField
                      id={fieldId("business")}
                      label={t.demo.fields.business}
                      required
                      autoComplete="organization"
                      value={values.business}
                      onChange={update("business")}
                      onBlur={blur("business")}
                      error={errorText(errors.business)}
                      describedBy={describedBy("business")}
                      maxLength={120}
                    />

                    <div>
                      <Label htmlFor={fieldId("industry")} required>
                        {t.demo.fields.industry}
                      </Label>
                      <select
                        id={fieldId("industry")}
                        className="field mt-1.5 h-[50px]"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(errors.industry)}
                        aria-describedby={describedBy("industry")}
                        value={values.industry}
                        onChange={update("industry")}
                        onBlur={blur("industry")}
                      >
                        <option value="" disabled>
                          {t.demo.fields.industryPlaceholder}
                        </option>
                        {NICHES.map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.label[locale]}
                          </option>
                        ))}
                        <option value="other">{t.demo.fields.industryOther}</option>
                      </select>
                      <FieldError reserve id={`${fieldId("industry")}-error`} message={errorText(errors.industry)} />
                    </div>

                    <TextField
                      id={fieldId("email")}
                      label={t.demo.fields.email}
                      required
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={update("email")}
                      onBlur={blur("email")}
                      error={errorText(errors.email)}
                      describedBy={describedBy("email")}
                      maxLength={254}
                    />

                    {/* Phone + TCPA consent (unchecked by default; required whenever a number is entered) */}
                    <div className="sm:col-span-2">
                      <TextField
                        id={fieldId("phone")}
                        label={t.demo.fields.phone}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        value={values.phone}
                        onChange={update("phone")}
                        onBlur={blur("phone")}
                        error={errorText(errors.phone)}
                        hint={t.demo.fields.phoneHint}
                        describedBy={describedBy("phone", `${fieldId("phone")}-hint`)}
                        maxLength={20}
                      />
                      <div
                        className={`mt-3 border p-4 ${errors.smsConsent ? "border-signal-deep" : "border-hairline-light"} ${phoneEntered ? "bg-bone-200/60" : ""}`}
                      >
                        <div className="flex gap-3">
                          <input
                            id={fieldId("smsConsent")}
                            type="checkbox"
                            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-ink"
                            checked={values.smsConsent}
                            onChange={update("smsConsent")}
                            required={phoneEntered}
                            aria-required={phoneEntered}
                            aria-invalid={Boolean(errors.smsConsent)}
                            aria-describedby={[`${fieldId("smsConsent")}-detail`, errors.smsConsent ? `${fieldId("smsConsent")}-error` : ""]
                              .filter(Boolean)
                              .join(" ")}
                          />
                          <div>
                            <label htmlFor={fieldId("smsConsent")} className="cursor-pointer text-sm leading-relaxed text-ink">
                              {t.demo.smsConsent}
                              {phoneEntered ? (
                                <span aria-hidden="true" className="ml-1 text-signal-deep">
                                  *
                                </span>
                              ) : null}
                            </label>
                            <p id={`${fieldId("smsConsent")}-detail`} className="mt-1.5 text-xs leading-relaxed text-muted">
                              {withLinks(t.demo.smsConsentDetail, links)}
                            </p>
                          </div>
                        </div>
                        <FieldError id={`${fieldId("smsConsent")}-error`} message={errorText(errors.smsConsent)} />
                      </div>
                    </div>

                    <fieldset className="sm:col-span-2">
                      <legend className="text-sm text-ink">{t.demo.fields.language}</legend>
                      <div className="mt-2 flex gap-2">
                        {(
                          [
                            ["en", "English"],
                            ["es", "Español"],
                          ] as const
                        ).map(([value, label]) => (
                          <label
                            key={value}
                            lang={value}
                            className={`flex min-h-[44px] cursor-pointer items-center gap-2 border px-4 ${values.language === value ? "border-ink" : "border-hairline-light"}`}
                          >
                            <input
                              type="radio"
                              name="language"
                              value={value}
                              checked={values.language === value}
                              onChange={update("language")}
                              className="h-4 w-4 accent-ink"
                            />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="sm:col-span-2">
                      <Label htmlFor={fieldId("message")}>{t.demo.fields.message}</Label>
                      <textarea
                        id={fieldId("message")}
                        className="field mt-1.5 min-h-[110px] resize-y"
                        value={values.message}
                        onChange={update("message")}
                        onBlur={blur("message")}
                        maxLength={1000}
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={describedBy("message")}
                      />
                      <FieldError reserve id={`${fieldId("message")}-error`} message={errorText(errors.message)} />
                    </div>

                    {/* Honeypot — hidden from people and assistive tech; bots fill it. */}
                    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
                      <label htmlFor="demo-website">Website</label>
                      <input id="demo-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={update("website")} />
                    </div>

                    {/* Privacy Policy + Terms consent (required) */}
                    <div className="sm:col-span-2">
                      <div className="flex gap-3">
                        <input
                          id={fieldId("policyConsent")}
                          type="checkbox"
                          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-ink"
                          checked={values.policyConsent}
                          onChange={update("policyConsent")}
                          required
                          aria-required="true"
                          aria-invalid={Boolean(errors.policyConsent)}
                          aria-describedby={errors.policyConsent ? `${fieldId("policyConsent")}-error` : undefined}
                        />
                        <label htmlFor={fieldId("policyConsent")} className="cursor-pointer text-sm leading-relaxed text-ink">
                          {withLinks(t.demo.policyConsent, links)}
                          <span aria-hidden="true" className="ml-1 text-signal-deep">
                            *
                          </span>
                        </label>
                      </div>
                      <FieldError id={`${fieldId("policyConsent")}-error`} message={errorText(errors.policyConsent)} />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-4 border-t border-hairline-light pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <MagneticButton
                      type="submit"
                      aria-disabled={status === "submitting"}
                      className="btn-ink px-7 py-4 text-[0.8rem] aria-disabled:cursor-progress"
                    >
                      {status === "submitting" ? t.demo.submitting : t.demo.submit}
                      <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.5} />
                    </MagneticButton>
                    <p className="flex items-center gap-2 font-mono text-micro uppercase text-muted">
                      <ShieldCheck aria-hidden="true" size={14} strokeWidth={1.5} />
                      {t.footer.privacyBadge}
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Label({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm text-ink">
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-signal-deep">
          *
        </span>
      ) : null}
    </label>
  );
}

/**
 * Inline error. `reserve` keeps a fixed slot under the field so an error that
 * appears on blur never shifts the controls below it (a shift between
 * mousedown and mouseup would swallow the visitor's next click).
 */
function FieldError({ id, message, reserve = false }: { id: string; message: string; reserve?: boolean }) {
  const node = (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.p
          id={id}
          className="mt-1.5 flex items-start gap-1.5 text-sm text-signal-deep"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span aria-hidden="true" className="font-mono">
            !
          </span>
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
  return reserve ? <div className="min-h-[1.75rem]">{node}</div> : node;
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error: string;
  describedBy?: string;
  hint?: string;
  required?: boolean;
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
};

function TextField({ id, label, value, onChange, onBlur, error, describedBy, hint, required, type = "text", inputMode, autoComplete, maxLength }: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="field mt-1.5"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        maxLength={maxLength}
        spellCheck={type === "text" ? undefined : false}
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
      <FieldError reserve id={`${id}-error`} message={error} />
    </div>
  );
}
