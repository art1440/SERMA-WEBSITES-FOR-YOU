"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { useMockup } from "@/context/MockupContext";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

/**
 * Phones only: a bar pinned to the bottom of the screen with the two ways to act right now:
 * "Get your free preview" (opens the pop-up) and a tap-to-call button.
 *
 * It slides up once the hero (which has its own buttons) has scrolled away, and slides back
 * down while the pricing form or the footer is on screen, so it never covers the form being
 * filled in or the footer links. Hidden from md up: desktop keeps the navbar button in view.
 */
export function StickyCta() {
  const { t } = useLanguage();
  const { openMockup } = useMockup();
  const reduce = useReducedMotionSafe();
  const phone = siteConfig.contactPhone;
  const [heroGone, setHeroGone] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("home");
    const blockers = [document.getElementById("enquiry-form"), document.querySelector("footer")].filter(Boolean) as Element[];
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === hero) setHeroGone(!e.isIntersecting);
          else {
            if (e.isIntersecting) seen.add(e.target);
            else seen.delete(e.target);
            setBlocked(seen.size > 0);
          }
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    if (hero) io.observe(hero);
    blockers.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const show = heroGone && !blocked;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="sticky-cta"
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
          initial={reduce ? { opacity: 0 } : { y: "110%" }}
          animate={reduce ? { opacity: 1 } : { y: "0%" }}
          exit={reduce ? { opacity: 0 } : { y: "110%" }}
          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 36 }}
        >
          <div className="glass-dark flex items-center gap-2 rounded-full p-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55)] ring-1 ring-inset ring-bone/15">
            <button
              type="button"
              onClick={openMockup}
              aria-haspopup="dialog"
              className="btn-aqua inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[0.9375rem] font-bold"
            >
              {t.common.getStarted}
              <ArrowUpRight aria-hidden="true" size={17} strokeWidth={2.25} />
            </button>
            {phone ? (
              <a
                href={`tel:${phone.e164}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-bone-50 px-5 text-[0.9375rem] font-bold text-ink-900"
              >
                <Phone aria-hidden="true" size={17} strokeWidth={2.25} />
                {t.common.call}
              </a>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
