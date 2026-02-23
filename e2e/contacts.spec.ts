import { test, expect } from '@playwright/test'

/**
 * Contacts CRUD E2E tests.
 * Test data uses [E2E] prefix for easy identification and cleanup.
 * Each test creates its own data and cleans up in afterEach.
 */

const TEST_CONTACT_FIRST = '[E2E] Test'
const TEST_CONTACT_LAST = 'Contact'
const TEST_CONTACT_FULL = `${TEST_CONTACT_FIRST} ${TEST_CONTACT_LAST}`
const TEST_CONTACT_PHONE = '+1 (555) 999-0001'
const EDITED_PHONE = '+1 (555) 999-0002'

test.describe('Contacts CRUD', () => {
  let createdContactUrl = ''

  test.afterEach(async ({ page }) => {
    // Cleanup: navigate to the created contact and delete it if still present
    if (createdContactUrl) {
      try {
        await page.goto(createdContactUrl)
        // Check if the page loaded the contact (not a redirect)
        const deleteButton = page.getByRole('button', { name: /delete/i }).first()
        if (await deleteButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
          await deleteButton.click()
          // Confirm dialog
          const confirmButton = page.getByRole('button', { name: /delete/i }).last()
          await confirmButton.click()
          // Wait for redirect back to contacts list
          await page.waitForURL('**/contacts', { timeout: 10_000 })
        }
      } catch {
        // Contact may have already been deleted by the test — ignore
      }
      createdContactUrl = ''
    }
  })

  test('create a contact and verify it appears in the list', async ({ page }) => {
    await page.goto('/contacts')

    // Open create dialog
    await page.getByRole('button', { name: /new contact/i }).click()

    // Fill in the form
    await page.getByLabel(/first name/i).fill(TEST_CONTACT_FIRST)
    await page.getByLabel(/last name/i).fill(TEST_CONTACT_LAST)
    await page.getByLabel(/phone/i).fill(TEST_CONTACT_PHONE)

    // Submit
    await page.getByRole('button', { name: /create contact/i }).click()

    // Should see success and the contact in the list
    await expect(page.getByText(TEST_CONTACT_FULL)).toBeVisible({ timeout: 15_000 })
  })

  test('create, edit, and verify contact changes', async ({ page }) => {
    // --- Create ---
    await page.goto('/contacts')
    await page.getByRole('button', { name: /new contact/i }).click()
    await page.getByLabel(/first name/i).fill(TEST_CONTACT_FIRST)
    await page.getByLabel(/last name/i).fill(TEST_CONTACT_LAST)
    await page.getByLabel(/phone/i).fill(TEST_CONTACT_PHONE)
    await page.getByRole('button', { name: /create contact/i }).click()

    // Wait for contact to appear in list
    await expect(page.getByText(TEST_CONTACT_FULL)).toBeVisible({ timeout: 15_000 })

    // Navigate to contact detail (click the contact row/name link)
    await page.getByText(TEST_CONTACT_FULL).first().click()
    await page.waitForURL('**/contacts/**')
    createdContactUrl = page.url()

    // --- Edit ---
    await page.getByRole('button', { name: /edit/i }).click()

    // Change the phone number
    const phoneInput = page.getByLabel(/phone/i)
    await phoneInput.clear()
    await phoneInput.fill(EDITED_PHONE)
    await page.getByRole('button', { name: /save changes/i }).click()

    // Should see success toast or the edit reflected
    await expect(page.getByText(EDITED_PHONE)).toBeVisible({ timeout: 15_000 })
  })

  test('create and delete a contact', async ({ page }) => {
    // --- Create ---
    await page.goto('/contacts')
    await page.getByRole('button', { name: /new contact/i }).click()
    await page.getByLabel(/first name/i).fill(TEST_CONTACT_FIRST)
    await page.getByLabel(/last name/i).fill(TEST_CONTACT_LAST)
    await page.getByRole('button', { name: /create contact/i }).click()

    // Wait for contact to appear
    await expect(page.getByText(TEST_CONTACT_FULL)).toBeVisible({ timeout: 15_000 })

    // Navigate to contact detail
    await page.getByText(TEST_CONTACT_FULL).first().click()
    await page.waitForURL('**/contacts/**')

    // --- Delete ---
    await page.getByRole('button', { name: /delete/i }).first().click()

    // Confirm dialog appears — click the confirm button
    const confirmButton = page.getByRole('button', { name: /delete/i }).last()
    await expect(confirmButton).toBeVisible({ timeout: 5_000 })
    await confirmButton.click()

    // Should redirect back to contacts list after delete
    await page.waitForURL('**/contacts', { timeout: 15_000 })

    // Contact should no longer appear in the list
    await expect(page.getByText(TEST_CONTACT_FULL)).not.toBeVisible({ timeout: 5_000 })

    // Mark as cleaned up (afterEach won't need to do anything)
    createdContactUrl = ''
  })
})
