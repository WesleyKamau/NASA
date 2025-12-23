# E2E Test Failures Report

*Generated: E2E_FAILURES_REPORT*

## 📊 Summary Statistics

- **Total Tests**: 774
- **✅ Passed**: 680 (87.9%)
- **❌ Failed**: 78 (10.1%)
- **⚠️ Flaky** (passed on retry): 14
- **⏱️ Timed Out**: 9
- **⏭️ Skipped**: 7

## 🔍 Error Patterns

- **Assertion**: 48 occurrences
- **Timeout**: 29 occurrences
- **Other**: 9 occurrences
- **Locator**: 1 occurrences

## 🌐 Failures by Browser/Device

### Mobile Chrome (Landscape) (6 failures)

### Mobile Chrome (Portrait) (8 failures)

### Mobile Safari (Landscape) (9 failures)

### Mobile Safari (Portrait) (9 failures)

### Tablet (Landscape) (7 failures)

### Tablet (Portrait) (8 failures)

### chromium (13 failures)

### firefox (10 failures)

### webkit (8 failures)


## 📋 Detailed Failures

### ❌ should handle hover interactions on desktop

**File**: `carousel-navigation.spec.ts`

**Failed on**: Mobile Chrome (Portrait)

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
[2m    2 × waiting for element to be visible and stable[22m
[2m      - element is visible and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950"></div> from <div class="fixed inset-0 z-50 transition-opacity duration-500 opacity-100">…</div> subtree intercepts pointer events[22m
[2m    - retrying hover action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible and stable[22m
[2m    - element is visible and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - performing hover action[22m


  115 |     if (await personCards.first().isVisible()) {
  116 |       // Hover over first person card
> 117 |       await personCards.first().hover();
      |                                 ^
  118 |       await page.waitForTimeout(300);
  119 |       
  120 |       // Some visual feedback should occur (we're just checking no errors)
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:117:33
```

---

### ❌ should handle keyboard navigation with arrow keys

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium

**Error Details**:

```
TimeoutError: page.goto: Timeout 45000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  4 |   test.beforeEach(async ({ page }) => {
  5 |     await page.setViewportSize({ width: 1920, height: 1080 });
> 6 |     await page.goto('/');
    |                ^
  7 |     
  8 |     // Wait for page content instead of networkidle
  9 |     await expect(page.locator('body')).toBeVisible();
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:6:16
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: End of central directory record signature not found. Either not a zip file, or file is truncated.
```

---

### ❌ should navigate to next photo using button

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium

**Error Details**:

```
TimeoutError: page.goto: Timeout 45000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  4 |   test.beforeEach(async ({ page }) => {
  5 |     await page.setViewportSize({ width: 1920, height: 1080 });
> 6 |     await page.goto('/');
    |                ^
  7 |     
  8 |     // Wait for page content instead of networkidle
  9 |     await expect(page.locator('body')).toBeVisible();
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:6:16
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: End of central directory record signature not found. Either not a zip file, or file is truncated.
```

---

### ❌ should navigate to previous photo using button

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium

**Error Details**:

```
TimeoutError: page.goto: Timeout 45000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  4 |   test.beforeEach(async ({ page }) => {
  5 |     await page.setViewportSize({ width: 1920, height: 1080 });
> 6 |     await page.goto('/');
    |                ^
  7 |     
  8 |     // Wait for page content instead of networkidle
  9 |     await expect(page.locator('body')).toBeVisible();
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:6:16
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: apiRequestContext._wrapApiCall: Test ended.
```

---

### ❌ should navigate using dot indicators

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium

**Error Details**:

```
TimeoutError: page.goto: Timeout 45000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  4 |   test.beforeEach(async ({ page }) => {
  5 |     await page.setViewportSize({ width: 1920, height: 1080 });
> 6 |     await page.goto('/');
    |                ^
  7 |     
  8 |     // Wait for page content instead of networkidle
  9 |     await expect(page.locator('body')).toBeVisible();
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:6:16
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: apiRequestContext._wrapApiCall: Test ended.
```

---

### ❌ should handle rapid user interactions

**File**: `edge-cases.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait)

**Error Details**:

```
TimeoutError: locator.click: Timeout 1000ms exceeded.
Call log:
[2m  - waiting for locator('button:visible').first()[22m
[2m    - locator resolved to <button class="absolute inset-0 group" aria-label="View Dr. Vemitra White-Alexander">…</button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m


  79 |       for (let i = 0; i < 6; i++) {
  80 |         const randomIndex = Math.floor(Math.random() * buttonCount);
> 81 |         await buttons.nth(randomIndex).click({ timeout: 1000 });
     |                                        ^
  82 |         await page.waitForTimeout(100);
  83 |       }
  84 |     }
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\edge-cases.spec.ts:81:40
```

---

### ❌ should handle long-press behaviors appropriately

**File**: `mobile-gestures.spec.ts`

**Failed on**: firefox

**Error Details**:

```
Error: locator.dispatchEvent: TouchEvent is not defined
dispatchEvent@debugger eval code:7469:11
@debugger eval code line 6669 > eval:2:22
@debugger eval code line 290 > eval:9:51
evaluate@debugger eval code:292:16
@debugger eval code:1:44

Call log:
[2m  - waiting for locator('button:visible').first()[22m

    at dispatchEvent@debugger eval code:7469:11
    at @debugger eval code line 6669 > eval:2:22
    at @debugger eval code line 290 > eval:9:51
    at evaluate@debugger eval code:292:16
    at @debugger eval code:1:44
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\mobile-gestures.spec.ts:161:20
```

---

### ❌ should have adequate touch target sizes

**File**: `mobile-gestures.spec.ts`

**Failed on**: chromium, firefox, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThanOrEqual[2m([22m[32mexpected[39m[2m)[22m

Expected: >= [32m32[39m
Received:    [31m29.109375[39m

  68 |       if (box) {
  69 |         // Allow for smaller buttons but ensure they're at least tappable (32x32 minimum)
> 70 |         expect(box.width).toBeGreaterThanOrEqual(32);
     |                           ^
  71 |         expect(box.height).toBeGreaterThanOrEqual(32);
  72 |       }
  73 |     }
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\mobile-gestures.spec.ts:70:27
```

---

### ❌ should prevent double-tap zoom on interactive elements

**File**: `mobile-gestures.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoContain[2m([22m[32mexpected[39m[2m) // indexOf[22m

Expected value: [32m"auto"[39m
Received array: [31m["manipulation", "none", "pan-x", "pan-y"][39m

  142 |
  143 |       // Should have touch-action set to prevent unwanted behaviors
> 144 |       expect(['manipulation', 'none', 'pan-x', 'pan-y']).toContain(touchAction);
      |                                                          ^
  145 |     }
  146 |   });
  147 |
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\mobile-gestures.spec.ts:144:58
```

---

### ❌ should handle rapid interactions without crashing

**File**: `performance.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
TimeoutError: locator.click: Timeout 2000ms exceeded.
Call log:
[2m  - waiting for locator('button:visible, a:visible').first()[22m
[2m    - locator resolved to <button class="absolute inset-0 group" aria-label="View Wesley Kamau">…</button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m


  88 |
  89 |     for (let i = 0; i < count; i++) {
> 90 |       await clickableElements.nth(i).click({ timeout: 2000 });
     |                                      ^
  91 |       await page.waitForTimeout(100);
  92 |     }
  93 |
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\performance.spec.ts:90:38
```

---

### ❌ should lazy load images

**File**: `performance.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeGreaterThan[2m([22m[32mexpected[39m[2m)[22m

Expected: > [32m51[39m
Received:   [31m0[39m

  20 |     const lazyImages = page.locator('img[loading="lazy"]');
  21 |     const lazyCount = await lazyImages.count();
> 22 |     expect(lazyCount).toBeGreaterThan(imageCount * 0.5);
     |                       ^
  23 |   });
  24 |
  25 |   test('should handle network throttling gracefully', async ({ page, context }) => {
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\performance.spec.ts:22:23
```

---

### ❌ should not have memory leaks during navigation

**File**: `performance.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
TimeoutError: locator.click: Timeout 5000ms exceeded.
Call log:
[2m  - waiting for locator('button:visible').first()[22m
[2m    - locator resolved to <button aria-label="View Pi Day!!" class="transition-all duration-300 rounded-full bg-white/80 w-3 h-3"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m  - element was detached from the DOM, retrying[22m
[2m    - locator resolved to <button class="absolute inset-0 group" aria-label="View Cassandra Gideon">…</button>[22m


  66 |     if (buttonCount > 0) {
  67 |       for (let i = 0; i < 5; i++) {
> 68 |         await buttons.first().click({ timeout: 5000 });
     |                               ^
  69 |         await page.waitForTimeout(500);
  70 |       }
  71 |     }
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\performance.spec.ts:68:31
```

---

### ❌ should have canonical URL

**File**: `seo.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveCount[2m([22m[32mexpected[39m[2m)[22m failed

Locator:  locator('link[rel="canonical"]')
Expected: [32m1[39m
Received: [31m0[39m
Timeout:  10000ms

Call log:
[2m  - Expect "toHaveCount" with timeout 10000ms[22m
[2m  - waiting for locator('link[rel="canonical"]')[22m
[2m    10 × locator resolved to 0 elements[22m
[2m       - unexpected value "0"[22m


  67 |     
  68 |     // Should have exactly one canonical tag
> 69 |     await expect(canonical).toHaveCount(1);
     |                             ^
  70 |     
  71 |     const href = await canonical.getAttribute('href');
  72 |     expect(href).toBeTruthy();
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\seo.spec.ts:69:29
```

---

### ❌ should have robots meta tag or robots.txt

**File**: `seo.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

   96 |
   97 |     // Should have at least one
>  98 |     expect(hasRobotsMeta || hasRobotsTxt).toBeTruthy();
      |                                           ^
   99 |   });
  100 | });
  101 |
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\seo.spec.ts:98:43
```

---

### ❌ should have structured data (JSON-LD)

**File**: `seo.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoHaveCount[2m([22m[32mexpected[39m[2m)[22m failed

Locator:  locator('script[type="application/ld+json"]')
Expected: [32m1[39m
Received: [31m0[39m
Timeout:  10000ms

Call log:
[2m  - Expect "toHaveCount" with timeout 10000ms[22m
[2m  - waiting for locator('script[type="application/ld+json"]')[22m
[2m    10 × locator resolved to 0 elements[22m
[2m       - unexpected value "0"[22m


  42 |     
  43 |     // Should have at least one JSON-LD script
> 44 |     await expect(jsonLd).toHaveCount(1);
     |                          ^
  45 |     
  46 |     const content = await jsonLd.first().textContent();
  47 |     expect(content).toBeTruthy();
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\seo.spec.ts:44:26
```

---

## 🎯 Next Steps

1. Review each failure above
2. Check if failures are consistent across browsers
3. Examine error patterns for common root causes
4. Update tests or fix application code
5. Re-run tests to verify fixes
