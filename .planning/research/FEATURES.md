# Feature Research

**Domain:** AI-Powered CRM Command Portal — Mobile-First Chat Interface for Field Sales Teams
**Milestone:** v1.1 Team Command Portal (added to existing HealthCRM)
**Researched:** 2026-02-25
**Confidence:** MEDIUM-HIGH (multi-source; UX patterns from industry analysis; specific Gemini tooling from codebase review)

---

## Context: What Already Exists

The base CRM (v1.0) is complete and running. This research is scoped **only to new portal features**. The existing floating ChatWidget at `/` routes (all CRM pages) already provides:

- Floating bubble button → 350px wide panel (not full page)
- In-memory conversation history (lost on page refresh — stored in React state only)
- 7 function tools: `get_urgent_tasks`, `get_all_tasks`, `get_pipeline_status`, `get_analytics`, `create_task`, `get_contacts`, `get_recent_activity`
- Plain text responses rendered with `whitespace-pre-wrap` (no markdown, no rich cards)
- 3 static suggestion chips shown only on empty state ("Show urgent tasks", "Pipeline status", "Recent activity")
- Gemini 2.5 Flash with multi-turn history passed in request body (not persisted to DB)

The portal at `/portal` is **a new full-page experience** for field use, not a modification of the existing widget.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that must exist for the portal to feel like a real product, not a demo. Field sales reps using this on their phone will bounce immediately if these are missing.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Full-page chat layout | Users expect a portal to fill the screen, not be a floating widget; the word "portal" implies a dedicated space | LOW | New route `/portal`; full viewport height; no sidebar needed; mobile-first layout |
| Persistent conversation history across sessions | Modern chat apps (WhatsApp, Slack, ChatGPT) always persist history; losing chat on refresh is jarring and kills trust | MEDIUM | Requires DB table (`chat_sessions`, `chat_messages`); load on mount; save on each exchange; scoped to `user_id` |
| Message rendering with markdown/formatting | Responses from Gemini already contain emoji, bold, lists; rendering as `whitespace-pre-wrap` raw text looks unfinished; users expect formatted output | LOW | Replace plain `div` with a markdown renderer; `react-markdown` or custom parser for the subset actually returned (bold, lists, emoji) |
| Send on Enter, Shift+Enter for newline | Universal keyboard expectation in chat UIs; already exists in widget but must be preserved in full-page | LOW | Already implemented in ChatWidget; replicate in portal input |
| Loading/thinking indicator | Without feedback, users assume the app froze; every AI chat product shows a typing indicator or spinner | LOW | Already implemented in widget as `Loader2` spinner; portal should use a more prominent "typing" animation |
| Error states with retry | Network errors, API quota errors, and Gemini failures happen; users need to see what went wrong and be able to retry | LOW | Already partially implemented; expand to show error as a styled message with retry option |
| Auth gate | Portal is for registered CRM users only; unauthenticated access must redirect to login | LOW | Existing Supabase auth infrastructure handles this; add auth check to `/portal` route |
| Mobile-friendly input area | On mobile, the input must stay above the keyboard; fixed-bottom input with proper `padding-bottom` or `env(safe-area-inset-bottom)` | MEDIUM | CSS challenge on iOS Safari; keyboard pushes viewport; requires `dvh` units or JS scroll management |
| Scroll to bottom on new message | Standard chat behavior; without it the user sees old messages while AI responds | LOW | Already in widget; replicate |

