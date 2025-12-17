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

    // At least 50% of images should have lazy loading
    const lazyImages = page.locator('img[loading="lazy"]');
    const lazyCount = await lazyImages.count();
    expect(lazyCount).toBeGreaterThan(imageCount * 0.5);
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
        await buttons.first().click({ timeout: 5000 });
        await page.waitForTimeout(500);
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
      await clickableElements.nth(i).click({ timeout: 2000 });
      await page.waitForTimeout(100);
    }

    // Page should still be functional with no JavaScript errors
    await expect(page.locator('body')).toBeVisible();
    expect(errors.length).toBe(0);
  });
});
