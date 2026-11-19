import type { ReactNode } from "react";

/**
 * The root layout is shared with the English site and fixed to lang="en". This sets the document
 * language to Spanish before first paint (the language provider keeps it in sync afterwards).
 */
export default function SpanishLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="es"' }} />
      {children}
    </>
  );
}
