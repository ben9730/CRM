---
status: testing
phase: 03-integration-features
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md
started: 2026-02-23T10:00:00Z
updated: 2026-02-23T10:00:00Z
---

## Current Test

number: 15
name: Overdue Task Flagging & Status Filter
expected: |
  Tasks past their due date show red text and a warning icon. On /tasks page, filter tabs (All/Pending/Completed/Overdue) filter correctly. Overdue tab shows only past-due incomplete tasks.
awaiting: user response

## Tests

### 1. Create Organization
expected: Navigate to /organizations. Click "New Organization" button. A slide-over form appears with fields for name, type, phone, website, address. Fill in details, submit. Toast success message. New org appears in the list.
result: pass

### 2. Edit & Delete Organization
expected: On an org row, click edit — slide-over pre-fills existing data. Change a field, submit — toast success, list updates. Click delete — confirmation dialog appears. Confirm — org removed from list with toast.
result: issue
reported: "edit works, delete shows error: new row violates row-level security policy for table organizations"
severity: major

### 3. Search & Paginate Organizations
expected: Type a name in the search box and press Enter (or click search). List filters to matching orgs. Clear search to restore full list. If enough orgs exist, pagination controls appear at bottom with page numbers.
result: issue
reported: "bottom page search works, top global header search bar does nothing — doesn't filter or navigate"
severity: minor

### 4. Organization Detail Page
expected: Click an org name to navigate to /organizations/[id]. Detail page shows org info and two tabs: Contacts and Deals. Each tab lists the linked entities for that organization.
result: pass

### 5. Create Contact with Tags & Multi-Org
expected: Navigate to /contacts. Click "New Contact". Form appears with name, email, phone, title fields, an organization multi-select, and a tag input. Assign one or more orgs, add tags (predefined or free-form). Submit — toast success, contact appears in list.
result: pass

### 6. Search & Filter Contacts
expected: Type in search box and submit — contacts filter by name/email (full-text). Use tag dropdown to filter by tag. Use org dropdown to filter by organization. Filters combine correctly. Clear to reset.
result: pass

### 7. Contact Table/Grid View Toggle
expected: On the contacts page, a toggle switch (table/grid) is visible. Clicking grid shows contacts as cards. Clicking table shows contacts in a data table with columns. Both views show the same data.
result: pass

### 8. Contact Detail Page
expected: Click a contact name to navigate to /contacts/[id]. Page shows contact info, linked deals, linked tasks, and interaction timeline. Each section shows real data from Supabase (or empty state if none exist).
result: pass

### 9. Create Deal on Kanban
expected: Navigate to /deals. Kanban board shows columns per pipeline stage (Prospecting, Qualification, etc.). Click "New Deal". Sheet form appears with stage, value, expected close date, organization, contacts, notes. Submit — deal card appears in the correct stage column. Stage column header shows updated count and total value.
result: issue
reported: "creates successfully but deal only appears in the correct column after manual page refresh — no automatic update"
severity: major

### 10. Drag-and-Drop Deal Stage Change
expected: On the Kanban board, drag a deal card from one stage column to another. The card moves instantly (optimistic update). Column counts and values update immediately. No confirmation dialog needed.
result: pass

### 11. Deal Detail Page
expected: Click a deal card to navigate to /deals/[id]. Detail page shows deal info (stage, value, close date, org, notes), linked contacts, interaction timeline, and linked tasks — all with real data.
result: issue
reported: "deal info, linked tasks, and interaction timeline visible — but no linked contacts section found on the page"
severity: minor

### 12. Log Interaction
expected: On a contact or deal detail page, click "Log Interaction" button. A modal dialog appears with type dropdown (call/email/meeting/note), subject, notes, and optional contact/deal link. Submit — interaction appears in the timeline below, sorted chronologically.
result: issue
reported: "clicking Log button causes full application crash — black screen with 'Application error: a client-side exception has occurred'"
severity: blocker

