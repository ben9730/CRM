# Phase 2: Backend & Data Layer - Research

**Researched:** 2026-02-22
**Domain:** Next.js 16 App Router scaffold, Supabase project setup, PostgreSQL schema design, RLS multi-tenancy, auth flows, Vercel deployment
**Confidence:** HIGH — Core findings verified against official Next.js docs (updated 2026-02-20), official Supabase docs, and Supabase MCP tool

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Auth experience
- Email + password only — no social providers, no magic links
- Open registration — anyone with an email can create an account
- No email verification required — immediate access after sign-up
- Post-login redirect always goes to Dashboard (not last visited page)
- Password reset via email link (standard Supabase flow)

#### Schema conventions
- Multi-tenant per team/organization — standard CRM pattern where users belong to an org and RLS filters by org_id so team members share data
- Full audit trail on every table: created_at, updated_at, created_by, updated_by
- Naming convention: snake_case for all tables and columns (Postgres standard)

#### Supabase project setup
- Create a new Supabase project (no existing project)
- Single project for now — no branching or separate dev/prod environments
- Deploy to Vercel in Phase 2 — get a live URL early for testing and sharing

#### Seed data & defaults
- Generic sales pipeline stages: Lead → Qualified → Demo → Proposal → Closed Won / Closed Lost
- Seed realistic demo data: 10-20 contacts, 5 orgs, 8 deals across pipeline stages

#### Specifics (from roadmap/prior decisions)
- Contact-organization junction table (not flat FK)
- Pipeline stages as normalized table
- RLS enabled on every table at creation time
- tsvector GIN indexes on contacts and organizations
- Next.js 16 uses `proxy.ts` not `middleware.ts` for session refresh

### Claude's Discretion
- Soft-delete vs hard-delete strategy per entity type
- UUID vs auto-increment primary keys
- Supabase region selection
- Pipeline stage customizability (fixed vs editable)
- Demo data industry flavor
- Password complexity requirements
- Session duration / token refresh strategy
- Error page styling for auth flows

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ARCH-01 | RLS enabled on all Supabase tables from day one | RLS policy patterns documented; performance-optimized `(SELECT auth.uid())` wrapper pattern; multi-tenant org_id scoping via security definer function |
| ARCH-02 | Database schema uses contact-organization junction table (many-to-many) | Full junction table SQL provided; `is_primary`, `role`, `started_at`, `ended_at` columns documented |
| ARCH-03 | Full-text search uses PostgreSQL tsvector with GIN indexes | `GENERATED ALWAYS AS … STORED` tsvector column pattern and GIN index SQL documented |
| ARCH-04 | Cloud deployed on Vercel + Supabase | Vercel-Supabase integration via marketplace documented; environment variable setup covered |
| ARCH-05 | All available MCP tools leveraged during development | Supabase MCP confirmed active; use `apply_migration` for DDL, `execute_sql` for queries, `get_advisors` post-schema |
| AUTH-01 | User can sign up with email and password | `supabase.auth.signUp()` with email/password; disable Confirm Email in dashboard for immediate access |
| AUTH-02 | User can log in and session persists across browser refresh | Cookie-based session via `@supabase/ssr`; `updateSession` in `proxy.ts` refreshes tokens on every request |
| AUTH-03 | User can log out from any page | `supabase.auth.signOut()` in Server Action; redirect to `/login` |
| AUTH-04 | User can reset password via email link | Standard Supabase `resetPasswordForEmail()` flow; PKCE callback at `/auth/callback` |
</phase_requirements>

---

## Summary

Phase 2 is a three-part delivery: scaffold a production-quality Next.js 16 project wired to Supabase, define an immutable-quality database schema with RLS, and implement all auth flows. The most important architectural decisions — junction table, normalized pipeline stages, tsvector indexes, multi-tenant RLS — are already locked from prior planning. This research confirms the exact implementation patterns for each.

The single biggest technical change versus what developers familiar with Next.js 14/15 expect is the **`middleware.ts` → `proxy.ts` rename in Next.js 16**. The file is named `proxy.ts`, the exported function is named `proxy`, and the runtime is Node.js (Edge is not supported). This is a hard breaking change — the wrong filename silently does nothing, leaving all routes unprotected and sessions unrefreshed.

The Supabase auth pattern for Next.js 16 requires `@supabase/ssr` with `getAll`/`setAll` cookie methods (never the old individual `get`/`set`/`remove`). The server client uses `cookies()` from `next/headers`; the proxy client constructs its cookie handler from `request.cookies` and writes back to both `request.cookies` and `response.cookies`. Using `getUser()` (not `getSession()`) is the current security recommendation for server-side auth validation.

