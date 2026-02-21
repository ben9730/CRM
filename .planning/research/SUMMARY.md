# Project Research Summary

**Project:** Healthcare B2B CRM Web Application
**Domain:** B2B SaaS CRM — Health Technology Sales (hospitals, clinics, labs)
**Researched:** 2026-02-21
**Confidence:** HIGH (stack), MEDIUM-HIGH (features, pitfalls), HIGH (architecture)

## Executive Summary

This is a B2B sales CRM purpose-built for a health technology company selling to hospitals, clinics, and labs. The domain is characterized by long deal cycles (12+ months), multiple decision-makers per account (~9 on average), and account-based selling where the organization (hospital, clinic) is the primary unit — not the individual contact. The research consensus points to a Next.js 16 + Supabase + shadcn/ui stack as the clear optimal choice for this context: React Server Components reduce client-side complexity, Supabase delivers PostgreSQL with built-in auth and row-level security, and shadcn/ui produces the premium SaaS aesthetic required without the bundle overhead of Material UI alternatives. All versions are verified current as of 2026-02-21.

The recommended approach is to build an opinionated, focused CRM rather than a feature-broad one. The research strongly indicates that CRM adoption fails for small teams when logging is tedious and features exceed what the workflow demands. The v1 scope should cover eleven core capabilities (auth, organizations, contacts, deals, Kanban pipeline, interaction history, tasks, dashboard, tagging, roles, data export) and defer everything that would bloat the product — including native email, marketing automation, AI scoring, and custom report builders. Healthtech-specific defaults (pre-configured deal stages, structured stakeholder roles) add differentiation at near-zero implementation cost and should ship with v1.

The biggest risks are all in data modeling. Three database decisions made in Phase 1 are extremely costly to reverse later: using a flat contact-organization FK instead of a junction table, storing pipeline stages as plain text strings instead of a normalized table, and skipping row-level security. Research documents real-world incidents where each of these was deferred and required painful migrations. Treat all three as non-negotiable constraints during schema design, before any feature is built on top of the data model.

---

## Key Findings

### Recommended Stack

The stack centers on Next.js 16 (App Router + Turbopack) with React 19, TypeScript 5.9, Tailwind CSS v4, and Supabase as the managed backend. This combination is well-matched to the CRM domain: Server Components handle data-heavy list pages with zero client-side boilerplate, Server Actions eliminate separate API route files for mutations, and Supabase RLS enforces data access control at the database level without application-layer guards. The Supabase MCP and Playwright MCP are both available for this project and should be used during development.

TanStack Query manages server state with caching and optimistic updates; Zustand handles lightweight client UI state (modal open/close, filter panels, selected rows). React Hook Form with Zod handles the CRM's heavy form surface. TanStack Table renders contact and deal lists headlessly with sorting, filtering, and pagination. Recharts provides pipeline analytics and dashboard charts.

**Core technologies:**
- **Next.js 16.1.6** — Full-stack framework; App Router + RSC is the 2026 standard for React; Turbopack default
- **Supabase (supabase-js 2.97.0 + @supabase/ssr 0.8.0)** — PostgreSQL + Auth + Realtime + RLS; use `@supabase/ssr` for server components, never the base client directly
- **shadcn/ui 3.8.5 + Tailwind CSS 4.2.0** — Copy-owned components on Tailwind v4; premium SaaS aesthetic; ~5KB vs MUI's 80KB
- **TanStack Query 5.90.21** — Server state caching, optimistic mutations, background refetch
- **React Hook Form 7.71.2 + Zod 4.3.6** — Uncontrolled form management + TypeScript-first validation; Formik is abandoned and must not be used
- **TanStack Table 8.21.3** — Headless data grid for contact/deal lists
- **Recharts 3.7.0** — Pipeline funnel, revenue, and activity charts
- **Vercel Pro** — First-class Next.js 16 hosting; git-push-to-deploy; zero ops

**Critical version constraints:**
- Next.js 16 requires TypeScript 5.1+ (5.9.3 recommended)
- shadcn/ui v3 targets Tailwind v4 by default — do not mix with Tailwind v3
- Use `@supabase/ssr` (not legacy auth-helpers) for cookie-based sessions in App Router
- `middleware.ts` is deprecated in Next.js 16; use `proxy.ts` for new projects

### Expected Features

The CRM must serve account-based B2B selling for a small team (1-5 users). Features are stratified into three tiers. The MVP scope is what is required to replace a spreadsheet; v1.x adds features once core workflows are validated; v2+ defers until product-market fit.

