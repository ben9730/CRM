---
phase: 03-integration-features
plan: 03
subsystem: crm-features
tags: [supabase, next.js, react, server-actions, zod, typescript, dashboard, interactions, tasks]

# Dependency graph
requires:
  - phase: 03-integration-features
    plan: 01
    provides: getAccountId, ActionState, shared components, org/contact queries, app types
  - phase: 03-integration-features
    plan: 02
    provides: DealWithRelations, getDeal, getDealsByContact, pipeline stages, deal_contacts

provides:
  - getInteractions, getInteractionsByContact, getInteractionsByDeal, getRecentInteractions queries
  - createInteraction, updateInteraction, deleteInteraction Server Actions
  - getTasks, getTasksByContact, getTasksByDeal, getTasksDueToday, getOverdueTaskCount queries
  - createTask, updateTask, completeTask, deleteTask Server Actions
  - getDashboardMetrics aggregation query
  - InteractionWithRelations, TaskWithRelations types in app.ts
  - InteractionTimeline with edit/delete and Log button (real data)
  - LinkedTasks with completion toggle and Add Task button (real data)
  - Dashboard fully wired: MetricsCards, PipelineSummary, TasksWidget, ActivityFeed
  - /interactions, /tasks, /dashboard pages as Server Components
  - Sidebar overdue badge via AppShell Server Component + getOverdueTaskCount

affects:
  - 04-polish-launch (final phase; Phase 3 complete)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - getDashboardMetrics: parallel Promise.all for aggregation queries
    - AppShell as Server Component — fetches overdue count, passes to AppSidebar client
    - InteractionFormModal: Dialog pattern for quick-log interactions
    - TaskFormSheet: Sheet pattern consistent with other entity forms
    - isOverdue computed at query time (not in DB) — due_date < today and !is_complete
    - color-mix(in oklch) for stage hex colors in PipelineSummary bar chart

key-files:
  created:
    - src/lib/queries/interactions.ts
    - src/lib/actions/interactions.ts
    - src/lib/queries/tasks.ts
    - src/lib/actions/tasks.ts
    - src/lib/queries/dashboard.ts
    - src/components/interactions/interaction-form.tsx
    - src/components/interactions/interaction-form-modal.tsx
    - src/components/interactions/interaction-list.tsx
    - src/components/interactions/log-interaction-button.tsx
    - src/components/tasks/task-form.tsx
    - src/components/tasks/task-form-sheet.tsx
    - src/components/tasks/task-list.tsx
    - src/components/tasks/task-filters.tsx
    - src/components/tasks/add-task-button.tsx
  modified:
    - src/lib/types/app.ts (added InteractionWithRelations, TaskWithRelations)
    - src/lib/queries/contacts.ts (updated getContactTasks/getContactInteractions to return new types)
    - src/lib/queries/deals.ts (added getDealsList)
    - src/components/contact-detail/interaction-timeline.tsx (real data, edit/delete/log actions)
    - src/components/contact-detail/linked-tasks.tsx (real data, complete toggle, add/edit/delete)
    - src/components/contact-detail/contact-detail-client.tsx (updated to TaskWithRelations, allContacts/allDeals props)
    - src/components/deals/deal-detail-view.tsx (replaced placeholders with real InteractionTimeline + LinkedTasks)
    - src/components/dashboard/metrics-cards.tsx (props-based, removed mock data)
    - src/components/dashboard/pipeline-summary.tsx (props-based, live stage data, color-mix bars)
    - src/components/dashboard/tasks-widget.tsx (props-based, removed mock data)
    - src/components/dashboard/activity-feed.tsx (props-based, InteractionWithRelations, empty state)
    - src/components/layout/app-shell.tsx (Server Component, fetches overdueTaskCount)
    - src/components/layout/app-sidebar.tsx (overdueTaskCount prop, red badge on Tasks)
    - src/app/(app)/dashboard/page.tsx (Server Component, getDashboardMetrics)
    - src/app/(app)/interactions/page.tsx (Server Component with pagination)
    - src/app/(app)/tasks/page.tsx (Server Component with status filter + pagination)
    - src/app/(app)/contacts/[id]/page.tsx (passes allContacts, allDeals to ContactDetailClient)
    - src/app/(app)/deals/[id]/page.tsx (fetches interactions + tasks for deal)

