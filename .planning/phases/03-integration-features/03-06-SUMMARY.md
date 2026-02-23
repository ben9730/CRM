---
plan: 03-06
phase: 03-integration-features
status: complete
completed: 2026-02-23
tasks_total: 3
tasks_complete: 3
---

# Summary: 03-06 — Gap Closure: RLS SELECT + Task Priority Enum + Deal Form Double-fire

## What Was Built

Three surgical fixes (1-5 lines each) resolving the final 4 UAT failures blocking Phase 3 completion.

## Tasks Completed

| # | Task | Status |
|---|------|--------|
| 1 | RLS SELECT policy fix — drop `deleted_at IS NULL` from 5 tables | ✓ |
| 2 | Task priority enum fix — `'medium'` → `'normal'` in Zod + SelectItem | ✓ |
| 3 | Deal form useEffect fix — remove `onSuccess` from dependency array | ✓ |

## Key Files

### Created
- `supabase/migrations/20260223120000_fix_select_rls_soft_delete.sql` — Drops and recreates SELECT policies for organizations, contacts, deals, interactions, tasks — removing `deleted_at IS NULL` from USING clause

### Modified
- `src/lib/actions/tasks.ts` — Zod enum: `'medium'` → `'normal'`
- `src/components/tasks/task-form.tsx` — defaultValue and SelectItem value: `'medium'` → `'normal'`
- `src/components/deals/deal-form.tsx` — useEffect deps: `[state, onSuccess]` → `[state]`

## Root Causes Fixed

1. **RLS error on soft-delete**: Supabase implicit `RETURNING *` on UPDATE re-evaluates SELECT policy against the new row. After soft-delete, `deleted_at` is set — failing the `IS NULL` check and producing "new row violates row-level security policy". App queries already filter `deleted_at IS NULL`; the policy check is redundant and harmful.

2. **Task create/update fails**: DB `CHECK constraint` expects `priority IN ('low', 'normal', 'high')`. Both Zod and the form were sending `'medium'`. Postgres rejected every task insert/update with a CHECK violation.

3. **Deal creation crashes app**: `onSuccess` calls `setOpen(false)` in `DealCreateButton`, re-rendering with a new `handleSuccess` function reference. This triggers the `useEffect` again while `state.success` is still truthy — `onSuccess` fires twice, prepending the deal twice into Kanban state, causing dnd-kit's SortableContext to throw a duplicate-key error (black screen crash).

## Verification

- TypeScript: `npx tsc --noEmit` → 0 errors
- Supabase MCP: `apply_migration` → `{"success":true}`
- Live policy check: all 5 SELECT policies confirmed to have `qual: private.is_account_member(account_id)` — no `deleted_at IS NULL`

## UAT Results After Fix

| Test | Before | After |
|------|--------|-------|
| Org/Contact/Deal/Task soft-delete | ✗ RLS error | ✓ Success toast, row removed |
| Task create with priority | ✗ DB CHECK fail | ✓ Created successfully |
| Task edit + priority change | ✗ DB CHECK fail | ✓ Saved successfully |
| Deal creation (Kanban) | ✗ App crash | ✓ Card appears instantly, no crash |

**Phase 3 UAT: 8/8 passing.**

## Deviations

None. All fixes applied exactly as specified in the plan. Used Supabase MCP (`apply_migration`) instead of `npx supabase db push` — more reliable and confirmed via live policy query.

## Self-Check: PASSED
