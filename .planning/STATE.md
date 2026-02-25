# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-25)

**Core value:** Sales and account management teams can track every customer relationship, deal, and interaction in one place — so nothing falls through the cracks.
**Current focus:** Milestone v1.1 — Team Command Portal (Phase 6: Conversation Persistence & AI Write Tools)

## Current Position

Phase: 6 — Conversation Persistence & AI Write Tools
Plan: 1 of 3 complete
Status: Plan 01 complete — chat_sessions/chat_messages tables, session API, PortalChat persistence, auth redirect preservation
Last activity: 2026-02-25 — Phase 6 Plan 01 complete

Progress: [##########] v1.0 complete — [██░░░░░░░░] v1.1 ~27% (3/11 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: ~12 min
- Total execution time: ~2.2 hours

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
| Phase 04-polish-production P01 | 15 | 2 tasks | 8 files |
| Phase 04-polish-production P02 | 4 | 2 tasks | 9 files |
| Phase 04-polish-production P03 | 10 | 1 tasks | 3 files |
| Phase 04-polish-production P03 | 20 | 2 tasks | 4 files |
| Phase 05-portal-foundation-api-safety P01 | 3 | 2 tasks | 3 files |
| Phase 05-portal-foundation-api-safety P02 | 5 | 3 tasks | 6 files |
| Phase 06-conversation-persistence-ai-write-tools P01 | 6 | 2 tasks | 8 files |

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
- [Phase 04-polish-production]: Deals search uses ilike on title (no search_vector on deals table)
- [Phase 04-polish-production]: UTF-8 BOM prepended to CSV exports for Excel/Hebrew compatibility
- [Phase 04-polish-production]: Avatar dropdown minimal: name, email, logout only
- [Phase 04-polish-production]: DnD E2E test falls back to keyboard attempt — @dnd-kit ignores HTML5 drag events (Playwright dragTo limitation)
- [Phase 04-polish-production]: Security review complete: 0 critical/high findings; rate limiting and CSP accepted as medium/low for known-user CRM
- [Phase 04-polish-production]: Responsive polish: 3 targeted fixes (kanban header, kanban board padding, tasks header) — all other pages already had correct responsive patterns
- [Phase 04-polish-production]: UAT bug fix: allContacts prop missing from LinkedTasks in contact-detail-client.tsx — contacts.length > 0 guard silently suppressed the Linked Contact dropdown
- [v1.1 Roadmap]: Portal uses sibling (portal) route group — not nested inside (app); no sidebar, separate layout, clean /portal URL
- [v1.1 Roadmap]: Single /api/chat endpoint extended with optional conversation_id — no new portal-specific route; ChatWidget unchanged
- [v1.1 Roadmap]: Tool definitions extracted to src/lib/chat/tools.ts in Phase 5 before any new tools added in Phase 6
- [v1.1 Roadmap]: Normalized chat_messages table (one row per message) — not JSON blob; enables sliding window queries and future pagination
- [v1.1 Roadmap]: Two-step confirmation flow required for all AI write tools — card displayed first, DB write only on user confirm tap
- [v1.1 Roadmap]: Gemini actual limits are 10 RPM / 250 RPD (not 500 RPD as in PROJECT.md) — per-user rate limiting + 429 handling required in Phase 5
- [v1.1 Roadmap]: export const maxDuration = 30 required in /api/chat/route.ts — daily briefing with 3+ tool calls can exceed Vercel 10s default
- [v1.1 Roadmap]: iOS Safari input layout requires h-dvh container + flex-column layout (no position: fixed) — real device test required for Phase 7 sign-off
- [05-01]: Chat tool definitions extracted to src/lib/chat/tools.ts — pure refactor enabling clean Phase 6 tool additions
- [05-01]: Rate limit detection checks both '429' and 'RESOURCE_EXHAUSTED' — belt-and-suspenders for SDK version variance
- [05-01]: maxDuration = 30 added to /api/chat/route.ts — prevents Vercel 10s timeout on multi-tool queries
- [05-01]: viewport export with viewportFit: 'cover' added to root layout.tsx — enables env(safe-area-inset-bottom) for portal iPhone layout
- [Phase 05-02]: (portal) route group as sibling to (app) — portal layout excludes AppShell, ChatWidget, Toaster; /portal URL from nested portal/ folder
- [Phase 05-02]: h-dvh + flex-col layout for iOS keyboard compat — no position:fixed; input area pinned via flex push
- [Phase 05-02]: Rate limit errors rendered as assistant chat bubbles using data.rateLimited + data.friendlyMessage from /api/chat
- [Phase 06-01]: chat_messages INSERT policy uses WITH CHECK (not USING) — correct RLS for INSERT rows
- [Phase 06-01]: DB messages are display-only: Gemini context starts fresh per portal visit, no history reconstruction
- [Phase 06-01]: Session freshness: 24h gap on updated_at triggers new session creation
- [Phase 06-01]: Open redirect prevention: next param validated to start with / before redirect

### Pending Todos

- Update PROJECT.md: Gemini limits are 10 RPM / 250 RPD (not 500 RPD / 15 RPM) — reconcile before Phase 5 is planned

### Blockers/Concerns

- [Phase 4]: Supabase BAA must be signed before production launch if any patient-adjacent data is stored (business action, not code task)
- [v1.1 Phase 6]: Two-step AI confirmation flow — RESOLVED in RESEARCH.md: pendingAction pattern (API detects write tool, returns pendingAction, client shows ConfirmationCard, confirm route executes DB write)

## Session Continuity

Last session: 2026-02-25
Stopped at: Completed 06-01-PLAN.md — chat_sessions/chat_messages tables with RLS, session API, PortalChat persistence, auth redirect preservation complete; ready for Plan 02 write tools
Resume file: N/A
