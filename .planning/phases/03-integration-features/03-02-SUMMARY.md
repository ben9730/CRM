---
phase: 03-integration-features
plan: 02
subsystem: deals
tags: [supabase, next.js, react, dnd-kit, server-actions, zod, optimistic-updates, typescript]

# Dependency graph
requires:
  - phase: 03-integration-features
    plan: 01
    provides: getOrganizationsList, ActionState type, ConfirmDialog, shared patterns, getContacts

provides:
  - deal_contacts junction table (migration applied, RLS via deals.account_id)
  - getPipelineStages() query
  - getDeals(), getDeal(), getDealsByOrganization(), getDealsByContact() queries
  - createDeal, updateDeal, deleteDeal, moveDealStage Server Actions
  - DealWithRelations type in app.ts
  - KanbanBoard client component with optimistic drag-and-drop
  - KanbanColumn with PipelineStageRow (hex color accents from DB)
  - DealCard wired to DealWithRelations, click-navigates to deal detail
  - DealForm with stage/value/org/contacts/notes fields
  - DealCreateButton client island
  - DealDetailView with edit Sheet and delete ConfirmDialog
  - /deals Server Component page with live data and metrics
  - /deals/[id] Server Component detail page

affects:
  - 03-03-interactions-tasks-dashboard

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Optimistic drag-and-drop: useTransition + moveDealStage + snapshot rollback
    - Server Component page + Client Board pattern (data fetched server-side, passed as initialDeals)
    - DealCreateButton client island (mirrors OrgCreateButton pattern from 03-01)
    - color-mix(in oklch) for dynamic stage color application from hex DB values
    - deal_contacts junction table RLS via EXISTS through deals.account_id

key-files:
  created:
    - supabase/migrations/20260222124546_add_deal_contacts_junction.sql
    - src/lib/queries/pipeline-stages.ts
    - src/lib/queries/deals.ts
    - src/lib/actions/deals.ts
    - src/components/deals/deal-form.tsx
    - src/components/deals/deal-create-button.tsx
    - src/components/deals/deal-detail-view.tsx
    - src/app/(app)/deals/[id]/page.tsx
  modified:
    - src/types/database.ts (regenerated with deal_contacts type)
    - src/lib/types/app.ts (added DealWithRelations type)
    - src/components/deals/kanban-board.tsx (rewritten for live data + optimistic DnD)
    - src/components/deals/kanban-column.tsx (PipelineStageRow + hex color from DB)
    - src/components/deals/deal-card.tsx (DealWithRelations + click navigation)
    - src/app/(app)/deals/page.tsx (rewritten as Server Component)

key-decisions:
  - "Optimistic update via useTransition: snapshot-then-update pattern, rollback on Server Action error"
  - "KanbanBoard receives initialDeals + stages as props from Server Component page"
  - "DealCreateButton client island: mirrors OrgCreateButton for consistency"
  - "color-mix(in oklch) used for dynamic stage hex color application on cards and columns"
  - "Dashboard pipeline-summary.tsx deferred to 03-03 (out of scope for this plan)"
  - "deal_contacts RLS via EXISTS through deals rather than account_id column on junction table"

# Metrics
duration: 18min
completed: 2026-02-22
---

# Phase 3 Plan 02: Deals Kanban Pipeline Summary

**Deal pipeline Kanban with live Supabase data — optimistic drag-and-drop, deal CRUD, stage metrics from normalized pipeline_stages table, deal detail page with placeholders for interactions/tasks**

## Performance

- **Duration:** 18 min
- **Started:** 2026-02-22T12:45:21Z
- **Completed:** 2026-02-22T13:03:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments

- Applied `deal_contacts` junction table migration with RLS, unique constraint, and cascade deletes — regenerated TypeScript database types
- Created full deal data layer: `getPipelineStages`, `getDeals`, `getDeal`, `getDealsByOrganization`, `getDealsByContact` queries + `createDeal`, `updateDeal`, `deleteDeal`, `moveDealStage` Server Actions with Zod validation
- Rewritten KanbanBoard as client component with instant optimistic drag-and-drop using `useTransition` snapshot/rollback pattern
- KanbanColumn updated to use `PipelineStageRow` — column accent colors, gradients, and dot indicators all driven by `stage.color` hex from DB
- DealCard updated to `DealWithRelations` — shows title, organization name, value; click navigates to deal detail page
- DealForm with stage select, value, expected close date, organization, multi-contact select (checkboxes), and notes
- DealCreateButton client island opening DealForm in a Sheet, consistent with the org/contact patterns
- DealDetailView with edit Sheet and destructive delete ConfirmDialog with redirect
- /deals page rewritten as Server Component — parallel fetch of deals, stages, organizations; pipeline metrics computed from live `is_won`/`is_lost` flags
- /deals/[id] detail page with full relations, linked contacts, notes, and placeholder sections for interactions/tasks (03-03)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migration, queries, actions** - `8c0d1b6` (feat)
2. **Task 2: Kanban wiring, forms, detail page** - `70ab03c` (feat)

