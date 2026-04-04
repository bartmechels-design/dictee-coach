# 🚀 Dictee Coach - Complete Launch Guide

**Status:** MVP Ready for Beta  
**Build Date:** April 3, 2026  
**Target Launch:** Week of April 6, 2026

---

## 📋 PHASE 1: DATABASE SETUP (5 min)

### Step 1: Apply Database Migration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your `dictee-coach` project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy-paste the entire content from:
   ```
   supabase/migrations/20260403_cito_v2_tables.sql
   ```
6. Click **Run** (Ctrl+Enter)
7. Verify: You should see 5 new tables in the Database section:
   - ✅ `cito_wordbanks`
   - ✅ `dictee_sentences`
   - ✅ `teacher_wordlists`
   - ✅ `teacher_wordlist_items`
   - ✅ `word_mastery`

**Troubleshooting:**
- Error "table already exists"? Safe to ignore, tables were already created
- No error? Perfect! ✓

---

## 📊 PHASE 2: DATA SEEDING (2 min)

### Step 1: Seed CITO Wordbank

Run in terminal (from project root):
```bash
curl -X POST "http://localhost:3000/api/admin/seed-cito?token=dev-seed-token"
```

**Expected response:**
```json
{
  "success": true,
  "count": 161,
  "message": "161 CITO words seeded"
}
```

### Step 2: Seed Dictee Sentences

```bash
curl -X POST "http://localhost:3000/api/admin/seed-sentences?token=dev-seed-token"
```

**Expected response:**
```json
{
  "success": true,
  "count": 60,
  "message": "60 dictee sentences seeded"
}
```

### Step 3: Verify Data in Database

1. Go to Supabase → Database
2. Click on `cito_wordbanks` table
3. Should see 161 rows (words)
4. Click on `dictee_sentences` table
5. Should see 60 rows (sentences)

---

## 🔐 PHASE 3: AUTHENTICATION TEST (10 min)

### Test Sign Up Flow

1. Open http://localhost:3000
2. Click **"Login"** button
3. Click **"Sign up"**
4. Enter:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
5. Click **Sign up**
6. Should see: Child profile selector

### Test Child Profile Creation

1. Click **"Create new child"**
2. Enter:
   - Name: `Emma`
   - Grade: `3`
   - Avatar: `Ollie`
3. Click **Create Profile**
4. Should see: Dictee start screen

### Test Dictee Lesson

1. Click **"Start Lesson"** → Grade 3
2. Click **"Luister naar woord"** (listen)
3. Type a word (e.g., `kat`)
4. Click **Check**
5. See result (✓ or ✗)
6. Continue through all words
7. See results screen

---

## 💳 PHASE 4: MONETIZATION SETUP

### Option A: Gumroad (Recommended for Solo)

