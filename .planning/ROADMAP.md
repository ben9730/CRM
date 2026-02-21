# Roadmap: HealthCRM

## Overview

HealthCRM is built in four phases that strictly follow the mandated order: visual design first, then backend infrastructure, then all CRM features integrated together, then production polish. Phase 1 produces approved prototypes and a component library before a single line of backend code is written. Phase 2 builds the database schema and auth layer that all features depend on. Phase 3 wires every CRM entity (orgs, contacts, deals, interactions, tasks, dashboard) to the live backend. Phase 4 adds export, security review, and production deployment.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Frontend Design & UI** - Prototypes and component library approved by user before backend work begins
- [ ] **Phase 2: Backend & Data Layer** - Database schema, RLS, auth, and infrastructure scaffolded
- [ ] **Phase 3: Integration & Features** - All CRM features built and wired to live backend
- [ ] **Phase 4: Polish & Production** - CSV export, security review, and production deployment

## Phase Details

### Phase 1: Frontend Design & UI
**Goal**: User has approved the visual design and component library — every key screen exists as a working prototype before any backend is built
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06, PROC-01, PROC-02, ARCH-06
**Success Criteria** (what must be TRUE):
  1. Interactive HTML prototypes for dashboard, contacts list, deal pipeline Kanban, and contact detail pages are viewable in the browser and approved by the user
  2. A full component library exists with buttons, forms, cards, tables, modals, and navigation — all styled with the premium SaaS aesthetic
  3. The design system is documented: color palette, typography scale, spacing units, and icon set are consistent across all prototype screens
  4. All prototype screens render correctly and without layout breaks at 1280px (desktop), 768px (tablet), and 375px (mobile)
  5. No backend work has started — frontend design phase is fully complete and signed off before Phase 2 begins
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Bootstrap Next.js + shadcn/ui, OKLCH dark design system, app shell (collapsible sidebar + header), mock data files
- [ ] 01-02-PLAN.md — Build 4 prototype screens: Dashboard, Contacts List (table/grid/sheet), Deal Pipeline Kanban, Contact Detail
- [ ] 01-03-PLAN.md — Responsive testing at 1280px/768px/375px and user approval gate

### Phase 2: Backend & Data Layer
**Goal**: The database schema is correct and immutable-quality, RLS is live on every table, and users can authenticate — the foundation every feature will build on
**Depends on**: Phase 1
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password, log in, stay logged in across browser refresh, log out from any page, and reset a forgotten password via email link
  2. All database tables exist with the correct schema: contact-organization junction table (not flat FK), pipeline_stages normalized table, tsvector GIN indexes on contacts and organizations, RLS enabled on every table
  3. The Next.js project is scaffolded with App Router, TypeScript, Tailwind CSS v4, and shadcn/ui — the component library from Phase 1 is integrated and builds without errors
  4. The application is deployed to Vercel and connected to Supabase — accessible from a live URL
**Plans**: TBD

Plans:
- [ ] 02-01: Next.js project scaffold and Supabase setup (App Router, TypeScript, Tailwind v4, shadcn/ui integration, Vercel deploy)
- [ ] 02-02: Database schema and RLS (all tables, junction table, pipeline_stages, tsvector indexes, RLS policies)
- [ ] 02-03: Authentication flows (sign up, login, session persistence, logout, password reset)

### Phase 3: Integration & Features
**Goal**: Every CRM feature is built and connected to the live backend — the application is fully functional for daily sales and account management work
**Depends on**: Phase 2
**Requirements**: ORG-01, ORG-02, ORG-03, ORG-04, ORG-05, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, DEAL-01, DEAL-02, DEAL-03, DEAL-04, DEAL-05, DEAL-06, INTR-01, INTR-02, INTR-03, INTR-04, TASK-01, TASK-02, TASK-03, TASK-04, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, PROC-03
**Success Criteria** (what must be TRUE):
  1. User can create, edit, delete, search, and filter organizations and contacts — contacts can belong to multiple organizations, contacts support free-form tags and full-text search
  2. User can create, edit, and delete deals with stages, values, and close dates — the deal pipeline is visible as a drag-and-drop Kanban board with stage counts and total values displayed per column
  3. User can log interactions (calls, emails, meetings, notes) linked to contacts and/or deals — interactions appear as a chronological timeline on contact detail and deal detail pages
  4. User can create, complete, edit, and delete tasks linked to contacts and/or deals — overdue tasks are visually flagged and a filtered task list view works by status
  5. Dashboard is the landing page after login — it shows pipeline value by stage, deal count, tasks due today, overdue task count, and a recent activity feed
**Plans**: TBD

Plans:
- [ ] 03-01: Organizations and contacts CRUD (list, create, edit, delete, search, filter, tags, junction table)
- [ ] 03-02: Deals and pipeline Kanban (CRUD, normalized stages, drag-and-drop, stage metrics)
- [ ] 03-03: Interactions, tasks, and dashboard (timelines, task filtering, overdue flagging, dashboard aggregation RPC)

### Phase 4: Polish & Production
**Goal**: The application is production-ready — data is exportable, security is audited, and the product is deployed and accessible to the team
**Depends on**: Phase 3
**Requirements**: DATA-01, DATA-02, DATA-03, PROC-04
**Success Criteria** (what must be TRUE):
  1. User can export contacts, organizations, and deals each as a downloadable CSV file
  2. Security review is complete — auth endpoints, RLS policies, API routes, and data handling have been audited using the security-reviewer agent with no critical findings unresolved
  3. The application is live in production on Vercel + Supabase, accessible from any location, with no build errors and passing end-to-end tests
**Plans**: TBD

Plans:
- [ ] 04-01: CSV export for contacts, organizations, and deals
- [ ] 04-02: Security review (security-reviewer agent audit) and E2E test suite (e2e-runner)
- [ ] 04-03: Production deployment verification and responsive polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Frontend Design & UI | 1/3 | In progress | - |
| 2. Backend & Data Layer | 0/3 | Not started | - |
| 3. Integration & Features | 0/3 | Not started | - |
| 4. Polish & Production | 0/3 | Not started | - |
