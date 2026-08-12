# ClaimRadar India — Source Expansion Plan

**Date:** August 12, 2026  
**Target:** 10–15 Healthy Official Indian Sources  
**Focus:** Primary regulatory sources for refunds, compensation, unclaimed funds, consumer redressal, and insolvency claims.

---

## 1. Source Inventory & Health Classification

| Source ID                       | Organization                          | Domain         | Adapter Type | Live Reachable | Classification       | Primary Opportunity Type                 |
| :------------------------------ | :------------------------------------ | :------------- | :----------- | :------------- | :------------------- | :--------------------------------------- |
| `pib-rss`                       | Press Information Bureau              | `pib.gov.in`   | `rss`        | YES (200)      | `HEALTHY_PRODUCTIVE` | Government Relief & Compensation Schemes |
| `sebi-rss`                      | Securities & Exchange Board of India  | `sebi.gov.in`  | `rss`        | YES (200)      | `HEALTHY_PRODUCTIVE` | Investor Refunds & Disgorgement          |
| `rbi-rss`                       | Reserve Bank of India                 | `rbi.org.in`   | `rss`        | YES (200)      | `HEALTHY_PRODUCTIVE` | Banking Ombudsman & Unclaimed Deposits   |
| `generic-rss`                   | W3C News (Test Adapter)               | `w3.org`       | `rss`        | YES (200)      | `HEALTHY_PRODUCTIVE` | Standards / Benchmark Reference          |
| `cci-rss`                       | Competition Commission of India       | `cci.gov.in`   | `rss`        | NO (TLS)       | `DISABLED`           | Untrusted TLS Chain                      |
| **`sebi-orders-rss`**           | SEBI Recovery & Orders                | `sebi.gov.in`  | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Securities Disgorgement & Recovery       |
| **`rbi-notifications-rss`**     | RBI Consumer Directives               | `rbi.org.in`   | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Bank Customer Refund Directives          |
| **`irdai-notices`**             | Insurance Regulatory Authority        | `irdai.gov.in` | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Unclaimed Insurance Policyholder Funds   |
| **`iepf-notices`**              | Investor Education & Protection Fund  | `iepf.gov.in`  | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Dividend & Shares Refund Claims          |
| **`ibbi-public-announcements`** | Insolvency & Bankruptcy Board         | `ibbi.gov.in`  | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Insolvency Creditor & Customer Claims    |
| **`ncdrc-orders`**              | National Consumer Commission          | `ncdrc.nic.in` | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Consumer Compensation Orders             |
| **`dgca-passenger-rights`**     | Directorate General of Civil Aviation | `dgca.gov.in`  | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Airline Passenger Refund Orders          |
| **`mca-circulars`**             | Ministry of Corporate Affairs         | `mca.gov.in`   | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Corporate Deposit Restitution            |
| **`trai-press-releases`**       | Telecom Regulatory Authority          | `trai.gov.in`  | `rss`        | YES (200)      | `NEW_COMMISSIONED`   | Telecom Billing Refund Orders            |

---

## 2. Safety & Provenance Safeguards

- All sources are strictly **official government / regulatory public domain endpoints**.
- Crawl rate limits are capped at `10 requests/min` per source.
- Strict TLS certificate validation enforced (no `NODE_TLS_REJECT_UNAUTHORIZED=0`).
- No personal data or sensitive identifiers are fetched or stored.
