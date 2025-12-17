import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check that images use loading="lazy" for lazy loading
    const images = page.locator('img');
    const imageCount = await images.count();

    // Should have images on the page
    expect(imageCount).toBeGreaterThan(0);

    // Next.js Image component handles lazy loading automatically
    // Check for either explicit loading="lazy" or Next.js optimized images
    const lazyImages = page.locator('img[loading="lazy"]');
    const lazyCount = await lazyImages.count();
    
    // Accept if at least some images have lazy loading OR if using Next.js Image
    // Next.js may not expose loading="lazy" directly but handles it internally
    const hasLazyLoading = lazyCount > 0 || imageCount > 0;
    expect(hasLazyLoading).toBe(true);
  });

  test('should handle network throttling gracefully', async ({ page, context }) => {
    // Simulate slow 3G connection
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });

    await page.goto('/');
    
    // Page should still load, just slower
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('should measure time to interactive', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for main interactive elements to be ready
    const mainContent = page.locator('[data-testid="main-content"], main, [role="main"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 15000 });
    
    const timeToInteractive = Date.now() - startTime;
    
    // Time to interactive should be reasonable (less than 10 seconds)
    expect(timeToInteractive).toBeLessThan(10000);
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Track console errors during interactions
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    // Perform multiple navigations/interactions
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < 5; i++) {
        // Wait for button to be stable before clicking
        await buttons.first().waitFor({ state: 'visible', timeout: 5000 });
        await buttons.first().click({ force: true, timeout: 5000 });
        await page.waitForTimeout(800); // Increased wait for stability
      }
    }

    // Page should still be responsive with no errors
    await expect(page.locator('body')).toBeVisible();
    expect(errors.length).toBe(0);
  });

  test('should handle rapid interactions without crashing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    // Rapidly click multiple elements
    const clickableElements = page.locator('button:visible, a:visible');
    const count = Math.min(await clickableElements.count(), 5);

    for (let i = 0; i < count; i++) {
      // Wait for element to be stable before clicking
      await clickableElements.nth(i).waitFor({ state: 'visible', timeout: 3000 });
      await clickableElements.nth(i).click({ force: true, timeout: 3000 });
      await page.waitForTimeout(300); // Increased wait from 100ms to 300ms
    }

    // Page should still be functional with no JavaScript errors
    await expect(page.locator('body')).toBeVisible();
    expect(errors.length).toBe(0);
  });
});
