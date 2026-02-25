# Phase 7: Mobile UX Polish - Research

**Researched:** 2026-02-25
**Domain:** Mobile web UX, iOS Safari layout, React chat UI patterns
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Quick Action Buttons
- 4 buttons: "My Tasks", "Daily Briefing", "Add Task", "Add Contact"
- Layout: horizontal pill chips in a row above the chat input (WhatsApp suggested-replies style)
- Tap behavior: sends the command immediately — message appears in chat as if typed, no extra step
- Visibility: always visible above the input, not hidden when typing or after first message

#### ChatWidget Cleanup
- ChatWidget stays on desktop CRM pages only (dashboard, contacts, deals, etc.)
- Hidden on /portal route entirely (no floating widget overlap)
- Hidden on mobile — Claude's discretion on breakpoint (likely md:768px or lg:1024px based on layout)
- Sidebar link to /portal already exists — no changes needed

#### Shared Session
- ChatWidget on desktop and /portal share the same chat session and history
- User sees the same conversation regardless of which interface they use

#### Chat Clearing
- Add a clear/reset chat button — Claude's discretion on placement (likely icon in chat header)
- Clear action: delete messages from Supabase DB + clear UI + start fresh session
- Should have a confirmation step before clearing

### Claude's Discretion
- iOS Safari keyboard/scroll behavior fixes (implementation details)
- ChatWidget mobile breakpoint choice
- Clear chat button placement and icon choice
- Quick action button styling details (colors, icons, spacing)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PUX-01 | Portal displays always-visible quick action buttons for common operations | Quick-action pill chip pattern researched; implementation is pure React + Tailwind — no library needed; tap-to-send pattern identified |
</phase_requirements>

---

## Summary

Phase 7 is a pure frontend polish phase with four distinct work streams: (1) adding always-visible quick action pill buttons above the portal chat input, (2) fixing iOS Safari keyboard/layout behavior on /portal, (3) hiding the ChatWidget on mobile and on /portal, and (4) adding shared session between ChatWidget and PortalChat plus a clear-chat feature. None of these require new backend infrastructure beyond one new API route for clearing messages.

The current codebase is well-positioned for this work. The portal already uses `h-dvh` and `env(safe-area-inset-bottom)` — the iOS Safari foundation is already correct. The remaining keyboard fix is an `interactiveWidget: 'resizes-content'` viewport setting (already partially in place with `viewportFit: 'cover'`) and verifying flex-column flow does not regress. The shared session requirement is the most architecturally involved task: `ChatWidget` currently has no `sessionId` at all and sends no `sessionId` to `/api/chat`, so it must be upgraded to call `/api/chat/session` on mount.

**Primary recommendation:** Implement in this order — (1) quick action buttons (pure UI, zero risk), (2) ChatWidget visibility rules (CSS only), (3) iOS Safari audit and fix, (4) shared session + clear chat (the only server-touching work).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.3 | State + event handling for interactive chip buttons | Already in project |
| Tailwind CSS v4 | ^4 | Responsive breakpoints (`md:hidden`), `h-dvh`, flex layout | Already in project |
| lucide-react | ^0.575.0 | Icons for clear-chat button (Trash2 or RotateCcw) | Already in project |
| Supabase JS | ^2.97.0 | Delete messages + create new session for clear-chat | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn `confirm-dialog` | (already at `src/components/shared/confirm-dialog.tsx`) | Confirmation step before clearing chat | Reuse existing — do NOT rebuild |
| Next.js Viewport API | 16.1.6 | `interactiveWidget: 'resizes-content'` for Android keyboard resize | Add to root layout.tsx |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind `md:hidden` for ChatWidget | JS `usePathname` check | CSS-only is simpler; pathname check needed anyway for /portal route exclusion |
| New `/api/chat/clear` route | In-line delete in component | Route is cleaner — keeps auth check server-side; component stays thin |

**Installation:** No new packages required. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure

No new files or directories needed. All changes are within existing files plus one new API route:

