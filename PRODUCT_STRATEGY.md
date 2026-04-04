# Dictee Coach v2 — Strategie: Combi-Platform

**Vision:** CITO-voorbereiding groep 6–8 + Dictee-oefeningen + Teacher Content Management

**Revenue:** 
- Ouders: €7,99 eenmalig (CITO-prep + dictee-sampler)
- Leerkrachten: GRATIS classroom dashboard + upload eigen woordenlijsten
- Bundel: €19,99/jaar (dit + Reken-warm-up + Begrijpend-lezen)

---

## 📋 Content Architecture

### Laag 1: CITO Officieel (curated by us)
```
CITO Groep 6: 200 woorden (SLO + CITO-vragenbanken)
  ├─ Spelling woorden (losse)
  ├─ Dictee-zinnen (5–10 woorden per zin)
  └─ Oefentips per categorie

CITO Groep 7: 250 woorden
CITO Groep 8: 300 woorden
```

**Bron:** 
- SLO kerndoelen (slo.nl) — vrij beschikbaar
- CITO-examenpapieren (vorige jaren) — vrij online
- Educatieve uitgeverijen (contact opnemen)

### Laag 2: Leerkracht-geupload
```
Per juf:
  - Voeg eigen woordenlijst toe (CSV upload of handmatig typen)
  - Zet het beschikbaar voor haar kinderen
  - Ouders zien: "Juf X gebruikt dit in de klas"
```

**Feature:**
```
Teacher Upload UI:
  Input: Woordenlijst (paste from Word doc of CSV)
  Parse: "kat, katje, katten" → 3 entries
  Validate: Spellingscontrole, dubbeldubbelen
  Deploy: Instant beschikbaar in kind's app
```

### Laag 3: Dictee-zinnen (sampler)
```
Groep 6 dictee:
  "De katten liggen op het warme dak."
  "Een blauwe bloem groeit in de tuin."
  ...

Groep 7 dictee:
  "Het gebeurde niet vaak dat hij stil was."
  ...

(Start met 20 per groep, growth: 50+ per jaar)
```

---

## 🗂️ Database Changes

### Huidige:
```sql
word_lists, word_list_items, dictee_sessions, dictee_results
```

### Toevoegen:

```sql
-- Official CITO content (we curate)
CREATE TABLE cito_wordbanks (
  id UUID PRIMARY KEY,
  grade INT (6, 7, 8),
  word TEXT UNIQUE,
  category TEXT,
  rule TEXT,
  mnemonic TEXT,
  difficulty INT (1–5),
  created_at TIMESTAMPTZ
);

-- Teacher-uploaded content
CREATE TABLE teacher_wordlists (
  id UUID PRIMARY KEY,
  teacher_id UUID,
  name TEXT,
  grade INT,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ
);

CREATE TABLE teacher_wordlist_items (
  id UUID PRIMARY KEY,
  wordlist_id UUID,
  word TEXT,
  category TEXT,
  sort_order INT
);

-- Dictee-zinnen (sentences)
CREATE TABLE dictee_sentences (
  id UUID PRIMARY KEY,
  grade INT,
  text TEXT,
  audio_url TEXT,  -- pre-generated
  difficulty INT,
  word_count INT,
  created_at TIMESTAMPTZ
);

-- Track user progress per word
CREATE TABLE word_mastery (
  id UUID PRIMARY KEY,
  user_id UUID,
  word TEXT,
  correct_count INT,
  wrong_count INT,
  last_practiced TIMESTAMPTZ,
  mastered BOOLEAN  -- 3+ correct in a row
);
```

---

## 🎮 UX Flow (New)

### Kind (home page)
```
📚 Kies je oefenset:
  ├─ 🏫 CITO Groep 6 (officieel)
  ├─ 🏫 CITO Groep 7 (officieel)
  ├─ 🏫 CITO Groep 8 (officieel)
  ├─ 👩‍🏫 [Juf X - Groep 6 woordenlijst]  ← dynamisch
  ├─ 👩‍🏫 [Juf Y - Groep 6 woordenlijst]  ← dynamisch
  └─ ✍️ Dictee-oefeningen (gratis sampler, 5 zinnen)

Klik → kies modus:
  ├─ 🎯 Losse woorden oefenen (huidige flow)
  ├─ ✍️ Dictee (volledige zin typen)
  └─ 📊 Progress zien (stats per categorie)
```

