# 🚀 Dictee Coach - PRODUCTION DEPLOYMENT CHECKLIST

**Status:** Ready to Deploy  
**Build Date:** April 3, 2026  
**Target URL:** dictee-coach.vercel.app (or custom domain)

---

## ✅ PRE-DEPLOYMENT VERIFICATION

### Code Quality
- [x] Build succeeds: `npm run build` ✓
- [x] No TypeScript errors
- [x] All routes compile
- [x] Components render without errors

### Features Complete
- [x] Audio playback (161 MP3s)
- [x] Word validation works
- [x] Results display works
- [x] Teacher upload works
- [x] Payment button ready
- [x] DicteeMode component complete
- [x] Test page at /test/dictee

### Database Ready
- [x] Schema created (5 tables)
- [x] CITO words ready (161)
- [x] Dictee sentences ready (60)
- [x] RLS policies configured

### Documentation Complete
- [x] LAUNCH_GUIDE.md
- [x] DEPLOYMENT.md
- [x] README_LAUNCH.md
- [x] BUILD_SUMMARY.md

---

## 📋 STEP 1: GIT COMMIT & PUSH

```bash
# Verify clean status
git status

# Commit any remaining changes
git add .
git commit -m "Final: Ready for production deployment"

# Push to GitHub
git push origin main
```

**Checklist:**
- [ ] Git history clean
- [ ] All changes committed
- [ ] Remote branch updated

---

## 🔐 STEP 2: VERCEL SETUP

### Option A: If Vercel already connected
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select `dictee-coach` project
3. Check "Deployments" tab
4. Latest deployment should auto-trigger from git push