For the multi-tenant RLS pattern, a security definer function encapsulating the org membership check is the performance-correct approach at any scale beyond the smallest datasets. Without it, the RLS policy joins the membership table for every row evaluated — measured at 11,000ms before vs 7ms after with the `(select ...)` wrapper.

**Primary recommendation:** Create the Supabase project first via MCP, then scaffold Next.js 16 with `create-next-app`, integrate shadcn/ui from Phase 1, deploy to Vercel, and complete schema + auth in order. Schema must be applied before auth flows can be tested because the `profiles` table is created by a trigger on `auth.users`.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App Router framework | Already chosen; Turbopack default, `proxy.ts` session refresh |
| @supabase/supabase-js | 2.97.0 | Supabase client | Official JS client; required for auth, queries, realtime |
| @supabase/ssr | 0.8.0 | Cookie-based session management | Required for App Router; replaces deprecated `@supabase/auth-helpers-nextjs` |
| TypeScript | 5.9.3 | Type safety | Supabase CLI generates typed schema; Next.js 16 requires 5.1+ |
| Tailwind CSS | 4.2.0 | Styling | Already in use from Phase 1; CSS-first config |
| shadcn/ui | 3.8.5 | Component library | Already built in Phase 1; auth forms use existing components |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 4.3.6 | Auth form validation | Validate email format and password before calling Supabase |
| React Hook Form | 7.71.2 | Login/signup/reset forms | Already chosen; uncontrolled inputs for auth forms |
| @hookform/resolvers | latest | Connects Zod to RHF | Required bridge for Zod validation in RHF |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@supabase/ssr` | `@supabase/auth-helpers-nextjs` | `auth-helpers-nextjs` is deprecated; `@supabase/ssr` is the official replacement. Do not use `auth-helpers-nextjs`. |
| Cookie-based sessions | Local storage sessions | Cookie sessions work with Server Components and SSR; local storage is client-only and breaks server-side auth checks |
| `getUser()` in proxy | `getSession()` in proxy | `getSession()` trusts the client-supplied JWT without server validation; `getUser()` validates against Supabase's auth server. Always use `getUser()` in server-side code. |

**Installation:**

```bash
# Supabase clients
npm install @supabase/supabase-js @supabase/ssr

# Form validation (if not already installed from Phase 1)
npm install zod react-hook-form @hookform/resolvers
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/                   # Route group — auth-only layout
│   │   ├── layout.tsx            # Centered card layout for auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts      # Password reset PKCE callback handler
│   └── (app)/                    # Route group — authenticated app shell
│       ├── layout.tsx            # Sidebar + header shell
│       └── dashboard/
│           └── page.tsx          # Post-login redirect target
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser client (Client Components)
│       ├── server.ts             # Server client (Server Components, Actions)
│       └── proxy.ts              # updateSession function (used by proxy.ts)
├── components/
│   └── ui/                       # shadcn/ui components from Phase 1
├── types/
│   └── database.ts               # Supabase generated types
proxy.ts                          # Session refresh proxy (project root)
```

### Pattern 1: proxy.ts for Session Refresh

**What:** `proxy.ts` at the project root intercepts every non-static request, calls `updateSession`, which refreshes the Supabase auth token and writes the refreshed cookies back to both the request (for Server Components reading this request) and the response (for the browser to persist the new token).

**Critical:** In Next.js 16, the file MUST be named `proxy.ts` (not `middleware.ts`). The exported function MUST be named `proxy` (not `middleware`). The Edge runtime is NOT supported — proxy runs on the Node.js runtime only, which cannot be configured. Getting this wrong silently fails: all routes render without a refreshed session.

**Source:** [Next.js proxy.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) (official, updated 2026-02-20), [Next.js v16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) (official, updated 2026-02-20)

```typescript
// proxy.ts (project root — NOT middleware.ts)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

```typescript
// lib/supabase/proxy.ts — the updateSession function
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: always use getUser() not getSession() in server code
  // getUser() validates against Supabase auth server; getSession() trusts the client JWT
  await supabase.auth.getUser()

  return response
}
```

### Pattern 2: Server Client for Server Components and Actions

**What:** Server Components and Server Actions use a server-side Supabase client that reads cookies from the Next.js `cookies()` store. The `setAll` method catches errors silently because Server Components cannot set cookies (only the proxy can).