**Must have (table stakes) — v1:**
- User authentication + session management — gates all data; build first
- Organization (account) records — hospitals/clinics are the deal unit; build before contacts
- Contact management linked to organizations — multiple contacts per org (buying committee)
- Deal management with stage, value, close date, linked org/contacts
- Visual pipeline Kanban board — drag-and-drop; Pipedrive popularized this; now expected
- Interaction/activity history — calls, emails, meetings, notes linked to contacts and deals
- Task management with reminders and overdue flagging
- Dashboard with 5-7 metrics (pipeline value by stage, overdue tasks, recent activity)
- Search and filtering by name, tag, stage, owner
- Basic role management — Admin (full access) and Rep (own + shared read)
- Data export (CSV) for contacts, orgs, deals

**Should have (competitive) — v1.x:**
- Deal stall detection — flag deals with no activity in configurable period
- Stakeholder role tracking — structured role field (Clinical Champion, Economic Buyer, etc.)
- Pipeline forecast view — weighted revenue by close month/quarter
- Activity-based selling reminders — require "next action" per deal
- Custom fields on contacts, orgs, deals

**Defer (v2+):**
- Email client integration (BCC-to-CRM is sufficient in v1)
- Marketing automation or email sequences
- AI features (no sufficient training data until post-launch)
- Native mobile app (responsive web covers v1 needs)
- Webhooks / integration API
- Contact relationship mapping (complex; defer until needed)
- Document/file attachments

**Anti-features to reject entirely:**
- Native email client (build time far exceeds value)
- Marketing automation (separate product category)
- AI lead scoring (garbage outputs without substantial deal history)
- Two-way calendar sync (OAuth complexity + edge cases)
- Custom drag-and-drop report builder (pre-built reports serve small teams better)
- Social media monitoring (zero ROI for hospital procurement B2B)

**Healthtech defaults (zero extra cost):**
Pre-configure pipeline stages: Prospecting, Discovery/Needs Assessment, Demo/Evaluation, Proposal Sent, Procurement/Legal Review, Contract Negotiation, Closed Won/Closed Lost. Pre-configure stakeholder roles: Clinical Champion, Economic Buyer, Procurement, IT/Informatics, End User, Legal/Compliance, Executive Sponsor.

### Architecture Approach

The architecture is a three-tier system: browser client (React components), Next.js App Router server layer (Server Components, Server Actions, Route Handlers), and Supabase backend (PostgreSQL + Auth + Realtime). Server Components fetch data from Supabase and render HTML — no client-side data fetching for initial page loads. Server Actions handle all CRUD mutations without separate API routes. Supabase Realtime (WAL subscriptions) delivers live Kanban updates to connected clients. RLS enforces data access at the database level on every table.

The data model is built around five core tables: `organizations`, `contacts`, `deals`, `interactions`, and `tasks`. The contact-organization relationship uses a junction table (`contact_organizations`) — not a direct FK. Pipeline stages are a separate `pipeline_stages` table referenced by FK from deals. Kanban ordering uses lexicographic text positions (not integer sequences) to avoid re-indexing on drag-and-drop. Activities (interactions, tasks) use the two-FK pattern (nullable `contact_id`, `deal_id`, `organization_id`) with a CHECK constraint — not polymorphic string type columns.

**Major components:**
1. **Next.js Server Components** — Data fetching, auth-gated rendering, HTML streaming; no client JS for read-heavy pages
2. **Next.js Server Actions** — Mutations (create/update/delete); Zod validation; `revalidatePath()` triggers fresh server renders
3. **Supabase PostgreSQL + RLS** — Source of truth; RLS with `(SELECT auth.uid())` wrapper pattern for performance
4. **Supabase Realtime** — WAL subscriptions on `deals` table for live Kanban; filtered by org to prevent cross-org data leakage
5. **Client Components** — Kanban drag-and-drop with `useOptimistic` (React 19), form state, modals, filter panels
6. **TanStack Query** — Client-side mutation state, optimistic updates, cache invalidation after server actions

**Recommended build order (from ARCHITECTURE.md):**
Database schema + RLS → Auth → Organizations CRUD → Contacts CRUD → Pipeline stages + Deals → Kanban board → Interactions → Tasks/Reminders → Dashboard

### Critical Pitfalls

1. **Flat contact-organization FK** — Storing `contacts.organization_id` as a direct FK makes it impossible to represent contacts who work across multiple orgs or change roles. Build a `contact_organizations` junction table from Day 1. Recovery cost is HIGH if deferred.

