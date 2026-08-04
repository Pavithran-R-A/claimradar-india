# ClaimRadar India — Local Supabase Verification Audit

**Audit Date:** August 5, 2026  
**Environment:** Local Windows PowerShell | Docker `29.6.1` (Client) | Supabase CLI `2.111.0` (npx)

---

## 1. Tool & Environment Detection

| Tool                       | Detection Command        | Status       | Details                                                                                                    |
| :------------------------- | :----------------------- | :----------- | :--------------------------------------------------------------------------------------------------------- |
| **Docker Client**          | `docker --version`       | ✅ AVAILABLE | Docker version 29.6.1, build 8900f1d                                                                       |
| **Docker Engine / Daemon** | `docker info`            | ⚠️ STOPPED   | Docker Desktop daemon is not currently running (`open //./pipe/dockerDesktopLinuxEngine: file not found`). |
| **Supabase CLI**           | `npx supabase --version` | ✅ AVAILABLE | Supabase CLI v2.111.0                                                                                      |

---

## 2. Local Database Verification Status

- **Status:** `SKIP_CREDENTIALS / LOCAL_DAEMON_STOPPED`
- **Blocker Reason:** The Docker Desktop daemon service is stopped on the host environment. Starting the local containerized Supabase PostgreSQL stack requires starting the Docker Desktop engine service on the host.
- **Action Required for Local Migration Execution:**
  1. Start Docker Desktop application on host OS.
  2. Run `npx supabase start` to launch local containers (PostgreSQL 15, GoTrue Auth, Realtime, Storage, Kong Gateway).
  3. Run `npx supabase db reset` to apply all 8 migrations sequentially from empty database state.
  4. Run `npx supabase test db` to execute RLS and table policy test suites.
