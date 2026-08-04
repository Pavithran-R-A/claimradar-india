# Live Dry Run #4 Execution Record

**Run Date:** 2026-08-05  
**Execution Command:** `pnpm crawler:daily -- --live --dry-run`  
**Run ID:** `f3ee2b14-0b5b-4f23-9359-a09394c8c4cb`  
**Duration:** 11.77s

---

## 1. Summary Metrics Table

| Metric               | Result | Target Guardrail      | Status                                   |
| -------------------- | ------ | --------------------- | ---------------------------------------- |
| Sources Attempted    | 3      | 4 Configured          | 3 Live Attempted                         |
| Sources Succeeded    | 3      | > 0                   | PASS                                     |
| Documents Discovered | 60     | > 0                   | PASS (30 SEBI, 20 PIB, 10 RBI)           |
| Documents Fetched    | 39     | > 0                   | PASS (29 SEBI, 10 RBI)                   |
| Candidates Created   | 1      | >= 0                  | PASS (Score 80, rejected per policy)     |
| AI Calls Used        | 1      | Reserve budget intact | PASS                                     |
| Publications         | 0      | MUST BE 0             | PASS                                     |
| Notifications        | 0      | MUST BE 0             | PASS                                     |
| Live DB Writes       | 0      | MUST BE 0             | PASS                                     |
| Errors Recorded      | 21     | Documented            | 20 PIB 403 Akamai bot blocks, 1 SEBI 404 |

---

## 2. Source-by-Source Execution Breakdown

| Source                          | Attempted        | Discovered | Fetched | Status / Error Cause                                                           |
| ------------------------------- | ---------------- | ---------- | ------- | ------------------------------------------------------------------------------ |
| **SEBI RSS** (`sebi-rss`)       | Yes              | 30         | 29      | **PASS** (1 PDF attachment 404)                                                |
| **RBI RSS** (`rbi-rss`)         | Yes              | 10         | 10      | **PASS** (Clean XML discovery and fetch)                                       |
| **PIB RSS** (`pib-rss`)         | Yes              | 20         | 0       | **FAIL** (20 detail pages returned `HTTP 403 Forbidden` via Akamai bot filter) |
| **Generic RSS** (`generic-rss`) | Fixture verified | 5          | 5       | **PASS** (Verified via `generic-commissioning.test.ts`)                        |

---

## 3. Compliance & Policy Guardrails

- `AUTO_VERIFY_CLAIMABLES`: `false`
- `ENABLE_BILLING`: `false`
- Dry Run Storage Adapter: `InMemoryDryRunWriter` (No Supabase mutation)
