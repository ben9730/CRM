# Phase 5: Portal Foundation & API Safety - Research

**Researched:** 2026-02-25
**Domain:** Next.js route groups, mobile-first chat UI, markdown rendering, Gemini rate limit handling, tool module extraction
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Chat interface design:**
- Bubble style messages: user messages as colored bubbles on the right, AI responses as lighter bubbles on the left (iMessage/WhatsApp pattern)
- No header bar — full-screen chat experience on all devices, maximizing chat space
- Empty state is just the input field — no greeting, no suggestion chips, no prompts. Clean and fast
- Loading indicator: spinner in the message area while waiting for AI response (not typing dots)

**Portal navigation:**
- Entry point: sidebar link in the CRM navigation (labeled "Portal" or "AI Chat")
- Direct bookmark access supported — users can save /portal to their phone home screen and open it directly. Auth gate still applies
- Back-to-CRM navigation approach: Claude's discretion (subtle back icon vs browser back)
- Portal layout (separate vs sidebar on desktop): Claude's discretion based on codebase patterns

**Rate limit experience:**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PORTAL-01 | User can access a full-page chat interface at /portal that requires Supabase authentication | Route group `(portal)` sibling to `(app)`, new layout.tsx with no sidebar, auth gate via existing proxy.ts |
| PORTAL-02 | Portal uses mobile-first responsive layout optimized for phone usage (dvh units, safe area insets) | `h-dvh` Tailwind class + `env(safe-area-inset-bottom)` + `viewport-fit=cover`, flex column layout, no `position: fixed` for input |
| PORTAL-03 | Portal renders AI responses with markdown formatting (bold, lists, headers, code blocks) | `react-markdown@10` + `remark-gfm@4` — no `rehype-raw` needed (no HTML in AI responses); custom Tailwind `components` prop for styled elements |
| PORTAL-04 | Portal displays a user-friendly error message when Gemini rate limit is exceeded | Detect `error.message?.includes("429") \|\| error.message?.includes("RESOURCE_EXHAUSTED")`; return `{ rateLimited: true, retryAfterSeconds }` from API route; render friendly chat bubble |
| PORTAL-05 | Portal hides the existing floating chat widget to avoid duplication | `(portal)` route group has its own `layout.tsx` that does NOT render `<ChatWidget>` — widget only lives in `(app)/layout.tsx` |
| AITOOL-05 | Chat tool definitions extracted to shared module for maintainability | Move `tools` array and `executeTool` function from `route.ts` → `src/lib/chat/tools.ts`; route.ts imports and uses them |
</phase_requirements>

---

## Summary

Phase 5 builds a standalone full-page AI chat portal at `/portal` for mobile field sales reps. The key technical work covers four distinct areas: (1) creating a new Next.js route group `(portal)` that shares the root layout (theme, fonts) but has its own portal-specific layout with no CRM sidebar or floating widget; (2) a mobile-first flex-column chat UI using `h-dvh` so the layout respects the iOS virtual keyboard without JavaScript gymnastics; (3) markdown rendering via `react-markdown` + `remark-gfm` so AI responses render as formatted text instead of raw symbols; and (4) rate limit protection in the API route that returns a structured `rateLimited` flag the portal UI renders as a friendly chat bubble.

The auth gate is already handled by `proxy.ts` — `/portal` is not an auth route so unauthenticated users will be redirected to `/login` automatically. The floating `<ChatWidget>` problem is architectural: because it lives in `(app)/layout.tsx`, the sibling `(portal)` group simply never renders it. No conditional hiding logic needed. Tool extraction (AITOOL-05) is pure refactoring — move `tools[]` and `executeTool()` from `route.ts` into `src/lib/chat/tools.ts` and re-import.

The project uses Next.js 16, React 19, Tailwind v4 (CSS-only, no config file), `@google/generative-ai@0.24.1`, `@supabase/ssr@0.8.0`, and Geist font. All new code must follow existing conventions: dark-mode-only, OKLCH color palette, no `tailwind.config.js`, route group structure with `(app)` and `(auth)` already established.

