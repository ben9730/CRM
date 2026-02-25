# Architecture Research

**Domain:** Team Command Portal — AI Chat Integration into HealthCRM
**Researched:** 2026-02-25
**Confidence:** HIGH (based on direct codebase inspection + Next.js/Supabase official patterns)

> This document covers the v1.1 milestone architecture: adding a full-page AI portal to the
> existing Next.js 16 App Router + Supabase + Gemini codebase. The foundation (v1.0) is already
> built and documented. This file focuses exclusively on integration decisions for the new milestone.

---

## Standard Architecture

### System Overview (v1.1 additions highlighted)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser (Client Layer)                           │
│  ┌──────────────────┐  ┌──────────────────────────────────────────────┐  │
│  │  Existing CRM UI │  │  [NEW] Portal Page (/portal)                 │  │
│  │  (App Shell +    │  │  ┌────────────────────────────────────────┐  │  │
│  │   ChatWidget     │  │  │  PortalChat (client component)         │  │  │
│  │   floating)      │  │  │  - Full-page layout (no sidebar)       │  │  │
│  │                  │  │  │  - Loads history from DB on mount      │  │  │
│  │                  │  │  │  - Quick action buttons                │  │  │
│  │                  │  │  │  - Rich message cards                  │  │  │
│  └──────────────────┘  │  └────────────────────────────────────────┘  │  │
│                         └──────────────────────────────────────────────┘  │
└───────────────┬──────────────────────────────┬──────────────────────────┘
                │  fetch POST /api/chat         │  fetch POST /api/chat
┌───────────────▼──────────────────────────────▼──────────────────────────┐
│                    Next.js Route Handler: /api/chat                       │
│  [MODIFIED] Shared API endpoint used by both ChatWidget and Portal       │
│  - Expanded tool set (new: create_contact, search_deals, daily_summary)  │
│  - [NEW] Optional: save conversation turn to Supabase                    │
│  - Source: src/app/api/chat/route.ts (extend in place)                   │
└─────────────────────────────────────┬────────────────────────────────────┘
                                       │ Supabase server client
┌──────────────────────────────────────▼───────────────────────────────────┐
│                    Supabase (Backend Layer)                                │
│  ┌────────────────────┐  ┌───────────────────────────────────────────┐   │
│  │  Existing tables   │  │  [NEW] chat_conversations table           │   │
│  │  tasks, contacts,  │  │  - id, user_id, title, created_at        │   │
│  │  deals, etc.       │  │  ┌────────────────────────────────────┐  │   │
│  │  (unchanged)       │  │  │  [NEW] chat_messages table         │  │   │
│  └────────────────────┘  │  │  - id, conversation_id, role,      │  │   │
│                           │  │    content, tool_calls, created_at │  │   │
│                           │  └────────────────────────────────────┘  │   │
│                           └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Status |
|-----------|----------------|--------|
| `src/app/(portal)/portal/page.tsx` | Server Component: auth check, load recent conversations, pass to client | NEW |
| `src/app/(portal)/layout.tsx` | Minimal layout: auth guard, no sidebar, no ChatWidget | NEW |
| `src/components/portal/PortalChat.tsx` | Client Component: full-page chat UI, history, quick actions | NEW |
| `src/components/portal/MessageRenderer.tsx` | Render markdown + rich action cards from AI responses | NEW |
| `src/components/portal/QuickActions.tsx` | Tap-to-send preset commands (my tasks, pipeline, add task) | NEW |
| `src/components/portal/ConversationSidebar.tsx` | List of saved conversations (desktop only) | NEW |
| `src/app/api/chat/route.ts` | POST handler: Gemini function calling. Extend with new tools + history save | MODIFIED |
| `src/lib/actions/chat.ts` | Server Actions: saveMessage, loadConversation, createConversation | NEW |
| `src/lib/queries/chat.ts` | Query functions: getConversations, getMessages | NEW |
| `src/components/chat/ChatWidget.tsx` | Floating widget (existing). Uses same /api/chat endpoint | UNCHANGED |
| `src/components/chat/ChatMessage.tsx` | Existing message component. Remains for widget use | UNCHANGED |