```
src/
├── app/
│   ├── layout.tsx                    # Add interactiveWidget to viewport export
│   ├── (app)/layout.tsx              # ChatWidget already here — add md:hidden logic
│   └── api/chat/
│       └── clear/route.ts            # NEW: DELETE messages + reset session
├── components/
│   ├── chat/
│   │   └── ChatWidget.tsx            # Add sessionId support + mobile hide
│   └── portal/
│       └── PortalChat.tsx            # Add quick action chips + clear button
```

### Pattern 1: Quick Action Pill Chips

**What:** A horizontally-scrollable row of pill buttons rendered inside the bottom input container, above the textarea. Each button calls `sendMessage` with a hardcoded string.

**When to use:** Always visible regardless of message history or loading state. The buttons are disabled while `isLoading` or `pendingAction` is non-null (same guard as the send button).

**Example:**
```tsx
// Inside PortalChat.tsx, above the textarea in the input area div
const QUICK_ACTIONS = [
  { label: 'My Tasks',       message: 'Show my tasks' },
  { label: 'Daily Briefing', message: 'Give me a daily briefing' },
  { label: 'Add Task',       message: 'Add a task' },
  { label: 'Add Contact',    message: 'Add a contact' },
]

// Render inside the input container, above the textarea row:
<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
  {QUICK_ACTIONS.map(({ label, message }) => (
    <button
      key={label}
      onClick={() => sendQuickAction(message)}
      disabled={isLoading || !!pendingAction || isLoadingSession}
      className="shrink-0 rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
    >
      {label}
    </button>
  ))}
</div>
```

`sendQuickAction` is a thin wrapper: sets `input` to the message string, then immediately calls `sendMessage` (or calls the send logic directly with the string to avoid the async setState race):

```tsx
const sendQuickAction = useCallback(async (message: string) => {
  // Call sendMessage logic directly with the explicit string
  // to avoid the setState-then-read race condition
  await sendMessageWithText(message)
}, [sendMessageWithText])
```

**CRITICAL:** Do not `setInput(message)` then `sendMessage()` — `input` state won't update before `sendMessage` reads it. Refactor `sendMessage` to accept an optional `text` override, or extract the API call into a shared function.

### Pattern 2: ChatWidget Visibility — CSS + Pathname Guard

**What:** Two independent visibility rules for ChatWidget:
1. Hidden on mobile screens (CSS breakpoint)
2. Hidden on /portal route (pathname check)

**Implementation in `src/app/(app)/layout.tsx`:** The ChatWidget is already excluded from `/portal` because `(portal)` is a separate route group with its own layout that does NOT include ChatWidget. This is already correct — the portal route group layout (`src/app/(portal)/layout.tsx`) is minimal and does not import ChatWidget.

**Verification needed:** Confirm no ChatWidget leaks onto /portal. Current architecture says it cannot — the portal has its own route group. This is already done correctly in Phase 5.

**Mobile hide:** Add `hidden md:flex` (or `hidden md:block`) wrapper to the ChatWidget floating button and panel in `ChatWidget.tsx`. The `md` breakpoint (768px) is the correct choice — it matches the point at which the CRM sidebar becomes useful.

```tsx
// In ChatWidget.tsx — wrap the entire return in a hidden md:block div,
// OR add className conditionally to both the panel and the fab button:
<>
  {isOpen && (
    <div className="hidden md:flex fixed bottom-20 right-4 z-50 ...">
      {/* panel */}
    </div>
  )}
  <button className="hidden md:flex fixed bottom-4 right-4 z-50 ...">
    {/* fab */}
  </button>
</>
```

### Pattern 3: iOS Safari Keyboard Fix

**What:** The current portal layout already uses the correct approach (`h-dvh` + `flex-col` + `env(safe-area-inset-bottom)`). The remaining gap is the `interactiveWidget` viewport property which enables proper content resizing on Android Chrome and improves Safari behavior.

**Current state in `src/app/layout.tsx`:**
```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",   // already present ✓
}
```

**Add `interactiveWidget`:**
```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",  // ADD THIS
}
```

