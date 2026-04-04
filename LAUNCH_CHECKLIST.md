# 🚀 Dictee Coach — Launch Readiness Checklist

**Status:** MVP Complete  
**Last Updated:** 2026-04-03  
**Build:** ✅ Passing (Next.js 16 Turbopack)

---

## ✅ Pre-Launch Tasks (This Week)

### Backend & API
- [ ] **Audio Regeneration:** Re-run `npm run generate-audio` to fill 4 missing files:
  ```bash
  goud, ommen, ideeën, werkte
  # (Note: fietste should be in there already)
  ```
  - Command: `node -r esbuild-register scripts/generate-audio.ts`
  - Check: `ls public/audio | wc -l` → should be 69

- [ ] **Google Cloud API Quota:** Verify daily quota is sufficient
  - Current: Free tier (500k requests/month = ~16.6k/day)
  - If >1000 users: upgrade to paid (auto-scales, $0.07/mln chars)

- [ ] **Email Service Setup:** For weekly parent reports (Resend or SendGrid)
  - Create `/api/email/send-weekly-report` endpoint
  - Set up cron job on Vercel (Edge Functions)

### Frontend & UX
- [ ] **Mobile Responsiveness:** Test on iPhone SE + Samsung A12 (budget phones)
  - Screen sizes: 375px (iPhone) and 360px (Android)
  - Check: Button touch targets (min 48px), font sizes readable

- [ ] **Audio Playback:** Test across browsers
  - Chrome, Safari (iOS), Firefox on Android
  - Latency: should be <200ms from click to sound

- [ ] **Guest Session Flow:** Full test
  - Click → `?guest=1` link → play session → see report → "Sign up" CTA → converts to auth

### Database & Auth
- [ ] **Supabase RLS Policies:** Verify Row-Level Security
  ```sql
  -- child_profiles: user can see own + shared profiles
  -- dictee_sessions: user can see own + linked sessions
  -- dictee_results: user can see own session results
  ```

- [ ] **Auth Redirect:** After email verification, user lands on home → child selector

### Monetization & Legal
- [ ] **Gumroad Setup:**
  - [ ] Product created: "Dictee Coach Licentie" (€4,99 one-time)
  - [ ] License key redemption logic (optional: in-app premium badge)
  - [ ] Terms & Privacy Policy linked on landing page

- [ ] **GDPR-K Compliance:**
  - [ ] Privacy policy (simple, Dutch, <300 words)
  - [ ] No third-party tracking (Google Analytics: NO)
  - [ ] Parental consent flow (email opt-in for reports)
  - [ ] Data deletion (parent can delete child profile = cascade)

- [ ] **Vercel Environment:** Production deploy config
  - [ ] `.env.production` set (Supabase prod keys, Google Cloud creds)
  - [ ] Cron jobs configured (weekly report emails)

---

## 🧪 Testing Scenarios (Pre-Launch)

### Happy Path: Kid takes 1 dictee
```
1. Load http://localhost:3000
2. Select avatar (Ollie / Leo / Stella / Max)
3. Select word list (Groep 3, 4, 5, etc)
4. Click "Start dictee"
5. Listen to audio (should be natural Dutch, ~3 sec)
6. Type answer:
   - Correct → "Goed!" emoji + next
   - Wrong attempt 1 → hint + retry
   - Wrong attempt 2 → AI explanation + next
7. After all words → result card (avatar + stars + score)
8. Click "Deel" → share WhatsApp
9. Go back → play again
```

**Expected:** Zero loading hangs, audio plays immediately, explanations use child's word (not hallucinated)

### Guest Path: Viral loop
```
1. Receive WhatsApp link: http://localhost:3000/dictee?guest=1
2. No login required, plays immediately
3. Sees result card + "Sla op in account" CTA
4. Clicks sign-up → auth page
5. Email verification → home page → child selector
```

**Expected:** Frictionless, no confusion about why no login was needed

### Parent Workflow: Check kid's progress
```
1. Parent logs in
2. Home page → child profile with 🔥 streak
3. Click child → see last 5 sessions (scores)
4. (Future: wekelijks rapport in email)
```

**Expected:** Quick glance at progress, motivating streak visual

---

## 🐛 Known Issues & Workarounds

| Issue | Impact | Workaround | Priority |
|-------|--------|-----------|----------|
| 4 audio files missing (goud, etc) | User hears TTS fallback (slower, API cost) | Re-run generation script | HIGH |
| Old dev server on PID 20816 | Port conflict, restart needed | Kill process, fresh `npm run dev` | LOW (one-time) |
| ElevenLabs voice inconsistency | N/A (switched to Google Cloud) | No action needed | RESOLVED |

---

## 📊 Metrics to Track Post-Launch

### Week 1–2
- Daily active users (DAU)
- Conversion: guest session → sign-up %
- Average session duration (goal: >2 min)
- Audio latency (goal: <200ms)

### Week 3–4
- Repeat users (% returning day 2+)
- Revenue per user (€ / user)
- TikTok organic reach (if posted)
- App store reviews (if listed)

### Ongoing
- Retention curves (D7, D14, D30)
- Feature usage (which word lists popular?)
- Error rates (API timeouts, failed audio)

---

## 🎯 Immediate Next Steps

### Micro (Today)
- [ ] Regenerate 4 missing audio files
- [ ] Hard restart dev server + spot-check core flow
- [ ] Save this checklist to version control

### Short-term (This week)
- [ ] Deploy to Vercel staging (`main` → `vercel.app`)
- [ ] Test on real phones (not just desktop)
- [ ] Recruit 5 local families for beta feedback

### Medium-term (Week 2–3)
- [ ] TikTok: Post 4 videos (problem hook, demo, testimonial, CTA)
- [ ] Leerkrachten: Email 10 teachers with gratis unlock code
- [ ] Monitor: DAU, conversion rates, crash logs

---

## 📎 Files & Links

| What | Where |
|------|-------|
| **SKILL file** | `~/.claude/skills/educatieve-app-template.md` |
| **Project plan** | This directory (git history) |
| **Audio assets** | `public/audio/*.mp3` |
| **Design tokens** | `src/lib/avatars.ts` (colors, emojis) |
| **Database** | Supabase project: "dictee-coach" |

---

## 🎉 Success Criteria

- ✅ 10+ beta users without bugs
- ✅ 1st user pays (€4,99)
- ✅ 50+ TikTok impressions / day
- ✅ 1 leerkracht integrates in classroom
- ✅ D7 retention >30%

If **all 5** hit: Move to **App 2 planning** (Reken-warming-up v2)

