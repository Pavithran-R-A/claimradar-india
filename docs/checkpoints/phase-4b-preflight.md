# Phase 4B Preflight Audit — Checkpoint

**Date:** 2026-07-27
**Auditor:** Wave 0 preflight (Task #23)
**Machine:** Windows (PowerShell), pnpm monorepo root

## 1. Environment

| Item                         | Value                                                               |
| ---------------------------- | ------------------------------------------------------------------- |
| Node used for verification   | **v24.18.0** (installed via `pnpm env use --global 24`)             |
| pnpm                         | 11.17.0                                                             |
| System-default Node          | v26.5.0 (`C:\Program Files\nodejs\node.exe`) — VIOLATES engines pin |
| Engines pin (`package.json`) | `node >=24 <25`, `pnpm >=9`                                         |
| `.nvmrc` / `.node-version`   | both `24`                                                           |

**Engine-constraint compliance statement:** The machine's system Node is
v26.5.0, which violates `>=24 <25`. No version manager (nvm-windows, fnm,
volta) was installed. Node 24.18.0 was activated via
`pnpm env use --global 24` with `%LOCALAPPDATA%\pnpm\bin` prepended to
PATH for the verification session; `(Get-Command node).Source` and
`pnpm exec node --version` both confirmed v24.18.0 was the runtime for
every command below. **All verification results in this document were
produced under Node 24.18.0.** Caveat: PATH precedence is session-scoped;
`pnpm setup` (or a version manager) is needed to make it permanent — see
`docs/environment-setup-windows.md`.

## 2. Verification suite (exact outputs, run under Node 24.18.0)

| Command                          | Result        | Detail                                                                                          |
| -------------------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `node --version`                 | ✅            | `v24.18.0`                                                                                      |
| `pnpm --version`                 | ✅            | `11.17.0`                                                                                       |
| `pnpm format` (†)                | ✅ PASS       | `prettier --check .` → "All matched files use Prettier code style!"                             |
| `pnpm lint`                      | ✅ PASS       | `eslint .` → exit 0, zero errors/warnings printed                                               |
| `pnpm typecheck`                 | ✅ PASS       | `pnpm -r typecheck`, 10 of 11 workspace projects, all `tsc --noEmit` Done                       |
| `pnpm test`                      | ✅ PASS       | Vitest 3.2.7 — **Test Files 16 passed (16), Tests 128 passed (128)**, duration 1.39s            |
| `pnpm test:inventory-acceptance` | ✅ PASS       | **Test Files 16 passed (16), Tests 128 passed (128)** incl. `tests/acceptance.test.ts` (1 test) |
| `pnpm build`                     | ✅ PASS       | `pnpm -r build`, all 10 projects Done; Next.js 15.5.22 compiled, 38/38 static pages generated   |
| `git status`                     | ⚠️            | `On branch master` / `No commits yet` — all files untracked                                     |
| `git log --oneline -5`           | ⚠️ (expected) | `fatal: your current branch 'master' does not have any commits yet`                             |

(†) The plan referenced `format:check`; the repo's script is `format`
(`prettier --check .`). `format:fix` is the write variant.

Non-blocking observations from output:

- Vitest: `DEPRECATED The workspace file is deprecated…` (vitest.workspace.ts → `test.projects`).
- Next build: `⚠ The Next.js plugin was not detected in your ESLint configuration.`
- `pnpm env use` is deprecated in pnpm 11.17 in favor of `pnpm runtime set node <v> -g` (informational).

## 3. Git state

Repository has **ZERO commits**; every file is untracked on branch
`master`. **Recommendation:** create a baseline commit before any live
ingestion or Wave 1 defect fixes so changes are diffable and revertible.
(No commit was made in this task, per constraints.)

## 4. Component audit (verified by direct code read)

| Component              | Location                                                    | Status                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source registry        | `packages/source-registry/src/index.ts`                     | ✅ Present — `pibRssSource` (pib.gov.in RSS), `sebiRssSource` (sebi.gov.in press-release RSS), `rbiRssSource` (rbi.org.in), all `trustLevel: 'official'`, 10 req/min; `initialSources` exported. Note: RBI `feedUrl` points at a specific press-release display URL (`BS_PressReleaseDisplay.aspx?prid=56133`), not an RSS feed — worth confirming before live ingestion. |
| RSS adapters           | `apps/crawler/src/adapters/rss/`                            | ✅ Present — `base.ts`, `generic.ts`, `pib.ts`, `rbi.ts`, `sebi.ts`                                                                                                                                                                                                                                                                                                       |
| HTML adapters          | `apps/crawler/src/adapters/html/`                           | ✅ Present — `detail.ts`, `listing.ts`; tests pass (5 + 4)                                                                                                                                                                                                                                                                                                                |
| PDF adapter            | `apps/crawler/src/adapters/pdf/`                            | ✅ Present; `tests/adapters/pdf.test.ts` 6 pass                                                                                                                                                                                                                                                                                                                           |
| HTTP client + SSRF/DNS | `apps/crawler/src/http/client.ts`                           | ✅ Present — `safeAgent` with connection-time DNS validation blocking private IPs (anti-rebinding/TOCTOU). **L21–48 `dnsLookup` callback is manually formatted — must NEVER be reformatted.** File untouched in this task. 21 SSRF tests pass.                                                                                                                            |
| Deduplication          | `apps/crawler/src/deduplication/` + `pipeline/db-writer.ts` | ✅ Present — `strategies.ts` (18 tests pass); `getSourceDocumentsForDedup` (db-writer.ts L208–224) **intentionally queries `source_documents` across all sources** (`_sourceId` unused) for cross-source dedup.                                                                                                                                                           |
| AI providers           | `apps/crawler/src/ai/providers/`                            | ✅ Present — `noai.ts`, `nvidia.ts`, `openrouter.ts`; router in `ai/router.ts`                                                                                                                                                                                                                                                                                            |
| AI daily budget        | `apps/crawler/src/ai/budget.ts`                             | ✅ Present — `tryReserve` atomic slot reservation; 8 tests pass                                                                                                                                                                                                                                                                                                           |
| Circuit breaker        | `apps/crawler/src/ai/circuit-breaker.ts`                    | ✅ Present — 7 tests pass                                                                                                                                                                                                                                                                                                                                                 |
| Evidence validation    | `apps/crawler/src/validation/evidence.ts`                   | ✅ Present — 5 tests pass                                                                                                                                                                                                                                                                                                                                                 |
| 11 legal validators    | `apps/crawler/src/validation/validators.ts` + `runner.ts`   | ✅ Present — runner imports exactly 11: evidenceBacking, individualJudgmentGuard, domainAllowlist, sourceTrustLevel, groupVsIndividual, finalVsProposed, appealOrStay, deadline, amountSupport, claimUrlSupport, **sourceFreshness (L316–345, basic 90-day check, severity `info`)**. 18 validator tests pass.                                                            |
| Publication engine     | `apps/crawler/src/publication/policy.ts`                    | ✅ Present — `AUTO_VERIFY_CLAIMABLES=false` default (env.ts L20) forces `human_review`; auto path requires score ≥70 + trust `official` + all validators pass. 5 tests pass.                                                                                                                                                                                              |
| Migrations 001–008     | `supabase/migrations/`                                      | ✅ All 8 present: initial_schema, ingestion_tables, user_tables, billing_tables, editorial_tables, rls_policies, profile_trigger, security_fixes                                                                                                                                                                                                                          |
| RLS policies           | `supabase/migrations/006_rls_policies.sql`                  | ✅ Present — `ENABLE ROW LEVEL SECURITY` on 15 tables (profiles, sectors, companies, sources, source_documents, claimables, claim_sources, claim_evidence, eligibility_rules, claim_versions, watchlists ×2, user_answers, claim_matches, claim_trackers)                                                                                                                 |
| Admin routes           | `apps/web/app/admin/`                                       | ✅ Present — dashboard, `candidates/`, `crawl-runs/`, `sources/` (+ `[id]` details), `actions.ts`, role-gated (`requireRole('admin')`); all render as dynamic (ƒ) in build                                                                                                                                                                                                |
| Workflows              | `.github/workflows/`                                        | ✅ Present — `daily-crawl.yml` (cron `17 0 * * *` + dispatch w/ dry_run), `source-health.yml` (cron `43 2 * * 1` weekly), `ci.yml`; all on `node-version: '24'`                                                                                                                                                                                                           |
| Acceptance test        | `apps/crawler/tests/acceptance.test.ts`                     | ✅ Present — 1 test, passes under `test:inventory-acceptance`                                                                                                                                                                                                                                                                                                             |
| Env validation         | `apps/crawler/src/env.ts`, `packages/config/`               | ✅ Present — Zod schema; `LIVE_ADAPTERS_ENABLED` default false, `AUTO_VERIFY_CLAIMABLES` default false; `packages/config` builds & typechecks                                                                                                                                                                                                                             |
| Public placeholders    | `apps/web/app/(public)/`                                    | ✅ 8 ComingSoon routes confirmed: claimables, closing-soon, companies, deadlines, guides, new, sectors, updates (each imports `ComingSoon` + `generateComingSoonMetadata`)                                                                                                                                                                                                |

## 5. Known defects (scheduled for Wave 1 — intentionally NOT fixed here)

1. **`apps/crawler/src/ai/extraction.ts` L14–44 — budget reserved before
   circuit-breaker check.** `budget.tryReserve(passNumber)` (L16) runs
   before `circuitBreaker.canAttempt()` (L32); when the breaker is open,
   a budget slot is consumed and never used/released, silently burning
   daily budget during provider outages.
2. **`apps/crawler/src/validation/validators.ts` L290–301 —
   `amountSupportValidator` blocks null amounts.** Severity `block` and
   `passed: !!amountEvidence` with no null-amount short-circuit: an
   extraction with no `official_amount` (legitimately amount-less
   claimables) fails a blocking validator instead of passing/being N/A.
3. **`apps/web/app/admin/actions.ts` L30–38 — `triggerCrawl` /
   `retryDeferred` are stubs.** Both only return CLI-instruction message
   strings; no actual trigger. (`retryDeferred` even references a
   `crawler:retry-queued` script that does not exist in root
   `package.json`.)

## 6. Gate verdict

**PASS** — All verification commands (format, lint, typecheck, test
128/128, inventory-acceptance 128/128, build 10/10 projects) succeed
under genuine Node 24.18.0. The Node-26 engine mismatch was resolved for
verification via pnpm-managed Node 24; permanent activation instructions
are in `docs/environment-setup-windows.md`.

Carry-forward items (not gate-blocking for Wave 0):

- Zero Git commits → make a baseline commit before live ingestion.
- Three known defects above → Wave 1 (Task #24).
- Session-scoped PATH for Node 24 → run `pnpm setup` or install
  nvm-windows/fnm for permanence.
- RBI source `feedUrl` looks like a detail page, not a feed → verify
  before enabling live adapters.
