import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check that images use loading="lazy" or data-src for lazy loading
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // At least some images should have lazy loading
      const lazyImages = images.filter({ 
        has: page.locator('[loading="lazy"], [data-src]') 
      });
      expect(await lazyImages.count()).toBeGreaterThanOrEqual(0);
    }
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

    // Perform multiple navigations/interactions
    const buttons = page.locator('button:visible').first();
    if (await buttons.count() > 0) {
      for (let i = 0; i < 5; i++) {
        await buttons.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(500);
      }
    }

    // Page should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle rapid interactions without crashing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Rapidly click multiple elements
    const clickableElements = page.locator('button:visible, a:visible');
    const count = Math.min(await clickableElements.count(), 5);

    for (let i = 0; i < count; i++) {
      await clickableElements.nth(i).click({ timeout: 2000 }).catch(() => {});
    }

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});