### Juf (teacher dashboard)
```
🏫 Mijn klas
├─ Woordenlijsten
│  ├─ ➕ Upload CSV
│  ├─ ➕ Type handmatig
│  └─ 📋 [Groep 6 winter-woordjes] (edit / delete)
│
├─ Kinderen (alleen voornaam!)
│  ├─ Emma: 12/15 gehaald op "winter-woorden"
│  ├─ Liam: 8/15 gehaald (fout: ei/ij)
│  └─ Ava: niet gestart
│
└─ Download report: "Wie moet op ei/ij oefenen?"
```

### Ouder (current + new)
```
👶 [Kind name]
├─ 🔥 Streak: 7 dagen
├─ 📈 Progress: CITO Groep 6
│  ├─ Overall: 7/10
│  ├─ ei/ij: 4/10 ← extra aandacht nodig!
│  └─ dt-regel: 9/10 ✅
│
├─ 📊 Wekelijks rapport
│  "Emma oefent veel op CITO Groep 6!
│   Vorige week: 5/10 → Nu: 7/10
│   Extra aandacht: ei/ij woorden (3 fouten)"
│
└─ 🏫 Juf's woordenlijst ook beschikbaar
```

---

## 🚀 Implementation Phases

### Phase 0 (This week): Restructure for content
- [ ] Rename `word_lists` → `woordenlijsten` (user = teacher)
- [ ] Add `cito_wordbanks` table (official CITO words)
- [ ] Seed CITO Groep 6 words (200 words from SLO)
- [ ] Add UI toggle: "CITO words" vs "Teacher words" vs "Dictee"

### Phase 1 (Week 2): Teacher upload
- [ ] `/api/teacher/upload-wordlist` (CSV or paste)
- [ ] Validation: spellingscontrole, prevent duplicates
- [ ] Teacher dashboard (simple list view)
- [ ] Child app: see teacher's list in picker

### Phase 2 (Week 3): Dictee mode
- [ ] New component: `DicteeSentenceMode` (type full sentence)
- [ ] Audio: pre-generate dictee-zin audio (slower pace, pauses)
- [ ] Scoring: word-by-word accuracy (1 typo = wrong? or partial credit?)
- [ ] UI: show sentence, audio button, text input

### Phase 3 (Week 4): Progress dashboard
- [ ] Per-word mastery tracking
- [ ] Stats by category (ei/ij success rate, etc)
- [ ] Charts: "Je bent goed in [category], werk aan [category]"
- [ ] Parent report: AI-generated tips based on weak categories

### Phase 4 (Week 5): Monetization
- [ ] Paywall: "CITO Groep 6–8 + Dictee = €7,99"
- [ ] Free: sampler (5 CITO words + 1 dictee sentence)
- [ ] Teacher: FREE forever (+ optional "donate for upgrades")

---

## 💰 Revenue Model (Refined)

| User | Price | Value |
|------|-------|-------|
| **Parent** | €7,99 | Unlimited CITO Groep 6–8 + Dictee-sampler |
| **Parent** | €19,99/yr | ↑ + Reken-warm-up + Begrijpend-lezen (bundle) |
| **Teacher** | FREE | Upload woordenlijst, see class progress |
| **Teacher** | €29/yr | (Optional) Custom branding, unlimited classes |

**Marketing:**
- Ouders: "Bereid je voor op de CITO — AI coaching per fout"
- Juffrouwen: "Gratis klastool, ouders zien jouw woordenlijst thuis"

---

## 🎯 Success Criteria (v2)

- ✅ 10+ CITO woordenlijsten (groepen 6–8)
- ✅ 5+ leerkrachten gebruiken platform
- ✅ 1st dictee-zin recorded + working
- ✅ 1 parent upgrade from free → paid
- ✅ D7 retention >40% (was 30%, target: 40%+)

---

## 🗣️ Marketing Shift

### Before (current)
"Oefen spelling met Dictee Coach!" ← Generic, competes with 10 free apps

### After (v2)
"CITO voorbereiding met AI coaching — wat juf ook gebruikt in de klas" ← Specific, has teacher-distribution, has exam angle

---

## Questions voor jou:

1. **CITO-focus?** Groep 6–8 alleen, of ook groep 3–5?
2. **Dictee-zinnen:** Wil je ZELF schrijven, of via teachers/SLO?
3. **Teacher audience:** Directe outreach naar juffrouwen, of organisch via ouders?
4. **Timing:** Kan in 4 weken gaan? Of rustiger tempo?

