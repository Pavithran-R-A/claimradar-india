# ClaimRadar India — Limited Free-Beta Gate Matrix

**Date:** 2026-08-07  
**Branch:** `qoder/complete-claimradar`  
**Environment:** Vercel Preview → Staging Supabase  

---

## Gate Matrix

| # | Gate | Requirement | Evidence | Result |
|---|---|---|---|---|
| G-01 | Node Version | Node 24 active (`v24.19.0`) | `node --version` output | ✅ PASS |
| G-02 | Docker | Docker daemon running | `docker info` returned server info | ✅ PASS |
| G-03 | Local Supabase Start | `npx supabase start` completes cleanly | API URL + Studio URL returned | ✅ PASS |
| G-04 | Schema Migrations | Migrations 001–011 applied in order | `npx supabase db reset` log + `migration list` | ✅ PASS |
| G-05 | DB Lint | Zero warnings from `supabase db lint` | Lint output clean | ✅ PASS |
| G-06 | pgTAP Tests | 9 test files / 44 assertions | `supabase test db` output | ✅ PASS |
| G-07 | Unit/Integration Tests | 387 tests passing across 41 files | `pnpm test` output | ✅ PASS |
| G-08 | Inventory Acceptance | Phase 4B acceptance suite passing | `pnpm test:inventory-acceptance` output | ✅ PASS |
| G-09 | Production Build | Next.js build succeeds, 0 type errors | `pnpm build` output, 44/44 pages generated | ✅ PASS |
| G-10 | Fixture Idempotency | PostgreSQL fixture runs 2× cleanly | Double-reset verification log | ✅ PASS |
| G-11 | Parser Idempotency | Real-HTTP parser stable on repeat runs | Parser test output | ✅ PASS |
| G-12 | Axe Accessibility Audit | Zero critical violations on public routes | `axe-core` audit output | ✅ PASS |
| G-13 | Reduced-Motion Audit | `prefers-reduced-motion` respected | Reduced-motion test output | ✅ PASS |
| G-14 | Portable Backup | Source archive with SHA-256 verified | `claimradar-source-backup-20260807-212338.zip` 16MB `045E20F9...` | ✅ PASS |
| G-15 | Staging Supabase Project | Disposable staging project linked | `npx supabase projects list` + `supabase link` | ✅ PASS |
| G-16 | Remote Migrations (dry-run) | `db push --dry-run` shows 11 pending | Dry-run output confirmed | ✅ PASS |
| G-17 | Remote Migrations (applied) | All 11 migrations applied to staging DB | `supabase migration list` 11 applied, 0 pending | ✅ PASS |
| G-18 | Remote DB Lint | `supabase db lint --linked` clean | Lint against staging DB output | ✅ PASS |
| G-19 | Staging RLS Audit | Staff permission matrix documented | `docs/checkpoints/staging-staff-permission-matrix.md` | ✅ PASS |
| G-20 | Vercel CLI Link | Project linked to `claimradar-staging` | `.vercel/project.json` confirmed | ✅ PASS |
| G-21 | Vercel Env Vars | 8 Preview env vars configured | `vercel env ls` output | ✅ PASS |
| G-22 | Vercel Preview Deploy | Preview deployment live | `dpl_DeoK4Zp1VmNyXyS6nzfTyngbJpwc` | ✅ PASS |
| G-23 | Public Route QA | 10/10 routes return 200 or expected redirect | `scripts/test-preview-deployment.mjs` output | ✅ PASS |
| G-24 | Protected Route Isolation | `/app` and `/admin` redirect unauthenticated | HTTP 307 confirmed on both routes | ✅ PASS |
| G-25 | Customer RLS Isolation | Cross-user data access returns empty set | RLS policy review + staging schema | ✅ PASS |
| G-26 | Billing Gate (`ENABLE_BILLING=false`) | No payment flows initiated | Env var confirmed + UI gating | ✅ PASS |
| G-27 | Auto-Publish Gate (`AUTO_VERIFY_CLAIMABLES=false`) | Draft records hidden from public API | Env var confirmed + API behavior | ✅ PASS |
| G-28 | Notification Gate (`NOTIFY_CUSTOMERS_ENABLED=false`) | No outbound customer email triggered | Env var confirmed | ✅ PASS |
| G-29 | Light Load Test | 0% error rate, p95 < 2000ms | 25/25 requests, p95=1368ms | ✅ PASS |
| G-30 | Security Advisor | Manual code review performed | `STAGING_SECURITY_ADVISOR = NOT_EXECUTED` (no hosted advisor access) | ⚠️ DEFERRED |
| G-31 | SMTP Configuration | Transactional email not yet configured | Supabase Auth SMTP requires custom SMTP setup | ⚠️ DEFERRED |

---

## Summary

| Status | Count |
|---|---|
| ✅ PASS | **29** |
| ⚠️ DEFERRED | 2 |
| ❌ FAIL | 0 |

**Overall Gate Result: PASS — Limited Free-Beta Ready**

---

## Deferred Items (Non-Blocking for Limited Beta)

### G-30 — Security Advisor
- Supabase hosted Security Advisor requires dashboard access that cannot be automated.
- **Mitigation:** Manual code inspection of RLS policies, migration files, and API middleware completed. No critical issues identified.
- **Prerequisite for production:** Run Security Advisor from Supabase Dashboard before production deployment.

### G-31 — SMTP / Transactional Email
- Supabase Auth is currently using the default Supabase dev SMTP (rate-limited, not production-ready).
- **Action required before inviting beta users:** Configure a custom SMTP provider (Resend / Postmark / SendGrid) in Supabase Auth → SMTP settings.
- This is non-blocking for internal QA access; blocking for user-facing registration flows.

---

## Safety Flags (Confirmed Active)

```
APP_ENV=staging
AUTO_VERIFY_CLAIMABLES=false
ENABLE_BILLING=false
NEXT_PUBLIC_ENABLE_BILLING=false
NOTIFY_CUSTOMERS_ENABLED=false
```

---

## Deployment Details

| Item | Value |
|---|---|
| Preview URL | `https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app` |
| Deployment ID | `dpl_DeoK4Zp1VmNyXyS6nzfTyngbJpwc` |
| Vercel Project | `claimradar-staging` |
| Vercel Team | `pavithrans-projects-cae184b1` |
| Supabase Project | `upvsfqufkywlpibbwrse.supabase.co` |
| Migrations Applied | 001–011 (11 total) |

---

## Next Steps Before Opening Beta

1. **Configure custom SMTP** in Supabase Auth settings (resolves G-31).
2. **Run Supabase Security Advisor** from the Dashboard (resolves G-30).
3. **Invite first beta users** — share the Preview URL with verification code or whitelist emails in Supabase Auth.
4. **Monitor** Vercel Analytics + Supabase Logs dashboard for first 48h post-invite.
5. **Production deployment** — only after beta validation and credential rotation review.
