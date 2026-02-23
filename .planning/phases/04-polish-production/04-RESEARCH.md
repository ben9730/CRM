# Phase 4: Polish & Production - Research

**Researched:** 2026-02-23
**Domain:** CSV export, Playwright E2E testing, global search, avatar dropdown, task auto-linking, production deployment, security audit
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Production Polish (UAT Feedback Items)
- **Global search**: Search bar navigates to a `/search` results page showing results grouped by entity type (Contacts, Deals, Organizations) — not a live dropdown
- **Avatar profile dropdown**: Minimal — shows user name, email, and a Logout button. No settings link.
- **Auto-link tasks to context**: When creating a task from a contact or deal detail page, automatically set the linked entity (contact_id or deal_id) without the user having to select it manually

#### E2E Test Coverage
- **Critical flows to test**: CRUD operations (contacts, orgs, deals, tasks, interactions), Kanban drag-and-drop (deal stage changes), Dashboard loads with metrics
- **Auth flows**: Not in E2E scope (user decided)
- **Test target**: Live Supabase — tests run against the real Vercel+Supabase deployment
- **Test data strategy**: Create & cleanup — each test creates its own data, runs assertions, then deletes it. Isolated and repeatable.
- **CI integration**: Local only — run with `npx playwright test`. No GitHub Actions for now.

#### CSV Export
- Claude's discretion on column selection, filename format, and Hebrew text handling (discuss-phase did not cover this — use sensible defaults)

#### Tooling & Agents
- Actively leverage available skills, agents, and MCP tools during execution:
  - `security-reviewer` agent for security audit
  - `e2e-runner` skill / Playwright MCP for E2E test generation and execution
  - Supabase MCP for database operations and advisory checks
  - Any other applicable skills from the available toolkit

### Claude's Discretion
- CSV export column selection and filename format
- E2E test framework details (Playwright config, test structure)
- Security review scope and remediation approach
- Loading states, error handling, and responsive polish as encountered

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | User can export contacts to CSV | Next.js Route Handler returning CSV blob; client-side download trigger via `<a>` with `download` attribute |
| DATA-02 | User can export organizations to CSV | Same Route Handler pattern as DATA-01; orgs table columns are straightforward flat fields |
| DATA-03 | User can export deals to CSV | Route Handler pattern; must JOIN pipeline_stages for stage name and organizations for org name |
| PROC-04 | Security reviewed using `security-reviewer` agent before production deployment | Invoke security-reviewer agent; use Supabase MCP `get_advisors` for automated RLS/perf checks |

</phase_requirements>

---

## Summary

Phase 4 is a finishing phase: it adds CSV export for three entities, three UX polish items from Phase 3 UAT feedback (global search page, avatar dropdown, task auto-linking), a security audit, a Playwright E2E test suite against production, and final production verification. The codebase is already well-structured — all entity pages, Server Actions, and queries exist. This phase adds endpoints and UI elements on top of an established foundation.

