# Requirements: HealthCRM

**Defined:** 2026-02-21
**Core Value:** Sales and account management teams can track every customer relationship, deal, and interaction in one place — so nothing falls through the cracks.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Design & UI Quality

- [x] **DSGN-01**: Application uses the `frontend-design` skill to create a distinctive, premium UI comparable to HubSpot/Pipedrive
- [x] **DSGN-02**: Interactive HTML prototypes created via `playground` skill for key screens (dashboard, contacts list, deal pipeline, contact detail) — approved by user before backend work
- [x] **DSGN-03**: Full component library designed and documented (buttons, forms, cards, tables, modals, navigation)
- [ ] **DSGN-04**: Responsive design works on desktop (1280px+), tablet (768px), and mobile (375px)
- [x] **DSGN-05**: Consistent design system with color palette, typography, spacing, and iconography
- [x] **DSGN-06**: Frontend built and visually polished BEFORE backend integration begins

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via email link

### Organizations

- [ ] **ORG-01**: User can create an organization with name, type (hospital/clinic/lab/other), address, phone, website, and notes
- [ ] **ORG-02**: User can edit and delete organizations
- [ ] **ORG-03**: User can view all contacts linked to an organization
- [ ] **ORG-04**: User can view all deals linked to an organization
- [ ] **ORG-05**: Organization list with search and filtering

### Contacts

- [ ] **CONT-01**: User can create a contact with name, title, email, phone, and linked organization
- [ ] **CONT-02**: User can edit and delete contacts
- [ ] **CONT-03**: User can tag contacts with free-form tags
- [ ] **CONT-04**: User can search contacts by name, email, organization, or tag (full-text search)
- [ ] **CONT-05**: User can filter contacts by tag, organization, and date
- [ ] **CONT-06**: Contact can belong to multiple organizations (junction table, not flat FK)

### Deals & Pipeline

- [ ] **DEAL-01**: User can create a deal with name, stage, value, close date, linked organization, and linked contacts
- [ ] **DEAL-02**: User can edit and delete deals
- [ ] **DEAL-03**: User can view deals as a Kanban board with drag-and-drop between stages
- [ ] **DEAL-04**: Pipeline stages are pre-configured with healthtech defaults (Prospecting, Discovery, Demo, Proposal, Procurement Review, Contract Negotiation, Won, Lost)
- [ ] **DEAL-05**: Each pipeline stage shows deal count and total value
- [ ] **DEAL-06**: Pipeline stages stored in a normalized `pipeline_stages` table (not string values)

### Interactions

- [ ] **INTR-01**: User can log an interaction (call, email, meeting, note) linked to a contact and/or deal
- [ ] **INTR-02**: User can edit and delete interactions
- [ ] **INTR-03**: Interactions display as a chronological timeline on contact detail pages
- [ ] **INTR-04**: Interactions display as a chronological timeline on deal detail pages

### Tasks

- [ ] **TASK-01**: User can create a task with title, description, due date, and link to contact and/or deal
- [ ] **TASK-02**: User can edit, complete, and delete tasks
- [ ] **TASK-03**: Tasks show overdue status when past due date
- [ ] **TASK-04**: Task list view with filtering by status (pending/completed/overdue)

### Dashboard

- [ ] **DASH-01**: Dashboard shows pipeline value by stage (bar or funnel chart)
- [ ] **DASH-02**: Dashboard shows count of tasks due today and overdue tasks
- [ ] **DASH-03**: Dashboard shows recent activity feed (latest interactions across all records)
- [ ] **DASH-04**: Dashboard shows deal count and total pipeline value
- [ ] **DASH-05**: Dashboard is the landing page after login

### Data Management

- [ ] **DATA-01**: User can export contacts to CSV
- [ ] **DATA-02**: User can export organizations to CSV
- [ ] **DATA-03**: User can export deals to CSV

### Architecture & Infrastructure

- [ ] **ARCH-01**: RLS (Row Level Security) enabled on all Supabase tables from day one
- [ ] **ARCH-02**: Database schema uses contact-organization junction table (many-to-many)
- [ ] **ARCH-03**: Full-text search uses PostgreSQL tsvector with GIN indexes
- [ ] **ARCH-04**: Cloud deployed on Vercel + Supabase
- [ ] **ARCH-05**: All available MCP tools (Supabase, Playwright) leveraged during development
- [x] **ARCH-06**: Available skills (`frontend-design`, `playground`, `tdd`, `security-review`, `e2e`) used throughout development

