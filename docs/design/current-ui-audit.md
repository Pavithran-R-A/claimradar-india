# Current UI Honest Audit — ClaimRadar India

**Date:** August 6, 2026
**Audited By:** Antigravity UI & Design Review

---

## 1. Executive Summary

The previous interface suffered from classic AI SaaS template tropes that undermined ClaimRadar's position as a serious, trustworthy civic information platform. The layout relied on an isolated dark hero section with hard boundaries, competing typography styles, static search controls, and excessive dark empty space.

---

## 2. Itemized Deficiencies Identified

| Component / Area | Defect | Root Cause & Implication | Action Plan |
| :--- | :--- | :--- | :--- |
| **Headline & Typography** | Oversized font, jarring contrast between heavy sans and decorative serif italic (`"verified from official sources."`) | Mismatched font styles create a generic landing page feel rather than an authoritative civic directory. | Replace display serif with clean, readable display sans (Geist Sans) with consistent sentence-case hierarchy. |
| **Copy & Trust Messaging** | Over-claiming ("verified from official sources") before human editorial verification | Could create false expectations or legal exposure regarding guaranteed validity or eligibility. | Rephrase to honest grounding: `"Find refunds, compensation, and public claim opportunities in India."` + `"Grounded in official sources."` |
| **Hero & Navigation** | Disconnected header floating above isolated dark hero block with hard section cut-off | Lacks visual continuity; breaks page flow when scrolling down. | Rebuild header as a translucent glass sticky bar with smooth color/border transitions into section backgrounds. |
| **Search Experience** | Static input box without live suggestions or interactive filtering | Users cannot quickly discover companies, sectors, or recent claims from the main hero fold. | Build a central interactive search component with instant search suggestions, keyboard shortcuts, and sector tags. |
| **Visual Flow & Rhythm** | Hard dark-to-light section boundaries without continuous gradients or motion elements | Abrupt vertical transitions make sections feel like isolated cards rather than a cohesive application. | Implement "Evidence in Motion" continuous background flow (soft aurora glows, flowing connection lines, layered depth). |
| **Product Demonstration** | Missing visual explanation of how ClaimRadar works | Visitors don't understand the extraction, verification, and action process. | Add an interactive "Source to Opportunity" flow diagram demonstrating Notice -> Evidence -> Verification -> Opportunity -> Official Route. |
| **Directory Cards** | Dense, unspaced cards with legal jargon | Hard for users on mobile or desktop to skim key information quickly. | Redesign cards with clear status badges, machine-readable IST deadlines, authority tags, and progressive disclosure details. |
| **Customer App (`/app`)** | Visual mismatch between public site and authenticated dashboard | Fragmented experience between marketing and application shells. | Apply unified design tokens across `/app` (dashboard, matches, watchlist, tracker, privacy controls). |
| **Admin Dashboard (`/admin`)** | Marketing effects mixed into admin views | Reduces operational efficiency for editorial staff. | Keep admin views high-density, legible, table-driven, and focused on candidate verification and source health. |

---

## 3. Visual Redesign Strategy ("Evidence in Motion")

1. **Continuous Canvas:** Seamless transition from deep ink hero into off-white civic reading bands.
2. **Interactive Search:** Hero section centers around instant search and sector discovery.
3. **Calm Authority:** Restrained teal (`#0F766E`) for primary actions, warm saffron (`#9E4A08`) for deadlines/attention, red strictly for errors/expiry.
4. **Honest Language:** Clear disclaimers that ClaimRadar is an independent informational service and does not file claims directly.
5. **Accessibility First:** Full support for reduced motion, screen readers (WCAG 2.2 AA), keyboard focus rings, and high contrast ratios.