CSV export is the only new backend surface. The correct Next.js 16 pattern is a Route Handler at `src/app/api/export/[entity]/route.ts` that streams CSV data from Supabase and returns a `Response` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename=...`. No third-party library is needed for simple CSV — the data can be serialized manually or with a tiny utility. The client triggers the download with a standard `<a>` element pointing at the API route.

The three UX polish items are additive changes to existing components. Global search requires a new `/search` page (Server Component) and a query that searches contacts, deals, and organizations simultaneously using existing `textSearch` + full-text patterns. The avatar dropdown upgrades the existing `<Avatar>` in `app-header.tsx` to wrap with a `DropdownMenu` (Radix UI already installed via `radix-ui` package). Task auto-linking is already partially implemented: `AddTaskButton` and `TaskFormSheet` already accept `defaultContactId` / `defaultDealId` props — the only work needed is verifying that the contact/deal detail page passes those props correctly and that `TaskForm` wires the hidden inputs properly.

**Primary recommendation:** Implement in plan order — CSV export first (self-contained), then UX polish (contact/deal detail pages already have the task infrastructure), then security review and E2E suite together as a validation gate, then production deployment verification.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Route Handlers | 16.1.6 (installed) | Serve CSV files as download responses | Native Next.js — no extra library needed |
| @playwright/test | 1.58.2 (installed) | E2E testing framework | Already installed as devDep |
| Supabase JS | 2.97.0 (installed) | Database queries in Route Handlers | Already used throughout |
| sonner | 2.0.7 (installed) | Toast feedback on export trigger | Already used for all feedback |
| radix-ui | 1.4.3 (installed) | DropdownMenu for avatar | Already installed — no new install |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Built-in `TextEncoder` / string concat | browser/Node built-in | CSV serialization | Sufficient for this data volume — no library needed |
| Playwright MCP | available in env | E2E test generation | Use during 04-02 plan execution |
| Supabase MCP `get_advisors` | available in env | Security/performance advisory | Use during security review |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual CSV string | `papaparse` | papaparse handles edge cases (embedded commas, quotes, newlines in fields) — warranted if notes/description fields may contain commas or newlines. At this scale, manual serialization with proper quote-escaping is fine |
| Route Handler download | Server Action + blob URL | Route Handlers are simpler for file downloads — stable, browser-friendly |
| Playwright direct | Cypress | Playwright already installed, wider browser support, better async handling |

**Installation:** No new packages needed. All dependencies already present.

---

## Architecture Patterns

### Recommended Project Structure

```
src/app/api/
└── export/
    └── [entity]/
        └── route.ts        # handles ?entity= contacts|organizations|deals

src/app/(app)/
└── search/
    └── page.tsx            # new: global search results page

src/components/layout/
└── app-header.tsx          # modify: wrap Avatar in DropdownMenu

src/components/contact-detail/
└── linked-tasks.tsx        # already has defaultContactId wiring — verify

src/components/deals/
└── deal-detail-view.tsx    # already passes deal id to LinkedTasks — verify

e2e/
└── contacts.spec.ts
└── organizations.spec.ts
└── deals.spec.ts
└── tasks.spec.ts
└── interactions.spec.ts
└── dashboard.spec.ts
```

### Pattern 1: CSV Route Handler

**What:** An authenticated Next.js Route Handler that fetches all non-deleted records for an entity, serializes to CSV, and returns with download headers.

**When to use:** Any file download that requires auth and live data.

```typescript
// src/app/api/export/[entity]/route.ts
// Confidence: HIGH — standard Next.js Route Handler pattern

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  // Quote fields containing comma, newline, or double-quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',')
  const body = rows.map(row =>
    columns.map(col => escapeCsvField(row[col] as string)).join(',')
  ).join('\n')
  return `${header}\n${body}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { entity } = await params
  // ... fetch data, serialize, return

  const csv = toCSV(rows, columns)
  const filename = `${entity}-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
```

**Client trigger (no JavaScript needed, but can use fetch + blob for UX polish):**

```typescript
// Simple anchor approach — works without JavaScript
<a href="/api/export/contacts" download>Export CSV</a>

