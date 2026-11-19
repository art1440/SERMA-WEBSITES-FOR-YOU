"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { ArrowUp, ArrowUpRight, Mail, Pause, Phone, Play, ShieldCheck } from "lucide-react";
import { AmbientField } from "@/components/ui/AmbientField";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Reveal, staggerDelay } from "@/components/ui/Reveal";
import { Wordmark } from "@/components/ui/Wordmark";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { fill } from "@/i18n/types";

const linkBase =
  "group inline-flex min-h-[44px] items-center gap-1.5 tracking-[-0.01em] text-bone/85 hover:text-bone focus-visible:text-bone";

/** Underline that grows from the left on hover/focus (transform only). Reduced motion: appears instantly. */
function GrowUnderline() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-aqua transition-transform duration-base ease-editorial group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
    />
  );
}

/** Small arrow that glides in on hover (transform + opacity). Reduced motion: fades only, no movement. */
function GlideArrow() {
  return (
    <ArrowUpRight
      aria-hidden="true"
      size={14}
      strokeWidth={1.75}
      className="shrink-0 -translate-x-1 text-aqua opacity-0 transition-[transform,opacity] duration-base ease-editorial group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0 motion-reduce:transition-opacity"
    />
  );
}

/** Footer nav link: calm sans, left-growing underline and a gliding arrow. */
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={`${linkBase} text-[1.0625rem]`}>
      <span className="relative">
        {label}
        <GrowUnderline />
      </span>
      <GlideArrow />
    </Link>
  );
}

/** Contact route (mailto / tel) with a leading icon; same hover treatment as FooterLink. */
function FooterContact({
  href,
  icon,
  label,
  breakAll = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  breakAll?: boolean;
}) {
  return (
    <a href={href} className={`${linkBase} text-[0.9375rem]`}>
      {icon}
      <span className={`relative ${breakAll ? "break-all" : ""}`}>
        {label}
        <GrowUnderline />
      </span>
      <GlideArrow />
    </a>
  );
}

/** Smooth scroll to the top; instant under reduced motion. Keeps the #top href as the no-JS fallback. */
function scrollToTop(e: MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  window.history.replaceState(null, "", "#top");
}

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const explore = [
    { href: "/#dashboard", label: t.nav.links.dashboard },
    { href: "/#simulator", label: t.nav.links.simulator },
    { href: "/#calculator", label: t.nav.links.calculator },
    { href: "/#compare", label: t.nav.links.compare },
    { href: "/#pricing", label: t.nav.tabs.pricing },
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
          <Reveal className="col-span-12 lg:col-span-5">
            <p className="max-w-md text-pretty font-display text-[1.625rem] leading-[1.18] tracking-[-0.03em] text-bone sm:text-[1.875rem]">
              {t.footer.tagline}
            </p>
            {/* Direct routes, for people who would rather ring than fill in a form. */}
            <div className="mt-6 flex flex-col items-start">
              <FooterContact
                href={`mailto:${siteConfig.contactEmail}`}
                icon={<Mail aria-hidden="true" size={15} strokeWidth={1.75} className="shrink-0 text-ash" />}
                label={siteConfig.contactEmail}
                breakAll
              />
              {siteConfig.contactPhone ? (
                <FooterContact
                  href={`tel:${siteConfig.contactPhone.e164}`}
                  icon={<Phone aria-hidden="true" size={15} strokeWidth={1.75} className="shrink-0 text-ash" />}
                  label={siteConfig.contactPhone.display}
                />
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3">
              {/* Switch first: the badge beside it changes width with the language, so anything after
                  it would jump away from the pointer after a tap. */}
              <LanguageToggle tone="dark" />
              {/* Flat: the footer field is static and soft, so real blur would be invisible cost. */}
              <p className="chip-dark glass-flat min-h-[44px] text-bone">
                <ShieldCheck aria-hidden="true" size={15} strokeWidth={1.75} className="shrink-0 text-aqua" />
                {t.footer.privacyBadge}
              </p>
              {/* WCAG 2.2.2: the one control that stops the 3D engine and every looping video. It lives in the
                  footer (outside the tab panels), so it is reachable from every tab. */}
              <PauseMotionButton />
            </div>
          </Reveal>

          {/* Same top edge and same heading-to-list gap in both columns; 60ms stagger after the lead column. */}
          <Reveal className="col-span-6 lg:col-span-3 lg:col-start-7" delay={staggerDelay(1)}>
            <nav aria-labelledby="footer-explore">
              <h2 id="footer-explore" className="eyebrow text-ash">
                {t.footer.explore}
              </h2>
              <ul className="mt-2">
                {explore.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href} label={l.label} />
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <Reveal className="col-span-6 lg:col-span-3" delay={staggerDelay(2)}>
            <nav aria-labelledby="footer-legal">
              <h2 id="footer-legal" className="eyebrow text-ash">
                {t.footer.legal}
              </h2>
              <ul className="mt-2">
                {legal.map((l) => (
                  <li key={l.href}>
                    <FooterLink href={l.href} label={l.label} />
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        </div>

        <Reveal className="mt-20 overflow-hidden lg:mt-28" y={60}>
          <Wordmark tone="dark" size="xl" />
        </Reveal>

        <div className="mt-8 flex flex-col gap-4 border-t border-bone/[0.14] pt-6 text-[0.8125rem] text-ash sm:flex-row sm:items-center sm:justify-between">
          <p>{fill(t.footer.rights, { year, entity: siteConfig.legalEntity })}</p>
          <a
            href="#top"
            onClick={scrollToTop}
            className="group btn-line-dark btn-sm glass-flat self-start hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 sm:self-auto"
          >
            {t.footer.backToTop}
            <ArrowUp
              aria-hidden="true"
              size={14}
              strokeWidth={1.75}
              className="transition-transform duration-base ease-editorial group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

function PauseMotionButton() {
  const { t } = useLanguage();
  const { paused, toggle } = useMotionPause();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      className="chip-dark glass-flat min-h-[44px] text-bone transition-transform duration-base ease-editorial hover:-translate-y-0.5 hover:text-bone active:scale-[0.97] motion-reduce:hover:translate-y-0"
    >
      {paused ? (
        <Play aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0 text-aqua" />
      ) : (
        <Pause aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0 text-aqua" />
      )}
      {paused ? t.common.playAll : t.common.pauseAll}
    </button>
  );
}
