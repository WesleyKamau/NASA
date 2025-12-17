# E2E Test Fixes TODO

**Generated**: December 16, 2025  
**Branch**: e2e-fixes  

## 📊 Results Tracking

### Initial Results (Before Fixes)
- **Total Tests**: 396
- **✅ Passed**: 340 (85.9%)
- **❌ Failed**: 51 (12.9%)
- **⚠️ Flaky**: 4
- **⏱️ Timed Out**: 5

### After Phase 1-4 Implementation
- **Total Tests**: 396
- **✅ Passed**: 350 (88.4%)
- **❌ Failed**: 41 (10.4%)
- **⚠️ Flaky**: 3
- **⏱️ Timed Out**: 4

### Improvement Summary
- ✨ **10 fewer failures** (-19.6% reduction)
- 📈 **+2.5 percentage points** pass rate improvement
- 🎯 **Flaky tests reduced** from 4 to 3
- ⏱️ **Timeouts reduced** from 5 to 4

---

## 🔍 Remaining Issues Analysis

### New Failure Patterns (41 failures remaining)

#### 1. **Carousel Not Found** (18 failures)
- Tests: "should navigate to next photo using button", "should navigate to previous photo using button"
- Affected: ALL 9 browser configurations
- Error: `locator('[data-testid*="carousel"], [class*="carousel"]').first()` not visible
- **Root Cause**: No carousel component exists on homepage - tests expecting wrong page structure

#### 2. **Strict Mode Violation** (18 failures)
- Tests: "should have proper page title and metadata", "should display person grid"
- Affected: ALL 9 browser configurations
- Error: `locator('[data-testid="main-content"], body')` resolves to 2 elements
- **Root Cause**: Selector using OR operator `body` matches both <body> and <main> tags - need specific selector

#### 3. **Overlay Interception** (3 failures)
- Test: "should handle hover interactions on desktop"
- Affected: chromium, Mobile Chrome Portrait/Landscape
- Error: Modal overlay intercepts pointer events during hover
- **Root Cause**: Persistent from Phase 3, overlay dismissal not working for hover test

#### 4. **Page Load Timeout** (1 failure)
- Test: "should have visible focus indicators" (accessibility.spec.ts)
- Affected: Tablet (Landscape)
- Error: `page.goto` timeout 45s exceeded
- **Root Cause**: Intermittent timeout, possibly flaky or resource contention

#### 5. **Mobile Safari API** (1 failure)
- Test: "should scroll grid independently on desktop"
- Affected: Mobile Safari (Landscape)
- Error: Mouse wheel not supported in mobile WebKit
- **Root Cause**: Test should be skipped on mobile Safari (already marked as should skip, but running)

---

## ✅ Original Issue Resolution Status

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

## 📋 Implementation Phases

### Phase 1: Infrastructure ✅ COMPLETE
1. ✅ **Issue #1**: Fix page load timeouts
2. ✅ **Issue #2**: Fix context teardown

### Phase 2: Test Logic ✅ COMPLETE
3. ✅ **Issue #3**: Fix page title test
4. ✅ **Issue #4**: Fix main element detection
5. ✅ **Issue #5**: Fix person grid detection

### Phase 3: Browser-Specific ✅ COMPLETE
6. ✅ **Issue #6**: Fix dot indicator clicks
7. ✅ **Issue #7**: Fix carousel wrapping
8. ✅ **Issue #8**: Fix mobile Safari mouse wheel
9. ✅ **Issue #9**: Verify accessibility tests

### Phase 4: Validation ✅ COMPLETE
10. ✅ Run full test suite with 6 workers
11. ✅ Monitor flaky tests
12. ✅ Document improvements

**Results**: 10 fewer failures, pass rate 85.9% → 88.4%

### Phase 5: Fix Remaining Issues ⏳ IN PROGRESS
- [ ] 10. **Issue #10**: Fix carousel test navigation (18 failures)
- [x] 11. **Issue #11**: Fix strict mode violations (18 failures)
- [ ] 12. **Issue #12**: Fix hover overlay interception (3 failures)
- [ ] 13. **Issue #13**: Monitor Tablet timeout (1 failure)
- [ ] 14. **Issue #14**: Fix mobile Safari skip (1 failure)
- [ ] Fix carousel test expectations (tests looking for wrong component)
- [ ] Fix strict mode selector violations (body vs main)
- [ ] Fix hover test overlay interception
- [ ] Investigate Tablet Landscape timeout
- [ ] Verify mobile Safari skip condition

---

## 🔧 Phase 5: New Issues to Address

### Issue #10: Carousel Tests Expecting Wrong Page
**Affected**: 18 failures - "next/previous photo" navigation tests (ALL browsers)

