# Phase 1: Foundation - Research

**Researched:** 2026-03-28
**Domain:** Next.js 16 App Router + @supabase/ssr v0.9.0 authentication + Vercel deployment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Login + register on one page (home `/`) with tabs — PLAN.md defines `page.tsx` as "Home: login + modus kiezen"
- After successful login: page transforms in-place to show mode chooser (no redirect)
- Password reset: deferred — not in v1 requirements
- Migration via SQL file — user pastes into Supabase dashboard (no CLI required)
- Create `.env.local.example` with: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY
- Default word list seeding: deferred to Phase 3
- Route protection via Next.js proxy (formerly middleware) with Supabase session check
- Root layout: minimal — no nav bar in Phase 1
- Supabase lib: `src/lib/supabase/client.ts` + `src/lib/supabase/server.ts` (exact PLAN.md structure)

### Claude's Discretion
- Auth form visual design (colors, spacing) — standard Tailwind, clean and child-friendly
- Error message wording — clear Dutch, no technical jargon
- Proxy matcher pattern — standard Next.js convention

### Deferred Ideas (OUT OF SCOPE)
- Password reset flow — v2
- Nav bar — will emerge naturally in later phases
- Default word list seeding — Phase 3
- Any visual polish beyond clean/functional — later phases
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can register with email and password via Supabase | `supabase.auth.signUp()` via `createBrowserClient` in client component; existing `page.tsx` already implements this |
| AUTH-02 | User can log in with email and password | `supabase.auth.signInWithPassword()` via `createBrowserClient`; existing `page.tsx` already implements this |
| AUTH-03 | User session persists across browser refresh | Requires `proxy.ts` at project root using `createServerClient` with `getAll`/`setAll` cookie pattern; session refresh happens in proxy, not in Server Components |
</phase_requirements>

---

## Summary

This phase is mostly already scaffolded. The project contains `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` with correct @supabase/ssr v0.9.0 patterns, `app/page.tsx` with a working auth UI (login/register tabs, mode chooser after login), and `supabase/migrations/001_dictee_tables.sql` with the full schema and RLS policies.

The critical missing piece is `proxy.ts` (NOT `middleware.ts` — Next.js 16 renames middleware to proxy). Without it, session cookies are never refreshed server-side, causing AUTH-03 to fail: a user who returns after token expiry will appear logged out despite a valid refresh token in their browser cookies. The proxy must run `createServerClient` with `getAll`/`setAll` and call `supabase.auth.getUser()` to trigger the token refresh cycle.

The secondary task is creating `.env.local.example` and verifying the Vercel deployment works end-to-end.

**Primary recommendation:** Create `proxy.ts` at project root using the `getAll`/`setAll` cookie pattern, deploy to Vercel, and verify session persistence after browser close/reopen.

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.1 | App Router, proxy, server components | Project requirement |
| @supabase/ssr | 0.9.0 | Cookie-based session management for SSR | Replaces deprecated `@supabase/auth-helpers-nextjs` |
| @supabase/supabase-js | ^2.100.1 | Supabase client (auth, DB) | Required peer dependency |
| tailwindcss | ^4 | Styling | Project requirement |
| react | 19.2.4 | UI | Next.js 16 ships with React 19.2 |

### No additional packages needed for Phase 1
All required packages are already installed. Phase 1 does not require Zod, iron-session, or any auth library beyond @supabase/ssr.

---

## Architecture Patterns

### Recommended Project Structure (already exists, gaps noted)

```
dictee-coach/
├── proxy.ts                          # MISSING — must create (session refresh)
├── .env.local.example                # MISSING — must create
├── src/
│   ├── app/
│   │   ├── layout.tsx                # EXISTS — minimal, correct
│   │   └── page.tsx                  # EXISTS — auth UI + mode chooser
│   └── lib/
│       └── supabase/
│           ├── client.ts             # EXISTS — createBrowserClient (correct)
│           └── server.ts             # EXISTS — createServerClient with getAll/setAll (correct)
└── supabase/
    └── migrations/
        └── 001_dictee_tables.sql     # EXISTS — full schema + RLS policies
```

### Pattern 1: Browser Client (client components)
**What:** Singleton `createBrowserClient` for client-side auth operations.
**When to use:** Any `'use client'` component that calls `supabase.auth.*` or DB queries from the browser.

