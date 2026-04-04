# Requirements: Dictee Coach

**Defined:** 2026-03-28
**Core Value:** Een kind hoort een woord, typt het in, en weet meteen of het goed is.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can register with email and password via Supabase
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across browser refresh

### TTS

- [ ] **TTS-01**: User hears a word spoken by OpenAI TTS (natural Dutch voice)
- [ ] **TTS-02**: TTS route returns ArrayBuffer response (Vercel-compatible, not streaming)
- [ ] **TTS-03**: When OpenAI TTS fails, app falls back to browser speech (window.speechSynthesis)
- [ ] **TTS-04**: User sees explicit notification when browser-speech fallback is active
- [ ] **TTS-05**: User can replay a word by pressing a button

### Word Lists

- [ ] **LIST-01**: App includes built-in word lists for groep 3, 4, 5, 6, 7, and 8
- [ ] **LIST-02**: Paid user can create a custom word list with a name and grade
- [ ] **LIST-03**: Paid user can add, edit, and delete words in a custom list
- [ ] **LIST-04**: Words can have an optional hint (usage example or sentence)
- [ ] **LIST-05**: User can select which list to practice before starting a session

### Dictee Session

- [ ] **SESS-01**: User assigns a child name when starting a session
- [ ] **SESS-02**: User hears a word spoken automatically at session start and on request
- [ ] **SESS-03**: User types their answer and submits
- [ ] **SESS-04**: User sees immediate feedback: correct ✓ or incorrect ✗ with the right spelling
- [ ] **SESS-05**: Session advances to the next word after feedback
- [ ] **SESS-06**: User sees an end summary: score, correct words, and missed words

### Progress

- [ ] **PROG-01**: Each completed session is stored with score, date, child name, and list used
- [ ] **PROG-02**: Teacher/parent can view all past sessions per child
- [ ] **PROG-03**: Progress view shows which words were most often missed

### Monetization

- [ ] **MON-01**: Free users can complete up to 3 sessions (trial)
- [ ] **MON-02**: Free users can only use built-in word lists
- [ ] **MON-03**: User can purchase unlimited access for €3,99 one-time via Gumroad
- [ ] **MON-04**: After Gumroad payment, user's account is unlocked (webhook)
- [ ] **MON-05**: Paid users get unlimited sessions and access to custom word lists

### Landing Page

- [ ] **LAND-01**: Landing page explains the product and pricing
- [ ] **LAND-02**: Landing page has a call-to-action to sign up or purchase

## v2 Requirements

### Gamification

- **GAME-01**: Child earns points or badges for correct answers
- **GAME-02**: Streak tracking across sessions

### Class Mode

- **CLASS-01**: Teacher can manage multiple child profiles under one account
- **CLASS-02**: Teacher sees a class overview with all children's scores

## Out of Scope

| Feature | Reason |
|---------|--------|
| Speech recognition | Child types — simplifies v1 significantly |
| Multiplayer / class mode | Single child at a time; class mode is v2+ |
| AI feedback | Direct spelling check is sufficient |
| OAuth login | Email/password is enough for v1 |
| Mobile app | Web-first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| TTS-01 | Phase 2 | Pending |
| TTS-02 | Phase 2 | Pending |
| TTS-03 | Phase 2 | Pending |
| TTS-04 | Phase 2 | Pending |
| TTS-05 | Phase 2 | Pending |
| LIST-01 | Phase 3 | Pending |
| LIST-02 | Phase 3 | Pending |
| LIST-03 | Phase 3 | Pending |
| LIST-04 | Phase 3 | Pending |
| LIST-05 | Phase 3 | Pending |
| SESS-01 | Phase 3 | Pending |
| SESS-02 | Phase 3 | Pending |
| SESS-03 | Phase 3 | Pending |
| SESS-04 | Phase 3 | Pending |
| SESS-05 | Phase 3 | Pending |
| SESS-06 | Phase 3 | Pending |
| PROG-01 | Phase 4 | Pending |
| PROG-02 | Phase 4 | Pending |
| PROG-03 | Phase 4 | Pending |
| MON-01 | Phase 4 | Pending |
| MON-02 | Phase 4 | Pending |
| MON-03 | Phase 4 | Pending |
| MON-04 | Phase 4 | Pending |
| MON-05 | Phase 4 | Pending |
| LAND-01 | Phase 4 | Pending |
| LAND-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation (traceability confirmed)*
