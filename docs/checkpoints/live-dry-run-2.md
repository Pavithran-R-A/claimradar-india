# ClaimRadar India — Live Source Audit & Dry-Run Report #2

**Audit Date:** August 5, 2026  
**Environment:** Local Windows PowerShell | Node `v24.18.0` | pnpm `11.18.0`  
**Execution Lead:** Autonomous Software Engineering Agent (Google Antigravity / Gemini 3.6 Flash High)

---

## 1. Executive Summary & Contradiction Resolution

In earlier notes, an execution summary stated "3 out of 3 sources succeeded". This report clarifies the exact live network audit results:

- **SEBI RSS Feed:** ✅ **HTTP 200 OK** (30 documents fetched, Atom description parser verified).
- **RBI Press Releases:** ✅ **HTTP 200 OK** (30 documents fetched, XML entity decoding verified).
- **PIB Press Information Bureau:** ❌ **HTTP 403 Forbidden** (Akamai CDN blocks requests with declared bot User-Agent `ClaimRadarBot/0.1`).
- **Reconciled Result:** 2 out of 3 official live sources succeeded. PIB is classified as `SKIP_EXTERNAL_ACCESS` (CDN access policy restricted for declared crawlers).

---

## 2. Explicit Live Source Audit Table

| Source Key | Adapter Type | Live Endpoint                                           | HTTP Status     | Content Type      | Payload Size | Discovered | Fetched | Unchanged | Duplicates | Health Status    | Category               |
| :--------- | :----------- | :------------------------------------------------------ | :-------------- | :---------------- | :----------- | :--------- | :------ | :-------- | :--------- | :--------------- | :--------------------- |
| `sebi-rss` | Atom/RSS     | `https://www.sebi.gov.in/sebirss.xml`                   | `200 OK`        | `application/xml` | ~45 KB       | 30         | 29      | 29        | 0          | `HEALTHY`        | `PASS`                 |
| `rbi-rss`  | RSS 2.0      | `https://www.rbi.gov.in/rssfeed/pressrelease.xml`       | `200 OK`        | `application/xml` | ~38 KB       | 30         | 30      | 30        | 0          | `HEALTHY`        | `PASS`                 |
| `pib-rss`  | RSS 2.0      | `https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1...` | `403 Forbidden` | `text/html`       | ~391 B       | 0          | 0       | 0         | 0          | `BLOCKED_BY_CDN` | `SKIP_EXTERNAL_ACCESS` |

---

## 3. Compliance & Policy Enforcement

1. **Declared Crawler Identity:** All network calls were made using `ClaimRadarBot/0.1 (+https://claimradar.in/bot)` per `AGENTS.md` transparent user-agent policy.
2. **No User-Agent Spoofing:** ClaimRadar India strictly refrains from disguising crawler requests as commercial web browsers (Googlebot, Chrome, Edge).
3. **No Access Evasion:** No CAPTCHAs, IP proxies, or anti-bot bypass techniques were used.
