# ClaimRadar India Completion Ledger

Updated: 2026-09-07

## Current baseline

- Branch: `main`.
- Runtime freeze: `6f22c5ef4119000318218f136f5416987a451877`.
- Main after runtime repair merge: `6f22c5ef4119000318218f136f5416987a451877`.
- Repair source head: `d2234a8614447fc86827bf8e11ebc15fbea4ca75`.
- Main pre-repair merge: `7504f303099491132a804f723699197fa6334d8f`.
- Original dirty checkout: preserved and untouched.
- Main: repaired merge plus checkpoint evidence only.
- PRs: `#2` completion merged; `#3` runtime repair merged.
- Node: `v24.19.0`.

## Current gate ledger

| Gate                  | Status                 | Evidence or blocker                                                |
| --------------------- | ---------------------- | ------------------------------------------------------------------ |
| Code quality          | `PASS`                 | Format, lint, typecheck, tests, inventory, and build pass locally. |
| CI                    | `PASS`                 | Exact-head run `33968827983` passed.                               |
| Preview deployment    | `PASS`                 | Exact-head deployment reports `READY`.                             |
| Public browser QA     | `PASS_WITH_LIMITATION` | Share-authorized Preview routes and search passed.                 |
| Supabase/database     | `PASS_WITH_LIMITATION` | Read-only connector checks passed; local Docker stack unavailable. |
| Authentication        | `PASS`                 | Auth Admin API created three confirmed disposable users.           |
| Customer workspace    | `PASS`                 | User-scoped onboarding data and isolation passed.                  |
| Admin workspace       | `PASS`                 | Admin sources/crawl surfaces passed; normal users blocked.         |
| API runtime           | `PASS`                 | Credentialed Auth and PostgREST checks passed.                     |
| Crawler adapters      | `PASS`                 | Correct-target run `33840659144` passed all invariants.            |
| Security              | `PASS_WITH_LIMITATION` | CSP is active; static rendering retains `unsafe-inline` scripts.   |
| Accessibility         | `PASS_WITH_LIMITATION` | Preview keyboard and route checks passed; full WCAG audit pending. |
| Notifications         | `PASS`                 | User scope, read state, dedup, and private ledger passed.          |
| Performance           | `PASS_WITH_LIMITATION` | Build and runtime smoke passed; load profile remains pending.      |
| Release integrity     | `PASS`                 | Migration contract, secret scan, and CI release checks pass.       |
| Pre-soak              | `PASS`                 | Run `33840659144`; DB corroborated crawl `b24296a6-...`.           |
| Final soak            | `PENDING_TIME`         | Runs `34163605422` and `34188114057` passed.                       |
| Production deployment | `NO-GO`                | Main merged; production deployment remains untouched.              |

## Fresh local evidence