**Primary recommendation:** Build the `(portal)` route group with its own minimal layout, use `h-dvh flex flex-col` for the chat container, install `react-markdown` + `remark-gfm`, and add a `rateLimited` boolean to the API response JSON so the portal can render a friendly error bubble without leaking raw error strings.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-markdown | 10.1.0 | Render Markdown strings as React components | Safe (no dangerouslySetInnerHTML), plugin-based, React 19 compatible, standard for AI chat UIs |
| remark-gfm | 4.x | GitHub Flavored Markdown — bold, lists, tables, strikethrough, task lists | Required plugin; basic Markdown alone does not parse `**bold**` lists or `- items` |

### Already Installed (no install needed)
| Library | Version | Purpose | Note |
|---------|---------|---------|------|
| @google/generative-ai | 0.24.1 | Gemini SDK — already used in `/api/chat/route.ts` | Extend existing usage |
| @supabase/ssr | 0.8.0 | Auth — already used; portal auth gate is free via proxy.ts | No new auth work |
| lucide-react | 0.575.0 | Icons (ChevronLeft for back nav, Loader2 for spinner) | Already installed |
| tailwindcss | v4 | CSS-only utility classes including `h-dvh` | Already configured in globals.css |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| rehype-raw | 3.x | Parse raw HTML inside Markdown | NOT needed for this phase — AI responses don't emit HTML; adds unnecessary XSS surface |
| rehype-highlight | 7.x | Syntax highlighting for code blocks | Claude's discretion — simple monospace is sufficient for v1.1; can add in Phase 7 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-markdown | marked + dangerouslySetInnerHTML | marked is faster but requires sanitization (DOMPurify); react-markdown is safe by default — correct choice for AI output |
| react-markdown | MDX | MDX is compile-time only; cannot render runtime AI response strings |
| react-markdown | Custom regex parser | Hand-rolling markdown parsing is always wrong — edge cases in bold/italic/code nesting are extensive |

**Installation:**
```bash
npm install react-markdown remark-gfm
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/app/
├── (app)/           # Existing CRM — has sidebar + ChatWidget
│   ├── layout.tsx   # AppShell + ChatWidget (UNCHANGED)
│   ├── dashboard/
│   ├── contacts/
│   └── ...
├── (auth)/          # Existing auth pages — no sidebar
│   ├── layout.tsx
│   └── login/ signup/ etc.
├── (portal)/        # NEW — full-screen portal, no sidebar, no widget
│   ├── layout.tsx   # PortalLayout — minimal, just ThemeProvider already in root
│   └── portal/
│       └── page.tsx # PortalPage — full-page chat
└── layout.tsx       # Root layout — GeistSans, ThemeProvider (UNCHANGED)

src/lib/chat/        # NEW — shared chat module
└── tools.ts         # Extracted tools[] + executeTool() from route.ts

src/components/portal/    # NEW
├── PortalChat.tsx         # Client component — main chat UI
├── PortalMessage.tsx      # Bubble message with react-markdown
└── PortalInput.tsx        # Textarea input fixed above keyboard
```

### Pattern 1: Route Group for Separate Layout

**What:** Next.js route groups `(portal)` live alongside `(app)` and `(auth)` as siblings under `src/app/`. The folder name in parentheses is excluded from the URL — so `src/app/(portal)/portal/page.tsx` maps to `/portal`.

**When to use:** When a URL path needs a completely different layout (no sidebar, no floating widget) without adding middleware complexity.

**Why it eliminates the ChatWidget problem:** `<ChatWidget>` is rendered in `(app)/layout.tsx`. The `(portal)` route group has its own `layout.tsx` — the widget is never imported, never rendered. Zero conditional logic needed.

**Example:**
```typescript
// src/app/(portal)/layout.tsx
// Source: Next.js App Router route groups — https://nextjs.org/docs/app/api-reference/file-conventions/route-groups

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Intentionally minimal — no AppShell, no ChatWidget, no sidebar
  // Root layout.tsx already provides ThemeProvider + fonts
  return <>{children}</>
}
```

