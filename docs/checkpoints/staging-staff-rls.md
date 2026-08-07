# ClaimRadar India — Staging Staff RLS & Permission Matrix Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Project (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Staff role authorization policies (`is_staff()`) were verified against the schema. Permissions were validated across all four supported staff roles (`researcher`, `editor`, `legal_reviewer`, `admin`) for candidates, claimables, reviews, sources, AI runs, audit logs, and user management.

---

## 2. Staff Permission Matrix

| Capability / Entity          | Unauthenticated | Standard User | Researcher | Editor | Legal Reviewer | Admin |
| :--------------------------- | :-------------: | :-----------: | :--------: | :----: | :------------: | :---: |
| `candidate_documents` (Read) |       ❌        |      ❌       |     ✅     |   ✅   |       ✅       |  ✅   |
| `candidate_documents` (Edit) |       ❌        |      ❌       |     ✅     |   ✅   |       ❌       |  ✅   |
| `claimables` (Draft Read)    |       ❌        |      ❌       |     ✅     |   ✅   |       ✅       |  ✅   |
| `claimables` (Edit)          |       ❌        |      ❌       |     ❌     |   ✅   |       ❌       |  ✅   |
| `review_assignments`         |       ❌        |      ❌       |     ❌     |   ✅   |       ❌       |  ✅   |
| `legal_reviews`              |       ❌        |      ❌       |     ❌     |   ❌   |       ✅       |  ✅   |
| `publication_events`         |       ❌        |      ❌       |     ❌     |   ✅   |       ✅       |  ✅   |
| `sources` (Admin/Edit)       |       ❌        |      ❌       |     ❌     |   ❌   |       ❌       |  ✅   |
| `ai_runs` (Read)             |       ❌        |      ❌       |     ✅     |   ✅   |       ✅       |  ✅   |
| `audit_logs` (Read)          |       ❌        |      ❌       |     ❌     |   ❌   |       ❌       |  ✅   |
| `user_administration`        |       ❌        |      ❌       |     ❌     |   ❌   |       ❌       |  ✅   |

---

## 3. Server Authorization Invariants

- All privileged staff operations are server-authorized using `is_staff()` and custom role claims.
- Client-side navigation or UI hiding alone is never relied upon.
- Non-staff attempts to access admin API routes or tables result in `HTTP 401 Unauthorized` or `HTTP 403 Forbidden`.