---

## Portal Route Placement Decision

### Decision: Portal inside `(app)` route group, with its own layout override

Place the portal page at `src/app/(app)/portal/page.tsx`. Do NOT create a separate route group.

**Rationale:**

The `(app)` route group enforces auth via its layout. Creating a separate `(portal)` group means
duplicating the auth guard pattern. The portal does need auth — it's the same Supabase session.

The visual difference (no sidebar, full-page) is solved by a **nested layout override**, not a
separate route group:

```
src/app/(app)/
├── layout.tsx          ← AppShell (sidebar + ChatWidget) — ALL (app) routes
├── dashboard/
├── contacts/
├── ...
└── portal/
    ├── layout.tsx      ← Portal layout override: no sidebar, no ChatWidget
    └── page.tsx        ← PortalPage (Server Component)
```

The `portal/layout.tsx` wraps children WITHOUT AppShell. Next.js resolves layouts by nesting —
`portal/layout.tsx` replaces `(app)/layout.tsx` for the `/portal` route only.

**Wait — this is wrong. Nested layouts stack, they do not replace.** The correct approach:

Option A (recommended): Keep portal inside `(app)`, but the `(app)/layout.tsx` is minimal (it
currently only adds AppShell, Toaster, ChatWidget). The portal page renders its own full-screen
div that visually overrides the shell. The sidebar collapses/hides via CSS on `/portal`.

Option B: Create `(portal)` route group at the same level as `(app)`, replicate auth check.

**Recommendation: Option A — Extend `(app)` layout to detect portal route.**

The `(app)/layout.tsx` already mounts AppShell. The simplest integration: the portal page
renders a full-screen positioned div that covers the shell layout. This avoids auth duplication.

**Alternative that works cleanly: Parallel route group.**

Actually, the cleanest solution uses a sibling `(portal)` route group with its own auth check:

```
src/app/
├── (auth)/             ← auth pages
├── (app)/              ← CRM pages (sidebar layout)
└── (portal)/           ← portal page (minimal layout)
    ├── layout.tsx      ← auth guard + portal-specific layout
    └── portal/
        └── page.tsx
```

The `(portal)/layout.tsx` replicates the auth guard pattern already used in `(app)/layout.tsx`:

```typescript
// src/app/(portal)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Toaster } from '@/components/ui/sonner'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div className="min-h-screen bg-background">
      {children}
      <Toaster position="bottom-center" theme="dark" />
    </div>
  )
}
```

**Final recommendation: Sibling `(portal)` route group.**

This is the correct approach because:
1. No sidebar, no ChatWidget — genuinely different layout, not a variant
2. Auth guard is two lines — not meaningful duplication
3. Clean separation: CRM shell vs portal shell
4. Portal URL is `/portal`, not `/portal/portal` — achieved by nesting `portal/` under `(portal)/`

---

## Conversation History DB Schema

### New Tables

```sql
-- Conversation sessions (one per chat thread)
CREATE TABLE chat_conversations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id   uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title        text,                        -- auto-generated from first message (first 60 chars)
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_conversations_user_idx ON chat_conversations(user_id, updated_at DESC);

-- Individual messages within a conversation
CREATE TABLE chat_messages (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role             text NOT NULL CHECK (role IN ('user', 'assistant')),
  content          text NOT NULL,           -- rendered text shown in UI
  gemini_parts     jsonb,                   -- raw Gemini response parts (for history reconstruction)
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_conversation_idx ON chat_messages(conversation_id, created_at ASC);

-- RLS Policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users see only their own conversations
CREATE POLICY "Users manage own conversations"
  ON chat_conversations FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users see messages in their own conversations
CREATE POLICY "Users manage own messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = chat_messages.conversation_id
        AND user_id = (SELECT auth.uid())
    )
  );
```

### Schema Design Rationale

- **`chat_conversations` / `chat_messages` split:** Allows listing past conversations without
  loading all messages. Supports a sidebar that shows "Yesterday: Pipeline review" without
  fetching the full transcript.

