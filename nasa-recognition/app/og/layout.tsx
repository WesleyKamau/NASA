import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OG Preview",
  robots: { index: false, follow: false },
};

/**
 * This route is a render target for the OG screenshot generator, never a
 * page a visitor lands on. `SignatureCurtain` (`#wk-signature`) treats every
 * fresh browser context as a first visit, and the generator opens exactly
 * that — so the intro would play over the artwork and land in captures.
 * Suppressing it here makes the render deterministic instead of a race
 * against the reveal. The default 8px body margin also offsets the
 * generator's `{x:0,y:0,width:1200,height:630}` capture, so it's reset too.
 * `nextjs-portal` is Next's dev-mode build indicator/error toast — it renders
 * fixed-position in a corner and would otherwise land in every dev-server
 * capture.
 */
const SUPPRESS_CHROME = `#wk-signature,#wk-signature-band,nextjs-portal{display:none!important}html,body{margin:0;padding:0;background:#000}`;

export default function OGLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SUPPRESS_CHROME }} />
      {children}
    </>
  );
}
