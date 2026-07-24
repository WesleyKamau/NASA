/**
 * Which OG image every page gets — the single source of truth for both the
 * generator (`scripts/generate-og.ts`) and `app/layout.tsx`'s `metadata`.
 *
 * This site is a single page, so there's one entry today, but the shape
 * matches wesleykamau.com's convention: a new page costs one map entry, not
 * a new design.
 */

export interface OGPage {
  /** Route this image belongs to. */
  route: string;
  /** Output basename under public/og/. */
  slug: string;
  /** Alt text — also the OG image alt attribute. */
  alt: string;
  /** Message line rendered in the bubble. */
  message: string;
}

export const OG_PAGES: OGPage[] = [
  {
    route: "/",
    slug: "home",
    message: "wanna see who I met at NASA?",
    alt: "Wesley @ NASA — an interactive digital yearbook from a NASA internship",
  },
];

/** Public URL for a page's OG image. */
export function ogImageFor(slug: string): string {
  return `/og/${slug}.jpg`;
}

export const OG_HOME = OG_PAGES[0];