key-decisions:
  - "AppShell converted to Server Component to fetch overdue count — AppSidebar stays client for usePathname"
  - "getDashboardMetrics uses Promise.all for parallel fetching — avoids sequential waterfalls"
  - "isOverdue computed application-side on fetch (not DB column) — consistent across all task queries"
  - "InteractionFormModal uses Dialog (not Sheet) — interactions are quick-log, not full-detail forms"
  - "getDealsList added to deals queries — lightweight dropdown list without full relations"
  - "Zod v4 enum: errorMap renamed; used .refine() instead for custom error message"

# Metrics
duration: 14min
completed: 2026-02-22
---

# Phase 3 Plan 03: Interactions, Tasks, and Dashboard Summary

**Full CRUD for interactions and tasks wired to live Supabase — timelines on contact/deal detail pages, overdue flagging, status filtering, sidebar badge, and all four dashboard widgets powered by live aggregation queries**

## Performance

- **Duration:** 14 min
- **Started:** 2026-02-22T12:57:32Z
- **Completed:** 2026-02-22T13:11:47Z
- **Tasks:** 3
- **Files modified:** 32

## Accomplishments

- **Interactions CRUD**: `getInteractions`, `getInteractionsByContact`, `getInteractionsByDeal`, `getRecentInteractions` queries; `createInteraction`, `updateInteraction`, `deleteInteraction` server actions with Zod validation and auth checks; Dialog-based quick-log form; global `/interactions` feed page with pagination; chronological `InteractionTimeline` with edit/delete inline actions on both contact and deal detail pages.

- **Tasks CRUD**: `getTasks` (with status filter: pending/completed/overdue), `getTasksByContact`, `getTasksByDeal`, `getTasksDueToday`, `getOverdueTaskCount` queries; `createTask`, `updateTask`, `completeTask` (toggle), `deleteTask` server actions; `TaskForm` in Sheet slide-over; `TaskList` with completion checkbox, overdue visual (red text + AlertTriangle), edit/delete per row; `TaskFilters` URL-based tab filter; `LinkedTasks` rewritten with real data and task creation button; sidebar badge showing overdue count.

- **Dashboard**: `getDashboardMetrics` aggregation query using `Promise.all` for parallel fetches; all four widgets updated — `MetricsCards` shows live deal counts + pipeline value + task metrics, `PipelineSummary` shows live stage bar chart from DB hex colors, `TasksWidget` shows live due-today count and upcoming task list, `ActivityFeed` shows recent interactions with empty state; dashboard converted from client with mock data to Server Component with live data.

- **Code review (PROC-03)**: All server actions have `'use server'` directive, auth check (`supabase.auth.getUser()`), and `getAccountId` call. All queries filter by `deleted_at IS NULL`. No `any` types in queries or actions. Zod validation on all Server Action inputs.

## Task Commits

1. **Task 1: Interactions CRUD** - `4ded7bb` (feat)
2. **Task 2: Tasks CRUD** - `4da9024` (feat)
3. **Task 3: Dashboard wiring + code review** - `6619054` (feat)

## Files Created/Modified

**Created (key files):**
- `src/lib/queries/interactions.ts` — 4 query functions with InteractionWithRelations
- `src/lib/actions/interactions.ts` — createInteraction, updateInteraction, deleteInteraction
- `src/lib/queries/tasks.ts` — 6 query functions with TaskWithRelations and isOverdue
- `src/lib/actions/tasks.ts` — createTask, updateTask, completeTask, deleteTask
- `src/lib/queries/dashboard.ts` — getDashboardMetrics with parallel queries
- `src/components/interactions/` — InteractionForm, InteractionFormModal, InteractionList, LogInteractionButton
- `src/components/tasks/` — TaskForm, TaskFormSheet, TaskList, TaskFilters, AddTaskButton

