# Project Research Summary

**Project:** HealthCRM — including Team Command Portal (v1.1)
**Domain:** B2B SaaS CRM (Health Technology) + AI-Powered Mobile Chat Portal
**Researched:** 2026-02-21 (v1.0 CRM) / 2026-02-25 (v1.1 Team Command Portal)
**Confidence:** HIGH

---

> **Note:** This summary has been updated from the original v1.0 CRM research (2026-02-21) to incorporate
> v1.1 Team Command Portal research (2026-02-25). The v1.0 CRM section is retained in full below.
> The v1.1 portal section covers only the delta — new stack, new features, new architecture, new pitfalls.

---

## Executive Summary

### v1.0 CRM (baseline, in production)

This is a B2B sales CRM purpose-built for a health technology company selling to hospitals, clinics, and labs. The domain is characterized by long deal cycles (12+ months), multiple decision-makers per account (~9 on average), and account-based selling where the organization (hospital, clinic) is the primary unit — not the individual contact. The research consensus points to a Next.js 16 + Supabase + shadcn/ui stack as the clear optimal choice for this context: React Server Components reduce client-side complexity, Supabase delivers PostgreSQL with built-in auth and row-level security, and shadcn/ui produces the premium SaaS aesthetic required without the bundle overhead of Material UI alternatives.

### v1.1 Team Command Portal (current milestone)

The v1.1 milestone adds a full-page AI command portal (`/portal`) to the existing HealthCRM. The portal is a mobile-first dedicated surface for field sales reps who need to take action between hospital visits — not just view data. The recommended approach follows the patterns established by HubSpot Breeze and Salesforce Einstein Copilot: a dedicated chat route, write-capable AI tools, rich action confirmation cards, persistent conversation history, and a daily briefing aggregation command. The stack additions are minimal: three new npm packages (`react-markdown`, `remark-gfm`, `react-textarea-autosize`) on top of the existing stack with no AI SDK migration.

