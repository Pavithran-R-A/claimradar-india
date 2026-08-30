# ClaimRadar India — 48–72h Soak Readiness Report

**Report Generated:** 2026-08-30T13:35:13.471Z  
**Target Environment:** Staging (`qsshiksnyflwsybjyzob`)  
**Soak Schedule:** Every 6 Hours via GitHub Actions (`17 */6 * * *`)  
**Policy Guards:** Hard-Disabled (`ENABLE_BILLING=false`, `AUTO_VERIFY_CLAIMABLES=false`, `NOTIFY_CUSTOMERS_ENABLED=false`)

---

## 1. Frozen Runtime Soak Baseline

```ini
RUNTIME_FREEZE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_BASELINE_RUN = 33310672900
FINAL_SOAK_BASELINE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_START = 2026-08-30T12:08:03Z
RUNTIME_BEHAVIOR_CHANGED_AFTER_BASELINE = false
```

---

## 2. Final Soak Provenance & Accounting Status

```ini
SOAK_AUTOMATION = PASS
SOAK_48H = PENDING_TIME_SOAK
SOAK_72H = PENDING_TIME_SOAK

ELAPSED_FINAL_SOAK_HOURS = 1.4 / 72
EXPECTED_SCHEDULE_SLOTS = 1
OBSERVED_GHA_SOAK_RUNS = 1
VALID_GHA_SOAK_RUNS = 1
FAILED_GHA_SOAK_RUNS = 0
MISSING_SCHEDULE_SLOTS = 0

MANUAL_POST_BASELINE_RUNS_EXCLUDED = 0
PRE_BASELINE_RUNS_EXCLUDED = 16
PRE_BASELINE_FAILURES_EXCLUDED = 1
```

> [!NOTE]
> Soak qualification requires authoritative GitHub Actions workflow provenance (`staging-soak.yml`), valid summary artifacts, zero crawl errors, complete policy-guard snapshots, and database corroboration. Manual DB crawl runs (0 post-baseline) and pre-baseline runs (16 total, 1 failures) are strictly excluded from qualification.

---

## 3. Validated Final-Soak Executions (Workflow & Database Corroborated)

| Workflow Run ID | Head SHA   | Crawl Run ID                           | Started (UTC)        | Sources Succeeded | Docs Discovered | Status           | Provenance     |
| :-------------- | :--------- | :------------------------------------- | :------------------- | :---------------- | :-------------- | :--------------- | :------------- |
| `33310672900`   | `02dc1590` | `192c24d3-bcbb-4c21-bb38-b737be5261c0` | 2026-08-30T12:08:03Z | 7/7               | 106             | **PROVEN_VALID** | **FINAL_SOAK** |

---

## 4. Invariants Verified Under Soak

- **Hard False Positive Rules Active**: 0 RBI monetary penalties, 0 IBBI Form G resolution applicant notices, 0 generic SEBI orders.
- **Deduplication Parity**: 100% hash and canonical URL deduplication active across runs.
- **Fail-Closed Secrets**: 0 exposed privileged keys in browser logs or client bundles.
