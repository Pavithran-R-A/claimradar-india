# Incident Response Runbook

## First response

1. Assign incident commander and technical owner.
2. Record UTC start time and severity.
3. Preserve sanitized logs, runs, and database IDs.
4. Stop publication when integrity is uncertain.
5. Avoid exposing personal data or secrets.

## Source outage

Check the affected adapter, HTTP status, freshness, and recent source change.
Keep other sources running when safe. Mark the source unavailable. Do not
publish incomplete or unverified claims. Escalate repeated failures.

## Supabase or database outage

Check project status, API health, connection exhaustion, migrations, and recent
errors. Preserve the last known good deployment. Disable writes or
publication when consistency is uncertain. Restore only under owner approval.

## Vercel outage

Check deployment state, domain, SSL, protection, function errors, and region.
Use the last verified deployment if rollback is safe. Record provider status
and all deployment IDs.

## Auth outage

Check Supabase Auth status, redirect URLs, SMTP delivery, confirmation state,
and rate limits. Do not bypass authorization. Never create test users through
public signup during diagnosis.

## Security incident

Contain access, preserve evidence, rotate affected secrets, and revoke active
sessions when approved. Review audit logs and database policies. Do not delete
evidence. Escalate immediately to the security owner.

## False publication or crawler incident

Disable automatic publication. Identify crawl run, source document, claim, and
publication event. Preserve the original source and decision trail. Correct
forward under editorial review. Notify affected stakeholders.

## Recovery and closure

Verify service health, authorization, source integrity, and zero unexpected
errors. Communicate impact and recovery. Complete a postmortem with timeline,
root cause, containment, rollback, evidence, and prevention actions.
