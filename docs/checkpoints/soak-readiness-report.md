# ClaimRadar India — 48–72h Soak Readiness Report

**Report Generated:** 2026-08-29T16:25:00.000Z  
**Target Environment:** Staging (`qsshiksnyflwsybjyzob`)  
**Soak Schedule:** Every 6 Hours via GitHub Actions (`17 */6 * * *`)  
**Policy Guards:** Hard-Disabled (`ENABLE_BILLING=false`, `AUTO_VERIFY_CLAIMABLES=false`, `NOTIFY_CUSTOMERS_ENABLED=false`, `LIVE_ADAPTERS_ENABLED=true`)

---

## 1. Soak Status

```ini
SOAK_48_72H = PENDING_TIME_SOAK
FIRST_VALID_SOAK_RUN = 33262610772 (GitHub Actions Run, completed in 4m31s)
FIRST_VALID_SOAK_STARTED_AT = 2026-08-29T16:18:43Z
ELAPSED_SOAK_HOURS = 0.2 / 72
TOTAL_SOAK_RUNS_RECORDED = 11
UNEXPECTED_FALSE_POSITIVES = 0
```

> [!NOTE]
> Until 48–72 REAL hours have elapsed under automated scheduled execution, this gate is legitimately recorded as `PENDING_TIME_SOAK`. Run `33258866043` was invalidated and excluded from the soak duration. Run `33262610772` is the verified baseline starting the soak clock.

---

## 2. Elapsed Ingestion & Soak Runs

| Run ID / GHA Run             | Started (UTC)                 | Duration | Sources Succeeded | Docs Discovered | Candidates | Status        |
| :--------------------------- | :---------------------------- | :------- | :---------------- | :-------------- | :--------- | :------------ |
| `abf859db` (GHA 33262610772) | 2026-08-29T16:20:42.597+00:00 | 146s     | 7/7               | 106             | 0          | **completed** |
| `47b0e72f` (Local Staging)   | 2026-08-29T16:16:09.982+00:00 | 122s     | 7/7               | 106             | 0          | **completed** |
| `90d32aa1`                   | 2026-08-29T14:01:13.89+00:00  | 332s     | 7/7               | 106             | 0          | **completed** |
| `0d0881f8`                   | 2026-08-29T13:51:01.065+00:00 | 601s     | 7/7               | 106             | 0          | **completed** |
| `4fc104a2`                   | 2026-08-29T12:06:55.918+00:00 | 28s      | 7/7               | 106             | 0          | **completed** |
| `5a53f54e`                   | 2026-08-29T12:06:20.03+00:00  | 30s      | 7/7               | 106             | 0          | **completed** |
| `401d61ad`                   | 2026-08-29T12:00:14.639+00:00 | 53s      | 7/7               | 106             | 0          | **completed** |
| `0e61ccf1`                   | 2026-08-29T11:22:18.378+00:00 | 28s      | 7/7               | 106             | 0          | **completed** |
| `6d47178a`                   | 2026-08-29T11:21:43.152+00:00 | 30s      | 7/7               | 106             | 0          | **completed** |
| `e86e06d6`                   | 2026-08-29T09:06:31.36+00:00  | 109s     | 7/7               | 106             | 7          | **completed** |
| `4d808cf6`                   | 2026-08-29T09:05:43.71+00:00  | 156s     | 7/7               | 106             | 15         | **completed** |

---

## 3. Invariants Verified Under Soak

- **Hard False Positive Rules Active**: 0 RBI monetary penalties, 0 IBBI Form G resolution applicant notices, 0 generic SEBI orders.
- **Deduplication Parity**: 100% hash and canonical URL deduplication active across runs (106/106 duplicates recognized in live staging).
- **Fail-Closed Staging Safety Guards**: Verified via runtime logging and job summary snapshot:
  - `APP_ENV`: `staging`
  - `AUTO_VERIFY_CLAIMABLES`: `false`
  - `ENABLE_BILLING`: `false`
  - `NOTIFY_CUSTOMERS_ENABLED`: `false`
  - `LIVE_ADAPTERS_ENABLED`: `true`
- **Secret Isolation**: 0 privileged database keys exposed in logs or summary artifacts.
