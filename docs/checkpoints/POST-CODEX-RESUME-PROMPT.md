# ClaimRadar India — Post-Codex Resume Prompt

Copy the prompt below completely.

```text
Resume ClaimRadar India from the existing handoff.

First read:
docs/checkpoints/FINAL-CODEX-HANDOFF.md

Do not modify main.
Do not modify runtime code.
Do not merge anything.
Do not dispatch workflows.
Do not reset the soak.

Treat origin/main as authoritative.
Inspect live GitHub state first.

Run only these existing commands:

git fetch origin --prune
git status --short --branch
git rev-parse origin/main
gh api repos/Pavithran-R-A/claimradar-india/actions/workflows/staging-soak.yml/runs?per_page=50
gh run view <RUN_ID> --repo Pavithran-R-A/claimradar-india
gh run download <RUN_ID> --name staging-soak-summary --dir <TEMP_DIR>
node --env-file=.env.staging scripts/summarize-soak-readiness.mjs

Use only genuine event=schedule runs.
Require head_branch=main.
Exclude every workflow_dispatch run.
Do not credit manual baselines.
Do not create missing runs.

Preserve this runtime freeze:

RUNTIME_FREEZE_HEAD =
cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e

Compare runtime changes with:

git diff --name-only cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e origin/main -- . ':!docs/checkpoints/*'

Any runtime-sensitive change invalidates qualification.
Stop counting runs after such change.
Require a reviewed repair branch.
Run the existing gates.
Merge only with approval.
Establish a new runtime freeze.
Create a new baseline.
Restart the 72-hour soak.

Keep this cron unchanged:

17 */6 * * *

Nominal slots are 00:17, 06:17,
12:17, and 18:17 UTC.

Attribute each run to the latest nominal slot.
Use the run start time for attribution.
Allow GitHub schedule delays.
Never use completion time alone.

Current soak records are:

BASELINE_GHA_RUN = 34509256561
BASELINE_CRAWL_RUN =
a32c7356-8254-4390-9a38-fb0a04fec1aa
BASELINE_RESULT = PASS, manual, excluded

FIRST_QUALIFYING_GHA_RUN = 34563498863
FIRST_QUALIFYING_CRAWL_RUN =
89a3af46-906a-4a71-a137-73cc197d8a4c
SOAK_START_NOMINAL_UTC = 2026-09-11T00:17:00Z
SOAK_START_IST = 2026-09-11T05:47:00+05:30
48H_GATE = 2026-09-13T00:17:00Z
72H_GATE = 2026-09-14T00:17:00Z
QUALIFYING_RUNS_SO_FAR = 1
FAILED_QUALIFYING_RUNS = 0
NEXT_NOMINAL_SLOT_AT_HANDOFF = 2026-09-11T12:17:00Z

For each qualifying run, verify:

- event is schedule
- branch is main
- head observes the freeze
- all seven sources succeed
- zero crawl errors occur
- zero unexpected errors occur
- zero publications occur
- staging guards remain correct
- artifact remains sanitized
- artifact remains retained
- crawl_runs row matches
- seven source rows match
- crawl_errors count is zero

Do not count a run without evidence.
Do not call the soak complete early.
Wait honestly for both gates.

At 48 hours, verify:
the configured seven scheduled-run minimum.
Record readiness only after evidence.

At 72 hours, verify:
the configured eleven scheduled-run minimum.
Run the summarizer again.
Verify every qualifying run.
Require final PASS.

If a run is delayed, wait.
If a slot is missing, record it.
If infrastructure fails, exclude it.
If an official source fails, stop qualification.
If the relay fails, stop qualification.
If the database fails, stop qualification.
If publications exceed zero, stop qualification.
If a crawler defect appears, restart qualification.

After final soak PASS:

1. Verify the final summarizer PASS.
2. Verify all qualifying scheduled runs.
3. Confirm runtime diff stays empty.
4. Confirm main contains the freeze.
5. Run these existing non-mutating gates:

pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify:migrations
node scripts/verify-client-bundle-secrets.mjs

6. Verify Vercel staging health.
7. Verify Supabase project health.
8. Verify Cloudflare relay health.
9. Request explicit production approval.
10. Follow docs/runbooks/deployment-runbook.md.
11. Deploy only through approval.
12. Run the full production smoke checklist.
13. Review application and crawl logs.
14. Confirm no test users remain.
15. Confirm no test data remains.
16. Mark ClaimRadar 100% only afterward.

Production smoke must cover:

/
claimables
one real claim dossier
search
companies
sectors
sources
methodology
login
register
password flow
customer dashboard
watchlist
tracker
notifications
profile/settings
admin boundaries
admin dashboard
admin crawl and audit
critical APIs
404
robots.txt
sitemap.xml
canonical metadata
security headers
CSP
Cloudflare TRAI relay
crawler execution
Supabase database
Auth and RLS

Never print secrets, passwords, tokens,
cookies, or secret values.
Secret names are allowed.
Use only existing scripts and runbooks.
Do no new feature work.
Do no runtime development.
```
