# ClaimRadar India — 48–72h Soak Readiness Report

**Report Generated:** 2026-08-31T16:44:52.052Z  
**Target Environment:** Staging (`qsshiksnyflwsybjyzob`)  
**Soak Schedule:** Every 6 Hours via GitHub Actions (`17 */6 * * *`)  
**Policy Guards:** Hard-Disabled (`ENABLE_BILLING=false`, `AUTO_VERIFY_CLAIMABLES=false`, `NOTIFY_CUSTOMERS_ENABLED=false`)

---

## 1. Frozen Runtime Soak Baseline

```ini
RUNTIME_FREEZE_HEAD = 3d0b4a555ed2fcc7d511f730a316611c52b2a008
FINAL_SOAK_BASELINE_RUN = 33414698684
FINAL_SOAK_BASELINE_HEAD = 3d0b4a555ed2fcc7d511f730a316611c52b2a008
FINAL_SOAK_BASELINE_CRAWL_RUN = fce1e5b4-65a3-4e76-a469-6ffc2b7d76e0
FINAL_SOAK_START = 2026-08-31T16:32:47Z
DERIVED_FIRST_POST_BASELINE_SLOT = 2026-08-31T18:17:00.000Z
GITHUB_EVIDENCE_STATUS = AVAILABLE
BASELINE_ARTIFACT_VERIFIED = true
RUNTIME_BEHAVIOR_CHANGED_AFTER_BASELINE = false
```

---

## 2. Final Soak Provenance & Schedule Accounting Status

```ini
SOAK_AUTOMATION = PASS
SOAK_48H = PENDING_TIME_SOAK (INSUFFICIENT_ELAPSED_TIME, INSUFFICIENT_VALID_SCHEDULE_RUNS)
SOAK_72H = PENDING_TIME_SOAK (INSUFFICIENT_ELAPSED_TIME, INSUFFICIENT_VALID_SCHEDULE_RUNS)

ELAPSED_FINAL_SOAK_HOURS = 0.2 / 72

EXPECTED_SCHEDULE_SLOTS = 0
SATISFIED_SCHEDULE_SLOTS = 0
PENDING_GRACE_SLOTS = 0
MISSING_SCHEDULE_SLOTS = 0
OBSERVED_SCHEDULE_RUNS = 0
VALID_SCHEDULE_RUNS = 0
FAILED_SCHEDULE_RUNS = 0
SCHEDULE_RUN_COUNT_DEFICIT = 0 (SCHEDULE_NOT_YET_OBSERVED / PENDING evidence)
MAX_INFERRED_SCHEDULE_DELAY_MINUTES = 0
MAX_GAP_BETWEEN_VALID_SCHEDULE_RUNS_HOURS = 0
LATEST_VALID_SCHEDULE_RUN = 33414698684 (2026-08-31T16:32:47Z)
NEXT_EXPECTED_SCHEDULE_SLOT = 2026-08-31T18:17:00.000Z

OBSERVED_GHA_SOAK_RUNS = 1
VALID_GHA_SOAK_RUNS = 1
FAILED_GHA_SOAK_RUNS = 0

MANUAL_GHA_RUNS_EXCLUDED = 0
MANUAL_DB_RUNS_EXCLUDED = 0
PRE_BASELINE_RUNS_EXCLUDED = 22
PRE_BASELINE_FAILURES_EXCLUDED = 1
```

> [!NOTE]
> Soak qualification is dynamically derived by downloading and corroborating real GitHub Actions artifacts (`staging-soak-summary`) from `.github/workflows/staging-soak.yml` and correlating them with Supabase `crawl_runs`, `crawl_run_sources`, and `crawl_errors`. Baseline GHA run `33310672900` artifact is verified matching crawl run `192c24d3-bcbb-4c21-bb38-b737be5261c0`.

---

## 3. Validated Final-Soak Executions (Workflow & Database Corroborated)

| Workflow Run ID | Event               | Head SHA   | Crawl Run ID                           | Started (UTC)        | Sources Succeeded | Docs Discovered | Status           | Provenance     |
| :-------------- | :------------------ | :--------- | :------------------------------------- | :------------------- | :---------------- | :-------------- | :--------------- | :------------- |
| `33414698684`   | `workflow_dispatch` | `3d0b4a55` | `fce1e5b4-65a3-4e76-a469-6ffc2b7d76e0` | 2026-08-31T16:32:47Z | 7/7               | 126             | **PROVEN_VALID** | **FINAL_SOAK** |

---

## 4. Nominal Schedule Slot Accounting & Delay Diagnostics

| Nominal Slot (UTC) | Grace Window Closes (UTC) | Status | Assigned Run ID | Run Started At (UTC) | Inferred Delay (min)        |
| :----------------- | :------------------------ | :----- | :-------------- | :------------------- | :-------------------------- |
| None               | N/A                       | N/A    | N/A             | N/A                  | No schedule slots generated |

---

## 5. Invariants Verified Under Soak

- **Hard False Positive Rules Active**: 0 RBI monetary penalties, 0 IBBI Form G resolution applicant notices, 0 generic SEBI orders.
- **Deduplication Parity**: 100% hash and canonical URL deduplication active across runs.
- **Fail-Closed Secrets**: 0 exposed privileged keys in browser logs or client bundles.
- **Publication Corroboration**: PUBLICATION_DB_CORROBORATION = NOT_AVAILABLE, SUMMARY_RECORDS_PUBLISHED = 0 (Policy guard ENABLE_BILLING=false, AUTO_VERIFY_CLAIMABLES=false active).
