# ClaimRadar India — Route-by-Route UI Inventory

**Date:** August 6, 2026  
**Build Scope:** Next.js 15.5.22 (`apps/web`) — 72 Total App Routes (25 Static Prerendered, 47 Dynamic Server-Rendered)

---

## 1. Classifications

- `REDESIGNED_AND_BROWSER_VERIFIED`: Redesigned using the fluid "Evidence in Motion" design system and verified in browser viewports.
- `REDESIGNED_NOT_BROWSER_VERIFIED`: Redesigned with shared components and Tailwind CSS system, but interactive browser QA is pending.
- `USES_SHARED_NEW_SYSTEM`: Uses shared global headers, footers, typography, dark aurora theme, and continuous container components.
- `LEGACY_UI`: Legacy plain markup without modern design tokens.
- `PLACEHOLDER`: Shell placeholder content.
- `BROKEN`: Component or layout rendering error.
- `NOT_ACCESSIBLE_WITH_CURRENT_FIXTURES`: Route requires specific database fixtures to render.

---

## 2. Public Directory Routes

| Route                | Classification                    | Status & Component Breakdown                                                                                 |
| :------------------- | :-------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `/`                  | `REDESIGNED_AND_BROWSER_VERIFIED` | Full Evidence in Motion design system, `InteractiveHeroSearch`, `EvidenceFlowDiagram`, dynamic sector badges |
| `/claimables`        | `REDESIGNED_AND_BROWSER_VERIFIED` | Filter bar (`Filters`), `ClaimableCard` grid, `ClaimableRow` list mode, pagination, mobile drawer            |
| `/claimables/[slug]` | `REDESIGNED_AND_BROWSER_VERIFIED` | Direct-answer header, status badge, evidence panel, official source link, proof requirements, disclaimer     |
| `/companies`         | `REDESIGNED_AND_BROWSER_VERIFIED` | Company search grid, neutral corporate framing, active claim counts, verified badge                          |
| `/companies/[slug]`  | `REDESIGNED_AND_BROWSER_VERIFIED` | Company detail header, non-defamatory notice summary, associated published claimables                        |
| `/sectors`           | `REDESIGNED_AND_BROWSER_VERIFIED` | Sector aggregate cards, active claim count chips, continuous dark aurora background                          |
| `/sectors/[slug]`    | `REDESIGNED_AND_BROWSER_VERIFIED` | Sector detail header, category description, sector-filtered published claimables                             |
| `/closing-soon`      | `REDESIGNED_AND_BROWSER_VERIFIED` | Excludes expired records, urgency status badges, deadline countdown indicators                               |
| `/deadlines`         | `REDESIGNED_AND_BROWSER_VERIFIED` | Categorized timeline (Closing This Week, Closing This Month, Upcoming)                                       |
| `/new`               | `REDESIGNED_AND_BROWSER_VERIFIED` | Freshness-filtered claimables sorted by first published timestamp                                            |
| `/how-it-works`      | `USES_SHARED_NEW_SYSTEM`          | Process breakdown using shared page heading, evidence flow diagrams, and legal footer                        |
| `/methodology`       | `USES_SHARED_NEW_SYSTEM`          | Verification standards document with continuous design system layout                                         |
| `/sources`           | `USES_SHARED_NEW_SYSTEM`          | Regulatory source registry directory (SEBI, RBI, PIB, MCA)                                                   |
| `/faq`               | `USES_SHARED_NEW_SYSTEM`          | Frequently asked questions accordion with keyboard-accessible triggers                                       |
| `/about`             | `USES_SHARED_NEW_SYSTEM`          | Mission & platform governance policy document                                                                |
| `/contact`           | `USES_SHARED_NEW_SYSTEM`          | Feedback and correction inquiry form                                                                         |
| `/terms`             | `USES_SHARED_NEW_SYSTEM`          | Terms of service with independent platform disclaimer                                                        |
| `/privacy`           | `USES_SHARED_NEW_SYSTEM`          | Privacy policy and data protection disclosure                                                                |
| `/disclaimer`        | `USES_SHARED_NEW_SYSTEM`          | Mandatory legal disclaimer (Not a law firm, court, or government portal)                                     |
| `/corrections`       | `USES_SHARED_NEW_SYSTEM`          | Public correction policy and submission procedures                                                           |

---

## 3. Customer Application Routes (`/app/*`)

