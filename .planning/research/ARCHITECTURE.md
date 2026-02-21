# Architecture Research

**Domain:** CRM Web Application (healthcare/B2B focus)
**Researched:** 2026-02-21
**Confidence:** HIGH (Next.js official docs, Supabase official docs, multiple verified sources)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser (Client Layer)                           │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │
│  │  Contacts UI  │  │  Deals/      │  │ Interaction│  │  Tasks &    │  │
│  │  (Server +    │  │  Kanban      │  │  Feed      │  │  Reminders  │  │
│  │  Client RSC)  │  │ (Client RSC) │  │(Server RSC)│  │(Server RSC) │  │
│  └───────┬───────┘  └──────┬───────┘  └─────┬──────┘  └──────┬──────┘  │
└──────────┼─────────────────┼────────────────┼────────────────┼──────────┘
           │                 │                │                │
┌──────────┼─────────────────┼────────────────┼────────────────┼──────────┐
│          │         Next.js App Router (Server Layer)         │          │
│  ┌───────▼───────────────────────────────────────────────────▼───────┐  │
│  │  Server Components (data fetch, auth check, initial render)       │  │
│  │  Server Actions (mutations: create/update/delete via forms)       │  │
│  │  Route Handlers (API endpoints for complex operations)            │  │
│  └──────────────────────────────┬────────────────────────────────────┘  │
│                                 │  Supabase JS Client (server-side)      │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼──────────────────────────────────────┐
│                    Supabase (Backend Layer)                              │
│  ┌─────────────────┐  ┌─────────┴─────────┐  ┌───────────────────────┐  │
│  │  Auth           │  │  PostgreSQL        │  │  Realtime             │  │
│  │  (JWT-based)    │  │  (primary store)   │  │  (WAL subscriptions   │  │
│  │                 │  │  + RLS policies    │  │   for live updates)   │  │
│  └─────────────────┘  └────────────────────┘  └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Next.js Server Components | Fetch data from Supabase, render HTML, zero client JS | `async function Page()` with `await supabase.from(...).select()` |
| Next.js Client Components | Drag-and-drop Kanban, form state, real-time updates | `'use client'` + `useState` + `useEffect` |
| Next.js Server Actions | Mutations (create/update/delete) without separate API routes | `'use server'` functions called from forms/buttons |
| Supabase Auth | User sessions, JWT tokens scoped to RLS | `supabase.auth.signIn()`, middleware session refresh |
| Supabase PostgreSQL | All CRM data with enforced relationships via FK | Tables with UUID PKs, FK constraints, CHECK constraints |
| Supabase RLS | Row-level authorization — users only see their org's data | Policies using `auth.uid()` and team membership queries |
| Supabase Realtime | Push DB changes to browser (Kanban moves, new activities) | WAL streaming subscriptions on specific tables |

