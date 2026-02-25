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

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in and session persists across browser refresh
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: User can reset password via email link

### Organizations

- [x] **ORG-01**: User can create an organization with name, type (hospital/clinic/lab/other), address, phone, website, and notes
- [x] **ORG-02**: User can edit and delete organizations
- [x] **ORG-03**: User can view all contacts linked to an organization
- [x] **ORG-04**: User can view all deals linked to an organization
- [x] **ORG-05**: Organization list with search and filtering

### Contacts

- [x] **CONT-01**: User can create a contact with name, title, email, phone, and linked organization
- [x] **CONT-02**: User can edit and delete contacts
- [x] **CONT-03**: User can tag contacts with free-form tags
- [x] **CONT-04**: User can search contacts by name, email, organization, or tag (full-text search)
- [x] **CONT-05**: User can filter contacts by tag, organization, and date
- [x] **CONT-06**: Contact can belong to multiple organizations (junction table, not flat FK)

### Deals & Pipeline

- [x] **DEAL-01**: User can create a deal with name, stage, value, close date, linked organization, and linked contacts
- [x] **DEAL-02**: User can edit and delete deals
- [x] **DEAL-03**: User can view deals as a Kanban board with drag-and-drop between stages
- [x] **DEAL-04**: Pipeline stages are pre-configured with healthtech defaults (Prospecting, Discovery, Demo, Proposal, Procurement Review, Contract Negotiation, Won, Lost)
- [x] **DEAL-05**: Each pipeline stage shows deal count and total value
- [x] **DEAL-06**: Pipeline stages stored in a normalized `pipeline_stages` table (not string values)

### Interactions

- [x] **INTR-01**: User can log an interaction (call, email, meeting, note) linked to a contact and/or deal
- [x] **INTR-02**: User can edit and delete interactions
- [x] **INTR-03**: Interactions display as a chronological timeline on contact detail pages
- [x] **INTR-04**: Interactions display as a chronological timeline on deal detail pages

### Tasks

- [x] **TASK-01**: User can create a task with title, description, due date, and link to contact and/or deal
- [x] **TASK-02**: User can edit, complete, and delete tasks
- [x] **TASK-03**: Tasks show overdue status when past due date
- [x] **TASK-04**: Task list view with filtering by status (pending/completed/overdue)

### Dashboard

- [x] **DASH-01**: Dashboard shows pipeline value by stage (bar or funnel chart)
- [x] **DASH-02**: Dashboard shows count of tasks due today and overdue tasks
- [x] **DASH-03**: Dashboard shows recent activity feed (latest interactions across all records)
- [x] **DASH-04**: Dashboard shows deal count and total pipeline value
- [x] **DASH-05**: Dashboard is the landing page after login

### Data Management

- [x] **DATA-01**: User can export contacts to CSV
- [x] **DATA-02**: User can export organizations to CSV
- [x] **DATA-03**: User can export deals to CSV

### Architecture & Infrastructure

- [x] **ARCH-01**: RLS (Row Level Security) enabled on all Supabase tables from day one
- [x] **ARCH-02**: Database schema uses contact-organization junction table (many-to-many)
- [x] **ARCH-03**: Full-text search uses PostgreSQL tsvector with GIN indexes
- [x] **ARCH-04**: Cloud deployed on Vercel + Supabase
- [x] **ARCH-05**: All available MCP tools (Supabase, Playwright) leveraged during development
- [x] **ARCH-06**: Available skills (`frontend-design`, `playground`, `tdd`, `security-review`, `e2e`) used throughout development

### Process Requirements

- [ ] **PROC-01**: Frontend design phase completed and approved BEFORE any backend implementation
- [ ] **PROC-02**: Phase ordering strictly follows: Frontend Design → Backend & Data → Integration → Polish
- [x] **PROC-03**: Code reviewed using `code-reviewer` agent after each major implementation step
- [x] **PROC-04**: Security reviewed using `security-reviewer` agent before production deployment

## v1.1 Requirements — Team Command Portal

Requirements for milestone v1.1. Each maps to roadmap phases 5+.

### Portal Foundation

- [ ] **PORTAL-01**: User can access a full-page chat interface at /portal that requires Supabase authentication
- [ ] **PORTAL-02**: Portal uses mobile-first responsive layout optimized for phone usage (dvh units, safe area insets)
- [ ] **PORTAL-03**: Portal renders AI responses with markdown formatting (bold, lists, headers, code blocks)
- [x] **PORTAL-04**: Portal displays a user-friendly error message when Gemini rate limit is exceeded
- [ ] **PORTAL-05**: Portal hides the existing floating chat widget to avoid duplication

