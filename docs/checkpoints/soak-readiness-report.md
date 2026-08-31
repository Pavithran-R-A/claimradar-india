# ClaimRadar India — 48–72h Soak Readiness Report

**Report Generated:** 2026-08-31T14:21:08.720Z  
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
DERIVED_FIRST_POST_BASELINE_SLOT = 2026-08-30T12:17:00.000Z
GITHUB_EVIDENCE_STATUS = AVAILABLE
BASELINE_ARTIFACT_VERIFIED = true
RUNTIME_BEHAVIOR_CHANGED_AFTER_BASELINE = false
```

---

## 2. Final Soak Provenance & Schedule Accounting Status

```ini
SOAK_AUTOMATION = PASS
SOAK_48H = PENDING_TIME_SOAK (INSUFFICIENT_ELAPSED_TIME, INSUFFICIENT_VALID_SCHEDULE_RUNS, SCHEDULE_EVIDENCE_NOT_YET_OBSERVED)
SOAK_72H = PENDING_TIME_SOAK (INSUFFICIENT_ELAPSED_TIME, INSUFFICIENT_VALID_SCHEDULE_RUNS, SCHEDULE_EVIDENCE_NOT_YET_OBSERVED)

ELAPSED_FINAL_SOAK_HOURS = 26.2 / 72

EXPECTED_SCHEDULE_SLOTS = 5
SATISFIED_SCHEDULE_SLOTS = 4
PENDING_GRACE_SLOTS = 0
MISSING_SCHEDULE_SLOTS = 1
OBSERVED_SCHEDULE_RUNS = 4
VALID_SCHEDULE_RUNS = 4
FAILED_SCHEDULE_RUNS = 0
SCHEDULE_RUN_COUNT_DEFICIT = 1 (SCHEDULE_NOT_YET_OBSERVED / PENDING evidence)
MAX_INFERRED_SCHEDULE_DELAY_MINUTES = 326.4
MAX_GAP_BETWEEN_VALID_SCHEDULE_RUNS_HOURS = 8.5
LATEST_VALID_SCHEDULE_RUN = 33400053888 (2026-08-31T13:59:52Z)
NEXT_EXPECTED_SCHEDULE_SLOT = 2026-08-31T18:17:00.000Z

OBSERVED_GHA_SOAK_RUNS = 5
VALID_GHA_SOAK_RUNS = 5
FAILED_GHA_SOAK_RUNS = 0

MANUAL_GHA_RUNS_EXCLUDED = 0
MANUAL_DB_RUNS_EXCLUDED = 1
PRE_BASELINE_RUNS_EXCLUDED = 16
PRE_BASELINE_FAILURES_EXCLUDED = 1
```

> [!NOTE]
> Soak qualification is dynamically derived by downloading and corroborating real GitHub Actions artifacts (`staging-soak-summary`) from `.github/workflows/staging-soak.yml` and correlating them with Supabase `crawl_runs`, `crawl_run_sources`, and `crawl_errors`. Baseline GHA run `33310672900` artifact is verified matching crawl run `192c24d3-bcbb-4c21-bb38-b737be5261c0`.

---

## 3. Validated Final-Soak Executions (Workflow & Database Corroborated)

| Workflow Run ID | Event               | Head SHA   | Crawl Run ID                           | Started (UTC)        | Sources Succeeded | Docs Discovered | Status           | Provenance     |
| :-------------- | :------------------ | :--------- | :------------------------------------- | :------------------- | :---------------- | :-------------- | :--------------- | :------------- |
| `33400053888`   | `schedule`          | `6e50c36a` | `b4ee6211-bb70-441e-a756-0d8a953c1003` | 2026-08-31T13:59:52Z | 7/7               | 106             | **PROVEN_VALID** | **FINAL_SOAK** |
| `33361539030`   | `schedule`          | `0d44cc3a` | `96dc7365-41bd-41a3-b71b-998b87adf43c` | 2026-08-31T05:43:25Z | 7/7               | 106             | **PROVEN_VALID** | **FINAL_SOAK** |
| `33335730116`   | `schedule`          | `81605eaf` | `4cba323c-3a90-4706-aabb-26b6f348ad6a` | 2026-08-30T21:11:31Z | 7/7               | 106             | **PROVEN_VALID** | **FINAL_SOAK** |
| `33323325684`   | `schedule`          | `81605eaf` | `a971a8dd-7555-4d27-b222-c25485f93e02` | 2026-08-30T16:45:02Z | 7/7               | 106             | **PROVEN_VALID** | **FINAL_SOAK** |
| `33310672900`   | `workflow_dispatch` | `02dc1590` | `192c24d3-bcbb-4c21-bb38-b737be5261c0` | 2026-08-30T12:08:03Z | 7/7               | 106             | **PROVEN_VALID** | **FINAL_SOAK** |

---

## 4. Nominal Schedule Slot Accounting & Delay Diagnostics

| Nominal Slot (UTC)         | Grace Window Closes (UTC)  | Status        | Assigned Run ID | Run Started At (UTC) | Inferred Delay (min) |
| :------------------------- | :------------------------- | :------------ | :-------------- | :------------------- | :------------------- |
| `2026-08-30T12:17:00.000Z` | `2026-08-30T18:17:00.000Z` | **SATISFIED** | `33323325684`   | 2026-08-30T16:45:02Z | 268 min              |
| `2026-08-30T18:17:00.000Z` | `2026-08-31T00:17:00.000Z` | **SATISFIED** | `33335730116`   | 2026-08-30T21:11:31Z | 174.5 min            |
| `2026-08-31T00:17:00.000Z` | `2026-08-31T06:17:00.000Z` | **SATISFIED** | `33361539030`   | 2026-08-31T05:43:25Z | 326.4 min            |
| `2026-08-31T06:17:00.000Z` | `2026-08-31T12:17:00.000Z` | **MISSING**   | None            | N/A                  | N/A                  |
| `2026-08-31T12:17:00.000Z` | `2026-08-31T18:17:00.000Z` | **SATISFIED** | `33400053888`   | 2026-08-31T13:59:52Z | 102.9 min            |

---

## 5. Invariants Verified Under Soak

- **Hard False Positive Rules Active**: 0 RBI monetary penalties, 0 IBBI Form G resolution applicant notices, 0 generic SEBI orders.
- **Deduplication Parity**: 100% hash and canonical URL deduplication active across runs.
- **Fail-Closed Secrets**: 0 exposed privileged keys in browser logs or client bundles.
- **Publication Corroboration**: PUBLICATION_DB_CORROBORATION = NOT_AVAILABLE, SUMMARY_RECORDS_PUBLISHED = 0 (Policy guard ENABLE_BILLING=false, AUTO_VERIFY_CLAIMABLES=false active).