```typescript
// Source: node_modules/@supabase/ssr/src/createBrowserClient.ts
// src/lib/supabase/client.ts — ALREADY CORRECT, no changes needed
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

`createBrowserClient` automatically uses `document.cookie` and is a singleton (returns the same instance if called multiple times in a browser context). No manual cookie config needed.

### Pattern 2: Server Client (server components, route handlers)
**What:** `createServerClient` with async `cookies()` from `next/headers`. Reads cookies from the incoming request; can set cookies in Server Functions and Route Handlers.
**When to use:** Server Components, Route Handlers (`route.ts`), Server Actions.

```typescript
// Source: node_modules/@supabase/ssr/src/createServerClient.ts +
//         node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md
// src/lib/supabase/server.ts — ALREADY CORRECT, no changes needed
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()  // MUST be async in Next.js 16

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // Server Component render — cannot set cookies here.
            // Token refresh happens in proxy.ts instead.
          }
        },
      },
    }
  )
}
```

**Critical:** The `try/catch` in `setAll` is intentional and correct. Server Components cannot set cookies. The `catch` block is a developer-aid warning suppressor — the real cookie refresh happens in `proxy.ts`.

### Pattern 3: Proxy (session refresh — MUST CREATE)
**What:** `proxy.ts` at project root runs before every request. Creates a server client, calls `getUser()` to trigger token refresh, and forwards the response with updated `Set-Cookie` headers.
**When to use:** This is the ONLY place where Supabase session refresh happens reliably server-side.

**CRITICAL Next.js 16 change:** The file is `proxy.ts`, NOT `middleware.ts`. The exported function is `proxy`, NOT `middleware`. This is a breaking rename in Next.js 16.0.0 (the codemod is `npx @next/codemod@canary middleware-to-proxy .`).

```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
//         node_modules/@supabase/ssr/docs/design.md
// proxy.ts at project root
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set on both request (for downstream use) and response (for browser)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Call getUser() — not getSession() — to trigger token refresh
  // and to validate the user identity server-side.
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Why `getUser()` not `getSession()`:**
- `getSession()` reads directly from cookies without contacting Supabase Auth — the user object is NOT verified and must NOT be used for authorization.
- `getUser()` contacts Supabase Auth on every call to validate the token. This also triggers the token refresh cycle.
- Source: `node_modules/@supabase/ssr/README.md` (getSession vs getUser vs getClaims section)

### Anti-Patterns to Avoid
- **`middleware.ts` with `export function middleware()`:** Deprecated in Next.js 16. Use `proxy.ts` with `export function proxy()` or `export async function proxy()`.
- **`get`/`set`/`remove` cookie methods:** Deprecated in @supabase/ssr since v0.4.0. Use `getAll`/`setAll` only.
- **`getSession()` for authorization:** Returns unverified user object from cookie. Use `getUser()`.
- **Synchronous `cookies()`:** Breaking change in Next.js 16 — must `await cookies()`. Synchronous access removed (was deprecated in v15, removed in v16).
- **Skipping proxy entirely:** Session tokens expire. Without proxy, users get "random logouts" after token expiry even with a valid refresh token in their browser.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie chunking for session storage | Custom cookie split/join | @supabase/ssr `getAll`/`setAll` | Cookies have 3180-byte limit; chunking strategy is complex and versioned (base64url encoding since v0.4.0) |
| Token refresh on page load | Manual JWT decode + refresh fetch | `proxy.ts` + `supabase.auth.getUser()` | Single-use refresh tokens cause race conditions if two requests try to refresh simultaneously; @supabase/ssr handles this |
| Auth state sync between server and browser | Manual cookie setting | `createServerClient` with `setAll` in proxy | Server must forward `Set-Cookie` headers; missing this causes session loss |
| Password hashing / user storage | Custom auth DB table | Supabase Auth (`auth.users`) | Built-in, already shared with Aruba bijles app |

**Key insight:** @supabase/ssr v0.9.0 handles all session persistence complexity internally — but ONLY if `proxy.ts` is present and `getAll`/`setAll` are correctly wired.

---

## Common Pitfalls

### Pitfall 1: Using `middleware.ts` instead of `proxy.ts`
**What goes wrong:** Next.js 16 deprecated and renamed middleware to proxy. The file `middleware.ts` with `export function middleware()` is deprecated. While likely still functional via backward compatibility in 16.x, it will break in future versions. The codemod warning in version-16.md explicitly targets this.
**Why it happens:** Training data (and many online tutorials) reference `middleware.ts`.
**How to avoid:** Create `proxy.ts` at project root. Export `proxy` function (not `middleware`). See proxy.md in Next.js 16 docs.
**Warning signs:** Build warnings about deprecated file convention.