### Option B: If not yet connected
1. Create account at [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select `dictee-coach` repository
5. Click "Deploy"

**Checklist:**
- [ ] Vercel project created
- [ ] GitHub repository connected
- [ ] Auto-deploy enabled

---

## 🔑 STEP 3: ENVIRONMENT VARIABLES

**In Vercel Dashboard:**

1. Select project → Settings → Environment Variables
2. Add each variable (Production, Preview, Development):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
SEED_TOKEN
```

**Get values from:**
- Supabase: Project Settings → API
- Anthropic: API Keys dashboard
- Generate: SEED_TOKEN (use strong random value, NOT dev-seed-token)

**Checklist:**
- [ ] NEXT_PUBLIC_SUPABASE_URL set
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set
- [ ] SUPABASE_SERVICE_ROLE_KEY set (backend only)
- [ ] ANTHROPIC_API_KEY set
- [ ] SEED_TOKEN set (secure value)
- [ ] All vars saved

---

## 🗄️ STEP 4: DATABASE MIGRATION (Production)

**IMPORTANT: Use PRODUCTION Supabase project, not development**

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select PRODUCTION project (verify name)
3. Click SQL Editor
4. New Query
5. Paste: `supabase/migrations/20260403_cito_v2_tables.sql`
6. Click Run

**Verify 5 tables created:**
- [ ] cito_wordbanks
- [ ] dictee_sentences
- [ ] teacher_wordlists
- [ ] teacher_wordlist_items
- [ ] word_mastery

---

## 📊 STEP 5: SEED PRODUCTION DATA

**After migration succeeds:**

```bash
# Replace YOUR_SEED_TOKEN with actual token from .env
curl -X POST "https://dictee-coach.vercel.app/api/admin/seed-cito?token=YOUR_SEED_TOKEN"

curl -X POST "https://dictee-coach.vercel.app/api/admin/seed-sentences?token=YOUR_SEED_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "count": 161,
  "message": "161 CITO words seeded"
}
```

**Checklist:**
- [ ] CITO words seeded (161)
- [ ] Dictee sentences seeded (60)
- [ ] Both endpoints returned success

---

## 🧪 STEP 6: PRODUCTION TESTING

### Test 1: Homepage
- [ ] Visit https://dictee-coach.vercel.app
- [ ] Page loads in < 2 seconds
- [ ] Hero section visible
- [ ] All text displays correctly
- [ ] Images/emojis render

### Test 2: Language Switching
- [ ] Click language switcher (NL ↔ EN)
- [ ] Page changes language
- [ ] Navigation text updates
- [ ] URL changes to /en/ or /nl/

### Test 3: Sign Up
- [ ] Click "Sign up" button
- [ ] Form renders without errors
- [ ] Can enter email + password
- [ ] Submit works
- [ ] Redirects to profile creation

### Test 4: Complete Flow
- [ ] Sign up with test email
- [ ] Create child profile
- [ ] Select Groep 3
- [ ] Play dictee lesson
- [ ] Click "Luister" (listen)
- [ ] Audio plays (should hear word + rule + word)
- [ ] Type word in input
- [ ] Click "Check"
- [ ] See result (✓ or ✗)
- [ ] Continue through all words
- [ ] See results screen with score
- [ ] Check star rating displays

### Test 5: Audio Quality
- [ ] Audio is clear, not distorted
- [ ] Voice is natural (female, Dutch)
- [ ] Speed is appropriate (not too fast)
- [ ] All 161 audio files exist

### Test 6: Database
- [ ] Check Supabase Dashboard
- [ ] Verify cito_wordbanks has 161 rows
- [ ] Verify dictee_sentences has 60 rows
- [ ] New user data appears in 'users' table after signup

### Test 7: Teacher Upload
- [ ] Navigate to /teacher
- [ ] Page redirects to login (expected)
- [ ] Sign up as different user
- [ ] Go to /teacher
- [ ] See upload form
- [ ] Try uploading sample CSV
- [ ] Should see success message

---

## 🎯 STEP 7: FINAL VERIFICATION

**Performance:**
- [ ] Lighthouse score > 80 (check DevTools)
- [ ] Page load time < 2s
- [ ] Audio plays without lag

**Functionality:**
- [ ] All buttons clickable
- [ ] All links work
- [ ] Forms submit
- [ ] Database queries work

**Errors:**
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] Browser console clean (F12 → Console)
- [ ] No TypeScript errors

---

## 📱 STEP 8: MOBILE TESTING

Test on actual mobile device:

- [ ] Homepage responsive on mobile
- [ ] Navigation accessible on mobile
- [ ] Forms work on mobile keyboard
- [ ] Audio plays on mobile
- [ ] Text readable (no overflow)
- [ ] Touch buttons are at least 44x44px

---

## 🔄 STEP 9: ROLLBACK PLAN (If Issues)

**If production has issues:**

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find last known-good deployment
4. Click "..." → "Promote to Production"

This reverts to previous version immediately.

---

## ✨ STEP 10: POST-DEPLOYMENT

### Analytics Setup (Optional)
- [ ] Add Google Analytics
- [ ] Configure Vercel Analytics
- [ ] Set up error tracking (Sentry)

### Monitoring (Optional)
- [ ] Set up alerts for errors
- [ ] Monitor API usage
- [ ] Check database query performance

### Marketing
- [ ] Update landing page with launch date
- [ ] Email any waitlist users
- [ ] Post on social media
- [ ] Create first TikTok video

---

## 📊 DEPLOYMENT TIMELINE

| Step | Time | Status |
|------|------|--------|
| Git commit & push | 5 min | |
| Vercel setup | 10 min | |
| Environment variables | 5 min | |
| Database migration | 5 min | |
| Seed data | 3 min | |
| Testing | 20 min | |
| **TOTAL** | **~50 min** | |

---

## 🎯 SUCCESS CRITERIA

✅ **Launch is successful when:**

- Site loads without errors
- All pages accessible (no 404s)
- Audio plays correctly
- Signup/login works
- Database has seeded data
- Mobile-responsive
- Performance > 80 Lighthouse score

---

## 📞 TROUBLESHOOTING

### "Build failed on Vercel"
- Check logs in Vercel Dashboard
- Verify Node version (18+)
- Check environment variables are set
- Ensure .env.example is not in git

### "Audio not playing"
- Check `public/audio/` has 161 MP3s
- Verify CORS settings in bucket
- Test URL directly in browser

### "Database connection error"
- Verify Supabase URL and key in Vercel
- Check table exists in Supabase
- Check RLS policies allow reading

### "Signup not working"
- Verify Supabase Auth enabled
- Check JWT settings
- Test with simple email (no +)

---

## ✅ DEPLOYMENT COMPLETE CHECKLIST

When everything passes:

```
[x] Code committed and pushed to GitHub
[x] Vercel project created and connected
[x] Environment variables configured
[x] Database migration completed
[x] Data seeded successfully
[x] Homepage loads correctly
[x] Language switching works
[x] Sign up/login tested
[x] Complete flow tested
[x] Audio plays correctly
[x] Mobile responsive
[x] Performance acceptable
[x] All tests passed
[x] No errors in console

🎉 READY FOR PRODUCTION! 🎉
```

---

## 📍 PRODUCTION DETAILS

**Domain:** dictee-coach.vercel.app  
**Custom Domain:** (optional) dictee-coach.nl  
**SSL:** Auto-configured by Vercel  
**CDN:** Vercel Edge Network  
**Uptime SLA:** 99.95%

---

## 🚀 NEXT AFTER LAUNCH

1. Monitor error tracking (first 24 hours)
2. Check analytics
3. Gather user feedback
4. Plan v1.1 features
5. Consider v2.0 roadmap

---

**Last Updated:** April 3, 2026  
**Status:** READY FOR DEPLOYMENT
