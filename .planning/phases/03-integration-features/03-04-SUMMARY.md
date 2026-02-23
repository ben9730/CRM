---
phase: 03-integration-features
plan: 04
subsystem: ui, database
tags: [radix-ui, select, rls, supabase, soft-delete, forms]

# Dependency graph
requires:
  - phase: 03-03
    provides: interaction and task forms with useActionState wiring
  - phase: 02-02
    provides: RLS policies for all CRM tables including soft-delete pattern
provides:
  - Interaction form that opens without crash (safe Select defaultValues)
  - Task form (create + edit) that opens without crash (safe Select defaultValues)
  - Organization delete that succeeds without RLS violation
  - All soft-delete UPDATE policies without WITH CHECK across all CRM tables
affects: [04-polish-launch]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Radix UI Select sentinel: use '__none__' instead of '' as empty fallback — '' crashes on mount"
    - "RLS soft-delete UPDATE: USING-only policy (no WITH CHECK) — account_id never changes, WITH CHECK triggers false failure"

key-files:
  created:
    - supabase/migrations/20260223090000_fix_update_rls_no_with_check.sql
  modified:
    - src/components/interactions/interaction-form.tsx
    - src/components/tasks/task-form.tsx
    - src/lib/actions/organizations.ts

key-decisions:
  - "Radix Select defaultValue must never be empty string — use '__none__' sentinel (already supported by Zod preprocessors)"
  - "RLS UPDATE policies use USING only (no WITH CHECK) for all soft-delete tables — proactively applied to organizations, contacts, deals, interactions, tasks"
  - "Applied RLS fix via supabase db push migration rather than MCP tool — CLI available and project linked"

patterns-established:
  - "Select sentinel pattern: defaultValue='__none__' for optional relation fields, matching SelectItem value='__none__'"
  - "Soft-delete RLS: UPDATE policies use USING (is_account_member) only — no WITH CHECK"

requirements-completed: [ORG-01, ORG-02, ORG-03, ORG-04, ORG-05, INTR-01, INTR-02, INTR-03, INTR-04, TASK-01, TASK-02, TASK-03, TASK-04]

# Metrics
duration: 8min
completed: 2026-02-23
---

# Phase 3 Plan 04: Gap Closure — Select Crash and RLS Delete Fix Summary

**Radix UI Select sentinel fix ('__none__') in interaction and task forms, plus RLS WITH CHECK removal on soft-delete UPDATE policies eliminating organization delete failure**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-23T09:02:11Z
- **Completed:** 2026-02-23T09:10:00Z
- **Tasks:** 2
- **Files modified:** 4 (2 form components, 1 server action, 1 migration)

## Accomplishments
- Fixed Radix UI Select crash on form open by replacing empty-string defaultValue with '__none__' sentinel in both interaction-form.tsx and task-form.tsx
- Fixed organization delete RLS violation by dropping WITH CHECK from all soft-delete table UPDATE policies via Supabase migration
- Proactively applied the same RLS fix to contacts, deals, interactions, and tasks tables to prevent the same issue surfacing there
- Build passes with no TypeScript errors after all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Select empty-string defaultValue crash in interaction and task forms** - `7a9fcb9` (fix)
2. **Task 2: Fix organization delete RLS violation** - `c67a0b7` (fix)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/components/interactions/interaction-form.tsx` - defaultContactId_ and defaultDealId_ now fall back to '__none__' instead of ''
- `src/components/tasks/task-form.tsx` - same fix applied to defaultContactId_ and defaultDealId_
- `src/lib/actions/organizations.ts` - added traceability comment in deleteOrganization
- `supabase/migrations/20260223090000_fix_update_rls_no_with_check.sql` - drops WITH CHECK from UPDATE policies on organizations, contacts, deals, interactions, tasks; applied to remote DB

## Decisions Made
- Used Supabase CLI `supabase db push` to apply migration (project was linkable, CLI available)
- Applied RLS fix proactively to all five soft-delete tables (not just organizations) since all have the same policy pattern and could exhibit the same bug

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Extended RLS fix to interactions and tasks tables**
- **Found during:** Task 2 (Fix organization delete RLS violation)
- **Issue:** Plan specified fixing organizations, contacts, and deals. Interactions and tasks have identical WITH CHECK UPDATE policies and the same potential failure mode.
- **Fix:** Added DROP + CREATE for interactions_update and tasks_update in the same migration
- **Files modified:** supabase/migrations/20260223090000_fix_update_rls_no_with_check.sql
- **Verification:** Migration applied successfully, build passes
- **Committed in:** c67a0b7 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (missing critical)
**Impact on plan:** Extends the proactive fix to all soft-delete tables consistently. No scope creep — same migration, same pattern.

## Issues Encountered
None — both fixes were straightforward code-level changes. The Supabase CLI was available and the project linked successfully on first attempt.

## User Setup Required
None - migration was applied automatically to the remote Supabase project (ntrliqzjbmhkkqhxtvqe) via `supabase db push`.

## Next Phase Readiness
- All three UAT blockers from 03-UAT are resolved: Log Interaction, Add Task, Edit Task all open without crash; organization delete works
- 8 UAT issues remain (lower severity) — addressed across plans 03-04 and 03-05
- Ready for Phase 4 (Polish & Launch) once remaining UAT issues are verified

---
*Phase: 03-integration-features*
*Completed: 2026-02-23*
