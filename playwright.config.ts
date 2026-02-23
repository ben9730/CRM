import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E configuration targeting the live Vercel+Supabase deployment.
 * Tests run serially (workers: 1) to preserve live DB integrity.
 * Auth state is saved by global-setup.ts and reused across all specs.
 *
 * Required env vars (create .env.test.local):
 *   TEST_EMAIL=your-test-user@example.com
 *   TEST_PASSWORD=your-test-password
 *   PLAYWRIGHT_BASE_URL=https://healthcrm-tawny.vercel.app (optional override)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: 'html',
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://healthcrm-tawny.vercel.app',
    storageState: 'e2e/.auth/user.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
