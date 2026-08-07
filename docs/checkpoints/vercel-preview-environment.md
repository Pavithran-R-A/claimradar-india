# ClaimRadar India — Vercel Preview Environment Configuration Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Vercel Project:** `pavithrans-projects-cae184b1/claimradar-staging`

---

## 1. Executive Summary

Environment variables for the hosted Vercel Preview deployment were configured exclusively under the **Preview** environment scope. Zero staging variables apply to Production scope.

---

## 2. Configured Preview Variables & Scope Matrix

| Variable Name                          | Environment Scope | Exposure Type  | Purpose                                        |
| :------------------------------------- | :---------------- | :------------- | :--------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Preview           | Browser Client | Staging Supabase REST/Auth Base URL            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preview           | Browser Client | Staging Supabase Publishable/Anon Key          |
| `NEXT_PUBLIC_ENABLE_BILLING`           | Preview           | Browser Client | Billing Disabled Flag (`false`)                |
| `APP_ENV`                              | Preview           | Server Runtime | Staging Environment Indicator (`staging`)      |
| `AUTO_VERIFY_CLAIMABLES`               | Preview           | Server Runtime | Auto Publication Safety Guard (`false`)        |
| `ENABLE_BILLING`                       | Preview           | Server Runtime | Server Billing Guard (`false`)                 |
| `NOTIFY_CUSTOMERS_ENABLED`             | Preview           | Server Runtime | Customer Email Dispatch Safety Guard (`false`) |
| `SUPABASE_URL`                         | Preview           | Server Runtime | Backend Supabase URL                           |

---

## 3. Secret Exposure Prevention Invariants

- **0 Secret Keys in NEXT_PUBLIC\_:** `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_PASSWORD`, `DATABASE_URL`, `SUPABASE_ACCESS_TOKEN` are completely omitted from browser client variables.
- **Production Scope Cleanliness:** Production scope has zero staging variables attached.
- **Client Bundle Audit:** Pre-deployment scan (`scripts/verify-client-bundle-secrets.mjs`) passed with 0 backend secret classes in Next.js bundle output.