- **`gemini_parts jsonb` on messages:** Gemini's `chat.getHistory()` returns structured parts
  (including function call/response pairs). Storing this alongside the rendered `content` text
  allows conversation replay — the portal can reconstruct `history: []` to continue an old session
  by reading `gemini_parts` from the last N messages.

- **`title` auto-generated:** Set from the first user message (truncated to 60 chars) when the
  conversation is created. Simple, no LLM call needed for naming.

- **`account_id` on conversations:** Consistent with existing table pattern (tasks, contacts all
  have `account_id`). Required for multi-user team — all team members share one account.

- **No `updated_at` trigger required initially:** The portal updates `updated_at` on the
  conversation row when a new message is saved. A DB trigger can be added later.

---

## Expanding the Existing API Route vs Creating New

### Decision: Extend the existing `/api/chat/route.ts` in place

Do NOT create a separate `/api/portal/chat/route.ts`.

**Why:**

- Both ChatWidget and Portal send `POST /api/chat` with the same payload shape (`message`, `history`)
- Tool definitions are the same — the portal wants more tools, not different ones
- A second route handler duplicates: auth check, Gemini client init, tool loop, error handling
- Gemini rate limits apply per API key regardless of which endpoint calls it

**What changes in `/api/chat/route.ts`:**

1. Add new `FunctionDeclaration` entries to the `tools` array
2. Add new `case` entries to `executeTool`
3. Accept optional `conversation_id` in the request body
4. If `conversation_id` is present, save the turn (user message + assistant response) to Supabase

```typescript
// Modified POST handler signature (conceptual)
const { message, history, conversation_id } = await request.json()

// ... existing Gemini logic ...

const text = response.text()

// Persist turn if caller supplied a conversation_id
if (conversation_id) {
  await saveTurn(supabase, conversation_id, message, text, updatedHistory)
}

return NextResponse.json({ response: text, history: updatedHistory })
```

**ChatWidget** continues sending requests with no `conversation_id` — behavior unchanged, no DB writes.

**Portal** sends `conversation_id` with every message — turns are saved automatically.

---

## Sharing Tool Definitions

### Decision: Keep tools defined in the API route; extract to a separate module

Currently all `FunctionDeclaration[]` and `executeTool()` live inline in `route.ts`. As the tool
count grows (from 7 to ~12), extract to `src/lib/chat/tools.ts`:

```
src/lib/chat/
├── tools.ts          ← FunctionDeclaration[] array + executeTool() function
├── types.ts          ← ChatMessage, ConversationRow types
└── history.ts        ← saveTurn(), loadHistory() helpers
```

`route.ts` imports and uses these:

```typescript
// src/app/api/chat/route.ts
import { tools, executeTool } from '@/lib/chat/tools'
import { saveTurn } from '@/lib/chat/history'
```

This does NOT require a separate API route. The abstraction is in the shared module, not in
routing. Both the widget and portal share the same tool set via the same endpoint.

**New tools to add (expand `tools.ts`):**

| Tool Name | Description | New |
|-----------|-------------|-----|
| `get_urgent_tasks` | Overdue + high priority tasks | existing |
| `get_all_tasks` | All pending tasks | existing |
| `get_pipeline_status` | Pipeline overview | existing |
| `get_analytics` | Deal analytics | existing |
| `create_task` | Create a task | existing |
| `get_contacts` | Search contacts | existing |
| `get_recent_activity` | Recent interactions | existing |
| `complete_task` | Mark task done by ID | NEW |
| `search_tasks` | Search tasks by keyword | NEW |
| `add_contact` | Create a new contact | NEW |
| `create_deal` | Create a new deal | NEW |
| `get_daily_summary` | Overdue tasks + today's tasks + pipeline snapshot | NEW |

---

## Message Rendering Architecture

### Decision: Client-side markdown rendering in a shared `MessageRenderer` component

The current `ChatMessage.tsx` renders raw text with `whitespace-pre-wrap`. The portal needs:
- Markdown (bold, lists, code) from AI responses
- Rich action cards when a tool creates/modifies data

**Architecture:**

