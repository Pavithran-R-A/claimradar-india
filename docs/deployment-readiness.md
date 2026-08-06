# Deployment Readiness — Credential-Free Operations Prep

**Last Updated:** August 6, 2026
**Scope:** What is ready now, what is blocked, and exactly what external inputs unblock scheduled operations.

---

## 1. Current state

The repository is prepared for hosted operations **as far as local control
allows**. All three GitHub Actions workflows (`ci.yml`, `daily-crawl.yml`,
`source-health.yml`) are audited and syntactically valid; the crawler has
structured logging, run summaries, failure categories, credential-free alert
sinks, and missed-run detection; staging docs define the exact credential
list. `stage-out/ci.yml` was verified content-identical to the in-tree
`ci.yml` (line endings aside) — no merge needed.

The offline verification suite is green: `pnpm format`, `pnpm lint`,
`pnpm typecheck`, `pnpm test` (including the crawler observability suites),
`pnpm build`.

## 2. Exact external blockers

These cannot be resolved from inside this workspace; scheduled runs **cannot
execute** until they are cleared.

| #   | Blocker                                 | Status                    | What unblocks it                                                                                                                                                                                             |
| :-- | :-------------------------------------- | :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **No git remote configured**            | BLOCKED                   | `git remote add origin <github-url>` + first push. GitHub schedules only fire on hosted repositories.                                                                                                        |
| 2   | **Staging Supabase credentials absent** | BLOCKED                   | Provision staging project; add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY` (+ `DATABASE_URL` for migrations) to the GitHub `staging` environment. See `docs/staging-supabase-setup.md`. |
| 3   | **GitHub scheduling unverified**        | NOT_EXECUTED              | After blockers 1–2: enable Actions, confirm the `staging` environment exists, then trigger `Daily Crawl` and `Source Health Check` via `workflow_dispatch` before relying on cron.                           |
| 4   | **Local Docker engine down**            | BLOCKED_LOCAL_ENVIRONMENT | Local-stack DB verification (`verify:local-ingestion`, `verify:local-idempotency`) deferred to a separate DB-focused pass; no `supabase db reset` or docker commands run here.                               |
| 5   | **Vercel project/auth absent**          | NOT_EXECUTED              | Preview-only deployment of `apps/web` is fully specified in §6 below; no Vercel auth exists in this workspace, so nothing has been deployed.                                                                 |
| 6   | **Staging SMTP provider absent**        | BLOCKED                   | Staging email stays on the `console` provider until §7 requirements are met; Supabase dev SMTP is not beta-proof and must not be relied on.                                                                  |

## 3. Requirements matrix (workflow audit)

| Requirement                                                                                 | ci.yml                            | daily-crawl.yml        | source-health.yml        |
| :------------------------------------------------------------------------------------------ | :-------------------------------- | :--------------------- | :----------------------- |
| Node 24 (pinned via `.node-version`)                                                        | ✅                                | ✅                     | ✅                       |
| Exact pnpm pin (`packageManager: pnpm@11.20.0`)                                             | ✅                                | ✅                     | ✅                       |
| `pnpm install --frozen-lockfile`                                                            | ✅                                | ✅                     | ✅                       |
| Concurrency group prevents overlapping runs                                                 | ✅ `ci-${ref}` cancel-in-progress | ✅ `daily-crawl` queue | ✅ `source-health` queue |
| `timeout-minutes`                                                                           | ✅ 30                             | ✅ 30                  | ✅ 20                    |
| `workflow_dispatch` inputs                                                                  | n/a                               | ✅ `dry_run`, `source` | ✅ `max_age_hours`       |
| Secret isolation (step-scoped env only, no interpolation, least-privilege permissions)      | ✅ (no secrets)                   | ✅                     | ✅                       |
| Sanitized job summary (counters/ids only; no URLs with tokens, no credential-shaped output) | n/a                               | ✅                     | ✅                       |
| `environment: staging`                                                                      | n/a                               | ✅                     | ✅                       |
| Missed-run detection                                                                        | n/a                               | n/a                    | ✅ `crawl-status` step   |
| Notification suppression in staging                                                         | n/a                               | ✅ guards pinned       | ✅ guards pinned         |

## 4. Safety invariants (must remain true everywhere)

- `AUTO_VERIFY_CLAIMABLES=false` — pinned in workflow env, enforced by preflight gate, asserted in local verification scripts.
- `ENABLE_BILLING=false` — same enforcement path.
- `NOTIFY_CUSTOMERS_ENABLED=false` — staging must never notify real customers.
- No alert channel that requires credentials is implemented; alerts are
  structured log lines (`ALERT_SINK=log`) consumed externally if needed.
- Never `supabase db reset --linked`; never docker commands in this prep scope.

## 5. Go-live checklist (for whoever owns hosting)

1. Push the repository to GitHub (`git remote add origin ...; git push -u origin master`).
2. Create the `staging` environment; add the five credentials from `docs/staging-supabase-setup.md` §1.
3. Run `supabase link` + `supabase db push` against staging (migrations 001–011).
4. `Actions → Daily Crawl → Run workflow` with `dry_run: true` — confirm green run and sanitized summary.
5. Repeat with `dry_run: false` — confirm `crawl_runs` row and publication events.
6. `Actions → Source Health Check → Run workflow` — confirm health events + `crawl-status` verdict `ok`.
7. Wait one day; confirm the cron-triggered run at 00:17 UTC and the Monday health run.
8. Update this document: flip blocker statuses from BLOCKED/NOT_EXECUTED to DONE with run links.

## 6. Vercel Preview deployment (Preview-only — no production)

Status: **NOT_EXECUTED** — no Vercel account/auth exists in this workspace.
This section is the exact runbook for whoever owns hosting. It describes a
**Preview-environment-only** deployment of `apps/web`; a production
deployment is explicitly out of scope.

### 6.1 Steps

1. In Vercel: **Add New → Project**, import the GitHub repository, root
   directory `apps/web`, framework preset **Next.js**.
2. Restrict scope to previews: do **not** connect a production domain; leave
   the project on its `*.vercel.app` preview domain only.
3. Set the project's environment variables for the **Preview** (and
   Development) environments only — never on Production (list in §6.2).
4. Trigger a preview: open a pull request (or `vercel deploy --env preview`
   from `apps/web`). Wait for the build to pass — the build runs t3-env
   validation (`apps/web/env.ts`), so missing variables fail it loudly.
5. Verify on the preview URL:
   - `/robots.txt` returns `Disallow: /` (staging gate — previews are never
     indexed; enforced by `apps/web/app/robots.ts` when `APP_ENV !== 'production'`).
   - Home page renders against the staging Supabase project.
   - No real email is sent (console provider logs instead).
6. Record the preview URL and statuses in
   `docs/checkpoints/qoder-preview-deployment.md`.

### 6.2 Env var list (Preview environment only)

| Variable                        | Value                    | Notes                                                |
| :------------------------------ | :----------------------- | :--------------------------------------------------- |
| `APP_ENV`                       | `staging`                | Activates robots disallow-all + email suppression    |
| `NEXT_PUBLIC_SITE_URL`          | the preview/staging URL  | Required by `apps/web/env.ts` (client)               |
| `NEXT_PUBLIC_SITE_NAME`         | `ClaimRadar India`       | Required by `apps/web/env.ts` (client)               |
| `NEXT_PUBLIC_SUPABASE_URL`      | staging Supabase URL     | Browser-safe                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | staging anon JWT         | Browser-safe; RLS enforced                           |
| `NEXT_PUBLIC_ENABLE_BILLING`    | `false`                  | Staging invariant                                    |
| `SUPABASE_URL`                  | staging Supabase URL     | Server-only                                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | staging service-role JWT | **Server-only — never with a `NEXT_PUBLIC_` prefix** |
| `AUTO_VERIFY_CLAIMABLES`        | `false`                  | Staging invariant                                    |
| `ENABLE_BILLING`                | `false`                  | Staging invariant                                    |
| `NOTIFY_CUSTOMERS_ENABLED`      | `false`                  | Staging invariant                                    |
| `EMAIL_PROVIDER`                | `console`                | Real mail is production-only (§7)                    |

### 6.3 NEXT_PUBLIC safety rule

`NEXT_PUBLIC_*` values are inlined into the browser bundle at build time and
are readable by any visitor. Therefore:

- **Never** expose a server secret via a `NEXT_PUBLIC_` name — in particular
  `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, any AI API key, webhook
  secrets, or SMTP credentials must never appear under `NEXT_PUBLIC_`.
