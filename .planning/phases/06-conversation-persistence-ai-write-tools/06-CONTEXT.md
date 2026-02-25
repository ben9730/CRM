# Phase 6: Conversation Persistence & AI Write Tools - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Field reps can take real CRM actions from the /portal chat — creating contacts, creating deals, completing tasks, and getting daily briefings — with conversation messages persisted to Supabase so history survives across sessions. This phase does NOT include browsing past sessions, search/filtering within history, or quick action buttons (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Confirmation flow
- No undo button on confirmation cards — user can edit/delete from CRM if needed
- Unrecognized commands get a simple response listing available capabilities

### Conversation storage
- Session-based threads, not one continuous stream
- On return to /portal, only the current/most recent session loads
- Past sessions are stored in Supabase but NOT browsable in this phase (future capability)
- Current session only visible; no session list/drawer UI

### Daily briefing
- Three sections: overdue tasks, tasks due today, deals closing soon (no recent activity section)
- One-liner per item — task name + due date, deal name + value + close date (scannable on mobile)
- Counts/totals header at the top (e.g., "3 overdue, 5 due today, 2 deals closing this week")

### Error & edge cases
- When a referenced org/contact doesn't exist, report "not found" — do NOT offer to create cascading records
- Unrecognized commands: simple "I didn't understand that. I can create contacts, deals, complete tasks, or give a daily briefing."

### Claude's Discretion
- Preview + confirm vs. create immediately (confirmation card approach per write tool)
- Confirmation card detail level per record type (minimal vs summary)
- Fuzzy vs exact matching for task completion
- Session trigger mechanism (time gap, page visit, or manual button)
- Ambiguous name handling (show matches vs pick best match)
- Duplicate contact detection behavior
- Empty briefing section messaging (positive message vs skip section)

</decisions>

<specifics>
## Specific Ideas

- After login from /portal route, redirect back to /portal — not to the dashboard. The auth flow should preserve the intended destination.
- Briefing should feel quick and glanceable on a phone screen — one-liner density is key.

</specifics>

<deferred>
## Deferred Ideas

- Browsable past session history (session list sidebar) — future phase or backlog
- Recent activity section in daily briefing — could add later if needed

</deferred>

---

*Phase: 06-conversation-persistence-ai-write-tools*
*Context gathered: 2026-02-25*
