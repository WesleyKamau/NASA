# E2E Test Quick Start Checklist

## ✅ Pre-Run Checklist

- [ ] Close VS Code integrated terminals
- [ ] Stop any running dev servers (`Get-Process -Name node | Stop-Process -Force`)
- [ ] Close browser windows
- [ ] Ensure 4GB+ RAM available
- [ ] Ensure CPU is under 50% load
- [ ] Open separate PowerShell/Terminal window

## 🚀 Run Tests (Choose One)

### Option A: Full Suite with Live Log (Recommended - 45-90 min)
```bash
cd C:\GitHub\NASA\nasa-recognition
npm run test:e2e:clean
npm run test:e2e:watch

# Then open e2e-results.log in VS Code to watch progress
# The file updates in real-time and won't interfere with tests
```

### Option B: One Browser at a Time (Safer)
```bash
cd C:\GitHub\NASA\nasa-recognition
npm run test:e2e:clean
npm run test:e2e:chromium
```

### Option C: Mobile Only (Focused Testing)
```bash
cd C:\GitHub\NASA\nasa-recognition
npm run test:e2e:clean
npm run test:e2e:mobile
```

## 📊 After Tests Complete

1. **Check Log File:**
   - Open `e2e-results.log` in VS Code
   - Scroll to bottom for summary
   - Look for: `396 passed` or `X failed`

2. **View HTML Report:**
   ```bash
   npm run test:e2e:report
   ```

3. **If Tests Failed:**
   - Open HTML report
   - Click on failed test
   - Click "View Trace" button
   - Take screenshots of:
     - Test error message
     - Trace viewer showing failure point
     - Any visible console errors

## 🔧 Share with Copilot

Copy this template and fill it out:

```
**E2E Test Failure Report**

Test Name: [e.g., "should load homepage successfully"]
Browser: [chromium/firefox/webkit/mobile]
File: [e.g., page-load.spec.ts]

Error Message:
[Paste from HTML report or console]

Expected:
[What should happen]

Actual:
[What happened instead]

Trace/Screenshot:
[Describe or attach]

Full Console Output:
[Paste relevant section from log file]
```

## 🆘 Emergency Stop

If tests are stuck or system freezing:

```powershell
# Kill all Node processes
Get-Process -Name node | Stop-Process -Force

# Kill all browser processes
Get-Process -Name chrome,firefox,msedge | Stop-Process -Force
```

## 🎯 Expected Results

- **Success**: `396 passed (XX minutes)`
- **Failures**: `X failed, Y passed`
- **Flaky**: `X flaky, Y passed` (auto-retried once)

## 💾 Test Artifacts Location

After running, find results here:
- `playwright-report/index.html` - Main report
- `test-results/` - Screenshots, videos, traces
- `e2e-results.log` - Console output (if saved)

## ⚡ Tips for Best Results

1. **Watch in real-time** - Open `e2e-results.log` in VS Code while tests run
2. **Use separate terminal** - Not VS Code terminal (prevents slowdown)
3. **Don't touch computer** - Let tests run undisturbed
4. **Monitor first 5 minutes** - Ensure dev server starts successfully
5. **Check progress** - Look for "Running 396 tests..." message in log
6. **Auto-scroll** - VS Code will auto-update the log file

## 💡 VS Code Tip

To see live updates in VS Code:
1. Open `e2e-results.log` in editor
2. Tests will append to the file in real-time
3. File will auto-refresh (no manual refresh needed)
4. Won't interfere with test execution

## 🔄 Clean Before Each Run

```bash
npm run test:e2e:clean
```

This removes old screenshots, videos, and reports so you only see current results.
