---
status: diagnosed
trigger: "Investigate why the task creation form is missing a Linked Contact field"
created: 2026-02-23T00:00:00Z
updated: 2026-02-23T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — LinkedTasks in contact-detail-client.tsx omits allContacts prop
test: Read component call site at line 54 of contact-detail-client.tsx
expecting: allContacts prop missing from LinkedTasks usage
next_action: diagnosis returned to caller

## Symptoms

expected: Task form (from contact detail page) shows Linked Contact dropdown field
actual: Linked Contact dropdown never renders; contacts array is empty []
errors: No runtime error — the field is conditionally hidden when contacts.length === 0
reproduction: Open any contact detail page -> click Add task -> form has no Linked Contact field
started: Always broken (prop never wired up)

## Eliminated

- hypothesis: DB schema missing contact_id column
  evidence: tasks table has `contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL` at line 177 of migration 20260222102918
  timestamp: 2026-02-23T00:00:00Z

- hypothesis: Server action (createTask/updateTask) missing contact_id handling
  evidence: Both actions parse contact_id from FormData via Zod and write it to DB; also auto-resolves organization_id
  timestamp: 2026-02-23T00:00:00Z

- hypothesis: TaskForm component missing Linked Contact field
  evidence: task-form.tsx lines 153-176 render a full Select for contact_id — but guarded by `contacts.length > 0`
  timestamp: 2026-02-23T00:00:00Z

- hypothesis: TaskFormSheet not passing contacts through
  evidence: TaskFormSheet accepts and forwards contacts/defaultContactId props correctly to TaskForm
  timestamp: 2026-02-23T00:00:00Z

- hypothesis: AddTaskButton on /tasks page not getting contacts
  evidence: tasks/page.tsx fetches allContacts via getContacts({pageSize:200}) and passes them to AddTaskButton — deal page path works fine
  timestamp: 2026-02-23T00:00:00Z

## Evidence

- timestamp: 2026-02-23T00:00:00Z
  checked: src/components/contact-detail/contact-detail-client.tsx line 54
  found: <LinkedTasks tasks={tasks} contactId={contact.id} allDeals={allDeals} />
  implication: allContacts prop is NOT passed — defaults to empty array []

- timestamp: 2026-02-23T00:00:00Z
  checked: src/components/contact-detail/linked-tasks.tsx interface LinkedTasksProps
  found: allContacts?: { id, first_name, last_name }[] defaults to []
  implication: When not passed, allContacts = [] and TaskFormSheet receives contacts=[]

- timestamp: 2026-02-23T00:00:00Z
  checked: src/components/tasks/task-form.tsx lines 153-176
  found: Linked Contact field wrapped in {contacts.length > 0 && (...)}
  implication: Empty contacts array causes the entire field to not render

- timestamp: 2026-02-23T00:00:00Z
  checked: src/app/(app)/contacts/[id]/page.tsx lines 20-39
  found: allContacts IS fetched (getContacts pageSize:200) and IS passed to ContactDetailClient
  implication: The data is available at the page level but dropped one level down

- timestamp: 2026-02-23T00:00:00Z
  checked: src/components/contact-detail/contact-detail-client.tsx lines 29-37
  found: allContacts prop IS in the interface and IS destructured
  implication: allContacts reaches ContactDetailClient but is passed to InteractionTimeline (line 63) instead of LinkedTasks (line 54)

## Resolution

root_cause: |
  In contact-detail-client.tsx line 54, the <LinkedTasks> component call omits the
  allContacts prop. The data IS fetched at the page level and IS received by
  ContactDetailClient, but is only forwarded to <InteractionTimeline> — not to
  <LinkedTasks>. Because allContacts defaults to [], the task-form's Linked Contact
  field is guarded by `contacts.length > 0` and silently never renders.

fix: Add allContacts={allContacts} to the LinkedTasks call on line 54 of contact-detail-client.tsx
verification: pending
files_changed:
  - src/components/contact-detail/contact-detail-client.tsx