// Or: client-side fetch approach for loading state
async function handleExport(entity: string) {
  const res = await fetch(`/api/export/${entity}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entity}-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Pattern 2: Global Search Page (Server Component)

**What:** A `/search` Server Component page that queries all three entity tables using PostgreSQL full-text search and groups results.

```typescript
// src/app/(app)/search/page.tsx
// Queries: contacts (search_vector), organizations (search_vector), deals (title ilike)

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  if (!q) { /* show empty state */ }

  const [contacts, orgs, deals] = await Promise.all([
    searchContacts(q),      // reuse existing getContacts({ search: q })
    searchOrganizations(q), // reuse existing getOrganizations({ search: q })
    searchDeals(q),         // new: deals have no search_vector — use ilike on title
  ])
  // render grouped results
}
```

**Important:** The `app-header.tsx` already has a search form that currently routes to `/contacts?search=...`. This must be changed to `/search?q=...`.

### Pattern 3: Avatar Dropdown (radix-ui DropdownMenu)

**What:** Wrap the existing `<Avatar>` in `app-header.tsx` with a `DropdownMenu` from `radix-ui`. The `profiles` and `auth.getUser()` data is already fetched in `AppShell` and passed down via `userInitials` prop. The dropdown needs `user.email` and `profile.full_name` — currently only `userInitials` is passed. The prop interface must be extended.

```typescript
// app-header.tsx: extend AppHeaderProps
interface AppHeaderProps {
  userInitials: string
  userName?: string   // full_name or email
  userEmail?: string  // email for display
}

// Logout action — already exists: signOut() Server Action in src/lib/actions/auth.ts
// Use inside dropdown with a form element
```

**What the `AppShell` server component already does:** fetches user + profile. Just extend what's passed to `AppHeader`.

### Pattern 4: Task Auto-Link from Context (already implemented)

**What:** `AddTaskButton` already accepts `defaultContactId` and `defaultDealId` props. `LinkedTasks` component already passes `contactId` and `dealId` to `TaskFormSheet`. **Research finding: the infrastructure is already in place.**

Verification needed:
- `src/components/contact-detail/linked-tasks.tsx` line 373: `TaskFormSheet` receives `defaultContactId={contactId}` — CONFIRMED present
- `src/components/deals/deal-detail-view.tsx`: check that `LinkedTasks` is called with `dealId=deal.id`
- `src/components/tasks/task-form.tsx`: check that `defaultContactId`/`defaultDealId` pre-select the correct `Select` in the form

If the `TaskForm` Select components correctly receive and display the default values (i.e., they show the contact/deal pre-selected and submit the hidden value), this item is already done. **The plan for 04-01 should verify this and add auto-selection behavior to `TaskForm` if missing.**

### Pattern 5: Playwright E2E Config for Live Supabase

**What:** Playwright config targeting production Vercel URL. No mocking — tests hit real endpoints.

```typescript
// playwright.config.ts (project root)
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // avoid race conditions with shared live DB
  retries: 1,
  workers: 1,           // serial execution for live DB integrity
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://your-app.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
```

**Test data strategy (create & cleanup):**

```typescript
// e2e/contacts.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Contacts CRUD', () => {
  let contactId: string

  test('create a contact', async ({ page }) => {
    // navigate to contacts, open create form, fill, submit
    // capture created contact id from URL
  })

  test.afterEach(async ({ request }) => {
    // cleanup: delete via API route or direct Supabase call
    if (contactId) {
      await request.delete(`/api/test-cleanup/contacts/${contactId}`)
    }
  })
})
```

**Authentication for E2E:** Since auth flows are out of scope, tests need to run as an authenticated user. Standard approach: use Playwright `storageState` to save authenticated session once and reuse across test files. Requires a `globalSetup` that logs in once and saves cookies.

```typescript
// e2e/global-setup.ts
import { chromium } from '@playwright/test'

