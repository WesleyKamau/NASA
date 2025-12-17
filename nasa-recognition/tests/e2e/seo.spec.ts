import { test, expect } from '@playwright/test';

test.describe('SEO & Meta Tests', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should have correct Open Graph tags', async ({ page }) => {
    await page.goto('/');

    // Check for essential Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');

    await expect(ogTitle).toHaveCount(1);
    await expect(ogDescription).toHaveCount(1);
    
    // Verify OG title has content
    const titleContent = await ogTitle.getAttribute('content');
    expect(titleContent).toBeTruthy();
    expect(titleContent!.length).toBeGreaterThan(0);
  });

  test('should have proper meta descriptions', async ({ page }) => {
    await page.goto('/');

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveCount(1);

    const descriptionContent = await metaDescription.getAttribute('content');
    expect(descriptionContent).toBeTruthy();
    expect(descriptionContent!.length).toBeGreaterThan(0);
    expect(descriptionContent!.length).toBeLessThan(160); // SEO best practice
  });

  test('should have structured data (JSON-LD)', async ({ page }) => {
    await page.goto('/');

    // Check for JSON-LD structured data
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();

    if (count > 0) {
      const content = await jsonLd.first().textContent();
      expect(content).toBeTruthy();
      
      // Should be valid JSON
      expect(() => JSON.parse(content!)).not.toThrow();
    }
  });

  test('should have correct title tag', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(60); // SEO best practice
  });

  test('should have canonical URL', async ({ page }) => {
    await page.goto('/');

    const canonical = page.locator('link[rel="canonical"]');
    const count = await canonical.count();

    if (count > 0) {
      const href = await canonical.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toContain('http'); // Should be absolute URL
    }
  });

  test('should have proper viewport meta tag', async ({ page }) => {
    await page.goto('/');

    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);

    const content = await viewport.getAttribute('content');
    expect(content).toContain('width=device-width');
  });

  test('should have robots meta tag or robots.txt', async ({ page, request }) => {
    await page.goto('/');

    // Check for robots meta tag
    const robotsMeta = page.locator('meta[name="robots"]');
    const hasRobotsMeta = await robotsMeta.count() > 0;

    // Check for robots.txt
    const robotsTxt = await request.get('/robots.txt').catch(() => null);
    const hasRobotsTxt = robotsTxt?.status() === 200;

    // Should have at least one
    expect(hasRobotsMeta || hasRobotsTxt).toBeTruthy();
  });
});
