# Stack Research

**Domain:** Modern CRM Web Application (Healthcare B2B SaaS)
**Researched:** 2026-02-21 (initial) / 2026-02-25 (v1.1 update — Team Command Portal)
**Confidence:** HIGH — All new versions verified live from npm registry; recommendations verified against official docs.

---

> **SCOPE NOTE (v1.1 update):** This file has been updated to cover stack additions and changes
> for the Team Command Portal milestone. The existing stack section is unchanged — only new
> sections have been added. Scroll to "v1.1 Additions" for portal-specific research.

---

## Existing Stack (v1.0 — Validated, Do Not Re-Research)

*(Already in production — kept here for reference only)*

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.6 | Full-stack React framework (App Router) |
| React | 19.2.3 | UI runtime |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui | 3.x | Component collection |
| Supabase | @supabase/supabase-js 2.97.0 | Database + Auth + RLS |
| @supabase/ssr | 0.8.0 | Server-side Supabase client |
| @google/generative-ai | 0.24.1 | Gemini 2.5 Flash function calling |
| Lucide React | 0.575.0 | Icons |
| Sonner | 2.0.7 | Toast notifications |
| React Hook Form | 7.71.2 | Form management |
| Zod | 4.3.6 | Schema validation |
| @tanstack/react-table | 8.21.3 | Data tables |
| @dnd-kit/* | 6.x / 10.x | Drag-and-drop Kanban |

---

## v1.1 Additions: Team Command Portal

### Decision Summary

The portal requires three new capabilities beyond the existing chat widget:
1. **Markdown rendering** — AI responses use markdown; currently rendered as raw text
2. **Conversation persistence** — DB-backed history across sessions; currently session-only
3. **Auto-resizing textarea** — Full-page mobile input that grows with content

Everything else (auth, data fetching, styling, AI SDK) already exists and requires no new libraries.

---

## New Dependencies to Add

### Core Additions (Install These)

| Library | Version | Purpose | Why This, Not Something Else |
|---------|---------|---------|------------------------------|
| `react-markdown` | 10.1.0 | Render AI responses as formatted markdown | The standard React markdown renderer. Used in thousands of production chat UIs. Works in `'use client'` components without any Next.js transpile configuration. v10 is ESM-only — use inside a client component (the ChatMessage component already is one). Remark/rehype plugin ecosystem means bold, lists, tables, code blocks all work out of the box. |
| `remark-gfm` | 4.0.1 | GitHub Flavored Markdown plugin for react-markdown | Adds tables, task lists, strikethrough — the specific markdown features Gemini uses in responses. Without it, `**bold**` and `- lists` work but pipe tables don't. Required companion to react-markdown. |
| `react-textarea-autosize` | 8.5.9 | Auto-growing textarea for chat input | The de-facto standard drop-in textarea replacement. 1.3KB gzipped. Handles resize via JS measurement, not CSS tricks, so it works reliably on iOS Safari (where `field-sizing: content` is still unreliable). Drop-in replacement — same props as `<textarea>`. Used by Vercel's own AI chatbot templates. |

### What NOT to Add

| Avoid | Why | What to Use Instead |
|-------|-----|---------------------|
| Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`) | The existing `/api/chat` route uses `@google/generative-ai` directly with custom function-calling logic. The AI SDK's `useChat` hook + `streamText` abstraction would require rewriting the entire API route and client logic. For 1-5 users with no streaming requirement, the custom route works. Migration cost exceeds benefit. | Keep existing `@google/generative-ai` 0.24.1 |
| `marked` + `DOMPurify` | Lower-level markdown-to-HTML pipeline requires manual XSS sanitization. react-markdown handles sanitization via its React-element tree (never touches `innerHTML`). Extra complexity for no benefit. | `react-markdown` |
| `@uiw/react-md-editor` | Full markdown editor (toolbar, edit/preview modes). The portal only needs to render AI responses, not let users write markdown. 120KB overkill. | `react-markdown` |
| `framer-motion` | Smooth message animations would be nice but add 100KB+ to bundle. shadcn/ui already includes `tw-animate-css`. Tailwind CSS transitions are sufficient for message fade-in. | Tailwind `animate-in fade-in` utilities via `tw-animate-css` |
| `socket.io` / Supabase Realtime | Real-time multi-user sync is explicitly deferred to v2 in PROJECT.md. Each user's conversation is independent. | Not needed until v2 |
| Zustand (new) | Already not in the project. The portal's state (messages, input, loading) is local UI state — `useState` + `useRef` is exactly right for this scope. | React `useState` / `useRef` |

---

## Database: Conversation Persistence Schema

The only new database work for v1.1 is a `chat_conversations` table (sessions) and `chat_messages` table (rows). No new npm package is needed — the existing Supabase client handles this.

### Recommended Schema

```sql
-- One row per chat session per user
CREATE TABLE public.chat_conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text,                          -- auto-generated from first message, optional
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.chat_conversations(user_id, updated_at DESC);

-- One row per message in a conversation
CREATE TABLE public.chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant')),
  content         text NOT NULL,
  -- Gemini history blob stored per-message for accurate context reconstruction
  -- Avoids re-serializing the full history on every load
  gemini_parts    jsonb,                     -- raw Gemini Content part for history replay
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.chat_messages(conversation_id, created_at ASC);
```

### RLS Policies

Users can only see their own conversations and messages. The existing `private.is_account_member()` security-definer pattern applies.

```sql
-- chat_conversations
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_conversations_own" ON public.chat_conversations
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- chat_messages (through conversation ownership)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_own" ON public.chat_messages
  FOR ALL TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE user_id = (SELECT auth.uid())
    )
  );
```

### Gemini History Persistence Strategy

The existing chat API passes the full `gemini_history` array (raw Gemini `Content[]` objects) back to the client in each response. For persistence:

- On each assistant response, upsert user message + assistant message to `chat_messages`
- Store the raw Gemini `Content` part in `gemini_parts` jsonb column
- On conversation load, reconstruct history by reading messages ordered by `created_at ASC`
- Pass reconstructed history array to `model.startChat({ history: [...] })`

This avoids the complexity of serializing/deserializing the full conversation on every request. Each message is already the atomic unit Gemini needs.

---

## Full-Page Chat Layout: CSS Pattern

No new library needed. Tailwind CSS v4 includes `h-dvh` and `min-h-dvh` classes (confirmed present since v3.4, carried forward). This is the correct approach for mobile chat layouts where the browser address bar appearing/disappearing otherwise causes layout jump.

```tsx
// Portal page shell — correct mobile-safe full-height chat layout
<div className="flex h-dvh flex-col overflow-hidden">
  {/* Fixed header */}
  <header className="shrink-0 border-b ...">...</header>

  {/* Scrollable messages — takes remaining space */}
  <div className="flex-1 overflow-y-auto px-4 py-4">
    {/* messages */}
  </div>

  {/* Fixed input bar */}
  <div className="shrink-0 border-t p-3 pb-[env(safe-area-inset-bottom,0px)]">
    {/* textarea + send button */}
  </div>
