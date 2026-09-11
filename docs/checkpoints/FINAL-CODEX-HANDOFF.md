# ClaimRadar India — Final Codex Handoff

**Created:** 2026-09-11T08:10:40Z
**Purpose:** continuation-safe release handoff
**Branch:** codex/claimradar-final-handoff
**Merge policy:** do not merge during active soak

## Executive status

The implementation is complete before soak.

The current release candidate is frozen.

The final soak is in progress.

Production release remains unapproved.

```text
CURRENT_MAIN = 60784e43d0013ffb5fa533b50a3efbba86017b87
RUNTIME_FREEZE_HEAD = cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e
RUNTIME_SENSITIVE_DIFF = EMPTY
BASELINE_GHA_RUN = 34509256561
BASELINE_CRAWL_RUN = a32c7356-8254-4390-9a38-fb0a04fec1aa
BASELINE_RESULT = PASS, manual, excluded from soak credit
FIRST_QUALIFYING_GHA_RUN = 34563498863
FIRST_QUALIFYING_CRAWL_RUN = 89a3af46-906a-4a71-a137-73cc197d8a4c
SOAK_START_NOMINAL_UTC = 2026-09-11T00:17:00Z
SOAK_START_IST = 2026-09-11T05:47:00+05:30
48H_THRESHOLD = 2026-09-13T00:17:00Z
72H_THRESHOLD = 2026-09-14T00:17:00Z
QUALIFYING_RUNS_SO_FAR = 1
FAILED_QUALIFYING_RUNS = 0
NEXT_NOMINAL_SLOT = 2026-09-11T12:17:00Z
PRODUCTION_READY_NOW = NO
```

The handoff branch starts at current origin/main.

The prior checkpoint branch remains unmerged.

That branch is codex/claimradar-baseline-checkpoint.

Its commit is 7796388a8579b507b16805e772c5b285a6d40ab8.

It is not part of this handoff.

## Architecture

### Frontend

- Next.js App Router powers the web app.
- Public pages use ISR and SSG.
- Auth pages use Supabase Auth.
- Customer pages use server rendering.
- Admin pages use protected server actions.
- Middleware refreshes authenticated sessions.
- Server cookies carry authenticated sessions.
- RLS remains the database boundary.

Major public routes include:

```text
/
/claimables
/claimables/[slug]
/companies
/companies/[slug]
/sectors
/sectors/[slug]
/states
/states/[slug]
/sources
/methodology
/how-it-works
/guides
/guides/[slug]
/questions/[slug]
/updates
/updates/[slug]
/about
/contact
/faq
/security
/privacy
/terms
/disclaimer
/acceptable-use
/corrections
/cookie-policy
/refund-policy
/subscription-policy
/deadlines
/pricing
/robots.txt
/sitemap.xml
```

Auth routes include login, registration, verification,
password reset, and callback handling.

Customer routes include:

```text
/app
/app/matches
/app/watchlist
/app/tracker
/app/notifications
/app/profile
/app/settings
/app/settings/unsubscribe
/app/privacy
/app/billing
```

Admin routes include dashboard, candidates,
claimables, companies, corrections, crawl runs,
reviews, sources, alerts, audit, AI runs,
users, and settings.

### Backend

- apps/crawler runs the ingestion worker.
- Source adapters discover official documents.
- HTTP access is rate limited.
- Content passes parser validation.
- AI extraction uses schemas.
- Deterministic checks validate extracted fields.
- Database writers persist traceable records.
- Claim scoring controls candidate handling.
- Publication guards prevent staging publication.

The main backend packages are:

```text
packages/shared-types       shared types and enums
packages/claim-schema       lifecycle and scoring schemas
packages/config             environment and feature flags
packages/source-registry    sources, URLs, adapters
packages/seo                metadata and sitemap helpers
packages/design-system      shared UI primitives
packages/database           database client and migrations
packages/test-utils         factories and test helpers
```

### Supabase

Staging project:

