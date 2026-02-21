# Stack Research

**Domain:** Modern CRM Web Application (Healthcare B2B SaaS)
**Researched:** 2026-02-21
**Confidence:** HIGH — All versions verified live from npm registry; framework choices verified against official docs and multiple current sources.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.6 | Full-stack React framework | App Router is the 2026 standard for React full-stack apps. Turbopack is now the default bundler (2-5x faster builds). Vercel deploys it first-class. React Server Components eliminate most client-side data fetching boilerplate. Cache Components (new in v16) make explicit caching easy. Backed by Vercel — Next.js 16 shipped October 2025. |
| React | 19.2.4 | UI component runtime | Included with Next.js 16. React 19 brings Actions (form mutation primitives), View Transitions, `useEffectEvent`, and Activity component — all relevant to CRM data entry workflows. |
| TypeScript | 5.9.3 | Type safety across the stack | Non-negotiable for maintainable CRM code. Zod schemas derive TypeScript types automatically. Supabase generates typed client from DB schema. Next.js 16 requires TypeScript 5.1+. |
| Tailwind CSS | 4.2.0 | Utility-first styling | v4 ships CSS-first config (no `tailwind.config.js`). shadcn/ui now targets Tailwind v4 by default. Produces the smallest possible CSS bundle via dead-code elimination. Enables premium visual customization without fighting a design system. |
| Supabase | @supabase/supabase-js 2.97.0 | Database + Auth + Realtime | PostgreSQL with row-level security baked in. Auth handles JWT sessions. MCP tooling is available for this project (Supabase MCP). Realtime subscriptions for live pipeline updates. Built-in storage for file attachments. RLS policies enforce multi-user data isolation without application code. |

### UI Component Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| shadcn/ui | 3.8.5 (CLI: `shadcn`) | Component collection | Copy-own components — you own the code, not a dependency. Tailwind v4 + React 19 compatible as of 2026. Produces the premium, modern SaaS aesthetic required (comparable to HubSpot/Pipedrive quality). Components are accessible (Radix UI primitives underneath). Widely adopted: most dev examples and AI tooling reference shadcn/ui patterns. |
| Radix UI | (via shadcn/ui) | Headless component primitives | shadcn/ui wraps Radix UI — Dialog, DropdownMenu, Select, Popover, Tooltip all come from Radix. Accessible by default, keyboard-navigable. No separate installation needed beyond shadcn/ui. |
| Lucide React | 0.575.0 | Icon library | Ships with shadcn/ui. 1000+ consistent icons, tree-shakeable, React-native. Standard choice for shadcn/ui projects. |

### Data & State

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TanStack Query | @tanstack/react-query 5.90.21 | Server state management | Best-in-class for async server data: caching, stale-while-revalidate, optimistic updates, background refetch. At 1-5 users, the cache + mutation patterns eliminate most loading state boilerplate. Garbage collection prevents stale data. DevTools included. |
| Zustand | 5.0.11 | Client-side UI state | Minimal (~3KB). For CRM UI state that doesn't belong in server state: modal open/close, filter panel, selected rows, sidebar collapse. Simple API, no provider wrapping needed. Works alongside TanStack Query cleanly. |
| React Hook Form | 7.71.2 | Form management | Uncontrolled components = zero re-renders per keystroke. 12KB vs Formik's 44KB. Formik is no longer actively maintained (last commit 1+ year ago). Native integration with Zod via `@hookform/resolvers`. Required for CRM's heavy form surface (contacts, deals, tasks, interactions). |
| Zod | 4.3.6 | Schema validation | TypeScript-first — write schema once, get runtime validation + compile-time types. Works with React Hook Form via resolver. Works with Next.js Server Actions for API input validation. Standard choice for tRPC and Next.js stacks in 2026. 17.7KB bundle. |

### Data Display

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| TanStack Table | @tanstack/react-table 8.21.3 | Data grid / contact & deal lists | Headless — you control the UI, shadcn/ui provides the table shell. Handles sorting, filtering, pagination, row selection natively. For 1-5 users with hundreds of contacts/deals, no virtualization needed. MIT licensed. Pairs perfectly with TanStack Query for server-side pagination. |
| Recharts | 3.7.0 | Charts and pipeline analytics | Composable, React-native, Tailwind v4 compatible (Tailwind v4 removed need for hsl() wrappers in chart config). Best for SaaS dashboards requiring deal pipeline funnels, activity timelines, revenue charts. 200KB but tree-shakeable. Native Supabase + shadcn/ui integration patterns exist. |

