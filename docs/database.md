# Database Schema

## Table Groups

### Core

| Table            | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| `claimables`     | Published refund, compensation, and claim records |
| `claim_versions` | Immutable history of claim field changes          |
| `companies`      | Company profiles (CIN, name, sector FK)           |
| `sectors`        | Sector taxonomy (banking, insurance, telecom …)   |
| `claim_sources`  | Claim-to-source document relationships            |
| `claim_evidence` | Evidence excerpts and provenance for claim fields |

### Ingestion

| Table                 | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `crawl_runs`          | Crawler run log and summary statistics    |
| `crawl_run_sources`   | Per-source crawl status and counts        |
| `crawl_errors`        | Classified crawl and document failures    |
| `candidate_documents` | Discovered documents before publication   |
| `ai_runs`             | Extraction attempts and provider metadata |
| `validation_results`  | Candidate validation outcomes             |

### User

| Table                      | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| `profiles`                 | Extended user profile (display name, preferences) |
| `user_company_watchlists`  | User-to-company follow relationships              |
| `user_sector_watchlists`   | User-to-sector follow relationships               |
| `claim_matches`            | User-to-claim matching results                    |
| `claim_trackers`           | User tracking state for claims                    |
| `notification_preferences` | Notification channel and frequency settings       |
| `notifications`            | User notification records                         |

### Billing

| Table               | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `subscriptions`     | Active plan per user (free, pro, enterprise) |
| `payment_customers` | Provider customer mapping                    |
| `payment_events`    | Payment provider events                      |
| `webhook_events`    | Idempotent inbound webhook records           |
| `entitlements`      | User plan entitlements                       |

### Editorial

| Table                 | Purpose                              |
| --------------------- | ------------------------------------ |
| `review_assignments`  | Editor review assignments            |
| `legal_reviews`       | Legal review decisions               |
| `correction_requests` | Correction submissions               |
| `takedown_requests`   | Takedown submissions                 |
| `editorial_notes`     | Internal editorial notes             |
| `audit_logs`          | Append-only privileged operation log |

## RLS Strategy

- **Public read**: published `claimables`, `companies`, `sectors`, and safe sources.
- **User-scoped**: profile, watchlists, matches, trackers, and notifications.
- **Staff role**: editorial, source, candidate, and publication operations.
- **Admin only**: `audit_logs`, user administration, and billing controls.
- **Service-role**: crawler writes to ingestion tables; never exposed to clients.

## Indexing Approach

- `claimables`: indexes cover publication status, deadlines, and search fields.
- `content_clusters`: indexes support provenance-aware deduplication.
- User join tables enforce unique ownership relationships.
- Ingestion tables index source, run, and document identifiers.
- Editorial tables index review and publication state.

## Migrations

- All schema changes use ordered SQL migration files.
- Never hand-edit generated types as schema authority.
- Each migration is reviewed in PR before merge.
