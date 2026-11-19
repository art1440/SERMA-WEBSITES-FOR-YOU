import type { NextConfig } from "next";
import { buildCsp } from "./src/config/csp";

const isDev = process.env.NODE_ENV !== "production";

/**
 * STATIC_EXPORT=true → fully static site in /out (used by Netlify; security
 * headers come from netlify.toml). Otherwise → normal Next.js server build
 * with the same headers set here.
 */
const staticExport = process.env.STATIC_EXPORT === "true";
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
