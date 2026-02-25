# Phase 5: Portal Foundation & API Safety - Context

**Gathered:** 2026-02-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a full-page AI chat interface at `/portal` for field sales reps on mobile. Includes Supabase auth gate, mobile-first layout, markdown rendering, Gemini rate limit protection, hiding the existing floating chat widget on /portal, and extracting tool definitions to a shared module. Conversation persistence and write tools (create contact, create deal, etc.) are Phase 6. Quick action buttons and iOS polish are Phase 7.

</domain>

<decisions>
## Implementation Decisions

### Chat interface design
- Bubble style messages: user messages as colored bubbles on the right, AI responses as lighter bubbles on the left (iMessage/WhatsApp pattern)
- No header bar — full-screen chat experience on all devices, maximizing chat space
- Empty state is just the input field — no greeting, no suggestion chips, no prompts. Clean and fast
- Loading indicator: spinner in the message area while waiting for AI response (not typing dots)

### Portal navigation
- Entry point: sidebar link in the CRM navigation (labeled "Portal" or "AI Chat")
- Direct bookmark access supported — users can save /portal to their phone home screen and open it directly. Auth gate still applies
- Back-to-CRM navigation approach: Claude's discretion (subtle back icon vs browser back)
- Portal layout (separate vs sidebar on desktop): Claude's discretion based on codebase patterns

### Rate limit experience
- Tone: casual and friendly — e.g., "I'm taking a breather — try again in a minute"
- Not alarmist, not robotic. Match the conversational feel of the chat

### Claude's Discretion
- Chat input area design (floating bar vs expanding textarea — optimize for mobile)
- Rate limit countdown vs static message
- Rate limit message placement (chat bubble vs toast/banner)
- Input behavior during rate limit (disabled vs allow typing)
- Code block rendering (syntax highlighting vs simple monospace)
- Markdown formatting richness (rich vs subtle)
- Streaming behavior (word-by-word vs all-at-once)
- Back-to-CRM navigation implementation
- Portal layout on desktop (full-screen vs sidebar)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The overall direction is: minimal, immersive, phone-first. The portal should feel like opening a messaging app, not like navigating a CRM.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-portal-foundation-api-safety*
*Context gathered: 2026-02-25*
