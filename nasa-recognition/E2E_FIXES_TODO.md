# E2E Test Fixes TODO

**Generated**: December 16, 2025  
**Branch**: e2e-fixes  
**Total Failures**: 51 tests (12.9% of 396 total tests)  
**Flaky Tests**: 4 (passed on retry)

---

## 📊 Failure Categories

### 1. **Timeout Issues** (12 occurrences)
- Tests timing out during navigation or waiting for networkidle
- Main cause of cascade failures

### 2. **Assertion Failures** (37 occurrences)  
- Expected elements not visible
- Incorrect metadata values
- Browser-specific compatibility issues

### 3. **Other Errors** (20 occurrences)
- Browser context teardown issues
- Mobile-specific API limitations
- ZIP file corruption in traces

---

## 🔧 Fix Priority List

### 🚨 CRITICAL - Infrastructure Issues

#### ❌ Issue #1: Page Load Timeouts
**Affected Tests**: 
- `carousel-navigation.spec.ts` → "should navigate to next photo using button" (ALL 9 browsers)
- `carousel-navigation.spec.ts` → "should navigate to previous photo using button" (ALL 9 browsers)
- `accessibility.spec.ts` → 3 tests (chromium only)

**Root Cause**: `page.goto('/')` and `waitForLoadState('networkidle')` timing out after 30s

**Symptoms**:
```
TimeoutError: page.goto: Timeout 30000ms exceeded.
TimeoutError: page.waitForLoadState: Timeout 30000ms exceeded.
```

**Hypothesis**:
- Dev server may be slow to respond
- Fast Refresh rebuilding during tests (seen in browser logs)
- Too many concurrent workers overwhelming localhost
- networkidle condition never met due to ongoing HMR/WebSocket connections

**Fix Plan**:
1. Increase navigation timeout to 45s or 60s
2. Wait for specific elements instead of networkidle
3. Disable HMR in test environment
4. Reduce workers from 6 to 4 during troubleshooting
5. Add explicit wait for loading animation to disappear

**Files to Modify**:
- `playwright.config.ts` - Increase navigationTimeout
- All test files - Replace networkidle with specific element waits
- `next.config.ts` - Add test mode to disable HMR

---

#### ❌ Issue #2: Context Teardown Timeout
**Affected Tests**: Multiple across all suites

**Symptoms**:
```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
Error: browserContext.close: Target page, context or browser has been closed
```

**Root Cause**: Tests timing out causes cleanup to also timeout

**Fix Plan**:
1. Fix Issue #1 first (primary cause)
2. Add `await page.close()` in test afterEach hooks
3. Ensure all async operations complete before test ends

**Files to Modify**:
- All test files - Add proper cleanup in afterEach

---

### 🔴 HIGH PRIORITY - Test Logic Errors

#### ❌ Issue #3: Incorrect Page Title Expectation
**Affected Tests**: `page-load.spec.ts` → "should have proper page title and metadata" (ALL 9 browsers)

**Current Behavior**: Title is "MSFC Book of Faces"  
**Test Expects**: /NASA|Recognition/i

**Fix Plan**:
1. Check actual title in app/layout.tsx
2. Update test to match actual title OR
3. Update app title to match test expectation

**Files to Modify**:
- `tests/e2e/page-load.spec.ts` (line 48) - Update title regex
- OR `app/layout.tsx` - Update title metadata

---

#### ❌ Issue #4: Main Element Not Found After Loading
**Affected Tests**: `page-load.spec.ts` → "should display loading animation initially" (chromium, Tablet Landscape)

**Symptoms**:
```
Error: expect(locator).toBeVisible() failed
Locator: locator('main, [role="main"]')
```

**Root Cause**: Either:
- Loading never completes
- Main element doesn't exist/have proper role
- Timing issue (checking too early)

**Fix Plan**:
1. Verify `<main>` element exists in app/layout.tsx
2. Add data-testid for more reliable selection
3. Increase timeout or wait for loading to disappear first

