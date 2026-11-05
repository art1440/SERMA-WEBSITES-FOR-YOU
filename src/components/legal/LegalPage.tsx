"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { DocumentTitle } from "@/components/ui/DocumentTitle";
import { Reveal, RevealLines } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { legalDocs, type LegalSlug } from "@/i18n/legal";
import { fill } from "@/i18n/types";

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
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <article className="frame py-16 lg:py-24">
          <Link href="/" className="inline-flex min-h-[44px] items-center gap-2 font-mono text-micro uppercase text-muted hover:text-ink">
            <ArrowLeft aria-hidden="true" size={13} strokeWidth={1.5} />
            {t.legal.backHome}
          </Link>

          <header className="mt-8 grid grid-cols-12 gap-x-4 gap-y-6 border-t border-ink pt-8 lg:gap-x-8">
            <p className="col-span-12 font-mono text-micro uppercase text-muted md:col-span-3">
              {fill(t.legal.lastUpdated, { date: updated })}
            </p>
            <div className="col-span-12 md:col-span-9">
              <RevealLines as="h1" trigger="mount" lines={[doc.title]} className="font-display text-display-lg" />
              <Reveal trigger="mount" delay={0.15}>
                <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-muted">{fill(doc.intro, tokens)}</p>
                {t.legal.translationNote ? (
                  <p className="mt-4 max-w-3xl border-l-2 border-ink pl-4 text-sm text-muted">{t.legal.translationNote}</p>
                ) : null}
              </Reveal>
            </div>
          </header>

          <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-10 lg:gap-x-8">
            <nav aria-labelledby="toc-title" className="col-span-12 md:col-span-3">
              <div className="md:sticky md:top-24">
                <h2 id="toc-title" className="eyebrow text-muted">
                  {t.legal.contents}
                </h2>
                <ol className="mt-3 space-y-1 border-l border-hairline-light">
                  {doc.sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="block py-1 pl-3 text-sm text-muted hover:text-ink">
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="col-span-12 max-w-3xl md:col-span-9">
              {doc.sections.map((section) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`} className="border-t border-hairline-light py-8 first:border-t-0 first:pt-0">
                  <h2 id={`${section.id}-h`} className="font-display text-3xl leading-tight">
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((p, i) => (
                    <p key={i} className="mt-4 text-pretty leading-relaxed text-ink/90">
                      {fill(p, tokens)}
                    </p>
                  ))}
                  {section.list ? (
                    <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-ink/90 marker:text-muted">
                      {section.list.map((item, i) => (
                        <li key={i}>{fill(item, tokens)}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
