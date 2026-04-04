# Dictee Coach — Bouwplan
**Datum:** 2026-03-28
**Lessen uit bijles app (Koko) meegenomen**

---

## Wat we bouwen

Een app waarmee kinderen (groep 3-8) dictee oefenen:
1. Kind hoort een woord gesproken door AI-stem
2. Kind typt het woord in
3. Directe feedback: goed ✓ of fout ✗ + uitleg
4. Na afloop: overzicht van fouten + score
5. Leerkracht/ouder ziet voortgang per kind

---

## Lessen uit Koko — wat we anders doen

### 1. TTS: eerst testen op Vercel
- De bijles app had een 500-fout op Vercel voor TTS, werkte alleen lokaal
- **Oplossing:** Na bouwen van de TTS-route → direct deployen → testen → dan pas verder bouwen
- Gebruik `ArrayBuffer` response (niet streaming) voor Vercel-compatibiliteit
- Fallback naar browser-stem (window.speechSynthesis) met EXPLICIETE melding aan gebruiker

### 2. Kleine bestanden — max 150 regels per component
- Bijles app had bestanden van 800+ regels
- **Regel:** Geen enkel bestand groter dan 200 regels
- Splits verantwoordelijkheden: UI / logica / data apart

### 3. Geen silent fallbacks
- Bijles app: TTS viel stil terug op robot-stem zonder dat gebruiker het wist
- **Regel:** Als iets misgaat → altijd een duidelijke melding

### 4. API routes: één verantwoordelijkheid
- Bijles app: chat route deed auth + rate limiting + AI + DB + session in 422 regels
- **Dictee Coach:** elke API route doet exact één ding:
  - `/api/tts` → text-to-speech (niets anders)
  - `/api/sessions` → sessie aanmaken/afsluiten
  - `/api/results` → resultaten opslaan

### 5. Deploy vroeg en vaak
- Bijles app: lang lokaal gebouwd, pas laat gedeployd
- **Dictee Coach:** na elke feature → direct `vercel --prod` → testen

---

## Tech stack

| Onderdeel | Keuze | Reden |
|-----------|-------|-------|
| Framework | Next.js 16 (App Router) | Zelfde als reken-app |
| Styling | Tailwind CSS 4 | Zelfde |
| Database | Supabase (zelfde project als reken-app) | Gedeelde auth |
| TTS | OpenAI TTS API | Natuurlijke stem (geen robot) |
| TTS fallback | window.speechSynthesis | Met expliciete melding |
| Betaling | Gumroad | Bewezen werkend vanuit Aruba |
| Hosting | Vercel | Bestaande workflow |

---

## Database tabellen (nieuw in zelfde Supabase project)

```sql
-- Woordenlijsten (aangemaakt door leerkracht/ouder)
CREATE TABLE word_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INT CHECK (grade BETWEEN 1 AND 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Woorden in een lijst
CREATE TABLE word_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  hint TEXT, -- optionele uitleg/gebruik in zin
  sort_order INT DEFAULT 0
);

-- Dictee-sessies
CREATE TABLE dictee_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT,
  list_id UUID REFERENCES word_lists(id),
  total_words INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resultaat per woord
CREATE TABLE dictee_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES dictee_sessions(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  typed_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  attempt_number INT DEFAULT 1,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## App structuur (kleine bestanden!)

```
src/
├── app/
│   ├── page.tsx              # Home: login + modus kiezen (max 150 regels)
│   ├── layout.tsx            # Root layout
│   ├── dictee/
│   │   └── page.tsx          # Actieve dictee-sessie
│   ├── lijsten/
│   │   └── page.tsx          # Woordenlijsten beheren
│   ├── voortgang/
│   │   └── page.tsx          # Voortgang per kind
│   └── api/
│       ├── tts/
│       │   └── route.ts      # OpenAI TTS — alleen dit
│       ├── sessions/
│       │   └── route.ts      # Sessie aanmaken/afsluiten
│       └── webhooks/
│           └── gumroad/
│               └── route.ts  # Betaling verwerken
│
├── components/
│   ├── dictee/
│   │   ├── WordDisplay.tsx   # Toont het woord (of verberg het)
│   │   ├── AnswerInput.tsx   # Invoerveld
│   │   ├── FeedbackBanner.tsx# Goed/fout melding
│   │   ├── AudioButton.tsx   # Knop: herhaal woord
│   │   └── SessionSummary.tsx# Eindoverzicht
│   └── ui/
│       ├── Button.tsx
│       └── ErrorMessage.tsx  # Altijd expliciete foutmelding
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── tts/
│   │   └── speak.ts          # TTS logica (client-side hook)
│   └── dictee/
│       └── queries.ts        # Alle DB queries hier
│
└── types/
    └── dictee.ts             # TypeScript types
```

---

## Bouwvolgorde (deploy na elke stap!)

### Fase 1 — Fundament (deploy + test)
1. Supabase migratie uitvoeren
2. Auth (login/registreer) — zelfde Supabase als reken-app
3. **Deploy → test login op Vercel**

### Fase 2 — TTS (deploy + test op Vercel)
4. `/api/tts` route bouwen
5. **Deploy → test TTS op Vercel** (niet lokaal!)
6. Als TTS werkt → AudioButton component

### Fase 3 — Dictee kern
7. Woordenlijsten beheer (standaard lijsten ingebouwd)
8. Dictee sessie flow (hoor → typ → feedback)
9. **Deploy → test volledige flow**

### Fase 4 — Extras
10. Voortgang per kind
11. Eigen woordenlijsten uploaden
12. Paywall (Gumroad)
13. Landing page

---

## Standaard woordenlijsten (ingebouwd)

**Groep 3:** kat, hond, fiets, school, boek, huis, dag, nacht, moeder, vader
**Groep 4:** schrijven, lezen, rekenen, vriendjes, fietsen, rijden, slapen, eten
**Groep 5:** bijzonder, geweldig, moeilijk, oefenen, spelling, werkwoord, zelfstandig
**Groep 6:** beschrijven, verandering, ontwikkeling, leerkracht, concentratie, vergelijken
**Groep 7:** verantwoordelijkheid, onafhankelijk, samenwerking, zelfstandigheid, beoordelen
**Groep 8:** nauwkeurigheid, herstellen, omschrijving, bekwaamheid, betrouwbaar, analyseren

---

## Prijsmodel
- Gratis: standaard woordenlijsten + 3 sessies proberen
- €3,99 eenmalig: eigen lijsten + onbeperkte sessies + voortgang
- Leerkrachten: gratis account met klasoverzicht

---

## Wat we NIET bouwen (scope beperken)
- Geen spraakherkenning (kind typt, spreekt niet)
- Geen multiplayer/klasmodus (dat is de reken-app)
- Geen AI-feedback (directe spelling-check is genoeg)
- Geen gamification v1 (punten/badges later)