**Auth gate:** The existing `proxy.ts` (Next.js 16 middleware) already redirects unauthenticated users to `/login` for ALL routes that are not auth routes. `/portal` is not an auth route, so auth protection is free — no new code required.

### Pattern 2: Mobile-First Chat Layout with dvh

**What:** Use `h-dvh` (dynamic viewport height) as the container height so the layout automatically shrinks when the iOS virtual keyboard appears. Use `flex flex-col` so the message list expands and the input stays at the bottom.

**When to use:** Any full-height mobile chat UI where the input must stay visible above the iOS keyboard.

**Key insight:** `dvh` is the correct modern unit. The old `100vh` does NOT shrink when the iOS keyboard appears. The newer `dvh` unit represents the *dynamic* viewport — it shrinks when UI chrome (keyboard, browser bars) appears. Tailwind v4 includes `h-dvh` out of the box.

**Important requirement:** For `env(safe-area-inset-bottom)` (iPhone notch/home indicator safe area) to work, `viewport-fit=cover` must be set in the viewport meta tag.

**Example:**
```typescript
// src/components/portal/PortalChat.tsx
// Uses Tailwind v4 dvh — no custom CSS needed

export function PortalChat() {
  return (
    // h-dvh shrinks with iOS keyboard; flex-col pushes input to bottom
    <div className="flex h-dvh flex-col bg-background">
      {/* Scrollable message area — takes all remaining space */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* messages */}
      </div>

      {/* Input pinned to bottom — safe area padding for iPhone home bar */}
      <div
        className="border-t border-border/50 px-3 py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        {/* textarea + send button */}
      </div>
    </div>
  )
}
```

**Why NOT `position: fixed` for the input:** Fixed positioning creates a separate stacking context that does NOT interact with the iOS virtual keyboard correctly. Flex column layout is the correct pattern — the container resizes via `dvh`, the flex child input stays at the bottom naturally.

### Pattern 3: react-markdown with Tailwind Styled Components

**What:** Pass a `components` prop to `<Markdown>` to map HTML elements to Tailwind-styled JSX. This avoids needing a CSS prose plugin (like `@tailwindcss/typography`) — styles are applied inline per element.

**When to use:** AI response rendering where output is markdown text (not HTML). Provides full visual control without global CSS.

