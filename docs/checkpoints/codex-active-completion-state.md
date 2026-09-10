# ClaimRadar India Active Completion State

## Current soak monitor checkpoint

Updated: 2026-09-10T23:15:00Z.

- CURRENT_MAIN: `b4bdd5bf44c6281117bdba5b22353f4fca9b7ca9`.
- RUNTIME_FREEZE_HEAD: `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`.
- RUNTIME_SENSITIVE_DIFF: `EMPTY` from the runtime freeze to current main.
- BASELINE_GHA_RUN: `34509256561`; workflow_dispatch and baseline-only.
- BASELINE_CRAWL_RUN: `a32c7356-8254-4390-9a38-fb0a04fec1aa`; `PASS`, 7/7 sources.
- LATEST_SCHEDULED_RUN: `34529249916`; event `schedule`; `PASS`.
- LATEST_SCHEDULED_CRAWL: `6419702c-5523-4bc5-a1b5-502a2b0ac939`; 7/7, zero errors, zero publications.
- LATEST_SCHEDULED_NOMINAL_SLOT: `2026-09-10T18:17:00Z`.
- LATEST_CHECKPOINT_MERGE: `b4bdd5bf44c6281117bdba5b22353f4fca9b7ca9` at `2026-09-10T23:12:21Z`.
- LATEST_SCHEDULED_CLASSIFICATION: `PRE_CHECKPOINT_NOMINAL_SLOT`; excluded permanently.
- FIRST_ELIGIBLE_NOMINAL_SLOT: `2026-09-11T00:17:00Z`.
- FINAL_SOAK: `NOT_STARTED`; no qualifying scheduled run exists.
- MANUAL_RUNS: excluded from soak credit.
- PRODUCTION_READY_NOW: `NO - PENDING FINAL 72H SOAK`.

Updated: 2026-09-10T19:38:29Z

## Permanent relay and fresh baseline

- RUNTIME_FREEZE_HEAD: `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`.
- MAIN_RUNTIME_STATE: merged and frozen; no post-freeze runtime edits.
- PERMANENT_RELAY: `https://claimradar-trai-relay.first-moonflower.workers.dev/fetch`.
- RELAY_DEPLOY_GHA: `34507290715`; deployment and encrypted secret upload passed.
- RELAY_PROBE_GHA: `34508506486`, `34508568898`, `34508631422`, `34508694039`.
- RELAY_PROBE_RESULT: `20/20` signed requests passed.
- BASELINE_GHA_RUN: `34509256561`; event `workflow_dispatch`; baseline-only.
- BASELINE_CRAWL_RUN: `a32c7356-8254-4390-9a38-fb0a04fec1aa`.
- BASELINE_RESULT: `PASS`; 7/7 sources, 126 discovered, 126 fetched.
- BASELINE_SAFETY: zero crawl errors, zero unexpected errors, zero publications.
- BASELINE_GUARDS: staging, billing disabled, auto-verification disabled, notifications disabled.
- BASELINE_DB: seven source rows, 523 source documents, zero crawl errors, zero new claimables.
- BASELINE_ARTIFACT: `staging-soak-summary`; retained and sanitized.
- FINAL_SOAK: not started; manual runs never qualify.
- CURRENT_MAIN: `439f56d55e119cd3cb40dc50ffd1a41e2029ecf8`; checkpoint-only merges followed the runtime freeze.
- RUNTIME_SENSITIVE_DIFF: `EMPTY` from `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`.
- LAST_SCHEDULED_RUN: `34502374906`; created `2026-09-10T16:29:04Z`; success before the baseline and excluded.
- LAST_SCHEDULED_NOMINAL_SLOT: `2026-09-10T12:17:00Z`.
- SLOT_BEFORE_LATEST_CHECKPOINT_MERGE: `2026-09-10T18:17:00Z`; no run visible and not eligible.
- LATEST_CHECKPOINT_MERGE: `439f56d55e119cd3cb40dc50ffd1a41e2029ecf8` at `2026-09-10T19:15:35Z`.
- FIRST_ELIGIBLE_NOMINAL_SLOT: `2026-09-11T00:17:00Z`.
- NEXT_NOMINAL_SLOT: `2026-09-11T06:17:00Z`.
- PRODUCTION_READY_NOW: `NO - PENDING FINAL 72H SOAK`.

### Controlled crawl evidence

