# Phase 3: Integration & Features - Research

**Researched:** 2026-02-22
**Domain:** Next.js 16 App Router + Supabase full-stack CRUD, Server Actions, optimistic drag-and-drop, full-text search, pagination
**Confidence:** HIGH — Verified against live codebase, live Supabase schema, official Next.js docs, Supabase docs, and verified web sources

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Form & editing patterns
- Claude's Discretion: form presentation pattern (modal, slide-over, or full page) — pick best fit per entity complexity
- Claude's Discretion: editing flow (detail page edit mode, inline editing, or reuse creation form) — pick per entity type
- Claude's Discretion: delete confirmation pattern (confirm dialog vs undo toast) — pick based on destructiveness
- Claude's Discretion: multi-org assignment UX for contacts (multi-select dropdown vs add-one-at-a-time)

#### List, search & filtering
- **Search: submit-based** — Enter/click to search, NOT live type-to-filter
- Claude's Discretion: filter presentation (bar above list vs collapsible panel)
- **Tags: managed list + free-form** — predefined suggestions plus user-created tags
- **Pagination: classic page numbers** — 1, 2, 3 with prev/next, NOT infinite scroll or load-more

#### Kanban interactions
- **Kanban drag: instant optimistic** — card moves immediately, background API call, snap back with error toast on failure
- Claude's Discretion: deal creation from Kanban (quick-add at column top, global button, or both)
- Claude's Discretion: deal card content density
- Claude's Discretion: empty column behavior

#### Timeline & activity feed
- Claude's Discretion: interaction logging flow (quick-log, full form, or hybrid)
- Claude's Discretion: dashboard activity feed content
- Claude's Discretion: overdue task surfacing
- Claude's Discretion: contact/deal detail timeline composition

### Claude's Discretion
Claude has broad flexibility. Base decisions on existing Phase 1 design system (OKLCH dark theme, violet-indigo accent, Geist Sans, collapsible sidebar, DealCard patterns), CRM industry conventions (Salesforce, HubSpot, Linear as references), consistency across application, and premium dark-mode SaaS aesthetic.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ORG-01 | Create organization with name, type, address, phone, website, notes | Server Action with Zod validation; modal form for simple entity; type check constraint in DB: hospital/clinic/lab/other |
| ORG-02 | Edit and delete organizations | Edit: slide-over reusing create form; Delete: soft-delete (set deleted_at); confirm dialog pattern |
| ORG-03 | View all contacts linked to an organization | Join query via contact_organizations table; displayed in org detail page |
| ORG-04 | View all deals linked to an organization | FK query deals.organization_id; displayed in org detail page |
| ORG-05 | Organization list with search and filtering | submit-based search on search_vector column (textSearch API); pagination via searchParams |
| CONT-01 | Create contact with name, title, email, phone, linked organization | Server Action + modal form; org linked via contact_organizations junction |
| CONT-02 | Edit and delete contacts | Edit: slide-over or detail page edit mode; Delete: soft-delete with confirm dialog |
| CONT-03 | Tag contacts with free-form tags | Tags stored as text[] in contacts; combobox with predefined list + free-form creatable input |
| CONT-04 | Search contacts by name, email, organization, or tag | textSearch on search_vector (covers first_name, last_name, email, title, notes); tag filter via .contains() |
| CONT-05 | Filter contacts by tag, organization, and date | Server-side filtering via query params; submit-based filter form |
| CONT-06 | Contact can belong to multiple organizations | contact_organizations junction already exists in DB; multi-select org assignment UX |
| DEAL-01 | Create deal with name, stage, value, close date, linked org, linked contacts | Server Action; modal form; stage_id FK to pipeline_stages; deal_contacts junction needed |
| DEAL-02 | Edit and delete deals | Edit: slide-over; Delete: soft-delete with confirm dialog |
| DEAL-03 | Kanban drag-and-drop between stages | @dnd-kit already installed and working; convert to Server Action optimistic pattern |
| DEAL-04 | Pipeline stages pre-configured | Live DB confirms: Lead, Qualified, Demo, Proposal, Closed Won, Closed Lost — seeded already |
| DEAL-05 | Each stage shows deal count and total value | Computed from fetched deals, grouped by stage_id |
| DEAL-06 | Pipeline stages stored in normalized table | pipeline_stages table exists with 6 seeded rows |
| INTR-01 | Log interaction linked to contact and/or deal | Server Action; quick-log form (type, subject, body, occurred_at); interactions table exists |
| INTR-02 | Edit and delete interactions | Edit: inline expand or modal; Delete: soft-delete |
| INTR-03 | Interactions chronological timeline on contact detail | Already built as component; wire to live data |
| INTR-04 | Interactions chronological timeline on deal detail | Same InteractionTimeline component; deal_id filter |
| TASK-01 | Create task with title, description, due date, contact/deal link | Server Action + modal form; tasks table exists |
| TASK-02 | Edit, complete, and delete tasks | Complete: toggle is_complete + set completed_at; Delete: soft-delete |
| TASK-03 | Overdue status when past due date | Computed: due_date < now() && !is_complete; visual badge/flag |
| TASK-04 | Task list view with status filtering | Filter by is_complete, due_date; pagination via searchParams |
| DASH-01 | Dashboard shows pipeline value by stage | PipelineSummary component exists; wire to live pipeline_stages + deals data |
| DASH-02 | Dashboard shows tasks due today and overdue count | TasksWidget component exists; wire to live tasks with date comparison |
| DASH-03 | Dashboard shows recent activity feed | ActivityFeed component exists; wire to interactions ordered by occurred_at DESC |
| DASH-04 | Dashboard shows deal count and total pipeline value | MetricsCards component exists; wire to live aggregated deals query |
| DASH-05 | Dashboard is landing page after login | Already configured: signIn redirects to /dashboard |
| PROC-03 | Code review using code-reviewer agent after each major step | Process requirement; planner must add review checkpoints after each implementation step |
</phase_requirements>

