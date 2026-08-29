# ClaimRadar India — Final Production Readiness Report

**Date:** August 29, 2026  
**Environment:** Staging (`qsshiksnyflwsybjyzob`) / Vercel (`claimradar-staging`)  
**Status:** SAFE FOR LIMITED FREE BETA (`SAFE_FOR_LIMITED_FREE_BETA = YES`)  
**Production Status:** PENDING PRODUCTION MIGRATION / SMTP / DOMAIN CONFIGURATION

---

## 1. Executive Summary

ClaimRadar India has completed a comprehensive, multi-layered production readiness program covering:

1. **Editorial Truth & Semantic Classifier Overhaul**: Implemented deterministic layered classification separating true actionable claims (CIRP creditor proofs, SEBI investor refunds, TRAI consumer refunds) from administrative and regulatory enforcement noise (RBI supervisory monetary penalties, IBBI Form G resolution applicant EOIs, generic SEBI adjudication/settlement orders). Evaluated against a rigorous 14-item positive/negative corpus achieving 100% recall, 100% precision, and 0 hard-negative false positives.
2. **Modern Supabase Key & Security Model**: Verified total deactivation of legacy JWT API keys. System operates strictly on modern `sb_publishable_...` and `sb_secret_...` keys with fail-closed privileged database access and verified remote RLS isolation across all 21 public/protected tables.
3. **Admin & Editorial Review Surface**: Real data-backed candidate review, claimable management, crawl run monitoring, and immutable audit logging without dead or fake controls.
4. **Public & Customer Auth Experience**: Responsive (320px–1920px), accessible (WCAG 2.2 AA compliant), with zero fake counters or artificial urgency, robust customer auth, profile, watchlist, match engine, and claim tracker.
5. **Quality & Verification Gates**: 100% pass across Prettier, ESLint, TypeScript typecheck, Vitest unit suite (431/431 passing), inventory acceptance suite (286/286 passing), and Next.js full static production build (44/44 routes).

---

## 2. Readiness Status Matrix

| Subsystem                            | Readiness State | Details / Evidence                                                                                                                        |
| :----------------------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Editorial Truth & Classification** | **READY**       | Layered semantic document classifier with 100% positive recall, 100% precision, 0 false positives on RBI penalties or Form G.             |
| **Candidate Quality (Staging)**      | **READY**       | 22/22 live candidates in DB are 100% true actionable (18 CIRP creditor claim notices + 4 SEBI Citrus Check Inns investor refund notices). |
| **Supabase Architecture**            | **READY**       | Modern API keys active, legacy JWTs disabled, `npx supabase db lint` clean (0 errors), remote RLS 21/21 passed.                           |
| **Client Bundle Security**           | **READY**       | 0 backend secrets (`sb_secret_`, service_role, postgresql connection strings) in 98 client static bundles.                                |
| **Admin Operations Product**         | **READY**       | Fully operational queue, candidate review, claimable promotions, source monitoring, and audit log.                                        |
| **Public UX & Performance**          | **READY**       | Clean responsive UI, SSR/SSG on public directories, no fake social proof or fabricated urgency.                                           |
| **Customer Auth & Isolation**        | **READY**       | Secure session management, profile, watchlist, matches, tracker, RLS-enforced cross-user tenant isolation.                                |
| **CI / CD Automation**               | **READY**       | GitHub Actions CI green, daily crawl workflow with policy guards and concurrency locks.                                                   |
| **Billing & Payments**               | **DISABLED**    | Flagged OFF (`ENABLE_BILLING=false`, `NEXT_PUBLIC_ENABLE_BILLING=false`).                                                                 |
| **Auto-Verification**                | **DISABLED**    | Flagged OFF (`AUTO_VERIFY_CLAIMABLES=false`) to guarantee human editorial review.                                                         |
| **Customer Notifications**           | **DISABLED**    | Flagged OFF (`NOTIFY_CUSTOMERS_ENABLED=false`) until production domain and custom SMTP are active.                                        |

---

## 3. Deployment Topology & Configuration

- **Vercel Staging Deployment**: `https://claimradar-staging.vercel.app`
- **Supabase Staging Project**: `qsshiksnyflwsybjyzob` (AWS `ap-south-1`, Mumbai)
- **Node Engine**: `24.19.0`
- **Monorepo Manager**: `pnpm 11.20.0`
