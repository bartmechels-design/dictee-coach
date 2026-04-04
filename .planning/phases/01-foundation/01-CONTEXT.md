# Phase 1: Foundation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers a working authenticated app on Vercel: Supabase DB tables created, login/register UI working, session persisting across refresh, and the deployed app verified on production. No dictee features — foundation only.

</domain>

<decisions>
## Implementation Decisions

### Auth UI
- Login + register on one page (home `/`) with tabs — PLAN.md defines `page.tsx` as "Home: login + modus kiezen"
- After successful login: page transforms in-place to show mode chooser (no redirect)
- Password reset: deferred — not in v1 requirements

### Database & Config
- Migration via SQL file — user pastes into Supabase dashboard (no CLI required)
- Create `.env.local.example` with: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENAI_API_KEY
- Default word list seeding: deferred to Phase 3

### Route Protection & Layout
- Route protection via Next.js middleware with Supabase session check (standard @supabase/ssr pattern)
- Root layout: minimal — no nav bar in Phase 1
- Supabase lib: `src/lib/supabase/client.ts` + `src/lib/supabase/server.ts` (exact PLAN.md structure)

### Claude's Discretion
- Auth form visual design (colors, spacing) — standard Tailwind, clean and child-friendly
- Error message wording — clear Dutch, no technical jargon
- Middleware matcher pattern — standard Next.js convention

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Default Next.js 16 App Router scaffold (`app/layout.tsx`, `app/page.tsx`, `app/globals.css`)
- Dependencies already installed: `@supabase/ssr@^0.9.0`, `@supabase/supabase-js@^2.100.1`, `next@16.2.1`, `tailwindcss@^4`

### Established Patterns
- App Router with `app/` directory
- Tailwind CSS 4 for styling
- No existing auth, components, or lib files yet — greenfield

### Integration Points
- New files: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- New file: `middleware.ts` at project root
- Replace `app/page.tsx` with auth + mode-chooser home page
- SQL migration file to provide separately (user runs in Supabase dashboard)

</code_context>

<specifics>
## Specific Ideas

- PLAN.md defines exact DB schema: `word_lists`, `word_list_items`, `dictee_sessions`, `dictee_results` tables
- PLAN.md defines exact file structure — follow it precisely
- Shared Supabase project with Aruba bijles app — same auth system
- Max 200 lines per component file — hard rule

</specifics>

<deferred>
## Deferred Ideas

- Password reset flow — v2
- Nav bar — will emerge naturally in later phases
- Default word list seeding — Phase 3
- Any visual polish beyond clean/functional — later phases

</deferred>
