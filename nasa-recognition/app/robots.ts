import type { MetadataRoute } from "next";

const SITE_URL = "https://nasa.wesleykamau.com";

/** Disallows crawling; the matching pages also carry `noindex` metadata —
 *  robots.txt asks crawlers not to visit, noindex tells them not to list,
 *  and a page blocked from crawling can still be indexed if linked from
 *  elsewhere, so internal routes need both. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/og", "/rocket-config", "/setup", "/lottie-preview"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
