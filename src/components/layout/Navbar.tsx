"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Wordmark } from "@/components/ui/Wordmark";
import { useLanguage } from "@/context/LanguageContext";
import { useTabs } from "@/context/TabsContext";
import { EASE_EDITORIAL, SPRING_SMOOTH, SPRING_SNAPPY } from "@/lib/motion";
import { TAB_IDS, type TabId } from "@/lib/tabs";
import { goToForm } from "@/lib/scroll";
import { ClientLoginModal } from "./ClientLoginModal";

/** Controls inside the glass bar: flat glass pebbles (no nested blur), 44px tall. */
const BAR_ICON = "btn-line-dark btn-sm glass-flat h-11 w-11 shrink-0 p-0";
const BAR_BUTTON = "btn-sm h-11 py-0";

const INSTANT = { duration: 0 } as const;

/** Menu button icon: three lines that rotate into an X (transform/opacity only). */
function MenuIcon({ open, reduce }: { open: boolean; reduce: boolean }) {
  const tr = reduce ? INSTANT : SPRING_SNAPPY;
  const line = "absolute left-0 top-1/2 -mt-[0.875px] h-[1.75px] w-full rounded-full bg-current";
  return (
    <span aria-hidden="true" className="relative block h-[18px] w-[18px]">
      <motion.span className={line} initial={false} animate={open ? { y: 0, rotate: 45 } : { y: -5, rotate: 0 }} transition={tr} />
      <motion.span className={line} initial={false} animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.4 : 1 }} transition={reduce ? INSTANT : { duration: 0.12 }} />
      <motion.span className={line} initial={false} animate={open ? { y: 0, rotate: -45 } : { y: 5, rotate: 0 }} transition={tr} />
    </span>
  );
}

/**
 * Floating navigation: a sticky Liquid Glass capsule that hovers over the 3D
 * engine and films (real backdrop blur, dense tint so text stays AA over any
 * section). The outer wrapper is transparent and click-through. No scroll
 * listeners of any kind — the reading-progress line is CSS scroll-driven.
 */
