# Free-Tier Budget Analysis

## Overview

ClaimRadar India is designed to operate within free-tier limits for all infrastructure. This document analyzes costs and resource constraints to confirm that the system can run at $0/month during the initial phase.

## Supabase Free Tier

| Resource                   | Free Tier Limit        | ClaimRadar Usage                       |
| -------------------------- | ---------------------- | -------------------------------------- |
| Database size              | 500 MB                 | Estimated 10–50 MB for initial months  |
| Monthly Active Users (MAU) | 50,000                 | Admin-only access initially (< 10 MAU) |
| API requests               | Unlimited              | Crawler + admin dashboard              |
| Edge functions             | 500K invocations/month | Not used currently                     |
| Storage                    | 1 GB                   | Raw document storage (minimal)         |
| Bandwidth                  | 2 GB/month             | Admin dashboard + API                  |

### Database Growth Estimate

| Table                 | Row Size (avg) | Monthly Rows | Monthly Size |
| --------------------- | -------------- | ------------ | ------------ |
| `source_documents`    | ~2 KB          | ~500         | ~1 MB        |
| `candidate_documents` | ~4 KB          | ~50          | ~200 KB      |
| `ai_runs`             | ~1 KB          | ~50          | ~50 KB       |
| `validation_results`  | ~200 B         | ~550         | ~110 KB      |
| `crawl_runs`          | ~500 B         | ~30          | ~15 KB       |
| `publication_events`  | ~300 B         | ~50          | ~15 KB       |

**Estimated monthly growth**: ~1.5 MB — well within the 500 MB limit for years of operation.

## AI Budget

### Daily Budget

| Parameter                 | Value                                        |
| ------------------------- | -------------------------------------------- |
| `AI_DAILY_REQUEST_BUDGET` | 40 requests/day                              |
| `AI_SECOND_PASS_RESERVE`  | 10 requests (reserved for verification pass) |
| First-pass available      | 30 requests/day                              |
| Second-pass available     | 10 requests/day                              |

### Monthly Projection

| Metric                             | Calculation | Result    |
| ---------------------------------- | ----------- | --------- |
| Daily requests                     | 40          | 40        |
| Monthly requests                   | 40 × 30     | 1,200     |
| Cost per request (free-tier model) | $0.00       | $0.00     |
| **Monthly AI cost**                |             | **$0.00** |

The system uses free-tier LLM models:

- **OpenRouter**: `meta-llama/llama-3.1-70b-instruct` — free tier available
- **NVIDIA NIM**: `meta/llama-3.1-70b-instruct` — free tier available (1000 requests/day)

Both providers offer Llama 3.1 70B at no cost within their free tiers. 1,200 requests/month is well within NVIDIA NIM's free allowance.

### Cost Optimization: Content-Hash Deduplication

The primary cost optimization is content-hash deduplication:

1. Every fetched document is SHA-256 hashed
2. Before AI extraction, the hash is checked against all existing documents
3. If the content hasn't changed, the document is skipped — **no AI call is made**
4. This means repeat crawls of the same source (e.g., an unchanged RSS feed) cost $0 in AI

In practice, most daily crawls will see 60–80% of documents deduplicated, meaning only 20–40% of discovered documents consume AI budget.

### Budget Monitoring

Check the `crawl_runs` table for AI budget usage:

```sql
SELECT
  id,
  created_at,
  ai_budget_used,
  candidates_created,
  status
FROM crawl_runs
ORDER BY created_at DESC
LIMIT 10;
```

If `ai_budget_used` consistently hits 40, consider:

- Increasing `AI_DAILY_REQUEST_BUDGET` (if provider free tier allows)
- Tightening keyword scoring thresholds to reduce false-positive candidates
- Adding more deduplication strategies

## GitHub Actions

| Workflow            | Schedule           | Estimated Minutes/Month |
| ------------------- | ------------------ | ----------------------- |
| `daily-crawl.yml`   | Daily at 00:17 UTC | 30 × ~5 min = ~150 min  |
| `source-health.yml` | Weekly Monday      | 4 × ~2 min = ~8 min     |
| `ci.yml`            | On push/PR         | Variable                |

GitHub free tier provides 2,000 minutes/month for private repos (unlimited for public). ~160 minutes is well within limits.

## Estimated Monthly Cost Summary

| Service                         | Cost      |
| ------------------------------- | --------- |
| Supabase (free tier)            | $0.00     |
| AI providers (free-tier models) | $0.00     |
| GitHub Actions (public repo)    | $0.00     |
| Domain (claimradar.in)          | ~$10/year |
| **Total monthly**               | **$0.00** |

## When to Upgrade

### Upgrade Supabase when:

- Database approaches 400 MB (80% of 500 MB limit)
- MAU exceeds 40,000 (approaching 50K limit)
- Need point-in-time recovery or daily backups

### Upgrade AI provider when:

- Free-tier models are deprecated or rate-limited more aggressively
- Need higher-quality models (e.g., GPT-4o, Claude) for complex legal documents
- Daily budget consistently hits 40 and more candidates are being deferred

### Upgrade GitHub when:

- Need self-hosted runners for faster builds
- Need more than 2,000 minutes (private repo)

### Estimated upgrade costs (when needed):

- Supabase Pro: $25/month (8 GB database, 100K MAU)
- AI provider paid tier: $5–20/month depending on model and volume
- GitHub Team: $4/user/month
