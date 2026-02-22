# Phase 2: Backend & Data Layer - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Database schema with RLS on every table, authentication flows (sign up, login, logout, password reset, session persistence), and infrastructure scaffolding (Supabase project, Vercel deployment). This phase delivers the foundation every CRM feature builds on — no CRUD features, no UI beyond auth screens.

</domain>

<decisions>
## Implementation Decisions

### Auth experience
- Email + password only — no social providers, no magic links
- Open registration — anyone with an email can create an account
- No email verification required — immediate access after sign-up
- Post-login redirect always goes to Dashboard (not last visited page)
- Password reset via email link (standard Supabase flow)

### Schema conventions
- Multi-tenant per team/organization — standard CRM pattern where users belong to an org and RLS filters by org_id so team members share data
- Full audit trail on every table: created_at, updated_at, created_by, updated_by
- Claude's Discretion: soft-delete vs hard-delete strategy (recommend soft-delete for contacts/orgs/deals, hard-delete for ephemeral records)
- Claude's Discretion: UUID vs auto-increment for primary keys (recommend UUIDs per Supabase convention)
- Naming convention: snake_case for all tables and columns (Postgres standard)

### Supabase project setup
- Create a new Supabase project (no existing project)
- Claude's Discretion: region selection (recommend us-east-1 for general availability)
- Single project for now — no branching or separate dev/prod environments
- Deploy to Vercel in Phase 2 — get a live URL early for testing and sharing

### Seed data & defaults
- Generic sales pipeline stages: Lead → Qualified → Demo → Proposal → Closed Won / Closed Lost
- Claude's Discretion: whether stages are customizable by users or fixed (recommend fixed for now, customization is a separate feature)
- Seed realistic demo data: 10-20 contacts, 5 orgs, 8 deals across pipeline stages
- Claude's Discretion: industry flavor for demo data (recommend healthtech-flavored given the project name, but open to generic B2B)

### Claude's Discretion
- Soft-delete vs hard-delete strategy per entity type
- UUID vs auto-increment primary keys
- Supabase region selection
- Pipeline stage customizability (fixed vs editable)
- Demo data industry flavor
- Password complexity requirements
- Session duration / token refresh strategy
- Error page styling for auth flows

</decisions>

<specifics>
## Specific Ideas

- "Do it like how it's handled at most CRM platforms" — multi-tenant with team/org-based data isolation, standard in Salesforce/HubSpot pattern
- Contact-organization junction table already decided in roadmap (not flat FK)
- Pipeline stages as normalized table already decided in roadmap
- RLS enabled on every table at creation time (roadmap mandate)
- Next.js 16 uses `proxy.ts` not `middleware.ts` for session refresh (noted blocker from Phase 1)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-backend-data-layer*
*Context gathered: 2026-02-22*