```
MessageRenderer (client component)
├── if content is plain text → ReactMarkdown (lightweight MD parser)
└── if message has action_data → ActionCard component
    ├── TaskCard (created/completed task details)
    ├── ContactCard (created contact details)
    ├── DealCard (created deal details)
    └── SummaryCard (daily briefing layout)
```

**Server vs Client decision:** Keep rendering client-side.

Reasons:
- Messages exist in client state (array in `useState`) — there is no server component lifecycle here
- Rich cards require interactivity (e.g., "Go to task" link, "Mark complete" button)
- ReactMarkdown is a small client bundle (~15KB gzipped)
- Server components cannot be used inside a client component tree without `use client` boundary tricks

**ActionCard data source:** The API response includes the rendered text AND optionally a
structured `action_result` object:

```typescript
// API response shape (modified)
return NextResponse.json({
  response: text,            // markdown text for display
  history: updatedHistory,
  action_result?: {          // optional: structured data for card rendering
    type: 'task_created' | 'contact_created' | 'deal_created',
    data: { id, title, ... }
  }
})
```

The `PortalChat` component stores `action_result` alongside each message and passes it to
`MessageRenderer`, which decides whether to show a card.

**ChatMessage.tsx (existing widget):** Unchanged. The widget continues rendering plain text with
pre-wrap. The richer `MessageRenderer` is portal-specific.

---

## Recommended Project Structure (delta from v1.0)

```
src/
├── app/
│   ├── (app)/                        ← existing CRM pages (unchanged)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── deals/
│   │   ├── tasks/
│   │   └── ...
│   ├── (auth)/                       ← existing auth pages (unchanged)
│   ├── (portal)/                     ← [NEW] portal route group
│   │   ├── layout.tsx                ← auth guard + minimal wrapper (no sidebar)
│   │   └── portal/
│   │       └── page.tsx              ← Server Component: loads conversations, passes to client
│   └── api/
│       └── chat/
│           └── route.ts              ← [MODIFIED] expanded tools + optional history save
├── components/
│   ├── chat/
│   │   ├── ChatWidget.tsx            ← existing (unchanged)
│   │   └── ChatMessage.tsx           ← existing (unchanged)
│   ├── portal/                       ← [NEW] portal-specific components
│   │   ├── PortalChat.tsx            ← main client component (full-page chat)
│   │   ├── MessageRenderer.tsx       ← markdown + action card renderer
│   │   ├── QuickActions.tsx          ← preset command buttons
│   │   ├── ConversationList.tsx      ← past conversations sidebar (desktop)
│   │   └── cards/
│   │       ├── TaskCard.tsx          ← created/updated task display
│   │       ├── ContactCard.tsx       ← created contact display
│   │       ├── DealCard.tsx          ← created deal display
│   │       └── SummaryCard.tsx       ← daily briefing card
│   └── ui/                           ← existing (unchanged)
└── lib/
    ├── chat/                         ← [NEW] shared chat logic
    │   ├── tools.ts                  ← FunctionDeclaration[] + executeTool()
    │   ├── types.ts                  ← ChatMessage, ActionResult types
    │   └── history.ts                ← saveTurn(), loadHistory()
    ├── actions/
    │   ├── chat.ts                   ← [NEW] createConversation, deleteConversation
    │   └── ... (existing)
    ├── queries/
    │   ├── chat.ts                   ← [NEW] getConversations, getMessages
    │   └── ... (existing)
    └── supabase/
        └── server.ts                 ← existing (unchanged)
```

---

## Data Flow

### Portal Chat Turn (with history persistence)

```
User types message in PortalChat
    |
sendMessage() called in PortalChat client component
    | -- appends user message to local messages[]
    | -- reads current conversation_id from state
    |
POST /api/chat
    body: { message, history: geminiHistory, conversation_id }
    |
route.ts: auth check (Supabase server client)
    | -- 401 if no session
    |
Gemini: model.startChat({ history })
    | -- sendMessage(message)
    | -- tool calls resolved in loop (executeTool)
    | -- final text response generated
    |
Optional: if conversation_id present
    | -- INSERT INTO chat_messages (conversation_id, 'user', message, ...)
    | -- INSERT INTO chat_messages (conversation_id, 'assistant', text, gemini_parts)
    | -- UPDATE chat_conversations SET updated_at = now()
    |
Response: { response: text, history: updatedHistory, action_result?: {...} }
    |
PortalChat: append assistant message to messages[]
    | -- store action_result alongside message
    | -- update geminiHistory state
    | -- MessageRenderer selects text or card rendering
```

