# Pitfalls Research

**Domain:** B2B CRM Web Application (Health Tech — Hospitals, Clinics, Labs)
**Researched:** 2026-02-21
**Confidence:** MEDIUM-HIGH — Core pitfalls verified across multiple sources; stack-specific items (Next.js + Supabase) verified with official docs.

---

## Critical Pitfalls

### Pitfall 1: Flat Contact-Organization Data Model

**What goes wrong:**
Contacts are given a single `organization_id` foreign key, treating the relationship as one-to-many. In health tech B2B, a contact (e.g., a procurement officer or lab director) commonly works across multiple hospitals or clinics, or changes roles while maintaining historical relationships. A flat FK makes this impossible to represent correctly without distorting data.

**Why it happens:**
The simplest model that passes initial requirements is one contact = one organization. Developers build it fast in Phase 1 and assume they can "fix it later." Adding a junction table later requires migrating all existing contact records, updating every query that joins contacts to organizations, and changing the UI that displays the relationship.

**How to avoid:**
Build a `contact_organizations` junction table from Day 1, even if early users only ever add one organization per contact. Structure:
```sql
contacts (id, first_name, last_name, email, phone, ...)
organizations (id, name, type, ...)
contact_organizations (id, contact_id, organization_id, role, is_primary, started_at, ended_at)
```
The `is_primary` flag supports UI that shows "main" org while preserving flexibility. `ended_at` enables historical tracking.

**Warning signs:**
- Schema has `contacts.organization_id` as a direct FK
- UI shows "Organization" as a single text field on the contact form
- Someone asks "what happens when a contact leaves Hospital A and joins Clinic B?" and the answer is "we'd just update the field"

**Phase to address:** Data modeling phase (foundation — must be correct before any other entity is built)

---

### Pitfall 2: Missing Row Level Security from the Start

**What goes wrong:**
RLS is skipped during prototyping ("we'll add it before launch"), then added hastily. Tables that were built without RLS in mind have misconfigured policies — most commonly, every authenticated user can read all records because the policy was never added, or policies are added but don't cover all operations (SELECT has RLS, but INSERT does not enforce tenant scoping).

In a health tech context managing hospital relationships, a data leak between two customers is a catastrophic trust failure.

**Why it happens:**
Supabase's local dev defaults often disable or simplify RLS. Developers iterate fast on features and defer security. The "it's only 1-5 users" mindset leads to thinking RLS doesn't matter at this scale.

**How to avoid:**
Enable RLS on every table immediately when creating it — before any data is inserted. Use a standard policy template for every table:
```sql
-- Authenticated users only, scoped to their org
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_access" ON contacts
  FOR ALL TO authenticated
  USING (org_id = (SELECT org_id FROM user_profiles WHERE id = auth.uid()));
```
Wrap `auth.uid()` in a `SELECT` subquery to prevent per-row function execution (verified Supabase performance optimization — reduces query time from ~179ms to ~9ms at scale).

Index every column used in RLS policies (`org_id`, `user_id`, `team_id`). Missing indexes on RLS columns is the #1 cause of slow Supabase queries.

**Warning signs:**
- Any table exists in production without RLS enabled
- Policies use `auth.uid()` directly without `SELECT` wrapper
- RLS columns are not indexed
- A user can query `/api/contacts` and see records belonging to a different organization

**Phase to address:** Foundation/schema phase — enforce as a code review rule that no table migration is accepted without an accompanying RLS policy.

---

### Pitfall 3: Dashboard Aggregation via N+1 Queries

**What goes wrong:**
The dashboard renders aggregate metrics: total deals by stage, total deal value, overdue tasks, recent activity count. The naive implementation fetches each metric as a separate query in a React component — resulting in 6-10 sequential or parallel DB round-trips on every dashboard load. At 1-5 users this is invisible. As the dataset grows (thousands of contacts, hundreds of deals, activity log with tens of thousands of rows), the dashboard becomes the slowest page in the app.

The interaction log is the worst offender — querying "all activity in the last 30 days, grouped by type" across an unindexed table with no materialized view takes seconds.