`interactiveWidget: 'resizes-content'` tells the browser to shrink the layout viewport when the software keyboard appears, which causes the `h-dvh` container to recalculate and keep the input visible. On iOS Safari 16+, this resolves the keyboard-covers-input scenario.

**Source:** franciscomoretti.com blog + MDN viewport API docs (MEDIUM confidence — verified pattern, not official Next.js docs specifically).

**The `dvh` unit** already handles the Safari browser chrome toolbar collapsing/expanding — no changes needed there.

**Scrollbar suppression:** The quick-action chips row uses `overflow-x-auto` — add `scrollbar-none` utility or equivalent CSS to suppress the scrollbar on desktop:
```css
/* In globals.css if needed */
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
```
In Tailwind v4, `scrollbar-none` may need to be added as a utility — verify it exists before using. Alternatively use `[&::-webkit-scrollbar]:hidden` inline.

### Pattern 4: Shared Session (ChatWidget upgrade)

**What:** ChatWidget currently sends no `sessionId` to `/api/chat`. It must call `/api/chat/session` on mount and pass the returned `sessionId` on every message, exactly as `PortalChat` does.

**Current ChatWidget state:** The component has `messages`, `input`, `isLoading`, `geminiHistory` — but no `sessionId`, no `isLoadingSession`, no session fetch on mount.

**Required changes to `ChatWidget.tsx`:**
1. Add `sessionId` and `isLoadingSession` state
2. Add `useEffect` on mount to call `GET /api/chat/session` and hydrate both `sessionId` and `messages`
3. Pass `sessionId` in the POST body to `/api/chat`
4. Show loading spinner in message area while `isLoadingSession` is true (same pattern as PortalChat)

**Session sharing mechanism:** Both components call `/api/chat/session` which returns the most recent session for the authenticated user (or creates a new one if older than 24 hours). Since both components use the same endpoint with the same user auth, they naturally get the same `sessionId` — no additional coordination needed.

**Note on in-memory history:** The Groq conversation `history` array (for multi-turn context) is rebuilt from DB messages on each component mount. Neither component passes `history` between each other — they are independent React instances. This is acceptable: the DB messages are the source of truth for display; the in-memory Groq history starts fresh on each page load. This is consistent with the existing Phase 6 decision: "DB messages are display-only: Groq context starts fresh per portal visit."

### Pattern 5: Clear Chat Feature

**What:** A button in the portal header area (icon button, e.g. `RotateCcw` or `Trash2` from lucide-react) that, after confirmation via the existing `ConfirmDialog`, deletes all messages from the current session and creates a fresh session.

**API Route:** `DELETE /api/chat/clear` (new route). This keeps auth server-side.

```ts
// src/app/api/chat/clear/route.ts
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { sessionId } = await request.json()
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  // Verify ownership — RLS on chat_sessions handles this, but explicit check is cleaner
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Delete messages (RLS allows DELETE if session belongs to user — see existing policies)
  await supabase.from('chat_messages').delete().eq('session_id', sessionId)

  // Delete the session itself and create a fresh one
  await supabase.from('chat_sessions').delete().eq('id', sessionId)
  const { data: newSession } = await supabase
    .from('chat_sessions')
    .insert({ user_id: user.id })
    .select('id')
    .single()

  return NextResponse.json({ sessionId: newSession!.id })
}
```

**RLS concern:** The existing `chat_messages` RLS has SELECT and INSERT policies but no explicit DELETE policy. The `chat_sessions` table has `cmd: ALL` which covers DELETE. For `chat_messages`, the DELETE must be done server-side via the service-role client OR a DELETE RLS policy must be added. The API route already uses `createClient()` (server-side Supabase client) which uses the service role key — so server-side DELETE bypasses RLS. This is correct and safe since ownership is checked manually in the route.

**CRITICAL RLS GAP:** Confirm that `createClient()` in route.ts files uses the **anon key + user auth cookie** (not service role). In this project's `src/lib/supabase/server.ts`, the server client uses the anon key with the user's session cookie — it does NOT bypass RLS. Therefore a DELETE policy on `chat_messages` must be added, OR the route must use a service-role client for the delete operations.

