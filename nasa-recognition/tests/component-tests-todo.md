# Component Test TODO

This doc tracks every component we plan to cover with RTL/Jest tests. The goal is to add tests for all components, organized into batches of three so we can work through them methodically.

## Batch 1 – Carousel surface
- [x] `PhotoCarousel` (desktop navigation + hover interactions already implemented in tests/unit/PhotoCarousel.test.tsx)
- [ ] `CarouselNameTag` (measure visibility, click handling, and mobile overflow shift)
- [ ] `CenterIndicator` (ensure focus circle renders, falls back to face highlight, and notifies parent)

## Batch 2 – Mobile carousel surface
- [ ] `MobilePhotoCarousel` (touch gestures, auto-cycle pause/resume, callback wiring)
- [ ] `CenterIndicator` interaction with mobile carousel (already in progress with Batch 1 but verify mobile-specific behavior)
- [ ] `PersonModal` (open/close, escape key, and body-scroll locking)

## Batch 3 – Grid & card helpers
- [ ] `PersonCard` (name overlay, click handler, highlight state)
- [ ] `OrganizedPersonGrid` (click routing vs default modal, hover sync)
- [ ] `PersonPreview` / `PersonHighlight` (ensure highlight/preview states match props)

## Batch 4 – Supporting pieces
- [ ] `PhotoCarousel` subcomponents like `CarouselNameTag`, `CenterIndicator`, `PanGestureHint` (some overlap with earlier batches)
- [ ] `Galaxy` / `GalaxyBackground` (rendering layers, parallax props)
- [ ] `FloatingRocket` / `TMinusCounter` (animation triggers)

Each batch will form the basis of a dedicated test file or suite under `tests/unit`. I'll mark tasks as I add the unit tests so the file stays in sync with progress.
