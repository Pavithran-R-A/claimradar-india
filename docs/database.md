# Database Schema

## Table Groups

### Core

| Table             | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `claims`          | Master claim records; status, score, sector, company FK |
| `claim_revisions` | Immutable history of every field change                 |
| `companies`       | Company profiles (CIN, name, sector FK)                 |
| `sectors`         | Sector taxonomy (banking, insurance, telecom …)         |
| `source_traces`   | Provenance: which source URL produced which claim row   |

### Ingestion

| Table            | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `ingestion_runs` | Crawler run log (started_at, finished_at, status, errors) |
| `raw_documents`  | Raw HTML / PDF blob before parsing                        |
| `parse_results`  | Zod-validated output per document                         |
| `ai_extractions` | LLM output + confidence scores per field                  |

### User

| Table               | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `profiles`          | Extended user profile (display name, preferences)                  |
| `watchlists`        | User ↔ claim / company follow relationships                        |
| `alert_preferences` | Notification channel, lead time, digest settings                   |
| `user_roles`        | Role assignments (user, researcher, editor, legal_reviewer, admin) |

### Billing

| Table           | Purpose                                      |
| --------------- | -------------------------------------------- |
| `subscriptions` | Active plan per user (free, pro, enterprise) |
| `payments`      | Razorpay payment records, webhook events     |
| `invoices`      | Generated invoice metadata                   |

### Editorial

| Table               | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `editorial_reviews` | Editor / legal-reviewer sign-off records      |
| `publication_queue` | Claims awaiting human review                  |
| `corrections`       | Correction log with original + revised values |
| `audit_log`         | Append-only privileged operation log          |

## RLS Strategy

- **Public read**: `claims`, `companies`, `sectors` where `status` is published.
- **User-scoped**: `profiles`, `watchlists`, `alert_preferences` — `auth.uid() = user_id`.
- **Editor role**: `editorial_reviews`, `publication_queue` — checked via `user_roles`.
- **Admin only**: `audit_log`, `user_roles`, `subscriptions` (write).
- **Service-role**: crawler writes to `ingestion_*` and `raw_documents`; never exposed to client.

## Indexing Approach

- `claims`: composite index on `(status, sector_id, updated_at DESC)`.
- `claims`: GIN index on `search_vector` (tsvector) for full-text search.
- `watchlists`: unique constraint `(user_id, claim_id)` with covering index.
- `source_traces`: index on `(source_url_hash, ingested_at DESC)` for dedup.
- Partial indexes on `publication_queue` where `status = 'pending_review'`.

## Migrations

- All schema changes via Drizzle / Kysely migration files.
- Never hand-edit `schema.sql`; migrations are sequential and reversible.
- Each migration is reviewed in PR before merge.
