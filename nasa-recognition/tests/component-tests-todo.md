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

- [x] `lib/carouselUtils.ts` - getPeopleInPhoto, shuffleArray, startAutoCycle
- [x] `lib/configs/*.ts` - All config modules (componentsConfig, siteConfig, rocketConfig, ogConfig)
- [x] `lib/crashLogger.ts` - Logging, pruning, export/clear
- [x] `lib/data.ts` & `lib/data-server.ts` - Data loading and filtering
- [x] `lib/imageLoadQueue.ts` - Queue management and concurrency
- [x] `lib/imageUtils.ts` - Image cropping and dimension calculations
- [x] `lib/preload.ts` - Preload functionality
- [x] `lib/rocketSchedule.ts` - Launch scheduling and subscription
- [x] `lib/scrollManager.ts` - Scroll state tracking

**Stats:** 9 test suites, 37 unit tests

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

**Stats:** 11 test suites, 46 component tests
**Total Phase 1-3:** 20 test suites, 83 tests passing ✅

---

## ✅ Phase 4 – Integration Tests (COMPLETE)
**Goal:** Test interactions between multiple components and data flows

### Data Integration Tests
- [x] Data flow between carousel and person components
- [x] Photo navigation updates with correct data
- [x] Category organization in grid layout
- [x] Modal data integration with grid
- [x] Hidden people filtering (Grid filters, Carousel does not - documented)

### Layout Integration Tests
- [x] Desktop portrait view (carousel + scrollable grid)
- [x] Dual column view (carousel + grid sync)
- [x] Mobile portrait view (mobile carousel)
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
**Total Phase 1-4:** 24 test suites, 124 tests passing ✅

---

## Phase 5 – E2E Tests (Playwright)
**Goal:** Test complete user journeys in real browser

### Setup
- [ ] Install Playwright
- [ ] Configure test browsers (Chrome, Firefox, Safari)
- [ ] Setup test data fixtures
- [ ] Configure base URL and test environment

### User Journey Tests
- [ ] Image load queue coordination
- [ ] Scroll state affecting image loading

### Navigation Flow Tests
- [ ] Person selection flow (grid → modal)
- [ ] Carousel navigation (prev/next/dots)
- [ ] Keyboard navigation (escape, arrows)
- [ ] Hash-based navigation (if implemented)

**Target:** 4 test suites, ~25-30 integration tests

---

## Phase 5 – End-to-End Tests (Playwright)
**Goal:** Test complete user journeys in a real browser

### Critical User Flows
- [ ] Page load and initial render
- [ ] Browse carousel (desktop)
- [ ] Browse carousel (mobile with gestures)
- [ ] Open person modal from grid
- [ ] Open person modal from carousel
- [ ] Close modal (button, escape, backdrop)
- [ ] Navigate between photos
- [ ] Hover interactions (desktop only)

### Visual Regression Tests
- [ ] Homepage snapshot (desktop)
- [ ] Homepage snapshot (mobile)
- [ ] Modal open snapshot
- [ ] Carousel with person highlight snapshot

### Performance Tests
- [ ] Initial page load metrics (LCP, FCP, TTI)
- [ ] Image loading performance
- [ ] Smooth scroll performance
- [ ] Animation performance (60fps)

### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] ARIA attributes
- [ ] Color contrast

**Target:** 3-4 test suites, ~20-25 E2E tests

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
- ✅ Phase 1: Infrastructure
- ✅ Phase 2: Unit tests (libs/configs)
- ✅ Phase 3: Component tests
- **Total: 20 test suites, 83 tests passing**

**In Progress:**
- 🔄 Phase 4: Integration tests

**Upcoming:**
- ⏳ Phase 5: E2E tests
- ⏳ Phase 6: Performance & QA