### Process Requirements

- [ ] **PROC-01**: Frontend design phase completed and approved BEFORE any backend implementation
- [ ] **PROC-02**: Phase ordering strictly follows: Frontend Design → Backend & Data → Integration → Polish
- [ ] **PROC-03**: Code reviewed using `code-reviewer` agent after each major implementation step
- [ ] **PROC-04**: Security reviewed using `security-reviewer` agent before production deployment

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Roles & Permissions

- **ROLE-01**: Admin role with full CRUD and user management
- **ROLE-02**: Rep role with own records + shared read access

### Advanced Features

- **ADV-01**: Deal stall detection — flag deals with no activity in configurable period
- **ADV-02**: Stakeholder role tracking per contact-org relationship (Clinical Champion, Procurement, IT, etc.)
- **ADV-03**: Pipeline forecast view — weighted revenue by close month/quarter
- **ADV-04**: Custom fields on contacts, organizations, and deals
- **ADV-05**: Activity-based reminders — require "next action" per deal
- **ADV-06**: In-app task reminder notifications
- **ADV-07**: Audit trail / change history

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native email client (send/receive) | Massive undertaking; users prefer their native email app; use BCC logging later |
| Marketing automation / email sequences | Separate product category; bloats CRM for small teams |
| AI lead scoring | Insufficient data history with 1-5 users; garbage results |
| Two-way calendar sync | Complex OAuth flows, timezone edge cases; manual meeting logging sufficient |
| Customer support ticketing | Different workflow from sales CRM; use separate tool |
| Social media monitoring | Near-zero ROI for B2B healthtech sales |
| Custom report builder | Massive scope; 5-7 fixed metrics sufficient for small teams |
| Territory/quota management | Enterprise feature; overkill for 1-5 users |
| Mobile native app | Responsive web sufficient for v1 |
| HIPAA/PHI compliance | No patient data stored; CRM tracks business relationships only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 1 | Complete (01-01) |
| DSGN-02 | Phase 1 | Complete (01-02) |
| DSGN-03 | Phase 1 | Complete (01-01) |
| DSGN-04 | Phase 1 | Pending |
| DSGN-05 | Phase 1 | Complete (01-01) |
| DSGN-06 | Phase 1 | Complete (01-01) |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| ORG-01 | Phase 3 | Pending |
| ORG-02 | Phase 3 | Pending |
| ORG-03 | Phase 3 | Pending |
| ORG-04 | Phase 3 | Pending |
| ORG-05 | Phase 3 | Pending |
| CONT-01 | Phase 3 | Pending |
| CONT-02 | Phase 3 | Pending |
| CONT-03 | Phase 3 | Pending |
| CONT-04 | Phase 3 | Pending |
| CONT-05 | Phase 3 | Pending |
| CONT-06 | Phase 3 | Pending |
| DEAL-01 | Phase 3 | Pending |
| DEAL-02 | Phase 3 | Pending |
| DEAL-03 | Phase 3 | Pending |
| DEAL-04 | Phase 3 | Pending |
| DEAL-05 | Phase 3 | Pending |
| DEAL-06 | Phase 3 | Pending |
| INTR-01 | Phase 3 | Pending |
| INTR-02 | Phase 3 | Pending |
| INTR-03 | Phase 3 | Pending |
| INTR-04 | Phase 3 | Pending |
| TASK-01 | Phase 3 | Pending |
| TASK-02 | Phase 3 | Pending |
| TASK-03 | Phase 3 | Pending |
| TASK-04 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| DATA-01 | Phase 4 | Pending |
| DATA-02 | Phase 4 | Pending |
| DATA-03 | Phase 4 | Pending |
| ARCH-01 | Phase 2 | Pending |
| ARCH-02 | Phase 2 | Pending |
| ARCH-03 | Phase 2 | Pending |
| ARCH-04 | Phase 2 | Pending |
| ARCH-05 | Phase 2 | Pending |
| ARCH-06 | Phase 1 | Complete (01-01) |
| PROC-01 | Phase 1 | Pending |
| PROC-02 | Phase 1 | Pending |
| PROC-03 | Phase 3 | Pending |
| PROC-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0

---
*Requirements defined: 2026-02-21*
*Last updated: 2026-02-21 after 01-02 completion — DSGN-02 complete (interactive prototype screens built)*