**Why it happens:**
Supabase's client SDK makes individual queries feel cheap (one-liner per metric). There's no ORM warning you about N+1 patterns at the query level. The problem is invisible in development with 20 seed records.

**How to avoid:**
- Build dashboard metrics as PostgreSQL views or functions from the start, not as multiple client-side queries.
- Use a single RPC call to fetch all dashboard stats in one round-trip:
  ```sql
  CREATE OR REPLACE FUNCTION get_dashboard_stats(p_org_id uuid)
  RETURNS json AS $$
  SELECT json_build_object(
    'total_contacts', (SELECT count(*) FROM contacts WHERE org_id = p_org_id),
    'deals_by_stage', (SELECT json_agg(row_to_json(s)) FROM (
      SELECT stage, count(*), sum(value) FROM deals WHERE org_id = p_org_id GROUP BY stage
    ) s),
    'overdue_tasks', (SELECT count(*) FROM tasks WHERE org_id = p_org_id AND due_date < now() AND completed = false)
  );
  $$ LANGUAGE sql SECURITY DEFINER;
  ```
- Index `created_at`, `org_id`, `stage`, and `assigned_to` on the deals and tasks tables.
- For the activity feed, add a GIN index or use pagination — never load unbounded interaction history.

**Warning signs:**
- Dashboard component makes more than 2 `supabase.from(...).select()` calls on mount
- No database views exist for aggregate data
- Activity feed loads all rows with no `limit` clause
- Dashboard is noticeably slower than contact list pages

**Phase to address:** Dashboard phase — design the DB functions during schema phase so they're available when the dashboard is built.

---

### Pitfall 4: Deal Stage as a Free Text String

**What goes wrong:**
Deal pipeline stages are stored as a string column (`stage VARCHAR`). Business logic validation — "a deal can only move from Qualified to Proposal, not back to Lead" — exists nowhere in the system. Drag-and-drop on the Kanban board updates the string directly. Over time the data contains "Proposal", "proposal", "PROPOSAL", "Proposals" — four variants of the same stage. Reports break. Automation triggers silently fail. Migrating to a new stage structure requires rewriting data, not just schema.

**Why it happens:**
Stage as a string is the fastest path: no lookup table needed, no enum to define. It looks fine in a demo. The validation problem only surfaces when users start using the pipeline in real workflows.

**How to avoid:**
Define stages as a PostgreSQL enum or as rows in a `pipeline_stages` table with a sort order and allowed transitions:
```sql
CREATE TABLE pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  sort_order int NOT NULL,
  is_won boolean DEFAULT false,
  is_lost boolean DEFAULT false,
  color text
);

CREATE TABLE deals (
  ...
  stage_id uuid REFERENCES pipeline_stages(id) NOT NULL,
  ...
);
```
A `pipeline_stages` table (rather than an enum) is preferred because:
- Org admins can customize stage names without a schema migration
- Sort order enables correct Kanban column ordering
- `is_won`/`is_lost` flags replace fragile string matching in reports

Enforce stage transition rules in a server-side function, not only in the UI. The Kanban drag-drop optimistically updates the UI but the server validates the transition before committing.

**Warning signs:**
- Stage stored as `VARCHAR` or `TEXT` with values hardcoded in the application
- Stage validation exists only in the front-end Kanban component
- Running `SELECT DISTINCT stage FROM deals` returns variants of the same stage name
- "Won" and "Lost" are detected by matching a string value

**Phase to address:** Pipeline/deals phase — correct the data model before any Kanban UI is built.

---

### Pitfall 5: Full-Text Search Computed at Query Time

**What goes wrong:**
Search across contacts/organizations is implemented as `ILIKE '%query%'` or by calling `to_tsvector()` inline in queries. This performs a full table scan on every search. At 500+ contacts with several joined fields (name + email + organization name + tags), each search takes 500ms+. The search feels broken.

**Why it happens:**
`ILIKE` is the obvious first approach — two lines of code, works in development. `to_tsvector()` called inline looks correct but computes the vector on every row for every query rather than using a precomputed index.

