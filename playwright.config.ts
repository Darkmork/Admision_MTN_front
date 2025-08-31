import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Sistema de Admisión MTN
 * Fase 0 Pre-flight E2E Frontend Testing
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Global test timeout
  timeout: 30 * 1000, // 30 seconds
  
  // Expect timeout
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },
  
  // Reporter configuration
  reporter: process.env.CI 
    ? [['html'], ['junit', { outputFile: 'test-results.xml' }]] 
    : [['html'], ['list']],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Default navigation timeout
    navigationTimeout: 15 * 1000, // 15 seconds
    
    // Default action timeout
    actionTimeout: 10 * 1000, // 10 seconds
  },

  // Configure projects for major browsers
  projects: [
    // Setup project for authentication and data seeding
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/,
    },

    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use authenticated state from setup
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Mobile testing (optional)
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  // Run your local dev server before starting the tests
  webServer: [
    // Frontend server
    {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
      },
    },
    // Backend server (assuming it's running separately)
    {
      command: 'echo "Backend should be running on port 8080"',
      port: 8080,
      reuseExistingServer: true,
    },
  ],

  // Test result and output directories
  outputDir: 'test-results/',
  
  // Folder for test artifacts such as screenshots, videos, traces, etc.
  use: {
    ...devices['Desktop Chrome'], // Default to Chrome for single browser testing
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'retain-on-failure', 
    screenshot: 'only-on-failure',
    actionTimeout: 10 * 1000,
    navigationTimeout: 15 * 1000,
  },
});