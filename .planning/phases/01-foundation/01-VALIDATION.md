---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — no test framework configured |
| **Config file** | none |
| **Quick run command** | `next build` (type-check + build) |
| **Full suite command** | Manual end-to-end on Vercel production URL |
| **Estimated runtime** | ~30 seconds (build) + manual testing |

---

## Sampling Rate

- **After every task commit:** Run `next build` to catch TypeScript/compile errors
- **After every plan wave:** Verify in browser (local + Vercel)
- **Before `/gsd:verify-work`:** All 3 manual e2e checks pass on Vercel production
- **Max feedback latency:** 30 seconds (build), 5 minutes (Vercel deploy + manual)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | AUTH-01, AUTH-02, AUTH-03 | build | `next build` | ✅ | ⬜ pending |
| 1-02-01 | 02 | 1 | AUTH-03 | build | `next build` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 2 | AUTH-01–03 | manual e2e | see manual section | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `proxy.ts` — create at project root (route protection / session refresh)

*All other infrastructure (Supabase client, server, migration SQL, auth UI) is already implemented.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| User can register | AUTH-01 | No test framework; requires live Supabase + email | Open Vercel URL → register new email → check Supabase dashboard confirms user |
| User can log in | AUTH-02 | Requires live auth session | Open Vercel URL → log in → mode chooser must appear |
| Session persists after refresh | AUTH-03 | Requires live browser + session cookie | Log in → close tab → reopen Vercel URL → mode chooser still shown (not auth form) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