```text
PROJECT_REF = upvsfqufkywlpibbwrse
PROJECT_NAME = claimradar-staging
PROJECT_URL = https://upvsfqufkywlpibbwrse.supabase.co
REGION = ap-northeast-1
STATUS = ACTIVE_HEALTHY at handoff verification
```

Supabase provides Postgres, Auth, and Storage.

RLS uses authenticated ownership boundaries.

Privileged operations use server-only clients.

Never place service keys client-side.

### Crawler sources

The frozen initial source set has seven entries.

| Source              | Official endpoint or domain                                      |
| ------------------- | ---------------------------------------------------------------- |
| RBI Press Releases  | https://www.rbi.org.in/pressreleases_rss.xml                     |
| RBI Notifications   | https://www.rbi.org.in/notifications_rss.xml                     |
| SEBI RSS            | https://www.sebi.gov.in/sebirss.xml                              |
| SEBI Public Notices | https://www.sebi.gov.in                                          |
| PIB RSS             | https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3&reg=3 |
| IBBI Announcements  | https://ibbi.gov.in                                              |
| TRAI RSS            | https://www.trai.gov.in/rss.xml                                  |

Only official or approved sources count.

No unofficial mirrors are authoritative.

### Cloudflare TRAI relay

```text
WORKER_NAME = claimradar-trai-relay
WORKER_URL = https://claimradar-trai-relay.first-moonflower.workers.dev/fetch
DEPLOYMENT_GHA = 34507290715
RELAY_PROBES = 34508506486, 34508568898, 34508631422, 34508694039
RELAY_RESULT = 20/20 signed requests passed
```

The crawler tries TRAI directly first.

The relay handles bounded failures only.

Fallback classes are timeout, network error,
DNS failure, or connect failure.

The Worker permits official TRAI targets.

It accepts signed GET and HEAD requests.

It validates target host and path.

It rejects private and metadata addresses.

It preserves strict TLS validation.

It keeps HTTPS official redirects only.

It disables caching and streams responses.

The response size limit is 50 MB.

Relay authentication uses TRAI_RELAY_SHARED_SECRET.

The endpoint uses TRAI_RELAY_URL.

Cloudflare CI uses these names only:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

No secret values belong in this file.

## Configuration inventory

