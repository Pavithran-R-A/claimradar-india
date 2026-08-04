# Phase 4A Completion Checkpoint

**Date**: 2026-07-27
**Phase**: 4A — Automated Claim-Discovery Pipeline

## Summary

Phase 4A delivered a fully automated claim-discovery pipeline that crawls Indian regulatory and government sources, extracts structured claim data using AI, validates results with deterministic rules, and makes publication decisions — all running within free-tier infrastructure at $0/month.

## Architecture

The pipeline processes documents through 7 core stages:

1. **Discover** — Source adapters find new documents from RSS feeds, HTML pages, and PDF indexes
2. **Fetch** — HTTP client retrieves content with SSRF protection, rate limiting, conditional caching, and retry
3. **Deduplicate** — Four-strategy deduplication (content hash, URL, source identifier, title+date) prevents repeat processing
4. **Keyword Score** — Weighted keyword classifier filters irrelevant documents before AI (saves budget)
5. **AI Extract** — Provider-neutral LLM extraction with two-pass verification, budget management, and circuit breaker
6. **Validate** — 11 deterministic validators + evidence verification enforce legal safety rules
7. **Publication** — Policy engine makes auto-publish / human-review / reject decisions

Key design principles:

- **Provider-neutral AI**: OpenRouter, NVIDIA NIM, or NoAI fallback — switchable via env vars
- **Deterministic validators**: All validation logic is code-based, not AI-dependent
- **Safety-first publication**: `AUTO_VERIFY_CLAIMABLES=false` by default; no automated path to `verified_claimable`
- **Source failure isolation**: Per-source try/catch ensures one broken source doesn't halt the pipeline

## Modules Delivered

| Module                | Directory                  | Purpose                                                                    |
| --------------------- | -------------------------- | -------------------------------------------------------------------------- |
| HTTP Client           | `http/client.ts`           | Undici-based fetch with SSRF, rate limiting, retry, caching                |
| SSRF Protection       | `http/ssrf.ts`             | Private IP blocking at DNS level (IPv4 + IPv6)                             |
| Rate Limiter          | `http/rate-limiter.ts`     | Token-bucket per-domain rate limiting                                      |
| Retry Logic           | `http/retry.ts`            | Exponential backoff with Retry-After support                               |
| RSS Adapters          | `adapters/rss/`            | BaseRss, PibRss, SebiRss, RbiRss, GenericRss (5 adapters)                  |
| HTML Adapters         | `adapters/html/`           | HtmlListing, HtmlDetail (2 adapters)                                       |
| PDF Adapter           | `adapters/pdf/`            | PdfIndex (1 adapter)                                                       |
| Adapter Registry      | `adapters/registry.ts`     | Maps adapter type strings to implementations                               |
| Deduplication         | `deduplication/`           | Orchestrator + 4 strategies with cross-source detection                    |
| Keyword Scoring       | `scoring/`                 | Weighted classifier with positive/negative keyword lists                   |
| AI Providers          | `ai/providers/`            | OpenRouter, NVIDIA NIM, NoAI (3 providers)                                 |
| AI Extraction         | `ai/extraction.ts`         | Budget-aware extractor with circuit breaker                                |
| Budget Manager        | `ai/budget.ts`             | Daily limit enforcement with second-pass reserve                           |
| Circuit Breaker       | `ai/circuit-breaker.ts`    | closed → open (3 failures) → half-open (60s cooldown)                      |
| Prompt Templates      | `ai/prompts.ts`            | v1 extraction prompts with strict legal safety rules                       |
| Validators            | `validation/validators.ts` | 11 validators (evidence, judgment guard, domain, trust, etc.)              |
| Evidence Verification | `validation/evidence.ts`   | Fuzzy-match evidence excerpts against source text                          |
| Validation Runner     | `validation/runner.ts`     | Orchestrates all validators, classifies results                            |
| Claimability Scorer   | `validation/scorer.ts`     | Composite scoring (confidence×40 + validation×30 + trust×20 + evidence×10) |
| Publication Policy    | `publication/policy.ts`    | Decision engine: auto_publish / human_review / reject                      |
| Pipeline Orchestrator | `pipeline/index.ts`        | Wires all stages with concurrency control                                  |
| Database Writer       | `pipeline/db-writer.ts`    | Supabase operations for all pipeline tables                                |
| Logger                | `observability/logger.ts`  | Structured JSON logging                                                    |
| Run Summary           | `observability/summary.ts` | Text + JSON summary generation                                             |
| Sentry Integration    | `observability/sentry.ts`  | Optional error reporting                                                   |
| Environment Config    | `env.ts`                   | Zod-validated env vars with sensible defaults                              |
| CLI Entry Point       | `index.ts`                 | daily, source, health, reprocess, retry-queued commands                    |

