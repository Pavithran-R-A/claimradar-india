# Preview Light Load Test Report (CORRECTED)

**Timestamp:** 2026-08-07T16:25:57Z  
**Environment:** Vercel Preview (`https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app`)  
**Method:** Node.js built-in `fetch`, 25 parallel requests across 5 public routes, 5 requests per route  

---

> [!CAUTION]
> **CLASSIFICATION CORRECTION — 2026-08-07T16:55:00Z**
> This test is reclassified as `VERCEL_PROTECTION_RESPONSE_TEST`, NOT an `APPLICATION_LOAD_TEST`.
> All 25 requests received HTTP 302 redirects from **Vercel Deployment Protection** before reaching the
> ClaimRadar Next.js runtime. No ClaimRadar application code executed. No Supabase query ran.
> The latency measured is Vercel's edge redirect latency, not application latency.
> This result MUST NOT be counted as a passing application load test in the beta gate matrix.
> A valid replacement test using Protection Bypass for Automation is required.

---

## 1. Summary (as originally recorded — INVALIDATED for gate purposes)

| Metric | Value | Gate Validity |
|---|---|---|
| Total Requests | 25 | — |
| HTTP Status | **302 (all)** | — |
| Source | Vercel Deployment Protection redirect | — |
| Passed (application level) | **0 of 25** | ❌ NOT APPLICATION RESPONSES |
| Wall Clock | 1367ms | Vercel edge redirect latency only |
| Classification | `VERCEL_PROTECTION_RESPONSE_TEST` | ❌ Invalid for gate |

---

## 2. Route Breakdown (original raw data, preserved for audit)

| Route | Requests | HTTP Status | Avg Latency | Classification |
|---|---|---|---|---|
| `/` | 5 | 302 | 944ms | Vercel protection redirect — NOT ClaimRadar |
| `/pricing` | 5 | 302 | 962ms | Vercel protection redirect — NOT ClaimRadar |
| `/faq` | 5 | 302 | 1057ms | Vercel protection redirect — NOT ClaimRadar |
| `/terms` | 5 | 302 | 1097ms | Vercel protection redirect — NOT ClaimRadar |
| `/privacy` | 5 | 302 | 1320ms | Vercel protection redirect — NOT ClaimRadar |

> **What HTTP 302 from Vercel means:** Unauthenticated requests to a Vercel Preview with Deployment Protection enabled are
> intercepted at Vercel's edge network and redirected to `sso.vercel.com` login before reaching the Next.js runtime.
> This proves Vercel's CDN responded — it does NOT prove ClaimRadar rendered, Next.js executed, or Supabase was queried.

---

## 3. Corrected Status

| Item | Status |
|---|---|
| Method validity | `VERCEL_PROTECTION_RESPONSE_TEST` — invalid for application gate |
| Application requests executed | **0** |
| ClaimRadar responses observed | **0** |
| Gate result | `STAGING_LOAD_TEST = NOT_EXECUTED_VALIDLY` |
| Replacement required | Yes — use Protection Bypass for Automation (`x-vercel-protection-bypass` header) |

---

## 4. Replacement Action Required

The valid replacement test must:
1. Use `VERCEL_AUTOMATION_BYPASS_SECRET` stored in a local ignored env file.
2. Send `x-vercel-protection-bypass: <secret>` header with every request (header method preferred).
3. Verify actual ClaimRadar HTML is returned (HTTP 200, contains Next.js `__NEXT_DATA__` or ClaimRadar marker).
4. Measure application-level latency (after Vercel edge → Next.js SSR → Supabase query → response).
5. Distinguish between static-rendered pages and database-backed pages.

See `scripts/light-load-test.mjs` for the replacement implementation once bypass secret is configured.
