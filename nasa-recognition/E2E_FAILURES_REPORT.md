# E2E Test Failures Report

*Generated: E2E_FAILURES_REPORT*

## 📊 Summary Statistics

- **Total Tests**: 396
- **✅ Passed**: 340 (85.9%)
- **❌ Failed**: 51 (12.9%)
- **⚠️ Flaky** (passed on retry): 4
- **⏱️ Timed Out**: 5
- **⏭️ Skipped**: 0

## 🔍 Error Patterns

- **Assertion**: 37 occurrences
- **Other**: 20 occurrences
- **Timeout**: 12 occurrences

## 🌐 Failures by Browser/Device

### Mobile Chrome (Landscape) (5 failures)

### Mobile Chrome (Portrait) (5 failures)

### Mobile Safari (Landscape) (5 failures)

### Mobile Safari (Portrait) (5 failures)

### Tablet (Landscape) (8 failures)

### Tablet (Portrait) (6 failures)

### chromium (9 failures)

### firefox (4 failures)

### webkit (4 failures)


## 📋 Detailed Failures

### ❌ should have proper ARIA roles

**File**: `accessibility.spec.ts`

**Failed on**: chromium

**Error Details**:

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  114 | test.describe('ARIA and Semantic HTML', () => {
  115 |   test('should have proper ARIA roles', async ({ page }) => {
> 116 |     await page.goto('/');
      |                ^
  117 |     await page.waitForLoadState('networkidle');
  118 |     await page.waitForTimeout(2000);
  119 |     
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\accessibility.spec.ts:116:16
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

---

### ❌ should support Enter key to activate buttons

**File**: `accessibility.spec.ts`

**Failed on**: chromium

**Error Details**:

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  60 |
  61 |   test('should support Enter key to activate buttons', async ({ page }) => {
> 62 |     await page.goto('/');
     |                ^
  63 |     await page.waitForLoadState('networkidle');
  64 |     await page.waitForTimeout(2000);
  65 |     
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\accessibility.spec.ts:62:16
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: browserContext.close: Target page, context or browser has been closed
```

---

### ❌ should support Shift+Tab for reverse navigation

**File**: `accessibility.spec.ts`

**Failed on**: chromium

**Error Details**:

```
TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
[2m  - navigating to "http://localhost:3000/", waiting until "load"[22m


  22 |
  23 |   test('should support Shift+Tab for reverse navigation', async ({ page }) => {
> 24 |     await page.goto('/');
     |                ^
  25 |     await page.waitForLoadState('networkidle');
  26 |     await page.waitForTimeout(2000);
  27 |     
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\accessibility.spec.ts:24:16
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

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
TimeoutError: page.waitForLoadState: Timeout 30000ms exceeded.

   5 |     await page.setViewportSize({ width: 1920, height: 1080 });
   6 |     await page.goto('/');
>  7 |     await page.waitForLoadState('networkidle');
     |                ^
   8 |   });
   9 |
  10 |   test('should navigate to next photo using button', async ({ page }) => {
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:7:16
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
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


  32 |   test('should navigate to previous photo using button', async ({ page }) => {
  33 |     const carousel = page.locator('[data-testid*="carousel"], [class*="carousel"]').first();
> 34 |     await expect(carousel).toBeVisible({ timeout: 10000 });
     |                            ^
  35 |     
  36 |     // Find and click previous button
  37 |     const prevButton = page.getByRole('button', { name: /prev|previous/i }).or(
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:34:28
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: End of central directory record signature not found. Either not a zip file, or file is truncated.
```

---

### ❌ should navigate using dot indicators

**File**: `carousel-navigation.spec.ts`

**Failed on**: chromium, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for locator('button[aria-label*="photo"], [role="tablist"] button, [class*="dot"]').nth(1)[22m
[2m    - locator resolved to <button aria-label="Next photo" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110 border border-white/10">…</button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m


  58 |     if (dotCount > 1) {
  59 |       // Click second dot
> 60 |       await dots.nth(1).click();
     |                         ^
  61 |       await page.waitForTimeout(500);
  62 |       
  63 |       // Should have navigated to different photo
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:60:25
```

```
[31mTest timeout of 60000ms exceeded.[39m
```

---

### ❌ should wrap from first to last photo

**File**: `carousel-navigation.spec.ts`

**Failed on**: Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /prev/i }).or(locator('button[aria-label*="prev"]')).first()[22m
[2m    - locator resolved to <button aria-label="Previous photo" class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110 border border-white/10">…</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950"></div> from <div class="fixed inset-0 z-50 transition-opacity duration-500 opacity-100">…</div> subtree intercepts pointer events[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m


  197 |     if (await prevButton.isVisible()) {
  198 |       // Click previous from first photo (should wrap to last)
> 199 |       await prevButton.click();
      |                        ^
  200 |       await page.waitForTimeout(500);
  201 |       
  202 |       // No errors should occur
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:199:24
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> C:\Users\weska\AppData\Local\ms-playwright\chromium_headless_shell-1200\chrome-headless-shell-win64\chrome-headless-shell.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AcceptCHFrame,AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=C:\Users\weska\AppData\Local\Temp\playwright_chromiumdev_profile-XXXXXXgzJCZo --remote-debugging-pipe --no-startup-window
<launched> pid=46552
[pid=46552][err] [1216/195945.179:INFO:CONSOLE:2288] "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195949.714:INFO:CONSOLE:2288] "[HMR] connected", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195950.851:INFO:CONSOLE:2288] "[Fast Refresh] rebuilding", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195953.100:INFO:CONSOLE:2288] "[Fast Refresh] done in 3271ms", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195953.363:ERROR:gpu\command_buffer\service\gles2_cmd_decoder_passthrough.cc:1091] [GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.
[pid=46552][err] [1216/195953.408:ERROR:gpu\command_buffer\service\gles2_cmd_decoder_passthrough.cc:1091] [GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.
[pid=46552][err] [1216/195953.485:ERROR:gpu\command_buffer\service\gl_utils.cc:389] [.WebGL-0x71dc0363f100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
[pid=46552][err] [1216/195953.908:INFO:CONSOLE:0] "[GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.", source: http://localhost:3000/ (0)
[pid=46552][err] [1216/195955.842:ERROR:gpu\command_buffer\service\gl_utils.cc:389] [.WebGL-0x71dc0363f100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
[pid=46552][err] [1216/195956.376:INFO:CONSOLE:0] "[.WebGL-0x71dc0363f100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels", source: http://localhost:3000/ (0)
[pid=46552][err] [1216/195957.076:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Adam Farragut [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.077:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Allison Chouinard [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.078:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Amanda Dobbs [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.079:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Beverly Johnson [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.079:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Brian Hoang [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.080:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Gloria Caldwell [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.080:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Jackson Cho [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.080:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Jaclyn (McDougal) Stursma [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.081:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Jena Strawn [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.081:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Laura (Means) Kiker [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.082:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Lee Judge [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.083:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Mandy Pinyan [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.083:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Mary Hovater [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.084:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Melanie Manson [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.084:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Michael Allen [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.085:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Michael Smith [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.085:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Pam Honeycutt [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.086:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Quincy Bean [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.086:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Shawn McEniry [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.086:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Twila Griggs Schneider [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.087:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Dalila Pugh [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.087:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Dan Mitchell [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.088:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Ejemole (Michael) Ojukwu [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.088:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Grant Arndt [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.091:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Hannah Boulware [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.092:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Joe [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.093:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Lakiesha Hawkins [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.093:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Stephen Gabrys [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.093:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Benjamin Stroup [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.094:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Brylie Singleton [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.094:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Claire W [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.095:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Emma Miller [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.095:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Ethan Thornton [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.095:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Greyson Wong [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.097:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Isaac Bennett [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.097:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Ivy Zhan [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.097:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Lux Snyder [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.097:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Michael J [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.098:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Sebastian Oviedo [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.098:INFO:CONSOLE:2288] "[CrashLogger image] Image loaded: Wiley Smith [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/195957.102:ERROR:gpu\command_buffer\service\gl_utils.cc:389] [.WebGL-0x71dc0363f100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels
[pid=46552][err] [1216/195957.712:ERROR:gpu\command_buffer\service\gles2_cmd_decoder_passthrough.cc:1091] [GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.
[pid=46552][err] [1216/195957.880:ERROR:gpu\command_buffer\service\gl_utils.cc:389] [.WebGL-0x71dc0363f100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)
[pid=46552][err] [1216/195958.290:INFO:CONSOLE:0] "[GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.", source: http://localhost:3000/ (0)
[pid=46552][err] [1216/195958.713:INFO:CONSOLE:0] "[.WebGL-0x71dc0363f100]GL Driver Message (OpenGL, Performance, GL_CLOSE_PATH_NV, High): GPU stall due to ReadPixels (this message will no longer repeat)", source: http://localhost:3000/ (0)
[pid=46552][err] [1216/195958.742:ERROR:gpu\command_buffer\service\gles2_cmd_decoder_passthrough.cc:1091] [GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.
[pid=46552][err] [1216/195959.183:INFO:CONSOLE:0] "[GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.", source: http://localhost:3000/ (0)
[pid=46552][err] [1216/200000.874:INFO:CONSOLE:2288] "[Fast Refresh] rebuilding", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200000.875:INFO:CONSOLE:2288] "[Fast Refresh] done in 361ms", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200003.063:INFO:CONSOLE:2288] "🚀 SLS Rocket Launch Initiated", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200003.064:INFO:CONSOLE:2288] "📊 Scroll Info: [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200003.064:INFO:CONSOLE:2288] "📍 Rocket Positions: [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200003.064:INFO:CONSOLE:2288] "🔄 Rocket Rotation: 101.51°", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200003.064:INFO:CONSOLE:2288] "✅ Rocket Launch Scheduled", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200003.717:INFO:CONSOLE:2288] "Image with src "/SLS.png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200007.844:INFO:CONSOLE:2288] "🏁 Rocket Animation Complete", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200018.212:ERROR:gpu\command_buffer\service\gles2_cmd_decoder_passthrough.cc:1091] [GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.
[pid=46552][err] [1216/200019.858:INFO:CONSOLE:0] "[GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.", source: http://localhost:3000/ (0)
[pid=46552][err] [1216/200021.307:ERROR:gpu\command_buffer\service\gles2_cmd_decoder_passthrough.cc:1091] [GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.
[pid=46552][err] [1216/200022.149:INFO:CONSOLE:0] "[GroupMarkerNotSet(crbug.com/242999)!:A800190014610000]Automatic fallback to software WebGL has been deprecated. Please use the --enable-unsafe-swiftshader (about:flags#enable-unsafe-swiftshader) flag to opt in to lower security guarantees for trusted content.", source: http://localhost:3000/ (0)
[pid=46552][err] [1216/200032.772:INFO:CONSOLE:2288] "[Fast Refresh] rebuilding", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200032.772:INFO:CONSOLE:2288] "[Fast Refresh] done in 1027ms", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200038.574:INFO:CONSOLE:2288] "[Fast Refresh] rebuilding", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200040.485:INFO:CONSOLE:2288] "[Fast Refresh] done in 2449ms", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200047.048:INFO:CONSOLE:2288] "[Fast Refresh] rebuilding", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200047.052:INFO:CONSOLE:2288] "[Fast Refresh] done in 417ms", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200101.076:INFO:CONSOLE:2288] "[Fast Refresh] rebuilding", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200102.580:INFO:CONSOLE:2288] "[Fast Refresh] done in 2033ms", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200115.950:INFO:CONSOLE:2288] "🚀 SLS Rocket Launch Initiated", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200115.951:INFO:CONSOLE:2288] "📊 Scroll Info: [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200115.951:INFO:CONSOLE:2288] "📍 Rocket Positions: [object Object]", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200115.951:INFO:CONSOLE:2288] "🔄 Rocket Rotation: 260.47°", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200115.951:INFO:CONSOLE:2288] "✅ Rocket Launch Scheduled", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552][err] [1216/200121.382:INFO:CONSOLE:2288] "🏁 Rocket Animation Complete", source: http://localhost:3000/_next/static/chunks/node_modules_next_dist_7a8122d0._.js (2288)
[pid=46552] <gracefully close start>
```

---

### ❌ should wrap from last to first photo

**File**: `carousel-navigation.spec.ts`

**Failed on**: Tablet (Landscape)

**Error Details**:

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
[2m  - waiting for getByRole('button', { name: /next/i }).or(locator('button[aria-label*="next"]')).first()[22m
[2m    - locator resolved to <button aria-label="Next photo" class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 backdrop-blur-xl text-white p-2.5 rounded-full transition-all duration-200 hover:scale-110 border border-white/10">…</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <p class="text-slate-400 text-xs font-medium tracking-[0.3em] uppercase">by Wesley Kamau</p> from <div class="fixed inset-0 z-50 transition-opacity duration-500 opacity-100">…</div> subtree intercepts pointer events[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m


  176 |         // Click next multiple times to reach last photo
  177 |         for (let i = 0; i < photoCount; i++) {
> 178 |           await nextButton.click();
      |                            ^
  179 |           await page.waitForTimeout(300);
  180 |         }
  181 |         
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\carousel-navigation.spec.ts:178:28
```

---

### ❌ should display loading animation initially

**File**: `page-load.spec.ts`

**Failed on**: chromium, Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mlocator[39m[2m).[22mtoBeVisible[2m([22m[2m)[22m failed

Locator: locator('main, [role="main"]')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
[2m  - Expect "toBeVisible" with timeout 15000ms[22m
[2m  - waiting for locator('main, [role="main"]')[22m


  27 |     
  28 |     // Main content should be visible after loading
> 29 |     await expect(page.locator('main, [role="main"]')).toBeVisible({ timeout: 15000 });
     |                                                       ^
  30 |   });
  31 |
  32 |   test('should render without JavaScript errors', async ({ page }) => {
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\page-load.spec.ts:29:55
```

---

### ❌ should have proper page title and metadata

**File**: `page-load.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mpage[39m[2m).[22mtoHaveTitle[2m([22m[32mexpected[39m[2m)[22m failed

Expected pattern: [32m/NASA|Recognition/i[39m
Received string:  [31m"MSFC Book of Faces"[39m
Timeout: 10000ms

Call log:
[2m  - Expect "toHaveTitle" with timeout 10000ms[22m
[2m    8 × unexpected value "MSFC Book of Faces"[22m


  46 |     
  47 |     // Check page title
> 48 |     await expect(page).toHaveTitle(/NASA|Recognition/i);
     |                        ^
  49 |     
  50 |     // Check for viewport meta tag
  51 |     const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\page-load.spec.ts:48:24
```

```
[31mTearing down "context" exceeded the test timeout of 60000ms.[39m
```

```
Error: End of central directory record signature not found. Either not a zip file, or file is truncated.
```

---

### ❌ should display person grid

**File**: `person-modal.spec.ts`

**Failed on**: chromium, firefox, webkit, Mobile Chrome (Portrait), Mobile Chrome (Landscape), Mobile Safari (Portrait), Mobile Safari (Landscape), Tablet (Portrait), Tablet (Landscape)

**Error Details**:

```
Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBe[2m([22m[32mexpected[39m[2m) // Object.is equality[22m

Expected: [32mtrue[39m
Received: [31mfalse[39m

  153 |     const cardsCount = await personCards.count();
  154 |     
> 155 |     expect(gridVisible || cardsCount > 0).toBe(true);
      |                                           ^
  156 |   });
  157 |
  158 |   test('should organize people by categories', async ({ page }) => {
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\person-modal.spec.ts:155:43
```

---

### ❌ should scroll grid independently on desktop

**File**: `person-modal.spec.ts`

**Failed on**: Mobile Safari (Portrait), Mobile Safari (Landscape)

**Error Details**:

```
Error: mouse.wheel: Mouse wheel is not supported in mobile WebKit

  183 |         // Scroll within the area
  184 |         await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
> 185 |         await page.mouse.wheel(0, 300);
      |                          ^
  186 |         await page.waitForTimeout(300);
  187 |         
  188 |         // Scroll occurred without errors
    at C:\GitHub\NASA\nasa-recognition\tests\e2e\person-modal.spec.ts:185:26
```

---

## 🎯 Next Steps

1. Review each failure above
2. Check if failures are consistent across browsers
3. Examine error patterns for common root causes
4. Update tests or fix application code
5. Re-run tests to verify fixes