**Example:**
```typescript
// src/components/portal/PortalMessage.tsx
// Source: https://github.com/remarkjs/react-markdown

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdownComponents = {
  // Paragraphs — preserve leading whitespace behavior
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  // Bold
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  // Headers
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="mb-2 text-base font-bold">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-1.5 text-sm font-bold">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-1 text-sm font-semibold">{children}</h3>
  ),
  // Unordered list
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
  ),
  // Ordered list
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  // Inline code
  code: ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const isBlock = !!className // fenced code blocks have a language className
    if (isBlock) {
      return (
        <code className="block rounded-md bg-muted/60 p-3 font-mono text-xs leading-relaxed overflow-x-auto">
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">{children}</code>
    )
  },
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-2 overflow-x-auto rounded-md">{children}</pre>
  ),
}

export function PortalMessage({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-muted/50 text-foreground'
        }`}
      >
        {isUser ? (
          <p>{content}</p>
        ) : (
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {content}
          </Markdown>
        )}
      </div>
    </div>
  )
}
```

### Pattern 4: Rate Limit Detection and Friendly Response

**What:** In the `/api/chat` route handler, catch errors and detect rate limit conditions by checking for "429" or "RESOURCE_EXHAUSTED" in the error message. Return a structured JSON response with `rateLimited: true` and optional `retryAfterSeconds`. The portal renders this as a friendly chat bubble, not a raw error.

**Why structured response instead of HTTP 429:** The portal's `fetch` call needs to parse the response body to show the friendly message. A structured JSON body (even with HTTP 200 or custom status) keeps the client-side logic simple and consistent.

**Example:**
```typescript
// src/app/api/chat/route.ts — error handling section
// Source: pattern verified across multiple Gemini SDK error reports

  } catch (err) {
    console.error('Chat API error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'

    // Detect Gemini rate limit (RPM or RPD exceeded)
    const isRateLimited =
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED')

    if (isRateLimited) {
      // Parse retry-after from error if available; default to 60s
      const retryMatch = errorMessage.match(/(\d+)\s*second/i)
      const retryAfterSeconds = retryMatch ? parseInt(retryMatch[1]) : 60

      return NextResponse.json(
        {
          rateLimited: true,
          retryAfterSeconds,
          // Friendly message for the portal to display
          friendlyMessage: "I'm taking a breather — try again in a minute",
        },
        { status: 429 }
      )
    }

    return NextResponse.json({ error: `AI error: ${errorMessage}` }, { status: 500 })
  }
```

```typescript
// Portal client-side handling
const res = await fetch('/api/chat', { method: 'POST', ... })
const data = await res.json()

if (data.rateLimited) {
  // Render as an assistant chat bubble with friendly message
  setMessages(prev => [...prev, {
    role: 'assistant' as const,
    content: data.friendlyMessage || "I'm taking a breather — try again in a minute",
    isRateLimit: true,
  }])
  return
}
```

### Pattern 5: Tool Extraction to Shared Module

**What:** Move the `tools` array (FunctionDeclaration[]) and the `executeTool` function out of `route.ts` into `src/lib/chat/tools.ts`. The route imports from there. This is a pure refactor — same logic, new location.

**Why AITOOL-05 before Phase 6:** Phase 6 adds new tools (create_contact, create_deal, complete_task, daily_briefing). Adding them to a monolithic route.ts would make the file unmanageable. Extraction now makes Phase 6 straightforward.

**Example:**
```typescript
// src/lib/chat/tools.ts
import { type FunctionDeclaration, type FunctionResponsePart, SchemaType } from '@google/generative-ai'

export const chatTools: FunctionDeclaration[] = [
  // ... existing tools array moved here verbatim
]

export async function executeTool(
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: Record<string, unknown>,
  supabase: any
): Promise<unknown> {
  // ... existing executeTool function moved here verbatim
}
```

```typescript
// src/app/api/chat/route.ts — after extraction
import { chatTools, executeTool } from '@/lib/chat/tools'

// ... rest of route.ts uses chatTools and executeTool
```

### Sidebar Navigation: Add Portal Link

**What:** Add a "AI Chat" or "Portal" link to the existing `navItems` array in `AppSidebar`. The link navigates to `/portal` and opens in the same tab. Since `/portal` has no sidebar, the browser navigates to a full-page layout.

**Note:** The sidebar uses `pathname.startsWith(item.href)` for active state. Use `/portal` as the href — the route group `(portal)` folder doesn't appear in URLs.

**Anti-Patterns to Avoid**
- **Using `position: fixed` for the chat input on mobile:** Fixed elements don't interact with the iOS virtual keyboard correctly. The container collapses with `dvh` — the input stays at the bottom via flex naturally.
- **Rendering raw AI error strings in the UI:** Never show `error.message` in the chat UI — it may contain internal details. Always show a pre-written friendly string.
- **Using `100vh` instead of `dvh` for the portal container:** `100vh` does not shrink on iOS when the keyboard opens. The input will be hidden behind the keyboard.
- **Importing `rehype-raw` for AI chat:** AI responses are markdown text, not HTML. `rehype-raw` adds XSS surface area with no benefit here.
- **Hiding ChatWidget with `usePathname` in a Client Component:** The route group architecture means the widget is simply never rendered on `/portal`. Don't add conditional pathname logic — it's fragile.
- **Putting portal page inside `(app)` route group:** It would inherit the sidebar layout. It must be a sibling route group.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown parsing | Custom regex for `**bold**`, `# headers`, `` `code` `` | react-markdown + remark-gfm | Nested markdown, escaping, edge cases (bold inside list items, code fence language identifiers) — countless edge cases |
| Mobile keyboard detection | `window.resize` event listener + height calculation | `h-dvh` Tailwind class | `dvh` is a CSS standard supported in all modern browsers; JS detection is fragile and laggy |
| Rate limit error parsing | Parsing Gemini SDK error objects deeply | Simple `message.includes("429")` check | The error message format is consistent; deep parsing is brittle across SDK versions |
| Auth guard for /portal | New middleware logic | Existing `proxy.ts` — automatically covers all non-auth routes | Already protects all routes except `/login`, `/signup`, `/forgot-password` |

**Key insight:** The biggest custom-build trap in this phase is the mobile keyboard layout. Developers often reach for JavaScript `visualViewport` observers or `window.resize` listeners. `h-dvh` solves the problem in a single Tailwind class — no JavaScript needed.

---

## Common Pitfalls

### Pitfall 1: Portal URL Requires `portal` Folder Inside `(portal)` Group

**What goes wrong:** Developer creates `src/app/(portal)/page.tsx` — this maps to `/` (same as root), not `/portal`. The portal page conflicts with the dashboard.

**Why it happens:** Route groups eliminate the group folder from the URL path, but the page still needs its own named folder to produce the correct URL segment.

**How to avoid:** Structure is `src/app/(portal)/portal/page.tsx` → URL `/portal`. The group `(portal)` is invisible; the `portal/` folder inside it creates the URL segment.

**Warning signs:** If you navigate to `/portal` and see the dashboard — the page is in the wrong location.

### Pitfall 2: `100vh` vs `dvh` — Input Hidden by iOS Keyboard

**What goes wrong:** Chat input is hidden behind the iOS virtual keyboard when the user taps the text field.

**Why it happens:** `100vh` in iOS Safari is calculated as the full height including browser chrome. When the keyboard opens, `100vh` does not shrink — the bottom of the container (where the input is) slides under the keyboard.

**How to avoid:** Use `h-dvh` (Tailwind v4 built-in). The `dvh` unit dynamically adjusts to the actual visible viewport, which shrinks when the keyboard appears.

**Warning signs:** On desktop everything looks correct; the bug only manifests on a real iOS device with the keyboard open.

### Pitfall 3: viewport-fit=cover Missing for Safe Area Insets

**What goes wrong:** `env(safe-area-inset-bottom)` evaluates to `0px` — the input overlaps the iPhone home indicator bar.

**Why it happens:** Safe area environment variables only work when the viewport meta tag includes `viewport-fit=cover`.

**How to avoid:** Check `src/app/layout.tsx` — it must include `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Next.js 16 uses the `viewport` export from `layout.tsx` or `page.tsx` — not a raw HTML meta tag.

**Next.js 16 viewport export:**
```typescript
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',  // Enables env(safe-area-inset-bottom)
}
```

**Warning signs:** Home indicator bar overlaps the input on iPhone — the issue doesn't reproduce on desktop devtools device emulation.

### Pitfall 4: Gemini Error Message Format May Vary

**What goes wrong:** Rate limit detection fails silently — the error reaches the user as a raw error string or blank screen.

**Why it happens:** The `@google/generative-ai` SDK wraps HTTP errors into JavaScript Error objects. The message format is not formally guaranteed and may vary across SDK versions.

**How to avoid:** Check for both "429" AND "RESOURCE_EXHAUSTED" in the message (belt-and-suspenders). Log the raw error server-side for debugging. Test rate limit handling with a test that sends many requests in rapid succession.

**Warning signs:** Console shows "AI error: ..." in production — users see raw error text in the chat.

### Pitfall 5: ChatWidget Rendered on /portal via Wrong Layout Ancestry

**What goes wrong:** The floating chat button appears on `/portal`, causing two overlapping chat interfaces.

**Why it happens:** If the portal page is accidentally placed inside `(app)/` (or the `(app)/layout.tsx` wraps the portal somehow), `<ChatWidget>` is rendered.

**How to avoid:** Verify the file structure — `(portal)` must be a sibling of `(app)`, not inside it. The `(portal)/layout.tsx` must NOT import `<ChatWidget>`.

**Warning signs:** On `/portal`, a floating circular chat button appears in the bottom-right corner.

### Pitfall 6: react-markdown `components` Prop TypeScript Types

**What goes wrong:** TypeScript errors on custom `components` prop — element props like `node`, `inline`, or `className` differ between versions.

**Why it happens:** react-markdown v8→v9→v10 changed the component prop API. In v10, `code` components no longer have an `inline` boolean prop — block vs inline is inferred from `className` (fenced blocks have a `language-*` className).

**How to avoid:** Use `className` to detect fenced code blocks: `const isBlock = !!className`. Do not use the removed `inline` prop.

---

## Code Examples

Verified patterns from official sources and codebase inspection:

### Portal Layout (Minimal — No Sidebar)
```typescript
// src/app/(portal)/layout.tsx
// Pattern: sibling route group to (app) and (auth) — already established pattern in this codebase

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Root layout already provides ThemeProvider + Geist fonts + dark mode
  // This layout intentionally adds nothing — just forwards children
  return <>{children}</>
}
```

### Sidebar Navigation — Add Portal Link
```typescript
// src/components/layout/app-sidebar.tsx
// Add to navItems array — uses MessageCircle icon (already imported)

