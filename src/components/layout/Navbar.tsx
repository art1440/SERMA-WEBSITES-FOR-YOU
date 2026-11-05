"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Lock, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Wordmark } from "@/components/ui/Wordmark";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToDemo } from "@/lib/scroll";
import { ClientLoginModal } from "./ClientLoginModal";

/**
 * Sticky navigation. Solid background (no backdrop-filter → no scroll-time
 * repaint cost) and no scroll listeners of any kind.
 */
export function Navbar() {
  const { t } = useLanguage();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const links = [
    { href: "/#system", label: t.nav.links.system },
    { href: "/#dashboard", label: t.nav.links.dashboard },
    { href: "/#simulator", label: t.nav.links.simulator },
    { href: "/#calculator", label: t.nav.links.calculator },
    { href: "/#compare", label: t.nav.links.compare },
  ];

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  // Esc closes the mobile menu and returns focus to its toggle.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const onDemoClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setMenuOpen(false);
    goToDemo();
  };

  const openLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline-light bg-bone">
        {/* Reading-progress hairline (CSS scroll-driven; no JS) */}
        <span aria-hidden="true" className="sd-progress pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-signal" />
        <div className="frame flex h-16 items-center justify-between gap-3">
          <Link href="/" aria-label={t.common.homeLabel} className="-ml-1 flex min-h-[44px] items-center px-1">
            <Wordmark />
          </Link>

          <nav aria-label={t.nav.primaryLabel} className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative inline-flex min-h-[44px] items-center font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink"
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-2.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-editorial group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle layoutId="lang-pill-header" />
            <button type="button" onClick={openLogin} className="btn-line hidden px-4 md:inline-flex">
              <Lock aria-hidden="true" size={13} strokeWidth={1.5} />
              {t.nav.clientLogin}
            </button>
            <MagneticButton href="#demo" onClick={onDemoClick} className="btn-ink hidden px-4 md:inline-flex">
              {t.common.bookDemoShort}
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.5} />
            </MagneticButton>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
              className="grid h-11 w-11 place-items-center border border-ink xl:hidden"
            >
              {menuOpen ? <X aria-hidden="true" size={18} strokeWidth={1.5} /> : <Menu aria-hidden="true" size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              id="mobile-menu"
              key="mobile-menu"
              className="absolute inset-x-0 top-full border-b border-ink bg-bone xl:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
            >
              <nav aria-label={t.nav.primaryLabel} className="frame py-4">
                <ul className="divide-y divide-hairline-light border-y border-hairline-light">
                  {links.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.4, ease: EASE_EDITORIAL }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="flex min-h-[52px] items-center justify-between font-display text-3xl"
                      >
                        {link.label}
                        <span aria-hidden="true" className="font-mono text-xs text-muted">
                          0{i + 1}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button type="button" onClick={openLogin} className="btn-line w-full">
                    <Lock aria-hidden="true" size={13} strokeWidth={1.5} />
                    {t.nav.clientLogin}
                  </button>
                  <a href="#demo" onClick={onDemoClick} className="btn-ink w-full">
                    {t.common.bookDemo}
                  </a>
                </div>
              </nav>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <ClientLoginModal open={loginOpen} onClose={closeLogin} />
    </>
  );
}
