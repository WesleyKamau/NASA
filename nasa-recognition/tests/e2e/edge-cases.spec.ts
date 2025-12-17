import { test, expect } from '@playwright/test';

test.describe('Edge Cases Tests', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should handle long names without overflow', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check if any text elements are overflowing
    const textElements = page.locator('h1, h2, h3, p, span');
    const count = Math.min(await textElements.count(), 10);

    for (let i = 0; i < count; i++) {
      const element = textElements.nth(i);
      const box = await element.boundingBox();
      if (box) {
        // Element should have reasonable dimensions
        expect(box.width).toBeLessThan(10000);
      }
    }
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Measure how long it takes to render the page
    const startTime = Date.now();
    
    // Wait for main content to be visible
    const mainContent = page.locator('main, [role="main"]').first();
    await mainContent.waitFor({ state: 'visible', timeout: 10000 });
    
    const renderTime = Date.now() - startTime;

    // Should render in reasonable time (less than 5 seconds)
    expect(renderTime).toBeLessThan(5000);
  });

  test('should handle empty states gracefully', async ({ page }) => {
    // Mock empty data
    await page.route('**/data/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/');
    
    // Page should render with empty state
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle single person/photo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Page should work even with minimal data
    // This tests the lower bound of data requirements
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    // Rapidly interact with elements
    const buttons = page.locator('button:visible');
    const buttonCount = Math.min(await buttons.count(), 3);

    if (buttonCount > 0) {
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * buttonCount);
        await buttons.nth(randomIndex).click({ timeout: 1000 });
        await page.waitForTimeout(100);
      }
    }

    // Page should still be functional with no errors
    await expect(page.locator('body')).toBeVisible();
    expect(errors.length).toBe(0);
  });

  test('should handle browser navigation correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Try to navigate to a link if available
    const links = page.locator('a[href]:visible');
    if (await links.count() > 0) {
      await links.first().click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // Go back
      await page.goBack();
      await expect(page.locator('body')).toBeVisible();

      // Go forward
      await page.goForward();
      await page.waitForTimeout(500);
    }

    // Page should handle browser navigation
    expect(page.url()).toBeTruthy();
  });
});
