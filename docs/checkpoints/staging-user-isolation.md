# ClaimRadar India — Staging Authenticated User Isolation Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Project (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Authenticated user row-level security (RLS) policies were verified for multi-tenant user isolation. Synthetic staging identities (User A and User B) were evaluated against owner-scoped tables (`profiles`, `watchlists`, `claim_trackers`, `claim_matches`, `user_notification_preferences`, `user_notifications`, `user_onboarding_responses`, `user_correction_requests`, `consent_withdrawal_requests`, `grievance_contacts`).

---

## 2. Tested Security Controls & Isolation Invariants

- **Owner-Only Read:** User A can read User A's rows; User A receives zero rows when attempting to query User B's rows.
- **Cross-User Write Prevention:** User A cannot insert, update, or delete rows belonging to User B.
- **ID Substitution Attacks:** Passing User B's `user_id` or `profile_id` in User A's API payload fails RLS check (`WITH CHECK (user_id = (SELECT auth.uid()))`).
- **Owner ID Manipulation:** Attempting to update `user_id` to reassign row ownership is rejected by PostgreSQL RLS triggers.
- **Delete / Reinsert Bypass:** User A cannot delete or re-insert User B's records.
- **Role Escalation Attempt:** Updating `is_staff` or `role` flags in `profiles` by non-staff users is blocked by `006_role_escalation.test.sql` triggers and policies.

---

## 3. RLS Isolation Policy Matrix

| Entity Table                    | User A Access     | User B Access     | Cross-User Attack Outcome  |
| :------------------------------ | :---------------- | :---------------- | :------------------------- |
| `profiles`                      | Own row only      | Own row only      | DENIED (HTTP 403 / 0 rows) |
| `watchlists`                    | Own rows only     | Own rows only     | DENIED (HTTP 403 / 0 rows) |
| `claim_trackers`                | Own rows only     | Own rows only     | DENIED (HTTP 403 / 0 rows) |
| `claim_matches`                 | Own rows only     | Own rows only     | DENIED (HTTP 403 / 0 rows) |
| `user_notification_preferences` | Own preferences   | Own preferences   | DENIED (HTTP 403 / 0 rows) |
| `user_notifications`            | Own notifications | Own notifications | DENIED (HTTP 403 / 0 rows) |
| `user_onboarding_responses`     | Own answers       | Own answers       | DENIED (HTTP 403 / 0 rows) |
| `user_correction_requests`      | Own requests      | Own requests      | DENIED (HTTP 403 / 0 rows) |
