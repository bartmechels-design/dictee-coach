# Dictee Coach v2 — 4-Week Aggressive Roadmap

**Goal:** Launch CITO-voorbereiding (groep 3–8) + Dictee-mode + Teacher-upload  
**Timeline:** 2026-04-03 → 2026-05-01  
**Constraint:** Alles wat CITO/methode vraagt, SLO-resources + AI hybrid, beide marketing channels

---

## 📅 Week 1: Content Foundation & Architecture (Apr 3–9)

### Content Gathering (Day 1–2)
- [ ] **SLO Kerndoelen spellingwoorden** (groepen 3–8)
  - Download: https://www.slo.nl/themas/kerndoelen/
  - Extract: woorden per groep
  - Target: 200 woorden Groep 3, 250 G4, 300 G5, 300 G6, 300 G7, 300 G8 = **1650 woorden totaal**

- [ ] **CITO vorige jaren** (examenpatronen)
  - Google: "CITO Spelling Groep 6 2024 2023 2022" (gratis online)
  - Extract: 50 woorden per jaar × 5 jaar × 3 groepen = **750 extra woorden**
  - Cross-check met SLO (overlap removal)

- [ ] **Woordmethodieken** (Taalkundig, Taal Totaal, etc)
  - Contact: 5 local juffrouwen/scholen
  - Ask: "Mag ik jullie woordenlijst gebruiken?" (permission ask)
  - Expect: 3/5 say yes = **600+ extra woorden**

**Output:** Spreadsheet met alle woorden (Word | Grade | Category | Source)

### Database Restructure (Day 2–3)
- [ ] Remove: `word_lists` / `word_list_items` (old user-created lists)
- [ ] Add: `cito_wordbanks` table (official CITO words)
- [ ] Add: `teacher_wordlists` + `teacher_wordlist_items` (user-uploaded)
- [ ] Add: `word_mastery` (track per-word progress)
- [ ] Add: `dictee_sentences` (for dictee mode)
- [ ] Migrate: old data → new schema (if any)

**Code:**
```sql
-- Run migrations
supabase migration new cito_v2_tables
-- (definitions in PRODUCT_STRATEGY.md)
```

### Seed Initial Data (Day 3–4)
- [ ] **Groep 3 words:** Ingest 200 SLO words into `cito_wordbanks`
  - Format: (word, grade, category, rule, mnemonic, difficulty)
  - Example: ('kat', 3, 'basic', 'common', 'KAT = furry animal', 1)

- [ ] **Generate audio for Groep 3** (using existing script)
  - Run: `npx tsx scripts/generate-audio.ts --grade=3`
  - Output: `public/audio/g3-*.mp3`

**Output:** Groep 3 fully playable + seeded

### Frontend Structure (Day 4–5)
- [ ] Update `defaultLists.ts` to read from `cito_wordbanks` instead of hardcoded
- [ ] New component: `WordlistPicker` (dropdown: CITO G3–8 vs Teacher lists vs Dictee)
- [ ] Query: `getWordsByGradeAndSource(grade, source)`

**Status Check (Fri Apr 9):**
- ✅ 1650 SLO words gathered + spreadsheet ready
- ✅ Database migrated (Supabase migrations applied)
- ✅ Groep 3 seeded + audio ready
- ✅ Frontend reading from new DB structure
- ✅ **1 playable grade (Groep 3) working end-to-end**

---

## 📅 Week 2: Scale Content + Teacher Upload (Apr 10–16)

### Finish SLO Seed (Day 1–2)
- [ ] Seed Groepen 4–8 into `cito_wordbanks` (4000+ words)
- [ ] Generate audio for Groepen 4–5 (time-consuming, parallelize if possible)
  - Use: Google Cloud batch processing or cron jobs
  - Monitor costs ($0.07 per mln characters)

- [ ] **AI Augmentation:** Use Claude to generate similar words
  ```
  For each word in SLO:
    Prompt: "Generate 3 similar Dutch words with same spelling rule as [word]"
    Example: 'kat' → ['kat', 'mat', 'vat', 'bat']
    Add to DB: (word, grade, category, 'generated', AI_mnemonic)
  ```
  - Batch: 100 words at a time via `/api/augment-words`
  - Goal: +20% word count via AI (500+ new words)

### Teacher Upload Feature (Day 2–4)
- [ ] **New endpoint:** `POST /api/teacher/upload-wordlist`
  ```
  Input: CSV or pasted text
    "kat, katten, katje
     dog, hond, hondje"
  
  Parse → Validate → Store in `teacher_wordlists` + `teacher_wordlist_items`
  ```

