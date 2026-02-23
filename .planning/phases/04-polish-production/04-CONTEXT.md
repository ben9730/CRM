# Phase 4: Polish & Production - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the CRM production-ready: CSV data export for contacts/orgs/deals, security audit, E2E test suite, and production deployment verification. Also includes three UX polish items from Phase 3 UAT feedback (global search, avatar dropdown, task auto-linking).

</domain>

<decisions>
## Implementation Decisions

### Production Polish (UAT Feedback Items)

- **Global search**: Search bar navigates to a `/search` results page showing results grouped by entity type (Contacts, Deals, Organizations) — not a live dropdown
- **Avatar profile dropdown**: Minimal — shows user name, email, and a Logout button. No settings link.
- **Auto-link tasks to context**: When creating a task from a contact or deal detail page, automatically set the linked entity (contact_id or deal_id) without the user having to select it manually

### E2E Test Coverage

- **Critical flows to test**: CRUD operations (contacts, orgs, deals, tasks, interactions), Kanban drag-and-drop (deal stage changes), Dashboard loads with metrics
- **Auth flows**: Not in E2E scope (user decided)
- **Test target**: Live Supabase — tests run against the real Vercel+Supabase deployment
- **Test data strategy**: Create & cleanup — each test creates its own data, runs assertions, then deletes it. Isolated and repeatable.
- **CI integration**: Local only — run with `npx playwright test`. No GitHub Actions for now.

### CSV Export

- Claude's discretion on column selection, filename format, and Hebrew text handling (discuss-phase did not cover this — use sensible defaults)

### Tooling & Agents

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

</decisions>

<specifics>
## Specific Ideas

- Search results page grouped by entity type (not command palette style)
- Avatar dropdown should be minimal and clean — matches the existing premium SaaS aesthetic
- User explicitly requested: "check what tools, skills, agents, and MCPs can help you and use them" during development

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-polish-production*
*Context gathered: 2026-02-23*