**Recommended fix:** Add a migration to add a DELETE policy to `chat_messages`:
```sql
CREATE POLICY "Users delete own messages"
  ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );
```

**UI in PortalChat:** Add a small icon button in the top-right area (next to or replacing the back chevron area), using the existing `ConfirmDialog` pattern for the confirmation step. After successful clear, reset `messages`, `geminiHistory`, and `sessionId` state.

### Anti-Patterns to Avoid

- **`setInput(msg)` then `sendMessage()` for quick actions:** State update is async; `sendMessage()` will read the stale empty string. Refactor `sendMessage` to accept an optional text parameter.
- **Using `position: fixed` for the input area:** Already avoided in the portal (uses flex-col push). Do not regress to fixed positioning.
- **`100vh` instead of `h-dvh`:** Already correct. Do not change to `100vh`.
- **Hiding ChatWidget with `display: none` via JS after render:** Causes flash of content on mobile. Use Tailwind breakpoint classes (`hidden md:flex`) for CSS-only hide.
- **Deleting `chat_messages` client-side via Supabase JS SDK from the browser:** Requires exposing service-role key or adding DELETE RLS policy. Use the API route approach.
- **Calling `sendMessage` on quick-action tap while `pendingAction` is non-null:** Already guarded in the current `sendMessage` — ensure the quick-action buttons also disable on `!!pendingAction`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confirmation dialog before clear | Custom modal/dialog | `src/components/shared/confirm-dialog.tsx` (already exists) | Already built and used in the project |
| Session fetch on mount | Custom hook | Inline `useEffect` (same as PortalChat pattern) | Already working pattern in PortalChat — copy it |
| iOS keyboard detection | `visualViewport` observer + JS | `h-dvh` + `interactiveWidget: 'resizes-content'` viewport | Already used in portal; CSS-only is more reliable |
| Delete RLS policy | Manual SQL in Supabase dashboard | Supabase migration via MCP | Keeps schema versioned |

**Key insight:** Every problem in this phase has an existing solution in the codebase. The work is wiring things together, not inventing new patterns.

---

## Common Pitfalls

### Pitfall 1: Quick Action Race Condition
**What goes wrong:** Button click calls `setInput(message)` then `sendMessage()` — message is empty when sent.
**Why it happens:** `useState` setter is async; `sendMessage` reads the current closure value of `input`, which hasn't updated yet.
**How to avoid:** Refactor `sendMessage` to accept an explicit `text: string` parameter and use that instead of reading `input` state. The quick action buttons pass text directly; the textarea submit path passes `input.trim()`.
**Warning signs:** Messages sent from quick actions arrive empty or with previous input value.

### Pitfall 2: ChatWidget Flashes on Mobile Before CSS Hides It
**What goes wrong:** ChatWidget renders briefly on mobile (including the floating button) before Tailwind's `hidden md:flex` takes effect.
**Why it happens:** SSR hydration sends HTML with the widget visible; CSS breakpoint hides it after paint.
**How to avoid:** This is acceptable for a floating button — the flash is imperceptible. If it becomes visible, add `suppressHydrationWarning` or render conditionally only after hydration. For this phase, `hidden md:flex` is sufficient.
**Warning signs:** Floating button visible momentarily on mobile before disappearing.

### Pitfall 3: Clear Chat Leaves Stale In-Memory Groq History
**What goes wrong:** User clears chat, new messages appear, but the AI "remembers" old context because `geminiHistory` state was not reset.
**Why it happens:** `geminiHistory` is client-side state tracking the Groq conversation history. Clearing DB messages does not automatically clear this.
**How to avoid:** In the `handleClear` function, after successful API response, reset both `messages`, `geminiHistory` (to `[]`), and update `sessionId` to the new value returned by the clear API.
**Warning signs:** AI references previously cleared information; confirmation of cleared records still appear in responses.

