"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AmbientField } from "@/components/ui/AmbientField";
import { Wordmark } from "@/components/ui/Wordmark";
import { EASE_EDITORIAL, SPRING_SMOOTH } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";
import { CrmBoard } from "./CrmBoard";
import { NoBackend, api, isLocalPreview } from "./data";

type Phase = "checking" | "login" | "ready";

/**
 * /admin gate. Asks the Netlify function whether the session cookie is still good;
 * if not, shows the password card. On localhost without the function (plain `next dev`)
 * it runs as a preview on sample data so the layout can be worked on.
 */
export function CrmApp() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api
      .session()
      .then(() => setPhase("ready"))
      .catch((e) => {
        if (e instanceof NoBackend && isLocalPreview()) setPreview(true);
        setPhase("login");
      });
  }, []);

  return (
    <div className="relative isolate min-h-[100svh] overflow-clip">
      <AmbientField variant={1} className="!fixed" />
      <AnimatePresence mode="wait" initial={false}>
        {phase === "checking" ? (
          <motion.div key="checking" exit={{ opacity: 0 }} className="grid min-h-[100svh] place-items-center">
            <Loader2 aria-label="Loading" size={22} className="animate-spin text-ash" />
          </motion.div>
        ) : phase === "login" ? (
          <LoginCard key="login" preview={preview} onIn={() => setPhase("ready")} />
        ) : (
          <motion.div
            key="board"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
          >
            <CrmBoard preview={preview} onSignedOut={() => setPhase("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Password card. Motion carries the answer before the words do: a wrong password
 * shakes the card sideways (a "no" head-shake, 380ms); the right one lifts it up and
 * away while the board fades in behind.
 */
function LoginCard({ preview, onIn }: { preview: boolean; onIn: () => void }) {
  const reduce = useReducedMotionSafe();
  const shake = useAnimationControls();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (!password) {
      setError("Type your password first.");
      inputRef.current?.focus();
      return;
    }
    if (preview) return onIn();
    setSending(true);
    setError("");
    try {
      await api.login(password);
      onIn();
    } catch (err) {
      setSending(false);
      setError(err instanceof Error ? err.message : "That did not work. Try again.");
      if (!reduce) shake.start({ x: [0, -12, 10, -6, 4, 0], transition: { duration: 0.38, ease: "easeOut" } });
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }

  return (
    <motion.main
      id="main"
      className="grid min-h-[100svh] place-items-center px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -28, scale: 0.97, transition: { duration: 0.32, ease: EASE_EDITORIAL } }}
    >
      <motion.div
        initial={reduce ? false : { y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={SPRING_SMOOTH}
        className="w-full max-w-[25rem]"
      >
        <motion.div animate={shake} className="glass-dark glass-solid rounded-glass-lg p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Wordmark />
            <span className="chip-dark text-ash">
              <Lock aria-hidden="true" size={13} strokeWidth={2} /> CRM
            </span>
          </div>
          <h1 className="mt-8 font-display text-[2rem] leading-[1.05] tracking-[-0.03em] text-bone">
            Your <span className="font-serif italic font-normal text-aqua">leads</span>, in one place.
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ash">
            Everyone who filled in a form on your site. Only you can open this page.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-3">
            <label className="block">
              <span className="eyebrow text-ash">Password</span>
              <input
                ref={inputRef}
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                maxLength={200}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "crm-login-err" : undefined}
                className="field mt-2"
              />
            </label>
            <div role="alert" id="crm-login-err" className="min-h-[1.25rem] text-sm leading-snug text-bone">
              {error ? (
                <>
                  <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-signal align-middle" />
                  {error}
                </>
              ) : null}
            </div>
            <button type="submit" disabled={sending} className="btn-aqua w-full">
              {sending ? "Checking…" : "Open my leads"}
              {sending ? (
                <Loader2 aria-hidden="true" size={16} className="animate-spin" />
              ) : (
                <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
              )}
            </button>
          </form>
          {preview ? (
            <p className="mt-5 rounded-glass-sm bg-aqua/[0.07] px-3.5 py-2.5 text-[0.8125rem] leading-snug text-ash">
              Local preview: the Netlify function is not running here, so any password opens sample data.
            </p>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.main>
  );
}
