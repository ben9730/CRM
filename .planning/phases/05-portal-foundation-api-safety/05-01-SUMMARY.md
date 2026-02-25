---
phase: 05-portal-foundation-api-safety
plan: 01
subsystem: api
tags: [gemini, rate-limiting, tool-extraction, viewport, next.js]

# Dependency graph
requires:
  - phase: 03-integration-features
    provides: The existing /api/chat route.ts with inline tool definitions and executeTool function

provides:
  - src/lib/chat/tools.ts — shared module exporting chatTools (FunctionDeclaration[]), executeTool, and SYSTEM_PROMPT
  - Structured 429 rate limit response from /api/chat with rateLimited flag and friendlyMessage
  - viewport-fit=cover in root layout enabling safe area insets for iPhone
  - maxDuration = 30 on /api/chat route preventing Vercel timeout on multi-tool queries

affects:
  - 05-portal-foundation-api-safety (Plan 02 portal UI uses rateLimited response)
  - 06-ai-tools (adds new tools to src/lib/chat/tools.ts)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Shared tool module pattern — chat tool definitions extracted from API route to lib/chat/tools.ts for maintainability
    - Structured rate limit response — API returns { rateLimited: true, friendlyMessage } with status 429 instead of generic error

key-files:
  created:
    - src/lib/chat/tools.ts
  modified:
    - src/app/api/chat/route.ts
    - src/app/layout.tsx

key-decisions:
  - "Tool definitions extracted to src/lib/chat/tools.ts — pure refactor, zero behavior change, enables clean Phase 6 tool additions"
  - "Rate limit detection uses both '429' and 'RESOURCE_EXHAUSTED' string checks — belt-and-suspenders for SDK version variance"
  - "maxDuration = 30 added to route.ts now — prevents Vercel 10s timeout gap when Phase 6 daily briefing uses 3+ tool calls"
  - "viewport export added to root layout.tsx — additive change, enables env(safe-area-inset-bottom) for portal mobile layout"

patterns-established:
  - "Pattern: Import chat tools from @/lib/chat/tools rather than defining inline in route handler"
  - "Pattern: Check errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') for Gemini rate limit detection"

requirements-completed: [AITOOL-05, PORTAL-04]

# Metrics
duration: 3min
completed: 2026-02-25
---

# Phase 5 Plan 01: Portal Foundation API Safety Summary

**Chat tool definitions extracted to src/lib/chat/tools.ts with structured 429 rate limit responses and viewport-fit=cover for safe area insets**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-25T11:05:48Z
- **Completed:** 2026-02-25T11:08:32Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `src/lib/chat/tools.ts` exporting `chatTools`, `executeTool`, and `SYSTEM_PROMPT` — tool definitions now live in a shared module importable by the portal and future phases
- Refactored `/api/chat/route.ts` to import from the shared module; added `maxDuration = 30` to prevent Vercel timeout on multi-tool queries; added structured 429 rate limit response
- Added `viewport` export to root `layout.tsx` with `viewportFit: 'cover'` enabling `env(safe-area-inset-bottom)` for iPhone home bar safe area on the portal

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract tool definitions and executeTool to shared module** - `f9ac262` (feat)
2. **Task 2: Add rate limit detection and viewport-fit=cover** - `25a8033` (feat)

**Plan metadata:** `(pending final commit)` (docs: complete plan)

## Files Created/Modified
- `src/lib/chat/tools.ts` — New shared module exporting chatTools (FunctionDeclaration[]), executeTool, and SYSTEM_PROMPT
- `src/app/api/chat/route.ts` — Refactored to import from shared module; added maxDuration = 30; added structured rate limit catch block
- `src/app/layout.tsx` — Added Viewport import and viewport export with viewportFit: 'cover'

## Decisions Made
- Tool extraction is a pure refactor — no behavior changes to the ChatWidget or API responses for non-rate-limit requests
- Rate limit detection checks both "429" AND "RESOURCE_EXHAUSTED" for SDK version resilience
- `maxDuration = 30` added proactively — safe now, prevents gap when Phase 6 daily briefing requires 3+ sequential tool calls
- `viewportFit: 'cover'` is additive — no impact on existing CRM pages, enables safe area insets for portal mobile layout

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — TypeScript compiled clean after both tasks. Full `npm run build` succeeded with no errors or warnings.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `src/lib/chat/tools.ts` is ready for Plan 02 portal UI to import SYSTEM_PROMPT if needed, and for Phase 6 to add new tool definitions cleanly
- The `/api/chat` route now returns `{ rateLimited: true, friendlyMessage }` with status 429 — Plan 02 portal UI can render a friendly error bubble without any API changes
- `viewport-fit=cover` is set — the portal's `env(safe-area-inset-bottom)` padding will work correctly on iPhone without further layout.tsx changes

## Self-Check: PASSED

All created files exist on disk. All task commits verified in git log.

---
*Phase: 05-portal-foundation-api-safety*
*Completed: 2026-02-25*
