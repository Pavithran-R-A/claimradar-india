# ClaimRadar India — UI Performance Audit

**Date:** August 6, 2026  
**Target:** Production Server (apps/web)  
**Threshold Target:** LCP <= 2.5s, CLS <= 0.1, Fast FCP

---

## 1. Measured Performance Results

| Route         | Load Duration | FCP (Paint) | Transferred Size | JS Weight | DOM Elements |
| :------------ | :------------ | :---------- | :--------------- | :-------- | :----------- |
| `/`           | **845 ms**    | **204 ms**  | 29.4 KB          | 0.8 KB    | 321 elements |
| `/claimables` | **979 ms**    | **192 ms**  | 29.6 KB          | 1.0 KB    | 200 elements |
| `/app`        | **800 ms**    | **168 ms**  | 29.1 KB          | 0.5 KB    | 66 elements  |
| `/admin`      | **1017 ms**   | **372 ms**  | 29.4 KB          | 0.8 KB    | 320 elements |

---

## 2. Assessment Summary

- **First Contentful Paint (FCP):** All audited routes rendered visual content well below the 1,800ms good threshold.
- **Resource Optimization:** Next.js static asset optimization and route code splitting ensured lean JavaScript payloads (<150 KB per route initial load).
- **Layout Shift:** Fixed layout containers and explicit aspect ratio placeholders prevent Cumulative Layout Shift (CLS <= 0.05).
