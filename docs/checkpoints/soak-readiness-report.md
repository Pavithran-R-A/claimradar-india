# ClaimRadar India — 48–72h Soak Readiness Report

**Report Generated:** 2026-08-30T16:00:37.442Z  
**Target Environment:** Staging (`qsshiksnyflwsybjyzob`)  
**Soak Schedule:** Every 6 Hours via GitHub Actions (`17 */6 * * *`)  
**Policy Guards:** Hard-Disabled (`ENABLE_BILLING=false`, `AUTO_VERIFY_CLAIMABLES=false`, `NOTIFY_CUSTOMERS_ENABLED=false`)

---

## 1. Frozen Runtime Soak Baseline

```ini
RUNTIME_FREEZE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_BASELINE_RUN = 33310672900
FINAL_SOAK_BASELINE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_BASELINE_CRAWL_RUN = 192c24d3-bcbb-4c21-bb38-b737be5261c0
FINAL_SOAK_START = 2026-08-30T12:08:03Z
FIRST_POST_BASELINE_SCHEDULED_SLOT = 2026-08-30T18:17:00Z
GITHUB_EVIDENCE_STATUS = AVAILABLE
BASELINE_ARTIFACT_VERIFIED = true
RUNTIME_BEHAVIOR_CHANGED_AFTER_BASELINE = false
```

---

## 2. Final Soak Provenance & Schedule Accounting Status

```ini
SOAK_AUTOMATION = PASS
SOAK_48H = PENDING_TIME_SOAK
SOAK_72H = PENDING_TIME_SOAK

ELAPSED_FINAL_SOAK_HOURS = 3.8 / 72

DUE_SCHEDULE_SLOTS = 0
SATISFIED_SCHEDULE_SLOTS = 0
PENDING_GRACE_SLOTS = 0
MISSING_SCHEDULE_SLOTS = 0

OBSERVED_GHA_SOAK_RUNS = 1
VALID_GHA_SOAK_RUNS = 1
FAILED_GHA_SOAK_RUNS = 0

MANUAL_GHA_RUNS_EXCLUDED = 0
MANUAL_DB_RUNS_EXCLUDED = 0
PRE_BASELINE_RUNS_EXCLUDED = 16
PRE_BASELINE_FAILURES_EXCLUDED = 1
```

> [!NOTE]
> Soak qualification is dynamically derived by downloading and corroborating real GitHub Actions artifacts (`staging-soak-summary`) from `.github/workflows/staging-soak.yml` and correlating them with Supabase `crawl_runs`, `crawl_run_sources`, and `crawl_errors`. Baseline GHA run `33310672900` artifact is verified matching crawl run `192c24d3-bcbb-4c21-bb38-b737be5261c0`.

---

## 3. Validated Final-Soak Executions (Workflow & Database Corroborated)

| Workflow Run ID | Event               | Head SHA   | Crawl Run ID                           | Started (UTC)        | Sources Succeeded | Docs Discovered | Status           | Provenance     |
| :-------------- | :------------------ | :--------- | :------------------------------------- | :------------------- | :---------------- | :-------------- | :--------------- | :------------- |
| `33310672900`   | `workflow_dispatch` | `02dc1590` | `192c24d3-bcbb-4c21-bb38-b737be5261c0` | 2026-08-30T12:08:03Z | 7/7               | 106             | **PROVEN_VALID** | **FINAL_SOAK** |

---

## 4. Invariants Verified Under Soak

- **Hard False Positive Rules Active**: 0 RBI monetary penalties, 0 IBBI Form G resolution applicant notices, 0 generic SEBI orders.
- **Deduplication Parity**: 100% hash and canonical URL deduplication active across runs.
- **Fail-Closed Secrets**: 0 exposed privileged keys in browser logs or client bundles.
- **Publication Corroboration**: PUBLICATION_DB_CORROBORATION = NOT_AVAILABLE, SUMMARY_RECORDS_PUBLISHED = 0 (Policy guard ENABLE_BILLING=false, AUTO_VERIFY_CLAIMABLES=false active).
