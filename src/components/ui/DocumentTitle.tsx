"use client";

import { useEffect } from "react";

/** Keeps the browser tab title in the active language (server metadata stays English for crawlers). */
export function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
}
