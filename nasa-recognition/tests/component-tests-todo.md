# Comprehensive Test Plan

This document tracks the complete testing strategy across all phases.

---

## ✅ Phase 1 – Testing Infrastructure (COMPLETE)
**Goal:** Set up Jest, RTL, CI pipeline, and testing utilities

- [x] Jest configuration with Next.js preset
- [x] Jest setup file with mocks (next/image, IntersectionObserver, ResizeObserver, matchMedia)
- [x] Custom render utility with providers
- [x] Path alias mapping (@/)
- [x] GitHub Actions CI workflow
- [x] Coverage configuration

---

## ✅ Phase 2 – Unit Tests: Utilities & Configs (COMPLETE)
**Goal:** Test all lib utilities and configuration modules

- [x] `lib/autoCycleUtils.ts` - Carousel auto-cycle timing calculations (14 tests)
- [x] `lib/carouselUtils.ts` - getPeopleInPhoto, shuffleArray, startAutoCycle (14 tests)
- [x] `lib/configs/*.ts` - All config modules (componentsConfig, siteConfig, rocketConfig, ogConfig)
- [x] `lib/crashLogger.ts` - Logging, pruning, export/clear
- [x] `lib/data.ts` & `lib/data-server.ts` - Data loading and filtering
- [x] `lib/imageLoadQueue.ts` - Queue management and concurrency
- [x] `lib/imageUtils.ts` - Image cropping and dimension calculations
- [x] `lib/preload.ts` - Preload functionality
- [x] `lib/rocketSchedule.ts` - Launch scheduling and subscription
- [x] `lib/scrollManager.ts` - Scroll state tracking (console output suppressed)

**Stats:** 11 test suites, 65 unit tests

---

## ✅ Phase 3 – Component Tests (COMPLETE)
**Goal:** Test all React components with RTL

### Batch 1 – Carousel surface
- [x] `PhotoCarousel` (desktop navigation + hover interactions)
- [x] `CarouselNameTag` (visibility, click handling, mobile overflow shift)
- [x] `CenterIndicator` (focus circle, face highlight, callbacks)

### Batch 2 – Mobile carousel surface
- [x] `MobilePhotoCarousel` (gestures, auto-cycle, navigation)
- [x] `PersonModal` (open/close, escape key, body-scroll locking)

### Batch 3 – Grid & card helpers
- [x] `PersonCard` (name overlay, click handler, highlight state)
- [x] `OrganizedPersonGrid` (click routing vs modal, hover sync, categories)
- [x] `PersonPreview` / `PersonHighlight` (props rendering, cycling, positioning)

### Batch 4 – Supporting pieces
- [x] `Galaxy` / `GalaxyBackground` (props, positioning, accessibility)
- [x] `FloatingRocket` (SVG rendering, animations, positioning)
- [x] `PanGestureHint` (Lottie animation, delay timing, touch/wheel interactions, cleanup)

### Mocks & Test Infrastructure
- [x] `__mocks__/lottie-react.tsx` - Manual mock for Lottie animations
- [x] Jest setup enhancements (window.scrollTo, SVG attribute warnings suppressed)

**Stats:** 12 test suites, 55 component tests
**Total Phase 1-3:** 23 test suites, 120 tests passing ✅

---

## ✅ Phase 4 – Integration Tests (COMPLETE)
**Goal:** Test interactions between multiple components and data flows

### Data Integration Tests
- [x] Data flow between carousel and person components
- [x] Photo navigation updates with correct data
- [x] Category organization in grid layout
- [x] Modal data integration with grid
- [x] Hidden people filtering (Grid filters, Carousel does not - documented)
- [x] Type corrections for individualPhoto (string | null)

### Layout Integration Tests
- [x] Desktop portrait view (carousel + scrollable grid, window.scrollTo mocked)
- [x] Dual column view (carousel + grid sync)
- [x] Mobile portrait view (mobile carousel, scroll console suppressed)
- [x] Mobile landscape view (grid + modal)
- [x] ClientHome wrapper component

### State Management Tests
- [x] Grid-to-carousel bidirectional highlight
- [x] Hover callbacks and synchronization
- [x] Highlight state wrapper pattern

### Navigation Tests
- [x] Desktop carousel navigation (prev/next/dots/wrapping)
- [x] Mobile carousel swipe navigation
- [x] Modal keyboard controls (Escape)
- [x] Person selection flow (grid → carousel → modal)
- [x] Keyboard accessibility

**Stats:** 4 test suites, 41 integration tests
**Total Phase 1-4:** 27 test suites, 161 tests passing ✅

---

## ✅ Phase 5 – End-to-End Tests (Playwright) (COMPLETE)
**Goal:** Test complete user journeys in a real browser

### Setup
- [x] Install Playwright (@playwright/test)
- [x] Configure test browsers (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- [x] Configure base URL and test environment (playwright.config.ts)
- [x] Setup webServer to auto-start dev server

### Critical User Flows
- [x] Page load and initial render (no JS errors, proper title/meta)
- [x] Browse carousel (desktop: prev/next buttons, dot indicators, keyboard arrows)
- [x] Browse carousel (mobile with touch gestures and swipe)
- [x] Open person modal from grid
- [x] Close modal (close button, escape key, backdrop click)
- [x] Navigate between photos (wrapping behavior)
- [x] Hover interactions (desktop hover sync)

### Visual & Layout Tests
- [x] Responsive layout adaptation (mobile 375px, tablet 768px, desktop 1920px)
- [x] Image loading progressively
- [x] Image load failure handling
- [x] Display loading animation initially

### Accessibility Tests
- [x] Keyboard navigation (Tab, Shift+Tab, Enter, Escape, Arrow keys)
- [x] Screen reader compatibility (ARIA roles, labels, landmark regions)
- [x] Focus management (focus trap in modal, visible focus indicators)
- [x] ARIA attributes and semantic HTML (buttons, links, headings)
- [x] Alt text on images
- [x] Proper heading hierarchy
- [x] Body scroll lock when modal open

**Stats:** 4 test suites, 44 unique E2E tests × 9 browsers = 396 total
**Target:** 3-4 test suites, ~20-25 E2E tests (Exceeded target!)

---

## Phase 6 – Performance & Quality Assurance
**Goal:** Ensure production-ready quality

### Performance Benchmarks
- [ ] Lighthouse CI integration
- [ ] Core Web Vitals monitoring
- [ ] Bundle size analysis
- [ ] Render performance profiling

### Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (WebKit)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility Audit
- [ ] axe-core integration
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard-only navigation test
- [ ] Screen reader test (NVDA/JAWS)

### Edge Cases & Error Handling
- [ ] Empty data scenarios
- [ ] Image load failures
- [ ] Network offline behavior
- [ ] Browser compatibility fallbacks

**Target:** Coverage reports, accessibility scores, performance budgets

---

## Current Status

**Completed:**
- ✅ Phase 1: Infrastructure (Jest, RTL, CI pipeline, testing utilities)
- ✅ Phase 2: Unit tests (11 suites, 65 tests) - libs/configs/autoCycle
- ✅ Phase 3: Component tests (12 suites, 55 tests) - all components + PanGestureHint
- ✅ Phase 4: Integration tests (4 suites, 41 tests) - data flow, layouts, navigation
- ✅ Phase 5: E2E tests (4 suites, 44 unique tests × 9 browsers = 396 total)
- **Total: 31 test suites, 208 tests ✅**

**Upcoming:**
- ⏳ Phase 6: Performance & QA (optional enhancements)

**Upcoming:**