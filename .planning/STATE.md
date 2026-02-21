# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-21)

**Core value:** Sales and account management teams can track every customer relationship, deal, and interaction in one place — so nothing falls through the cracks.
**Current focus:** Phase 1 — Frontend Design & UI

## Current Position

Phase: 1 of 4 (Frontend Design & UI)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-21 — Plan 02 complete: Dashboard, Contacts (table+grid+sheet), Deal Kanban (dnd-kit), Contact Detail page

Progress: [██░░░░░░░░] 17%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 8 min
- Total execution time: 0.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-frontend-design-ui | 2 | 16 min | 8 min |

**Recent Trend:**
- Last 5 plans: 12 min, 4 min
- Trend: accelerating

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
- [01-01]: collapsible="icon" sidebar — ~48px icon rail collapsed, ~240px expanded; SidebarMenuButton tooltip for collapsed state
- [01-01]: Mock data in src/data/ — TypeScript-typed static exports, no fetch() calls; pure frontend prototype
- [01-02]: DealCard minimal — name + org + value only; no stage badge on card (scannability over detail)
- [01-02]: onDragOver stage reassignment — updates deal.stage during drag so column counts update live (not just onDragEnd)
- [01-02]: PipelineSummary CSS-only bars — no chart library; pure div width% with OKLCH opacity scale per stage
- [01-02]: ViewToggle is component-local state — not URL-driven; change if deep-linking contacts/grid is needed
- [01-02]: ContactDetail uses use(params) React 19 pattern for Next.js 16 async params in App Router

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 2]: Next.js 16 uses `proxy.ts` not `middleware.ts` for session refresh — verify correct filename before scaffolding
- [Phase 3]: Kanban drag-and-drop library — dnd-kit pre-installed; react-beautiful-dnd not needed (resolved by dnd-kit install in Plan 01)
- [Phase 4]: Supabase BAA must be signed before production launch if any patient-adjacent data is stored (business action, not code task)

## Session Continuity

Last session: 2026-02-21
Stopped at: Completed 01-02-PLAN.md — Dashboard, Contacts list, Deal Kanban, Contact Detail (all 4 prototype screens)
Resume file: .planning/phases/01-frontend-design-ui/01-03-PLAN.md
