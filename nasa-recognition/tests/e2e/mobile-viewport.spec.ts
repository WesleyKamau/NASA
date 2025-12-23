import { test, expect } from '@playwright/test';

test.describe('Mobile Viewport Tests', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should handle iOS Safari specific quirks', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check for iOS-specific meta tags
    const appleMobileWebAppTitle = page.locator('meta[name="apple-mobile-web-app-title"]');
    await expect(appleMobileWebAppTitle).toHaveCount(1);

    const appleMobileWebAppCapable = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(appleMobileWebAppCapable).toHaveCount(1);

    const appleStatusBarStyle = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    await expect(appleStatusBarStyle).toHaveCount(1);
  });

  test('should handle Android Chrome specific behaviors', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 851 }); // Pixel 5 dimensions
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check for theme-color meta tag (important for Android)
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveCount(1);

    const color = await themeColor.getAttribute('content');
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should handle virtual keyboard interactions', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 Pro
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Find input fields if they exist
    const inputs = page.locator('input:visible, textarea:visible');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      const input = inputs.first();
      
      // Focus on input (simulates keyboard appearance)
      await input.focus();
      await page.waitForTimeout(300);

      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
      
      // Input should maintain focus
      const isFocused = await input.evaluate(el => document.activeElement === el);
      expect(isFocused).toBe(true);
    }
  });

  test('should handle viewport height changes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 Pro
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Get initial viewport height
    const initialHeight = await page.evaluate(() => window.innerHeight);
    expect(initialHeight).toBeGreaterThan(0);

    // Simulate viewport height change (like when keyboard appears)
    await page.setViewportSize({ width: 390, height: 400 });
    await page.waitForTimeout(300);

    // Page should still be functional with reduced viewport
    await expect(page.locator('body')).toBeVisible();

    // Restore viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle fixed positioning with mobile chrome', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 Pro
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check if there are fixed position elements
    const fixedElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const fixed = Array.from(allElements).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed';
      });
      return fixed.length;
    });

    if (fixedElements > 0) {
      // Scroll the page
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      // Fixed elements should remain visible
      const stillFixed = await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        return Array.from(allElements).some(el => {
          const style = window.getComputedStyle(el);
          return style.position === 'fixed';
        });
      });

      expect(stillFixed).toBe(true);
    }
  });

  test('should use CSS custom properties for viewport units', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 Pro
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check if app uses viewport height custom property
    const usesViewportVar = await page.evaluate(() => {
      // Check for --vh or similar custom property usage
      const styles = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules || []);
          } catch {
            return [];
          }
        })
        .map(rule => rule.cssText)
        .join(' ');
      
      return styles.includes('--vh') || 
             styles.includes('var(--viewport') ||
             styles.includes('dvh') ||
             styles.includes('svh') ||
             styles.includes('lvh');
    });

    // Should use viewport height handling
    expect(usesViewportVar).toBe(true);
  });

  test('should prevent horizontal scrolling on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 Pro
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check document width doesn't exceed viewport
    const scrollInfo = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
    }));

    // Should not have horizontal scrolling
    expect(scrollInfo.hasHorizontalScroll).toBe(false);
  });

  test('should handle touch events without delays', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13 Pro
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Check if touch-action is properly set to prevent delays
    const bodyTouchAction = await page.evaluate(() => {
      return window.getComputedStyle(document.body).touchAction;
    });

    // Should have touch-action set to prevent 300ms delay
    expect(['manipulation', 'none', 'pan-x', 'pan-y', 'pan-x pan-y']).toContain(bodyTouchAction);
  });

  test('should adapt to small mobile screens', async ({ page }) => {
    // Test with very small device (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Content should be visible and not cut off
    const bodyBox = await page.locator('body').boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(375); // iPhone SE width
    
    // Should not have layout overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('should handle landscape mode properly', async ({ page }) => {
    // Set to landscape
    await page.setViewportSize({ width: 844, height: 390 }); // iPhone 13 Pro landscape
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();

    // Should adapt layout for landscape
    const dimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      isLandscape: window.innerWidth > window.innerHeight,
    }));

    expect(dimensions.isLandscape).toBe(true);
    
    // Content should still be accessible
    await expect(page.locator('body')).toBeVisible();
  });
});
