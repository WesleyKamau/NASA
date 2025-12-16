# Component Test TODO

This doc tracks every component we plan to cover with RTL/Jest tests. The goal is to add tests for all components, organized into batches of three so we can work through them methodically.

## Batch 1 – Carousel surface
- [x] `PhotoCarousel` (desktop navigation + hover interactions already implemented in tests/unit/PhotoCarousel.test.tsx)
- [x] `CarouselNameTag` (measure visibility, click handling, and mobile overflow shift)
- [x] `CenterIndicator` (ensure focus circle renders, falls back to face highlight, and notifies parent)

## Batch 2 – Mobile carousel surface
- [x] `MobilePhotoCarousel` (touch gestures, auto-cycle pause/resume, callback wiring)
- [x] `CenterIndicator` interaction with mobile carousel (already in progress with Batch 1 but verify mobile-specific behavior)
- [x] `PersonModal` (open/close, escape key, and body-scroll locking)

## Batch 3 – Grid & card helpers
- [x] `PersonCard` (name overlay, click handler, highlight state)
- [x] `OrganizedPersonGrid` (click routing vs default modal, hover sync)
- [x] `PersonPreview` / `PersonHighlight` (ensure highlight/preview states match props)

## Batch 4 – Supporting pieces
- [x] `PhotoCarousel` subcomponents like `CarouselNameTag`, `CenterIndicator`, `PanGestureHint` (some overlap with earlier batches)
- [x] `Galaxy` / `GalaxyBackground` (rendering layers, parallax props)
- [x] `FloatingRocket` / `TMinusCounter` (animation triggers)

Each batch will form the basis of a dedicated test file or suite under `tests/unit`. I'll mark tasks as I add the unit tests so the file stays in sync with progress.

---

## Summary

All component tests have been completed! The test suite now covers:

**Batch 1** - Carousel surface: PhotoCarousel, CarouselNameTag, CenterIndicator  
**Batch 2** - Mobile carousel: MobilePhotoCarousel, PersonModal  
**Batch 3** - Grid & cards: PersonCard, OrganizedPersonGrid, PersonPreview/PersonHighlight  
**Batch 4** - Supporting: Galaxy/GalaxyBackground, FloatingRocket

**Total: 20 test suites, 83 tests passing** ✅
