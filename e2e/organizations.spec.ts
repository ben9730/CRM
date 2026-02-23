import { test, expect } from '@playwright/test'

/**
 * Organizations CRUD E2E tests.
 * Test data uses [E2E] prefix for easy identification and cleanup.
 */

const TEST_ORG_NAME = '[E2E] Test Org'
const EDITED_ORG_NAME = '[E2E] Test Org (Edited)'

test.describe('Organizations CRUD', () => {
  let createdOrgUrl = ''

  test.afterEach(async ({ page }) => {
    if (createdOrgUrl) {
      try {
        await page.goto(createdOrgUrl)
        const deleteButton = page.getByRole('button', { name: /delete/i }).first()
        if (await deleteButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await deleteButton.click()
          const confirmButton = page.getByRole('button', { name: /delete/i }).last()
          await confirmButton.click()
          await page.waitForURL('**/organizations', { timeout: 10_000 })
        }
      } catch {
        // Already deleted — ignore
      }
      createdOrgUrl = ''
    }
  })

  test('create an organization and verify it appears in the list', async ({ page }) => {
    await page.goto('/organizations')

    // Open create dialog
    await page.getByRole('button', { name: /new organization/i }).click()

    // Fill in the form
    await page.getByLabel(/organization name/i).fill(TEST_ORG_NAME)

    // Submit
    await page.getByRole('button', { name: /create organization/i }).click()

    // Should see the org in the list
    await expect(page.getByText(TEST_ORG_NAME)).toBeVisible({ timeout: 15_000 })
  })

  test('create, edit, and verify organization changes', async ({ page }) => {
    // --- Create ---
    await page.goto('/organizations')
    await page.getByRole('button', { name: /new organization/i }).click()
    await page.getByLabel(/organization name/i).fill(TEST_ORG_NAME)
    await page.getByRole('button', { name: /create organization/i }).click()

    // Wait for org to appear in list
    await expect(page.getByText(TEST_ORG_NAME)).toBeVisible({ timeout: 15_000 })

    // Navigate to org detail
    await page.getByText(TEST_ORG_NAME).first().click()
    await page.waitForURL('**/organizations/**')
    createdOrgUrl = page.url()

    // --- Edit ---
    await page.getByRole('button', { name: /edit/i }).click()

    // Change the name
    const nameInput = page.getByLabel(/organization name/i)
    await nameInput.clear()
    await nameInput.fill(EDITED_ORG_NAME)
    await page.getByRole('button', { name: /save changes/i }).click()

    // Verify the edit is reflected on the detail page
    await expect(page.getByText(EDITED_ORG_NAME)).toBeVisible({ timeout: 15_000 })
  })

  test('create and delete an organization', async ({ page }) => {
    // --- Create ---
    await page.goto('/organizations')
    await page.getByRole('button', { name: /new organization/i }).click()
    await page.getByLabel(/organization name/i).fill(TEST_ORG_NAME)
    await page.getByRole('button', { name: /create organization/i }).click()

    // Wait for org to appear
    await expect(page.getByText(TEST_ORG_NAME)).toBeVisible({ timeout: 15_000 })

    // Navigate to org detail
    await page.getByText(TEST_ORG_NAME).first().click()
    await page.waitForURL('**/organizations/**')

    // --- Delete ---
    await page.getByRole('button', { name: /delete/i }).first().click()

    // Confirm
    const confirmButton = page.getByRole('button', { name: /delete/i }).last()
    await expect(confirmButton).toBeVisible({ timeout: 5_000 })
    await confirmButton.click()

    // Should redirect back to organizations list
    await page.waitForURL('**/organizations', { timeout: 15_000 })

    // Org should no longer appear in the list
    await expect(page.getByText(TEST_ORG_NAME)).not.toBeVisible({ timeout: 5_000 })
    createdOrgUrl = ''
  })
})