## Recommended Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group — no shared layout with app
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx            # Auth-only layout (centered card)
│   ├── (app)/                    # Route group — authenticated app shell
│   │   ├── layout.tsx            # App shell: sidebar + top nav
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Home/overview
│   │   ├── contacts/
│   │   │   ├── page.tsx          # Contact list (Server Component)
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Contact detail
│   │   │   └── _components/      # Private — not routable
│   │   │       ├── ContactTable.tsx
│   │   │       └── ContactFilters.tsx
│   │   ├── organizations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── deals/
│   │   │   ├── page.tsx          # Kanban board (Client Component shell)
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Deal detail
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   └── interactions/
│   │       └── page.tsx          # Activity feed
│   └── api/                      # Route handlers (webhooks, file ops)
│       └── webhooks/
│           └── route.ts
├── components/                   # Shared UI (no data-fetching)
│   ├── ui/                       # Primitives: Button, Input, Badge, etc.
│   └── layout/                   # Sidebar, TopNav, PageHeader
├── lib/                          # Server-only business logic
│   ├── supabase/
│   │   ├── server.ts             # Supabase client for Server Components
│   │   ├── client.ts             # Supabase client for Client Components
│   │   └── middleware.ts         # Session refresh middleware
│   ├── queries/                  # Data fetching functions (server-only)
│   │   ├── contacts.ts
│   │   ├── deals.ts
│   │   ├── interactions.ts
│   │   └── tasks.ts
│   └── actions/                  # Server Actions (mutations)
│       ├── contacts.ts
│       ├── deals.ts
│       └── interactions.ts
├── types/                        # TypeScript types matching DB schema
│   └── database.ts               # Generated from Supabase or hand-written
└── middleware.ts                 # Auth guard — redirect unauthenticated users
```

### Structure Rationale

- **`(auth)` vs `(app)` route groups:** Separate layouts for auth pages (centered login) vs app pages (sidebar dashboard). No URL impact.
- **`_components/` private folders:** Colocate feature-specific components with their routes without making them routable.
- **`lib/queries/` server-only:** All Supabase data fetching stays server-side. Client components receive data as props or subscribe via Realtime.
- **`lib/actions/` server actions:** Mutations use Server Actions instead of API routes, eliminating boilerplate fetch/response handling.
- **`types/database.ts`:** Single source of truth for TypeScript types. Run `supabase gen types typescript` to auto-generate from schema.

## Architectural Patterns

### Pattern 1: Server Component Data Fetching

**What:** Pages fetch data directly in Server Components using the server-side Supabase client. No client-side fetching for initial load.

**When to use:** All list pages, detail pages, read-heavy views (contacts, organizations, activity feed).

**Trade-offs:** Excellent initial load performance and SEO; requires `router.refresh()` or Realtime subscriptions for live updates after mutations.

**Example:**
```typescript
// app/(app)/contacts/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function ContactsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: contacts } = await supabase
    .from('contacts')
    .select(`
      id, first_name, last_name, email, phone, role, tags,
      organizations (id, name)
    `)
    .order('last_name', { ascending: true })

  return <ContactTable contacts={contacts ?? []} />
}
```

### Pattern 2: Server Actions for Mutations

**What:** Create/update/delete operations via Server Actions — no separate API routes needed for standard CRUD.

**When to use:** All form submissions, status changes, data edits.

**Trade-offs:** Simpler than API routes for standard mutations; keeps business logic server-side; native integration with Next.js `revalidatePath`.

**Example:**
```typescript
// lib/actions/deals.ts
'use server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDealStage(dealId: string, stageId: string) {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('deals')
    .update({ stage_id: stageId, updated_at: new Date().toISOString() })
    .eq('id', dealId)

  if (error) throw new Error(error.message)
  revalidatePath('/deals')
}
```

### Pattern 3: Optimistic Updates for Kanban Drag-and-Drop

**What:** Apply state change immediately in the client, fire Server Action, revert on error.

**When to use:** Kanban drag-and-drop, any interaction requiring instant visual feedback.

**Trade-offs:** Better UX (no lag); requires rollback logic; use `useOptimistic` (React 19) or manual state management.

**Example:**
```typescript
// app/(app)/deals/_components/KanbanBoard.tsx
'use client'
import { useOptimistic, startTransition } from 'react'
import { updateDealStage } from '@/lib/actions/deals'

export function KanbanBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [optimisticDeals, updateOptimisticDeals] = useOptimistic(
    initialDeals,
    (state, { dealId, stageId }: { dealId: string; stageId: string }) =>
      state.map(d => d.id === dealId ? { ...d, stage_id: stageId } : d)
  )

  const handleDrop = (dealId: string, stageId: string) => {
    startTransition(async () => {
      updateOptimisticDeals({ dealId, stageId })
      await updateDealStage(dealId, stageId)
    })
  }

  // render columns from optimisticDeals...
}
```

### Pattern 4: Polymorphic Activity Linking (Two-FK Pattern)

**What:** Link interactions/tasks to BOTH contacts AND deals via separate nullable FK columns, not a generic polymorphic string type.

**When to use:** Activities, tasks, notes — anything that can be attached to multiple entity types.

**Trade-offs:** More columns but full referential integrity; enables proper foreign key constraints and JOIN queries; avoids the `related_to_type`/`related_to_id` anti-pattern which breaks FK constraints.

**Example:**
```sql
-- interactions table uses nullable FKs, not a polymorphic type column
CREATE TABLE interactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  subject     text,
  body        text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  contact_id  uuid REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id     uuid REFERENCES deals(id) ON DELETE SET NULL,
  user_id     uuid NOT NULL REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- at least one of contact_id or deal_id must be set
  CONSTRAINT interaction_linked CHECK (contact_id IS NOT NULL OR deal_id IS NOT NULL)
);
```

### Pattern 5: Pipeline Stage Ordering with Fractional/Lexicographic Indexing

**What:** Store deal position within a stage using a `text` position column (lexicographic ordering), not integer sequence numbers.

**When to use:** Any drag-and-drop ordered list where items move positions frequently.

**Trade-offs:** Never requires re-indexing other records; lexicographic strings scale indefinitely; slightly more complex position calculation logic in the app layer.

**Example:**
```sql
-- stages table — ordered by display_order integer (rarely reordered)
CREATE TABLE pipeline_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  display_order integer NOT NULL,  -- integer fine; stages rarely reordered
  probability   integer CHECK (probability BETWEEN 0 AND 100),
  is_won        boolean NOT NULL DEFAULT false,
  is_lost       boolean NOT NULL DEFAULT false
);

