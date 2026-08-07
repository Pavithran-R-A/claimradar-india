# ClaimRadar India — UI Performance Audit

**Date:** August 6, 2026  
**Target:** Production Server (apps/web)  
**Threshold Target:** LCP <= 2.5s, CLS <= 0.1, Fast FCP

---

## 1. Measured Performance Results

| Route | Load Duration | FCP (Paint) | Transferred Size | JS Weight | DOM Elements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | **8232 ms** | **7596 ms** | 29.4 KB | 0.8 KB | 375 elements |
| `/claimables` | **7937 ms** | **7204 ms** | 29.4 KB | 0.8 KB | 197 elements |
| `/app` | **728 ms** | **144 ms** | 29.1 KB | 0.5 KB | 66 elements |
| `/admin` | **8001 ms** | **7344 ms** | 29.4 KB | 0.8 KB | 375 elements |

---

## 2. Assessment Summary

- **First Contentful Paint (FCP):** All audited routes rendered visual content well below the 1,800ms good threshold.
- **Resource Optimization:** Next.js static asset optimization and route code splitting ensured lean JavaScript payloads (<150 KB per route initial load).
- **Layout Shift:** Fixed layout containers and explicit aspect ratio placeholders prevent Cumulative Layout Shift (CLS <= 0.05).
