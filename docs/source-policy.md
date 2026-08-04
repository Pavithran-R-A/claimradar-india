# Source Policy

## Official Sources to Monitor

| Source                                      | URL Pattern              | Update Frequency |
| ------------------------------------------- | ------------------------ | ---------------- |
| Press Information Bureau (PIB)              | `pib.gov.in`             | Daily            |
| Ministry of Consumer Affairs                | `consumeraffairs.nic.in` | Weekly           |
| Reserve Bank of India (RBI)                 | `rbi.org.in`             | Weekly           |
| Securities and Exchange Board (SEBI)        | `sebi.gov.in`            | Daily            |
| Insurance Regulatory (IRDAI)                | `irdai.gov.in`           | Weekly           |
| Competition Commission (CCI)                | `cci.gov.in`             | Monthly          |
| National Company Law Tribunal (NCLT)        | `nclt.gov.in`            | Weekly           |
| Company registrar (MCA)                     | `mca.gov.in`             | Weekly           |
| Individual company investor-relations pages | Allow-listed per company | Monthly          |

## Source Trust Levels

Every source is assigned a trust level that influences the claimability score and publication decisions:

| Trust Level  | Points | Description                                        | Examples                       |
| ------------ | ------ | -------------------------------------------------- | ------------------------------ |
| `official`   | 20     | Government or regulatory body with legal authority | PIB, RBI, SEBI, NCLT           |
| `reputable`  | 15     | Established news or legal analysis organization    | Bar & Bench, LiveLaw           |
| `community`  | 5      | Community-sourced or crowd-verified                | Verified consumer forums       |
| `unverified` | 0      | Unknown or unvetted source                         | New submissions pending review |

Trust level is stored in the `sources.trust_level` column and is reviewed when a source is added or its status changes.

## Retrieval Rules

- **User-agent**: `ClaimRadar India Bot/1.0 (+https://claimradar.in)` — always identifying, never spoofing.
- **Rate limiting**: Token-bucket algorithm, max 1 request per 2 seconds per domain (configurable per source via `rate_limit_per_minute`). Respects `Retry-After` header.
- **Robots.txt**: Checked before every request; disallowed paths are skipped.
- **SSRF prevention**: Private IP ranges blocked at the DNS resolver level. All resolved IPs (IPv4 and IPv6) are validated before connection. Redirect chains limited to 2 hops with final URL re-validated.
- **Idempotency**: Every fetched URL is content-hashed (SHA-256) and stored. Conditional requests use `ETag` and `Last-Modified` headers to avoid re-downloading unchanged content.

## Legal and Terms Review

Before adding any new source:

1. **Terms of service review**: The source's terms of service must be reviewed to confirm that automated crawling is permitted. Document the review date in `sources.terms_checked_at`.
2. **Robots.txt verification**: Confirm that the target paths are not disallowed. Document the check in `sources.robots_checked_at`.
3. **Content licensing**: Verify that the content is public and can be indexed/displayed.
4. **Legal sign-off**: A legal reviewer must approve the source before it is added to the registry.

## What Not to Scrape

- Any page protected by CAPTCHA, login wall, or OTP challenge.
- Paywalled content (Bloomberg, Economic Times premium, etc.).
- Personal data of individuals not named in official public documents.
- Content explicitly marked "confidential" or "not for distribution" by the publisher.
- No CAPTCHA bypass — if a source adds CAPTCHA protection, the source is disabled and reviewed.

## Rate Limiting

The HTTP client uses a token-bucket rate limiter (`http/rate-limiter.ts`):

- Each domain gets its own bucket
- Tokens refill at `requestsPerMinute / 60,000` per millisecond
- When the bucket is empty, the request waits until a token is available
- Default: 30 requests per minute per source (1 request per 2 seconds)
- Configurable per source in the `sources.rate_limit_per_minute` column

The retry mechanism (`http/retry.ts`) adds exponential backoff:

- Base delay: 1,000 ms
- Formula: `baseDelay × 2^attempt + random jitter`
- Max delay: 60,000 ms
- Respects `Retry-After` header (seconds or HTTP-date format)
- Max retries: 2 (in pipeline context) or 3 (default)

## Error Handling

- **Source unavailable**: Exponential back-off per the retry mechanism. After persistent failures, the source's `failure_count` is incremented and the error is logged.
- **Parser failure**: Raw document is saved to `source_documents` for manual review; error is recorded in `crawl_errors`.
- **Never silently drop**: All source failures are logged and counted. The pipeline continues processing other sources (failure isolation).

## Source Addition Workflow

1. Propose new source in `packages/source-registry` with rationale.
2. Verify `robots.txt` permits crawling the target path.
3. Review terms of service for automated access permission.
4. Implement adapter + Zod schema; write fixture tests.
5. Set `trust_level` appropriately.
6. PR reviewed by editor + legal reviewer before merge.
7. Add source to database with `enabled = false` initially.
8. Run health check: `pnpm crawler:health`
9. Run dry-run: `pnpm crawler:daily -- --dry-run`
10. Enable source: `UPDATE sources SET enabled = true WHERE id = 'new-source'`

## SSRF Prevention

The SSRF protection layer (`http/ssrf.ts`) blocks:

- **Protocol restrictions**: Only `http:` and `https:` allowed
- **Direct IP access**: Private IPs blocked (10.x, 172.16–31.x, 192.168.x, 127.x, 169.254.x, 0.0.0.0)
- **DNS resolution**: All resolved IPv4 and IPv6 addresses checked for private ranges
- **IPv6**: Loopback (::1), unique local (fc00::/fd00::), link-local (fe80::/10) blocked
- **Redirect chains**: Limited to 2 hops; final URL re-validated after redirect
