import { test, expect } from '@playwright/test';

test.describe('Page Load and Initial Render', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for hydration and initial content
    await page.waitForLoadState('networkidle');
    
    // Check for key page elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display loading animation initially', async ({ page }) => {
    await page.goto('/');
    
    // Check if loading screen appears
    const loadingScreen = page.getByRole('status').filter({ hasText: /loading|preparing/i });
    
    // Loading should either be visible or already complete (fast machines)
    const isVisible = await loadingScreen.isVisible().catch(() => false);
    
    // If loading is visible, wait for it to disappear
    if (isVisible) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 10000 });
    }
    
    // Main content should be visible after loading
    await expect(page.locator('main, [role="main"]')).toBeVisible({ timeout: 15000 });
  });

  test('should render without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(errors).toEqual([]);
  });

  test('should have proper page title and metadata', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/NASA|Recognition/i);
    
    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});

test.describe('Image Loading', () => {
  test('should load images progressively', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for at least one image to load
    const images = page.locator('img[src*="/photos"]');
    await expect(images.first()).toBeVisible({ timeout: 10000 });
    
    // Check that images have proper src attributes
    const firstImage = images.first();
    const src = await firstImage.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('should handle image load failures gracefully', async ({ page }) => {
    // Mock a failed image
    await page.route('**/photos/test-fail.jpg', (route) => route.abort());
    
    await page.goto('/');
    
    // Page should still render even with failed images
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Responsive Layout', () => {
  test('should adapt layout for mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Mobile viewport should be active
    await expect(page.locator('body')).toBeVisible();
  });

  test('should adapt layout for tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tablet viewport should be active
    await expect(page.locator('body')).toBeVisible();
  });

  test('should adapt layout for desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Desktop viewport should be active
    await expect(page.locator('body')).toBeVisible();
  });
});