**Files to Modify**:
- `app/layout.tsx` - Add data-testid="main-content" to main element
- `tests/e2e/page-load.spec.ts` - Use data-testid instead of role

---

#### ❌ Issue #5: Person Grid Not Visible
**Affected Tests**: `person-modal.spec.ts` → "should display person grid" (ALL 9 browsers)

**Symptoms**:
```
expect(gridVisible || cardsCount > 0).toBe(true);
// Both conditions false
```

**Root Cause**: 
- Grid not rendered at all OR
- Wrong selectors OR
- Page didn't load properly (cascade from Issue #1)

**Fix Plan**:
1. Fix Issue #1 first
2. Verify grid component has proper data-testid
3. Wait for grid to be visible before counting cards
4. Add better error message to show actual counts

**Files to Modify**:
- `components/PersonGrid.tsx` or `OrganizedPersonGrid.tsx` - Add data-testid
- `tests/e2e/person-modal.spec.ts` (line 155) - Better assertions with debug info

---

### 🟡 MEDIUM PRIORITY - Browser-Specific Issues

#### ❌ Issue #6: Dot Indicator Click Timeout
**Affected Tests**: `carousel-navigation.spec.ts` → "should navigate using dot indicators" (chromium, Mobile Chrome, Tablets)

**Symptoms**:
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
// Element found but click action times out
```

**Root Cause**: Test timeout before click completes (cascade from Issue #1) OR element intercepted by another element

**Fix Plan**:
1. Fix Issue #1 first
2. Add `{ force: true }` to click if element is intercepted
3. Wait for carousel to be ready before clicking dots
4. Check if dots exist (some carousels may only have 1 photo)

**Files to Modify**:
- `tests/e2e/carousel-navigation.spec.ts` (line 60) - Add force click or wait

---

#### ❌ Issue #7: Carousel Wrapping Click Timeout
**Affected Tests**: 
- `carousel-navigation.spec.ts` → "should wrap from first to last photo" (Tablets)
- `carousel-navigation.spec.ts` → "should wrap from last to first photo" (Tablet Landscape)

**Symptoms**:
```
TimeoutError: locator.click: Timeout 15000ms exceeded.
// Modal/overlay intercepts pointer events
```

**Root Cause**: Modal or overlay element blocking button clicks

**Fix Plan**:
1. Fix Issue #1 first
2. Close any open modals before testing wrapping
3. Use `{ force: true }` if modal is expected
4. Add wait for modal to close

**Files to Modify**:
- `tests/e2e/carousel-navigation.spec.ts` (lines 178, 199) - Handle modal interference

---

#### ❌ Issue #8: Mobile Safari Mouse Wheel Not Supported
**Affected Tests**: `person-modal.spec.ts` → "should scroll grid independently on desktop" (Mobile Safari)

**Symptoms**:
```
Error: mouse.wheel: Mouse wheel is not supported in mobile WebKit
```

**Root Cause**: Test uses mouse.wheel() API which doesn't exist on mobile

**Fix Plan**:
1. Skip this test on mobile browsers (it's a desktop test anyway)
2. OR use touch gestures on mobile instead
3. Use test.skip() or test.fixme() with browser detection

**Files to Modify**:
- `tests/e2e/person-modal.spec.ts` (line 185) - Skip on mobile or use alternative

---

#### ❌ Issue #9: Accessibility Test Timeouts (Chromium Only)
**Affected Tests**: 
- "should have proper ARIA roles"
- "should support Enter key to activate buttons"  
- "should support Shift+Tab for reverse navigation"

**Root Cause**: Same as Issue #1 (page load timeout)

**Fix Plan**: Covered by Issue #1 fix

---

### 🟢 LOW PRIORITY - Flaky Tests

#### ⚠️ Flaky Tests (4 total)
These tests failed initially but passed on retry - monitor after fixing above issues:
- Check if they become stable after Issue #1 fix
- If still flaky, add additional waits or retries

---

## 📋 Systematic Fix Order

### Phase 1: Infrastructure (MUST FIX FIRST)
1. ✅ **Issue #1**: Fix page load timeouts
   - Increase navigationTimeout in config
   - Replace networkidle with specific element waits
   - Disable HMR in test mode
   - Reduce workers to 4 temporarily
   
2. ✅ **Issue #2**: Fix context teardown
   - Add proper cleanup hooks
   - Ensure tests complete properly

### Phase 2: Test Logic (FIX AFTER PHASE 1)
3. ✅ **Issue #3**: Fix page title test
   - Update test expectations to match actual title

4. ✅ **Issue #4**: Fix main element detection
   - Add data-testid to main element
   - Update test selectors

5. ✅ **Issue #5**: Fix person grid detection
   - Add data-testid to grid
   - Improve assertions

### Phase 3: Browser-Specific (FIX AFTER PHASE 2)
6. ✅ **Issue #6**: Fix dot indicator clicks
   - Add force clicks or better waits

7. ✅ **Issue #7**: Fix carousel wrapping
   - Handle modal interference

8. ✅ **Issue #8**: Fix mobile Safari mouse wheel
   - Skip desktop-only tests on mobile

9. ✅ **Issue #9**: Verify accessibility tests
   - Should be fixed by Phase 1

### Phase 4: Monitoring
10. ✅ Run full test suite with 6 workers
11. ✅ Monitor flaky tests
12. ✅ Document any remaining issues

---

## 🎯 Implementation Checklist

### Before Starting
- [x] Analyze test results
- [x] Create comprehensive TODO
- [ ] Read through all failed test code
- [ ] Understand application structure

### Phase 1: Infrastructure
- [ ] Update playwright.config.ts (navigationTimeout: 45000)
- [ ] Create test environment detection in next.config.ts
- [ ] Update all beforeEach hooks to wait for specific elements
- [ ] Add afterEach cleanup hooks
- [ ] Reduce workers to 4 in playwright.config.ts
- [ ] Run tests to verify timeout fixes

### Phase 2: Test Logic
- [ ] Fix page title test (check app/layout.tsx)
- [ ] Add data-testid="main-content" to layout
- [ ] Update main element selector in tests
- [ ] Add data-testid to PersonGrid component
- [ ] Update grid visibility tests with better assertions
- [ ] Run tests to verify logic fixes

### Phase 3: Browser-Specific
- [ ] Add force clicks to dot indicators
- [ ] Handle modal interference in wrapping tests
- [ ] Skip mouse wheel test on mobile browsers
- [ ] Run tests on specific browsers to verify

### Phase 4: Validation
- [ ] Increase workers back to 6
- [ ] Run full test suite (all 396 tests)
- [ ] Document any remaining flaky tests
- [ ] Update test documentation

---

## 📝 Success Criteria

- ✅ All 396 tests pass consistently
- ✅ No timeout errors
- ✅ No browser-specific failures
- ✅ Flaky tests rate < 1%
- ✅ Tests complete in < 30 minutes with 6 workers

---

## 🔍 Notes for Debugging

### Browser Logs Show:
- Fast Refresh rebuilding during tests (BAD - causes timeouts)
- WebGL warnings (not critical, can suppress)
- Images loading successfully (GOOD)
- Rocket animation working (GOOD)
- No JavaScript runtime errors (GOOD)

### Key Observations:
1. Most failures are cascading from Issue #1 (timeout)
2. Only 4 tests are truly flaky (< 1% - acceptable)
3. Mobile Safari has API limitation (expected, needs skip)
4. Page title mismatch is trivial fix
5. Overall test quality is good - just needs infrastructure tuning

---

## 📚 Resources

- Playwright Config: `playwright.config.ts`
- Test Files: `tests/e2e/*.spec.ts`
- App Layout: `app/layout.tsx`
- Components: `components/*.tsx`
- Failure Report: `E2E_FAILURES_REPORT.md`
- Results JSON: `test-results/results.json`
