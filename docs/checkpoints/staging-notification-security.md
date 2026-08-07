# ClaimRadar India — Staging Notification Security Report (Migration 011)

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Project (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Migration `011_notifications.sql` was verified against the hosted staging database. All security, isolation, frequency limit, and policy invariants were validated.

---

## 2. Notification Security Invariants

- **Anonymous Denial:** `/rest/v1/user_notification_preferences` and `/rest/v1/user_notifications` return `404` / `401` / zero rows to unauthenticated callers.
- **Authenticated Ownership Isolation:** Users can only query and mutate their own notification preferences and notifications (`user_id = (SELECT auth.uid())`).
- **Cross-User Denial:** User A cannot access or delete notifications for User B.
- **Customer Delivery Safety Guard:** `NOTIFY_CUSTOMERS_ENABLED=false` is enforced on staging. Zero real customer emails or SMS messages are dispatched.
- **Transport Safety:** All notification events use the console/test log transport (`EMAIL_PROVIDER="console"`).
- **Duplicate Prevention & Idempotency:** Notification engine deduplicates identical events within the configured window (`ALERT_DEDUP_WINDOW_MINUTES="60"`).
