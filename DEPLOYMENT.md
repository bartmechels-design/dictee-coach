# 🚀 Dictee Coach - Deployment Instructions

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Database migration applied
- [ ] Data seeded (161 words + 60 sentences)
- [ ] Auth flow working
- [ ] Dictee mode tested
- [ ] Results display correct
- [ ] Audio plays smoothly
- [ ] No console errors
- [ ] Environment variables ready

---

## 1. PREPARE FOR DEPLOYMENT

### 1.1 Set Production Environment Variables

Create a secure `.env.production` file with:

```env
# Supabase (use production project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your_anon_key...

# Backend (never expose this)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your_service_role_key...

# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...your_key...

# Security
SEED_TOKEN=use_a_strong_random_token_not_dev_seed_token

# Optional: Gumroad (if implemented)
NEXT_PUBLIC_GUMROAD_PRODUCT_ID=your_product_id
```

**NEVER commit `.env.production` to git!**

### 1.2 Final Code Review

```bash
cd /path/to/dictee-coach

# Check for console errors
npm run build 2>&1 | grep -i error

# Run type check
npx tsc --noEmit

# Check for missing dependencies
npm audit
```

---

## 2. DEPLOY TO VERCEL

### Option A: Via Git (Recommended)

```bash
# 1. Ensure code is committed
git status  # Should be clean
git add .
git commit -m "Release: MVP v1.0 - Ready for production"
git push origin main

# 2. Vercel auto-deploys if connected
# Monitor at: https://vercel.com/dashboard
```

### Option B: CLI Deploy

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel deploy --prod

# 3. Set environment variables in Vercel UI:
#    - Login to vercel.com
#    - Select project
#    - Settings → Environment Variables
#    - Add all vars from .env.production
```

### Option C: Manual Upload

```bash
# Build locally
npm run build

# Upload .next, public, package*.json to Vercel
# (Less recommended, more manual)
```

---

## 3. CONFIGURE PRODUCTION ENVIRONMENT IN VERCEL

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your `dictee-coach` project
3. Click **Settings** → **Environment Variables**
4. Add each variable (click **Add New Variable**):
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environments: **Production, Preview, Development**
   - Save

5. Repeat for all variables in `.env.production`

6. Click **Deployments** → **Redeploy** on the main deployment

---

## 4. RUN DATABASE MIGRATIONS IN PRODUCTION

Once deployed, you need to apply database migrations to your **production Supabase project** (not development):

### 4.1 Switch to Production Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Make sure you're viewing your **production project** (not dev/staging)
3. Click **SQL Editor**

### 4.2 Apply Migration

1. Click **New Query**
2. Open `supabase/migrations/20260403_cito_v2_tables.sql`
3. Copy entire content
4. Paste into SQL Editor
5. Click **Run**
6. Verify: 5 tables created without errors

### 4.3 Seed Production Data

```bash
# From your local machine, point to production:
export SUPABASE_URL=https://your-production-project.supabase.co
export SUPABASE_KEY=your-production-key

# Seed CITO wordbank
curl -X POST "https://dictee-coach.vercel.app/api/admin/seed-cito" \
  -H "Content-Type: application/json" \
  -d '{"token": "your_production_seed_token"}'

# Seed sentences
curl -X POST "https://dictee-coach.vercel.app/api/admin/seed-sentences" \
  -H "Content-Type: application/json" \
  -d '{"token": "your_production_seed_token"}'
```

---

## 5. POST-DEPLOYMENT VERIFICATION

### 5.1 Test Production URL

```bash
# Check if site loads
curl -I https://dictee-coach.vercel.app

# Test API endpoints
curl https://dictee-coach.vercel.app/api/admin/seed-cito?token=your_token

# Check audio files
curl -I https://dictee-coach.vercel.app/public/audio/huis.mp3
```

### 5.2 Manual Testing

1. Visit **https://dictee-coach.vercel.app**
2. Sign up with new email
3. Create child profile
4. Play dictee lesson (should use production audio)
5. Submit results
6. See score displayed
7. Share result card (should show correct URL)

### 5.3 Monitor Performance

```bash
# Check Vercel Analytics
# https://vercel.com/dashboard/[project]/analytics

# Check Supabase Logs
# https://supabase.com/dashboard/project/[id]/logs

# Check error tracking
# Add Sentry if needed:
# npm install @sentry/nextjs
```

---

## 6. DOMAIN SETUP (Optional but Recommended)

### 6.1 Add Custom Domain

1. Go to Vercel Dashboard
2. Select project → Settings → Domains
3. Add domain: `dictee-coach.nl` or `spellcoach.nl`
4. Configure DNS at domain registrar
5. Wait for CNAME verification

### 6.2 SSL Certificate

- Vercel auto-provisions SSL (free)
- Should be active within 24 hours

---

## 7. MONITORING & MAINTENANCE

### Daily

- Check Vercel deployment status
- Monitor Supabase query performance
- Watch for error spikes

### Weekly

- Review usage analytics
- Check API call counts
- Verify backup status

### Monthly

- Update dependencies: `npm update`
- Review security alerts: `npm audit`
- Check Vercel billing

---

## 8. TROUBLESHOOTING DEPLOYMENT

### "Build fails on Vercel"

```bash
# Check logs in Vercel UI
# Check for Node version mismatch
node --version  # Should be 18+

# Try local build
npm run build
npm start  # Should work
```

### "Database connection error in production"

```bash
# Check environment variables in Vercel
# Verify NEXT_PUBLIC_SUPABASE_URL is correct
# Ensure SUPABASE_SERVICE_ROLE_KEY is set (backend only)
# Test connection: curl https://your-project.supabase.co/rest/v1/
```

### "Audio not playing in production"

```bash
# Check audio files in public/audio/
# Verify NEXT_PUBLIC prefix on Supabase variables
# Check CORS settings in Supabase
```

### "Payment not working"

```bash
# Check Gumroad/Paddle keys in env
# Test payment URL: https://gumroad.com/l/your-product-id
# Verify webhook endpoint configured
```

---

## 9. ROLLBACK (If Needed)

```bash
# Revert to previous deployment
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Click the previous successful build
# 3. Click "..." → Promote to Production

# Or via CLI:
vercel rollback
```

---

## 10. LAUNCH ANNOUNCEMENT

Once deployed and verified:

1. **Update homepage** with launch date
2. **Send email** to anyone who expressed interest
3. **Post on TikTok** with launch announcement
4. **Update landing page** with live link
5. **Gather early feedback** and iterate

---

## Deployment Checklist Summary

```
PRE-DEPLOYMENT:
- [ ] Code committed and pushed
- [ ] Env variables prepared
- [ ] Build passes locally
- [ ] No console errors

DEPLOYMENT:
- [ ] Pushed to Vercel (auto-deployed)
- [ ] Environment variables set in Vercel
- [ ] Production domain connected
- [ ] SSL active

POST-DEPLOYMENT:
- [ ] Site loads
- [ ] Auth works
- [ ] Dictee mode works
- [ ] Audio plays
- [ ] Database queries work
- [ ] Payment flow tested

MONITORING:
- [ ] Vercel analytics enabled
- [ ] Supabase monitoring active
- [ ] Error tracking enabled
- [ ] Daily checks for 1 week
```

---

**Estimated Deploy Time:** 30 minutes  
**Go-Live Date:** [Your date here]  
**Support Contact:** [Your contact]
