---
phase: 07-mobile-ux-polish
plan: 02
subsystem: ui
tags: [react, supabase, rls, next-api, mobile, tailwind]

# Dependency graph
requires:
  - phase: 06-conversation-persistence-ai-write-tools
    provides: chat_sessions and chat_messages tables, /api/chat/session, PortalChat component
  - phase: 07-01
    provides: quick action pills, iOS keyboard fix, sendMessage refactor
provides:
  - ChatWidget loads shared session from /api/chat/session on open (same history as PortalChat)
  - ChatWidget hidden on mobile screens below md:768px breakpoint
  - /api/chat/clear DELETE endpoint: deletes messages+session, returns fresh sessionId
  - DELETE RLS policy on chat_messages allowing users to delete their own
  - Clear chat button (RotateCcw) in PortalChat header with ConfirmDialog confirmation
affects: [portal, chat-widget, chat-api, mobile-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Session lazy-load: ChatWidget fetches /api/chat/session only when isOpen becomes true (not on mount)"
    - "Mobile hide via Tailwind: hidden md:flex on both panel and floating button hides widget below 768px"
    - "Clear chat: DELETE endpoint deletes messages then session, creates fresh session, returns new sessionId"
    - "ConfirmDialog for destructive actions: always require explicit confirmation before irreversible deletes"

key-files:
  created:
    - supabase/migrations/20260225162934_add_chat_messages_delete_policy.sql
    - src/app/api/chat/clear/route.ts
  modified:
    - src/components/chat/ChatWidget.tsx
    - src/components/portal/PortalChat.tsx

key-decisions:
  - "ChatWidget isLoadingSession starts false (not true) — session only needed when widget opens, not on page mount"
  - "Verify session ownership via SELECT with user_id filter before DELETE — belt-and-suspenders on top of RLS"
  - "Delete messages then session (not cascade) — explicit order to avoid FK constraint violation"
  - "PortalChat header replaced absolute back link with flex row — cleans up layout, enables clear button placement"
  - "ChatWidget floating button and panel both use hidden md:flex — single breakpoint, consistent behavior"
  - "Powered by AI text (not Groq or Gemini) — provider-agnostic label survives future provider migrations"

patterns-established:
  - "Lazy session loading: fetch session only when component becomes visible/active, not eagerly on mount"
  - "Mobile widget hide: hidden md:flex pattern on both trigger and panel for consistent breakpoint behavior"

requirements-completed: [PUX-01]

# Metrics
duration: 10min
completed: 2026-02-25
---

# Phase 7 Plan 02: Mobile UX Polish — Clear Chat + Shared Session + Mobile Hide Summary

**ChatWidget shares PortalChat session history, hidden on mobile via hidden md:flex, with DELETE RLS + /api/chat/clear endpoint and PortalChat RotateCcw clear button backed by ConfirmDialog**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-25T16:29:18Z
- **Completed:** 2026-02-25T16:39:00Z (plus checkpoint approval wait)
- **Tasks:** 3 (2 auto + 1 human-verify checkpoint)
- **Files modified:** 4

## Accomplishments
- Added DELETE RLS policy on chat_messages so users can delete their own conversation history
- Created /api/chat/clear DELETE endpoint that wipes messages+session and returns a fresh sessionId
- ChatWidget now loads from /api/chat/session on first open, sharing history with PortalChat
- ChatWidget hidden on mobile (below md:768px) — users directed to /portal instead
- PortalChat header redesigned as flex row with Back link + RotateCcw clear button; clear triggers ConfirmDialog

## Task Commits

Each task was committed atomically:

1. **Task 1: Add DELETE RLS policy, clear chat API route, and ChatWidget shared session with mobile hide** - `ba3b25b` (feat)
2. **Task 2: Add clear chat button with confirmation dialog to PortalChat** - `eb43c2c` (feat)
3. **Task 3: Human verify** - checkpoint approved, no code changes

**Plan metadata commit:** (docs: see final commit below)

## Files Created/Modified
- `supabase/migrations/20260225162934_add_chat_messages_delete_policy.sql` - DELETE RLS policy on chat_messages via session ownership check
- `src/app/api/chat/clear/route.ts` - DELETE endpoint: verify ownership, delete messages + session, create fresh session
- `src/components/chat/ChatWidget.tsx` - Session lazy-load on open, sessionId passed to /api/chat, hidden md:flex on panel + button, spinner while loading, "Powered by AI" text
- `src/components/portal/PortalChat.tsx` - Flex header with Back link + RotateCcw button, handleClearChat, showClearConfirm state, ConfirmDialog at bottom

## Decisions Made
- `isLoadingSession` starts `false` in ChatWidget (not `true`) — session is fetched lazily only when widget opens; PortalChat starts `true` since it always needs the session immediately on mount
- Session ownership verified via explicit SELECT with `user_id` filter before DELETE — belt-and-suspenders over RLS
- Delete messages first, then session — explicit ordering avoids any FK timing issues
- PortalChat absolute back link replaced with in-flow flex header — cleaner layout, enables second button placement, removes pt-14 padding hack
- Label updated to "Powered by AI" (not "Groq" or "Gemini") — provider-agnostic, survives future migrations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TypeScript compiled cleanly on first pass. Production build succeeded. All 5 human-verify checks passed.

## User Setup Required

None - no external service configuration required beyond the Supabase migration (automatically applied via `npx supabase db push`).

## Next Phase Readiness

Phase 7 is now complete. The portal is ready for daily field use:
- Quick action pills (Plan 01) + iOS keyboard fix (Plan 01)
- Shared session + mobile hide + clear chat (Plan 02)
- All 5 real-device/browser checks verified by user

v1.1 milestone (Team Command Portal) is complete.

---
*Phase: 07-mobile-ux-polish*
*Completed: 2026-02-25*