---

## Summary

Phase 3 is a wholesale replacement of mock data with live Supabase data across all five CRM domains — organizations, contacts, deals, interactions, and tasks — plus activating the four dashboard widgets with real metrics. The architecture is already decided and proven: Next.js 16 App Router with Server Components for data fetching, Server Actions (with `useActionState`) for mutations, and `revalidatePath` to refresh stale data after mutations.

The most important distinction for this phase is the **Server Component / Server Action split**: pages that display data are Server Components that call `createClient()` and query Supabase directly (no `useEffect`, no client-side fetch). Pages that mutate data wire forms to `'use server'` action functions. Client Components are limited to interactive UI islands — the Kanban drag overlay, search forms, tag inputs, and pagination controls.

The second key concern is **data shape mismatches**: the mock data types (flat `name`, single `organization`, `contactName` on Deal) do not match the Supabase schema (split `first_name`/`last_name`, junction table for contacts, `stage_id` UUID instead of stage string). Every component that currently imports from `src/data/mock-*` must have its types updated to match `src/types/database.ts`. Creating a shared `src/lib/queries/` directory for all Supabase query functions is the correct pattern to avoid scattered database calls.

**Primary recommendation:** Implement in entity order — Dashboard wiring first (highest visibility, no forms needed), then Organizations, Contacts, Deals (Kanban), Interactions, Tasks. Each entity gets: a query module, list page, detail page, create/edit forms, and a delete action. Review with code-reviewer agent after each entity pair.

---

## Standard Stack

### Core (Already Installed — No New npm Installs Required)

| Library | Version | Purpose | Status in Project |
|---------|---------|---------|-------------------|
| Next.js | 16.1.6 | App Router, Server Components, Server Actions | Installed, configured |
| @supabase/supabase-js | 2.97.0 | Supabase client | Installed, typed |
| @supabase/ssr | 0.8.0 | Cookie-based session (server client) | Installed, `src/lib/supabase/server.ts` ready |
| @dnd-kit/core | 6.3.1 | Drag-and-drop core | Installed, KanbanBoard uses it |
| @dnd-kit/sortable | 10.0.0 | Sortable items within columns | Installed, DealCard uses useSortable |
| @dnd-kit/utilities | 3.2.2 | CSS transform helpers | Installed |
| react-hook-form | 7.71.2 | Form management | Installed |
| @hookform/resolvers | 5.2.2 | Zod resolver bridge | Installed |
| zod | 4.3.6 | Schema validation | Installed |
| @tanstack/react-table | 8.21.3 | Contacts table | Installed, ContactsTable uses it |
| radix-ui | 1.4.3 | Dialog, Sheet, Select, etc. | Installed — use existing shadcn components |
| lucide-react | 0.575.0 | Icons | Installed |
| tailwind-merge / clsx | latest | Class merging | Installed |

### No New Dependencies Required

All libraries needed for Phase 3 are already installed. The phase is pure implementation work.

### Existing shadcn/ui Components Available

