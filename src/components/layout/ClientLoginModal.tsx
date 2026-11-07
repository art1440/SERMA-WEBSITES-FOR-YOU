"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, KeyRound, Lock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToDemo } from "@/lib/scroll";

type Props = { open: boolean; onClose: () => void };

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * "Velvet Rope" client login. No credential fields are collected here — access
 * is provisioned at onboarding — so the modal sells the demo instead.
 * Accessible dialog: focus moves in, Tab is trapped, Esc closes, focus returns.
 */
export function ClientLoginModal({ open, onClose }: Props) {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const restoreTo = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (!current || !items.includes(current)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreTo?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const bookDemo = () => {
    onClose();
    window.setTimeout(goToDemo, 60);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="login-overlay"
          className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
        >
          <div className="absolute inset-0 bg-ink/45" onClick={onClose} aria-hidden="true" />
          {/* Dark glass sheet: real blur only on large, tall screens (lg+ and taller than
              820px), where the dialog stays under ~40% of the viewport. On phones, tablets
              and short laptops it covers more than that, so it drops the blur and goes
              solid (blur budget + no ghosting of the page behind). */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            aria-describedby="login-description"
            data-theme="dark"
            className="glass-dark glass-solid relative flex max-h-[92svh] w-full max-w-xl flex-col rounded-t-glass-lg text-bone [--glass-blur:30px] max-lg:[-webkit-backdrop-filter:none] max-lg:[backdrop-filter:none] max-lg:![background:linear-gradient(160deg,#1f1e1b,#121210)] [@media(max-height:820px)]:[-webkit-backdrop-filter:none] [@media(max-height:820px)]:[backdrop-filter:none] [@media(max-height:820px)]:![background:linear-gradient(160deg,#1f1e1b,#121210)] sm:rounded-glass-lg"
            initial={{ y: 48, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
          >
            {/* Inner scroller: keeps the glass rim fixed while long content scrolls. */}
            <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pb-8 sm:pt-6">
              {/* Header */}
              <div className="flex items-center justify-between gap-4">
                <p className="chip-dark glass-flat text-bone">
                  <Lock aria-hidden="true" size={13} strokeWidth={1.75} className="text-aqua" />
                  {t.login.eyebrow}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.login.close}
                  className="btn-line-dark btn-sm glass-flat -mr-1 h-11 w-11 shrink-0 p-0"
                >
                  <X aria-hidden="true" size={18} strokeWidth={1.75} />
                </button>
              </div>

              <h2
                id="login-title"
                data-autofocus
                tabIndex={-1}
                className="mt-6 text-balance font-display text-[2.125rem] leading-[1.04] tracking-[-0.035em] focus:outline-none sm:mt-8 sm:text-[2.75rem]"
              >
                {t.login.title}
              </h2>
              <p id="login-description" className="mt-4 text-pretty leading-relaxed text-ash">
                {t.login.body}
              </p>

              {/* Decorative locked credential slots — not interactive, nothing is collected. */}
              <div className="mt-7">
                <div aria-hidden="true" className="grid grid-cols-1 gap-2">
                  {[t.login.fieldEmail, t.login.fieldKey].map((label) => (
                    <div
                      key={label}
                      className="flex min-h-[52px] items-center justify-between gap-4 rounded-glass-sm bg-white/[0.05] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-inset ring-white/[0.09]"
                    >
                      <span className="eyebrow text-ash">{label}</span>
                      <span className="flex items-center gap-1.5">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-bone/35"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.04, duration: 0.4, ease: EASE_EDITORIAL }}
                          />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-2 px-1 text-[0.8125rem] leading-snug text-ash">
                  <KeyRound aria-hidden="true" size={14} strokeWidth={1.75} className="shrink-0 text-aqua" />
                  {t.login.lockedLabel}
                </p>
              </div>

              <h3 className="eyebrow mt-8 text-ash">{t.login.stepsLabel}</h3>
              <ol className="mt-3 grid gap-2 sm:grid-cols-3">
                {t.login.steps.map((step, i) => (
                  <motion.li
                    key={step}
                    className="flex items-start gap-3 rounded-glass-sm bg-white/[0.05] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-inset ring-white/[0.09] sm:flex-col sm:gap-2.5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: EASE_EDITORIAL }}
                  >
                    <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-full bg-aqua text-xs font-semibold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_0_10px_rgba(61,219,201,0.35)]">
                      0{i + 1}
                    </span>
                    <span className="block pt-1 text-sm leading-snug sm:pt-0">{step}</span>
                  </motion.li>
                ))}
              </ol>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <MagneticButton className="btn-aqua w-full sm:w-auto" onClick={bookDemo}>
                  {t.login.primary}
                  <ArrowRight aria-hidden="true" size={15} strokeWidth={1.75} />
                </MagneticButton>
                <button type="button" onClick={onClose} className="btn-line-dark glass-flat w-full sm:w-auto">
                  {t.login.close}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
