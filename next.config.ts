import type { NextConfig } from "next";
import { buildCsp } from "./src/config/csp";

const isDev = process.env.NODE_ENV !== "production";

/**
 * GITHUB_PAGES=true → fully static export (no server) for GitHub Pages,
 * served under NEXT_PUBLIC_BASE_PATH (e.g. /SERMA-WEBSITES-FOR-YOU).
 * Otherwise → normal Next.js server build with security headers.
 */
const staticExport = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const securityHeaders = [
  { key: "Content-Security-Policy", value: buildCsp({ dev: isDev }) },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  ...(staticExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath,
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            { source: "/:path*", headers: securityHeaders },
            {
              source: "/media/:file*",
              headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
          ];
        },
      }),
};

export default nextConfig;