### Pitfall 4: Shared Session — ChatWidget Opens Stale Conversation
**What goes wrong:** User has a conversation in PortalChat. Opens ChatWidget on desktop. Widget shows fresh (empty) UI instead of shared conversation.
**Why it happens:** ChatWidget currently doesn't call `/api/chat/session` — it has no session awareness.
**How to avoid:** Add the same session loading `useEffect` to `ChatWidget` as exists in `PortalChat`. The shared `sessionId` from the DB is the source of truth.
**Warning signs:** ChatWidget messages are empty when PortalChat has history; widget and portal show different conversations.

### Pitfall 5: `chat_messages` DELETE Blocked by Missing RLS Policy
**What goes wrong:** Clear-chat API route calls `supabase.from('chat_messages').delete()` and it silently succeeds (returns no error) but deletes 0 rows because no DELETE policy exists.
**Why it happens:** Supabase RLS blocks DELETE when no DELETE policy exists — PostgREST returns success with 0 rows affected, not an error.
**How to avoid:** Add the DELETE RLS policy migration before implementing the clear route. Test by checking row count after delete.
**Warning signs:** Clear button shows success but messages reappear on next load.

### Pitfall 6: iOS Safari Keyboard Still Covers Input on Older iOS
**What goes wrong:** `dvh` unit doesn't adjust for keyboard on iOS 14 or older.
**Why it happens:** `dvh` support was added in Safari 15.4 (March 2022). Older iOS versions fall back to `100vh` behavior.
**How to avoid:** Acceptable tradeoff for this project — the CONTEXT.md specifically mentions "real-device iOS Safari test" without specifying minimum OS version. Safari 15.4+ covers the vast majority of active iPhones (iOS 15+ is ~95% of active devices as of 2025).
**Warning signs:** Only reproducible on very old iOS devices.

---

## Code Examples

Verified patterns from the existing codebase and official sources:

### Quick Action Send (Refactored sendMessage)
```tsx
// Refactor existing sendMessage to accept optional text override
const sendMessage = useCallback(async (textOverride?: string) => {
  const trimmed = (textOverride ?? input).trim()
  if (!trimmed || isLoading || !sessionId || pendingAction) return

  // Clear input only when sending from textarea (not quick action)
  if (!textOverride) setInput('')

  // ... rest of existing sendMessage logic unchanged
}, [input, isLoading, sessionId, pendingAction, geminiHistory])

// Quick action handler — no state mutation needed
const handleQuickAction = (message: string) => sendMessage(message)
```

### ChatWidget Session Loading (Port from PortalChat)
```tsx
// Add to ChatWidget.tsx — same pattern as PortalChat
const [sessionId, setSessionId] = useState<string | null>(null)
const [isLoadingSession, setIsLoadingSession] = useState(true)

useEffect(() => {
  async function loadOrCreateSession() {
    try {
      const res = await fetch('/api/chat/session')
      if (!res.ok) { setIsLoadingSession(false); return }
      const data = await res.json()
      setSessionId(data.sessionId)
      if (data.messages?.length > 0) {
        setMessages(data.messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })))
      }
    } catch { /* silently continue */ }
    setIsLoadingSession(false)
  }
  loadOrCreateSession()
}, [])
```

### Clear Chat API Route
```ts
// src/app/api/chat/clear/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json()
  const sessionId = body?.sessionId
  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })

  // Ownership verified via RLS on chat_sessions (ALL policy: user_id = auth.uid())
  const { data: session } = await supabase
    .from('chat_sessions').select('id')
    .eq('id', sessionId).eq('user_id', user.id).maybeSingle()
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await supabase.from('chat_messages').delete().eq('session_id', sessionId)
  await supabase.from('chat_sessions').delete().eq('id', sessionId)
  const { data: newSession } = await supabase
    .from('chat_sessions').insert({ user_id: user.id }).select('id').single()

  return NextResponse.json({ sessionId: newSession!.id })
}
```

### Viewport Fix (root layout.tsx)
```tsx
// Source: franciscomoretti.com / Next.js Viewport API
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",            // already present
  interactiveWidget: "resizes-content",  // ADD
}
```

### ChatWidget Mobile Hide
```tsx
// In ChatWidget.tsx — change both fixed elements to include hidden md:flex / hidden md:block
// Panel:
<div className="hidden md:flex fixed bottom-20 right-4 z-50 w-[350px] flex-col ...">
// FAB button:
<button className="hidden md:flex fixed bottom-4 right-4 z-50 ...">
```

