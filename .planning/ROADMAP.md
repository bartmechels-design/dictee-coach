# Roadmap: Dictee Coach

## Overview

Four phases deliver the complete dictee MVP: foundation with auth deployed to Vercel, then a hard-gated TTS route verified on Vercel before continuing, then the full dictee core (word lists + session flow), and finally progress tracking, paywall, and landing page.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Supabase DB migration + Auth + deploy to Vercel
- [ ] **Phase 2: TTS** - OpenAI TTS route built, deployed, and verified on Vercel before continuing
- [ ] **Phase 3: Dictee Core** - Word lists + full session flow (hear → type → feedback → summary)
- [ ] **Phase 4: Extras** - Progress tracking + paywall + landing page

## Phase Details

### Phase 1: Foundation
**Goal**: Users can register, log in, and reach a working app on Vercel
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. User can register a new account with email and password
  2. User can log in with email and password
  3. User session persists after a browser refresh (stays logged in)
  4. The deployed app on Vercel loads without errors
**Plans**: TBD

Plans:
- [ ] 01-01: Supabase DB migration (create word_lists, word_list_items, dictee_sessions, dictee_results tables)
- [ ] 01-02: Auth UI and Supabase integration (register, login, session persistence)
- [ ] 01-03: Deploy to Vercel and verify login flow on production

### Phase 2: TTS
**Goal**: The TTS route works on Vercel — confirmed before any further building
**Depends on**: Phase 1
**Requirements**: TTS-01, TTS-02, TTS-03, TTS-04, TTS-05
**Success Criteria** (what must be TRUE):
  1. User hears a word spoken in a natural Dutch voice (OpenAI TTS) on the live Vercel deployment
  2. The TTS route returns an ArrayBuffer response (not streaming) — confirmed on Vercel
  3. When OpenAI TTS fails, browser speech (window.speechSynthesis) plays the word instead
  4. User sees an explicit on-screen notification when browser-speech fallback is active
  5. User can replay the word by pressing a button
**Plans**: TBD

Plans:
- [ ] 02-01: Build /api/tts route (ArrayBuffer, single responsibility)
- [ ] 02-02: Deploy and test TTS on Vercel (hard gate — do not proceed until confirmed working)
- [ ] 02-03: AudioButton component + browser-speech fallback with explicit notification

### Phase 3: Dictee Core
**Goal**: A user can select a word list, run a complete dictee session, and see their results
**Depends on**: Phase 2
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06
**Success Criteria** (what must be TRUE):
  1. Built-in word lists for groep 3–8 are available and selectable before a session starts
  2. User (paid) can create a custom word list with a name, grade, and optional word hints
  3. User hears each word spoken automatically at session start and can replay on demand
  4. User types an answer, submits, and immediately sees correct/incorrect feedback with the right spelling
  5. User sees an end summary with score, correct words, and missed words after the final word
**Plans**: TBD

Plans:
- [ ] 03-01: Built-in word lists (LIST-01) and list selection UI (LIST-05)
- [ ] 03-02: Custom word list management for paid users (LIST-02, LIST-03, LIST-04)
- [ ] 03-03: Dictee session flow — child name, word playback, answer input, feedback (SESS-01 through SESS-05)
- [ ] 03-04: Session summary screen (SESS-06) and deploy + full flow test on Vercel

### Phase 4: Extras
**Goal**: Progress is tracked, free users hit a paywall, and new visitors understand the product
**Depends on**: Phase 3
**Requirements**: PROG-01, PROG-02, PROG-03, MON-01, MON-02, MON-03, MON-04, MON-05, LAND-01, LAND-02
**Success Criteria** (what must be TRUE):
  1. Each completed session is stored and a teacher/parent can view past sessions per child
  2. Progress view shows which words were most often missed per child
  3. Free user is blocked after 3 sessions and sees an upgrade prompt
  4. User can complete a €3,99 Gumroad purchase and have their account unlocked via webhook
  5. Landing page explains the product and pricing with a visible call-to-action to sign up or purchase
**Plans**: TBD

Plans:
- [ ] 04-01: Session storage and progress view per child (PROG-01, PROG-02, PROG-03)
- [ ] 04-02: Free-tier session limit and list restrictions (MON-01, MON-02, MON-05)
- [ ] 04-03: Gumroad paywall — purchase link + webhook to unlock account (MON-03, MON-04)
- [ ] 04-04: Landing page with product explanation, pricing, and CTA (LAND-01, LAND-02)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. TTS | 0/3 | Not started | - |
| 3. Dictee Core | 0/4 | Not started | - |
| 4. Extras | 0/4 | Not started | - |
