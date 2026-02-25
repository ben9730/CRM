# Phase 7: Mobile UX Polish - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the /portal ready for daily field use on iPhone. Add quick action buttons for one-tap commands, validate iOS Safari behavior, clean up ChatWidget visibility, add chat clearing, and ensure shared sessions between widget and portal.

</domain>

<decisions>
## Implementation Decisions

### Quick Action Buttons
- 4 buttons: "My Tasks", "Daily Briefing", "Add Task", "Add Contact"
- Layout: horizontal pill chips in a row above the chat input (WhatsApp suggested-replies style)
- Tap behavior: sends the command immediately — message appears in chat as if typed, no extra step
- Visibility: always visible above the input, not hidden when typing or after first message

### ChatWidget Cleanup
- ChatWidget stays on desktop CRM pages only (dashboard, contacts, deals, etc.)
- Hidden on /portal route entirely (no floating widget overlap)
- Hidden on mobile — Claude's discretion on breakpoint (likely md:768px or lg:1024px based on layout)
- Sidebar link to /portal already exists — no changes needed

### Shared Session
- ChatWidget on desktop and /portal share the same chat session and history
- User sees the same conversation regardless of which interface they use

### Chat Clearing
- Add a clear/reset chat button — Claude's discretion on placement (likely icon in chat header)
- Clear action: delete messages from Supabase DB + clear UI + start fresh session
- Should have a confirmation step before clearing

### Claude's Discretion
- iOS Safari keyboard/scroll behavior fixes (implementation details)
- ChatWidget mobile breakpoint choice
- Clear chat button placement and icon choice
- Quick action button styling details (colors, icons, spacing)

</decisions>

<specifics>
## Specific Ideas

- Quick action pills should feel like WhatsApp suggested replies — small, tappable, non-intrusive
- The portal should work seamlessly whether accessed from iPhone Safari or desktop CRM widget

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-mobile-ux-polish*
*Context gathered: 2026-02-25*
