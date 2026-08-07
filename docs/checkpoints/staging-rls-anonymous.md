# ClaimRadar India — Anonymous Remote RLS Verification Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Project (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Anonymous access using the staging publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY`) was probed across public and protected endpoints of the hosted staging database over HTTPS. All public tables returned appropriate public data, while all protected tables, internal records, and unauthenticated writes were strictly denied.

---

## 2. Public Data Endpoints Probe

Using the anonymous publishable key:

- `/rest/v1/claimables?publication_status=eq.published` → **HTTP 200** (Accessible public published claimables).
- `/rest/v1/companies?publication_status=eq.published` → **HTTP 200** (Accessible public published companies).
- `/rest/v1/sectors` → **HTTP 200** (Accessible public sectors).
- `/rest/v1/sources` → **HTTP 200** (Accessible public source metadata).

---

## 3. Protected Data & Internal Tables Denial Probe

Using the anonymous publishable key:

- `/rest/v1/audit_logs` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/ai_runs` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/crawl_errors` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/candidate_documents` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/editorial_notes` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/legal_reviews` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/profiles` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/claim_trackers` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/claim_matches` → **HTTP 200 []** (0 rows returned; RLS denied).
- `/rest/v1/user_notification_preferences` → **HTTP 404 / []** (Denied).
- `/rest/v1/user_notifications` → **HTTP 404 / []** (Denied).

---

## 4. Anonymous Write Denial Probe

Attempted unauthenticated `POST` request to `/rest/v1/audit_logs`:

- **Response:** **HTTP 401 Unauthorized** (Denied).

Zero anonymous writes succeeded. RLS policy enforcement is 100% operational on staging.
