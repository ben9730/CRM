---
phase: 03-integration-features
plan: 01
subsystem: ui
tags: [supabase, next.js, react, server-actions, zod, tanstack-table, shadcn, typescript]

# Dependency graph
requires:
  - phase: 02-backend-data-layer
    provides: Supabase schema, RLS policies, auth actions pattern, database types

provides:
  - getAccountId helper (src/lib/queries/account.ts) — used by all Server Actions
  - OrgRow, ContactWithOrgs, OrgWithRelations, PaginatedResult, ActionState app types
  - Pagination, ConfirmDialog, SearchForm, TagInput shared components
  - Organizations full CRUD with search, pagination, detail page
  - Contacts full CRUD with multi-org junction, tags, full-text search, filter, pagination
  - Contact detail page with linked deals, tasks, interaction timeline from Supabase
  - Server Component + Server Action pattern for plans 03-02 and 03-03

affects:
  - 03-02-deals-kanban
  - 03-03-interactions-tasks-dashboard

# Tech tracking
tech-stack:
  added:
    - sonner (toast notifications, installed via shadcn)
    - shadcn textarea, checkbox components
  patterns:
    - Server Component page + Server Action mutation pattern
    - useActionState + useFormStatus for form pending/error states
    - ActionState type (error/success) matching auth.ts pattern
    - Tags as JSON-encoded hidden input for Server Action form submission
    - Client wrapper components for interactivity within Server Component pages
    - OrgCreateButton / ContactCreateButton as client islands in Server pages
    - ContactsViewWrapper as client component for table/grid view toggle

key-files:
  created:
    - src/lib/queries/account.ts
    - src/lib/types/app.ts
    - src/lib/queries/organizations.ts
    - src/lib/actions/organizations.ts
    - src/lib/queries/contacts.ts
    - src/lib/actions/contacts.ts
    - src/components/shared/pagination.tsx
    - src/components/shared/confirm-dialog.tsx
    - src/components/shared/search-form.tsx
    - src/components/shared/tag-input.tsx
    - src/components/organizations/org-form.tsx
    - src/components/organizations/org-list.tsx
    - src/components/organizations/org-detail-view.tsx
    - src/components/organizations/org-create-button.tsx
    - src/components/contacts/contact-form.tsx
    - src/components/contacts/contact-search-form.tsx
    - src/components/contacts/contact-create-button.tsx
    - src/components/contacts/contacts-view-wrapper.tsx
    - src/components/contact-detail/contact-detail-client.tsx
    - src/app/(app)/organizations/[id]/page.tsx
  modified:
    - src/app/(app)/organizations/page.tsx
    - src/app/(app)/contacts/page.tsx
    - src/app/(app)/contacts/[id]/page.tsx
    - src/app/(app)/layout.tsx
    - src/components/contacts/contacts-table.tsx
    - src/components/contacts/contacts-grid.tsx
    - src/components/contacts/columns.tsx
    - src/components/contacts/contact-sheet.tsx
    - src/components/contact-detail/contact-overview.tsx
    - src/components/contact-detail/linked-deals.tsx
    - src/components/contact-detail/linked-tasks.tsx
    - src/components/contact-detail/interaction-timeline.tsx

key-decisions:
  - "Zod v4 uses .issues[] not .errors[] — fixed in both org and contact actions"
  - "Tags submitted as JSON-encoded hidden input to Server Actions (not formData.getAll)"
  - "ContactsViewWrapper is client island for table/grid toggle; page stays Server Component"
  - "OrgCreateButton and ContactCreateButton are client islands in Server Component pages"
  - "ContactDetailClient orchestrates edit sheet on /contacts/[id]; page remains Server Component"
  - "LinkedDeals/Tasks/Interactions now export type interfaces for type-safe prop passing"
  - "Contact deals linked via org membership (no direct contact_id on deals table in this schema)"
  - "OrgId filter for contacts applied in application code after fetch (PostgREST limitation with nested joins)"

patterns-established:
  - "Server Component page calls query functions directly; mutation via Server Actions with useActionState"
  - "Client island pattern: OrgCreateButton/ContactCreateButton handles open state, form, and router.refresh()"
  - "Pagination: URL-based via useRouter + useSearchParams, preserves other params, resets page on search"
  - "SearchForm: submit-based (Enter or button click), never live filtering"
  - "Tags: managed predefined list + free-form via TagInput component, stored as string[]"
  - "Soft delete: sets deleted_at + updated_by, all queries filter .is('deleted_at', null)"
  - "getAccountId called in every create action to enforce account isolation"

requirements-completed:
  - ORG-01
  - ORG-02
  - ORG-03
  - ORG-04
  - ORG-05
  - CONT-01
  - CONT-02
  - CONT-03
  - CONT-04
  - CONT-05
  - CONT-06

# Metrics
duration: 13min
completed: 2026-02-22
---

# Phase 3 Plan 01: Organizations and Contacts CRUD Summary

**Full CRUD for organizations and contacts wired to live Supabase backend — search, tags, multi-org junction, pagination, detail pages with linked entities**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-22T12:28:57Z
- **Completed:** 2026-02-22T12:42:05Z
- **Tasks:** 3
- **Files modified:** 32