-- deals use text position for drag-drop ordering within a stage
CREATE TABLE deals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  value         numeric(12,2),
  stage_id      uuid NOT NULL REFERENCES pipeline_stages(id),
  position      text NOT NULL DEFAULT 'n',  -- lexicographic: 'a', 'an', 'b', etc.
  ...
);
-- Index for fast stage column queries
CREATE INDEX deals_stage_position ON deals(stage_id, position);
```

## Data Flow

### Request Flow (Read — Server Component)

```
User navigates to /contacts
    |
Next.js Server (edge middleware)
    | -- checks Supabase session cookie
    | -- redirects to /login if unauthenticated
    |
Server Component renders
    | -- calls createSupabaseServerClient()
    | -- executes: SELECT contacts JOIN organizations WHERE RLS passes
    | -- RLS policy: user must be member of same team
    |
HTML streamed to browser
    | -- ContactTable renders as static HTML
    | -- Client-side JS only for interactive parts (filters, search input)
```

### Request Flow (Write — Server Action)

```
User submits "Add Contact" form
    |
Server Action executes (server-side)
    | -- validates input
    | -- calls supabase.from('contacts').insert(...)
    | -- RLS WITH CHECK policy enforces org membership
    | -- calls revalidatePath('/contacts')
    |
Next.js re-renders Server Component
    | -- fresh data from Supabase
    | -- updated HTML streamed back
```

### Real-time Flow (Kanban Updates)

```
User A drags deal to new stage
    |
Client Component (KanbanBoard)
    | -- optimistic update: move card immediately in UI
    | -- calls Server Action: updateDealStage(dealId, stageId)
    |
Supabase executes UPDATE
    | -- WAL change event emitted
    |
Supabase Realtime broadcasts to channel subscribers
    |
User B's browser (subscribed to 'deals' table changes)
    | -- receives postgres_changes event
    | -- updates local state with new stage
    | -- card moves on User B's Kanban board
```

### State Management

```
Server State (source of truth): Supabase PostgreSQL
    |
Server Components: fetch on render, no client state
    |
Client Components: local UI state only (open/close modals,
    drag state, form values) — never duplicate server state
    |
Mutations: Server Actions → revalidatePath → refetch
Real-time: Supabase Realtime subscription → setState
```

## Database Schema

### Core Tables

```sql
-- Users (managed by Supabase Auth, extended via profiles)
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Organizations (hospitals, clinics, labs)
CREATE TABLE organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  type         text CHECK (type IN ('hospital', 'clinic', 'lab', 'other')),
  website      text,
  phone        text,
  address      text,
  city         text,
  state        text,
  tags         text[] DEFAULT '{}',
  notes        text,
  owner_id     uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Contacts (people within organizations)
CREATE TABLE contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  email           text,
  phone           text,
  role            text,                    -- job title / role at org
  tags            text[] DEFAULT '{}',
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  owner_id        uuid REFERENCES auth.users(id),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX contacts_org_idx ON contacts(organization_id);
CREATE INDEX contacts_email_idx ON contacts(email);
CREATE INDEX contacts_name_idx ON contacts(last_name, first_name);

-- Pipeline Stages (ordered Kanban columns)
CREATE TABLE pipeline_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  display_order integer NOT NULL,
  probability   integer DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  is_won        boolean NOT NULL DEFAULT false,
  is_lost       boolean NOT NULL DEFAULT false,
  color         text                        -- hex color for UI column header
);