### Infrastructure

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel | Pro plan ($20/user/month) | Hosting + deployment | First-class Next.js 16 support — Vercel ships Next.js features. Git-push-to-deploy. Global CDN. Serverless functions auto-scale. For 1-5 users, Pro plan is adequate and affordable. Zero ops overhead. |
| Supabase | Free → Pro ($25/month) | Managed PostgreSQL + Auth | Supabase MCP available for this project. Free tier sufficient for development; Pro for production. Auth, RLS, Realtime, Storage, Edge Functions all included. No separate auth service needed. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Playwright | E2E testing | Playwright MCP available for this project. Current version: 1.58.2. Write tests for critical CRM flows: create contact, advance deal stage, log interaction. |
| ESLint + `@next/eslint-plugin-next` | Linting | Next.js 16 defaults to ESLint Flat Config (ESLint v10 alignment). `next lint` command removed in v16 — run ESLint directly. |
| Biome (optional) | Fast formatting | Alternative to Prettier+ESLint. Rust-based, significantly faster. Viable alternative now that `next lint` is removed. |
| `@supabase/ssr` | Server-side Supabase client | 0.8.0. Required for Next.js App Router — provides cookie-based session management for server components and route handlers. Do NOT use the base `@supabase/supabase-js` directly in server components. |
| `date-fns` | Date manipulation | 4.1.0. For formatting interaction timestamps, deal close dates, task due dates. Lighter than moment.js, tree-shakeable. |

---

## Alternatives Considered

### Framework

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | Remix / React Router v7 | Remix is excellent for form-heavy apps with web-standard mutations. However, Next.js has a larger ecosystem, better Vercel integration, and React Server Components reduce client bundle size. For a CRM requiring premium dashboard design and charts, Next.js App Router is the stronger choice. |
| Next.js 16 | SvelteKit 2 | SvelteKit has the smallest JS footprint and fastest hydration. Choose it if bundle size is the primary concern. However, SvelteKit's ecosystem is smaller (fewer CRM-relevant component libraries), and the team would be working outside the React ecosystem. |

### Database / Backend

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Supabase | Neon + custom auth | Neon is "true" serverless Postgres (acquired by Databricks in 2025, signals AI-first direction). Choose Neon if you need scale-to-zero economics and will build auth separately. For this CRM, Supabase's integrated auth + RLS + realtime eliminates building an auth system. |
| Supabase | PlanetScale (MySQL) | PlanetScale now offers PostgreSQL but is MySQL-first historically. Database branching is more mature than Supabase. Choose PlanetScale if you need Vitess-scale MySQL. For a 1-5 user CRM, Supabase PostgreSQL is superior: pgvector for future AI features, better ecosystem, better Row Level Security. |

### UI Components

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| shadcn/ui | Material UI (MUI) v7 | MUI provides 100+ ready-made components with Google Material Design. Choose MUI if the team needs fast component coverage and is comfortable with Material Design aesthetics. However, MUI's 80KB bundle vs shadcn/ui's ~5KB is significant, and MUI produces a "generic" look vs the premium custom feel required here. |
| shadcn/ui | Mantine v7 | Mantine includes more built-in components (DatePicker, RichTextEditor, etc.) that a CRM needs. If building speed matters more than visual differentiation, Mantine is a faster path. Trade-off: less flexible theming, harder to match HubSpot/Pipedrive quality. |

### State Management

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| TanStack Query + Zustand | Redux Toolkit | Redux Toolkit is appropriate for large teams (10+) with complex shared state and strict patterns. For a 1-5 user CRM with 1-2 developers, RTK's boilerplate is unnecessary overhead. TanStack Query handles server state better than Redux. |
| TanStack Query | SWR | SWR is simpler (4.2KB vs 13KB) and adequate for basic data fetching. Choose SWR for simple projects. TanStack Query wins here because CRM needs: mutations with optimistic updates, complex cache invalidation (update contact → invalidate deal list), and offline support for intermittent connectivity. |

### Form Management

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React Hook Form | Formik | Formik is no longer actively maintained (no commits for 1+ year as of 2025). Do not use Formik for new projects. |
| React Hook Form | TanStack Form | TanStack Form is the emerging competitor (from the TanStack ecosystem). Currently less mature. Consider for future projects once ecosystem stabilizes. |

