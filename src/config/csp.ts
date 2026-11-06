/**
 * Content-Security-Policy: first-party only. No third-party scripts, styles,
 * fonts, frames or beacons can load — this enforces the zero-cookie /
 * zero-tracker promise at the browser level, not just by convention.
 *
 * Sent as an HTTP header on servers that support it (Vercel, `next start`),
 * and as a <meta> tag on static hosts that can't send headers (GitHub Pages).
 */
export function buildCsp({ dev = false, meta = false }: { dev?: boolean; meta?: boolean } = {}) {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self'",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws: wss:" : ""}`,
    // frame-ancestors is only honored as a header; browsers ignore it in <meta>.
    ...(meta ? [] : ["frame-ancestors 'none'"]),
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
