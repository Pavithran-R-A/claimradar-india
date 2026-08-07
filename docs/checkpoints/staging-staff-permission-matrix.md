# ClaimRadar India — Staging Staff Role Permission Matrix

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target Schema:** `006_rls_policies.sql` & `apps/web/lib/auth-guards.ts`

---

## 1. Executive Summary

Row-level security (RLS) policies and server-side authorization guards rely on the `is_staff()` function and custom role claims stored in `profiles.role` / JWT App Metadata. The matrix below defines the exact repository permission policy across all staff roles: **RESEARCHER**, **EDITOR**, **LEGAL_REVIEWER**, and **ADMIN**.

---

## 2. Definitive Staff Permission Matrix

| Capability / Entity                          | Unauthenticated | Standard User | RESEARCHER | EDITOR | LEGAL_REVIEWER | ADMIN |
| :------------------------------------------- | :-------------: | :-----------: | :--------: | :----: | :------------: | :---: |
| **candidate read** (`candidate_documents`)   |       ❌        |      ❌       |     ✅     |   ✅   |       ✅       |  ✅   |
| **candidate edit** (`candidate_documents`)   |       ❌        |      ❌       |     ✅     |   ✅   |       ❌       |  ✅   |
| **claim edit** (`claimables` draft/review)   |       ❌        |      ❌       |     ❌     |   ✅   |       ❌       |  ✅   |
| **legal review** (`legal_reviews`)           |       ❌        |      ❌       |     ❌     |   ❌   |       ✅       |  ✅   |
| **publish** (`publication_events` / status)  |       ❌        |      ❌       |     ❌     |   ✅   |       ✅       |  ✅   |
| **sources** (`sources` edit/admin)           |       ❌        |      ❌       |     ❌     |   ❌   |       ❌       |  ✅   |
| **corrections** (`user_correction_requests`) |       ❌        |      ❌       |     ❌     |   ✅   |       ❌       |  ✅   |
| **crawl runs** (`crawl_runs` view/trigger)   |       ❌        |      ❌       |     ✅     |   ✅   |       ✅       |  ✅   |
| **AI runs** (`ai_runs` view/trigger)         |       ❌        |      ❌       |     ✅     |   ✅   |       ✅       |  ✅   |
| **alerts** (`alerts` configuration)          |       ❌        |      ❌       |     ❌     |   ✅   |       ❌       |  ✅   |
| **users** (`profiles` admin management)      |       ❌        |      ❌       |     ❌     |   ❌   |       ❌       |  ✅   |
| **audit** (`audit_logs` view)                |       ❌        |      ❌       |     ❌     |   ❌   |       ❌       |  ✅   |
| **roles** (`profiles.role` promotion)        |       ❌        |      ❌       |     ❌     |   ❌   |       ❌       |  ✅   |

---

## 3. Remote Verification Summary

- **Anonymous Block:** Probed over staging HTTPS REST API (`/rest/v1/audit_logs`, `/rest/v1/ai_runs`, `/rest/v1/candidate_documents`); returned **HTTP 200 [] / 401 Unauthorized** (0 rows).
- **Staff Function:** `is_staff()` checks `(auth.jwt() ->> 'role') IN ('staff', 'admin')` or `profiles.is_staff = true`.
- **Privilege Escalation:** Triggers prevent non-admin users from altering `role` or `is_staff` flags on `profiles`.