</div>
```

Key CSS details:
- `h-dvh` not `h-screen` — dynamic viewport height prevents layout shift when mobile browser UI appears/hides
- `pb-[env(safe-area-inset-bottom,0px)]` on input bar — prevents content from hiding behind iPhone home indicator
- `overflow-y-auto` on message area only — parent `overflow-hidden` prevents double scrollbars

---

## Installation

```bash
# Markdown rendering
npm install react-markdown remark-gfm

# Auto-resizing textarea
npm install react-textarea-autosize
```

No additional dev dependencies required — TypeScript types are bundled in `react-markdown` and `remark-gfm`. `react-textarea-autosize` includes its own types at `@types/react-textarea-autosize` (not required for modern TS, types bundled in the package itself for recent versions).

---

## Alternatives Considered

| Decision | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Markdown renderer | `react-markdown` 10.1.0 | `markdown-to-jsx` | markdown-to-jsx auto-detects RSC vs client; no `'use client'` needed. However, the chat message component is already `'use client'` (it uses state/refs), so this advantage doesn't apply here. react-markdown has wider adoption, better plugin ecosystem (remark/rehype). |
| Markdown renderer | `react-markdown` 10.1.0 | Vercel AI SDK `MemoizedMarkdown` | The AI SDK ships its own optimized markdown renderer with memoization for streaming. Excellent choice IF migrating to Vercel AI SDK. Since we're staying with the custom route, this is not available standalone. |
| Textarea | `react-textarea-autosize` | CSS `field-sizing: content` | A native CSS property that eliminates JS-based resizing entirely. Browser support is ~85% as of 2026 — Chrome/Edge/Firefox support it; Safari TP has partial support. Not yet reliable enough for a mobile-first app where the primary browser is mobile Safari. Use `react-textarea-autosize` now; revisit when Safari ships full support. |
| Textarea | `react-textarea-autosize` | Manual `useLayoutEffect` resize | Roll-your-own resize logic. react-textarea-autosize is 1.3KB and handles edge cases (padding, border-box, max-height, minRows/maxRows). No reason to DIY this. |
| AI SDK migration | Keep `@google/generative-ai` | Migrate to `ai` + `@ai-sdk/google` | AI SDK 6.x with @ai-sdk/google 3.x supports Gemini 2.5 Flash, streaming, and tool calling. Migration path exists (streamText + useChat). The tradeoff: migration would require rewriting the existing API route and chat state logic. Benefit: streaming responses, unified API. This is a valid v2 upgrade if streaming becomes a requirement. |
| Conversation history | Custom `chat_messages` table | Vercel AI SDK `useChat` with `initialMessages` | `useChat` has a built-in `initialMessages` prop for DB-backed history. Only useful if migrating to AI SDK. With the existing custom API route, a custom table is the correct approach. |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `react-markdown` 10.1.0 | React 19.x | react-markdown v10 targets React 18+; works with React 19. Must be used in a `'use client'` component due to ESM + Next.js module resolution. |
| `react-markdown` 10.1.0 | `remark-gfm` 4.0.1 | remark-gfm 4.x targets remark-parse 11+ (remark 15+). react-markdown 10.x ships remark 15. Compatible. |
| `react-textarea-autosize` 8.5.9 | React 19.x | Tested against React 16+. React 19 compatible (passive prop model unchanged). |
| `react-markdown` 10.1.0 | Tailwind CSS 4.x | No conflict. Rendered HTML elements styled via Tailwind `prose` or custom class mapping via `components` prop. |

---

## Sources

- npm registry live query (2026-02-25) — `react-markdown@10.1.0`, `remark-gfm@4.0.1`, `react-textarea-autosize@8.5.9`, `ai@6.0.99`, `@ai-sdk/google@3.0.31` versions confirmed (HIGH confidence)
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) — ESM-only, React 18+ requirement, plugin compatibility (HIGH confidence)
- [remark-gfm GitHub](https://github.com/remarkjs/remark-gfm) — v4.0.1 targets remark-parse 11+ (HIGH confidence)
- [react-markdown/issues/869](https://github.com/remarkjs/react-markdown/issues/869) — Next.js 15/16 compatibility issue: resolved by using inside `'use client'` component (HIGH confidence)
- [ai-sdk.dev/providers/google](https://ai-sdk.dev/providers/ai-sdk-providers/google-generative-ai) — Gemini 2.5 Flash + tool calling support in @ai-sdk/google confirmed (HIGH confidence)
- WebSearch: Tailwind CSS v4 `h-dvh` / `min-h-dvh` classes — confirmed present since v3.4, carried to v4 (HIGH confidence, multiple sources)
- WebSearch: `field-sizing: content` browser support — ~85%, Safari mobile unreliable (MEDIUM confidence)
- WebSearch: Vercel AI SDK vs custom route — migration path confirmed, kept custom route for this milestone (MEDIUM confidence)
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policy pattern for per-user rows (HIGH confidence)

---

*Stack research for: Modern CRM Web Application (Healthcare B2B SaaS)*
*Initial research: 2026-02-21*
*v1.1 Team Command Portal update: 2026-02-25*
