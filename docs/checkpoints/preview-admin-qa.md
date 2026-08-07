# Preview Admin QA Report

**Timestamp:** 2026-08-07T16:19:36Z  
**Environment:** Vercel Preview (`https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`)  
**Database:** Supabase Staging (`upvsfqufkywlpibbwrse.supabase.co`)  

---

## 1. Admin Route Protection & RBAC Matrix

- **Unauthenticated Access:** Direct access to `/admin`, `/admin/candidates`, `/admin/claimables`, `/admin/sources`, `/admin/users`, `/admin/audit`, `/admin/ai-runs`, `/admin/crawl-runs` returns HTTP 307 redirect to `/login`.
- **Non-Staff Access:** Authenticated customer accounts without staff roles (`app_role NOT IN ('RESEARCHER', 'EDITOR', 'LEGAL_REVIEWER', 'ADMIN')`) receive authorization rejection (HTTP 403 Forbidden).

---

## 2. Staff Permission Matrix Enforcement

| Staff Role | Allowed Operations | Restricted Operations | Verified Gate State |
|---|---|---|---|
| `RESEARCHER` | View candidates, crawl logs, source records | Cannot approve candidates or publish claimables | Enforced via RLS & API Middleware |
| `EDITOR` | Draft claimables, edit metadata, submit for review | Cannot perform legal verification or admin user updates | Enforced via RLS & API Middleware |
| `LEGAL_REVIEWER` | Review legal disclosures, perform verification | Cannot perform system admin configuration | Enforced via RLS & API Middleware |
| `ADMIN` | Full editorial, user management, and audit log access | System configuration subject to audit logging | Enforced via RLS & API Middleware |

---

## 3. Administrative Audit Trail

- All staff modifications to `candidates`, `claimables`, and `sources` write structured entries to `audit_logs` containing `actor_id`, `action`, `target_id`, `before_state`, `after_state`, and `created_at`.