The staging workflow references these secret names:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
TRAI_RELAY_URL
TRAI_RELAY_SHARED_SECRET
OPENROUTER_API_KEY
NVIDIA_API_KEY
SENTRY_DSN
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Verified configured staging secrets are:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
SUPABASE_SECRET_KEY
SUPABASE_URL
TRAI_RELAY_SHARED_SECRET
TRAI_RELAY_URL
```

Optional workflow references are not assumed configured.

The staging workflow references these variable names:

```text
AI_PROVIDER
AI_DAILY_REQUEST_BUDGET
SUPABASE_PUBLISHABLE_KEY
```

The workflow pins these safety values:

```text
APP_ENV=staging
EXPECTED_STAGING_SUPABASE_PROJECT_REF=upvsfqufkywlpibbwrse
AUTO_VERIFY_CLAIMABLES=false
ENABLE_BILLING=false
NOTIFY_CUSTOMERS_ENABLED=false
LIVE_ADAPTERS_ENABLED=true
```

The crawler also uses these names:

```text
CRAWLER_USER_AGENT
TRAI_RELAY_TIMEOUT_MS
CRAWLER_SUMMARY_FILE
DRY_RUN
```

Values remain omitted intentionally.

## External resources

```text
GITHUB_REPOSITORY = Pavithran-R-A/claimradar-india
GITHUB_URL = https://github.com/Pavithran-R-A/claimradar-india
SUPABASE_PROJECT_REF = upvsfqufkywlpibbwrse
SUPABASE_URL = https://upvsfqufkywlpibbwrse.supabase.co
VERCEL_PROJECT = claimradar-staging
PRODUCTION_DOMAIN = https://claimradar.in
STAGING_DOMAIN = https://claimradar-staging.vercel.app
INSPECTED_PREVIEW = https://claimradar-staging-pqkk2cmy5-pavithrans-projects-cae184b1.vercel.app
CLOUDFLARE_WORKER = claimradar-trai-relay
CLOUDFLARE_URL = https://claimradar-trai-relay.first-moonflower.workers.dev/fetch
```

The inspected preview URL is historical.

Verify deployment identity before release.

## Quality matrix

Statuses reflect evidence available now.

| Gate                 | Status               | Evidence or boundary                      |
| -------------------- | -------------------- | ----------------------------------------- |
| Frontend/UI          | PASS                 | Final route evidence passed.              |
| Responsive QA        | PASS                 | Two-view and three-viewport evidence.     |
| Route QA             | PASS                 | 207 checks passed.                        |
| Accessibility        | PASS                 | Zero recorded Axe violations.             |
| Browser QA           | PASS                 | Browser smoke passed ten routes.          |
| Protected browser QA | PASS                 | GHA 34429378945 passed.                   |
| Auth                 | PASS                 | GHA 34429382482 passed.                   |
| Customer isolation   | PASS                 | Disposable user isolation passed.         |
| Admin boundaries     | PASS                 | Normal-user admin denial passed.          |
| API                  | PASS                 | Credentialed API checks passed.           |
| Database             | PASS                 | Staging crawl rows corroborated.          |
| RLS                  | PASS                 | Protected table checks passed.            |
| Notifications        | PASS                 | Safe notification tests passed.           |
| Crawler              | PASS_WITH_LIMITATION | One qualifying soak run.                  |
| Cloudflare relay     | PASS                 | 20/20 signed probes passed.               |
| Security             | PASS                 | Security audit and boundary tests passed. |
| Secret scan          | PASS                 | No client secret matches recorded.        |
| Format               | PASS                 | Node 24 CI passed.                        |
| Lint                 | PASS                 | Node 24 CI passed.                        |
| Typecheck            | PASS                 | Node 24 CI passed.                        |
| Tests                | PASS                 | 593 tests, 73 files.                      |
| Inventory acceptance | PASS                 | 372 tests, 51 files.                      |
| Build                | PASS                 | Node 24 CI build passed.                  |
| Vercel staging       | PASS_WITH_LIMITATION | Preview passed; production pending.       |
| Supabase staging     | PASS                 | Project active and healthy.               |
| Rollback             | PASS_WITH_LIMITATION | Runbook exists; rollback unexecuted.      |
| Incident response    | PASS_WITH_LIMITATION | Runbook exists; no live incident.         |
| Deployment runbook   | PASS_WITH_LIMITATION | Procedure exists; approval pending.       |

## Exact test totals

These totals are pre-soak evidence.

```text
NODE_24_CI = 593 tests across 73 files
INVENTORY_ACCEPTANCE = 372 tests across 51 files
BROWSER_SMOKE = 10 routes across two viewports
FINAL_ROUTE_QA = 207 checks across 69 routes and three viewports
AXE_VIOLATIONS = 0 recorded
CONSOLE_ERRORS = 0 recorded
PAGE_ERRORS = 0 recorded
OVERFLOW_FAILURES = 0 recorded
CONTROLLED_STAGING_CRAWLS = 3 passed
CLOUDFLARE_RELAY_PROBES = 20/20 signed requests
```

The first qualifying crawl also passed seven sources.

## Current soak evidence

### Baseline

GHA 34509256561 used workflow_dispatch.

Its crawl was a32c7356-8254-4390-9a38-fb0a04fec1aa.

It passed seven of seven sources.

It found and fetched 126 documents.

It recorded zero crawl errors.

It recorded zero unexpected errors.

It recorded zero publications.

It retained a sanitized artifact.

It is baseline-only and gets zero soak credit.

### First qualifying scheduled run

GHA 34563498863 is the first qualifier.

It ran on main at frozen head 60784e43....

Its event is schedule.

Its crawl is 89a3af46-906a-4a71-a137-73cc197d8a4c.

Its nominal slot is 2026-09-11T00:17:00Z.

The run started at 04:47:10Z.

Delayed execution still maps to 00:17Z.

Its artifact is staging-soak-summary.

Artifact ID is 10185279225.

Artifact retention is active.

Artifact SHA256 is 7572e6311d859e6abffb8f4db172f06fbc8e28fa30b9690d96f6b8930e238481.

The artifact reported:

```text
sourcesAttempted = 7
sourcesSucceeded = 7
sourcesFailed = 0
documentsDiscovered = 126
documentsFetched = 126
documentsDuplicate = 126
candidatesCreated = 0
aiCallsUsed = 0
recordsPublished = 0
recordsQueued = 0
recordsRejected = 0
errorCount = 0
unexpectedErrorCount = 0
```

The effective guards were correct.

```text
APP_ENV=staging
AUTO_VERIFY_CLAIMABLES=false
ENABLE_BILLING=false
NOTIFY_CUSTOMERS_ENABLED=false
LIVE_ADAPTERS_ENABLED=true
```

Supabase corroboration matched the artifact.

```text
crawl_runs.status = completed
crawl_runs.sources_attempted = 7
crawl_runs.sources_succeeded = 7
crawl_runs.documents_discovered = 126
crawl_run_sources = 7 completed rows
crawl_errors = 0
```

All seven source rows had null errors.

All 126 documents were duplicates.

No new claimable was created.

### Slot accounting

The workflow cron is 17 */6 * * *.

Nominal UTC slots are 00:17, 06:17,
12:17, and 18:17 each day.

Use the latest nominal slot at or before
the scheduled run start time.

Allow GitHub schedule delays.

Never use completion time alone.

Only event=schedule can qualify.

Every workflow_dispatch run gets zero credit.

The baseline remains baseline-only.

The configured minimums are:

```text
48H_TOTAL_RUNS = 8
48H_SCHEDULED_RUNS = 7
72H_TOTAL_RUNS = 12
72H_SCHEDULED_RUNS = 11
```

No manual run fills scheduled counts.

## Read-only soak playbook

Run these commands from a clean checkout.

```powershell
git fetch origin --prune
git status --short --branch
git rev-parse origin/main
gh api repos/Pavithran-R-A/claimradar-india/actions/workflows/staging-soak.yml/runs?per_page=50
gh run view <RUN_ID> --repo Pavithran-R-A/claimradar-india
gh run download <RUN_ID> --name staging-soak-summary --dir <TEMP_DIR>
node --env-file=.env.staging scripts/summarize-soak-readiness.mjs
```

These operations are read-only.

Artifact download writes only temporary files.

Inspect sanitized JSON before counting.

Confirm event and head SHA.

Confirm nominal slot mapping.

Confirm seven source successes.

Confirm zero errors and publications.

Confirm guard values and artifact retention.

Confirm crawl_runs and source rows.

The summarizer uses GitHub and Supabase reads.

Do not dispatch workflows during qualification.

Do not modify runtime files.

## Failure decision tree

### A. Run passes seven sources

Verify every invariant independently.

Assign its latest nominal slot.

Count it only when eligible.

Record run and crawl IDs.

### B. Run is delayed

Use run start time attribution.

Map to the latest prior slot.

Do not create an extra slot.

Keep the schedule clock unchanged.

### C. Run never appears

Do not invent a run.

Record the missing nominal slot.

Inspect later schedule runs.

GitHub may delay or drop schedules.

Do not manually credit dispatch runs.

### D. GitHub infrastructure fails

Preserve run and job evidence.

Classify infrastructure failure accurately.

Do not count a failed run.

Await the next genuine slot.

Escalate repeated provider failures.

### E. One official source fails

Stop soak qualification immediately.

Preserve sanitized artifact and database IDs.

Determine network versus source behavior.

Do not mark seven of seven.

Runtime repair requires a new freeze.

### F. Cloudflare relay fails

Stop if TRAI cannot qualify.

Check signed request evidence.

Check Worker version and secret names.

Do not use a mirror.

Do not bypass TLS or SSRF checks.

### G. Crawler bug appears

Invalidate the active soak.

Branch from the affected candidate.

Add regression coverage first.

Run all authoritative gates.

Merge only with approval.

Establish a new runtime freeze.

Create a new baseline.

Restart the 72-hour clock.

### H. Database persistence fails

Stop qualification and publication.

Preserve crawl and database evidence.

Check schema and writer logs.

Never guess a reverse migration.

Use reviewed forward repair only.

Require a new baseline afterward.

### I. Unexpected publication occurs

Treat it as a release blocker.

Preserve claim and audit records.

Disable publication using approved controls.

Notify the release owner.

Do not delete evidence.

Require security and editorial review.

## Post-72-hour release procedure

1. Run the soak summarizer.
2. Verify the final PASS.
3. Verify every qualifying schedule.
4. Confirm zero failed qualifiers.
5. Confirm runtime diff remains empty.
6. Confirm main contains the freeze.
7. Run final non-mutating gates.
8. Verify Vercel staging health.
9. Verify Supabase project health.
10. Verify Worker health and probes.
11. Request production approval.
12. Promote through the release process.
13. Run production smoke checks.
14. Review application and crawl logs.
15. Confirm no test users remain.
16. Confirm no test data remains.
17. Tag or release when required.
18. Mark complete only afterward.

Existing gate commands include:

```powershell
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify:migrations
node scripts/verify-client-bundle-secrets.mjs
```

Run staging-specific checks only with authorization.

Do not deploy during active soak.

## Production smoke checklist

| Check                | Expected result                      |
| -------------------- | ------------------------------------ |
| /                    | Loads branded home page.             |
| /claimables          | Lists verified public claimables.    |
| One claim dossier    | Shows source trace and status.       |
| Search               | Returns truthful matching results.   |
| /companies           | Directory loads correctly.           |
| /sectors             | Sector directory loads correctly.    |
| /sources             | Official source list appears.        |
| /methodology         | Methodology content is visible.      |
| /login               | Login form loads securely.           |
| /register            | Registration validates input.        |
| Password flow        | Reset and callback behave safely.    |
| Customer dashboard   | Authenticated owner data appears.    |
| Watchlist            | Owner can manage entries.            |
| Tracker              | Owner can manage tracking.           |
| Notifications        | Preferences load safely.             |
| Profile/settings     | Owner settings remain isolated.      |
| Admin login boundary | Normal users are denied.             |
| Admin dashboard      | Admin sees intended surface.         |
| Admin crawl/audit    | Admin data loads read-only.          |
| Critical APIs        | Auth and ownership checks pass.      |
| Unknown route        | Returns controlled 404.              |
| /robots.txt          | Correct crawl directives appear.     |
| /sitemap.xml         | Canonical URLs appear.               |
| Canonical metadata   | Matches production origin.           |
| Security headers     | Required headers are present.        |
| CSP                  | Allows only approved connections.    |
| TRAI relay           | Signed official request succeeds.    |
| Crawler execution    | Seven sources and zero errors.       |
| Supabase database    | Rows and audit trace match.          |
| Auth and RLS         | Ownership and roles remain enforced. |

Production smoke needs owner access.

Preview evidence cannot replace it.

## Rollback playbook

```text
LAST_KNOWN_GOOD_RUNTIME_SHA = cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e
CURRENT_RUNTIME_FREEZE = cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e
```

Do not execute rollback during handoff.

Contain first and preserve evidence.

1. Declare incident and severity.
2. Stop promotion and deployments.
3. Disable publication through approved controls.
4. Preserve Vercel, Worker, and database IDs.
5. Select the last verified Vercel deployment.
6. Use Vercel deployment rollback controls.
7. Record deployment URL, ID, SHA, operator.
8. Roll back the Worker version.
9. Use Cloudflare Worker Deployments history.
10. Never deploy unknown Worker source.
11. Do not reverse Supabase migrations blindly.
12. Stop crawler scheduling if required.
13. Disable the workflow only by approval.
14. Verify authentication and RLS.
15. Verify source health and zero errors.
16. Verify zero unexpected publications.
17. Run the production smoke checklist.
18. Decide whether a new soak starts.

Repository rollback references include:

```text
docs/runbooks/rollback-runbook.md
docs/OPERATIONS_AND_RECOVERY.md
docs/runbooks/deployment-runbook.md
```

The repository documents Vercel aliasing.

Use only an approved verified deployment.

## Release blocker matrix

| Blocker                 | Owner            | Current status           | Resolution                          | Without Codex              |
| ----------------------- | ---------------- | ------------------------ | ----------------------------------- | -------------------------- |
| Final 72-hour soak      | Release operator | PENDING_TIME             | Pass 11 scheduled runs.             | Yes, read-only monitoring. |
| Final 48-hour readiness | Release operator | PENDING_TIME             | Pass seven scheduled runs.          | Yes, read-only monitoring. |
| Production smoke        | Release owner    | PENDING_AFTER_SOAK       | Run checklist after approval.       | Yes, with access.          |
| Production approval     | Owner            | PENDING_HUMAN_AFTER_SOAK | Approve release explicitly.         | No, owner decision.        |
| Production controls     | Owner            | EXTERNAL_ACTION_REQUIRED | Confirm SMTP, DNS, backups, alerts. | Yes, with provider access. |

No implementation blocker is proven currently.

## Repository hygiene

Current repository state was inspected.

```text
OPEN_PRS = 0 at handoff verification
HANDOFF_BASE = origin/main
MAIN_MODIFIED = no
RUNTIME_FILES_CHANGED = no
```

Existing branches need cautious review.

Do not delete them automatically.

Observed cleanup candidates include:

```text
codex/claimradar-baseline-checkpoint
codex/claimradar-probe-bootstrap
codex/claimradar-relay-bootstrap
codex/claimradar-final-100
codex/claimradar-completion
codex/claimradar-soak-safe-finalization
```

The baseline checkpoint branch remains unmerged.

The diagnostic workflow was removed.

Ignored generated directories also exist locally:

```text
node_modules/
apps/*/node_modules/
apps/web/.next/
packages/*/dist/
apps/crawler/dist/
*.tsbuildinfo
```

Prior scratch captures are local only.

No cleanup action was performed.

Never remove evidence during soak.

## Post-release v1.1 backlog

These are optional improvements only.

- Gather real-user usability feedback.
- Add richer source freshness dashboards.
- Add operational latency summaries.
- Add performance trend tracking.
- Add more official source families.
- Add analytics for search and claims.
- Add scheduled artifact retention reporting.
- Improve release owner notification tooling.

Do not mix backlog items with blockers.

Do not implement them during soak.

## Final self-audit

### Is unfinished implementation work proven?

No unfinished implementation work is proven.

The final time gate remains open.

### Is any critical route untested?

No untested critical route is proven.

Route evidence covered 69 routes.

Production smoke remains pending.

### Is any security boundary unverified?

No unverified implemented boundary is proven.

Production owner controls remain external.

### Is any required staging secret missing?

The passing baseline proves required staging runtime access.

Production configuration still needs owner confirmation.

Values are intentionally absent here.

### Is Cloudflare permanent?

Yes, the qualified Worker is permanent.

Temporary probe Workers are not infrastructure.

### Is TRAI fallback production-ready?

Yes, pre-soak relay evidence passed.

The soak must still remain clean.

### Is the fresh baseline valid?

Yes, baseline 34509256561 passed.

It remains excluded from soak counts.

### Has the soak started?

Yes, one scheduled run qualifies.

The 72-hour gate remains future.

### Is runtime frozen?

Yes, at cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e.

The current main diff is runtime-empty.

### Does any task justify modifying main?

No. Documentation handoff is side-branch only.

No main modification or merge is authorized.

## Continuation rules

The next agent should monitor only.

Use genuine scheduled executions on main.

Exclude every manual execution permanently.

Keep the runtime freeze unchanged.

At 48 hours, verify thresholds.

At 72 hours, verify final thresholds.

Then request production approval.

Do not call ClaimRadar 100% early.

Completion requires soak and smoke.
