import { test, expect } from '@playwright/test'

/**
 * Interactions CRUD E2E tests.
 * Interactions are logged from a contact's detail page via the interaction timeline.
 * We need at least one contact to exist — we create a temp contact for this test.
 */

const TEST_CONTACT_FIRST = '[E2E] Interaction'
const TEST_CONTACT_LAST = 'TestUser'
const TEST_CONTACT_FULL = `${TEST_CONTACT_FIRST} ${TEST_CONTACT_LAST}`
const TEST_INTERACTION_SUBJECT = '[E2E] Test Interaction'
const EDITED_INTERACTION_SUBJECT = '[E2E] Test Interaction (Edited)'

test.describe('Interactions CRUD', () => {
  let contactUrl = ''

  test.beforeAll(async ({ browser }) => {
    // Create a contact to use for interactions testing
    const page = await browser.newPage()
    await page.goto('/contacts')
    await page.getByRole('button', { name: /new contact/i }).click()
    await page.getByLabel(/first name/i).fill(TEST_CONTACT_FIRST)
    await page.getByLabel(/last name/i).fill(TEST_CONTACT_LAST)
    await page.getByRole('button', { name: /create contact/i }).click()

    // Wait for contact to appear and navigate to detail
    await expect(page.getByText(TEST_CONTACT_FULL)).toBeVisible({ timeout: 15_000 })
    await page.getByText(TEST_CONTACT_FULL).first().click()
    await page.waitForURL('**/contacts/**')
    contactUrl = page.url()
    await page.close()
  })

  test.afterAll(async ({ browser }) => {
    // Cleanup: delete the temp contact (cascades to interactions via soft-delete)
    if (contactUrl) {
      const page = await browser.newPage()
      try {
        await page.goto(contactUrl)
        const deleteButton = page.getByRole('button', { name: /delete/i }).first()
        if (await deleteButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await deleteButton.click()
          const confirmButton = page.getByRole('button', { name: /delete/i }).last()
          await confirmButton.click()
          await page.waitForURL('**/contacts', { timeout: 10_000 })
        }
      } catch {
        // Ignore cleanup errors
      }
      await page.close()
    }
  })

  test('log an interaction and verify it appears in the timeline', async ({ page }) => {
    await page.goto(contactUrl)

    // Click "Log Interaction" button
    await page.getByRole('button', { name: /log interaction/i }).click()

    // Dialog should open
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    // Fill in interaction subject
    await page.getByLabel(/subject/i).fill(TEST_INTERACTION_SUBJECT)

    // Submit
    await page.getByRole('button', { name: /log interaction/i }).last().click()

    // Interaction should appear in the timeline
    await expect(page.getByText(TEST_INTERACTION_SUBJECT)).toBeVisible({ timeout: 15_000 })
  })

  test('log, edit, and delete an interaction', async ({ page }) => {
    await page.goto(contactUrl)

    // --- Log ---
    await page.getByRole('button', { name: /log interaction/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })
    await page.getByLabel(/subject/i).fill(TEST_INTERACTION_SUBJECT)
    await page.getByRole('button', { name: /log interaction/i }).last().click()

    // Verify it appears
    await expect(page.getByText(TEST_INTERACTION_SUBJECT)).toBeVisible({ timeout: 15_000 })

    // --- Edit ---
    // The interaction timeline has edit/delete buttons that appear on hover
    const interactionItem = page.getByText(TEST_INTERACTION_SUBJECT).first()
    await interactionItem.hover()

    // Click the edit button near the interaction
    const editButton = page.getByRole('button', { name: /edit/i }).first()
    await editButton.click()

    // Edit dialog opens
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    // Change the subject
    const subjectInput = page.getByLabel(/subject/i)
    await subjectInput.clear()
    await subjectInput.fill(EDITED_INTERACTION_SUBJECT)
    await page.getByRole('button', { name: /update interaction/i }).click()

    // Verify edit is reflected
    await expect(page.getByText(EDITED_INTERACTION_SUBJECT)).toBeVisible({ timeout: 15_000 })

    // --- Delete ---
    await page.getByText(EDITED_INTERACTION_SUBJECT).first().hover()
    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    await deleteButton.click()

    // Confirm
    const confirmButton = page.getByRole('button', { name: /delete/i }).last()
    await confirmButton.click()

    // Interaction should no longer appear
    await expect(page.getByText(EDITED_INTERACTION_SUBJECT)).not.toBeVisible({ timeout: 10_000 })
  })
})