import { Bot } from 'lucide-react'  // or MessageCircle

const navItems = [
  // ... existing items
  {
    title: "AI Chat",
    href: "/portal",
    icon: Bot,
    badge: null,
  },
]
```

### Tool Extraction Pattern
```typescript
// src/lib/chat/tools.ts — new file

import {
  type FunctionDeclaration,
  type FunctionResponsePart,
  SchemaType
} from '@google/generative-ai'
import { getAccountId } from '@/lib/queries/account'
import { getLocalToday, toDateOnly } from '@/lib/utils'

export const chatTools: FunctionDeclaration[] = [
  // ... paste existing tools array verbatim
]

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<unknown> {
  // ... paste existing executeTool function verbatim
}
```

### Rate Limit API Response
```typescript
// src/app/api/chat/route.ts — catch block

} catch (err) {
  console.error('Chat API error:', err)
  const errorMessage = err instanceof Error ? err.message : 'Unknown error'

  const isRateLimited =
    errorMessage.includes('429') ||
    errorMessage.includes('RESOURCE_EXHAUSTED')

  if (isRateLimited) {
    return NextResponse.json(
      { rateLimited: true, friendlyMessage: "I'm taking a breather — try again in a minute" },
      { status: 429 }
    )
  }

  return NextResponse.json({ error: `AI error: ${errorMessage}` }, { status: 500 })
}
```

### Portal Fetch with Rate Limit Handling
```typescript
// src/components/portal/PortalChat.tsx — sendMessage function

