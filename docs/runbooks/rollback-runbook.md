# Rollback Runbook

## Trigger

Rollback for data corruption, auth bypass, security exposure, crawl failure,
publication error, sustained 5xx errors, or failed smoke checks.

## Contain

1. Declare the incident and severity.
2. Stop promotion and scheduled release activity.
3. Disable publication through approved controls.
4. Preserve deployment, workflow, and database evidence.
5. Notify the incident owner and stakeholders.

## Execute

Use the repository-approved Vercel rollback or promotion process. Select the
last verified READY deployment. Record deployment ID, URL, SHA, operator, and
UTC time. Never use an unverified alias as rollback evidence.

If schema compatibility is uncertain, stop. Do not reverse migrations by
guessing. Use a forward-compatible repair after review.

## Verify

Run the post-deploy smoke plan. Check authentication boundaries, ownership
isolation, source health, API status, publication state, and error counts.
Confirm the rollback deployment SHA exactly.

## Close

Keep all logs and artifacts. Write a timeline and root-cause report. Record
whether data repair, secret rotation, or a new soak is required.