- `pnpm format:check`: passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 67 files, 539 tests passed.
- `pnpm test:inventory-acceptance`: 47 files, 338 tests passed.
- Remote CI run `33968827983`: exact head passed.
- `pnpm verify:migrations`: 17 ordered migrations passed.
- Client bundle secret audit: zero backend-secret matches.
- `pnpm build`: passed, 44 static pages generated.
- `pnpm test:browser-smoke`: 10 routes, two viewports passed.
- `pnpm preflight:staging`: four policy guards passed; seven credential checks skipped.
- Preview routes: home, directory, sources, methodology, login, register passed.
- Preview search: `PACL` filter produced the expected query state.
- Admin boundary: `/admin` redirected to `/login?next=%2Fadmin`.
- Staging registry: seven enabled source rows verified read-only.
- Staging pre-soak: 7 sources, 126 found, 123 stored, 21 candidates.
- Staging crawl errors: zero; claimables and notifications remain zero.
- Staging security advisor: zero lints.
- Staging performance advisor: expected INFO/WARN findings only.
- Staging soak run `33836845034`: passed against another project; rejected.
- Staging guard run `33837926250`: failed closed on URL mismatch.
- Auth runtime run `33968830120`: all credentialed stages passed.
- Auth cleanup: three users deleted; zero residual rows verified.
- Onboarding completion now uses trusted server-side profile update.
- Previous merge commit `f7a77ee0349078a0dfbe8649d77683feb89e6470` recorded as historical.
- Runtime repair PR `#3` merged with repair head `d2234a8614447fc86827bf8e11ebc15fbea4ca75`.
- Exact repair CI run `34138348817` passed all required jobs.
- Repair Preview deployment reports `READY`.
- Scheduled run `34123292686` failed with IBBI raw-text U+0000 persistence error.
- Prior qualifying runs `34058094014` and `34084538536` are invalidated.
- Baseline GHA run `34138764303` passed from repaired frozen main.
- Baseline crawl `0fe7626a-3332-403d-b3d4-d66db3ddefb9` passed.
- Baseline DB corroboration: 7 completed sources, 126 found, zero crawl errors.
- Baseline DB source documents: exact IBBI PDF persisted, 25 IBBI documents present.
- Baseline publication events: zero; candidates and AI budget remain zero.
- New runtime freeze: `6f22c5ef4119000318218f136f5416987a451877`.
- Qualifying scheduled run `34252651891`: slot `2026-09-08T12:17:00Z`, crawl `cdef4024-628e-4275-846e-af21efe84eca`, seven sources, 126 fetched, zero unexpected errors, zero publications.

## Soak-safe finalization audit

Updated: 2026-09-08

The separate branch `codex/claimradar-soak-safe-finalization` adds audit and
runbook documentation only. Runtime-sensitive diff after the freeze remains
empty.

| Gate                   | Final audit status                              |
| ---------------------- | ----------------------------------------------- |
| Public browser QA      | `PASS_WITH_LIMITATION`                          |
| Accessibility          | `MATERIAL_RUNTIME_FIX_REQUIRED`                 |
| Performance            | `PASS_WITH_LIMITATION`                          |
| Supabase database      | `PASS_WITH_LIMITATION`                          |
| Supabase security      | `PASS_WITH_LIMITATION`                          |
| Supabase performance   | `PASS_WITH_ACCEPTED_CAPACITY_LIMIT`             |
| Auth and SMTP          | `EXTERNAL_CONFIGURATION_REQUIRED`               |
| CSP security           | `ACCEPTED_TRADEOFF_REQUIRES_SECURITY_OWNER_ACK` |
| Vercel readiness       | `PASS_WITH_LIMITATION`                          |
| Backup and recovery    | `EXTERNAL_CONFIGURATION_REQUIRED`               |
| Observability          | `PASS_WITH_LIMITATION`                          |
| Incident response      | `PASS`                                          |
| Rollback readiness     | `PASS_WITH_LIMITATION`                          |
| Production runbook     | `PASS`                                          |
| Post-deploy smoke plan | `PASS`                                          |

Material accessibility defects remain deliberately visible. They require a
runtime repair and deliberate soak restart. Documentation does not alter the
current soak or its qualifying run records.

## Runtime defect and soak restart

- Failed scheduled run: `34123292686`, started `2026-09-07T12:42:02Z`.
- Failed crawl: `8aee683a-73d1-43d5-85a3-5266f9614c80`.
- Failed source: IBBI PDF `121e37ea6e507c4fba1a52fac05d41b4.pdf`.
- Root cause: extracted `raw_text` contained three U+0000 characters.
- Fix: sanitize invalid PostgreSQL text and JSON code units before persistence.
- Regression coverage: exact PDF payload, NUL removal, surrogate handling, Unicode preservation, error propagation.
- Old freeze `f7a77ee0349078a0dfbe8649d77683feb89e6470` is historical only.
- New freeze is `6f22c5ef4119000318218f136f5416987a451877`.
- Runtime-sensitive diff after new freeze is empty.
- New manual baseline is diagnostic and baseline-only.
- New soak clock restarts at the first qualifying scheduled run.

## Soak slot accounting correction

