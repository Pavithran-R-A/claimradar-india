# ClaimRadar India — Final Hosted E2E Verification Report

**Date:** August 29, 2026  
**Target URL:** `https://claimradar-staging.vercel.app`  
**Overall Status:** PASS (100% routes HTTP 200/30x)  
**Average Latency:** 781ms

---

## 1. Live Route Status Table

| Route                  | HTTP Status | Response Time | Status |
| :--------------------- | :---------- | :------------ | :----- |
| `/`                    | `200`       | 4130ms        | PASS   |
| `/claimables`          | `200`       | 1334ms        | PASS   |
| `/companies`           | `200`       | 1480ms        | PASS   |
| `/sectors`             | `200`       | 713ms         | PASS   |
| `/states`              | `200`       | 744ms         | PASS   |
| `/deadlines`           | `200`       | 546ms         | PASS   |
| `/how-it-works`        | `200`       | 870ms         | PASS   |
| `/pricing`             | `200`       | 621ms         | PASS   |
| `/about`               | `200`       | 535ms         | PASS   |
| `/contact`             | `200`       | 533ms         | PASS   |
| `/faq`                 | `200`       | 942ms         | PASS   |
| `/methodology`         | `200`       | 510ms         | PASS   |
| `/editorial-policy`    | `200`       | 716ms         | PASS   |
| `/terms`               | `200`       | 601ms         | PASS   |
| `/privacy`             | `200`       | 515ms         | PASS   |
| `/disclaimer`          | `200`       | 585ms         | PASS   |
| `/refund-policy`       | `200`       | 550ms         | PASS   |
| `/subscription-policy` | `200`       | 521ms         | PASS   |
| `/acceptable-use`      | `200`       | 516ms         | PASS   |
| `/security`            | `200`       | 520ms         | PASS   |
| `/corrections`         | `200`       | 495ms         | PASS   |
| `/login`               | `200`       | 476ms         | PASS   |
| `/register`            | `200`       | 528ms         | PASS   |
| `/forgot-password`     | `200`       | 303ms         | PASS   |
| `/robots.txt`          | `200`       | 507ms         | PASS   |
| `/sitemap.xml`         | `200`       | 520ms         | PASS   |

---

## 2. Authentication & Admin Route Protection

- `/admin/*` routes automatically redirect unauthenticated users to `/login`.
- `/app/*` authenticated customer routes enforce Supabase session verification.
- `/robots.txt` disallows indexing of admin and auth routes while serving standard sitemap declaration.
- Dynamic `/sitemap.xml` renders XML with UTF-8 encoding and standard URL schema.
