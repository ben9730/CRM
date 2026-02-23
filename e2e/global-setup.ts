import { chromium, FullConfig } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Global setup for Playwright E2E tests.
 * Authenticates once using TEST_EMAIL + TEST_PASSWORD env vars and saves
 * the browser storage state to e2e/.auth/user.json for reuse across all specs.
 *
 * Required env vars (.env.test.local):
 *   TEST_EMAIL=your-test-user@example.com
 *   TEST_PASSWORD=your-test-password
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD

  if (!email || !password) {
    throw new Error(
      'TEST_EMAIL and TEST_PASSWORD environment variables are required.\n' +
        'Create .env.test.local with:\n' +
        '  TEST_EMAIL=your-email@example.com\n' +
        '  TEST_PASSWORD=your-password'
    )
  }

  // Ensure .auth directory exists
  const authDir = path.join(__dirname, '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`)

    // Fill in credentials
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30_000 })

    // Save storage state (cookies + localStorage) for reuse
    await page.context().storageState({
      path: path.join(authDir, 'user.json'),
    })

    console.log('[global-setup] Authentication successful — storage state saved.')
  } catch (err) {
    console.error('[global-setup] Authentication failed:', err)
    throw err
  } finally {
    await browser.close()
  }
}

export default globalSetup