1. Create account at [gumroad.com](https://gumroad.com)
2. Create product:
   - Name: "Dictee Coach - Unlimited Access"
   - Price: €4,99 (early bird) → €2,99/month (later)
   - Description: See `GUMROAD_PRODUCT_DESC.txt`
3. Get your Gumroad Product ID
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GUMROAD_PRODUCT_ID=your_product_id
   GUMROAD_LICENSE_KEY=your_license_key
   ```
5. Integrate into app:
   ```bash
   # Create payment integration
   # File: src/components/payment/GumroadButton.tsx
   ```

### Option B: Paddle (EU-Friendly, Handles VAT)

1. Create account at [paddle.com](https://paddle.com)
2. Create product in Paddle Dashboard
3. Get Vendor ID and API Key
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_PADDLE_VENDOR_ID=your_vendor_id
   PADDLE_API_KEY=your_api_key
   ```

**For MVP:** Use Gumroad (simpler integration)

---

## 🧪 PHASE 5: COMPLETE FLOW TEST

### Test Script (Run Each Step)

```bash
# 1. Server running?
curl -I http://localhost:3000

# 2. Audio files present?
ls -1 public/audio/*.mp3 | wc -l
# Should be ~161

# 3. API endpoints responding?
curl http://localhost:3000/api/admin/seed-cito?token=dev-seed-token | head -c 100

# 4. Database connected?
# (Check Supabase Dashboard for data)

# 5. DicteeMode test page?
curl http://localhost:3000/test/dictee | grep -q "Dictee Test Mode" && echo "✓ Test page works"
```

### Test Scenarios

**Scenario A: New User**
- [ ] Land on homepage
- [ ] Click "Login"
- [ ] Sign up with email
- [ ] Create child profile
- [ ] Play dictee lesson
- [ ] See results + score
- [ ] Share result card (mock)

**Scenario B: Returning User**
- [ ] Login with existing credentials
- [ ] Select existing child profile
- [ ] Play different lesson
- [ ] See streak counter (🔥)
- [ ] View previous results

**Scenario C: Teacher Dashboard**
- [ ] Navigate to /teacher
- [ ] Redirects to login (good)
- [ ] Login as teacher
- [ ] Upload CSV wordlist
- [ ] See "Success" message
- [ ] Check Supabase for data

---

## 📱 PHASE 6: LAUNCH DEPLOYMENT

### Pre-Launch Checklist

- [ ] Database migration applied ✓
- [ ] Data seeded (161 words + 60 sentences) ✓
- [ ] Auth flow tested ✓
- [ ] Dictee complete flow tested ✓
- [ ] Results display working ✓
- [ ] Audio playback verified ✓
- [ ] Teacher upload tested ✓
- [ ] All API endpoints verified ✓
- [ ] Environment variables set ✓
- [ ] Error handling in place ✓

### Deploy to Vercel

```bash
# 1. Commit changes
git add .
git commit -m "Ready for launch: MVP complete with all features"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys (if connected)
# Manual: vercel deploy --prod

# 4. Set production environment variables in Vercel
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# ANTHROPIC_API_KEY=...
# SEED_TOKEN=... (use secure value, not dev-seed-token)
```

### Post-Launch Verification

1. Visit https://dictee-coach.vercel.app
2. Test complete flow end-to-end
3. Verify audio plays
4. Check database queries work
5. Test payment flow (if implemented)

---

## 🎯 MARKETING QUICK START

### TikTok Content (Week 1)

**Video 1: Problem Hook**
- Text: "Mijn kind haalt steeds een 4 voor spelling"
- Show: Before/after scores
- CTA: "Probeer gratis"

**Video 2: Solution Demo**
- Screen record: App demo (20 sec)
- Show: Word input → correction
- Text: "€4,99 eenmalig. Lifetime access."

**Video 3: Social Proof**
- Text: "Dit doen leerkrachten nu"
- Show: Parent testimonial (if available)

**Post 4x per week** on schedule:
```
Monday 9:00 AM
Wednesday 3:00 PM
Friday 6:00 PM
Sunday 11:00 AM
```

### Landing Page Updates

- [ ] Update `src/app/page.tsx` with benefits
- [ ] Add testimonials section
- [ ] Add pricing section
- [ ] Add FAQ section
- [ ] Link to Gumroad product

---

## 🆘 TROUBLESHOOTING

### "Audio not playing"
- Check: `public/audio/{word}.mp3` files exist
- Check: Browser allows autoplay
- Check: TTS API response is valid

### "Database connection error"
- Check: `.env.local` has correct Supabase keys
- Check: Tables exist in Supabase
- Check: RLS policies allow reading

### "Auth not working"
- Check: Supabase Auth enabled
- Check: Email configured in Supabase
- Check: JWT secret set correctly

### "Payment not processing"
- Check: Gumroad/Paddle account verified
- Check: API keys correct in env
- Check: Price currency matches (EUR)

---

## 📞 SUPPORT

**For issues:**
1. Check this guide first
2. Check Supabase Dashboard logs
3. Check Vercel deployment logs
4. Check browser console (F12)

---

## 🎉 YOU'RE LIVE!

Once all steps completed:
- ✅ MVP is production-ready
- ✅ Users can sign up and play
- ✅ Teachers can upload wordlists
- ✅ AI explains spelling rules
- ✅ Results are tracked

**Target metrics for success:**
- Week 1: 10+ sign-ups
- Month 1: 50+ users
- Month 3: 250+ paying customers → €500-750/month

---

**Last Updated:** April 3, 2026  
**Next Review:** After first 100 users