### Pitfall 2: `cookies()` used synchronously
**What goes wrong:** `TypeError: cookies() should be awaited` or silent stale data.
**Why it happens:** In Next.js 14/15, `cookies()` was synchronous. In Next.js 16, it is fully async — synchronous compatibility removed.
**How to avoid:** Always `await cookies()` in server.ts and any server-side code. The existing `server.ts` already does this correctly.
**Warning signs:** TypeScript errors on `cookieStore.getAll()` without await, or runtime errors.

### Pitfall 3: Using `get`/`set`/`remove` cookie methods (deprecated since @supabase/ssr v0.4.0)
**What goes wrong:** Stale cookie chunks, garbled JSON sessions, random logouts.
**Why it happens:** The `get`/`set`/`remove` pattern cannot handle cookie chunk state transitions (chunked→non-chunked, more chunks→fewer chunks).
**How to avoid:** Always use `getAll`/`setAll`. The existing `server.ts` already uses the correct pattern.
**Warning signs:** Console warnings from @supabase/ssr about deprecated cookie methods.

### Pitfall 4: `supabaseResponse` variable replacement in proxy
**What goes wrong:** If `supabaseResponse` is replaced inside `setAll` without also updating `request.cookies`, the downstream server components receive stale cookies.
**Why it happens:** `NextResponse.next({ request })` creates a new response — if you replace it inside `setAll`, you must set cookies on the NEW response, not the original one.
**How to avoid:** Follow the exact pattern above — reassign `supabaseResponse` inside `setAll`, and also set on `request.cookies` so downstream handlers see the updated session.
**Warning signs:** Session appears valid in proxy but null in server components.

### Pitfall 5: Calling supabase auth methods after response is committed
**What goes wrong:** Token refresh completes but `Set-Cookie` headers cannot be written — next request re-refreshes.
**Why it happens:** In @supabase/ssr, `setAll` is called asynchronously when auth state changes. If the HTTP response is already committed, the headers cannot be updated.
**How to avoid:** Call `await supabase.auth.getUser()` EARLY in the proxy function, before constructing any response. The pattern above does this correctly.
**Warning signs:** Increased number of token refresh requests in Supabase logs.

### Pitfall 6: Shared Supabase project — RLS policies must not block the other app
**What goes wrong:** New RLS policies for dictee tables accidentally conflict with or block Aruba bijles app queries.
**Why it happens:** Same `auth.users` table, same Supabase project.
**How to avoid:** The migration SQL creates policies scoped to `auth.uid() = user_id` on NEW tables only (`word_lists`, `word_list_items`, `dictee_sessions`, `dictee_results`). These do not affect existing Aruba tables. The SQL in `001_dictee_tables.sql` is already correctly scoped.
**Warning signs:** Aruba bijles app auth starts failing after dictee migration is run.

---

## Code Examples

### Complete proxy.ts for Supabase + Next.js 16

```typescript
// Source: node_modules/@supabase/ssr/docs/design.md (SSR patterns section)
//         node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
// proxy.ts — project root (NOT src/)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### .env.local.example

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
```

