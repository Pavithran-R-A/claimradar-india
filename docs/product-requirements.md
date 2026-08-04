# Product Requirements — ClaimRadar India

> Temporary project name — IP India trademark search required before commercial launch.

## Capabilities

### 1. Public Website

Marketing landing, about, methodology explanation, legal disclaimers, contact. Dark editorial design, mobile-first, WCAG 2.2 AA.

### 2. Searchable Claim Directory

Full-text search + faceted filters (sector, status, company, geography, deadline). Paginated results with ISR-cached pages.

### 3. Company & Sector Pages

Dedicated profiles for each company and sector, aggregating related claims. Unique editorial content per page — no thin stubs.

### 4. User Accounts & Watchlists

Email + magic-link auth. Users follow specific claims/companies, receive deadline alerts, manage preferences.

### 5. Rule-Based Matching

Deterministic rules engine matches raw ingestion data to known claim patterns. Outputs a Claimability Score (0–100).

### 6. Deadline Alerts

Automated email/push notifications when a claim deadline approaches or changes. Configurable lead time per user.

### 7. Editorial Dashboard

CMS for researchers, editors and legal reviewers. Claim lifecycle management, bulk actions, revision history, publish/unpublish controls.

### 8. Daily Ingestion Pipeline

Cron-scheduled crawler fetches official sources, runs parsers, validates with Zod, writes to DB. Idempotent and resumable.

### 9. AI Extraction

LLM-assisted extraction of structured fields from unstructured source documents (PDFs, HTML notices). Outputs validated against Zod schemas.

### 10. Deterministic Validation

Every AI-extracted field is cross-checked against known schemas, date formats, CIN patterns, monetary ranges. Failures routed to human review.

### 11. Subscription Billing

Razorpay integration for premium tiers (advanced alerts, API access, export). Free tier with basic watchlist and search.

### 12. SEO Readiness

SSG/ISR pages, unique metadata, JSON-LD structured data, dynamic sitemaps, performance budgets (LCP < 2.5 s, INP < 200 ms, CLS < 0.1).

### 13. Performance, Accessibility & Security

Core Web Vitals targets, semantic HTML, `prefers-reduced-motion`, RLS on user tables, CSP headers, SSRF prevention, audit logging.
