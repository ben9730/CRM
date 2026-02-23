---
phase: 04-polish-production
plan: 01
subsystem: api, ui
tags: [csv-export, search, dropdown, nextjs, supabase, lucide-react]

requires:
  - phase: 03-integration-features
    provides: contacts/orgs/deals queries, AppShell/AppHeader components, task-form with defaultContactId/defaultDealId

provides:
  - Authenticated CSV export Route Handler at /api/export/[entity] for contacts, organizations, deals
  - ExportButton client component with loading state and blob download
  - Global search page at /search grouped by Contacts, Organizations, Deals
  - Avatar profile dropdown showing user name, email, and Log out button
  - Header search routes to /search?q= (was /contacts?search=)

affects:
  - 04-02 (E2E testing — export, search, logout flows need coverage)
  - security-review (export endpoint validates auth, 401 for unauthenticated)

tech-stack:
  added: []
  patterns:
    - "CSV export: RFC 4180 escapeCsvField + UTF-8 BOM for Excel/Hebrew compatibility"
    - "Route Handler auth: createClient + getUser() pattern (same as Server Actions)"
    - "Client island: ExportButton as 'use client' import into Server Component pages"
    - "Search page: parallel Promise.all across contacts (FTS), orgs (FTS), deals (ilike title)"
    - "Avatar dropdown: DropdownMenu wrapping Avatar with form action={signOut}"

key-files:
  created:
    - src/app/api/export/[entity]/route.ts
    - src/components/shared/export-button.tsx
    - src/app/(app)/search/page.tsx
  modified:
    - src/app/(app)/contacts/page.tsx
    - src/app/(app)/organizations/page.tsx
    - src/components/deals/kanban-page-client.tsx
    - src/components/layout/app-header.tsx
    - src/components/layout/app-shell.tsx

key-decisions:
  - "Deals search uses ilike on title (no search_vector on deals table — per RESEARCH.md pitfall 3)"
  - "UTF-8 BOM prepended to CSV for Excel compatibility (handles Hebrew text)"
  - "Avatar dropdown: minimal profile — name, email, logout only (no settings link per user decision)"
  - "ExportButton added to KanbanPageClient (client component) not deals/page.tsx (server component)"
  - "Task auto-linking verified as already correct: defaultContactId/defaultDealId wired to Select defaultValue — no changes needed"

patterns-established:
  - "CSV Route Handler: auth check → entity validate → query → escapeCsvField → BOM + Response"
  - "ExportButton: fetch blob → createObjectURL → programmatic <a> click → revokeObjectURL"

requirements-completed: [DATA-01, DATA-02, DATA-03]

duration: 15min
completed: 2026-02-23
---

# Phase 4 Plan 01: CSV Export, Global Search, and Avatar Dropdown Summary

**Authenticated CSV export for all 3 entities, global /search page with grouped results, and avatar dropdown with user info and logout — all shipping in one plan**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-23T13:56:24Z
- **Completed:** 2026-02-23T14:11:xx Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- RFC 4180-compliant CSV export with UTF-8 BOM for contacts, organizations, and deals via authenticated GET Route Handler
- Global search page at /search querying all 3 entities in parallel (contacts/orgs via full-text search, deals via ilike)
- Avatar dropdown in header showing real user name, email, and functional logout via signOut Server Action
- Header search bar now routes to /search?q= instead of /contacts?search=
- Task auto-linking verified correct — defaultContactId/defaultDealId properly wired to Select defaultValue, no fix needed

## Task Commits

Each task was committed atomically:

1. **Task 1: CSV export Route Handler and ExportButton component** - `9934583` (feat)
2. **Task 2: Global search page, avatar dropdown, task auto-link verification** - `fc5a8bb` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/app/api/export/[entity]/route.ts` - Authenticated GET handler returning CSV for contacts/orgs/deals
- `src/components/shared/export-button.tsx` - Client component with loading state, blob download
- `src/app/(app)/search/page.tsx` - Global search results page grouped by entity type
- `src/app/(app)/contacts/page.tsx` - Added ExportButton next to ContactCreateButton
- `src/app/(app)/organizations/page.tsx` - Added ExportButton next to OrgCreateButton
- `src/components/deals/kanban-page-client.tsx` - Added ExportButton next to DealCreateButton
- `src/components/layout/app-header.tsx` - Search rerouted to /search; Avatar wrapped with DropdownMenu
- `src/components/layout/app-shell.tsx` - Pass userName + userEmail to AppHeader (already fetched)

## Decisions Made
- Deals search uses `ilike` on title — deals table has no `search_vector` (per RESEARCH.md pitfall 3)
- UTF-8 BOM (`\uFEFF`) prepended to all CSV exports for Excel compatibility (Hebrew text support)
- Avatar dropdown minimal: name, email, logout only — no settings link per prior user decision
- ExportButton added to `KanbanPageClient` (client component) rather than the Server Component `deals/page.tsx`, since it needs to sit alongside DealCreateButton which is already in the client component
- Task auto-linking (defaultContactId/defaultDealId) verified as already correct — no code change required

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — build passed clean on both tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All DATA-01, DATA-02, DATA-03 requirements complete
- Export, search, and avatar dropdown are ready for E2E testing coverage (04-02)
- Security review can now evaluate the export endpoint auth guard (returns 401 for unauthenticated requests)

---
*Phase: 04-polish-production*
*Completed: 2026-02-23*
