# ClaimRadar India — 48–72h Soak Readiness Report

**Report Generated:** 2026-08-30T12:57:14.352Z  
**Target Environment:** Staging (`qsshiksnyflwsybjyzob`)  
**Soak Schedule:** Every 6 Hours via GitHub Actions (`17 */6 * * *`)  
**Policy Guards:** Hard-Disabled (`ENABLE_BILLING=false`, `AUTO_VERIFY_CLAIMABLES=false`, `NOTIFY_CUSTOMERS_ENABLED=false`)

---

## 1. Frozen Runtime Soak Baseline

```ini
RUNTIME_FREEZE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_BASELINE_GHA_RUN = 33310672900
FINAL_SOAK_BASELINE_HEAD = 02dc1590039c5d052d5f3fa05dac2765fcfb3b07
FINAL_SOAK_START_UTC = 2026-08-30T12:08:03Z
SCHEDULE_INTERVAL_HOURS = 6
```

---

## 2. Final Soak Accounting Status

```ini
SOAK_AUTOMATION = PASS
SOAK_48H = PENDING_TIME_SOAK
SOAK_72H = PENDING_TIME_SOAK

ELAPSED_FINAL_SOAK_HOURS = 0.8 / 72
EXPECTED_FINAL_SOAK_RUNS = 1
VALID_FINAL_SOAK_RUNS = 1
FAILED_FINAL_SOAK_RUNS = 0

SOURCE_SUCCESS_RATE = 100%
UNEXPECTED_FALSE_POSITIVES = 0
POLICY_GUARD_VIOLATIONS = 0

PRE_BASELINE_RUNS_EXCLUDED = 16
PRE_BASELINE_FAILURES_EXCLUDED = 1
```

> [!NOTE]
> Elapsed soak hours are measured from `FINAL_SOAK_START_UTC` (2026-08-30T12:08:03Z). Pre-baseline crawl runs (16 total, including 1 pre-baseline failed experiments) are strictly excluded from final soak qualification.

---

## 3. Validated Ingestion & Soak Runs (Post-Baseline)

| Run ID     | Started (UTC)                 | Duration | Sources Succeeded | Docs Discovered | Candidates | Status        | Scope          |
| :--------- | :---------------------------- | :------- | :---------------- | :-------------- | :--------- | :------------ | :------------- |
| `192c24d3` | 2026-08-30T12:09:55.973+00:00 | 125s     | 7/7               | 106             | 0          | **completed** | **FINAL_SOAK** |

---

## 4. Invariants Verified Under Soak

- **Hard False Positive Rules Active**: 0 RBI monetary penalties, 0 IBBI Form G resolution applicant notices, 0 generic SEBI orders.
- **Deduplication Parity**: 100% hash and canonical URL deduplication active across runs.
- **Fail-Closed Secrets**: 0 exposed privileged keys in browser logs or client bundles.
