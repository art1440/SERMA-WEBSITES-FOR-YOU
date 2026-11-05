"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, ShieldCheck } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";

/**
 * "Book a Live System Demo" — direct contact only.
 * There is no form and no endpoint: the site collects nothing. Visitors open
 * their own email app (pre-filled subject/body) or phone dialer and decide
 * what to send.
 */
export function DemoContact() {
  const { t } = useLanguage();
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(t.demo.emailSubject)}&body=${encodeURIComponent(t.demo.emailBody)}`;
  const phone = siteConfig.contactPhone;

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
          </Reveal>
        </div>

        {/* Contact panel */}
        <Reveal className="col-span-12 lg:col-span-7" delay={0.1}>
          <div data-theme="dark" className="sd-rise-flat relative overflow-hidden bg-ink p-6 text-bone sm:p-10">
            <p className="eyebrow text-ash">{t.demo.contactLabel}</p>

            <a
              href={mailto}
              className="group mt-6 block break-all font-display text-[clamp(2rem,5vw,4.25rem)] leading-[0.95] text-bone"
            >
              {siteConfig.contactEmail}
              <ArrowUpRight
                aria-hidden="true"
                strokeWidth={1}
                className="ml-2 inline-block h-[0.6em] w-[0.6em] align-baseline transition-transform duration-500 ease-editorial group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>
            <motion.span
              aria-hidden="true"
              className="mt-4 block h-px w-full origin-left bg-signal"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 1.2, ease: EASE_EDITORIAL, delay: 0.2 }}
            />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <MagneticButton href={mailto} data-primary-action className="btn-bone px-6 py-4 text-[0.8rem]">
                <Mail aria-hidden="true" size={15} strokeWidth={1.5} />
                {t.demo.emailCta}
              </MagneticButton>
              {phone ? (
                <a href={`tel:${phone.e164}`} className="btn-line-dark px-6 py-4 text-[0.8rem]">
                  <Phone aria-hidden="true" size={15} strokeWidth={1.5} />
                  {fill(t.demo.phoneCta, { phone: phone.display })}
                </a>
              ) : null}
            </div>

            <h3 className="eyebrow mt-10 text-ash">{t.demo.includeLabel}</h3>
            <ol className="mt-3 grid gap-px border border-hairline-dark bg-hairline-dark sm:grid-cols-3">
              {t.demo.include.map((item, i) => (
                <li key={item} className="bg-ink p-4">
                  <span className="block font-mono text-xs text-signal">0{i + 1}</span>
                  <span className="mt-1 block text-sm leading-snug">{item}</span>
                </li>
              ))}
            </ol>

            <p className="mt-8 flex gap-2.5 text-sm leading-relaxed text-ash">
              <ShieldCheck aria-hidden="true" size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-signal" />
              {t.demo.noFormNote}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
