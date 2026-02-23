# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Sales and account management teams can track every customer relationship, deal, and interaction in one place — so nothing falls through the cracks.
**Current focus:** Phase 3 COMPLETE (all 6 plans done, 8/8 UAT passing) — ready for Phase 4 (Polish & Launch)

## Current Position

Phase: 3 of 4 (Integration & Features) — COMPLETE
Plan: 6 of 6 complete — 03-01 (orgs+contacts), 03-02 (deals/kanban), 03-03 (interactions/tasks/dashboard), 03-04 (Select crash + RLS fix), 03-05 (UAT gap closure), 03-06 (RLS SELECT + task priority enum + deal form double-fire)
Status: Phase 3 complete — all UAT issues resolved, all 8 UAT tests passing
Last activity: 2026-02-23 — RLS SELECT policy fix, task priority enum fix, deal form useEffect double-fire fix

Progress: [██████████] 100% (Phase 3) — overall project ~75% complete (3 of 4 phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: ~12 min
- Total execution time: ~1.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-frontend-design-ui | 3 | ~20 min | ~7 min |
| 02-backend-data-layer | 4/4 | ~54 min | ~14 min |
| 03-integration-features | 6/6 | ~60 min | ~10 min |

**Recent Trend:**
- Last 5 plans: 4 min, approval, 12 min, 24 min, 13 min, 14 min
- Trend: stable

*Updated after each plan completion*
| Phase 03-integration-features P05 | 277 | 2 tasks | 10 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Frontend-first development — visual approval before backend investment; design drives architecture
- [Roadmap]: Contact-organization junction table (not flat FK) — follow PITFALLS.md recommendation; migration cost is too high to defer
- [Roadmap]: Pipeline stages as normalized table — seeded with healthtech defaults (Prospecting → Closed Won/Lost)
- [Roadmap]: RLS enabled on every table at creation time, not added later
- [01-01]: Violet-indigo accent oklch(0.65 0.24 280) — premium dark-mode design; sidebar oklch(0.08) darker than main oklch(0.10)
- [01-01]: Geist Sans as primary font — optimal for dark-mode CRM readability
- [01-01]: CSS-only Tailwind v4 — no tailwind.config.js; all config in globals.css @theme inline
- [01-01]: Forced dark mode (forcedTheme="dark") — prototype is dark-mode only
- [01-01]: collapsible="icon" sidebar — ~48px icon rail collapsed, ~180px expanded (narrowed from 240px)
- [01-01]: Mock data in src/data/ — TypeScript-typed static exports, no fetch() calls; pure frontend prototype
- [01-02]: DealCard minimal — name + org + value only; no stage badge on card (scannability over detail)
- [01-02]: onDragOver stage reassignment — updates deal.stage during drag so column counts update live (not just onDragEnd)
- [01-02]: PipelineSummary CSS-only bars — no chart library; pure div width% with OKLCH opacity scale per stage
- [01-02]: ViewToggle is component-local state — not URL-driven; change if deep-linking contacts/grid is needed
- [01-02]: ContactDetail uses use(params) React 19 pattern for Next.js 16 async params in App Router
- [01-03]: Border radius base reduced to 7px (0.4375rem) per theme playground tuning
- [01-03]: Sidebar width reduced to 180px (11.25rem) for more content space
- [01-03]: Glow hover intensity set to 14% for slightly more pronounced effect
- [02-01]: Supabase project ID: ntrliqzjbmhkkqhxtvqe, region us-east-1
- [02-01]: proxy.ts with auth guards — verified correct Next.js 16 pattern
- [02-02]: RLS split policy pattern for soft-delete — SELECT filters deleted_at IS NULL, UPDATE/DELETE do not
- [02-02]: private.is_account_member() security definer in private schema — 7ms vs 11000ms inline
- [02-02]: contact_organizations has no account_id — RLS derives via EXISTS subquery to contacts
- [Phase 02-03]: React 19 useActionState requires Server Actions with (prevState, formData) signature — not just (formData)
- [Phase 02-03]: AuthState type exported from auth.ts imported into each form for shared error/success type safety
- [Phase 02-03]: signOut uses plain form action pattern (no useActionState) — no error state needed, always redirects
- [02-04]: Next.js 16 with src/ directory requires proxy.ts at src/proxy.ts — not project root; Turbopack uses functions-config-manifest.json for registration, not middleware-manifest.json
- [03-01]: Zod v4 uses .issues[] not .errors[] on ZodError — applied to all Server Actions
- [03-01]: Tags submitted as JSON-encoded hidden inputs in Server Action forms (formData doesn't support arrays natively)
- [03-01]: OrgCreateButton/ContactCreateButton are client islands — page stays Server Component for data fetching
- [03-01]: Contact deals linked via org membership (no direct contact_id on deals table in schema)
- [03-01]: OrgId filter for contacts applied in application code after fetch (PostgREST limitation with nested joins + count)
- [03-02]: Optimistic DnD via useTransition snapshot/rollback — no confirmation dialog, instant move with toast error on failure
- [03-02]: KanbanBoard receives initialDeals+stages as props from Server Component — client component for DnD only
- [03-02]: Stage hex color from DB used directly via color-mix(in oklch) — no hardcoded color maps needed
- [03-02]: deal_contacts RLS via EXISTS through deals.account_id (junction table has no account_id column)
- [03-03]: AppShell as Server Component to fetch overdueTaskCount for sidebar badge; AppSidebar stays client
- [03-03]: getDashboardMetrics uses Promise.all for parallel aggregation — avoids sequential waterfall
- [03-03]: isOverdue computed application-side at query time (due_date < today && !is_complete)
- [03-03]: InteractionFormModal uses Dialog (not Sheet) — quick-log pattern for interactions
- [03-04]: Radix Select defaultValue must never be empty string — use '__none__' sentinel (already supported by Zod preprocessors)
- [03-04]: RLS UPDATE policies use USING only (no WITH CHECK) for all soft-delete tables — account_id never changes via app, WITH CHECK triggers false failure on soft-delete
- [Phase 03-05]: KanbanPageClient wraps DealCreateButton+KanbanBoard for shared useState scope — avoids Server Component boundary limitation
- [Phase 03-05]: createDeal returns DealWithRelations for optimistic Kanban update; ActionState extended with optional deal field
- [Phase 03-05]: AppShell uses Promise.all for parallel fetch of overdueTaskCount+user profile; passes userInitials to AppHeader

### Pending Todos

None.

### Blockers/Concerns

- [Phase 4]: Supabase BAA must be signed before production launch if any patient-adjacent data is stored (business action, not code task)

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 03-06-PLAN.md — final UAT gap closure; Phase 3 fully done, 8/8 UAT passing
Resume file: .planning/phases/04-polish-launch/ (next phase)