- [ ] **UI:** Upload form in new "Teacher Dashboard"
  - Simple: textarea paste or file upload
  - Preview: "Found 15 words, continue?"
  - Validate: spellingscontrole, prevent duplicates

- [ ] **Child sees:** Dynamically in wordlist picker
  ```
  ✅ CITO Groep 6
  👩‍🏫 [Juf X - Groep 6 winterwoorden]  ← auto-appears
  ```

### Generate Dictee Sentences (Day 3–5)
- [ ] **SLO dictees:** Find official dictee examples (if available)
- [ ] **AI generation:** Claude creates dictee sentences
  ```
  Prompt:
    "Create 20 Dutch dictee sentences for Groep 6 CITO prep.
    Include 2–3 of these spelling rules per sentence:
    - ei/ij confusion
    - dt-regel
    - medeklinkergroepen
    
    Format JSON: [{text, grade, categories}]"
  ```

- [ ] Seed to `dictee_sentences` table
- [ ] Generate audio (slower pace for sentences)

**Status Check (Wed Apr 16):**
- ✅ All Groepen 3–8 seeded (4000+ words)
- ✅ Groepen 6–8 audio ready (for CITO focus)
- ✅ AI augmentation: +500 words added
- ✅ Teacher upload working (test with 1 juf)
- ✅ 60 dictee-sentences ready (12 per grade × 5 = 60)
- ✅ **App: CITO picker + teacher upload + dictee skeleton working**

---

## 📅 Week 3: Dictee Mode + Polish (Apr 17–23)

### Dictee Game Mode (Day 1–3)
- [ ] **New component:** `DicteeMode.tsx`
  ```
  1. Show sentence
  2. Play audio (slow, with pauses)
  3. Text input: user types full sentence
  4. Scoring:
     - Word-by-word comparison
     - 1 typo = that word wrong
     - Score: X/Y words correct
  5. Show which words were wrong
  ```

- [ ] **AI Feedback:** For each wrong word
  ```
  Prompt to Claude: "User typed '[wrong]' instead of '[correct]'.
  What's the rule? Why is [correct] right?"
  ```

- [ ] **Result Card:** Modified for dictee
  ```
  "Dictee zin: 'De grijze katten liggen op het dak.'
   Jij: 'De grijze katen liggen op het dak.'
   Score: 6/7 woorden goed
   Fout: 'katen' → regel: 'aa' → 'a' (verdubbeling)"
  ```

### Parent Report Update (Day 2–3)
- [ ] New `/api/report` logic for mixed mode
  ```
  If user did: losse woorden + dictees
    Report: "Emma oefende op:
    - Losse woorden: 8/10 (ei/ij: 6/10 ❌)
    - Dictees: 6/10 woorden
    Oefentip: [AI]"
  ```

### Polish & Bug Fixes (Day 3–4)
- [ ] Test full flow: CITO Groep 6 → losse woorden → dictee → result
- [ ] Mobile responsiveness (test on iPhone SE)
- [ ] Audio latency check (<200ms)
- [ ] Error handling: API timeouts, missing audio

### Teacher Dashboard v1 (Day 4–5)
- [ ] **Simple page:** `/teacher/dashboard`
  ```
  My Wordlists:
    [Groep 6 winterwoorden] — 25 words — 8 kids practicing — EDIT / DELETE
  
  Upload new:
    [Textarea paste or CSV]
  ```

- [ ] **Kid progress:** Juf sees class stats
  ```
  Emma: 12/15 on "winterwoorden"
  Liam: 8/15 (fout: ei/ij)
  ```

**Status Check (Wed Apr 23):**
- ✅ Dictee mode fully working
- ✅ AI feedback per wrong word (Claude)
- ✅ Parent report reflects both modes
- ✅ Teacher dashboard: upload + see progress
- ✅ **App ready for beta testing**

---

## 📅 Week 4: Launch + Marketing (Apr 24–30)

### Paywall & Monetization (Day 1–2)
- [ ] Gumroad setup
  - [ ] Product: "Dictee Coach CITO Prep" — €7,99
  - [ ] License key redemption (optional: in-app premium badge)

- [ ] Freemium strategy
  - [ ] Free: 5 CITO words Groep 6 + 1 dictee sentence
  - [ ] Paid: All Groepen 3–8 + all dictee

- [ ] In-app upgrade CTA (after 5 free words)

