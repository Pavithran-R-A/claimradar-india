# Preview Customer QA Report

**Timestamp:** 2026-08-07T16:19:36Z  
**Environment:** Vercel Preview (`https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`)  
**Database:** Supabase Staging (`upvsfqufkywlpibbwrse.supabase.co`)

---

## 1. Authentication & Session Verification

- **Hosted Auth Callback:** Server-side callback route `/auth/callback` handles OAuth PKCE and email magic-link code exchange against the hosted staging Supabase Auth service.
- **Unauthenticated Protection:** Direct navigation to `/app`, `/app/matches`, `/app/watchlist`, `/app/tracker`, `/app/notifications`, `/app/settings` enforces HTTP 307 redirect to `/login`.

---

## 2. Multi-Tenant Row-Level Security (RLS) Isolation

- **User A vs. User B Data Boundary:** PostgREST query execution with distinct JWT tokens confirms that customer watchlist items, claim trackers, and matched records are strictly isolated by `auth.uid() = user_id`.
- **Anomalous Access Response:** Cross-user dataset queries return PostgREST HTTP 200 with an empty dataset (`[]`), preventing ID enumeration and row-level leaks.

---

## 3. Billing & Publication Safety Controls

- **Billing UI Gating (`ENABLE_BILLING=false`):** Checkout buttons render upgrade/beta banners instead of initiating external payment flows.
- **Unpublished Record Gating (`AUTO_VERIFY_CLAIMABLES=false`):** Unverified/draft claimable records remain invisible to standard customer API requests.
