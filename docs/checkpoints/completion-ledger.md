# ClaimRadar India Completion Ledger

Updated: 2026-09-10

## Permanent relay and fresh baseline checkpoint

- Runtime freeze: `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`.
- Permanent Worker: `claimradar-trai-relay`; deployment GHA `34507290715` passed.
- Relay qualification: four probe runs, `20/20` signed requests passed.
- Fresh baseline: GHA `34509256561`, workflow dispatch, baseline-only.
- Baseline crawl: `a32c7356-8254-4390-9a38-fb0a04fec1aa`.
- Baseline: PASS, 7/7 sources, 126 discovered, 126 fetched.
- Safety: zero crawl errors, zero unexpected errors, zero publications.
- Guards: staging enabled; billing, auto-verification, and notifications disabled.
- Database: seven source rows, 523 source documents, zero crawl errors, zero new claimables.
- Artifact: sanitized `staging-soak-summary` retained.
- Final soak: not started; await the next genuine scheduled slot.
- Production readiness: NO; pending final 72-hour soak.

## Current authoritative status

- Current main: `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`.
- UI merge freeze: `625bc9f922dd3a7b8eea67681ecedfc77e329a45`.
- Runtime candidate: `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`; new freeze established after passing baseline.
- Runtime-sensitive changes after candidate merge: none.
- Current candidate CI: `PASS`; GHA run `34444804984` passed Node 24 gates.
- GitHub probe: `PASS`; GHA run `34445314939`, sanitized artifact retained.
- Fresh baseline: PASS; GHA run `34509256561`, crawl `a32c7356-8254-4390-9a38-fb0a04fec1aa`.
- Baseline result: 7/7 sources; zero crawl errors, unexpected errors, and publications.
- Root cause: both official TRAI hostnames resolve to `164.100.85.161`; GitHub runner TCP connects time out.
- Networking fix: explicit 30-second connect timeout; bounded four-retry ceiling; capped jittered backoff.
- Classification fix: connect timeout is `TIMEOUT`, not `HTTP_4XX`.
- Runner matrix: GHA `34455249230`, nine independent jobs completed.
- Ubuntu, Windows, and macOS each failed TRAI connectivity three times.
- All nine jobs passed SEBI RSS and public notices.
- TRAI resolved IPv4 `164.100.85.161`; TCP, TLS, HEAD, and GET timed out.
- SEBI resolved `202.191.181.30` and `202.191.181.158`; strict TLS and GET passed.
- Reliable standard GitHub-hosted runner: none.
- Temporary matrix workflow removed; sanitized artifacts retained.
- Human action: none for baseline; final soak remains required.
- Manual workflow runs: excluded from soak qualification.
- Latest scheduled execution: `34438700011`, nominal slot `2026-09-10T00:17:00Z`, failed at 4/7 sources.
- Scheduled failure details: SEBI RSS, SEBI public notices, and TRAI timed out; zero unexpected errors, zero publications, sanitized artifact retained.
- Scheduled qualification: no credit; the required fresh baseline was not successful.
- Final soak: not started; await the next genuine schedule.
- Production readiness: no; pending final 72-hour soak.

## Controlled crawl evidence

- Crawl 1: GHA `34509256561`, crawl `a32c7356-8254-4390-9a38-fb0a04fec1aa`, PASS.
- Crawl 2: GHA `34511360332`, crawl `17b938e2-a347-437f-99e9-d9b9cfd6ea99`, PASS.
- Crawl 3: GHA `34512108642`, crawl `2d7218bd-92a3-466d-9749-d27004703fae`, PASS.
- All three: 7/7 sources, 126 discovered, 126 fetched, zero crawl errors, zero unexpected errors, zero publications.
- Database corroboration: seven source rows, seven completed rows, zero crawl errors, zero new claimables per crawl.
- Soak qualification: not started; manual runs remain excluded.
- Node 24 CI: GHA `34508399417`; 593 tests and 73 test files passed.
- Inventory acceptance: 372 tests and 51 test files passed.
- Browser smoke: 10 routes across two viewports passed.
- Final route browser QA: 207 checks, 69 routes, 3 viewports, zero failures.