const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: trimmed, history: geminiHistory }),
})

const data = await res.json()

if (data.rateLimited) {
  setMessages(prev => [
    ...prev,
    {
      role: 'assistant' as const,
      content: data.friendlyMessage || "I'm taking a breather — try again in a minute",
    },
  ])
  return
}

if (!res.ok) {
  throw new Error(data.error || 'Failed to get response')
}
```

### Markdown Rendering (react-markdown v10 + remark-gfm)
```typescript
// src/components/portal/PortalMessage.tsx
// Source: https://github.com/remarkjs/react-markdown

'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function PortalMessage({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => <h1 className="mb-2 text-base font-bold">{children}</h1>,
        h2: ({ children }) => <h2 className="mb-1.5 text-sm font-bold">{children}</h2>,
        h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
        // v10: inline vs block detected via className (block = has language-* class)
        code: ({ children, className }) => {
          const isBlock = !!className
          return isBlock ? (
            <code className="block rounded-md bg-muted/60 p-3 font-mono text-xs overflow-x-auto">
              {children}
            </code>
          ) : (
            <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-xs">{children}</code>
          )
        },
        pre: ({ children }) => (
          <pre className="mb-2 overflow-x-auto rounded-md">{children}</pre>
        ),
      }}
    >
      {content}
    </Markdown>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `100vh` for mobile full-height | `dvh` (dynamic viewport height) | CSS Values Level 4, ~2023 | Eliminates iOS keyboard layout shift without JS |