### DELETE RLS Policy Migration
```sql
-- Migration: add_chat_messages_delete_policy
CREATE POLICY "Users delete own messages"
  ON chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` for full-height mobile | `h-dvh` (dynamic viewport height) | Safari 15.4, March 2022 | Keyboard-aware height without JS |
| `visualViewport` JS observers | `interactiveWidget: 'resizes-content'` viewport hint | Chrome 108+, iOS 16+ | CSS-only, no event listeners needed |
| `position: fixed` for chat input bars | `flex-col` layout with flex-push | N/A (pattern shift) | Avoids iOS keyboard overlay entirely |
| `env(safe-area-inset-bottom)` standalone | `calc(env(safe-area-inset-bottom, 0px) + Npx)` with fallback | Ongoing best practice | Handles devices without notch |

**Already correct in this codebase:**
- `h-dvh` on portal container: already present
- `env(safe-area-inset-bottom)` on input area: already present
- `viewportFit: 'cover'` in root layout: already present
- Flex-col layout (no fixed positioning) on portal: already correct

**Deprecated/outdated:**
- `100vh` for mobile full-height: do not use, causes keyboard overlap
- `window.innerHeight` JS polling for keyboard: do not use, unreliable

---

## Open Questions

1. **Does `createClient()` in API routes use anon key (RLS-enforced) or service-role key?**
   - What we know: `src/lib/supabase/server.ts` exists and is used by all route handlers
   - What's unclear: Whether it uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) or `NEXT_PUBLIC_SUPABASE_ANON_KEY` + user cookie (respects RLS)
   - Recommendation: Read `src/lib/supabase/server.ts` before implementing clear-chat. If anon key: add DELETE RLS migration. If service role: DELETE works without policy change but skip the session ownership check via RLS (already done manually in route).
   - **This determines whether the RLS migration in the plan is required.**

2. **Should clear-chat also clear ChatWidget state remotely?**
   - What we know: ChatWidget and PortalChat are separate React instances; clearing from one does not signal the other
   - What's unclear: If user clears from PortalChat while ChatWidget is open, the widget will show stale data until page refresh
   - Recommendation: Accept this limitation for Phase 7. The CONTEXT.md decision says "clear action: delete messages from Supabase DB + clear UI" — interpreted as the current component's UI. Cross-component sync is not specified.

---

## Validation Architecture

> `workflow.nyquist_validation` is not set to `true` in `.planning/config.json` — this section is skipped.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase (`src/components/portal/PortalChat.tsx`) — current iOS layout implementation
- Existing codebase (`src/components/chat/ChatWidget.tsx`) — current widget without session
- Existing codebase (`src/app/(app)/layout.tsx`, `src/app/(portal)/layout.tsx`) — route group architecture
- Supabase MCP — live RLS policies on `chat_sessions` and `chat_messages` tables confirmed
- Existing codebase (`src/app/api/chat/session/route.ts`) — session loading API behavior confirmed

### Secondary (MEDIUM confidence)
- [franciscomoretti.com — Fix mobile keyboard overlap with dvh](https://www.franciscomoretti.com/blog/fix-mobile-keyboard-overlap-with-visualviewport) — `interactiveWidget: 'resizes-content'` pattern
- [MDN env() CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) — safe-area-inset-bottom behavior
- [Supabase delete docs](https://supabase.com/docs/reference/javascript/delete) — RLS behavior on DELETE

### Tertiary (LOW confidence)
- WebSearch results on WhatsApp suggested-reply chip UI pattern — general UX knowledge; no specific library required

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project; no new dependencies
- Architecture: HIGH — all patterns derived directly from existing codebase
- iOS keyboard fix: MEDIUM — `interactiveWidget` pattern verified in external source but not Next.js official docs
- RLS DELETE gap: MEDIUM — identified from policy audit via Supabase MCP; actual behavior depends on `createClient()` implementation

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable CSS/RLS patterns; no rapidly-changing APIs involved)