- Cron: `17 */6 * * *` expands to `00:17`, `06:17`, `12:17`, and `18:17` UTC.
- First scheduled slot after new freeze `2026-09-07T15:31:12Z`: `2026-09-07T18:17:00Z`.
- First scheduled slot in IST: `2026-09-07T23:47:00+05:30`.
- Next four slots: `2026-09-08T00:17:00Z`, `2026-09-08T06:17:00Z`, `2026-09-08T12:17:00Z`, `2026-09-08T18:17:00Z`.
- Manual `workflow_dispatch` runs remain excluded.
- Baseline run `34138764303` remains baseline-only.
- Previous baseline run `34038342122` is historical only.
- Runtime freeze is now `6f22c5ef4119000318218f136f5416987a451877`.
- Runtime-sensitive diff is empty after the new freeze.
- The IBBI persistence repair restarted the runtime soak clock.
- Scheduled run `34042559516` started at `2026-09-06T15:31:11Z`.
- It maps to nominal slot `2026-09-06T12:17:00Z`.
- It is `PRE_FREEZE_NOMINAL_SLOT` and excluded.
- Old qualifying slots and runs are historical only.
- New first qualifying slot is `2026-09-07T18:17:00Z`.
- New `SOAK_START_UTC` is `2026-09-07T18:17:00Z`.
- New `SOAK_START_IST` is `2026-09-07T23:47:00+05:30`.
- Run `34163605422` maps to `18:17Z`; crawl `2aa12fb7-e011-474b-a3b0-068f52d090bf` passed.
- It passed 7/7 sources, 126 fetched, zero errors, and zero publications.
- Run `34188114057` maps to `00:17Z`; crawl `898c47d8-2299-414b-a06b-8450c4c49862` passed.
- It passed 7/7 sources, 126 fetched, zero errors, and zero publications.
- Run `34220598983` maps to `06:17Z`; crawl `196a1bd8-e33b-4bad-b689-d10a8a4b5e40` passed.
- It passed 7/7 sources, 126 fetched, zero errors, and zero publications.
- Three qualifying scheduled runs are recorded.
- New 48-hour and 72-hour thresholds remain pending.
- Manual runs remain excluded. Baseline remains baseline-only.
- Delayed run `34042559516` remains permanently excluded from final qualification.
- Soak accounting now measures thresholds from the first qualifying nominal slot.

## Release decision

`NO-GO` for autonomous production release.

Production remains untouched. Runtime gates now pass.
The repaired runtime requires a new genuine soak.

## Authoritative final-100 candidate update

Updated: 2026-09-08

| Gate                | Current status  | Evidence or blocker                                       |
| ------------------- | --------------- | --------------------------------------------------------- |
| Final branch        | `IN_PROGRESS`   | `codex/claimradar-final-100` from `origin/main` `32fb580` |
| Route inventory     | `PASS`          | 69 pages, 1 API source, 7 server-action sources           |
| Accessibility fixes | `SOURCE_PASS`   | Focused six-test contract passes                          |
| CSP repair          | `SOURCE_PASS`   | Nonce middleware removes static script `unsafe-inline`    |
| Lint                | `PASS`          | Final candidate source lint passes                        |
| Typecheck           | `PASS`          | Web typecheck passes after workspace package builds       |
| Crawler acceptance  | `PASS`          | 48 files, 344 tests                                       |
| Auth contract       | `PASS`          | Five sanitized runtime-contract tests pass                |
| Migration contract  | `PASS`          | 17 ordered migrations                                     |
| Full tests          | `BLOCKED`       | Five checks require `.next` production CSS output         |
| Production build    | `BLOCKED`       | Local C drive reached zero free bytes                     |
| Client secret scan  | `PENDING_BUILD` | Final `.next/static` does not exist locally               |
| Runtime freeze      | `PENDING`       | New freeze follows final merge and baseline               |

The historical freeze remains evidence only. Frontend and CSP changes are
runtime-sensitive. A new freeze is required after final candidate merge.
