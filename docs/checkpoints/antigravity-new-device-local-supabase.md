# ClaimRadar India — Local Supabase & Device Setup Status

**Date:** August 6, 2026  
**Node Version:** `v24.19.0`  
**Docker Version Probe:** Client `29.6.1`

---

## Local Database Execution Status

| Check                       | Status                      | Evidence / Notes                                                                                                                    |
| :-------------------------- | :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **`DOCKER_ENGINE`**         | `BLOCKED_LOCAL_ENVIRONMENT` | `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.` (`com.docker.service` stopped on Windows host) |
| **`LOCAL_SUPABASE_START`**  | `BLOCKED_LOCAL_ENVIRONMENT` | Blocked until Docker engine is initialized by host system                                                                           |
| **`LOCAL_MIGRATION_RESET`** | `BLOCKED_LOCAL_ENVIRONMENT` | `npx supabase db reset` pending Docker engine                                                                                       |
| **`LOCAL_DB_LINT`**         | `BLOCKED_LOCAL_ENVIRONMENT` | `npx supabase db lint` pending Docker engine                                                                                        |
| **`LOCAL_PGTAP`**           | `BLOCKED_LOCAL_ENVIRONMENT` | `npx supabase test db` pending Docker engine                                                                                        |

---

## Mandatory User Action Required for Local Supabase

> **Open Docker Desktop and wait until the engine reports running.**

Once Docker Desktop shows "Engine Running" in the system tray, execute:

```powershell
$env:PATH = "C:\Users\Pavithran R A\.node24;" + $env:PATH
npx supabase start
npx supabase db reset
npx supabase db lint
npx supabase test db
```
