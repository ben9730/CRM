---
phase: 07-mobile-ux-polish
plan: 01
subsystem: ui
tags: [react, tailwind, nextjs, mobile, ios, portal, chat]

# Dependency graph
requires:
  - phase: 06-conversation-persistence-ai-write-tools
    provides: PortalChat component with pendingAction pattern, sessionId, sendMessage
provides:
  - Quick action pill chips always visible above portal chat textarea
  - textOverride parameter on sendMessage avoiding setState race condition
  - interactiveWidget viewport setting for iOS Safari keyboard fix
affects: [07-02-mobile-ux-polish, portal-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "textOverride parameter pattern: pass message text directly to sendMessage() to avoid setState async race condition"
    - "scrollbar-none utility: added to globals.css for Tailwind v4 (not included by default)"

key-files:
  created: []
  modified:
    - src/components/portal/PortalChat.tsx
    - src/app/layout.tsx
    - src/app/globals.css

key-decisions:
  - "sendMessage accepts optional textOverride to avoid setState race: use (textOverride ?? input).trim(), only clear input when !textOverride"
  - "Quick action pill row is ALWAYS visible — not conditional on message history, loading state, or typing"
  - "Send button onClick changed from onClick={sendMessage} to onClick={() => sendMessage()} to avoid MouseEvent/string type conflict"
  - "interactiveWidget: resizes-content shrinks layout viewport when keyboard opens, keeping input field visible"
  - "scrollbar-none added as custom CSS to globals.css — not available in Tailwind v4 by default"

patterns-established:
  - "Quick action chips: QUICK_ACTIONS array constant above component, pills inside input area wrapper, horizontally scrollable"

requirements-completed: [PUX-01]

# Metrics
duration: 2min
completed: 2026-02-25
---

# Phase 7 Plan 01: Mobile UX Polish Summary

**Quick action pill buttons (My Tasks, Daily Briefing, Add Task, Add Contact) always visible above portal chat textarea, plus interactiveWidget viewport fix for iOS Safari keyboard**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-25T16:22:35Z
- **Completed:** 2026-02-25T16:24:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Added 4 quick action pill buttons above the portal chat textarea — always visible, single-tap to send
- Refactored sendMessage to accept optional textOverride parameter, eliminating async setState race condition
- Added interactiveWidget: "resizes-content" to root layout viewport — iOS Safari keyboard now shrinks content instead of covering input
- Added scrollbar-none CSS utility to globals.css for Tailwind v4 compatibility
- Fixed send button onClick from direct function reference to arrow function to satisfy TypeScript MouseEvent/string type compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Add quick action pill buttons with refactored sendMessage** - `a0b3059` (feat)
2. **Task 2: Add interactiveWidget viewport setting for iOS Safari keyboard** - `dea4702` (feat)

**Plan metadata:** (pending — created with docs commit)

## Files Created/Modified
- `src/components/portal/PortalChat.tsx` - Added QUICK_ACTIONS constant, refactored sendMessage with textOverride, rendered pill chip row above textarea, fixed send button onClick arrow function
- `src/app/layout.tsx` - Added interactiveWidget: "resizes-content" to viewport export
- `src/app/globals.css` - Added scrollbar-none CSS utility (scrollbar-width: none + ::-webkit-scrollbar: display: none)

## Decisions Made
- send button changed from `onClick={sendMessage}` to `onClick={() => sendMessage()}` — TypeScript rejects direct reference because sendMessage's optional string parameter conflicts with MouseEvent parameter type
- scrollbar-none is not included in Tailwind v4 by default (was a plugin in v3) — added as plain CSS in globals.css
- interactiveWidget fully supported in Next.js Viewport type — no ts-expect-error suppression needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed send button onClick type conflict**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** sendMessage now accepts optional string parameter, causing TS2322 error when used directly as onClick (MouseEvent not assignable to string)
- **Fix:** Changed `onClick={sendMessage}` to `onClick={() => sendMessage()}` — arrow wrapper preserves no-arg call behavior
- **Files modified:** src/components/portal/PortalChat.tsx
- **Verification:** npx tsc --noEmit — clean output
- **Committed in:** a0b3059 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary correctness fix — plan specified refactoring sendMessage signature but didn't note the onClick consequence. No scope creep.

## Issues Encountered
None beyond the send button type fix above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Quick action pills and iOS keyboard fix are complete — portal UX is noticeably more mobile-friendly
- Phase 7 Plan 02 can proceed with remaining mobile UX polish items
- Real device testing on iOS Safari recommended to verify interactiveWidget behavior

---
*Phase: 07-mobile-ux-polish*
*Completed: 2026-02-25*

## Self-Check: PASSED

- FOUND: src/components/portal/PortalChat.tsx
- FOUND: src/app/layout.tsx
- FOUND: src/app/globals.css
- FOUND: .planning/phases/07-mobile-ux-polish/07-01-SUMMARY.md
- FOUND commit: a0b3059 (Task 1 — quick action pill buttons)
- FOUND commit: dea4702 (Task 2 — interactiveWidget viewport)
