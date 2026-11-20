"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      !el.closest("[hidden], [inert]") &&
      (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0),
  );
}

/**
 * Traps Tab / Shift+Tab inside `ref` while `active`, focuses `[data-autofocus]`
 * (or the first focusable, or the container itself) on activation, calls
 * `onEscape` on Esc, and restores focus to the previously focused element
 * when deactivated.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape: () => void): void {
  const escRef = useRef(onEscape);
  escRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const restoreTo = document.activeElement as HTMLElement | null;

    const first = root.querySelector<HTMLElement>("[data-autofocus]") ?? focusables(root)[0];
    if (first) first.focus();
    else {
      if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
      root.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        escRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables(root);
      if (items.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const head = items[0];
      const tail = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      if (!current || !root.contains(current)) {
        e.preventDefault();
        head.focus();
      } else if (e.shiftKey && current === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && current === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (restoreTo && restoreTo.isConnected) restoreTo.focus();
    };
  }, [active, ref]);
}
