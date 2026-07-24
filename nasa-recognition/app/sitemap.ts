import type { MetadataRoute } from "next";

const SITE_URL = "https://nasa.wesleykamau.com";

/** Literal date rather than `new Date()`: sitemap metadata must be
 *  deterministic, and a per-request timestamp would just be today's date on
 *  every crawl regardless of whether anything changed. Bump this when the
 *  page's content actually changes. */
const LAST_MODIFIED = "2026-07-24";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