**How to avoid:**
Add a generated `tsvector` column with a GIN index, maintained by a trigger:
```sql
ALTER TABLE contacts ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(title, '')
    )
  ) STORED;

CREATE INDEX contacts_search_idx ON contacts USING GIN(search_vector);
```
Use `websearch_to_tsquery()` for user-facing queries (handles partial words, quotes, and minus-exclusion naturally). Add similar vectors to `organizations` table.

For cross-entity search (find "Mayo Clinic" and return both the org AND the contacts who work there), build a unified search view or use a stored procedure — don't try to join search results client-side.

**Warning signs:**
- Search queries use `ILIKE '%term%'` on multiple columns
- No `tsvector` columns or GIN indexes exist
- Search response time exceeds 200ms with fewer than 1,000 records
- Search only searches one entity type (contacts only, not orgs)

**Phase to address:** Search/filtering phase — add the generated columns and indexes during the schema phase so they're available by the time the search UI is built.

---

### Pitfall 6: Optimistic UI Without Server-Side Conflict Resolution

**What goes wrong:**
Kanban drag-and-drop uses optimistic updates: the UI moves the deal card immediately, then fires a Supabase mutation. If the mutation fails (network timeout, RLS rejection, concurrent edit by another user), the UI shows state A while the server has state B. The user believes the deal is in the new stage; it is not. In a team environment with 2+ users, two people can drag the same deal card simultaneously — the one who fires last wins, but both UIs show success.

**Why it happens:**
React's `useOptimistic` hook and TanStack Query's `onMutate` make optimistic updates trivially easy to implement. The failure path (rollback) is also documented. But the concurrent-edit case is rarely considered — it requires server-side timestamp or version checking.

**How to avoid:**
- Always implement rollback in `onError` — revert the deal to its previous stage if the mutation fails.
- Add an `updated_at` timestamp to deals and pass it with every stage update. The server rejects updates where `updated_at` doesn't match (optimistic concurrency control).
- Show a clear error toast when a conflict occurs: "This deal was updated by another user. Refreshing..."
- Supabase Realtime subscriptions on the deals table let all connected clients see changes immediately, reducing the conflict window.

**Warning signs:**
- Drag-and-drop only calls `supabase.from('deals').update()` without checking timestamps
- There is no error handler in the drag-drop mutation
- Two browser tabs show different pipeline states with no reconciliation

**Phase to address:** Pipeline/Kanban phase — bake conflict handling into the drag-drop implementation from day one.

---

### Pitfall 7: Activity Log Without a Retention Strategy

**What goes wrong:**
Every interaction (email sent, call logged, note added, deal stage changed) is inserted as a row into an `interactions` or `activity_log` table. No retention policy is set. After 18 months, the activity log has 500,000+ rows. Every query that touches "recent activity" slows down. The dashboard "activity feed" component tries to render the last 50 rows — but the query to get them scans a 500K-row unindexed table. Backup times and storage costs increase unexpectedly.