-- Deals / Opportunities
CREATE TABLE deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  value           numeric(12,2),
  currency        text NOT NULL DEFAULT 'USD',
  stage_id        uuid NOT NULL REFERENCES pipeline_stages(id),
  position        text NOT NULL DEFAULT 'n', -- lexicographic position in stage
  contact_id      uuid REFERENCES contacts(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  owner_id        uuid REFERENCES auth.users(id),
  expected_close  date,
  closed_at       timestamptz,
  notes           text,
  tags            text[] DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX deals_stage_position_idx ON deals(stage_id, position);
CREATE INDEX deals_org_idx ON deals(organization_id);

-- Interactions (calls, emails, meetings, notes)
-- Uses two-FK pattern — NOT polymorphic type column
CREATE TABLE interactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  subject         text,
  body            text,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  duration_mins   integer,                  -- for calls/meetings
  contact_id      uuid REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES deals(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  user_id         uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interaction_linked CHECK (
    contact_id IS NOT NULL OR deal_id IS NOT NULL OR organization_id IS NOT NULL
  )
);
CREATE INDEX interactions_contact_idx ON interactions(contact_id, occurred_at DESC);
CREATE INDEX interactions_deal_idx ON interactions(deal_id, occurred_at DESC);

-- Tasks / Reminders
CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  due_date        timestamptz,
  is_complete     boolean NOT NULL DEFAULT false,
  completed_at    timestamptz,
  priority        text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  contact_id      uuid REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES deals(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  assignee_id     uuid REFERENCES auth.users(id),
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_due_idx ON tasks(due_date) WHERE is_complete = false;
CREATE INDEX tasks_assignee_idx ON tasks(assignee_id, is_complete);
```

### RLS Policy Pattern

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- For a 1-5 user team with shared data: all authenticated users see all records
-- (Simplest approach for small teams — add org-scoping later if multi-tenant needed)
CREATE POLICY "Authenticated users can read organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (true);

-- Repeat pattern for contacts, deals, interactions, tasks
-- Add owner_id filter if per-user visibility needed:
-- USING ((SELECT auth.uid()) = owner_id OR is_shared = true)
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-10 users | Current design is sufficient. RLS with shared-access policies. Single Supabase project. |
| 10-500 users | Add team/organization scoping to RLS. Index optimization based on query patterns. Enable connection pooling in Supabase (PgBouncer). |
| 500k+ users | Multi-tenant schema per org, read replicas, consider caching layer (Redis) for hot data. Outside this project's scope. |

### Scaling Priorities

1. **First bottleneck:** RLS policies doing subqueries on every row — fix with `(SELECT auth.uid())` wrapper for caching within a single request, and proper indexes on FK columns used in policies.
2. **Second bottleneck:** Unindexed full-text search on contacts — add `pg_trgm` or use Supabase's built-in full-text search (`to_tsvector`) on `name` and `email` columns.

## Anti-Patterns

### Anti-Pattern 1: Polymorphic Type Columns for Activities

**What people do:** Create an `activities` table with `related_to_type VARCHAR` ('contact', 'deal') and `related_to_id UUID` as a fake foreign key.

**Why it's wrong:** PostgreSQL cannot enforce a foreign key constraint across multiple tables this way. You get silent orphan records when contacts or deals are deleted. Queries require application-level joins that can't use standard FK indexes.

**Do this instead:** Use separate nullable FK columns (`contact_id`, `deal_id`, `organization_id`) with a CHECK constraint ensuring at least one is set. Full referential integrity, proper cascade rules, and clean JOIN queries.

### Anti-Pattern 2: Client-Side Data Fetching for Initial Page Load

**What people do:** Render a page shell server-side, then fetch all data client-side via `useEffect` + API routes.

**Why it's wrong:** Double round-trip (HTML → JS hydrate → API call → render), worse LCP/FCP, secrets exposed if API keys slip to client, unnecessary complexity.

**Do this instead:** Fetch in Server Components. Pass data as props to Client Components. Only use client-side fetching for real-time updates (via Supabase Realtime) or user-triggered refreshes.

### Anti-Pattern 3: Storing Pipeline Stage as a String on Deal

**What people do:** Add `stage VARCHAR` to the deals table with values like 'Prospecting', 'Negotiation', 'Closed Won'.

**Why it's wrong:** Stage names become magic strings scattered across code and DB. Renaming a stage requires a data migration. No ability to attach metadata (probability, color, order) to stages.

**Do this instead:** Separate `pipeline_stages` table with a FK from deals. Rename stages by updating one row. Add probability, color, is_won, display_order as stage attributes.

### Anti-Pattern 4: Skipping RLS and Relying Only on Application Auth

**What people do:** Enable Supabase but disable or skip RLS, controlling access entirely in the Next.js layer.

**Why it's wrong:** In January 2025, 170+ Supabase apps were found with data exposure because developers skipped RLS. Any client-side bug, misconfigured route, or direct API access bypasses application-layer auth entirely.

**Do this instead:** Enable RLS on every table. Even the simplest policy (`TO authenticated USING (true)`) blocks anonymous access. Add owner-scoped policies as data sensitivity requires.

### Anti-Pattern 5: Integer Sequence Positions for Kanban Ordering

**What people do:** Use `position INTEGER` and re-number all records in a column when a card is dragged.

**Why it's wrong:** Moving one card requires updating N other records (all items below the drop point). Under concurrent edits from multiple users, this causes update conflicts.

**Do this instead:** Use lexicographic text positions (fractional indexing). Moving a card computes one intermediate string value and updates exactly one row. No re-indexing of other records needed.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase Auth | Server-side session via cookies; middleware refreshes tokens | Use `@supabase/ssr` package, not legacy `@supabase/auth-helpers-nextjs` |
| Vercel (hosting) | Zero-config Next.js deployment; edge middleware for auth | Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as Vercel env vars |
| Supabase Storage | For future file attachments (contracts, documents) | Bucket-level RLS policies mirror table RLS |
| Email (future) | Resend or Postmark for task reminders | Supabase Edge Functions or Vercel Cron Jobs as trigger layer |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components -> Supabase | Direct SDK call (server-side client) | Never expose service_role key; use anon key + RLS |
| Client Components -> Server | Server Actions (mutations) or props (read) | Avoid useEffect + fetch for initial data |
| Client Components -> Supabase | Only for Realtime subscriptions | Use supabase-js browser client; RLS applies |
| Kanban -> Deals state | Optimistic update + Server Action + Realtime confirmation | Prevents stale state in multi-user scenarios |
| Middleware -> Auth | `@supabase/ssr` cookie-based session | Must run on every request to refresh tokens |

## Build Order Implications

The component dependencies suggest this build sequence:

1. **Database schema + RLS** — foundation; everything else depends on it
2. **Auth (login/logout + middleware)** — gates all app routes
3. **Organizations CRUD** — top of the hierarchy; contacts and deals reference it
4. **Contacts CRUD** — references organizations; needed before interactions/tasks
5. **Pipeline stages + Deals list** — stages table seeded first; deal cards reference it
6. **Kanban board (drag-and-drop)** — requires deals + stages data layer complete
7. **Interactions (activity feed)** — references contacts and deals (both must exist)
8. **Tasks/Reminders** — references contacts and deals; largely independent of interactions
9. **Dashboard/reporting** — aggregates from all completed tables

## Sources

- [Next.js Server and Client Components (official, updated 2026-02-20)](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js Project Structure (official, updated 2026-02-20)](https://nextjs.org/docs/app/getting-started/project-structure)
- [Supabase Row Level Security (official)](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [CRM Database Schema Practical Guide — DragonflyDB](https://www.dragonflydb.io/databases/schema/crm) — MEDIUM confidence
- [CRM Architecture and Data Modeling — DZone](https://dzone.com/articles/scalable-crm-architecture-and-data-modeling) — MEDIUM confidence
- [Kanban Indexing Patterns — Nick McCleery](https://nickmccleery.com/posts/08-kanban-indexing/) — MEDIUM confidence (verified against fractional indexing pattern)
- [Polymorphic Associations in PostgreSQL — multiple sources](https://hashrocket.com/blog/posts/modeling-polymorphic-associations-in-a-relational-database) — MEDIUM confidence (consistent across sources)
- [Supabase Realtime with Next.js (official)](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — HIGH confidence
- [Next.js + Supabase Ticket Management with Kanban (GitHub reference)](https://github.com/gal1aoui/Nextjs-Supabase-Project-Ticket-Management) — LOW confidence (single source, implementation reference only)

---
*Architecture research for: CRM Web Application (Next.js + Supabase + PostgreSQL)*
*Researched: 2026-02-21*
