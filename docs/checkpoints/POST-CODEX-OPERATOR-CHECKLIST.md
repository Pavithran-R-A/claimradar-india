# ClaimRadar India — Post-Codex Operator Checklist

**Use during active final soak.**

## Current qualification state

```text
CURRENT_MAIN = 60784e43d0013ffb5fa533b50a3efbba86017b87
RUNTIME_FREEZE_HEAD = cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e
SOAK_START = 2026-09-11T00:17:00Z
48H_GATE = 2026-09-13T00:17:00Z
72H_GATE = 2026-09-14T00:17:00Z
QUALIFYING_RUNS = 1
FAILED_RUNS = 0 qualifying runs
NEXT_NOMINAL_SLOT = 2026-09-11T12:17:00Z
```

The next slot uses current evidence time.

Baseline runs receive zero soak credit.

## Read-only commands

```powershell
git fetch origin --prune
git status --short --branch
git rev-parse origin/main
gh api repos/Pavithran-R-A/claimradar-india/actions/workflows/staging-soak.yml/runs?per_page=50
gh run view <RUN_ID> --repo Pavithran-R-A/claimradar-india
gh run download <RUN_ID> --name staging-soak-summary --dir <TEMP_DIR>
node --env-file=.env.staging scripts/summarize-soak-readiness.mjs
git diff --name-only cfcc791c937ce26faeb7c5e6dc1f0bd63541d61e origin/main -- . ':!docs/checkpoints/*'
```

Inspect artifacts in temporary directories.

Do not dispatch or rerun workflows.

## What not to touch

```text
main
apps/**
packages/**
supabase/migrations/**
.github/workflows/staging-soak.yml
crawler runtime
Worker runtime
Vercel runtime
database schema
auth
security policies
production workflows
cron configuration
retry behavior
source adapters
```

Do not expose secret values.

Allowed names include:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
TRAI_RELAY_URL
TRAI_RELAY_SHARED_SECRET
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

## When soak must restart

Restart qualification after any proven runtime defect.

Restart after any runtime-sensitive change.

Restart after a failed official-source invariant.

Restart after a relay failure affecting TRAI.

Restart after a database persistence failure.

Restart after unexpected publication.

Restart after a changed runtime freeze.

A restart requires repair, gates,
new freeze, new baseline, and 72 hours.

Do not restart for schedule delay.
Do not restart for missing schedule visibility.
Do not restart for documentation-only changes.

## When to request production approval

Request approval only after:

- 72-hour time threshold passes
- eleven scheduled runs qualify
- every run passes seven sources
- zero crawl errors remain
- zero unexpected errors remain
- zero publications remain
- guards remain correct
- artifacts remain retained
- database rows match
- runtime diff remains empty
- final summarizer reports PASS
- final gates pass

Production approval remains human-owned.

## Production smoke checklist

Check each item after approval:

```text
/
claimables directory
one claim dossier
search
companies
sectors
sources
methodology
login and registration
password flow
customer dashboard
watchlist and tracker
notifications
profile and settings
admin denial boundary
admin dashboard
admin crawl and audit
critical API routes
controlled 404
robots.txt
sitemap.xml
canonical metadata
security headers
CSP
signed TRAI relay
seven-source crawler
Supabase database
Auth and RLS
```

Record evidence for every check.

Preview proof cannot replace production proof.

## One-hundred-percent rule

ClaimRadar is not 100% complete
until final soak passes
and production smoke passes.

Until then:

```text
PRODUCTION_READY_NOW = NO
FINAL_STATUS = PENDING_FINAL_SOAK_AND_PRODUCTION_SMOKE
```

Do not alter the frozen candidate.