From `src/components/ui/`: `alert`, `avatar`, `badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `label`, `progress`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `table`, `tabs`, `tooltip`.

**Missing and likely needed:** `textarea`, `checkbox`, `date-picker` (or use native `<input type="date">`), `combobox` (multi-select for tags/orgs). These can be added via `npx shadcn add [component]` if not hand-rolled.

```bash
# Add missing UI components as needed during implementation
npx shadcn add textarea checkbox
```

---

## Architecture Patterns

### Recommended Project Structure for Phase 3

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Server Component — fetch metrics
│   │   ├── organizations/
│   │   │   ├── page.tsx          # Server Component — list + search
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Server Component — detail
│   │   ├── contacts/
│   │   │   ├── page.tsx          # Server Component — list + search
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Server Component — detail (exists, wire it)
│   │   ├── deals/
│   │   │   └── page.tsx          # Client Component (dnd-kit requires client)
│   │   ├── tasks/
│   │   │   └── page.tsx          # Server Component — list + filter
│   │   └── interactions/
│   │       └── page.tsx          # Server Component — feed
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # createClient() — DONE
│   │   ├── client.ts             # browser client — DONE
│   │   └── proxy.ts              # updateSession — DONE
│   ├── actions/
│   │   ├── auth.ts               # DONE
│   │   ├── organizations.ts      # NEW — createOrg, updateOrg, deleteOrg
│   │   ├── contacts.ts           # NEW — createContact, updateContact, deleteContact
│   │   ├── deals.ts              # NEW — createDeal, updateDeal, deleteDeal, moveDealStage
│   │   ├── interactions.ts       # NEW — createInteraction, updateInteraction, deleteInteraction
│   │   └── tasks.ts              # NEW — createTask, updateTask, completeTask, deleteTask
│   └── queries/                  # NEW — all read-only Supabase query functions
│       ├── organizations.ts      # getOrganizations, getOrganization, searchOrganizations
│       ├── contacts.ts           # getContacts, getContact, searchContacts
│       ├── deals.ts              # getDeals, getDealsByStage, getDeal
│       ├── interactions.ts       # getInteractions, getInteractionsByContact, getInteractionsByDeal
│       ├── tasks.ts              # getTasks, getTasksByContact, getTasksByDeal, getOverdueTasks
│       └── dashboard.ts          # getDashboardMetrics, getRecentActivity
├── components/
│   ├── ui/                       # existing shadcn components
│   ├── organizations/            # NEW
│   ├── contacts/                 # EXISTING — update to live types
│   ├── deals/                    # EXISTING — update to live types, add optimistic
│   ├── contact-detail/           # EXISTING — update to live types
│   ├── dashboard/                # EXISTING — update to live types
│   ├── interactions/             # NEW
│   ├── tasks/                    # NEW
│   └── shared/                   # NEW — TagInput, Pagination, ConfirmDialog, etc.
└── data/                         # REMOVE after wiring (or keep for fallback)
    └── mock-*.ts                 # DELETE once each entity is wired
```

---

### Pattern 1: Server Component Data Fetch + Server Action Mutation

**What:** Pages are Server Components that fetch data directly from Supabase. Forms submit to Server Actions that mutate data and call `revalidatePath`.

