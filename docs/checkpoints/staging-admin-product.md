# ClaimRadar India — Staging Admin Product Verification Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Web Routes (`apps/web/app/(admin)/admin`)

---

## 1. Verified Admin Routes

The following admin and editorial routes were verified against staff role guards:

- `/admin`
- `/admin/candidates`
- `/admin/claimables`
- `/admin/companies`
- `/admin/sources`
- `/admin/reviews`
- `/admin/corrections`
- `/admin/crawl-runs`
- `/admin/ai-runs`
- `/admin/alerts`
- `/admin/users`
- `/admin/audit`
- `/admin/settings`

---

## 2. Admin Security Controls

- **Server-Side Guard:** All admin routes check `is_staff()` via `apps/web/lib/auth-guards.ts` and `supabase/migrations/006_rls_policies.sql`.
- **Unauthorized Denial:** Standard users and anonymous callers attempting to access any `/admin/*` route receive `HTTP 401 Unauthorized` / `HTTP 403 Forbidden` or redirect to `/login`.
- **Role Scoping:** Staff permissions align strictly with the role matrix (`researcher`, `editor`, `legal_reviewer`, `admin`).
