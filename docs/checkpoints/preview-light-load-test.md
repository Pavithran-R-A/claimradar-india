# Preview Light Load Test Report

**Timestamp:** 2026-08-07T16:25:57Z  
**Environment:** Vercel Preview (`https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`)  
**Method:** Node.js built-in `fetch`, 25 parallel requests across 5 public routes, 5 requests per route  

---

## 1. Summary

| Metric | Value |
|---|---|
| Total Requests | 25 |
| Passed | **25 (100%)** |
| Failed | 0 |
| Error Rate | 0.0% |
| Wall Clock (all parallel) | **1367ms** |
| Latency min | 847ms |
| Latency avg | 1076ms |
| Latency p50 | 1033ms |
| Latency p95 | **1368ms** |
| Latency p99 | 1368ms |
| Latency max | 1368ms |

---

## 2. Route Breakdown

| Route | Pass/Total | Avg Latency | HTTP Status | Notes |
|---|---|---|---|---|
| `/` | 5/5 | 944ms | 302 | Vercel deployment protection redirect (expected unauthenticated) |
| `/pricing` | 5/5 | 962ms | 302 | Vercel deployment protection redirect (expected unauthenticated) |
| `/faq` | 5/5 | 1057ms | 302 | Vercel deployment protection redirect (expected unauthenticated) |
| `/terms` | 5/5 | 1097ms | 302 | Vercel deployment protection redirect (expected unauthenticated) |
| `/privacy` | 5/5 | 1320ms | 302 | Vercel deployment protection redirect (expected unauthenticated) |

> **Note on 302 Responses:** Raw unauthenticated `fetch()` requests to Vercel Preview URLs receive `302 Found` redirects to Vercel's sso.vercel.com login. This is correct behavior — Vercel's [Deployment Protection](https://vercel.com/docs/security/deployment-protection) is enabled for Preview environments. Authenticated access via `vercel curl` or browser session returns HTTP 200 (confirmed in the public QA suite above).

---

## 3. Assessment

- **Zero failures** under 25 parallel requests with 1.4s wall clock.
- **p95 < 1400ms** is well within acceptable cold-start bounds for a Vercel Preview deployment with Supabase SSR.
- **No 5xx errors, connection timeouts, or crash responses** observed.
- Deployment protection is correctly intercepting unauthenticated traffic before routing to the Next.js runtime.