**Source:** [Next.js Updating Data docs](https://nextjs.org/docs/app/getting-started/updating-data) (official, 2026), [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) (official)

```typescript
// src/lib/queries/organizations.ts
import { createClient } from '@/lib/supabase/server'

export async function getOrganizations(options?: {
  search?: string
  page?: number
  pageSize?: number
}) {
  const supabase = await createClient()
  const { page = 1, pageSize = 20, search } = options ?? {}

  let query = supabase
    .from('organizations')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('name')
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'websearch' })
  }

  const { data, error, count } = await query
  if (error) throw error
  return { organizations: data ?? [], total: count ?? 0 }
}
```

```typescript
// src/lib/actions/organizations.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const OrgSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['hospital', 'clinic', 'lab', 'other']).optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export type OrgActionState = { error?: string; success?: string } | undefined

export async function createOrganization(
  _prevState: OrgActionState,
  formData: FormData
): Promise<OrgActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get account_id from account_members
  const { data: member } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return { error: 'No account found' }

  const parsed = OrgSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { error } = await supabase.from('organizations').insert({
    ...parsed.data,
    account_id: member.account_id,
    created_by: user.id,
    updated_by: user.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/organizations')
  return { success: 'Organization created' }
}
```

```typescript
// src/app/(app)/organizations/page.tsx
import { getOrganizations } from '@/lib/queries/organizations'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function OrganizationsPage({ searchParams }: PageProps) {
  const { search, page } = await searchParams
  const { organizations, total } = await getOrganizations({
    search,
    page: Number(page) || 1,
    pageSize: 20,
  })

  return (
    <div>
      {/* OrgList + OrgSearchForm + Pagination — all server-rendered */}
    </div>
  )
}
```

---

### Pattern 2: useActionState for Form Feedback

**What:** Client Components that contain forms use React 19's `useActionState` to track pending state and display errors/success messages.

**Source:** [React 19 useActionState docs](https://react.dev/reference/react/useActionState) (official), Phase 2 auth forms already use this pattern in `src/lib/actions/auth.ts`

```typescript
'use client'

import { useActionState } from 'react'
import { createOrganization } from '@/lib/actions/organizations'

export function CreateOrgForm() {
  const [state, formAction, isPending] = useActionState(createOrganization, undefined)

  return (
    <form action={formAction}>
      <input name="name" placeholder="Organization name" required />
      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}
      {state?.success && <p className="text-emerald-400 text-sm">{state.success}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Organization'}
      </button>
    </form>
  )
}
```

---

### Pattern 3: Kanban Optimistic Update with @dnd-kit

**What:** The existing KanbanBoard uses local state (`useState<Deal[]>`). For the live backend, the optimistic pattern keeps the local state change instant while firing a Server Action in the background. On failure, revert to previous state and show a toast.

**Decision:** The existing `handleDragEnd` fires synchronously against mock data. For live backend, convert to: (1) save previous state snapshot, (2) apply move locally, (3) call server action `async`, (4) on error, restore snapshot and show error toast.

**Source:** dnd-kit + React 19 `useOptimistic` pattern confirmed via web search (Coding in Flow, January 2026); dnd-kit GitHub discussion #1522 covers the "snap back" issue.

```typescript
'use client'

import { useState, useTransition } from 'react'
import { moveDealStage } from '@/lib/actions/deals'

export function KanbanBoard({ initialDeals, stages }) {
  const [deals, setDeals] = useState(initialDeals)
  const [isPending, startTransition] = useTransition()

  function handleDragEnd({ active, over }) {
    if (!over) return
    const dealId = active.id as string
    const targetStageId = /* resolve from over.id */ ''

    const prevDeals = deals  // snapshot for rollback

    // Optimistic update — immediate
    setDeals(prev => prev.map(d =>
      d.id === dealId ? { ...d, stage_id: targetStageId } : d
    ))

    // Background server call
    startTransition(async () => {
      const result = await moveDealStage(dealId, targetStageId)
      if (result?.error) {
        setDeals(prevDeals)  // rollback
        // show toast: result.error
      }
    })
  }

  // ... rest of component unchanged
}
```

**Key insight:** The `useTransition` wrapper allows the optimistic update to happen synchronously while the async server call runs in a deferred transition. This is the correct React 19 pattern — `useOptimistic` is an alternative but `useState + useTransition` is simpler for this case.

---

### Pattern 4: Full-Text Search with Supabase textSearch

**What:** Both `contacts` and `organizations` have `search_vector` columns (generated tsvector, GIN indexed) confirmed in the live database. Use `.textSearch('search_vector', query, { type: 'websearch' })` for robust search.

**Source:** [Supabase Full Text Search docs](https://supabase.com/docs/guides/database/full-text-search) (official, verified via Supabase MCP)

```typescript
// Contact search — covers first_name, last_name, email, title, notes
const { data } = await supabase
  .from('contacts')
  .select('*')
  .is('deleted_at', null)
  .textSearch('search_vector', userQuery, { type: 'websearch', config: 'english' })

// Tag filter — array contains
const { data } = await supabase
  .from('contacts')
  .select('*')
  .is('deleted_at', null)
  .contains('tags', [selectedTag])  // contacts where tags array contains this tag
```

**Important:** `search_vector` on contacts covers: `first_name`, `last_name`, `email`, `title`, `notes`. It does NOT cover organization names (they are in a junction table). Searching by organization requires a separate query or joining through `contact_organizations`.

---

### Pattern 5: Soft Delete

**What:** All entity tables have `deleted_at timestamptz` column. Soft delete sets `deleted_at = now()`. All list queries must filter `.is('deleted_at', null)`.

**Source:** [Supabase soft delete docs](https://supabase.com/docs/guides/troubleshooting/soft-deletes-with-supabase-js) (official)

```typescript
// Soft delete
await supabase
  .from('organizations')
  .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
  .eq('id', orgId)

// ALWAYS filter deleted in list queries
.is('deleted_at', null)
```

**Critical:** Using `.eq('deleted_at', null)` does NOT work — must use `.is('deleted_at', null)` for NULL comparison in PostgREST.

---

### Pattern 6: Pagination via searchParams

**What:** Server Component pages read `page` from `searchParams` (a Promise in Next.js 16). Supabase uses `.range(from, to)` for offset pagination. A client-side `<Pagination>` component updates the URL.

**Source:** [Next.js searchParams docs](https://nextjs.org/docs/app/api-reference/file-conventions/page) (official), [Next.js pagination tutorial](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination) (official)

```typescript
// Server Component — read page from URL
const { page } = await searchParams
const currentPage = Number(page) || 1
const pageSize = 20
const from = (currentPage - 1) * pageSize
const to = from + pageSize - 1

const { data, count } = await supabase
  .from('contacts')
  .select('*', { count: 'exact' })
  .is('deleted_at', null)
  .range(from, to)

const totalPages = Math.ceil((count ?? 0) / pageSize)
```

```typescript
// Client Component — pagination control updates URL without reload
'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function Pagination({ totalPages, currentPage }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>Prev</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => goToPage(p)} className={p === currentPage ? 'active' : ''}>
          {p}
        </button>
      ))}
      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
    </div>
  )
}
```

---

### Pattern 7: Joining Related Data with Supabase

**What:** Supabase PostgREST supports nested selects for joins. Use this to fetch organization names alongside contacts, and pipeline stage names alongside deals.

```typescript
// Contacts with their primary organization name
const { data } = await supabase
  .from('contacts')
  .select(`
    *,
    contact_organizations!inner(
      organization_id,
      is_primary,
      organizations(id, name)
    )
  `)
  .is('deleted_at', null)

// Deals with stage name and org name
const { data } = await supabase
  .from('deals')
  .select(`
    *,
    pipeline_stages(id, name, color, display_order, is_won, is_lost),
    organizations(id, name)
  `)
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
```

---

### Pattern 8: Get Account ID (Required for All Inserts)

**What:** Every INSERT requires `account_id`. There is no global context — it must be fetched from `account_members` using the current user ID. This is a one-query overhead on every mutation Server Action.

```typescript
// Helper — put this in lib/queries/account.ts
export async function getAccountId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('account_members')
    .select('account_id')
    .eq('user_id', userId)
    .single()
  if (error || !data) throw new Error('No account found for user')
  return data.account_id
}
```

---

### Pattern 9: Tags — Managed List + Free-Form Combobox

**What:** Tags are stored as `text[]` in the database. The UI should offer a predefined list of common CRM tags (from mock data: decision-maker, champion, c-suite, clinical, technical, etc.) plus free-form entry.

**Recommendation:** Build a `TagInput` component using shadcn's Combobox pattern with:
- Dropdown shows matching predefined tags filtered by typed text
- If typed text doesn't match any predefined tag, show "Add '[text]'" option
- Selected tags render as Badge chips above/below the input
- Chip has an X button to remove

**Source:** shadcn combobox creatable pattern (confirmed via web search, shadcn/ui expansions), no additional library needed — build on existing Popover + Command primitives from radix-ui.

```typescript
// Predefined tag suggestions (derive from mock data + common CRM tags)
const COMMON_TAGS = [
  'decision-maker', 'champion', 'c-suite', 'clinical', 'technical',
  'finance', 'procurement', 'operations', 'strategy', 'influencer',
  'end-user', 'budget-holder', 'it', 'it-decision-maker',
]

// TagInput accepts value (string[]) and onChange
// Shows Combobox with COMMON_TAGS filtered by search
// If search term not in list, show "Add 'search'" option → push to tags
```

---

### Pattern 10: Deal Positions (Kanban Ordering)

**What:** The `deals` table has a `position` column (`text`, default `'n'`). This is designed for fractional indexing — string-based ordering that avoids renumbering on every reorder.

**Recommendation for Phase 3:** Keep it simple. On drag-and-drop, update only `stage_id` (the column move). Within-column reordering can use visual order only, not persisted position (the column re-sorts by `created_at` on load). Full fractional indexing (LexoRank style) is deferred complexity not required by Phase 3 requirements.

**Key insight:** DEAL-03 requires drag-and-drop between stages — that's the hard requirement. Within-column ordering is not a stated requirement. Use `position` column only if within-column order becomes important later.

---

### Anti-Patterns to Avoid

- **`useEffect` + `fetch` for data:** Server Components query Supabase directly. No client-side data fetching for initial page load.
- **`.eq('deleted_at', null)` for NULL checks:** Must use `.is('deleted_at', null)` — PostgREST uses IS for NULL comparison.
- **Importing from `src/data/mock-*` in new components:** Mock data must be removed from each entity as it's wired. Don't build new components on top of mock types.
- **`supabase.auth.getSession()` on server:** Always use `supabase.auth.getUser()` — getSession() trusts client JWT without server validation.
- **Forgetting `revalidatePath`:** After every mutation Server Action, call `revalidatePath('/relevant-route')` or the UI won't update.
- **Missing `deleted_at IS NULL` filter:** Every entity list query must filter soft-deleted rows. RLS does NOT auto-filter deleted rows — the policy only checks account membership, not deletion status.
- **Building on mock type shapes:** Mock `Contact` has flat `name: string`, `organization: string`. Live Contact has `first_name`, `last_name`, and orgs via junction. Update all component props.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop Kanban | Custom drag with mouse events | @dnd-kit (already installed) | Accessibility, touch support, scroll detection already handled |
| Form state + validation | Custom form handler | react-hook-form + zod (already installed) | Uncontrolled inputs, error state, type safety |
| Tag input with suggestions | Custom dropdown | Build on radix-ui Popover + Command (already in radix-ui) | WAI-ARIA compliance, keyboard navigation |
| Full-text search | ILIKE queries | PostgreSQL tsvector + textSearch() | GIN index = fast; ILIKE = full scan |
| Pagination offset | Custom SQL | Supabase .range(from, to) + count: 'exact' | Total count returned in same query |
| Multi-select combobox | Custom select | shadcn Combobox pattern on Popover + Command | Already available, matches design system |
| Soft delete filtering | Views or triggers | `.is('deleted_at', null)` filter on every query | Simple, explicit, no magic |
| Toast notifications | Custom toast | shadcn Toaster (sonner-based) | Add `npx shadcn add sonner` — one line |

---

## Common Pitfalls

### Pitfall 1: Type Mismatch Between Mock and Live Data

**What goes wrong:** Existing components type their props against mock types (`Contact` from `src/data/mock-contacts.ts`, `Deal` from `src/data/mock-deals.ts`). These don't match the Supabase schema.

**Key mismatches:**
- Mock `Contact.name` (string) → Live: `first_name + last_name` (separate columns)
- Mock `Contact.organization` (string) → Live: junction table `contact_organizations`
- Mock `Deal.stage` (PipelineStage string) → Live: `stage_id` (UUID FK)
- Mock `Deal.name` → Live: `deal.title`
- Mock `Deal.organizationName` → Live: must join `organizations.name`
- Mock `Deal.contactName` → Live: must join through a `deal_contacts` junction (not yet in schema!)
- Mock `Interaction.date` → Live: `occurred_at`
- Mock `Interaction.summary` → Live: `body` (and `subject` is separate)
- Mock `Task.status` (pending/completed/overdue) → Live: `is_complete` boolean + computed overdue from `due_date`

**How to avoid:** Create a `src/lib/types/app.ts` with application-level types that map from DB rows to UI-friendly shapes. Query functions return these app types, not raw DB types.

**Warning signs:** TypeScript errors when passing DB query results to existing components.

---

### Pitfall 2: Deal-Contact Link Missing from Schema

**What goes wrong:** DEAL-01 requires "linked contacts" on a deal. The schema has `deals.organization_id` (FK) but NO `deal_contacts` junction table. The existing mock data has a single `contactId` per deal.

**Discovery:** Confirmed by reading the live Supabase schema — `deals` table has `organization_id` and `owner_id` but no contact link beyond owner.

**Recommendation:** Add a `deal_contacts` junction table migration at the start of Phase 3 OR simplify to just link via the `owner_id` field (which already exists) and treat that as the primary contact. Decision needed at plan time.

**How to avoid:** Review the schema gap early. The planner should include a migration step to add `deal_contacts` before implementing DEAL-01.

---

### Pitfall 3: Kanban Needs Stage IDs, Not Stage Names

**What goes wrong:** The current KanbanBoard works with string stage names from mock data. The live database uses UUIDs for stage IDs. The column-to-id mapping must be loaded from the database at page load.

**Live stage IDs (from Supabase MCP):**
- Lead: `59d66b81-db42-4ede-9501-ff3c29811d5e`
- Qualified: `ff934e7a-80d6-4933-a50d-f470ca62634a`
- Demo: `ebf293dc-c525-470d-bfd4-b72349f74d6a`
- Proposal: `042c761a-576d-4329-b602-443437f9ba2c`
- Closed Won: `cb89baeb-f5e0-43ea-97f5-1dc42ca87199`
- Closed Lost: `4119c01c-659c-427e-8a25-1b9a40001d77`

**Note:** The live stage names differ from mock data (Lead/Qualified/Demo vs Prospecting/Qualification/Proposal). The DEAL-04 requirement says "pre-configured with healthtech defaults" — the seeded stages are the canonical ones.

**How to avoid:** Fetch `pipeline_stages` from the database at Kanban page load (Server Component or initial props). Pass as `stages` prop to KanbanBoard. The board maps deals by `stage_id`, not by stage name.

---

### Pitfall 4: Forgetting the Account ID on Every Insert

**What goes wrong:** Every INSERT to every CRM table requires `account_id`. Forgetting it causes a NOT NULL constraint violation. The account_id is not part of the form — it comes from `account_members`.

**How to avoid:** Create a shared `getAccountId(supabase, userId)` query helper and call it at the top of every create Server Action.

---

### Pitfall 5: Search via Tags Needs `.contains()`, Not `.textSearch()`

**What goes wrong:** Tags are stored as a `text[]` array column. The `search_vector` column does NOT index array contents. You cannot use `.textSearch()` to find a contact by tag.

**Correct approach:**
```typescript
// Filter by tag — array contains filter
.contains('tags', ['decision-maker'])

// Search by text AND filter by tag
.textSearch('search_vector', query, { type: 'websearch' })
.contains('tags', [selectedTag])
```

**How to avoid:** Use `.textSearch()` only on `search_vector`. Use `.contains()` for array column filtering.

---

### Pitfall 6: Organization Type Mismatch

**What goes wrong:** Mock organizations have types: `hospital-network | hospital | clinic | diagnostics | oncology`. The live DB has a CHECK constraint: `type = ANY (ARRAY['hospital'::text, 'clinic'::text, 'lab'::text, 'other'::text])`. Different values.

**How to avoid:** Use the DB enum from `src/types/database.ts`. Do NOT carry over mock type values. The Zod schema for org creation must use the DB-valid values.

---

### Pitfall 7: Interactions Table Has No Seed Data

**What goes wrong:** The live `interactions` table has 0 rows. Wiring the interaction timeline to live data will show empty state immediately. This is fine for new accounts but means the "recent activity" dashboard widget needs graceful empty state.

**Confirmed:** Supabase MCP shows `interactions` rows = 0, `tasks` rows = 0.

---

## Code Examples

### Full Contact List Page (Server Component Pattern)

```typescript
// src/app/(app)/contacts/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ContactsTable } from '@/components/contacts/contacts-table'
import { Pagination } from '@/components/shared/pagination'
import { ContactSearchForm } from '@/components/contacts/contact-search-form'

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; tag?: string }>
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const { search, page, tag } = await searchParams
  const supabase = await createClient()

  const currentPage = Number(page) || 1
  const pageSize = 20
  const from = (currentPage - 1) * pageSize

  let query = supabase
    .from('contacts')
    .select(`
      *,
      contact_organizations(
        is_primary,
        organizations(id, name)
      )
    `, { count: 'exact' })
    .is('deleted_at', null)
    .order('last_name')
    .range(from, from + pageSize - 1)

  if (search) {
    query = query.textSearch('search_vector', search, { type: 'websearch' })
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data: contacts, count, error } = await query
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <ContactSearchForm defaultSearch={search} defaultTag={tag} />
      <ContactsTable contacts={contacts ?? []} />
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  )
}
```

### Delete with Soft Delete

```typescript
// src/lib/actions/contacts.ts
'use server'

export async function deleteContact(contactId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('contacts')
    .update({ deleted_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', contactId)

  if (error) return { error: error.message }

  revalidatePath('/contacts')
  return {}
}
```

### Dashboard Metrics Query

```typescript
// src/lib/queries/dashboard.ts
export async function getDashboardMetrics() {
  const supabase = await createClient()

  const [dealsResult, tasksResult, activityResult] = await Promise.all([
    // Pipeline value by stage
    supabase
      .from('deals')
      .select('value, stage_id, pipeline_stages(name, display_order, is_won, is_lost)')
      .is('deleted_at', null),

    // Tasks due today + overdue
    supabase
      .from('tasks')
      .select('id, due_date, is_complete')
      .is('deleted_at', null)
      .eq('is_complete', false),

    // Recent interactions
    supabase
      .from('interactions')
      .select('*, contacts(first_name, last_name), deals(title)')
      .is('deleted_at', null)
      .order('occurred_at', { ascending: false })
      .limit(10),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEnd = new Date(today)
  todayEnd.setHours(23, 59, 59, 999)

  const tasks = tasksResult.data ?? []
  const tasksDueToday = tasks.filter(t =>
    t.due_date && new Date(t.due_date) >= today && new Date(t.due_date) <= todayEnd
  ).length
  const overdueTasks = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < today
  ).length

  return {
    deals: dealsResult.data ?? [],
    tasksDueToday,
    overdueTasks,
    recentActivity: activityResult.data ?? [],
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useEffect` + `fetch` for data loading | Server Components query DB directly | Next.js 13+ (App Router) | No loading flash, better SEO, no API routes needed for reads |
| `useState` + `useReducer` for form state | `useActionState` (React 19) | React 19 / Next.js 15+ | Built-in pending, error, success — matches existing auth pattern |
| Manual optimistic state with useEffect syncing | `useTransition` + local state snapshot | React 18+ | Proper concurrent mode rollback without useEffect |
| `middleware.ts` for session refresh | `proxy.ts` | Next.js 16 | DONE in Phase 2 — proxy.ts is at src/proxy.ts |
| `getSession()` on server | `getUser()` on server | Supabase best practices 2024 | Security: getUser() validates against auth server |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`. Not installed, do not add.
- Mock data in `src/data/`: Remove each file as the entity is wired.

---

## Open Questions

1. **Deal-Contact Junction Table**
   - What we know: `deals` table has no contact link beyond `owner_id`. DEAL-01 requires "linked contacts."
   - What's unclear: Should a `deal_contacts` junction table be added, or should linked contacts be satisfied by using `owner_id` as the single primary contact?
   - Recommendation: Add a `deal_contacts` migration. It's a natural join (a deal involves multiple contacts) and aligns with how interactions already link to both contact_id and deal_id.

2. **Stage Name/Color Mapping in KanbanColumn**
   - What we know: KanbanColumn has hardcoded STAGE_CONFIG keyed by string stage names (Prospecting, Qualification, etc.). Live stages are Lead, Qualified, Demo, Proposal, Closed Won, Closed Lost.
   - What's unclear: Should stage colors come from `pipeline_stages.color` column (which has hex colors like `#6366f1`) or remain as OKLCH values hardcoded in the component?
   - Recommendation: Use `pipeline_stages.color` from DB as accent color basis, but convert or map to OKLCH at render time for consistency with design system.

3. **Modal vs Sheet for Create/Edit Forms**
   - What we know: Phase 1 established Sheet (slide-over) for contact quick-view. Contacts table has a Sheet for detail preview.
   - Recommendation: Use Sheet (slide-over) for all create/edit forms to maintain consistency with established pattern. Full page navigation only for detail views. Exceptions: Interaction "quick-log" can use a compact modal dialog.

4. **Overdue Task Visual Treatment**
   - What we know: TASK-03 requires overdue tasks to be "visually flagged." Context says both sidebar badge and dashboard banner are options.
   - Recommendation: Red/destructive color on the due date text within the task row, plus a count badge on the sidebar nav item for Tasks. Dashboard TasksWidget already shows overdue count — keep it there, no separate banner needed.

---

## Sources

### Primary (HIGH confidence)
- **Supabase MCP live schema** — All table structures, column types, constraints, row counts confirmed via `list_tables` and `execute_sql` on project `ntrliqzjbmhkkqhxtvqe`
- **src/types/database.ts** — Generated TypeScript types, cross-referenced against live schema
- **src/components/** — All existing Phase 1 components read directly for accurate capability assessment
- **[Supabase Full Text Search docs](https://supabase.com/docs/guides/database/full-text-search)** — textSearch() API, tsvector generated column pattern, websearch_to_tsquery
- **[Next.js Updating Data docs](https://nextjs.org/docs/app/getting-started/updating-data)** — Server Actions, revalidatePath, useActionState pattern
- **[Next.js searchParams docs](https://nextjs.org/docs/app/api-reference/file-conventions/page)** — searchParams as Promise in Next.js 16

### Secondary (MEDIUM confidence)
- **[Supabase soft delete troubleshooting](https://supabase.com/docs/guides/troubleshooting/soft-deletes-with-supabase-js)** — `.is('deleted_at', null)` pattern confirmed
- **[React 19 useOptimistic](https://react.dev/reference/react/useOptimistic)** — Hook signature and rollback behavior
- **[dnd-kit GitHub discussion #1522](https://github.com/clauderic/dnd-kit/discussions/1522)** — Snap-back on failed optimistic update pattern
- **Web search: Next.js 16 server actions CRUD 2026** — Multiple verified sources confirming useActionState pattern

### Tertiary (LOW confidence)
- **Fractional indexing pattern for deal positions** — Web search confirmed concept but specific library not evaluated. LOW confidence on exact implementation — kept out of scope for Phase 3.
- **shadcn combobox creatable pattern** — Confirmed via web search but exact API depends on installed radix-ui version; verify at implementation time.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries confirmed installed in package.json; live DB schema confirmed via MCP
- Architecture: HIGH — Server Component + Server Action pattern confirmed in existing Phase 2 auth code; same pattern extends to CRUD
- Pitfalls: HIGH — Type mismatches confirmed by direct code inspection; schema gaps confirmed via MCP; NULL filter confirmed via Supabase docs
- Kanban optimistic: MEDIUM — Pattern confirmed via web search and React 19 docs, but exact rollback wiring needs validation at implementation time

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (stable stack, but verify shadcn combobox API before implementing tags)
