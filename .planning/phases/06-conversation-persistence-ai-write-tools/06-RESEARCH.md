# Phase 6: Conversation Persistence & AI Write Tools - Research

**Researched:** 2026-02-25
**Domain:** Supabase message persistence, Gemini function calling write tools, client-side confirmation flow
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Confirmation flow**
- No undo button on confirmation cards — user can edit/delete from CRM if needed
- Unrecognized commands get a simple response listing available capabilities

**Conversation storage**
- Session-based threads, not one continuous stream
- On return to /portal, only the current/most recent session loads
- Past sessions are stored in Supabase but NOT browsable in this phase (future capability)
- Current session only visible; no session list/drawer UI

**Daily briefing**
- Three sections: overdue tasks, tasks due today, deals closing soon (no recent activity section)
- One-liner per item — task name + due date, deal name + value + close date (scannable on mobile)
- Counts/totals header at the top (e.g., "3 overdue, 5 due today, 2 deals closing this week")

**Error & edge cases**
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

### Deferred Ideas (OUT OF SCOPE)

- Browsable past session history (session list sidebar) — future phase or backlog
- Recent activity section in daily briefing — could add later if needed
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AITOOL-01 | User can create a new contact via natural language chat command | Two-step confirmation pattern; Supabase INSERT to contacts + contact_organizations; lookup org by name |
| AITOOL-02 | User can create a new deal via natural language chat command | Two-step confirmation pattern; Supabase INSERT to deals; must look up org by name and stage by name |
| AITOOL-03 | User can mark a task as complete via natural language chat command | Fuzzy task title search + complete via is_complete + completed_at; existing completeTask action reusable |
| AITOOL-04 | User can request daily briefing showing overdue tasks, today's tasks, and pipeline summary | Single tool call; existing getTasks/getDeals query patterns reusable; deals closing within 7 days |
</phase_requirements>

---

## Summary

Phase 6 has two independent work streams that must be sequenced correctly. The first is **conversation persistence**: creating `chat_sessions` and `chat_messages` tables in Supabase, writing RLS policies, and wiring PortalChat to load the most recent session on mount and save every message to the DB. The second is **AI write tools**: adding four new Gemini tool definitions (`create_contact`, `create_deal`, `complete_task`, `daily_briefing`) to `src/lib/chat/tools.ts` plus implementing a client-side two-step confirmation flow for the three write tools.

The biggest architectural question in this phase — flagged as a blocker in STATE.md — is how to implement the two-step confirmation flow (Gemini tool call → client shows card → user taps confirm → DB write executes). Research confirms the correct pattern: the API route detects write tool calls, returns a structured `pendingAction` payload to the client instead of executing the DB write, the client renders a confirmation card, and on user confirm the client calls a dedicated `/api/chat/confirm` endpoint (or re-calls `/api/chat` with a confirmation context). The DB write only happens after user confirmation. This pattern avoids the need to pause/resume the Gemini stream mid-flow.

The `daily_briefing` tool is a pure read — no confirmation needed — and can call three parallel Supabase queries via `Promise.all`. The "deals closing soon" section should query deals with `expected_close` within the next 7 days in active stages (not won/lost).

**Primary recommendation:** Implement persistence first (Wave 1), then the daily briefing tool as a safe read-only warmup (Wave 2), then the three write tools with the confirmation flow (Wave 3). This ordering minimizes risk and delivers value incrementally.

---

## Standard Stack

### Core (already installed — no new packages needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/generative-ai` | ^0.24.1 | Gemini function calling | Already in use in Phase 5 |
| `@supabase/supabase-js` | ^2.97.0 | DB reads/writes for persistence + write tools | Already in use |
| `@supabase/ssr` | ^0.8.0 | Server-side Supabase client for API routes | Already in use |
| `lucide-react` | ^0.575.0 | Icons for confirmation cards (Check, X, ExternalLink) | Already in use |
| `zod` | ^4.3.6 | Validation of tool args before DB operations | Already in use |

### No new packages required
All libraries needed for Phase 6 are already installed. No `npm install` step.

---

## Architecture Patterns

### Recommended Project Structure Changes

