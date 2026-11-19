import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

const siteUrl = (process.env.SITE_URL ?? "https://sermawebdesign.com").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// The export uses trailingSlash: true, so list the URLs the way they are served.
const url = (path: string) => `${siteUrl}${basePath}${path === "/" ? "/" : `${path}/`}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const legalUpdated = new Date(siteConfig.legalLastUpdated);
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/es"), changeFrequency: "monthly", priority: 1 },
    { url: url("/privacy"), lastModified: legalUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/terms"), lastModified: legalUpdated, changeFrequency: "yearly", priority: 0.3 },
    { url: url("/disclaimer"), lastModified: legalUpdated, changeFrequency: "yearly", priority: 0.3 },
  ];
}
