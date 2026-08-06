# ClaimRadar India — New Laptop Local Reproduction Checkpoint

**Date:** August 6, 2026
**Executed By:** Qoder agent (Task #2 — reproduce reported local baseline on new laptop)
**Repo Root:** `C:\Users\LENOVO\Downloads\chat-11\chat-1`
**Execution Environment:** Windows 22H2, PowerShell 5.1 (`;` separator), no commits made, migrations 001–009 untouched

---

## 1. Tool Versions

| Tool                     | Expected   | Recorded                                                                                                                                                                                                                          | Status         |
| :----------------------- | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- |
| `node --version`         | `>=24 <25` | `v24.19.0` (portable install, see Repair R1)                                                                                                                                                                                      | ✅ PASS        |
| `pnpm --version`         | `11`       | `11.20.0` (installed via `npm install -g pnpm@11`)                                                                                                                                                                                | ✅ PASS        |
| `docker version`         | —          | Client `29.6.2` (API 1.55, Go 1.26.5, windows/amd64); **engine unavailable** — `docker info` → `request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.55/info` | ⚠️ ENGINE DOWN |
| `npx supabase --version` | —          | `2.111.0`                                                                                                                                                                                                                         | ✅ PASS        |

Root cause of Docker engine failure: **WSL is not installed on this laptop** (`wsl --status` / `wsl -l -v` show only the inbox stub printing install-usage help). Docker Desktop (installed at `%LOCALAPPDATA%\Programs\DockerDesktop`) cannot start its Linux VM without the WSL2 backend. A full Docker Desktop restart (stop all `Docker Desktop` / `com.docker.backend` processes, relaunch, wait > 60 s) did not resolve it. Enabling WSL requires admin elevation (`wsl --install`) and likely a reboot — out of scope for this reproduction run.

---

## 2. Dependency Install

| Command                          | Exit Code | Key Output                                                                                                                                                                                                                                       |
| :------------------------------- | :-------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` |   **0**   | `Scope: all 11 workspace projects`; `Lockfile is up to date, resolution step is skipped`; `Lockfile passes supply-chain policies (562 entries in 2.5s)`; `Done in 3.3s using pnpm v11.20.0`. No lockfile mismatch; lockfile **not** regenerated. |

---

## 3. Sequential Verification Gates

Run order exactly as specified. Final state is **all green**.

| #   | Command                          |      Exit Code (final)       | Result                                                                                                                                                                                           |
| :-- | :------------------------------- | :--------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `pnpm format`                    |   **0** (after Repair R2)    | `All matched files use Prettier code style!` First run: exit 1, code style issues in **25 files**.                                                                                               |
| 2   | `pnpm lint`                      |            **0**             | ESLint clean, **0 errors / 0 warnings** on final runs. First run: exit 1 with 2 errors (see Repairs R3).                                                                                         |
| 3   | `pnpm typecheck`                 |            **0**             | `tsc --noEmit` passed for **10 of 11 workspace projects** (all packages with a `typecheck` script).                                                                                              |
| 4   | `pnpm test`                      |            **0**             | **36 test files passed (36)**; **348 tests passed (348)**; Duration 37.57 s. Later runs after concurrent test additions: **353 tests**.                                                          |
| 5   | `pnpm test:inventory-acceptance` |   **0** (after Repair R4)    | **28 test files passed (28)**; **237 tests passed (237)**; Duration 28.87 s.                                                                                                                     |
| 6   | `pnpm build`                     |            **0**             | All workspace packages compiled; Next.js 15.5.22 production build: `✓ Generating static pages (44/44)`; **49 routes** in the Route (app) table.                                                  |
| 7   | `pnpm test:phase-4b-offline`     | **0** (after Repairs R2, R5) | Full chain `format && lint && typecheck && test && build` green: format clean, lint 0 problems, typecheck done, **36 test files / 353 tests passed**, build `44/44` static pages, **49 routes**. |

### Recorded counts (final successful runs)

- Unit suite (`pnpm test`): **36 test files**, **353 tests**, 0 failures, 0 skipped.
- Inventory acceptance (`pnpm test:inventory-acceptance`): **28 test files**, **237 tests**, 0 failures.
- Next.js build: **44 static pages generated**, **49 app routes** (ends `└ ƒ /verify-email`).
- Lint warnings/errors on green run: **0 / 0**.

---

## 4. Database (Supabase) Steps — BLOCKED_LOCAL_ENVIRONMENT

| Command                      | Status                               | Exact Error / Note                                                                                                                                                                                                                                           |
| :--------------------------- | :----------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx supabase start`         | ❌ BLOCKED_LOCAL_ENVIRONMENT, exit 1 | `failed to inspect container health: request returned 500 Internal Server Error for API route and version http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.55/containers/supabase_db_chat-1/json, check if the server supports the requested API version` |
| `npx supabase status`        | ❌ BLOCKED_LOCAL_ENVIRONMENT, exit 1 | Same 500 error (`containers/supabase_db_chat-1/json`).                                                                                                                                                                                                       |
| `npx supabase db reset` (×2) | NOT_EXECUTED                         | Blocked by engine unavailability.                                                                                                                                                                                                                            |
| `npx supabase db lint`       | NOT_EXECUTED                         | Blocked by engine unavailability.                                                                                                                                                                                                                            |
| `npx supabase test db`       | NOT_EXECUTED                         | Blocked by engine unavailability.                                                                                                                                                                                                                            |

pgTAP inventory (static, from `supabase/tests/`):

- **8 pgTAP test files**: `001_schema.test.sql`, `002_public_rls.test.sql`, `003_user_rls.test.sql`, `004_staff_rls.test.sql`, `005_ingestion_rls.test.sql`, `006_role_escalation.test.sql`, `007_deduplication_constraints.test.sql`, `008_freshness_schema.test.sql`.
- **Assertion count: not determinable** (tests cannot execute without the Docker engine). Static scan counts **37 pgTAP assertion calls** (`ok`, `is`, `has_table`, …) as a reference lower bound.

Unblock path: install/repair WSL2 (`wsl --install` in an elevated shell, likely reboot), confirm Docker Desktop engine starts, then re-run the five Supabase commands above.

### Retry after WSL2 install (August 6, 2026, ~16:20 local)

User installed WSL2 and rebooted. Re-poll of `docker info` (20 s interval, > 3 min window) **still failed** — all five Supabase commands remain `BLOCKED_LOCAL_ENVIRONMENT`.

- `wsl --status`: WSL now present, **Default Version: 2** (previously the inbox stub).
- `wsl -l -v`: **no installed distributions** (Docker Desktop's `docker-desktop` distro not yet registered).
- Docker Desktop UI/backend processes running (started ~16:17), but the engine returns:
  - `docker info` → `ERROR: Error response from daemon: Docker Desktop is unable to start` (exit 1).
- No WSL repair attempted (per run instructions); next unblock step is to let/restart Docker Desktop so it registers its `docker-desktop` WSL distribution, then re-run the five Supabase commands above.

---

## 5. Repairs Performed (minimal, no architecture changes)

| #   | Repair                                                                                                                                                                                                                                                                                                                                                                                                                  | Justification                                                                                                          |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| R1  | **Bootstrapped toolchain**: no Node.js/pnpm existed on the laptop (winget installs hung awaiting UAC elevation). Downloaded official Node `v24.19.0` win-x64 portable zip from nodejs.org into `c:\Users\LENOVO\Downloads\chat-11\toolchain\` (outside the repo) and installed `pnpm@11` globally via the bundled npm.                                                                                                  | Environment prerequisite; satisfies `engines: node >=24 <25`, pnpm 11.                                                 |
| R2  | **`pnpm format:fix`** (Prettier `--write`) — twice: first over 25 unformatted files, later over 9 newly added unformatted files.                                                                                                                                                                                                                                                                                        | The `format` gate failed; Prettier reformat is the canonical, non-behavioral fix. No logic changed.                    |
| R3  | **Lint**: first run flagged (a) `.review-repo-old.ts` parse error (untracked scratch review artifact at repo root, outside any tsconfig) and (b) unused `formatIstDate` import in `apps/web/app/(public)/page.tsx`. Before any edit, both conditions were resolved in the working tree (the import no longer exists in the file; subsequent `pnpm lint` runs exit 0). **No source edit was made by this run for lint.** | Observed state change between runs; final lint is green and reproducible (re-verified inside `test:phase-4b-offline`). |
| R4  | **Flaky acceptance-runner retry**: first `test:inventory-acceptance` exited 1 with `Unhandled Rejection: Worker exited unexpectedly` (tinypool worker exit) **after all shown test files passed**; immediate re-run exited 0.                                                                                                                                                                                           | Transient Windows/worker flake, not a test failure; no test deleted or altered.                                        |
| R5  | **Deleted stale `apps/web/.next` cache** after `next build` failed with `ENOENT ... rename '.next\export\500.html' -> '.next\server\pages\500.html'`; rebuild then succeeded.                                                                                                                                                                                                                                           | Corrupt/stale incremental build cache; deleting build output is safe and standard.                                     |

**Not performed / not needed:** no test deletions, no changes to migrations 001–009 (or any migration), no app-source logic changes, no lockfile regeneration, nothing committed.

---

## 6. Safety Flags Verification

Mandatory flags were never enabled and remain safe:

- `apps/web/.env` contains **no** `AUTO_VERIFY_CLAIMABLES`, `ENABLE_BILLING`, or `NEXT_PUBLIC_ENABLE_BILLING` entries that enable anything.
- `apps/web/env.ts` transforms `NEXT_PUBLIC_ENABLE_BILLING` to `true` **only** when the literal string is `'true'`; unset ⇒ `false`.
- No env var was set or exported by this run enabling auto-verification or billing.

---

## 7. Remaining Blockers

1. **Docker engine / WSL2** — all Supabase local steps (`start`, `status`, `db reset` ×2, `db lint`, `test db`) remain `BLOCKED_LOCAL_ENVIRONMENT`. WSL2 is now installed (default version 2) after user action + reboot, but the Docker Desktop engine still fails to start (`Docker Desktop is unable to start`); `wsl -l -v` shows no registered distros yet. Next step: restart Docker Desktop so it registers its WSL distribution, then re-run the database steps.
2. **Concurrent repo activity** — during this run, unformatted new files periodically appeared in the working tree (e.g., `apps/web/app/(public)/claimables/*`, `scripts/verify-local-live-source-idempotency.mjs`), causing intermittent `format`/`build` gate failures. Each was resolved with `format:fix` and a re-run; if concurrent editing continues, re-run `pnpm format:fix` before gating.

---

## 8. Baseline Verdict

**Application baseline fully reproduced on the new laptop**: install → format → lint → typecheck → unit tests (36 files / 353 tests) → inventory acceptance (28 files / 237 tests) → production build (49 routes, 44 static pages) → `test:phase-4b-offline` composite gate all **exit 0**. Database baseline **not yet reproducible locally** due to the missing WSL2/Docker engine (single environment blocker, documented above).
