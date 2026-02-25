---
phase: 05-portal-foundation-api-safety
plan: 02
subsystem: portal-ui
tags: [portal, react-markdown, remark-gfm, mobile-first, chat-ui, route-group]

# Dependency graph
requires:
  - phase: 05-portal-foundation-api-safety
    plan: 01
    provides: Structured 429 rate limit response with rateLimited flag and friendlyMessage; viewport-fit=cover

provides:
  - src/app/(portal)/layout.tsx — Minimal portal layout with no AppShell, ChatWidget, or Toaster
  - src/app/(portal)/portal/page.tsx — Portal page rendering PortalChat at /portal
  - src/components/portal/PortalChat.tsx — Full-page h-dvh chat client with bubble messages, rate limit handling, and spinner
  - src/components/portal/PortalMessage.tsx — Bubble component with react-markdown for assistant messages
  - AI Chat nav item in CRM sidebar linking to /portal

affects:
  - 05-portal-foundation-api-safety (Plan 03 persistence builds on this UI)
  - 06-ai-tools (portal is the primary interface for tool-call interactions)

# Tech tracking
tech-stack:
  added:
    - react-markdown@10.x — markdown rendering in chat bubbles
    - remark-gfm — GitHub Flavored Markdown plugin (tables, strikethrough, task lists)
  patterns:
    - (portal) route group pattern — sibling to (app) and (auth); strips group name from URL, provides isolated layout
    - h-dvh flex-col chat layout — prevents iOS keyboard overlap without position:fixed anti-pattern
    - Structured rate limit bubble — renders friendlyMessage as assistant bubble on data.rateLimited === true

key-files:
  created:
    - src/app/(portal)/layout.tsx
    - src/app/(portal)/portal/page.tsx
    - src/components/portal/PortalChat.tsx
    - src/components/portal/PortalMessage.tsx
  modified:
    - src/components/layout/app-sidebar.tsx
    - package.json (react-markdown, remark-gfm added)

key-decisions:
  - "(portal) route group as sibling to (app) — portal gets its own layout with no sidebar or ChatWidget; auth gate is free via proxy.ts"
  - "h-dvh + flex-col layout for iOS keyboard compat — no position:fixed; input area pinned via flex push, not absolute"
  - "Rate limit errors rendered as assistant chat bubbles — never thrown as JS errors or shown as raw text"
  - "Empty state is just the input field — no greeting text, no suggestion chips (locked decision from CONTEXT.md)"
  - "Loading indicator is Loader2 spinner in assistant bubble position — not typing dots (locked decision)"
  - "Back navigation is subtle ChevronLeft to /dashboard — absolute positioned top-left, non-intrusive"
  - "Max 50 messages in portal UI vs 20 in ChatWidget — portal has more screen real estate"
  - "react-markdown code block detection via !!className (react-markdown v10 pattern)"

# Metrics
duration: 5min
completed: 2026-02-25
---

# Phase 5 Plan 02: Portal Chat UI Summary

**Full-page /portal chat with h-dvh mobile layout, bubble messages, react-markdown rendering, and CRM sidebar link**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-25T11:11:25Z
- **Completed:** 2026-02-25T11:16:30Z
- **Tasks:** 3
- **Files modified:** 5 (+ package.json, package-lock.json)

## Accomplishments

- Created `(portal)` route group with minimal layout (no AppShell, no ChatWidget, no Toaster) — navigating to `/portal` renders full-page chat with no CRM chrome
- Created `src/components/portal/PortalMessage.tsx` — bubble-style message component using `react-markdown` + `remark-gfm` for styled markdown rendering in assistant messages (bold, lists, headers, code blocks)
- Created `src/components/portal/PortalChat.tsx` — full-page chat client with `h-dvh` flex-col layout for iOS keyboard compatibility, rate limit handling as friendly chat bubbles, Loader2 spinner, and `safe-area-inset-bottom` padding for iPhone home bar
- Updated `src/components/layout/app-sidebar.tsx` to include "AI Chat" nav item with Bot icon linking to `/portal`
- `npm run build` passes with zero errors; `/portal` appears in the route manifest

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create portal route group** - `38e3ef3` (feat)
2. **Task 2: Build portal chat UI components with markdown rendering** - `cb4e4d6` (feat)
3. **Task 3: Add AI Chat link to CRM sidebar** - `b57bfd3` (feat)

## Files Created/Modified

- `src/app/(portal)/layout.tsx` — Minimal layout: `<>{children}</>` only; isolates portal from CRM chrome
- `src/app/(portal)/portal/page.tsx` — Server component with metadata; renders `<PortalChat />`
- `src/components/portal/PortalChat.tsx` — Full-page chat client; h-dvh flex-col; rate limit bubble handling; spinner; back nav
- `src/components/portal/PortalMessage.tsx` — Bubble component; user right (bg-primary), assistant left (bg-muted/50); react-markdown with custom components
- `src/components/layout/app-sidebar.tsx` — Added Bot icon import and AI Chat nav item

## Decisions Made

- Route group `(portal)` used as sibling to `(app)` — cleanest isolation; `/portal` URL comes from the nested `portal/` folder, not the group name
- `h-dvh` (dynamic viewport height) used instead of `100vh` — shrinks when iOS virtual keyboard appears, keeping input above keyboard without position:fixed
- Rate limit: `data.rateLimited === true` check fires before `!res.ok` — friendly bubble shown instead of error state
- Back navigation: subtle absolute-positioned ChevronLeft, not a header bar — stays out of the way on mobile
- `markdownComponents` code detection: `!!className` identifies block code (react-markdown v10 gives block code a `language-*` className)

## Deviations from Plan

None - plan executed exactly as written. The PortalChat stub created in Task 1 was replaced by the full implementation in Task 2 as expected.

## Issues Encountered

None — TypeScript compiled clean after all tasks. Full `npm run build` succeeded with zero errors. `/portal` route appears as static in the build output.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/portal` is live and accessible to authenticated users; unauthenticated users are redirected to `/login` via proxy.ts
- `PortalChat` POSTs to `/api/chat` with `{ message, history }` and handles `rateLimited` response from Plan 01
- Plan 03 can extend `PortalChat` with conversation persistence — the message state and geminiHistory structure are in place
- The CRM sidebar provides navigation to the portal for field sales reps

## Self-Check: PASSED
