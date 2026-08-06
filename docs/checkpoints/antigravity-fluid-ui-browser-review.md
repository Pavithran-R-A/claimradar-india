# Fluid UI & Visual Browser Audit — ClaimRadar India

**Date:** August 6, 2026
**Executed By:** Antigravity (Google DeepMind)
**Scope:** Responsive viewports, accessibility, motion preferences, and component states review.

---

## 1. Viewport Matrix Inspected

| Viewport    | Device Class      | Width x Height | Status   | Notes                                                           |
| :---------- | :---------------- | :------------- | :------- | :-------------------------------------------------------------- |
| **1440 px** | Desktop Large     | 1440 × 900     | **PASS** | Full fluid header, max-w-content container, multi-column footer |
| **1280 px** | Desktop Standard  | 1280 × 800     | **PASS** | 3-column directory card grid, side-by-side sector/company cards |
| **1024 px** | Laptop / iPad Pro | 1024 × 768     | **PASS** | Responsive breakpoint transition, clean grid reflow             |
| **768 px**  | Tablet / iPad     | 768 × 1024     | **PASS** | 2-column card layout, filter drawer trigger active              |
| **390 px**  | Mobile Standard   | 390 × 844      | **PASS** | Compact search form, mobile drawer dialog, stacked claim cards  |
| **360 px**  | Mobile Compact    | 360 × 800      | **PASS** | Single-column cards, readable text scales, no overflow          |
| **320 px**  | Mobile Minimum    | 320 × 568      | **PASS** | No horizontal scroll, comfortable touch targets (≥44px)         |

---

## 2. Page & Route Audits

### 1. Homepage (`/`)

- **Hero & Search:** Deep ink canvas with CSS radial aurora glow. Central interactive search bar with instant suggestions.
- **Copy Alignment:** `"Find refunds, compensation, and public claim opportunities in India."` paired with `"Grounded in official sources."`
- **Methodology Flow:** `EvidenceFlowDiagram` demonstrating Official Notice -> Evidence Extraction -> Human Editorial Verification -> Direct Action Route.
- **Data Sections:** Real published opportunities grid, closing soon list, sector/company discovery cards, status indicators explainer.

### 2. Claimables Directory (`/claimables` & `/claimables/[slug]`)

- **Filters & Chips:** Search input, status selector (Open, Closing Soon, Under Review, Closed), sector dropdown, active filter chips.
- **Detail View:** Direct-answer header with IST deadline date, official authority link, evidence requirements, and independent platform disclaimer.

### 3. Customer Product (`/app/*`)

- **Dashboard & Tracker:** Consistent semantic tokens. Clear guidance that ClaimRadar provides informational tracking and does not submit claims directly.

### 4. Admin Experience (`/admin/*`)

- **Operational Focus:** High-density, readable tables for candidate review, source health toggles, audit logs, and publication status.

---

## 3. Accessibility & Motion Verification

- **WCAG 2.2 AA Compliance:**
  - High contrast text colors (Teal `#0F766E`, Saffron `#9E4A08`, Dark Ink `#111827`).
  - Visible keyboard focus rings (`outline: 2px solid trust-primary`).
  - Skip to content link as first focusable element.
  - Dialog semantics (`role="dialog"`, focus lock, Escape key handler) on mobile navigation drawer.
- **Reduced Motion Support:**
  - `@media (prefers-reduced-motion: reduce)` block disables CSS aurora movement, shortens transitions, and enforces immediate opacity visibility.