- Allowed under `NEXT_PUBLIC_` in this repo: site URL/name, Supabase URL,
  anon key (RLS-enforced), and the billing feature flag.
- The staging anon key is acceptable browser-side because RLS policies
  (`supabase/migrations/006_rls_policies.sql`, `008_security_fixes.sql`)
  restrict it; verify with `pnpm preflight:staging` (RLS spot checks).
- On any key rotation, redeploy the preview — values are baked at build time.

## 7. Staging SMTP requirements & test checklist

Status: **BLOCKED** — staging currently uses the `console` email provider
(`EMAIL_PROVIDER=console`), which logs messages instead of sending them.
This is the correct default until the requirements below are met.

**Supabase dev SMTP is NOT beta-proof** — the Supabase local/dev SMTP
(`localhost:54325`, `fake_sender`) is for local stack testing only; it does
not deliver real mail, has no delivery guarantees, and must never be
treated as a staging mail transport.

### 7.1 Requirements before staging gets a real transport

1. A transactional provider account (e.g. Resend) with a verified sending
   domain or mailbox (`EMAIL_FROM`), stored as a secret — never committed.
2. Staging recipient allow-list: staging mail may only go to team mailboxes,
   never to real customer addresses (`NOTIFY_CUSTOMERS_ENABLED=false`
   remains pinned in workflows and staging env).
3. Code-level gating is already in place and tested
   (`apps/web/lib/notifications`): real Resend delivery requires
   `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` + `APP_ENV=production`.
   Staging (`APP_ENV=staging`) falls back to the console provider even with
   a Resend key — so even a misconfigured staging env cannot mail customers.

### 7.2 Test checklist (run when a staging transport is provisioned)

- [ ] With `APP_ENV=staging` + provider key set: send a test notification;
      confirm it is logged by the console provider and **no** mail leaves.
- [ ] Confirm `notifications-safety.test.ts` suite passes (`pnpm test`).
- [ ] Send a test mail to an allow-listed team mailbox only; confirm receipt,
      subject/body rendering, and a working unsubscribe link.
- [ ] Confirm no mail is attempted to any address outside the allow-list.
- [ ] Record results in `docs/checkpoints/qoder-staging-supabase.md`.