### Starting a New Conversation (Portal)

```
User opens /portal for first time (or clicks "New Chat")
    |
PortalPage (Server Component)
    | -- getConversations(userId) → last 10 conversations
    | -- pass to PortalChat as initialConversations prop
    |
PortalChat mounts
    | -- no conversation_id in state yet
    |
User sends first message
    | -- POST /api/chat (no conversation_id)
    | -- response received
    |
After response: createConversation() Server Action
    | -- INSERT chat_conversations (user_id, account_id, title=firstMessage[0..60])
    | -- INSERT chat_messages x2 (user + assistant for this turn)
    | -- returns new conversation_id
    |
PortalChat: setState({ conversation_id: newId })
    | -- subsequent messages include conversation_id
```

### Loading Past Conversation

```
User clicks conversation in ConversationList
    |
loadConversation(conversationId) called
    | -- GET chat_messages WHERE conversation_id = ? ORDER BY created_at ASC
    | -- reconstruct messages[] for display
    | -- reconstruct geminiHistory from gemini_parts JSONB
    |
PortalChat state updated
    | -- messages[] repopulated
    | -- geminiHistory[] reconstructed
    | -- conversation continues seamlessly
```

---

## Architectural Patterns

### Pattern 1: Single API Endpoint, Optional Persistence

**What:** The `/api/chat` route serves both the floating widget (stateless) and the portal
(stateful with DB persistence). The caller signals intent by including or omitting `conversation_id`.

**When to use:** When two surfaces share the same core logic but differ in persistence needs.

**Trade-offs:** Simpler than two routes, slightly more conditional logic in one handler. Acceptable
because the conditional is trivial (check for `conversation_id` presence).

**Example:**
```typescript
// route.ts
const { message, history, conversation_id } = await request.json()

// ... Gemini logic unchanged ...

if (conversation_id && typeof conversation_id === 'string') {
  // Fire-and-forget is acceptable — don't block response on DB write
  saveTurn(supabase, conversation_id, message, text, updatedHistory).catch(
    (err) => console.error('saveTurn failed:', err)
  )
}

return NextResponse.json({ response: text, history: updatedHistory })
```

### Pattern 2: Gemini History Stored as JSONB for Replay

**What:** Store Gemini's raw `Content[]` history parts in a `gemini_parts jsonb` column alongside
the human-readable `content` text. When loading a past conversation, reconstruct the Gemini
history array directly from the stored JSONB.

**When to use:** Any chat system using a stateful LLM API where conversation context must survive
page refreshes.

**Trade-offs:** Doubles storage per message (readable text + raw parts). Acceptable because
messages are small (~1-5KB each) and volume is low (1-5 users, 500 RPD limit).

**Example:**
```typescript
// history.ts
export async function loadHistory(
  supabase: SupabaseClient,
  conversationId: string
): Promise<{ messages: UIMessage[]; geminiHistory: Content[] }> {
  const { data } = await supabase
    .from('chat_messages')
    .select('role, content, gemini_parts')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  const messages: UIMessage[] = (data ?? []).map(row => ({
    role: row.role as 'user' | 'assistant',
    content: row.content,
  }))

  // Reconstruct Gemini history from stored JSONB parts
  const geminiHistory: Content[] = (data ?? [])
    .filter(row => row.gemini_parts)
    .map(row => row.gemini_parts as Content)

  return { messages, geminiHistory }
}
```

### Pattern 3: Mobile-First Full-Screen Layout Without Sidebar

**What:** The portal page renders a full-screen layout with no sidebar, no top nav. On mobile it
fills the viewport. On desktop it shows a conversation list panel + main chat area side by side.

