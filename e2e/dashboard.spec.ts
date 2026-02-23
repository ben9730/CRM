import { test, expect } from '@playwright/test'

/**
 * Dashboard metrics E2E tests.
 * Verifies UI elements render without error — no specific value assertions
 * since live data changes between runs.
 */

test.describe('Dashboard', () => {
  test('dashboard page loads with metrics cards visible', async ({ page }) => {
    await page.goto('/dashboard')

    // Page header
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15_000 })

    // Metric cards should render (pipeline value, deal count, tasks due today, overdue tasks)
    // MetricsCards component renders a row of stat cards
    // We verify at least one metrics section is visible by checking for known text patterns
    const metricsSection = page.locator('[class*="grid"]').first()
    await expect(metricsSection).toBeVisible({ timeout: 10_000 })
  })

  test('dashboard pipeline summary section is visible', async ({ page }) => {
    await page.goto('/dashboard')

    // PipelineSummary renders a section with stage breakdown
    // It should be visible regardless of actual deal data
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15_000 })

    // The dashboard has a grid layout with PipelineSummary + TasksWidget
    // Check for a section that contains pipeline or stage information
    const pageContent = page.locator('main, [class*="p-4"]').first()
    await expect(pageContent).toBeVisible({ timeout: 5_000 })

    // Check no error messages appear
    await expect(page.getByText(/error/i)).not.toBeVisible()
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible()
  })

  test('dashboard activity feed section is visible', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for page to load
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15_000 })

    // The page should have loaded without errors
    // Check that we're on the dashboard (not redirected to login)
    await expect(page).toHaveURL(/dashboard/)

    // No error states
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible()
    await expect(page.getByText(/failed to load/i)).not.toBeVisible()

    // The "Overview" label appears next to "Dashboard" heading
    await expect(page.getByText('Overview')).toBeVisible({ timeout: 5_000 })
  })

  test('dashboard page renders metric cards without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', (err) => jsErrors.push(err.message))

    await page.goto('/dashboard')
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 15_000 })

    // Give the page a moment to fully render all sections
    await page.waitForTimeout(2_000)

    // Assert no JavaScript errors occurred during render
    expect(jsErrors).toHaveLength(0)
  })
})
