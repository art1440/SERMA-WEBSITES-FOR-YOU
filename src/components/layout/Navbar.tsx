"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Lock, Menu, Pause, Play, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Wordmark } from "@/components/ui/Wordmark";
import { useLanguage } from "@/context/LanguageContext";
import { useMotionPause } from "@/context/MotionPauseContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToDemo } from "@/lib/scroll";
import { ClientLoginModal } from "./ClientLoginModal";

/** Controls inside the glass bar: flat glass pebbles (no nested blur), 44px tall. */
const BAR_ICON = "btn-line glass-flat h-11 w-11 min-h-[44px] shrink-0 p-0";
const BAR_BUTTON = "h-11 min-h-[44px] px-4 py-0 text-sm";

/**
 * Floating navigation: a sticky Liquid Glass capsule that hovers over the 3D
 * engine and films (real backdrop blur, dense tint so text stays AA over any
 * section). The outer wrapper is transparent and click-through. No scroll
 * listeners of any kind — the reading-progress line is CSS scroll-driven.
 */
export function Navbar() {
  const { t } = useLanguage();
  const { paused, toggle: toggleMotion } = useMotionPause();
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
      <header className="pointer-events-none sticky top-0 z-50 px-3 pt-2 sm:px-4 sm:pt-3 lg:px-5">
        <div className="relative mx-auto max-w-[87.5rem]">
          <div className="glass glass-solid pointer-events-auto relative flex h-14 items-center justify-between gap-2 rounded-full pl-3.5 pr-1.5 [--glass-blur:20px] sm:pl-4 lg:pl-5">
            {/* Reading-progress line along the capsule's lower edge (CSS scroll-driven; no JS).
                The wrapper clips it to the capsule's rounded shape. */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="sd-progress absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-amber via-signal to-signal" />
            </span>

            <Link href="/" aria-label={t.common.homeLabel} className="-ml-1 flex min-h-[44px] shrink-0 items-center rounded-full px-1">
              <Wordmark />
            </Link>

            <nav aria-label={t.nav.primaryLabel} className="hidden xl:block">
              <ul className="flex items-center gap-0.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative isolate inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 text-[0.84375rem] font-medium tracking-[-0.005em] text-ink/80 hover:text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 inset-y-1 -z-10 rounded-full bg-ink/[0.06] opacity-0 transition-opacity duration-300 ease-editorial group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMotion}
                aria-pressed={paused}
                aria-label={paused ? t.common.playAll : t.common.pauseAll}
                title={paused ? t.common.playAll : t.common.pauseAll}
                className={`${BAR_ICON} hidden sm:inline-flex`}
              >
                {paused ? <Play aria-hidden="true" size={14} strokeWidth={1.75} /> : <Pause aria-hidden="true" size={14} strokeWidth={1.75} />}
              </button>
              <button type="button" onClick={openLogin} className={`btn-line glass-flat ${BAR_BUTTON} hidden md:inline-flex`}>
                <Lock aria-hidden="true" size={13} strokeWidth={1.75} className="hidden lg:block" />
                {t.nav.clientLogin}
              </button>
              <MagneticButton href="#demo" onClick={onDemoClick} className={`btn-ink ${BAR_BUTTON} hidden md:inline-flex`}>
                {t.common.bookDemoShort}
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.75} className="hidden lg:block" />
              </MagneticButton>
              {/* Language switch sits right of the CTAs: their labels change width with the language,
                  so anything left of them would jump away from the pointer after a tap. */}
              <LanguageToggle />
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                className={`${BAR_ICON} xl:hidden`}
              >
                {menuOpen ? <X aria-hidden="true" size={18} strokeWidth={1.75} /> : <Menu aria-hidden="true" size={18} strokeWidth={1.75} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                id="mobile-menu"
                key="mobile-menu"
                className="glass glass-solid pointer-events-auto absolute inset-x-0 top-full mt-2 rounded-glass-lg [--glass-blur:18px] sm:left-auto sm:w-[23rem] xl:hidden"
                style={{ transformOrigin: "top right" }}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.985 }}
                transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
              >
                {/* Inner scroller keeps the glass rim fixed while short (landscape) screens scroll. */}
                <nav aria-label={t.nav.primaryLabel} className="max-h-[calc(100svh-6rem)] overflow-y-auto overscroll-contain p-2">
                  <ul className="space-y-0.5">
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
                          className="flex min-h-[56px] items-center justify-between rounded-glass-sm px-4 font-display text-[1.5rem] leading-tight tracking-[-0.03em] hover:bg-ink/[0.05]"
                        >
                          {link.label}
                          <span aria-hidden="true" className="tabular text-sm font-medium tracking-normal text-ink/65">
                            0{i + 1}
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mx-2 mt-2 grid gap-2 border-t border-ink/[0.08] pb-2 pt-4">
                    <button type="button" onClick={toggleMotion} aria-pressed={paused} className="btn-line glass-flat w-full sm:hidden">
                      {paused ? <Play aria-hidden="true" size={13} strokeWidth={1.75} /> : <Pause aria-hidden="true" size={13} strokeWidth={1.75} />}
                      {paused ? t.common.playAll : t.common.pauseAll}
                    </button>
                    <button type="button" onClick={openLogin} className="btn-line glass-flat w-full">
                      <Lock aria-hidden="true" size={13} strokeWidth={1.75} />
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
        </div>
      </header>

      <ClientLoginModal open={loginOpen} onClose={closeLogin} />
    </>
  );
}
