import { SITE_CONFIG } from "@/lib/configs/siteConfig";

/**
 * Structured data (JSON-LD) — the machine-readable version of "who is this
 * and what is this site," adapted from wesleykamau.com's Person+WebSite
 * graph. `sameAs` is the load-bearing field: it's how a search engine links
 * the name to verified accounts (including the main site this is a
 * subdomain of), making a knowledge-panel-style result possible at all.
 *
 * Rendered as a plain <script> tag rather than next/script — structured
 * data has to be in the server-rendered HTML, since crawlers parse the
 * document rather than waiting for client-side execution.
 */

const SITE_URL = "https://nasa.wesleykamau.com";

/** Verified profiles. `sameAs` is an identity assertion, so only URLs that
 *  genuinely belong to Wesley Kamau belong here. */
const PROFILES = [
  "https://wesleykamau.com",
  "https://x.com/weswesleyley",
  "https://www.linkedin.com/in/wesleykamau/",
  "https://github.com/WesleyKamau",
];

const PERSON = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Wesley Kamau",
  url: SITE_URL,
  image: `${SITE_URL}/photos/crops/wesley-kamau--family-photo.jpg`,
  jobTitle: "Software Engineer",
  homeLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Columbus",
      addressRegion: "OH",
      addressCountry: "US",
    },
  },
  sameAs: PROFILES,
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_CONFIG.title,
  description: SITE_CONFIG.shortDescription,
  inLanguage: "en-US",
  publisher: { "@id": `${SITE_URL}/#person` },
};

/** One graph rather than two separate blocks, so `publisher` can reference
 *  the Person by @id instead of duplicating it. */
const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [PERSON, WEBSITE],
};

export function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify already escapes quotes; `<` is escaped so a value can
      // never terminate the script tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(GRAPH).replace(/</g, "\\u003c"),
      }}
    />
  );
}