### SQL Migration (already in supabase/migrations/001_dictee_tables.sql — verified correct)
The migration file already exists with:
- 4 tables: `word_lists`, `word_list_items`, `dictee_sessions`, `dictee_results`
- RLS enabled on all tables
- 4 policies scoped to `auth.uid()`
- All UUID primary keys, correct foreign key cascades
- No changes needed

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export function proxy()` | Next.js 16.0.0 | Must use new file/function name |
| `cookies()` synchronous access | `await cookies()` | Next.js 15→16 (breaking in 16) | All server.ts cookie reads must be async |
| `get`/`set`/`remove` in @supabase/ssr | `getAll`/`setAll` | @supabase/ssr v0.4.0 | Old methods cause session corruption |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | ~2023 | Package consolidated; helpers deprecated |

**Deprecated/outdated:**
- `middleware.ts`: Deprecated in Next.js 16, replaced by `proxy.ts`.
- `supabase.auth.getSession()` for auth decisions: Never use for authorization — returns unverified cookie data. Use `getUser()`.
- Synchronous `cookies()`: Removed in Next.js 16.

---

## What's Already Done

The following files exist and are CORRECT — they do not need to be created or modified:

| File | Status | Notes |
|------|--------|-------|
| `src/lib/supabase/client.ts` | Correct | Uses `createBrowserClient`, no cookie config needed |
| `src/lib/supabase/server.ts` | Correct | Uses `await cookies()`, `getAll`/`setAll` pattern |
| `src/app/layout.tsx` | Correct | Minimal, no nav, `lang="nl"` |
| `src/app/page.tsx` | Correct | Auth tabs, mode chooser, `handleSignOut`, Dutch labels, explicit errors |
| `supabase/migrations/001_dictee_tables.sql` | Correct | All 4 tables + RLS policies |

The PLAN.md file structure is also partially in place: `src/app/dictee/`, `src/app/lijsten/`, `src/app/voortgang/`, `src/components/dictee/`, `src/components/ui/`, `src/lib/tts/`, `src/lib/dictee/`, `src/types/dictee.ts` directories/files exist (not needed in Phase 1 but already scaffolded).

**Phase 1 remaining work:**
1. Create `proxy.ts` at project root
2. Create `.env.local.example`
3. Verify Vercel deployment works (env vars configured, login/register functional, session persists)

---

## Open Questions

1. **Does Next.js 16 still accept `middleware.ts` as a backward-compatible filename?**
   - What we know: The docs say "deprecated and renamed to proxy" at v16.0.0. The codemod exists.
   - What's unclear: Whether `middleware.ts` still works at runtime in 16.x or throws an error.
   - Recommendation: Use `proxy.ts` regardless — it's the correct current convention per official docs.

2. **`proxy.ts` at project root vs inside `src/`?**
   - What we know: `proxy.md` says "in the project root, or inside `src` if applicable". The project uses `src/app/`.
   - Recommendation: Place at project root (same level as `package.json`), consistent with existing Next.js scaffold.

---

## Validation Architecture

No test framework is configured in this project (`package.json` has no test script, no jest/vitest config found). Phase 1 is infrastructure + auth — manual end-to-end validation is the appropriate gate.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Command | Notes |
|--------|----------|-----------|---------|-------|
| AUTH-01 | User can register with email/password | manual e2e | Open app, register new email | Supabase dashboard confirms user created |
| AUTH-02 | User can log in with email/password | manual e2e | Open app, log in | Mode chooser appears after login |
| AUTH-03 | Session persists across browser refresh | manual e2e | Log in, close tab, reopen app URL | Mode chooser still shown (not auth form) |

### Wave 0 Gaps
No automated test infrastructure needed for Phase 1. All verification is manual.

**Phase gate:** All three manual checks pass on Vercel production URL before proceeding to Phase 2.

---

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — proxy.ts file convention, migration from middleware, matcher patterns, cookie handling
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — Breaking changes: async Request APIs, middleware→proxy rename, Turbopack default
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` — `cookies()` async requirement, `getAll()`/`set()` API
- `node_modules/@supabase/ssr/src/createServerClient.ts` — `getAll`/`setAll` interface, `getSession` vs `getUser` warning, `skipAutoInitialize`
- `node_modules/@supabase/ssr/src/createBrowserClient.ts` — singleton pattern, auto `document.cookie` use
- `node_modules/@supabase/ssr/docs/design.md` — cookie chunking strategy, SSR patterns, `getAll`/`setAll` deprecation rationale
- `node_modules/@supabase/ssr/README.md` — `getSession()` vs `getUser()` vs `getClaims()` guidance, concurrent request pitfall

### Secondary (MEDIUM confidence)
- `src/lib/supabase/client.ts` — existing correct browser client implementation
- `src/lib/supabase/server.ts` — existing correct server client implementation (verified against API docs)
- `src/app/page.tsx` — existing auth UI (verified against CONTEXT.md requirements)
- `supabase/migrations/001_dictee_tables.sql` — existing migration (verified against PLAN.md schema)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against installed package source code
- Architecture patterns: HIGH — derived directly from Next.js 16 docs + @supabase/ssr source
- Pitfalls: HIGH — derived from official migration docs and package design documentation
- "What's already done" assessment: HIGH — read actual files

**Research date:** 2026-03-28
**Valid until:** 2026-06-28 (stable APIs; @supabase/ssr and Next.js 16 are unlikely to change breaking patterns within 90 days)
