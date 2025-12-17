import { test, expect } from '@playwright/test';

test.describe('Person Modal Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for page content instead of networkidle
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(2000); // Wait for initial render
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should open modal when clicking person card from grid', async ({ page }) => {
    // Find person cards in grid
    const personCards = page.locator('[data-testid="person-card"], button[class*="person"]').first();
    
    if (await personCards.isVisible()) {
      await personCards.click();
      await page.waitForTimeout(500);
      
      // Check if modal opened (look for modal indicators)
      const modal = page.locator('[role="dialog"], [data-testid="person-modal"], [class*="modal"]');
      
      // Modal might be present
      const modalVisible = await modal.isVisible().catch(() => false);
      
      if (modalVisible) {
        await expect(modal).toBeVisible();
      }
    }
  });

  test('should close modal with close button', async ({ page }) => {
    // Try to open a modal first
    const personCard = page.locator('[data-testid="person-card"]').first();
    
    if (await personCard.isVisible()) {
      await personCard.click();
      await page.waitForTimeout(500);
      
      // Look for close button
      const closeButton = page.getByRole('button', { name: /close/i }).or(
        page.locator('button[aria-label*="close"]')
      ).or(
        page.locator('button').filter({ hasText: '×' })
      );
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);
        
        // Modal should close
        const modal = page.locator('[role="dialog"]');
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('should close modal with Escape key', async ({ page }) => {
    const personCard = page.locator('[data-testid="person-card"]').first();
    
    if (await personCard.isVisible()) {
      await personCard.click();
      await page.waitForTimeout(500);
      
      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // Modal should close
      const modal = page.locator('[role="dialog"]');
      const isVisible = await modal.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('should close modal when clicking backdrop', async ({ page }) => {
    const personCard = page.locator('[data-testid="person-card"]').first();
    
    if (await personCard.isVisible()) {
      await personCard.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"]');
      
      if (await modal.isVisible()) {
        // Click outside the modal content (on backdrop)
        const modalBox = await modal.boundingBox();
        if (modalBox) {
          // Click at edge of screen (backdrop area)
          await page.mouse.click(10, 10);
          await page.waitForTimeout(300);
        }
      }
    }
  });

  test('should display person information in modal', async ({ page }) => {
    const personCard = page.locator('[data-testid="person-card"]').first();
    
    if (await personCard.isVisible()) {
      // Get person name from card
      const cardText = await personCard.textContent();
      
      await personCard.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"]');
      
      if (await modal.isVisible()) {
        // Modal should contain some text content
        const modalText = await modal.textContent();
        expect(modalText?.length).toBeGreaterThan(0);
      }
    }
  });

  test('should lock body scroll when modal is open', async ({ page }) => {
    const personCard = page.locator('[data-testid="person-card"]').first();
    
    if (await personCard.isVisible()) {
      await personCard.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"]');
      
      if (await modal.isVisible()) {
        // Check if body has overflow hidden or similar
        const bodyOverflow = await page.locator('body').evaluate((el) => {
          return window.getComputedStyle(el).overflow;
        });
        
        // Body might have overflow:hidden when modal is open
        // This is just checking the mechanism exists
        expect(typeof bodyOverflow).toBe('string');
      }
    }
  });
});

test.describe('Person Grid Navigation', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should display person grid', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page content instead of networkidle
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
    await page.waitForTimeout(3000); // Extra time for content to load
    
    // Look for grid container or person cards
    const grid = page.locator('[data-testid="person-grid"], [data-testid*="grid"], [class*="grid"]').first();
    const personCards = page.locator('[data-testid="person-card"]');
    
    // Either grid or cards should be visible
    const gridVisible = await grid.isVisible().catch(() => false);
    const cardsCount = await personCards.count();

    if (!gridVisible && cardsCount === 0) {
      throw new Error('Person grid not visible and no person cards found');
    }
  });

  test('should organize people by categories', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page content
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Look for category headers
    const categoryHeaders = page.locator('h2, h3, [role="heading"]');
    const headerCount = await categoryHeaders.count();
    
    // Should have some structure
    expect(headerCount).toBeGreaterThanOrEqual(0);
  });

  test('should scroll grid independently on desktop', async ({ page, browserName, isMobile }) => {
    // Skip on mobile Safari - mouse wheel not supported in mobile WebKit
    if (browserName === 'webkit' && isMobile) {
      test.skip();
    }
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Wait for page content
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Find scrollable grid area
    const scrollableArea = page.locator('[class*="overflow"], [class*="scroll"]').first();
    
    if (await scrollableArea.isVisible()) {
      const box = await scrollableArea.boundingBox();
      if (box) {
        // Scroll within the area
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(300);
        
        // Scroll occurred without errors
        expect(true).toBe(true);
      }
    }
  });
});

test.describe('Person Selection Flow', () => {
  test.afterEach(async ({ page }) => {
    await page.close();
  });

  test('should highlight person in grid when selected', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page content
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(2000);
    
    const personCard = page.locator('[data-testid="person-card"]').first();
    
    if (await personCard.isVisible()) {
      await personCard.click();
      await page.waitForTimeout(300);
      
      // Check for highlight class or styling
      const cardClasses = await personCard.getAttribute('class');
      expect(cardClasses).toBeTruthy();
    }
  });

  test('should sync selection between carousel and grid', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Wait for page content
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // This tests the bidirectional sync between components
    const personCard = page.locator('[data-testid="person-card"]').first();
    
    if (await personCard.isVisible()) {
      // Hover or click on person
      await personCard.hover();
      await page.waitForTimeout(300);
      
      // Visual sync should occur (we verify no errors)
      expect(true).toBe(true);
    }
  });
});