Sources:
- [UX for AI Chatbots: Complete Guide (2026)](https://www.parallelhq.com/blog/ux-ai-chatbots)
- [16 Chat UI Design Patterns That Work in 2025](https://bricxlabs.com/blogs/message-screen-ui-deisgn)
- [Building Stateful Conversations with Postgres and LLMs](https://medium.com/@levi_stringer/building-stateful-conversations-with-postgres-and-llms-e6bb2a5ff73e)

---

### Differentiators (Competitive Advantage)

Features that make this portal genuinely useful in the field — beyond what a plain chat window provides.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Expanded AI tools (create contact, create deal, complete task, search) | The existing widget has 7 read-heavy tools; field reps need to **take action**, not just view data; "just created a contact, logged a call, added a task" in one chat session is the core value | MEDIUM | Add to `/api/chat` tool declarations: `create_contact`, `create_deal`, `complete_task`, `search_contacts`, `search_deals`, `get_deal_detail`; each requires Supabase write operations with proper `account_id` and `created_by` |
| Rich action confirmation cards | Plain text "Task created" is weak; a card showing the created record (title, due date, priority badge, link to full CRM) builds confidence the action worked | MEDIUM | Requires: (1) API returns structured metadata alongside text response, OR (2) parse AI response for known action signals; display as styled card component below the message |
| Daily briefing command | One tap to get today's game plan: overdue tasks, tasks due today, deals needing attention (stale or closing soon), recent activity summary | MEDIUM | New tool `get_daily_briefing` that aggregates data from multiple tables; AI synthesizes into an actionable briefing format; designed to be triggered via quick action button |
| Quick action buttons | Persistent row of 1-tap buttons above the input (not just on empty state); most common operations without typing; critical for mobile where typing is friction | LOW | 4-6 buttons: "My tasks", "Pipeline", "Briefing", "Add task", "Urgent"; always visible (not just on empty state); tapping sends the command immediately |
| Context-aware suggestion chips | After an action (e.g., created a contact), suggest natural next steps ("Add a deal for this contact?", "Log a note?"); reduces cognitive load in the field | MEDIUM | Requires AI or deterministic logic to propose chips based on last action type; simpler: fixed suggestion sets keyed to tool call names |
| Conversation history sidebar / session management | Users want to review what they did last session; see yesterday's briefing; pick up a thread | HIGH | Full session management UI (list of past sessions, start new session, name sessions); adds significant complexity; consider deferring to v2 if timeline is tight |

Sources:
- [How to Integrate AI Agents with CRM - 2025](https://www.aalpha.net/blog/how-to-integrate-ai-agents-with-crm/)
- [20+ GenAI UX patterns, examples and implementation tactics](https://uxdesign.cc/20-genai-ux-patterns-examples-and-implementation-tactics-5b1868b7d4a1)
- [Design Patterns For AI Interfaces — Smashing Magazine](https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/)
- [Innovative Chat UI Design Trends 2025](https://multitaskai.com/blog/chat-ui-design/)

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time multi-user chat / shared portal session | "Team command center" sounds collaborative; reps want to see each other's actions | Supabase Realtime WebSocket management, conflict resolution for concurrent AI tool calls, significant complexity for 1-5 users; explicitly deferred in PROJECT.md | Each user has their own chat session; actions write to shared CRM data (contacts, deals, tasks) which is visible to all in the main CRM |
| Voice input | Natural for field use (driving between sites) | iOS Safari mic permissions + speech-to-text accuracy + background noise in hospitals = unreliable; adds testing surface area; explicitly deferred in PROJECT.md | Text input on mobile is sufficient for v1; defer voice to v2 |
| AI response streaming / token streaming | ChatGPT-style streaming feels modern and snappy | Gemini 2.5 Flash with function calling requires completing the full function call loop before streaming the final response; streaming + tool calls is significantly more complex than it appears; wrong architecture choice for this use case | Show "Thinking..." indicator during processing; return complete response; streaming is a v2 polish item |
| Conversation naming / AI-generated titles | Users might want to name their sessions | Adds UI complexity (edit modal, rename flow) with low utility for a work tool; users don't search past sessions by name | Timestamp-based session display (e.g., "Today 9:41 AM") is sufficient |
| Markdown editor in input | Power users might want to format messages they send | CRM assistants work with plain language commands; formatting input has near-zero utility; adds toolbar complexity | Plain textarea only |
| Separate portal authentication / Google SSO | Portal-specific login seems like a convenience | PROJECT.md explicitly decided: portal uses existing Supabase auth (email/password); adding OAuth adds surface area and complexity | Redirect to existing `/login` if unauthenticated |
| Push notifications for task reminders | "I want to be reminded" | Requires Service Worker, Web Push API, user permission flow, notification permission grant on mobile (notoriously flaky); low success rate in healthcare settings with locked-down corporate devices | In-portal daily briefing on login serves the same intent; defer push to v2 |

---

## Feature Dependencies

```
[Supabase Auth — existing]
    └──required by──> [Portal Route /portal]
    └──required by──> [Conversation History Persistence]

[Existing /api/chat Route — existing]
    └──extended by──> [New AI Tools (create_contact, create_deal, etc.)]
    └──extended by──> [Daily Briefing Tool]
    └──same route works for──> [Portal Chat UI]

[Conversation History Persistence]
    └──requires──> [New DB tables: chat_sessions + chat_messages]
    └──enables──> [Load history on mount]
    └──enables──> [Session continuation across devices]

[New AI Tools]
    └──enables──> [Rich Action Confirmation Cards]
    └──enables──> [Context-Aware Suggestion Chips]

[Quick Action Buttons]
    └──requires──> [Expanded AI Tools] (briefing, complete task need new tools)
    └──enhances──> [Portal UX] (not required for basic functionality)

[Rich Action Confirmation Cards]
    └──requires──> [New AI Tools] (cards confirm create/complete actions)
    └──requires──> [Structured metadata in API response]

[Daily Briefing Command]
    └──requires──> [New tool: get_daily_briefing]
    └──triggered by──> [Quick Action Buttons]

[Conversation History Sidebar]
    └──requires──> [Conversation History Persistence]
    └──conflicts with──> [Simple single-session design] (adds nav complexity)
```

### Dependency Notes

- **New tools must be built before quick action buttons can deliver on "Briefing" and "Complete task" buttons.** The 3 existing suggestion chips in the widget work because those tools already exist.
- **Action confirmation cards require API changes.** The current API returns only `response: string`. To render a card, the API must also return `action_metadata: { type, record }` or the frontend must detect action signals in the text response. API-side metadata is cleaner and more reliable.
- **Persistence is independent of tool expansion.** These can be built in parallel or sequenced; persistence does not depend on new tools.
- **The portal route itself has no dependencies beyond auth.** A minimal `/portal` page with the existing 7 tools is shippable without any new backend work. New tools and persistence stack on top.

---

## MVP Definition for v1.1 Portal

### Launch With (Portal v1.1 — this milestone)

What must ship for the portal to be genuinely useful to a field rep.

- [ ] **Full-page portal route at `/portal`** — mobile-first layout, full viewport, no sidebar, persistent bottom input; auth-gated
- [ ] **Formatted message rendering** — markdown support (bold, lists, emoji); replaces raw `whitespace-pre-wrap`; makes AI responses readable on mobile
- [ ] **Persistent conversation history** — messages saved to Supabase per user; loaded on mount; survives page refresh and session end
- [ ] **Expanded AI tools — write operations** — `create_contact` (name, title, email, phone, org), `create_deal` (title, value, stage, linked org), `complete_task` (by ID from a list), `search_deals` (by stage or keyword); essential for field reps who need to do work, not just view data
- [ ] **Daily briefing tool** — `get_daily_briefing` aggregates: overdue tasks count + list, tasks due today, deals with no activity in 14+ days, deals closing in next 7 days; AI synthesizes into a morning summary
- [ ] **Rich action confirmation cards** — after `create_*` and `complete_task` tool calls, render a card component (not just text) showing the created/modified record with key fields and a link to the full CRM record
- [ ] **Quick action buttons** — persistent row above input: "My tasks", "Urgent", "Pipeline", "Briefing", "Add task"; sends command immediately on tap; always visible, not just on empty state

### Add After Validation (v1.1.x)

- [ ] **Context-aware suggestion chips** — after each AI action, show 2-3 relevant next steps as tappable chips; reduces friction for multi-step workflows in the field
- [ ] **Session history list** — show past sessions in a slide-in panel; tap to resume; useful for reviewing yesterday's briefing

### Future Consideration (v2+)

- [ ] **Voice input** — speech-to-text for hands-free field use; deferred due to mobile API complexity
- [ ] **AI response streaming** — token-by-token streaming for perceived speed; requires architectural change to how function calling loops work
- [ ] **Real-time shared portal** — Supabase Realtime so two reps see each other's actions in shared context; deferred per PROJECT.md
- [ ] **Push notifications** — task due reminders via Web Push; deferred due to Service Worker complexity
- [ ] **Conversation export / summary** — export a session as a PDF or email; useful for account reviews

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Full-page portal route (`/portal`) | HIGH | LOW | P1 |
| Mobile-first layout (input above keyboard) | HIGH | MEDIUM | P1 |
| Formatted message rendering (markdown) | HIGH | LOW | P1 |
| Persistent conversation history (DB) | HIGH | MEDIUM | P1 |
| New write tools: `create_contact`, `create_deal` | HIGH | MEDIUM | P1 |
| New tool: `complete_task` | HIGH | LOW | P1 |
| New tool: `get_daily_briefing` | HIGH | MEDIUM | P1 |
| Quick action buttons (always visible) | HIGH | LOW | P1 |
| Rich action confirmation cards | MEDIUM | MEDIUM | P1 |
| `search_deals` tool | MEDIUM | LOW | P2 |
| Context-aware suggestion chips | MEDIUM | MEDIUM | P2 |
| Session history list (past sessions) | LOW | MEDIUM | P2 |
| Conversation naming | LOW | LOW | P3 |
| AI response streaming | MEDIUM | HIGH | P3 |
| Voice input | LOW | HIGH | P3 |

**Priority key:**
- P1: Must ship in v1.1 for the portal to replace ad-hoc "text the boss about my tasks" workflows
- P2: High value, add in the same sprint if capacity allows
- P3: Future milestone or v2

---

## Competitor Feature Analysis

How enterprise AI CRM tools handle the patterns we're building:

| Pattern | HubSpot Breeze Copilot | Salesforce Einstein Copilot | Our Approach |
|---------|----------------------|---------------------------|--------------|
| Chat interface | Inline panel within CRM pages; not a dedicated route | Sidebar panel inside Salesforce record pages | Dedicated `/portal` route; full page; mobile-first |
| Function calling (write actions) | Yes — create records, update deals, draft emails | Yes — update records, run flows, generate content | Yes — create contact, create deal, complete task (scoped to what matters for field reps) |
| Action confirmation | Shows record card inline; links to full record | Shows structured result card within Einstein chat | Rich card component below message with key fields + deep link |
| Conversation persistence | Yes — history saved in HubSpot platform | Yes — session context maintained in Salesforce | Yes — Supabase `chat_messages` table per user |
| Quick actions / suggestions | Yes — context-sensitive action buttons after each response | Yes — suggested prompts based on record context | Quick action row (always visible); context chips after actions |
| Daily briefing | Yes — "Breeze Summary" on homepage | Yes — "My Day" view with AI summary | Explicit `get_daily_briefing` tool triggered by button |
| Mobile experience | Responsive web; native mobile app also available | Native Salesforce mobile app; web not mobile-first | Mobile-first web; no native app; fixed bottom input; touch targets ≥44px |
| Response formatting | Cards, badges, structured data output | Rich cards, clickable records | Markdown rendering + confirmation card components |
| Access control | Within HubSpot seat-based auth | Within Salesforce org auth | Existing Supabase email/password auth; same session |

Sources:
- [HubSpot AI: Breeze Features 2025](https://www.hubspot.com/products/artificial-intelligence)
- [How Einstein Copilot Is Revolutionizing Salesforce CRM for U.S. Businesses in 2025](https://www.techcronus.com/blog/einstein-copilot-is-transforming-salesforce-crm-in-2025/)
- [AI CRM Strategy 2026: A Must-have In New Year's Roadmap](https://makewebbetter.com/blog/ai-crm-strategy/)

---

## Mobile-First UX Requirements (Field Rep Context)

These are behavioral requirements, not just visual requirements. A field rep at a hospital checking between meetings has different constraints than a desktop user.

**Touch target minimums:**
- All interactive elements ≥44×44px (Apple HIG standard; WCAG 2.5.5 minimum 24×24px)
- Quick action buttons should be 48px tall minimum
- Input area must be reachable with thumb (bottom of screen placement)

**Keyboard management:**
- On iOS Safari, the virtual keyboard does not resize the viewport — it overlays it
- Use `dvh` (dynamic viewport height) or `window.visualViewport` listener to detect keyboard presence
- Input must remain visible above keyboard; message list must scroll to show latest message when keyboard is open
- Avoid fixed-height containers that break on keyboard open

**Text legibility:**
- Minimum 14px font size for message content (16px preferred to avoid iOS auto-zoom on focus)
- High-contrast AI message bubbles vs background (dark theme: white text on dark card)
- Avoid light gray text on white backgrounds for message metadata (timestamp, tool name)

**Loading feedback:**
- Field reps on hospital Wi-Fi or spotty LTE need clear loading states
- Show "Thinking..." with animation within 100ms of send
- On error, show retryable error message (not just "something went wrong")

**Quick action bar:**
- Horizontal scroll if more than 5 buttons; do not wrap to two rows (eats screen space)
- Active/pressed state must be visible (not subtle)

Sources:
- [The best mobile CRMs for 2025 (+ CRM mobile app must-haves)](https://www.insightly.com/blog/crm-mobile-app/)
- [SaaS CRM Trends 2025: AI, UI/UX, and the Future of Design](https://eseospace.com/blog/saas-crm-design-trends-for-2025/)
- [Chip UI Design: Best practices, Design variants & Examples](https://mobbin.com/glossary/chip)

---

## New AI Tools — Specification

These tools extend the existing `/api/chat` route (no new route needed). Each tool follows the existing `FunctionDeclaration` pattern.

### Write Tools (New in v1.1)

**`create_contact`**
- Parameters: `first_name` (required), `last_name` (required), `email`, `phone`, `title`, `organization_name` (used to look up org by name or create note)
- Returns: created contact record with `id` for confirmation card
- Dependency: `account_id` from `getAccountId()` — already available in `executeTool`

**`create_deal`**
- Parameters: `title` (required), `value` (number), `stage_name` (matched to pipeline stages table), `organization_name`
- Returns: created deal record with `id`, `stage`, `value`
- Dependency: `pipeline_stages` table lookup by name; falls back to first stage if name not recognized

**`complete_task`**
- Parameters: `task_id` (required — obtained from a prior `get_all_tasks` or `get_urgent_tasks` call), OR `task_title` (fuzzy match on incomplete tasks)
- Returns: updated task record confirming completion
- Note: Prefer `task_id` to avoid ambiguous matches; AI should call `get_all_tasks` first if user says "complete the Hadassah task"

**`search_deals`**
- Parameters: `query` (keyword search on deal title), `stage_name` (optional filter), `status` (active/won/lost)
- Returns: matching deals with `id`, `title`, `value`, `stage`, `organization`

### Briefing Tool (New in v1.1)

**`get_daily_briefing`**
- Parameters: none
- Returns: structured object with:
  - `overdue_tasks`: count + list of top 5 (title, due_date, priority)
  - `due_today`: count + list of tasks due today
  - `stale_deals`: deals with no interaction in 14+ days (title, stage, value, days_since_contact)
  - `closing_soon`: deals with close_date in next 7 days (title, value, stage)
  - `today_date`: for AI to reference in response
- AI synthesizes this into a morning briefing message; not formatted by the tool itself

---

## Database Schema for Conversation Persistence

New tables required (Supabase migration):

```sql
-- One session per user (or multiple named sessions in v2)
create table chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  account_id  uuid not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Individual messages within a session
create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz default now()
);

-- RLS: users can only see their own session messages
alter table chat_sessions enable row level security;
create policy "Users own sessions" on chat_sessions
  for all using (user_id = auth.uid());

alter table chat_messages enable row level security;
create policy "Users own messages" on chat_messages
  for all using (
    session_id in (
      select id from chat_sessions where user_id = auth.uid()
    )
  );
```

Note: The `gemini_history` (full Gemini turn history including function call parts) is **separate** from display messages. Storing the full Gemini history format enables exact conversation resumption. Consider storing it as JSONB on `chat_sessions` (updated after each exchange) rather than normalizing every Gemini turn part.

Sources:
- [Building Stateful Conversations with Postgres and LLMs](https://medium.com/@levi_stringer/building-stateful-conversations-with-postgres-and-llms-e6bb2a5ff73e)
- [Supabase Persistence for Agent Memory](https://github.com/VoltAgent/voltagent/issues/8)

---

## Sources

- [HubSpot AI — Breeze Features](https://www.hubspot.com/products/artificial-intelligence)
- [How Einstein Copilot Is Revolutionizing Salesforce CRM in 2025](https://www.techcronus.com/blog/einstein-copilot-is-transforming-salesforce-crm-in-2025/)
- [AI CRM Strategy 2026: A Must-have In New Year's Roadmap](https://makewebbetter.com/blog/ai-crm-strategy/)
- [UX for AI Chatbots: Complete Guide (2026)](https://www.parallelhq.com/blog/ux-ai-chatbots)
- [16 Chat UI Design Patterns That Work in 2025](https://bricxlabs.com/blogs/message-screen-ui-deisgn)
- [20+ GenAI UX patterns, examples and implementation tactics](https://uxdesign.cc/20-genai-ux-patterns-examples-and-implementation-tactics-5b1868b7d4a1)
- [Design Patterns For AI Interfaces — Smashing Magazine](https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/)
- [Innovative Chat UI Design Trends 2025](https://multitaskai.com/blog/chat-ui-design/)
- [Building Stateful Conversations with Postgres and LLMs](https://medium.com/@levi_stringer/building-stateful-conversations-with-postgres-and-llms-e6bb2a5ff73e)
- [Supabase Persistence for Agent Memory](https://github.com/VoltAgent/voltagent/issues/8)
- [The best mobile CRMs for 2025](https://www.insightly.com/blog/crm-mobile-app/)
- [SaaS CRM Trends 2025: AI, UI/UX, and the Future of Design](https://eseospace.com/blog/saas-crm-design-trends-for-2025/)
- [How to Integrate AI Agents with CRM - 2025](https://www.aalpha.net/blog/how-to-integrate-ai-agents-with-crm/)
- [Chip UI Design: Best practices, Design variants & Examples](https://mobbin.com/glossary/chip)
- [A complete guide to Salesforce Einstein AI features (2025)](https://www.eesel.ai/blog/salesforce-einstein-ai-features)

---

*Feature research for: Team Command Portal — AI Chat Interface for HealthCRM v1.1*
*Researched: 2026-02-25*