| Route                       | Classification                    | Status & Component Breakdown                                                                            |
| :-------------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `/app`                      | `REDESIGNED_NOT_BROWSER_VERIFIED` | Customer dashboard shell, potential match count, closing-soon alerts, activity feed                     |
| `/app/matches`              | `REDESIGNED_NOT_BROWSER_VERIFIED` | Match listing with restricted terminology ("Strong potential match", "Possible match", "Not matched")   |
| `/app/watchlist`            | `REDESIGNED_NOT_BROWSER_VERIFIED` | Watched companies and sectors with notification toggle controls                                         |
| `/app/tracker`              | `REDESIGNED_NOT_BROWSER_VERIFIED` | Off-platform claim tracker with lifecycle states (Saved -> Reviewing -> Submitted externally -> Closed) |
| `/app/notifications`        | `REDESIGNED_NOT_BROWSER_VERIFIED` | User notification history ledger and channel preferences                                                |
| `/app/profile`              | `REDESIGNED_NOT_BROWSER_VERIFIED` | User profile settings, state/sector interest selections                                                 |
| `/app/settings`             | `REDESIGNED_NOT_BROWSER_VERIFIED` | Account settings, email notification toggles                                                            |
| `/app/settings/unsubscribe` | `REDESIGNED_NOT_BROWSER_VERIFIED` | One-click unsubscribe handler with token validation and confirmation state                              |
| `/app/privacy`              | `REDESIGNED_NOT_BROWSER_VERIFIED` | User-specific data privacy and account deletion controls                                                |

---

## 4. Authentication Routes (`/(auth)/*`)

| Route              | Classification                    | Status & Component Breakdown                                                          |
| :----------------- | :-------------------------------- | :------------------------------------------------------------------------------------ |
| `/login`           | `REDESIGNED_NOT_BROWSER_VERIFIED` | Clean dark aurora card, email/password controls, validation error alert, submit state |
| `/register`        | `REDESIGNED_NOT_BROWSER_VERIFIED` | Account creation form, password strength meter, terms agreement checkbox              |
| `/forgot-password` | `REDESIGNED_NOT_BROWSER_VERIFIED` | Password reset request form with email validation                                     |
| `/reset-password`  | `REDESIGNED_NOT_BROWSER_VERIFIED` | Password update form with token validation                                            |
| `/verify-email`    | `REDESIGNED_NOT_BROWSER_VERIFIED` | Email confirmation state with resend button                                           |

---

## 5. Admin Operational Routes (`/admin/*`)

| Route                    | Classification                    | Status & Component Breakdown                                               |
| :----------------------- | :-------------------------------- | :------------------------------------------------------------------------- |
| `/admin`                 | `REDESIGNED_NOT_BROWSER_VERIFIED` | Admin operational overview, system health metrics, pending reviews         |
| `/admin/candidates`      | `REDESIGNED_NOT_BROWSER_VERIFIED` | Candidate ingestion table, score badges, review decision triggers          |
| `/admin/candidates/[id]` | `REDESIGNED_NOT_BROWSER_VERIFIED` | Candidate evidence inspection drawer, AI extract viewer, decision controls |
| `/admin/claimables`      | `REDESIGNED_NOT_BROWSER_VERIFIED` | Directory management table, publish/unpublish toggles, status filters      |
| `/admin/claimables/[id]` | `REDESIGNED_NOT_BROWSER_VERIFIED` | Claimable editor, official source manager, verification log                |
| `/admin/companies`       | `REDESIGNED_NOT_BROWSER_VERIFIED` | Corporate entity directory and mapping manager                             |
| `/admin/sources`         | `REDESIGNED_NOT_BROWSER_VERIFIED` | Source health table, enable/disable toggle button (`ToggleSourceButton`)   |
| `/admin/sources/[id]`    | `REDESIGNED_NOT_BROWSER_VERIFIED` | Source configuration details and fetch history                             |
| `/admin/reviews`         | `REDESIGNED_NOT_BROWSER_VERIFIED` | Staff review queue for human-in-the-loop candidate evaluation              |
| `/admin/corrections`     | `REDESIGNED_NOT_BROWSER_VERIFIED` | Correction requests queue and resolution workflow                          |
| `/admin/crawl-runs`      | `REDESIGNED_NOT_BROWSER_VERIFIED` | Pipeline run history table with document/candidate counters                |
| `/admin/crawl-runs/[id]` | `REDESIGNED_NOT_BROWSER_VERIFIED` | Detailed crawl run telemetry and error log viewer                          |
| `/admin/ai-runs`         | `REDESIGNED_NOT_BROWSER_VERIFIED` | AI extraction run log, token usage, cost tracking                          |
| `/admin/alerts`          | `REDESIGNED_NOT_BROWSER_VERIFIED` | Operational alerts table (database failures, SSRF blocks, budget limits)   |
| `/admin/users`           | `REDESIGNED_NOT_BROWSER_VERIFIED` | User management and role administration                                    |
| `/admin/audit`           | `REDESIGNED_NOT_BROWSER_VERIFIED` | System audit log viewer                                                    |
| `/admin/settings`        | `REDESIGNED_NOT_BROWSER_VERIFIED` | System configuration & feature flag controls                               |
