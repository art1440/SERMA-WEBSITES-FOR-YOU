"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone, ShieldCheck } from "lucide-react";
import { AmbientField } from "@/components/ui/AmbientField";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { useScene } from "@/context/SceneContext";
import { fill } from "@/i18n/types";
import { EASE_EDITORIAL, VIEWPORT_ONCE } from "@/lib/motion";

/** Small numbered pebble: bone numeral on a warm, light-catching ring (≥4.5:1 on dark glass). Read aloud as before. */
function NumberBadge({ n, size = "md" }: { n: number; size?: "sm" | "md" }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-signal/15 font-medium tabular text-bone ring-1 ring-inset ring-signal/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ${
        size === "sm" ? "h-7 w-7 text-[0.6875rem]" : "h-8 w-8 text-[0.75rem]"
      }`}
    >
      0{n}
    </span>
  );
}

/**
 * "Book a Live System Demo" — direct contact only.
 * There is no form and no endpoint: the site collects nothing. Visitors open
 * their own email app (pre-filled subject/body) or phone dialer and decide
 * what to send.
 *
 * Finale: the section stays transparent so the 3D engine returns on the right.
 * The contact card is one medium dark Liquid Glass panel (real blur on desktop,
 * where it floats over the engine; dense tint without blur on phones, where it
 * sits on the ink fade). Everything inside it is flat glass (no nested blur).
 */
export function DemoContact() {
  const { t } = useLanguage();
  const { finale } = useScene();
  const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(t.demo.emailSubject)}&body=${encodeURIComponent(t.demo.emailBody)}`;
  const phone = siteConfig.contactPhone;
  const index = t.demo.index.replace(/[()]/g, "").trim();

  return (
    <section
      id="demo"
      ref={finale.ref}
      aria-labelledby="demo-title"
      data-theme="dark"
      className="relative z-10 pb-24 pt-[44vh] text-bone motion-reduce:isolate motion-reduce:overflow-hidden motion-reduce:pt-24 lg:py-40"
    >
      {/* Reduced motion: no 3D stage behind, so the glass sits in a dark light field instead of flat ink. */}
      <AmbientField tone="dark" variant={0} className="hidden motion-reduce:block" />
      {/* Finale: the section is transparent so the 3D engine returns on the right. */}
      {/* Phones: ink fade that travels with the copy, so text never sits on the bare sculpture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[30vh] h-[13vh] bg-gradient-to-b from-transparent to-ink motion-reduce:hidden lg:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-[43vh] bg-ink motion-reduce:hidden lg:hidden" />

      <div className="frame relative grid grid-cols-12 gap-x-4 gap-y-12 lg:gap-x-10 lg:gap-y-14">
        {/* Pitch column */}
        <div className="col-span-12 lg:col-span-6">
          <Reveal y={12}>
            <p className="chip-dark text-bone">
              {/* bone/70 (not ash): stays ≥4.5:1 even where the chip crosses the engine's warm glow. */}
              <span className="tabular text-bone/70">{index}</span>
              <span aria-hidden="true" className="h-[5px] w-[5px] shrink-0 rounded-full bg-signal shadow-[0_0_8px_1px_rgba(229,88,42,0.6)]" />
              <span>{t.demo.eyebrow}</span>
            </p>
          </Reveal>
          <RevealLines id="demo-title" lines={[t.demo.title]} className="mt-5 font-display text-display-md text-balance lg:mt-6" />
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-ash">{t.demo.body}</p>
            <h3 className="eyebrow mt-10 text-ash">{t.demo.expectLabel}</h3>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-1 lg:gap-2.5 xl:grid-cols-2 xl:gap-3">
              {t.demo.expect.map((item, i) => (
                <li
                  key={item}
                  className="glass-dark glass-flat flex min-h-[60px] items-center gap-3.5 rounded-glass-sm px-4 py-3"
                >
                  <NumberBadge n={i + 1} />
                  <span className="text-pretty text-[0.9375rem] leading-snug text-bone">{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Contact panel */}
        <Reveal className="col-span-12 lg:col-span-6 lg:col-start-1" delay={0.1}>
          <div className="relative">
            {/* Static warm light behind the glass: gives the frosted panel something to catch. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 -top-14 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(229,88,42,0.3),rgba(122,46,18,0.18)_55%,transparent)] sm:-right-16 sm:-top-20 sm:h-96 sm:w-96"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(240,163,92,0.12),transparent)]"
            />

            <div className="glass-dark glass-solid relative rounded-glass-lg p-5 text-bone [--glass-blur:28px] max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] sm:p-8 xl:p-10">
              <p className="eyebrow text-ash">{t.demo.contactLabel}</p>

              <a
                href={mailto}
                className="group mt-5 block break-all font-display text-[clamp(1.6rem,6.4vw,3rem)] leading-[1.02] tracking-[-0.035em] text-bone lg:text-[clamp(1.75rem,3.4vw,3.25rem)]"
              >
                {siteConfig.contactEmail}
                <ArrowUpRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="ml-2 inline-block h-[0.55em] w-[0.55em] align-baseline text-signal transition-transform duration-500 ease-editorial group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </a>
              <motion.span
                aria-hidden="true"
                className="mt-5 block h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-signal via-signal/50 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={VIEWPORT_ONCE}
                transition={{ duration: 1.2, ease: EASE_EDITORIAL, delay: 0.2 }}
              />

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <MagneticButton
                  href={mailto}
                  data-primary-action
                  className="btn-bone min-h-[52px] whitespace-normal px-6 text-center"
                >
                  <Mail aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                  {t.demo.emailCta}
                </MagneticButton>
                {phone ? (
                  <a
                    href={`tel:${phone.e164}`}
                    className="btn-line-dark glass-flat min-h-[52px] whitespace-normal px-6 text-center"
                  >
                    <Phone aria-hidden="true" size={17} strokeWidth={1.75} className="shrink-0" />
                    {fill(t.demo.phoneCta, { phone: phone.display })}
                  </a>
                ) : null}
              </div>

              <h3 className="eyebrow mt-10 text-ash">{t.demo.includeLabel}</h3>
              <ol className="mt-4 grid gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-1 lg:gap-2.5 xl:grid-cols-3 xl:gap-3">
                {t.demo.include.map((item, i) => (
                  <li
                    key={item}
                    className="glass-dark glass-flat flex items-center gap-3 rounded-glass-sm p-3.5 sm:flex-col sm:items-start sm:p-4 lg:flex-row lg:items-center lg:p-3.5 xl:flex-col xl:items-start xl:p-4"
                  >
                    <NumberBadge n={i + 1} size="sm" />
                    <span className="text-pretty text-sm leading-snug text-bone">{item}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-8 flex items-start gap-3 border-t border-white/10 pt-6 text-sm leading-relaxed text-ash">
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.06] text-signal ring-1 ring-inset ring-white/10"
                >
                  <ShieldCheck size={16} strokeWidth={1.75} />
                </span>
                <span className="pt-1">{t.demo.noFormNote}</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
