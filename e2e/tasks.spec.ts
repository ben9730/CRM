import { test, expect } from '@playwright/test'

/**
 * Tasks CRUD E2E tests.
 * Test data uses [E2E] prefix for easy identification and cleanup.
 */

const TEST_TASK_TITLE = '[E2E] Test Task'
const EDITED_TASK_TITLE = '[E2E] Test Task (Edited)'

test.describe('Tasks CRUD', () => {
  test.afterEach(async ({ page }) => {
    // Cleanup: delete any [E2E] tasks that may remain
    await page.goto('/tasks')

    // Look for any E2E test tasks and delete them
    const e2eTasks = page.getByText(/\[E2E\]/, { exact: false })
    const count = await e2eTasks.count()

    for (let i = 0; i < count; i++) {
      try {
        // Hover over the task row to reveal the delete button
        const taskRow = e2eTasks.first()
        await taskRow.hover()
        const deleteButton = page.getByRole('button', { name: /delete/i }).first()
        if (await deleteButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await deleteButton.click()
          // Confirm dialog
          const confirmButton = page.getByRole('button', { name: /delete/i }).last()
          await confirmButton.click()
          await page.waitForTimeout(1_000)
        }
      } catch {
        // Ignore cleanup errors
        break
      }
    }
  })

  test('create a task and verify it appears in the task list', async ({ page }) => {
    await page.goto('/tasks')

    // Open create task form
    await page.getByRole('button', { name: /add task/i }).click()

    // Fill in the task title
    await page.getByLabel(/title/i).fill(TEST_TASK_TITLE)

    // Submit
    await page.getByRole('button', { name: /create task/i }).click()

    // Task should appear in the list
    await expect(page.getByText(TEST_TASK_TITLE)).toBeVisible({ timeout: 15_000 })
  })

  test('create a task and complete it', async ({ page }) => {
    await page.goto('/tasks')

    // --- Create ---
    await page.getByRole('button', { name: /add task/i }).click()
    await page.getByLabel(/title/i).fill(TEST_TASK_TITLE)
    await page.getByRole('button', { name: /create task/i }).click()

    // Wait for task to appear
    await expect(page.getByText(TEST_TASK_TITLE)).toBeVisible({ timeout: 15_000 })

    // --- Complete the task ---
    // The complete checkbox/button is the circle icon next to each task
    // It's a button with aria role that toggles completion
    const taskText = page.getByText(TEST_TASK_TITLE).first()
    const taskRow = taskText.locator('..').locator('..').locator('..')
    const completeButton = taskRow.locator('button').first()
    await completeButton.click()

    // After completion, a success toast should appear or the task moves to completed state
    // Navigate to completed tab to verify
    await page.getByRole('link', { name: /completed/i }).click()
    await expect(page.getByText(TEST_TASK_TITLE)).toBeVisible({ timeout: 10_000 })
  })

  test('create, edit, and verify a task', async ({ page }) => {
    await page.goto('/tasks')

    // --- Create ---
    await page.getByRole('button', { name: /add task/i }).click()
    await page.getByLabel(/title/i).fill(TEST_TASK_TITLE)
    await page.getByRole('button', { name: /create task/i }).click()

    // Wait for task to appear
    await expect(page.getByText(TEST_TASK_TITLE)).toBeVisible({ timeout: 15_000 })

    // --- Edit the task ---
    // Hover over task to reveal edit button
    await page.getByText(TEST_TASK_TITLE).first().hover()
    await page.getByRole('button', { name: /edit/i }).first().click()

    // Edit sheet should open — change the title
    const titleInput = page.getByLabel(/title/i)
    await titleInput.clear()
    await titleInput.fill(EDITED_TASK_TITLE)
    await page.getByRole('button', { name: /update task/i }).click()

    // Verify edited task appears
    await expect(page.getByText(EDITED_TASK_TITLE)).toBeVisible({ timeout: 15_000 })
  })

  test('create and delete a task', async ({ page }) => {
    await page.goto('/tasks')

    // --- Create ---
    await page.getByRole('button', { name: /add task/i }).click()
    await page.getByLabel(/title/i).fill(TEST_TASK_TITLE)
    await page.getByRole('button', { name: /create task/i }).click()

    // Wait for task to appear
    await expect(page.getByText(TEST_TASK_TITLE)).toBeVisible({ timeout: 15_000 })

    // --- Delete ---
    await page.getByText(TEST_TASK_TITLE).first().hover()
    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    await expect(deleteButton).toBeVisible({ timeout: 5_000 })
    await deleteButton.click()

    // Confirm dialog
    const confirmButton = page.getByRole('button', { name: /delete/i }).last()
    await confirmButton.click()

    // Task should no longer appear in the list
    await expect(page.getByText(TEST_TASK_TITLE)).not.toBeVisible({ timeout: 10_000 })
  })
})
