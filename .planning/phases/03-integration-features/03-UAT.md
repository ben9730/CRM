---
status: resolved
phase: 03-integration-features
source: 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md
started: 2026-02-23T12:30:00Z
updated: 2026-02-23T18:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Organization Delete (RLS Fix)
expected: On the Organizations page, find an existing org. Click the delete button — a confirmation dialog appears. Confirm — org is removed from the list with a toast success message (no RLS error).
result: issue
reported: "עדין לא עובד ויש שגיאה — new row violates row-level security policy for table organizations"
severity: major

### 2. Log Interaction (Crash Fix)
expected: On a contact or deal detail page, click "Log Interaction". A modal opens with a type dropdown, subject, and notes fields — no crash, no black screen.
result: pass

### 3. Add Task (Crash Fix)
expected: On a contact or deal detail page, click "Add Task". A sheet form opens with title, due date, priority — no crash, no black screen.
result: issue
reported: "עובד אבל יש בעיה ביצרת טסק — form opens without crash but submitting shows 'Failed to create task. Please try again.' error"
severity: major

### 4. Edit Task (Crash Fix)
expected: On the /tasks page, click the edit icon on a task. A form opens with the existing task data pre-filled — no crash, no black screen.
result: issue
reported: "PASS — form opens without crash. But saving/updating fails: 'Failed to update task. Please try again.' when trying to change priority"
severity: major

### 5. Kanban Instant Update
expected: On the /deals Kanban board, click "New Deal", fill in the form, and submit. The new deal card appears immediately in the correct stage column — no page refresh needed.
result: issue
reported: "שגיאה בהוספה — full application crash on deal creation: black screen 'Application error: a client-side exception has occurred while loading healthcrm-tawny.vercel.app'"
severity: blocker

### 6. Deal Detail — Linked Contacts Section
expected: Open any deal's detail page (/deals/[id]). A "Contacts" section is visible on the page. If the deal has linked contacts, they are listed; if not, an empty state message appears.
result: pass

### 7. Header Search Navigation
expected: Click the search bar in the top header. Type a name and press Enter. The page navigates to /contacts?search=[term] and filters the contacts list.
result: pass
note: "User feedback: search only goes to contacts page — global multi-entity search (contacts+deals+orgs) would be better UX. Scoped to contacts by design (plan 03-05 locked decision). Candidate for phase 4."

### 8. Real User Initials in Header
expected: The avatar in the top-right header shows your real initials (from your profile name), not the hardcoded "JD".
result: pass
note: "User feedback: clicking the avatar should open a profile dropdown or menu — currently no click behavior. Candidate for phase 4."

## Summary

total: 8
passed: 4
issues: 4
pending: 0
skipped: 0

## Gaps

- truth: "Delete organization removes it from the list with a toast confirmation (no RLS error)"
  status: resolved
  reason: "User reported: עדין לא עובד ויש שגיאה — new row violates row-level security policy for table organizations"
  severity: major
  test: 1
  root_cause: "SELECT policy has 'deleted_at IS NULL' in its USING clause. When soft-delete UPDATE (SET deleted_at=now()) runs, Supabase's implicit RETURNING * causes Postgres to re-evaluate the SELECT policy against the new row state where deleted_at is now non-null — this fails and surfaces as 'new row violates RLS'. The prior migration fixed the wrong policy (UPDATE WITH CHECK) instead of the SELECT policy."
  artifacts:
    - path: "supabase/migrations/20260222102951_create_rls_policies_for_crm_tables.sql"
      issue: "SELECT policies for all 5 tables include 'deleted_at IS NULL' in USING clause — must be removed"
  missing:
    - "New migration: drop and recreate SELECT policies for organizations, contacts, deals, interactions, tasks without deleted_at IS NULL (app queries already filter this)"

- truth: "Add Task form submits successfully and creates the task"
  status: resolved
  reason: "User reported: form opens without crash but submitting shows 'Failed to create task. Please try again.' error"
  severity: major
  test: 3
  root_cause: "DB tasks table has CHECK constraint (priority IN ('low', 'normal', 'high')) but the Zod schema and SelectItem both use 'medium' — Postgres rejects the insert with a CHECK violation, caught by the error branch returning the generic failure message."
  artifacts:
    - path: "src/lib/actions/tasks.ts"
      issue: "Zod enum uses 'medium' instead of 'normal' (line ~21)"
    - path: "src/components/tasks/task-form.tsx"
      issue: "defaultValue and SelectItem value use 'medium' instead of 'normal' (lines ~138, 148)"
  missing:
    - "Change z.enum(['low', 'medium', 'high']) to z.enum(['low', 'normal', 'high']) in tasks.ts"
    - "Change defaultValue and SelectItem value from 'medium' to 'normal' in task-form.tsx (label stays 'Medium')"

- truth: "Edit Task saves changes successfully"
  status: resolved
  reason: "User reported: form opens without crash, but saving shows 'Failed to update task. Please try again.' when changing priority"
  severity: major
  test: 4
  root_cause: "Same root cause as test 3 — priority 'medium' sent by form fails the DB CHECK constraint ('low', 'normal', 'high') on UPDATE as well as INSERT."
  artifacts:
    - path: "src/lib/actions/tasks.ts"
      issue: "Same Zod enum mismatch"
    - path: "src/components/tasks/task-form.tsx"
      issue: "Same SelectItem value mismatch"
  missing:
    - "Same fix as test 3 — covered by the same 2-line change"

- truth: "New deal creation succeeds and card appears in Kanban without page refresh"
  status: resolved
  reason: "User reported: full application crash on deal creation — black screen 'Application error: a client-side exception has occurred'"
  severity: blocker
  test: 5
  root_cause: "useEffect in deal-form.tsx has 'onSuccess' in its dependency array. When onSuccess(deal) calls setOpen(false) in DealCreateButton, that component re-renders with a new handleSuccess function reference. The effect re-fires (onSuccess changed) while state.success is still truthy, calling onSuccess(deal) a second time — prepending the same deal twice into the Kanban deals array. dnd-kit's SortableContext throws a duplicate-key runtime error, caught by Next.js as a client-side exception."
  artifacts:
    - path: "src/components/deals/deal-form.tsx"
      issue: "useEffect dependency array includes onSuccess — causes double-fire when onSuccess reference changes after setOpen(false) (line ~76)"
  missing:
    - "Remove onSuccess from useEffect deps array in deal-form.tsx — change ', [state, onSuccess]' to ', [state]'"