**Modified:**
- `src/lib/types/app.ts` — added InteractionWithRelations, TaskWithRelations types
- All four dashboard widgets rewired from mock data to props
- InteractionTimeline and LinkedTasks rewritten with real data + CRUD actions
- DealDetailView: replaced 03-03 placeholders with live InteractionTimeline and LinkedTasks
- AppShell: Server Component fetching overdue count for sidebar badge
- All detail pages: parallel data fetching for interaction/task related data

## Decisions Made

- **AppShell as Server Component**: The AppShell needed to be a Server Component to fetch `getOverdueTaskCount()`. AppSidebar stays client-only (uses `usePathname`). The count is passed as a prop.
- **Promise.all aggregation**: `getDashboardMetrics` uses `Promise.all` to fetch deals, tasks, and interactions simultaneously — avoids sequential waterfall and keeps dashboard responsive.
- **isOverdue application-side**: Computed at query time by comparing `due_date < today` — consistent across all contexts without needing a DB column.
- **Dialog for interactions**: Interactions use Dialog (modal) rather than Sheet — quick-log pattern; interactions don't have enough fields to warrant a full slide-over.
- **getDealsList added**: Lightweight `id, title` query added to deals for form dropdowns, avoiding full relation load.
- **Zod v4 enum fix**: Zod v4 renamed `errorMap` — used `.refine()` approach for the enum type constraint.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Zod v4 enum errorMap parameter removed**
- **Found during:** Task 1 TypeScript check
- **Issue:** Zod v4 removed the `errorMap` option from `z.enum()` — TypeScript error on interaction type schema
- **Fix:** Replaced `z.enum([...], { errorMap: ... })` with `z.enum([...]).refine(...)` pattern
- **Files modified:** `src/lib/actions/interactions.ts`
- **Verification:** `npx tsc --noEmit` passes

**2. [Rule 1 - Bug] Pagination component uses `currentPage` prop not `page`**
- **Found during:** Task 1 TypeScript check
- **Issue:** The existing Pagination component expects `currentPage` prop, not `page`
- **Fix:** Updated both `/interactions/page.tsx` and `/tasks/page.tsx` to use `currentPage={result.page}`
- **Files modified:** `src/app/(app)/interactions/page.tsx`, `src/app/(app)/tasks/page.tsx`
- **Verification:** `npx tsc --noEmit` passes

---

**Total deviations:** 2 auto-fixed (both Rule 1 bugs)
**Impact on plan:** Minor corrections. All planned functionality delivered.

## Code Review Results (PROC-03)

Reviewed scope: `src/lib/queries/`, `src/lib/actions/`, new dashboard and interaction/task components.

| Check | Result |
|-------|--------|
| `'use server'` in all action files | PASS — all 6 action files have directive |
| Auth check in all mutations | PASS — `supabase.auth.getUser()` + error guard in every action |
| `deleted_at` filter on all queries | PASS — 35 occurrences across query files |
| No `any` types in queries/actions | PASS — TypeScript strict check passes cleanly |
| Zod validation on all inputs | PASS — all create/update actions validate via Zod schema |
| `getAccountId` called in create actions | PASS — interactions and tasks actions both call it |

**Critical findings:** None.

## Self-Check: PASSED

| Check | Status |
|-------|--------|
| src/lib/queries/interactions.ts | FOUND |
| src/lib/queries/tasks.ts | FOUND |
| src/lib/queries/dashboard.ts | FOUND |
| src/lib/actions/interactions.ts | FOUND |
| src/lib/actions/tasks.ts | FOUND |
| src/components/interactions/ (4 files) | FOUND |
| src/components/tasks/ (5 files) | FOUND |
| Commit 4ded7bb (Task 1) | FOUND |
| Commit 4da9024 (Task 2) | FOUND |
| Commit 6619054 (Task 3) | FOUND |
| npx next build — no errors | PASSED |
| No mock data imports in active components | PASSED |

---
*Phase: 03-integration-features*
*Completed: 2026-02-22*
