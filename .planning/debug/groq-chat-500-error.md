---
status: fixing
trigger: "Portal chat returns 'Something went wrong' after Gemini-to-Groq migration"
created: 2026-02-25T00:00:00Z
updated: 2026-02-25T15:30:00Z
---

## Current Focus

hypothesis: Two root causes - (1) unhandled errors from code outside try-catch, (2) opaque client error messages hiding the actual failure
test: Wrap all route code in try-catch, surface real error messages to client
expecting: Errors become visible, enabling rapid diagnosis of any remaining runtime issues
next_action: Apply fixes, clear .next cache, restart dev server, test

## Symptoms

expected: Portal chat sends message, gets AI response back, displays it
actual: Every message shows "Something went wrong. Please try again."
errors: Generic catch-all error from PortalChat.tsx client-side
reproduction: Send any message in portal chat
started: After migrating from Gemini to Groq

## Eliminated

- hypothesis: Groq API itself is broken
  evidence: Tested with node/tsx using actual chatTools and SYSTEM_PROMPT - works perfectly, returns responses and handles tool calls correctly
  timestamp: 2026-02-25T15:10:00Z

- hypothesis: TypeScript compilation error
  evidence: tsc --noEmit succeeds with zero errors
  timestamp: 2026-02-25T15:05:00Z

- hypothesis: Next.js build error
  evidence: npx next build succeeds, routes correctly listed
  timestamp: 2026-02-25T15:06:00Z

- hypothesis: Groq SDK ESM/CJS import issue
  evidence: Tested ESM dynamic import - default export correctly resolves to Groq class
  timestamp: 2026-02-25T15:15:00Z

- hypothesis: JSON.parse("null") crash on empty tool arguments
  evidence: JSON.parse("null") returns null, null ?? {} returns {} - already fixed in commit 9918855
  timestamp: 2026-02-25T15:08:00Z

- hypothesis: Groq response object not serializable
  evidence: JSON.stringify on Groq message objects works correctly, no non-enumerable or circular properties
  timestamp: 2026-02-25T15:12:00Z

- hypothesis: Old Gemini code being served from .next cache
  evidence: Build output references correct source file, no Gemini references in compiled output
  timestamp: 2026-02-25T15:14:00Z

- hypothesis: Supabase getUser() destructuring crash
  evidence: getUser() always returns { data: { user: null|User } } - safe destructuring
  timestamp: 2026-02-25T15:20:00Z

## Evidence

- timestamp: 2026-02-25T15:05:00Z
  checked: TypeScript compilation
  found: Zero errors
  implication: Not a compile-time issue

- timestamp: 2026-02-25T15:06:00Z
  checked: Next.js production build
  found: Builds cleanly, all routes listed correctly
  implication: Not a build issue

- timestamp: 2026-02-25T15:07:00Z
  checked: Package dependencies
  found: groq-sdk@0.37.0 installed, no @google/generative-ai
  implication: Migration dependencies correct

- timestamp: 2026-02-25T15:08:00Z
  checked: GROQ_API_KEY in .env.local
  found: Key present and valid
  implication: Not a missing env var issue (locally)

- timestamp: 2026-02-25T15:10:00Z
  checked: End-to-end Groq API flow with actual chatTools
  found: Works perfectly - handles simple responses, tool calls, tool results, and second calls
  implication: All Groq API logic is correct

- timestamp: 2026-02-25T15:15:00Z
  checked: Groq argument format for empty-param tools
  found: Returns "null" or "{}" - both handled correctly by JSON.parse + ?? {}
  implication: No argument parsing crash

- timestamp: 2026-02-25T15:20:00Z
  checked: Route.ts code structure
  found: Lines 26-40 (env check, createClient, getUser, request.json) are OUTSIDE the try-catch block
  implication: Any error from these lines returns an unhandled exception (HTML 500), causing client res.json() to throw

- timestamp: 2026-02-25T15:22:00Z
  checked: PortalChat.tsx error handling
  found: Client shows opaque "Something went wrong" for BOTH !res.ok AND catch block - impossible to distinguish server 500 from HTML parse error from network error
  implication: Client-side error messages need to surface actual error details

## Resolution

root_cause: Two issues - (1) lines 26-40 in route.ts and lines 9-17 in confirm/route.ts were outside the try-catch block, meaning createClient(), getUser(), or request.json() errors would cause an unhandled exception resulting in a non-JSON 500 response; (2) PortalChat.tsx showed the same opaque error message for all failure modes, making diagnosis impossible
fix: Wrapped entire route handler bodies in try-catch (both route.ts and confirm/route.ts); Updated PortalChat.tsx to surface actual error details from both API responses and catch blocks; Cleared .next cache
verification: TypeScript compiles cleanly; need user to restart dev server and test
files_changed:
  - src/app/api/chat/route.ts
  - src/app/api/chat/confirm/route.ts
  - src/components/portal/PortalChat.tsx