```
src/
├── lib/
│   └── chat/
│       └── tools.ts          # ADD: create_contact, create_deal, complete_task, daily_briefing
├── app/
│   └── api/
│       └── chat/
│           ├── route.ts       # MODIFY: detect write tools, return pendingAction instead of executing
│           └── confirm/
│               └── route.ts  # NEW: receives confirmed pendingAction, executes DB write
├── components/
│   └── portal/
│       ├── PortalChat.tsx     # MODIFY: load session on mount, save messages, handle pendingAction state
│       ├── PortalMessage.tsx  # MODIFY or extend: add 'confirmation' message type
│       └── ConfirmationCard.tsx  # NEW: card shown for pending write actions
└── supabase/
    └── migrations/
        └── YYYYMMDD_create_chat_tables.sql  # NEW
```

---

### Pattern 1: Chat Sessions & Messages Schema

**What:** Two normalized tables — `chat_sessions` (one row per session) and `chat_messages` (one row per message). Session is created on first message, referenced on all subsequent messages.

**Session definition:** A new session starts on each fresh visit to /portal after a gap. The simplest trigger is: load the most recent session for the user; if none exists OR the last message is older than N hours (e.g., 24h), create a new session.

**Schema:**
```sql
-- chat_sessions: one row per conversation thread
CREATE TABLE public.chat_sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_sessions_user_idx ON public.chat_sessions(user_id, updated_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON public.chat_sessions
  FOR ALL USING (user_id = auth.uid());

-- chat_messages: one row per message
CREATE TABLE public.chat_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user', 'assistant')),
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_session_idx ON public.chat_messages(session_id, created_at ASC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = chat_messages.session_id
      AND s.user_id = auth.uid()
    )
  );
CREATE POLICY "Users insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions s
      WHERE s.id = chat_messages.session_id
      AND s.user_id = auth.uid()
    )
  );
```

**Why not store Gemini history JSON in chat_messages:** The Gemini history format is internal SDK state (includes tool call parts, function response parts, etc.) and is not safe to store as it contains non-user-facing content. Store only the display content (user text + assistant text). Rebuild Gemini history from display messages when needed.

**Important:** `chat_sessions` does NOT need `account_id` — sessions belong to a user directly. The existing RLS pattern (`user_id = auth.uid()`) is the correct and simpler approach here, consistent with how `profiles` is scoped.

---

### Pattern 2: Session Load on Portal Mount

**What:** PortalChat loads the most recent session for the user on component mount via a new `/api/chat/session` GET endpoint (or inline fetch).

**When to create a new session:**
The simplest correct approach is: fetch the user's most recent session + its messages. If no session exists, or the most recent session's `updated_at` is > 24 hours ago, create a new session. This matches the user decision: "on return to /portal, only the current/most recent session loads."

```typescript
// In PortalChat useEffect on mount:
async function loadOrCreateSession() {
  const res = await fetch('/api/chat/session')
  const data = await res.json()
  // data: { sessionId, messages: Message[] }
  setSessionId(data.sessionId)
  setMessages(data.messages)
}
```

**API route `/api/chat/session` (GET):**
```typescript
// 1. Auth check
// 2. Query most recent session for user ordered by updated_at DESC
// 3. If none, or updated_at < 24h ago: create new session, return empty messages
// 4. If recent session: fetch its messages, return them
```

**Save messages after each exchange:**
After each user/assistant message pair completes, save both to Supabase via `/api/chat/session` (POST) or inline in the chat route response. The simplest pattern: the chat route saves messages server-side as a side effect, so the client doesn't need a separate save call.

---

### Pattern 3: Two-Step Confirmation Flow (Critical Design)

This is the core architectural challenge flagged in STATE.md. Here is the validated pattern:

**The problem:** Gemini's function calling is designed to execute tools automatically and return results. There is no native "pause for human approval" in the `@google/generative-ai` SDK. The stream runs to completion in one server-side request.

**The solution — client-side confirmation gate:**

1. **Detection:** In `/api/chat/route.ts`, when the tool call is a write tool (`create_contact`, `create_deal`, `complete_task`), the route does NOT execute the tool. Instead it returns a `pendingAction` payload to the client.