## Sources

### Live RSS Adapters (4)

| Source                   | Adapter       | Trust Level  | Feed                |
| ------------------------ | ------------- | ------------ | ------------------- |
| Press Information Bureau | `rss-pib`     | official     | PIB RSS feed        |
| SEBI                     | `rss-sebi`    | official     | SEBI press releases |
| RBI                      | `rss-rbi`     | official     | RBI notifications   |
| Generic RSS              | `rss-generic` | configurable | Any RSS feed        |

### Fixture-Only Adapters (3)

| Adapter        | Type | Purpose                                  |
| -------------- | ---- | ---------------------------------------- |
| `html_listing` | HTML | Parses listing pages for document links  |
| `html_detail`  | HTML | Extracts content from detail pages       |
| `pdf_index`    | PDF  | Indexes PDF documents from listing pages |

These adapters have fixture-based tests but may need live source verification before production use.

## Admin Dashboard

Three admin pages delivered:

1. **Crawl Runs** — View crawl run history, status, duration, document counts, AI budget usage
2. **Candidates** — Review candidate documents with AI extractions, validation results, publication decisions
3. **Sources** — Manage source configurations, enable/disable sources, view health status

## CI/CD

| Workflow      | File                | Schedule         | Purpose                          |
| ------------- | ------------------- | ---------------- | -------------------------------- |
| Daily Crawl   | `daily-crawl.yml`   | 00:17 UTC daily  | Run full pipeline with tests     |
| Source Health | `source-health.yml` | Monday 02:43 UTC | Weekly source availability check |
| CI            | `ci.yml`            | On push/PR       | Typecheck, lint, build, test     |

Both crawl workflows support `workflow_dispatch` for manual triggering.

## Environment Configuration

All configuration is Zod-validated in `env.ts`:

| Variable                       | Default                    | Purpose                          |
| ------------------------------ | -------------------------- | -------------------------------- |
| `SUPABASE_URL`                 | required                   | Supabase project URL             |
| `SUPABASE_SERVICE_ROLE_KEY`    | required                   | Service role key for DB access   |
| `AI_PROVIDER`                  | `none`                     | `openrouter` / `nvidia` / `none` |
| `AI_DAILY_REQUEST_BUDGET`      | `40`                       | Max AI calls per run             |
| `AI_SECOND_PASS_RESERVE`       | `10`                       | Calls reserved for pass 2        |
| `AI_MAX_ATTEMPTS_PER_DOCUMENT` | `2`                        | Retry limit per document         |
| `CRAWLER_CONCURRENCY`          | `3`                        | Parallel source processing       |
| `CRAWLER_REQUEST_TIMEOUT_MS`   | `30000`                    | HTTP request timeout             |
| `CRAWLER_USER_AGENT`           | `ClaimRadar India Bot/1.0` | Bot identification               |
| `LIVE_ADAPTERS_ENABLED`        | `false`                    | Gate for live HTTP adapters      |
| `SENTRY_DSN`                   | optional                   | Error reporting                  |

## Known Limitations

| Limitation                             | Impact                                                    | Mitigation                                             |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| No OCR                                 | Scanned PDFs cannot be processed                          | Use text-based PDFs only; OCR planned for future phase |
| No Playwright                          | JavaScript-rendered pages not supported                   | Use RSS feeds or static HTML sources                   |
| Live sources need verification         | HTML/PDF adapters tested with fixtures only               | Run health checks before enabling live                 |
| `reprocess` command not implemented    | Cannot re-run AI on specific documents                    | Manual DB update or full re-crawl                      |
| `retry-queued` command not implemented | Deferred candidates not auto-retried                      | Run `crawler daily` with AI enabled                    |
| No second-pass execution               | Two-pass prompts defined but pass 2 not wired in pipeline | Future enhancement for accuracy                        |
| Single language                        | English-only extraction                                   | Indian legal documents are primarily English           |

## Next Phase Recommendation: Phase 5

**Phase 5: Public Directory** — Build the consumer-facing claim directory:

- **Search**: Full-text search across verified claimables
- **Filters**: Filter by authority, trust level, procedural status, geographic scope, deadline
- **SEO**: Sitemap generation, structured data (JSON-LD), meta tags for social sharing
- **Claim detail pages**: Individual pages for each verified claimable with evidence
- **Content pages**: Guides, FAQ, about pages (already scaffolded in `apps/web`)
- **Public API**: Read-only API for third-party integrations

This builds on the pipeline's output (verified claimables in the database) and delivers the product to end users.