**Why it happens:**
Audit logs feel like they should be kept forever (they're history). The table grows invisibly in development because seed data is small. No one sets a retention policy because "we'll deal with it when it's a problem" — by then, the fix requires a major migration.

**How to avoid:**
- Use a `created_at` timestamp on every activity row and index it.
- Paginate ALL activity feed queries — never load unbounded rows. Default to last 50, with cursor-based pagination.
- For dashboard "recent activity," only query the last 30 days maximum, not all time.
- Plan for partitioning `interactions` by month from the start if the health tech context generates high interaction volume (many touchpoints per hospital).
- Implement soft deletes with a separate archive/delete strategy: interactions older than 2 years move to cold storage or are summarized.

**Warning signs:**
- Activity feed queries have no `LIMIT` clause
- `interactions` table has no `created_at` index
- "Load more" is not implemented — the page shows all history
- Nobody has discussed what happens to old data

**Phase to address:** Interactions/activity phase — set pagination and indexing requirements as acceptance criteria. Revisit in the first month of real usage to measure growth rate.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store stage as plain string | No lookup table, fast to build | Inconsistent data, broken reports, hard to add validation | Never in production schema |
| Single FK from contact to org | Simpler queries, faster build | Requires full migration when first contact needs two orgs | Never — use junction table from day one |
| Skip `tsvector`, use `ILIKE` | Works immediately, zero setup | Full table scan on every search, unusable at 500+ records | MVP only if search is not a listed feature |
| Hardcode "won"/"lost" as stage strings | Obvious to implement | Breaks when a stage is renamed; requires grep-and-replace across codebase | Never — use `is_won`/`is_lost` flags on stages table |
| Compute dashboard metrics in the component | No DB functions needed | N+1 queries, slow dashboard, waterfall loading | Local dev only |
| Disable RLS during development | Faster iteration | Will be forgotten; catastrophic security gap | Never — use Supabase's service role locally if you need bypass |
| Store custom fields as JSONB | Flexible, no migration | Query planner blind (2000x slower), 2x disk footprint | Acceptable for truly sparse optional fields, not for queryable data |
| Omit soft deletes | Simpler schema | Deleted contacts with associated deals create orphaned records; no recovery | Never for contacts/organizations/deals — always soft delete these entities |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Supabase Auth + RLS | Using `auth.uid()` directly in policies without `SELECT` wrapper | `(SELECT auth.uid())` triggers caching, reducing per-row function calls from ~179ms to ~9ms |
| Supabase Realtime | Subscribing to entire table changes on the client | Filter by `org_id` in the subscription filter to avoid broadcasting other orgs' data changes |
| Supabase Storage | Serving contact/org attachment files without access control | Use signed URLs with expiry, not public bucket URLs, for any patient or org-sensitive documents |
| Next.js Server Actions | Validating input only on the client | Always validate with Zod in the Server Action body; client validation is cosmetic only |
| Next.js App Router caching | Forgetting to `revalidatePath()` after mutations | Every Server Action that mutates data must call `revalidatePath()` or the UI shows stale data indefinitely |
| Email integration (SMTP/SendGrid) | Logging outgoing emails only in the email provider, not in the CRM | Write every sent email as an `interaction` record immediately — the CRM is the source of truth, not the mail provider |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unbounded activity feed query | Dashboard hangs, browser tab crashes | Always paginate with `LIMIT` + cursor | ~5,000 rows |
| `ILIKE '%term%'` search | Search takes 1-3 seconds | Precomputed `tsvector` + GIN index | ~500 rows |
| No index on `org_id` in RLS | Every query does full table scan | Index all columns used in RLS policies | ~1,000 rows |
| No index on `created_at` for interactions | Time-range queries for activity feed are slow | Add `CREATE INDEX ON interactions(org_id, created_at DESC)` | ~10,000 rows |
| Realtime subscription on full table | Client receives every other org's changes (wasted bandwidth + potential data leak) | Filter subscription: `.eq('org_id', currentOrgId)` | ~10 concurrent users |
| Computing deal totals in JavaScript | Slow and wrong (floating point) | Aggregate in PostgreSQL with `SUM(value)`, return as text | ~100 deals |
| Fetching all pipeline stages per Kanban render | Unnecessary repeated queries | Cache stages in React context, not refetch per render | ~20 concurrent users |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| RLS not enabled on a table | Any authenticated user can read all orgs' data via direct Supabase client call | Enable RLS on table creation; add `anon` role policy that denies all |
| `service_role` key exposed client-side | Bypasses all RLS; full database access for anyone with the key | Service role key only in server-side code (Server Actions, API routes). Never in `NEXT_PUBLIC_` vars |
| No BAA with infrastructure providers | HIPAA/health data compliance failure even if technical security is correct | Before going live with any PHI-adjacent data, confirm BAA status with Supabase (they offer it on Pro+) |
| Audit trail gaps | Cannot demonstrate compliance; breach investigation impossible | Log every write to sensitive records (contacts, deals, interactions) with `user_id` + `timestamp` + `before/after` using PostgreSQL triggers |
| Unrestricted file uploads | Malicious file upload to storage bucket | Validate file type and size server-side before writing to Supabase Storage; use allowlist of MIME types |
| Soft delete bypass | Hard delete removes a contact but their interaction history still references them (orphan rows) or disappears entirely (missing audit trail) | Soft deletes only for contacts/orgs/deals; use `deleted_at` timestamp + filter in RLS policies |

---

## UX Pitfalls

Common user experience mistakes in the CRM domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Too many required fields on contact create | Users skip the CRM entirely or enter garbage data to get past validation | Require only name + one contact method at creation; all other fields optional and progressively revealed |
| No "quick add" flow | Every interruption (a call just came in) requires navigating away, losing context | Provide a global `+` button / keyboard shortcut that opens a minimal slide-over to create contact, task, or note from anywhere |
| Pipeline Kanban without deal value visible | Users can't prioritize which cards to work on | Show deal value on each card; allow sorting by value within a stage |
| No activity timeline on contact/org view | Users re-ask the same questions on every call because they can't see history | Every contact and organization page must have a chronological interaction feed as the primary content area |
| Search that only matches exact substrings | Users type "hosp" and get nothing because the contact's organization is "Hospital" (stemmed differently) | Use PostgreSQL's `websearch_to_tsquery()` which handles partial word matching and common variations |
| Dashboard that shows nothing until you have 100 records | New users see empty states that feel broken, causing immediate abandonment | Design empty states as guided action prompts: "Add your first contact" with a CTA, not just a blank chart |
| Inline edit that loses unsaved changes on navigation | User edits three fields, accidentally clicks a sidebar link, loses all work | Auto-save draft state to localStorage or warn on navigation with "You have unsaved changes" |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Contact page:** Shows contact details — but has no activity timeline showing calls, emails, notes for this contact. Verify: activity feed component is present and queries interactions filtered by `contact_id`.
- [ ] **Deal Kanban:** Cards drag between columns visually — but stage change is not persisted to database on error. Verify: disconnect network, drag a card, reconnect; the card returns to its original column.
- [ ] **Search bar:** Returns results — but only searches one table. Verify: searching an organization name returns both the org AND the contacts who work there.
- [ ] **Dashboard metrics:** Shows counts and totals — but numbers don't update when data changes without a manual refresh. Verify: open dashboard in two tabs, add a deal in one tab, check if the other tab updates (either via Realtime or on-focus refetch).
- [ ] **RLS configured:** All tables have RLS enabled — but INSERT policies don't enforce `org_id` scoping. Verify: create a second test organization, log in as its user, attempt to POST to a contact endpoint with the first org's `org_id`. Should be rejected.
- [ ] **Pipeline stages:** Stages display correctly — but deleting a stage that has active deals silently orphans those deals. Verify: delete a non-empty stage. System should either prevent deletion or prompt to reassign deals.
- [ ] **Soft delete:** Contacts have `deleted_at` — but RLS policy doesn't filter out soft-deleted records. Verify: soft-delete a contact, query Supabase directly; confirm the contact does not appear in normal queries.
- [ ] **Task due dates:** Tasks show as overdue in the list — but no dashboard indicator and no sorted overdue section exists. Verify: the dashboard "Tasks" widget specifically calls out overdue items, not just all tasks.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Flat contact-org model needs junction table | HIGH | Create junction table, migrate existing `organization_id` values as `contact_organizations` rows, update all queries, remove old FK column in separate migration |
| RLS missing on a table found post-launch | HIGH | Enable RLS immediately, audit logs for unauthorized data access, notify affected organizations if data was accessible |
| Stage stored as string, need structured stages | MEDIUM | Create `pipeline_stages` table, insert canonical stages, add `stage_id` FK to deals, migrate string values to IDs, deprecate string column |
| Search too slow (`ILIKE`) | MEDIUM | Add `tsvector` generated column and GIN index without downtime (concurrent index build); update search queries to use `@@` operator |
| Dashboard N+1 queries causing timeouts | LOW | Create PostgreSQL views/functions for each metric; replace multiple Supabase queries with single RPC call — no schema migration needed |
| Activity log unbounded, table too large | MEDIUM | Add `created_at` index (concurrent, no downtime); implement pagination in the query; schedule archival job for old rows |
| Service role key leaked | HIGH | Immediately rotate the key in Supabase dashboard; audit access logs; review all code for accidental exposure |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Flat contact-org model | Schema / Data Model phase | Query `contact_organizations` junction table exists with `is_primary`, `role`, `started_at` columns |
| Missing RLS | Schema / Data Model phase | Every table has `ROW LEVEL SECURITY ENABLED`; no table has zero policies |
| Dashboard N+1 queries | Dashboard phase (DB functions in schema phase) | Dashboard load makes ≤2 Supabase calls; all metrics returned in one RPC |
| Stage as free text | Pipeline/Deals phase | `pipeline_stages` table exists; `deals.stage_id` is a FK; no `stage VARCHAR` column |
| Full-text search at query time | Search/Filtering phase | `tsvector` generated columns with GIN indexes exist on `contacts` and `organizations` |
| Optimistic UI without conflict resolution | Pipeline/Deals phase | Drag-drop mutation includes `updated_at` check; `onError` callback reverts card position |
| Unbounded activity log | Interactions/Activity phase | All activity queries have `LIMIT`; `interactions.created_at` is indexed |
| RLS using `auth.uid()` without SELECT wrapper | Schema / Data Model phase | All RLS policies use `(SELECT auth.uid())` pattern; confirmed via `EXPLAIN ANALYZE` showing function not called per-row |
| JSONB for queryable fields | Schema / Data Model phase | Core queryable fields (stage, value, type, assigned_to) are proper typed columns; JSONB only for truly sparse custom metadata |
| Missing audit trail | Interactions/Activity phase | Trigger exists on `contacts`, `deals`, `organizations` that writes to an `audit_log` table on UPDATE/DELETE |
| Lack of BAA for health data | Pre-launch / Infrastructure phase | Supabase Pro plan confirmed with BAA signed before any real patient-adjacent data is stored |

---

## Sources

- Supabase RLS Performance Docs: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv (HIGH confidence — official docs)
- PostgreSQL tsvector optimization: https://thoughtbot.com/blog/optimizing-full-text-search-with-postgres-tsvector-columns-and-triggers (MEDIUM confidence — verified community blog)
- JSONB performance pitfalls: https://www.heap.io/blog/when-to-avoid-jsonb-in-a-postgresql-schema (MEDIUM confidence — verified with official PostgreSQL docs)
- Supabase multi-tenancy RLS patterns: https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/ (MEDIUM confidence — community verified)
- CRM data deduplication / master record selection: https://blog.insycle.com/picking-master-record-crm-deduplication (MEDIUM confidence — practitioner blog)
- CRM schema design: https://www.dragonflydb.io/databases/schema/crm (MEDIUM confidence — community reference)
- CRM UX design pitfalls: https://www.eleken.co/blog-posts/how-to-design-a-crm-system-all-you-need-to-know-about-custom-crm (MEDIUM confidence — practitioner case study)
- HIPAA CRM requirements: https://www.blaze.tech/post/hipaa-compliant-crm (MEDIUM confidence — verified against HIPAA guidance)
- CRM implementation failures: https://www.enable.services/2025/03/26/why-crm-implementations-fail-and-how-to-avoid-it/ (MEDIUM confidence — 2025 industry survey data)
- Next.js Server Actions data mutation patterns: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations (HIGH confidence — official Next.js docs)
- Supabase Realtime limits: https://supabase.com/docs/guides/realtime/limits (HIGH confidence — official docs)
- PostgreSQL full-text search types: https://www.postgresql.org/docs/current/datatype-textsearch.html (HIGH confidence — official PostgreSQL docs)

---
*Pitfalls research for: B2B CRM Web Application (Health Tech)*
*Researched: 2026-02-21*