- CONTROLLED_CRAWL_1: GHA `34509256561`; crawl `a32c7356-8254-4390-9a38-fb0a04fec1aa`; `PASS`.
- CONTROLLED_CRAWL_2: GHA `34511360332`; crawl `17b938e2-a347-437f-99e9-d9b9cfd6ea99`; `PASS`.
- CONTROLLED_CRAWL_3: GHA `34512108642`; crawl `2d7218bd-92a3-466d-9749-d27004703fae`; `PASS`.
- CONTROLLED_CRAWL_INVARIANTS: all three had 7/7 sources, 126 discovered, 126 fetched, zero crawl errors, zero unexpected errors, and zero publications.
- CONTROLLED_CRAWL_DB: each had seven completed source rows, seven expected sources, zero crawl errors, and zero new claimables.
- SOAK_START: pending first genuine scheduled run after baseline.
- FINAL_CI_RUN: `34508399417`; Node 24 CI passed.
- FULL_TEST_COUNT: `593 tests across 73 test files passed`.
- INVENTORY_ACCEPTANCE: `372 tests across 51 test files passed`.
- BROWSER_SMOKE: `10 routes across two viewports passed`.
- FINAL_ROUTE_BROWSER_QA: `207 checks; 69 routes; 3 viewports; 0 failures`.

## Current authoritative snapshot

- CURRENT_HEAD: `439f56d55e119cd3cb40dc50ffd1a41e2029ecf8`.
- CURRENT_MAIN: `439f56d55e119cd3cb40dc50ffd1a41e2029ecf8`.
- CURRENT_PHASE: fresh baseline passed; final soak not started.
- UI_MERGE_SHA: `625bc9f922dd3a7b8eea67681ecedfc77e329a45`.
- RUNTIME_CANDIDATE_HEAD: `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`.
- NEW_RUNTIME_FREEZE_HEAD: `cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e`.
- POST_MERGE_RUNTIME_SENSITIVE_DIFF: `EMPTY` after `cfcc791`; no later runtime edits.
- EXACT_HEAD_CI: `PASS`; GHA run `34444804984` passed Node 24 gates.
- VERCEL_EXACT_HEAD: `PASS`; Preview deployment reports success.
- FRESH_BASELINE: `PASS`; manual GHA run `34509256561`.
- BASELINE_CRAWL_RUN: `a32c7356-8254-4390-9a38-fb0a04fec1aa`.
- BASELINE_FAILURE: none.
- BASELINE_INVARIANTS: 7/7 sources, zero crawl errors, zero unexpected errors, zero publications, sanitized artifact retained.
- CONNECTIVITY_PROBE: permanent relay probes `34508506486`, `34508568898`, `34508631422`, `34508694039`; sanitized evidence retained.
- CONNECTIVITY_ROOT_CAUSE: GitHub runner TCP timeout to shared TRAI IPv4 `164.100.85.161`; both official hostnames resolve there.
- CONNECTIVITY_FIX: 30-second connect timeout, bounded four-retry ceiling, capped jittered backoff.
- CLASSIFICATION_FIX: timeout with `:443` is `TIMEOUT`, never `HTTP_4XX`.
- RUNNER_MATRIX_GHA_RUN: `34455249230`; nine independent jobs completed.
- RUNNER_MATRIX_RESULT: Ubuntu, Windows, and macOS all failed TRAI; all passed SEBI.
- RUNNER_MATRIX_TRAI: `164.100.85.161`, IPv4 only; TCP, TLS, HEAD, and GET timed out.
- RUNNER_MATRIX_SEBI: `202.191.181.30`, `202.191.181.158`; strict TLS and GET passed.
- RELIABLE_STANDARD_RUNNER: `NONE`.
- TEMPORARY_MATRIX_WORKFLOW: removed after sanitized artifact capture.
- HUMAN_ACTION_REQUIRED: first-party runner with reliable TRAI reachability.
- MANUAL_WORKFLOW_DISPATCH_QUALIFICATION: `EXCLUDED`.
- LATEST_SCHEDULED_RUN: `34438700011`, event `schedule`, head `cc66de7485e6b3369d8bb0c8455184e01bb5db9d`, nominal slot `2026-09-10T00:17:00Z`.
- LATEST_SCHEDULED_RESULT: `FAIL`; 4/7 sources succeeded, SEBI RSS, SEBI public notices, and TRAI timed out; zero unexpected errors, zero publications, artifact retained.
- SCHEDULED_RUN_34438700011_QUALIFICATION: `EXCLUDED`; no successful fresh baseline existed beforehand.
- SCHEDULED_RUNS_AFTER_UI_MERGE: `34438700011` failed; no qualifying runs.
- NEXT_ACTION: await the next genuine scheduled slot; track the final 72-hour soak.
- PRODUCTION_READY_NOW: `NO - PENDING FINAL 72H SOAK`.