**Source:** [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs) (official)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies; proxy handles this
          }
        },
      },
    }
  )
}
```

### Pattern 3: Browser Client for Client Components

**What:** Client Components (forms, interactive UI) use a browser-side client that manages cookies via the browser's built-in cookie store.

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### Pattern 4: Auth Guard in Proxy

**What:** Redirect unauthenticated users from protected routes to `/login`. Redirect authenticated users away from `/login` and `/signup` to `/dashboard`. Done in `proxy.ts` or `lib/supabase/proxy.ts` by calling `getUser()` and checking the result.

```typescript
// Extended updateSession with auth guard
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(/* ... cookie config ... */)
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password')

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}
```

### Pattern 5: Multi-Tenant RLS with Security Definer Function

**What:** Every CRM table has an `org_id` column. RLS policies check that the requesting user belongs to the org via a security definer function (not inline subquery). The security definer function bypasses RLS on the membership lookup table itself, which is the performance-critical optimization.

**Why security definer over inline subquery:**
Inline subquery: 11,000ms → Security definer with `(select auth.uid())`: 7ms (official Supabase RLS performance benchmarks).

**Source:** [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) (official), [MakerKit RLS best practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) (MEDIUM — verified pattern)

```sql
-- Create accounts (team orgs) table
CREATE TABLE accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Create account memberships (users belong to accounts)
CREATE TABLE account_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, user_id)
);

-- Security definer function — bypasses RLS on account_members during check
-- MUST be in a non-exposed schema (private, not public)
CREATE OR REPLACE FUNCTION private.is_account_member(p_account_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = p_account_id
      AND user_id = (SELECT auth.uid())
  );
$$;

-- RLS policy using the function (fast: function result cached per-statement)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_access" ON contacts
  FOR ALL TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));
```

### Pattern 6: Soft Delete with RLS (The Tricky Part)

**What:** Contacts, organizations, and deals use soft delete (`deleted_at timestamptz`). The RLS SELECT policy must filter out soft-deleted rows. However, there is a critical gotcha: if the SELECT policy requires `deleted_at IS NULL`, you cannot call `UPDATE SET deleted_at = now()` because the row is visible before the update but must remain visible during the update transition.

**Solution:** Use a `SECURITY DEFINER` RPC function for the soft delete operation — it bypasses the restrictive SELECT policy. Standard queries get the filter; the delete function gets elevated privilege.

```sql
-- Add deleted_at to all soft-delete tables
ALTER TABLE contacts ADD COLUMN deleted_at timestamptz;
ALTER TABLE organizations ADD COLUMN deleted_at timestamptz;
ALTER TABLE deals ADD COLUMN deleted_at timestamptz;

-- RLS SELECT policy filters soft-deleted rows
CREATE POLICY "contacts_select" ON contacts
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND
    private.is_account_member(account_id)
  );

-- Separate UPDATE policy does NOT require deleted_at IS NULL
-- (so the soft-delete update can succeed)
CREATE POLICY "contacts_update" ON contacts
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

