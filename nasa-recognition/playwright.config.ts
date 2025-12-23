import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Timeout for each test */
  timeout: 60 * 1000, // 60 seconds per test
  /* Timeout for expect() assertions */
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1, // Retry once locally for flaky tests
  /* Limit parallel workers to prevent resource exhaustion */
  workers: process.env.CI ? 1 : 6, // 6 workers for 10-core machine after Phase 1-3 fixes
  /* Reporter to use - multiple reporters for better tracking */
  reporter: [
    ['list', { printSteps: true }], // Shows progress with step details
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }], // For log parsing
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Maximum time to wait for navigation - increased for slower page loads
     * These higher values (60s navigation, 20s action) accommodate:
     * - Initial Next.js build/compilation time during test startup
     * - Large image assets loading from NASA API
     * - Complex React component hydration
     * Increased from 45s to 60s to handle chromium-specific page load timeouts
     * If these timeouts seem excessive, investigate underlying performance issues */
    navigationTimeout: 60 * 1000,
    /* Maximum time to wait for action */
    actionTimeout: 20 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports - both orientations */
    {
      name: 'Mobile Chrome (Portrait)',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Chrome (Landscape)',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 915, height: 412 },
      },
    },
    {
      name: 'Mobile Safari (Portrait)',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Safari (Landscape)',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 844, height: 390 },
      },
    },

    /* Test against tablet viewports - both orientations */
    {
      name: 'Tablet (Portrait)',
      use: { ...devices['iPad Pro'] },
    },
    {
      name: 'Tablet (Landscape)',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1366, height: 1024 },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe', // Pipe output to see dev server logs
    stderr: 'pipe',
    env: {
      PLAYWRIGHT_TEST: 'true', // Flag for Next.js config to disable HMR
    },
  },
});