2. **Client renders confirmation card:** PortalChat adds a special message of type `'pending'` to its messages array. `ConfirmationCard` renders with the proposed action details and Confirm/Cancel buttons.

3. **User taps Confirm:** Client calls `/api/chat/confirm` (POST) with the `pendingAction` payload.

4. **Server executes write:** `/api/chat/confirm` executes the actual DB write, then calls Gemini once more with the tool result to get the assistant's confirmation text response.

5. **User taps Cancel:** Client replaces the pending message with a simple "Cancelled." assistant message. No server call needed.

**API route changes to `/api/chat/route.ts`:**
```typescript
// WRITE_TOOLS set — checked before executing in tool loop
const WRITE_TOOLS = new Set(['create_contact', 'create_deal', 'complete_task'])

// In the tool execution loop, after detecting functionCall parts:
const functionCalls = response.candidates[0].content.parts.filter(p => p.functionCall)

for (const part of functionCalls) {
  const fc = part.functionCall!
  if (WRITE_TOOLS.has(fc.name)) {
    // Don't execute — return pendingAction to client
    return NextResponse.json({
      pendingAction: {
        tool: fc.name,
        args: fc.args,
        // Preview data assembled for display (org name, deal title, etc.)
        preview: buildPreview(fc.name, fc.args as Record<string, unknown>)
      }
    })
  }
  // ... execute read tools normally
}
```

**PortalChat state additions:**
```typescript
// Alongside existing state:
const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

// When API returns pendingAction:
if (data.pendingAction) {
  setPendingAction(data.pendingAction)
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: '__pending__',  // sentinel — rendered as ConfirmationCard
    pendingAction: data.pendingAction
  }])
}
```

**`/api/chat/confirm` route:**
```typescript
// POST body: { tool, args, sessionId, history }
// 1. Auth check
// 2. Execute the DB write (create_contact / create_deal / complete_task)
// 3. Build FunctionResponsePart with result
// 4. Send to Gemini with history + function response
// 5. Get Gemini's final text (confirmation message)
// 6. Save both user confirmation + assistant response to chat_messages
// 7. Return { response: text, history: updatedHistory }
```

**Why this approach and not others:**
- Vercel AI SDK's native confirmation component requires switching to a different AI SDK (not the direct `@google/generative-ai` being used). Adding that dependency is heavy.
- Pausing a streaming response mid-flight is not supported by the current architecture.
- The pendingAction approach requires minimal changes — only the API route's tool detection logic and a new client state variable.

---

### Pattern 4: New Gemini Tool Definitions

Add to `src/lib/chat/tools.ts`:

**`create_contact` tool:**
```typescript
{
  name: 'create_contact',
  description: 'Create a new contact in the CRM. Use when user says "add contact", "create contact", or similar.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      first_name: { type: SchemaType.STRING, description: 'Contact first name' },
      last_name: { type: SchemaType.STRING, description: 'Contact last name' },
      organization_name: { type: SchemaType.STRING, description: 'Name of the organization to link the contact to (optional)' },
      title: { type: SchemaType.STRING, description: 'Job title (optional)' },
      email: { type: SchemaType.STRING, description: 'Email address (optional)' },
    },
    required: ['first_name', 'last_name'],
  },
}
```

**`create_deal` tool:**
```typescript
{
  name: 'create_deal',
  description: 'Create a new deal in the pipeline. Use when user says "create deal", "add deal", "new opportunity", or similar.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      title: { type: SchemaType.STRING, description: 'Deal title or name' },
      organization_name: { type: SchemaType.STRING, description: 'Organization this deal is for (optional)' },
      value: { type: SchemaType.NUMBER, description: 'Deal value in USD (optional)' },
      stage_name: { type: SchemaType.STRING, description: 'Pipeline stage name (optional, defaults to first stage)' },
    },
    required: ['title'],
  },
}
```

**`complete_task` tool:**
```typescript
{
  name: 'complete_task',
  description: 'Mark a task as complete. Use when user says "complete task", "mark task done", "finish task", or similar.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      task_title: { type: SchemaType.STRING, description: 'Title or partial title of the task to mark complete' },
    },
    required: ['task_title'],
  },
}
```

