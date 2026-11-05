"use client";

import Link from "next/link";
import { ArrowUp, ShieldCheck } from "lucide-react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Reveal } from "@/components/ui/Reveal";
import { Wordmark } from "@/components/ui/Wordmark";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { fill } from "@/i18n/types";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const explore = [
    { href: "/#system", label: t.nav.links.system },
    { href: "/#dashboard", label: t.nav.links.dashboard },
    { href: "/#simulator", label: t.nav.links.simulator },
    { href: "/#calculator", label: t.nav.links.calculator },
    { href: "/#compare", label: t.nav.links.compare },
    { href: "/#demo", label: t.common.bookDemo },
  ];
  const legal = [
    { href: "/terms", label: t.footer.terms },
    { href: "/privacy", label: t.footer.privacy },
    { href: "/disclaimer", label: t.footer.disclaimer },
  ];

  return (
    <footer data-theme="dark" className="bg-ink text-bone">
      <div className="frame pb-10 pt-20">
        <div className="grid grid-cols-12 gap-x-4 gap-y-10 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-5">
            <p className="max-w-sm text-pretty leading-relaxed text-ash">{t.footer.tagline}</p>
            <p className="mt-6 flex items-center gap-2 font-mono text-micro uppercase text-bone">
              <ShieldCheck aria-hidden="true" size={15} strokeWidth={1.5} className="text-signal" />
              {t.footer.privacyBadge}
            </p>
            <div className="mt-6">
              <LanguageToggle layoutId="lang-pill-footer" tone="dark" />
            </div>
          </div>

          <nav aria-labelledby="footer-explore" className="col-span-6 lg:col-span-3 lg:col-start-7">
            <h2 id="footer-explore" className="eyebrow text-ash">
              {t.footer.explore}
            </h2>
            <ul className="mt-4 space-y-1">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-[40px] items-center text-bone hover:text-signal">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal" className="col-span-6 lg:col-span-3">
            <h2 id="footer-legal" className="eyebrow text-ash">
              {t.footer.legal}
            </h2>
            <ul className="mt-4 space-y-1">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex min-h-[40px] items-center text-bone hover:text-signal">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Reveal className="mt-16 overflow-hidden border-t border-hairline-dark pt-6" y={60}>
          <Wordmark tone="dark" size="xl" />
        </Reveal>

        <div className="mt-8 flex flex-col gap-4 border-t border-hairline-dark pt-6 font-mono text-micro uppercase text-ash sm:flex-row sm:items-center sm:justify-between">
          <p>{fill(t.footer.rights, { year, entity: siteConfig.legalEntity })}</p>
          <a href="#top" className="inline-flex min-h-[44px] items-center gap-2 text-bone hover:text-signal">
            {t.footer.backToTop}
            <ArrowUp aria-hidden="true" size={13} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}
