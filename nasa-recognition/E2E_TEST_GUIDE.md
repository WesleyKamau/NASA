# E2E Test Execution Guide

## 🚀 How to Run Tests Safely (Unattended)

### Prerequisites
1. **Close VS Code integrated terminal** - Run tests in a separate terminal
2. **Ensure dev server is NOT running** - Playwright will start it automatically
3. **Close browser instances** - Free up resources

---

## 📊 Running Tests with Progress Tracking

### Option 1: Full Test Suite with Live Log (Recommended)
```bash
# Clean old results first
npm run test:e2e:clean

# Run all tests with live log updates (safe to view in VS Code)
npm run test:e2e:watch
```

**What you'll see:**
- Real-time progress in console AND log file: `[1/396] chromium › page-load.spec.ts...`
- Pass/fail indicators: `✓` or `✗` 
- Test count: Running test X of Y
- Duration for each test
- Failed tests listed at end

**Log file (can keep open in VS Code):**
- `e2e-results.log` - Updates in real-time
- Auto-scrolls to bottom as tests run
- Clean formatting without color codes
- Safe to view while tests run

**Output locations:**
- Console: Live progress (also streamed to log)
- `e2e-results.log` - Complete test output (VS Code friendly)
- `playwright-report/index.html` - HTML report
- `test-results/results.json` - JSON data
- `test-results/junit.xml` - JUnit XML format
- `test-results/` - Screenshots, videos, traces for failures

### Option 2: Run One Browser at a Time (Less resource intensive)
```bash
# Clean first
npm run test:e2e:clean

# Run each browser separately
npm run test:e2e:chromium     # 44 tests (~5-10 min)
npm run test:e2e:firefox      # 44 tests (~5-10 min)
npm run test:e2e:webkit       # 44 tests (~5-10 min)
npm run test:e2e:mobile       # 176 tests (~20-40 min)
```

### Option 3: Debug Single Test
```bash
# Interactive debugging with Playwright Inspector
npm run test:e2e:debug

# Or headed mode (see browser)
npm run test:e2e:headed
```

---

## 🔍 Collecting Failure Data for Copilot

When tests fail, Playwright automatically captures:

### 1. **Screenshots** (test-results/*)
Location: `test-results/<test-name>/test-failed-1.png`

### 2. **Videos** (test-results/*)
Location: `test-results/<test-name>/video.webm`

### 3. **Traces** (test-results/*)
Location: `test-results/<test-name>/trace.zip`

### 4. **Console Output**
Save the terminal output to a file:
```bash
npm run test:e2e > test-output.log 2>&1
```

### How to Share Failure Data with Copilot:

**Method 1: Open HTML Report**
```bash
npm run test:e2e:report
```
Then:
1. Take screenshot of failed test details
2. Click "View Trace" for failed tests
3. Share trace viewer URL or screenshot

**Method 2: Share JSON Results**
```bash
# View test-results/results.json
# Copy failed test entries and paste to Copilot
```

**Method 3: Share Console Output**
```bash
# If you saved to file:
# Open test-output.log
# Copy the "FAILED" test sections
# Paste to Copilot
```

**Ideal Information to Provide:**
```
Test: <test-name>
Browser: <chromium/firefox/webkit>
Error: <error message>
Expected: <what should happen>
Received: <what actually happened>
Screenshot: <attach or describe>
```

---

## 🧹 Cleaning Test Results

### Quick Clean (before each run)
```bash
npm run test:e2e:clean
```

This removes:
- `playwright-report/` - HTML reports
- `test-results/` - Screenshots, videos, traces
- `.playwright/` - Cache

### Manual Clean
```powershell
# PowerShell
Remove-Item -Recurse -Force playwright-report, test-results, .playwright -ErrorAction SilentlyContinue
```

---

## 🛡️ Preventing Crashes During Unattended Runs

### 1. **Resource Management**
```bash
# Limit parallel workers (already configured)
# playwright.config.ts: workers: 2
```

### 2. **Use Separate Terminal**
- ❌ Don't use VS Code integrated terminal
- ✅ Use separate PowerShell/CMD window
- ✅ Or use Windows Terminal

### 3. **Ensure Dev Server Auto-Start Works**
Test the dev server connection:
```bash
# In one terminal:
npm run dev

# In another terminal:
curl http://localhost:3000

# If successful, stop dev server and let Playwright manage it
```

### 4. **Monitor Resource Usage**
- Open Task Manager (Ctrl+Shift+Esc)
- Watch:
  - CPU: Should stay under 80%
  - RAM: Should have 4GB+ free
  - Disk: Should not be at 100%

### 5. **Timeout Protection**
Already configured:
- Per test: 60 seconds
- Per action: 15 seconds
- Navigation: 30 seconds
- Overall: 2 hours max

### 6. **Retry Logic**
Tests auto-retry once on failure (configured in playwright.config.ts)

---