### Charts

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Recharts | Nivo | Nivo offers more chart types and better animation. Choose Nivo if you need complex network graphs or heatmaps. Recharts wins for CRM use case: simpler API, smaller bundle for common chart types (bar, line, area, pie). |
| Recharts | Victory | Victory has strong accessibility (ARIA support) and React Native support. Choose Victory if cross-platform (web + native) is a requirement. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Formik | Not actively maintained since 2024. Last commit 1+ year ago. Security patches not guaranteed. | React Hook Form 7.x |
| `next/legacy/image` | Deprecated in Next.js 16, scheduled for removal. | `next/image` |
| `middleware.ts` | Deprecated in Next.js 16 in favor of `proxy.ts`. New projects should not use the old name. | `proxy.ts` |
| `@supabase/supabase-js` in server components directly | Does not handle cookie-based sessions correctly in Next.js App Router. | `@supabase/ssr` for server components and route handlers |
| Service role key in client code | Supabase 2025 security retro flagged this as the #1 RLS bypass. New API distinguishes publishable vs secret keys. | Publishable key client-side, secret key server-only |
| Material UI for premium SaaS UI | 80KB bundle, rigid Google Material Design aesthetic, hard to escape "generic admin" look. | shadcn/ui + Tailwind v4 for premium custom feel |
| Redux Toolkit | Overkill for 1-5 user CRM. Significant boilerplate. Server state better handled by TanStack Query. | TanStack Query (server state) + Zustand (UI state) |
| `create-react-app` | Unmaintained, no SSR, no App Router support. | `create-next-app` |
| Moment.js | 67KB, deprecated by its own maintainers. | `date-fns` 4.x |
| AG Grid (Enterprise) | Commercial licensing required for advanced features. Overkill for a CRM with hundreds of records. | TanStack Table (MIT, headless, integrates with shadcn/ui) |
| Yup | Slower than Zod for TypeScript projects; Zod has better type inference and ecosystem momentum in 2026. | Zod 4.x |

---

## Installation

```bash
# Bootstrap project
npx create-next-app@latest crm --typescript --tailwind --eslint --app --turbopack

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# shadcn/ui (after project created)
npx shadcn@latest init

# Data fetching and state
npm install @tanstack/react-query zustand

# Forms and validation
npm install react-hook-form zod @hookform/resolvers

# Data display
npm install @tanstack/react-table recharts

# Utilities
npm install date-fns lucide-react

# Dev dependencies
npm install -D @playwright/test @tanstack/react-query-devtools
```

---

## Stack Patterns by Variant

**If building realtime pipeline board (Kanban):**
- Enable Supabase Realtime subscriptions on `deals` table
- Use TanStack Query's `invalidateQueries` on realtime events
- Use Zustand for optimistic drag-and-drop state before server confirmation

**If adding file attachments to contacts/deals:**
- Use Supabase Storage (included in Supabase subscription)
- Store public URLs in database, reference from UI
- RLS policies on storage buckets mirror database RLS policies

**If building email integration later:**
- Supabase Edge Functions call external email APIs (Resend, SendGrid)
- Do not route email through Next.js API routes (cold-start latency)

**If team grows beyond 5 users:**
- Supabase Pro handles the load (connection pooling via PgBouncer included)
- Vercel Pro scales automatically
- No re-architecture needed at 10-50 user scale

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.x | React 19.2.x | React 19.2 is the App Router runtime in Next.js 16. Do not use React 18 with Next.js 16 App Router. |
| Next.js 16.x | TypeScript 5.1+ | Next.js 16 requires TypeScript 5.1 minimum. Current TS 5.9.3 is fine. |
| shadcn/ui 3.x | Tailwind v4.x | shadcn/ui v3 targets Tailwind v4 by default. Using shadcn/ui v3 with Tailwind v3 requires extra config. |
| @supabase/ssr 0.8.x | Next.js 15+ App Router | `@supabase/ssr` is specifically designed for the App Router cookie model. Required for server-side auth. |
| TanStack Query 5.x | React 18+ | v5 requires React 18+. Next.js 16 ships React 19, which is compatible. |
| Recharts 3.x | Tailwind v4.x | Tailwind v4 eliminates need for `hsl()` wrappers in Recharts chart config. Fully compatible. |
| Zod 4.x | React Hook Form 7.x | Use `@hookform/resolvers/zod` adapter. Compatible with current versions of both. |

---

## Sources

- [Next.js 16 Official Blog](https://nextjs.org/blog/next-16) — Release date, features, breaking changes verified (HIGH confidence)
- [Next.js 16.1 Blog](https://nextjs.org/blog/next-16-1) — Minor release details (HIGH confidence)
- npm registry live query — All version numbers current as of 2026-02-21 (HIGH confidence)
- [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro) — RLS warnings, new API key model (HIGH confidence)
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — Tailwind v4 compatibility confirmed (HIGH confidence)
- [TanStack Query comparison page](https://tanstack.com/query/latest/docs/framework/react/comparison) — Feature comparison vs SWR (HIGH confidence)
- [React Hook Form homepage](https://react-hook-form.com/) — Current status, Formik comparison (HIGH confidence)
- WebSearch: Framework comparison articles (MEDIUM confidence — multiple consistent sources)
- WebSearch: State management comparison articles (MEDIUM confidence — multiple consistent sources)
- WebSearch: Chart library comparison articles (MEDIUM confidence — multiple consistent sources)

---
*Stack research for: Modern CRM Web Application (Healthcare B2B SaaS)*
*Researched: 2026-02-21*
