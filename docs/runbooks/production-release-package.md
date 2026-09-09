# Production Release Package

## Release record

- Approved release SHA: record after final soak.
- Runtime freeze SHA: `6f22c5ef4119000318218f136f5416987a451877`.
- Rollback SHA: record the verified READY deployment.
- Release owner: record before approval.
- Deployment UTC: record at execution.

## Environment checklist

- Production Supabase ref is confirmed.
- Production secrets are server-side only.
- Client bundle contains no backend secret.
- Redirect URLs and allowed origins are exact.
- SMTP domain passes DKIM, DMARC, and SPF.
- Database migrations are forward-only and ordered.
- Backups or exports have current evidence.
- Vercel domain, SSL, protection, and alerts pass.

## Post-deploy smoke

1. Open home and directory pages.
2. Search a known verified opportunity.
3. Check source and methodology links.
4. Sign in with an approved test account.
5. Confirm customer ownership isolation.
6. Confirm normal users cannot access admin.
7. Confirm admin access works as intended.
8. Check read-only API health.
9. Check crawler and publication guards.
10. Record zero unexpected errors.

## Monitoring windows

During the first hour, check deployment logs, 5xx rate, auth errors, source
freshness, database connections, and publication events every 15 minutes.

During the first 24 hours, check every scheduled crawl, source-family failure,
error count, API latency, auth delivery, database growth, and rollback signal.

## Stop conditions

Stop promotion for any authorization failure, unexpected publication, source
data corruption, migration mismatch, secret exposure, sustained 5xx spike, or
unexplained database exhaustion.
