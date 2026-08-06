# Checkpoint — Local Live-Source Idempotency (Phase 4B, Section 25)

**Status:** `BLOCKED_LOCAL_ENVIRONMENT` (database-dependent steps)
**Date:** 2026-08-06
**Verifier:** Felix (crawler verification agent)
**Script:** [`scripts/verify-local-live-source-idempotency.mjs`](../../scripts/verify-local-live-source-idempotency.mjs)

---

## 1. Exact Blocker

Local Supabase requires Docker. Docker Desktop was installed during this session but its engine never became ready. Polling was performed per instructions (retries every 30s for 5+ minutes, 15+ attempts total):

```text
docker : request returned 500 Internal Server Error for API route and version
http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.55/info,
check if the server supports the requested API version
```

**Root cause (diagnosed, not guessed):**

- OS: Windows 10 build 19045 with only the **legacy in-box WSL** present.
- `wsl -l -v` and `wsl --set-default-version 2` are unsupported on this install → **WSL2 is not installed**.
- Docker Desktop uses the WSL2 backend; without WSL2 the `docker-desktop` engine distro cannot start, so the engine API persistently returns 500.
- `wsl --install --no-launch --no-distribution` was attempted but hangs — it requires administrator elevation (UAC) that this session cannot provide.

**Unblock path (requires the user, with admin rights):** run `wsl --install` as Administrator (enables WSL2 + Virtual Machine Platform), reboot, then restart Docker Desktop. After that: `npx supabase start` followed by `node scripts/verify-local-live-source-idempotency.mjs` executes the full section-25 window.

---

## 2. What Was Verified Offline (evidence-backed)

| Area                              | Evidence                                                                                                                                                            | Result                                         |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------- |
| Freshness persistence logic       | `apps/crawler/tests/freshness/freshness.test.ts` (14 tests, incl. new Rule 4b / 2b / 9&10b)                                                                         | PASS (offline unit)                            |
| Provenance-safe dedup             | `apps/crawler/tests/deduplication/provenance-dedup.test.ts` (8 tests, incl. Scenario 5 + reversibility)                                                             | PASS (offline unit)                            |
| Full crawler suite                | `pnpm --filter @claimradar/crawler test`                                                                                                                            | 237 tests / 28 files PASS                      |
| Typecheck                         | `pnpm exec tsc --noEmit` in `apps/crawler`                                                                                                                          | exit 0                                         |
| Live dry run (all 4 sources)      | `pnpm crawler:daily -- --live --dry-run`, runId `aa292ec1-dfe0-4450-ae1e-1d2617ccea76`                                                                              | 0 db writes / 0 publications / 0 notifications |
| Idempotency semantics (in-memory) | content-hash + canonical-URL dedup verified in-memory during dry run (31 duplicates skipped, 0 rewrites)                                                            | PASS (in-memory only)                          |
| Local DB ingestion verifier       | `scripts/verify-local-database-ingestion.mjs` fixed to match real `source_documents` schema                                                                         | ready to run once Docker is up                 |
| Section-25 verifier               | `scripts/verify-local-live-source-idempotency.mjs` created with safety guards (local-only URL, refuses if AUTO_VERIFY_CLAIMABLES/ENABLE_BILLING truthy, strict TLS) | ready to run once Docker is up                 |

## 3. What Remains Blocked (DB-dependent)

- `supabase start` / `supabase db reset`
- PostgreSQL ingestion checkpoint (`verify-local-database-ingestion.mjs`)
- **Section-25 live-source idempotency window:** two identical `generic-rss` (W3C) live runs against local Postgres, asserting run 2 creates **0 duplicate rows** across `source_documents`, `content_clusters`, `content_cluster_members`, `candidate_documents`, `claimables`, `claim_evidence`, `claim_sources`, `validation_results`, `ai_runs`, `publication_events`, `notifications`, `notification_delivery_log`
- pgTAP database tests

All blocked keys are recorded honestly as `BLOCKED_LOCAL_ENVIRONMENT` by `scripts/phase-4b-acceptance-runner.mjs` with the exact Docker error above.

## 4. Safety Invariants Held

- `AUTO_VERIFY_CLAIMABLES=false`, `ENABLE_BILLING=false` — never changed.
- TLS verification never disabled; CCI's `UNABLE_TO_VERIFY_LEAF_SIGNATURE` handled by disabling the source, not by weakening TLS.
- PIB 403 accepted honestly; no evasion attempted.
- All dry runs produced 0 writes / 0 publications / 0 notifications.