### 13. Global Interactions & Tasks Pages
expected: Navigate to /interactions — paginated list of all interactions with type, subject, linked contact/deal, and date. Navigate to /tasks — list of all tasks with status, due date, and linked entities.
result: issue
reported: "tasks page loads and shows tasks with overdue flagging correctly; clicking edit on a task crashes with same 'Application error' black screen — edit/interactions functionality may not be implemented or crashes"
severity: blocker

### 14. Create & Complete Task
expected: On a contact or deal detail page, click "Add Task". Sheet form with title, description, due date, priority, contact/deal link. Submit — task appears in linked tasks list. Click the checkbox on a task — it toggles complete/incomplete. Visual state updates immediately.
result: issue
reported: "same 'Application error' crash on both interactions and tasks pages when trying to add — same client-side exception as test 12 and 13"
severity: blocker

### 15. Overdue Task Flagging & Status Filter
expected: Tasks past their due date (and not completed) show red text and a warning icon. On /tasks page, filter tabs (All/Pending/Completed/Overdue) filter the list correctly. Overdue tab shows only past-due incomplete tasks.
result: [pending]

### 16. Sidebar Overdue Badge
expected: In the left sidebar, the "Tasks" navigation item shows a red badge with the count of overdue tasks. The number matches the actual overdue count.
result: [pending]

### 17. Dashboard Live Metrics
expected: Navigate to /dashboard (or it's the landing page after login). Four widgets visible: Metrics Cards (deal count, pipeline value, tasks due today, overdue count), Pipeline Summary (bar chart by stage with colors), Tasks Widget (due today list), Activity Feed (recent interactions). All show live data, not mock/placeholder values.
result: [pending]

## Summary

total: 17
passed: 7
issues: 8
pending: 3
skipped: 0

## Gaps

- truth: "Delete organization removes it from the list with a toast confirmation"
  status: failed
  reason: "User reported: edit works, delete shows error: new row violates row-level security policy for table organizations"
  severity: major
  test: 2
  artifacts: []
  missing: []

- truth: "Global header search bar filters contacts, deals, and organizations"
  status: failed
  reason: "User reported: bottom page search works, top global header search bar does nothing — doesn't filter or navigate"
  severity: minor
  test: 3
  artifacts: []
  missing: []

- truth: "Header shows the logged-in user's name or profile info"
  status: failed
  reason: "User reported: only shows initials (JD) in avatar, no user name or profile details visible — unclear if connected to real user"
  severity: minor
  test: 8
  artifacts: []
  missing: []

- truth: "After creating a deal, it appears immediately in the correct Kanban column without page refresh"
  status: failed
  reason: "User reported: creates successfully but deal only appears in the correct column after manual page refresh — no automatic update"
  severity: major
  test: 9
  artifacts: []
  missing: []

- truth: "Deal detail page shows linked contacts section with contacts associated to the deal"
  status: failed
  reason: "User reported: deal info, linked tasks, and interaction timeline visible — but no linked contacts section found on the page"
  severity: minor
  test: 11
  artifacts: []
  missing: []

- truth: "Clicking Log button on Interaction Timeline opens a modal dialog for logging an interaction"
  status: failed
  reason: "User reported: clicking Log button causes full application crash — black screen with 'Application error: a client-side exception has occurred'"
  severity: blocker
  test: 12
  artifacts: []
  missing: []

- truth: "Editing a task opens a form and saves changes without crashing"
  status: failed
  reason: "User reported: tasks page loads correctly with overdue flagging, but clicking edit crashes with same 'Application error' black screen"
  severity: blocker
  test: 13
  artifacts: []
  missing: []

- truth: "Clicking Add Task opens a sheet form for creating a new task"
  status: failed
  reason: "User reported: same 'Application error' crash on both interactions and tasks pages when trying to add — same client-side exception as tests 12 and 13"
  severity: blocker
  test: 14
  artifacts: []
  missing: []