### AI Tools

- [ ] **AITOOL-01**: User can create a new contact via natural language chat command
- [ ] **AITOOL-02**: User can create a new deal via natural language chat command
- [ ] **AITOOL-03**: User can mark a task as complete via natural language chat command
- [ ] **AITOOL-04**: User can request a daily briefing showing overdue tasks, today's tasks, and pipeline summary
- [x] **AITOOL-05**: Chat tool definitions extracted to shared module for maintainability

### Portal UX

- [ ] **PUX-01**: Portal displays always-visible quick action buttons for common operations

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
| Conversation persistence (DB) | Session-only for v1.1; may add later |
| Action confirmation cards | Rich formatted cards deferred; text responses sufficient |
| Real-time sync between portal users | Adds complexity; actions persist to DB, users refresh to see changes |
| Voice input for portal | Deferred; text input sufficient for v1.1 |
| Push notifications | Deferred; not needed for lightweight remote access |

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
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| ORG-01 | Phase 3 | Complete |
| ORG-02 | Phase 3 | Complete |
| ORG-03 | Phase 3 | Complete |
| ORG-04 | Phase 3 | Complete |
| ORG-05 | Phase 3 | Complete |
| CONT-01 | Phase 3 | Complete |
| CONT-02 | Phase 3 | Complete |
| CONT-03 | Phase 3 | Complete |
| CONT-04 | Phase 3 | Complete |
| CONT-05 | Phase 3 | Complete |
| CONT-06 | Phase 3 | Complete |
| DEAL-01 | Phase 3 | Complete |
| DEAL-02 | Phase 3 | Complete |
| DEAL-03 | Phase 3 | Complete |
| DEAL-04 | Phase 3 | Complete |
| DEAL-05 | Phase 3 | Complete |
| DEAL-06 | Phase 3 | Complete |
| INTR-01 | Phase 3 | Complete |
| INTR-02 | Phase 3 | Complete |
| INTR-03 | Phase 3 | Complete |
| INTR-04 | Phase 3 | Complete |
| TASK-01 | Phase 3 | Complete |
| TASK-02 | Phase 3 | Complete |
| TASK-03 | Phase 3 | Complete |
| TASK-04 | Phase 3 | Complete |
| DASH-01 | Phase 3 | Complete |
| DASH-02 | Phase 3 | Complete |
| DASH-03 | Phase 3 | Complete |
| DASH-04 | Phase 3 | Complete |
| DASH-05 | Phase 3 | Complete |
| DATA-01 | Phase 4 | Complete |
| DATA-02 | Phase 4 | Complete |
| DATA-03 | Phase 4 | Complete |
| ARCH-01 | Phase 2 | Complete (02-02) |
| ARCH-02 | Phase 2 | Complete (02-02) |
| ARCH-03 | Phase 2 | Complete (02-02) |
| ARCH-04 | Phase 2 | Complete (02-01) |
| ARCH-05 | Phase 2 | Complete (02-02) |
| ARCH-06 | Phase 1 | Complete (01-01) |
| PROC-01 | Phase 1 | Pending |
| PROC-02 | Phase 1 | Pending |
| PROC-03 | Phase 3 | Complete |
| PROC-04 | Phase 4 | Complete |
| PORTAL-01 | Phase 5 | Pending |
| PORTAL-02 | Phase 5 | Pending |
| PORTAL-03 | Phase 5 | Pending |
| PORTAL-04 | Phase 5 | Complete |
| PORTAL-05 | Phase 5 | Pending |
| AITOOL-05 | Phase 5 | Complete |
| AITOOL-01 | Phase 6 | Pending |
| AITOOL-02 | Phase 6 | Pending |
| AITOOL-03 | Phase 6 | Pending |
| AITOOL-04 | Phase 6 | Pending |
| PUX-01 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 53 total (all complete)
- v1.1 requirements: 11 total (all mapped)
- Mapped to phases: 53 (v1) + 11 (v1.1)
- Unmapped: 0

---
*Requirements defined: 2026-02-21*
*Last updated: 2026-02-25 after milestone v1.1 roadmap creation (phases 5-7)*