**When to use:** Chat-centric pages where the CRM chrome would be distracting noise.

**Trade-offs:** Users cannot navigate to CRM pages without a back button or URL change. Mitigate
by providing a "Back to CRM" link in the portal header.

**Example (layout structure):**
```typescript
// components/portal/PortalChat.tsx (structure only)
return (
  <div className="flex h-screen overflow-hidden">
    {/* Desktop: conversation list sidebar */}
    <div className="hidden md:flex w-64 flex-col border-r border-border/50">
      <ConversationList conversations={conversations} activeId={conversationId} />
    </div>
    {/* Main chat area — full width on mobile */}
    <div className="flex flex-1 flex-col">
      <PortalHeader />           {/* minimal: title + "Back to CRM" link */}
      <MessageList messages={messages} />
      <QuickActions onSelect={setInput} />
      <ChatInput onSend={sendMessage} />
    </div>
  </div>
)
```

### Pattern 4: Action Result Cards via Optional API Field

**What:** When an AI tool creates or modifies data, the API route includes a structured
`action_result` in the response. The client uses this to render a rich card below the text response.

**When to use:** Mutations triggered by AI (create task, add contact, create deal).

**Trade-offs:** Couples the API response shape to UI concerns. Acceptable at this scale. If the
tool call result includes the created record, the route extracts it and forwards it.

**Example:**
```typescript
// route.ts — after tool loop resolves
// Collect action results from tool executions
const actionResult = toolResults.find(r =>
  ['create_task', 'add_contact', 'create_deal'].includes(r.functionResponse.name)
)

return NextResponse.json({
  response: text,
  history: updatedHistory,
  action_result: actionResult ? {
    type: actionResult.functionResponse.name,
    data: actionResult.functionResponse.response,
  } : undefined,
})
```

---

## Anti-Patterns

### Anti-Pattern 1: Creating a Separate `/api/portal/chat` Route

**What people do:** Duplicate the entire chat route handler for the portal to "keep things separate."

**Why it's wrong:** Gemini client init, auth check, tool loop, and error handling are identical.
Tool definitions diverge immediately, creating two lists to maintain. Rate limit behavior and
debugging become confusing with two endpoints.

**Do this instead:** Extend the single `/api/chat` route. Use the optional `conversation_id`
field to signal persistence intent. Extract tools to `src/lib/chat/tools.ts` for clean separation.

### Anti-Pattern 2: Storing Full Gemini History in the Browser Only

**What people do:** Keep `geminiHistory` state in `useState` (already done in ChatWidget). This
works for the widget but is wrong for the portal where persistence is the feature.

**Why it's wrong:** History is lost on page refresh, browser close, or when switching devices.
For a mobile-first portal, users will close the tab constantly.

**Do this instead:** Save each turn to `chat_messages` with `gemini_parts jsonb`. Reconstruct
history from DB on load. The client still caches it in `useState` for performance during a session.

### Anti-Pattern 3: Blocking the API Response on DB Write

**What people do:** `await saveTurn(...)` before returning the JSON response, making every chat
message slower by the DB write latency.

**Why it's wrong:** Adds 50-200ms to every response unnecessarily. The user wants the AI response
now. DB persistence is non-blocking from the user's perspective.

**Do this instead:** Fire-and-forget the DB write (with error logging). The response returns
immediately. If the save fails, log it — occasional lost messages are preferable to consistent
added latency. Alternatively, the client makes a separate `createMessage` Server Action call
after receiving the API response.

### Anti-Pattern 4: Rendering AI Markdown with `dangerouslySetInnerHTML`

**What people do:** Parse markdown to HTML string server-side and inject it via `dangerouslySetInnerHTML`.

**Why it's wrong:** XSS risk. Gemini can produce content that, after markdown parsing, contains
`<script>` tags or event handlers if not sanitized. Even with sanitization, this is fragile.

**Do this instead:** Use `react-markdown` (or `marked` + DOMPurify) client-side. `react-markdown`
renders to React elements, not HTML strings, so no injection is possible.

### Anti-Pattern 5: Putting the Portal Inside `(app)` Layout With Sidebar