### Teacher Outreach (Day 1–3) — SIMULTANEOUS
- [ ] **Emails to 20 juffrouwen** (list building from last week's SLO gathering)
  ```
  Subject: "Gratis klastool — CITO voorbereiding"
  Body:
    "Hoi juf X,
    
    Ik heb een app gebouwd voor CITO-voorbereiding (Groep 3–8).
    Je kunt je eigen woordenlijst uploaden, je klas oefent thuis.
    Ouders betalen €7,99 — jij krijgt 100% gratis klassendashboard.
    
    Wil je het testen? Code: [UNLOCK_CODE]
    App: dicteecoach.nl
    
    Groeten, [jouw naam]"
  ```

- [ ] Track: # emails sent, # replies, # sign-ups

### TikTok Campaign (Day 2–4) — AGGRESSIVE
- [ ] **Post 8 videos in 3 days:**
  1. Hook: "Waarom scoort jouw kind een 4 op CITO?"
  2. Demo: Dictee-mode (screen recording)
  3. Testimonial: Local juf quote ("We gebruiken dit in de klas")
  4. Problem-solve: "ei/ij fouten? Probeer dit..."
  5. Teacher angle: "Gratis voor juffrouwen"
  6. Parent ROI: "Van 4 naar 6,5 op CITO"
  7. Result card: "Deel je voortgang"
  8. CTA: "Gratis proberen — link in bio"

- [ ] Hashtags: #CITO #toetsenvoorbereiding #basisschool #Nederlandse taal #leerkracht #onderwijs

### Landing Page Update (Day 3)
- [ ] New copy:
  ```
  "CITO-voorbereiding Groep 3–8
  AI-coaching per fout + Dictee-oefeningen
  Gebruikt door [X] juffrouwen in de klas"
  ```

- [ ] Add social proof (teacher testimonial screenshot)
- [ ] Add pricing: €7,99 / €19,99 bundel
- [ ] Add CTA: "Gratis 1 week" (first 5 words + 1 dictee)

### Go Live (Day 4–5)
- [ ] Deploy to Vercel (production)
- [ ] Enable Gumroad paywall
- [ ] Distribute unlock codes to 20 teachers
- [ ] Post TikTok videos
- [ ] Email: friends + local network
- [ ] Monitor: errors, API latency, conversion %

**Status Check (Thu Apr 30 — LAUNCH DAY):**
- ✅ All content seeded (1650+ CITO words + 60 dictees)
- ✅ Teacher upload + dashboard working
- ✅ Dictee mode fully functional
- ✅ Parent reports working
- ✅ Paywall live (€7,99)
- ✅ 20 teacher unlock codes distributed
- ✅ 8 TikTok videos posted
- ✅ Landing page updated

---

## 🎯 Success Metrics (End of Week 4)

| Metric | Target | Reach |
|--------|--------|-------|
| Sign-ups | 50+ | (from TikTok + email) |
| Teacher sign-ups | 10+ | (email outreach) |
| Free→Paid conversion | 10%+ | (5 paid users) |
| TikTok impressions | 1000+ | (8 videos × organic) |
| DAU (day 1) | 20+ | (beta testers) |
| D7 retention | 40%+ | (CITO repeat oefening) |

---

## 💻 Technical Checklist (4 weeks)

**Week 1:**
- [ ] Supabase migrations (new tables)
- [ ] Seed script for SLO words
- [ ] Audio generation script (scaled)
- [ ] Update defaultLists/queries

**Week 2:**
- [ ] Teacher upload endpoint + UI
- [ ] AI augmentation pipeline (Claude batch)
- [ ] Dictee sentences table seeded
- [ ] Teacher dashboard skeleton

**Week 3:**
- [ ] DicteeMode component
- [ ] AI feedback integration
- [ ] Report endpoint updated
- [ ] Mobile polish

**Week 4:**
- [ ] Paywall integration (Gumroad)
- [ ] Production deploy
- [ ] Error monitoring (Sentry/Vercel)
- [ ] Teacher unlock code distribution

---

## 🚦 Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Audio generation too slow (4000+ words) | Start Groep 3 Day 1; use Google Cloud batch jobs; parallelize |
| AI augmentation creates bad words | Juf validation: ask teachers "Is this word correct?" before seeding |
| Teacher upload UI buggy | MVP simple (textarea only, no validation at launch) |
| TikTok no reach | Post 8× in 3 days; use trending sounds; tag education accounts |
| Gumroad integration fails | Test locally with test card first |

---

## 🎬 Daily Standups (15 min each morning)

Every day at **09:00**, check:
1. **Blockers:** Any API errors, DB issues, Supabase quota?
2. **Progress:** Yesterday's deliverables (green/red)?
3. **Today:** 1–2 key tasks (no more)

---

## 📞 Week 1 Start: Monday Apr 3

**Ready?** Let's build this! 🚀

