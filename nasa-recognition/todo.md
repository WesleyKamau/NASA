# TODO

- [x] Wrap mobile labels into two lines
- [x] Center or remove "Me" section text
- [ ] Add intern fun photos and feature flow
- [x] Fix mobile name labels again
- [x] General UI improvements
- [x] Stop page jumping after rocket animation
- [x] Fix the carousel changing sizes, it should be one size and just have blankspace for the missing content so the content on the page doesnt shift
- [x] Fixing the transitions between faces
- [x] Add tests (161 tests: 133 unit + 28 integration, all passing)
- [x] Smaller center circle on iPad
- [x] Migrate the mobile labels to the desktop carousel
- [x] Improve loading animation and experience
- [x] Add some sort of scrolling callout, or some sort of guided tour after loading that shows the user how to use the app
- [x] Highlighting someone's face (either by mouse hover on desktop or by selecting on the mobile carousel) will cause the corresponding tile to highlight as well, without scrolling or anything
- [x] Improve setup page: Add LinkedIn profile input field and description editor with face previews during person setup.
- [x] Add Justin Pociask to the data as a staff member
- [x] Add new "astronaut" category and add the 4 members of crew 71 that visited MSFC to the data

## Scroll/Drag: Person column (iPad + Desktop) [FIXED]

- **Issue**: On iPad in horizontal layout, the personTile column only scrolls when dragging a tile or star; dragging on text/background often does nothing. Desktop mouse wheel scrolling also feels blocked intermittently.
- **Root Cause**: GalaxyBackground component was not explicitly set to `pointer-events: none`, potentially intercepting scroll/touch events. Scroll containers lacked explicit touch-action and overflow scrolling properties.
- **Solution Implemented**:
	1. Added `pointer-events: none` to GalaxyBackground wrapper div
	2. Added explicit touch handling CSS properties to scroll containers in DesktopSplitView and CompactSplitView:
		- `touchAction: 'pan-y'` - allows vertical panning/scrolling
		- `WebkitOverflowScrolling: 'touch'` - enables momentum scrolling on iOS
		- `overscrollBehavior: 'contain'` - prevents scroll chaining
- **Files Modified**:
	- `components/GalaxyBackground.tsx`
	- `components/DesktopSplitView.tsx`
	- `components/CompactSplitView.tsx`
- **Branch**: `fix/ipad-column-drag`
- 
## Mobile: Center Circle Visibility During Auto-Cycle [FIXED]

- **Issue**: When a user manually pans the photo carousel on mobile and then waits for the auto-cycle timer to resume, the center circle indicator remains visible during the auto-cycle transition instead of disappearing.
- **Root Cause**: The `showCenterIndicator` state was set to `true` during touch interactions but was not explicitly cleared when auto-highlighting resumed after the inactivity timeout.
- **Solution Implemented**: Added `setShowCenterIndicator(false)` in the auto-highlighting resume effect (when `isAutoHighlighting` becomes `true`) to ensure the indicator is hidden when the auto-cycle resumes after user inactivity.
- **File Modified**: `components/MobilePhotoCarousel.tsx`
- **Branch**: `fix/mobile-center-circle-auto-cycle`