## Existing cloud egress investigation

- Vercel build probe: `dpl_Vhm34TnQmG1boEZweRyz99LERiVt`.
- Vercel region: `iad1`; Node `v24.19.0`.
- Vercel TRAI: three rounds failed.
- Vercel TRAI DNS: `164.100.85.161`, IPv4 only.
- Vercel TRAI HEAD/GET: connection timeout.
- Vercel SEBI GET: passed across three rounds.
- Supabase Edge: three TRAI failures.
- Supabase TRAI DNS: `164.100.85.161`, IPv4 only.
- Supabase TRAI HEAD/GET: connection timeout.
- Supabase SEBI GET: passed; apex RSS redirected.
- Existing cloud egress: blocked for TRAI.
- Temporary Vercel files: removed.
- Clean Vercel deployment: `dpl_B64AsXnmzski5azACdYMAdA5TEvk`.
- Temporary Supabase function: version 2; JWT verification enabled.
- Supabase function deletion: unavailable here.
- No relay selected; no crawler semantics changed.
- No physical device is required.

## Historical baseline records

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

## Final merge and baseline checkpoint

Updated: 2026-09-09

- PR #4 merged without squashing.
- Source head: `3c064681e4fd65aef4316f491a6050e631670e19`.
- Main pre-merge: `32fb580e86c9d490cb0428f291c667f7d5538061`.
- Merge SHA: `7f4834f23f48baeeb871afe3c0594fef9612b677`.
- Merge parents: `32fb580e86c9d490cb0428f291c667f7d5538061`, `3c064681e4fd65aef4316f491a6050e631670e19`.
- Merge timestamp: `2026-09-09T07:56:21Z`.
- `origin/main` equals the merge SHA.
- Runtime freeze: `7f4834f23f48baeeb871afe3c0594fef9612b677`.
- Runtime-sensitive diff after freeze: empty.
- Manual baseline run `34326475197` is baseline-only.
- Baseline crawl: `8ff537e8-a961-429a-a801-5393aaead1df`.
- Baseline artifact: `staging-soak-summary`, retained and sanitized.
- Baseline: 7/7 sources, 126 discovered, 126 fetched.
- Baseline database: 7 completed source rows, 0 crawl errors.
- Source documents: 13 retrieved during the crawl window.
- Candidate documents: 0 for the crawl.
- Publication events: 0 during the crawl window.
- Automatic publications: 0; queued records: 0.
- Safety guards: staging, billing off, notifications off, auto-verify off.
- First qualifying slot: `2026-09-09T12:17:00Z`.
- First qualifying slot IST: `2026-09-09T17:47:00+05:30`.
- Soak clock starts only after that genuine scheduled run passes.
- Manual dispatch runs remain excluded.
- 48-hour and 72-hour gates require real elapsed time.
- Production readiness: `NO - PENDING FINAL SOAK`.

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

| Gate                | Current status     | Evidence or blocker                                       |
| ------------------- | ------------------ | --------------------------------------------------------- |
| Final branch        | `IN_PROGRESS`      | `codex/claimradar-final-100` from `origin/main` `32fb580` |
| Route inventory     | `PASS`             | 69 pages, 1 API source, 7 server-action sources           |
| Accessibility fixes | `SOURCE_PASS`      | Focused six-test contract passes                          |
| CSP repair          | `SOURCE_PASS`      | Nonce middleware removes static script `unsafe-inline`    |
| Lint                | `PASS`             | Final candidate source lint passes                        |
| Typecheck           | `PASS`             | Web typecheck passes after workspace package builds       |
| Crawler acceptance  | `PASS`             | 48 files, 344 tests                                       |
| Auth contract       | `PASS`             | Five sanitized runtime-contract tests pass                |
| Migration contract  | `PASS`             | 17 ordered migrations                                     |
| Full tests          | `BLOCKED`          | Five checks require `.next` production CSS output         |
| Production build    | `BLOCKED`          | Local C drive reached zero free bytes                     |
| Client secret scan  | `PENDING_BUILD`    | Final `.next/static` does not exist locally               |
| Runtime freeze      | `PENDING`          | New freeze follows final merge and baseline               |
| Route browser QA    | `PENDING_CI_RERUN` | 69 routes across desktop, tablet, and mobile              |

