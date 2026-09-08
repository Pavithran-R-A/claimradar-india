# Deployment Runbook

## Scope

Use this procedure for approved ClaimRadar releases.

Never deploy during an active soak.

## Preconditions

- Confirm the approved release SHA.
- Confirm the runtime freeze SHA.
- Confirm exact-head CI passed.
- Confirm Vercel deployment is READY.
- Confirm Supabase target ref and migrations.
- Confirm environment variables without printing values.
- Confirm SMTP, DNS, backups, and alerts.
- Confirm release owner and rollback owner.

## Deploy

1. Record SHA, operator, and UTC time.
2. Verify branch protection and review state.
3. Promote the approved Vercel deployment.
4. Confirm domain, SSL, and protection.
5. Run the post-deploy smoke plan.
6. Check workflow, application, and database logs.
7. Announce success with evidence links.

Stop immediately on auth, data, crawl, or security failure.

## Verification

Check home, search, directory, login, authorization, and admin denial.
Check one read-only API path and one scheduled-crawl health signal.
Check zero unexpected publications and zero new errors.

## Communication

Record release SHA, deployment ID, smoke result, owner, and next review time.
Never include tokens, passwords, cookies, or secret values.
