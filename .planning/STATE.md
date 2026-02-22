# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Sales and account management teams can track every customer relationship, deal, and interaction in one place — so nothing falls through the cracks.
**Current focus:** Phase 2 complete — auth guard fix deployed to production; ready for Phase 3 (data integration)

## Current Position

Phase: 2 of 4 (Backend & Data Layer)
Plan: 4 of 4 in current phase — 02-04 complete (proxy.ts moved to src/, auth redirect verified in production)
Status: Phase 2 complete — all 8/8 UAT tests pass; ready for Phase 3
Last activity: 2026-02-22 — proxy.ts moved to src/proxy.ts, deployed to Vercel, auth redirect confirmed

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: ~12 min
- Total execution time: ~1.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-frontend-design-ui | 3 | ~20 min | ~7 min |
| 02-backend-data-layer | 4/4 | ~54 min | ~14 min |

**Recent Trend:**
- Last 5 plans: 4 min, approval, 12 min, 24 min, 3 min
- Trend: stable

*Updated after each plan completion*

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

### Pending Todos

None.

### Blockers/Concerns

- [Phase 3]: Kanban and contacts pages still use mock data from src/data/ — Phase 3 replaces with real Supabase queries
- [Phase 3]: Kanban drag-and-drop library — dnd-kit pre-installed; react-beautiful-dnd not needed (resolved by dnd-kit install in Plan 01)
- [Phase 4]: Supabase BAA must be signed before production launch if any patient-adjacent data is stored (business action, not code task)

## Session Continuity

Last session: 2026-02-22
Stopped at: Completed 02-04-PLAN.md — proxy.ts moved to src/, auth guard active in production, all UAT tests pass
Resume file: .planning/phases/02-backend-data-layer/02-04-SUMMARY.md