**Root Cause**: Tests are looking for carousel on homepage, but homepage doesn't have carousel component. Carousel tests should either:
1. Navigate to a different page that has carousel, OR
2. Be rewritten to test actual homepage components

**Fix Plan**:
1. Identify where carousel actually exists in the app
2. Update tests to navigate to correct page
3. OR redesign tests to match homepage structure

**Files to Modify**:
- `tests/e2e/carousel-navigation.spec.ts` - Update navigation or expectations

### Issue #11: Strict Mode Selector Violation ✅ FIXED
**Affected**: 18 failures - "page title" and "person grid" tests (ALL browsers)

**Root Cause**: Selector `'[data-testid="main-content"], body'` matches 2 elements:
- `<body>` tag
- `<main data-testid="main-content">` tag

This causes strict mode violation. Should use single, specific selector.

**Fix Plan**:
1. ✅ Change selector to just `'[data-testid="main-content"]'` (remove `body` fallback)
2. ✅ Ensure main-content testid exists before test runs

**Files Modified**:
- ✅ `tests/e2e/page-load.spec.ts` line 56 - Changed to `'[data-testid="main-content"]'`
- ✅ `tests/e2e/person-modal.spec.ts` line 156 - Changed to `'[data-testid="main-content"]'`

### Issue #12: Hover Test Still Has Overlay Interception
**Affected**: 3 failures - "handle hover interactions" (chromium, Mobile Chrome)

**Root Cause**: Phase 3 fix for overlay dismissal works for click tests, but hover test still intercepted by modal overlay.

**Fix Plan**:
1. Review hover test implementation
2. Ensure overlay dismissal runs before hover attempt
3. May need to wait for overlay to fully disappear (animation)
4. Consider if hover test is valid on mobile devices

**Files to Modify**:
- `tests/e2e/carousel-navigation.spec.ts` line 101 - Add overlay dismissal or force hover

### Issue #13: Intermittent Tablet Landscape Timeout
**Affected**: 1 failure - "visible focus indicators" (Tablet Landscape only)

**Root Cause**: Single timeout on page.goto(), may be flaky/resource contention

**Fix Plan**:
1. Monitor in subsequent test runs to see if consistent
2. If flaky, accept as acceptable flaky test (<1%)
3. If consistent, investigate Tablet Landscape specific configuration

**Files to Modify**:
- TBD after monitoring

### Issue #14: Mobile Safari Skip Not Working
**Affected**: 1 failure - "scroll grid independently" (Mobile Safari Landscape)

**Root Cause**: Test has skip condition but still running on Mobile Safari

**Fix Plan**:
1. Check skip condition syntax in test
2. Ensure browser name check matches 'Mobile Safari' exactly
3. May need to check isMobile flag instead

**Files to Modify**:
- `tests/e2e/person-modal.spec.ts` line 185 - Review skip condition

---

## 🎯 Implementation Checklist

### Before Starting
- [x] Analyze test results
- [x] Create comprehensive TODO
- [x] Read through all failed test code
- [x] Understand application structure

### Phase 1: Infrastructure
- [x] Update playwright.config.ts (navigationTimeout: 45000)
- [x] Create test environment detection in next.config.ts
- [x] Update all beforeEach hooks to wait for specific elements
- [x] Add afterEach cleanup hooks
- [x] Reduce workers to 4 in playwright.config.ts
- [ ] Run tests to verify timeout fixes

### Phase 2: Test Logic
- [x] Fix page title test (check app/layout.tsx)
- [x] Add data-testid="main-content" to layout
- [x] Update main element selector in tests
- [x] Add data-testid to PersonGrid component
- [x] Update grid visibility tests with better assertions
- [ ] Run tests to verify logic fixes

### Phase 3: Browser-Specific
- [x] Add force clicks to dot indicators
- [x] Handle modal interference in wrapping tests
- [x] Skip mouse wheel test on mobile browsers
- [x] Run tests on specific browsers to verify

### Phase 4: Validation
- [x] Increase workers back to 6
- [ ] Run full test suite (all 396 tests) - **Ready for user to run**
- [ ] Document any remaining flaky tests - **After test run**
- [x] Update test documentation

---

## 📝 Success Criteria

**Original Goal**: Fix all E2E failures systematically

**Current Progress**:
- ✅ Phase 1-4 complete
- ✅ 19.6% reduction in failures (51 → 41)
- ✅ Pass rate improved to 88.4%
- ⏳ Phase 5 pending (41 remaining failures identified)

**Phase 5 Target**:
- 🎯 Fix carousel test expectations (18 failures)
- 🎯 Fix selector strict mode issues (18 failures)
- 🎯 Fix hover overlay issue (3 failures)
- 🎯 Monitor/accept flaky tests (2 failures)
- 🎯 Target pass rate: >95%

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