**What people do:** Add `/portal` as a route inside the existing `(app)` route group, inheriting
the AppShell (sidebar + header + floating ChatWidget).

**Why it's wrong:** The portal is a full-screen chat interface. The sidebar wastes ~256px on
mobile where there is no space. The floating ChatWidget is redundant (the portal IS the chat).
The AppShell adds unnecessary data fetching (overdue task count, profile fetch).

**Do this instead:** Create a sibling `(portal)` route group with a minimal layout — auth guard
only, no sidebar, no header, no ChatWidget. The portal is a different surface, not a CRM page.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Gemini API | Route handler → `@google/generative-ai` SDK | Rate limit: 500 RPD / 15 RPM free tier. Portal + Widget share the same quota. At 1-5 users this is not a concern. |
| Supabase Auth | Server client in route handler — `supabase.auth.getUser()` | No change. Portal shares the same session/cookie mechanism. |
| Supabase DB | New `chat_conversations` + `chat_messages` tables with RLS | Users see only their own conversations. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| PortalChat → API | `fetch POST /api/chat` with optional `conversation_id` | Same as ChatWidget — no new endpoint needed |
| API route → DB | Direct Supabase server client call inside `saveTurn()` | Fire-and-forget, does not block response |
| PortalPage → DB | Server Component: `getConversations(userId)` query | Standard server-side Supabase query pattern |
| Portal → CRM pages | Next.js `<Link href="/dashboard">` | No state sharing needed; separate page navigations |
| ChatWidget → API | Existing `fetch POST /api/chat` (no `conversation_id`) | Zero changes to widget |
| lib/chat/tools.ts → lib/actions/ | Tool implementations can call existing actions | `create_task` tool already reimplements task insertion inline — refactor to call `createTask` logic |

---

## Build Order Implications

Dependencies drive this order:

1. **DB migration** — `chat_conversations` + `chat_messages` tables + RLS policies + TypeScript
   types regeneration. Everything else depends on this.

2. **Extract tools to `src/lib/chat/tools.ts`** — Move existing 7 tools out of `route.ts`.
   No behavior change. Establishes the module that new tools extend. Required before adding tools.

3. **Add new tool implementations** — Add `complete_task`, `search_tasks`, `add_contact`,
   `create_deal`, `get_daily_summary` to `tools.ts`. Verify against existing DB schema before
   writing — schema already exists, just need correct column names.

4. **Modify `/api/chat/route.ts`** — Import from `tools.ts`. Add `conversation_id` optional
   handling. Add `saveTurn()` call. Verify widget still works unchanged.

5. **`src/lib/chat/history.ts`** — `saveTurn()`, `loadHistory()` helper functions. Needed by
   route.ts (step 4) and portal page (step 7).

6. **`(portal)` route group + layout** — Auth guard layout. No dependencies beyond Supabase client.

7. **`src/app/(portal)/portal/page.tsx`** — Server Component that calls `getConversations()`,
   passes to PortalChat. Depends on history.ts (step 5) and PortalChat (step 8).

8. **`PortalChat.tsx` + child components** — Main client component. Depends on MessageRenderer,
   QuickActions, ConversationList. Build PortalChat first as shell, then fill in children.

9. **`MessageRenderer.tsx` + card components** — Markdown rendering and action cards. Depends on
   API returning `action_result`. Can be stubbed as plain text initially and enhanced.

10. **QA: widget regression** — Verify ChatWidget still works, history not corrupted, no rate
    limit changes visible.

---

## Sources

- Direct codebase inspection: `src/app/api/chat/route.ts`, `src/components/chat/ChatWidget.tsx`,
  `src/app/(app)/layout.tsx`, `src/components/layout/app-shell.tsx` — HIGH confidence
- [Next.js Route Groups documentation](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — HIGH confidence
- [Next.js Nested Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates) — HIGH confidence
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- Gemini API rate limits (free tier): 500 RPD, 15 RPM — verified from Google AI Studio docs — HIGH confidence

---
*Architecture research for: Team Command Portal integration into HealthCRM*
*Researched: 2026-02-25*
