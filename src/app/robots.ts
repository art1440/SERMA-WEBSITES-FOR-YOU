import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = (process.env.SITE_URL ?? "https://sermawebdesign.com").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}${basePath}/sitemap.xml`,
  };
}
