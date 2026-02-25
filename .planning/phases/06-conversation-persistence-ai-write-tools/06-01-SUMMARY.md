---
phase: 06-conversation-persistence-ai-write-tools
plan: 01
subsystem: database, api, auth
tags: [supabase, rls, chat, session, persistence, next-auth, redirect]

# Dependency graph
requires:
  - phase: 05-portal-foundation-api-safety
    provides: PortalChat component, /api/chat route, portal layout
provides:
  - chat_sessions table in Supabase with RLS (user-scoped)
  - chat_messages table in Supabase with RLS (EXISTS via session ownership)
  - GET /api/chat/session endpoint: load or create session, return message history
  - PortalChat with mount-time session loading and message display from DB
  - Server-side message saving after each chat exchange via saveMessages helper
  - /portal auth redirect preservation through login flow
affects:
  - 06-02: confirmation flow uses sessionId from PortalChat state
  - 06-03: write tool confirm route saves via same chat_messages pattern

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Normalized one-row-per-message chat persistence (not JSON blob)
    - Session freshness gate: 24h threshold on updated_at before creating new session
    - Display-only DB history: DB messages for visual restore only; Gemini context starts fresh each visit
    - next query param auth redirect: proxy.ts -> login page -> hidden input -> signIn action

key-files:
  created:
    - supabase/migrations/20260225124449_create_chat_tables.sql
    - src/app/api/chat/session/route.ts
  modified:
    - src/types/database.ts
    - src/components/portal/PortalChat.tsx
    - src/app/api/chat/route.ts
    - src/lib/supabase/proxy.ts
    - src/lib/actions/auth.ts
    - src/components/auth/login-form.tsx
    - src/app/(auth)/login/page.tsx

key-decisions:
  - "chat_messages INSERT policy uses WITH CHECK (not USING) — correct RLS pattern for INSERT rows"
  - "DB messages are display-only: Gemini context starts fresh each portal visit, no history reconstruction"
  - "Session freshness: 24h gap on updated_at triggers new session creation"
  - "Open redirect prevention: next param validated to start with / before redirect"
  - "Supabase types regenerated via CLI after migration to restore TypeScript type safety"

patterns-established:
  - "Pattern: saveMessages helper in chat route — side-effect save after Gemini response, no extra client call"
  - "Pattern: isLoadingSession guard — send button and sendMessage both disabled until session resolves"
  - "Pattern: next param chain — proxy sets it, login page reads async searchParams, form hidden input, action validates and redirects"

requirements-completed: [AITOOL-01, AITOOL-02, AITOOL-03, AITOOL-04]

# Metrics
duration: 6min
completed: 2026-02-25
---

# Phase 06 Plan 01: Conversation Persistence & Auth Redirect Summary

**chat_sessions + chat_messages tables with RLS, session load/create API, PortalChat history restore on mount, and /portal login redirect preservation**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-25T12:44:49Z
- **Completed:** 2026-02-25T12:50:49Z
- **Tasks:** 2
- **Files modified:** 8 (including 1 migration, 1 new route, 1 updated types)

## Accomplishments
- chat_sessions and chat_messages tables created in Supabase with correct RLS (session ALL policy; messages SELECT + INSERT WITH CHECK via EXISTS)
- GET /api/chat/session returns most recent session + messages or creates new session after 24h gap
- PortalChat loads previous messages on mount with loading spinner; send disabled until session ready
- Messages saved server-side in /api/chat/route after every exchange (user + assistant pair + updated_at bump)
- /portal auth redirect preserved: unauthenticated access redirects to /login?next=/portal, login redirects back to /portal

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chat tables and session API endpoint** - `8773cd8` (feat)
2. **Task 2: Wire PortalChat to load and save messages, and preserve /portal auth redirect** - `b6a3cf1` (feat)

## Files Created/Modified
- `supabase/migrations/20260225124449_create_chat_tables.sql` - Creates chat_sessions and chat_messages with indexes and RLS
- `src/app/api/chat/session/route.ts` - GET endpoint: loads or creates session, returns message history
- `src/types/database.ts` - Regenerated to include chat_sessions and chat_messages types
- `src/components/portal/PortalChat.tsx` - Added session loading on mount, loading spinner, sessionId in POST body
- `src/app/api/chat/route.ts` - Extract sessionId from body, saveMessages helper after each exchange
- `src/lib/supabase/proxy.ts` - Add next=pathname to unauthenticated redirect
- `src/lib/actions/auth.ts` - Read next from formData, validate starts with /, redirect accordingly
- `src/components/auth/login-form.tsx` - Accept redirectTo prop, render hidden next input
- `src/app/(auth)/login/page.tsx` - Async searchParams (Next.js 16 pattern), pass next to LoginForm

## Decisions Made
- Supabase types regenerated via `supabase gen types` after migration — TypeScript was blocking compilation until types reflected new tables
- Display-only DB history followed strictly: no Gemini history reconstruction from DB rows per RESEARCH.md Pitfall 1
- 24h session freshness threshold chosen per plan spec; consistent with daily usage pattern for field reps

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Regenerated Supabase TypeScript types after migration**
- **Found during:** Task 1 (session route TypeScript check)
- **Issue:** TypeScript compilation failed with `chat_sessions` not assignable — database.ts types predated the new migration
- **Fix:** Ran `supabase gen types typescript --project-id ntrliqzjbmhkkqhxtvqe > src/types/database.ts`
- **Files modified:** src/types/database.ts
- **Verification:** `npx tsc --noEmit` returned clean; all chat_sessions/chat_messages queries type-safe
- **Committed in:** 8773cd8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Type regeneration is a required infrastructure step after any new migration. No scope creep.

## Issues Encountered
- Remote Supabase migration history had two entries (20260223094929, 20260223131952) not in local migrations directory — ran `supabase migration repair --status reverted` before db push succeeded

## User Setup Required
None - no external service configuration required beyond existing Supabase setup.

## Next Phase Readiness
- Persistence infrastructure complete; Phase 6 Plan 02 (write tools + confirmation flow) can proceed
- sessionId flows from PortalChat state to /api/chat body — confirm route can read it from request
- No blockers

## Self-Check: PASSED

Files confirmed present:
- FOUND: src/app/api/chat/session/route.ts
- FOUND: supabase/migrations/20260225124449_create_chat_tables.sql
- FOUND: src/types/database.ts (with chat_sessions + chat_messages types)

Commits confirmed:
- FOUND: 8773cd8 feat(06-01): create chat tables and session API endpoint
- FOUND: b6a3cf1 feat(06-01): wire PortalChat persistence and preserve /portal auth redirect

---
*Phase: 06-conversation-persistence-ai-write-tools*
*Completed: 2026-02-25*