2. **Missing or misconfigured RLS** — Skipping RLS during prototyping then adding it hastily leads to policies that miss INSERT scoping or entire tables. Enable RLS on every table at creation time. Wrap `auth.uid()` in `(SELECT auth.uid())` for performance (reduces query time from ~179ms to ~9ms per-row). Index all columns used in RLS policies. Recovery cost is HIGH.

3. **Pipeline stages as plain text** — Storing stage as a `VARCHAR` column causes inconsistent data variants ("Proposal", "proposal", "PROPOSAL"), broken reports, silent automation failures, and expensive migration when renaming stages. Use a `pipeline_stages` table with `is_won`/`is_lost` boolean flags and a `sort_order` column. Recovery cost is MEDIUM.

4. **Dashboard aggregation via N+1 queries** — Fetching each dashboard metric as a separate Supabase query creates 6-10 round-trips per page load. Build a PostgreSQL RPC function (`get_dashboard_stats`) that returns all metrics in one call. Index `org_id`, `stage_id`, `created_at`, and `assigned_to` on deals and tasks. Recovery cost is LOW but painful to diagnose.

5. **Full-text search computed at query time** — Using `ILIKE '%term%'` performs full table scans. Add a precomputed `tsvector` generated column with a GIN index on `contacts` and `organizations` during schema creation. Use `websearch_to_tsquery()` for user queries. Degrades at ~500 rows. Recovery cost is MEDIUM.

6. **Optimistic Kanban without server-side conflict resolution** — Drag-and-drop with `useOptimistic` must include an `updated_at` timestamp check server-side, an `onError` rollback handler, and a conflict toast notification. Without this, two users dragging the same card cause silent data divergence.

7. **Unbounded activity log queries** — All interaction/activity queries must have a `LIMIT` clause. The activity feed must use cursor-based pagination. Index `(org_id, created_at DESC)` on interactions. Failure manifests at ~5,000 rows.

---

## Implications for Roadmap

The feature dependency graph and pitfall-to-phase mapping from the research strongly suggest an 8-phase build sequence. Earlier phases establish constraints that later phases depend on.

### Phase 1: Foundation — Database Schema + Auth
**Rationale:** Everything downstream depends on the data model being correct from the start. Three pitfalls (flat contact-org model, missing RLS, stage as string) are impossible to avoid cheaply if deferred. Auth gates all app routes and must exist before any feature ships.
**Delivers:** Supabase project scaffolded; all tables created with correct schema; RLS enabled on every table; Auth working (login, session, password reset); Next.js project bootstrapped with correct folder structure
**Addresses:** User authentication (table stakes)
**Avoids:** Flat contact-org pitfall, missing RLS pitfall, stage-as-string pitfall, JSONB for queryable fields
**Research flag:** Standard patterns — no deeper research needed; ARCHITECTURE.md provides complete schema SQL

### Phase 2: Organizations + Contacts
**Rationale:** Organizations are the top of the entity hierarchy. Contacts belong to organizations. Both must exist before deals, interactions, or tasks can be linked. Building contacts without organizations first forces a painful data migration.
**Delivers:** Full CRUD for organizations and contacts; organization-contact junction table; contact list with search (tsvector indexes built here); tagging on both entities; basic filtering
**Uses:** TanStack Table (list views), React Hook Form + Zod (create/edit forms), Server Components (list pages), Server Actions (mutations)
**Avoids:** Full-text search at query time (add tsvector + GIN indexes now, not later), too-many-required-fields UX pitfall
**Research flag:** Standard patterns — well-documented CRUD with shadcn/ui + TanStack Table

### Phase 3: Pipeline Stages + Deals
**Rationale:** Pipeline stages must be seeded and normalized before any deal is created. Deals reference both organizations and contacts, so Phases 2 must complete first. The Kanban board is a rendering of deals — deals come before the Kanban view.
**Delivers:** `pipeline_stages` table seeded with healthtech defaults; full deal CRUD (stage, value, close date, linked org/contacts); deal list view with filtering; foundational state for Kanban
**Avoids:** Stage-as-string pitfall, orphaned deals on stage deletion (prevent or prompt to reassign)
**Research flag:** Standard patterns

### Phase 4: Kanban Board (Visual Pipeline)
**Rationale:** Depends on Phase 3 (deals + stages complete). This is the highest-complexity UI component — drag-and-drop with optimistic updates, multi-user conflict resolution, and Realtime sync. Isolating it in its own phase prevents it from being rushed.
**Delivers:** Drag-and-drop Kanban; deal cards with value and close date visible; lexicographic position ordering; `useOptimistic` + `updated_at` conflict check; Supabase Realtime subscription on deals table; rollback on mutation failure
**Uses:** Supabase Realtime, `useOptimistic` (React 19), Zustand for drag state
**Avoids:** Optimistic UI without conflict resolution, integer sequence position ordering, realtime subscription on full table (filter by org)
**Research flag:** Needs phase research — Kanban drag-and-drop library choice (dnd-kit vs react-beautiful-dnd status) should be validated before build