export function Navbar() {
  const { t } = useLanguage();
  const [loginOpen, setLoginOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const tabs = useTabs();
  const reduce = !!useReducedMotion();
  // Open: panel springs in, then children cascade 35ms apart (bottom buttons last).
  // Close: one quick fade/scale, children stay put (no reverse cascade).
  const panelVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: reduce ? INSTANT : { ...SPRING_SMOOTH, staggerChildren: 0.035, delayChildren: 0.04 } },
    exit: { opacity: 0, scale: 0.98, transition: reduce ? INSTANT : { duration: 0.16, ease: EASE_EDITORIAL } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: reduce ? INSTANT : SPRING_SMOOTH },
  };
  const tabItems = TAB_IDS.map((id) => ({ id, label: t.nav.tabs[id] }));

  const links = [
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

  const onStartClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setMenuOpen(false);
    goToForm();
  };

  const openLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

  return (
    <>
      <header data-theme="dark" className="pointer-events-none sticky top-0 z-50 px-3 pt-2 sm:px-4 sm:pt-3 lg:px-5">
        {/* Scrim behind the open menu: mutes the page (opacity only, no blur) and closes on tap. */}
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              key="menu-scrim"
              aria-hidden="true"
              onClick={closeMenu}
              className="pointer-events-auto fixed inset-0 -z-10 bg-ink/40 [@media(min-width:80em)]:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? INSTANT : { duration: 0.25, ease: EASE_EDITORIAL }}
            />
          ) : null}
        </AnimatePresence>
        <div className="relative mx-auto max-w-[87.5rem]">
          <div className="glass-dark glass-solid pointer-events-auto relative flex h-14 items-center justify-between gap-2 rounded-full pl-3.5 pr-1.5 [--glass-blur:14px] sm:pl-4 lg:pl-5">
            {/* Reading-progress line along the capsule's lower edge (CSS scroll-driven; no JS).
                The wrapper clips it to the capsule's rounded shape. */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
              <span className="sd-progress absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-aqua-deep via-aqua to-aqua-glow" />
            </span>

            <Link
              href="/"
              aria-label={t.common.homeLabel}
              onClick={(e) => {
                if (!tabs) return;
                e.preventDefault();
                tabs.go("home");
              }}
              className="-ml-1 flex min-h-[44px] shrink-0 items-center rounded-full px-1"
            >
              <Wordmark />
            </Link>

            {tabs ? (
              <TabBar
                items={tabItems}
                selected={tabs.selected}
                onPick={tabs.go}
                label={t.nav.tabsLabel}
                className="max-lg:absolute max-lg:inset-x-0 max-lg:top-full max-lg:mt-2 max-lg:glass-dark max-lg:glass-solid max-lg:glass-flat max-lg:rounded-full lg:mx-1 lg:min-w-0 lg:flex-1"
              />
            ) : (
            <nav aria-label={t.nav.primaryLabel} className="hidden [@media(min-width:80em)]:block">
              <ul className="flex items-center gap-0.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative isolate inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 text-[0.84375rem] font-medium tracking-[-0.005em] text-bone/80 hover:text-bone"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 inset-y-1 -z-10 rounded-full bg-aqua/[0.104] opacity-0 transition-opacity duration-300 ease-editorial group-hover:opacity-100 group-focus-visible:opacity-100"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            )}

            <div className="flex shrink-0 items-center gap-1.5">
              <ThemeToggle className="hidden sm:inline-flex" />
              {/* With the tab bar in the capsule (lg and up) the login folds to its lock icon. */}
              <button
                type="button"
                onClick={openLogin}
                aria-label={tabs ? t.nav.clientLogin : undefined}
                title={tabs ? t.nav.clientLogin : undefined}
                className={`btn-line-dark glass-flat ${BAR_BUTTON} hidden md:inline-flex ${tabs ? "lg:w-11 lg:!px-0" : ""}`}
              >
                <Lock aria-hidden="true" size={13} strokeWidth={1.75} className="hidden lg:block" />
                <span className={tabs ? "lg:sr-only" : undefined}>{t.nav.clientLogin}</span>
              </button>
              <MagneticButton href="#enquiry-form" onClick={onStartClick} className={`btn-aqua ${BAR_BUTTON} hidden md:inline-flex`}>
                {t.common.getStarted}
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.75} className="hidden lg:block" />
              </MagneticButton>
              {/* Language switch sits right of the CTAs: their labels change width with the language,
                  so anything left of them would jump away from the pointer after a tap. */}
              <LanguageToggle tone="dark" />
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
                className={`${BAR_ICON} [@media(min-width:80em)]:hidden`}
              >
                <MenuIcon open={menuOpen} reduce={reduce} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                id="mobile-menu"
                key="mobile-menu"
                className={`glass-dark glass-solid pointer-events-auto absolute inset-x-0 top-full rounded-glass-lg ${tabs ? "mt-2 max-lg:mt-[3.75rem]" : "mt-2"} [--glass-blur:18px] max-sm:glass-flat sm:left-auto sm:w-[23rem] [@media(min-width:80em)]:hidden`}
                // Origin sits under the menu button (capsule padding + half the 44px button).
                style={{ transformOrigin: "calc(100% - 1.75rem) 0" }}
                variants={panelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {/* Inner scroller keeps the glass rim fixed while short (landscape) screens scroll. */}
                <nav aria-label={t.nav.primaryLabel} className="max-h-[calc(100svh-6rem)] overflow-y-auto overscroll-contain p-2">
                  <ul className="space-y-0.5">
                    {tabs
                      ? tabItems.map((item, i) => (
                          <motion.li key={item.id} variants={itemVariants}>
                            <a
                              href={item.id === "home" ? "/" : `#${item.id}`}
                              aria-current={tabs.selected === item.id ? "page" : undefined}
                              onClick={(e) => {
                                e.preventDefault();
                                closeMenu();
                                tabs.go(item.id);
                              }}
                              className={`flex min-h-[52px] items-center justify-between rounded-glass-sm px-4 font-display text-[1.375rem] leading-tight tracking-[-0.03em] transition-transform duration-100 hover:bg-aqua/[0.078] active:scale-[0.98] active:bg-aqua/[0.16] motion-reduce:transition-none ${
                                tabs.selected === item.id ? "bg-aqua/[0.091] text-bone" : "text-bone/80"
                              }`}
                            >
                              {item.label}
                              <span aria-hidden="true" className={`tabular text-sm font-medium tracking-normal ${tabs.selected === item.id ? "text-aqua" : "text-ash"}`}>
                                0{i + 1}
                              </span>
                            </a>
                          </motion.li>
                        ))
                      : links.map((link, i) => (
                      <motion.li key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={closeMenu}
                          className="flex min-h-[56px] items-center justify-between rounded-glass-sm px-4 font-display text-[1.5rem] leading-tight tracking-[-0.03em] transition-transform duration-100 hover:bg-aqua/[0.078] active:scale-[0.98] active:bg-aqua/[0.16] motion-reduce:transition-none"
                        >
                          {link.label}
                          <span aria-hidden="true" className="tabular text-sm font-medium tracking-normal text-ash">
                            0{i + 1}
                          </span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.div variants={itemVariants} className="mx-2 mt-2 grid gap-2 border-t border-bone/[0.14] pb-2 pt-4">
                    <ThemeToggle variant="menu" className="sm:hidden" />
                    <button type="button" onClick={openLogin} className="btn-line-dark glass-flat w-full">
                      <Lock aria-hidden="true" size={13} strokeWidth={1.75} />
                      {t.nav.clientLogin}
                    </button>
                    <a href="#enquiry-form" onClick={onStartClick} className="btn-aqua w-full">
                      {t.common.getStarted}
                    </a>
                  </motion.div>
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

/**
 * The section tabs. Inside the capsule on desktop; a slim rail just below it on
 * smaller screens. One glass pill slides between tabs (shared layout, snappy
 * spring) the instant a tab is picked — the panels swap underneath on their own
 * curve. Overflowing tabs scroll sideways under soft edge fades, and the picked
 * tab glides to the middle of the rail. Arrow keys / Home / End move between tabs.
 */
function TabBar({
  items,
  selected,
  onPick,
  label,
  className = "",
}: {
  items: { id: TabId; label: string }[];
  selected: TabId;
  onPick: (id: TabId) => void;
  label: string;
  className?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the picked tab in view: centre it in the rail (horizontal only, never the page).
  useEffect(() => {
    const rail = railRef.current;
    const tab = rail?.querySelector<HTMLElement>(`[data-tab="${selected}"]`);
    if (!rail || !tab || rail.scrollWidth <= rail.clientWidth) return;
    const left = tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [selected]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const i = items.findIndex((it) => it.id === selected);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onPick(items[next].id);
    railRef.current?.querySelector<HTMLElement>(`[data-tab="${items[next].id}"]`)?.focus();
  };

  return (
    <div className={`pointer-events-auto ${className}`}>
      <div
        ref={railRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex h-11 items-center gap-0.5 overflow-x-auto lg:gap-0 overscroll-x-contain px-1.5 [mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-14px),transparent)] [scrollbar-width:none] lg:[justify-content:safe_center] lg:px-2 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const on = item.id === selected;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              data-tab={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`panel-${item.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => onPick(item.id)}
              className={`group relative isolate inline-flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[0.8125rem] font-medium tracking-[-0.005em] transition-colors duration-300 ease-editorial lg:px-2 [@media(min-width:85.5em)]:px-2.5 ${
                on ? "text-bone" : "text-bone/65 hover:text-bone"
              }`}
            >
              {/* Hover wash (inactive tabs only). */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 inset-y-1.5 -z-10 rounded-full bg-aqua/[0.078] opacity-0 transition-opacity duration-300 ease-editorial group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              {on ? (
                <motion.span
                  layoutId="tab-pill"
                  aria-hidden="true"
                  transition={SPRING_SNAPPY}
                  className="absolute inset-x-0 inset-y-1.5 -z-10 rounded-full bg-aqua/[0.143] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                >
                  {/* A short aqua filament under the label: the one coloured mark in the bar. */}
                  <span className="absolute bottom-[3px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-aqua" />
                </motion.span>
              ) : null}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
