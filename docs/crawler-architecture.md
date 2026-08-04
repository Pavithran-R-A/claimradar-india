# Crawler Architecture

## Overview

The ClaimRadar India crawler is an automated claim-discovery pipeline that ingests documents from Indian regulatory, court, and government sources, extracts structured claim data using AI, validates results deterministically, and makes publication decisions.

The crawler lives under `apps/crawler/src/` and is orchestrated by `pipeline/index.ts`.

## Pipeline Stages

Documents move through nine sequential stages:

```
discover → fetch → extract → deduplicate → keyword score → AI extract → validate → score → publication decision
```

### 1. Discover

Each source adapter's `discover()` method returns a list of `DiscoveredDocument` entries (URL, title, published date, source identifier). For RSS sources this means parsing the feed; for HTML adapters it means scraping a listing page.

### 2. Fetch

The adapter's `fetchDocument()` retrieves the full content via `HttpClient`, which handles:

- SSRF prevention (private IP blocking at DNS level)
- Rate limiting (token-bucket per domain)
- Conditional requests (ETag / Last-Modified → 304 Not Modified)
- Retry with exponential backoff (respects `Retry-After` header)
- Content-hash generation (SHA-256)
- MIME-type validation and body-size limits (50 MB default)

### 3. Extract (Raw)

The fetched content is stored as `raw_text` in the `source_documents` table. The `content_hash` and HTTP cache headers (`etag`, `last_modified`) are persisted for future conditional requests.

### 4. Deduplicate

Four strategies run in order (fastest to slowest); the first match wins:

| Strategy          | Signal                            | Complexity  |
| ----------------- | --------------------------------- | ----------- |
| Content hash      | SHA-256 match                     | O(1) lookup |
| Canonical URL     | Exact URL match                   | O(1) lookup |
| Source identifier | Source-scoped ID                  | O(n) scan   |
| Title + date      | Normalized title + published date | O(n) scan   |

When a content-hash match occurs across _different_ sources, `crossSourceMatch` is set to `true`, allowing the pipeline to link the document to the same claimable rather than creating a duplicate.

### 5. Keyword Score

The `scoreDocument()` classifier assigns a 0–100 score based on weighted positive and negative keyword matches. Title matches receive a 2× weight boost. Documents below the threshold (default 15) are silently dropped — they are not candidates.

### 6. AI Extract

Candidates that pass keyword scoring are sent to the AI extraction layer (see [AI Extraction](./ai-extraction.md)). The AI returns structured JSON validated against the Zod `extractionSchema`. If AI is unavailable or budget is exhausted, documents are saved with `ai_extraction_status: 'deferred'`.

### 7. Validate

Eleven deterministic validators run against the AI extraction (see [AI Extraction → Validators](./ai-extraction.md#validators)). Evidence excerpts are verified against the source text using fuzzy substring matching. Results are classified as `pass`, `review`, or `reject`.

### 8. Score (Claimability)

`computeClaimabilityScore()` produces a 0–100 composite:

| Component            | Formula                                              | Max Points |
| -------------------- | ---------------------------------------------------- | ---------- |
| AI confidence        | `confidence × 40`                                    | 40         |
| Validation pass rate | `(passed / total) × 30`                              | 30         |
| Source trust level   | official=20, reputable=15, community=5, unverified=0 | 20         |
| Evidence quality     | `verified_count × 2` (only if all verified)          | 10         |

### 9. Publication Decision

`decidePublication()` applies the publication policy (see [Publication Policy](./publication-policy.md)) and returns one of: `auto_publish`, `human_review`, or `reject`.

## Module Organization

```
apps/crawler/src/
├── http/              # HTTP client, SSRF, rate-limiting, retry, caching, hashing
├── adapters/          # Source adapters (RSS, HTML, PDF) + registry
│   ├── rss/           # BaseRss, PibRss, SebiRss, RbiRss, GenericRss
│   ├── html/          # HtmlListing, HtmlDetail
│   └── pdf/           # PdfIndex
├── extraction/        # Content extraction helpers (html.ts, pdf.ts, rss.ts)
├── deduplication/     # Orchestrator + 4 strategies
├── scoring/           # Keyword classifier + keyword definitions
├── ai/                # Provider abstraction, budget, circuit-breaker, prompts
│   └── providers/     # OpenRouter, NVIDIA NIM, NoAI
├── validation/        # 11 validators, evidence verification, runner, scorer
├── publication/       # Publication policy engine
├── pipeline/          # Orchestrator (index.ts) + database writer
├── observability/     # Structured logger, Sentry integration, run summaries
├── jobs/              # Job runner (future: scheduled tasks)
├── env.ts             # Zod-validated environment configuration
└── index.ts           # CLI entry point
```

## Data Flow

```
Source (RSS/HTML/PDF)
  │
  ▼
Adapter.discover() ──► DiscoveredDocument[]
  │
  ▼
Adapter.fetchDocument() ──► FetchedDocument (raw content + hash)
  │
  ├─ 304 Not Modified → skip (unchanged)
  │
  ▼
checkDuplicate() ──► skip if duplicate
  │
  ▼
DB: insert source_documents
  │
  ▼
scoreDocument() ──► skip if below threshold
  │
  ▼
DB: insert candidate_documents
  │
  ▼
AIExtractor.extract() ──► Extraction (Zod-validated JSON)
  │
  ├─ Not relevant → mark not_relevant, skip
  │
  ▼
verifyEvidence() ──► evidence backing check
  │
  ▼
runAllValidators() ──► ValidationRunResult
  │
  ▼
computeClaimabilityScore() ──► 0–100 score
  │
  ▼
decidePublication() ──► auto_publish | human_review | reject
  │
  ▼
DB: update candidate + insert validation_results + insert publication_events
```

## Source Failure Isolation

Each source is processed inside a `try/catch` block in `processSource()`. If a source fails at any point (adapter error, network failure, DB error), the error is:

1. Logged with `logger.error('source', ...)`
2. Recorded in the `crawl_errors` table
3. Reported to Sentry (if configured)
4. Counted in `summary.sourcesFailed`

The failure of one source does **not** affect other sources. The pipeline continues processing remaining sources.

Additionally, individual documents within a source are wrapped in their own `try/catch`, so a single bad document does not abort the entire source.

## Concurrency Model

Sources are processed with bounded concurrency via `runWithConcurrency()`:

- Controlled by `CRAWLER_CONCURRENCY` env var (default: `3`)
- Spawns N worker coroutines that pull from a shared index counter
- Each worker processes one source at a time sequentially
- Workers run in parallel up to the concurrency limit

This prevents overwhelming external servers and the database with too many simultaneous requests while still parallelizing across sources.

## Dry-Run Mode

Pass `--dry-run` to any CLI command to enable dry-run mode:

- No `crawl_runs` record is created in the database
- No `candidate_documents`, `validation_results`, or `publication_events` are inserted
- No AI calls are made (budget is not consumed)
- Adapters still discover and fetch documents (real HTTP requests)
- Deduplication, scoring, and validation logic still runs in-memory
- A random UUID is used as the candidate ID
- The run summary is still printed to stdout

Dry-run is useful for testing adapter connectivity and pipeline logic without modifying the database or consuming AI budget.