| `position: fixed` bottom input | `flex flex-col` + `h-dvh` container | Best practice settled ~2022-2023 | More reliable across iOS versions |
| react-markdown v7 `inline` prop on code | v10 — use `className` to detect block code | react-markdown v8+ | TypeScript errors if using old `inline` prop |
| Inline `tools[]` in API route | Extracted to `src/lib/chat/tools.ts` | This project — Phase 5 | Enables clean Phase 6 tool additions |
| Raw error string in UI | Structured `rateLimited` JSON flag | This project — Phase 5 | User sees friendly message, not stack traces |

**Deprecated/outdated in react-markdown v10:**
- `inline` prop on `code` component: removed — use `className` presence to detect fenced blocks

---

## Open Questions

1. **`maxDuration` export on `/api/chat/route.ts`**
   - What we know: STATE.md documents `export const maxDuration = 30` is required for daily briefing (Phase 6) which may involve 3+ sequential tool calls
   - What's unclear: Whether basic Phase 5 portal queries (single tool call) will hit the 10s Vercel default
   - Recommendation: Add `export const maxDuration = 30` to route.ts as part of AITOOL-05 refactor — safe to add now, prevents Phase 6 gap

2. **viewport-fit=cover in existing layout.tsx**
   - What we know: The current `src/app/layout.tsx` uses `<Metadata>` export, not `<Viewport>`. It does not include `viewport-fit=cover`
   - What's unclear: Whether this affects existing CRM pages negatively
   - Recommendation: Add `export const viewport: Viewport = { viewportFit: 'cover' }` to root `layout.tsx` — it's additive and only affects safe area inset behavior

3. **Back-to-CRM navigation on /portal**
   - What we know: Marked as Claude's discretion in CONTEXT.md
   - Recommendation: A subtle `<` back icon (lucide `ChevronLeft` or `ArrowLeft`) in the top-left corner of the chat, linking to `/dashboard`. This is lightweight, phone-natural, and consistent with how messaging apps handle this. No back header bar — just the icon.

4. **Desktop layout for /portal**
   - What we know: Marked as Claude's discretion in CONTEXT.md. The portal is mobile-first but accessible on desktop
   - Recommendation: Center the chat in a `max-w-2xl` container on desktop, full-width on mobile. This prevents the chat from spanning 1440px wide on large screens while keeping the same layout logic.

---

## Sources

### Primary (HIGH confidence)
- GitHub: https://github.com/remarkjs/react-markdown — current version (10.1.0), API, components prop, v10 changes
- Next.js official docs: https://nextjs.org/docs/app/api-reference/file-conventions/route-groups — route group pattern confirmed
- Codebase inspection: `src/app/api/chat/route.ts` — existing tool structure, error handling pattern, Gemini SDK usage
- Codebase inspection: `src/app/(app)/layout.tsx`, `src/app/(auth)/layout.tsx` — sibling route group pattern already established
- Codebase inspection: `src/proxy.ts` — auth gate covers all non-auth routes automatically
- Codebase inspection: `package.json` — confirmed Next.js 16, React 19, Tailwind v4, @google/generative-ai 0.24.1

### Secondary (MEDIUM confidence)
- MDN / CSS specs: `dvh` unit behavior verified via multiple implementation articles (2024-2025)
- Community verified: `env(safe-area-inset-bottom)` requires `viewport-fit=cover` — confirmed across Apple Developer Forums and web references
- Google AI error format: `error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")` — consistent across multiple SDK user reports

### Tertiary (LOW confidence)
- react-markdown v10 `code` component `className` behavior for block detection — verified from GitHub readme but not from official changelog; test immediately during implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — react-markdown v10 + remark-gfm confirmed from official GitHub; all other deps already in project
- Architecture: HIGH — route group pattern verified from Next.js docs + existing codebase uses same pattern
- Mobile layout: HIGH — `dvh` is a CSS standard; `viewport-fit=cover` is well-documented requirement
- Rate limit handling: MEDIUM — error message format (`RESOURCE_EXHAUSTED`) consistent across reports but not in official SDK changelog
- Tool extraction: HIGH — pure refactor with no external dependencies; pattern is straightforward

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (react-markdown and Next.js are stable; dvh has been stable since 2023)