## Accomplishments

- Organizations: full CRUD (create/edit/delete) with name/type/phone/website/address fields, full-text search, page number pagination, and detail page showing linked contacts + deals in tabs
- Contacts: full CRUD with multi-org junction table (first selected org = primary), managed+free-form tag system, full-text search, tag/org filter dropdowns, paginated table/grid toggle, and detail page with linked deals/tasks/interaction timeline
- Shared foundation: getAccountId helper, PaginatedResult/ActionState/ContactWithOrgs types, Pagination/ConfirmDialog/SearchForm/TagInput components — all reusable by plans 03-02 and 03-03

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared foundation** - `b59c22a` (feat)
2. **Task 2: Organizations CRUD** - `7c84cfa` (feat)
3. **Task 3: Contacts CRUD** - `ada8662` (feat)

## Files Created/Modified

**Created (key files):**
- `src/lib/queries/account.ts` — getAccountId helper for all Server Actions
- `src/lib/types/app.ts` — OrgRow, ContactWithOrgs, OrgWithRelations, PaginatedResult, ActionState types
- `src/lib/queries/organizations.ts` — getOrganizations, getOrganization, getOrganizationContacts, getOrganizationDeals, getOrganizationsList
- `src/lib/actions/organizations.ts` — createOrganization, updateOrganization, deleteOrganization
- `src/lib/queries/contacts.ts` — getContacts, getContact, getContactDeals, getContactTasks, getContactInteractions, getAvailableTags
- `src/lib/actions/contacts.ts` — createContact, updateContact, deleteContact
- `src/components/shared/pagination.tsx` — URL-based page number pagination with ellipsis
- `src/components/shared/confirm-dialog.tsx` — Destructive confirm dialog
- `src/components/shared/search-form.tsx` — Submit-based search with clear button
- `src/components/shared/tag-input.tsx` — Managed + free-form tag combobox
- `src/components/organizations/org-form.tsx` — Org slide-over form
- `src/components/organizations/org-list.tsx` — Org list with edit/delete actions
- `src/components/organizations/org-detail-view.tsx` — Org detail with tabbed contacts/deals
- `src/components/contacts/contact-form.tsx` — Contact form with TagInput and multi-org select
- `src/components/contacts/contact-detail-client.tsx` — Client orchestrator for contact detail page

**Modified:**
- `src/app/(app)/organizations/page.tsx` — Server Component wired to live data
- `src/app/(app)/organizations/[id]/page.tsx` — New org detail page
- `src/app/(app)/contacts/page.tsx` — Server Component wired to live data
- `src/app/(app)/contacts/[id]/page.tsx` — Server Component fetching all related data
- `src/app/(app)/layout.tsx` — Added Toaster for app-wide toast notifications
- All contact list/detail components updated from mock types to ContactWithOrgs

## Decisions Made

- **Zod v4 API**: Zod v4 uses `.issues[]` not `.errors[]` on ZodError — applied to both org and contact actions
- **Client island pattern**: OrgCreateButton / ContactCreateButton are minimal client components that hold sheet open state; pages stay Server Components for data fetching
- **Tags as JSON**: Tags and org IDs submitted as JSON-encoded hidden inputs to Server Actions since formData doesn't natively support arrays
- **OrgId filter in application code**: Contact filtering by organization is applied after fetch because PostgREST has limitations with nested join filtering combined with count
- **Contact deals via org**: Deals are linked to organizations, not directly to contacts, so contact deals are fetched via org membership

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `useState` import from server component**
- **Found during:** Build verification after Task 3
- **Issue:** `/contacts/[id]/page.tsx` had an unused `useState` import that caused a Next.js build error ("only works in Client Component")
- **Fix:** Removed the unused import — page correctly delegates client state to `ContactDetailClient`
- **Files modified:** `src/app/(app)/contacts/[id]/page.tsx`
- **Verification:** `npx next build` succeeds with 0 errors
- **Committed in:** ada8662 (Task 3 commit)

**2. [Rule 1 - Bug] Zod v4 `.issues[]` vs `.errors[]`**
- **Found during:** Task 2 TypeScript check
- **Issue:** Zod v4 changed error property name from `.errors` to `.issues` on ZodError
- **Fix:** Updated both organizations.ts and contacts.ts actions to use `.issues[0]?.message`
- **Files modified:** `src/lib/actions/organizations.ts`, `src/lib/actions/contacts.ts`
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 7c84cfa, ada8662 (task commits)

---

**Total deviations:** 2 auto-fixed (both Rule 1 bugs)
**Impact on plan:** Minor corrections, no scope creep. All planned functionality delivered.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None — uses the same Supabase project configured in Phase 2. No new environment variables needed.

## Next Phase Readiness

- Plan 03-02 (Deals/Kanban) can import from `@/lib/queries/organizations`, `@/lib/types/app`, and `@/components/shared/*` — all foundation is in place
- Plan 03-03 (Interactions/Tasks/Dashboard) can use the same patterns, shared components, and account helper
- The `getOrganizationsList` function is available for deal creation forms (org dropdown)
- Contact search and tag filtering work end-to-end from URL params to Supabase queries

---
*Phase: 03-integration-features*
*Completed: 2026-02-22*
