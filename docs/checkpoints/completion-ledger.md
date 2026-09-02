# ClaimRadar India Completion Ledger

Updated: 2026-09-02

## Baseline

- Base: `origin/main` at `fc14de90783587013e692a70281ea88b8c3920f5`.
- Imported branch: `origin/frontend/claimradar-experience-redesign` at `d3f3e9cb338c1b0d98a2f5e3696b8081c33c07b3`.
- Completion branch: `codex/claimradar-completion`.
- Original dirty checkout: preserved and untouched.
- Main: not modified.
- Frontend branch: integrated without merge conflicts.
- Soak test commit: rejected because it weakened strict `UNKNOWN` provenance assertions.

## Status by subsystem

| Subsystem                  | Status           | Evidence and next action                                                                                                                              |
| -------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public frontend            | PARTIAL          | Public routes and repository-backed listings exist. Browser Preview verification remains blocked.                                                     |
| Homepage and visual system | PARTIAL          | Editorial tokens, source motifs, motion, and radar exist. Rendered fidelity and copy truth need review.                                               |
| Directory                  | PARTIAL          | Search, filters, cards, pagination, and empty states exist. World-class hierarchy and browser UX remain unverified.                                   |
| Claim dossier              | PARTIAL          | Dossier route exists with provenance and official action. Flagship ordering and responsive behavior need verification.                                |
| Customer app               | PARTIAL          | Matches, watchlist, tracker, notifications, profile, settings, privacy, and billing routes exist. Authenticated runtime remains unverified.           |
| Admin operations           | PARTIAL          | Role guards and audited actions exist. Crawl and retry controls still point to CLI-style stubs.                                                       |
| API and server actions     | PARTIAL          | One auth callback route and server actions exist. Direct mutation-path tests and full error-contract review are missing.                              |
| Authentication             | PARTIAL          | Supabase SSR session refresh and route guards exist. Profile self-update fields require database hardening.                                           |
| Authorization              | PARTIAL          | Migration 016 hardens profile updates, SECURITY DEFINER search paths, and helper grants. Supabase runtime application remains unverified.             |
| Crawler adapters           | PARTIAL          | IBBI PDF text is source-derived. Missing dates remain unknown. SEBI notice dates use fetched source metadata. Live ingestion remains unverified.      |
| Source registry            | PARTIAL          | Official IBBI and TRAI domains are allowed. Adapter aliases align with the registry. Live source checks remain bounded.                               |
| Data quality               | PARTIAL          | Full RSS source text is retained. Document failures propagate. Cross-source hashes preserve source rows and content clusters.                         |
| Database and migrations    | PARTIAL          | Migrations 001-016 cover core, ingestion, users, billing, editorial, RLS, freshness, product, and notifications. Supabase runtime remains unverified. |
| Billing safety             | PARTIAL          | Mock provider and environment gates exist. Live provider behavior remains unverified.                                                                 |
| Notification safety        | PARTIAL          | Production email gates and deduplication exist. Full staging runtime remains unverified.                                                              |
| Observability              | PARTIAL          | Failure categories and alert sinks exist. Source failure propagation and preflight table names are corrected.                                         |
| CI                         | PARTIAL          | Format, lint, build, typecheck, and tests run. Coverage, E2E, accessibility, and exact-head release checks need wiring.                               |
| Release evidence           | PARTIAL          | Runtime-sensitive guards include web and design-system paths. Stored soak evidence is stale and needs regeneration.                                   |
| Deployment                 | EXTERNAL_BLOCKER | No `.vercel/project.json`; GitHub and public domain access did not expose a usable Preview URL.                                                       |
| Accessibility              | PARTIAL          | Static contracts cover focus, motion, radar, and public exposure. Rendered Axe and keyboard checks are missing.                                       |
| Performance                | UNVERIFIED       | No Preview trace or production browser profile is available.                                                                                          |
| Documentation              | PARTIAL          | Deployment, database, staging, and security docs now match current names. Historical checkpoints retain their evidence context.                       |
| Test coverage              | PARTIAL          | 37 crawler and 18 web test files exist. No enforced coverage, wired E2E suite, or package-level tests exist.                                          |

## Immediate repair order

1. Repair security and data-integrity defects.
2. Pin and use Node 24.
3. Restore accurate source and UI copy.
4. Add direct migration and action tests.
5. Wire rendered accessibility and E2E checks.
6. Build and inspect the public product.
7. Repair release evidence and Preview configuration.
8. Run final checks and classify blockers.