## Existing cloud egress investigation

- VERCEL_BUILD_PROBE: `dpl_Vhm34TnQmG1boEZweRyz99LERiVt`.
- VERCEL_BUILD_REGION: `iad1`; Node `v24.19.0`.
- VERCEL_TRAI: three rounds failed for both hostnames.
- VERCEL_TRAI_DNS: `164.100.85.161`, IPv4 only.
- VERCEL_TRAI_HTTP: HEAD and GET timed out.
- VERCEL_SEBI: GET passed across three rounds.
- SUPABASE_EDGE_PROBE: three invocations failed TRAI.
- SUPABASE_TRAI_DNS: `164.100.85.161`, IPv4 only.
- SUPABASE_TRAI_HTTP: HEAD and GET timed out.
- SUPABASE_SEBI: GET passed; apex RSS redirected.
- CLOUD_EGRESS_BLOCKED: `YES` for existing projects.
- VERCEL_TEMPORARY_CODE: removed; clean deployment `dpl_B64AsXnmzski5azACdYMAdA5TEvk`.
- SUPABASE_TEMPORARY_FUNCTION: active version 2; deletion unavailable here.
- SUPABASE_FUNCTION_AUTH: JWT verification enabled before handoff.
- SUPABASE_FUNCTION_SCOPE: fixed official targets; no caller URL; no secrets.
- NO_RELAY_SELECTED: existing cloud paths failed TRAI.
- EXTRA_PHYSICAL_DEVICE_REQUIRED: `NO`.

## Historical repository record

- CURRENT_HEAD: `6f22c5ef4119000318218f136f5416987a451877`
- CURRENT_MAIN: `6f22c5ef4119000318218f136f5416987a451877`
- CURRENT_PHASE: new final scheduled soak in progress
- BRANCH: `main`
- PR: `#2` completion merged; `#3` runtime repair merged
- ORIGINAL_USER_CHECKOUT_TOUCHED: `NO`

## Historical evidence record

