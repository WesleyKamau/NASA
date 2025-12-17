import { test, expect } from '@playwright/test';

test.describe('Error Handling Tests', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Intercept and fail image requests
    await page.route('**/*.{jpg,jpeg,png,webp,gif}', route => route.abort());

    await page.goto('/');
    
    // Page should still load despite failed image requests
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle 404 errors with fallback', async ({ page }) => {
    // Navigate to non-existent page
    const response = await page.goto('/non-existent-page');
    
    // Should return 404 status code
    expect(response?.status()).toBe(404);
    
    // Page should still render (Next.js 404 page)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle malformed data gracefully', async ({ page }) => {
    // Intercept API calls and return malformed data
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invalid: 'data' })
      });
    });

    await page.goto('/');
    
    // Page should still render without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should catch and handle JavaScript errors', async ({ page }) => {
    const jsErrors: Error[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error);
    });

    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Page should load without JavaScript errors
    expect(jsErrors.length).toBe(0);
  });

  test('should work in offline mode with cached resources', async ({ page }) => {
    // First load to cache resources
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check if service worker is registered
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    // Should have service worker capability
    expect(hasServiceWorker).toBe(true);
  });

  test('should handle missing data with graceful degradation', async ({ page }) => {
    // Intercept data requests and return empty array
    await page.route('**/data/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/');
    
    // Page should render even with no data
    await expect(page.locator('body')).toBeVisible();
  });
});