**`daily_briefing` tool (read-only, no confirmation needed):**
```typescript
{
  name: 'daily_briefing',
  description: 'Get a daily briefing: overdue tasks, tasks due today, and deals closing soon. Use for "daily briefing", "what\'s on today", "what do I have today", or similar.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
}
```

---

### Pattern 5: Tool Execution Logic (in `executeTool`)

**`create_contact` (preview-only in route.ts — actual insert in confirm route):**
The tool execution in tools.ts handles the ACTUAL insert (called by confirm route). It needs to:
1. Look up organization by name (case-insensitive `ilike`) to get org_id — if not found, report "not found" (do NOT create it)
2. Insert contact row
3. Insert contact_organizations junction row if org found
4. Return `{ created: true, contact: { id, name, org_name } }` for Gemini to summarize

```typescript
case 'create_contact': {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const accountId = await getAccountId(supabase, user.id)

  // Org lookup
  let orgId: string | null = null
  const orgName = args.organization_name as string | undefined
  if (orgName) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .ilike('name', orgName)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()
    if (!org) return { error: `Organization "${orgName}" not found. Please check the name and try again.` }
    orgId = org.id
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      account_id: accountId,
      created_by: user.id,
      updated_by: user.id,
      first_name: args.first_name as string,
      last_name: args.last_name as string,
      title: (args.title as string) || null,
      email: (args.email as string) || null,
    })
    .select('id, first_name, last_name')
    .single()

  if (error || !contact) return { error: 'Failed to create contact' }

  if (orgId) {
    await supabase.from('contact_organizations').insert({
      contact_id: contact.id,
      organization_id: orgId,
      is_primary: true,
    })
  }

  return {
    created: true,
    contact: {
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name}`,
      organization: orgName ?? null,
    }
  }
}
```

**`create_deal`:**
1. Look up org by name via `ilike` if provided — if not found, return error
2. Look up stage by name via `ilike` — if not found, use first active stage (order by display_order)
3. Insert deal row
4. Return `{ created: true, deal: { id, title, stage_name, value, org_name } }`

```typescript
case 'create_deal': {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const accountId = await getAccountId(supabase, user.id)

  // Stage lookup — default to first active stage
  let stageId: string
  const stageName = args.stage_name as string | undefined
  if (stageName) {
    const { data: stage } = await supabase
      .from('pipeline_stages')
      .select('id, name')
      .ilike('name', stageName)
      .eq('account_id', accountId)
      .limit(1)
      .maybeSingle()
    if (!stage) return { error: `Stage "${stageName}" not found.` }
    stageId = stage.id
  } else {
    // Default to first non-won, non-lost stage
    const { data: defaultStage } = await supabase
      .from('pipeline_stages')
      .select('id, name')
      .eq('account_id', accountId)
      .eq('is_won', false)
      .eq('is_lost', false)
      .order('display_order', { ascending: true })
      .limit(1)
      .single()
    if (!defaultStage) return { error: 'No pipeline stages found.' }
    stageId = defaultStage.id
  }

  // Org lookup
  let orgId: string | null = null
  const orgName = args.organization_name as string | undefined
  if (orgName) {
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .ilike('name', orgName)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle()
    if (!org) return { error: `Organization "${orgName}" not found.` }
    orgId = org.id
  }

  const { data: deal, error } = await supabase
    .from('deals')
    .insert({
      account_id: accountId,
      created_by: user.id,
      updated_by: user.id,
      owner_id: user.id,
      title: args.title as string,
      stage_id: stageId,
      value: (args.value as number) ?? null,
      organization_id: orgId,
    })
    .select('id, title, value, pipeline_stages(name)')
    .single()

  if (error || !deal) return { error: 'Failed to create deal' }
  return { created: true, deal: { id: deal.id, title: deal.title, value: deal.value, stage: (deal.pipeline_stages as { name: string } | null)?.name, organization: orgName ?? null } }
}
```

**`complete_task`:**
1. Search tasks by title using `ilike` (`%${task_title}%`) filtered to `is_complete = false`
2. If 0 matches: return "No incomplete task found matching that description"
3. If 1 match: for write tools this goes through confirmation flow — return task details for preview
4. If 2+ matches: return list of matches — Gemini asks user to be more specific

```typescript
case 'complete_task': {
  const taskTitle = args.task_title as string
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, due_date')
    .ilike('title', `%${taskTitle}%`)
    .eq('is_complete', false)
    .is('deleted_at', null)
    .limit(5)

  if (!tasks || tasks.length === 0) {
    return { error: `No incomplete task found matching "${taskTitle}".` }
  }
  if (tasks.length > 1) {
    return { matches: tasks.map(t => ({ id: t.id, title: t.title })), message: 'Multiple tasks found. Which did you mean?' }
  }

  // Single match — execute completion
  const task = tasks[0]
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  await supabase
    .from('tasks')
    .update({ is_complete: true, completed_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', task.id)

  return { completed: true, task: { id: task.id, title: task.title } }
}
```

**`daily_briefing` (read-only, no confirmation):**
Three parallel queries via `Promise.all`:

```typescript
case 'daily_briefing': {
  const today = getLocalToday()
  const in7Days = new Date()
  in7Days.setDate(in7Days.getDate() + 7)
  const weekEnd = in7Days.toISOString().split('T')[0]

  const [overdueResult, todayResult, dealsResult] = await Promise.all([
    // Overdue: incomplete tasks past due
    supabase
      .from('tasks')
      .select('id, title, due_date')
      .eq('is_complete', false)
      .lt('due_date', today)
      .is('deleted_at', null)
      .order('due_date', { ascending: true })
      .limit(20),

    // Due today: incomplete tasks due exactly today
    supabase
      .from('tasks')
      .select('id, title, due_date')
      .eq('is_complete', false)
      .eq('due_date', today)
      .is('deleted_at', null)
      .order('due_date', { ascending: true })
      .limit(20),

    // Deals closing this week: active stages only, expected_close within 7 days
    supabase
      .from('deals')
      .select('id, title, value, expected_close, pipeline_stages(name, is_won, is_lost)')
      .is('deleted_at', null)
      .gte('expected_close', today)
      .lte('expected_close', weekEnd)
      .limit(20),
  ])

  const overdue = overdueResult.data ?? []
  const dueToday = todayResult.data ?? []
  const allClosing = (dealsResult.data ?? []).filter(
    (d) => {
      const s = d.pipeline_stages as { is_won: boolean; is_lost: boolean } | null
      return s && !s.is_won && !s.is_lost
    }
  )

  return {
    summary: {
      overdue_count: overdue.length,
      due_today_count: dueToday.length,
      closing_soon_count: allClosing.length,
    },
    overdue_tasks: overdue,
    due_today_tasks: dueToday,
    closing_soon_deals: allClosing.map(d => ({
      id: d.id,
      title: d.title,
      value: d.value,
      close_date: d.expected_close,
    }))
  }
}
```

---

### Pattern 6: ConfirmationCard Component

A new component rendered inline in the chat when `pendingAction` is present. Design: small card, matches the assistant bubble style, shows action type + key details + two buttons.

```typescript
// src/components/portal/ConfirmationCard.tsx
interface ConfirmationCardProps {
  pendingAction: PendingAction
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

// PendingAction type:
interface PendingAction {
  tool: 'create_contact' | 'create_deal' | 'complete_task'
  args: Record<string, unknown>
  preview: {
    title: string       // e.g. "Create contact: John Smith"
    details: string[]   // e.g. ["Organization: Hadassah Hospital", "Email: john@example.com"]
  }
}
```

Visual layout (within the existing assistant bubble style):
- Header: action type label (e.g., "Create Contact")
- Name/title of record being created
- Key details list (org, value, stage as applicable)
- Two buttons: "Confirm" (primary) and "Cancel" (ghost/muted)
- No undo message (per locked decision)

---

### Pattern 7: Auth Redirect Preservation for /portal

From CONTEXT.md specifics: "After login from /portal route, redirect back to /portal — not to the dashboard."

The current `proxy.ts` / `updateSession` redirects unauthenticated users to `/login` without preserving the intended destination. This needs a `next` query param:

```typescript
// In src/lib/supabase/proxy.ts — modify the redirect:
if (!user && !isAuthRoute) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('next', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}
```

And the login Server Action (`signIn`) needs to read `next` from the form or URL and redirect there:
```typescript
// Pass 'next' as a hidden form input in the LoginForm when detected from searchParams
// signIn action redirects to formData.get('next') || '/dashboard'
```

---

### Anti-Patterns to Avoid

- **Storing Gemini SDK history objects in chat_messages:** The `history` returned by `chat.getHistory()` contains internal SDK parts including tool calls and function responses. Store ONLY display content (user text, assistant text). Rebuild Gemini history from display messages as needed.
- **Executing write tools inside the main chat route:** The main `/api/chat` route should detect write tool calls and return `pendingAction` rather than executing them. The actual DB write lives in `/api/chat/confirm`.
- **One chat_messages row per full exchange:** Use one row per individual message (role + content). This enables proper session loading with correct message order.
- **Skipping RLS on chat tables:** Both `chat_sessions` and `chat_messages` must have RLS enabled. The `chat_messages` policy should check ownership via the `chat_sessions` relationship, matching the pattern used for `contact_organizations` (EXISTS subquery, no direct user_id on messages table).
- **Searching tasks by exact title match:** Use `ilike` with `%title%` wildcards. Users will type partial or approximate task names. Exact match will silently fail.
- **Using the `complete_task` confirmation flow for multiple-match scenarios:** When multiple tasks match, Gemini should respond with the list and ask the user to clarify — this is a natural language turn, not a confirmation card.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session expiry logic | Custom TTL timer | Simple `updated_at` age check on session load | Stateless, correct across browser restarts |
| Fuzzy task search | Levenshtein distance impl | PostgreSQL `ilike` with wildcards | Already indexed, handles partial matches, no extra lib |
| Organization name lookup | Client-side fuzzy matching | Server-side `ilike` query | Consistent with existing search patterns in the codebase |
| Confirmation UI | Full dialog/modal library | Inline card component with two buttons | Session context matters — a modal breaks the chat flow |

**Key insight:** This phase is almost entirely plumbing existing pieces together. The contacts, deals, and tasks write operations all have working Server Actions in `src/lib/actions/`. The tool executor in `tools.ts` should contain inline Supabase calls (as it already does for `create_task`) rather than calling the Server Actions, because Server Actions expect `FormData` and include `revalidatePath` which is irrelevant in the portal context.

---

## Common Pitfalls

### Pitfall 1: Gemini History Drift
**What goes wrong:** The Gemini `history` object stored in client state includes tool call parts and function response parts from previous turns. If the client sends a stale or truncated history, Gemini loses context and produces confused responses.
**Why it happens:** The current PortalChat stores `geminiHistory` in React state. After adding persistence, if the restored history (from DB messages) does not match what Gemini expects (it expects a specific part structure), the session will behave incorrectly.
**How to avoid:** When loading a session from DB, do NOT attempt to reconstruct Gemini history from stored messages. Start each portal visit with a fresh Gemini `history: []`. The DB messages are for DISPLAY only. Gemini context is maintained only within a single continuous browser session. This is consistent with the user decision: "on return to /portal, only the current/most recent session loads" — the visual history is shown, but the AI context starts fresh.
**Warning signs:** Gemini referring to previous session content in unexpected ways, or tool calls misbehaving after page refresh.

### Pitfall 2: Confirmation Card Blocking Subsequent Messages
**What goes wrong:** User sends a message, sees a confirmation card, then sends ANOTHER message before confirming. The second message goes to the API while `pendingAction` is still set, causing state confusion.
**Why it happens:** The chat input is not disabled while `pendingAction` is set.
**How to avoid:** Disable the chat input and send button while `pendingAction !== null`. Add a `disabled` check in `sendMessage()`: `if (!trimmed || isLoading || pendingAction) return`.

### Pitfall 3: Missing `account_id` Scoping in Tool Queries
**What goes wrong:** The `pipeline_stages` lookup for `create_deal` returns stages from any account, not just the current user's account. This will fail if multiple accounts exist or will return wrong data.
**Why it happens:** Forgetting that `pipeline_stages` is scoped by `account_id`. RLS will catch cross-account reads, but the query should explicitly filter `eq('account_id', accountId)`.
**How to avoid:** All queries in tool execution that touch `pipeline_stages` or `organizations` must include `.eq('account_id', accountId)` OR rely on RLS (which is enabled). Using RLS alone is sufficient but explicit filtering is safer and faster.

### Pitfall 4: `revalidatePath` in Tool Executor
**What goes wrong:** Adding `revalidatePath` calls inside `executeTool` in `tools.ts` will throw because `tools.ts` runs in a Route Handler context, not a Server Action context. `revalidatePath` only works in Server Actions and Route Handlers with the `'use server'` directive — but `tools.ts` has neither.
**Why it happens:** The existing `create_task` tool in tools.ts does NOT call `revalidatePath`. This is correct. Adding it would break.
**How to avoid:** Never add `revalidatePath` to tool executors. Cache invalidation for the CRM pages will happen naturally when the user navigates to them, which is acceptable since portal users are primarily on mobile.

### Pitfall 5: `chat_messages` RLS INSERT Policy Without WITH CHECK
**What goes wrong:** An INSERT policy with only `USING` (not `WITH CHECK`) allows users to insert messages into sessions they don't own.
**Why it happens:** The `USING` clause applies to row filtering on SELECT/UPDATE/DELETE. For INSERT, `WITH CHECK` is required to validate the new row.
**How to avoid:** The `chat_messages` INSERT policy MUST use `WITH CHECK`, not `USING`, confirming via EXISTS that the target `session_id` belongs to the current user.

### Pitfall 6: Daily Briefing Includes Won/Lost Deals
**What goes wrong:** The "deals closing soon" section includes deals already marked Won or Lost, creating noise in the briefing.
**Why it happens:** Filtering only by `expected_close` date without filtering out closed stages.
**How to avoid:** Filter `pipeline_stages.is_won = false AND pipeline_stages.is_lost = false`. The current approach in the code examples above filters in application code after the join — this is the same pattern used in `get_pipeline_status`.

---

## Code Examples

### Load Most Recent Session
```typescript
// Source: verified against existing Supabase query patterns in this codebase
// GET /api/chat/session
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Get most recent session
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
  const sessionIsStale = !session ||
    (Date.now() - new Date(session.updated_at).getTime() > TWENTY_FOUR_HOURS)

  let sessionId: string

  if (sessionIsStale) {
    // Create new session
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id })
      .select('id')
      .single()
    sessionId = newSession!.id
    return NextResponse.json({ sessionId, messages: [] })
  }

  sessionId = session.id

  // Fetch messages for this session
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    sessionId,
    messages: (messages ?? []).map(m => ({ role: m.role, content: m.content }))
  })
}
```

### Save Messages (server-side in chat route)
```typescript
// Source: verified against existing Supabase insert patterns in this codebase
// Called as a side-effect in /api/chat/route.ts after each exchange
async function saveMessages(
  supabase: SupabaseClient,
  sessionId: string,
  userMessage: string,
  assistantMessage: string
) {
  await supabase.from('chat_messages').insert([
    { session_id: sessionId, role: 'user', content: userMessage },
    { session_id: sessionId, role: 'assistant', content: assistantMessage },
  ])
  // Update session updated_at for recency detection
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
}
```

### Detecting Write Tool Calls in Chat Route
```typescript
// Source: adapted from existing functionCall detection in /api/chat/route.ts
const WRITE_TOOLS = new Set(['create_contact', 'create_deal', 'complete_task'])

