# ClaimRadar India — Staging Source & Claim Freshness Verification Report

**Version:** 2.0.0  
**Date:** August 7, 2026  
**Status:** PASS  
**Target:** Staging Supabase Database (`upvsfqufkywlpibbwrse`)

---

## 1. Executive Summary

Source freshness state tracking, claim verification timestamps, and failure isolation rules were verified against the hosted staging database (`008_freshness_schema.test.sql` & `tests/freshness/freshness.test.ts`).

---

## 2. Stored Source Freshness State Fields

The following persistent fields in `sources` were verified:

- `last_run_at`
- `last_success_at`
- `last_content_change_at`
- `failure_count`
- `metadata->'last_error_category'`
- `metadata->'health_state'`

---

## 3. Claim Freshness & Legal Safety Controls

- `last_verified_at` and `deadline_verified_at` track exact human verification timestamps.
- **Source Failure Isolation Rule:** A temporary or repeated network retrieval failure against a source **NEVER** closes a claim, alters legal status, erases evidence, or invents a fictional deadline.

---

## 4. Test Results

- Unit Freshness Rules: `tests/freshness/freshness.test.ts` → **PASS**
- Schema Constraints: `supabase/tests/008_freshness_schema.test.sql` → **PASS**
- Staging Verification: **PASS**