-- OR: use a security definer RPC for soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_contact(p_contact_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.contacts
  SET deleted_at = now()
  WHERE id = p_contact_id
    AND private.is_account_member(account_id);
$$;
```

**Entities that use soft delete:** contacts, organizations, deals, interactions, tasks
**Entities that use hard delete:** account_members (ephemeral), pipeline_stages (protected by FK constraints — cannot delete if deals reference them)

### Pattern 7: tsvector Full-Text Search

**What:** Generated columns maintain tsvector values automatically — no trigger required. GIN index makes search O(log n). Use `websearch_to_tsquery` for user input (handles partial words, quoted phrases, minus-exclusion).

**Source:** PITFALLS.md (verified against PostgreSQL official docs)

```sql
-- Contacts full-text search column
ALTER TABLE contacts ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(title, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED;

CREATE INDEX contacts_search_idx ON contacts USING GIN(search_vector);

-- Organizations full-text search column
ALTER TABLE organizations ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(website, '') || ' ' ||
      coalesce(city, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED;

CREATE INDEX organizations_search_idx ON organizations USING GIN(search_vector);
```

**Query pattern (from Next.js Server Component):**
```typescript
const { data } = await supabase
  .from('contacts')
  .select('id, first_name, last_name, email')
  .textSearch('search_vector', query, { type: 'websearch' })
  .eq('account_id', currentAccountId)
  .is('deleted_at', null)
  .limit(50)
```

### Pattern 8: Profiles Table via Trigger

**What:** Supabase Auth manages `auth.users`. CRM-specific user data (full name, avatar, account membership) lives in a `profiles` table in the `public` schema. A trigger on `auth.users` creates the profile row on signup — no application code needed.

```sql
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles(id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Pattern 9: Auth Flows in Server Actions

**What:** Sign up, login, logout, and password reset are implemented as Server Actions. The action calls the server-side Supabase client, handles errors, and uses `redirect()` for navigation. Client forms call the action using `useActionState` or plain `action=` attribute.

```typescript
// lib/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get('email') as string,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/update-password` }
  )
  if (error) return { error: error.message }
  return { success: 'Check your email for a password reset link.' }
}
```

### Pattern 10: Password Reset PKCE Callback

**What:** Supabase password reset uses PKCE flow. The email link hits a Next.js Route Handler that exchanges the code for a session, then redirects to the password update page.

```typescript
// app/(auth)/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

### Anti-Patterns to Avoid

- **Using `middleware.ts`:** In Next.js 16, this file is deprecated and does nothing. Use `proxy.ts`.
- **Using `getSession()` in server code:** Trusts the client-supplied JWT without validation. Use `getUser()` which validates against Supabase's auth server.
- **Using `@supabase/auth-helpers-nextjs`:** Deprecated. Use `@supabase/ssr`.
- **Inline auth.uid() in RLS without `(SELECT ...)` wrapper:** Called per-row instead of cached per-statement. 179ms → <0.1ms.
- **RLS on SELECT without separate UPDATE policy for soft delete:** The UPDATE to set `deleted_at` will fail because the row disappears from the user's visible set as soon as `deleted_at` becomes non-null.
- **Using ANON key as service_role equivalent:** The anon/publishable key is for client-side use with RLS. The secret/service_role key bypasses all RLS — never put it in `NEXT_PUBLIC_` env vars.
- **Skipping `WITH CHECK` on INSERT/UPDATE policies:** Without `WITH CHECK`, a user can insert a row with any `account_id`, including orgs they don't belong to. USING controls SELECT/DELETE visibility; WITH CHECK controls INSERT/UPDATE validation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session management | Custom JWT handling | `@supabase/ssr` + Supabase Auth | Cookie rotation, PKCE, refresh token rotation, concurrent tab handling — hundreds of edge cases |
| Password reset flow | Custom email + token generation | `supabase.auth.resetPasswordForEmail()` | PKCE is complex; Supabase handles code verifier/challenge, token expiry, one-time use |
| RLS bypass for admin ops | Custom auth middleware | `service_role` key in Server Actions only | The service role key pattern is the intended bypass mechanism |
| tsvector maintenance | Application-level triggers | `GENERATED ALWAYS AS … STORED` column | PostgreSQL handles re-computation automatically on INSERT/UPDATE; application triggers have race conditions |
| Multi-table search results | Client-side merging | PostgreSQL VIEW or RPC | Cannot efficiently merge paginated results from multiple tables in JS; cross-entity search needs a single query |

**Key insight:** Supabase Auth handles the OAuth/PKCE/JWT complexity that has broken countless custom implementations. The specific failure modes (token reuse across tabs, refresh race conditions, PKCE code verifier storage) require precise implementation that `@supabase/ssr` already handles correctly.

---

## Common Pitfalls

### Pitfall 1: proxy.ts Named Incorrectly

**What goes wrong:** Developer names the file `middleware.ts` or exports a function named `middleware`. In Next.js 16, this file convention is deprecated. It does not raise an error — it silently does nothing. All routes are unprotected. Sessions are never refreshed. Users get logged out on every hard refresh.

**Why it happens:** Every Next.js tutorial before v16 uses `middleware.ts`. The rename is easy to miss.

**How to avoid:** Name the file `proxy.ts`. Export `export async function proxy(request: NextRequest)`. Run `npx @next/codemod@canary middleware-to-proxy .` if migrating an existing project. Verify by checking that navigating to a protected route without being logged in redirects to `/login`.

**Warning signs:** The route `/dashboard` renders for unauthenticated users. Sessions do not persist across hard refresh.

### Pitfall 2: Supabase MCP Tool Usage Wrong Order

**What goes wrong:** Running `execute_sql` for DDL operations (CREATE TABLE, ALTER TABLE) instead of `apply_migration`. DDL run via `execute_sql` is not tracked in the migrations table, creating drift between what the Supabase project has and what the migration history records.

**How to avoid:** Use `apply_migration` for ALL DDL (CREATE TABLE, ALTER TABLE, CREATE INDEX, CREATE POLICY, CREATE FUNCTION). Use `execute_sql` only for data queries and DML (SELECT, INSERT seed data). After schema work, run `get_advisors` (security + performance) to catch missing RLS or missing indexes.

### Pitfall 3: Soft Delete + RLS SELECT Policy Breaks UPDATE

**What goes wrong:** RLS SELECT policy requires `deleted_at IS NULL`. Calling `.update({ deleted_at: new Date() })` on a contact fails because Postgres evaluates both the USING clause before the update and after — the row becomes invisible mid-update.

**How to avoid:** Either (a) separate the SELECT policy (with `deleted_at IS NULL`) from the UPDATE policy (without it), so the update is allowed on rows that will become invisible, or (b) implement soft delete via a `SECURITY DEFINER` RPC function that bypasses the restrictive SELECT filter.

**Warning signs:** Soft delete returns no error but the row still appears in queries (update silently had no effect because the row was already filtered out by the SELECT policy during the UPDATE's USING check).

### Pitfall 4: Environment Variables Wrong for Vercel

**What goes wrong:** Using the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable name instead of `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The new official template uses the publishable key name. Both keys work with the Supabase client — but the codebase must be consistent with whichever name is used.

**How to avoid:** Pick one name and use it everywhere. The Supabase official quickstart (`npx create-next-app -e with-supabase`) uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Use that. The Vercel integration auto-populates environment variables from the Supabase marketplace integration.

### Pitfall 5: Missing WITH CHECK on INSERT/UPDATE Policies

**What goes wrong:** Developer writes:
```sql
CREATE POLICY "contacts_access" ON contacts FOR ALL TO authenticated
  USING (private.is_account_member(account_id));
```
The USING clause controls SELECT and DELETE but does NOT constrain INSERT or UPDATE. A malicious authenticated user can insert a contact with any `account_id` — including orgs they don't belong to. This is the #1 RLS misconfiguration category.

**How to avoid:** For policies that cover INSERT or UPDATE, always include WITH CHECK:
```sql
USING (private.is_account_member(account_id))
WITH CHECK (private.is_account_member(account_id));
```

### Pitfall 6: profiles Table Created Before Trigger

**What goes wrong:** The `profiles` table trigger on `auth.users` does not fire retroactively. If a user signs up before the trigger is created, they have no profile row. Queries that join to `profiles` return null for these users.

**How to avoid:** Create the `profiles` table and trigger as the very first migration, before any user data is inserted. In development, create the trigger before testing auth.

### Pitfall 7: Account Creation Flow Not Wired

**What goes wrong:** Auth works but there is no `account` (org) creation flow. Users can sign up but have no `account_id` to associate with. RLS policies that require `private.is_account_member(account_id)` return zero rows for everyone.

**How to avoid:** On signup (or first login), detect that the user has no account membership and redirect to an onboarding flow that creates an `accounts` row and an `account_members` row for the user. For Phase 2, this can be a simple SQL seed that pre-creates one demo account and inserts all new users into it — full onboarding is a Phase 3+ concern.

**Simplest Phase 2 approach:** Seed one demo account. In the `handle_new_user` trigger, also insert into `account_members`:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_demo_account_id uuid;
BEGIN
  INSERT INTO public.profiles(id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');

  -- Auto-join the single demo account (Phase 2 simplification)
  SELECT id INTO v_demo_account_id FROM public.accounts LIMIT 1;
  IF v_demo_account_id IS NOT NULL THEN
    INSERT INTO public.account_members(account_id, user_id, role)
    VALUES (v_demo_account_id, NEW.id, 'member')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
```

---

## Code Examples

### Complete Schema for Phase 2

```sql
-- =============================================
-- ACCOUNTS (teams/organizations owning the CRM)
-- =============================================
CREATE TABLE accounts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE account_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, user_id)
);

CREATE INDEX account_members_user_idx ON account_members(user_id);
CREATE INDEX account_members_account_idx ON account_members(account_id);

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- PIPELINE STAGES (normalized — not strings on deals)
-- =============================================
CREATE TABLE pipeline_stages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name          text NOT NULL,
  display_order integer NOT NULL,
  probability   integer DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  is_won        boolean NOT NULL DEFAULT false,
  is_lost       boolean NOT NULL DEFAULT false,
  color         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pipeline_stages_account_idx ON pipeline_stages(account_id, display_order);

-- =============================================
-- ORGANIZATIONS (hospitals, clinics, labs — CRM entities)
-- =============================================
CREATE TABLE organizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name          text NOT NULL,
  type          text CHECK (type IN ('hospital', 'clinic', 'lab', 'other')),
  website       text,
  phone         text,
  address       text,
  city          text,
  state         text,
  tags          text[] DEFAULT '{}',
  notes         text,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id),
  updated_by    uuid REFERENCES auth.users(id),
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(city, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED
);

CREATE INDEX organizations_account_idx ON organizations(account_id);
CREATE INDEX organizations_search_idx ON organizations USING GIN(search_vector);
CREATE INDEX organizations_deleted_idx ON organizations(account_id) WHERE deleted_at IS NULL;

-- =============================================
-- CONTACTS
-- =============================================
CREATE TABLE contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text,
  phone         text,
  title         text,
  tags          text[] DEFAULT '{}',
  notes         text,
  deleted_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_by    uuid REFERENCES auth.users(id),
  updated_by    uuid REFERENCES auth.users(id),
  -- Full-text search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(first_name, '') || ' ' ||
      coalesce(last_name, '') || ' ' ||
      coalesce(email, '') || ' ' ||
      coalesce(title, '') || ' ' ||
      coalesce(notes, '')
    )
  ) STORED
);

CREATE INDEX contacts_account_idx ON contacts(account_id);
CREATE INDEX contacts_email_idx ON contacts(email);
CREATE INDEX contacts_name_idx ON contacts(last_name, first_name);
CREATE INDEX contacts_search_idx ON contacts USING GIN(search_vector);
CREATE INDEX contacts_deleted_idx ON contacts(account_id) WHERE deleted_at IS NULL;

-- =============================================
-- CONTACT-ORGANIZATION JUNCTION (many-to-many)
-- =============================================
CREATE TABLE contact_organizations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            text,           -- job title at this org
  is_primary      boolean NOT NULL DEFAULT false,
  started_at      date,
  ended_at        date,           -- null = current relationship
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(contact_id, organization_id)
);

CREATE INDEX contact_orgs_contact_idx ON contact_organizations(contact_id);
CREATE INDEX contact_orgs_org_idx ON contact_organizations(organization_id);

-- =============================================
-- DEALS
-- =============================================
CREATE TABLE deals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title           text NOT NULL,
  value           numeric(12,2),
  currency        text NOT NULL DEFAULT 'USD',
  stage_id        uuid NOT NULL REFERENCES pipeline_stages(id),
  position        text NOT NULL DEFAULT 'n',  -- lexicographic ordering within stage
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  owner_id        uuid REFERENCES auth.users(id),
  expected_close  date,
  closed_at       timestamptz,
  notes           text,
  tags            text[] DEFAULT '{}',
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id),
  updated_by      uuid REFERENCES auth.users(id)
);

CREATE INDEX deals_account_idx ON deals(account_id);
CREATE INDEX deals_stage_position_idx ON deals(stage_id, position);
CREATE INDEX deals_org_idx ON deals(organization_id);
CREATE INDEX deals_deleted_idx ON deals(account_id) WHERE deleted_at IS NULL;

-- =============================================
-- INTERACTIONS (calls, emails, meetings, notes)
-- Two-FK pattern — NOT polymorphic type column
-- =============================================
CREATE TABLE interactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type            text NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
  subject         text,
  body            text,
  occurred_at     timestamptz NOT NULL DEFAULT now(),
  duration_mins   integer,
  contact_id      uuid REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES deals(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  user_id         uuid NOT NULL REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT interaction_linked CHECK (
    contact_id IS NOT NULL OR deal_id IS NOT NULL OR organization_id IS NOT NULL
  )
);

CREATE INDEX interactions_contact_idx ON interactions(contact_id, occurred_at DESC);
CREATE INDEX interactions_deal_idx ON interactions(deal_id, occurred_at DESC);
CREATE INDEX interactions_account_idx ON interactions(account_id, occurred_at DESC);

-- =============================================
-- TASKS
-- =============================================
CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  due_date        timestamptz,
  is_complete     boolean NOT NULL DEFAULT false,
  completed_at    timestamptz,
  priority        text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  contact_id      uuid REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id         uuid REFERENCES deals(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  assignee_id     uuid REFERENCES auth.users(id),
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid REFERENCES auth.users(id),
  updated_by      uuid REFERENCES auth.users(id)
);

CREATE INDEX tasks_due_idx ON tasks(account_id, due_date) WHERE is_complete = false;
CREATE INDEX tasks_assignee_idx ON tasks(assignee_id, is_complete);
CREATE INDEX tasks_account_idx ON tasks(account_id);
```

### RLS Policy Template for All Tables

```sql
-- =============================================
-- SECURITY DEFINER FUNCTION (apply once)
-- MUST be in private schema, not public
-- =============================================
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_account_member(p_account_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.account_members
    WHERE account_id = p_account_id
      AND user_id = (SELECT auth.uid())
  );
$$;

-- =============================================
-- RLS POLICIES — apply this template to every table
-- Replace 'contacts' and 'contacts_access' with each table name
-- =============================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Deny all anonymous access (belt-and-suspenders with USING false)
CREATE POLICY "contacts_anon_deny" ON contacts
  FOR ALL TO anon
  USING (false);

-- Authenticated: all CRUD operations, scoped to account membership
-- SELECT also filters soft-deleted rows
CREATE POLICY "contacts_select" ON contacts
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL AND
    private.is_account_member(account_id)
  );

CREATE POLICY "contacts_insert" ON contacts
  FOR INSERT TO authenticated
  WITH CHECK (private.is_account_member(account_id));

-- UPDATE and DELETE do NOT require deleted_at IS NULL
-- This allows the soft-delete update to succeed
CREATE POLICY "contacts_update" ON contacts
  FOR UPDATE TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

CREATE POLICY "contacts_delete" ON contacts
  FOR DELETE TO authenticated
  USING (private.is_account_member(account_id));

-- pipeline_stages: no soft delete, no deleted_at filter needed
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stages_access" ON pipeline_stages
  FOR ALL TO authenticated
  USING (private.is_account_member(account_id))
  WITH CHECK (private.is_account_member(account_id));

-- profiles: users can read all profiles, edit only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- accounts: members can read, admins can update
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "accounts_select" ON accounts
  FOR SELECT TO authenticated
  USING (private.is_account_member(id));

-- account_members: members can read their own memberships
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "account_members_select" ON account_members
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR private.is_account_member(account_id));
```

### Supabase Auth Configuration (Dashboard Settings)

```
Authentication > Providers > Email:
  - Enable Email provider: ON
  - Confirm Email: OFF  (enables immediate access after signup, per decision)
  - Secure Email Change: ON (recommended default)
  - Minimum Password Length: 8 (Claude's Discretion recommendation)
  - Password Strength: Letter + Number (reasonable default)

Authentication > URL Configuration:
  - Site URL: https://your-vercel-domain.vercel.app
  - Redirect URLs: https://your-vercel-domain.vercel.app/**
    (wildcard covers /auth/callback, /update-password, etc.)
```

### Seed Data

```sql
-- One demo account
INSERT INTO accounts (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'HealthCRM Demo');

-- Pipeline stages (healthtech flavored)
INSERT INTO pipeline_stages (account_id, name, display_order, probability, is_won, is_lost, color)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Lead',           1, 10,  false, false, '#6366f1'),
  ('00000000-0000-0000-0000-000000000001', 'Qualified',      2, 25,  false, false, '#8b5cf6'),
  ('00000000-0000-0000-0000-000000000001', 'Demo',           3, 50,  false, false, '#a78bfa'),
  ('00000000-0000-0000-0000-000000000001', 'Proposal',       4, 70,  false, false, '#7c3aed'),
  ('00000000-0000-0000-0000-000000000001', 'Closed Won',     5, 100, true,  false, '#10b981'),
  ('00000000-0000-0000-0000-000000000001', 'Closed Lost',    6, 0,   false, true,  '#ef4444');
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_[key]
SUPABASE_SERVICE_ROLE_KEY=[secret-key]   # Server-only, never NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js v16 (Oct 2025) | Hard rename — wrong name silently does nothing |
| `export function middleware()` | `export function proxy()` | Next.js v16 | Same — named export must match |
| Edge runtime in middleware | Node.js runtime only in proxy | Next.js v16 | Cannot configure runtime in proxy; Edge requires keeping old `middleware.ts` |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | Supabase 2024 | `auth-helpers-nextjs` deprecated; do not use |
| `getSession()` server-side | `getUser()` server-side | Supabase 2024 | `getSession()` is insecure for server auth; `getUser()` validates with auth server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 2025 | New key format `sb_publishable_xxx`; both work during transition |
| `get`/`set`/`remove` cookie methods | `getAll`/`setAll` cookie methods | `@supabase/ssr` 0.5+ | Old method names cause cookie sync issues in App Router |
| Computed tsvector via trigger | `GENERATED ALWAYS AS … STORED` column | PostgreSQL 12+ | Generated columns eliminate trigger maintenance, no race conditions |
| `auth.uid()` in RLS directly | `(SELECT auth.uid())` in RLS | Supabase best practice | 179ms → 9ms per-query; caches auth function result per statement |
| Synchronous `cookies()` | `await cookies()` | Next.js v16 (async APIs) | All dynamic APIs fully async in v16; synchronous access removed |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Deprecated. Do not install or import.
- `middleware.ts` with `export function middleware()`: Deprecated in Next.js 16.
- `supabase.auth.getSession()` in server components: Insecure. Use `getUser()`.
- Edge runtime in proxy/middleware files: Not supported in proxy; use Node.js runtime.

---

## Discretion Recommendations

These are the Claude's Discretion items from CONTEXT.md with research-backed recommendations:

### Primary Keys: UUID (Confirmed)
Use `uuid PRIMARY KEY DEFAULT gen_random_uuid()`. Supabase convention, safe to expose in URLs, no sequential enumeration risk. Auto-increment integers leak record count and create merge conflicts in multi-source scenarios.

### Supabase Region: us-east-1
Select `us-east-1` (US East — N. Virginia) for general availability. Best latency for North American users, widest feature rollout priority at Supabase, closest to Vercel's primary edge network.

### Soft Delete Strategy by Entity
- **Soft delete** (use `deleted_at`): contacts, organizations, deals, interactions, tasks — any CRM entity with relational history. Deleted contacts with associated deals need preserved foreign key chains.
- **Hard delete**: account_members (leave org = clean removal), pipeline_stages (protected by FK — cannot delete if deals reference them; provide "archive" UX instead).

### Pipeline Stage Customizability: Fixed for Phase 2
Seed fixed stages (Lead → Qualified → Demo → Proposal → Closed Won / Closed Lost). Stage customization requires UI for reordering, renaming, and migrating existing deals between stages — a multi-step feature beyond Phase 2 scope. The `pipeline_stages` table design already supports customization when Phase 3+ implements it.

### Demo Data Industry: Healthtech
Use healthtech-flavored data consistent with the project context. Organization types: hospital, clinic, lab. Contact titles: Medical Director, Procurement Manager, IT Director, VP of Clinical Operations. Deal names: "Regional Hospital EHR Integration", "Lab Analytics Platform", etc.

### Password Complexity: Minimum 8 characters, letters + numbers
Configure in Supabase Auth dashboard: minimum 8 characters, require at least one letter and one number. No special character requirement (creates frustrating UX). Users can set stronger passwords voluntarily.

### Session Duration: Supabase defaults
Leave Supabase JWT expiry at default (1 hour access token, auto-refresh via refresh token). The `proxy.ts` `updateSession` handles refresh transparently. No need to configure shorter or longer sessions for Phase 2.

### Error Page Styling: Use existing shadcn/ui components
Auth error states use the existing `shadcn/ui` Alert component with destructive variant. No custom error pages needed. Inline error display below the relevant form field.

---

## Open Questions

1. **Onboarding vs auto-join demo account**
   - What we know: New users have no account membership after signup, so RLS returns zero rows for everything.
   - What's unclear: Should Phase 2 implement a real onboarding flow (create/join account screen) or just auto-join a seeded demo account via the signup trigger?
   - Recommendation: Auto-join the seeded demo account via trigger for Phase 2. A real onboarding flow is a Phase 3 feature.

2. **TypeScript type generation timing**
   - What we know: `supabase gen types typescript` requires the schema to exist in the project.
   - What's unclear: Whether to use the Supabase MCP `generate_typescript_types` tool or the CLI.
   - Recommendation: Use the Supabase MCP tool (`generate_typescript_types`) after schema is applied — it produces types without needing the Supabase CLI installed locally.

3. **Phase 1 component integration**
   - What we know: Phase 1 built prototype HTML screens. Phase 2 scaffolds a fresh Next.js project.
   - What's unclear: Exactly how Phase 1 prototype components map to the new Next.js project structure.
   - Recommendation: Phase 1 produced design references (HTML/CSS). Phase 2 re-implements auth screens (login, signup, forgot password) using shadcn/ui components + the established OKLCH color tokens from Phase 1. Existing Phase 1 mock data can be replaced with real Supabase queries in Phase 3.

---

## Sources

### Primary (HIGH confidence)
- [Next.js proxy.ts file convention docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — proxy function signature, config matcher, runtime, migration from middleware (updated 2026-02-20)
- [Next.js version 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — breaking changes: proxy rename, async APIs, Turbopack default (updated 2026-02-20)
- [Supabase SSR Next.js setup](https://supabase.com/docs/guides/auth/server-side/nextjs) — proxy.ts updateSession, server client, browser client patterns
- [Supabase Row Level Security docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — policy syntax, USING vs WITH CHECK, performance recommendations, benchmarks
- [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — `create-next-app -e with-supabase`, publishable key env var name
- [Supabase AI prompt for Next.js auth](https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth) — current official scaffolding guidance
- Supabase MCP tool — live verification of project API, migrations, table operations

### Secondary (MEDIUM confidence)
- [MakerKit RLS best practices](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices) — security definer function pattern for membership checks (verified against official RLS performance docs)
- [Next.js proxy rename explanation](https://www.buildwithmatija.com/blog/nextjs16-middleware-change) — why the rename happened (verified against official Next.js docs)
- [Supabase password auth config](https://supabase.com/docs/guides/auth/passwords) — Confirm Email disable for immediate access (verified against auth quickstart)
- [Supabase Vercel integration](https://supabase.com/partners/integrations/vercel) — marketplace integration auto-populates env vars

### Tertiary (LOW confidence)
- Supabase GitHub discussions on soft delete with RLS (#2799, #32523) — soft delete + RLS timing issue (community, not official — independently verified the issue exists via PostgreSQL documentation)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official docs for all libraries
- proxy.ts pattern: HIGH — official Next.js docs updated 2026-02-20, confirmed breaking change
- RLS patterns: HIGH — official Supabase docs + confirmed performance benchmarks
- Schema design: HIGH — based on ARCHITECTURE.md (already researched) + PITFALLS.md mandates
- Auth flows: HIGH — official Supabase auth docs
- Vercel deployment: MEDIUM — integration pattern confirmed via official Supabase/Vercel docs; exact dashboard steps change occasionally

**Research date:** 2026-02-22
**Valid until:** 2026-04-22 (60 days — stable docs; proxy.ts change is stable in v16)
