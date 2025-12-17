# E2E Test Failures Report

*Generated: E2E_FAILURES_REPORT*

## 📊 Summary Statistics

- **Total Tests**: 396
- **✅ Passed**: 350 (88.4%)
- **❌ Failed**: 41 (10.4%)
- **⚠️ Flaky** (passed on retry): 3
- **⏱️ Timed Out**: 4
- **⏭️ Skipped**: 1

## 🔍 Error Patterns

- **Assertion**: 36 occurrences
- **Timeout**: 4 occurrences
- **Other**: 1 occurrences

## 🌐 Failures by Browser/Device

### Mobile Chrome (Landscape) (5 failures)

### Mobile Chrome (Portrait) (5 failures)

### Mobile Safari (Landscape) (5 failures)

### Mobile Safari (Portrait) (4 failures)

### Tablet (Landscape) (5 failures)

### Tablet (Portrait) (4 failures)

### chromium (5 failures)

### firefox (4 failures)

### webkit (4 failures)


## 📋 Detailed Failures

### ❌ should have visible focus indicators

**File**: `accessibility.spec.ts`

**Failed on**: Tablet (Landscape)

**Error Details**:

```
TimeoutError: page.goto: Timeout 45000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  203 |
  204 |   test('should have visible focus indicators', async ({ page }) => {
> 205 |     await page.goto('/');
      |                ^
  206 |     
  207 |     // Wait for page content
  208 |     await expect(page.locator('body')).toBeVisible();
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\accessibility.spec.ts:205:16
```

---

### ❌ should handle hover interactions on desktop

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium, Mobile Chrome (Portrait), Mobile Chrome (Landscape)

**Error Details**:

```
TimeoutError: locator.hover: Timeout 20000ms exceeded.
Call log:
[2m  - waiting for locator('[data-testid*="person"], [class*="person-card"]').first()[22m
[2m    - locator resolved to <div class="w-full space-y-12" data-testid="person-grid">…</div>[22m
[2m  - attempting hover action[22m
[2m    2 × waiting for element to be visible and stable[22m
[2m      - element is visible and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950"></div> from <div class="fixed inset-0 z-50 transition-opacity duration-500 opacity-100">…</div> subtree intercepts pointer events[22m
[2m    - retrying hover action[22m
[2m    - waiting 20ms[22m


   99 |     if (await personCards.first().isVisible()) {
  100 |       // Hover over first person card
> 101 |       await personCards.first().hover();
      |                                 ^
  102 |       await page.waitForTimeout(300);
  103 |       
  104 |       // Some visual feedback should occur (we're just checking no errors)
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:101:33
```

---

### ❌ should navigate to next photo using button

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[data-testid*="carousel"], [class*="carousel"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('[data-testid*="carousel"], [class*="carousel"]').first()[22m


  18 |     // Wait for carousel to be visible
  19 |     const carousel = page.locator('[data-testid*="carousel"], [class*="carousel"]').first();
> 20 |     await expect(carousel).toBeVisible({ timeout: 10000 });
     |                            ^
  21 |     
  22 |     // Find and click next button
  23 |     const nextButton = page.getByRole('button', { name: /next/i }).or(
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:20:28
```

---

### ❌ should navigate to previous photo using button

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[data-testid*="carousel"], [class*="carousel"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('[data-testid*="carousel"], [class*="carousel"]').first()[22m


  39 |   test('should navigate to previous photo using button', async ({ page }) => {
  40 |     const carousel = page.locator('[data-testid*="carousel"], [class*="carousel"]').first();
> 41 |     await expect(carousel).toBeVisible({ timeout: 10000 });
     |                            ^
  42 |     
  43 |     // Find and click previous button
  44 |     const prevButton = page.getByRole('button', { name: /prev|previous/i }).or(
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:41:28
```

---

### ❌ should have proper page title and metadata

**File**: `page-load.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[data-testid="main-content"], body')
Expected: visible
Error: strict mode violation: locator('[data-testid="main-content"], body') resolved to 2 elements:
    1) <body class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable antialiased touch-native scroll-native no-overscroll">…</body> aka locator('body')
    2) <main role="main" data-testid="main-content">…</main> aka getByTestId('main-content')

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('[data-testid="main-content"], body')[22m


  54 |     
  55 |     // Wait for page to load
> 56 |       await expect(page.locator('[data-testid="main-content"], body')).toBeVisible();
     |                                                                        ^
  57 |     
  58 |     // Check page title
  59 |     await expect(page).toHaveTitle(SITE_CONFIG.title);
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\page-load.spec.ts:56:72
```

---

### ❌ should display person grid

**File**: `person-modal.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('[data-testid="main-content"], body')
Expected: visible
Error: strict mode violation: locator('[data-testid="main-content"], body') resolved to 2 elements:
    1) <body class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable antialiased touch-native scroll-native no-overscroll">…</body> aka locator('body')
    2) <main role="main" data-testid="main-content">…</main> aka getByTestId('main-content')

Call log:
[2m  - Expect "toBeVisible" with timeout 10000ms[22m
[2m  - waiting for locator('[data-testid="main-content"], body')[22m


  154 |     
  155 |     // Wait for page content instead of networkidle
> 156 |     await expect(page.locator('[data-testid="main-content"], body')).toBeVisible();
      |                                                                      ^
  157 |     await page.waitForTimeout(3000); // Extra time for content to load
  158 |     
  159 |     // Look for grid container or person cards
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\person-modal.spec.ts:156:70
```

---

### ❌ should scroll grid independently on desktop

**File**: `person-modal.spec.ts`

**Failed on**: Mobile Safari (Landscape)

**Error Details**:

```
Error: mouse.wheel: Mouse wheel is not supported in mobile WebKit

  206 |         // Scroll within the area
  207 |         await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
> 208 |         await page.mouse.wheel(0, 300);
      |                          ^
  209 |         await page.waitForTimeout(300);
  210 |         
  211 |         // Scroll occurred without errors
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\person-modal.spec.ts:208:26
```

---

## 🎯 Next Steps

1. Review each failure above
2. Check if failures are consistent across browsers
3. Examine error patterns for common root causes
4. Update tests or fix application code
5. Re-run tests to verify fixes
