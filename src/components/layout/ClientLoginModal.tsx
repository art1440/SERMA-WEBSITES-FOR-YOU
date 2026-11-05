"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, KeyRound, Lock, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_EDITORIAL } from "@/lib/motion";
import { goToDemoForm } from "@/lib/scroll";

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
    window.setTimeout(goToDemoForm, 60);
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
          <div className="absolute inset-0 bg-ink/75" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            aria-describedby="login-description"
            data-theme="dark"
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto border border-hairline-dark bg-ink text-bone"
            initial={{ y: 48, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
          >
            {/* Header rail */}
            <div className="flex items-center justify-between border-b border-hairline-dark px-5 py-3">
              <p className="eyebrow flex items-center gap-2 text-ash">
                <Lock aria-hidden="true" size={13} strokeWidth={1.5} />
                {t.login.eyebrow}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.login.close}
                className="grid h-11 w-11 place-items-center border border-transparent text-bone hover:border-hairline-dark"
              >
                <X aria-hidden="true" size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8">
              <h2
                id="login-title"
                data-autofocus
                tabIndex={-1}
                className="font-display text-4xl leading-[1.02] focus:outline-none sm:text-5xl"
              >
                {t.login.title}
              </h2>
              <p id="login-description" className="mt-4 text-pretty leading-relaxed text-ash">
                {t.login.body}
              </p>

              {/* Decorative locked credential slots — not interactive, nothing is collected. */}
              <div className="mt-6 border border-hairline-dark">
                <div aria-hidden="true" className="grid grid-cols-1 divide-y divide-hairline-dark">
                  {[t.login.fieldEmail, t.login.fieldKey].map((label) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                      <span className="eyebrow text-ash">{label}</span>
                      <span className="flex items-center gap-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 bg-ink-500"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.04, duration: 0.4, ease: EASE_EDITORIAL }}
                          />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="flex items-center gap-2 border-t border-hairline-dark bg-ink-800 px-4 py-2.5 font-mono text-micro uppercase text-ash">
                  <KeyRound aria-hidden="true" size={13} strokeWidth={1.5} className="text-signal" />
                  {t.login.lockedLabel}
                </p>
              </div>

              <h3 className="eyebrow mt-7 text-ash">{t.login.stepsLabel}</h3>
              <ol className="mt-3 grid gap-px border border-hairline-dark bg-hairline-dark sm:grid-cols-3">
                {t.login.steps.map((step, i) => (
                  <motion.li
                    key={step}
                    className="bg-ink p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: EASE_EDITORIAL }}
                  >
                    <span className="block font-mono text-xs text-signal">0{i + 1}</span>
                    <span className="mt-1 block text-sm leading-snug">{step}</span>
                  </motion.li>
                ))}
              </ol>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <MagneticButton className="btn-bone w-full sm:w-auto" onClick={bookDemo}>
                  {t.login.primary}
                  <ArrowRight aria-hidden="true" size={15} strokeWidth={1.5} />
                </MagneticButton>
                <button type="button" onClick={onClose} className="btn-line-dark w-full sm:w-auto">
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