The dominant risks for v1.1 are infrastructure-level and must be addressed before any multi-user testing: the Gemini free tier quota is shared across all users at the project level (actual limits are 10 RPM / 250 RPD — lower than PROJECT.md's 500 RPD figure), multi-tool AI calls can breach Vercel's 10-second serverless timeout, and AI write operations will create incorrect CRM data if a confirmation step is not built into the architecture from the start. None of these are hard to prevent, but all become expensive to retrofit after the first phase ships.

---

## Key Findings

### Recommended Stack

#### v1.0 CRM (existing stack — do not re-research)

The stack centers on Next.js 16 (App Router + Turbopack) with React 19, TypeScript 5.x, Tailwind CSS v4, and Supabase as the managed backend. TanStack Query manages server state; React Hook Form + Zod handles forms; TanStack Table renders data grids; Recharts provides charts; dnd-kit powers the Kanban board.

**Core v1.0 technologies:**
- **Next.js 16.1.6** — Full-stack framework; App Router + RSC
- **Supabase (supabase-js 2.97.0 + @supabase/ssr 0.8.0)** — PostgreSQL + Auth + Realtime + RLS
- **shadcn/ui 3.x + Tailwind CSS 4.x** — Component library on Tailwind v4
- **TanStack Query 5.x** — Server state caching and optimistic mutations
- **React Hook Form 7.71.2 + Zod 4.3.6** — Form management + validation
- **TanStack Table 8.21.3** — Headless data grid
- **@google/generative-ai 0.24.1** — Gemini 2.5 Flash function calling (existing ChatWidget)
- **dnd-kit 6.x / 10.x** — Drag-and-drop Kanban

#### v1.1 Portal Additions (3 new packages only)

| Library | Version | Purpose |
|---------|---------|---------|
| `react-markdown` | 10.1.0 | Render AI responses as formatted markdown; must be used inside `'use client'` component (ESM-only + Next.js 16) |
| `remark-gfm` | 4.0.1 | GitHub Flavored Markdown plugin for react-markdown; adds tables, task lists, strikethrough |
| `react-textarea-autosize` | 8.5.9 | Auto-growing textarea for chat input; handles iOS Safari edge cases CSS `field-sizing: content` does not yet cover |

**What was explicitly rejected for v1.1:**
- Vercel AI SDK migration (`ai` + `@ai-sdk/google`) — would require rewriting the entire API route and client state; deferred to v2 if streaming becomes a requirement
- `socket.io` / Supabase Realtime for portal — real-time shared sessions deferred per PROJECT.md
- Zustand for portal state — local `useState` + `useRef` is correct for single-user chat UI state

### Expected Features

#### v1.1 Portal — Must Have (P1)

| Feature | Complexity | Notes |
|---------|------------|-------|
| Full-page portal route at `/portal`, auth-gated, mobile-first | LOW | New `(portal)` route group, no sidebar |
| Formatted markdown rendering for AI responses | LOW | `react-markdown` + `remark-gfm`; replaces `whitespace-pre-wrap` |
| Persistent conversation history (Supabase, per user) | MEDIUM | `chat_conversations` + `chat_messages` tables; loaded on mount |
| Write AI tools: `create_contact`, `create_deal`, `complete_task` | MEDIUM | Field reps need to take action; read-only tools are insufficient |
| `get_daily_briefing` tool — overdue tasks, due today, stale deals, closing soon | MEDIUM | Morning game-plan command; triggered via quick action button |
| Rich action confirmation cards for all write operations | MEDIUM | Visual proof action happened; link to CRM record; required before write tools ship |
| Quick action buttons (always visible): My tasks, Urgent, Pipeline, Briefing, Add task | LOW | Horizontal row above input; sends command on tap |

#### v1.1 Portal — Should Have (P2, same sprint if capacity)

- `search_deals` keyword/stage filter tool
- Context-aware suggestion chips after AI actions
- Session history list (slide-in panel of past conversations)

#### Defer to v2+

- Voice input (iOS mic + hospital noise = unreliable)
- AI response streaming (function calling + streaming is architecturally complex)
- Real-time shared portal (Supabase Realtime)
- Push notifications (Service Worker + corporate device restrictions)
- Conversation export / session naming UI

**Anti-features explicitly rejected:** Real-time multi-user chat, markdown editor in input, separate portal authentication, conversation AI-naming flows.

### Architecture Approach

#### v1.1 Portal Architecture

The portal integrates into the existing codebase with minimal footprint. Four structural decisions are final:

1. **Sibling `(portal)` route group** — Not nested inside `(app)`. The portal is a fundamentally different surface (no sidebar, no ChatWidget). Auth guard is two lines — not meaningful duplication. URL resolves to `/portal` cleanly.

2. **Single `/api/chat` endpoint, extended** — No new `/api/portal/chat` route. The existing route handler is extended to accept an optional `conversation_id` parameter. When present, each turn is saved to Supabase (fire-and-forget). The ChatWidget sends no `conversation_id` and is unchanged.

3. **Tools extracted to `src/lib/chat/tools.ts`** — As tool count grows from 7 to 12, `FunctionDeclaration[]` and `executeTool()` move out of `route.ts` into a shared module. Both the widget and portal share the same tool set via the same endpoint.

4. **Normalized `chat_messages` table** — One row per message, not a JSON blob. Enables sliding-window queries, future pagination, and history pruning. `gemini_parts jsonb` per message stores raw Gemini `Content` parts for accurate history replay on session load.

**Major components (new in v1.1):**

| Component | Responsibility | Type |
|-----------|----------------|------|
| `src/app/(portal)/layout.tsx` | Auth guard + minimal wrapper; no sidebar | Server Component |
| `src/app/(portal)/portal/page.tsx` | Loads last 10 conversations; passes to PortalChat | Server Component |
| `src/components/portal/PortalChat.tsx` | Full-page chat UI; message state; history management | Client Component |
| `src/components/portal/MessageRenderer.tsx` | Markdown + action card routing | Client Component |
| `src/components/portal/QuickActions.tsx` | Tap-to-send preset buttons | Client Component |
| `src/components/portal/cards/` | TaskCard, ContactCard, DealCard, SummaryCard | Client Components |
| `src/lib/chat/tools.ts` | `FunctionDeclaration[]` + `executeTool()` shared by widget + portal | Shared lib |
| `src/lib/chat/history.ts` | `saveTurn()` (fire-and-forget) + `loadHistory()` (sliding window) | Shared lib |
| `src/app/api/chat/route.ts` | Modified: optional `conversation_id` + `saveTurn()` call | Route Handler |

**Build order (from ARCHITECTURE.md):**
DB migration → extract tools to `tools.ts` → add new tools → modify route → history helpers → `(portal)` route group → portal page → PortalChat → MessageRenderer + cards → QA widget regression

### Critical Pitfalls

#### v1.0 CRM Pitfalls (retained — still apply)

1. **Flat contact-organization FK** — Build `contact_organizations` junction table from Day 1. Recovery cost is HIGH if deferred.

2. **Missing or misconfigured RLS** — Enable RLS on every table at creation, including new `chat_conversations` and `chat_messages` tables. Wrap `auth.uid()` in `(SELECT auth.uid())` for performance.

3. **Pipeline stages as plain text** — Use a `pipeline_stages` table with FK from deals; not a VARCHAR column.

4. **Dashboard N+1 queries** — Use a single PostgreSQL RPC function for all dashboard metrics.

5. **Full-text search computed at query time** — Add precomputed `tsvector` GIN index on contacts and organizations during schema creation.

#### v1.1 Portal Pitfalls (new — highest priority)

1. **Gemini free-tier quota is project-level, not per-user** — Verified limits: 10 RPM / 250 RPD (lower than PROJECT.md's 500 RPD). One user can exhaust the daily budget for all users. Prevention: per-user rate limit (3 RPM), user-friendly 429 handling with retry guidance, daily usage logging in Supabase, send button debounce.

2. **Vercel function timeout on multi-tool calls** — Daily briefing with 3+ sequential tool calls can exceed Vercel's 10-second default limit. Prevention: `export const maxDuration = 30` in route file; cap tool loop at 5 iterations; parallelize independent tool calls with `Promise.all`.

3. **AI write tools create wrong data without confirmation** — Gemini function calling executes writes based on natural language and may invent field values. Prevention: two-step confirmation flow (card display first, DB write only on user tap confirm); strict server-side argument validation before any Supabase insert.

4. **AI tools bypass Server Action validation** — Direct Supabase inserts in `executeTool` bypass Zod + Server Action business rules. Prevention: extract mutation logic into shared functions (`lib/mutations/`) used by both Server Actions and `executeTool` — never write inline Supabase inserts in the tool executor.

5. **iOS Safari virtual keyboard breaks fixed-bottom input** — `position: fixed` inputs get covered by the virtual keyboard on iOS. Prevention: use CSS flex-column layout (no `position: fixed` for input); `h-dvh` container; test on a real iPhone before calling mobile layout complete.

6. **Gemini history growing unbounded** — Full history sent to Gemini on every request causes latency to grow linearly. Prevention: sliding window of 12-15 turns in API calls regardless of stored history length; normalized `chat_messages` table (not JSON blob).

---

## Implications for Roadmap

### Current Milestone: v1.1 Team Command Portal (3-phase structure)

The pitfall-to-phase mapping and feature dependency graph from research drive a clear 3-phase sequence. Phase 1 must establish safe foundations before multi-user testing; Phase 2 builds persistence and write capabilities; Phase 3 finishes the mobile UX and P2 features.

#### Phase 1: Portal Foundation and API Safety

**Rationale:** The most critical pitfalls (Vercel timeout, rate limiting, AI data integrity architecture) must be addressed before the portal is tested by more than one user. The shared mutation layer must be established before any write tools are built — it cannot be retrofitted. The portal must have markdown rendering from day one; the existing `whitespace-pre-wrap` renders Gemini responses as literal symbols on structured CRM data.

**Delivers:** Working `/portal` route with full-page layout, auth guard, markdown rendering, quick action buttons, and a safe API foundation. Uses existing 7 read-only tools — no write operations yet.

**Addresses (from FEATURES.md):** Full-page portal route, formatted message rendering, auth gate, mobile input layout, scroll-to-bottom, loading indicator, send-on-Enter.

**Avoids (from PITFALLS.md):** B7 (Vercel timeout — `maxDuration = 30` + loop cap), B1 (rate limits — per-user throttle + 429 handling), B9 (markdown not rendering), B4 (AI bypassing business rules — shared mutation layer established here), Anti-Pattern 5 (portal inside app layout).

**Research flag:** Standard patterns — sibling route group, Tailwind flex layout, react-markdown integration are all well-documented with official sources. No additional research-phase needed.

#### Phase 2: Conversation Persistence and Write Tools

**Rationale:** Persistence and write tools are independent of each other but both depend on the Phase 1 API foundation. They can be built in parallel within this phase. The confirmation flow architecture must be designed before any write tool is implemented. The normalized schema must be established before any data is written — there is no safe path from a JSON blob to a normalized table once data is in production.

**Delivers:** Messages saved to Supabase and loaded on mount; new AI write tools (`create_contact`, `create_deal`, `complete_task`, `get_daily_briefing`); rich action confirmation cards; `search_deals` tool.

**Addresses (from FEATURES.md):** Persistent conversation history, expanded AI write tools, daily briefing tool, rich action confirmation cards.

**Avoids (from PITFALLS.md):** B2 (history unbounded — sliding window in `loadHistory()`), B3 (AI wrong data — two-step confirmation flow), B8 (JSON blob schema — normalized `chat_messages` from the start), B5 (prompt injection — content scanning on tool results, minimal return payloads).

**Research flag:** The two-step confirmation flow within a Gemini function calling loop is non-standard and has no established reference implementation. A focused design session during Phase 2 planning is recommended before writing any write-tool code.

#### Phase 3: Mobile UX Polish and P2 Features

**Rationale:** iOS Safari layout issues cannot be fully validated until core chat functionality works end-to-end. P2 features (suggestion chips, session history) depend on the action confirmation cards built in Phase 2. The "looks done but isn't" checklist from PITFALLS.md provides the QA gate for this phase.

**Delivers:** Validated iOS Safari mobile layout (real device tested); context-aware suggestion chips; session history list; undo button on action cards; floating ChatWidget hidden on `/portal` route; full QA checklist passes.

**Addresses (from FEATURES.md):** Context-aware suggestion chips, session history list, widget hidden on portal route.

**Avoids (from PITFALLS.md):** B6 (iOS Safari keyboard layout — real device required), UX pitfalls (no undo for AI actions, quick actions only on empty state, widget visible on portal).

**Research flag:** iOS Safari layout must be tested on a real iPhone — Chrome DevTools does not reproduce keyboard behavior. No research-phase needed but physical device access is a prerequisite for sign-off.

### Phase Ordering Rationale

- Phase 1 before Phase 2 because the shared mutation layer and API safety infrastructure must exist before any write tools are added. Adding write tools to an unprotected API risks data corruption and quota exhaustion.
- Within Phase 2, persistence and write tools are parallel workstreams — they share the same DB schema foundation but are otherwise independent.
- Phase 3 after Phase 2 because suggestion chips and undo buttons depend on the action confirmation cards built in Phase 2.
- The build order from ARCHITECTURE.md (DB migration → extract tools → add new tools → modify route → history helpers → portal route group → portal page → PortalChat → MessageRenderer) maps directly onto Phase 1 (steps 1-6) and Phase 2 (steps 7-9).

### Research Flags

**Needs design/research during planning:**
- **Phase 2 confirmation flow:** How to structure a two-step AI action confirmation (card display → user tap → DB write) within the Gemini function calling loop. Pattern needs a concrete implementation design before coding begins.

**Standard patterns (skip research-phase):**
- **Phase 1:** Route group structure, react-markdown integration, Tailwind flex layout, Vercel `maxDuration`, Supabase RLS — all well-documented with official sources.
- **Phase 3:** iOS Safari layout fix (flex column + `h-dvh`), widget visibility via route detection — established implementation paths.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (v1.0 CRM) | HIGH | All versions verified live from npm registry 2026-02-21 |
| Stack (v1.1 Portal additions) | HIGH | react-markdown, remark-gfm, react-textarea-autosize versions verified 2026-02-25; React 19 compatibility confirmed |
| Features (v1.0 CRM) | MEDIUM-HIGH | Multi-source consensus on table stakes and anti-features |
| Features (v1.1 Portal) | MEDIUM-HIGH | P1 feature set has multi-source agreement; P2/P3 is prioritized opinion; competitor analysis (HubSpot, Salesforce) is current |
| Architecture (v1.0 CRM) | HIGH | Official Next.js/Supabase docs + schema patterns |
| Architecture (v1.1 Portal) | HIGH | Based on direct codebase inspection of existing files + official Next.js/Supabase docs |
| Pitfalls (v1.0 CRM) | MEDIUM-HIGH | Core pitfalls verified with official docs and real incident data |
| Pitfalls (v1.1 Portal) | HIGH | Rate limit figures verified from official Gemini docs; iOS Safari keyboard issue widely reproduced; OWASP LLM Top 10 2025 for prompt injection |

**Overall confidence:** HIGH

### Gaps to Address

- **Gemini quota discrepancy:** PROJECT.md references 500 RPD / 15 RPM but current verified limits are 10 RPM / 250 RPD (reduced December 2025). This must be reconciled in PROJECT.md before Phase 1 is planned. Planning usage around 500 RPD will cause unexpected production limits.

- **Confirmation flow implementation pattern:** No reference implementation found for two-step AI confirmation within a Gemini function calling loop. Architecture is clear conceptually; exact code pattern needs to be designed in Phase 2 planning.

- **Contact-org junction table (v1.0 conflict):** ARCHITECTURE.md used a simple `organization_id` FK on contacts; PITFALLS.md identified this as a critical pitfall and recommended a junction table. The v1.0 build resolved this — confirm existing schema uses junction table before any AI tool creates contacts.

- **`field-sizing: content` CSS:** Native CSS auto-resize has ~85% browser support but is unreliable on mobile Safari. `react-textarea-autosize` is correct now; revisit in 6-12 months as Safari support matures.

- **Vercel AI SDK migration path (v2):** `ai` + `@ai-sdk/google` is a valid v2 upgrade enabling streaming + `useChat` abstraction. Deferred, but noted for v2 roadmap consideration.

---

## Sources

### Primary (HIGH confidence)
- npm registry live queries (2026-02-21, 2026-02-25) — all package versions confirmed
- [Gemini API Rate Limits (official)](https://ai.google.dev/gemini-api/docs/rate-limits) — quota figures, RESOURCE_EXHAUSTED handling
- [Gemini API Function Calling (official)](https://ai.google.dev/gemini-api/docs/function-calling) — declaration format, history reconstruction
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) — ESM-only, React 18+ requirement, `'use client'` component requirement
- [Next.js Route Groups documentation](https://nextjs.org/docs/app/building-your-application/routing/route-groups) — sibling route group pattern
- [Next.js Nested Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates) — layout override behavior
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — RLS policy patterns, `(SELECT auth.uid())` performance wrapper
- [OWASP LLM Top 10 2025 — LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — indirect injection via tool results
- [Next.js 16 Official Blog](https://nextjs.org/blog/next-16) — Release notes, breaking changes
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — WAL subscription patterns
- Direct codebase inspection: `src/app/api/chat/route.ts`, `src/components/chat/ChatWidget.tsx`, `src/app/(app)/layout.tsx` — existing implementation patterns
- iOS Safari `position: fixed` + virtual keyboard behavior — widely reproduced across multiple sources

### Secondary (MEDIUM confidence)
- [HubSpot AI — Breeze Features](https://www.hubspot.com/products/artificial-intelligence) — competitor feature comparison, action confirmation card pattern
- [Salesforce Einstein Copilot (2025)](https://www.techcronus.com/blog/einstein-copilot-is-transforming-salesforce-crm-in-2025/) — AI CRM feature patterns
- [UX for AI Chatbots (2026)](https://www.parallelhq.com/blog/ux-ai-chatbots) — table stakes UX patterns for chat interfaces
- [Design Patterns For AI Interfaces — Smashing Magazine](https://www.smashingmagazine.com/2025/07/design-patterns-ai-interfaces/) — quick action and chip patterns
- [Building Stateful Conversations with Postgres and LLMs](https://medium.com/@levi_stringer/building-stateful-conversations-with-postgres-and-llms-e6bb2a5ff73e) — normalized chat schema pattern
- [Gemini 2.5 Flash free tier limits — December 2025 changes](https://blog.laozhang.ai/en/posts/gemini-api-rate-limits-guide) — quota reduction corroboration
- [Virtual Keyboard API browser support](https://ishadeed.com/article/virtual-keyboard-api/) — iOS Safari `window.virtualKeyboard` unavailability
- [Healthcare Sales in 2025 — Martal](https://martal.ca/b2b-healthcare-sales-lb/) — B2B healthtech deal cycle characteristics
- [Kanban Indexing Patterns — Nick McCleery](https://nickmccleery.com/posts/08-kanban-indexing/) — Lexicographic position ordering

### Tertiary (LOW confidence — needs validation)
- `field-sizing: content` CSS browser support ~85% — inferred from multiple scattered sources; exact Safari mobile timeline not confirmed
- [CRM Compliance for Regulated Industries](https://syncmatters.com/blog/crm-compliance) — Sunshine Act mention; single source; verify with legal before any HCP value-transfer features

---
*v1.0 research completed: 2026-02-21*
*v1.1 Team Command Portal research completed: 2026-02-25*
*Ready for roadmap: yes*
