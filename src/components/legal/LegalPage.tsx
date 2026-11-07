"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { AmbientField } from "@/components/ui/AmbientField";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { legalDocs, type LegalSlug } from "@/i18n/legal";
import { fill } from "@/i18n/types";

/**
 * Long-form legal reading. Calm, not heavy glass: a warm light field stays put
 * behind the page, the article lives on one large flat (no-blur) reading panel
 * with a dense tint, and only the small sticky contents card uses real blur.
 */
export function LegalPage({ slug }: { slug: LegalSlug }) {
  const { t, locale, intlLocale } = useLanguage();
  const doc = legalDocs[slug][locale];
  const tokens = { entity: siteConfig.legalEntity, email: siteConfig.contactEmail, law: siteConfig.governingLaw[locale] };
  const updated = new Intl.DateTimeFormat(intlLocale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${siteConfig.legalLastUpdated}T00:00:00Z`),
  );

  return (
    <>
      <DocumentTitle title={`${doc.title} — SermaWebDesign`} />
      <span id="top" aria-hidden="true" />
      <Navbar />
      <main id="main" tabIndex={-1} className="relative isolate focus:outline-none">
        {/* Viewport-fixed light field (behind the navbar too, no seams on short pages).
            No overflow-hidden on <main>: it would break the sticky contents card. */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
          <AmbientField tone="light" variant={0} />
        </div>

        <article className="frame pb-20 pt-8 sm:pt-12 lg:pb-28 lg:pt-14">
          <Link href="/" className="group btn-line glass-flat px-5 text-sm">
            <ArrowLeft
              aria-hidden="true"
              size={16}
              strokeWidth={1.75}
              className="transition-transform duration-500 ease-editorial group-hover:-translate-x-0.5"
            />
            {t.legal.backHome}
          </Link>

          <header className="mt-10 max-w-4xl lg:mt-14">
            <p className="chip glass-flat text-muted">
              <CalendarDays aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0 text-signal-deep" />
              {fill(t.legal.lastUpdated, { date: updated })}
            </p>
            <RevealLines as="h1" trigger="mount" lines={[doc.title]} className="mt-5 font-display text-display-lg text-balance lg:mt-6" />
            <Reveal trigger="mount" delay={0.15}>
              <p className="mt-6 max-w-[62ch] text-pretty text-lg leading-relaxed text-muted">{fill(doc.intro, tokens)}</p>
              {t.legal.translationNote ? (
                <p className="mt-5 max-w-[62ch] rounded-glass-sm bg-white/60 px-4 py-3 text-sm leading-relaxed text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-inset ring-ink/[0.06]">
                  {t.legal.translationNote}
                </p>
              ) : null}
            </Reveal>
          </header>

          <div className="mt-12 grid items-start gap-4 lg:mt-16 lg:grid-cols-[minmax(0,15rem)_minmax(0,54rem)] lg:gap-8 xl:grid-cols-[minmax(0,17rem)_minmax(0,56rem)] xl:gap-10">
            <nav aria-labelledby="toc-title" className="lg:sticky lg:top-24">
              {/* Real blur only where it is a small sticky card (lg+); stacked above the article on
                  smaller screens it is tall, so it keeps the look without the blur cost. */}
              <div className="glass rounded-glass p-2.5 [--glass-blur:18px] max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] sm:p-3">
                <h2 id="toc-title" className="eyebrow px-3 pb-1 pt-2 text-muted">
                  {t.legal.contents}
                </h2>
                {/* Inner scroller keeps the glass rim intact while short screens scroll the list. */}
                <ol className="grid gap-0.5 sm:grid-cols-2 sm:gap-x-2 lg:max-h-[calc(100svh-11rem)] lg:grid-cols-1 lg:overflow-y-auto lg:overscroll-contain">
                  {doc.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="group relative isolate flex min-h-[44px] items-center rounded-full px-3 py-2 text-sm leading-snug text-muted hover:text-ink focus-visible:outline-offset-[-2px] focus-visible:text-ink"
                      >
                        {/* Hover/focus pill: fades in (opacity only). */}
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 -z-10 rounded-full bg-white/80 opacity-0 shadow-[inset_0_1px_0_#fff,0_4px_14px_-6px_rgba(60,40,20,0.25)] ring-1 ring-inset ring-ink/[0.05] transition-opacity duration-300 ease-editorial group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
                        />
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="glass glass-solid glass-flat rounded-glass-lg px-5 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14 xl:px-14">
              <div className="max-w-[68ch]">
                {doc.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${section.id}-h`}
                    className="border-t border-ink/[0.07] py-9 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <h2 id={`${section.id}-h`} className="font-display text-[1.5rem] leading-[1.15] tracking-[-0.025em] text-balance sm:text-[1.75rem]">
                      {section.heading}
                    </h2>
                    {section.paragraphs?.map((p, i) => (
                      <p key={i} className="mt-4 text-pretty text-[1.0625rem] leading-[1.75] text-ink/[0.88]">
                        {fill(p, tokens)}
                      </p>
                    ))}
                    {section.list ? (
                      <ul className="mt-4 list-disc space-y-2.5 pl-5 text-[1.0625rem] leading-[1.7] text-ink/[0.88] marker:text-signal-deep">
                        {section.list.map((item, i) => (
                          <li key={i} className="pl-1">
                            {fill(item, tokens)}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
