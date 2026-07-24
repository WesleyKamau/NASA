/**
 * generate-og.ts — builds every static OG image into public/og/.
 *
 * Replaces the old scripts/capture-og.js, which screenshot the manually
 * hand-tuned `/og-generator` rocket scene at default (2×) device scale and
 * wrote a single ~110 KB PNG straight to public/og.png. This generates one
 * JPEG per page from lib/og/pages.ts, at the 1200×630 consumers actually
 * display, encoded once as progressive JPEG.
 *
 * Requires a dev server on :3000 (the pages render React, not satori).
 *
 *   npm run dev            # in another shell
 *   npm run generate:og
 *
 * Output: public/og/<slug>.jpg — one per entry in lib/og/pages.ts
 */
import puppeteer from "puppeteer";
import sharp from "sharp";
import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from "fs";
import path from "path";
import { OG_PAGES } from "../lib/og/pages";

const BASE = process.env.OG_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public", "og");

/** JPEG rather than PNG: WhatsApp silently drops preview images above
 *  roughly 300 KB, and a 1200×630 PNG of this artwork would run into the
 *  hundreds of KB to megabytes. Quality 86 lands comfortably under that. */
const JPEG = { quality: 86, mozjpeg: true, progressive: true } as const;

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // Clear stale output so a removed page doesn't linger and keep being served.
  if (existsSync(OUT_DIR)) {
    for (const f of readdirSync(OUT_DIR)) {
      if (f.endsWith(".jpg")) rmSync(path.join(OUT_DIR, f));
    }
  }

  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  let total = 0;
  for (const [i, entry] of OG_PAGES.entries()) {
    const url = `${BASE}/og?slug=${entry.slug}`;

    // `domcontentloaded`, not `networkidle0`: the dev server's HMR socket
    // never reaches a quiet network, so networkidle0 just burns the timeout.
    // Readiness is asserted explicitly below instead.
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // The signature curtain decides whether to play from a per-session flag,
    // and a fresh browser context always reads as a first visit — so it
    // would play over every capture. app/og/layout.tsx suppresses it with
    // CSS; assert that rather than sleeping.
    await page.waitForFunction(
      () => {
        const el = document.getElementById("wk-signature");
        return !el || getComputedStyle(el).display === "none";
      },
      { timeout: 15000 },
    );

    await page.evaluateHandle("document.fonts.ready");
    await page.evaluate(() =>
      Promise.all(
        Array.from(document.querySelectorAll("img")).map(
          (img) =>
            img.complete ||
            new Promise((r) => {
              img.onload = r;
              img.onerror = r;
            }),
        ),
      ),
    );

    // The bubble's tail SVG only renders once the client hydrates and a
    // ResizeObserver-driven layout effect measures the text (see
    // imessage-ui's MultilineBubble) — on the first paint it's a plain text
    // box with no tail. Wait for the real element rather than sleeping.
    await page.waitForSelector(".imsg-tailed-svg", { timeout: 15000 });

    const png = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    const jpg = await sharp(png).jpeg(JPEG).toBuffer();
    writeFileSync(path.join(OUT_DIR, `${entry.slug}.jpg`), jpg);
    total += jpg.length;
    console.log(
      `  ${String(i + 1).padStart(3)}/${OG_PAGES.length}  ${entry.slug}.jpg  ${(jpg.length / 1024).toFixed(0)} KB`,
    );
  }

  await browser.close();

  console.log(
    `\nDone — ${OG_PAGES.length} image(s), ${(total / 1024).toFixed(0)} KB total ` +
      `(avg ${(total / OG_PAGES.length / 1024).toFixed(0)} KB).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