The historical freeze remains evidence only. Frontend and CSP changes are
runtime-sensitive. A new freeze is required after final candidate merge.

## Current final-candidate verification refresh

Updated: 2026-09-08

| Gate                       | Status                         | Evidence                                              |
| -------------------------- | ------------------------------ | ----------------------------------------------------- |
| Candidate head             | `READY_FOR_FINAL_MERGE_REVIEW` | `5e65153039c745a371f1b06f360ae6c86bfe0afa`            |
| Exact-head CI              | `PASS`                         | GHA run `34276267445`                                 |
| Vercel exact head          | `PASS`                         | PR deployment check                                   |
| Final route browser QA     | `PASS`                         | 207 checks, zero failures, zero axe violations        |
| Public/auth route coverage | `PASS`                         | 123 checks, desktop/tablet/mobile                     |
| Protected browser coverage | `AUTH_REQUIRED`                | 84 entries; credentialed runtime QA passed separately |
| Dynamic 404 coverage       | `PASS`                         | 12 expected rendered 404 checks                       |
| Final runtime freeze       | `PENDING`                      | Establish after merge and baseline                    |

Protected browser routes are not claimed as unauthenticated visual passes.
They remain covered by credentialed staging runtime evidence and require an
authenticated browser run for complete protected-surface visual evidence.

## Final candidate gate refresh

- Updated: `2026-09-09`.
- Candidate head: `74809dc2b1ec8467484d609a476d1d5095ed957d`.
- Exact-head CI: `PASS`, GHA run `34308913068`.
- Remote release gates: build, tests, inventory, browser smoke, route QA,
  release integrity, and secret scan all passed.
- Route QA: 69 routes, 207 checks, zero failures, zero axe violations.
- Vercel exact-head check: `PASS`.
- Candidate state: `READY_FOR_FINAL_MERGE_REVIEW`.
- Runtime freeze: pending merge and fresh baseline.
- Human action: approve final merge of PR #4.

## Final candidate gate refresh, latest

- Candidate head: `3aa6eef4fd0f2644a39eff4c0c987c567b1ddadd`.
- Exact-head CI: `PASS`, GHA run `34312344579`.
- Final route QA: 69 routes, 207 checks, zero failures, zero axe violations.
- Vercel exact-head check: `PASS`.
- Candidate state: `READY_FOR_FINAL_MERGE_REVIEW`.
- Runtime freeze: pending merge and fresh baseline.
- Human action: approve final merge of PR #4.

## Final candidate gate refresh, latest

- Candidate head: `4e0ae8e12b092dc9f61f960e7ede867cc8e0404d`.
- Exact-head CI: `PASS`, GHA run `34311888166`.
- Final route QA: 69 routes, 207 checks, zero failures, zero axe violations.
- Vercel exact-head check: `PASS`.
- Candidate state: `READY_FOR_FINAL_MERGE_REVIEW`.
- Runtime freeze: pending merge and fresh baseline.
- Human action: approve final merge of PR #4.

## Final candidate gate refresh, latest

- Candidate head: `cb5478e91f0db32fc8e3de6f0206b51a04f46076`.
- Exact-head CI: `PASS`, GHA run `34311512314`.
- Final route QA: 69 routes, 207 checks, zero failures, zero axe violations.
- Vercel exact-head check: `PASS`.
- Candidate state: `READY_FOR_FINAL_MERGE_REVIEW`.
- Runtime freeze: pending merge and fresh baseline.
- Human action: approve final merge of PR #4.

The local build remains disk-blocked only. Remote CI supplies build evidence.

## Final candidate gate refresh, latest

- Candidate head: `7547f34e2d10f52804b65f65befacb747a978cca`.
- Exact-head CI: `PASS`, GHA run `34310073132`.
- Final route QA: 69 routes, 207 checks, zero failures, zero axe violations.
- Vercel exact-head check: `PASS`.
- Candidate state: `READY_FOR_FINAL_MERGE_REVIEW`.
- Runtime freeze: pending merge and fresh baseline.
- Human action: approve final merge of PR #4.