export default async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(process.env.PLAYWRIGHT_BASE_URL + '/login')
  await page.fill('[name="email"]', process.env.TEST_EMAIL!)
  await page.fill('[name="password"]', process.env.TEST_PASSWORD!)
  await page.click('[type="submit"]')
  await page.waitForURL('**/dashboard')
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
  await browser.close()
}
```

### Anti-Patterns to Avoid

- **Storing auth state in git:** `.auth/` directory must be in `.gitignore`
- **Missing CSV quote escaping:** Fields from `notes`, `body`, `description` can contain commas and newlines — always escape
- **UTF-8 BOM missing:** Excel on Windows misreads UTF-8 CSV without BOM. Add `\uFEFF` prefix for Excel compatibility
- **Route Handler without auth check:** Must validate `user` from `supabase.auth.getUser()` before returning data
- **Running Playwright tests in parallel against live DB:** Can cause intermittent failures; use `workers: 1`
- **Global search querying without limit:** The search page should cap results per entity (e.g., 20 each) to avoid slow responses

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV serialization with escaping | Custom regex-based escaper | Manual `escapeCsvField` with RFC 4180 quote-doubling | The escaping rules are simple but easy to get wrong — define once, test once |
| Auth session for Playwright | Cookie injection | `storageState` in `globalSetup` | Standard Playwright pattern — reuses real login session |
| Drag-and-drop E2E testing | `page.mouse.down/move/up` | `page.dragAndDrop()` or dnd-kit's data-testid locators | Playwright has built-in drag support; dnd-kit is keyboard accessible |
| Security review manual analysis | Reading every file manually | `security-reviewer` agent invocation | Purpose-built agent with security domain knowledge |
| RLS advisory check | Manual SQL inspection | Supabase MCP `get_advisors(type: "security")` | Returns automated findings including missing RLS policies |

**Key insight:** The "don't hand-roll" principle for this phase is about leveraging agents and MCP tools rather than reinventing audits or test infrastructure.

---

## Common Pitfalls

### Pitfall 1: CSV BOM and Excel Compatibility
**What goes wrong:** CSV exports open in Excel with garbled characters or fail to parse Hebrew/accented characters correctly.
**Why it happens:** Excel expects a UTF-8 BOM (`\uFEFF`) at the start of the file to detect UTF-8 encoding.
**How to avoid:** Prepend `\uFEFF` to the CSV string. The CONTEXT.md notes Hebrew text handling is at Claude's discretion — this is the correct default.
**Warning signs:** Characters like `à`, `é`, Hebrew letters render as `?` or `Ã¨` in Excel.

### Pitfall 2: Search Page Routing Conflict
**What goes wrong:** The existing `app-header.tsx` search form routes to `/contacts?search=...` — if unchanged, the global search page at `/search` won't be reached.
**Why it happens:** The header form's `handleSearch` function calls `router.push('/contacts?search=...')`.
**How to avoid:** Update `handleSearch` to route to `/search?q=...` instead. This is a one-line change in `app-header.tsx`.
**Warning signs:** Submitting search from the header still goes to the contacts page.

### Pitfall 3: Deals Have No search_vector
**What goes wrong:** The global search page fails to find deals or throws a PostgREST error.
**Why it happens:** `contacts` and `organizations` have `search_vector` (GIN-indexed tsvector) columns. `deals` table does NOT (confirmed via `database.ts` — the `deals.Row` has no `search_vector`).
**How to avoid:** For deals, use `.ilike('title', `%${query}%`)` instead of `.textSearch()`. This is slightly less powerful but sufficient for title-based deal search.
**Warning signs:** `textSearch` on deals returns PostgREST error about missing column.

### Pitfall 4: Route Handler Authentication in Next.js 16
**What goes wrong:** `createClient()` in a Route Handler uses cookies but Next.js 16 Route Handlers need the same `await cookies()` pattern.
**Why it happens:** The existing `createClient()` in `src/lib/supabase/server.ts` already handles `await cookies()` correctly — this is NOT a new problem. But any new export Route Handler must use the same `createClient()` from `@/lib/supabase/server`, not a plain Supabase client.
**How to avoid:** Import `createClient` from `@/lib/supabase/server` in all Route Handlers (same as Server Actions do).

### Pitfall 5: E2E Test Data Pollution
**What goes wrong:** Tests leave orphaned records in the production database; over time this creates noise.
**Why it happens:** Tests fail mid-execution before cleanup runs, or cleanup is not implemented.
**How to avoid:** Use `test.afterEach` / `test.afterAll` cleanup hooks. Use a recognizable prefix in test data (e.g., `[E2E TEST]` in title/name) so orphaned records are identifiable. Consider a cleanup endpoint or direct Supabase service role cleanup.

### Pitfall 6: Kanban Drag-and-Drop E2E
**What goes wrong:** Playwright `dragAndDrop` fails on `@dnd-kit` based Kanban because dnd-kit intercepts pointer events differently than native HTML drag.
**Why it happens:** `@dnd-kit` uses pointer events, not HTML5 drag API. Playwright's `dragAndDrop` simulates pointer events so it should work, but requires correct locators.
**How to avoid:** Use `page.locator('[data-testid="deal-card-{id}"]').dragTo(page.locator('[data-testid="stage-{stageId}"]'))`. This requires adding `data-testid` attributes to `DealCard` and `KanbanColumn` components if not present.

### Pitfall 7: Avatar Dropdown Data Not Passed Down
**What goes wrong:** Dropdown shows "Loading..." or empty name/email because `AppHeader` only receives `userInitials` string.
**Why it happens:** `AppShell` fetches user profile but only passes `userInitials` to `AppHeader`. Email and full name are not in the prop interface.
**How to avoid:** Extend `AppHeaderProps` to include `userName?: string` and `userEmail?: string`. Pass these from `AppShell` which already has the user and profile data.

---

## Code Examples

### CSV Export: Column Selection (Claude's Discretion)

Recommended column sets based on database schema:

**Contacts:**
```
id, first_name, last_name, email, phone, title, tags (semicolon-joined), organizations (names, semicolon-joined), notes, created_at
```

**Organizations:**
```
id, name, type, phone, website, address, city, state, tags (semicolon-joined), notes, created_at
```

**Deals:**
```
id, title, stage (name), value, currency, organization (name), expected_close, closed_at, notes, created_at
```

Array fields (`tags`, organization names) should be serialized as semicolon-joined strings (e.g., `"tag1;tag2"`) to stay within a single CSV cell.

**Filename format (Claude's discretion):**
```
contacts-2026-02-23.csv
organizations-2026-02-23.csv
deals-2026-02-23.csv
```

ISO date suffix from server-side `new Date().toISOString().slice(0, 10)`.

### Export Button Placement

Consistent with existing pages: place an "Export CSV" button alongside the page header actions (next to "New Contact", "New Organization", "New Deal"). Use `variant="outline"` to differentiate from primary create action. Add a `Download` icon from `lucide-react`.

```typescript
// In contacts/page.tsx header area — alongside ContactCreateButton
<ExportButton entity="contacts" />