### Phase 5: Interactions + Activity History
**Rationale:** Interactions reference both contacts and deals (both must exist). The two-FK pattern (nullable `contact_id` + `deal_id`) must be implemented correctly here. The activity feed is the primary content area of every contact and organization detail page.
**Delivers:** Log calls, emails, meetings, notes linked to contacts and/or deals; interaction timeline on contact detail and deal detail pages; global activity feed; interaction indexing for performance
**Uses:** Two-FK pattern (not polymorphic), `(org_id, created_at DESC)` index, paginated queries with LIMIT
**Avoids:** Unbounded activity log queries, polymorphic type column anti-pattern
**Research flag:** Standard patterns

### Phase 6: Tasks + Reminders
**Rationale:** Tasks are largely independent of interactions but reference contacts and deals. Building tasks after interactions allows the task detail to include relevant context from the interaction feed. Overdue tasks are a key dashboard metric (Phase 7 depends on tasks existing).
**Delivers:** Task create/edit/complete; due dates; priority; linked to contacts, deals, or orgs; overdue flagging; in-app task reminders
**Uses:** Partial index on tasks (`WHERE is_complete = false`) for fast overdue queries
**Research flag:** Standard patterns

### Phase 7: Dashboard
**Rationale:** The dashboard is an aggregation of all completed tables. Building it last ensures all data sources exist. The PostgreSQL RPC function for dashboard stats should be designed during Phase 1 schema work so it is available here without a schema change.
**Delivers:** Pipeline value by stage; overdue task count; recent activity feed (paginated, last 30 days); deals closing this month; top-level KPIs (5-7 metrics); empty-state guided prompts for new users
**Uses:** Supabase RPC (`get_dashboard_stats`), Recharts (pipeline funnel), single-call dashboard stats pattern
**Avoids:** Dashboard N+1 query pitfall, empty state abandonment UX pitfall
**Research flag:** Standard patterns — pre-built opinionated dashboard, no custom report builder

### Phase 8: Polish + Role Management + Export
**Rationale:** Role management (Admin vs Rep) can be added after core features are working; it does not block feature development for a 1-5 user team where all early users may be admins. Data export and UX polish (quick-add global button, mobile responsiveness, inline edit protection) complete the v1 scope.
**Delivers:** Admin / Rep roles enforced via RLS and UI; CSV export of contacts, orgs, deals; quick-add slide-over; mobile-responsive layout audit; unsaved-changes navigation guard
**Avoids:** Lack of BAA for health data (confirm Supabase Pro plan + BAA before any real patient-adjacent data)
**Research flag:** Standard patterns for roles + export; BAA/compliance check is a business action, not a code task

### Phase Ordering Rationale

- **Data model before features:** The three highest-cost pitfalls (flat contact-org, missing RLS, stage-as-string) are data model decisions. Fixing them early costs 2 hours. Fixing them after data is loaded costs days plus potential data loss.
- **Hierarchy-first:** Organizations before contacts before deals — the entity dependency graph from FEATURES.md makes any other order require re-work.
- **Kanban isolated:** Drag-and-drop is the highest UI complexity in the app and the one area with non-trivial conflict resolution requirements. It deserves its own phase rather than being appended to Phase 3.
- **Dashboard last:** Intentionally built after all data sources exist. Do not build a dashboard placeholder early — empty dashboards cause abandonment during stakeholder review.
- **Interactions before tasks:** Tasks are more independent but the activity timeline on contact pages should display interaction history (Phase 5) and tasks (Phase 6) together, so interactions build the pattern first.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Kanban):** Drag-and-drop library choice needs verification. `react-beautiful-dnd` is in maintenance mode; `dnd-kit` is the current recommendation but needs version/compatibility confirmation against React 19 before committing.

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1:** Complete schema SQL provided in ARCHITECTURE.md; RLS patterns documented in PITFALLS.md
- **Phase 2:** Standard CRUD with well-documented TanStack Table + shadcn/ui patterns
- **Phase 3:** Pipeline stages table pattern fully specified in research
- **Phase 5:** Two-FK pattern and pagination patterns fully specified
- **Phase 6:** Standard task CRUD
- **Phase 7:** Dashboard RPC pattern specified in PITFALLS.md
- **Phase 8:** Standard role + export patterns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified live from npm registry 2026-02-21; framework choices verified against official docs |
| Features | MEDIUM-HIGH | Multi-source consensus on table stakes and anti-features; healthtech-specific details (Sunshine Act compliance) are LOW — single source, flag for legal review before building |
| Architecture | HIGH | Next.js and Supabase official docs; schema patterns verified across multiple consistent sources |
| Pitfalls | MEDIUM-HIGH | Core pitfalls (RLS, schema) verified with official docs and real incident data; UX pitfalls from practitioner case studies |

