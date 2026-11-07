"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight, ShieldCheck } from "lucide-react";
import { AmbientField } from "@/components/ui/AmbientField";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Reveal } from "@/components/ui/Reveal";
import { Wordmark } from "@/components/ui/Wordmark";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { fill } from "@/i18n/types";

/** Footer link: calm sans, with a small arrow that glides in on hover (transform + opacity). */
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex min-h-[44px] items-center gap-1.5 text-[1.0625rem] tracking-[-0.01em] text-bone/85 hover:text-bone"
    >
      {label}
      <ArrowUpRight
        aria-hidden="true"
        size={14}
        strokeWidth={1.75}
        className="-translate-x-1 text-aqua opacity-0 transition-[transform,opacity] duration-300 ease-editorial group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
      />
    </Link>
  );
}

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
    <footer data-theme="dark" className="relative isolate overflow-hidden text-bone">
      <AmbientField tone="dark" variant={2} />
      <div className="frame pb-8 pt-24 lg:pt-28">
        <div className="grid grid-cols-12 gap-x-4 gap-y-14 lg:gap-x-8">
          <div className="col-span-12 lg:col-span-5">
            <p className="max-w-md text-pretty font-display text-[1.625rem] leading-[1.18] tracking-[-0.03em] text-bone sm:text-[1.875rem]">
              {t.footer.tagline}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {/* Flat: the footer field is static and soft, so real blur would be invisible cost. */}
              <p className="chip-dark glass-flat min-h-[44px] text-bone">
                <ShieldCheck aria-hidden="true" size={15} strokeWidth={1.75} className="shrink-0 text-aqua" />
                {t.footer.privacyBadge}
              </p>
              <LanguageToggle tone="dark" />
            </div>
          </div>

          <nav aria-labelledby="footer-explore" className="col-span-6 lg:col-span-3 lg:col-start-7">
            <h2 id="footer-explore" className="eyebrow text-ash">
              {t.footer.explore}
            </h2>
            <ul className="mt-3">
              {explore.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href} label={l.label} />
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal" className="col-span-6 lg:col-span-3">
            <h2 id="footer-legal" className="eyebrow text-ash">
              {t.footer.legal}
            </h2>
            <ul className="mt-3">
              {legal.map((l) => (
                <li key={l.href}>
                  <FooterLink href={l.href} label={l.label} />
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Reveal className="mt-20 overflow-hidden lg:mt-28" y={60}>
          <Wordmark tone="dark" size="xl" />
        </Reveal>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-[0.8125rem] text-ash sm:flex-row sm:items-center sm:justify-between">
          <p>{fill(t.footer.rights, { year, entity: siteConfig.legalEntity })}</p>
          <a href="#top" className="btn-line-dark btn-sm glass-flat self-start sm:self-auto">
            {t.footer.backToTop}
            <ArrowUp aria-hidden="true" size={14} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </footer>
  );
}