// Inside the tool call loop:
if (WRITE_TOOLS.has(fc.name)) {
  const preview = buildActionPreview(fc.name, fc.args as Record<string, unknown>)
  return NextResponse.json({
    pendingAction: {
      tool: fc.name,
      args: fc.args,
      preview,
      sessionId,        // pass session context for confirm route
      history: await chat.getHistory(),
    }
  })
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Storing full Gemini history in DB | Store display messages only, fresh Gemini context per visit | Design decision for this phase | Simpler persistence, no SDK format lock-in |
| One JSON blob per conversation | Normalized rows (one per message) | STATE.md roadmap decision | Enables sliding window queries, future pagination |
| Session as global singleton | Session-per-user scoped by time gap | This phase design | Multiple users supported; natural session breaks |

---

## Open Questions

1. **Should `pendingAction` be included in the persisted messages?**
   - What we know: Confirmation cards are transient UI state, not conversational content. The user decision says "no undo" — the record is immediately real once confirmed.
   - What's unclear: If the user refreshes mid-confirmation (card visible, not yet confirmed), the card disappears after reload. Is this acceptable?
   - Recommendation: Do NOT persist `pendingAction` messages to DB. Only persist the final assistant confirmation message AFTER the user confirms. If user refreshes before confirming, the pending action is silently dropped — this is acceptable behavior.

2. **Does `complete_task` need a confirmation card?**
   - What we know: The CONTEXT.md places it under "Claude's Discretion" for the confirmation approach. Marking a task complete is reversible (user can uncheck it in CRM). The success criteria say "the chat confirms with the task title and completion status."
   - What's unclear: The success criteria describe a POST-action confirmation (confirmation card after completion), not a PRE-action gate.
   - Recommendation: Use confirmation flow (pre-action) for `complete_task` as well, for consistency. The card shows "Mark complete: [task title]" before the write. This is safer and consistent with the other write tools. If the user decides this is too much friction, it can be collapsed to immediate execution in Phase 7.

3. **What is the session gap threshold?**
   - What we know: CONTEXT.md says "session trigger mechanism" is Claude's discretion.
   - Recommendation: 24 hours. Simple to implement, matches intuitive "daily" usage pattern for field reps. A rep who checks the portal twice in one day gets one continuous session; a rep returning the next day gets a fresh visual slate.

---

## Validation Architecture

> `workflow.nyquist_validation` is not present in `.planning/config.json` — the `workflow` object only has `research`, `plan_check`, and `verifier` keys. Nyquist validation is not enabled. Skipping this section.

---

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `src/lib/chat/tools.ts`, `src/app/api/chat/route.ts`, `src/components/portal/PortalChat.tsx` — verified current Gemini integration patterns
- Codebase inspection: `src/lib/actions/contacts.ts`, `src/lib/actions/deals.ts`, `src/lib/actions/tasks.ts` — verified DB write patterns and field names
- Codebase inspection: `supabase/migrations/20260222102918_create_crm_entity_tables.sql` — verified live schema (contacts, deals, tasks, organizations, pipeline_stages fields)
- Supabase MCP `list_tables` query — confirmed no `chat_sessions` or `chat_messages` tables exist yet
- Supabase MCP `execute_sql` — confirmed live pipeline stages: Lead, Qualified, Demo, Proposal, Closed Won, Closed Lost
- `https://ai.google.dev/gemini-api/docs/function-calling` — verified tool_config modes (AUTO/ANY/NONE), multi-turn history pattern, human-in-the-loop recommendation

### Secondary (MEDIUM confidence)
- WebSearch: Gemini function calling two-step confirmation pattern — confirmed human-in-the-loop is documented best practice, no native pause mechanism exists in SDK
- WebSearch: `ai-sdk.dev/elements/components/confirmation` — confirmed confirmation card pattern exists in Vercel AI SDK ecosystem (not directly applicable here but validates the UX approach)

### Tertiary (LOW confidence)
- WebSearch: Supabase chat_messages schema patterns — general community patterns, all consistent with the normalized one-row-per-message approach

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, versions confirmed from package.json
- Schema design: HIGH — directly derived from existing migration patterns in codebase
- Tool execution code: HIGH — directly adapted from existing `executeTool` cases in tools.ts
- Confirmation flow architecture: MEDIUM — no established reference implementation found; pattern is novel for this codebase but is logically sound and verifiable
- Auth redirect preservation: HIGH — proxy.ts code read directly, Next.js searchParams pattern is standard

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (30 days — stack is stable)