**Overall confidence:** HIGH

### Gaps to Address

- **Contact-org junction table vs. simple FK:** ARCHITECTURE.md uses a simple `organization_id` FK on contacts; PITFALLS.md explicitly identifies this as a critical pitfall and recommends a junction table. These are in direct conflict. **Decision required before Phase 1 schema is written.** Recommendation: follow PITFALLS.md — build the junction table. The extra complexity in v1 is a one-time cost; the migration cost later is much higher.

- **Drag-and-drop library:** No specific library was locked in for Kanban drag-and-drop. `dnd-kit` is the current community recommendation but React 19 compatibility should be verified before Phase 4 begins. Flag this for `/gsd:research-phase` on Phase 4.

- **Sunshine Act / HIPAA compliance scope:** Research flagged that medtech CRMs may need Sunshine Act tracking (transfers of value to HCPs). This is LOW confidence (single source) and explicitly out of scope for a system-sales CRM — but requires a legal review before any feature that logs gifts, meals, or samples to clinicians. Confirm with product owner whether this will ever be in scope.

- **BAA with Supabase:** Before any real patient-adjacent data is stored, a Business Associate Agreement must be signed with Supabase (available on Pro+ plan). This is a business action, not a code task, but it must happen before production launch. Flag for the pre-launch checklist.

- **Next.js 16 `proxy.ts` vs `middleware.ts`:** STACK.md notes that `middleware.ts` is deprecated in Next.js 16 in favor of `proxy.ts`. However, ARCHITECTURE.md still references `middleware.ts` in the project structure. Verify the correct filename for the session refresh middleware before scaffolding the project.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Official Blog](https://nextjs.org/blog/next-16) — Release notes, breaking changes, Turbopack default
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — RSC patterns
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — Folder conventions
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policy patterns
- [Supabase RLS Performance Docs](https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv) — `(SELECT auth.uid())` optimization
- [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro) — RLS bypass incidents, new API key model
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — WAL subscription patterns
- [Next.js Server Actions docs](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) — Mutation patterns
- npm registry live queries — All version numbers verified 2026-02-21
- [PostgreSQL full-text search](https://www.postgresql.org/docs/current/datatype-textsearch.html) — tsvector / tsquery

### Secondary (MEDIUM confidence)
- [Healthcare Sales in 2025 — Martal](https://martal.ca/b2b-healthcare-sales-lb/) — B2B healthtech deal cycle characteristics
- [CRM Software Features 2025 — Webuters](https://www.webuters.com/crm-software-features) — Table stakes features
- [B2B CRM buyer's guide — Capsule CRM](https://capsulecrm.com/blog/b2b-crm/) — Feature expectations
- [Pipedrive vs HubSpot 2025](https://www.capitalsconsulting.com/resources/pipedrive-vs-hubspot) — Competitor feature analysis
- [CRM Mistakes Small Teams Make 2025](https://rapitek.com/en/blog/2025/7/top-7-crm-mistakes-small-teams-make-2025-how-to-avoid/) — Anti-features
- [Kanban Indexing Patterns — Nick McCleery](https://nickmccleery.com/posts/08-kanban-indexing/) — Lexicographic position ordering
- [CRM Database Schema — DragonflyDB](https://www.dragonflydb.io/databases/schema/crm) — Schema patterns
- [PostgreSQL tsvector optimization — Thoughtbot](https://thoughtbot.com/blog/optimizing-full-text-search-with-postgres-tsvector-columns-and-triggers) — Full-text search
- [CRM UX design pitfalls — Eleken](https://www.eleken.co/blog-posts/how-to-design-a-crm-system-all-you-need-to-know-about-custom-crm) — UX patterns

### Tertiary (LOW confidence — needs validation)
- [CRM Compliance for Regulated Industries](https://syncmatters.com/blog/crm-compliance) — Sunshine Act mention; single source; verify with legal
- [HIPAA CRM requirements — Blaze](https://www.blaze.tech/post/hipaa-compliant-crm) — HIPAA/BAA guidance; verify with Supabase directly

---
*Research completed: 2026-02-21*
*Ready for roadmap: yes*
