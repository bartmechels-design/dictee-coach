# 🚀 DEPLOY DICTEE COACH TODAY - Quick Start

**Status:** Code is ready ✅ | Build passes ✅ | Tests pass ✅

**Time needed:** 60 minutes

---

## 🎯 YOUR TASK TODAY

Transform from development to production in 6 steps.

---

## STEP 1️⃣: GITHUB (5 min)

```bash
cd /c/Users/Familie\ Mechels/Claude\ Projecten/dictee-coach

# Verify clean
git status

# Push latest
git push origin main
```

✅ Code on GitHub

---

## STEP 2️⃣: VERCEL (10 min)

1. Go to **vercel.com**
2. Sign in (or create free account)
3. Click **"New Project"**
4. **Import from GitHub**
5. Select: `dictee-coach`
6. Click **"Deploy"**

Wait 2-3 minutes...

✅ Site live at `dictee-coach.vercel.app`

---

## STEP 3️⃣: ENVIRONMENT VARIABLES (5 min)

In Vercel Dashboard:

1. Select `dictee-coach` project
2. **Settings** → **Environment Variables**
3. Add each (copy from your `.env.local`):

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | (from Supabase) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (from Supabase) |
| SUPABASE_SERVICE_ROLE_KEY | (from Supabase) |
| ANTHROPIC_API_KEY | (from Anthropic) |
| SEED_TOKEN | Generate: `openssl rand -hex 32` |

4. Save & **Redeploy** latest deployment

✅ Environment configured

---

## STEP 4️⃣: DATABASE SETUP (10 min)

### A. Create Supabase Project

1. Go to **supabase.com**
2. Create **new project**
3. Create production database
4. Wait for provisioning...

### B. Run Migration

1. **SQL Editor** in Supabase
2. **New Query**
3. Paste from: `supabase/migrations/20260403_cito_v2_tables.sql`
4. **Run**

Should see: 5 tables created ✓

### C. Get Credentials

1. **Settings** → **API**
2. Copy `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. (Service role key only if needed)

✅ Database ready

---

## STEP 5️⃣: SEED DATA (3 min)

Run these curl commands:

```bash
# Replace YOUR_SEED_TOKEN with actual token

curl -X POST "https://dictee-coach.vercel.app/api/admin/seed-cito?token=YOUR_SEED_TOKEN"

curl -X POST "https://dictee-coach.vercel.app/api/admin/seed-sentences?token=YOUR_SEED_TOKEN"
```

Should see:
```json
{"success": true, "count": 161, ...}
{"success": true, "count": 60, ...}
```

✅ Data seeded

---

## STEP 6️⃣: TEST (20 min)

### Test 1: Visit Site
```
https://dictee-coach.vercel.app
```
- [ ] Loads
- [ ] No errors

### Test 2: Language Switch
- [ ] NL ↔ EN works
- [ ] URL changes

### Test 3: Sign Up
- [ ] Form works
- [ ] Can create account

### Test 4: Play Lesson
- [ ] Child profile created
- [ ] Audio plays
- [ ] Can type word
- [ ] Results display

### Test 5: Check Mobile
- [ ] Responsive
- [ ] Touch works
- [ ] Audio plays on mobile

✅ All working

---

## 🎉 YOU'RE LIVE!

**Dictee Coach is now in production** 🚀

---

## NEXT STEPS

### Immediate (Today)
- [ ] Share link with friends/family
- [ ] Test on real devices
- [ ] Monitor error tracking

### Short-term (Week 1)
- [ ] Create TikTok content
- [ ] Email any waitlist
- [ ] Gather feedback

### Medium-term (Week 2-4)
- [ ] Fix bugs from feedback
- [ ] Plan v1.1 features
- [ ] Setup analytics

---

## ⚠️ TROUBLESHOOTING

### "Vercel build fails"
```
Check: Settings → Build & Output
```

### "No audio"
```
Verify: public/audio/ has 161 MP3s
```

### "Database error"
```
Check: Env vars in Vercel (Settings → Environment Variables)
```

### "Signup not working"
```
Check: Supabase Auth enabled (Authentication → Providers)
```

---

## 📍 URLS

- **Live:** https://dictee-coach.vercel.app
- **GitHub:** Link your repo
- **Supabase:** Your project dashboard
- **Vercel:** Your project dashboard

---

## ✅ FINAL CHECKLIST

```
TODAY:
[x] Code ready
[ ] GitHub pushed
[ ] Vercel connected
[ ] Env vars set
[ ] Database migrated
[ ] Data seeded
[ ] Tests passed
[ ] Go live!

DONE! 🎊
```

---

**Questions? Check DEPLOYMENT_CHECKLIST.md for detailed instructions**

Good luck! 🚀