## Files Created/Modified

**Created (key files):**
- `supabase/migrations/20260222124546_add_deal_contacts_junction.sql` — Junction table with cascade deletes and RLS
- `src/lib/queries/pipeline-stages.ts` — `getPipelineStages()` ordered by display_order
- `src/lib/queries/deals.ts` — `getDeals`, `getDeal`, `getDealsByOrganization`, `getDealsByContact`
- `src/lib/actions/deals.ts` — `createDeal`, `updateDeal`, `deleteDeal`, `moveDealStage`
- `src/components/deals/deal-form.tsx` — DealForm with useActionState and multi-contact checkbox select
- `src/components/deals/deal-create-button.tsx` — Client island for new deal sheet
- `src/components/deals/deal-detail-view.tsx` — Deal detail with edit/delete, info grid, linked contacts, notes, 03-03 placeholders
- `src/app/(app)/deals/[id]/page.tsx` — Server Component deal detail page

**Modified:**
- `src/types/database.ts` — Regenerated with `deal_contacts` table type
- `src/lib/types/app.ts` — Added `DealWithRelations` type
- `src/components/deals/kanban-board.tsx` — Rewritten with live data + optimistic DnD
- `src/components/deals/kanban-column.tsx` — PipelineStageRow + dynamic hex color accents
- `src/components/deals/deal-card.tsx` — DealWithRelations + click navigation
- `src/app/(app)/deals/page.tsx` — Server Component with parallel data fetching and live metrics

## Decisions Made

- **Optimistic DnD**: `useTransition` with snapshot/rollback — immediate visual response, toast error and revert on Server Action failure
- **Server Component + Client Board**: Page fetches deals+stages server-side, passes as `initialDeals`/`stages` props to `KanbanBoard` client component — data freshness without client fetching
- **Dynamic colors from DB**: Stage `color` hex field used directly via `color-mix(in oklch)` for column gradients, card left borders, and dot indicators — no hardcoded color maps
- **Dashboard deferred**: `pipeline-summary.tsx` and `metrics-cards.tsx` in dashboard still use mock data — out of scope for this plan, will be wired in 03-03

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Supabase CLI login output in generated types file**
- **Found during:** Task 1 verification (TypeScript check failed)
- **Issue:** `npx supabase gen types typescript --linked > src/types/database.ts` wrote CLI progress output ("Initialising login role...") to stdout, which was captured into the .ts file, causing TS errors
- **Fix:** Redirected stderr separately: `npx supabase gen types typescript --linked 2>/dev/null > src/types/database.ts`
- **Files modified:** `src/types/database.ts`
- **Verification:** `npx tsc --noEmit` passes cleanly

---

**Total deviations:** 1 auto-fixed (Rule 1 bug)
**Impact on plan:** Minor. No scope creep. All planned functionality delivered.

## Issues Encountered

None beyond the auto-fixed deviation above.

## User Setup Required

None — uses the same Supabase project configured in Phase 2. The `deal_contacts` migration was applied automatically.

## Next Phase Readiness

- Plan 03-03 (Interactions/Tasks/Dashboard) can import from `@/lib/queries/deals`, `@/lib/types/app` (DealWithRelations), and use the established Server Component + client island pattern
- `DealDetailView` has empty placeholder sections for interactions timeline and tasks — 03-03 will replace these with live data
- `getDeal()` includes full contact relations via deal_contacts — ready for consumption
- Dashboard pipeline-summary.tsx and metrics-cards.tsx still need wiring to live data in 03-03

## Self-Check: PASSED

All created files exist on disk. All task commits verified in git log.

| Check | Status |
|-------|--------|
| supabase/migrations/20260222124546_add_deal_contacts_junction.sql | FOUND |
| src/lib/queries/pipeline-stages.ts | FOUND |
| src/lib/queries/deals.ts | FOUND |
| src/lib/actions/deals.ts | FOUND |
| src/components/deals/deal-form.tsx | FOUND |
| src/components/deals/deal-create-button.tsx | FOUND |
| src/components/deals/deal-detail-view.tsx | FOUND |
| src/app/(app)/deals/[id]/page.tsx | FOUND |
| Commit 8c0d1b6 (Task 1) | FOUND |
| Commit 70ab03c (Task 2) | FOUND |

---
*Phase: 03-integration-features*
*Completed: 2026-02-22*