## 📈 Understanding Test Progress

### Total Test Count
- **396 total tests** across 9 browser configurations:
  - Chromium: 44 tests
  - Firefox: 44 tests
  - WebKit: 44 tests
  - Mobile Chrome Portrait: 44 tests
  - Mobile Chrome Landscape: 44 tests
  - Mobile Safari Portrait: 44 tests
  - Mobile Safari Landscape: 44 tests
  - iPad Portrait: 44 tests
  - iPad Landscape: 44 tests

### Expected Runtime
- **Full suite**: 45-90 minutes (depends on hardware)
- **Single browser**: 5-10 minutes
- **Mobile only**: 20-30 minutes

### Progress Indicators
```
Running 396 tests using 2 workers

  [1/396] chromium › page-load.spec.ts:4:7 › Page Load › should load homepage successfully
  ✓ 1 chromium › page-load.spec.ts:4:7 › Page Load › should load homepage successfully (2.3s)
  
  [2/396] chromium › page-load.spec.ts:14:7 › Page Load › should display loading animation
  ✓ 2 chromium › page-load.spec.ts:14:7 › Page Load › should display loading animation (1.8s)
  
  ... continues for all 396 tests ...
  
  396 passed (45m 23s)
```

---

## 🎯 Best Practice Workflow

### Full Test Run (Unattended)
```bash
# 1. Clean old results
npm run test:e2e:clean

# 2. Run tests (save output)
npm run test:e2e > e2e-results.log 2>&1

# 3. When complete, view report
npm run test:e2e:report
```

### Incremental Testing (Active debugging)
```bash
# 1. Run one browser
npm run test:e2e:chromium

# 2. If failures, debug specific test
npx playwright test tests/e2e/page-load.spec.ts --project=chromium --headed

# 3. View trace for failure
npm run test:e2e:report
```

### CI/Production Testing
```bash
# Set CI env var for stricter settings
$env:CI="true"
npm run test:e2e
```

---

## ⚠️ Common Issues & Solutions

### Issue: Dev server won't start
```bash
# Solution: Kill existing process
Get-Process -Name node | Stop-Process -Force
npm run test:e2e
```

### Issue: Port 3000 already in use
```bash
# Solution: Change port in playwright.config.ts
# Or kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Browser crashes
```bash
# Solution: Run single browser at a time
npm run test:e2e:chromium
```

### Issue: Out of memory
```bash
# Solution: Reduce workers in playwright.config.ts
# Change: workers: 2 → workers: 1
```

### Issue: Tests timeout
```bash
# Solution: Increase timeout in playwright.config.ts
# Change: timeout: 60 * 1000 → timeout: 120 * 1000
```

---

## 📝 Quick Reference

| Command | Purpose | Duration |
|---------|---------|----------|
| `npm run test:e2e:clean` | Remove old test results | Instant |
| `npm run test:e2e` | Run all 396 tests | 45-90 min |
| `npm run test:e2e:chromium` | Run 44 Chromium tests | 5-10 min |
| `npm run test:e2e:mobile` | Run 176 mobile tests | 20-40 min |
| `npm run test:e2e:report` | Open HTML report | Instant |
| `npm run test:e2e:ui` | Interactive test runner | Manual |
| `npm run test:e2e:headed` | See browser (debug) | Manual |

---

## 🎬 Step-by-Step: First Time Running

1. **Close everything**
   - Close VS Code integrated terminals
   - Close browser windows
   - Stop any running dev servers

2. **Open separate terminal**
   - Windows Terminal or PowerShell (not VS Code)
   - Navigate to project: `cd C:\GitHub\NASA\nasa-recognition`

3. **Clean and run**
   ```bash
   npm run test:e2e:clean
   npm run test:e2e
   ```

4. **Walk away** ☕
   - Tests will run for 30-60 minutes
   - Dev server auto-starts/stops
   - Failures automatically captured

5. **Return and review**
   ```bash
   npm run test:e2e:report
   ```

6. **Share failures with Copilot**
   - Open HTML report
   - Screenshot failed tests
   - Click "View Trace" for details
   - Copy error messages
   - Paste in VS Code chat

---

## 🔧 Troubleshooting Template for Copilot

When reporting issues, provide:

```
**Test Run Details:**
- Date/Time: 
- Command used: npm run test:e2e
- Tests run: X/396
- Tests passed: X
- Tests failed: X

**Failed Test:**
- Test name: 
- Browser: 
- Error message: 
- Expected behavior: 
- Actual behavior: 
- Screenshot: [attach or describe]

**System Info:**
- OS: Windows 11
- RAM: 
- CPU load during test: 
- Any other apps running: 

**Logs:**
[Paste relevant console output]
```

---

## ✅ Success Criteria

All tests passing:
```
396 passed (60m 15s)
```

HTML report shows:
- All green checkmarks
- No failed tests
- No flaky tests (passed on retry)
