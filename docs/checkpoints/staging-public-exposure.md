# ClaimRadar India — Staging Public Exposure Verification Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Web Routes connected to Supabase (`upvsfqufkywlpibbwrse`)

---

## 1. Verified Public Routes

The following public directory routes were tested against staging database queries:

- `/claimables`
- `/claimables/[slug]`
- `/companies`
- `/companies/[slug]`
- `/new`
- `/closing-soon`
- `/deadlines`
- `/sectors`
- `/sectors/[slug]`

---

## 2. Public Data Exposure Invariants

- **Published Rows Only:** Only rows with `publication_status = 'published'` are visible to anonymous callers.
- **Hidden Internal Data:** Draft claimables, rejected candidates, raw AI extractions, staff notes, and audit logs are 100% hidden.
- **Closing Soon Filter:** Excludes expired claimables (`deadline < now()`).
- **No Fictional Fallbacks:** API errors return proper error components rather than generating hardcoded fictional claimables.