## Final candidate gate refresh, latest

- Candidate head: `817fdf5d5f0465dd425c665ba4bc4763724ba8f1`.
- Exact-head CI: `PASS`, GHA run `34311026621`.
- Final route QA: 69 routes, 207 checks, zero failures, zero axe violations.
- Vercel exact-head check: `PASS`.
- Candidate state: `READY_FOR_FINAL_MERGE_REVIEW`.
- Runtime freeze: pending merge and fresh baseline.
- Human action: approve final merge of PR #4.

## Final candidate proof-completion refresh, authoritative

Updated: `2026-09-09`.

| Gate                     | Status     | Evidence                                         |
| ------------------------ | ---------- | ------------------------------------------------ |
| Candidate head           | `VERIFIED` | `17275fc8e25c865942321450d599bda44fe0c0c5`       |
| Exact-head CI            | `PASS`     | GHA `34321570779`                                |
| Public/auth route QA     | `PASS`     | 123 checks, zero failures                        |
| Protected route QA       | `PASS`     | GHA `34320450223`, 84 checks                     |
| Protected Axe            | `PASS`     | Zero violations                                  |
| Protected runtime errors | `PASS`     | Zero console, page, and overflow failures        |
| Protected interactions   | `PASS`     | 11 of 11 verified                                |
| Disposable-user cleanup  | `PASS`     | Three deleted, no residual profiles              |
| Route state matrix       | `PASS`     | 69 routes, zero pending or unknown fields        |
| Vercel deployment        | `READY`    | Exact candidate deployment check                 |
| Vercel direct route QA   | `BLOCKED`  | Deployment protection requires bypass credential |
| Merge                    | `HELD`     | User explicitly said do not merge yet            |

Manual browser categories passed through DOM, keyboard, focus, reflow,
reduced-motion, form, naming, and target-size checks. Direct assistive
technology testing remains outside this workspace. Protected QA ran at
`d617fcd`; the runtime tree is unchanged at the final head.

## UI perfection merge and fresh baseline

Updated: `2026-09-10`.

| Gate                   | Status        | Evidence                                                        |
| ---------------------- | ------------- | --------------------------------------------------------------- |
| Merge                  | `PASS`        | Main `625bc9f922dd3a7b8eea67681ecedfc77e329a45`                 |
| Exact-head CI          | `PASS`        | GHA `34427810132`                                               |
| Vercel exact-head      | `PASS`        | Deployment completed                                            |
| Protected browser QA   | `PASS`        | GHA `34429378945`                                               |
| Auth runtime QA        | `PASS`        | GHA `34429382482`                                               |
| Disposable cleanup     | `PASS`        | Three users deleted; no residual profiles                       |
| Fresh staging baseline | `BLOCKED`     | Runs `34428249855`, `34428871150`, `34429825500`, `34430830404` |
| TRAI source            | `BLOCKED`     | Repeated connection timeout on port 443                         |
| Automatic publication  | `PASS`        | Zero                                                            |
| Soak qualification     | `NOT STARTED` | Manual baselines excluded                                       |

The merged candidate remains unchanged.
No scheduled run qualifies yet.

## Zero-cost hosted egress evaluation

Updated: `2026-09-10`.

| Gate                        | Status          | Evidence                                   |
| --------------------------- | --------------- | ------------------------------------------ |
| Cloudflare temporary probe  | `PASS`          | 20/20 fixed-target requests                |
| TRAI and SEBI probe routes  | `PASS`          | HTTP 200, official bytes, zero redirects   |
| Permanent Worker deployment | `NOT_AVAILABLE` | No permanent account credentials present   |
| Production relay            | `NOT_LIVE`      | Endpoint and secret not configured         |
| Fresh staging baseline      | `BLOCKED`       | Requires live relay and exact current main |
| Final soak                  | `NOT_STARTED`   | No successful fresh baseline               |

The relay implementation is local only.
It remains unpushed and unqualified.

Scheduled run `34471357419` passed direct fetching.
Its crawl `5c6b9e90-b01f-4481-a7d1-ffb266a03225` passed 7/7.
Database rows show seven completed sources.
No crawl errors were recorded.
This run remains outside relay-soak credit.