// ExportButton component (client component for loading state)
'use client'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function ExportButton({ entity }: { entity: string }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const res = await fetch(`/api/export/${entity}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entity}-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setLoading(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="h-4 w-4 mr-1.5" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </Button>
  )
}
```

### Avatar Dropdown Pattern (using radix-ui DropdownMenu)

The `radix-ui` package (v1.4.3) is a meta-package that re-exports all Radix primitives. `DropdownMenu` is available as `import { DropdownMenu, ... } from 'radix-ui'` or via shadcn-generated component.

```typescript
// Check if shadcn dropdown-menu is already generated
// If not: npx shadcn@latest add dropdown-menu
// Then use @/components/ui/dropdown-menu

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/actions/auth'

// In AppHeader:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Avatar className="h-7 w-7 cursor-pointer ...">
      <AvatarFallback ...>{userInitials}</AvatarFallback>
    </Avatar>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuLabel className="font-normal">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">{userName}</p>
        <p className="text-xs text-muted-foreground">{userEmail}</p>
      </div>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
      <form action={signOut}>
        <button type="submit" className="w-full text-left text-destructive">
          Log out
        </button>
      </form>
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Playwright globalSetup Pattern

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  use: {
    storageState: 'e2e/.auth/user.json',
  },
})
```

```typescript
// e2e/global-setup.ts
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const baseURL = config.projects[0].use.baseURL!

  await page.goto(`${baseURL}/login`)
  await page.getByLabel('Email').fill(process.env.TEST_EMAIL!)
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(`${baseURL}/dashboard`)

  await page.context().storageState({ path: 'e2e/.auth/user.json' })
  await browser.close()
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getByTestId` for everything | Prefer semantic locators (`getByRole`, `getByLabel`) | Playwright 1.x ongoing | More resilient to implementation changes |
| Next.js API Routes (pages router) | Route Handlers (app router) | Next.js 13+ | Already using app router — use Route Handlers |
| Playwright `page.waitForSelector` | `page.waitForURL`, `expect(locator).toBeVisible()` | Playwright 1.20+ | Auto-wait makes explicit waits unnecessary |

**Deprecated/outdated:**
- `router.push` with direct search string to `/contacts`: Replaced by global `/search` page per user decision.

---

## Open Questions

1. **Does `TaskForm` pre-select the contact/deal when `defaultContactId`/`defaultDealId` are passed?**
   - What we know: `AddTaskButton`, `TaskFormSheet`, and `LinkedTasks` all pass these props correctly through the chain
   - What's unclear: Whether the `TaskForm` Radix Select component renders with the correct `defaultValue` and submits it
   - Recommendation: Inspect `src/components/tasks/task-form.tsx` at plan execution time — it's a 5-minute verification. If the Select uses `defaultValue={defaultContactId}` and the hidden input is wired, it already works.

2. **Is `dropdown-menu` shadcn component already generated?**
   - What we know: `radix-ui` meta-package is installed; shadcn UI components are in `src/components/ui/`
   - What's unclear: Whether `dropdown-menu.tsx` exists in `src/components/ui/`
   - Recommendation: Check `ls src/components/ui/` at plan execution time. If missing, run `npx shadcn@latest add dropdown-menu`.

3. **E2E test cleanup mechanism for live Supabase**
   - What we know: Tests create real data against live Supabase; `test.afterEach` can clean up
   - What's unclear: Whether to use a Supabase service role key for cleanup (bypasses RLS) or the test user's authenticated session
   - Recommendation: Use the test user's authenticated session for cleanup (call the existing delete Server Actions or API routes) — avoids needing a service role key in test config. If that's insufficient, use `supabase.from(...).delete()` directly with the client authenticated as the test user.

4. **Vercel production URL for E2E baseURL**
   - What we know: `ARCH-04` is marked complete — app is deployed on Vercel+Supabase
   - What's unclear: The exact production URL is not in any config file (not in `package.json` or `.env.example`)
   - Recommendation: Set `PLAYWRIGHT_BASE_URL` environment variable in `.env.test.local` pointing to the Vercel deployment URL. Planner should note this as a prerequisite for 04-02.

---

## Security Review Scope

When invoking the `security-reviewer` agent (PROC-04), the review should cover:

**Auth endpoints:**
- `src/lib/supabase/proxy.ts` — session cookie handling
- `src/lib/actions/auth.ts` — signIn, signUp, signOut, resetPassword Server Actions
- Route Handlers (new in this phase) — auth check present?

**RLS policies:**
- All Supabase tables: `contacts`, `organizations`, `deals`, `tasks`, `interactions`, `deal_contacts`, `contact_organizations`, `pipeline_stages`, `accounts`, `account_members`, `profiles`
- Use Supabase MCP `get_advisors(type: "security")` for automated scan

**API routes:**
- New `/api/export/[entity]/route.ts` — auth check before data access
- Existing `src/proxy.ts` — auth guard coverage

**Data handling:**
- Server Actions: all perform `supabase.auth.getUser()` before mutations
- CSV export: data filtered by account (via RLS) — no cross-account data leakage
- Input sanitization: Zod schemas on all Server Actions

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection (`src/` directory) — direct code analysis of existing patterns, types, and component interfaces
- `package.json` — confirmed installed versions: Next.js 16.1.6, @playwright/test 1.58.2, @supabase/ssr 0.8.0, radix-ui 1.4.3
- `src/types/database.ts` — confirmed column lists for CSV export (contacts, organizations, deals, tasks, interactions tables)
- `.planning/phases/04-polish-production/04-CONTEXT.md` — user decisions

### Secondary (MEDIUM confidence)
- Playwright documentation patterns (training knowledge, version 1.58.x) — `globalSetup`, `storageState`, `dragAndDrop` API
- Next.js App Router Route Handler patterns (training knowledge, Next.js 16 compatible)
- RFC 4180 CSV spec — quote-doubling escaping rule

### Tertiary (LOW confidence)
- dnd-kit + Playwright drag interaction behavior — training knowledge, not verified against 1.58.2 + dnd-kit 6.x combo. Flag for executor: may need to use keyboard-based drag test if pointer-based drag fails.

---

## Metadata

**Confidence breakdown:**
- CSV export pattern: HIGH — standard Next.js Route Handler, no unknowns, auth pattern matches existing codebase exactly
- Global search page: HIGH — search infrastructure (textSearch, ilike) verified in existing queries; routing change is trivial
- Avatar dropdown: HIGH — radix-ui installed, shadcn pattern confirmed, auth action exists
- Task auto-linking: HIGH — infrastructure already in place, verification is the only work
- Playwright E2E: MEDIUM — framework installed, patterns are standard, but dnd-kit drag interaction is LOW confidence
- Security review: HIGH — scope is clear, tooling (security-reviewer agent + Supabase MCP advisors) is defined

**Research date:** 2026-02-23
**Valid until:** 2026-03-25 (stable stack — 30 days)