- LAST_COMPLETED_GATE: repaired-main manual baseline
- REPAIR_SOURCE_HEAD: `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
- REPAIR_MAIN_PRE_MERGE_SHA: `7504f303099491132a804f723699197fa6334d8f`
- REPAIR_MERGE_SHA: `6f22c5ef4119000318218f136f5416987a451877`
- REPAIR_MERGE_PARENTS: `7504f303099491132a804f723699197fa6334d8f`, `d2234a8614447fc86827bf8e11ebc15fbea4ca75`
- REPAIR_MERGE_TIMESTAMP_UTC: `2026-09-07T15:31:12Z`
- REPAIR_CI_STATE: exact repair head passed run `34138348817`
- REPAIR_VERCEL_STATE: exact repair Preview is READY
- SUPABASE_STATE: target ref verified; run data corroborated
- PRE_SOAK_STATE: PASS, workflow run `33840659144`
- BASELINE_GHA_RUN: `34138764303` (manual baseline)
- BASELINE_CRAWL_RUN: `0fe7626a-3332-403d-b3d4-d66db3ddefb9`
- BASELINE_RESULT: PASS, repaired frozen main head verified
- BASELINE_COUNTS: 7 sources, 126 discovered, 126 fetched, 110 duplicates, 0 candidates
- BASELINE_ERRORS: zero crawl errors and zero unexpected errors
- BASELINE_PUBLICATIONS: zero automatic publications
- POLICY_GUARDS: staging, billing off, notifications off, live adapters on
- AUTH_STATE: PASS; Auth Admin API created three confirmed disposable users
- CUSTOMER_STATE: PASS; onboarding ownership and cross-user isolation verified
- ADMIN_STATE: PASS; admin surfaces verified, normal users blocked
- API_STATE: PASS; credentialed Auth and PostgREST runtime verified
- NOTIFICATIONS_STATE: PASS; ownership, read, dedup, and delivery privacy verified
- SECURITY_STATE: zero Security Advisor lints
- PERFORMANCE_STATE: expected unused-index and policy-performance notices
- AUTH_RUNTIME_RUN: `33968830120`, all stages passed, three users deleted
- CLEANUP_STATE: zero disposable profiles, onboarding rows, notifications, or delivery rows
- RUNTIME_FREEZE_HEAD: `6f22c5ef4119000318218f136f5416987a451877`
- RUNTIME_SENSITIVE_DIFF_AFTER_FREEZE: `EMPTY`
- SOAK_START_UTC: `2026-09-07T18:17:00Z`
- SOAK_START_IST: `2026-09-07T23:47:00+05:30`
- SOAK_START_RUN: `34163605422`
- SOAK_START_CRAWL_RUN: `2aa12fb7-e011-474b-a3b0-068f52d090bf`
- OLD_SOAK_STATE: `INVALIDATED_AFTER_RUNTIME_DEFECT`
- FAILED_SCHEDULED_RUN: `34123292686`, crawl `8aee683a-73d1-43d5-85a3-5266f9614c80`, IBBI U+0000 persistence failure
- INVALIDATED_PRIOR_QUALIFYING_RUNS: `34058094014`, `34084538536`
- NEW_FIRST_QUALIFYING_SLOT_UTC: `2026-09-07T18:17:00Z`
- NEW_FIRST_QUALIFYING_SLOT_IST: `2026-09-07T23:47:00+05:30`
- QUALIFYING_SCHEDULED_RUN_1: `34163605422`, slot `2026-09-07T18:17:00Z`, crawl `2aa12fb7-e011-474b-a3b0-068f52d090bf`, PASS
- QUALIFYING_RUN_1_INVARIANTS: 7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications
- QUALIFYING_SCHEDULED_RUN_2: `34188114057`, slot `2026-09-08T00:17:00Z`, crawl `898c47d8-2299-414b-a06b-8450c4c49862`, PASS
- QUALIFYING_RUN_2_INVARIANTS: 7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications
- QUALIFYING_SCHEDULED_RUN_3: `34220598983`, slot `2026-09-08T06:17:00Z`, crawl `196a1bd8-e33b-4bad-b689-d10a8a4b5e40`, PASS
- QUALIFYING_RUN_3_INVARIANTS: 7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications
- QUALIFYING_SCHEDULED_RUN_4: `34252651891`, slot `2026-09-08T12:17:00Z`, crawl `cdef4024-628e-4275-846e-af21efe84eca`, PASS
- QUALIFYING_RUN_4_INVARIANTS: 7/7 sources, 126 fetched, zero errors, zero unexpected errors, zero publications; 1 candidate queued, no publication
- QUALIFYING_RUN_4_HEAD: `32fb580e86c9d490cb0428f291c667f7d5538061` (documentation-only descendant of freeze)
- QUALIFYING_RUN_4_DELAYED_START_UTC: `2026-09-08T16:42:03Z`
- QUALIFYING_RUN_COUNT: `4`
- SOAK_ELAPSED_AT_2026-09-08T16:37:54Z: `22.3h`
- SOAK_48H: `PENDING_TIME_SOAK` - three valid scheduled runs
- SOAK_72H: `PENDING_TIME_SOAK` - three valid scheduled runs
- SCHEDULE_CRON: `17 */6 * * *`
- FIRST_SCHEDULED_SLOT_UTC: `2026-09-07T18:17:00Z`
- FIRST_SCHEDULED_SLOT_IST: `2026-09-07T23:47:00+05:30`
- NEXT_4_SCHEDULED_SLOTS_UTC: `2026-09-08T00:17:00Z`, `2026-09-08T06:17:00Z`, `2026-09-08T12:17:00Z`, `2026-09-08T18:17:00Z`
- SCHEDULED_RUN_34042559516: `PRE_FREEZE_NOMINAL_SLOT`, started `2026-09-06T15:31:11Z`
- SCHEDULED_RUN_34042559516_NOMINAL_SLOT: `2026-09-06T12:17:00Z`
- SCHEDULED_RUN_34042559516_QUALIFICATION: `EXCLUDED_FROM_FINAL_SOAK_QUALIFICATION`
- SCHEDULED_RUN_34042559516_PERMANENT_ACCOUNTING: excluded from all final soak counts
- SLOT_ACCOUNTING_STATE: delayed pre-freeze scheduled run excluded
- BASELINE_ACCOUNTING: workflow_dispatch baseline remains baseline-only
- SOAK_RESTART_REQUIRED: `YES` - runtime defect invalidated prior soak
- RUNTIME_SENSITIVE_DIFF: `REPAIR_REQUIRED` before new freeze; `EMPTY` after `6f22c5e`
- BASELINE_ACCOUNTING: workflow_dispatch run `34138764303` remains baseline-only
- SOAK_STATE: active; manual runs excluded from qualification

## Current final-candidate verification refresh

Updated: 2026-09-08

- CURRENT_HEAD: `5e65153039c745a371f1b06f360ae6c86bfe0afa`.
- FINAL_ROUTE_BROWSER_QA: `PASS`, GHA run `34276267445`.
- FINAL_ROUTE_BROWSER_QA_EVIDENCE: 207 checks, zero failures, zero axe violations.
- PUBLIC_AUTH_ROUTE_COVERAGE: 123 checks across three viewports.
- PROTECTED_ROUTE_COVERAGE: 84 entries require authenticated browser credentials.
- EXPECTED_NOT_FOUND_COVERAGE: 12 rendered dynamic 404 checks.
- EXACT_HEAD_CI: `PASS`.
- VERCEL_EXACT_HEAD: `PASS`.
- RUNTIME_SENSITIVE_DIFF: `PRESENT_BEFORE_FINAL_MERGE`; freeze pending.
- FINAL_CANDIDATE_STATUS: `READY_FOR_FINAL_MERGE_REVIEW`.
- HUMAN_ACTION: approve final merge after reviewing PR #4.

## Next action

Track genuine scheduled runs through the 72-hour window.

## Soak-safe finalization audit

Updated: 2026-09-08

- Documentation branch: `codex/claimradar-soak-safe-finalization`.
- Frozen runtime: `6f22c5ef4119000318218f136f5416987a451877`.
- Runtime-sensitive diff after freeze: `EMPTY_AFTER_FREEZE`.
- Public browser QA: `PASS_WITH_LIMITATION`.
- Accessibility: `MATERIAL_RUNTIME_FIX_REQUIRED`.
- Performance: `PASS_WITH_LIMITATION`.
- Supabase database: `PASS_WITH_LIMITATION`.
- Supabase Security Advisor: zero lints.
- Supabase performance: accepted low-traffic findings.
- Auth and SMTP: `EXTERNAL_CONFIGURATION_REQUIRED`.
- CSP: security-owner acceptance required for `unsafe-inline`.
- Vercel: READY staging; production controls remain external.
- Backup and recovery: external plan or export action required.
- Observability: existing evidence plus launch-alert actions required.
- Incident, rollback, deployment, and smoke runbooks: complete.

The WCAG audit found contrast, heading-order, accessible-name, and mobile
target-size defects. These require runtime frontend repair. The active soak is
not invalidated by this documentation-only branch. A repair requires a new
freeze, baseline, and soak clock.

## Resolved internal defects

- Added migration 017 for delivery-log hardening.
- Updated migration contract to expect 17 versions.
- Fixed credential-free crawler preflight defaults.
- Added exact staging-target workflow guards.
- Merged PR #2 with evidence-sensitive history preserved.
- Fixed IBBI PDF U+0000 persistence in PR #3.
- Merged PR #3; established new runtime freeze `6f22c5e`.
- Baseline run `34138764303` passed from repaired main.
- Added frozen-main baseline evidence and soak monitor.
- Corrected POSIX cron slot accounting before the first scheduled run.
- Classified delayed run `34042559516` against nominal slot `12:17Z`.
- Previously started qualification at run `34058094014` nominal slot `18:17Z`; later invalidated.
- Corrected elapsed-soak origin to first qualifying slot.
- Invalidated old soak after scheduled runtime defect run `34123292686`.

## External blockers

- New final soak requires real elapsed time.

## Final 100 completion candidate

Updated: 2026-09-08

- FINAL_BRANCH: `codex/claimradar-final-100`.
- FINAL_BASE: `origin/main` at `32fb580e86c9d490cb0428f291c667f7d5538061`.
- FINAL_CANDIDATE_STATUS: `IN_PROGRESS`.
- ROUTE_INVENTORY: `69` page routes, `1` API source, `7` server-action sources.
- ROUTE_MATRIX: `docs/checkpoints/final-route-state-matrix.md`.
- INVENTORY_GENERATOR: `scripts/generate-final-route-state-inventory.mjs`.
- ACCESSIBILITY_SOURCE_FIXES: `IMPLEMENTED; focused contract tests pass`.
- CSP_SOURCE_FIX: `IMPLEMENTED; nonce middleware replaces static script unsafe-inline`.
- LINT: `PASS`.
- TYPECHECK: `PASS`.
- CRAWLER_INVENTORY_ACCEPTANCE: `PASS; 48 files, 344 tests`.
- AUTH_RUNTIME_CONTRACT: `PASS; 5 tests`.
- MIGRATION_CONTRACT: `PASS; 17 ordered migrations`.
- FULL_TEST: `PARTIAL; 553 passed, 5 build-artifact checks blocked`.
- BUILD: `BLOCKED_BY_LOCAL_DISK; C drive reached zero free bytes`.
- CLIENT_BUNDLE_SCAN: `BLOCKED_BY_MISSING_FINAL_BUILD_OUTPUT`.
- GLOBAL_FORMAT: `LEGACY_BASELINE_WARNINGS; scoped candidate files pass`.
- RUNTIME_FREEZE_STATUS: `PENDING_FINAL_CANDIDATE_MERGE`.
- FINAL_ROUTE_BROWSER_QA: `ADDED_TO_EXACT_HEAD_CI; pending rerun`.
- HISTORICAL_FREEZE: `6f22c5ef4119000318218f136f5416987a451877`.
- PRODUCTION_READY_NOW: `NO`.

This section is authoritative for this candidate. Earlier entries describe
historical repaired-main evidence and the invalidated accessibility-era soak.

## Final candidate gate refresh

Updated: 2026-09-09

- CURRENT_HEAD: `74809dc2b1ec8467484d609a476d1d5095ed957d`.
- EXACT_HEAD_CI: `PASS`, GHA run `34308913068`.
- REMOTE_BUILD: `PASS`.
- REMOTE_FULL_TEST: `PASS`.
- REMOTE_FINAL_ROUTE_BROWSER_QA: `PASS`; 69 routes, 207 checks, zero failures.
- REMOTE_AXE_VIOLATIONS: `0`.
- VERCEL_EXACT_HEAD: `PASS`.
- ROUTE_COVERAGE: 123 public/auth checks; 84 protected entries require auth.
- FINAL_CANDIDATE_STATUS: `READY_FOR_FINAL_MERGE_REVIEW`.
- RUNTIME_FREEZE_STATUS: `PENDING_FINAL_MERGE_AND_BASELINE`.
- HUMAN_ACTION: approve final merge of PR #4.

## Zero-cost hosted egress evaluation

Updated: `2026-09-10`.

- Cloudflare temporary Worker probe: `PASS`, 20/20 fixed-target requests.
- Probe coverage: TRAI RSS, TRAI apex RSS, SEBI RSS, and SEBI notices.
- Probe result: HTTP 200, official bytes, zero redirects, all rounds.
- Permanent Cloudflare deployment: `NOT_AVAILABLE` in this workspace.
- Production relay: `NOT_LIVE`; no permanent endpoint or secret configured.
- Full staging crawls: `NOT_RUN`; no valid fresh baseline exists.
- Runtime freeze: `NOT_ESTABLISHED`; relay integration remains local-only.
- Soak: `NOT_STARTED`; manual diagnostics remain excluded.
- Current verdict: `BLOCKED` pending permanent free Cloudflare account setup.
- Scheduled run `34471357419`: `7/7`, zero crawl errors, zero publications.
- Scheduled crawl: `5c6b9e90-b01f-4481-a7d1-ffb266a03225`.
- Database corroboration: 7 completed source rows, zero crawl errors.
- This direct-fetch run remains baseline evidence only.
- It does not qualify the relay soak.

## UI perfection merge and fresh baseline

Updated: 2026-09-10

- MERGE_STATUS: `MERGED`
- MERGE_SHA: `625bc9f922dd3a7b8eea67681ecedfc77e329a45`
- SOURCE_HEAD: `01a9627a5180327f7aea95691c3240fdc8924141`
- MERGE_TIMESTAMP_UTC: `2026-09-10T02:07:16Z`
- EXACT_HEAD_CI: `PASS`, GHA run `34427810132`.
- VERCEL_EXACT_HEAD: `PASS`, deployment completed.
- PROTECTED_BROWSER_QA: `PASS`, GHA run `34429378945`.
- AUTH_RUNTIME_QA: `PASS`, GHA run `34429382482`.
- DISPOSABLE_USER_CLEANUP: `PASS`, three users deleted, no residual profiles.
- BASELINE_ATTEMPTS: `34428249855`, `34428871150`, `34429825500`, `34430830404`.
- BASELINE_RESULT: `BLOCKED`; each attempt had 6/7 sources.
- BASELINE_FAILURE: TRAI connection timeout at `www.trai.gov.in:443`.
- BASELINE_LATEST_CRAWL: `3b1540fe-ca2b-40cb-ae1a-5e6735bab556`.
- BASELINE_PUBLICATIONS: `0`.
- BASELINE_UNEXPECTED_ERRORS: `0`.
- BASELINE_ARTIFACTS: retained and sanitized.
- RUNTIME_CANDIDATE_HEAD: `625bc9f922dd3a7b8eea67681ecedfc77e329a45`.
- RUNTIME_SOAK: `NOT_STARTED`; manual baselines never qualify.
- PRODUCTION_READY_NOW: `NO - FRESH BASELINE REQUIRED`.

## Post-merge frozen-main baseline

Updated: 2026-09-09

- MERGE_STATUS: `MERGED`
- SOURCE_HEAD: `3c064681e4fd65aef4316f491a6050e631670e19`
- MAIN_PRE_MERGE_SHA: `32fb580e86c9d490cb0428f291c667f7d5538061`
- MERGE_SHA: `7f4834f23f48baeeb871afe3c0594fef9612b677`
- MERGE_PARENTS: `32fb580e86c9d490cb0428f291c667f7d5538061`, `3c064681e4fd65aef4316f491a6050e631670e19`
- MERGE_TIMESTAMP_UTC: `2026-09-09T07:56:21Z`
- RUNTIME_FREEZE_HEAD: `7f4834f23f48baeeb871afe3c0594fef9612b677`
- BASELINE_GHA_RUN: `34326475197` ([GitHub Actions run](https://github.com/Pavithran-R-A/claimradar-india/actions/runs/34326475197))
- BASELINE_HEAD: `7f4834f23f48baeeb871afe3c0594fef9612b677`
- BASELINE_CRAWL_RUN: `8ff537e8-a961-429a-a801-5393aaead1df`
- BASELINE_RESULT: `PASS`
- BASELINE_COUNTS: `7/7` sources, `126` discovered, `126` fetched
- BASELINE_ERRORS: `0` crawl errors, `0` unexpected errors
- BASELINE_PUBLICATIONS: `0` published, `0` queued, `0` candidate documents
- BASELINE_DB: `7` crawl_run_sources, all completed, `13` source documents retrieved in-window
- BASELINE_GUARDS: staging, billing off, notifications off, auto-verify off, live adapters on
- MANUAL_BASELINE_ACCOUNTING: excluded from soak qualification
- RUNTIME_SENSITIVE_DIFF_AFTER_FREEZE: `EMPTY`
- FIRST_POST_BASELINE_SCHEDULED_SLOT_UTC: `2026-09-09T12:17:00Z`
- FIRST_POST_BASELINE_SCHEDULED_SLOT_IST: `2026-09-09T17:47:00+05:30`
- NEXT_4_SCHEDULED_SLOTS_UTC: `2026-09-09T12:17:00Z`, `2026-09-09T18:17:00Z`, `2026-09-10T00:17:00Z`, `2026-09-10T06:17:00Z`
- SOAK_START_UTC: `PENDING_FIRST_QUALIFYING_SCHEDULED_RUN`
- SOAK_START_IST: `PENDING_FIRST_QUALIFYING_SCHEDULED_RUN`
- SOAK_48H: `PENDING_REAL_ELAPSED_TIME`
- SOAK_72H: `PENDING_REAL_ELAPSED_TIME`
- PRODUCTION_READY_NOW: `NO - PENDING FINAL SOAK`

## Final candidate gate refresh, latest

Updated: 2026-09-09

- CURRENT_HEAD: `3aa6eef4fd0f2644a39eff4c0c987c567b1ddadd`.
- EXACT_HEAD_CI: `PASS`, GHA run `34312344579`.
- FINAL_ROUTE_BROWSER_QA: `PASS`; 69 routes, 207 checks, zero failures.
- AXE_VIOLATIONS: `0`.
- VERCEL_EXACT_HEAD: `PASS`.
- FINAL_CANDIDATE_STATUS: `READY_FOR_FINAL_MERGE_REVIEW`.
- RUNTIME_FREEZE_STATUS: `PENDING_FINAL_MERGE_AND_BASELINE`.
- HUMAN_ACTION: approve final merge of PR #4.

## Final candidate gate refresh, latest

Updated: 2026-09-09

- CURRENT_HEAD: `4e0ae8e12b092dc9f61f960e7ede867cc8e0404d`.
- EXACT_HEAD_CI: `PASS`, GHA run `34311888166`.
- FINAL_ROUTE_BROWSER_QA: `PASS`; 69 routes, 207 checks, zero failures.
- AXE_VIOLATIONS: `0`.
- VERCEL_EXACT_HEAD: `PASS`.
- FINAL_CANDIDATE_STATUS: `READY_FOR_FINAL_MERGE_REVIEW`.
- RUNTIME_FREEZE_STATUS: `PENDING_FINAL_MERGE_AND_BASELINE`.
- HUMAN_ACTION: approve final merge of PR #4.

## Final candidate gate refresh, latest

Updated: 2026-09-09

- CURRENT_HEAD: `cb5478e91f0db32fc8e3de6f0206b51a04f46076`.
- EXACT_HEAD_CI: `PASS`, GHA run `34311512314`.
- FINAL_ROUTE_BROWSER_QA: `PASS`; 69 routes, 207 checks, zero failures.
- AXE_VIOLATIONS: `0`.
- VERCEL_EXACT_HEAD: `PASS`.
- FINAL_CANDIDATE_STATUS: `READY_FOR_FINAL_MERGE_REVIEW`.
- RUNTIME_FREEZE_STATUS: `PENDING_FINAL_MERGE_AND_BASELINE`.
- HUMAN_ACTION: approve final merge of PR #4.

## Final candidate gate refresh, latest

Updated: 2026-09-09

- CURRENT_HEAD: `817fdf5d5f0465dd425c665ba4bc4763724ba8f1`.
- EXACT_HEAD_CI: `PASS`, GHA run `34311026621`.
- FINAL_ROUTE_BROWSER_QA: `PASS`; 69 routes, 207 checks, zero failures.
- AXE_VIOLATIONS: `0`.
- VERCEL_EXACT_HEAD: `PASS`.
- FINAL_CANDIDATE_STATUS: `READY_FOR_FINAL_MERGE_REVIEW`.
- RUNTIME_FREEZE_STATUS: `PENDING_FINAL_MERGE_AND_BASELINE`.
- HUMAN_ACTION: approve final merge of PR #4.

## Final candidate proof-completion refresh, authoritative

Updated: 2026-09-09

- FINAL_HEAD: `17275fc8e25c865942321450d599bda44fe0c0c5`.
- PR #4 remains open and unmerged.
- Exact-head CI: `PASS`, GHA run `34321570779`.
- Public/auth route QA: `PASS`, 123 checks, zero failures.
- Protected browser QA: `PASS`, GHA run `34320450223`.
- Protected QA runtime head: `d617fcd375d7d47041316d1c78dc8bcd9c829e34`.
- Runtime tree unchanged after protected QA.
- Protected coverage: 28 routes across three viewports, 84 checks.
- Protected Axe, console, page, and overflow failures: `0`.
- Authenticated boundary checks: `1`, passed.
- Primary interactions: `11/11` verified.
- Disposable users: three created, confirmed, and deleted.
- Residual profiles: none.
- Manual browser accessibility categories: all pass.
- Route matrix: 69 routes, zero pending or unknown fields.
- Vercel exact-head state: `READY`.
- Direct Vercel route QA: blocked by deployment protection.
- RUNTIME_FREEZE_STATUS: `NOT_ESTABLISHED_UNTIL_MERGE`.
- MERGE_STATUS: `NOT_PERFORMED`; explicit hold remains active.
- PRODUCTION_READY_NOW: `NO`.

Direct deployment crawling needs the protected bypass credential.
That credential is unavailable in this workspace.

Local build limitations remain environmental only. The C drive is full.
Remote Node 24 gates provide the release build evidence.

## Final candidate gate refresh, latest

Updated: 2026-09-09

- CURRENT_HEAD: `7547f34e2d10f52804b65f65befacb747a978cca`.
- EXACT_HEAD_CI: `PASS`, GHA run `34310073132`.
- FINAL_ROUTE_BROWSER_QA: `PASS`; 69 routes, 207 checks, zero failures.
- AXE_VIOLATIONS: `0`.
- VERCEL_EXACT_HEAD: `PASS`.
- FINAL_CANDIDATE_STATUS: `READY_FOR_FINAL_MERGE_REVIEW`.
- RUNTIME_FREEZE_STATUS: `PENDING_FINAL_MERGE_AND_BASELINE`.
- HUMAN_ACTION: approve final merge of PR #4.
