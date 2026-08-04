# ClaimRadar India — Local Supabase Verification Audit

**Audit Date:** August 5, 2026  
**Environment:** Local Windows PowerShell | Docker `29.6.1` (Client) | Supabase CLI `2.111.0` (npx) | WSL 2 Installed

---

## 1. Tool & Environment Detection

| Tool                       | Detection Command        | Status                          | Details                                                                                                                                                      |
| :------------------------- | :----------------------- | :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Docker Executable**      | Candidate check          | ✅ FOUND                        | Located at `C:\Program Files\Docker\Docker\Docker Desktop.exe`                                                                                               |
| **WSL 2 Engine**           | `wsl -l -v`              | ✅ INSTALLED                    | Distributions `Ubuntu` (v2, Stopped) and `docker-desktop` (v2, Stopped)                                                                                      |
| **Docker Engine / Daemon** | `docker info`            | ⚠️ UNJOINED / NAMED PIPE CLOSED | Daemon stopped (`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine: open //./pipe/dockerDesktopLinuxEngine: file not found`). |
| **Supabase CLI**           | `npx supabase --version` | ✅ AVAILABLE                    | Supabase CLI v2.111.0                                                                                                                                        |

---

## 2. Local Database Verification Status

- **Status Classification:** `BLOCKED_LOCAL_ENVIRONMENT`
- **Blocker Rationale:** Executable `Start-Process` launched Docker Desktop, but the Windows named pipe requires an interactive user desktop session to initialize WSL 2 Linux engine sockets. Per project governance rules, credentials are not the issue; local container environment startup is blocked by host system interactive session constraints.
- **Action Plan for Interactive Execution:**
  1. Complete interactive Docker Desktop engine initialization in host desktop session.
  2. Run `npx supabase start` to launch local containers (PostgreSQL 15, GoTrue Auth, Realtime, Storage, Kong Gateway).
  3. Run `npx supabase db reset` to apply all migrations sequentially from zero state.
  4. Run `npx supabase test db` to execute pgTAP RLS and table policy test suites.
