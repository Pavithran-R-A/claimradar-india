# ClaimRadar India — Final Local Release Audit

**Date:** August 7, 2026  
**Git Branch:** `qoder/complete-claimradar`  
**Git Commit:** `574b133` (`docs(ui): record route inventory and current design gaps`)

---

## 1. Inventory of Repository Modifications After Homepage Redesign

| Category                     | Files Added / Modified                                                                             | Description & Purpose                                                                                                                                                 |
| :--------------------------- | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source UI Files**          | `apps/web/app/(public)/page.tsx`                                                                   | Redesigned landing page with continuous deep-ink to off-white canvas, interactive search (`InteractiveHeroSearch`), and evidence flow diagram (`EvidenceFlowDiagram`) |
| **Shared Component Files**   | `apps/web/components/landing/*`, `apps/web/components/directory/*`, `apps/web/components/layout/*` | Shared components using theme CSS variables and Tailwind tokens                                                                                                       |
| **Browser QA Scripts**       | `scripts/browser-qa-runner.mjs`                                                                    | Multi-viewport screenshot capture automation script                                                                                                                   |
| **Accessibility Scripts**    | `scripts/accessibility-qa-runner.mjs`                                                              | DOM structure and heading hierarchy audit script                                                                                                                      |
| **Performance Scripts**      | `scripts/lighthouse-qa-runner.mjs`                                                                 | Performance probe measuring FCP, DOM element count, and network transfer weight                                                                                       |
| **Browser Evidence Suite**   | `docs/checkpoints/browser-evidence/*.png`                                                          | 98 high-resolution screenshots across 6 viewports and reduced-motion emulation                                                                                        |
| **Checkpoint Documentation** | `docs/checkpoints/*.md`, `docs/design/*.md`                                                        | Change inventory, route inventory, local database setup, and performance audit reports                                                                                |

---

## 2. Shared "Evidence in Motion" Design System Adoption Audit

- **Public Routes (`/`, `/claimables`, `/companies`, `/sectors`, `/deadlines`, `/new`, `/closing-soon`):** Genuinely adopt continuous dark aurora theme, dynamic search controls, restrained trust-primary accents, and cohesive legal footers.
- **Customer Application (`/app/*`):** Consistently styled via global `:root` dark aurora CSS variables, shared navigation sidebar, card panels, and restricted match terminology ("Strong potential match", "Possible match", "Not matched").
- **Auth Shell (`/login`, `/register`, `/forgot-password`, `/reset-password`):** Clean centered dark aurora card container, password visibility toggle, accessible input states, and mandatory platform disclaimers.
- **Admin Dashboard (`/admin/*`):** Functional dense data tables, operational telemetry badges, staff role guards, and action confirmation dialogs.
