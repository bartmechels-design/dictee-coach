# Dictee Coach

## What This Is

A web app where Dutch primary school children (groep 3–8) practice spelling by listening to words spoken by an AI voice, typing them in, and receiving immediate feedback. Teachers and parents can track progress per child and manage custom word lists.

## Core Value

A child hears a word, types it, and instantly knows if they got it right — with a natural-sounding voice and clear feedback, every time.

## Current Milestone: v1.0 — MVP

**Goal:** Build and deploy the full dictee flow — auth, TTS, word lists, dictee session, progress, and paywall.

**Target features:**
- Authentication (Supabase — shared with Aruba app)
- TTS via OpenAI API with browser-speech fallback and explicit error messaging
- Built-in word lists per grade (groep 3–8)
- Dictee session flow: hear → type → feedback → summary
- Progress tracking per child
- Gumroad paywall (free: 3 sessions + built-in lists; paid: unlimited + custom lists)
- Landing page

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can log in / register via Supabase auth
- [ ] User hears a word spoken by OpenAI TTS (natural voice)
- [ ] Fallback to browser speech with explicit user notification
- [ ] User types the word and receives immediate correct/incorrect feedback
- [ ] User sees session summary (score, missed words) at the end
- [ ] Teacher/parent can manage word lists
- [ ] Built-in word lists for groep 3–8
- [ ] Teacher/parent sees progress per child over time
- [ ] Free tier: built-in lists + 3 trial sessions
- [ ] Paid tier: €3,99 one-time via Gumroad — unlimited sessions + custom lists
- [ ] Landing page explaining the product

### Out of Scope

- Speech recognition — child types, does not speak
- Multiplayer/class mode — single child at a time
- AI feedback — direct spelling check is enough
- Gamification (v1) — points/badges deferred

## Context

- Shares Supabase project with the Aruba bijles app (same auth system)
- Lessons from Koko app: TTS had 500 error on Vercel (only worked locally) → deploy TTS route first, test on Vercel before continuing
- File size rule: no component or route > 200 lines
- No silent fallbacks — always show explicit error messages
- API routes: one responsibility each
- Deploy after every feature, not after the whole thing is done

## Constraints

- **Tech stack**: Next.js 16 (App Router), Tailwind CSS 4, Supabase, OpenAI TTS — matches existing Aruba app
- **Hosting**: Vercel — existing workflow
- **Payment**: Gumroad — proven working from Aruba
- **File size**: Max 200 lines per file — from lessons learned
- **TTS**: Must test on Vercel (not just locally) before proceeding — previous production bug

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| OpenAI TTS over browser speech | Natural voice improves child engagement | — Pending |
| ArrayBuffer response (not streaming) for TTS | Vercel compatibility — streaming caused 500 errors in Koko | — Pending |
| Shared Supabase project | Reuse auth, avoid managing two backends | — Pending |
| Gumroad for payments | Already validated with Aruba app | — Pending |
| Child types, doesn't speak | Simplifies v1 significantly | — Pending |

---
*Last updated: 2026-03-28 after v1.0 milestone start*
